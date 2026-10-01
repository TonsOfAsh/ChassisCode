import type { GameView } from '@/lib/game-types';

/**
 * The clue board, drawn as a chassis data plate. Revealed clues are stamped
 * in; the rest show as blank stamping fields.
 */
export function Plate({ game }: { game: GameView }) {
  const over = game.status !== 'playing';
  const newest = over ? -1 : game.clues.length - 1;
  return (
    <section className="plate" aria-label="Clues">
      <span className="rivet rivet-tl" aria-hidden="true" />
      <span className="rivet rivet-tr" aria-hidden="true" />
      <span className="rivet rivet-bl" aria-hidden="true" />
      <span className="rivet rivet-br" aria-hidden="true" />
      <header className="plate-head">
        {over && game.result ? (
          <h2 className="plate-title plate-title-revealed">{game.result.name}</h2>
        ) : (
          <>
            <h2 className="plate-title">Mystery car</h2>
            <p className="plate-count">
              Clue {game.clues.length} of {game.clueLabels.length}
            </p>
          </>
        )}
      </header>
      <ol className="clues">
        {game.clueLabels.map((label, i) => {
          const clue = game.clues[i];
          return (
            <li key={label} className={`clue${i === newest ? ' clue-newest' : ''}${clue ? '' : ' clue-hidden'}`}>
              <span className="clue-number" aria-hidden="true">
                {i + 1}
              </span>
              <span className="clue-label">{label}</span>
              {clue ? (
                <span className="clue-value">{clue.value}</span>
              ) : (
                <span className="clue-blank">
                  <span className="visually-hidden">Not revealed yet</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
