import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
export const DATA_DIR = join(ROOT, 'data', 'vehicles');

export interface RawFile {
  /** Path relative to the project root, with forward slashes. */
  path: string;
  /** Manufacturer folder name. */
  folder: string;
  /** File name without .json. */
  stem: string;
  json: unknown;
  parseError?: string;
}

/** Reads every data/vehicles/<manufacturer>/<id>.json file. */
export function loadRawFiles(dir: string = DATA_DIR): RawFile[] {
  const files: RawFile[] = [];
  for (const folder of readdirSync(dir).sort()) {
    const folderPath = join(dir, folder);
    if (!statSync(folderPath).isDirectory()) continue;
    for (const name of readdirSync(folderPath).sort()) {
      if (!name.endsWith('.json')) continue;
      const full = join(folderPath, name);
      const file: RawFile = {
        path: relative(ROOT, full).split('\\').join('/'),
        folder,
        stem: name.slice(0, -'.json'.length),
        json: undefined,
      };
      try {
        file.json = JSON.parse(readFileSync(full, 'utf8'));
      } catch (e) {
        file.parseError = (e as Error).message;
      }
      files.push(file);
    }
  }
  return files;
}
