#!/bin/bash
set +e
export DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 SDL_VIDEODRIVER=x11
pkill Xvfb 2>/dev/null; pkill -f native/simu 2>/dev/null; sleep 1
Xvfb :99 -screen 0 1280x720x24 >/tmp/xvfb.log 2>&1 &
sleep 3
cd /src/build-simu/native
./simu --width 480 --height 272 --storage /root/sim/storage --settings /root/sim/settings >/tmp/run.log 2>&1 &
SP=$!
sleep 4
W=$(xdotool search --name "EdgeTx Simu" | head -1)
for i in 1 2 3 4 5 6 7 8; do
  import -window root /root/sim/f_$i.png 2>/dev/null
  xdotool windowactivate "$W" 2>/dev/null
  xdotool key --clearmodifiers Return 2>/dev/null
  sleep 1.0
done
import -window root /root/sim/f_9.png 2>/dev/null
echo "=== md5 of frames (distinct = state changes) ==="; md5sum /root/sim/f_*.png
kill $SP 2>/dev/null; pkill Xvfb 2>/dev/null
exit 0
