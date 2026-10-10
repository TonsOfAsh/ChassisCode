/**
 * The Daily schedule: which car is the answer on each day.
 *
 * The answers must stay secret (the repository is public), so they are not
 * written down anywhere. Each day's car is drawn with the server secret from
 * the cars in the Daily pool that day, in a way that adding or retiring cars
 * never changes a day that has already started:
 *
 * - The pool (data/daily/pool.json) records, for each car, the dates it is in
 *   the Daily. A car added after launch joins from the next day; a car taken
 *   out leaves after the current day. `npm run daily-pool` keeps it in step
 *   with the records, and the build refuses to run if it is out of step.
 * - The days are dealt in order from puzzle #1. Each day takes, from the pool
 *   cars not yet used in the current cycle, the one with the lowest secret
 *   score for that date. Once every pool car has been used a new cycle starts,
 *   so no car repeats until all have had their turn.
 *
 * A day's answer depends only on the pool as it stood on that day and before,
 * so a pool change dated tomorrow or later cannot reach today or any earlier day.
 *
 * The secret score is passed in, so the scripts can check the schedule with a
 * throwaway secret. Server and scripts only (uses node:crypto).
 */
import { createHash, createHmac } from 'node:crypto';

/** Dates a car is in the Daily. `from` absent = from puzzle #1; `until` absent = still in. Both inclusive. */
export interface PoolWindow {
  from?: string;
  until?: string;
}

export type Pool = Record<string, PoolWindow[]>;

export interface PoolFile {
  about?: string;
  cars: Pool;
}

/** True when `id` is in the Daily on `date` (YYYY-MM-DD; dates compare as text). */
export function inPool(windows: readonly PoolWindow[], date: string): boolean {
  return windows.some((w) => (w.from === undefined || w.from <= date) && (w.until === undefined || date <= w.until));
}

/** The pool cars on `date`, sorted by id. */
export function poolOn(pool: Pool, date: string): string[] {
  return Object.keys(pool)
    .filter((id) => inPool(pool[id]!, date))
    .sort();
}

export type Score = (date: string, id: string) => number;

/**
 * The secret score: lowest is picked. One HMAC per day gives that day's 64-bit
 * key; each car's score mixes the key with a hash of its id, so dealing years of
 * days stays fast. Without the secret the keys, and so the picks, are unknowable.
 */
export function secretScore(secret: string, prefix: string): Score {
  let day = '';
  let k0 = 0;
  let k1 = 0;
  const ids = new Map<string, number>();
  const fmix = (h: number) => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0;
  };
  return (date, id) => {
    if (date !== day) {
      const digest = createHmac('sha256', secret).update(`${prefix}:${date}`).digest();
      k0 = digest.readUInt32LE(0);
      k1 = digest.readUInt32LE(4);
      day = date;
    }
    let h = ids.get(id);
    if (h === undefined) {
      h = fmix(Number.parseInt(createHash('sha256').update(id).digest('hex').slice(0, 8), 16));
      ids.set(id, h);
    }
    // 53 bits: exact as a JavaScript number.
    return fmix(h ^ k0) * 2 ** 21 + (fmix((h ^ k1) + 0x9e3779b9) >>> 11);
  };
}

/**
 * Deals the schedule day by day. Keeps its progress, so asking for a later
 * day continues from where it stopped instead of starting again.
 */
export class Schedule {
  /** The answer of each day dealt so far. */
  private readonly picks: string[] = [];
  /** For each day dealt, the day its cycle started. */
  private readonly cycleStart: number[] = [];

  constructor(
    private readonly pool: Pool,
    private readonly epoch: string,
    private readonly score: Score,
    private readonly addDays: (date: string, days: number) => string,
  ) {}

  /**
   * Day `index`'s cycle start and its cars, best first (the first is the
   * answer). Needs every earlier day dealt; does not change any state.
   */
  private rank(index: number): { start: number; ranked: string[] } {
    const date = this.addDays(this.epoch, index);
    const all = poolOn(this.pool, date);
    if (all.length === 0) throw new Error(`The Daily pool is empty on ${date}.`);
    let start = index === 0 ? 0 : this.cycleStart[index - 1]!;
    const used = new Set(this.picks.slice(start, index));
    let open = all.filter((id) => !used.has(id));
    if (open.length === 0) {
      start = index;
      open = all;
    }
    const scored = open.map((id) => [id, this.score(date, id)] as const);
    scored.sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
    return { start, ranked: scored.map(([id]) => id) };
  }

  private dealTo(count: number): void {
    while (this.picks.length < count) {
      const { start, ranked } = this.rank(this.picks.length);
      this.picks.push(ranked[0]!);
      this.cycleStart.push(start);
    }
  }

  /** The answer's id for day `index` (0 = puzzle #1). */
  answer(index: number): string {
    this.dealTo(index + 1);
    return this.picks[index]!;
  }

  /**
   * Day `index`'s cars, best first. The first is the answer; the server falls
   * back to the next only if the first has no playable record (which the build
   * check is there to prevent).
   */
  candidates(index: number): string[] {
    this.dealTo(index);
    return this.rank(index).ranked;
  }
}
