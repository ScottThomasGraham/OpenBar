#!/bin/bash
# usage: shot.sh <output_png> [keys...]
set +e
OUT="$1"; shift
export DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 SDL_VIDEODRIVER=x11
pkill Xvfb 2>/dev/null; pkill -f native/simu 2>/dev/null; sleep 1
Xvfb :99 -screen 0 1280x720x24 >/tmp/xvfb.log 2>&1 &
sleep 3
cd /src/build-simu/native
./simu --width 480 --height 272 --storage /root/sim/storage --settings /root/sim/settings >/tmp/run.log 2>&1 &
SP=$!
sleep 7
WID=$(xdotool search --name "" 2>/dev/null | tail -1); [ -n "$WID" ] && xdotool windowactivate "$WID" 2>/dev/null
for k in "$@"; do xdotool key --clearmodifiers "$k" 2>/dev/null; sleep 1; done
sleep 2
import -window root "$OUT" 2>/tmp/imp.log
echo "shot_exit=$?"; ls -la "$OUT" 2>/dev/null
kill $SP 2>/dev/null; pkill Xvfb 2>/dev/null; exit 0
