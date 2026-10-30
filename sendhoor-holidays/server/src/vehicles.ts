import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { photoPath } from './packages.js';

const dataFile = fileURLToPath(new URL('../data/vehicles.json', import.meta.url));

export const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric'] as const;

export const vehicleSchema = z.object({
  name: z.string().trim().min(2, 'Enter the vehicle name').max(100),
  seats: z.number().int('Seats must be a whole number').min(1, 'At least 1 seat').max(60, 'Up to 60 seats'),
  fuel: z.enum(fuelTypes),
  available: z.number().int('Units must be a whole number').min(0, 'Cannot be negative').max(200),
  bestFor: z.string().trim().min(2, 'Describe who it suits').max(200),
  features: z
    .array(z.string().trim().min(2, 'Each feature needs a few words').max(120))
    .min(1, 'Add at least one feature')
    .max(10, 'Up to 10 features'),
  photos: z.array(photoPath).max(6, 'Up to 6 photos per vehicle'),
});

export type VehicleDetails = z.infer<typeof vehicleSchema>;
export type VehicleRecord = VehicleDetails & { id: string };

export async function listVehicles(): Promise<VehicleRecord[]> {
  return JSON.parse(await readFile(dataFile, 'utf8')) as VehicleRecord[];
}

async function saveVehicles(vehicles: VehicleRecord[]) {
  await writeFile(dataFile, `${JSON.stringify(vehicles, null, 2)}\n`, 'utf8');
}

export async function createVehicle(details: VehicleDetails): Promise<VehicleRecord> {
  const vehicles = await listVehicles();
  const base = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'vehicle';
  const taken = new Set(vehicles.map((vehicle) => vehicle.id));
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;

  const created: VehicleRecord = { id, ...details };
  vehicles.push(created);
  await saveVehicles(vehicles);
  return created;
}

// Returns the saved vehicle and the photos it had before, so replaced photos can be cleaned up.
export async function updateVehicle(id: string, details: VehicleDetails) {
  const vehicles = await listVehicles();
  const index = vehicles.findIndex((vehicle) => vehicle.id === id);
  if (index === -1) return null;

  const previous = vehicles[index];
  const updated: VehicleRecord = { id, ...details };
  vehicles[index] = updated;
  await saveVehicles(vehicles);
  return { updated, previousPhotos: previous.photos };
}

export async function deleteVehicle(id: string): Promise<VehicleRecord | null> {
  const vehicles = await listVehicles();
  const removed = vehicles.find((vehicle) => vehicle.id === id);
  if (!removed) return null;

  await saveVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  return removed;
}
