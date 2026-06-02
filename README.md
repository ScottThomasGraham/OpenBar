# Evora

**An open-source, firmware-level recreation of the Mikado VBar Control *experience* — built on the best open RC heli stack, and tuned for beginners.**

Bind your heli, run one guided wizard on the radio's touchscreen, and fly. No PC, no cables, no Configurator, no rabbit holes. All the plumbing — channels, telemetry, mixers, failsafe, link setup — is pre-configured and hidden, with a gated **Pro** area for people who want full control.

> Evora is to VBar Control what Rotorflight is to VBar's flybarless units: open, free, and aimed at flying *better*. We copy what makes VBar feel like magic — a single integrated ecosystem with a friendly, verify-every-step setup wizard — and we ride **Rotorflight**, whose flight performance already beats VBar, for the flight core.

---

## The idea

Mikado's VBar Control feels effortless because **one team owns the whole signal chain**: the radio, the radio link, and the flybarless (FBL) unit all speak the same language, so the radio can read the heli's parameters and render native setup menus. The cost is a closed, expensive, vendor-locked ecosystem.

Evora reproduces that *integrated* feel with open firmware:

- We **own the radio firmware** (a fork of EdgeTX).
- We **own both ends of the radio link** (forks of ExpressLRS — TX module *and* receiver).
- We **ride Rotorflight** for the flight controller — its flight core is untouched and its full tuning power stays reachable.

Because we own both ends of the link, the radio and receiver can speak standard CRSF for normal control **and** negotiate a private high-bandwidth channel for configuration and telemetry — making "set up your whole heli from the radio" feel instant instead of crawling.

## Guiding principles

1. **Rotorflight's flight performance is sacred.** Evora is a *configuration and onboarding layer* around Rotorflight. We never fork, dumb down, or alter the flight-control core. Every bit of tuning power remains reachable in the gated **Pro** area. Simplicity lives in *setup UX and smart defaults*, never in flight behavior.
2. **Bespoke firmware per radio — not universal software.** Evora is real firmware, tailored to specific hardware, that flashes as *Evora* (not EdgeTX). The reference target is the **RadioMaster TX16S**; the **TX16S MK3** (H7 / 800×480) gets its own tailored build next.
3. **Keep what's proven, replace what differentiates.** We keep EdgeTX's hardened, safety-critical low-level plumbing (gimbals/ADC, mixer engine, failsafe, bootloader) and aggressively replace everything a user sees and feels.
4. **Verify every step on the bench, not in the air.** Directions, centering, travels, and limits are all confirmed before the blades ever spin.
5. **Beginner by default, expert on demand.** Progressive disclosure (à la VBar), but free — no paywalled feature tiers.

## Architecture

```
 ┌──────────────────────────── TX16S ────────────────────────────┐
 │ Evora RADIO firmware   (fork of EdgeTX · STM32F407)          │
 │   • bespoke boot / home / live dashboards                      │
 │   • guided setup WIZARDS + automatic model provisioning        │
 │   • native Rotorflight config UI · Basic⇄Pro disclosure        │
 │   • KEEPS EdgeTX plumbing: gimbals/ADC, mixer, failsafe, SD,   │
 │     USB, bootloader  (proven, flight-safety-critical)          │
 │                          │ internal UART: CRSF + Evora ext.  │
 │ Evora LINK-TX firmware (fork of ELRS · internal module ESP)  │
 └──────────────────────────│ 2.4 GHz ──────────────────────────┘
                            │   stock CRSF  (RC + failsafe, fully compatible)
                            │ + PRIVATE Evora fast config/telemetry channel
 ┌──────────────────────────▼──────────────────────────┐
 │ Evora LINK-RX firmware (fork of ELRS RX)           │
 └──────────────────────────│ UART (MSP) ──────────────┘
 ┌──────────────────────────▼──────────────────────────┐
 │ Rotorflight FC  —  UNTOUCHED flight core             │
 │   the model's source of truth; configured via MSP    │
 └──────────────────────────────────────────────────────┘
```

**Three firmwares we own + one we don't touch:**

| Component | Basis | Role |
|---|---|---|
| **Evora TX** | fork of EdgeTX | All bespoke UX + the orchestration brain. Keeps EdgeTX's proven hardware/RF/failsafe plumbing. |
| **Evora Link-TX** | fork of ExpressLRS (internal module) | The link, driven entirely from inside Evora's UI — no separate ELRS script or web config. |
| **Evora Link-RX** | fork of ExpressLRS RX | Matched receiver so the link is the Evora variant end-to-end (enables the private channel). |
| **Rotorflight** | unchanged | Flight core and source of truth for the model; configured over the link via MSP. |

**Mental model (borrowed wholesale from VBar):** *the FC is the source of truth; the radio is the renderer / editor / orchestrator.* Bind → radio detects the FC → reads its parameters → renders native menus and wizards → writes back over the fast channel.

## Roadmap (high level)

Each phase is its own spec → plan → build cycle. We deliberately prove the riskiest, highest-value piece early.

- **Phase 0 — Foundations:** fork the three repos; reproducible build + flash + **recovery** for the TX16S and both ELRS ends; upstream-rebase strategy; CI.
- **Phase 1 — Private fast-config channel:** prove the bespoke high-bandwidth link end-to-end and measure it against stock CRSF. *(De-risks the core technical bet before building UX on top.)*
- **Phase 2 — Evora TX shell:** bespoke boot/home, automatic model provisioning, binding-phrase auto-bind, FC detection.
- **Phase 3 — New Heli Setup Wizard:** the linear, verify-gated beginner setup, with smart per-heli-class defaults, writing to the FC over the fast channel.
- **Phase 4 — Dashboards + Basic/Pro + banks:** bespoke live telemetry home, the Pro toggle that exposes full Rotorflight tuning, profile switching.
- **Phase 5 — On-radio tuning + MK3 port:** blackbox-informed tuning tools (a "beat VBar" feature), then the tailored TX16S MK3 build.

See [`docs/superpowers/specs/2026-06-01-evora-architecture-design.md`](docs/superpowers/specs/2026-06-01-evora-architecture-design.md) for the full architecture, UX model, phased plan, risks, and open questions.

## Built on the shoulders of

Evora exists only because of the open-source work of the **[Rotorflight](https://github.com/rotorflight)**, **[EdgeTX](https://github.com/edgetx)**, and **[ExpressLRS](https://github.com/ExpressLRS)** communities. This project adapts and integrates their work; full credit and licensing obligations to those projects are respected.

## Status (2026-06-01)

**The bespoke Evora UI shell is built and running in firmware** (verified in the EdgeTX
simulator). Evora replaces EdgeTX's entire GUI with its own, on EdgeTX's untouched engine.

**Done:**
- **Foundations (Phase 0):** forks (`Evora-TX` = EdgeTX `v2.12.1`, `Evora-Link` = ELRS `4.0.1`),
  reproducible builds, GitHub Actions CI (green), headless EdgeTX **emulator workbench**
  (`docs/emulator/`). Flashable Evora firmware artifact builds in CI.
- **Identity:** Evora boot splash + logo (replaces EdgeTX branding).
- **Bespoke two-state home:** calm **idle** radio-info screen (toolbar · watermark · "Set up a new
  heli" CTA) that switches to a **flight** dashboard (big battery hero · headspeed · timer · cards)
  when telemetry starts.
- **Navigation:** home toolbar opens bespoke **Models / Link / System / Tools** screens (touch, with
  back). EdgeTX topbar/menu fully removed.
- **12-step New Heli Setup wizard:** verify-gated, MOTOR-safe, Basic/Pro, launchable from the home.

All UI uses a **Mikado VBar Control Touch-inspired, iPhone-grade** visual language (dark, calm,
label/value, hairlines, amber accent / green = healthy). Mockups: [`docs/mockups/`](docs/mockups/);
real firmware captures: [`docs/emulator/`](docs/emulator/).

**Next (needs the heli on the bench):** live Rotorflight/ELRS **telemetry** into the home/wizard, and
the wizard's real **MSP setup actions**. Plus: custom giant hero font, interactive wizard controls,
TX16S MK3 port, and the Phase 0 hardware flashes (owner flashes firmware + picks a binding phrase).

### Resume here (fresh session)
Read this README, then [`docs/STATUS.md`](docs/STATUS.md) (current state + how to build/emulate/resume),
then [`docs/emulator/README.md`](docs/emulator/README.md) (the capture workflow). Forks are cloned
under `~/Projects/Evora/forks/` (gitignored); UI code lives in
`forks/evora-tx/radio/src/gui/colorlcd/mainview/evora_*.{h,cpp}`.
