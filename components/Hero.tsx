import { preload } from "react-dom";
import HeroParticles from "./HeroParticles";
import { Mandala, delay } from "./ui";
import { BRAND } from "@/lib/brand";

const HERO_IMAGE = "/assets/img/hero.jpg";

export default function Hero() {
  preload(HERO_IMAGE, { as: "image", fetchPriority: "high" });

  return (
    <section className="hero" id="home">
      <div className="hero__media" data-parallax="0.25">
        <img src={HERO_IMAGE} alt="Priests performing the evening Ganga Aarti in Varanasi, bathed in golden lamplight and incense smoke" fetchPriority="high" />
      </div>
      <div className="hero__overlay"></div>
      <HeroParticles />
      <Mandala className="hero__mandala" />

      <div className="hero__content container">
        <p className="hero__label fade-up" style={delay(".2s")}>॥ श्री धार्मिक लीला कमेटी ॥</p>
        <p className="hero__blessing fade-up" style={delay(".35s")}>{BRAND.blessing}</p>
        <h1 className="hero__title fade-up" style={delay(".5s")}>
          Tradition That Brings<br />
          <span>Generations Together</span>
        </h1>
        <p className="hero__text fade-up" style={delay(".7s")}>For over a century, the {BRAND.name} has kept the sacred tradition of Leela alive - in dharma, devotion, maryada, truth and community.</p>
        <div className="hero__actions fade-up" style={delay(".95s")}>
          <a href="#leela" className="btn btn--primary">Explore the Leela</a>
          <a href="#events" className="btn btn--glass">Upcoming Events</a>
        </div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll to About section">
        <span>Scroll</span><i></i>
      </a>
    </section>
  );
}
