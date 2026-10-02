/**
 * Player statistics, kept on this device (localStorage). Accounts can replace
 * this later; until then clearing site data resets them.
 *
 * Daily results are stored per puzzle date, so streaks can be worked out and
 * a puzzle can never be counted twice. Unlimited keeps running totals.
 */

import { nextDate } from './daily-time';
import type { GameResult, GameView, Mode } from './game-types';

const STATS_KEY = 'chassiscode.stats.v1';
const DAILY_KEY = 'chassiscode.daily.v1';

export interface DailyRecord {
  solved: boolean;
  /** Clues showing when the game ended. */
  cluesUsed: number;
}

export interface UnlimitedTotals {
  played: number;
  won: number;
  /** Sum of clues used over won games, for the average. */
  cluesWhenWon: number;
}

export interface Stats {
  daily: Record<string, DailyRecord>;
  unlimited: Record<Mode, UnlimitedTotals>;
}

const emptyTotals = (): UnlimitedTotals => ({ played: 0, won: 0, cluesWhenWon: 0 });
const emptyStats = (): Stats => ({ daily: {}, unlimited: { easy: emptyTotals(), normal: emptyTotals(), hard: emptyTotals() } });

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: stats are simply not kept.
  }
}

export function loadStats(): Stats {
  const stored = read<Partial<Stats>>(STATS_KEY);
  const stats = emptyStats();
  if (stored?.daily && typeof stored.daily === 'object') stats.daily = stored.daily;
  if (stored?.unlimited) for (const m of ['easy', 'normal', 'hard'] as const) stats.unlimited[m] = { ...emptyTotals(), ...stored.unlimited[m] };
  return stats;
}

/** Records a finished daily puzzle once; later calls for the same date are ignored. */
export function recordDaily(date: string, result: GameResult): Stats {
  const stats = loadStats();
  if (!stats.daily[date]) {
    stats.daily[date] = { solved: result.solved, cluesUsed: result.cluesUsed };
    write(STATS_KEY, stats);
  }
  return stats;
}

export function recordUnlimited(mode: Mode, result: GameResult): Stats {
  const stats = loadStats();
  const t = stats.unlimited[mode];
  t.played += 1;
  if (result.solved) {
    t.won += 1;
    t.cluesWhenWon += result.cluesUsed;
  }
  write(STATS_KEY, stats);
  return stats;
}

export interface DailySummary {
  played: number;
  won: number;
  winPercent: number;
  currentStreak: number;
  bestStreak: number;
  /** Index 0 is solved on clue 1 ... index 12 on clue 13. */
  solvedOnClue: number[];
  lost: number;
}

/**
 * Daily totals and streaks as of `today`. The current streak counts
 * consecutive solved days ending today, or yesterday if today's puzzle has
 * not been finished yet. A loss or a missed day ends a streak.
 */
export function dailySummary(stats: Stats, today: string, clueCount = 13): DailySummary {
  const dates = Object.keys(stats.daily).sort();
  const records = dates.map((d) => stats.daily[d]!);
  const won = records.filter((r) => r.solved).length;
  const solvedOnClue = Array.from({ length: clueCount }, () => 0);
  for (const r of records) if (r.solved && r.cluesUsed >= 1 && r.cluesUsed <= clueCount) solvedOnClue[r.cluesUsed - 1]! += 1;

  let bestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const d of dates) {
    const solved = stats.daily[d]!.solved;
    run = solved ? (previous && nextDate(previous) === d ? run + 1 : 1) : 0;
    bestStreak = Math.max(bestStreak, run);
    previous = solved ? d : null;
  }

  let currentStreak = 0;
  let day = stats.daily[today] ? today : nextDate(today, -1);
  while (stats.daily[day]?.solved) {
    currentStreak += 1;
    day = nextDate(day, -1);
  }

  return {
    played: records.length,
    won,
    winPercent: records.length ? Math.round((won / records.length) * 100) : 0,
    currentStreak,
    bestStreak,
    solvedOnClue,
    lost: records.length - won,
  };
}

/** Today's daily game as last seen on this device, so a reload continues it. */
export function loadDailyProgress(): { date: string; game: GameView } | null {
  const stored = read<{ date?: unknown; game?: unknown }>(DAILY_KEY);
  if (!stored || typeof stored.date !== 'string' || !stored.game || typeof stored.game !== 'object') return null;
  return { date: stored.date, game: stored.game as GameView };
}

export function saveDailyProgress(date: string, game: GameView) {
  write(DAILY_KEY, { date, game });
}
