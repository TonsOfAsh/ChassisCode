/**
 * Clue-order report. Clue order is partly random, so this plays many games
 * per car in each difficulty mode and reports how many clues it takes, on
 * average, before the car is the only one in the database that still matches.
 *
 * This measures a player who knows every spec of every car. Real players
 * need more clues; use it to compare modes, not to predict scores.
 *
 *   npm run clue-report
 */
import { ALL_CLUES, CLUES, CLUE_TIERS, FINAL_CLUES, drawClueOrder, priorityClues } from '../src/config/clues';
import { MODES } from '../src/lib/game-types';
import { VehicleSchema, type Vehicle } from '../src/lib/schema';
import { loadRawFiles } from './load';

const SAMPLES = 400;

const vehicles: Vehicle[] = loadRawFiles().flatMap((f) => {
  const parsed = VehicleSchema.safeParse(f.json);
  return parsed.success ? [parsed.data] : [];
});
const values = new Map(vehicles.map((v) => [v.id, new Map(ALL_CLUES.map((id) => [id, CLUES[id].format(v)]))]));

/** Average clue number at which `v` becomes the only match, or null if it never does. */
function averageUniqueAt(v: Vehicle, mode: (typeof MODES)[number]['id']): number | null {
  const mine = values.get(v.id)!;
  const priority = priorityClues(v, vehicles);
  let total = 0;
  for (let s = 0; s < SAMPLES; s++) {
    let candidates = vehicles;
    let at = 0;
    for (const [i, id] of drawClueOrder(mode, Math.random, priority).entries()) {
      candidates = candidates.filter((o) => values.get(o.id)!.get(id) === mine.get(id));
      if (candidates.length === 1) {
        at = i + 1;
        break;
      }
    }
    if (!at) return null;
    total += at;
  }
  return total / SAMPLES;
}

const label = (ids: readonly (keyof typeof CLUES)[]) => ids.map((id) => CLUES[id].label).join(', ');
console.log('Clue tiers');
console.log(`  Easy:   ${label(CLUE_TIERS.easy)}`);
console.log(`  Medium: ${label(CLUE_TIERS.medium)}`);
console.log(`  Hard:   ${label(CLUE_TIERS.hard)}`);
console.log(`  Always last: ${label(FINAL_CLUES)}\n`);
const prioritised = vehicles
  .map((v) => ({ v, p: priorityClues(v, vehicles) }))
  .filter((x) => x.p.first.length + x.p.soon.length > 0);
if (prioritised.length > 0) {
  console.log('Cars with a near-twin, and the clue brought forward when they are the answer:');
  for (const { v, p } of prioritised)
    console.log(`  ${v.displayName}: ${p.first.length ? `${label(p.first)} (clue 1 or 2)` : `${label(p.soon)} (within the first 4)`}`);
  console.log('');
}

console.log(`Average clue at which each car becomes the only match (${SAMPLES} games per mode, ${ALL_CLUES.length} clues):\n`);
const rows = vehicles.map((v) => ({ name: v.displayName, at: MODES.map((m) => averageUniqueAt(v, m.id)) }));
const width = Math.max(...rows.map((r) => r.name.length));
console.log(`${''.padEnd(width)}  ${MODES.map((m) => m.label.padStart(7)).join('')}`);
for (const r of rows.sort((a, b) => (a.at[1] ?? 99) - (b.at[1] ?? 99)))
  console.log(
    r.at.some((x) => x === null)
      ? `${r.name.padEnd(width)}  NEVER unique: another car has identical clues`
      : `${r.name.padEnd(width)}  ${r.at.map((x) => x!.toFixed(1).padStart(7)).join('')}`,
  );
const ok = rows.filter((r) => r.at.every((x) => x !== null));
console.log(
  `\n${'Average'.padEnd(width)}  ${MODES.map((_, i) => (ok.reduce((s, r) => s + r.at[i]!, 0) / (ok.length || 1)).toFixed(1).padStart(7)).join('')}`,
);
