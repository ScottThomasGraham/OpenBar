# Building Evora TX & the simulator dev loop

_Last updated: 2026-06-02. Supersedes the "do NOT build locally, use CI" note in older docs._

Local builds **work now** on this Apple-Silicon Mac via a native arm64 toolchain image. The old
blocker — random `arm-none-eabi-g++` segfaults — was caused by the stock `edgetx-dev` image shipping
an **x86_64** cross-compiler that ran under emulation. We replaced it with a native one.

All commands run from `forks/evora-tx/`.

## Firmware (flashable .bin)

```bash
./build-evora-tx.sh          # TX16S / TX16S MK2 (PCB=X10, PCBREV=TX16S)
```
Output: `build-tx16s-native/arm-none-eabi/firmware.bin` (~1.7 MB), also copied to `dist/`.
First run builds the toolchain image (~2 min) + downloads ARM's aarch64 toolchain (151 MB).

- **TX16S MK1 and MK2 are the same target** (`PCBREV=TX16S`, STM32F407). Only the **MK3** (STM32H7,
  800×480) is a different build — wiring that into the script is a TODO.
- Flash: copy the bin to `/FIRMWARE` on the radio SD, enter the bootloader (power on holding both
  horizontal trims inward), "Write Firmware". Boots as **Evora**.

## Simulator (fast UI loop — no flashing)

```bash
./sim.sh                     # rebuild sim from current source -> sim-shot.png
./sim.sh 5 Down Down Return  # boot delay + xdotool keys to drive to a screen
```
Renders the **real LVGL UI** headlessly (Xvfb) in the arm64 container and writes the LCD capture to
`sim-shot.png`. This is the primary way to verify UI changes in seconds instead of flashing. It
reproduced real on-radio bugs exactly (e.g. the "OpenBar" logo), so it's trustworthy for UI work.

**What the sim can and can't verify:**
- ✅ Anything visual — home, screens, wizard, menus, themes, layout, fonts.
- ❌ **Audio** (no sound in a screenshot) and ❌ **rotary-encoder input** (the encoder maps to keyboard
  keys, which don't reach SDL under Xvfb's no-window-manager focus model). It's a **touch** sim —
  drive it with mouse clicks. Encoder/scroll-wheel behavior must be tested on real hardware.

**Preview hooks for screenshots** (jump straight to a screen; **reset to ship values before
committing**):
- `evora_wizard.cpp`: `EV_WIZARD_START` (0..12) — wizard opens at this step.
- `evora_home.cpp`: `EV_PREVIEW_WIZARD` (0/1) — auto-open the wizard on boot. `EV_FORCE_STATE`,
  `EV_PREVIEW_SCREEN` — force home state / destination screen.
- Note: `EV_PREVIEW_WIZARD=1` builds the home twice → two stacked wizards; chip taps (global `g_wiz`)
  then hit the hidden one. For tapping options in the sim, navigate normally or set the default `sel[]`.

## How the toolchain image is built (`.native-build/`)

`evora-tx-native:14.2` = Ubuntu 22.04 (arm64) + ARM's **aarch64**-hosted `arm-none-eabi 14.2.rel1`
toolchain (native → no emulation, no ICEs) + everything EdgeTX codegen needs:
- pip: `Pillow Jinja2 PyYAML lz4 pyelftools asciitree libclang`
- apt: `clang libclang-dev` (EdgeTX parses `definitions.h` via libclang to generate YAML datastructs;
  without it you get a misleading `stdbool.h not found`)
- apt: `libsdl2-dev` + `xvfb x11-utils imagemagick xdotool` (for the simulator + screenshots)

The simulator is the standalone `simu` target (`-DDISABLE_COMPANION=ON`, no Qt). The 151 MB toolchain
tarball and the `sim-sd/`/`sim-settings/` persistent storage are gitignored.

## CI (alternative)

Pushing to `evora` still triggers GitHub Actions to build **both** radios; download artifacts with
`gh run download <id> -R ScottThomasGraham/Evora-TX -n evora-tx16s`. Local native build is now the
faster inner loop; CI remains the source of truth for the MK3 artifact until the local MK3 build is
wired up.
