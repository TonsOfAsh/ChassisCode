import { NextResponse } from 'next/server';
import { DEFAULT_MODE, isMode, type ApiError, type GameView } from '@/lib/game-types';
import { GameError, newGame } from '@/lib/server/game';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse<GameView | ApiError>> {
  const body = (await request.json().catch(() => ({}))) as { exclude?: unknown; mode?: unknown };
  const exclude = Array.isArray(body.exclude) ? body.exclude.filter((x): x is string => typeof x === 'string') : [];
  try {
    return NextResponse.json(newGame(isMode(body.mode) ? body.mode : DEFAULT_MODE, exclude));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
