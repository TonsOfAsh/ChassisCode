/** Types shared by the game API and the browser. Nothing here reveals an answer. */

/** Difficulty: which clues are revealed first. */
export type Mode = 'easy' | 'normal' | 'hard';

export const MODES: readonly { id: Mode; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: 'Starts with the maker, engine and country.' },
  { id: 'normal', label: 'Normal', hint: 'Clues come in any order.' },
  { id: 'hard', label: 'Hard', hint: 'Starts with the least telling specs.' },
];

export const DEFAULT_MODE: Mode = 'normal';

export function isMode(value: unknown): value is Mode {
  return MODES.some((m) => m.id === value);
}

export interface Clue {
  id: string;
  label: string;
  value: string;
}

/** A car as it appears in the search box. */
export interface CarOption {
  id: string;
  name: string;
  aliases: string[];
}

/** One turn: a wrong guess, or a skip (carId null). */
export interface Turn {
  carId: string | null;
  name: string | null;
  /**
   * For a guess: the guessed car's own value for each clue revealed so far,
   * in clue order, and whether it matches the mystery car. Absent for a skip.
   */
  values?: { value: string; match: boolean }[];
}

export interface GameResult {
  solved: boolean;
  carId: string;
  name: string;
  /** How many clues were showing when the game ended. */
  cluesUsed: number;
  /** Guesses made, not counting skips. */
  guessCount: number;
  /** totalClues - cluesUsed + 1 when solved, 0 when not. */
  score: number;
  elapsedMs: number;
}

/** Which daily puzzle a game is. Absent for Unlimited games. */
export interface DailyInfo {
  /** Pacific calendar date, YYYY-MM-DD. */
  date: string;
  /** Puzzle number: 1 on the first day. */
  number: number;
}

export interface GameView {
  status: 'playing' | 'solved' | 'lost';
  mode: Mode;
  daily?: DailyInfo;
  /** Opaque, encrypted game state. Send it back with the next guess. Absent once the game is over. */
  token?: string;
  /** Labels of all clues, in order, so the board can show what is still hidden. */
  clueLabels: string[];
  /** The clues revealed so far. All of them once the game is over. */
  clues: Clue[];
  turns: Turn[];
  result?: GameResult;
}

export interface ApiError {
  error: string;
}
