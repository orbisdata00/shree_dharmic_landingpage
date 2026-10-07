import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import LeelaCarousel from "@/components/LeelaCarousel";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Leela - ${BRAND.name}`,
  description: `The Leelas staged by the ${BRAND.name}: Ram, Krishna, Shiv and more.`,
  alternates: { canonical: "/leela" },
};

export default function LeelaPage() {
  return (
    <SubPage
      label="॥ लीला ॥"
      title="The"
      accent="Leela"
      text="Sacred stories brought to life on stage, generation after generation."
      image="/assets/img/leela-ram.jpg"
    >
      <LeelaCarousel />
    </SubPage>
  );
}
