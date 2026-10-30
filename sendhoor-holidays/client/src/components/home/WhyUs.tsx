import { Headset, Map, ShieldCheck, Wallet } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerReveal';

const reasons = [
  {
    icon: Map,
    title: 'Designed by specialists',
    text: 'Our advisors have visited the places they recommend, so every itinerary is realistic.',
  },
  {
    icon: Wallet,
    title: 'Transparent pricing',
    text: 'You see the full quote before you pay. No hidden fees added later.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure, clear booking',
    text: 'Clear cancellation terms and secure payment steps at every stage.',
  },
  {
    icon: Headset,
    title: 'Help on the road',
    text: 'A real person to call when plans change, day or night during your trip.',
  },
];

export default function WhyUs() {
  return (
    <section aria-labelledby="why-us-title" className="bg-sand py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Why Sendhoor" title="Travel planned around you" />
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title} className="h-full">
              <div className="h-full rounded-3xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
