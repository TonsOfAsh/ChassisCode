/** Types shared by the game API and the browser. Nothing here reveals an answer. */

/** Difficulty: which clues are revealed first. */
export type Mode = 'easy' | 'normal' | 'hard';

export const MODES: readonly { id: Mode; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: 'Starts with the maker, engine and country. Guesses reveal the specs they get right.' },
  { id: 'normal', label: 'Normal', hint: 'Clues come in any order. Guesses reveal the specs they get right.' },
  { id: 'hard', label: 'Hard', hint: 'Least telling specs first, one clue per turn. Guesses reveal nothing extra.' },
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

/**
 * A guessed car's value for one clue. `hint` is given only for a clue still
 * hidden, under the reveal rules: the answer is higher or lower (numbers), or
 * shares some but not all values (body, transmission).
 */
export interface TurnValue {
  value: string;
  match: boolean;
  hint?: 'higher' | 'lower' | 'partial';
}

/** One turn: a wrong guess, or a skip (carId null). */
export interface Turn {
  carId: string | null;
  name: string | null;
  /**
   * For a guess: the guessed car's value for each clue, in clue order, or
   * null where nothing may be said about it yet. Absent for a skip.
   */
  values?: (TurnValue | null)[];
  /** For a guess under the reveal rules: how many specs (not model or generation) it has right, new or not. */
  right?: number;
  /** Ids of the clues this turn revealed: the specs it matched, then the next clue. */
  revealed?: { matched: string[]; next: string | null };
}

export interface GameResult {
  solved: boolean;
  carId: string;
  name: string;
  /**
   * Turns taken, counting the solving guess (named cluesUsed for stored stats;
   * under the classic rules it equals the clues showing).
   */
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
  /** Which rules this game uses: Hard is 'classic', Easy and Normal 'reveal'. */
  rules?: 'reveal' | 'classic';
  /** One entry per clue, in order: its value once revealed, else null. All revealed once the game is over. */
  clues: (Clue | null)[];
  /** Turns allowed in a round (one per clue). */
  maxTurns?: number;
  turns: Turn[];
  result?: GameResult;
}

export interface ApiError {
  error: string;
}
