/**
 * The spoiler-free summary a player shares after a daily puzzle: the date, how
 * many clues it took, and one square per turn. It never names the car.
 *
 *   ChassisCode · October 2, 2026
 *   Solved on clue 4/13
 *   🟥⬛🟥🟩
 *
 * 🟥 wrong guess, ⬛ skipped clue, 🟩 solved, ❌ not solved.
 */

import type { GameView } from './game-types';

export function shareText(game: GameView, dateLabel: string, url?: string): string {
  const result = game.result;
  if (!result) return '';
  const total = game.clueLabels.length;
  const squares = game.turns.map((t) => (t.carId ? '🟥' : '⬛')).join('') + (result.solved ? '🟩' : '❌');
  const line = result.solved ? `Solved on clue ${result.cluesUsed}/${total}` : `Not solved (${total}/${total} clues)`;
  return [`ChassisCode · ${dateLabel}`, line, squares, url].filter(Boolean).join('\n');
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
