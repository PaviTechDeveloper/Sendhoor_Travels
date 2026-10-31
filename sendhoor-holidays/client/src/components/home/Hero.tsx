import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { scrollToSection } from '../../lib/scrollToSection';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[620px] items-center overflow-hidden bg-sky-950 px-6 pb-20 pt-32 text-white md:min-h-[700px] md:pb-24 md:pt-36"
    >
      <img
        src="/images/hero-beach-family.jpg"
        alt="A family enjoying a sunny beach holiday together"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_58%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-950/75 via-sky-950/45 to-sky-950/5" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-sky-950/20 to-transparent" />

      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-2xl text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight drop-shadow sm:text-5xl lg:text-6xl"
          >
            Journeys planned with care, from first idea to final photo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-xl text-lg text-white/95 drop-shadow sm:text-xl"
          >
            Curated tour packages, flight and hotel requests, and fully custom trips for every kind of traveler.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-start gap-3 sm:flex-row"
          >
            <Button onClick={() => navigate('/packages')}>Explore packages</Button>
            <Button
              variant="secondary"
              onClick={() => scrollToSection('book')}
              className="bg-white/95"
            >
              Request a quote
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
