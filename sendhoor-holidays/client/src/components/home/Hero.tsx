import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { scrollToSection } from '../../lib/scrollToSection';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="top" className="relative overflow-hidden bg-white px-6 pt-28 pb-20 text-ink md:pt-36 md:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Journeys planned with care, from first idea to final photo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-xl text-lg text-ink/80"
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
            <Button variant="ghost" onClick={() => scrollToSection('book')}>
              Request a quote
            </Button>
          </motion.div>        </div>

        <motion.img
          src="/images/hero-island.jpg"
          alt="Palm trees on a tropical island with a beach ball, a life ring, sunglasses and an anchor"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="aspect-square w-full rounded-3xl object-cover shadow-2xl shadow-ink/20"
        />
      </div>
    </section>
  );
}
