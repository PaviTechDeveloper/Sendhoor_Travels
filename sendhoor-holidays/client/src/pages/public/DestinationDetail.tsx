import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Landmark, MapPin, Mountain } from 'lucide-react';
import FadeIn from '../../components/motion/FadeIn';
import { StaggerGroup, StaggerItem } from '../../components/motion/StaggerReveal';
import { destinationGuides } from '../../lib/destinationGuides';
import NotFound from './NotFound';

const ctaClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-coral/30 transition hover:bg-coral/90';

export default function DestinationDetail() {
  const { slug } = useParams();
  const guide = destinationGuides.find((item) => item.slug === slug);

  if (!guide) return <NotFound />;

  const facts = [
    { icon: MapPin, label: 'State / UT', value: guide.state },
    { icon: Landmark, label: 'Primary attraction', value: guide.attractionType },
    { icon: CalendarDays, label: 'Best time to visit', value: guide.bestTime },
  ];

  return (
    <main id="main" className="min-h-screen bg-sand">
      <section className="relative isolate overflow-hidden px-6 pt-32 pb-24 text-white md:pt-40">
        <img src={guide.image} alt={guide.imageAlt} className="absolute inset-0 -z-10 size-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/60 to-ink/20" />

        <div className="mx-auto max-w-6xl">
          <Link to="/destinations" className="inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white">
            <ArrowLeft className="size-4" aria-hidden />
            All destinations
          </Link>
          <FadeIn className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">{guide.state}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{guide.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">{guide.tagline}</p>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <StaggerGroup className="grid gap-6 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <StaggerItem key={label} className="h-full">
              <div className="h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm text-ink/60">{label}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          <FadeIn className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">About {guide.name}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink/75">{guide.overview}</p>
          </FadeIn>

          <FadeIn className="lg:col-span-2" delay={0.1}>
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink/5">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
                <Mountain className="size-5 text-brand" aria-hidden />
                Highlights
              </h2>
              <ul className="mt-5 space-y-3">
                {guide.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-ink/80">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand p-8 text-white md:flex-row md:items-center md:p-10">
          <div>
            <h2 className="text-2xl font-bold">Plan a trip to {guide.name}</h2>
            <p className="mt-2 text-white/80">Tell us your dates and travellers. We will send a tailored quote within 24 hours.</p>
          </div>
          <Link to="/#book" className={ctaClass}>
            Request a quote
          </Link>
        </FadeIn>
      </div>
    </main>
  );
}
