import type { Metadata } from "next";
import SubPage from "@/components/SubPage";
import Events from "@/components/Events";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Events - ${BRAND.name}`,
  description: `Upcoming events, Leela evenings and celebrations of the ${BRAND.name}.`,
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <SubPage
      label="॥ उत्सव ॥"
      title="Upcoming"
      accent="Events"
      text="Leela evenings, bhakti sandhya and celebrations - all are welcome."
      image="/assets/img/event-leela.jpg"
    >
      <Events />
    </SubPage>
  );
}
