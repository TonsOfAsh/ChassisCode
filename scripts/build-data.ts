/**
 * Bundles every vehicle record into src/generated/vehicles.json for the app.
 * Runs automatically before `npm run dev` and `npm run build`.
 * Stops with an error if any record does not match the schema.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { VehicleSchema, type Vehicle } from '../src/lib/schema';
import { OUT_OF_STEP_HELP, poolProblems, readPool } from './daily-pool-lib';
import { ROOT, loadRawFiles } from './load';

const vehicles: Vehicle[] = [];
let failed = false;
for (const file of loadRawFiles()) {
  const parsed = file.parseError ? null : VehicleSchema.safeParse(file.json);
  if (!parsed || !parsed.success) {
    console.error(`Invalid record: ${file.path}. Run "npm run validate" for details.`);
    failed = true;
    continue;
  }
  vehicles.push(parsed.data);
}
if (failed) process.exit(1);

vehicles.sort((a, b) => a.displayName.localeCompare(b.displayName));
const outDir = join(ROOT, 'src', 'generated');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'vehicles.json'), JSON.stringify(vehicles));
console.log(`Bundled ${vehicles.length} vehicles into src/generated/vehicles.json`);

// The Daily pool must match the records, or a deploy could change past puzzles (see src/lib/daily-schedule.ts).
const pool = readPool();
const problems = poolProblems(pool, new Set(vehicles.filter((v) => v.dailyEligible).map((v) => v.id)));
if (problems.length > 0) {
  console.error(`${OUT_OF_STEP_HELP}\n${problems.slice(0, 20).join('\n')}`);
  process.exit(1);
}
writeFileSync(join(outDir, 'daily-pool.json'), JSON.stringify({ cars: pool.cars }));
console.log(`Bundled the Daily pool (${Object.keys(pool.cars).length} cars) into src/generated/daily-pool.json`);
