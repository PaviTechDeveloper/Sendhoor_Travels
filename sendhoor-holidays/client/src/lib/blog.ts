// Blog posts are stored on the server and written by the owner in the admin page.

export type BlogBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt: string; caption: string }
  | { type: 'video'; url: string; caption: string };

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  coverImage: string;
  coverAlt: string;
  blocks: BlogBlock[];
}

export type BlogDetails = Omit<BlogPost, 'id' | 'readTime'>;

// Turns a YouTube or Vimeo link into the address used inside a page. Returns null for anything else.
export function videoEmbedUrl(url: string): string | null {
  const youtube = /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/.exec(url);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = /vimeo\.com\/(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}
