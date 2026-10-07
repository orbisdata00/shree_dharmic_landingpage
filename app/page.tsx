import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Heritage from "@/components/Heritage";
import Footer from "@/components/Footer";
import ScrollEffects from "@/components/ScrollEffects";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        {/* Home introduces the committee only; Leela, Events, Updates, Blog, Volunteer and
            Contact each have their own page in the menu. */}
        <About />
        <Heritage />
      </main>
      <Footer />
      <ScrollEffects />
    </>
  );
}
