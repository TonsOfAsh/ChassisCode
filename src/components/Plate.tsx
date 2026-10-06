import type { GameView, TurnValue } from '@/lib/game-types';

const HINT_TEXT: Record<NonNullable<TurnValue['hint']>, string> = {
  higher: ' (the mystery car’s is higher)',
  lower: ' (the mystery car’s is lower)',
  partial: ' (partly matches)',
};

function cellClass(v: TurnValue | null | undefined): string {
  if (!v) return '';
  if (v.match) return ' guess-match';
  if (v.hint === 'partial') return ' guess-partial';
  return ' guess-miss';
}

/**
 * The clue board, drawn as a chassis data plate. Revealed clues are stamped
 * in; the rest show as blank stamping fields. The most recently guessed car
 * gets a column beside the mystery car showing its own values: green where
 * they match, red where they do not, amber where they partly match, with an
 * arrow when the mystery car's number is higher or lower. A new guess
 * replaces it; a skip keeps it. Rows revealed by the last turn are marked.
 * Once the round is over, `compareId` picks which guessed car is shown.
 */
export function Plate({ game, compareId }: { game: GameView; compareId?: string | null }) {
  const over = game.status !== 'playing';
  const last = game.turns.at(-1)?.revealed;
  // The rows the last turn revealed (or the first clue, before any turn).
  const fresh = new Set<string>(
    over ? [] : last ? [...last.matched, ...(last.next ? [last.next] : [])] : game.clues[0] ? [game.clues[0].id] : [],
  );
  const maxTurns = game.maxTurns ?? game.clueLabels.length;
  // One guessed car is compared at a time: the latest during play, or the one
  // the player picked from the guess list once the round is over.
  const guessed = game.turns.filter((t) => t.carId && t.values);
  const picked = over && compareId ? guessed.filter((t) => t.carId === compareId) : [];
  const guesses = picked.length ? picked : guessed.slice(-1);
  return (
    <section className="plate" aria-label="Clues">
      <span className="rivet rivet-tl" aria-hidden="true" />
      <span className="rivet rivet-tr" aria-hidden="true" />
      <span className="rivet rivet-bl" aria-hidden="true" />
      <span className="rivet rivet-br" aria-hidden="true" />
      <div className="plate-scroll">
        <table className="clues">
          <thead>
            <tr>
              <th scope="col" className="col-label">
                {over ? (
                  <span className="visually-hidden">Clue</span>
                ) : (
                  <span className="plate-count">
                    Turn {Math.min(game.turns.length + 1, maxTurns)} of {maxTurns}
                  </span>
                )}
              </th>
              <th scope="col" className="col-mystery">
                {over && game.result ? (
                  <span className="plate-title plate-title-revealed">{game.result.name}</span>
                ) : (
                  <span className="plate-title">Mystery car</span>
                )}
              </th>
              {guesses.map((g) => (
                <th scope="col" key={g.carId} className="col-guess">
                  <span className="visually-hidden">{over ? 'Your guess: ' : 'Your last guess: '}</span>
                  {g.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.clueLabels.map((label, i) => {
              const clue = game.clues[i];
              return (
                <tr key={label} className={clue && fresh.has(clue.id) ? 'clue-newest' : undefined}>
                  <th scope="row" className="clue-label">
                    <span className="clue-number" aria-hidden="true">
                      {i + 1}
                    </span>
                    {label}
                  </th>
                  <td className="clue-cell">
                    {clue ? (
                      <span className="clue-value">{clue.value}</span>
                    ) : (
                      <span className="clue-blank">
                        <span className="visually-hidden">Not revealed yet</span>
                      </span>
                    )}
                  </td>
                  {guesses.map((g) => {
                    const v = g.values?.[i];
                    return (
                      <td key={g.carId} className={`guess-cell${cellClass(v)}`}>
                        {v && (
                          <>
                            {v.value}
                            {(v.hint === 'higher' || v.hint === 'lower') && (
                              <span className="guess-arrow" aria-hidden="true" title={v.hint === 'higher' ? 'The mystery car’s is higher' : 'The mystery car’s is lower'}>
                                {v.hint === 'higher' ? '↑' : '↓'}
                              </span>
                            )}
                            <span className="visually-hidden">
                              {v.match ? ' (matches)' : v.hint ? HINT_TEXT[v.hint] : ' (does not match)'}
                            </span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
