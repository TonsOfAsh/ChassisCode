import { NextResponse } from 'next/server';
import type { ApiError, GameView } from '@/lib/game-types';
import { GameError, playTurn } from '@/lib/server/game';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse<GameView | ApiError>> {
  const body = (await request.json().catch(() => null)) as { token?: unknown; carId?: unknown } | null;
  if (!body || typeof body.token !== 'string' || !(typeof body.carId === 'string' || body.carId === null)) {
    return NextResponse.json({ error: 'The request was not understood. Reload the page and try again.' }, { status: 400 });
  }
  try {
    return NextResponse.json(playTurn(body.token, body.carId));
  } catch (e) {
    if (e instanceof GameError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
