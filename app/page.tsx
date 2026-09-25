import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Celebrate from "@/components/Celebrate";
import LeelaCarousel from "@/components/LeelaCarousel";
import Experience from "@/components/Experience";
import Streaming from "@/components/Streaming";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import Quote from "@/components/Quote";
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
        <About />
        <Celebrate />
        <LeelaCarousel />
        <Experience />
        <Streaming />
        <Events />
        <Gallery />
        <Quote />
        <Community />
        <Newsletter />
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
