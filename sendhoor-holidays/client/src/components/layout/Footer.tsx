import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { navLinks } from '../../lib/siteContent';

export default function Footer() {
  return (
    <footer className="bg-sky text-ink/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
        <div>
          <img src="/images/logo.png" alt="Sendhoor Holidays" className="h-32 w-32 object-contain" />
          <p className="mt-4 text-lg font-bold text-ink">Sendhoor Holidays</p>
          <p className="mt-3 max-w-xs text-sm">
            Thoughtfully planned trips, honest advice and support from the first enquiry to the final day.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-sm font-semibold uppercase tracking-wider text-ink">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-ink">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>Rakkiyapalayam, Ammapalayam, Avinashi, Tiruppur - 641652</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              <span>
                <a href="tel:+918754610755" className="transition hover:text-ink">8754610755</a>
                {' / '}
                <a href="tel:+917397394833" className="transition hover:text-ink">7397394833</a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              <a href="mailto:sendhoorholidays2004@gmail.com" className="transition hover:text-ink">sendhoorholidays2004@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="size-4 shrink-0" aria-hidden />
              <a
                href="https://www.instagram.com/sendhoor_holidays_/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-ink"
              >
                @sendhoor_holidays_
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">

        <p className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-ink/60">
          © {new Date().getFullYear()} Sendhoor Holidays. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
