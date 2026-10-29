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

        <p className="help-lead">Guess the mystery car.</p>
        <ol className="help-steps">
          <li>The plate shows one clue about a mystery car. You get 13 turns to name it.</li>
          <li>
            Search for a car and guess. A wrong guess still helps: everything it has in common with the mystery car
            gets stamped onto the plate, plus one new clue.
          </li>
          <li>
            <span className="help-match">Green</span> = your guess matches the mystery car.{' '}
            <span className="help-miss">Red</span> = it doesn’t. Arrows ↑ ↓ show if the mystery car’s number is
            higher or lower.
          </li>
          <li>Fewer turns = better score. Stuck? Skip a turn to get a clue, or give up to see the car.</li>
        </ol>

        <ul className="help-list">
          <li>
            <strong>Daily:</strong> one car a day, the same for the whole world. A new one comes at midnight.
          </li>
          <li>
            <strong>Unlimited:</strong> play as much as you like. Easy uses famous cars. No hints skips the free
            clue, so only your guesses fill the plate. Hard gives way fewer hints.
          </li>
        </ul>

        <p className="stats-note">Your stats are saved on this device.</p>
        <button type="button" className="button help-start" autoFocus onClick={() => ref.current?.close()}>
          Let’s go
        </button>
      </div>
    </dialog>
  );
}
