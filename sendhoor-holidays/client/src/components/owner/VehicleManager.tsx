import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import FormField, { inputClass } from '../forms/FormField';
import AdminTabs, { type AdminTab } from './AdminTabs';
import { fetchVehicles } from '../../lib/api';
import {
  createVehicle,
  deleteVehicle,
  getOwnerToken,
  updateVehicle,
  uploadPhoto,
} from '../../lib/ownerApi';
import { fuelTypes, type FuelType, type VehicleDetails, type VehicleRecord } from '../../lib/vehicles';

const MAX_PHOTOS = 6;

// The form works with text, so the numbers and feature lines are converted when saving.
interface Draft {
  name: string;
  seats: string;
  fuel: FuelType;
  available: string;
  bestFor: string;
  featuresText: string;
  photos: string[];
}

const blankDraft: Draft = {
  name: '',
  seats: '4',
  fuel: 'Petrol',
  available: '1',
  bestFor: '',
  featuresText: '',
  photos: [],
};

function draftFromVehicle(vehicle: VehicleRecord): Draft {
  return {
    name: vehicle.name,
    seats: String(vehicle.seats),
    fuel: vehicle.fuel,
    available: String(vehicle.available),
    bestFor: vehicle.bestFor,
    featuresText: vehicle.features.join('\n'),
    photos: vehicle.photos,
  };
}

function detailsFromDraft(draft: Draft): VehicleDetails | null {
  if (draft.seats.trim() === '' || draft.available.trim() === '') return null;
  const seats = Number(draft.seats);
  const available = Number(draft.available);
  if (!Number.isFinite(seats) || !Number.isFinite(available)) return null;

  return {
    name: draft.name,
    seats,
    fuel: draft.fuel,
    available,
    bestFor: draft.bestFor,
    features: draft.featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
    photos: draft.photos,
  };
}

interface VehicleManagerProps {
  onTabChange: (tab: AdminTab) => void;
  onSessionEnd: () => void;
}

export default function VehicleManager({ onTabChange, onSessionEnd }: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setListError('Could not load vehicles. Please refresh the page.'));
  }, []);

  const startEdit = (vehicle: VehicleRecord) => {
    setEditingId(vehicle.id);
    setIsNew(false);
    setDraft(draftFromVehicle(vehicle));
    setFormError(null);
    setMessage(null);
  };

  const startNew = () => {
    setEditingId(null);
    setIsNew(true);
    setDraft(blankDraft);
    setFormError(null);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsNew(false);
    setDraft(null);
    setFormError(null);
  };

  const handlePhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!draft || files.length === 0) return;

    const room = MAX_PHOTOS - draft.photos.length;
    if (files.length > room) {
      setFormError(`A vehicle can have up to ${MAX_PHOTOS} photos. You can add ${room} more.`);
      return;
    }

    setUploading(true);
    setFormError(null);
    try {
      for (const file of files) {
        const result = await uploadPhoto(file);
        if (!result.ok || !result.url) {
          setFormError(result.message ?? 'Could not upload a photo.');
          if (!getOwnerToken()) onSessionEnd();
          break;
        }
        const url = result.url;
        setDraft((prev) => (prev ? { ...prev, photos: [...prev.photos, url] } : prev));
      }
    } catch {
      setFormError('Could not read that photo. Try another file.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setDraft((prev) => (prev ? { ...prev, photos: prev.photos.filter((photo) => photo !== url) } : prev));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    const details = detailsFromDraft(draft);
    if (!details) {
      setFormError('Enter the number of seats and vehicles available as numbers.');
      return;
    }

    setBusy(true);
    setFormError(null);
    const result = isNew ? await createVehicle(details) : await updateVehicle(editingId ?? '', details);
    setBusy(false);

    if (!result.ok || !result.vehicle) {
      setFormError(result.message ?? 'Could not save. Please try again.');
      if (!getOwnerToken()) onSessionEnd();
      return;
    }

    const saved = result.vehicle;
    setVehicles((prev) =>
      isNew ? [...prev, saved] : prev.map((vehicle) => (vehicle.id === saved.id ? saved : vehicle)),
    );
    setMessage(isNew ? `${saved.name} is added. The Vehicles section shows it now.` : `${saved.name} is updated.`);
    cancelEdit();
  };

  const handleDelete = async (vehicle: VehicleRecord) => {
    if (!window.confirm(`Delete ${vehicle.name}? It will be removed from the Vehicles section.`)) return;

    setBusy(true);
    setListError(null);
    setMessage(null);
    const result = await deleteVehicle(vehicle.id);
    setBusy(false);

    if (!result.ok) {
      setListError(result.message ?? 'Could not delete the vehicle. Please try again.');
      if (!getOwnerToken()) onSessionEnd();
      return;
    }
    setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
    setMessage(`${vehicle.name} is deleted.`);
  };

  const editor = draft && (
    <form onSubmit={handleSave} className="grid gap-5 rounded-3xl bg-sand p-6 md:grid-cols-2 md:p-8">
      <FormField id="veh-name" label="Vehicle name">
        <input id="veh-name" type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
      </FormField>
      <FormField id="veh-fuel" label="Fuel type">
        <select id="veh-fuel" value={draft.fuel} onChange={(e) => setDraft({ ...draft, fuel: e.target.value as FuelType })} className={inputClass}>
          {fuelTypes.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </FormField>
      <FormField id="veh-seats" label="Number of seats">
        <input id="veh-seats" type="number" min={1} inputMode="numeric" value={draft.seats} onChange={(e) => setDraft({ ...draft, seats: e.target.value })} className={inputClass} />
      </FormField>
      <FormField id="veh-available" label="Vehicles available">
        <input id="veh-available" type="number" min={0} inputMode="numeric" value={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.value })} className={inputClass} />
      </FormField>
      <FormField id="veh-best" label="Best for">
        <input id="veh-best" type="text" value={draft.bestFor} onChange={(e) => setDraft({ ...draft, bestFor: e.target.value })} className={inputClass} />
      </FormField>
      <FormField id="veh-features" label="Features (one per line)">
        <textarea
          id="veh-features"
          rows={4}
          value={draft.featuresText}
          onChange={(e) => setDraft({ ...draft, featuresText: e.target.value })}
          className={`${inputClass} h-auto py-3`}
        />
      </FormField>

      <div className="grid gap-3 md:col-span-2">
        <p className="text-sm font-medium text-ink">
          Photos ({draft.photos.length}/{MAX_PHOTOS})
        </p>
        {draft.photos.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {draft.photos.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="size-28 rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute -top-2 -right-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-coral shadow ring-1 ring-ink/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <FormField id="veh-photos" label="Add photos (JPG, PNG or WebP, up to 3 MB each)">
          <input
            id="veh-photos"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotos}
            disabled={uploading || draft.photos.length >= MAX_PHOTOS}
            className="text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </FormField>
        {uploading && <p className="text-sm text-brand">Uploading photos...</p>}
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
          {busy ? 'Saving...' : 'Save changes'}
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
            title="Manage vehicles"
            subtitle="Changes appear in the Vehicles section straight away."
          />
          <div className="flex flex-wrap gap-3">
            <AdminTabs active="vehicles" onChange={onTabChange} />
            <Button onClick={startNew} disabled={isNew || editingId !== null}>
              Add vehicle
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

          {vehicles.map((vehicle) =>
            editingId === vehicle.id && editor ? (
              <div key={vehicle.id}>{editor}</div>
            ) : (
              <article
                key={vehicle.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {vehicle.photos[0] ? (
                    <img src={vehicle.photos[0]} alt="" className="size-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-sand text-xs text-ink/60">
                      No photos
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-ink">{vehicle.name}</h3>
                    <p className="text-sm text-ink/70">
                      {vehicle.seats} seats · {vehicle.fuel} · {vehicle.available} available · {vehicle.photos.length} photo
                      {vehicle.photos.length === 1 ? '' : 's'}
                    </p>
                    <p className="text-sm text-ink/60">{vehicle.bestFor}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => startEdit(vehicle)} disabled={editingId !== null || isNew}>
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(vehicle)}
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
