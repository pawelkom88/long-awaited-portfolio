# Build: /projects page, "Knots I untied" section, reader view

## Context
Portfolio for Pawel Komorkiewicz, a front end developer. It's a hand-drawn "ink" site built with Astro 7: static output, plain `.astro` files, no client framework. Read `README.md` first for where things live.
- The story page is `src/pages/index.astro`. Its sections, in order, are in `src/components/story/`: Hero → Lift → Values → Line → Night → Shelf → Contact.
- Drawings are `src/assets/ink/*.svg` (`fill="currentColor"`), painted through the `.ink` mask with `--src`/`--ar`. Use the pattern `style={`--src:url(${ink("name")}); --ar:W/H`}` (see `Values.astro`) or `<Ink name="..." ar="W/H" />`. Pencil marks are `src/assets/pencil/*.webp`.
- Styles: `src/styles/ink.css` (the base system), `story.css`, `blog.css`. Scripts: `src/scripts/`.
- The art pipeline is in `design/ink/`. `gen-batch*.sh` generates images through `agy` (copy the prompt style from `gen-batch9.sh`: loose black fineliner on white, matching the line weight of `raw/broom-v1.jpg`, one object per image, two versions each). Then `vectorize.sh raw/<in>.jpg <name>` writes an SVG to `src/assets/ink/`. `tools/svgp.py` gives bounding boxes.

## Rules
- The resting state is the finished drawing. Scroll-driven animation only adds the way there, inside `@media (prefers-reduced-motion: no-preference)` and `@supports ((animation-timeline: view()) and (animation-range: entry))`. Put `animation-timeline` after the `animation` shorthand. No polyfill.
- `body` uses `overflow-x: clip`, never `hidden`.
- `compressHTML: true` is pinned. Global `.note` and `.tape` classes collide, so prefix component classes.
- Match the voice: short sentences, colons rather than dashes, British spelling, warm, a person at the end of each story.
- Don't re-add the blog accents that were cut (see the list in memory).
- Test at 390, 1280 and 1920 px wide, and with reduced motion. Check there's no horizontal overflow (`scrollWidth === innerWidth`). Run `npm run check` and `npm run build`.

## 1. /projects: under construction (build first)
- `src/pages/projects/index.astro`. Model it on `src/pages/404.astro`.
- Copy:
  - h1: "Something's on the bench."
  - soft line: "I'm building it now. Come back when the ink's dry."
  - link to the email: "want a look early? say hello"
- Scene: the figure beside a shape covered by a cloth, with the pencil note "no peeking" and the pencil arrow. On hover or focus, one corner of the cloth lifts a little. With reduced motion it stays static. The scene is `role="img"` with an aria-label.
- New art (new batch script): the figure standing beside a cloth-covered shape, the same scene with one corner lifted, two versions each.
- Navigation: a "projects" link in `src/components/Header.astro` next to "loose ends" (`aria-current` on the page), and a link at the end of `Shelf.astro`. Check the header still fits on a phone.

## 2. "Knots I untied": case studies
- The final copy is in `docs/KNOTS-BRIEF.md`. Use it as written.
- New component `src/components/story/Knots.astro`, placed between `<Values />` and `<Line />`.
- Structure: an `<h2>` and a soft line, then a list of four `<article>`s. Each article has:
  - the name, years and knot name
  - "The knot", "The pull" and "Loose end"
  - a pencil margin note (reuse the `.margin.hand` look from `Line.astro`)
  - shaka's three links
- Motion: each card's drawing starts as a snarl and crossfades into its named knot as the card scrolls into view (a `view()` timeline). The resting state is the tied knot. All drawings are `aria-hidden`.
- New art: one snarl, plus a bowline, a reef knot, a sheet bend and a figure-eight knot, each drawn loosely on its own. Don't reuse the hero's `tangle-s*`.
- On phones: one column, knot above the text.

## 3. Reader view: "Leave a light on", proven
- The lamp in the "Leave a light on" value (`Values.astro`) becomes a `<button aria-pressed>` labelled "switch the lamp on: see what a screen reader sees".
- It toggles `html[data-view="reader"]` on the whole story page. Esc turns it off. It lasts for the visit only, with no storage.
- When it's on:
  - Decorative (`aria-hidden`) drawings fade to faint ghosts.
  - Landmarks get pencil outlines and role labels (banner, main, contentinfo).
  - Headings get their level tag ("h2").
  - `img` and `role="img"` elements show their alt text or aria-label.
  - Links and buttons show their accessible name and a tab-order number.
  - `.sr-only` text becomes visible.
- Build: a small script (`src/scripts/reader.js`) walks the page once on the first switch and adds `aria-hidden` pencil labels, positioned absolutely so the layout doesn't move. Everything else is CSS.
- Watch for overlaps in the absolutely positioned stages (hero, night).
- An `aria-live` status says "reader view on" or "off".

Build in order 1 → 2 → 3. Stop after each one for review, with screenshots.
