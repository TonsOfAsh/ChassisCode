import { z } from 'zod';
import {
  ASPIRATIONS,
  BODIES,
  CONFIDENCE_LEVELS,
  COUNTRIES,
  DRIVETRAINS,
  ENGINE_CONFIGURATIONS,
  FUELS,
  MARKETS,
  POWER_STANDARDS,
  SOURCE_TYPES,
  TRANSMISSION_PATTERN,
  WEIGHT_TYPES,
} from './vocab';

/** A spec value together with the source it came from. */
const sourced = <T extends z.ZodTypeAny>(value: T) =>
  z
    .object({
      value,
      /** Must match the id of an entry in this vehicle's `sources` list. */
      sourceId: z.string().min(1),
      /** Anything a reviewer should know: conversions, rounding, which transmission, etc. */
      note: z.string().min(1).optional(),
    })
    .strict();

const kebab = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case');
const year = z.number().int().min(1900).max(2100);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');

export const SourceSchema = z
  .object({
    id: kebab,
    type: z.enum(SOURCE_TYPES),
    publisher: z.string().min(1),
    title: z.string().min(1),
    url: z.string().url(),
    accessed: isoDate,
  })
  .strict();

export const DiscrepancySchema = z
  .object({
    /** Which field the sources disagree on, e.g. "weightLb". */
    field: z.string().min(1),
    /** The competing values, each with where it came from. */
    values: z
      .array(
        z
          .object({
            value: z.union([z.string(), z.number()]),
            sourceId: z.string().min(1),
          })
          .strict(),
      )
      .min(2),
    /** Why they differ: market, model year, measurement method, transmission, etc. */
    reason: z.string().min(1),
    /** Which value was chosen and why. Omit if unresolved (then set needsReview). */
    resolution: z.string().min(1).optional(),
  })
  .strict();

export const ImageSchema = z
  .object({
    url: z.string().url(),
    author: z.string().min(1),
    license: z.string().min(1),
    sourcePage: z.string().url(),
  })
  .strict();

export const VehicleSchema = z
  .object({
    // ---- Identity -------------------------------------------------------
    id: kebab,
    manufacturer: z.string().min(1),
    model: z.string().min(1),
    /** Chassis/generation code enthusiasts use (991.2, E46, FD). Null if none exists. */
    generation: z.string().min(1).nullable(),
    variant: z.string().min(1).nullable(),
    subVariant: z.string().min(1).nullable(),
    displayName: z.string().min(1),
    /** Extra search terms: nicknames, brand transmission names, engine codes. */
    aliases: z.array(z.string().min(1)),
    country: z.enum(COUNTRIES),

    // ---- Sourced specifications ------------------------------------------
    production: sourced(
      z.object({ startYear: year, endYear: year.nullable() }).strict(),
    ),
    body: sourced(z.array(z.enum(BODIES)).min(1)),
    engine: z
      .object({
        configuration: sourced(z.enum(ENGINE_CONFIGURATIONS)),
        /** Litres, one decimal. Null for battery EVs only. */
        displacementL: sourced(z.number().nullable()),
        aspiration: sourced(z.enum(ASPIRATIONS)),
      })
      .strict(),
    fuel: sourced(z.enum(FUELS)),
    drivetrain: sourced(z.enum(DRIVETRAINS)),
    transmission: sourced(
      z.array(z.string().regex(TRANSMISSION_PATTERN, 'not a valid transmission value')).min(1),
    ),
    /** Manufacturer-rated power in hp. Never a tested/dyno figure. */
    powerHp: sourced(z.number().int()),
    weightLb: sourced(z.number().int()),

    // ---- What the numbers above refer to ----------------------------------
    specBasis: z
      .object({
        market: z.enum(MARKETS),
        referenceModelYear: year,
        powerStandard: z.enum(POWER_STANDARDS),
        weightType: z.enum(WEIGHT_TYPES),
      })
      .strict(),

    // ---- Audit trail ------------------------------------------------------
    sources: z.array(SourceSchema).min(1),
    discrepancies: z.array(DiscrepancySchema),
    needsReview: z.boolean(),
    reviewNotes: z.string().min(1).optional(),
    confidence: z.enum(CONFIDENCE_LEVELS),

    // ---- Presentation / game ------------------------------------------------
    image: ImageSchema.nullable(),
    /** False = playable in Unlimited only, never chosen as a daily answer. */
    dailyEligible: z.boolean(),
  })
  .strict();

export type Vehicle = z.infer<typeof VehicleSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Discrepancy = z.infer<typeof DiscrepancySchema>;

/** Paths of every sourced field, used by the validator and the clue config. */
export const SOURCED_FIELDS = [
  'production',
  'body',
  'engine.configuration',
  'engine.displacementL',
  'engine.aspiration',
  'fuel',
  'drivetrain',
  'transmission',
  'powerHp',
  'weightLb',
] as const;

/** The name a record should have, derived from its identity fields. */
export function expectedDisplayName(v: Pick<Vehicle, 'manufacturer' | 'model' | 'generation' | 'variant' | 'subVariant'>): string {
  const parts = [v.manufacturer, v.model, v.variant, v.subVariant].filter(Boolean).join(' ');
  return v.generation ? `${parts} (${v.generation})` : parts;
}
