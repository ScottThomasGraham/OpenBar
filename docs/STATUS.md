# Evora — current status & how to resume

_Last updated: 2026-06-01_

Evora is an open-source, **firmware-level** recreation of the Mikado VBar Control Touch
*experience* for RC helis: bind + a guided on-radio wizard + fly, no PC. See [`../README.md`](../README.md)
for the vision and [`superpowers/specs/2026-06-01-evora-architecture-design.md`](superpowers/specs/2026-06-01-evora-architecture-design.md)
for the full architecture.

## North Star (confirmed by owner)
Evora is its **own bespoke OS with a gorgeous interface**. We keep EdgeTX's *engine* (gimbal/ADC
drivers, RF/CRSF, mixer, failsafe, storage, bootloader — the dangerous, proven plumbing) and **rip
out EdgeTX's entire GUI**, replacing it with Evora's own (boot, home, navigation, wizard). Not a
widget/skin inside EdgeTX. Visual language: VBar Control Touch elevated to **iPhone-grade** polish —
dark, calm, label/value rows, hairlines, big hero numbers, restrained color (amber accent, green =
healthy). Flight performance stays Rotorflight's (untouched FC).

## Architecture
- **Evora TX** = fork of **EdgeTX** (`ScottThomasGraham/Evora-TX`, baseline `v2.12.1`, branch `evora`). TX16S now (STM32F407); TX16S MK3 (H7/800×480) later.
- **Evora Link** = fork of **ExpressLRS** (`ScottThomasGraham/Evora-Link`, baseline `4.0.1`, branch `evora`) — both TX module + RX; later a private high-bandwidth config channel.
- **Rotorflight** = untouched FC, configured over the link via MSP.

## What's built (in firmware, emulator-verified)
- **"Aerospace instrument" visual pass DONE (2026-06-02)** — custom LVGL fonts (Rajdhani numerals + Barlow labels, `radio/src/fonts/evora/`, declared in `mainview/evora_fonts.h`), circular `lv_arc` headspeed gauge, gradient cards, amber/green accents. ARM firmware fits flash; CI green. Captures: `docs/emulator/fw-*.png`. Reproduce: see memory `[[evora-project]]` "Firmware visual pass".
- Identity: Evora boot splash (full-screen SD `/IMAGES/splash.png`, asset at `docs/sdcard/IMAGES/splash.png`) + embedded dog+EVORA `splash_logo.png` fallback.
- **Two-state home** — idle radio-info ↔ flight dashboard (big battery), switches on `TELEMETRY_STREAMING()`.
- **Navigation** — home toolbar → Models / Link / System / Tools screens (touch + back).
- **12-step New Heli Setup wizard** — verify-gated, MOTOR-safe, Basic/Pro, launchable from home CTA / Models "+New model". **Interactive**: tap choices (heli class, swash type, directions) → selects, remembered per step; Next/Back via touch + keys.
- **Models screen interactive** — tap a model to make it active; "+ New model" launches the wizard.
- All telemetry/setup **values are DEMO placeholders** (no live data — needs the heli). The *interactions* (selection, navigation) are real.

### UI source files (in `forks/evora-tx/radio/src/gui/colorlcd/`)
- `mainview/evora_home.{h,cpp}` — the two-state home (build/buildIdle/buildFlight, checkEvents switch).
- `mainview/evora_screen.{h,cpp}` — Models/Settings/Link/Tools destination screens (overlay + touch back).
- `mainview/evora_wizard.{h,cpp}` — the 12-step wizard (data-driven STEPS[], touch + key nav).
- `mainview/layout.cpp` — `loadCustomScreens`/`loadDefaultLayout` make EvoraHome the main view; clears EdgeTX topbar. Has `OB_WIZARD_PREVIEW_STEP` toggle for emulator capture.
- Branding PNGs: `radio/src/bitmaps/480x272/` (`splash_logo.png`, `default_theme/mask_edgetx.png`, `mask_top_logo.png`).

## How to build
- **Flashable firmware (ARM):** push to the `evora` branch → GitHub Actions builds it; download the
  `evora-tx16s` artifact (`gh run download <id> -R ScottThomasGraham/Evora-TX -n evora-tx16s`).
  Latest flashable build staged at `forks/.local/Evora-TX16S.bin`.
  - ⚠️ Do NOT build the EdgeTX firmware locally via the `edgetx-dev` Docker image on this Apple-Silicon
    Mac — it's amd64-only and `arm-none-eabi-g++` **segfaults under qemu**. Use CI for firmware.
- **Emulator (for UI dev):** EdgeTX `simu` is built **arm64-native** in the container `evora-simu`
  (no qemu, no segfault). See [`emulator/README.md`](emulator/README.md). Docker runtime = colima
  profile `colima-evora` (vz). Build: `docker exec evora-simu bash -lc 'cd /src/build-simu && make -j simu'`
  (run `cmake ..` first if files were added — globs use CONFIGURE_DEPENDS for mainview/).

## Emulator capture workflow (reliable)
- Settings seed at `/root/sim/settings_seed` (calibrated + throttle/switch warnings off). Restore it,
  **never re-wipe** (recalibration needs painful mouse-dragging of on-screen gimbals).
- Boot under Xvfb; capture full root with `import`; crop `766x400+398+221`.
- **Touch via mouse:** the simu maps mouse→LCD touch. LCD rect in the capture ≈ origin (~401, ~359).
  Top-row taps (toolbar) are reliable (MODELS@full(445,378), LINK@(510,378)); right-side/bottom taps
  drift — for render verification prefer the `OB_WIZARD_PREVIEW_STEP` toggle. Trust touch code on real HW.
- Helper scripts in `/tmp/obsd/` (build_home.sh, build_wiz.sh, nav_capture.sh, etc.).

## Next steps
1. **(needs heli)** Live Rotorflight/ELRS telemetry into home + wizard; wizard's real MSP setup actions.
2. Custom giant hero font; interactive wizard controls; more polish.
3. **Phase 0 hardware (owner):** flash `Evora-TX16S.bin` (bootloader-recoverable); pick a binding
   phrase; build+flash the link (ELRS TX `Unified_ESP32_2400_TX_via_ETX` + FlyDragon RX
   `Unified_ESP8285_2400_RX_via_BetaflightPassthrough`, custom hardware layout TBD — see Phase 0 plan).
4. TX16S MK3 port.

## Hardware (owner's bench)
- Radio: RadioMaster **TX16S** + internal **ELRS** module (`RadioMaster TX16S 2400 TX`).
- FC: **FlyDragon F722 V2** (Rotorflight target `FLYDRAGONF722_V2_2`, STM32F722) with **built-in ELRS RX**
  (ESP8285+SX1280, on FC UART1, flash via Rotorflight passthrough; no mainline ELRS target — author one).
- Rotorflight: latest stable **2.2.1** (owner flashes).

## Key docs
- `superpowers/specs/2026-06-01-evora-architecture-design.md` — architecture + roadmap.
- `superpowers/plans/2026-06-01-evora-phase-0-foundations.md` — Phase 0 plan.
- `research/01-04` — Rotorflight / EdgeTX / ELRS / VBar research.
- `emulator/README.md` — emulator harness. `mockups/` — design mockups. `hardware/` — confirmed config (TBD).
