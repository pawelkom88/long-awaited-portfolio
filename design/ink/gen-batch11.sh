#!/usr/bin/env bash
# Batch 11: Knots I untied: one snarl, and the four knots each case settles into.
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration, no animals, no landscape.'
ROPE='Each drawing is one piece of thin string drawn as a single thin line (not a thick rope, no strand texture), the subject alone, small and centred, about as wide as it is tall, the two loose ends trailing out to the sides.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

# usage: ./gen-batch11.sh [b|c|d]   (b: only the second half, c: only the figure eight, d: only the sheet bend, when a run was cut or missed)
run() {
  echo "=== $1 $(date -u +%H:%M:%S)"
  agy -p "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly ${3:-5} times, one drawing per image. $ROPE
$2
$STYLE
$TAIL" --print-timeout 15m
}

if [[ -z ${1:-} ]]; then
run knots-a "1. A messy snarl: one string tangled into a loose knotted ball of loops, no recognisable knot.
2. The same messy snarl drawn a little differently.
3. A bowline knot: a fixed loop at the bottom, the knot neatly tied above it, clearly a bowline.
4. The same bowline knot drawn a little differently.
5. A reef knot (square knot): two strings tied together, left over right then right over left, flat and symmetrical, clearly a reef knot."
fi

[[ -z ${1:-} || ${1:-} == b ]] && run knots-b "1. A reef knot (square knot): two strings tied together, flat and symmetrical, drawn a little differently from a textbook one, clearly a reef knot.
2. A sheet bend: two strings joined, one forming a bight and the other wrapping round it and tucking under itself, clearly a sheet bend.
3. The same sheet bend drawn a little differently.
4. A figure-eight knot: one string tied in a single figure eight shape, clearly a figure-eight stopper knot.
5. The same figure-eight knot drawn a little differently."
[[ ${1:-} == c ]] && run knots-c "1. A figure-eight knot: one string tied in a single figure eight shape, clearly a figure-eight stopper knot.
2. The same figure-eight knot drawn a little differently." 2
# the sheet bend kept coming back as a reef knot, so spell out how it differs
[[ ${1:-} == d ]] && run knots-d "1. A sheet bend, NOT a reef knot, lopsided, not symmetrical: on the left, one string is folded back on itself into a narrow U-shaped hairpin loop pointing right. A second string comes in from the right, goes up through that hairpin, wraps once round behind both legs of the hairpin, and tucks under itself, its end trailing out to the right. Two different strings, clearly a sheet bend.
2. The same lopsided sheet bend drawn a little differently: a hairpin loop on one side, the other string wrapped once round its neck and tucked under itself." 2
echo "=== done $(date -u +%H:%M:%S)"
