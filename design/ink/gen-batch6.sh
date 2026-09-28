#!/usr/bin/env bash
# Batch 6: a balloon for the contact parcel, so it has a reason to rise.
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== balloon $(date -u +%H:%M:%S)"
agy -p "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly 2 times, one drawing per image, the subject alone, small and centred:
1. One single round party balloon, upright, with a small tied knot at the bottom and a short slightly wavy string hanging straight down below it, about as long as the balloon is tall. The string ends loose at the bottom. Nothing else.
2. The same kind of single round balloon with its knot and a short wavy string hanging down, drawn a little differently, slightly tilted. Nothing else.
$STYLE
$TAIL" --print-timeout 12m
echo "=== done $(date -u +%H:%M:%S)"
