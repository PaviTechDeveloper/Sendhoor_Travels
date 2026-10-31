import { z } from 'zod';
import { photoPath } from './packages.js';
import { removeUpload } from './uploads.js';
import { readData, writeData } from './storage.js';

// Videos are linked from YouTube or Vimeo rather than uploaded, so the site does not store large files.
const videoLink = z
  .string()
  .trim()
  .min(1, 'Paste a YouTube or Vimeo link')
  .max(300)
  .refine(
    (value) => /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(value),
    'Use a YouTube or Vimeo link',
  );

const block = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), text: z.string().trim().min(2, 'Enter a heading').max(120) }),
  z.object({ type: z.literal('paragraph'), text: z.string().trim().min(2, 'Enter some text').max(3000) }),
  z.object({
    type: z.literal('image'),
    url: photoPath,
    alt: z.string().trim().min(2, 'Describe the image').max(200),
    caption: z.string().trim().max(200),
  }),
  z.object({ type: z.literal('video'), url: videoLink, caption: z.string().trim().max(200) }),
]);

export const blogSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title').max(120),
  excerpt: z.string().trim().min(10, 'Write a short summary').max(300),
  coverImage: photoPath,
  coverAlt: z.string().trim().min(2, 'Describe the cover photo').max(200),
  blocks: z.array(block).min(1, 'Add some content').max(60, 'Up to 60 sections'),
});

export type BlogDetails = z.infer<typeof blogSchema>;
export type BlogRecord = BlogDetails & { id: string };
export type BlogPost = BlogRecord & { readTime: string };

function uploadsIn(details: BlogDetails) {
  const images = details.blocks.flatMap((item) => (item.type === 'image' ? [item.url] : []));
  return [details.coverImage, ...images];
}

async function listRecords(): Promise<BlogRecord[]> {
  return readData<BlogRecord[]>('blog.json');
}

// Estimated at 200 words a minute, and never less than one minute.
function readTime(details: BlogDetails) {
  const words = details.blocks.reduce((count, item) => count + ('text' in item ? item.text.split(/\s+/).length : 0), 0);
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export async function listBlog(): Promise<BlogPost[]> {
  const records = await listRecords();
  return records.map((record) => ({ ...record, readTime: readTime(record) }));
}

export async function createBlog(details: BlogDetails): Promise<BlogPost> {
  const records = await listRecords();
  const base = details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'post';
  const taken = new Set(records.map((record) => record.id));
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;

  const created: BlogRecord = { id, ...details };
  records.push(created);
  await writeData('blog.json', records);
  return { ...created, readTime: readTime(details) };
}

// Photos that were removed from the post are deleted from the server.
export async function updateBlog(id: string, details: BlogDetails): Promise<BlogPost | null> {
  const records = await listRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const previous = uploadsIn(records[index]);
  const updated: BlogRecord = { id, ...details };
  records[index] = updated;
  await writeData('blog.json', records);

  const kept = new Set(uploadsIn(details));
  await Promise.all(previous.filter((url) => !kept.has(url)).map(removeUpload));
  return { ...updated, readTime: readTime(details) };
}

export async function deleteBlog(id: string): Promise<boolean> {
  const records = await listRecords();
  const removed = records.find((record) => record.id === id);
  if (!removed) return false;

  await writeData('blog.json', records.filter((record) => record.id !== id));
  await Promise.all(uploadsIn(removed).map(removeUpload));
  return true;
}
