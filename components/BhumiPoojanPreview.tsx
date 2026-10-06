import Link from "next/link";
import { BHUMI_POOJAN_PHOTOS } from "@/lib/bhumiPoojan";

// Photos shown in the home page teaser (indexes into BHUMI_POOJAN_PHOTOS); the first is the large one.
const PICKS = [20, 4, 29, 44, 74];

/**
 * Home page "Bhumi Poojan" section: a small photo mosaic from the ceremony with a link
 * to the full gallery at /bhumi-poojan. Renders nothing until photos exist.
 */
export default function BhumiPoojanPreview() {
  const photos = PICKS.map((i) => BHUMI_POOJAN_PHOTOS[i]).filter(Boolean);
  if (photos.length === 0) return null;
  const total = BHUMI_POOJAN_PHOTOS.length;

  return (
    <section className="section bp-preview" id="bhumi-poojan" aria-labelledby="bp-preview-title">
      <div className="container">
        <div className="latest__head">
          <header className="section-head section-head--left reveal">
            <p className="eyebrow">॥ भूमि पूजन ॥</p>
            <h2 className="h2" id="bp-preview-title">Bhumi <em>Poojan</em></h2>
            <p className="lead">
              Moments from the sacred ground-breaking ceremony, blessed with prayers and offerings to Mother Earth.
            </p>
          </header>
          <Link href="/bhumi-poojan" className="btn btn--outline reveal">
            View more <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
        <Link href="/bhumi-poojan" className="bp-preview__grid reveal" aria-label={`View all ${total} Bhumi Poojan photos`}>
          {photos.map((p, i) => (
            <figure key={p.src} className="bp-preview__item">
              <img src={i === 0 ? p.src : (p.thumb ?? p.src)} alt={p.alt} width={p.width} height={p.height} loading="lazy" />
              {i === photos.length - 1 && total > photos.length && (
                <span className="bp-preview__more">+{total - photos.length} more</span>
              )}
            </figure>
          ))}
        </Link>
      </div>
    </section>
  );
}
