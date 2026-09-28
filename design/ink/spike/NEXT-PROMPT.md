# Continue: portfolio story page, fix pass 3

## Context
Portfolio for Pawel Komorkiewicz, a front end developer. It is a single hand-drawn "ink" page.
- Page: `portfolio/design/ink/spike/index.html`. The previous version is backed up as `index.v1.html`.
- Styles: `spike/ink.css` is the base ink system (masks, the boil filter, paper, theme, stages, contact). `spike/story.css` is the story layer (hero figure parts, lift, CV sheet, night, altitude, mobile).
- Assets: `design/ink/svg/*.svg` (ink drawings, `fill="currentColor"`, painted through the `.ink` mask with `--src`/`--ar`), `design/ink/pencil/*.webp`, `design/ink/paper/`, `spike/wash-*.webp` (the night's ink-wash edges, from `gen-wash.sh`).
- Art pipeline: `gen-batch*.sh` generates images through `agy` (see `gen-batch5.sh` for the prompt style: loose black fineliner on white, match `raw/broom-v1.jpg` line weight). Then `vectorize.sh raw/<in>.jpg <name>` makes an SVG. `tools/svgp.py` parses paths and gives bboxes (useful for registering art); `tools/split-seated.py` shows how a drawing is split into layers.
- Serve with `cd portfolio/design/ink && python3 -m http.server 8765`, then open `http://localhost:8765/spike/index.html`.
- Story, top to bottom: hero (seated figure idles) → `.magic` kite lift → `.care` → `.line` CV sheet → `.next` night / small planet → `.work` P.S. app shelf → `.contact` (walker, parcel, email).
- Rule: the resting state is the finished drawing. Scroll-driven animations only add the way there, inside `@media (prefers-reduced-motion: no-preference)` and `@supports ((animation-timeline: view()) and (animation-range: entry))`. Put `animation-timeline` after the `animation` shorthand. No scroll-timeline polyfill.
- Run modern-web-guidance first (`npx -y modern-web-guidance@latest search "<query>"`, then `retrieve "<id>"`) and check the code against it before calling anything done.

## Gotchas already paid for
- `body` must use `overflow-x: clip`, never `hidden`. With `html { overflow-x: clip }`, `hidden` makes body a scroll container, which breaks sticky and every view timeline.
- `.boil` has a filter, so it is the containing block for its absolutely positioned children. `.stage > .boil { position: absolute; inset: 0 }` (ink.css) makes it span the stage so `top: %` offsets resolve.
- Page CSS does not reach inside SVG `<use>` instances. Set fill on the `<use>`.
- The user will change the placeholder email themselves. Leave it.

## Fix
1. **Contact: the parcel sits too high, in mid-air (see the user's screenshot: top-left of the stage).**
   Likely cause: `.parcel` also has the class `boil` and is a direct child of `.stage-contact`, so `.stage > .boil { position: absolute; inset: 0 }` (specificity 0,2,0) beats `.parcel { left: 8%; bottom: 5.9% }` and pins it to the top-left. Confirm in DevTools, then fix it (for example `:not(.parcel)` on that rule, or move `boil` onto an inner wrapper).
   Where it rests: on the ground line. The user asked "it should be at the bottom right?", so try it resting on the line on the right side, near the walker, and check it against the walker and the email arrow (the arrow must still point at it).

2. **Contact: the fly-off looks odd. Tie a balloon to the parcel so it has a reason to rise.**
   Generate a balloon with the pipeline (one hand-drawn balloon on a short string, same loose fineliner style), vectorize it, and register it to the parcel's knot/bow. Suggested beat: on click, the balloon inflates or bobs up on its string from the bow, the string goes taut, then balloon and parcel rise together with a gentle sway, and the figure waves them off (the waving swap already works). Keep the resting state finished, and keep reduced motion instant (the "sent" state with no travel). Use `offset-path` or keyframes; check modern-web-guidance first.

3. **Mobile: the section gaps must be bigger.**
   `--section-gap: clamp(6rem, 4rem + 8vw, 11rem)` (ink.css `:root`) hits its 6rem minimum on phones. Raise the mobile value (try around 8–9rem at 390px) without changing desktop.

4. **"A new sky." has too much margin above and below (worst on mobile).**
   What adds to it: `.next { margin-top: calc(var(--bleed) + 2rem) }` with `--bleed: calc(var(--wash) * .75)` and `--wash: clamp(9rem, 28vw, 22.5rem)`; `.work { margin-top: calc(var(--wash) * .75 + var(--section-gap) * .5) }`; the wash edges that hang outside the section; and the sticky `.scene` being `100vh` with its content centred, so a tall phone shows a lot of empty night above the caption and below the planet. Measure each part at 390×844 and 1280×800, then trim until the visible paper-to-night-to-paper spacing matches `--section-gap` on the other sections. Keep the scene fully dark behind its content.

## Leave alone
The user said the rest is really good. Don't restyle the hero figure, kite, CV, stars/parallax, altitude kite, PK monogram or `tune`.

## Still open, lower priority
- The planet, figure-from-behind and stars are hand-coded inline SVG placeholders. Offer to generate proper ink art.
- Mobile app shelf: the 5th item sits alone on its row.
- The waving figure in the contact section is drawn a little bigger than the walking one.
- The user is testing real browsers (including Safari) themselves.

## Verify
Use Playwright at 1280×800 and at 390×844, and again with `reducedMotion: 'reduce'`. Screenshot the contact stage at rest, then during and after the send (prevent the `mailto:` navigation in the test). Screenshot `.line` end → `.next` → `.work`. Confirm the parcel rests on the line, the balloon lifts it, gaps match `--section-gap`, there are no console errors, and there is no horizontal overflow (`documentElement.scrollWidth === innerWidth`).
