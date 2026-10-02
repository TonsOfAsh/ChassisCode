import type { GameView } from '@/lib/game-types';

/**
 * The clue board, drawn as a chassis data plate. Revealed clues are stamped
 * in; the rest show as blank stamping fields. The most recently guessed car
 * gets a column beside the mystery car showing its own value for every
 * revealed clue, green where it matches and red where it does not. A new
 * guess replaces it; a skip keeps it and fills in the newly revealed clue.
 * Once the round is over, `compareId` picks which guessed car is shown.
 */
export function Plate({ game, compareId }: { game: GameView; compareId?: string | null }) {
  const over = game.status !== 'playing';
  const newest = over ? -1 : game.clues.length - 1;
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
                    Clue {game.clues.length} of {game.clueLabels.length}
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
                <tr key={label} className={i === newest ? 'clue-newest' : undefined}>
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
                      <td key={g.carId} className={`guess-cell${v ? (v.match ? ' guess-match' : ' guess-miss') : ''}`}>
                        {v && (
                          <>
                            {v.value}
                            <span className="visually-hidden">{v.match ? ' (matches)' : ' (does not match)'}</span>
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
