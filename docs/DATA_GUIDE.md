# ChassisCode data guide

How vehicle records are written, what belongs in the database, and how specs are sourced.
The schema is in `src/lib/schema.ts`, the allowed values in `src/lib/vocab.ts`.
Run `npm run validate` after every change.

## File layout

One file per vehicle: `data/vehicles/<manufacturer-slug>/<id>.json`.

- `id` is lowercase kebab-case and starts with the manufacturer slug: `porsche-911-gt3-991-2`.
- The file name is the id plus `.json`.
- The folder is the manufacturer in lowercase kebab-case: `porsche`, `alfa-romeo`.

## What belongs in the database

Include production, street-legal cars with real enthusiast interest: sports cars, sports sedans,
hot hatches, muscle cars, supercars, hypercars, track-focused road cars and important historical
enthusiast cars.

Exclude race-only cars, concepts, prototypes, one-offs, commercial vehicles, and ordinary commuter
or family cars.

## What counts as a separate vehicle

The hierarchy is manufacturer > model > generation > variant > sub-variant.

Separate records when:

- The generation differs (991.1 vs 991.2).
- It is a materially different performance variant (GT3 vs GT3 RS, M3 vs M3 CSL).
- The engine is substantially different (MX-5 NA 1.6 vs 1.8).
- It is sold under its own name or as its own trim (M3 Competition on the G80).
- The drivetrain differs and it is sold as its own model (M3 Competition xDrive).

Do not separate for paint, interior, wheels, brakes, seats, cosmetic or appearance packages,
option packages, or a choice of transmissions on the same variant.

Rules for the ambiguous cases:

| Case | Rule |
|---|---|
| Coupe and convertible of the same variant | One record listing both bodies, unless the open car is sold under its own name (Spider, Targa, Speedster). |
| Power changes mid-generation with no new designation | One record at a stated reference model year. Split by year range only when the change is large. Describe the change in a note. |
| Competition or performance packages | Separate only when sold as its own trim. |
| A named package with identical published specs (992.1 GT3 Touring) | Not separate. Add its name to the parent record's aliases. |
| Cars never sold in the US | Home-market spec, converted to hp and lb, with the market recorded in `specBasis`. |
| Cars with no generation code | `generation` is null. The Generation clue then shows production years only. |
| Several generations of one model with no chassis code enthusiasts use (Ford GT, Camaro, CTS-V) | Use `1st gen`, `2nd gen` and so on. Put the model year people say ("2005 Ford GT") in the aliases. |
| The manufacturer publishes only a dry weight | Use a major publication's curb weight. Use the dry weight only if no curb weight exists anywhere; then set `specBasis.weightType` to `dry` and `needsReview`. |

## Field rules

**Identity.** `displayName` is always `Manufacturer Model [Variant] [Sub-variant] (Generation)`,
with the parenthesis omitted when generation is null. The validator checks this.
`aliases` holds nicknames, engine codes and brand transmission names people might search for
("PDK", "Miata", "Godzilla"). `country` is the brand's home country, not where the car was built.

**Spec basis.** Every record states which car the numbers describe:

- `market`: US when the car was sold in the US. Otherwise its home market.
- `yearType`: `model` for US-market records, `calendar` otherwise. See Production below.
- `referenceModelYear`: the model year the numbers apply to. Use the launch model year, unless the
  rating changed after the first year and stayed there for most of the run (C5 Z06: 385 hp for 2001,
  405 hp for 2002 to 2004, so the reference year is 2002). Say so in the power note.
- `powerStandard`: how the manufacturer stated power (SAE net, DIN PS, JIS PS).
- `weightType`: curb or dry.

Never mix markets within one record. If power is a US figure, weight is a US figure.

**Production.** The first and last year of this variant, not of the whole generation.

- US-market records give US model years (`specBasis.yearType` is `model`): 2006 to 2013 for the
  C6 Z06. Model years are how US enthusiasts refer to a car and what manufacturers publish. A token
  early run counts if cars were sold with that model year (the 2015 Shelby GT350).
- Records for any other market give the calendar years the car was built (`yearType` is `calendar`).
- `endYear` is null if it is still on sale. Describe other markets' years in the note.

**Body.** A list of every body style the variant was sold in, in the market named in `specBasis`
(E36 M3 in the US: coupe, sedan and convertible). A body style sold under its own name is a
separate record instead (Spider, Targa, Speedster).

- `Roadster`: a two-seat open car that has no fixed-roof version of the same variant (S2000, MX-5,
  Elise, 918 Spyder).
- `Convertible`: the open version of a car that also exists as a coupe or sedan (M3 Convertible).
- `Targa`: only when the manufacturer sells it under that name.
- `Coupe`: two-door sports cars, including those with a rear liftback (RX-7, Supra).
- `Hatchback`: hatchback versions of mainstream compact cars (Civic Type R, Golf GTI).

**Engine configuration.** Always the combustion engine. A hybrid V8 is `V8`; its hybrid status
goes in `fuel`. `Electric` is for battery EVs only.

**Displacement.** The engine's displacement in cc, rounded to one decimal of a litre (3,996 cc is
4.0). Put the cc figure in the note. If the manufacturer's marketing says something else (Porsche
called the 3,745 cc 992 Turbo S engine "3.8 liter" at launch), still use the rounded cc figure and
say so in the note.
Rotary engines use the nominal figure (1.3 for a 13B). Null for battery EVs only.

**Drivetrain.** `AWD` for every permanent or automatically engaging system, whatever the maker
calls it (quattro, xDrive, ATTESA "4WD"). `4WD` only for selectable part-time systems with a
transfer case, which means trucks and off-roaders.

**Aspiration.** Count turbochargers, not their arrangement: sequential twin turbos are
`Twin Turbocharged`. Battery EVs are `Electric`.

**Fuel.** `Hybrid` means a full hybrid that cannot be plugged in. `Plug-in Hybrid` can be plugged
in. A 48V mild hybrid is `Gasoline`, with a note.

**Transmission.** A list of every transmission offered on the variant, manuals first.
Generic type names only: `6-speed Manual`, `7-speed DCT`, `8-speed Automatic`,
`6-speed Automated Manual`, `CVT`, `Single-speed`.
PDK, DSG and S tronic are DCTs. SMG, Ferrari F1 and E-gear are Automated Manuals.
Tiptronic, Steptronic and other torque-converter gearboxes are Automatics.

**Power.** The manufacturer's rating in hp for the chosen market and reference year. Never a
tested or dyno figure. US ratings are used as published. PS is converted at 1 PS = 0.98632 hp and
kW at 1 kW = 1.34102 hp, rounded to the nearest whole number, with the original figure in the note.
For hybrids, use the manufacturer's combined system output. `powerStandard` records how the figure
was stated. When the manufacturer's US arm published an hp figure, use it as published even if it
is numerically the PS figure (918 Spyder: 887 hp). When a US-market car only has a metric rating,
convert it, set `powerStandard` to `DIN PS` and explain in the note (Chiron: 1,500 PS = 1,479 hp).

**Weight.** Curb weight in lb for the chosen market. kg is converted at 1 kg = 2.20462 lb and
rounded. The weight describes the standard car: the coupe with the manual transmission where one is
offered (otherwise the standard transmission) and standard equipment, with no weight-saving options
and no delete options. Say which configuration it is in the note.

Take the figure from the first of these that exists:

1. The manufacturer's curb weight for the standard car.
2. A publication's curb weight for the standard car. This means either the specification panel
   of a major magazine (Car and Driver, Road & Track, MotorTrend, Evo, Autocar, Top Gear), or the
   same figure reported by two independent editorial outlets with named authors. Auto-filled spec
   panels, registries, forums, museum pages and figures worked out by subtraction do not count. Use this when the manufacturer publishes
   no curb weight, only a dry weight, or only a weight for an optioned car (Weissach Package,
   Extreme Aero). Set confidence to `medium`.
3. The manufacturer's dry weight, only when no curb weight exists anywhere. Set
   `specBasis.weightType` to `dry` (the game then shows "dry" beside the figure) and set
   `needsReview`.

A weight for an optioned car is never used as the standard car's weight. If steps 1 and 2 both
fail and only an optioned-car figure exists, use it, say exactly which options it includes in the
note, and set `needsReview`. When two sources at the same step disagree, record a discrepancy.
European "DIN" and "EU" weights are different things (EU adds 75 kg for a driver); use DIN, and say
so in the note.

## Sources

Order of preference:

1. Manufacturer: press kits, spec sheets, newsroom pages, brochures, owner's manuals.
2. Major publications: Car and Driver, Road & Track, MotorTrend, Automobile, Evo, Autocar, Top Gear.
   Use the specification panel they print from the manufacturer, not their test results.
3. Established databases, as a last resort. The validator warns when power or weight relies on one.

Wikipedia is not a source. Use it to find sources.

How to type a source:

- `manufacturer`: anything written by the manufacturer, including a press release rehosted by a
  wire service or reproduced in full by another site.
- `publication`: any editorial outlet, large or small.
- `database`: spec listing pages with no author, such as Edmunds, KBB and Cars.com spec tables.

Each field has one `sourceId`. To cite a second source for the same field (a different page for
the production end year, or a source that corroborates the first), add it to `sources` and name
its id in the field's note. The validator treats a source named in a note as cited.

Categorical facts that no page states in so many words (naturally aspirated, gasoline, rear-wheel
drive, coupe) may be inferred from the cited page's description of the car. Numbers may not.

Every sourced field has a `sourceId` pointing at an entry in the record's `sources` list. Each
source records its type, publisher, title, URL and the date it was accessed. Only cite a page that
was actually opened and that actually states the value.

## Minimum sourcing

A car enters the database only if all of these hold. Otherwise it is held back, not guessed.

- Power comes from a manufacturer page or a major publication's specification panel that was
  actually opened, and the power note quotes the sentence or table line it came from.
- Weight meets the weight rule above from a manufacturer or major publication page that was actually
  opened, and the weight note quotes it. A database is not enough for power or weight.
- Production years, displacement and transmissions each have a cited source.
- No unresolved discrepancy on power or weight.

## Discrepancies

When two reputable sources give different values for a field, add an entry to `discrepancies`
with both values, the reason they differ (market, model year, transmission, DIN vs EU weight,
rounding, dry vs curb), and the resolution. If it cannot be resolved, leave `resolution` out and
set `needsReview` to true with a `reviewNotes` explanation.

## Confidence

Confidence describes power and weight only, since those are the numbers most likely to be wrong.
Doubts about any other field are handled with `needsReview`.

- `high`: power and weight both come from a manufacturer source for the stated market and year.
- `medium`: one of them comes from a publication, from a manufacturer source for a different model
  year, or from a conversion between markets.
- `low`: power or weight sources conflict without resolution, or a database was the only source.

## Example record

```json
{
  "id": "porsche-911-gt3-991-2",
  "manufacturer": "Porsche",
  "model": "911",
  "generation": "991.2",
  "variant": "GT3",
  "subVariant": null,
  "displayName": "Porsche 911 GT3 (991.2)",
  "aliases": ["991.2 GT3", "GT3 991.2", "Porsche GT3", "PDK"],
  "country": "Germany",
  "production": { "value": { "startYear": 2017, "endYear": 2019 }, "sourceId": "porsche-press-2017" },
  "body": { "value": ["Coupe"], "sourceId": "porsche-press-2017" },
  "engine": {
    "configuration": { "value": "Flat-6", "sourceId": "porsche-press-2017" },
    "displacementL": { "value": 4.0, "sourceId": "porsche-press-2017", "note": "3,996 cc" },
    "aspiration": { "value": "Naturally Aspirated", "sourceId": "porsche-press-2017" }
  },
  "fuel": { "value": "Gasoline", "sourceId": "porsche-press-2017" },
  "drivetrain": { "value": "RWD", "sourceId": "porsche-press-2017" },
  "transmission": { "value": ["6-speed Manual", "7-speed DCT"], "sourceId": "porsche-press-2017", "note": "DCT is Porsche PDK" },
  "powerHp": { "value": 500, "sourceId": "porsche-press-2017" },
  "weightLb": { "value": 3116, "sourceId": "porsche-press-2017", "note": "Manual; PDK is 3,153 lb" },
  "specBasis": { "market": "US", "referenceModelYear": 2018, "powerStandard": "SAE net", "weightType": "curb", "yearType": "model" },
  "sources": [
    {
      "id": "porsche-press-2017",
      "type": "manufacturer",
      "publisher": "Porsche Cars North America",
      "title": "The new Porsche 911 GT3 press release",
      "url": "https://example.com/replace-with-the-real-page",
      "accessed": "2026-09-30"
    }
  ],
  "discrepancies": [],
  "needsReview": false,
  "confidence": "high",
  "image": null,
  "dailyEligible": true
}
```

The numbers in this example are illustrative. The real record is in `data/vehicles/porsche/`.
