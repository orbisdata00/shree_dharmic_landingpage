import type { GalleryImage } from "@/components/Gallery";
import photos from "./bhumi-poojan-photos.json";

/**
 * Photos for the Bhumi Poojan page. The files live in public/assets/img/bhumi-poojan/ and
 * bhumi-poojan-photos.json lists them in display order (the order they were taken) with their
 * pixel sizes, so the grid doesn't jump while images load. Each photo has a full-size version
 * (max 1600px) for the viewer and a small "-sm" version for the grid.
 */
type Photo = { file: string; thumb?: string; width: number; height: number; caption?: string };

export const BHUMI_POOJAN_PHOTOS: GalleryImage[] = (photos as Photo[]).map((p, i, all) => ({
  src: `/assets/img/bhumi-poojan/${p.file}`,
  thumb: p.thumb && `/assets/img/bhumi-poojan/${p.thumb}`,
  alt: p.caption ?? `Bhumi Poojan ceremony - photo ${i + 1} of ${all.length}`,
  caption: p.caption,
  width: p.width,
  height: p.height,
}));

/** Banner image at the top of the page (the decorated altar). */
export const BHUMI_POOJAN_HERO = "/assets/img/bhumi-poojan/bp-021.jpg";
