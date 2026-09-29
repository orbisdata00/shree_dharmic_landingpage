import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import LeelaCarousel from "@/components/LeelaCarousel";
import Streaming from "@/components/Streaming";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import Heritage from "@/components/Heritage";
import Community from "@/components/Community";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import ScrollEffects from "@/components/ScrollEffects";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        {/* Order follows the brand guidelines: Hero & blessings → About → Leela → Events →
            Gallery → Heritage (Committee) → Updates → Community (Volunteer) → Contact */}
        <About />
        <LeelaCarousel />
        <Events />
        <Gallery />
        <Heritage />
        <Streaming />
        <Community />
        <Newsletter />
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
