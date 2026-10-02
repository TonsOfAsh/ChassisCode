# Batch 3 report

Researched 1 October 2026. 26 cars were researched; 7 were added and 19 held back, plus two more
year ranges of the Jaguar F-Type R. The database is at 69 cars, with 36 entries in `data/held/`.

No search or fetch limit was reached.

## Added (7)

| Car | Years | Power | Weight | Sources for power and weight | Notes |
|---|---|---|---|---|---|
| McLaren 720S | 2018–2023 | 710 hp | 3,128 lb | McLaren US media information | |
| McLaren P1 | 2014–2015 | 903 hp | 3,285 lb | McLaren release (2023) | Flagged: model years rest on EPA listings via a database |
| Lexus LC 500 | 2018–present | 471 hp | 4,280 lb | Lexus 2019 press kit | Reference year 2019 |
| Mercedes-Benz C 63 AMG (W204) | 2008–2015 | 451 hp | 3,924 lb | Mercedes-Benz USA 2011 technical data | Flagged: last year (2015, coupe) rests on a database |
| Mercedes-AMG E 63 S (W213) | 2018–2023 | 603 hp | 4,515 lb | Mercedes-Benz USA 2018 specifications | Flagged: last year rests on one unsigned page |
| Audi TT RS (8S) | 2018–2022 | 394 hp | 3,296 lb | Audi of America 2021 sheet and releases | 400 hp for 2018 only |
| Jaguar F-Type R (2021–2024) | 2021–2024 | 575 hp | 3,843 lb | Jaguar US brochure, December 2019 | Year-split record |

Each was researched by one agent and then re-opened by a second, independent checker.

## Held back

Why so many: most of this batch were exotics. Their makers publish a dry weight, or a weight for a
car with lightweight options, and the US magazines whose test panels carry curb weights (Car and
Driver, Road & Track, MotorTrend) cannot be opened by the research tools.

| Car | What is missing |
|---|---|
| Ferrari 458 Italia, 488 GTB, F8 Tributo, 812 Superfast | Published weight is very probably for a car with lightweight options |
| Ferrari Enzo | Three different kerb weights; US model years not sourced |
| Ferrari LaFerrari | No agreed curb weight (four magazine figures, 1,410 to 1,430 kg) |
| Lamborghini Huracán LP 610-4, Aventador LP 700-4, Murciélago LP 640, Gallardo LP 560-4 | Dry weight only; production years |
| McLaren 570S | Dry weight only |
| McLaren F1 | Power disputed (627 or 618 hp); years disputed |
| Audi R8 V10 (Type 42) | No US power or weight |
| Audi RS3 (8V) | No weight; 2017–2018 rating not confirmed |
| Lotus Evora GT | Weight only with all lightweight options |
| Lotus Emira V6 | Failed the independent check (weight not tied to the year; power ambiguous; wrong market) |
| Aston Martin Vantage (2018 on) | Dry weight only |
| Aston Martin DBS Superleggera | Dry weight only |
| Ford Focus RS (Mk3) | One outlet gives 3,459 lb; a second is needed |
| Jaguar F-Type R (2016–2020) | Brochure does not print its model year; weight row not labelled curb |
| Jaguar F-Type R (2015) | Weight from one outlet; rear-wheel drive not stated for the R |

Everything confirmed for each car, with quotes and links, is in `data/held/held-cars.json`.
Complete draft records are stored for the five Ferraris, the Emira and the F-Type R.

## Decisions taken

- **F-Type R split by year range.** The R was rear-wheel drive for 2015, all-wheel drive from 2016
  and 575 hp from 2021. Only the 2021–2024 car has a dated manufacturer source for both figures.
- **McLaren 720S power standard** is DIN PS: McLaren's rating is 720 PS, printed as 710 bhp.

## Follow-up, 2 October: weight rule widened, 12 more cars

The owner approved two new steps in the weight order (docs/DATA_GUIDE.md, "Weight"): step 3, a
curb weight for a car with lightweight options, and step 4, a dry weight, shown as "(dry)" in the
game. Each is used only when nothing from an earlier step exists. The database is at 81 cars, with
24 entries left in `data/held/`.

| Car | Years | Power | Weight | Step |
|---|---|---|---|---|
| Ferrari 458 Italia | 2010–2015 | 562 hp | 3,274 lb | 3 (optioned curb) |
| Ferrari 488 GTB | 2016–2019 | 661 hp | 3,252 lb | 3 |
| Ferrari F8 Tributo | 2020–2023 | 710 hp | 3,164 lb | 3 |
| Ferrari 812 Superfast | 2018–2021 | 789 hp | 3,594 lb | 3 (flagged: last model year) |
| Lamborghini Huracán LP 610-4 | 2015–2019 | 602 hp | 3,135 lb dry | 4 |
| Lamborghini Aventador LP 700-4 | 2012–2017 | 690 hp | 3,472 lb dry | 4 |
| Lamborghini Murciélago LP 640 | 2007–2010 | 631 hp | 3,671 lb dry | 4 |
| Lamborghini Gallardo LP 560-4 | 2009–2014 | 552 hp | 3,109 lb dry | 4 |
| McLaren 570S | 2016–2020 | 562 hp | 2,895 lb dry | 4 |
| Aston Martin Vantage (2019–2023) | 2019–2023 | 503 hp | 3,373 lb dry | 4 |
| Aston Martin DBS Superleggera | 2019–2021 | 715 hp | 3,732 lb dry | 4 |
| Lotus Evora GT | 2020–2021 | 416 hp | 3,175 lb | 1 (Lotus kerb weight, found on a second look) |

- Power and weight for every car were re-opened by an independent checker; all were found on the
  cited pages. The Evora GT's Lotus table ("Wet / kerb weight") was confirmed on Motor1's
  reproduction of the release.
- US model years for the Lamborghinis, the 570S and the Aston Martins rest on KBB or Edmunds
  year listings (allowed as a last resort for production years).
- The 911 GT3 RS (991.2) review flag is cleared: its Weissach Package weight is now step 3.
- The Vantage is named with its years because the 2025 car (656 hp) will be a separate record.
- Still held for other reasons: Enzo, LaFerrari, McLaren F1, Audi R8 V10, Audi RS3, Lotus Emira
  V6, Ford Focus RS, Jaguar F-Type R (2015) and (2016–2020).
