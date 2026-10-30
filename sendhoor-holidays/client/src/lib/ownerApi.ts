import type { TripDetails, TwoDayTrip } from './twoDayTrips';
import type { VehicleDetails, VehicleRecord } from './vehicles';
import type { BlogDetails, BlogPost } from './blog';

const TOKEN_KEY = 'sendhoor-owner-token';

export interface OwnerResult {
  ok: boolean;
  message?: string;
  token?: string;
  trip?: TwoDayTrip;
  vehicle?: VehicleRecord;
  post?: BlogPost;
  url?: string;
}

export function getOwnerToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearOwnerToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function ownerLogin(password: string): Promise<OwnerResult> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.token) {
      sessionStorage.setItem(TOKEN_KEY, data.token);
      return { ok: true, token: data.token };
    }
    return { ok: false, message: data.message ?? 'Could not sign in. Please try again.' };
  } catch {
    return { ok: false, message: 'We could not reach the server. Please try again.' };
  }
}

// Sends a signed-in request. A 401 means the session ended, so the stored token is cleared.
async function ownerRequest(method: string, path: string, body: unknown) {
  const token = getOwnerToken();
  if (!token) return { ok: false, message: 'Please sign in again.' } as const;

  try {
    const response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearOwnerToken();
      return { ok: false, message: 'Your session ended. Please sign in again.' } as const;
    }
    if (response.ok && data.ok) return { ok: true, data } as const;

    const fieldMessages = data.errors ? Object.values(data.errors).join(' ') : undefined;
    return { ok: false, message: data.message ?? fieldMessages ?? 'Could not save. Please try again.' } as const;
  } catch {
    return { ok: false, message: 'We could not reach the server. Please try again.' } as const;
  }
}

export async function savePackage(id: string, details: TripDetails): Promise<OwnerResult> {
  const result = await ownerRequest('PUT', `/api/admin/packages/${encodeURIComponent(id)}`, details);
  return result.ok ? { ok: true, trip: result.data.package } : { ok: false, message: result.message };
}

export async function createPackage(details: TripDetails): Promise<OwnerResult> {
  const result = await ownerRequest('POST', '/api/admin/packages', details);
  return result.ok ? { ok: true, trip: result.data.package } : { ok: false, message: result.message };
}

export async function createVehicle(details: VehicleDetails): Promise<OwnerResult> {
  const result = await ownerRequest('POST', '/api/admin/vehicles', details);
  return result.ok ? { ok: true, vehicle: result.data.vehicle } : { ok: false, message: result.message };
}

export async function updateVehicle(id: string, details: VehicleDetails): Promise<OwnerResult> {
  const result = await ownerRequest('PUT', `/api/admin/vehicles/${encodeURIComponent(id)}`, details);
  return result.ok ? { ok: true, vehicle: result.data.vehicle } : { ok: false, message: result.message };
}

export async function createBlogPost(details: BlogDetails): Promise<OwnerResult> {
  const result = await ownerRequest('POST', '/api/admin/blog', details);
  return result.ok ? { ok: true, post: result.data.post } : { ok: false, message: result.message };
}

export async function updateBlogPost(id: string, details: BlogDetails): Promise<OwnerResult> {
  const result = await ownerRequest('PUT', `/api/admin/blog/${encodeURIComponent(id)}`, details);
  return result.ok ? { ok: true, post: result.data.post } : { ok: false, message: result.message };
}

export async function deleteBlogPost(id: string): Promise<OwnerResult> {
  const result = await ownerRequest('DELETE', `/api/admin/blog/${encodeURIComponent(id)}`, undefined);
  return result.ok ? { ok: true } : { ok: false, message: result.message };
}

export async function deleteVehicle(id: string): Promise<OwnerResult> {
  const result = await ownerRequest('DELETE', `/api/admin/vehicles/${encodeURIComponent(id)}`, undefined);
  return result.ok ? { ok: true } : { ok: false, message: result.message };
}

export async function deletePackage(id: string): Promise<OwnerResult> {
  const result = await ownerRequest('DELETE', `/api/admin/packages/${encodeURIComponent(id)}`, undefined);
  return result.ok ? { ok: true } : { ok: false, message: result.message };
}

export async function uploadPhoto(file: File): Promise<OwnerResult> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { ok: false, message: 'Choose a JPG, PNG or WebP photo.' };
  }
  if (file.size > 3 * 1024 * 1024) {
    return { ok: false, message: 'Photo must be under 3 MB.' };
  }

  const image = await readAsDataUrl(file);
  const result = await ownerRequest('POST', '/api/admin/uploads', { image });
  return result.ok ? { ok: true, url: result.data.url } : { ok: false, message: result.message };
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
