#!/usr/bin/env bash
# Batch 3: what batch 2 lost to the quota cut, plus the pose sheet and the "magic" scene.
# Most important first so a quota cut loses the least.
# Each job prints image paths (or an error); copy + vectorise happens after review.
# usage: ./gen-batch3.sh [start-at-UTC HH:MM]
set -uo pipefail
cd /Users/paw/WebstormProjects/portfolio   # agy trusted workspace

if [[ -n ${1:-} ]]; then
  until [[ $(date -u +%H:%M) > $1 || $(date -u +%H:%M) == "$1" ]]; do sleep 30; done
fi

INK=/Users/paw/WebstormProjects/portfolio/design/ink
STYLE='STYLE: Quick loose line drawing, black fineliner pen on plain white paper. Wobbly uneven line, varied pressure, minimal strokes, some lines not quite closed. No shading, no hatching, no fill, no colour, no gradient, no shadow, no text, no border, no page edge, no notebook lines. Huge empty white space. A thoughtful adult'"'"'s notebook sketch. Not cartoon, not cute, not vector icon, not clip art, not polished illustration, no animals, no landscape.'
FIGURE="Reference image: $INK/raw/figure-seated-v1.jpg . Look at it first. Keep the exact same small figure: plain round head with one dot eye, simple loose body, same thin line, same proportions. The figure stays small in a wide landscape frame, with one long thin wobbly horizontal ground line spanning the full width, the figure resting on it."
TAIL='Do not run commands or write files. Finally reply with ONLY the absolute file paths of the images, one per line, in order.'

run() {
  echo "=== $1 $(date -u +%H:%M:%S)"
  agy -p "$2" --print-timeout 12m
}

run magic "$FIGURE
Call generate_image exactly 3 times, the same scene each time, wide landscape. The figure sits on the ground line in front of a small simple open laptop (blank screen, no logo). Out of the laptop screen comes one single thin string, like a magician pulling a ribbon from a hat, and the figure holds it lightly.
1. The string comes out of the screen as a straight line, then rises in one long loose curve up and to the right, and high up it ends tied to a small simple diamond kite in mid air.
2. Same, but the figure has just stood up and the kite is higher, the string longer and taut.
3. Same scene before it starts: the figure seated at the laptop, only a short loose end of string poking out of the screen, no kite.
$STYLE
$TAIL"

run poses "$FIGURE
Call generate_image exactly 3 times, one pose per image, same framing and ground line position in every image so the poses register:
1. The figure kneeling beside a small open drawer box on the ground, rummaging inside it, head tilted, searching for something lost.
2. The figure standing, holding up an empty open drawer box and peering into it, puzzled.
3. The figure seated on the ground line reading a small folded note held in both hands.
$STYLE
$TAIL"

run objects "Reference image for line quality: $INK/raw/broom-v1.jpg . Look at it first and match its loose thin line weight exactly.
Call generate_image exactly 3 times, one object per image, the object alone, small and centred:
1. A small desk lamp, simple, switched off.
2. A short loose loop of string tied in a simple circle.
3. A small quick sketch of a simple open laptop seen from the front at a slight angle, screen empty and blank, no logo, no keyboard detail.
$STYLE
$TAIL"

echo "=== done $(date -u +%H:%M:%S)"
