# OpenBar emulator workbench

Headless EdgeTX **simulator** for the TX16S, used to develop and screenshot the OpenBar UI
without flashing hardware. The simulator runs the *real* radio firmware (same source we flash),
so what you see here is what runs on the radio.

`edgetx-home.png` / `edgetx-menu.png` — the current **baseline** (stock EdgeTX `2.12.1-openbar`),
captured live from this harness. As OpenBar's bespoke UI lands, these get replaced by OpenBar screens.

## How it works

A dedicated arm64 Linux container (`openbar-simu`) builds the EdgeTX `simu` SDL target **natively**
(no qemu → no compiler segfaults), runs it under **Xvfb** (virtual display), and grabs the framebuffer
with ImageMagick `import`. The OpenBar-Radio repo is bind-mounted at `/src`.

### One-time container setup
```bash
docker --context colima-openbar run -d --name openbar-simu --platform linux/arm64 \
  -v "$HOME/Projects/OpenBar/forks/OpenBar-Radio:/src" -w /src arm64v8/ubuntu:24.04 sleep infinity
docker exec openbar-simu bash -lc 'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  build-essential cmake git python3 python3-pip libsdl2-dev gettext xvfb imagemagick x11-apps xdotool \
  qt6-base-dev qt6-multimedia-dev qt6-serialport-dev qt6-svg-dev qt6-tools-dev qt6-tools-dev-tools \
  qt6-l10n-tools libssl-dev libgl1-mesa-dev libgl1-mesa-dri libclang-dev clang'
docker exec openbar-simu bash -lc 'python3 -m pip install --break-system-packages \
  asciitree jinja2 pillow lz4 pyelftools pydantic clang'
```

### Build the simulator
```bash
docker exec openbar-simu bash -lc 'cd /src && mkdir -p build-simu && cd build-simu && \
  cmake -DPCB=X10 -DPCBREV=TX16S -DDEFAULT_MODE=2 -DCMAKE_BUILD_TYPE=Release .. && make -j"$(nproc)" simu'
# binary: /src/build-simu/native/simu
```

### Capture a screenshot
```bash
docker cp scripts/shot.sh openbar-simu:/root/shot.sh
docker exec openbar-simu timeout 45 bash /root/shot.sh /root/sim/out.png <navkeys...>
docker cp openbar-simu:/root/sim/out.png ./out.png
```
- `scripts/frames.sh` captures a filmstrip (one frame per keypress) — use it to find a target screen.
- The SD-card content (`c480x272.zip` from EdgeTX/edgetx-sdcard `v2.12.1`) is loaded into `/root/sim/storage`;
  settings persist in `/root/sim/settings` (first boot calibrates; later boots go straight to the main view).

## Gotchas
- **Keys must be real XTEST events** (`xdotool key ...` to the focused window). `xdotool key --window`
  uses *synthetic* events, which SDL ignores. Focus the `EdgeTx Simu` window first.
- First boot shows "Missing/bad radio data" → "Storage preparation" → gimbal calibration; press Return to
  advance. Subsequent boots show only the "Throttle not idle" warning (one Return → main view).
- Build the simulator **arm64-native** in this container; the amd64 `edgetx-dev` image segfaults under qemu
  on Apple Silicon (firmware is built on GitHub Actions instead — see the CI workflows).
