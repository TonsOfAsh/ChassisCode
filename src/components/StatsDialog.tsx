'use client';

import { useEffect, useRef } from 'react';
import type { DailySummary, Stats } from '@/lib/stats';

interface Props {
  stats: Stats;
  summary: DailySummary;
  /** Clue number today's daily was solved on, to highlight its bar. */
  todayCluesUsed: number | null;
  untilNext: number | null;
  onClose: () => void;
}

function formatCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Daily and Unlimited statistics for this device, in a modal dialog. */
export function StatsDialog({ stats, summary, todayCluesUsed, untilNext, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const unlimited = (['easy', 'normal', 'hard'] as const).map((m) => ({ mode: m, ...stats.unlimited[m] }));
  const totals = unlimited.reduce(
    (a, t) => ({ played: a.played + t.played, won: a.won + t.won, clues: a.clues + t.cluesWhenWon }),
    { played: 0, won: 0, clues: 0 },
  );
  const most = Math.max(1, ...summary.solvedOnClue, summary.lost);

  return (
    <dialog
      ref={ref}
      className="stats-dialog"
      aria-labelledby="stats-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close(); // click on the backdrop
      }}
    >
      <div className="stats-body">
        <div className="stats-head">
          <h2 id="stats-title" className="stats-title">
            Daily stats
          </h2>
          <button type="button" className="stats-close" aria-label="Close" onClick={() => ref.current?.close()}>
            ✕
          </button>
        </div>

        <dl className="stats stats-daily">
          <div>
            <dt>Played</dt>
            <dd>{summary.played}</dd>
          </div>
          <div>
            <dt>Win %</dt>
            <dd>{summary.winPercent}</dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>{summary.currentStreak}</dd>
          </div>
          <div>
            <dt>Best streak</dt>
            <dd>{summary.bestStreak}</dd>
          </div>
        </dl>

        <h3 className="stats-subtitle">Solved on clue</h3>
        {summary.played === 0 ? (
          <p className="stats-empty">Finish a daily puzzle to see your results here.</p>
        ) : (
          <ol className="bars">
            {summary.solvedOnClue.map((count, i) => (
              <li key={i} className={`bar-row${todayCluesUsed === i + 1 ? ' bar-today' : ''}`}>
                <span className="bar-label">{i + 1}</span>
                <span className="bar" style={{ width: `${Math.max(6, (count / most) * 100)}%` }}>
                  {count}
                </span>
              </li>
            ))}
            <li className="bar-row bar-lost">
              <span className="bar-label">✕</span>
              <span className="bar" style={{ width: `${Math.max(6, (summary.lost / most) * 100)}%` }}>
                {summary.lost}
              </span>
            </li>
          </ol>
        )}
        {untilNext !== null && (
          <p className="next-daily">
            Next daily car in <strong>{formatCountdown(untilNext)}</strong>
          </p>
        )}

        <h2 className="stats-title stats-title-second">Unlimited</h2>
        <table className="unlimited-table">
          <thead>
            <tr>
              <th scope="col">Mode</th>
              <th scope="col">Played</th>
              <th scope="col">Win %</th>
              <th scope="col">Avg clues</th>
            </tr>
          </thead>
          <tbody>
            {unlimited.map((t) => (
              <tr key={t.mode}>
                <th scope="row">{t.mode[0]!.toUpperCase() + t.mode.slice(1)}</th>
                <td>{t.played}</td>
                <td>{t.played ? Math.round((t.won / t.played) * 100) : '–'}</td>
                <td>{t.won ? (t.cluesWhenWon / t.won).toFixed(1) : '–'}</td>
              </tr>
            ))}
            <tr className="unlimited-total">
              <th scope="row">All</th>
              <td>{totals.played}</td>
              <td>{totals.played ? Math.round((totals.won / totals.played) * 100) : '–'}</td>
              <td>{totals.won ? (totals.clues / totals.won).toFixed(1) : '–'}</td>
            </tr>
          </tbody>
        </table>
        <p className="stats-note">Stats are kept on this device only.</p>
      </div>
    </dialog>
  );
}
