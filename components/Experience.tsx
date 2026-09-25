import { Mandala, delay } from "./ui";

const ITEMS = [
  { title: "Devotion", text: "Heartfelt bhakti and prayer", icon: <path d="M12 21s-7-4.4-9-9.5C1.6 7.8 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 22.4 7.8 21 11.5 19 16.6 12 21 12 21z" /> },
  { title: "Music", text: "Bhajans, kirtan & classical ragas", icon: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></> },
  { title: "Storytelling", text: "Katha from the epics & Puranas", icon: <><path d="M2 5c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1v14c-3-1.5-7-1.5-10 1-3-2.5-7-2.5-10-1z" /><path d="M12 6v14" /></> },
  { title: "Traditional Performances", text: "Dance, drama & folk theatre", icon: <><circle cx="12" cy="4.5" r="2" /><path d="M12 7v6l-4 7M12 13l4 7M5 9l7 1 7-3" /></> },
  { title: "Spiritual Gatherings", text: "Satsang, aarti & meditation", icon: <><path d="M12 3c2.5 3.2 3.5 5.4 3.5 7a3.5 3.5 0 0 1-7 0c0-1.6 1-3.8 3.5-7z" /><path d="M3 15h18c-1 3.5-4.5 6-9 6s-8-2.5-9-6z" /></> },
  { title: "Cultural Celebrations", text: "Festivals through the year", icon: <path d="M12 2l2.4 5.6L20 8.4l-4.2 4 1 5.9L12 15.6 7.2 18.3l1-5.9-4.2-4 5.6-.8z" /> },
];
const DELAYS = ["0s", ".08s", ".16s", ".24s", ".32s", ".4s"];

export default function Experience() {
  return (
    <section className="experience" id="experience">
      <div className="experience__media">
        <div className="experience__img" data-parallax="0.12">
          <img src="/assets/img/experience.jpg" alt="A priest holding a tiered flaming lamp during Ganga Aarti at Dashashwamedh Ghat" loading="lazy" />
        </div>
        <div className="experience__caption glass">
          <span>Sandhya Aarti</span>
          <strong>Dashashwamedh Ghat, Kashi</strong>
        </div>
      </div>

      <div className="experience__content">
        <Mandala className="experience__mandala" />
        <div className="experience__diyas" aria-hidden="true">
          <span className="diya"></span><span className="diya"></span><span className="diya"></span>
        </div>

        <p className="eyebrow reveal">The Experience</p>
        <h2 className="h2 reveal">More Than a Story.<br /><em>An Experience.</em></h2>
        <div className="ornament reveal" aria-hidden="true"></div>
        <p className="lead reveal">Every Leela is an invitation — to sit together, to listen, to sing, and to feel the stories our traditions have carried for thousands of years. Step in as a visitor and leave as part of the story.</p>

        <ul className="exp-list">
          {ITEMS.map((item, i) => (
            <li className="reveal" style={delay(DELAYS[i])} key={item.title}>
              <span className="exp-list__icon"><svg viewBox="0 0 24 24">{item.icon}</svg></span>
              <div><strong>{item.title}</strong><span>{item.text}</span></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
