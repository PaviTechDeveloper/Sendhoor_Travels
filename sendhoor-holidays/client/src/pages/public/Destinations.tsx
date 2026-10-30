import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerReveal';
import { destinationGuides } from '../../lib/destinationGuides';

export default function Destinations() {
  return (
    <main id="main" className="min-h-screen bg-sand pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Destinations"
          title="Explore India’s favourite places"
          subtitle="Quick guides to what each place is known for and the best time to visit."
        />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinationGuides.map((guide) => (
            <StaggerItem key={guide.slug} className="h-full">
              <Link
                to={`/destinations/${guide.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <img
                    src={guide.image}
                    alt={guide.imageAlt}
                    loading="lazy"
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <p className="text-sm text-ink/60">{guide.state}</p>
                  <h2 className="text-xl font-semibold text-ink">{guide.name}</h2>
                  <p className="text-sm text-ink/70">{guide.attractionType}</p>
                  <p className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-brand">
                    <CalendarDays className="size-4" aria-hidden />
                    Best time: {guide.bestTime}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </main>
  );
}
