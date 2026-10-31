const projectUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const secretKey = process.env.SUPABASE_SECRET_KEY;
export const mediaBucket = process.env.SUPABASE_BUCKET || 'sendhoor-media';

export function isSupabaseConfigured() {
  return Boolean(projectUrl && secretKey);
}

function config() {
  if (!projectUrl || !secretKey) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY on the server.');
  return { projectUrl, secretKey };
}

function apiHeaders(extra: Record<string, string> = {}) {
  const { secretKey: key } = config();
  return { apikey: key, ...extra };
}

async function responseError(response: Response) {
  const message = (await response.text()).slice(0, 500);
  return new Error(`Supabase request failed (${response.status}): ${message}`);
}

export async function readRemoteData<T>(key: string): Promise<T | null> {
  const { projectUrl } = config();
  const query = new URLSearchParams({ select: 'value', key: `eq.${key}` });
  const response = await fetch(`${projectUrl}/rest/v1/site_content?${query}`, {
    headers: apiHeaders(),
  });
  if (!response.ok) throw await responseError(response);
  const rows = (await response.json()) as Array<{ value: T }>;
  return rows[0]?.value ?? null;
}

export async function writeRemoteData<T>(key: string, value: T): Promise<void> {
  const { projectUrl } = config();
  const response = await fetch(`${projectUrl}/rest/v1/site_content?on_conflict=key`, {
    method: 'POST',
    headers: apiHeaders({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify([{ key, value }]),
  });
  if (!response.ok) throw await responseError(response);
}

export async function uploadRemoteImage(name: string, bytes: Buffer, contentType: string): Promise<string> {
  const { projectUrl } = config();
  const bucket = encodeURIComponent(mediaBucket);
  const objectName = name.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${projectUrl}/storage/v1/object/${bucket}/${objectName}`, {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': contentType, 'x-upsert': 'false', 'cache-control': '31536000' }),
    body: bytes,
  });
  if (!response.ok) throw await responseError(response);
  return `${projectUrl}/storage/v1/object/public/${bucket}/${objectName}`;
}

export async function removeRemoteImage(url: URL): Promise<boolean> {
  const { projectUrl } = config();
  if (url.origin !== projectUrl) return false;
  const prefix = `/storage/v1/object/public/${mediaBucket}/`;
  if (!url.pathname.startsWith(prefix)) return false;

  const objectName = url.pathname.slice(prefix.length).split('/').map(decodeURIComponent).join('/');
  const response = await fetch(`${projectUrl}/storage/v1/object/${encodeURIComponent(mediaBucket)}`, {
    method: 'DELETE',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: [objectName] }),
  });
  if (!response.ok) throw await responseError(response);
  return true;
}
