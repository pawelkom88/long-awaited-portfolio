# Next: the blog, an index page and a post page

## Context
Portfolio for Pawel Komorkiewicz, a front end developer in Newport, Wales. It is one hand-drawn "ink" story page, and it is finished. The user wants to start writing blog posts, so the site needs:
- a blog home (the index of posts)
- an individual post page

Both must feel like the same notebook as the story page, with their own original accents. They are not a generic blog theme with ink sprinkled on top.

Existing pieces:
- **Page:** `portfolio/design/ink/spike/index.html`.
- **Styles:**
  - `spike/ink.css` is the base system: tokens, paper, theme, `.ink` masks, `.boil`, `.stage`, `.note`, header and contact.
  - `spike/story.css` is the story layer.
  - `spike/rub.css` holds the rubber and eraser view transition.
- **Other pages:** `spike/404.html` is a small second page. It is the model for how a secondary page reuses the system: the theme bootstrap script before first paint, `ink.css`, and the header.
- **Tokens:** `--paper`, `--ink`, `--ink-soft`, `--pencil` (red pencil, the only accent colour) and `--measure: 34rem`.
  - Body type is `"Iowan Old Style", Palatino, Georgia, serif`.
  - `--typed` is the typewriter face, used for dates and kickers.
  - Dark mode ("night") works through the bulb pull-cord (`theme.js`) plus `prefers-color-scheme`.
- **Assets:**
  - `design/ink/svg/*.svg`: ink drawings with `fill="currentColor"`, painted with `<span class="ink" style="--src:url(...); --ar:w/h">`.
  - `design/ink/pencil/*.webp`: `underline`, `circle`, `strike`, `scribble`, `tick`, `arrow`.
  - `design/ink/paper/`.
  - Drawings that aren't used yet and would suit a blog: `pose-reading.svg`, `pose-drawer.svg`, `pose-empty-drawer.svg`, `paperclip.svg`, `mirror.svg`, `lamp.svg`, `knot-1.svg`, `line-v.svg`, `string-loop.svg`, `snag-1/2.svg`.
- **Art pipeline:**
  - `gen-batch*.sh` generates images through `agy`. Copy the prompt style of `gen-batch6.sh`: loose black fineliner on white, matching the line weight of `raw/broom-v1.jpg`.
  - `vectorize.sh raw/<in>.jpg <name>` turns a generated image into an SVG.
  - `tools/svgp.py` handles paths.
  - Register art by measuring its ink bounds in the browser (render to a canvas and scan alpha).
- **Serve:** `cd portfolio/design/ink && python3 -m http.server 8765`, then open `http://localhost:8765/spike/`.

## The idea: "Loose ends"
The site's language is one string, handled by one small figure: a kite string, a knot, a tangle, a parcel string. The blog carries that on. A post is a thought someone tied off and hung up. Working name: **Loose ends** (the user may rename it; keep the name in one place).

The accents below are proposals. Build them, then let the user cut.

### Blog home (`spike/blog/index.html`)
- **Opening:** a short line of text and a stage with a single ground line, like the hero. `pose-reading.svg` sits on the line.
  - One small idle, in the same way as the hero figure: it turns a page every so often.
  - It waves on return to the tab, reusing the existing visibility pattern.
- **Posts on a washing line:** a string sags across the page, and each post is a paper slip pegged to it.
  - Each slip shows the title, a typed date and a one-line summary.
  - Generate a clothes peg with the pipeline.
  - On desktop, the line runs across and wraps to a second line. On phones it turns into one vertical thread (`line-v.svg`) with slips tied on at knots (`knot-1.svg`).
- **Hover or focus on a slip:** it swings a few degrees on its peg and its title gets the pencil underline. The swing uses `transform-origin` at the peg.
- **Newest post:** a pencil "new" note with the arrow, in the same style as "most conversations start a bit knotted".
- **Tags:** small luggage tags on string (generate one tag drawing). Filtering by tag is optional; if you build it, do it with plain links and `:target` or query params. No framework.
- **Empty or 404 state:** `pose-empty-drawer.svg` with the line "Nothing tied off yet."
- **Scroll:** optionally, the line draws itself in as it scrolls into view, following the same `.thread` pattern as the story page.

### Post page (`spike/blog/post.html`, with one real-length sample post)
- **Header:** the title in the h1 style, and under it a typed line with the date and reading time, written as "a 6 minute read".
- **Pencil margin notes:** sidenotes in `--pencil` italic hang in the right margin next to the paragraph they belong to, each with a small arrow.
  - On phones they fold inline under the paragraph and are indented with a pencil rule.
  - Markup: `<aside class="margin-note">`, placed right after the paragraph it belongs to.
- **Pencil marks as emphasis**, used sparingly as authored classes:
  - `underline.webp` under a key phrase
  - `circle.webp` around a word
  - `strike.webp` for "I used to think X" corrections, with the replacement written after it in pencil
  - `tick.webp` for checklists
- **Code blocks:** typed onto a slightly lighter sheet, reusing `--sheet` and `--typed`, with a paperclip (`paperclip.svg`) clipping the top corner. There is no syntax colour carnival: the ink stays the text colour, and at most a pencil highlight on the lines that matter. Inline code uses the typed face.
- **Figures:** images sit on paper held by a corner of tape or a paperclip, with the caption in pencil.
- **Reading progress:** a string that pays out down the left edge, in the same place and style as the altitude kite.
  - The kite is swapped for a small knot or bobbin, and it rides the string down.
  - It uses `animation-timeline: scroll(root)` and is hidden on phones, the same as the altitude kite.
- **End mark:** the post ends with a hand-tied knot (`knot-1.svg`) instead of a horizontal rule, followed by "Tied off." in pencil. It reuses the knot-tightening motion if one exists, or adds a small one.
- **After the knot:**
  - previous and next posts as two small pegged slips
  - a "reply" line that reuses the contact email, so it can be written the way the parcel is
  - no comments system
- **Headings:** h2 inside posts gets a small pencil numeral in the margin (1, 2, 3), as if the writer numbered them later.

### Getting there from the story page
- **Header link:** add a link in the header next to `tune`, in the same italic pencil style: "notes" or "loose ends". Don't restyle `tune` or the PK mark.
- **Footer link:** add one line near the contact section: "or read what I've been writing."
- **View transition:** optionally, a same-origin cross-document view transition (`@view-transition { navigation: auto; }`), with the PK mark and the ground line as shared elements. Keep it inside reduced-motion guards.

## Authoring (ask the user before building a pipeline)
Posts will be written in Markdown. Build the spike pages as hand-written static HTML first, so the look can be judged. Then ask the user which build to use:
- **Astro content collections (recommended):** static output, Markdown or MDX, and the custom elements above become components.
- **Eleventy.**
- **A tiny custom script.**

Whatever the build is, the classes and markup chosen here are the contract that Markdown and MDX will map onto (margin notes, pencil marks, code sheet). Also plan for an RSS feed (`/blog/feed.xml`) and per-post `<meta name="description">` and Open Graph tags.

## Rules carried over
- **Resting state:** the resting state is the finished drawing.
- **Scroll animations:** they only add the way there, inside both of these:
  - `@media (prefers-reduced-motion: no-preference)`
  - `@supports ((animation-timeline: view()) and (animation-range: entry))`
- **Animation order:** put `animation-timeline` after the `animation` shorthand.
- **No polyfill:** don't use a scroll-timeline polyfill.
- **Guidance check:** run modern-web-guidance first (`npx -y modern-web-guidance@latest search "<query>"`, then `retrieve "<id>"`). Check the code against it before calling anything done.
- **Overflow:** use `overflow-x: clip`, never `hidden`, on `html` and `body`. `hidden` breaks sticky positioning and view timelines.
- **Boil filter:** `.boil` has a filter, so it is the containing block for its absolute children. Give a stage's `.boil` wrapper `position: absolute; inset: 0`.
- **Percentage widths in grid:** a percentage width inside a grid with `auto` tracks feeds back into the track size. Use `grid-template-columns: minmax(0, 1fr)`.
- **SVG `<use>`:** page CSS doesn't reach inside `<use>` instances.
- **Placeholder email:** the user will change it; leave it alone.
- **Shared code:** reuse `ink.css`. Add `blog.css` for the blog-only layer, and don't fork the base.
- **Story page:** don't restyle anything on it except the two links described above.
- **Readability:** body text stays at `--measure`, the contrast must pass WCAG AA in both themes, and pencil marks are decoration that must never be the only carrier of meaning (use `<mark>`, `<del>`/`<ins>` and `<em>` underneath).

## Verify
- **Viewports:** use Playwright at 1280×800 and 390×844. Chromium 1243 is in `~/Library/Caches/ms-playwright`; pass `executablePath`.
- **Modes:** check light and dark (`data-theme`), and `reducedMotion: 'reduce'`.
- **Screenshots:**
  - the blog home at rest, with a slip hovered
  - the post top
  - a margin note, on desktop and inline on a phone
  - a code sheet
  - the end knot
  - the reading-progress string partway down
- **Checks:**
  - no console errors
  - no horizontal overflow (`documentElement.scrollWidth === innerWidth`)
  - keyboard focus visible on every slip and link
  - headings in order
- **Before building:** show the user the accent list above and let them cut, then build.
