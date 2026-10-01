/**
 * Bundles every vehicle record into src/generated/vehicles.json for the app.
 * Runs automatically before `npm run dev` and `npm run build`.
 * Stops with an error if any record does not match the schema.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { VehicleSchema, type Vehicle } from '../src/lib/schema';
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
