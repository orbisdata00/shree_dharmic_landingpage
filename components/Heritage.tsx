import { Mandala, delay } from "./ui";
import { BRAND } from "@/lib/brand";

/** Brand essence values, from the committee's brand guidelines. */
const VALUES = [
  { name: "Dharma", deva: "धर्म", text: "Tradition, values & respect" },
  { name: "Bhakti", deva: "भक्ति", text: "Devotion & reverence" },
  { name: "Seva", deva: "सेवा", text: "Community & participation" },
  { name: "Sanskriti", deva: "संस्कृति", text: "Culture & heritage" },
  { name: "Parampara", deva: "परंपरा", text: "Legacy across generations" },
];

export default function Heritage() {
  return (
    <section className="section heritage" id="committee">
      <Mandala className="heritage__mandala" />
      <div className="container heritage__inner">
        <div className="heritage__intro">
          <img className="heritage__logo reveal" src={BRAND.heritageLogo} alt={`${BRAND.name} heritage emblem - celebrating 100 years, 1924–2023`} width={144} height={144} loading="lazy" />
          <header className="section-head reveal">
            <p className="eyebrow eyebrow--light">The Committee · Since 1924</p>
            <h2 className="h2">A Century of <em>Parampara</em></h2>
            <div className="ornament ornament--light" aria-hidden="true"></div>
            <p className="lead">Since 1924 the {BRAND.name}, {BRAND.place}, has brought the Leela to its community year after year - carried forward by devotees, artists and volunteers. {BRAND.blessing}.</p>
          </header>
        </div>

        <ul className="values">
          {VALUES.map((v, i) => (
            <li className="value reveal" style={delay(`${i * 0.08}s`)} key={v.name}>
              <span className="value__deva" lang="hi">{v.deva}</span>
              <strong>{v.name}</strong>
              <span>{v.text}</span>
            </li>
          ))}
        </ul>

        <blockquote className="heritage__line reveal">
          <p>“{BRAND.line}”</p>
        </blockquote>
      </div>
    </section>
  );
}
