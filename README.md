# Shree Dharmic Leela Committee - Website

The website of the **Shree Dharmic Leela Committee (Regd.) Delhi**, which celebrates the tradition of Leela and the values of dharma, devotion, maryada, truth and community. It follows the committee's brand guidelines: an ivory-first design with deep-red headings, orange buttons and restrained gold accents, Cinzel and Inter typefaces, and the committee's primary and heritage logos.

Built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

## Getting started

Requires **Node.js 20.9 or later**.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Build the static site into `out/`    |

## Deploying (nginx, static files)

The site is a static export: `npm run build` writes plain HTML/CSS/JS to `out/`, and nginx serves that folder. No Node process runs on the server.

```nginx
root /opt/install/shree_dharmic_landingpage/out;
location / { try_files $uri $uri/ $uri.html =404; }
error_page 404 /404.html;
```

Blog posts are fetched from the backend **during the build**, so the backend must be reachable and `.env` must hold the real `NEXT_PUBLIC_MEMBERSHIP_API_URL` and `NEXT_PUBLIC_SITE_URL`. A newly published post appears on the site after the next `npm run build`.

## Page sections

The order follows the brand guidelines. The navigation is Home • About • Leela • Events • Bhumi Poojan • Committee • Updates • Volunteer • Contact.

1. **Navbar:** primary logo, sticky, turns translucent on scroll, highlights the current section, and has a full-screen menu below 1240px.
2. **Hero:** blessings line and the brand line "Tradition that brings generations together", over a slow-zooming background with light particles.
3. **About:** arch-framed image with parallax and three highlight cards.
4. **Leela:** horizontal carousel with arrows, dots, keyboard control, mouse drag and swipe.
5. **Events:** three event cards with date badges.
6. **Heritage (`#committee`):** maroon section with the heritage logo, the five brand values (Dharma, Bhakti, Seva, Sanskriti, Parampara) and the brand line.
7. **Updates:** carousel of YouTube video cards; clicking one plays it in a popup player.
8. **Community (`#volunteer`):** volunteer and membership call to action.
9. **Contact:** email sign-up form.
10. **Footer:** logo, brand line, blessings, links and social icons.

The page works from phone to desktop width and respects the **reduce motion** accessibility setting.

## Bhumi Poojan page (`/bhumi-poojan`)

A separate page with a photo grid and full-screen viewer for the Bhumi Poojan ceremony. Photos go in `public/assets/img/bhumi-poojan/` and are listed, in display order with their pixel sizes, in `lib/bhumi-poojan-photos.json`. Until photos are added, the page shows "Photos coming soon".

## Project structure

```
app/
  layout.tsx       Page title, metadata and Google Fonts
  page.tsx         Puts the sections together
  globals.css      All styles (colours, typography, layout, animations)
  icon.svg         Diya favicon
components/
  Navbar.tsx  Hero.tsx  About.tsx  LeelaCarousel.tsx  Events.tsx
  Gallery.tsx (reusable photo grid + lightbox)  Heritage.tsx  Streaming.tsx  Community.tsx
  Newsletter.tsx  Footer.tsx
  useSnapCarousel.ts Shared carousel logic (Leela + Streaming)
  HeroParticles.tsx  Floating hero particles
  ScrollEffects.tsx  Scroll reveal and parallax for the whole page
  ui.tsx             Shared pieces: diya icon, mandala artwork, helpers
lib/
  brand.ts         Committee name, blessings line, brand line and logo paths
public/
  assets/brand/    Primary and heritage logos (from the brand guidelines)
  assets/img/      Photographs (resized and compressed)
  CREDITS.md       Photo credits and licences
```

## Editing content

- **Text and images** live in each section's component. Repeated items such as cards, carousel slides, events and gallery photos are arrays at the top of the file, so you can add or change one by editing an entry.
- **Colours, fonts and spacing** are CSS variables at the top of `app/globals.css`.
- **Streaming videos** are the `VIDEOS` list at the top of `components/Streaming.tsx`. Each entry needs the YouTube video `id` (the part after `watch?v=`), a short `tag`, a `title` and the `channel` name. The thumbnail is fetched from YouTube automatically. Only use videos that allow embedding: open `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>`, and if it returns an error (401 or 404), the video won't play on the site.
- **New images** go in `public/assets/img/` and are referenced as `/assets/img/<name>.jpg`.

## Before going live

- **Event details are placeholders.** Update the dates, venues and times in `components/Events.tsx`.
- **The newsletter form doesn't send anywhere yet.** It validates the email and shows a thank-you message. Connect it to a mailing service (for example Mailchimp or a form backend) in `components/Newsletter.tsx`.
- **The social links point to `#`.** Add your real profile links in `components/Footer.tsx`.
- **The streaming videos are examples from other channels.** Replace them with your own YouTube videos in `components/Streaming.tsx` once you have them.

## Implementation notes

- **Brand tokens:** the guideline colours are CSS variables at the top of `globals.css` (`--brand-orange`, `--brand-red`, `--brand-maroon`, `--brand-gold`, `--brand-ivory`, `--text`). A few derived shades (`--orange-deep`, `--gold-text`) are used where the exact brand colour is too light for readable text on ivory.
- **Fonts** (Cinzel, Inter, Noto Serif Devanagari) load from the Google Fonts stylesheet in `app/layout.tsx`. Cinzel has no italic, so highlighted words in headings are shown in colour instead. `next/font` isn't used because under Turbopack it inserts an Arial fallback ahead of the brand fonts.
- **Frosted-glass blur:** in `globals.css`, keep `-webkit-backdrop-filter` *before* `backdrop-filter`. If the order is reversed, Next's CSS minifier drops the standard property and Chrome shows no blur.
- **Plain `<img>` tags** are used instead of `next/image`, because `next/image` changes the markup that the masonry and card layouts rely on.
- **YouTube embeds** use `youtube-nocookie.com` (YouTube's privacy-enhanced mode), and the player only loads after a visitor clicks a video, so the page stays fast. Closing the popup removes the player, which stops playback.
- **Next.js dev badge:** the small icon Next shows in the bottom-left corner during development is turned off in `next.config.ts` (`devIndicators: false`).

## Image credits

All photographs are from [Wikimedia Commons](https://commons.wikimedia.org) and are used under Creative Commons licences (CC0, CC BY and CC BY-SA). Most of these licences require credit, so **keep [`public/CREDITS.md`](public/CREDITS.md) and the footer credit link**, or replace the photos with your own.

## Licence

© 2026 Shree Dharmic Leela Committee (Regd.) Delhi. All rights reserved. The photographs remain under their individual licences listed in `public/CREDITS.md`.
