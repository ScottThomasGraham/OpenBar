#!/usr/bin/env bash
# Fetch PRISTINE upstream checkouts at Evora's pinned baselines, for diffing our forks
# against clean upstream when debugging. Clones into Evora/upstream/ (gitignored).
# Shallow (one tag each) to keep size down. See docs/upstream-baselines.md.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p upstream

# name | repo | ref   (ref = a tag, or "default" to clone the default branch)
# NOTE: Rotorflight is UNTOUCHED (we ride it, don't fork) and its firmware repo tags by
# Betaflight base version (release/4.x), not by product version. Product "2.2.1" is what the
# owner flashes; we clone the default branch for code reference. See docs/upstream-baselines.md.
REFS=(
  "edgetx|https://github.com/edgetx/edgetx|v2.12.1"
  "expresslrs|https://github.com/ExpressLRS/ExpressLRS|3.6.3"   # recommended pin (see upstream-baselines.md)
  "rotorflight|https://github.com/rotorflight/rotorflight-firmware|default"
)

for r in "${REFS[@]}"; do
  IFS='|' read -r name repo ref <<<"$r"
  dest="upstream/$name"
  if [ -d "$dest/.git" ]; then
    echo ">> $name already present ($(git -C "$dest" describe --tags --always 2>/dev/null)) — skipping"
    continue
  fi
  echo ">> cloning $name @ $ref ..."
  if [ "$ref" = "default" ]; then
    git clone --depth 1 "$repo" "$dest"
  else
    git clone --depth 1 --branch "$ref" "$repo" "$dest"
  fi && echo "   ok: $(git -C "$dest" describe --tags --always 2>/dev/null)" \
     || echo "   !! failed — check the ref at $repo/tags"
done

echo
echo ">> reference checkouts under: $(pwd)/upstream"
echo "   (EdgeTX submodules are NOT fetched by default; run 'git -C upstream/edgetx submodule update --init' if you need them.)"
