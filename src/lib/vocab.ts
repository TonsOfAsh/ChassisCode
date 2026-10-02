/**
 * Controlled vocabularies for ChassisCode vehicle data.
 *
 * Every categorical field in a vehicle record must use one of these values.
 * To add a value, add it here first; the validator rejects anything else.
 */

export const ENGINE_CONFIGURATIONS = [
  'I3',
  'I4',
  'I5',
  'I6',
  'V6',
  'VR6',
  'V8',
  'V10',
  'V12',
  'W12',
  'W16',
  'Flat-4',
  'Flat-6',
  'Flat-8',
  'Flat-12',
  'Rotary',
  // Battery EVs only. A hybrid is described by its combustion engine;
  // its hybrid status lives in the fuel field.
  'Electric',
  'Other',
] as const;

export const ASPIRATIONS = [
  'Naturally Aspirated',
  'Turbocharged',
  'Twin Turbocharged',
  'Triple Turbocharged',
  'Quad Turbocharged',
  'Supercharged',
  'Twincharged',
  'Electric',
  'Other',
] as const;

export const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'] as const;

export const BODIES = [
  'Coupe',
  'Convertible',
  'Roadster',
  'Sedan',
  'Hatchback',
  'Wagon',
  'Shooting Brake',
  'Targa',
  'SUV',
  'Other',
] as const;

export const FUELS = [
  'Gasoline',
  'Diesel',
  'Hybrid',
  'Plug-in Hybrid',
  'Electric',
  'Other',
] as const;

/**
 * Country of origin = the home country of the brand, not the assembly plant.
 * (Acura NSX is built in Ohio but Acura is a Japanese brand: "Japan".)
 */
export const COUNTRIES = [
  'Germany',
  'Italy',
  'Japan',
  'United Kingdom',
  'United States',
  'France',
  'Sweden',
  'South Korea',
  'Netherlands',
  'Croatia',
  'Australia',
  'Other',
] as const;

/**
 * Transmissions use generic type names, never brand names.
 * PDK, DSG, S tronic -> "DCT". SMG, F1, E-gear, ASG -> "Automated Manual".
 * Tiptronic, Steptronic, torque-converter autos -> "Automatic".
 * Brand names belong in a vehicle's search aliases instead.
 */
export const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'DCT', 'Automated Manual'] as const;
export const TRANSMISSION_SPECIALS = ['CVT', 'Single-speed'] as const;
export const TRANSMISSION_PATTERN = new RegExp(
  `^(?:(?:[1-9]|1[0-2])-speed (?:${TRANSMISSION_TYPES.join('|')})|${TRANSMISSION_SPECIALS.join('|')})$`,
);

export const MARKETS = ['US', 'EU', 'UK', 'JP', 'Other'] as const;

/**
 * How the manufacturer's power rating was stated. The stored value is always
 * converted to hp (1 PS = 0.98632 hp, 1 kW = 1.34102 hp), rounded to the
 * nearest whole number.
 */
export const POWER_STANDARDS = [
  'SAE net', // US-market manufacturer rating, already in hp
  'DIN PS', // European manufacturer rating in PS / kW
  'JIS PS', // Japanese manufacturer rating in PS
  'Other',
] as const;

/**
 * What the production years mean. US-market records give US model years,
 * which is how US enthusiasts refer to a car and what manufacturers publish.
 * Other records give the calendar years the car was built.
 */
export const YEAR_TYPES = ['model', 'calendar'] as const;

/** Curb weight is preferred. Dry weight is allowed only when no curb figure exists. */
export const WEIGHT_TYPES = ['curb', 'dry'] as const;

export const SOURCE_TYPES = [
  'manufacturer', // press kit, spec sheet, official site, owner's manual
  'publication', // Car and Driver, Road & Track, MotorTrend, Evo, etc.
  'database', // last resort
] as const;

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;

export type EngineConfiguration = (typeof ENGINE_CONFIGURATIONS)[number];
export type Aspiration = (typeof ASPIRATIONS)[number];
export type Drivetrain = (typeof DRIVETRAINS)[number];
export type Body = (typeof BODIES)[number];
export type Fuel = (typeof FUELS)[number];
export type Country = (typeof COUNTRIES)[number];
