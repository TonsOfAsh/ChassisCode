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
 * One exception: when the answer has a near-twin in the database (same
 * manufacturer and model, told apart by a single clue), that clue is brought
 * forward. See `priorityClues`.
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

/**
 * The clues that should be revealed early when `vehicle` is the answer.
 *
 * Some cars have a near-twin: another record with the same manufacturer and
 * model whose clues differ in just one place (the three R35 GT-R year ranges
 * differ only in power). A player who has worked out the model would otherwise
 * have to guess between the twins until that one clue happened to come up.
 *
 * Weight is ignored when counting differences, because it nearly always
 * differs and few players know it. It is used only when it is the sole
 * difference. Cars told apart by two or more other clues get no priority.
 */
export function priorityClues(vehicle: Vehicle, all: readonly Vehicle[]): ClueId[] {
  const found = new Set<ClueId>();
  for (const other of all) {
    if (other.id === vehicle.id || other.manufacturer !== vehicle.manufacturer || other.model !== vehicle.model) continue;
    const differing = TIERED_CLUES.filter((id) => CLUES[id].format(other) !== CLUES[id].format(vehicle));
    const useful = differing.filter((id) => id !== 'weight');
    if (useful.length === 1) found.add(useful[0]!);
    else if (useful.length === 0 && differing.length === 1) found.add('weight');
  }
  return TIERED_CLUES.filter((id) => found.has(id));
}

/**
 * The clue order for one game in the given mode.
 * `random` returns a number in [0, 1), like Math.random.
 *
 * `priority` (from `priorityClues`) is brought forward: in Easy mode to just
 * after the easy clues, in the other modes to the first or second clue.
 */
export function drawClueOrder(mode: Mode, random: () => number = Math.random, priority: readonly ClueId[] = []): ClueId[] {
  let tiered = MODE_GROUPS[mode].flatMap((group) =>
    shuffle<ClueId>(
      group.flatMap((tier) => [...CLUE_TIERS[tier]]),
      random,
    ),
  );
  const easy: readonly ClueId[] = CLUE_TIERS.easy;
  // In Easy mode an easy clue is already among the first three, so it stays put.
  const early = shuffle(
    priority.filter((id) => tiered.includes(id) && !(mode === 'easy' && easy.includes(id))),
    random,
  );
  if (early.length > 0) {
    tiered = tiered.filter((id) => !early.includes(id));
    // Easy: straight after the easy clues. Otherwise first or second (the first places, if several).
    const at = mode === 'easy' ? easy.length : early.length === 1 ? Math.floor(random() * 2) : 0;
    tiered.splice(at, 0, ...early);
  }
  // Enforce the ordering rules by swapping any pair that came out the wrong way round.
  for (const [first, second] of BEFORE_RULES) {
    const a = tiered.indexOf(first);
    const b = tiered.indexOf(second);
    if (a > b && b !== -1) [tiered[a], tiered[b]] = [tiered[b]!, tiered[a]!];
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
