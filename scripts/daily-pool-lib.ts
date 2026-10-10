/**
 * Shared by build-data, validate and daily-pool: reads data/daily/pool.json
 * and checks it against the vehicle records. See src/lib/daily-schedule.ts.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PoolFile, PoolWindow } from '../src/lib/daily-schedule';
import { DAILY_EPOCH, isDate } from '../src/lib/daily-time';
import { ROOT } from './load';

export const POOL_PATH = join(ROOT, 'data', 'daily', 'pool.json');

export const POOL_ABOUT =
  'Which cars are in the Daily, and on which dates. Kept in step with the records by "npm run daily-pool"; ' +
  'do not edit by hand. "from" absent = from puzzle #1; "until" absent = still in; both inclusive. ' +
  'See src/lib/daily-schedule.ts and docs/LAUNCH.md.';

export function readPool(): PoolFile {
  if (!existsSync(POOL_PATH)) return { about: POOL_ABOUT, cars: {} };
  return JSON.parse(readFileSync(POOL_PATH, 'utf8')) as PoolFile;
}

export function writePool(pool: PoolFile): void {
  const cars = Object.fromEntries(Object.keys(pool.cars).sort().map((id) => [id, pool.cars[id]!]));
  writeFileSync(POOL_PATH, JSON.stringify({ about: POOL_ABOUT, cars }, null, 2) + '\n');
}

/** A window with no `until`: the car is in the Daily from its `from` onwards. */
export const isOpen = (w: PoolWindow) => w.until === undefined;

/**
 * Problems with the pool, given the ids of the daily-eligible records. Empty
 * when the pool is well formed and in step with the records.
 */
export function poolProblems(pool: PoolFile, eligible: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  for (const [id, windows] of Object.entries(pool.cars ?? {})) {
    if (!Array.isArray(windows) || windows.length === 0) {
      problems.push(`${id}: needs at least one date window.`);
      continue;
    }
    let previousEnd: string | null = null;
    for (const [i, w] of windows.entries()) {
      for (const key of Object.keys(w)) if (key !== 'from' && key !== 'until') problems.push(`${id}: unknown key "${key}".`);
      if (w.from !== undefined && !isDate(w.from)) problems.push(`${id}: "from" is not a YYYY-MM-DD date.`);
      if (w.until !== undefined && !isDate(w.until)) problems.push(`${id}: "until" is not a YYYY-MM-DD date.`);
      if (w.from !== undefined && w.from <= DAILY_EPOCH) problems.push(`${id}: "from" ${w.from} is not after puzzle #1 (${DAILY_EPOCH}); leave it out instead.`);
      if (w.from !== undefined && w.until !== undefined && w.until < w.from) problems.push(`${id}: "until" is before "from".`);
      if (i > 0 && w.from === undefined) problems.push(`${id}: only the first window may leave out "from".`);
      if (previousEnd !== null && w.from !== undefined && w.from <= previousEnd) problems.push(`${id}: windows overlap.`);
      if (i < windows.length - 1 && isOpen(w)) problems.push(`${id}: only the last window may leave out "until".`);
      previousEnd = w.until ?? null;
    }
    const open = isOpen(windows[windows.length - 1]!);
    if (open && !eligible.has(id)) problems.push(`${id}: in the Daily pool but has no daily-eligible record.`);
  }
  for (const id of eligible) {
    const windows = pool.cars?.[id];
    if (!windows || !isOpen(windows[windows.length - 1]!)) problems.push(`${id}: daily-eligible but not in the Daily pool.`);
  }
  return problems;
}

export const OUT_OF_STEP_HELP = 'The Daily pool (data/daily/pool.json) is out of step with the records. Run "npm run daily-pool" and commit the result.';
