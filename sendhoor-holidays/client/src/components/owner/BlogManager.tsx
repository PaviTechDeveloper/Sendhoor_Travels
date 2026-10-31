import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import SafeImage from '../ui/SafeImage';
import FormField, { inputClass } from '../forms/FormField';
import AdminTabs, { type AdminTab } from './AdminTabs';
import { fetchBlog } from '../../lib/api';
import {
  createBlogPost,
  deleteBlogPost,
  getOwnerToken,
  updateBlogPost,
  uploadPhoto,
} from '../../lib/ownerApi';
import type { BlogBlock, BlogDetails, BlogPost } from '../../lib/blog';

const blockLabels: Record<BlogBlock['type'], string> = {
  heading: 'Heading',
  paragraph: 'Text',
  image: 'Photo',
  video: 'Video (YouTube or Vimeo)',
};

const controlClass = 'rounded-full px-3 py-1 text-xs font-semibold text-ink ring-1 ring-ink/15 hover:bg-sand disabled:opacity-40';

const blankPost: BlogDetails = {
  title: '',
  excerpt: '',
  coverImage: '',
  coverAlt: '',
  blocks: [],
};

interface BlockEditorProps {
  block: BlogBlock;
  index: number;
  total: number;
  uploading: boolean;
  onChange: (patch: Partial<BlogBlock>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onImage: (file: File) => void;
}

function BlockEditor({ block, index, total, uploading, onChange, onMove, onRemove, onImage }: BlockEditorProps) {
  const id = `blk-${index}`;

  let body;
  if (block.type === 'heading') {
    body = (
      <FormField id={id} label="Heading">
        <input id={id} type="text" value={block.text} onChange={(e) => onChange({ text: e.target.value })} className={inputClass} />
      </FormField>
    );
  } else if (block.type === 'paragraph') {
    body = (
      <FormField id={id} label="Text">
        <textarea
          id={id}
          rows={5}
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className={`${inputClass} h-auto py-3`}
        />
      </FormField>
    );
  } else if (block.type === 'image') {
    body = (
      <>
        {block.url && <SafeImage src={block.url} alt="Blog image preview" className="aspect-video w-full max-w-sm rounded-2xl object-cover" />}
        <FormField id={`${id}-file`} label={block.url ? 'Replace photo (JPG, PNG or WebP)' : 'Upload photo (JPG, PNG or WebP)'}>
          <input
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) onImage(file);
            }}
            className="text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </FormField>
        <FormField id={`${id}-alt`} label="Photo description">
          <input id={`${id}-alt`} type="text" value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} className={inputClass} />
        </FormField>
        <FormField id={`${id}-caption`} label="Caption (optional)">
          <input id={`${id}-caption`} type="text" value={block.caption} onChange={(e) => onChange({ caption: e.target.value })} className={inputClass} />
        </FormField>
      </>
    );
  } else {
    body = (
      <>
        <FormField id={`${id}-url`} label="YouTube or Vimeo link">
          <input
            id={`${id}-url`}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className={inputClass}
          />
        </FormField>
        <FormField id={`${id}-caption`} label="Caption (optional)">
          <input id={`${id}-caption`} type="text" value={block.caption} onChange={(e) => onChange({ caption: e.target.value })} className={inputClass} />
        </FormField>
      </>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wide text-brand uppercase">{blockLabels[block.type]}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={controlClass}>
            Up
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className={controlClass}>
            Down
          </button>
          <button type="button" onClick={onRemove} className={`${controlClass} text-coral`}>
            Remove
          </button>
        </div>
      </div>
      {body}
    </div>
  );
}

interface BlogManagerProps {
  onTabChange: (tab: AdminTab) => void;
  onSessionEnd: () => void;
}

export default function BlogManager({ onTabChange, onSessionEnd }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState<BlogDetails | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBlog()
      .then(setPosts)
      .catch(() => setListError('Could not load the journal. Please refresh the page.'));
  }, []);

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setIsNew(false);
    setDraft({
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      coverAlt: post.coverAlt,
      blocks: post.blocks.map((block) => ({ ...block })),
    });
    setFormError(null);
    setMessage(null);
  };

  const startNew = () => {
    setEditingId(null);
    setIsNew(true);
    setDraft(blankPost);
    setFormError(null);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsNew(false);
    setDraft(null);
    setFormError(null);
  };

  // Uploads one photo and returns its address, or null when it failed.
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    setFormError(null);
    try {
      const result = await uploadPhoto(file);
      if (result.ok && result.url) return result.url;

      setFormError(result.message ?? 'Could not upload the photo.');
      if (!getOwnerToken()) onSessionEnd();
      return null;
    } catch {
      setFormError('Could not read that photo. Try another file.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const url = await uploadImage(file);
    if (url) setDraft((prev) => (prev ? { ...prev, coverImage: url } : prev));
  };

  const updateBlock = (index: number, patch: Partial<BlogBlock>) => {
    setDraft((prev) =>
      prev ? { ...prev, blocks: prev.blocks.map((block, i) => (i === index ? ({ ...block, ...patch } as BlogBlock) : block)) } : prev,
    );
  };

  const addBlock = (block: BlogBlock) => {
    setDraft((prev) => (prev ? { ...prev, blocks: [...prev.blocks, block] } : prev));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.blocks.length) return prev;
      const blocks = [...prev.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...prev, blocks };
    });
  };

  const removeBlock = (index: number) => {
    setDraft((prev) => (prev ? { ...prev, blocks: prev.blocks.filter((_, i) => i !== index) } : prev));
  };

  const handleBlockImage = async (index: number, file: File) => {
    const url = await uploadImage(file);
    if (url) updateBlock(index, { url });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    setBusy(true);
    setFormError(null);
    const result = isNew ? await createBlogPost(draft) : await updateBlogPost(editingId ?? '', draft);
    setBusy(false);

    if (!result.ok || !result.post) {
      setFormError(result.message ?? 'Could not save. Please try again.');
      if (!getOwnerToken()) onSessionEnd();
      return;
    }

    const saved = result.post;
    setPosts((prev) => (isNew ? [...prev, saved] : prev.map((post) => (post.id === saved.id ? saved : post))));
    setMessage(isNew ? `"${saved.title}" is published. It shows on the home page now.` : `"${saved.title}" is updated.`);
    cancelEdit();
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? Its photos will be removed too.`)) return;

    setBusy(true);
    setListError(null);
    setMessage(null);
    const result = await deleteBlogPost(post.id);
    setBusy(false);

    if (!result.ok) {
      setListError(result.message ?? 'Could not delete the post. Please try again.');
      if (!getOwnerToken()) onSessionEnd();
      return;
    }
    setPosts((prev) => prev.filter((item) => item.id !== post.id));
    setMessage(`"${post.title}" is deleted.`);
  };

  const editor = draft && (
    <form onSubmit={handleSave} className="grid gap-5 rounded-3xl bg-sand p-6 md:grid-cols-2 md:p-8">
      <FormField id="blog-title" label="Title">
        <input id="blog-title" type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
      </FormField>
      <FormField id="blog-cover-alt" label="Cover photo description">
        <input id="blog-cover-alt" type="text" value={draft.coverAlt} onChange={(e) => setDraft({ ...draft, coverAlt: e.target.value })} className={inputClass} />
      </FormField>
      <div className="md:col-span-2">
        <FormField id="blog-excerpt" label="Short summary (shown on the journal page)">
          <textarea
            id="blog-excerpt"
            rows={3}
            value={draft.excerpt}
            onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            className={`${inputClass} h-auto py-3`}
          />
        </FormField>
      </div>

      <div className="grid gap-3 md:col-span-2">
        <p className="text-sm font-medium text-ink">Cover photo</p>
        {draft.coverImage && <SafeImage src={draft.coverImage} alt="Blog cover preview" className="aspect-video w-full max-w-sm rounded-2xl object-cover" />}
        <FormField id="blog-cover" label={draft.coverImage ? 'Replace cover photo' : 'Upload cover photo (JPG, PNG or WebP)'}>
          <input
            id="blog-cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCover}
            disabled={uploading}
            className="text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:col-span-2">
        <p className="text-sm font-medium text-ink">Article content (in reading order)</p>
        {draft.blocks.length === 0 && <p className="text-sm text-ink/60">Nothing here yet. Add a heading, text, photo or video below.</p>}
        {draft.blocks.map((block, index) => (
          <BlockEditor
            key={index}
            block={block}
            index={index}
            total={draft.blocks.length}
            uploading={uploading}
            onChange={(patch) => updateBlock(index, patch)}
            onMove={(direction) => moveBlock(index, direction)}
            onRemove={() => removeBlock(index)}
            onImage={(file) => handleBlockImage(index, file)}
          />
        ))}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => addBlock({ type: 'heading', text: '' })}>
            Add heading
          </Button>
          <Button variant="secondary" onClick={() => addBlock({ type: 'paragraph', text: '' })}>
            Add text
          </Button>
          <Button variant="secondary" onClick={() => addBlock({ type: 'image', url: '', alt: '', caption: '' })}>
            Add photo
          </Button>
          <Button variant="secondary" onClick={() => addBlock({ type: 'video', url: '', caption: '' })}>
            Add video
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-end">
        {formError && (
          <p role="alert" className="text-sm text-coral sm:mr-auto">
            {formError}
          </p>
        )}
        <Button variant="secondary" onClick={cancelEdit}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || uploading}>
          {busy ? 'Saving...' : 'Publish changes'}
        </Button>
      </div>
    </form>
  );

  return (
    <main id="main" className="min-h-screen bg-white pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Admin"
            title="Manage the travel journal"
            subtitle="Posts appear on the home page and open as full articles."
          />
          <div className="flex flex-wrap gap-3">
            <AdminTabs active="blog" onChange={onTabChange} />
            <Button onClick={startNew} disabled={isNew || editingId !== null}>
              Add post
            </Button>
            <Button variant="secondary" onClick={onSessionEnd}>
              Sign out
            </Button>
          </div>
        </div>

        {message && (
          <p role="status" className="mt-8 text-sm text-brand">
            {message}
          </p>
        )}
        {listError && (
          <p role="alert" className="mt-8 text-sm text-coral">
            {listError}
          </p>
        )}

        <div className="mt-10 grid gap-6">
          {isNew && editor}

          {posts.map((post) =>
            editingId === post.id && editor ? (
              <div key={post.id}>{editor}</div>
            ) : (
              <article
                key={post.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <SafeImage src={post.coverImage} alt="" className="size-20 rounded-2xl object-cover" />
                  <div>
                    <h3 className="text-lg font-bold text-ink">{post.title}</h3>
                    <p className="text-sm text-ink/70">
                      {post.readTime} · {post.blocks.length} section{post.blocks.length === 1 ? '' : 's'}
                    </p>
                    <p className="text-sm text-ink/60">{post.excerpt}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => startEdit(post)} disabled={editingId !== null || isNew}>
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(post)}
                    disabled={busy || editingId !== null || isNew}
                    className="text-coral"
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
