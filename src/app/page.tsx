import { Game } from '@/components/Game';
import { carOptions } from '@/lib/server/vehicles';

export default function Home() {
  return <Game cars={carOptions()} />;
}
