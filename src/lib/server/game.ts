import 'server-only';
import { CLUES, CLUE_ORDERS, DEFAULT_CLUE_ORDER, type ClueOrderName } from '@/config/clues';
import type { Clue, GameView, Turn } from '../game-types';
import type { Vehicle } from '../schema';
import { open, seal } from './token';
import { VEHICLES, getVehicle } from './vehicles';

/** What the encrypted token holds. Short keys keep the token small. */
interface GameState {
  /** Answer vehicle id. */
  v: string;
  /** Clue order name. */
  o: ClueOrderName;
  /** Number of clues revealed. */
  n: number;
  /** Turns so far: a guessed vehicle id, or null for a skip. */
  g: (string | null)[];
  /** Start time, ms since epoch. */
  t: number;
}

export class GameError extends Error {}

function allClues(vehicle: Vehicle, order: ClueOrderName): Clue[] {
  return CLUE_ORDERS[order].map((id) => ({ id, label: CLUES[id].label, value: CLUES[id].format(vehicle) }));
}

function view(state: GameState, status: GameView['status']): GameView {
  const vehicle = getVehicle(state.v);
  if (!vehicle) throw new GameError('This game refers to a car that is no longer in the database. Start a new game.');
  const clues = allClues(vehicle, state.o);
  const turns: Turn[] = state.g.map((id) => ({ carId: id, name: id ? (getVehicle(id)?.displayName ?? id) : null }));
  if (status === 'playing') {
    return { status, token: seal(state), clueLabels: clues.map((c) => c.label), clues: clues.slice(0, state.n), turns };
  }
  const solved = status === 'solved';
  return {
    status,
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

/** Starts a game on a random car, avoiding the ones just played. */
export function newGame(exclude: string[] = []): GameView {
  const excluded = new Set(exclude.slice(0, 50));
  const pool = VEHICLES.filter((v) => !excluded.has(v.id));
  const candidates = pool.length > 0 ? pool : VEHICLES;
  const vehicle = candidates[Math.floor(Math.random() * candidates.length)];
  if (!vehicle) throw new GameError('The vehicle database is empty.');
  return view({ v: vehicle.id, o: DEFAULT_CLUE_ORDER, n: 1, g: [], t: Date.now() }, 'playing');
}

/**
 * Applies one turn. `guessId` is the guessed car, or null to skip to the next clue.
 * A wrong guess or a skip reveals the next clue; on the last clue it ends the game.
 */
export function playTurn(token: string, guessId: string | null): GameView {
  const state = open<GameState>(token);
  if (!state || typeof state.v !== 'string' || !Array.isArray(state.g) || !(state.o in CLUE_ORDERS)) {
    throw new GameError('This game could not be read. Start a new game.');
  }
  if (guessId !== null) {
    if (!getVehicle(guessId)) throw new GameError('That car is not in the database. Pick one from the list.');
    if (state.g.includes(guessId)) throw new GameError('You already guessed that car.');
    if (guessId === state.v) return view(state, 'solved');
  }
  const total = CLUE_ORDERS[state.o].length;
  const next: GameState = { ...state, g: [...state.g, guessId] };
  if (state.n >= total) return view(next, 'lost');
  next.n = state.n + 1;
  return view(next, 'playing');
}
