import 'server-only';
import data from '@/generated/vehicles.json';
import type { CarOption } from '../game-types';
import type { Vehicle } from '../schema';

/**
 * The full vehicle database. Server only: importing this file from a browser
 * component fails the build, which keeps specs and answers out of the page.
 */
export const VEHICLES = data as unknown as Vehicle[];

const BY_ID = new Map(VEHICLES.map((v) => [v.id, v]));

export function getVehicle(id: string): Vehicle | undefined {
  return BY_ID.get(id);
}

/** Names and search aliases only. Safe to send to the browser. */
export function carOptions(): CarOption[] {
  return VEHICLES.map((v) => ({ id: v.id, name: v.displayName, aliases: v.aliases }));
}
