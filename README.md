# ChassisCode

An automotive deduction game. The player sees one specification of a mystery car, guesses the
exact car, and gets another specification after each wrong guess.

## Status

Phase 1 of 8: data schema, controlled vocabularies, validator and a 26-car test dataset.
The game itself (Next.js) comes in Phase 2.

## Setup

Requires Node.js 20 or newer.

    npm install
    npm run validate      # check every vehicle record
    npm run clue-report   # how quickly each car becomes identifiable under the clue order

`npm run validate -- --strict` also fails on warnings.

## Layout

| Path | Contents |
|---|---|
| `data/vehicles/<manufacturer>/<id>.json` | One sourced record per vehicle |
| `src/lib/schema.ts` | The vehicle schema (Zod) |
| `src/lib/vocab.ts` | Controlled vocabularies |
| `src/config/clues.ts` | Clue definitions and clue order |
| `scripts/validate.ts` | Data validator |
| `scripts/clue-report.ts` | Clue-order balance report |
| `docs/DATA_GUIDE.md` | Inclusion rules, field rules and sourcing rules |
| `docs/PHASE1_FINDINGS.md` | Open questions and records awaiting review |
