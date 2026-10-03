import type { Mode } from '../lib/game-types';
import { yearRangeText, type Vehicle } from '../lib/schema';

/**
 * Clue definitions, difficulty tiers and clue order.
 *
 * Eleven clues are sorted into three tiers by how much they help a typical
 * player. A game's mode decides which tier is revealed first; within a tier
 * the order is random, except that country always comes before manufacturer.
 * Model is always second to last and generation last.
 *
 * One exception: when the answer has a near-twin in the database (any car
 * told apart by only one or two clues), a deciding clue is brought forward.
 * See `priorityClues`.
 */

export type ClueId =
  | 'country'
  | 'body'
  | 'engineConfiguration'
  | 'aspiration'
  | 'drivetrain'
  | 'fuel'
  | 'displacement'
  | 'transmission'
  | 'power'
  | 'weight'
  | 'manufacturer'
  | 'model'
  | 'generation';

export interface ClueDefinition {
  label: string;
  /** The text shown to the player. */
  format: (v: Vehicle) => string;
}

const LB_PER_KG = 2.20462;

const yearRange = (v: Vehicle) => yearRangeText(v.production.value);

export const CLUES: Record<ClueId, ClueDefinition> = {
  country: { label: 'Country', format: (v) => v.country },
  body: { label: 'Body', format: (v) => v.body.value.join(' / ') },
  engineConfiguration: { label: 'Engine', format: (v) => v.engine.configuration.value },
  aspiration: { label: 'Aspiration', format: (v) => v.engine.aspiration.value },
  drivetrain: { label: 'Drivetrain', format: (v) => v.drivetrain.value },
  fuel: { label: 'Fuel', format: (v) => v.fuel.value },
  displacement: {
    label: 'Displacement',
    format: (v) =>
      v.engine.displacementL.value === null ? 'None (electric)' : `${v.engine.displacementL.value.toFixed(1)}L`,
  },
  transmission: { label: 'Transmission', format: (v) => v.transmission.value.join(' / ') },
  power: { label: 'Power', format: (v) => `${v.powerHp.value.toLocaleString('en-US')} hp` },
  weight: {
    label: 'Weight',
    format: (v) => {
      const lb = v.weightLb.value;
      const kg = Math.round(lb / LB_PER_KG);
      const dry = v.specBasis.weightType === 'dry' ? ' (dry)' : '';
      return `${lb.toLocaleString('en-US')} lbs / ${kg.toLocaleString('en-US')} kg${dry}`;
    },
  },
  manufacturer: { label: 'Manufacturer', format: (v) => v.manufacturer },
  model: { label: 'Model', format: (v) => v.model },
  generation: {
    label: 'Generation',
    format: (v) => (v.generation ? `${v.generation}, ${yearRange(v)}` : yearRange(v)),
  },
};

/** How much each clue helps a typical player. Model and generation are not tiered. */
export const CLUE_TIERS = {
  easy: ['manufacturer', 'engineConfiguration', 'country'],
  medium: ['drivetrain', 'aspiration', 'power', 'displacement'],
  hard: ['transmission', 'fuel', 'body', 'weight'],
} as const satisfies Record<string, readonly ClueId[]>;

export type Tier = keyof typeof CLUE_TIERS;

/** Always the last clues, in this order, in every mode. */
export const FINAL_CLUES = ['model', 'generation'] as const satisfies readonly ClueId[];

/**
 * Each mode is a list of groups revealed one after another. A group is one or
 * more tiers whose clues are shuffled together.
 */
export const MODE_GROUPS: Record<Mode, readonly (readonly Tier[])[]> = {
  easy: [['easy'], ['medium'], ['hard']],
  normal: [['easy', 'medium', 'hard']],
  hard: [['hard'], ['medium'], ['easy']],
};

/**
 * Ordering rules that hold in every mode: the first clue of each pair is
 * always revealed before the second. Country is broader than manufacturer,
 * so it would tell the player nothing if it came afterwards.
 */
export const BEFORE_RULES: readonly (readonly [ClueId, ClueId])[] = [['country', 'manufacturer']];

/** Every clue, in a fixed reference order. */
export const ALL_CLUES: readonly ClueId[] = [
  ...CLUE_TIERS.easy,
  ...CLUE_TIERS.medium,
  ...CLUE_TIERS.hard,
  ...FINAL_CLUES,
];

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

const TIERED_CLUES: readonly ClueId[] = [...CLUE_TIERS.easy, ...CLUE_TIERS.medium, ...CLUE_TIERS.hard];

/** Clues to reveal early for one answer. See `priorityClues`. */
export interface Priority {
  /** Revealed first or second (fourth in Easy, straight after the easy clues). */
  first: ClueId[];
  /** Revealed somewhere in the first four (fourth or fifth in Easy). */
  soon: ClueId[];
}

export const NO_PRIORITY: Priority = { first: [], soon: [] };

/**
 * The clues that should be revealed early when `vehicle` is the answer.
 *
 * Some cars have a near-twin: another car, of any make or model, whose clues
 * (apart from model and generation, which always come last) differ in only one
 * or two places. The R35 GT-R year ranges differ only in power; so do the
 * Cayman GT4 and the 911 GT3. A player who has narrowed it down to those cars
 * would otherwise be guessing until the deciding clue happened to come up.
 *
 * - A twin that differs in one clue: that clue is revealed first or second
 *   (manufacturer comes straight after country, so second or third).
 * - Otherwise, twins that differ in two clues: the one clue that tells apart
 *   the most of them (power when it ties) is revealed within the first four.
 *
 * Weight is ignored when counting differences, because it nearly always
 * differs and few players know it. It counts only when it is the sole
 * difference.
 */
export function priorityClues(vehicle: Vehicle, all: readonly Vehicle[]): Priority {
  const first = new Set<ClueId>();
  const cover = new Map<ClueId, number>();
  for (const other of all) {
    if (other.id === vehicle.id) continue;
    const differing = TIERED_CLUES.filter((id) => CLUES[id].format(other) !== CLUES[id].format(vehicle));
    const useful = differing.filter((id) => id !== 'weight');
    if (useful.length === 1) first.add(useful[0]!);
    else if (useful.length === 0 && differing.length === 1) first.add('weight');
    else if (useful.length === 2) for (const id of useful) cover.set(id, (cover.get(id) ?? 0) + 1);
  }
  if (first.size > 0) return { first: TIERED_CLUES.filter((id) => first.has(id)), soon: [] };
  if (cover.size === 0) return NO_PRIORITY;
  // Most twins told apart wins; power breaks a tie, then the reference order.
  const best = [...cover].sort(
    ([a, x], [b, y]) => y - x || Number(b === 'power') - Number(a === 'power') || TIERED_CLUES.indexOf(a) - TIERED_CLUES.indexOf(b),
  )[0]![0];
  return { first: [], soon: [best] };
}

/**
 * The clue order for one game in the given mode.
 * `random` returns a number in [0, 1), like Math.random. A seeded `random`
 * gives the same order every time, which is how the daily puzzle is the same
 * for everyone.
 *
 * `priority` (from `priorityClues`) is brought forward: see `Priority`.
 */
export function drawClueOrder(mode: Mode, random: () => number = Math.random, priority: Priority = NO_PRIORITY): ClueId[] {
  let tiered = MODE_GROUPS[mode].flatMap((group) =>
    shuffle<ClueId>(
      group.flatMap((tier) => [...CLUE_TIERS[tier]]),
      random,
    ),
  );
  const easy: readonly ClueId[] = CLUE_TIERS.easy;
  // In Easy mode an easy clue is already among the first three, so it stays put.
  const movable = (ids: ClueId[]) => ids.filter((id) => tiered.includes(id) && !(mode === 'easy' && easy.includes(id)));
  let first = shuffle(movable(priority.first), random);
  // A clue that must come after another (manufacturer after country) brings that one along, just before it.
  for (const [a, z] of BEFORE_RULES) {
    const i = first.indexOf(z);
    if (i !== -1 && !first.includes(a) && tiered.includes(a)) first = [...first.slice(0, i), a, ...first.slice(i)];
  }
  const soon = movable(priority.soon);
  if (first.length > 0) {
    tiered = tiered.filter((id) => !first.includes(id));
    // Easy: straight after the easy clues. Otherwise first or second (the first places, if several).
    const at = mode === 'easy' ? easy.length : first.length === 1 ? Math.floor(random() * 2) : 0;
    tiered.splice(at, 0, ...first);
  } else if (soon.length > 0) {
    const id = soon[0]!;
    // A clue that must come after another (manufacturer after country) brings that one along, just before it.
    const before = BEFORE_RULES.find(([, z]) => z === id)?.[0];
    const group = before && tiered.includes(before) ? [before, id] : [id];
    // Easy: fourth or fifth. Otherwise anywhere in the first four. Left alone if already that early.
    const [lo, hi] = mode === 'easy' ? [easy.length, easy.length + 1] : [0, 3];
    if (group.some((x) => tiered.indexOf(x) > hi)) {
      tiered = tiered.filter((x) => !group.includes(x));
      tiered.splice(lo + Math.floor(random() * (hi - lo + 2 - group.length)), 0, ...group);
    }
  }
  // Enforce the ordering rules by swapping any pair that came out the wrong way round.
  for (const [a, z] of BEFORE_RULES) {
    const i = tiered.indexOf(a);
    const j = tiered.indexOf(z);
    if (i > j && j !== -1) [tiered[i], tiered[j]] = [tiered[j]!, tiered[i]!];
  }
  return [...tiered, ...FINAL_CLUES];
}

/** True if `order` contains every clue exactly once, ends with the final clues in order and obeys the ordering rules. */
export function isValidClueOrder(order: unknown): order is ClueId[] {
  if (!Array.isArray(order) || order.length !== ALL_CLUES.length) return false;
  if (new Set(order).size !== ALL_CLUES.length || !order.every((id) => (ALL_CLUES as string[]).includes(id))) return false;
  if (!BEFORE_RULES.every(([first, second]) => order.indexOf(first) < order.indexOf(second))) return false;
  return FINAL_CLUES.every((id, i) => order[order.length - FINAL_CLUES.length + i] === id);
}

/** A vehicle's clue strings in the reference order. Used to compare cars. */
export function clueValues(v: Vehicle): string[] {
  return ALL_CLUES.map((id) => CLUES[id].format(v));
}
