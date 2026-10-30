import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, Car, Check, Fuel } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import { StaggerGroup, StaggerItem } from '../motion/StaggerReveal';
import { fetchVehicles } from '../../lib/api';
import type { VehicleRecord } from '../../lib/vehicles';
import { scrollToSection } from '../../lib/scrollToSection';

function Gallery({ vehicle, Icon }: { vehicle: VehicleRecord; Icon: typeof Car }) {
  const [active, setActive] = useState(0);

  if (vehicle.photos.length === 0) {
    return (
      <div className="flex aspect-16/10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Icon className="size-16" aria-hidden />
      </div>
    );
  }

  return (
    <div>
      <img
        src={vehicle.photos[active]}
        alt={`${vehicle.name} photo ${active + 1} of ${vehicle.photos.length}`}
        loading="lazy"
        className="aspect-16/10 w-full rounded-2xl object-cover"
      />
      {vehicle.photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {vehicle.photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === active}
              className={`size-14 shrink-0 overflow-hidden rounded-xl ring-2 ${index === active ? 'ring-brand' : 'ring-transparent'}`}
            >
              <img src={photo} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: VehicleRecord }) {
  const Icon = vehicle.seats > 10 ? Bus : Car;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-md ring-1 ring-ink/5 transition hover:shadow-xl"
    >
      <Gallery vehicle={vehicle} Icon={Icon} />

      <div className="mt-6 flex items-start justify-between">
        <h3 className="text-xl font-semibold text-ink">{vehicle.name}</h3>
        <p className="text-right">
          <span className="text-3xl font-bold text-ink">{vehicle.seats}</span>
          <span className="ml-2 text-sm font-medium text-ink/60">seats</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-ink">
          <Fuel className="size-3.5 text-brand" aria-hidden />
          {vehicle.fuel}
        </span>
        <span className="rounded-full bg-sand px-3 py-1 text-ink">
          {vehicle.available} {vehicle.available === 1 ? 'vehicle' : 'vehicles'} available
        </span>
      </div>

      <p className="mt-4 text-sm text-ink/70">{vehicle.bestFor}</p>

      <ul className="mt-5 space-y-3 text-sm text-ink/80">
        {vehicle.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Button variant="secondary" className="w-full" onClick={() => scrollToSection('book')}>
          Enquire for this vehicle
        </Button>
      </div>
    </motion.article>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetchVehicles().then(setVehicles).catch(() => setLoadFailed(true));
  }, []);

  return (
    <section id="vehicles" className="scroll-mt-24 bg-sand py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Vehicles"
          title="The right vehicle for your group"
          subtitle="Air-conditioned vehicles with experienced drivers, from a small family car to a full coach."
        />
        {loadFailed && (
          <p role="alert" className="mt-14 text-center text-coral">
            We could not load the vehicles right now. Please refresh the page or call us on 8754610755.
          </p>
        )}
        {!loadFailed && !vehicles && <p className="mt-14 text-center text-ink/60">Loading vehicles...</p>}
        {vehicles && (
          <StaggerGroup className="mt-14 grid gap-8 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <StaggerItem key={vehicle.id} className="h-full">
                <VehicleCard vehicle={vehicle} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}
