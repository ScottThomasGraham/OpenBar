#!/usr/bin/env bash
# Regenerate Evora LVGL fonts for the Brutalist theme.
# Display/titles/values = Archivo Black; small data labels = IBM Plex Mono.
# Keeps the existing evora_* symbol names so no firmware code references break.
# Requires: node + npx (lv_font_conv@1.5.3 fetched on demand). Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")"
OUT=../../forks/evora-tx/radio/src/fonts/evora
ARCHIVO=ArchivoBlack-Regular.ttf
MONO=IBMPlexMono-Medium.ttf
LFC="npx -y lv_font_conv@1.5.3"
COMMON="--bpp 4 --format lvgl --no-compress --force-fast-kern-format"

# numeric/unit range: digits . , % : - / ° space  and unit caps C V A W
NUM='0x20,0x25,0x2C-0x2F,0x30-0x3A,0xB0'
NUMU="$NUM,0x41,0x43,0x56,0x57"   # + A C V W for V/A/W/°C
ASCII='0x20-0x7E,0xB0'            # full printable ASCII + degree

gen(){ # name font size range
  echo "  $1  ($2 @ ${3}px)"
  $LFC $COMMON --font "$2" --size "$3" --lv-font-name "$1" -r "$4" -o "$OUT/$1.c" >/dev/null 2>&1
}

echo "Regenerating Evora fonts -> $OUT"
gen evora_num_xl  "$ARCHIVO" 60 "$NUM"     # hero numerals
gen evora_num_lg  "$ARCHIVO" 44 "$NUMU"    # big values + units (V A W °C)
gen evora_num_md  "$ARCHIVO" 26 "$NUM"     # values / timers
gen evora_brand   "$ARCHIVO" 52 "$ASCII"   # EVORA wordmark / big titles
gen evora_title   "$ARCHIVO" 22 "$ASCII"   # screen titles / values w/ letters (H3-120, CW)
gen evora_label   "$MONO"    15 "$ASCII"   # data labels (snake_case), breadcrumbs
gen evora_label_sm "$MONO"   12 "$ASCII"   # small labels / units

echo "Done. Sizes:"
ls -la "$OUT"/evora_num_*.c "$OUT"/evora_brand.c "$OUT"/evora_title.c "$OUT"/evora_label*.c | awk '{printf "  %7d  %s\n",$5,$9}'
