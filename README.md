# Portfolio

Pawel Komorkiewicz, front end developer. One hand-drawn "ink" story page, and **Loose ends**, the blog.
Built with [Astro](https://astro.build): static output, no client framework.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # to dist/
npm run preview
npm run check     # types and templates
```

## Where things live

```
src/
  site.mjs                 the site's shared facts: URL (SITE_URL, else Netlify's URL), author, email, blog name
  lib/schema.ts            the JSON-LD every page carries (Base adds the site and the author)
  integrations/agents.mjs  after the build: index.md per page, llms.txt, ai-catalog.json, _headers (CSP and all)
  pages/                   / (the story), /404, /blog/, /blog/<slug>/, /blog/feed.xml
  layouts/Base.astro       every page: theme bootstrap, header, tune and switch
  components/
    Header.astro           PK mark, "loose ends", tune, the bulb
    ink/Ink.astro          any drawing, painted with the ink colour: <Ink name="knot-1" />
    story/                 the story page, one component per section
    blog/                  the washing line, and the components posts can use
  content/blog/<slug>/     one folder per post: index.mdx and its pictures
  styles/                  ink.css (the base system), story.css, blog.css, rub.css
  scripts/                 theme.js (the switch), sound.js (the tune), story.js, lost.js
  assets/ink/              the drawings (SVG, fill="currentColor", used as masks)
  assets/pencil/           the pencil marks (WebP masks)
  assets/paper/            grain, specks, the ink-wash edges, the rub sprite
design/ink/                the art pipeline (not shipped): raw sketches, generators, tools (tools/og.mjs: the share card and icons)
netlify/edge-functions/    markdown.ts: Accept: text/markdown gets the page as Markdown
docs/                      the briefs the site was built from
```

## Writing a post

Make a folder in `src/content/blog/`. Its name is the URL (`/blog/<folder>/`):

```mdx
---
title: Clip, not hidden
description: One line: shown on the slip, in the meta description and in the feed.
date: 2026-10-12
draft: true        # optional: shown by `npm run dev` only
---
import photo from "./desk.jpg";

Plain Markdown. The reading time ("a 6 minute read") is counted for you.
```

Code fences become code sheets. They're typed in the ink, with no syntax colours; `mark` puts pencil on the lines that matter, and `title` labels the sheet:

````mdx
```css title="ink.css" mark="1-3,7"
.ink { … }
```
````

These components are available in every post without imports. Pictures go in the post's folder, and `astro:assets` optimises them to AVIF and WebP at the right sizes.

| Component | What it is |
| --- | --- |
| `<Figure src={photo} alt="…">caption</Figure>` | A picture on a sheet, taped at one corner. `hold="clip"` paperclips it instead. The caption is optional, in pencil. |
| `<Polaroid src={photo} alt="…">caption</Polaroid>` | A square snapshot with a wide border to write on, taped at a tilt. Takes `tilt={2}` and `side="left" \| "right"`. |
| `<Sketch name="pose-reading" alt="…">caption</Sketch>` | One of the drawings from `src/assets/ink`; it boils when you point at it. `width` is optional. |
| `<Note>…</Note>` | A pencil aside on a torn slip, pegged over the text. `label="tip"` changes the small typed label. |
| `<Pullquote cite="…">…</Pullquote>` | A line worth pulling out, typed on a strip torn from a sheet. |

## Drawings

`design/ink/gen-batch*.sh` generates sketches (loose black fineliner on white). `design/ink/vectorize.sh raw/<in>.jpg <name>` traces one straight into `src/assets/ink/<name>.svg`, which `<Ink name="<name>" />` can then use. Its proportions are read from its viewBox.

Before launch, set `SITE_URL` in `src/site.mjs`, and the real address in `EMAIL`.
