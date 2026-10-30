import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import SectionHeading from '../../components/ui/SectionHeading';
import Button from '../../components/ui/Button';
import FormField, { inputClass } from '../../components/forms/FormField';
import AdminTabs, { type AdminTab } from '../../components/owner/AdminTabs';
import VehicleManager from '../../components/owner/VehicleManager';
import BlogManager from '../../components/owner/BlogManager';
import { fetchPackages } from '../../lib/api';
import {
  clearOwnerToken,
  createPackage,
  deletePackage,
  getOwnerToken,
  ownerLogin,
  savePackage,
  uploadPhoto,
} from '../../lib/ownerApi';
import { formatDays, formatPriceRange, type TripDetails, type TwoDayTrip } from '../../lib/twoDayTrips';

// The form works with text, so numbers are converted when saving.
type Draft = Record<keyof TripDetails, string>;

const fields: { key: Exclude<keyof Draft, 'image'>; label: string; type: 'text' | 'number' }[] = [
  { key: 'destination', label: 'Destination', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'vibe', label: 'Highlights', type: 'text' },
  { key: 'connection', label: 'How to get there', type: 'text' },
  { key: 'days', label: 'Number of days', type: 'number' },
  { key: 'priceFrom', label: 'Price from (₹ per person)', type: 'number' },
  { key: 'priceTo', label: 'Price to (₹ per person)', type: 'number' },
  { key: 'imageAlt', label: 'Photo description', type: 'text' },
];

const blankDraft: Draft = {
  destination: '',
  state: '',
  vibe: '',
  connection: '',
  days: '2',
  priceFrom: '',
  priceTo: '',
  image: '',
  imageAlt: '',
};

function draftFromTrip(trip: TwoDayTrip): Draft {
  return {
    destination: trip.destination,
    state: trip.state,
    vibe: trip.vibe,
    connection: trip.connection,
    days: String(trip.days),
    priceFrom: String(trip.priceFrom),
    priceTo: String(trip.priceTo),
    image: trip.image,
    imageAlt: trip.imageAlt,
  };
}

function detailsFromDraft(draft: Draft): TripDetails | null {
  const numbers = [draft.days, draft.priceFrom, draft.priceTo];
  if (numbers.some((value) => value.trim() === '')) return null;

  const days = Number(draft.days);
  const priceFrom = Number(draft.priceFrom);
  const priceTo = Number(draft.priceTo);
  if (![days, priceFrom, priceTo].every(Number.isFinite)) return null;

  return {
    destination: draft.destination,
    state: draft.state,
    vibe: draft.vibe,
    connection: draft.connection,
    days,
    priceFrom,
    priceTo,
    image: draft.image,
    imageAlt: draft.imageAlt,
  };
}

export default function Admin() {
  const [signedIn, setSignedIn] = useState(() => getOwnerToken() !== null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | undefined>();
  const [trips, setTrips] = useState<TwoDayTrip[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<AdminTab>('packages');

  useEffect(() => {
    if (!signedIn) return;
    fetchPackages()
      .then((list) => {
        setTrips(list);
        setListError(null);
      })
      .catch(() => setListError('Could not load packages. Please refresh the page.'));
  }, [signedIn]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const result = await ownerLogin(password);
    setBusy(false);

    if (!result.ok) {
      setLoginError(result.message);
      return;
    }
    setLoginError(undefined);
    setPassword('');
    setSignedIn(true);
  };

  const handleSignOut = () => {
    clearOwnerToken();
    setSignedIn(false);
    setTrips([]);
    cancelEdit();
    setSaved(null);
  };

  const startEdit = (trip: TwoDayTrip) => {
    setEditingId(trip.id);
    setIsNew(false);
    setDraft(draftFromTrip(trip));
    setSaveError(null);
    setSaved(null);
  };

  const startNew = () => {
    setEditingId(null);
    setIsNew(true);
    setDraft(blankDraft);
    setSaveError(null);
    setSaved(null);
  };

  const handleDelete = async (trip: TwoDayTrip) => {
    if (!window.confirm(`Delete ${trip.destination}? It will be removed from the Packages page.`)) return;

    setBusy(true);
    setListError(null);
    setSaved(null);
    const result = await deletePackage(trip.id);
    setBusy(false);

    if (!result.ok) {
      setListError(result.message ?? 'Could not delete the package. Please try again.');
      if (!getOwnerToken()) setSignedIn(false);
      return;
    }
    setTrips((prev) => prev.filter((item) => item.id !== trip.id));
    setSaved(`${trip.destination} is deleted. The Packages page no longer shows it.`);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsNew(false);
    setDraft(null);
    setSaveError(null);
  };

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setSaveError(null);
    try {
      const result = await uploadPhoto(file);
      if (!result.ok || !result.url) {
        setSaveError(result.message ?? 'Could not upload the photo.');
        if (!getOwnerToken()) setSignedIn(false);
        return;
      }
      const url = result.url;
      setDraft((prev) => (prev ? { ...prev, image: url } : prev));
    } catch {
      setSaveError('Could not read that photo. Try another file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    const details = detailsFromDraft(draft);
    if (!details) {
      setSaveError('Enter the number of days and both prices as numbers.');
      return;
    }

    setBusy(true);
    setSaveError(null);
    const result = isNew ? await createPackage(details) : await savePackage(editingId ?? '', details);
    setBusy(false);

    if (!result.ok || !result.trip) {
      setSaveError(result.message ?? 'Could not save. Please try again.');
      if (!getOwnerToken()) setSignedIn(false);
      return;
    }

    const updated = result.trip;
    setTrips((prev) =>
      isNew ? [...prev, updated] : prev.map((trip) => (trip.id === updated.id ? updated : trip)),
    );
    setSaved(
      isNew
        ? `${updated.destination} is added. The Packages page shows it now.`
        : `${updated.destination} is updated. The Packages page shows the change now.`,
    );
    cancelEdit();
  };

  if (!signedIn) {
    return (
      <main id="main" className="min-h-screen bg-white pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-md px-6">
          <SectionHeading align="left" eyebrow="Admin" title="Sign in to manage packages" />
          <form onSubmit={handleLogin} className="mt-10 grid gap-5 rounded-3xl bg-sand p-6 md:p-8">
            <FormField id="owner-password" label="Admin password" error={loginError}>
              <input
                id="owner-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </FormField>
            <Button type="submit" disabled={busy || password.length === 0}>
              {busy ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>
    );
  }

  const editor = draft && (
    <form onSubmit={handleSave} className="grid gap-5 rounded-3xl bg-sand p-6 md:grid-cols-2 md:p-8">
      {fields.map((field) => (
        <FormField key={field.key} id={`pkg-${field.key}`} label={field.label}>
          <input
            id={`pkg-${field.key}`}
            type={field.type}
            inputMode={field.type === 'number' ? 'numeric' : undefined}
            min={field.type === 'number' ? 0 : undefined}
            value={draft[field.key]}
            onChange={(event) => {
              const value = event.target.value;
              setDraft((prev) => (prev ? { ...prev, [field.key]: value } : prev));
            }}
            className={inputClass}
          />
        </FormField>
      ))}

      <div className="flex flex-col gap-3 md:col-span-2">
        <FormField id="pkg-photo" label="Photo (JPG, PNG or WebP, up to 3 MB)">
          <input
            id="pkg-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhoto}
            disabled={uploading}
            className="text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </FormField>
        {uploading && <p className="text-sm text-brand">Uploading photo...</p>}
        {draft.image && (
          <img
            src={draft.image}
            alt={draft.imageAlt || 'Package photo'}
            className="aspect-16/10 w-64 rounded-2xl object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-end">
        {saveError && (
          <p role="alert" className="text-sm text-coral sm:mr-auto">
            {saveError}
          </p>
        )}
        <Button variant="secondary" onClick={cancelEdit}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || uploading}>
          {busy ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );

  if (tab === 'vehicles') {
    return <VehicleManager onTabChange={setTab} onSessionEnd={handleSignOut} />;
  }
  if (tab === 'blog') {
    return <BlogManager onTabChange={setTab} onSessionEnd={handleSignOut} />;
  }

  return (
    <main id="main" className="min-h-screen bg-white pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Admin"
            title="Manage packages"
            subtitle="Changes appear on the Packages page straight away."
          />
          <div className="flex flex-wrap gap-3">
            <AdminTabs active="packages" onChange={setTab} />
            <Button onClick={startNew} disabled={isNew || editingId !== null}>
              Add package
            </Button>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        {saved && (
          <p role="status" className="mt-8 text-sm text-brand">
            {saved}
          </p>
        )}
        {listError && (
          <p role="alert" className="mt-8 text-sm text-coral">
            {listError}
          </p>
        )}

        <div className="mt-10 grid gap-6">
          {isNew && editor}

          {trips.map((trip) =>
            editingId === trip.id && editor ? (
              <div key={trip.id}>{editor}</div>
            ) : (
              <article
                key={trip.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-ink">{trip.destination}</h3>
                  <p className="text-sm text-ink/70">
                    {trip.state} · {formatDays(trip.days)} · {formatPriceRange(trip.priceFrom, trip.priceTo)} per person
                  </p>
                  <p className="text-sm text-ink/60">{trip.connection}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => startEdit(trip)} disabled={editingId !== null || isNew}>
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(trip)}
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
