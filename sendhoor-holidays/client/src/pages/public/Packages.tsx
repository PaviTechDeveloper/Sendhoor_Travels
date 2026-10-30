import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Wallet } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import Button from '../../components/ui/Button';
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerReveal';
import { formatDays, formatPriceRange, type TwoDayTrip } from '../../lib/twoDayTrips';
import { fetchPackages } from '../../lib/api';
import { scrollToSection } from '../../lib/scrollToSection';

function TwoDayCard({ trip, rank }: { trip: TwoDayTrip; rank: number }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-ink/5 transition hover:shadow-xl"
    >
      <div className="relative aspect-16/10">
        <img src={trip.image} alt={trip.imageAlt} loading="lazy" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink">
          {trip.state}
        </span>
        <span className="absolute top-4 right-4 text-sm font-semibold text-white">#{rank}</span>
        <h3 className="absolute inset-x-6 bottom-5 text-2xl font-bold tracking-tight text-white">{trip.destination}</h3>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm text-ink/70">{trip.vibe}</p>
        <p className="mt-4 flex items-start gap-2 text-sm text-ink/60">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {trip.connection}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink/60">
          <CalendarDays className="size-4" aria-hidden />
          {formatDays(trip.days)}
        </p>

        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="flex items-center gap-2 text-xl font-bold text-ink">
              <Wallet className="size-5 text-brand" aria-hidden />
              {formatPriceRange(trip.priceFrom, trip.priceTo)}
            </p>
            <p className="text-xs text-ink/50">per person, on-ground estimate</p>
          </div>
          <Button variant="secondary" className="px-4 py-2 text-sm" onClick={() => scrollToSection('book')}>
            Enquire
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Packages() {
  const [trips, setTrips] = useState<TwoDayTrip[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetchPackages().then(setTrips).catch(() => setLoadFailed(true));
  }, []);

  return (
    <main id="main" className="min-h-screen bg-white pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <section aria-label="Top 10 places for a 2-day trip in India">
          <SectionHeading
            eyebrow="Packages"
            title="Top 10 places for a 2-day trip in India"
            subtitle="Ideal on-ground budgets per person for two days. Costs of getting there are not included."
          />
          <div className="mt-8 flex justify-center">
            <Link
              to="/admin"
              className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink ring-1 ring-ink/15 transition hover:bg-sand"
            >
              Owner login: manage packages
            </Link>
          </div>
          {loadFailed && (
            <p role="alert" className="mt-14 text-center text-coral">
              We could not load the packages right now. Please refresh the page or call us on 8754610755.
            </p>
          )}
          {!loadFailed && !trips && <p className="mt-14 text-center text-ink/60">Loading packages...</p>}
          {trips && (
            <StaggerGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip, index) => (
                <StaggerItem key={trip.id} className="h-full">
                  <TwoDayCard trip={trip} rank={index + 1} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </section>
      </div>
    </main>
  );
}
