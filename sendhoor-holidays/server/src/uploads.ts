import { randomBytes } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Set UPLOADS_DIR to a persistent mounted volume in production. Local development
// defaults to server/data/uploads, which is intentionally excluded from git.
export const uploadsDir = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : fileURLToPath(new URL('../data/uploads', import.meta.url));
export const UPLOAD_URL_PREFIX = '/api/uploads';

const MAX_BYTES = 3 * 1024 * 1024;

// The first bytes of each file type, so a renamed non-image file is refused.
const formats = {
  jpeg: { ext: 'jpg', mime: 'image/jpeg', matches: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  png: { ext: 'png', mime: 'image/png', matches: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  webp: {
    ext: 'webp',
    mime: 'image/webp',
    matches: (b: Buffer) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
};

// Deletes a photo this site uploaded. Paths to other photos (such as /images/...) are left alone.
export async function removeUpload(url: string) {
  const match = new RegExp(`^${UPLOAD_URL_PREFIX}/([a-f0-9]{24}\\.(?:jpg|png|webp))$`).exec(url);
  if (match) await rm(join(uploadsDir, match[1]), { force: true });
}

export async function saveImage(dataUrl: string): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return { ok: false, message: 'Upload a JPG, PNG or WebP photo.' };

  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return { ok: false, message: 'Photo must be under 3 MB.' };
  }

  const format = Object.values(formats).find((f) => f.mime === match[1]);
  if (!format || !format.matches(bytes)) {
    return { ok: false, message: 'That file is not a valid JPG, PNG or WebP photo.' };
  }

  await mkdir(uploadsDir, { recursive: true });
  const name = `${randomBytes(12).toString('hex')}.${format.ext}`;
  await writeFile(join(uploadsDir, name), bytes);
  return { ok: true, url: `${UPLOAD_URL_PREFIX}/${name}` };
}
