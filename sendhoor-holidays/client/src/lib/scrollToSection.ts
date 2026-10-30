export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) {
    // The section only exists on the home page. Move there at its hash; ScrollToTop scrolls to it.
    window.history.pushState(null, '', `/#${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
