import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import HeroBackdrop from './HeroBackdrop';
import { scrollToSection } from '../../lib/scrollToSection';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="top" className="relative isolate overflow-hidden px-6 pt-32 pb-20 text-ink md:pt-44 md:pb-28">
      <HeroBackdrop />

      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-4xl font-bold tracking-tight drop-shadow-lg sm:text-5xl lg:text-6xl"
        >
          Journeys planned with care, from first idea to final photo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-ink/80"
        >
          Curated tour packages, flight and hotel requests, and fully custom trips for every kind of traveler.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button onClick={() => navigate('/packages')}>Explore packages</Button>
          <Button variant="ghost" onClick={() => scrollToSection('book')}>
            Request a quote
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
