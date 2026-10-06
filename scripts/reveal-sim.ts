/**
 * Balance check for the "reveal" rules: how much a guess gives away.
 * Usage: npm run reveal-sim
 */
import data from '../src/generated/vehicles.json';
import { CLUES, FINAL_CLUES, drawClueOrder, type ClueId } from '../src/config/clues';
import { progress } from '../src/lib/reveal';
import type { Vehicle } from '../src/lib/schema';

const cars = data as unknown as Vehicle[];
const tiered = (Object.keys(CLUES) as ClueId[]).filter((id) => !(FINAL_CLUES as readonly string[]).includes(id));
const fmt = (id: ClueId, v: Vehicle) => CLUES[id].format(v);

// 1. Matches between two random different cars.
let pairs = 0;
const dist = new Array(12).fill(0);
const perClue = new Map<ClueId, number>();
for (const a of cars) for (const g of cars) {
  if (a === g) continue;
  pairs++;
  const m = tiered.filter((id) => fmt(id, a) === fmt(id, g));
  dist[m.length]++;
  for (const id of m) perClue.set(id, (perClue.get(id) ?? 0) + 1);
}
const avg = dist.reduce((s, n, i) => s + n * i, 0) / pairs;
console.log(`Random guess vs random answer: ${avg.toFixed(2)} of ${tiered.length} specs match on average`);
console.log('  distribution:', dist.map((n, i) => `${i}:${((100 * n) / pairs).toFixed(0)}%`).join(' '));
console.log('  how often each spec matches:', tiered.map((id) => `${id} ${((100 * (perClue.get(id) ?? 0)) / pairs).toFixed(0)}%`).join(', '));

// 2. Best opening guesses (most specs matched on average).
const best = cars
  .map((g) => ({ g, m: cars.reduce((s, a) => s + (a === g ? 0 : tiered.filter((id) => fmt(id, a) === fmt(id, g)).length), 0) / (cars.length - 1) }))
  .sort((x, y) => y.m - x.m)
  .slice(0, 5);
console.log('Best opening guesses:', best.map((b) => `${b.g.displayName} ${b.m.toFixed(2)}`).join('; '));

// 3. Clues showing after k random wrong guesses (Normal order), reveal vs classic.
let rng = 1;
const random = () => ((rng = (rng * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const K = [1, 2, 3, 4, 5];
const sums = { reveal: K.map(() => 0), classic: K.map(() => 0) };
const runs = 3000;
for (let r = 0; r < runs; r++) {
  const a = cars[Math.floor(random() * cars.length)]!;
  const order = drawClueOrder('normal', random);
  const guesses: Vehicle[] = [];
  while (guesses.length < 5) {
    const g = cars[Math.floor(random() * cars.length)]!;
    if (g !== a && !guesses.includes(g)) guesses.push(g);
  }
  for (const [i, k] of K.entries()) {
    sums.reveal[i]! += progress('reveal', order, a, guesses.slice(0, k)).shown.size;
    sums.classic[i]! += progress('classic', order, a, guesses.slice(0, k)).shown.size;
  }
}
console.log('Clues showing after k random wrong guesses (of 13):');
for (const [i, k] of K.entries()) console.log(`  k=${k}: reveal ${(sums.reveal[i]! / runs).toFixed(1)}, classic ${(sums.classic[i]! / runs).toFixed(1)}`);
