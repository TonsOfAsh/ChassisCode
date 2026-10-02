'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { dailyDate, msUntilNextDaily } from '@/lib/daily-time';
import { DEFAULT_MODE, MODES, isMode, type ApiError, type CarOption, type GameView, type Mode } from '@/lib/game-types';
import {
  dailySummary,
  loadDailyProgress,
  loadStats,
  recordDaily,
  recordUnlimited,
  saveDailyProgress,
  type Stats,
} from '@/lib/stats';
import { CarSearch } from './CarSearch';
import { Plate } from './Plate';
import { StatsDialog } from './StatsDialog';

/** How many recently played cars to keep out of the next random pick. */
const RECENT_LIMIT = 10;
/** Where the chosen Unlimited difficulty is remembered between visits. */
const MODE_KEY = 'chassiscode.mode';

type Kind = 'daily' | 'unlimited';

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

function formatCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function formatDailyDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function Game({ cars }: { cars: CarOption[] }) {
  const [kind, setKind] = useState<Kind>('daily');
  const [daily, setDaily] = useState<GameView | null>(null);
  const [unlimited, setUnlimited] = useState<GameView | null>(null);
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  /** After a round: which guessed car's stats are shown beside the mystery car. */
  const [compareId, setCompareId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const recent = useRef<string[]>([]);
  const started = useRef(false);
  /** Read by the Enter handler, so Enter inside the stats dialog never starts a round. */
  const statsOpenRef = useRef(false);
  statsOpenRef.current = statsOpen;

  const game = kind === 'daily' ? daily : unlimited;

  /** Loads today's daily puzzle, continuing it if it was started on this device. */
  const loadDaily = useCallback(async () => {
    setBusy(true);
    setError(null);
    setCompareId(null);
    try {
      const fresh = await post('/api/game/new', { daily: true });
      const date = fresh.daily!.date;
      const stored = loadDailyProgress();
      const view = stored && stored.date === date ? stored.game : fresh;
      if (view !== stored?.game) saveDailyProgress(date, view);
      setDaily(view);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  const startUnlimited = useCallback(async (nextMode: Mode) => {
    setBusy(true);
    setError(null);
    setCompareId(null);
    try {
      setUnlimited(await post('/api/game/new', { mode: nextMode, exclude: recent.current }));
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
    if (isMode(stored)) setMode(stored);
    setStats(loadStats());
    void loadDaily();
  }, [loadDaily]);

  function chooseKind(next: Kind) {
    if (next === kind || busy) return;
    setKind(next);
    setError(null);
    setCompareId(null);
    if (next === 'unlimited' && !unlimited) void startUnlimited(mode);
    // A daily left open past midnight is replaced by the new day's puzzle.
    if (next === 'daily' && (!daily || daily.daily?.date !== dailyDate())) void loadDaily();
  }

  /** Switching Unlimited difficulty starts a new car in that mode. */
  function chooseMode(next: Mode) {
    if (next === mode || busy) return;
    setMode(next);
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      // Not remembered; the choice still applies to this visit.
    }
    void startUnlimited(next);
  }

  async function play(carId: string | null) {
    if (!game?.token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await post('/api/game/guess', { token: game.token, carId });
      if (next.daily) {
        saveDailyProgress(next.daily.date, next);
        if (next.result) setStats(recordDaily(next.daily.date, next.result));
        setDaily(next);
      } else {
        if (next.result) {
          recent.current = [next.result.carId, ...recent.current].slice(0, RECENT_LIMIT);
          setStats(recordUnlimited(next.mode, next.result));
        }
        setUnlimited(next);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const result = game?.result;
  const over = !!result;

  // Countdown to the next daily puzzle, shown once today's is finished.
  const [untilNext, setUntilNext] = useState<number | null>(null);
  const dailyOver = !!daily?.result;
  useEffect(() => {
    if (!dailyOver) return;
    const tick = () => setUntilNext(msUntilNextDaily());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [dailyOver]);
  const newDailyReady = !!daily?.daily && daily.daily.date !== dailyDate() && untilNext !== null;

  // When an Unlimited round is over, Enter starts the next one. The Play button
  // takes focus (not on touch screens), and Enter also works from anywhere on
  // the page except another control, where it keeps its normal meaning.
  const playAgainRef = useRef<HTMLButtonElement>(null);
  /** Enter is ignored until this time, so the Enter that made the last guess cannot also start a round. */
  const enterReadyAt = useRef(0);
  const enterStarts = over && kind === 'unlimited';
  useEffect(() => {
    if (!enterStarts) return;
    enterReadyAt.current = Date.now() + 400;
    if (!window.matchMedia('(pointer: coarse)').matches) playAgainRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter' || e.defaultPrevented || statsOpenRef.current) return;
      if (e.repeat || Date.now() < enterReadyAt.current) {
        e.preventDefault(); // also stops a focused button from firing
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target === playAgainRef.current) return; // the button handles its own Enter
      if (target?.closest('button, a, input, select, textarea, label, dialog')) return;
      e.preventDefault();
      void startUnlimited(mode);
    }
    // Capture phase, so the guard above runs before a focused button reacts.
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [enterStarts, mode, startUnlimited]);
  function compare(carId: string) {
    setCompareId(carId);
    // On a phone the plate is above the guess list; bring it back into view.
    document.querySelector('.plate')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    // Hand the keyboard back to the Play button so Enter still starts the next round.
    if (!window.matchMedia('(pointer: coarse)').matches) playAgainRef.current?.focus({ preventScroll: true });
  }

  const playing = game?.status === 'playing';
  // The car shown beside the mystery car once the round is over: the one picked, else the last guess.
  const shownId = result ? (compareId ?? game?.turns.filter((t) => t.carId).at(-1)?.carId ?? null) : null;
  const onLastClue = !!game && game.clues.length === game.clueLabels.length;
  const today = daily?.daily?.date ?? dailyDate();
  const summary = stats ? dailySummary(stats, today) : null;

  return (
    <main className="page">
      <header className="masthead">
        <h1 className="wordmark">ChassisCode</h1>
        <p className="intro">
          Name the exact car.<span className="intro-more"> Each wrong guess stamps another spec on the plate.</span>
        </p>
        <button type="button" className="stats-button" onClick={() => setStatsOpen(true)}>
          Stats
        </button>
      </header>

      <div className="layout">
        {game ? (
          <Plate game={game} compareId={compareId} />
        ) : (
          <div className="plate plate-loading">{error ? '' : kind === 'daily' ? 'Loading today’s car…' : 'Picking a car…'}</div>
        )}

        {/* On wide screens this is a panel beside the plate, so nothing needs scrolling. */}
        <div className="side">
          <div className="kinds-row">
            <div className="kinds" role="tablist" aria-label="Game type">
              {(['daily', 'unlimited'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={k === kind}
                  className={`kind${k === kind ? ' kind-selected' : ''}`}
                  disabled={busy && k !== kind}
                  onClick={() => chooseKind(k)}
                >
                  {k === 'daily' ? 'Daily' : 'Unlimited'}
                </button>
              ))}
            </div>
            {kind === 'daily' && daily?.daily && (
              <p className="daily-label">
                #{daily.daily.number} · {formatDailyDate(daily.daily.date)} · Normal
              </p>
            )}
          </div>

          {kind === 'unlimited' && (
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
          )}
          {kind === 'daily' && !over && <p className="modes-hint daily-hint">Same car and clue order for everyone today.</p>}

          {error && (
            <p className="error" role="alert">
              {error}{' '}
              {!game && (
                <button
                  type="button"
                  className="link"
                  onClick={() => void (kind === 'daily' ? loadDaily() : startUnlimited(mode))}
                >
                  Try again
                </button>
              )}
            </p>
          )}

          {playing && game && (
            <div className="controls">
              <CarSearch
                key={kind}
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

          {result && game && (
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
                    {result.score}/{game.clueLabels.length}
                  </dd>
                </div>
                <div>
                  <dt>Guesses</dt>
                  <dd>{result.guessCount}</dd>
                </div>
                {kind === 'daily' && summary ? (
                  <div>
                    <dt>Streak</dt>
                    <dd>{summary.currentStreak}</dd>
                  </div>
                ) : (
                  <div>
                    <dt>Time</dt>
                    <dd>{formatTime(result.elapsedMs)}</dd>
                  </div>
                )}
              </dl>
              {kind === 'daily' ? (
                <>
                  {newDailyReady ? (
                    <button type="button" className="button" disabled={busy} onClick={() => void loadDaily()}>
                      Play today’s car
                    </button>
                  ) : (
                    untilNext !== null && (
                      <p className="next-daily">
                        Next daily car in <strong>{formatCountdown(untilNext)}</strong>
                      </p>
                    )
                  )}
                  <button type="button" className="link" disabled={busy} onClick={() => chooseKind('unlimited')}>
                    Play Unlimited
                  </button>
                </>
              ) : (
                <>
                  <button
                    ref={playAgainRef}
                    type="button"
                    className="button"
                    disabled={busy}
                    onClick={() => void startUnlimited(mode)}
                  >
                    Play another car
                  </button>
                  <span className="key-hint">or press Enter</span>
                </>
              )}
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

      {statsOpen && stats && summary && (
        <StatsDialog
          stats={stats}
          summary={summary}
          todayCluesUsed={daily?.daily && daily.result?.solved ? daily.result.cluesUsed : null}
          untilNext={dailyOver ? untilNext : null}
          onClose={() => setStatsOpen(false)}
        />
      )}
    </main>
  );
}
