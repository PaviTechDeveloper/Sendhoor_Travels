// PLACEHOLDER CONTENT. Destinations, prices, ratings, testimonials, offers and
// posts are sample data. Replace with real Sendhoor Holidays content before launch.

export interface Destination {
  name: string;
  country: string;
  tagline: string;
  image: string;
  imageAlt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PhotoCredit {
  subject: string;
  photographer: string;
  license: string;
  source: string;
}

export const navLinks = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Packages', to: '/packages' },
  { label: 'Admin', to: '/admin' },
  { label: 'Vehicles', to: '/#vehicles' },
  { label: 'Blog', to: '/#blog' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Contact', to: '/#contact' },
];

// Photos are from Wikimedia Commons. Credits are listed in the footer and in photoCredits.
const photo = {
  kerala: { image: '/images/kerala.jpg', imageAlt: 'Houseboats on the Kerala backwaters' },
  udaipur: { image: '/images/udaipur.jpg', imageAlt: 'City Palace in Udaipur beside Lake Pichola' },
  bali: { image: '/images/bali.jpg', imageAlt: 'Green rice terraces in Ubud, Bali' },
  swissAlps: { image: '/images/swiss-alps.jpg', imageAlt: 'The Matterhorn seen from the Gornergrat railway' },
  dubai: { image: '/images/dubai.jpg', imageAlt: 'Dubai skyline with the Burj Khalifa' },
  maldives: { image: '/images/maldives.jpg', imageAlt: 'Overwater bungalows in the Maldives' },
};

export const destinations: Destination[] = [
  { name: 'Kerala', country: 'India', tagline: 'Backwaters and slow mornings', ...photo.kerala },
  { name: 'Rajasthan', country: 'India', tagline: 'Palaces, deserts and folk music', ...photo.udaipur },
  { name: 'Bali', country: 'Indonesia', tagline: 'Temples, rice terraces and surf', ...photo.bali },
  { name: 'Swiss Alps', country: 'Switzerland', tagline: 'Peaks, trains and fresh air', ...photo.swissAlps },
  { name: 'Dubai', country: 'UAE', tagline: 'Skylines, deserts and shopping', ...photo.dubai },
  { name: 'Maldives', country: 'Maldives', tagline: 'Overwater villas and lagoons', ...photo.maldives },
];

export const faqs: FaqItem[] = [
  { question: 'How do I book a trip?', answer: 'Choose a package or send a booking request. Our advisors confirm availability and send you a quote within 24 hours.' },
  { question: 'Can I customize a package?', answer: 'Yes. Every package can be changed for dates, hotels, transport and activities. Tell us what you want in the request form.' },
  { question: 'How does payment work?', answer: 'You pay a deposit to confirm your booking and the balance before departure. Payment details are shared with your quote.' },
  { question: 'What is your cancellation policy?', answer: 'Policy depends on the package and how close the cancellation is to departure. The exact terms are shown in your quote.' },
  { question: 'Do you help with visas and travel documents?', answer: 'We advise on requirements for each destination. You remain responsible for valid documents and visas.' },
];

export const photoCredits: PhotoCredit[] = [
  { subject: 'Kerala backwaters houseboats', photographer: 'Vyacheslav Argenberg', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Kerala_backwaters,_Houseboats,_India.jpg' },
  { subject: 'City Palace, Udaipur', photographer: 'Hirumon', license: 'CC BY 3.0', source: 'https://commons.wikimedia.org/wiki/File:City_Palace_Udaipur_Rajasthan_India.JPG' },
  { subject: 'Rice terraces, Ubud, Bali', photographer: 'Vyacheslav Argenberg', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Rice_terraces,_Ubud,_Bali.jpg' },
  { subject: 'Taj Mahal, Agra', photographer: 'Yann', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India_edit2.jpg' },
  { subject: 'Hawa Mahal, Jaipur', photographer: 'Chainwit.', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg' },
  { subject: 'Tea estate, Munnar', photographer: 'Nikolas Becker', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Tea_Estate_Munnar.jpg' },
  { subject: 'Ghats on the Ganga, Varanasi', photographer: 'Marcin Białek', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Varanasi_2010_ghats3.jpg' },
  { subject: 'Vagator Beach, Goa', photographer: 'Vyacheslav Argenberg', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Vagator_Beach,_Goa,_India,_Palms.jpg' },
  { subject: 'Lake Pichola at sunset, Udaipur', photographer: 'UnpetitproleX', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Lake_Pichola_at_sunset,_Udaipur,_Rajasthan,_India.jpg' },
  { subject: 'Pangong Lake, Ladakh', photographer: 'KennyOMG', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Pangong_Tso_2.jpg' },
  { subject: 'Tea plantations, Darjeeling', photographer: 'Vyacheslav Argenberg', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Darjeeling,_India,_Tea_plantations_on_hills.jpg' },
  { subject: 'Krishna Pushkarani, Hampi', photographer: 'Dey.sandip', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Krishna_Pushkarani_-_Hampi_Ruins.jpg' },
  { subject: 'Chinese fishing nets, Kochi', photographer: 'Ingo Mehling', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Chinese_Fishing_Nets_-_3.jpg' },
  { subject: 'Matterhorn and Gornergrat railway', photographer: 'Alps', license: 'Public domain', source: 'https://commons.wikimedia.org/wiki/File:2007_Matterhorn.jpg' },
  { subject: 'Dubai skyline with Burj Khalifa', photographer: 'Tim Reckmann', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Dubai_Skyline_mit_Burj_Khalifa_(18241030269).jpg' },
  { subject: 'Overwater bungalows, Maldives', photographer: 'Hungryjacks77', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:MaldivesBungalows.jpg' },
  { subject: 'Varkala cliffs at sunset', photographer: 'Krissubh', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Varkala_Cliff_Sunset_by_KS.jpg' },
  { subject: 'Houseboat, Alleppey backwaters', photographer: 'Paul Arps', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:Houseboat_on_Alleppey_backwaters_(Kerala,_India_2023)_(52703799657).jpg' },
  { subject: 'Toy train, Ooty', photographer: 'Sujan Bandyopadhyay', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Toy_train_in_picturesque_Ooty.jpg' },
  { subject: 'Promenade Beach, Pondicherry', photographer: 'Vyacheslav Argenberg', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:Pondicherry,_Promenade_Beach,_Bay_of_Bengal,_India.jpg' },
  { subject: 'Main beach, Gokarna', photographer: 'Alexey Komarov', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Gokarna_Main_Beach_in_January_2023.jpg' },
  { subject: 'Waterfall near Lonavala', photographer: 'Shishirdasika', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Lonavala_waterfalls.jpg' },
  { subject: 'River rafting, Rishikesh', photographer: 'Goutam1962', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:River_Rafting_in_Ganga_Near_Ram_Jhula_Rishikesh_01.jpg' },
];
