import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { navLinks } from '../../lib/siteContent';
import { scrollToSection } from '../../lib/scrollToSection';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Only the home page starts over the dark hero; every other page needs a solid bar from the top.
  const { pathname } = useLocation();
  const solid = scrolled || menuOpen || pathname !== '/';
  const textTone = solid ? 'text-white' : 'text-ink';

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-ink shadow-md' : 'bg-white/95 shadow-sm backdrop-blur-md'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" aria-label="Sendhoor Holidays home">
          <img src="/images/logo.png" alt="Sendhoor Holidays" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
        </Link>

        <span className={`flex-1 whitespace-nowrap text-center text-sm font-bold sm:text-base lg:hidden ${textTone}`}>
          Sendhoor Holidays
        </span>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className={`text-sm font-medium transition hover:opacity-70 ${textTone}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Button className="px-5 py-2.5" onClick={() => scrollToSection('book')}>
              Book a trip
            </Button>
          </div>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className={`rounded-full p-2 lg:hidden ${textTone}`}
          >
            {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <motion.ul
          id="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden border-t border-white/15 bg-ink px-6 pb-6 lg:hidden"
        >
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setMenuOpen(false)} className="block py-3 text-base font-medium text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.header>
  );
}
