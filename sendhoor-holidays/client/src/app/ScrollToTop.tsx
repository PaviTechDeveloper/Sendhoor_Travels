import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../lib/scrollToSection';

// Resets scroll on route change, or scrolls to the section named in the URL hash (e.g. /#faq).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    // Wait one tick so the target section has rendered after a route change.
    const timer = window.setTimeout(() => scrollToSection(hash.slice(1)), 50);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
