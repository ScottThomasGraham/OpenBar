# Evora — current status & how to resume

_Last updated: 2026-06-02_

Evora is an open-source, **firmware-level** recreation of the Mikado VBar Control Touch
*experience* for RC helis: bind + a guided on-radio wizard + fly, no PC. See [`../README.md`](../README.md)
for the vision and [`superpowers/specs/2026-06-01-evora-architecture-design.md`](superpowers/specs/2026-06-01-evora-architecture-design.md)
for the full architecture.

## North Star (confirmed by owner)
Evora is its **own bespoke OS with a gorgeous interface**. We keep EdgeTX's *engine* (gimbal/ADC
drivers, RF/CRSF, mixer, failsafe, storage, bootloader — the dangerous, proven plumbing) and **rip
out EdgeTX's entire GUI**, replacing it with Evora's own (boot, home, navigation, wizard). Not a
widget/skin inside EdgeTX. Visual language = **"aerospace instrument, blacked-out"**: layered dark
backgrounds, Rajdhani instrument numerals + Barlow labels, amber accent + green = healthy, circular
gauges, hairlines. Flight performance stays Rotorflight's (untouched FC). **The radio is a fixed
universal controller** — no radio settings; all flight layering lives in Rotorflight (see
`design/radio-is-a-controller.md`).

## Two supported radios (only these, for the foreseeable future)
| | Evora TX (TX16S) | Evora TX (MK3) |
|---|---|---|
| MCU | STM32F407 | STM32H750 (H7, SDRAM/QSPI) |
| Panel | 480×272 | 800×480 |
| EdgeTX flavor | `tx16s` (PCB=X10/TX16S) | `tx16smk3` (PCB=TX16SMK3) |
| CI artifact | `evora-tx16s` | `evora-tx16smk3` |

One codebase serves both: the UI is authored in a **logical 480×272 space** and the `EV_SC(v)` macro
(`mainview/evora_fonts.h`) scales every literal coordinate to the panel (1.0× / ~1.667×). Bottom bars
anchor to the real edge via `height()`. Per-resolution font + dog-image sets (`fonts/evora` /
`fonts/evora-lrg`, identical symbol names) are selected by `BITMAPS_DIR` in `fonts/CMakeLists.txt`.

## Architecture
- **Evora TX** = fork of **EdgeTX** (`ScottThomasGraham/Evora-TX`, baseline `v2.12.1`, branch `evora`).
- **Evora Link** = fork of **ExpressLRS** (`ScottThomasGraham/Evora-Link`, baseline `4.0.1`, branch `evora`) — both TX module + RX; later a private high-bandwidth config channel. (Brand only so far; ELRS build is a Phase-0 task.)
- **Rotorflight** = untouched FC, configured over the link via MSP.
- Meta repo: `ScottThomasGraham/Evora` (branch `main`) — docs, mockups, design.

## What's built (real firmware, both radios, CI-green, emulator-verified)
- **Boot splash** — full-screen SD `/IMAGES/splash.png` (per-radio asset under `docs/sdcard/<radio>/IMAGES/`) with the dog+EVORA hero; embedded `splash_logo.png` (per-res, RGBA) is the no-SD fallback.
- **Two-state home** — idle radio-info ↔ flight dashboard (circular `lv_arc` headspeed gauge + battery hero + mini-stats), switches on `TELEMETRY_STREAMING()`. Faint dog watermark + amber dog corner-glyph.
- **Destination screens** — Helicopters / System ("no flight settings here") / Bind / Tools (touch + back).
- **13-step New Heli Setup wizard** — the real flow, MOTOR-safe, verify-every-step. Steps: Before we begin · Bind · **Servo pulse (760/1520)** · Pick heli · Board orientation · Swash type · Rotor direction · **Swash check (live)** · **Collective pitch (live)** · **Tail travel (live)** · Governor (ESC/Rotorflight/Nitro) · Governor settings · Ready to fly. Diagrams are **drawn with LVGL primitives** (rings/arcs/lines/labels — ~0 flash, scale via EV_SC). Interactions are real (select/segmented/live ±/governor branch); **MSP writes are stubbed** until the heli's on the bench.
- **Real-firmware overviews:** `docs/emulator/overview-tx16s.png` + `overview-mk3.png` (every screen). Per-screen: `fw-*.png` / `mk3-*.png`; wizard steps `fw-wiz-*.png` / `mk3-wiz-*.png`.
- **Custom fonts** generated via lv_font_conv (Rajdhani Bold/SemiBold + Barlow Semi-Condensed) in `radio/src/fonts/evora{,-lrg}/`, declared in `mainview/evora_fonts.h` (EVF_* macros). Fits F407 flash.
- All telemetry/setup **values are DEMO placeholders** — live data needs the heli.

### UI source files (`forks/evora-tx/radio/src/gui/colorlcd/`)
- `mainview/evora_home.{h,cpp}` — two-state home (buildIdle/buildFlight, dog images, gauge, watermark).
- `mainview/evora_screen.{h,cpp}` — Helicopters/System/Bind/Tools overlays.
- `mainview/evora_wizard.{h,cpp}` — the 13-step wizard. `STEPS[]` (section/title/sub/live/finish) + `switch(step)` body; LVGL-primitive diagram helpers (`poly` via a static point pool, `ring`/`dot`/`arcSeg`/`box`/`card`); governor branch on `sel[10]`; live ± via `adjust()`. Header labels are TOP-aligned (NOT `*_MID` against the full screen).
- `mainview/evora_fonts.h` — `EV_SC` scale macro, EVF_* font macros, dog image externs.
- `mainview/layout.cpp` — makes EvoraHome the main view; clears EdgeTX topbar.
- `radio/src/fonts/{evora,evora-lrg}/` — fonts + dog images. `radio/src/bitmaps/{480x272,800x480}/splash_logo.png`.

### Emulator preview toggles (ship as default; flip only to screenshot)
`evora_home.cpp`: `EV_FORCE_STATE` (0 auto / 1 flight / 2 idle), `EV_PREVIEW_SCREEN` (-1..3), `EV_PREVIEW_WIZARD` (0/1). `evora_wizard.cpp`: `EV_WIZARD_START` (0..12).

## How to build
- **Flashable firmware (ARM):** push to `evora` → GitHub Actions matrix builds **both** radios; download
  `evora-tx16s` / `evora-tx16smk3` (`gh run download <id> -R ScottThomasGraham/Evora-TX -n evora-tx16s`).
  - ⚠️ Do NOT build firmware locally (edgetx-dev image is amd64; `arm-none-eabi-g++` segfaults under qemu on this Mac). Use CI.
- **Emulators (UI dev, arm64-native in container `evora-simu`, profile `colima-evora`):**
  - 480×272: `cd /src/build-simu/native && cmake . && make -j simu`  →  `build-simu/native/simu`
  - 800×480: `cd /src/build-mk3/native && make -j simu`  (configured `cmake -DPCB=TX16SMK3 -DDEFAULT_MODE=2 ..`)
  - **Build at `native/`, NOT the superbuild root** (root `make simu` is a no-op). After a file rename, delete stale `*.o` + `VerifyGlobs.cmake`.

## Emulator capture workflow (reliable)
- Restore the settings seed (`/root/sim/settings_seed`, calibrated, warnings off); never re-wipe.
- 480: `docker exec evora-simu bash /src/build-simu/cap.sh <delay> [keys]` → `/tmp/out.png`; crop `480x272+404+355`; Xvfb 1280×720.
- MK3: `docker exec evora-simu bash /src/build-mk3/capm.sh <delay>` → `/tmp/out.png`; crop `564x338+566+433`; Xvfb 1920×1080.
- `docker cp evora-simu:/tmp/out.png …` (the container mounts the **fork** at /src; meta `docs/` is NOT mounted → cp out).
- Touch (mouse→LCD) works top-row; footer taps drift → use the preview toggles for screenshots.

## Next steps
1. **(needs heli on bench)** Wire the wizard's **MSP writes** + live telemetry/servo motion (the steps are collect-only today); live data in home + flight dashboards.
2. **Class presets** — owner supplies per-size Rotorflight files/offsets from flight testing; "Pick your heli" applies them. Bake the standard `AECR1T23` rc_map + mode-activation preset into the FlyDragon.
3. **Evora Link (ELRS):** build TX (`Unified_ESP32_2400_TX_via_ETX`) + author the FlyDragon RX hardware layout (`Unified_ESP8285_2400_RX_via_BetaflightPassthrough`); pick a binding phrase; then the private fast-config channel.
4. **Phase 0 hardware (owner):** flash `evora-tx16s` (bootloader-recoverable) once the SD reader arrives; copy `docs/sdcard/tx16s/IMAGES/splash.png` to the SD. MK3 when on hand.

## Hardware (owner's bench)
- Radios: RadioMaster **TX16S** (now) + **TX16S MK3** (H7) — both supported. Internal **ELRS** module (`RadioMaster TX16S 2400 TX`).
- FC: **FlyDragon F722 V2** (Rotorflight `FLYDRAGONF722_V2_2`, STM32F722) with **built-in ELRS RX** (ESP8285+SX1280, FC UART1, flash via Rotorflight passthrough; no mainline ELRS target — author one).
- Rotorflight: latest stable **2.2.1** (owner flashes).

## Key docs
- `superpowers/specs/2026-06-01-evora-architecture-design.md` — architecture + roadmap.
- `design/radio-is-a-controller.md` — the fixed-channel-map design law (`AECR1T23`).
- `design/heli-setup-parameters.md` — VBar setup params → Rotorflight mapping + the 13-step wizard spec.
- `research/01-04` — Rotorflight / EdgeTX / ELRS / VBar research.
- `emulator/README.md` — emulator harness. `mockups/` — design mockups + wizard. `sdcard/` — per-radio SD assets.
- Memory: `[[evora-project]]`, `[[evora-rc-terminology]]`.
