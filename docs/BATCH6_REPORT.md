# Batch 6 report

Researched 2 October 2026: 25 cars. 19 added, 6 held back (123 cars, 32 held). See the follow-up below: 125 cars, 31 held. No search or fetch limit was reached.

## Added (19)

| Car | Years | Power | Weight | Notes |
|---|---|---|---|---|
| Porsche 718 Cayman S (982) | 2017–2025 | 350 hp | 2,988 lb | Porsche "unladen weight per DIN", manual |
| Porsche Boxster S (981) | 2013–2016 | 315 hp | 2,910 lb | |
| Porsche Cayman GTS (981) | 2015–2016 | 340 hp | 2,965 lb | Porsche gives min/max; the minimum is used |
| Porsche 911 Carrera (991.1) | 2012–2016 | 350 hp | 3,042 lb | |
| Porsche 911 Turbo (997.2) | 2010–2013 | 500 hp | 3,461 lb | |
| BMW M3 (G80) | 2021– | 473 hp | 3,840 lb | Base M3, 6-speed manual |
| BMW M5 (F90) | 2018–2023 | 600 hp | 4,370 lb | |
| Mercedes-AMG C 63 S (W205) | 2015–2021 | 503 hp | 3,935 lb | Flagged: sedan only; end year from a database |
| Mercedes-AMG GT (C190) | 2017–2021 | 469 hp | 3,560 lb | Flagged: 523 hp for 2021 not from Mercedes |
| Audi RS5 (B9) | 2018–2024 | 444 hp | 3,968 lb | Flagged: end year inferred |
| Acura TLX Type S (2nd gen) | 2021–2025 | 355 hp | 4,221 lb | |
| Infiniti Q60 Red Sport 400 (2nd gen) | 2017–2022 | 400 hp | 3,882 lb | Reference year 2020 (2017 kit gives kg only) |
| Lexus IS F | 2008–2014 | 416 hp | 3,780 lb | Reference year 2010 (Lexus 2010 US IS brochure) |
| Mazda MX-5 Miata (NB) | 1999–2005 | 142 hp | 2,387 lb | 140 hp for 1999–2000 |
| Mazda MX-5 Miata (NC) | 2006–2015 | 167 hp | 2,480 lb | 170 hp for 2006–2008 |
| Mazda Mazdaspeed3 (2nd gen) | 2010–2013 | 263 hp | 3,245 lb | Weight step 2; confidence medium |
| Honda Civic Si (10th gen) | 2017–2020 | 205 hp | 2,889 lb | Coupe weight; the sedan is 2,906 lb |
| Chevrolet Corvette ZR1 (C7) | 2019 | 755 hp | 3,524 lb | Flagged: GM table introduced as preliminary; one model year only |
| Chevrolet Camaro Z/28 (5th gen) | 2014–2015 | 505 hp | 3,820 lb | |

Each record was researched by one agent and re-checked by an independent one. Corrections after the
check: the IS F's reference year moved to 2010, where Lexus's US IS brochure gives the same weight;
a 997.2 Turbo source was retyped as a publication; the ZR1 was flagged for review.

## Held back (6)

| Car | What is missing |
|---|---|
| Mazda RX-8 | Mazda publishes only "curb weight with popular options"; a decision is needed |
| Lexus RC F | A curb weight for 2020 or later (472 hp years) |
| Lexus GS F | Any US curb weight |
| Chevrolet SS | Any qualifying curb weight |
| Cadillac ATS-V | A final curb weight (GM's is "est.") |
| Ford Mustang Boss 302 (S197) | A final curb weight (Ford's is "est.") |

## Clue order

The Camaro Z/28 and Corvette Z06 (C6) share the LS7 engine and 505 hp and differ only in weight, so
weight comes first or second for them. When the manufacturer is brought forward as one of the first
four clues (Infiniti Q60 and Nissan Z), the country comes with it.

## Follow-up, 3 October 2026

The owner accepted all three open decisions, each labelled in a new field,
`specBasis.weightQualifier` (see the data guide).

- **Mazda RX-8 added** (2004–2011, 232 hp, 3,045 lb, reference year 2007), labelled
  `popular-options`. The independent check found Mazda's US specification decks (2007–2009), which
  give "Curb Weight, Federal Spec" with exactly the figures the brochures call "with popular
  options". The deck is now the source; the label stays because Mazda calls the same number a
  popular-options weight.
- **Corvette ZR1 (C7)** kept, labelled `preliminary`, still flagged for review.
- **C 63 S split** into Mercedes-AMG C 63 S Sedan (W205, 2015–2021, 3,935 lb) and the new
  C 63 S Coupe (C205, 2017–2021, 503 hp, 4,096 lb from MBUSA's 2017 guide and 2018 sheet). Body
  is the clue that separates them, so it comes first or second when either is the answer. The
  sedan's id changed to `mercedes-amg-c-63-s-sedan-w205`. Both are flagged because their last year
  rests on Cars.com.
- Seven existing records whose weight is for a car with lightweight options were labelled
  `lightweight-options`: Ferrari 458, 488, 812, F8; Porsche 911 GT3 RS (991.2); McLaren 570S;
  Aston Martin Vantage (2019–2023). The DBS Superleggera was not, because only an enthusiast site
  says its dry weight is with lightweight options.

An independent checker confirmed every field of the Coupe and RX-8 records.
