# Phase 1 findings

Generated from the 26-car test dataset on 2026-09-30. Updated 2026-10-01 after the GT3 Touring merge (25 cars).

## Dataset

| Car | Years | Power | Weight | Basis | Confidence | Review |
|---|---|---|---|---|---|---|
| Acura NSX (NC1) | 2016–2021 | 573 hp | 3,941 lb | US 2017 | medium | yes |
| Audi RS6 Avant (C8) | 2019–2025 | 591 hp | 4,960 lb | US 2021 | medium | yes |
| BMW M3 (E46) | 2000–2006 | 333 hp | 3,415 lb | US 2002 | high |  |
| BMW M3 Competition (G80) | 2020–present | 503 hp | 3,890 lb | US 2021 | high |  |
| BMW M3 CSL (E46) | 2002–2004 | 355 hp | 3,053 lb | EU 2003 | medium | yes |
| Bugatti Chiron | 2016–2024 | 1479 hp | 4,400 lb | US 2018 | medium |  |
| Cadillac CT5-V Blackwing | 2021–present | 668 hp | 4,123 lb | US 2022 | medium |  |
| Chevrolet Corvette Z06 (C8) | 2022–present | 670 hp | 3,500 lb (dry) | US 2023 | medium | yes |
| Dodge Challenger SRT Hellcat | 2014–2023 | 707 hp | 4,449 lb | US 2015 | high |  |
| Dodge Viper ACR (VX) | 2015–2017 | 645 hp | 3,374 lb | US 2016 | medium |  |
| Ferrari F40 | 1987–1992 | 471 hp | 2,425 lb (dry) | EU 1987 | medium | yes |
| Honda Civic Type R (EK9) | 1997–2000 | 182 hp | 2,359 lb | JP 1997 | medium |  |
| Honda Civic Type R (FK8) | 2017–2021 | 306 hp | 3,117 lb | US 2017 | high |  |
| Honda S2000 (AP1) | 1999–2003 | 240 hp | 2,809 lb | US 2000 | medium | yes |
| Lexus LFA | 2010–2012 | 552 hp | 3,263 lb | US 2012 | medium |  |
| Lotus Elise (Series 2) | 2001–2010 | 190 hp | 1,975 lb | US 2005 | low | yes |
| Mazda MX-5 Miata 1.6 (NA) | 1989–1993 | 116 hp | 2,116 lb | US 1990 | high |  |
| Mazda RX-7 (FD) | 1991–2002 | 255 hp | 2,789 lb | US 1993 | medium |  |
| Nissan Skyline GT-R V-Spec (R34) | 1999–2000 | 276 hp | 3,439 lb | JP 1999 | medium |  |
| Porsche 911 GT3 (991.1) | 2013–2016 | 475 hp | 3,153 lb | US 2014 | high | yes |
| Porsche 911 GT3 (991.2) | 2017–2019 | 500 hp | 3,116 lb | US 2018 | high |  |
| Porsche 911 GT3 (992.1) | 2021–2024 | 502 hp | 3,126 lb | US 2022 | high |  |
| Porsche 911 GT3 RS (991.2) | 2018–2019 | 520 hp | 3,153 lb | US 2019 | low | yes |
| Porsche 918 Spyder | 2013–2015 | 887 hp | 3,691 lb | US 2015 | medium | yes |
| Porsche Taycan Turbo S (J1) | 2019–2024 | 750 hp | 5,121 lb | US 2020 | medium |  |

## Records awaiting review

### Acura NSX (NC1)

Weight: Acura published both 3,941 lb (spec sheet, 'standard specifications') and 3,803 lb (press kit, 'without options') for the 2017 car; 3,941 was chosen but a human should confirm which figure the game should use. Production end year 2021 for the standard car is inferred from Acura's statement that every 2022 NSX is a Type S, not from a stated last-build date. Body style 'Coupe' rests on a publication's classification, not on Acura's wording.

### Audi RS6 Avant (C8)

Production end year (2025) is weakly sourced: it rests only on audi.com labelling the C8 model 'Audi RS 6 Avant (until 2025)'. No source was found for when the standard 600 PS / 591 hp car specifically stopped being built (the performance and GT continued to the end of the generation), and the last US model year of the standard car (2023) is inferred from KBB listing 591 hp for 2023 and a duPont Registry review saying the performance arrived for 2024. Curb weight comes from publications, not from an Audi of America document.

### BMW M3 CSL (E46)

Production years: BMW Group Classic says 09/2002 - 01/2004, but series production for customers is widely given as 2003 only; decide whether the clue should read 2002-2004 or 2003-2004/2003. Drivetrain (RWD) is not stated in words by any page opened for this car; it is taken from the press kit's single final drive and the standard E46 M3's 'rear drive' layout.

### Chevrolet Corvette Z06 (C8)

Weight is a manufacturer DRY weight (3,500 lb base coupe) because Chevrolet publishes no curb weight for the Z06; per the data guide this requires review. A real curb weight will be higher (CorvetteBlogger derives about 3,721 lb for the coupe from EPA data; that discrepancy is left unresolved); a reviewer should look for a manufacturer curb figure or decide whether a publication figure is acceptable. The 2023 dry weight is cited from GM Authority's reprint of GM's spec table (chevrolet.com confirms the same figure for the 2027 model). Production start 2022 rests on Chevrolet's announced plan, not a start-of-production report.

### Ferrari F40

1) Weight is a DRY weight (1,100 kg): no manufacturer curb weight was found, so per the guide the dry figure is used and the record flagged. A curb weight would be higher. 2) Market: the F40 was sold in the US, so the guide would want US figures, but no trustworthy US-spec manufacturer figures could be opened (Car and Driver, Road & Track and MotorTrend were not reachable; Hagerty claims 515 hp for US cars and Silodrome lists 478 bhp and 3,018 lb, neither attributed to Ferrari). EU spec was used instead. A period US road-test spec panel should be checked. 3) The ferrari.com page could only be read as article text: it states '478bhp' but the kW/cv figures and any weight in its specification table could not be retrieved, and the automobile-catalog page was cited from its search-result title only (the page itself refused the fetch).

### Honda S2000 (AP1)

Production years: the guide asks for years built 'for all markets', but AP1 ends at different times by market (US 2.0-litre cars through model year 2003; Japan kept the 2.0-litre AP1 until November 2005; European timing was not researched). 1999-2003 follows the US basis of this record - confirm that is the intended definition, and align the AP2 record with it. Also, the exact month the last US-spec 2.0-litre car was built was not found (2003 is inferred from the October 2003 announcement of the 2004 model). Power and weight are from Honda's 2001 sheet, corroborated for 2000 by a publication, because no Honda sheet for model year 2000 was found.

### Lotus Elise (Series 2)

The Series 2 probably needs splitting into several records: it ran from 2001 with Rover K-series engines (5-speed; e.g. the 134 hp Sport 135 per PistonHeads), switched to Toyota engines in 2004 (111R / US Elise, 6-speed) and later included a supercharged SC model (mentioned by Magneto). This record describes only the US-market 2005 Elise (Toyota 2ZZ-GE, 190 hp), while the production years cover the whole Series 2. Also: curb weight relies on databases (Edmunds, Cars.com) because no Lotus document or publication spec panel with an exact US figure could be opened; production years are not confirmed by a Lotus source and the sources disagree (2001/2002 start, 2009/2010 end).

### Porsche 911 GT3 (991.1)

Production end year is uncertain: 2016 is the last model year (Stuttcars); another source says 2015. Need a manufacturer or major-publication statement of the last calendar year the 991.1 GT3 was built. Power and weight are manufacturer US figures and are not in doubt.

### Porsche 911 GT3 RS (991.2)

Weight: 3,153 lb is the only curb weight Porsche publishes for the US car, but Porsche's own press releases tie it to the optional Weissach Package plus magnesium wheels. The standard-configuration curb weight (probably about 38 lb more) needs a manufacturer source.

### Porsche 918 Spyder

Curb weight (3,691 lb) comes from Edmunds and duPont Registry, not a Porsche document: no Porsche Cars North America spec sheet could be opened. The only manufacturer weight found (1,634 kg DIN) does not say whether it includes the Weissach package. Confirm against a PCNA MY2015 spec sheet. Also note the US '887 hp' is numerically the PS figure (652 kW), recorded here as the US published rating.

## Open design questions

### 1. The 992.1 GT3 and GT3 Touring could not be told apart (resolved)

Porsche publishes identical power, weight, engine, transmissions and years for both, so all 13
clues matched. The Touring is officially "911 GT3 with Touring Package", a no-cost option.

Decision (2026-10-01): the Touring was merged into the 992.1 GT3 record and kept as a search
alias. The dataset is now 25 cars.

### 2. Cars become unique very early in a small test set

On average a car is the only match after 3.6 clues, and several are unique on clue 1 because
they are the only car from their country. This is a property of the small test set, not the clue
order. It should be re-measured at 100+ cars before the order is tuned.

### 3. Weight is the least reliable field

Manufacturers publish it inconsistently: dry only (Corvette Z06, F40), only with a lightweight
option package (991.2 GT3 RS, Viper ACR), or two different figures in two documents (NSX).
Most of the review flags involve weight. Because weight is a late clue, a wrong figure
rarely decides a game, but each flagged value needs a human decision before launch.

### 4. The Elise Series 2 needs splitting

It covers Rover-engined, Toyota-engined and supercharged cars. The current record describes only
the US-market 2005 car.

### 5. How the specs were checked

Every figure was read from the cited page through a fetch tool that summarises pages, because
direct downloads were blocked and Car and Driver, Road & Track and MotorTrend could not be opened.
Six manufacturer sources were re-fetched afterwards and their power and weight figures matched
the records (991.2 GT3, G80 M3 Competition, FK8 Civic Type R, NA Miata, CT5-V Blackwing, LFA).
The other twenty have not had a second check.
