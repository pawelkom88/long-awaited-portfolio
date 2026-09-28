#!/usr/bin/env bash
# Batch 8: a washing line that sags, for the blog's line of posts.
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration.'
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

echo "=== sag $(date -u +%H:%M:%S)"
agy -p "Reference image for line quality: $INK/raw/line-3-v1.jpg . Look at it first and match its loose thin single line exactly.
Call generate_image exactly 2 times, one drawing per image, wide landscape format:
1. One single long thin string drawn as one line from the far left edge to the far right edge, sagging gently in the middle like a slack washing line, lowest in the centre. Both ends at the same height. Nothing hanging on it, no posts, no pegs. Nothing else.
2. The same single sagging string from edge to edge, drawn a little differently, a gentle even sag. Nothing else.
$STYLE
$TAIL" --print-timeout 12m
echo "=== done $(date -u +%H:%M:%S)"
