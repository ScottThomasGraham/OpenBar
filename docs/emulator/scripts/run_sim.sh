#!/bin/bash
# usage: run_sim.sh <output_png> [nav keys...]
set +e
OUT="$1"; shift
export DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 SDL_VIDEODRIVER=x11
pkill Xvfb 2>/dev/null; pkill -f native/simu 2>/dev/null; sleep 1
Xvfb :99 -screen 0 1280x720x24 >/tmp/xvfb.log 2>&1 &
XP=$!
sleep 3
cd /src/build-simu/native
./simu --width 480 --height 272 --storage /root/sim/storage --settings /root/sim/settings >/tmp/run.log 2>&1 &
SP=$!
sleep 6
WID=$(xdotool search --name "" 2>/dev/null | tail -1)
[ -n "$WID" ] && xdotool windowactivate "$WID" 2>/dev/null
# clear sequential boot alerts (missing data, storage preparation) — press Return repeatedly
for i in 1 2 3 4 5 6 7 8; do xdotool key --clearmodifiers Return 2>/dev/null; sleep 1.3; done
# optional navigation keys
for k in "$@"; do xdotool key --clearmodifiers "$k" 2>/dev/null; sleep 1; done
sleep 2
import -window root "$OUT" 2>/tmp/imp.log
echo "shot_exit=$?"; ls -la "$OUT" 2>/dev/null
echo "=== run.log tail ==="; tail -6 /tmp/run.log
kill $SP 2>/dev/null; kill $XP 2>/dev/null
exit 0
