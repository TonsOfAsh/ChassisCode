import 'server-only';
import { CLUES, drawClueOrder, isValidClueOrder, priorityClues, type ClueId } from '@/config/clues';
import { dailyDate, dailyNumber, isDate } from '../daily-time';
import { isMode, type GameView, type Mode, type Turn } from '../game-types';
import { compare, progress, rightCount, rulesFor } from '../reveal';
import { dailyPuzzle } from './daily';
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
  /** Number of clues showing (informational; the clues shown are worked out from the turns). */
  n: number;
  /** Turns so far: a guessed vehicle id, or null for a skip. */
  g: (string | null)[];
  /** Start time, ms since epoch. */
  t: number;
  /** Daily puzzle date (YYYY-MM-DD). Absent for Unlimited games. */
  d?: string;
}

export class GameError extends Error {}

function view(state: GameState, status: GameView['status']): GameView {
  const vehicle = getVehicle(state.v);
  if (!vehicle) throw new GameError('This game refers to a car that is no longer in the database. Start a new game.');
  const rules = rulesFor(state.m);
  const guessed = state.g.map((id) => (id ? (getVehicle(id) ?? null) : null));
  const { shown: shownDuringPlay, turns: reveals } = progress(rules, state.o, vehicle, guessed);
  // Once the round is over every clue is shown, and guesses are compared on all of them.
  const shown = status === 'playing' ? shownDuringPlay : new Set(state.o);
  const clues = state.o.map((id) => (shown.has(id) ? { id, label: CLUES[id].label, value: CLUES[id].format(vehicle) } : null));
  const turns: Turn[] = state.g.map((id, i) => {
    const guess = guessed[i];
    const revealed = reveals[i];
    const base = { carId: id, revealed: revealed ? { matched: revealed.matched, next: revealed.next } : undefined };
    if (!id || !guess) return { ...base, name: id };
    const right = rules === 'reveal' ? rightCount(guess, vehicle) : undefined;
    return { ...base, name: guess.displayName, right, values: compare(rules, state.o, shown, guess, vehicle) };
  });
  const daily = state.d ? { date: state.d, number: dailyNumber(state.d) } : undefined;
  const common = { mode: state.m, rules, daily, clueLabels: state.o.map((id) => CLUES[id].label), maxTurns: state.o.length, turns };
  if (status === 'playing') return { status, ...common, token: seal({ ...state, n: shownDuringPlay.size }), clues };
  const solved = status === 'solved';
  const turnsUsed = state.g.length + (solved ? 1 : 0);
  return {
    status,
    ...common,
    clues,
    result: {
      solved,
      carId: vehicle.id,
      name: vehicle.displayName,
      cluesUsed: turnsUsed,
      guessCount: state.g.filter((id) => id !== null).length + (solved ? 1 : 0),
      score: solved ? state.o.length - turnsUsed + 1 : 0,
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
  const order = drawClueOrder(mode, Math.random, priorityClues(vehicle, VEHICLES));
  return view({ v: vehicle.id, m: mode, o: order, n: 1, g: [], t: Date.now() }, 'playing');
}

/** Starts today's daily puzzle: the same car and clue order for every player. */
export function newDailyGame(): GameView {
  const puzzle = dailyPuzzle(dailyDate());
  return view({ v: puzzle.vehicle.id, m: 'normal', o: puzzle.order, n: 1, g: [], t: Date.now(), d: puzzle.date }, 'playing');
}

/**
 * Applies one turn. `guessId` is the guessed car, or null to skip to the next clue.
 * A wrong guess or a skip reveals clues (see lib/reveal.ts); the 13th wrong turn ends the game.
 */
export function playTurn(token: string, guessId: string | null): GameView {
  const state = open<GameState>(token);
  if (!state || typeof state.v !== 'string' || !Array.isArray(state.g) || !isMode(state.m) || !isValidClueOrder(state.o) || (state.d !== undefined && !isDate(state.d))) {
    throw new GameError('This game could not be read. Reload the page to start a new one.');
  }
  if (guessId !== null) {
    if (!getVehicle(guessId)) throw new GameError('That car is not in the database. Pick one from the list.');
    if (state.g.includes(guessId)) throw new GameError('You already guessed that car.');
    if (guessId === state.v) return view(state, 'solved');
  }
  // A round allows one turn per clue; the last wrong turn ends it.
  const next: GameState = { ...state, g: [...state.g, guessId] };
  return view(next, next.g.length >= state.o.length ? 'lost' : 'playing');
}
