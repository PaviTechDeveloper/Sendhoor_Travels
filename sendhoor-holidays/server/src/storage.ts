import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Render's mounted disk can hold both catalog data and uploaded media.
export const dataDir = process.env.DATA_DIR
  ? resolve(process.env.DATA_DIR)
  : fileURLToPath(new URL('../data/', import.meta.url));

async function ensureSeedFile(filename: string) {
  await mkdir(dataDir, { recursive: true });
  const target = join(dataDir, filename);
  try {
    await access(target);
  } catch {
    const seed = fileURLToPath(new URL(`../data/${filename}`, import.meta.url));
    if (target !== seed) await copyFile(seed, target);
  }
  return target;
}

export async function readData<T>(filename: string): Promise<T> {
  const path = await ensureSeedFile(filename);
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

export async function writeData<T>(filename: string, value: T): Promise<void> {
  const path = await ensureSeedFile(filename);
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
