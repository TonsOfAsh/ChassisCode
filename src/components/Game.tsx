'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError, CarOption, GameView } from '@/lib/game-types';
import { CarSearch } from './CarSearch';
import { Plate } from './Plate';

/** How many recently played cars to keep out of the next random pick. */
const RECENT_LIMIT = 10;

async function post(url: string, body: unknown): Promise<GameView> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the game server. Check your connection and try again.');
  }
  const data = (await response.json().catch(() => null)) as GameView | ApiError | null;
  if (!response.ok || !data || 'error' in data) {
    throw new Error(data && 'error' in data ? data.error : 'The game server returned an error. Try again.');
  }
  return data;
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function Game({ cars }: { cars: CarOption[] }) {
  const [game, setGame] = useState<GameView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recent = useRef<string[]>([]);
  const started = useRef(false);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setGame(await post('/api/game/new', { exclude: recent.current }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  async function play(carId: string | null) {
    if (!game?.token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await post('/api/game/guess', { token: game.token, carId });
      if (next.result) recent.current = [next.result.carId, ...recent.current].slice(0, RECENT_LIMIT);
      setGame(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const playing = game?.status === 'playing';
  const onLastClue = !!game && game.clues.length === game.clueLabels.length;
  const result = game?.result;

  return (
    <main className="page">
      <header className="masthead">
        <h1 className="wordmark">ChassisCode</h1>
        <p className="mode">Unlimited</p>
      </header>
      <p className="intro">Name the exact car. Each wrong guess stamps another spec on the plate.</p>

      {game ? <Plate game={game} /> : <div className="plate plate-loading">{error ? '' : 'Picking a car…'}</div>}

      {error && (
        <p className="error" role="alert">
          {error}{' '}
          {!game && (
            <button type="button" className="link" onClick={() => void start()}>
              Try again
            </button>
          )}
        </p>
      )}

      {playing && game && (
        <div className="controls">
          <CarSearch
            cars={cars}
            excludedIds={game.turns.flatMap((t) => (t.carId ? [t.carId] : []))}
            disabled={busy}
            onGuess={(car) => void play(car.id)}
          />
          <button type="button" className="link" disabled={busy} onClick={() => void play(null)}>
            {onLastClue ? 'Give up and see the car' : 'Skip to the next clue'}
          </button>
        </div>
      )}

      {result && (
        <section className={`result ${result.solved ? 'result-solved' : 'result-lost'}`} aria-live="polite">
          <h2 className="result-heading">
            {result.solved
              ? `Solved in ${result.cluesUsed} ${result.cluesUsed === 1 ? 'clue' : 'clues'}`
              : 'Not solved this time'}
          </h2>
          <dl className="stats">
            <div>
              <dt>Score</dt>
              <dd>
                {result.score}/{game?.clueLabels.length}
              </dd>
            </div>
            <div>
              <dt>Guesses</dt>
              <dd>{result.guessCount}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatTime(result.elapsedMs)}</dd>
            </div>
          </dl>
          <button type="button" className="button" disabled={busy} onClick={() => void start()}>
            Play another car
          </button>
        </section>
      )}

      {game && game.turns.length > 0 && (
        <section className="turns" aria-label="Your guesses so far">
          <h2 className="turns-heading">Your guesses</h2>
          <ol>
            {game.turns.map((turn, i) => (
              <li key={i} className={turn.carId ? 'turn-wrong' : 'turn-skip'}>
                {turn.carId ? turn.name : 'Skipped'}
              </li>
            ))}
            {result?.solved && <li className="turn-right">{result.name}</li>}
          </ol>
        </section>
      )}
    </main>
  );
}
