#!/usr/bin/env bash
# Batch 10: /projects under construction: the figure beside a shape under a cloth, then one corner lifted.
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration, no animals, no landscape.'
FIGURE="Reference images: $INK/raw/figure-seated-v1.jpg for the figure and $INK/raw/broom-v1.jpg for line weight. Look at both first. Keep the exact same small figure: plain round head with one dot eye, simple loose body, same thin line, same proportions. The figure stays small in a wide landscape frame, with one long thin wobbly horizontal ground line spanning the full width, the figure standing on it."
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== bench $(date -u +%H:%M:%S)"
agy -p "$FIGURE
Call generate_image exactly 4 times, wide landscape, same framing and ground line position in every image so the pictures register. The figure stands on the left, one hand resting on the top of a boxy shape about as tall as the figure, standing on the ground line to its right. The shape is completely covered by a loose cloth draped over it, soft folds falling to the ground, so you cannot see what is underneath.
1. The figure beside the cloth-covered shape, the cloth hanging down all round.
2. Exactly the same scene, but the front right bottom corner of the cloth is lifted up a little, curling up, showing only a dark gap underneath, nothing recognisable.
3. The figure beside the cloth-covered shape, drawn a little differently, the cloth hanging down all round.
4. Exactly the same as image 3, but the front right bottom corner of the cloth is lifted up a little, curling up, showing only a dark gap underneath, nothing recognisable.
$STYLE
$TAIL" --print-timeout 15m
echo "=== done $(date -u +%H:%M:%S)"
