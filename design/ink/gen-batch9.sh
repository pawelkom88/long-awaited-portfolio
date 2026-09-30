#!/usr/bin/env bash
# Batch 9: shelf objects for Promptheus (a lit match), Devlog (a pocket watch), Loopset (a four-pane window).
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration, no animals, no landscape.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== shelf $(date -u +%H:%M:%S)"
agy -p "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly 6 times, one object per image, the object alone, small and centred, standing upright:
1. A single wooden matchstick standing upright, just lit, a small flame drawn as an open outline at its head.
2. The same lit matchstick drawn a little differently, the flame leaning slightly.
3. A small round pocket watch with a short loop of chain, the face with only two hands, no numbers.
4. The same pocket watch drawn a little differently, the lid slightly open.
5. A small square window frame divided into four equal panes by a cross, empty panes, nothing seen through it.
6. The same four-pane window drawn a little differently, slightly crooked.
$STYLE
$TAIL" --print-timeout 15m
echo "=== done $(date -u +%H:%M:%S)"
