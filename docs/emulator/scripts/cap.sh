#!/bin/bash
# Capture a single Evora firmware screen from the simu.
# usage: cap.sh <out.png> [shoot_delay_secs] [key1 key2 ...]
set +e
OUT="${1:-/src/docs/emulator/fw.png}"; shift
DELAY="${1:-5}"; shift 2>/dev/null
export DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 SDL_VIDEODRIVER=x11
pkill Xvfb 2>/dev/null; pkill -f native/simu 2>/dev/null; sleep 1
rm -rf /root/sim/settings; cp -r /root/sim/settings_seed /root/sim/settings
Xvfb :99 -screen 0 1280x720x24 >/tmp/xvfb.log 2>&1 &
sleep 3
echo "xdpyinfo: $(xdpyinfo -display :99 2>&1 | grep -c dimensions)"
cd /src/build-simu/native
./simu --width 480 --height 272 --storage /root/sim/storage --settings /root/sim/settings >/tmp/run.log 2>&1 &
SP=$!
sleep "$DELAY"
WID=$(xdotool search --name "" 2>/dev/null | tail -1)
[ -n "$WID" ] && xdotool windowactivate "$WID" 2>/dev/null
for k in "$@"; do xdotool key --clearmodifiers "$k" 2>/dev/null; sleep 1; done
sleep 1
import -window root /tmp/full.png 2>/tmp/imp.log
echo "imp_exit=$?  full=$(identify /tmp/full.png 2>/dev/null | awk '{print $3}')"
convert /tmp/full.png -crop 766x400+398+221 +repage "$OUT" 2>/dev/null && echo "CROP_OK $OUT" || echo "CROP_FAIL"
echo "trace: $(grep -iE 'Home::build|Screen::|Wizard::' /tmp/run.log | tail -1)"
echo "imp.log: $(cat /tmp/imp.log 2>/dev/null)"
kill $SP 2>/dev/null; pkill Xvfb 2>/dev/null
exit 0
