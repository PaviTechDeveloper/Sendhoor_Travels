import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerReveal';
import { destinations } from '../../lib/siteContent';

export default function Destinations() {
  return (
    <section id="destinations" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Destinations"
          title="Where will you go next?"
          subtitle="Places our travel designers know best, from quiet backwaters to snow-capped peaks."
        />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <StaggerItem key={destination.name}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-3xl shadow-lg sm:aspect-4/5"
              >
                <img
                  src={destination.image}
                  alt={destination.imageAlt}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-sm text-white/80">{destination.country}</p>
                  <h3 className="text-2xl font-semibold">{destination.name}</h3>
                  <p className="mt-1 text-sm text-white/85">{destination.tagline}</p>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 text-center">
          <Link
            to="/destinations"
            className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Explore all destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
