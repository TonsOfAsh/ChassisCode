import type { Vehicle } from '../lib/schema';

/**
 * Clue definitions and clue order.
 *
 * The order is broadest-first: early clues leave many candidates, the last
 * three name the car's family. To add a difficulty mode, add another entry
 * to CLUE_ORDERS; nothing else in the game depends on a specific order.
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

const yearRange = (v: Vehicle) => {
  const { startYear, endYear } = v.production.value;
  if (endYear === null) return `${startYear}–present`;
  return startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
};

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
    format: (v) =>
      `${v.weightLb.value.toLocaleString('en-US')} lb${v.specBasis.weightType === 'dry' ? ' (dry)' : ''}`,
  },
  manufacturer: { label: 'Manufacturer', format: (v) => v.manufacturer },
  model: { label: 'Model', format: (v) => v.model },
  generation: {
    label: 'Generation',
    format: (v) => (v.generation ? `${v.generation}, ${yearRange(v)}` : yearRange(v)),
  },
};

export const CLUE_ORDERS = {
  standard: [
    'country',
    'body',
    'engineConfiguration',
    'aspiration',
    'drivetrain',
    'fuel',
    'displacement',
    'transmission',
    'power',
    'weight',
    'manufacturer',
    'model',
    'generation',
  ],
} as const satisfies Record<string, readonly ClueId[]>;

export type ClueOrderName = keyof typeof CLUE_ORDERS;
export const DEFAULT_CLUE_ORDER: ClueOrderName = 'standard';

/** The full list of clue strings for a vehicle, in the given order. */
export function clueValues(v: Vehicle, order: ClueOrderName = DEFAULT_CLUE_ORDER): string[] {
  return CLUE_ORDERS[order].map((id) => CLUES[id].format(v));
}
