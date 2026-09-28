#!/usr/bin/env bash
# Batch 2 remainder, most important first so a quota cut loses the least.
# Each job prints image paths (or an error); copy + vectorise happens after review.
# usage: ./gen-batch2.sh [start-at-UTC HH:MM]
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

if [[ -n ${1:-} ]]; then
  until [[ $(date -u +%H:%M) > $1 || $(date -u +%H:%M) == "$1" ]]; do sleep 30; done
fi

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration, no animals, no landscape.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

run() {
  echo "=== $1 $(date -u +%H:%M:%S)"
  agy -p "$2" --print-timeout 12m
}

run tangle "Reference image: $INK/raw/tangle-v1.jpg . Look at it first. It is a messy tangled knot of thin string with one loose end.
Call generate_image exactly 7 times, passing that reference image each time if the tool accepts image input, so the string keeps the same thin line and knot character. Every image: same framing, string starts from the left, loose end exits toward the right edge.
Tangle sequence, the knot gradually unravelling as someone pulls the loose end to the right:
1. Full messy knot, exactly like the reference, short loose end trailing right.
2. Knot slightly looser, a few loops opened, the loose end longer and straighter.
3. Knot half undone, loops larger and fewer, a long wavy string going right.
4. Only one or two loose loops left, the rest a long gently wavy string.
5. Almost straight long horizontal string with one tiny kink, spanning the whole width.
Then small single snags on a straight horizontal string spanning the whole width:
6. The straight string with one small tight knot in the middle.
7. The straight string with one small loose twisted loop in the middle.
$STYLE
$TAIL"

run lines "Reference image for line quality: $INK/raw/figure-seated-v1.jpg . Match the ground line in it exactly: thin black fineliner, slightly wobbly, small breaks and overlaps, varied pressure.
Call generate_image exactly 3 times, wide landscape images. Each shows ONLY one long thin horizontal hand drawn line spanning the full width edge to edge, nothing else.
1. Mostly straight with tiny wobbles and one small overlap where the pen was lifted.
2. A very gentle rise and fall along its length.
3. Mostly straight with one short doubled stroke near the left.
$STYLE
$TAIL"

run objects "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly 5 times, one object per image, the object alone, small and centred:
1. A small round hand mirror standing upright.
2. A single bent paperclip.
3. A small folded paper note, slightly open.
4. A small desk lamp, simple, switched off.
5. A short loose loop of string tied in a simple circle.
$STYLE
$TAIL"

run laptop "Reference image for line quality: $INK/raw/broom-v1.jpg .
Call generate_image exactly 1 time: a small quick sketch of a simple open laptop seen from the front at a slight angle, screen empty and blank, no logo, no keyboard detail.
$STYLE
$TAIL"

echo "=== done $(date -u +%H:%M:%S)"
