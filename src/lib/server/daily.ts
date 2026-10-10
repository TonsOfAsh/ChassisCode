import 'server-only';
import { createHmac } from 'node:crypto';
import pool from '@/generated/daily-pool.json';
import { drawClueOrder, priorityClues, type ClueId } from '@/config/clues';
import { DAILY_EPOCH, dailyNumber, nextDate } from '../daily-time';
import { Schedule, poolOn, secretScore, type Pool } from '../daily-schedule';
import type { Vehicle } from '../schema';
import { gameSecret } from './token';
import { VEHICLES, getVehicle } from './vehicles';

/**
 * The daily puzzle: one car and one clue order per Pacific calendar day, the
 * same for every player. The car comes from the Daily schedule (see
 * lib/daily-schedule.ts), which adding or removing cars never changes for a
 * day that has started. Both car and clue order are derived from the date and
 * the server secret, so they need no database and cannot be predicted from the
 * public code. GAME_SECRET must therefore never change after launch.
 *
 * The clue order brings forward clues that tell the answer apart from its
 * near-twins in the whole database (see priorityClues), so adding a near-twin
 * of today's answer during the day could change today's order for players who
 * have not started yet. Games already in progress are never affected: their
 * car and clue order travel in the game token.
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


const POOL = (pool as { cars: Pool }).cars;
let schedule: Schedule | null = null;

function playable(id: string): Vehicle | undefined {
  const v = getVehicle(id);
  return v && v.dailyEligible ? v : undefined;
}

function pick(ids: readonly string[]): Vehicle {
  for (const id of ids) {
    const v = playable(id);
    if (v) return v;
  }
  throw new Error('No car in the Daily pool has a playable record.');
}

export interface DailyPuzzle {
  date: string;
  number: number;
  vehicle: Vehicle;
  order: ClueId[];
}

/**
 * The daily puzzle for a Pacific date (YYYY-MM-DD). Before launch (dates
 * before DAILY_EPOCH) a preview puzzle is drawn separately, so testing the
 * site before launch never shows the cars of the real schedule.
 */
export function dailyPuzzle(date: string): DailyPuzzle {
  const number = dailyNumber(date);
  let vehicle: Vehicle;
  if (number < 1) {
    const preview = secretScore(gameSecret(), 'daily-preview');
    vehicle = pick(poolOn(POOL, DAILY_EPOCH).sort((a, b) => preview(date, a) - preview(date, b)));
  } else {
    schedule ??= new Schedule(POOL, DAILY_EPOCH, secretScore(gameSecret(), 'daily-pick'), nextDate);
    vehicle = pick(schedule.candidates(number - 1));
  }
  const order = drawClueOrder('normal', seeded(`daily-order:${date}`), priorityClues(vehicle, VEHICLES));
  return { date, number, vehicle, order };
}
