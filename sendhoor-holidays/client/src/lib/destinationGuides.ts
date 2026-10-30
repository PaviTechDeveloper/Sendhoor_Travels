// PLACEHOLDER COPY. Overviews and highlights are drafts for review. Check facts and wording before launch.

export interface DestinationGuide {
  slug: string;
  name: string;
  state: string;
  attractionType: string;
  bestTime: string;
  tagline: string;
  overview: string;
  highlights: string[];
  image: string;
  imageAlt: string;
}

export const destinationGuides: DestinationGuide[] = [
  {
    slug: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    attractionType: 'Historical / Monument',
    bestTime: 'October – March',
    tagline: 'Home of the Taj Mahal',
    overview:
      'Agra is best known for the Taj Mahal, the white-marble mausoleum built in the 17th century. The city also has Agra Fort and Mehtab Bagh, a garden across the river that offers a quiet view of the monument at sunset.',
    highlights: [
      'Sunrise visit to the Taj Mahal',
      'Agra Fort and its palace halls',
      'Mehtab Bagh sunset views',
      'Marble inlay workshops',
    ],
    image: '/images/agra.jpg',
    imageAlt: 'The Taj Mahal in Agra',
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    attractionType: 'Royal Palaces & Forts',
    bestTime: 'November – February',
    tagline: 'The Pink City of palaces and forts',
    overview:
      'Jaipur, the capital of Rajasthan, is known as the Pink City. Its forts and palaces, including Amber Fort and the City Palace, show the history of its rulers. The Hawa Mahal and the Jantar Mantar observatory are close enough to visit in one day.',
    highlights: [
      'Amber Fort and its mirror-work halls',
      'Hawa Mahal (Palace of Winds)',
      'City Palace complex',
      'Jantar Mantar observatory',
    ],
    image: '/images/jaipur.jpg',
    imageAlt: 'The Hawa Mahal in Jaipur',
  },
  {
    slug: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    attractionType: 'Hill Station & Tea Gardens',
    bestTime: 'September – March',
    tagline: 'Rolling tea estates in the Western Ghats',
    overview:
      'Munnar sits in the Western Ghats, where three rivers meet. Its hills are covered with tea estates, and the cool climate suits slow walks and scenic drives. Eravikulam National Park is home to the endangered Nilgiri tahr.',
    highlights: [
      'Tea estate walks and factory visits',
      'Eravikulam National Park',
      'Mattupetty Dam and Echo Point',
      'Tea Museum',
    ],
    image: '/images/munnar.jpg',
    imageAlt: 'Tea estate on the hills of Munnar',
  },
  {
    slug: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    attractionType: 'Spirituality & Culture',
    bestTime: 'October – March',
    tagline: 'Ghats, Ganga Aarti and living tradition',
    overview:
      'Varanasi is one of the oldest continuously inhabited cities in the world. Its ghats along the Ganga are the centre of daily ritual, and the evening Ganga Aarti is one of the city’s best-known events.',
    highlights: [
      'Sunrise boat ride on the Ganga',
      'Evening Ganga Aarti at Dashashwamedh Ghat',
      'Kashi Vishwanath Temple',
      'Silk weaving lanes',
    ],
    image: '/images/varanasi.jpg',
    imageAlt: 'Ghats along the Ganga in Varanasi',
  },
  {
    slug: 'goa',
    name: 'Goa',
    state: 'Goa',
    attractionType: 'Beaches & Nightlife',
    bestTime: 'November – February',
    tagline: 'Sun, sand and Portuguese heritage',
    overview:
      'Goa has beaches for every mood, from quiet Palolem to lively Baga. Its Portuguese-era churches in Old Goa and colourful villages add history to the coastline.',
    highlights: [
      'Beach hopping in North and South Goa',
      'Old Goa churches (UNESCO World Heritage Site)',
      'Sunset cruises on the Mandovi river',
      'Beach shacks and night markets',
    ],
    image: '/images/goa.jpg',
    imageAlt: 'Palm-lined beach in Goa',
  },
  {
    slug: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    attractionType: 'Lakes & Palaces',
    bestTime: 'October – March',
    tagline: 'The City of Lakes',
    overview:
      'Udaipur is set around a group of lakes in the Aravalli hills. The City Palace overlooks Lake Pichola, and the lake is best seen by boat at sunset. The old lanes, gardens and havelis are easy to explore on foot.',
    highlights: [
      'City Palace complex',
      'Sunset boat ride on Lake Pichola',
      'Saheliyon ki Bari garden',
      'Jagdish Temple',
    ],
    image: '/images/udaipur-lake.jpg',
    imageAlt: 'Lake Pichola at sunset in Udaipur',
  },
  {
    slug: 'ladakh',
    name: 'Ladakh',
    state: 'Ladakh (UT)',
    attractionType: 'Mountains & High-altitude Lakes',
    bestTime: 'June – September',
    tagline: 'High passes, monasteries and blue lakes',
    overview:
      'Ladakh is a high desert region at the top of the Himalayas. Pangong Lake, which changes colour through the day, and the monasteries around Leh are the main attractions. Spend a day or two acclimatising, because the altitude is high.',
    highlights: [
      'Pangong Lake day trip',
      'Thiksey and Hemis monasteries',
      'Nubra Valley and Khardung La pass',
      'Leh bazaar and local food',
    ],
    image: '/images/leh.jpg',
    imageAlt: 'Pangong Lake in Ladakh',
  },
  {
    slug: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    attractionType: 'Hill Station & Tea Gardens',
    bestTime: 'March – May, October – November',
    tagline: 'Tea hills and views of Kangchenjunga',
    overview:
      'Darjeeling is a hill town in the Eastern Himalayas, known for its tea gardens and its views of Kangchenjunga, the third-highest mountain in the world. The toy train climbs from the plains, and tea estates can be visited around the town.',
    highlights: [
      'Sunrise at Tiger Hill',
      'Darjeeling Himalayan Railway (toy train)',
      'Tea estate visits',
      'Batasia Loop and War Memorial',
    ],
    image: '/images/darjeeling.jpg',
    imageAlt: 'Tea plantations on the hills of Darjeeling',
  },
  {
    slug: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    attractionType: 'UNESCO Ruins & Boulder Landscape',
    bestTime: 'October – February',
    tagline: 'Ruins of the Vijayanagara empire',
    overview:
      'Hampi was the capital of the Vijayanagara empire between the 14th and 16th centuries. Its temples, bazaars and palaces are spread across a landscape of granite boulders. Walking and cycling are the best ways to see the ruins.',
    highlights: [
      'Virupaksha Temple',
      'Vittala Temple and stone chariot',
      'Lotus Mahal and Elephant Stables',
      'Sunset from Matanga Hill',
    ],
    image: '/images/hampi.jpg',
    imageAlt: 'Krishna Pushkarani tank among the ruins of Hampi',
  },
  {
    slug: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    attractionType: 'Heritage & Harbour',
    bestTime: 'October – March',
    tagline: 'Colonial streets and Chinese fishing nets',
    overview:
      'Kochi is a port city with layers of history. Portuguese, Dutch and British influence can all be seen in Fort Kochi and Mattancherry. The Chinese fishing nets on the shore are a well-known sight, and the Kerala backwaters are a short trip away.',
    highlights: [
      'Chinese fishing nets at sunset',
      'Mattancherry Palace (Dutch Palace)',
      'Kathakali dance performance',
      'Backwater cruise from Kochi',
    ],
    image: '/images/kochi.jpg',
    imageAlt: 'Chinese fishing nets on the shore in Kochi',
  },
];
