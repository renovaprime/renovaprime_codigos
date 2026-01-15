import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Services from '../components/home/Services';
import Specialties from '../components/home/Specialties';
import Plans from '../components/home/Plans';
import Testimonials from '../components/home/Testimonials';
import Contact from '../components/home/Contact';
import FinalCTA from '../components/home/FinalCTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Services />
      <Specialties />
      <Plans />
      <Testimonials />
      <Contact />
      <FinalCTA />
    </main>
  );
}
