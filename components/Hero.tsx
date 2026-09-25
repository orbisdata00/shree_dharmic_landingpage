import { preload } from "react-dom";
import HeroParticles from "./HeroParticles";
import { Mandala, delay } from "./ui";

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
        <p className="hero__label fade-up" style={delay(".2s")}>॥ श्री धार्मिक लीला ॥</p>
        <h1 className="hero__title fade-up" style={delay(".45s")}>
          Experience the Divine<br />
          <span>Through Dharmic Leela</span>
        </h1>
        <p className="hero__text fade-up" style={delay(".7s")}>Where devotion, tradition, culture, and timeless stories come together.</p>
        <div className="hero__actions fade-up" style={delay(".95s")}>
          <a href="#leela" className="btn btn--primary">Explore Our Leela</a>
          <a href="#about" className="btn btn--glass">Discover More</a>
        </div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll to About section">
        <span>Scroll</span><i></i>
      </a>
    </section>
  );
}
