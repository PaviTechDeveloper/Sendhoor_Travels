import Hero from '../../components/home/Hero';
import Destinations from '../../components/home/Destinations';
import Activities from '../../components/home/Activities';
import Vehicles from '../../components/home/Vehicles';
import WhyUs from '../../components/home/WhyUs';
import BlogTeaser from '../../components/home/BlogTeaser';
import BookingForm from '../../components/home/BookingForm';
import Faq from '../../components/home/Faq';
import ContactSection from '../../components/home/ContactSection';

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Destinations />
      <Activities />
      <Vehicles />
      <WhyUs />
      <BlogTeaser />
      <BookingForm />
      <Faq />
      <ContactSection />
    </main>
  );
}
