# Provisional pass, 3 October 2026

The owner agreed that held cars may enter as provisional records: Unlimited only, never a daily
answer, each labelled in the data (`provisional`, `provisionalNote`) with what its weak figures
rest on and what would replace them. Rules: docs/DATA_GUIDE.md, "Provisional records".

Five research agents went through the 49 held cars; four independent checkers then re-opened every
cited power and weight source. No power or weight figure was wrong. Corrections after the check:
misquotes fixed (Golf GTI and Golf R transmission, Lexus RC F, Lamborghini Urus), claims citing
pages that were not in the sources removed (Lexus GS F, Golf R, RS e-tron GT, E-Ray, BMW M3 E36),
the Viper's weight moved to its GTS-specific source, the SLS AMG limited to the coupe (the Roadster
was sold under its own name), the Lotus Emira made provisional (its weight is Lotus's
pre-production target), the McLaren F1's power marked provisional (627 PS or 627 bhp), and the RS 7
renamed RS7 Sportback to match the other Audi records.

Result:
- 40 cars added. 3 on proper sources: Audi RS3 (8V), Aston Martin DBX, Maserati MC20 (Evo's dry
  weight). 37 provisional.
- The Lotus Elise (Series 2), already in the game on database weights, was made provisional too.
- 9 still held because even the weak sources disagree by more than about 2%: BMW M3 (E30),
  Corvette ZR-1 (C4), Ford GT (1st gen), Cadillac ATS-V, Ferrari Enzo, Ferrari LaFerrari, Dodge
  Durango SRT Hellcat, Tesla Model 3 Performance, Rivian R1T Quad-Motor.

The database is at 198 cars: 160 can be daily answers, 38 are provisional. `npm run
provisional-report` rewrites docs/PROVISIONAL.md, the list of provisional and held cars.
