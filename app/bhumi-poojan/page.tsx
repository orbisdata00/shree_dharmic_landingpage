import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import { BRAND } from "@/lib/brand";
import { BHUMI_POOJAN_HERO, BHUMI_POOJAN_PHOTOS } from "@/lib/bhumiPoojan";
import "./bhumi-poojan.css";

export const metadata: Metadata = {
  title: `Bhumi Poojan - ${BRAND.name}`,
  description: `Photographs from the Bhumi Poojan ceremony of the ${BRAND.name}.`,
  alternates: { canonical: "/bhumi-poojan" },
};

export default function BhumiPoojanPage() {
  const photos = BHUMI_POOJAN_PHOTOS;
  const hero = photos.length > 0 ? BHUMI_POOJAN_HERO : "/assets/img/g-diyas.jpg";

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar solid />
      <main id="main" className="bp">
        <section className="bp-hero">
          <img className="bp-hero__img" src={hero} alt="" />
          <div className="bp-hero__overlay" />
          <div className="container">
            <p className="hero__label">॥ भूमि पूजन ॥</p>
            <h1>Bhumi <span>Poojan</span></h1>
            <p>Moments from the sacred ground-breaking ceremony, blessed with prayers and offerings to Mother Earth.</p>
          </div>
        </section>

        <section className="bp-body gallery">
          <div className="container">
            {photos.length > 0 ? (
              <Gallery images={photos} label="Bhumi Poojan photo" />
            ) : (
              <p className="bp-empty">Photos coming soon.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
