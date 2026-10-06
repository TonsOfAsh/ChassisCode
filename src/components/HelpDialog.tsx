'use client';

import { useEffect, useRef } from 'react';

/** How to play. Shown automatically on a device's first visit, and from the "?" button after that. */
export function HelpDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="stats-dialog help-dialog"
      aria-labelledby="help-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close(); // click on the backdrop
      }}
    >
      <div className="stats-body">
        <div className="stats-head">
          <h2 id="help-title" className="stats-title">
            How to play
          </h2>
          <button type="button" className="stats-close" aria-label="Close" onClick={() => ref.current?.close()}>
            ✕
          </button>
        </div>

        <p className="help-lead">Name the exact car from its specs.</p>
        <ol className="help-steps">
          <li>The plate shows one spec of a mystery car to start with. You get 13 turns.</li>
          <li>
            Search for a car and guess. A wrong guess stamps every spec it got right onto the plate, plus the next
            clue. The model and generation always come last, even if your guess matches them.
          </li>
          <li>
            Your last guess appears beside the mystery car: <span className="help-match">green</span> where it
            matches, <span className="help-miss">red</span> where it does not, and{' '}
            <span className="help-partial">amber</span> where it shares some values. Arrows say whether the mystery
            car’s power, weight or displacement is higher ↑ or lower ↓.
          </li>
          <li>The fewer turns you need, the better your score. A skip uses a turn and reveals the next clue.</li>
        </ol>

        <h3 className="stats-subtitle">Daily and Unlimited</h3>
        <ul className="help-list">
          <li>
            <strong>Daily:</strong> one car a day, the same for everyone. A new one starts at midnight Pacific time.
            Share your result when you finish: it shows what each guess uncovered.
          </li>
          <li>
            <strong>Unlimited:</strong> as many cars as you like. Easy starts with the maker, engine and country.
          </li>
          <li>
            <strong>Hard:</strong> the classic rules. Least telling specs first, one clue per turn, and guesses
            reveal nothing extra.
          </li>
        </ul>

        <p className="stats-note">Weights marked “dry” are without fluids. Your stats are kept on this device.</p>
        <button type="button" className="button help-start" autoFocus onClick={() => ref.current?.close()}>
          Let’s go
        </button>
      </div>
    </dialog>
  );
}
