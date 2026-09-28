#!/usr/bin/env bash
# Batch 4: the theme switch. A hanging bulb with a pull cord, its glow, and the rubber that erases day into night.
# Each job prints image paths (or an error); copy + vectorise happens after review.
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== switch $(date -u +%H:%M:%S)"
agy -p "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly 4 times, one drawing per image, tall portrait frame, the subject alone and centred:
1. A single bare light bulb hanging straight down from a thin wobbly wire. The wire starts at the very top edge of the image. Simple pear-shaped bulb, small screw cap, a tiny loose filament squiggle inside. Switched off.
2. A loose burst of about eight short separate dash strokes arranged in a ring, like light radiating, with a large empty circle in the middle where a bulb would be. Nothing else.
3. A single thin wobbly pull cord string hanging straight down from the very top edge of the image, ending in a small round bead knot at the bottom. Nothing else.
4. A small worn pencil rubber eraser block seen at a slight angle, one end rubbed round and used. Nothing else.
$STYLE
$TAIL" --print-timeout 12m
echo "=== done $(date -u +%H:%M:%S)"
