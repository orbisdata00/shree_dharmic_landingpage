import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import LeelaCarousel from "@/components/LeelaCarousel";
import Streaming from "@/components/Streaming";
import LatestPosts from "@/components/LatestPosts";
import Events from "@/components/Events";
import BhumiPoojanPreview from "@/components/BhumiPoojanPreview";
import Heritage from "@/components/Heritage";
import Community from "@/components/Community";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import ScrollEffects from "@/components/ScrollEffects";
import "./post-card.css";
import "./bhumi-preview.css";

// Re-render at most once a minute so newly published blog posts appear on the home page.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        {/* Order follows the brand guidelines: Hero & blessings → About → Leela → Events →
            Bhumi Poojan → Heritage (Committee) → Updates → Blog → Community (Volunteer) → Contact */}
        <About />
        <LeelaCarousel />
        <Events />
        <BhumiPoojanPreview />
        <Heritage />
        <Streaming />
        <LatestPosts />
        <Community />
        <Newsletter />
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
