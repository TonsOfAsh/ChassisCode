/**
 * Clue-order report: for every car, how many cars in the database still match
 * after each clue is revealed. Use it to judge whether a clue order is balanced.
 *
 *   npm run clue-report
 */
import { CLUES, CLUE_ORDERS, DEFAULT_CLUE_ORDER, clueValues } from '../src/config/clues';
import { VehicleSchema, type Vehicle } from '../src/lib/schema';
import { loadRawFiles } from './load';

const vehicles: Vehicle[] = loadRawFiles().flatMap((f) => {
  const parsed = VehicleSchema.safeParse(f.json);
  return parsed.success ? [parsed.data] : [];
});
const order = CLUE_ORDERS[DEFAULT_CLUE_ORDER];
const all = vehicles.map((v) => ({ v, clues: clueValues(v) }));

const rows = all.map(({ v, clues }) => {
  const remaining = order.map((_, i) => all.filter((o) => clues.slice(0, i + 1).every((c, j) => o.clues[j] === c)).length);
  const solvedAt = remaining.findIndex((n) => n === 1);
  return { name: v.displayName, remaining, solvedAt: solvedAt === -1 ? null : solvedAt + 1 };
});

console.log(`Clue order "${DEFAULT_CLUE_ORDER}": ${order.map((id) => CLUES[id].label).join(' > ')}\n`);
console.log('Cars still matching after each clue (1 = uniquely identified):\n');
const width = Math.max(...rows.map((r) => r.name.length));
console.log(' '.repeat(width) + '  ' + order.map((_, i) => String(i + 1).padStart(3)).join('') + '   unique at');
for (const r of rows.sort((a, b) => (a.solvedAt ?? 99) - (b.solvedAt ?? 99)))
  console.log(r.name.padEnd(width) + '  ' + r.remaining.map((n) => String(n).padStart(3)).join('') + '   ' + (r.solvedAt ? `clue ${r.solvedAt}` : 'NEVER'));

const avg = order.map((_, i) => rows.reduce((s, r) => s + r.remaining[i]!, 0) / rows.length);
console.log('\n' + 'Average'.padEnd(width) + '  ' + avg.map((n) => n.toFixed(0).padStart(3)).join(''));
const solved = rows.filter((r) => r.solvedAt);
if (solved.length)
  console.log(`\nAverage clue at which a car becomes unique: ${(solved.reduce((s, r) => s + r.solvedAt!, 0) / solved.length).toFixed(1)} of ${order.length}`);
const never = rows.filter((r) => !r.solvedAt);
if (never.length) console.log(`Never unique: ${never.map((r) => r.name).join(', ')}`);
