import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const dataFile = fileURLToPath(new URL('../data/packages.json', import.meta.url));

// Photos are either an uploaded file on this site, a local path, or a full https link.
export const photoPath = z
  .string()
  .trim()
  .min(1, 'Upload a photo')
  .max(500)
  .refine(
    (value) => value.startsWith('/') || value.startsWith('https://'),
    'Photo must be an uploaded file or an https link',
  );

export const packageSchema = z
  .object({
    destination: z.string().trim().min(2, 'Enter the destination name').max(100),
    state: z.string().trim().min(2, 'Enter the state').max(100),
    vibe: z.string().trim().min(2, 'Describe the highlights').max(200),
    connection: z.string().trim().min(2, 'Enter how to get there').max(200),
    days: z.number().int('Days must be a whole number').min(1, 'At least 1 day').max(14, 'Up to 14 days'),
    priceFrom: z.number().int('Price must be a whole rupee amount').min(0, 'Price cannot be negative').max(10000000),
    priceTo: z.number().int('Price must be a whole rupee amount').min(0).max(10000000),
    image: photoPath,
    imageAlt: z.string().trim().min(2, 'Describe the photo').max(200),
  })
  .refine((data) => data.priceTo >= data.priceFrom, {
    message: 'Price to must be the same or higher than price from',
    path: ['priceTo'],
  });

export type PackageDetails = z.infer<typeof packageSchema>;
export type TripPackage = PackageDetails & { id: string };

export async function listPackages(): Promise<TripPackage[]> {
  return JSON.parse(await readFile(dataFile, 'utf8')) as TripPackage[];
}

async function savePackages(packages: TripPackage[]) {
  await writeFile(dataFile, `${JSON.stringify(packages, null, 2)}\n`, 'utf8');
}

export async function updatePackage(id: string, details: PackageDetails): Promise<TripPackage | null> {
  const packages = await listPackages();
  const index = packages.findIndex((pkg) => pkg.id === id);
  if (index === -1) return null;

  const updated: TripPackage = { id, ...details };
  packages[index] = updated;
  await savePackages(packages);
  return updated;
}

export async function deletePackage(id: string): Promise<TripPackage | null> {
  const packages = await listPackages();
  const removed = packages.find((pkg) => pkg.id === id);
  if (!removed) return null;

  await savePackages(packages.filter((pkg) => pkg.id !== id));
  return removed;
}

export async function createPackage(details: PackageDetails): Promise<TripPackage> {
  const packages = await listPackages();
  const base = details.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'package';
  const taken = new Set(packages.map((pkg) => pkg.id));
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;

  const created: TripPackage = { id, ...details };
  packages.push(created);
  await savePackages(packages);
  return created;
}
