import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import Community from "@/components/Community";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Volunteer - ${BRAND.name}`,
  description: `Volunteer and do seva with the ${BRAND.name}.`,
  alternates: { canonical: "/volunteer" },
};

export default function VolunteerPage() {
  return (
    <SubPage
      label="॥ सेवा ॥"
      title="Volunteer"
      accent="With Us"
      text="Every Leela is made possible by seva - lend your hands."
      image="/assets/img/community.jpg"
    >
      <Community />
    </SubPage>
  );
}
