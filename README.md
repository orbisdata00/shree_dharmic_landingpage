# Shree Dharmic Leela — Landing Page

A landing page for **Shree Dharmic Leela**, a spiritual and cultural community that brings Dharmic stories, traditions and celebrations to life. It uses a soft saffron, warm yellow and cream palette, real photographs of Indian devotional life, and calm animations.

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
| `npm run build` | Create an optimised production build |
| `npm start`     | Serve the production build           |

## Page sections

1. **Navbar:** sticky, turns translucent on scroll, highlights the current section, and has a full-screen menu on mobile.
2. **Hero:** Ganga Aarti background with a slow zoom, floating light particles and a rotating mandala.
3. **About:** arch-framed image with parallax and three highlight cards.
4. **What We Celebrate:** four image cards that zoom on hover.
5. **The Divine Leela:** horizontal carousel with arrows, dots, keyboard control, mouse drag and swipe.
6. **Experience:** split screen with animated diyas.
7. **Streaming Now:** carousel of YouTube video cards; clicking one plays it in a popup player.
8. **Events:** three event cards with date badges.
9. **Gallery:** masonry grid with a full-screen lightbox (keyboard, swipe, focus trap).
10. **Quote:** centred quote over a mandala background.
11. **Community:** call to action on a glass card over a parallax image.
12. **Newsletter:** email sign-up form.
13. **Footer:** links, social icons and photo credits.

The page works from phone to desktop width and respects the **reduce motion** accessibility setting.

## Project structure

```
app/
  layout.tsx       Page title, metadata and Google Fonts
  page.tsx         Puts the sections together
  globals.css      All styles (colours, typography, layout, animations)
  icon.svg         Diya favicon
components/
  Navbar.tsx  Hero.tsx  About.tsx  Celebrate.tsx  LeelaCarousel.tsx
  Experience.tsx  Events.tsx  Gallery.tsx  Quote.tsx  Community.tsx
  Streaming.tsx  Newsletter.tsx  Footer.tsx
  useSnapCarousel.ts Shared carousel logic (Leela + Streaming)
  HeroParticles.tsx  Floating hero particles
  ScrollEffects.tsx  Scroll reveal and parallax for the whole page
  ui.tsx             Shared pieces: diya icon, mandala artwork, helpers
public/
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

- **Fonts** (Cormorant Garamond, Poppins, Tiro Devanagari Hindi) load from the Google Fonts stylesheet in `app/layout.tsx`. `next/font` isn't used because under Turbopack it inserts an Arial fallback that changes characters Poppins doesn't have, such as "→".
- **Frosted-glass blur:** in `globals.css`, keep `-webkit-backdrop-filter` *before* `backdrop-filter`. If the order is reversed, Next's CSS minifier drops the standard property and Chrome shows no blur.
- **Plain `<img>` tags** are used instead of `next/image`, because `next/image` changes the markup that the masonry and card layouts rely on.
- **YouTube embeds** use `youtube-nocookie.com` (YouTube's privacy-enhanced mode), and the player only loads after a visitor clicks a video, so the page stays fast. Closing the popup removes the player, which stops playback.
- **Next.js dev badge:** the small icon Next shows in the bottom-left corner during development is turned off in `next.config.ts` (`devIndicators: false`).

## Image credits

All photographs are from [Wikimedia Commons](https://commons.wikimedia.org) and are used under Creative Commons licences (CC0, CC BY and CC BY-SA). Most of these licences require credit, so **keep [`public/CREDITS.md`](public/CREDITS.md) and the footer credit link**, or replace the photos with your own.

## Licence

© 2026 Shree Dharmic Leela. All rights reserved. The photographs remain under their individual licences listed in `public/CREDITS.md`.
