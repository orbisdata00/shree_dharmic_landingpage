import { DiyaMark, Mandala } from "./ui";

const HIGHLIGHTS = [
  {
    title: "Traditional Values",
    text: "Honouring the wisdom of our ancestors",
    icon: <><path d="M12 3v18M5 8c0 4 3 7 7 7s7-3 7-7" /><path d="M8 21h8" /></>,
  },
  {
    title: "Spiritual Experiences",
    text: "Moments of bhakti, stillness and joy",
    icon: <><path d="M12 3c2.5 3.2 3.5 5.4 3.5 7a3.5 3.5 0 0 1-7 0c0-1.6 1-3.8 3.5-7z" /><path d="M3 15h18c-1 3.5-4.5 6-9 6s-8-2.5-9-6z" /></>,
  },
  {
    title: "Cultural Heritage",
    text: "Art, music and stories kept alive",
    icon: <><path d="M4 21V10l8-6 8 6v11" /><path d="M9 21v-6h6v6M12 4V1" /></>,
  },
];

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="pattern-bg" aria-hidden="true"></div>
      <div className="container about__grid">
        <div className="about__media reveal">
          <div className="about__frame">
            <div className="about__img" data-parallax="0.08">
              <img src="/assets/img/about.jpg" alt="A priest raising a flaming brass lamp during an evening aarti" loading="lazy" />
            </div>
          </div>
          <div className="about__badge glass">
            <DiyaMark className="icon-diya" />
            <div><strong>Sanatan Parampara</strong><span>Rooted in timeless tradition</span></div>
          </div>
          <Mandala className="about__mandala" />
        </div>

        <div className="about__content">
          <p className="eyebrow reveal">About Shree Dharmic Leela</p>
          <h2 className="h2 reveal">A Journey Through<br /><em>Faith, Culture &amp; Tradition</em></h2>
          <div className="ornament reveal" aria-hidden="true"></div>
          <p className="lead reveal">Shree Dharmic Leela brings timeless stories, spiritual traditions, and cultural expressions to life through devotion, creativity, and meaningful experiences.</p>

          <ul className="highlights">
            {HIGHLIGHTS.map((h) => (
              <li className="highlight reveal" key={h.title}>
                <span className="highlight__icon"><svg viewBox="0 0 24 24">{h.icon}</svg></span>
                <div><strong>{h.title}</strong><span>{h.text}</span></div>
              </li>
            ))}
          </ul>

          <a href="#leela" className="btn btn--outline reveal">Explore Our Story <span className="arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}
