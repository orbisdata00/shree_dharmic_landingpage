import { delay } from "./ui";

const CARDS = [
  {
    title: "Divine Stories",
    text: "Visual storytelling inspired by timeless Dharmic traditions.",
    img: "celebrate-stories.jpg",
    alt: "Kathakali performers enacting an epic story on stage",
    icon: <><path d="M2 5c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1v14c-3-1.5-7-1.5-10 1-3-2.5-7-2.5-10-1z" /><path d="M12 6v14" /></>,
  },
  {
    title: "Sacred Traditions",
    text: "Celebrating rituals, customs, and cultural heritage.",
    img: "celebrate-traditions.jpg",
    alt: "Earthen diyas glowing around a vibrant rangoli",
    icon: <><path d="M12 3c2.5 3.2 3.5 5.4 3.5 7a3.5 3.5 0 0 1-7 0c0-1.6 1-3.8 3.5-7z" /><path d="M3 15h18c-1 3.5-4.5 6-9 6s-8-2.5-9-6z" /></>,
  },
  {
    title: "Community",
    text: "Bringing people together through shared spiritual experiences.",
    img: "celebrate-community.jpg",
    alt: "Devotees gathered around the chariots of the Puri Rath Yatra",
    icon: <><circle cx="12" cy="7" r="3" /><circle cx="5" cy="9" r="2.2" /><circle cx="19" cy="9" r="2.2" /><path d="M6 21v-3a6 6 0 0 1 12 0v3M1.5 19v-1.5A3.5 3.5 0 0 1 5 14M22.5 19v-1.5A3.5 3.5 0 0 0 19 14" /></>,
  },
  {
    title: "Culture & Art",
    text: "Keeping traditional art, music, performance, and expression alive.",
    img: "celebrate-art.jpg",
    alt: "A Bharatanatyam dancer in expressive pose",
    icon: <><path d="M12 20c-4 0-8-3-8-8 3 0 6 1.5 8 4 2-2.5 5-4 8-4 0 5-4 8-8 8z" /><path d="M12 16c-1.8-2.2-2.5-4.5-2.5-6.5S10.5 5 12 3c1.5 2 2.5 4.5 2.5 6.5S13.8 13.8 12 16z" /></>,
  },
];

export default function Celebrate() {
  return (
    <section className="section celebrate" id="celebrate">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">What We Celebrate</p>
          <h2 className="h2">Celebrating the Spirit of <em>Dharma</em></h2>
          <div className="ornament" aria-hidden="true"></div>
        </header>

        <div className="celebrate__grid">
          {CARDS.map((card, i) => (
            <article className="c-card reveal" style={delay(`${i ? `.${i}` : "0"}s`)} key={card.title}>
              <div className="c-card__img"><img src={`/assets/img/${card.img}`} alt={card.alt} loading="lazy" /></div>
              <div className="c-card__body">
                <span className="c-card__icon"><svg viewBox="0 0 24 24">{card.icon}</svg></span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
