# Held-back cars

Cars that were researched but are not in the game, because one figure could not be sourced to the
rules in `docs/DATA_GUIDE.md`. The game and the validator only read `data/vehicles`, so nothing here
can appear as an answer or in the search box.

- `held-cars.json` lists each car, what is missing, everything that was confirmed (with quotes and
  links), and the candidate figures that were found but did not qualify.
- A car with a complete record has its own file here.

To release a car: find the missing figure from a qualifying source, write or finish its record,
move it to `data/vehicles/<manufacturer>/`, remove it from `held-cars.json`, and run
`npm run validate`.
