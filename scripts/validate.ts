/**
 * ChassisCode data validator.
 *
 *   npm run validate            validate data/vehicles
 *   npm run validate -- --strict   treat warnings as failures too
 *   npm run validate -- <dir>      validate another folder (used for tests)
 *
 * ERROR   = the data is wrong or unusable; exits with code 1.
 * WARNING = a human should look at this; does not fail unless --strict.
 */
import { join, resolve } from 'node:path';
import { clueValues } from '../src/config/clues';
import { SOURCED_FIELDS, VehicleSchema, expectedDisplayName, type Vehicle } from '../src/lib/schema';
import { DATA_DIR, loadRawFiles } from './load';

type Level = 'ERROR' | 'WARNING';
interface Issue {
  level: Level;
  subject: string;
  message: string;
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const dirArg = args.find((a) => !a.startsWith('--'));
const dir = dirArg ? resolve(dirArg) : DATA_DIR;

const issues: Issue[] = [];
const error = (subject: string, message: string) => issues.push({ level: 'ERROR', subject, message });
const warn = (subject: string, message: string) => issues.push({ level: 'WARNING', subject, message });

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
/** Loose key for spotting the same term written two ways ("MX5" vs "MX-5"). */
const loose = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const get = (obj: unknown, path: string): any =>
  path.split('.').reduce((o: any, k) => (o == null ? o : o[k]), obj);

// ---------------------------------------------------------------------------
// 1. Per-file checks: parsing, schema, controlled vocabularies, sources, ranges
// ---------------------------------------------------------------------------
const vehicles: { v: Vehicle; path: string }[] = [];
const currentYear = new Date().getFullYear();

for (const file of loadRawFiles(dir)) {
  if (file.parseError) {
    error(file.path, `Not valid JSON: ${file.parseError}`);
    continue;
  }
  const parsed = VehicleSchema.safeParse(file.json);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const where = issue.path.join('.') || '(root)';
      const received = get(file.json, issue.path.join('.'));
      const shown = received === undefined ? 'missing' : JSON.stringify(received);
      error(file.path, `${where}: ${issue.message} (got ${shown})`);
    }
    continue;
  }
  const v = parsed.data;
  const name = `"${v.displayName}"`;
  vehicles.push({ v, path: file.path });

  // File location and naming
  if (file.stem !== v.id) error(name, `File name "${file.stem}.json" does not match id "${v.id}".`);
  if (file.folder !== slug(v.manufacturer))
    error(name, `Is in folder "${file.folder}" but manufacturer is "${v.manufacturer}" (expected "${slug(v.manufacturer)}").`);
  if (!v.id.startsWith(slug(v.manufacturer) + '-'))
    warn(name, `id "${v.id}" does not start with the manufacturer slug "${slug(v.manufacturer)}-".`);
  const expected = expectedDisplayName(v);
  if (v.displayName !== expected)
    warn(name, `Inconsistent naming: displayName should be "${expected}" based on its identity fields.`);
  if (v.subVariant && !v.variant) error(name, 'Has a subVariant but no variant.');
  if (v.aliases.length === 0) warn(name, 'Has no search aliases.');
  if (new Set(v.aliases.map(loose)).size !== v.aliases.length) warn(name, 'Has duplicate aliases.');

  // Sources
  const sourceIds = new Set<string>();
  for (const s of v.sources) {
    if (sourceIds.has(s.id)) error(name, `Source id "${s.id}" is defined twice.`);
    sourceIds.add(s.id);
  }
  const usedSources = new Set<string>();
  for (const field of SOURCED_FIELDS) {
    const sourceId: string = get(v, field).sourceId;
    usedSources.add(sourceId);
    if (!sourceIds.has(sourceId)) error(name, `Has no source for ${field}: "${sourceId}" is not in its sources list.`);
  }
  for (const d of v.discrepancies) {
    for (const dv of d.values) {
      usedSources.add(dv.sourceId);
      if (!sourceIds.has(dv.sourceId))
        error(name, `Discrepancy on ${d.field} cites unknown source "${dv.sourceId}".`);
    }
    if (!SOURCED_FIELDS.includes(d.field as (typeof SOURCED_FIELDS)[number]))
      error(name, `Discrepancy refers to unknown field "${d.field}".`);
    if (new Set(d.values.map((x) => String(x.value))).size < 2)
      warn(name, `Discrepancy on ${d.field} lists values that are all the same.`);
    if (!d.resolution) {
      warn(name, `Conflicting source values for ${d.field} are unresolved: ${d.values.map((x) => x.value).join(' vs ')}.`);
      if (!v.needsReview) error(name, `Has an unresolved discrepancy on ${d.field} but needsReview is false.`);
    }
  }
  // A second source for a field is cited by naming its id in a note.
  const noteText = JSON.stringify([
    SOURCED_FIELDS.map((f) => get(v, f).note),
    v.discrepancies.map((d) => [d.reason, d.resolution]),
    v.reviewNotes,
  ]);
  for (const id of sourceIds)
    if (!usedSources.has(id) && !noteText.includes(id)) warn(name, `Source "${id}" is listed but never cited.`);
  const powerSource = v.sources.find((s) => s.id === v.powerHp.sourceId);
  if (powerSource?.type === 'database') warn(name, 'Power is sourced from a database; prefer a manufacturer or publication source.');
  const weightSource = v.sources.find((s) => s.id === v.weightLb.sourceId);
  if (weightSource?.type === 'database') warn(name, 'Weight is sourced from a database; prefer a manufacturer or publication source.');

  // Impossible or suspicious numbers
  const { startYear, endYear } = v.production.value;
  if (startYear > currentYear + 1) error(name, `Production start year ${startYear} is in the future.`);
  if (endYear !== null && endYear < startYear) error(name, `Production ends (${endYear}) before it starts (${startYear}).`);
  if (endYear !== null && endYear > currentYear + 1) error(name, `Production end year ${endYear} is in the future.`);
  const refYear = v.specBasis.referenceModelYear;
  if (refYear < startYear - 1 || refYear > (endYear ?? currentYear + 1) + 1)
    warn(name, `Reference model year ${refYear} is outside production (${startYear}–${endYear ?? 'present'}).`);
  if (v.powerHp.value < 50 || v.powerHp.value > 2500) error(name, `Power of ${v.powerHp.value} hp is outside 50–2,500.`);
  if (v.weightLb.value < 1000 || v.weightLb.value > 7500) error(name, `Weight of ${v.weightLb.value} lb is outside 1,000–7,500.`);
  const disp = v.engine.displacementL.value;
  if (disp !== null) {
    if (disp < 0.5 || disp > 9) error(name, `Displacement of ${disp}L is outside 0.5–9.0.`);
    if (Math.round(disp * 10) / 10 !== disp) error(name, `Displacement ${disp} must be rounded to one decimal place.`);
  }
  const lbPerHp = v.weightLb.value / v.powerHp.value;
  if (lbPerHp < 2 || lbPerHp > 30) warn(name, `Weight-to-power of ${lbPerHp.toFixed(1)} lb/hp looks suspicious.`);

  // Internal consistency
  const isEv = [
    v.engine.configuration.value === 'Electric',
    v.engine.aspiration.value === 'Electric',
    v.fuel.value === 'Electric',
    disp === null,
  ];
  if (isEv.some(Boolean) && !isEv.every(Boolean))
    error(name, 'Electric fields disagree: engine configuration, aspiration and fuel must all be "Electric" and displacement null, or none of them.');
  if (v.engine.configuration.value === 'Rotary' && disp !== null && disp > 2.0)
    warn(name, `Rotary displacement should be the nominal figure (e.g. 1.3L for a 13B), got ${disp}L.`);
  if (new Set(v.body.value).size !== v.body.value.length) error(name, 'Lists the same body style twice.');
  if (new Set(v.transmission.value).size !== v.transmission.value.length) error(name, 'Lists the same transmission twice.');
  if (v.specBasis.market === 'US' && v.specBasis.powerStandard !== 'SAE net' && !v.powerHp.note)
    warn(name, `US-market record uses power standard "${v.specBasis.powerStandard}" instead of SAE net; explain why in the power note.`);
  if (v.specBasis.powerStandard !== 'SAE net' && !v.powerHp.note)
    warn(name, 'Power was converted from a metric rating; put the original figure in the power note.');
  if (v.specBasis.weightType === 'dry') warn(name, 'Weight is a dry weight, not curb weight.');
  if (v.needsReview) warn(name, `Flagged for manual review${v.reviewNotes ? `: ${v.reviewNotes}` : '.'}`);
  if (v.confidence === 'low') warn(name, 'Confidence is low.');
}

// ---------------------------------------------------------------------------
// 2. Cross-file checks: duplicates, terminology, indistinguishable cars
// ---------------------------------------------------------------------------
function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return map;
}
const names = (group: { v: Vehicle }[]) => group.map((g) => `"${g.v.displayName}"`).join(' and ');

for (const [id, group] of groupBy(vehicles, (x) => x.v.id))
  if (group.length > 1) error(id, `Duplicate id used by ${group.map((g) => g.path).join(', ')}.`);

for (const [, group] of groupBy(vehicles, (x) => loose(x.v.displayName)))
  if (group.length > 1) error(names(group), `"${group[0]!.v.displayName}" appears ${group.length} times.`);

for (const [, group] of groupBy(vehicles, (x) =>
  [x.v.manufacturer, x.v.model, x.v.generation, x.v.variant, x.v.subVariant].map((p) => loose(p ?? '')).join('|'),
))
  if (group.length > 1) error(names(group), 'Duplicate vehicle identity (same manufacturer, model, generation, variant and sub-variant).');

// Same term written two different ways
for (const field of ['manufacturer', 'model', 'generation', 'variant', 'subVariant'] as const) {
  const scoped = (x: { v: Vehicle }) => (field === 'manufacturer' ? '' : loose(x.v.manufacturer) + '|') + loose(x.v[field] ?? '');
  for (const [, group] of groupBy(vehicles.filter((x) => x.v[field]), scoped)) {
    const spellings = [...new Set(group.map((g) => g.v[field]))];
    if (spellings.length > 1) warn(names(group), `Inconsistent ${field} terminology: ${spellings.map((s) => `"${s}"`).join(' vs ')}.`);
  }
}

// Missing generations: a model with several records needs a generation on each
for (const [, group] of groupBy(vehicles, (x) => loose(x.v.manufacturer) + '|' + loose(x.v.model))) {
  const missing = group.filter((g) => !g.v.generation);
  if (group.length > 1 && missing.length > 0 && missing.length < group.length)
    warn(names(missing), `Missing generation, but other ${group[0]!.v.manufacturer} ${group[0]!.v.model} records have one.`);
}

// Cars a player could never tell apart
for (const [, group] of groupBy(vehicles, (x) => clueValues(x.v).join('|')))
  if (group.length > 1)
    warn(names(group), 'Have identical clues, so a player cannot tell them apart. Merge them, or add a distinguishing clue.');

// Suspicious duplicate variants: same family and same specs but different names
const specKey = (x: { v: Vehicle }) =>
  [
    loose(x.v.manufacturer),
    loose(x.v.model),
    loose(x.v.generation ?? ''),
    x.v.engine.configuration.value,
    x.v.engine.displacementL.value,
    x.v.engine.aspiration.value,
    x.v.drivetrain.value,
    x.v.powerHp.value,
    x.v.weightLb.value,
  ].join('|');
for (const [, group] of groupBy(vehicles, specKey))
  if (group.length > 1) warn(names(group), 'Suspicious duplicate variants: same generation, engine, drivetrain, power and weight.');

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const errors = issues.filter((i) => i.level === 'ERROR');
const warnings = issues.filter((i) => i.level === 'WARNING');
for (const i of [...errors, ...warnings]) console.log(`${i.level}:\n${i.subject}: ${i.message}\n`);

const review = vehicles.filter((x) => x.v.needsReview).length;
const noImage = vehicles.filter((x) => !x.v.image).length;
console.log(
  `${vehicles.length} vehicles checked in ${join(dir).replace(/\\/g, '/')}\n` +
    `${errors.length} errors, ${warnings.length} warnings, ${review} flagged for review, ${noImage} without an image`,
);
process.exit(errors.length > 0 || (strict && warnings.length > 0) ? 1 : 0);
