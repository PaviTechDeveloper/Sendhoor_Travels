import { Link } from 'react-router-dom';
import FadeIn from '../../components/motion/FadeIn';

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center justify-center bg-sand px-6 pt-32 pb-24 text-center">
      <FadeIn>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Error 404</p>
        <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">This page took a wrong turn</h1>
        <p className="mt-4 text-ink/70">The page you were looking for does not exist or has moved.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-coral/30 transition hover:bg-coral/90"
        >
          Back to home
        </Link>
      </FadeIn>
    </main>
  );
}
