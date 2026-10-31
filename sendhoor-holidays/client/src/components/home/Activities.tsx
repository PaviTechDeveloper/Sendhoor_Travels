import { motion } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '../motion/StaggerReveal';

interface Activity {
  name: string;
  image: string;
  imageAlt: string;
  description: string;
  where: string;
}

// Photos are from Wikimedia Commons. Credits are listed in the footer and in photoCredits.
const activities: Activity[] = [
  {
    name: 'Zip lining',
    image: '/images/activities/zip-lining.jpg',
    imageAlt: 'Zip line running over a river valley in Himachal',
    description: 'Glide over valleys and forest canopies on steel cables, with a harness and trained guides.',
    where: 'Rishikesh, Munnar',
  },
  {
    name: 'Paragliding',
    image: '/images/activities/paragliding.jpg',
    imageAlt: 'Paraglider flying over green hills at Bir Billing',
    description: 'Take off from a hillside with an instructor and float over green valleys and farmland.',
    where: 'Bir Billing, Himachal Pradesh',
  },
  {
    name: 'White-water rafting',
    image: '/images/activities/rafting.jpg',
    imageAlt: 'Rafting team paddling through fast river rapids',
    description: 'Paddle through fast river rapids with a guide and a team in a sturdy raft.',
    where: 'Rishikesh',
  },
  {
    name: 'Trekking',
    image: '/images/activities/trekking.jpg',
    imageAlt: 'Trekkers on the trail to Heart Lake below Chembra Peak',
    description: 'Walk forest trails and hilltop viewpoints at your own pace, with a local guide.',
    where: 'Western Ghats, Himalayan foothills',
  },
  {
    name: 'Scuba diving',
    image: '/images/activities/scuba-diving.jpg',
    imageAlt: 'Scuba diver exploring a coral reef',
    description: 'Explore coral reefs and sea life on a supervised dive, with a short beginner session first.',
    where: 'Gokarna, Andaman Islands',
  },
  {
    name: 'Quad biking',
    image: '/images/activities/quad-biking.jpg',
    imageAlt: 'Quad bikes riding across a desert',
    description: 'Ride quad bikes across sand dunes and dry countryside at sunset.',
    where: 'Jaipur, Jaisalmer',
  },
  {
    name: 'Bungee jumping',
    image: '/images/activities/bungee-jumping.jpg',
    imageAlt: 'Bungee jumper falling freely above the ground',
    description: 'Free-fall from a high platform above the river, secured by certified staff.',
    where: 'Rishikesh',
  },
  {
    name: 'Kayaking',
    image: '/images/activities/kayaking.jpg',
    imageAlt: 'Kayakers paddling on calm water',
    description: 'Paddle calm lagoons and backwaters in a sit-on-top kayak, guided or self-paced.',
    where: 'Alleppey, Gokarna',
  },
];

export default function Activities() {
  return (
    <section id="activities" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Adventure"
          title="Activities for every kind of adventurer"
          subtitle="Add an adrenaline activity to any trip. Our team arranges certified operators and safety briefings."
        />
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map(({ name, image, imageAlt, description, where }) => (
            <StaggerItem key={name} className="h-full">
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex h-full flex-col overflow-hidden rounded-3xl bg-sand ring-1 ring-ink/5 transition hover:shadow-lg"
              >
                <div className="relative aspect-4/3">
                  <img src={image} alt={imageAlt} loading="lazy" className="absolute inset-0 size-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-ink">{name}</h3>
                  <p className="mt-2 text-sm text-ink/70">{description}</p>
                  <p className="mt-auto pt-5 text-xs font-semibold tracking-wide text-brand uppercase">{where}</p>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
