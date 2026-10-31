import type { TwoDayTrip } from './twoDayTrips';
import type { VehicleRecord } from './vehicles';
import type { BlogPost } from './blog';

export async function fetchBlog(): Promise<BlogPost[]> {
  const response = await fetch('/api/blog');
  if (!response.ok) throw new Error('Could not load the journal');
  const data = await response.json();
  return data.posts;
}

export async function fetchPackages(): Promise<TwoDayTrip[]> {
  const response = await fetch('/api/packages');
  if (!response.ok) throw new Error('Could not load packages');
  const data = await response.json();
  return data.packages;
}

export async function fetchVehicles(): Promise<VehicleRecord[]> {
  const response = await fetch('/api/vehicles');
  if (!response.ok) throw new Error('Could not load vehicles');
  const data = await response.json();
  return data.vehicles;
}

export interface SubmitResult {
  ok: boolean;
  message?: string;
}

export async function submitForm(path: string, body: unknown): Promise<SubmitResult> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.ok) return { ok: true };
    return { ok: false, message: data.message ?? 'Something went wrong. Please try again.' };
  } catch {
    return { ok: false, message: 'We could not reach the server. Please try again or call us.' };
  }
}
