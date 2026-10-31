import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isSupabaseConfigured, readRemoteData, writeRemoteData } from './supabase.js';

// Render's mounted disk can hold both catalog data and uploaded media.
const defaultDataDir = fileURLToPath(new URL('../data/', import.meta.url));
export const dataDir = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : defaultDataDir;
let useDefaultDataDir = false;

async function ensureSeedFile(filename: string) {
  let activeDir = useDefaultDataDir ? defaultDataDir : dataDir;
  try {
    await mkdir(activeDir, { recursive: true });
  } catch (error) {
    if (activeDir === defaultDataDir) throw error;
    useDefaultDataDir = true;
    activeDir = defaultDataDir;
    await mkdir(activeDir, { recursive: true });
    console.error(`Cannot access DATA_DIR=${dataDir}; using temporary app data instead. Attach a writable Render disk at /var/data.`, error);
  }
  const target = join(activeDir, filename);
  try {
    await access(target);
  } catch {
    const seed = fileURLToPath(new URL(`../data/${filename}`, import.meta.url));
    if (target !== seed) await copyFile(seed, target);
  }
  return target;
}

export async function readData<T>(filename: string): Promise<T> {
  if (isSupabaseConfigured()) {
    const stored = await readRemoteData<T>(filename);
    if (stored !== null) return stored;

    const seedPath = fileURLToPath(new URL(`../data/${filename}`, import.meta.url));
    const seed = JSON.parse(await readFile(seedPath, 'utf8')) as T;
    await writeRemoteData(filename, seed);
    return seed;
  }

  const path = await ensureSeedFile(filename);
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

export async function writeData<T>(filename: string, value: T): Promise<void> {
  if (isSupabaseConfigured()) {
    await writeRemoteData(filename, value);
    return;
  }

  const path = await ensureSeedFile(filename);
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
