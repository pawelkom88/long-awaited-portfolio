#!/usr/bin/env bash
# Open Graph card art: the figure flying a kite, room on the left for the name (composited by tools/og.mjs).
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration, no animals, no landscape.'
FIGURE="Reference images: $INK/raw/figure-seated-v1.jpg and $INK/raw/magic-kite-v1.jpg for the figure and kite, $INK/raw/broom-v1.jpg for line weight. Look at all three first. Keep the exact same small figure: plain round head with one dot eye, simple loose body, same thin line, same proportions."
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== og $(date -u +%H:%M:%S)"
agy -p "$FIGURE
Call generate_image exactly 3 times, wide landscape at about 1.9 to 1 (like 1200 by 630). The whole LEFT 55% of the frame must stay completely empty white paper. In the right part: one long thin wobbly horizontal ground line near the bottom running across the right half, the small figure standing on it, holding a long thin string that rises in a loose gentle curve up to a small diamond kite high in the top right corner, with a short wavy tail. The string has one small loose knot partway up. Figure small, about a quarter of the frame height.
Draw three variations of this same scene.
$STYLE
$TAIL" --print-timeout 15m
echo "=== done $(date -u +%H:%M:%S)"
