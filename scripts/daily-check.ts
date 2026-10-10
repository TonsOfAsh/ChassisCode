/**
 * Checks the Daily schedule's promises with a throwaway secret (it never
 * prints real answers):
 *
 * 1. No car repeats until every car in the pool has been used.
 * 2. Adding cars from tomorrow, or retiring cars after today, never changes
 *    today's answer or any earlier one - tried on many random days.
 * 3. The pool is in step with the records.
 *
 *   npm run daily-check
 */
import { randomBytes } from 'node:crypto';
import { Schedule, poolOn, secretScore, type Pool } from '../src/lib/daily-schedule';
import { DAILY_EPOCH, nextDate } from '../src/lib/daily-time';
import { VehicleSchema } from '../src/lib/schema';
import { OUT_OF_STEP_HELP, poolProblems, readPool } from './daily-pool-lib';
import { loadRawFiles } from './load';

const secret = randomBytes(32).toString('hex');
const score = secretScore(secret, 'daily-pick');
const schedule = (pool: Pool) => new Schedule(pool, DAILY_EPOCH, score, nextDate);
const clone = (pool: Pool): Pool => JSON.parse(JSON.stringify(pool));

let failures = 0;
const fail = (message: string) => {
  failures++;
  console.error(`FAIL: ${message}`);
};

// 3. In step with the records.
const eligible = new Set<string>();
for (const file of loadRawFiles()) {
  const parsed = VehicleSchema.safeParse(file.json);
  if (parsed.success && parsed.data.dailyEligible) eligible.add(parsed.data.id);
}
const file = readPool();
const problems = poolProblems(file, eligible);
if (problems.length > 0) fail(`${OUT_OF_STEP_HELP}\n${problems.slice(0, 10).join('\n')}`);
const pool = file.cars;
const size = poolOn(pool, DAILY_EPOCH).length;

// 1. No repeats within a cycle, over three cycles.
const base = schedule(pool);
for (let cycle = 0; cycle < 3; cycle++) {
  const ids = Array.from({ length: size }, (_, i) => base.answer(cycle * size + i));
  if (new Set(ids).size !== size) fail(`cycle ${cycle + 1} repeats a car before all ${size} were used`);
}

// Asking for days out of order gives the same answers.
const late = schedule(pool);
late.answer(size * 3);
for (let i = 0; i < size * 3; i += 7) if (late.answer(i) !== base.answer(i)) fail(`day ${i + 1} differs when a later day was asked first`);
const fresh = schedule(pool);
for (let i = 0; i < size; i++) if (fresh.candidates(i)[0] !== base.answer(i)) fail(`candidates() disagrees with answer() on day ${i + 1}`);

// 2. Changes dated after "today" leave today and earlier alone.
const ids = Object.keys(pool);
const rand = (n: number) => randomBytes(4).readUInt32LE(0) % n;
const trials = 300;
let laterChanged = 0;
for (let t = 0; t < trials; t++) {
  const todayIndex = rand(size * 2);
  const today = nextDate(DAILY_EPOCH, todayIndex);
  const changed = clone(pool);
  for (let k = 0; k < 1 + rand(5); k++) changed[`test-new-car-${t}-${k}`] = [{ from: nextDate(today) }];
  for (let k = 0; k < rand(4); k++) {
    const id = ids[rand(ids.length)]!;
    const last = changed[id]![changed[id]!.length - 1]!;
    if (last.until === undefined) last.until = today;
  }
  const before = schedule(pool);
  const after = schedule(changed);
  for (let i = 0; i <= todayIndex; i++) {
    if (before.answer(i) !== after.answer(i)) {
      fail(`trial ${t}: a change dated after ${today} altered puzzle #${i + 1}`);
      break;
    }
  }
  if (before.answer(todayIndex + 30) !== after.answer(todayIndex + 30)) laterChanged++;
}

console.log(`Pool: ${size} cars from puzzle #1 (${DAILY_EPOCH}).`);
console.log(`No repeats within a cycle: checked 3 cycles of ${size} days.`);
console.log(`Stability: ${trials} random pool changes; today and earlier unchanged in every one (a day a month later changed in ${laterChanged}, as expected).`);
if (failures > 0) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log('All Daily schedule checks passed.');
