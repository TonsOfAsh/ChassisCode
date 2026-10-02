'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_MODE, MODES, isMode, type ApiError, type CarOption, type GameView, type Mode } from '@/lib/game-types';
import { CarSearch } from './CarSearch';
import { Plate } from './Plate';

/** How many recently played cars to keep out of the next random pick. */
const RECENT_LIMIT = 10;
/** Where the chosen difficulty is remembered between visits. */
const MODE_KEY = 'chassiscode.mode';

async function post(url: string, body: unknown): Promise<GameView> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the game server. Check your connection and try again.');
  }
  const data = (await response.json().catch(() => null)) as GameView | ApiError | null;
  if (!response.ok || !data || 'error' in data) {
    throw new Error(data && 'error' in data ? data.error : 'The game server returned an error. Try again.');
  }
  return data;
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function Game({ cars }: { cars: CarOption[] }) {
  const [game, setGame] = useState<GameView | null>(null);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  /** After a round: which guessed car's stats are shown beside the mystery car. */
  const [compareId, setCompareId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recent = useRef<string[]>([]);
  const started = useRef(false);

  const start = useCallback(async (nextMode: Mode) => {
    setBusy(true);
    setError(null);
    setCompareId(null);
    try {
      setGame(await post('/api/game/new', { mode: nextMode, exclude: recent.current }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let stored: unknown = null;
    try {
      stored = window.localStorage.getItem(MODE_KEY);
    } catch {
      // Storage can be blocked; the default mode is used.
    }
    const initial = isMode(stored) ? stored : DEFAULT_MODE;
    setMode(initial);
    void start(initial);
  }, [start]);

  /** Switching difficulty starts a new car in that mode. */
  function chooseMode(next: Mode) {
    if (next === mode || busy) return;
    setMode(next);
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      // Not remembered; the choice still applies to this visit.
    }
    void start(next);
  }

  async function play(carId: string | null) {
    if (!game?.token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await post('/api/game/guess', { token: game.token, carId });
      if (next.result) recent.current = [next.result.carId, ...recent.current].slice(0, RECENT_LIMIT);
      setGame(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const result = game?.result;

  function compare(carId: string) {
    setCompareId(carId);
    // On a phone the plate is above the guess list; bring it back into view.
    document.querySelector('.plate')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  const playing = game?.status === 'playing';
  // The car shown beside the mystery car once the round is over: the one picked, else the last guess.
  const shownId = result
    ? (compareId ?? game?.turns.filter((t) => t.carId).at(-1)?.carId ?? null)
    : null;
  const onLastClue = !!game && game.clues.length === game.clueLabels.length;

  return (
    <main className="page">
      <header className="masthead">
        <h1 className="wordmark">ChassisCode</h1>
        <p className="intro">
          Name the exact car.<span className="intro-more"> Each wrong guess stamps another spec on the plate.</span>
        </p>
        <p className="mode">Unlimited</p>
      </header>

      <div className="layout">
        {game ? <Plate game={game} compareId={compareId} /> : <div className="plate plate-loading">{error ? '' : 'Picking a car…'}</div>}

        {/* On wide screens this is a panel beside the plate, so nothing needs scrolling. */}
        <div className="side">
          <fieldset className="modes" disabled={busy}>
            <legend className="visually-hidden">Difficulty</legend>
            <div className="modes-options">
              {MODES.map((m) => (
                <label key={m.id} className={`mode-option${m.id === mode ? ' mode-option-selected' : ''}`}>
                  <input
                    type="radio"
                    name="mode"
                    value={m.id}
                    checked={m.id === mode}
                    onChange={() => chooseMode(m.id)}
                    className="visually-hidden"
                  />
                  {m.label}
                </label>
              ))}
            </div>
            <p className="modes-hint">{MODES.find((m) => m.id === mode)?.hint}</p>
          </fieldset>

          {error && (
            <p className="error" role="alert">
              {error}{' '}
              {!game && (
                <button type="button" className="link" onClick={() => void start(mode)}>
                  Try again
                </button>
              )}
            </p>
          )}

          {playing && game && (
            <div className="controls">
              <CarSearch
                cars={cars}
                excludedIds={game.turns.flatMap((t) => (t.carId ? [t.carId] : []))}
                disabled={busy}
                onGuess={(car) => void play(car.id)}
              />
              <button type="button" className="link" disabled={busy} onClick={() => void play(null)}>
                {onLastClue ? 'Give up and see the car' : 'Skip to the next clue'}
              </button>
            </div>
          )}

          {result && (
            <section className={`result ${result.solved ? 'result-solved' : 'result-lost'}`} aria-live="polite">
              <h2 className="result-heading">
                {result.solved
                  ? `Solved in ${result.cluesUsed} ${result.cluesUsed === 1 ? 'clue' : 'clues'}`
                  : 'Not solved this time'}
              </h2>
              <dl className="stats">
                <div>
                  <dt>Score</dt>
                  <dd>
                    {result.score}/{game?.clueLabels.length}
                  </dd>
                </div>
                <div>
                  <dt>Guesses</dt>
                  <dd>{result.guessCount}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{formatTime(result.elapsedMs)}</dd>
                </div>
              </dl>
              <button type="button" className="button" disabled={busy} onClick={() => void start(mode)}>
                Play another car
              </button>
            </section>
          )}

          {game && game.turns.length > 0 && (
            <section className="turns" aria-label="Your guesses so far">
              <h2 className="turns-heading">Your guesses</h2>
              <ol>
                {game.turns.map((turn, i) => (
                  <li key={i} className={turn.carId ? 'turn-wrong' : 'turn-skip'}>
                    <span className="turn-name">{turn.carId ? turn.name : 'Skipped'}</span>
                    {result && turn.carId && (
                      <button
                        type="button"
                        className="compare"
                        aria-pressed={turn.carId === shownId}
                        aria-label={`Show stats for ${turn.name}`}
                        onClick={() => compare(turn.carId!)}
                      >
                        {turn.carId === shownId ? 'Showing' : 'Show stats'}
                      </button>
                    )}
                  </li>
                ))}
                {result?.solved && <li className="turn-right">{result.name}</li>}
              </ol>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
