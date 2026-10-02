'use client';

import MiniSearch from 'minisearch';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CarOption } from '@/lib/game-types';

const MAX_RESULTS = 8;

interface Props {
  cars: CarOption[];
  /** Cars that cannot be picked again (already guessed). */
  excludedIds: string[];
  disabled: boolean;
  onGuess: (car: CarOption) => void;
}

/**
 * Search box for choosing a car. The player picks a specific record from the
 * list; free text is never submitted as a guess.
 */
export function CarSearch({ cars, excludedIds, disabled, onGuess }: Props) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CarOption | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const index = useMemo(() => {
    const mini = new MiniSearch<CarOption & { aliasText: string }>({
      fields: ['name', 'aliasText'],
      storeFields: ['id'],
      searchOptions: { prefix: true, fuzzy: 0.2, combineWith: 'AND', boost: { name: 2 } },
    });
    mini.addAll(cars.map((c) => ({ ...c, aliasText: c.aliases.join(' ') })));
    return mini;
  }, [cars]);
  const byId = useMemo(() => new Map(cars.map((c) => [c.id, c])), [cars]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || selected) return [];
    const excluded = new Set(excludedIds);
    const words = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    // Cars whose name contains every typed word come first, shortest name first,
    // so "gt3 991.2" lists the GT3 above the GT3 RS. Alias-only matches follow.
    const inName = (c: CarOption) => {
      const nameWords = c.name.toLowerCase().split(/[^a-z0-9]+/);
      return words.every((w) => nameWords.some((n) => n.startsWith(w)));
    };
    return index
      .search(q)
      .map((r) => byId.get(r.id as string))
      .filter((c): c is CarOption => !!c && !excluded.has(c.id))
      .map((c, rank) => ({ c, rank, named: inName(c) }))
      .sort((a, b) =>
        a.named !== b.named ? (a.named ? -1 : 1) : a.named ? a.c.name.length - b.c.name.length || a.rank - b.rank : a.rank - b.rank,
      )
      .map((x) => x.c)
      .slice(0, MAX_RESULTS);
  }, [query, selected, index, byId, excludedIds]);

  useEffect(() => setActive(0), [query]);

  // When a turn finishes, put the cursor back in the search box so the next
  // guess can be typed straight away. Not on a touch screen, where it would
  // pop the keyboard up over the clue just revealed.
  const wasDisabled = useRef(true); // true so the box is also ready when a round starts
  useEffect(() => {
    if (wasDisabled.current && !disabled && !window.matchMedia('(pointer: coarse)').matches) {
      inputRef.current?.focus();
    }
    wasDisabled.current = disabled;
  }, [disabled]);

  const showList = open && !selected && query.trim().length > 0;

  function choose(car: CarOption) {
    setSelected(car);
    setQuery(car.name);
    setOpen(false);
    inputRef.current?.focus();
  }

  function submit() {
    if (!selected || disabled) return;
    onGuess(selected);
    setSelected(null);
    setQuery('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected) submit();
      else if (showList && results[active]) choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <form
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="search-field">
        <label htmlFor={`${listId}-input`} className="visually-hidden">
          Search for a car
        </label>
        <input
          id={`${listId}-input`}
          ref={inputRef}
          className="search-input"
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Search for a car"
          value={query}
          // Never disabled: a disabled field drops the cursor. Guesses are blocked in submit() instead.
          aria-busy={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {showList && (
          <ul id={listId} className="search-list" role="listbox" aria-label="Matching cars">
            {results.length === 0 ? (
              <li className="search-empty" role="presentation">
                No car matches “{query.trim()}”. Try a model name or chassis code.
              </li>
            ) : (
              results.map((car, i) => (
                <li
                  key={car.id}
                  id={`${listId}-${car.id}`}
                  role="option"
                  aria-selected={i === active}
                  className={`search-option${i === active ? ' search-option-active' : ''}`}
                  // mousedown, not click: fires before the input's blur closes the list
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(car);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  {car.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <button type="submit" className="button" disabled={disabled || !selected}>
        Guess
      </button>
    </form>
  );
}
