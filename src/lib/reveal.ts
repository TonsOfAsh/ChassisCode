import { CLUES, FINAL_CLUES, type ClueId } from '@/config/clues';
import type { Mode, TurnValue } from './game-types';
import type { Vehicle } from './schema';

/**
 * How a game reveals its clues. Pure functions, shared by the server and the
 * balance scripts. Nothing here is sent to the browser.
 *
 * Two rule sets:
 * - "reveal" (Easy and Normal, and so the Daily): a wrong guess reveals every
 *   spec it got right, then the next clue in the game's order that is still
 *   hidden. Model and generation are the endgame: the schedule never deals
 *   them, a guess with the answer's model reveals the model, and a guess with
 *   its model AND generation reveals both. Otherwise they appear only when
 *   the round ends (solved, out of turns, or given up).
 * - "classic" (Hard): a wrong guess or a skip reveals only the next clue, and
 *   the schedule never deals model or generation, so there they show only
 *   when the round ends.
 *
 * No hints mode plays by the reveal rules, except that a wrong guess deals no
 * clue from the schedule: it reveals only the specs it gets right. A skip
 * still deals the next clue, so hints cost a turn (see freeClue).
 *
 * Under both, a round allows as many turns as there are clues (13), and the
 * score counts turns, not clues showing.
 */

export type Rules = 'reveal' | 'classic';

export function rulesFor(mode: Mode): Rules {
  return mode === 'hard' ? 'classic' : 'reveal';
}

/** False in No hints mode: a wrong guess deals no clue from the schedule, only a skip does. */
export function freeClue(mode: Mode): boolean {
  return mode !== 'nohints';
}

const FINAL: readonly ClueId[] = FINAL_CLUES;

/** Clues compared as numbers, so a miss can say whether the answer is higher or lower. */
const NUMERIC: Partial<Record<ClueId, (v: Vehicle) => number | null>> = {
  power: (v) => v.powerHp.value,
  weight: (v) => v.weightLb.value,
  displacement: (v) => v.engine.displacementL.value,
};

/** Clues that can list several values; sharing some of them is a partial match. */
const LISTS: Partial<Record<ClueId, (v: Vehicle) => readonly string[]>> = {
  body: (v) => v.body.value,
  transmission: (v) => v.transmission.value,
};

export function matches(id: ClueId, guess: Vehicle, answer: Vehicle): boolean {
  return CLUES[id].format(guess) === CLUES[id].format(answer);
}

/** How many of the specs other than model and generation the guess has right. */
export function rightCount(guess: Vehicle, answer: Vehicle): number {
  return (Object.keys(CLUES) as ClueId[]).filter((id) => !FINAL.includes(id) && matches(id, guess, answer)).length;
}

export interface TurnReveal {
  /** Clues this turn revealed because the guess matched them. */
  matched: ClueId[];
  /** The scheduled clue this turn revealed, if one was still hidden. */
  next: ClueId | null;
}

export interface Progress {
  /** Every clue showing, in no particular order. */
  shown: Set<ClueId>;
  /** What each turn revealed, one entry per turn. */
  turns: TurnReveal[];
}

/**
 * Replays a game's turns and works out which clues are showing. `guesses` are
 * the wrong guesses and skips (null) in order; a correct guess ends the game
 * and is never in this list. With `free` false (No hints) only skips deal a
 * clue from the schedule.
 */
export function progress(
  rules: Rules,
  order: readonly ClueId[],
  answer: Vehicle,
  guesses: readonly (Vehicle | null)[],
  free = true,
): Progress {
  const shown = new Set<ClueId>(order.slice(0, 1));
  const turns: TurnReveal[] = [];
  for (const [t, guess] of guesses.entries()) {
    const matched: ClueId[] = [];
    if (rules === 'reveal' && guess) {
      for (const id of order) {
        if (shown.has(id)) continue;
        // Specs are revealed by matching them. Model needs the guess to share the
        // answer's model; generation needs it to share the model AND the generation.
        const unlocked = !FINAL.includes(id)
          ? matches(id, guess, answer)
          : matches('model', guess, answer) && (id === 'model' || matches('generation', guess, answer));
        if (unlocked) {
          shown.add(id);
          matched.push(id);
        }
      }
    }
    // The schedule only ever deals the specs: model and generation are the endgame
    // and are never dealt, in either rule set.
    const due = guess && !free ? undefined : order.find((id) => !shown.has(id) && !FINAL.includes(id));
    const next = due ?? null;
    if (next) shown.add(next);
    turns.push({ matched, next });
  }
  return { shown, turns };
}

/**
 * A guessed car's value for each clue, as shown beside the mystery car.
 * A clue still hidden is compared only where the rules allow it:
 * - classic: never (nothing about a hidden clue is given away);
 * - reveal: everything but model and generation. A miss on a number says
 *   whether the answer is higher or lower, and a list that shares some values
 *   is a partial match.
 */
export function compare(
  rules: Rules,
  order: readonly ClueId[],
  shown: ReadonlySet<ClueId>,
  guess: Vehicle,
  answer: Vehicle,
): (TurnValue | null)[] {
  return order.map((id) => {
    const value = CLUES[id].format(guess);
    const match = value === CLUES[id].format(answer);
    if (shown.has(id)) return { value, match };
    if (rules === 'classic' || FINAL.includes(id)) return null;
    const num = NUMERIC[id];
    if (num) {
      const g = num(guess);
      const a = num(answer);
      if (g !== null && a !== null && g !== a) return { value, match: false, hint: a > g ? 'higher' : 'lower' };
      return { value, match: false };
    }
    const list = LISTS[id];
    if (list) {
      const a = new Set(list(answer));
      if (list(guess).some((x) => a.has(x))) return { value, match: false, hint: 'partial' };
    }
    return { value, match: false };
  });
}
