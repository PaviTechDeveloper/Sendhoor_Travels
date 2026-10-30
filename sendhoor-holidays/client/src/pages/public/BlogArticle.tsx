import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { fetchBlog } from '../../lib/api';
import { videoEmbedUrl, type BlogPost } from '../../lib/blog';

function Block({ block }: { block: BlogPost['blocks'][number] }) {
  if (block.type === 'heading') {
    return <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink">{block.text}</h2>;
  }
  if (block.type === 'paragraph') {
    return <p className="whitespace-pre-line">{block.text}</p>;
  }
  if (block.type === 'image') {
    return (
      <figure>
        <img src={block.url} alt={block.alt} loading="lazy" className="w-full rounded-2xl object-cover" />
        {block.caption && <figcaption className="mt-2 text-sm text-ink/60">{block.caption}</figcaption>}
      </figure>
    );
  }

  const embed = videoEmbedUrl(block.url);
  return (
    <figure>
      {embed ? (
        <div className="aspect-video overflow-hidden rounded-2xl">
          <iframe
            src={embed}
            title={block.caption || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      ) : (
        <a href={block.url} target="_blank" rel="noreferrer" className="text-brand underline">
          Watch the video
        </a>
      )}
      {block.caption && <figcaption className="mt-2 text-sm text-ink/60">{block.caption}</figcaption>}
    </figure>
  );
}

export default function BlogArticle() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    fetchBlog()
      .then((posts) => setPost(posts.find((item) => item.id === id) ?? null))
      .catch(() => setPost(null));
  }, [id]);

  return (
    <main id="main" className="min-h-screen bg-white pt-32 pb-24 md:pt-40">
      <article className="mx-auto max-w-3xl px-6">
        <Link to="/#blog" className="text-sm font-semibold text-brand hover:underline">
          Back to the travel journal
        </Link>

        {post === undefined && <p className="mt-10 text-ink/60">Loading article...</p>}
        {post === null && <p className="mt-10 text-ink/70">We could not find that article.</p>}

        {post && (
          <>
            <p className="mt-8 flex items-center gap-2 text-sm font-medium text-ink/60">
              <Clock className="size-4" aria-hidden />
              {post.readTime}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink">{post.title}</h1>
            <p className="mt-4 text-lg text-ink/70">{post.excerpt}</p>
            <img src={post.coverImage} alt={post.coverAlt} className="mt-8 aspect-video w-full rounded-3xl object-cover" />

            <div className="mt-10 grid gap-6 text-lg leading-relaxed text-ink/80">
              {post.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>
          </>
        )}
      </article>
    </main>
  );
}
