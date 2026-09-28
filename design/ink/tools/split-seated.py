#!/usr/bin/env python3
"""Split svg/figure-seated.svg into registered layers for the hero idle animation.
Every layer keeps the original 0 0 2469 705 viewBox, so they stack exactly and CSS can
turn the head, move the eye and swing the shins about fixed pivots.
  seated-head.svg   the head ring (no eye)
  seated-eye.svg    the eye dot alone
  seated-shin-l/r   each lower leg, clipped just under the knee
  seated-body.svg   everything else
usage: tools/split-seated.py   (run from design/ink)"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from svgp import paths, subpaths

src = open("svg/figure-seated.svg").read()
P = [subpaths(d) for d in paths(src)]
VB = 'viewBox="0 0 2469 705"'

def svg(ds, clip=None):
    defs, attr = "", ""
    if clip:
        defs = f'<clipPath id="c"><path clip-rule="evenodd" d="{clip}"/></clipPath>'
        attr = ' clip-path="url(#c)"'
    body = "".join(f'<path d="{d}"/>' for d in ds)
    return f'<svg xmlns="http://www.w3.org/2000/svg" {VB}>{defs}<g fill="currentColor"{attr}>{body}</g></svg>\n'

join = lambda subs: "".join(d for d, _ in subs)
head = join(P[0])                                     # outer ring, its hole, and two small ticks
eye = P[1][0][0]                                      # the dot
rest = [join(P[1][1:])] + [join(p) for p in P[2:]]    # arms, body, legs, ground line

# the shins hang below y=470; they split along the gap between the two legs, and the right one
# steps round the hand resting on the ledge
L = "M1476 470H1554L1560 520L1578 612L1560 705H1476Z"
R = "M1554 470H1624L1630 506L1668 512V705H1560L1578 612L1560 520Z"
BOTH = "M1476 470H1624L1630 506L1668 512V705H1476Z"
FULL = "M0 0H2469V705H0Z"

out = {
    "seated-head": svg([head]),
    "seated-eye": svg([eye]),
    "seated-shin-l": svg(rest[1:3], L),
    "seated-shin-r": svg(rest[1:3], R),
    "seated-body": svg(rest, FULL + BOTH),
}
for name, text in out.items():
    open(f"svg/{name}.svg", "w").write(text)
    print(f"svg/{name}.svg {len(text)} bytes")
