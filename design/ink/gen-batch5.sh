#!/usr/bin/env bash
# Batch 5: the sound switch. A small music box with a crank, and the notes it lets out.
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

# usage: ./gen-batch5.sh [start-at-UTC HH:MM]
if [[ -n ${1:-} ]]; then
  until [[ $(date -u +%H:%M) > $1 || $(date -u +%H:%M) == "$1" ]]; do sleep 30; done
fi

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== sound $(date -u +%H:%M:%S)"
agy -p "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly 2 times, one drawing per image, the subject alone, small and centred:
1. A small simple wooden music box, a plain closed box seen at a slight angle, with a little crank handle sticking out of one side. Nothing else.
2. Three small loose hand drawn music notes, like quick doodles, floating in a loose rising diagonal. Nothing else.
$STYLE
$TAIL" --print-timeout 12m
echo "=== done $(date -u +%H:%M:%S)"
