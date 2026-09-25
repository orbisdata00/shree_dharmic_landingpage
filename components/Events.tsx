import { delay } from "./ui";

const EVENTS = [
  {
    title: "Dharmic Cultural Evening",
    date: "2026-10-11", day: "11", month: "Oct",
    place: "Open-Air Amphitheatre · 6:30 PM",
    text: "An evening of classical dance, devotional music and stories celebrating our shared heritage.",
    img: "event-evening.jpg", alt: "Three classical dancers in bright silk costumes and jasmine hair ornaments",
  },
  {
    title: "Divine Storytelling & Bhakti Sandhya",
    date: "2026-10-20", day: "20", month: "Oct",
    place: "Riverside Ghat · 5:45 PM",
    text: "Katha, bhajan and Sandhya aarti by the river as the sun sets — a gathering for the whole family.",
    img: "event-sandhya.jpg", alt: "Priests performing an evening aarti with tall brass lamps by the river",
  },
  {
    title: "Traditional Leela Celebration",
    date: "2026-11-08", day: "08", month: "Nov",
    place: "Community Maidan · 7:00 PM",
    text: "A grand staged Leela with live music, traditional costumes and a Deepotsav of a thousand diyas.",
    img: "event-leela.jpg", alt: "Ramlila actors in costume performing the Lakshman–Parashuram dialogue",
  },
];
const DELAYS = ["0s", ".12s", ".24s"];

export default function Events() {
  return (
    <section className="section events" id="events">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">Mark Your Calendar</p>
          <h2 className="h2">Upcoming Spiritual &amp; <em>Cultural Events</em></h2>
          <div className="ornament" aria-hidden="true"></div>
        </header>

        <div className="events__grid">
          {EVENTS.map((ev, i) => (
            <article className="e-card reveal" style={delay(DELAYS[i])} key={ev.title}>
              <div className="e-card__img">
                <img src={`/assets/img/${ev.img}`} alt={ev.alt} loading="lazy" />
                <time className="e-card__date" dateTime={ev.date}><strong>{ev.day}</strong><span>{ev.month}</span></time>
              </div>
              <div className="e-card__body">
                <p className="e-card__meta">
                  <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                  {ev.place}
                </p>
                <h3>{ev.title}</h3>
                <p>{ev.text}</p>
                <a href="#contact" className="e-card__link">View Details <span className="arrow">→</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
