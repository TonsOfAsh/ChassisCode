# Batch 7 report

Researched 3 October 2026: 25 cars across performance trucks and SUVs, European SUVs, EVs and
1990s–2000s classics. 9 added, 16 held back. The database is at 134 cars, with 47 entries in
`data/held/`. No search or fetch limit was reached.

New in the data guide: performance SUVs, pickups and EVs are in scope; a `Pickup` body type;
the maximum advertised rating is used for cars with overboost or boost modes; and a weight table
labelled as estimates does not count.

## Added (9)

| Car | Years | Power | Weight | Notes |
|---|---|---|---|---|
| Ram 1500 TRX | 2021–2024 | 702 hp | 6,350 lb | Ram spec sheet. The 2027 SRT TRX (777 hp) would be its own record |
| Ford Mustang Shelby GT500 (S197, 2013–2014) | 2013–2014 | 662 hp | 3,852 lb | Confidence medium: Ford's figure is not labelled curb |
| Porsche Cayenne Turbo (E3) | 2019–2023 | 541 hp | 4,795 lb | Porsche US technical data |
| Mercedes-AMG G 63 (W463) | 2019– | 577 hp | 5,842 lb | MBUSA 2019 specifications |
| BMW X5 M (F85) | 2015–2018 | 567 hp | 5,260 lb | BMW NA technical data |
| Lucid Air Sapphire | 2024– | 1,234 hp | 5,336 lb | Lucid's US figure (numerically PS, as for the 918) |
| Hyundai Ioniq 5 N (NE) | 2025– | 641 hp | 4,861 lb | 601 hp without N Grin Boost |
| Acura RSX Type-S (DC5) | 2002–2006 | 200 hp | 2,778 lb | Reference year 2003 |
| Ford Mustang SVT Cobra (SN95, 2003–2004) | 2003–2004 | 390 hp | 3,665 lb | Reference year 2004 (2003 brochure would not load) |

Each record was checked by an independent agent. Corrections after the check: the Ioniq 5 N's
reference year moved to 2025 (Hyundai's 2025 spec sheet was found); the GT500's confidence was
lowered; the TRX and Lucid notes were extended.

## Held back (16)

Trackhawk and Durango SRT Hellcat (weights labelled estimates); F-150 Raptor and Bronco Raptor;
Lamborghini Urus, Audi RS Q8, Aston Martin DBX; Tesla Model S Plaid and Model 3 Performance, Audi
RS e-tron GT, Rivian R1T; Corvette ZR-1 (C4), 300ZX Twin Turbo, 911 Carrera (993), 3000GT VR-4,
MR2 Turbo. What each one needs is in `data/held/held-cars.json`.

## Follow-up, 3 October 2026

Ford Bronco Raptor added (2022–, 418 hp, 5,733 lb). Power: the owner read 418 hp on ford.com for the
2026 model; the 2022 rating was announced by Ford (Motor1). Weight: Ford's 2022 technical
specifications, not labelled estimated. 135 cars, 46 held.
Jeep Grand Cherokee Trackhawk (WK2, 707 hp, 5,356 lb) and Ford Focus RS (Mk3, 350 hp, 3,434 lb) added from
Car and Driver specification sections read by the owner. 137 cars, 44 held.
