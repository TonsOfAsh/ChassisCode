import 'server-only';
import { createHmac } from 'node:crypto';
import { drawClueOrder, priorityClues, type ClueId } from '@/config/clues';
import { dailyNumber } from '../daily-time';
import type { Vehicle } from '../schema';
import { gameSecret } from './token';
import { VEHICLES } from './vehicles';

/**
 * The daily puzzle: one car and one clue order per Pacific calendar day, the
 * same for every player. Both are derived from the date and the server
 * secret, so they need no database and cannot be predicted from the code.
 *
 * Cars are dealt in rounds: each round is a shuffled list of every daily-
 * eligible car, so no car repeats until all have been used. Adding or removing
 * a daily-eligible car reshuffles the current round, which can change the
 * puzzle of the day it goes live, so new cars should go live just after
 * midnight Pacific. Games already in progress are not affected: their car and
 * clue order travel in the game token.
 */

/** A deterministic random number generator (mulberry32) seeded from text. */
function seeded(text: string): () => number {
  const digest = createHmac('sha256', gameSecret()).update(text).digest();
  let state = digest.readUInt32LE(0);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export interface DailyPuzzle {
  date: string;
  number: number;
  vehicle: Vehicle;
  order: ClueId[];
}

/** The daily puzzle for a Pacific date (YYYY-MM-DD). */
export function dailyPuzzle(date: string): DailyPuzzle {
  const eligible = VEHICLES.filter((v) => v.dailyEligible).sort((a, b) => a.id.localeCompare(b.id));
  if (eligible.length === 0) throw new Error('No car is eligible for the daily puzzle.');
  const number = dailyNumber(date);
  const index = Math.max(0, number - 1);
  const round = Math.floor(index / eligible.length);
  const vehicle = shuffled(eligible, seeded(`daily-round:${round}:${eligible.length}`))[index % eligible.length]!;
  const order = drawClueOrder('normal', seeded(`daily-order:${date}`), priorityClues(vehicle, VEHICLES));
  return { date, number, vehicle, order };
}
