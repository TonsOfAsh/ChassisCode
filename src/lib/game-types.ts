/** Types shared by the game API and the browser. Nothing here reveals an answer. */

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

export interface GameView {
  status: 'playing' | 'solved' | 'lost';
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
