# ChassisCode

An automotive deduction game. The player sees one specification of a mystery car, guesses the
exact car, and gets another specification after each wrong guess.

## Status

The database is at 158 cars. The game has a Daily puzzle and an Unlimited mode, a car search, a
guess comparison, and statistics and streaks kept on the player's device.

## Daily and Unlimited

- **Daily** (the default) is one car per day, the same car and the same clue order for every player
  on every device. It is always Normal difficulty. A new car starts at midnight Pacific time
  (America/Los_Angeles, so PST in winter and PDT in summer). Progress is saved on the device, so
  reloading the page continues the game, and a finished daily stays finished until the next one.
  The car and clue order come from the date and `GAME_SECRET`, so every server with the same secret
  gives the same puzzle and nobody can work it out from the code. Cars are dealt in rounds with no
  repeat until every daily-eligible car has been used. Adding cars reshuffles the round, so new cars
  should go live just after midnight Pacific. Puzzle #1 was 1 October 2026.
- **Unlimited** is a random car each round, in Easy, Normal or Hard. Enter starts the next round.
- **Stats** (button at the top): daily games played, win %, current and best streak, and which clue
  each daily was solved on; Unlimited played, win % and average clues per difficulty. They are kept
  in the browser's storage on this device only, until accounts exist. A loss or a missed day ends a
  streak.
- **Share** (after the daily): copies a spoiler-free result, or opens the phone's share sheet:
  the date, the clue it was solved on, and one square per turn (🟥 wrong guess, ⬛ skip, 🟩 solved,
  ❌ not solved). It never names the car.
- **How to play** opens by itself on a device's first visit, and from the "?" button after that.

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

One exception, for near-twins: cars of any make or model whose clues (other than model and
generation) differ in only one or two places. Weight is not counted unless it is the only
difference. Without this, a player who had narrowed it down would be guessing until the deciding
clue happened to come up (the Cayman GT4 and the 911 GT3 differ only in power).

- One clue apart: that clue is revealed first or second in Normal, and fourth, straight after the
  easy tier, in Easy.
- Two clues apart: one of them (the one that tells apart the most twins, power on a tie) is revealed
  within the first four, or fourth or fifth in Easy.
- Hard keeps its least-telling-first order: the deciding clue moves only to the front of its own
  tier. A deciding manufacturer (Scion FR-S and Subaru BRZ) still comes after every hard and medium
  clue, just at the start of the easy ones.

The game works this out from the data; `npm run clue-report` lists the cars affected.

Still to come: car images, accounts, and a larger database.

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
