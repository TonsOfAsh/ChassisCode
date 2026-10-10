/**
 * Keeps data/daily/pool.json in step with the vehicle records.
 *
 *   npm run daily-pool                  after adding, removing or changing cars
 *   npm run daily-pool -- --launch DATE  set the date of puzzle #1 (before launch only)
 *
 * Before launch: the pool is simply every daily-eligible car, from puzzle #1.
 * After launch: a car that became daily-eligible joins from tomorrow (Pacific),
 * and a car that stopped being eligible (or was removed) leaves after today,
 * so today's puzzle and every earlier one stay as they were.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PoolFile } from '../src/lib/daily-schedule';
import { DAILY_EPOCH, dailyDate, isDate, nextDate } from '../src/lib/daily-time';
import { VehicleSchema } from '../src/lib/schema';
import { isOpen, poolProblems, readPool, writePool } from './daily-pool-lib';
import { ROOT, loadRawFiles } from './load';

const args = process.argv.slice(2);
const today = dailyDate();
const tomorrow = nextDate(today);

const eligible = new Set<string>();
for (const file of loadRawFiles()) {
  const parsed = file.parseError ? null : VehicleSchema.safeParse(file.json);
  if (!parsed || !parsed.success) {
    console.error(`Invalid record: ${file.path}. Run "npm run validate" first.`);
    process.exit(1);
  }
  if (parsed.data.dailyEligible) eligible.add(parsed.data.id);
}

function launch(date: string): void {
  if (!isDate(date)) throw new Error(`"${date}" is not a YYYY-MM-DD date.`);
  if (today >= DAILY_EPOCH && !args.includes('--force')) {
    throw new Error(`The Daily already launched on ${DAILY_EPOCH} (today is ${today}). Moving puzzle #1 now would change every puzzle; add --force only if nobody has played yet.`);
  }
  if (date < today && !args.includes('--force')) throw new Error(`${date} is in the past (today is ${today}).`);
  const path = join(ROOT, 'src', 'lib', 'daily-time.ts');
  const source = readFileSync(path, 'utf8');
  const updated = source.replace(/export const DAILY_EPOCH = '\d{4}-\d{2}-\d{2}';/, `export const DAILY_EPOCH = '${date}';`);
  if (updated === source && !source.includes(`DAILY_EPOCH = '${date}'`)) throw new Error('Could not find DAILY_EPOCH in src/lib/daily-time.ts.');
  writeFileSync(path, updated);
  writePool({ cars: Object.fromEntries([...eligible].map((id) => [id, [{}]])) });
  console.log(`Puzzle #1 is now ${date}. The Daily pool holds all ${eligible.size} daily-eligible cars from puzzle #1.`);
}

function sync(): void {
  const pool: PoolFile = readPool();
  const launched = today >= DAILY_EPOCH;
  if (!launched) {
    writePool({ cars: Object.fromEntries([...eligible].map((id) => [id, [{}]])) });
    console.log(`Before launch (puzzle #1 is ${DAILY_EPOCH}): the Daily pool is all ${eligible.size} daily-eligible cars.`);
    return;
  }
  const added: string[] = [];
  const removed: string[] = [];
  for (const id of eligible) {
    const windows = (pool.cars[id] ??= []);
    if (windows.length > 0 && isOpen(windows[windows.length - 1]!)) continue;
    // A car that left and comes back: if it left today or later, just reopen that window.
    const last = windows[windows.length - 1];
    if (last && last.until !== undefined && last.until >= today) delete last.until;
    else windows.push({ from: tomorrow });
    added.push(id);
  }
  for (const [id, windows] of Object.entries(pool.cars)) {
    if (eligible.has(id)) continue;
    const last = windows[windows.length - 1]!;
    if (!isOpen(last)) continue;
    if (last.from !== undefined && last.from > today) {
      // Never reached the Daily: drop the window (and the car, if that was its only one).
      windows.pop();
      if (windows.length === 0) delete pool.cars[id];
    } else last.until = today;
    removed.push(id);
  }
  writePool(pool);
  const problems = poolProblems(readPool(), eligible);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  if (added.length === 0 && removed.length === 0) console.log('The Daily pool was already up to date.');
  if (added.length > 0) console.log(`Joining the Daily from ${tomorrow}: ${added.join(', ')}`);
  if (removed.length > 0) console.log(`Leaving the Daily after ${today}: ${removed.join(', ')}`);
}

try {
  const i = args.indexOf('--launch');
  if (i !== -1) launch(args[i + 1] ?? '');
  else sync();
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
