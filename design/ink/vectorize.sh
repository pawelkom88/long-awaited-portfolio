#!/usr/bin/env bash
# Raster ink sketch -> clean single-colour SVG (fill="currentColor").
# usage: ./vectorize.sh raw/<in>.jpg <name> [WxH+X+Y crop, gravity center] [threshold %, default 38; raise for faint lines]
# NOTRIM=1 keeps the crop frame as the viewBox, so a sequence of frames stays registered.
set -euo pipefail
cd "$(dirname "$0")"

in=$1
name=$2
crop=${3:-}
thr=${4:-38}
OUT=../../src/assets/ink  # where the site reads its drawings
mkdir -p "$OUT"

crop_args=()
if [[ -n $crop ]]; then crop_args=(-gravity center -crop "$crop" +repage); fi
trim_args=(-trim +repage -bordercolor white -border 30)
if [[ -n ${NOTRIM:-} ]]; then trim_args=(+repage); fi

magick "$in" ${crop_args[@]+"${crop_args[@]}"} -colorspace gray -resize 200% -blur 0x1 -threshold "$thr%" \
  ${trim_args[@]} pbm:- |
  potrace -s --turdsize 40 --alphamax 1.1 --opttolerance 0.3 -o "$OUT/$name.raw.svg" -

svgo -q "$OUT/$name.raw.svg" -o "$OUT/$name.svg"
rm "$OUT/$name.raw.svg"
sed -i '' 's/fill="#000"/fill="currentColor"/g' "$OUT/$name.svg"
echo "$OUT/$name.svg $(wc -c <"$OUT/$name.svg") bytes"
