# OpenBar

**An open-source, firmware-level recreation of the Mikado VBar Control *experience* — built on the best open RC heli stack, and tuned for beginners.**

Bind your heli, run one guided wizard on the radio's touchscreen, and fly. No PC, no cables, no Configurator, no rabbit holes. All the plumbing — channels, telemetry, mixers, failsafe, link setup — is pre-configured and hidden, with a gated **Pro** area for people who want full control.

> OpenBar is to VBar Control what Rotorflight is to VBar's flybarless units: open, free, and aimed at flying *better*. We copy what makes VBar feel like magic — a single integrated ecosystem with a friendly, verify-every-step setup wizard — and we ride **Rotorflight**, whose flight performance already beats VBar, for the flight core.

---

## The idea

Mikado's VBar Control feels effortless because **one team owns the whole signal chain**: the radio, the radio link, and the flybarless (FBL) unit all speak the same language, so the radio can read the heli's parameters and render native setup menus. The cost is a closed, expensive, vendor-locked ecosystem.

OpenBar reproduces that *integrated* feel with open firmware:

- We **own the radio firmware** (a fork of EdgeTX).
- We **own both ends of the radio link** (forks of ExpressLRS — TX module *and* receiver).
- We **ride Rotorflight** for the flight controller — its flight core is untouched and its full tuning power stays reachable.

Because we own both ends of the link, the radio and receiver can speak standard CRSF for normal control **and** negotiate a private high-bandwidth channel for configuration and telemetry — making "set up your whole heli from the radio" feel instant instead of crawling.

## Guiding principles

1. **Rotorflight's flight performance is sacred.** OpenBar is a *configuration and onboarding layer* around Rotorflight. We never fork, dumb down, or alter the flight-control core. Every bit of tuning power remains reachable in the gated **Pro** area. Simplicity lives in *setup UX and smart defaults*, never in flight behavior.
2. **Bespoke firmware per radio — not universal software.** OpenBar is real firmware, tailored to specific hardware, that flashes as *OpenBar* (not EdgeTX). The reference target is the **RadioMaster TX16S**; the **TX16S MK3** (H7 / 800×480) gets its own tailored build next.
3. **Keep what's proven, replace what differentiates.** We keep EdgeTX's hardened, safety-critical low-level plumbing (gimbals/ADC, mixer engine, failsafe, bootloader) and aggressively replace everything a user sees and feels.
4. **Verify every step on the bench, not in the air.** Directions, centering, travels, and limits are all confirmed before the blades ever spin.
5. **Beginner by default, expert on demand.** Progressive disclosure (à la VBar), but free — no paywalled feature tiers.

## Architecture

```
 ┌──────────────────────────── TX16S ────────────────────────────┐
 │ OpenBar RADIO firmware   (fork of EdgeTX · STM32F407)          │
 │   • bespoke boot / home / live dashboards                      │
 │   • guided setup WIZARDS + automatic model provisioning        │
 │   • native Rotorflight config UI · Basic⇄Pro disclosure        │
 │   • KEEPS EdgeTX plumbing: gimbals/ADC, mixer, failsafe, SD,   │
 │     USB, bootloader  (proven, flight-safety-critical)          │
 │                          │ internal UART: CRSF + OpenBar ext.  │
 │ OpenBar LINK-TX firmware (fork of ELRS · internal module ESP)  │
 └──────────────────────────│ 2.4 GHz ──────────────────────────┘
                            │   stock CRSF  (RC + failsafe, fully compatible)
                            │ + PRIVATE OpenBar fast config/telemetry channel
 ┌──────────────────────────▼──────────────────────────┐
 │ OpenBar LINK-RX firmware (fork of ELRS RX)           │
 └──────────────────────────│ UART (MSP) ──────────────┘
 ┌──────────────────────────▼──────────────────────────┐
 │ Rotorflight FC  —  UNTOUCHED flight core             │
 │   the model's source of truth; configured via MSP    │
 └──────────────────────────────────────────────────────┘
```

**Three firmwares we own + one we don't touch:**

| Component | Basis | Role |
|---|---|---|
| **OpenBar Radio** | fork of EdgeTX | All bespoke UX + the orchestration brain. Keeps EdgeTX's proven hardware/RF/failsafe plumbing. |
| **OpenBar Link-TX** | fork of ExpressLRS (internal module) | The link, driven entirely from inside OpenBar's UI — no separate ELRS script or web config. |
| **OpenBar Link-RX** | fork of ExpressLRS RX | Matched receiver so the link is the OpenBar variant end-to-end (enables the private channel). |
| **Rotorflight** | unchanged | Flight core and source of truth for the model; configured over the link via MSP. |

**Mental model (borrowed wholesale from VBar):** *the FC is the source of truth; the radio is the renderer / editor / orchestrator.* Bind → radio detects the FC → reads its parameters → renders native menus and wizards → writes back over the fast channel.

## Roadmap (high level)

Each phase is its own spec → plan → build cycle. We deliberately prove the riskiest, highest-value piece early.

- **Phase 0 — Foundations:** fork the three repos; reproducible build + flash + **recovery** for the TX16S and both ELRS ends; upstream-rebase strategy; CI.
- **Phase 1 — Private fast-config channel:** prove the bespoke high-bandwidth link end-to-end and measure it against stock CRSF. *(De-risks the core technical bet before building UX on top.)*
- **Phase 2 — OpenBar Radio shell:** bespoke boot/home, automatic model provisioning, binding-phrase auto-bind, FC detection.
- **Phase 3 — New Heli Setup Wizard:** the linear, verify-gated beginner setup, with smart per-heli-class defaults, writing to the FC over the fast channel.
- **Phase 4 — Dashboards + Basic/Pro + banks:** bespoke live telemetry home, the Pro toggle that exposes full Rotorflight tuning, profile switching.
- **Phase 5 — On-radio tuning + MK3 port:** blackbox-informed tuning tools (a "beat VBar" feature), then the tailored TX16S MK3 build.

See [`docs/superpowers/specs/2026-06-01-openbar-architecture-design.md`](docs/superpowers/specs/2026-06-01-openbar-architecture-design.md) for the full architecture, UX model, phased plan, risks, and open questions.

## Built on the shoulders of

OpenBar exists only because of the open-source work of the **[Rotorflight](https://github.com/rotorflight)**, **[EdgeTX](https://github.com/edgetx)**, and **[ExpressLRS](https://github.com/ExpressLRS)** communities. This project adapts and integrates their work; full credit and licensing obligations to those projects are respected.

## Status

Early design. Research complete (see [`docs/research/`](docs/research/)); architecture approved; Phase 0 next.
