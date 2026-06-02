# Evora — Architecture & Roadmap Design

**Date:** 2026-06-01
**Status:** Approved (architecture); Phase 0 pending
**Owner:** Scott Graham (domain expert / test pilot; directs, Claude builds)

---

## 1. Vision

An open-source, **firmware-level** recreation of the Mikado VBar Control *experience*: a beginner binds a helicopter, runs one guided wizard on the radio's touchscreen, and flies — no PC, no Configurator, no cables. All the plumbing (channels, telemetry, mixers, failsafe, link config) is pre-configured and hidden, with a gated **Pro** area for full control.

Evora copies what makes VBar feel like magic — a single integrated ecosystem with a friendly, verify-every-step setup wizard — and rides **Rotorflight** (whose flight performance already beats VBar) for the flight core.

### Why this is feasible

VBar feels effortless because one vendor owns the whole signal chain (radio + link + FBL). Evora reproduces that integration with open firmware by owning the **radio firmware** and **both ends of the link**, and riding Rotorflight for the FC. Over-the-air configuration of the FC is already the *production* mechanism in this ecosystem (MSP-v2 tunneled over CRSF) — Evora makes it fast, reliable, and beginner-proof.

## 2. Guiding principles

1. **Rotorflight's flight core is sacred and untouched.** Evora is a configuration/onboarding layer. Full tuning stays reachable in Pro. Simplicity lives in setup UX and smart defaults — never in flight behavior.
2. **Bespoke firmware per radio, not universal software.** Evora flashes as *Evora*. Reference target: **RadioMaster TX16S** (STM32F407, 480×272). Next: **TX16S MK3** (H7, 800×480) as its own tailored build. Design UI resolution-independently to ease the later port.
3. **Keep what's proven, replace what differentiates.** Retain EdgeTX's hardened, safety-critical plumbing (gimbals/ADC, mixer engine, failsafe, SD, USB, bootloader). Replace everything the user sees/feels.
4. **Verify on the bench, not in the air.** Directions, centering, travels, limits confirmed with motor disabled / blades off before first spin.
5. **Beginner by default, expert on demand.** Progressive disclosure like VBar, but free — no paywalled tiers.

## 3. System architecture

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

### 3.1 Components

| Component | Basis | Responsibilities | What we keep / don't touch |
|---|---|---|---|
| **Evora TX** | fork of EdgeTX (STM32F407) | Bespoke boot/home/dashboards; setup wizards; automatic model provisioning; native Rotorflight config UI; Basic⇄Pro disclosure; orchestration of binding + link config. | Keep EdgeTX gimbal/ADC sampling & calibration, mixer/curve/logical-switch engine, arming/failsafe, SD/model storage, USB, audio/haptics, **bootloader** (recovery). |
| **Evora Link-TX** | fork of ExpressLRS (internal module ESP/SX1280) | Speaks stock CRSF to the radio; runs the Evora private channel; binding, packet rate, power, model match — all driven from Evora's UI. | Keep ELRS RF PHY, OTA timing, failsafe semantics. |
| **Evora Link-RX** | fork of ExpressLRS RX | Matched receiver enabling the private channel end-to-end; tunnels MSP to the FC; improved reassembly/retransmit on the config path. | Keep ELRS RF PHY and failsafe. |
| **Rotorflight FC** | unchanged | Flight control + the model's source of truth; configured via MSP over the link. | Entire firmware untouched. |

### 3.2 Hardware reality (kept honest)

ELRS runs on the **RF module's own ESP/SX1280**, not the TX16S STM32 — the transceiver is physically in the module. "ELRS baked in" therefore means **an internal ELRS module running matched Evora firmware, fully driven by Evora's UI**, not ELRS executing on the main CPU. This is the deepest integration the hardware physically allows.

### 3.3 The private Evora channel (the differentiator)

Because Evora owns **both** ends of the link, Link-TX and Link-RX keep speaking **stock CRSF** for RC + failsafe (fully compatible and safe), but during setup/tuning negotiate a **bespoke high-bandwidth config & telemetry channel**. This targets the two limits found in research:

- the **~8-byte uplink chunk** ceiling (the "OpenTX outbound telemetry buffer" limit), and
- the **no-retransmit fragility** of MSP-over-CRSF (a single dropped fragment discards the whole MSP frame).

Goal: OTA Rotorflight configuration that is dramatically faster and more reliable than stock — turning whole-heli setup from a multi-minute crawl into something that feels instant. **Phase 1 proves this before any UX is built on it; if infeasible within the airtime budget, fall back to an optimized stock-CRSF path.**

### 3.4 Mental model

Borrowed wholesale from VBar: *FC = source of truth, radio = renderer/editor/orchestrator.* Bind → radio detects the FC → reads its parameters → renders native menus & wizards → writes back over the fast channel. This eliminates the "which copy is current / did I save?" confusion entirely.

## 4. Product / UX model

### 4.1 Out-of-box bind-and-go

First power-on boots into Evora's own home. "Set up a new heli" launches a single guided flow: binding-phrase **auto-bind** (no manual-bind footgun), Evora detects the FC, **auto-provisions the radio model** (a C++ hook Lua cannot do), and starts the wizard.

### 4.2 New Heli Setup Wizard — linear, one decision per screen, verify-gate at every step

Order (adapted from the reconstructed VBar flow + Rotorflight's crash-causing pain points):

1. **Safety gate** — motor disabled / blades off confirmation.
2. **Pick heli class/size** — drives smart defaults (swash type, rates, expo, governor headspeed range). "Pick my heli → sane everything."
3. **Link / bind** — bind the RX, confirm link health.
4. **FC orientation / board mounting** — with diagram.
5. **Main rotor direction** (CW / CCW).
6. **Swashplate type + geometry** — standard types in Basic; exotic geometries gated to Pro.
7. **Stick directions / center / endpoints** — TX-side check.
8. **Collective direction** — move stick, it learns.
9. **Servo assignment + directions** — radio shows which port → which swash function; verify each visually.
10. **Swash leveling / centering at zero pitch** — servo nudge + pitch-gauge guidance.
11. **Collective travel + cyclic throw limits.**
12. **Tail** — pick servo, direction, endpoints.
13. **Governor / ESC** — external vs RF governor; headspeed per bank; **gear ratio + motor pole count** (validated hard — these are documented crash-causers).
14. **Finish** — write to FC over the fast channel; summary + a pre-flight checklist.

Each step **gates** progress on a successful verify. The wizard doubles as the per-step editor so beginners and experts share one mental model.

### 4.3 Basic ⇄ Pro progressive disclosure

Same screens serve both audiences; expert controls revealed by long-press / a Pro toggle (no separate app, no paywall). Pro unlocks the **full** Rotorflight surface — PID/rate profiles, filters, feed-forward, blackbox — preserving Rotorflight's complete power.

### 4.4 Live home dashboard

Glanceable, bespoke: headspeed, voltage/current, link (RSSI/LQ), flight timer, active bank/profile, rescue-armed state. Built on standard ELRS telemetry plus the private channel.

### 4.5 Beat-VBar features (later)

On-radio, **blackbox-informed tuning**; exposing independent pitch/roll and feed-forward/D terms that VBar deliberately withholds; all tuning on-radio with no PC.

## 5. Phased roadmap

Each phase is its own spec → plan → build cycle. Riskiest/highest-value bets are proven early.

- **Phase 0 — Foundations & toolchains.** Fork the three repos; establish reproducible **build + flash + recovery** for the TX16S radio and both ELRS ends; verify vanilla builds flash and recover from a bad flash; define the upstream-rebase / minimal-diff maintenance strategy; CI. *Deliverable: we can build, flash, and recover all three unmodified.*
- **Phase 1 — Private fast-config channel.** Implement the bespoke channel in the ELRS TX+RX forks alongside stock CRSF; a minimal radio-side MSP client (a throwaway bench harness is fine for measurement) reads/writes Rotorflight params over it. *Deliverable: measurably faster/more reliable OTA config than stock, on the bench — or a documented decision to fall back to optimized stock CRSF.*
- **Phase 2 — Evora TX shell.** Bespoke boot/home + app skeleton; automatic model provisioning; binding-phrase auto-bind orchestration; detect a connected Rotorflight FC and read its identity/params. *Deliverable: power on → Evora home → bind → "Rotorflight detected," model auto-created.*
- **Phase 3 — New Heli Setup Wizard.** The full linear, verify-gated wizard (Basic) with per-heli-class defaults, writing to the FC over the fast channel. *Deliverable: a beginner sets up a heli to flyable on the bench, entirely on the radio, no PC.*
- **Phase 4 — Dashboards + Basic/Pro + banks.** Bespoke telemetry home; Pro toggle exposing full Rotorflight tuning; profile/bank switching. *Deliverable: daily-driver usable.*
- **Phase 5 — On-radio tuning + MK3 port.** Blackbox-informed tuning tools; then the tailored TX16S MK3 (H7/800×480) build. *Deliverable: a "beat-VBar" tuning experience and a second supported radio.*

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Maintaining **three forks** against fast-moving upstreams | Minimal-diff, layered architecture; periodic rebase; CI that builds against pinned baselines. |
| Private channel may not fit the ELRS **airtime/timing budget** | Phase 1 proves it in isolation before UX depends on it; documented fallback to optimized stock CRSF. |
| C++ UI velocity slower than scripting | Reuse EdgeTX's LVGL toolkit already present; build an Evora component library early. |
| **Bricking** a radio/module on bad flash | Keep the bootloader; document/verify recovery in Phase 0; bench-only flashing with the maintainer's hardware. |
| RF firmware changes touch **regulatory** limits (power/region) | Preserve ELRS region/power compliance; never expose non-compliant settings by default. |
| Flight-safety regressions | Don't touch Rotorflight; keep EdgeTX failsafe/arming; every phase has bench acceptance criteria before flight. |

## 7. Testing strategy

Hardware-in-the-loop from day one (maintainer has TX16S + ELRS + a Rotorflight heli). Bench-first with motor disconnected / blades off. Incremental flash + verify; each phase has explicit bench acceptance criteria that must pass before any flight test.

## 8. Open questions (to confirm before/within Phase 0)

1. **ELRS hardware specifics:** internal vs external module on the TX16S; exact RX model; band (assumed 2.4 GHz). Determines Link-TX/Link-RX build targets.
2. **Rotorflight version** on the test heli (research: 2.2.x stable vs 2.3 RC). Pins the MSP surface we target first.
3. **First-target heli** class/size/servos (for the Phase 3 default profiles and bench setup).
4. **Hosting:** forks under the personal GitHub account (`ScottThomasGraham`)? Org later?

## 9. References

- `docs/research/01-rotorflight.md`
- `docs/research/02-edgetx.md`
- `docs/research/03-expresslrs.md`
- `docs/research/04-vbar-control.md`
