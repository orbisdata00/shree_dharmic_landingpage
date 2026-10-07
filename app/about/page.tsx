import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import About from "@/components/About";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `About Us - ${BRAND.name}`,
  description: `About the ${BRAND.name}: a century-old tradition of Leela, dharma and community.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SubPage
      label="॥ परिचय ॥"
      title="About"
      accent="Us"
      text="A century-old tradition of Leela, kept alive by devotion, maryada and the community."
      image="/assets/img/about.jpg"
    >
      <About />
    </SubPage>
  );
}
