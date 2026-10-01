import { NextResponse } from 'next/server';
import type { ApiError, GameView } from '@/lib/game-types';
import { GameError, newGame } from '@/lib/server/game';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse<GameView | ApiError>> {
  const body = (await request.json().catch(() => ({}))) as { exclude?: unknown };
  const exclude = Array.isArray(body.exclude) ? body.exclude.filter((x): x is string => typeof x === 'string') : [];
  try {
    return NextResponse.json(newGame(exclude));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
