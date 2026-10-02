# Batch 2 report (2026-10-01)

Target: 25 cars. Result: 16 added, 9 held back. The database now has 60 cars; 15 cars in total
are held in `data/held/`.

## Added (16)

A separate checker re-opened the power and weight source for every car and found each figure on
the cited manufacturer page, for the model year and configuration the record states.

| Car | Years | Power | Weight | Reference year |
|---|---|---|---|---|
| Acura Integra Type R (DC2) | 1997–2001 | 195 hp | 2,577 lb | 1998 |
| Acura NSX (NA1) | 1991–1996 | 270 hp | 3,010 lb | 1991 |
| Alfa Romeo 4C | 2015–2018 | 237 hp | 2,465 lb | 2015 |
| Alfa Romeo Giulia Quadrifoglio | 2017–2024 | 505 hp | 3,820 lb | 2020 |
| Honda Civic Type R (FL5) | 2023–present | 315 hp | 3,188 lb | 2023 |
| Honda S2000 (AP2) | 2004–2009 | 237 hp | 2,855 lb | 2006 |
| Mazda MX-5 Miata (ND) | 2016–present | 181 hp | 2,339 lb | 2019 |
| Mercedes-AMG GT R (C190) | 2018–2020 | 577 hp | 3,594 lb | 2018 |
| Mitsubishi Lancer Evolution (X) | 2008–2015 | 291 hp | 3,517 lb | 2010 |
| Nissan GT-R Nismo (R35) | 2015–2024 | 600 hp | 3,867 lb | 2023 |
| Nissan Skyline GT-R (R32) | 1989–1994 | 276 hp | 3,153 lb | 1989 |
| Subaru WRX STI (VA) | 2015–2021 | 305 hp | 3,386 lb | 2015 |
| Toyota GR Corolla | 2023–present | 300 hp | 3,252 lb | 2023 |
| Toyota GR Supra 3.0 (A90) | 2020–2026 | 382 hp | 3,389 lb | 2023 |
| Volkswagen Golf GTI (Mk7) | 2015–2021 | 210 hp | 2,972 lb | 2015 |
| Volkswagen Golf R (Mk7) | 2015–2019 | 292 hp | 3,283 lb | 2016 |

All sixteen take both power and weight from the manufacturer's own US press material, except the
Skyline GT-R (R32), which was never sold in the US and uses Nissan's Japanese figures (280 PS,
1,430 kg) and calendar years.

## Held back (9)

| Car | What is missing |
|---|---|
| Nissan GT-R (R35) | A decision, not a figure: the US rating rose from 480 hp (2009) to 565 hp (2017 on), so one record cannot describe 2009–2024. Proposed split: 2009–2011, 2012–2016, 2017–2024. |
| Toyota Supra Turbo (A80) | A curb weight tied to a configuration. Toyota says only that "the Turbo model" weighed 3,450 lb. |
| Mitsubishi Lancer Evolution (IX) | A second source for the weight (3,274 lb comes from one unattributed table). |
| Mercedes-Benz SLS AMG (C197) | A US curb weight. The US release quotes the European DIN weight in pounds. |
| Mazda MX-5 Miata 1.8 (NA) | Manufacturer or magazine sources for power and weight. |
| Subaru WRX STI (GD) | A qualifying weight (3,263 lb is in two outlets, neither a major magazine) and the cc figure. |
| Dodge Viper GTS (SR II) | Power and weight from a Chrysler document or magazine panel; the weights found disagree by 240 lb. |
| Dodge Challenger SRT Demon | The curb weight. Dodge's spec sheet exists but could not be read by the research tools. |
| Audi R8 V10 Plus (4S) | One more source for the weight (only AutoGuide gives 3,572 lb). |

Everything confirmed for these cars, with quotes and links, is in `data/held/held-cars.json`.

## Decisions made in this batch

- **Reference year.** Power and weight must both be true of the record's reference year. The year
  is the launch year unless a later rating covered more than half the run; within that rating it is
  the earliest year with a qualifying weight.
- **Dodge Challenger SRT Hellcat changed** under that rule from 707 hp / 4,449 lb (2015) to
  717 hp / 4,415 lb (2023): 717 hp applied to five of the nine model years. Both figures were
  checked on Dodge's 2023 specification sheet.
- **Roadsters sold as their own model** (AMG GT R Roadster) are separate records; Cabriolet and
  Convertible versions stay in the coupe's record.
- **Acura NSX (NA1)** covers the 3.0-litre car, model years 1991–1996. Automatic cars kept the
  3.0 engine after 1996; that is described in the record's note.
- **Search** no longer forgives typos in short terms, so "amg" does not find the M3's SMG gearbox
  and "sti" does not find the GTI.

## Follow-up, same day: GT-R split

Decided: the R35 GT-R is split by US model year, and the C8 Stingray will be a 2020–2026 record.

- **Added:** Nissan GT-R (R35, 2012–2016), 545 hp and 3,829 lb at reference year 2013, and Nissan
  GT-R (R35, 2017–2024), 565 hp and 3,935 lb at reference year 2023. Power and weight for both were
  read from Nissan's US press kits in two separate passes. The database is at 62 cars.
- **Held:** Nissan GT-R (R35, 2009–2011). Power is confirmed (480 hp for 2009, 485 hp for 2010 and
  2011) but Nissan's kits for those years give no curb weight, and only spec databases do.
- **Still held:** Chevrolet Corvette Stingray (C8, 2020–2026). GM confirms the 2027 car moves to a
  6.7L engine. No qualifying curb weight was found for the 6.2L car.
- **New mechanism:** records split this way set `yearSplit`, and near-twin cars have their
  distinguishing clue brought forward (see README, "Difficulty").
