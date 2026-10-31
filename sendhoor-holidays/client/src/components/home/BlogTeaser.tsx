import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import SafeImage from '../ui/SafeImage';
import { StaggerGroup, StaggerItem } from '../motion/StaggerReveal';
import { fetchBlog } from '../../lib/api';
import type { BlogPost } from '../../lib/blog';

export default function BlogTeaser() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetchBlog().then(setPosts).catch(() => setLoadFailed(true));
  }, []);

  return (
    <section id="blog" className="scroll-mt-24 bg-sand py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Travel journal"
          title="Ideas for your next trip"
          subtitle="Short guides from our team on timing, packing and getting the most from each place."
        />
        {loadFailed && (
          <p role="alert" className="mt-14 text-center text-coral">
            We could not load the journal right now. Please refresh the page.
          </p>
        )}
        {!loadFailed && !posts && <p className="mt-14 text-center text-ink/60">Loading articles...</p>}
        {posts && (
          <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post.id} className="h-full">
                <Link to={`/blog/${post.id}`} className="group block h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 transition group-hover:shadow-lg">
                    <div className="relative aspect-video">
                      <SafeImage
                        src={post.coverImage}
                        alt={post.coverAlt}
                        className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <Clock className="size-3.5" aria-hidden />
                        {post.readTime}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-ink">{post.title}</h3>
                      <p className="mt-2 text-sm text-ink/70">{post.excerpt}</p>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}
