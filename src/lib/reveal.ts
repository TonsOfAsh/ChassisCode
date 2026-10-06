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
 *   hidden. Model and generation are never revealed by a match, and they come
 *   on the same turns as in the classic rules (11th and 12th wrong turns), so
 *   a turn may reveal nothing new once the other specs are all showing.
 * - "classic" (Hard): a wrong guess or a skip reveals only the next clue.
 *
 * Under both, a round allows as many turns as there are clues (13), and the
 * score counts turns, not clues showing.
 */

export type Rules = 'reveal' | 'classic';

export function rulesFor(mode: Mode): Rules {
  return mode === 'hard' ? 'classic' : 'reveal';
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
 * and is never in this list.
 */
export function progress(rules: Rules, order: readonly ClueId[], answer: Vehicle, guesses: readonly (Vehicle | null)[]): Progress {
  const shown = new Set<ClueId>(order.slice(0, 1));
  const turns: TurnReveal[] = [];
  for (const [t, guess] of guesses.entries()) {
    const matched: ClueId[] = [];
    if (rules === 'reveal' && guess) {
      for (const id of order) {
        if (!shown.has(id) && !FINAL.includes(id) && matches(id, guess, answer)) {
          shown.add(id);
          matched.push(id);
        }
      }
    }
    // Model and generation keep their classic turns (the 11th and 12th wrong turns in a
    // 13-clue game) however fast the other specs come out: a turn reveals the clue at
    // position i of the order no earlier than the i-th turn.
    const due = order.find((id) => !shown.has(id));
    const next = due && (!FINAL.includes(due) || t + 1 >= order.indexOf(due)) ? due : null;
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
