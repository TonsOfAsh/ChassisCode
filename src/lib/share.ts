/**
 * The spoiler-free summary a player shares after a daily puzzle: the date, how
 * many turns it took, and one row per turn showing what that turn revealed.
 * It never names the car.
 *
 *   ChassisCode · October 5, 2026
 *   Solved in 4/13
 *   🟩🟩🟩⬜
 *   ⬜
 *   ⏭️
 *   🏁
 *
 * A guess row has 🟩 for each spec it got right and ⬜ for the next clue it
 * uncovered (🟥 if it uncovered nothing); ⏭️ is a skip; 🏁 solved, ❌ not.
 * Games under the classic rules (Hard) get a single row of squares instead.
 */

import type { GameView } from './game-types';

export function shareText(game: GameView, dateLabel: string, url?: string): string {
  const result = game.result;
  if (!result) return '';
  const max = game.maxTurns ?? game.clueLabels.length;
  const line = result.solved ? `Solved in ${result.cluesUsed}/${max}` : `Not solved (${max}/${max})`;
  let path: string;
  if (game.rules === 'reveal') {
    const rows = game.turns.map((t) => {
      if (!t.carId) return '⏭️';
      const r = t.revealed;
      const row = '🟩'.repeat(r?.matched.length ?? 0) + (r?.next ? '⬜' : '');
      return row || '🟥';
    });
    path = [...rows, result.solved ? '🏁' : '❌'].join('\n');
  } else {
    path = game.turns.map((t) => (t.carId ? '🟥' : '⬛')).join('') + (result.solved ? '🟩' : '❌');
  }
  return [`ChassisCode · ${dateLabel}`, line, path, url].filter(Boolean).join('\n');
}

/**
 * Shares through the device's share sheet where there is one (phones), and
 * otherwise copies to the clipboard. Returns what happened, for the button label.
 */
export async function shareResult(text: string): Promise<'shared' | 'copied' | 'failed'> {
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (coarse && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'failed';
      // Fall through to the clipboard.
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
