# Batch 15

Researched 28 October 2026: 16 well-known cars missing from the game. 13 added (5 normal, 8
provisional), 3 held. Every record was checked by an independent fact-checker and its findings
applied before merging. The database is at 394 cars (97 provisional, Unlimited only); 37 are held.

## Added

| Car | Status | hp | lb | Notes |
|---|---|---|---|---|
| Chevrolet Corvette (C5) | normal | 345 | 3,245 | GM release; reference year 1999 (first 345 hp year with a GM weight); 350 hp from 2001 in the note |
| Chevrolet Corvette (C6, 2008–2013) | normal | 430 | 3,217 | GM release; 2005–2007 LS2 cars not included |
| Honda Civic Si (8th gen) | normal | 197 | 2,877 | Honda specifications; end year from Honda's 2012 powertrain release |
| Porsche 911 Carrera S (997.1) | normal | 355 | 3,131 | Porsche US brochure (2007 model year by the host's label and an "available 11/06" footnote) |
| Porsche 928 S4 | normal | 316 | 3,505 | Owner's manual technical data, as transcribed on Rennlist; Excellence and Edmunds agree exactly; confidence medium |
| Ferrari F355 Berlinetta | provisional | 375 | 2,976 (dry) | First US model year unresolved (1995 or 1996); European dry weight; needs review |
| Porsche 911 Carrera 2 (964) | provisional | 247 | 3,031 | Power and weight from Excellence and Edmunds |
| Ford Mustang GT (SN95, 1999–2004) | provisional | 260 | 3,237 | Ford brochure power; database weight |
| Ford Mustang GT (S197, 2005–2010) | provisional | 300 | 3,450 | Covers 2005–2010: the 2010 car's 315 hp is a 5% change on the same engine, so no split (checker) |
| Dodge Challenger SRT8 392 | provisional | 470 | 4,170 | Dodge weight labelled "Est." |
| MINI Cooper S (R53) | provisional | 163 | 2,513 | MINI's "unladen" 2,678 lb includes a 75 kg driver (EU basis); 2,513 lb from KBB and Conceptcarz, matching MINI's gross weight minus payload |
| Subaru WRX (GD) | provisional | 227 | 3,085 | Covers 2002–2005 (same 2.0 engine through the facelift; KBB 2005 and 2006); weight from one named article and a database |
| Toyota GR Yaris (2020–2023) | provisional | 268 | 2,822 | Toyota figures (Japan); the original car's last build year is unconfirmed; needs review |

The five normal cars join the Daily from 30 October 2026; earlier puzzles are unchanged.

## Held (see data/held/held-cars.json)

- DeLorean DMC-12: weak weight sources disagree by 4.6%; no maker or major-magazine figure.
- Porsche 944 Turbo: no quotable US rating (sources print the EEC 220 bhp) and conflicting weights.
- Volkswagen Golf GTI (Mk5): weak weight sources disagree by 6.3%; no VW source.

## Also changed

`npm run daily-check` assumed the Daily pool never grows, so its no-repeat test split the schedule
into fixed blocks of the launch pool size. With cars joining after launch, a cycle is longer than
that and the test failed falsely. It now checks day by day that no car repeats until every car in
that day's pool has been used, and that each answer is in the pool on its day. Tested by breaking
the no-repeat rule on purpose (the check then fails) and restoring it.
