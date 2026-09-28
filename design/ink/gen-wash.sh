#!/usr/bin/env bash
# Ink-wash edge masks for the paper -> night transition (spike/wash-top.webp, spike/wash-bottom.webp).
# Alpha only: the colour comes from CSS (--abyss), so one pair of files serves day and night themes.
# Tileable horizontally (seamless cross-fade), opaque along the bottom row so it seams onto a solid fill.
# usage: ./gen-wash.sh    (needs magick + cwebp)
set -euo pipefail
cd "$(dirname "$0")"
W=1200 H=360
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

# noise is drawn twice as wide, then the two halves are cross-faded with a linear ramp:
# the right edge of the result is the left half's last column, its left edge the right half's first,
# and those two columns are neighbours in the source, so the tile meets itself without a seam
seamless() {
  magick "$1" -crop 2x1@ +repage -reverse -fx 'u*(1-i/w) + v*(i/w)' -auto-level "$1"
}
wash() { # $1 seed, $2 out
  local s=$1
  # two octaves of smooth noise: big bays of bleed, and a fine ragged fibre edge
  magick -seed $s -size 64x8 xc: +noise Random -channel G -separate +channel \
    -virtual-pixel tile -filter Gaussian -distort Resize $((2*W))x${H}! -auto-level "$tmp/coarse.png"
  seamless "$tmp/coarse.png"
  magick -seed $((s+1)) -size 800x80 xc: +noise Random -channel G -separate +channel \
    -virtual-pixel tile -filter Gaussian -distort Resize $((2*W))x${H}! -auto-level "$tmp/fine.png"
  seamless "$tmp/fine.png"
  magick -size ${W}x${H} gradient:black-white "$tmp/grad.png"
  # field: the edge sits around 55% height and wanders with the noise
  magick "$tmp/grad.png" "$tmp/coarse.png" "$tmp/fine.png" \
    -fx 'u + (v-.5)*.55 + (u[2]-.5)*.12' "$tmp/field.png"
  # body: a wet edge, fairly crisp, with a darker tide line where the ink pooled
  magick "$tmp/field.png" -level 52%,60% -virtual-pixel edge -blur 0x1.2 "$tmp/body.png"
  # halo: a pale mottled bleed just above the edge
  magick "$tmp/field.png" -level 34%,56% "$tmp/fine.png" -compose Multiply -composite \
    -evaluate Multiply .24 -virtual-pixel edge -blur 0x7 "$tmp/halo.png"
  # a few loose specks flicked above the edge
  magick -seed $((s+2)) -size ${W}x${H} xc: +noise Random -channel G -separate +channel \
    -threshold 99.93% -morphology Dilate Disk:1.8 -virtual-pixel edge -blur 0x.8 \
    \( "$tmp/grad.png" -level 22%,58% -negate -level 0,60% -negate \) -compose Multiply -composite \
    -evaluate Multiply .8 "$tmp/specks.png"
  magick "$tmp/body.png" "$tmp/halo.png" -compose Lighten -composite \
    "$tmp/specks.png" -compose Lighten -composite \
    -fx 'j >= h-3 ? 1 : (j < 3 ? 0 : u)' "$tmp/alpha.png"
  magick -size ${W}x${H} xc:black "$tmp/alpha.png" -alpha off -compose CopyOpacity -composite "$tmp/out.png"
  cwebp -quiet -q 70 -alpha_q 85 "$tmp/out.png" -o "$2"
  echo "$2 $(wc -c <"$2") bytes"
}
wash 11 spike/wash-top.webp
wash 29 "$tmp/b.webp"
magick "$tmp/b.webp" -flip "$tmp/b.png" && cwebp -quiet -q 70 -alpha_q 85 "$tmp/b.png" -o spike/wash-bottom.webp
echo "spike/wash-bottom.webp $(wc -c <spike/wash-bottom.webp) bytes"
