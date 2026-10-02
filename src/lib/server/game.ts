import 'server-only';
import { CLUES, drawClueOrder, isValidClueOrder, type ClueId } from '@/config/clues';
import { isMode, type Clue, type GameView, type Mode, type Turn } from '../game-types';
import type { Vehicle } from '../schema';
import { open, seal } from './token';
import { VEHICLES, getVehicle } from './vehicles';

/** What the encrypted token holds. Short keys keep the token small. */
interface GameState {
  /** Answer vehicle id. */
  v: string;
  /** Difficulty mode. */
  m: Mode;
  /** This game's clue order. */
  o: ClueId[];
  /** Number of clues revealed. */
  n: number;
  /** Turns so far: a guessed vehicle id, or null for a skip. */
  g: (string | null)[];
  /** Start time, ms since epoch. */
  t: number;
}

export class GameError extends Error {}

function allClues(vehicle: Vehicle, order: ClueId[]): Clue[] {
  return order.map((id) => ({ id, label: CLUES[id].label, value: CLUES[id].format(vehicle) }));
}

function view(state: GameState, status: GameView['status']): GameView {
  const vehicle = getVehicle(state.v);
  if (!vehicle) throw new GameError('This game refers to a car that is no longer in the database. Start a new game.');
  const clues = allClues(vehicle, state.o);
  // A guessed car is compared only on the clues the player can already see,
  // so the comparison never says anything about a clue still hidden.
  const shown = status === 'playing' ? state.n : clues.length;
  const turns: Turn[] = state.g.map((id) => {
    const guessed = id ? getVehicle(id) : undefined;
    if (!id || !guessed) return { carId: id, name: id };
    const values = allClues(guessed, state.o)
      .slice(0, shown)
      .map((c, i) => ({ value: c.value, match: c.value === clues[i]!.value }));
    return { carId: id, name: guessed.displayName, values };
  });
  if (status === 'playing') {
    return { status, mode: state.m, token: seal(state), clueLabels: clues.map((c) => c.label), clues: clues.slice(0, state.n), turns };
  }
  const solved = status === 'solved';
  return {
    status,
    mode: state.m,
    clueLabels: clues.map((c) => c.label),
    clues,
    turns,
    result: {
      solved,
      carId: vehicle.id,
      name: vehicle.displayName,
      cluesUsed: state.n,
      guessCount: state.g.filter((id) => id !== null).length + (solved ? 1 : 0),
      score: solved ? clues.length - state.n + 1 : 0,
      elapsedMs: Date.now() - state.t,
    },
  };
}

/** Starts a game on a random car in the given mode, avoiding the cars just played. */
export function newGame(mode: Mode, exclude: string[] = []): GameView {
  const excluded = new Set(exclude.slice(0, 50));
  const pool = VEHICLES.filter((v) => !excluded.has(v.id));
  const candidates = pool.length > 0 ? pool : VEHICLES;
  const vehicle = candidates[Math.floor(Math.random() * candidates.length)];
  if (!vehicle) throw new GameError('The vehicle database is empty.');
  return view({ v: vehicle.id, m: mode, o: drawClueOrder(mode), n: 1, g: [], t: Date.now() }, 'playing');
}

/**
 * Applies one turn. `guessId` is the guessed car, or null to skip to the next clue.
 * A wrong guess or a skip reveals the next clue; on the last clue it ends the game.
 */
export function playTurn(token: string, guessId: string | null): GameView {
  const state = open<GameState>(token);
  if (!state || typeof state.v !== 'string' || !Array.isArray(state.g) || !isMode(state.m) || !isValidClueOrder(state.o)) {
    throw new GameError('This game could not be read. Reload the page to start a new one.');
  }
  if (guessId !== null) {
    if (!getVehicle(guessId)) throw new GameError('That car is not in the database. Pick one from the list.');
    if (state.g.includes(guessId)) throw new GameError('You already guessed that car.');
    if (guessId === state.v) return view(state, 'solved');
  }
  const total = state.o.length;
  const next: GameState = { ...state, g: [...state.g, guessId] };
  if (state.n >= total) return view(next, 'lost');
  next.n = state.n + 1;
  return view(next, 'playing');
}
