# ChassisCode

An automotive deduction game. The player sees one specification of a mystery car, guesses the
exact car, and gets another specification after each wrong guess.

## Status

Phases 1 and 2 of 8 are done, and the database is at 62 cars: the sourced vehicle data and a playable game in Unlimited mode
(random car, clue-by-clue reveal, car search, win and loss summary).

## Guess comparison

The most recent wrong guess is shown in a column beside the mystery car with its own value for
every clue revealed so far: green where it matches the mystery car, red where it does not.
The next guess replaces it. When the round is over, each guessed car in the guess list has a
"Show stats" button that puts its full stats in that column, one car at a time.
A value is green only when it is exactly the same, so "Coupe" against "Coupe / Convertible" is red.

## Difficulty

Eleven clues are sorted into three tiers by how much they help a typical player:

| Tier | Clues |
|---|---|
| Easy | Manufacturer, Engine, Country |
| Medium | Drivetrain, Aspiration, Power, Displacement |
| Hard | Transmission, Fuel, Body, Weight |

Easy mode reveals the easy tier first, then medium, then hard. Hard mode reverses that.
Normal mode mixes all eleven. The order within a tier is random each game, except that Country always comes before Manufacturer. Model is always
clue 12 and Generation always clue 13. The tiers live in `src/config/clues.ts`.

One exception, for near-twins. Some cars share a manufacturer and model with another car and differ
from it in a single clue (the R35 GT-R year ranges differ only in power; weight is not counted). When
one of them is the answer, that clue is brought forward: to clue 1 or 2 in Normal and Hard, and to
clue 4, straight after the easy tier, in Easy. Otherwise a player who had worked out the model would
have to guess between the twins. The game works this out from the data; `npm run clue-report` lists
the cars affected.

Still to come: the full results screen with car image and share button, the daily puzzle,
statistics and streaks, and a larger database.

## Play it on your computer

Requires Node.js 20 or newer.

    npm install
    npm run dev

Then open http://localhost:3000 in a browser. Stop the server with Ctrl+C.

## Other commands

    npm run validate      # check every vehicle record
    npm run clue-report   # how quickly each car becomes identifiable under the clue order
    npm run build         # production build

`npm run validate -- --strict` also fails on warnings.

## How the answer stays hidden

The browser never receives the answer or any unrevealed spec. The server picks the car and sends
back only the clues revealed so far, plus an encrypted token holding the game state. Each guess
sends the token back; the server replies with the next clue or the full car.

The token is encrypted with `GAME_SECRET`. `npm run dev` uses a built-in development secret.
A production deployment must set `GAME_SECRET` (see `.env.example`) or the game API refuses to run.

Known limit: a token can be replayed, so a determined player can retry guesses against the same
clue. That only cheats their own Unlimited game. The daily puzzle (Phase 6) will need to address it.

## Layout

| Path | Contents |
|---|---|
| `data/vehicles/<manufacturer>/<id>.json` | One sourced record per vehicle |
| `src/lib/schema.ts` | The vehicle schema (Zod) |
| `src/lib/vocab.ts` | Controlled vocabularies |
| `src/config/clues.ts` | Clue definitions and clue order |
| `src/lib/server/` | Server-only code: vehicle database, game rules, token encryption |
| `src/app/api/game/` | The two game endpoints: `new` and `guess` |
| `src/components/` | The game screen: clue plate, car search, result |
| `src/app/globals.css` | All styles |
| `scripts/validate.ts` | Data validator |
| `scripts/clue-report.ts` | Clue-order balance report |
| `scripts/build-data.ts` | Bundles the vehicle records for the app (runs automatically) |
| `docs/DATA_GUIDE.md` | Inclusion rules, field rules and sourcing rules |
| `docs/PHASE1_FINDINGS.md` | Open questions and records awaiting review |
| `data/held/` | Cars researched but held back from the game, with what each is missing |
| `docs/BATCH1_REPORT.md`, `docs/BATCH2_REPORT.md` | Each 25-car expansion: what was added, what was held back and why |
