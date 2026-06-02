# Rotorflight Ecosystem Research (for Evora)

_Research date: 2026-06-01. Repos shallow-cloned to `/tmp/evora-research/rotorflight`._

Evora aims to recreate the Mikado VBar Control experience (wizard-driven, beginner-friendly,
radio-only heli setup, no PC) on EdgeTX + ExpressLRS + Rotorflight, while preserving Rotorflight's
full flight-control core and tuning power behind a gated "Pro" mode. This document characterizes
what Rotorflight is today and what Evora can build on.

---

## 1. Overview

Rotorflight is a flight-control software suite for **single-rotor RC helicopters only** (explicitly
NOT multirotor or fixed-wing). It is a fork lineage: **Cleanflight → Betaflight → Rotorflight**,
also borrowing from HeliFlight3D (another Betaflight heli fork). The current generation is
**Rotorflight 2 ("RF2")**, built on the **Betaflight 4.3** codebase.

The suite has four user-facing parts plus a presets repo:

- **rotorflight-firmware** — the FC firmware (this is the protected core).
- **rotorflight-configurator** — Electron/web PC app for flashing + full config.
- **rotorflight-blackbox** — log analyzer.
- **Lua scripts** — on-radio config tooling (three repos, see Section 5).
- **rotorflight-presets** — shared preset repository (referenced by the configurator at
  `https://github.com/rotorflight/rotorflight-presets`).

### Versions (as observed in source, June 2026)
- Firmware `FC_VERSION` = **4.6.0** (`firmware/src/main/build/version.h`), shipping as
  **Rotorflight 2.3** (development snapshots, e.g. `4.6.0-20260208`). **2.2.x is the current stable**
  line; 2.3 is in RC/snapshot. (Older RF1 was based on Betaflight 4.2; RF2 on 4.3.)
- RFSuite (Ethos) = **2.3.0-RC3** (`ethos-suite/Releases.md`).
- Configurator repo `package.json` shows `0.0.0` (placeholder); releases are tagged
  `snapshot/2.3.0-*`. The configurator is mid-rewrite to **Svelte** on `master` (tabs now `.svelte`).

---

## 2. Lineage & Scope

- **Fork of Betaflight 4.3.** Inherits Betaflight's PID/filter architecture, CLI, MSP, blackbox,
  serial/port system, and configurator heritage — then heavily adds heli-specific subsystems.
- **Supported MCUs / targets:** All Betaflight-4.3-supported boards with enough I/O for servos+motors.
  Explicitly STM32 **F405, F722, F745, H743**. There are dedicated heli FCs plus a "Betaflight DIY"
  path (use a quad FC with remapped outputs). Docs: `controllers/betaflight-diy`.
- **Heli types supported:** Electric CP single-rotor is the primary target; **nitro/IC** (via
  governor throttle curve, no RPM gov), **micro** helis, and **motorized/dual-motor tail**
  (Tail Torque Assist / TTA, a.k.a. TALY) are all supported. Flybarless (FBL) only.
- **Receiver protocols:** CRSF, S.BUS, FBUS, F.Port, SRXL2, IBUS, XBUS, EXBUS, GHOST, CPPM.
- **Telemetry protocols:** CRSF, S.Port, FBUS, HoTT, etc.
- **ESC telemetry:** Hobbywing, Scorpion, Kontronik, Castle, OMP, ZTW, APD, YGE, XDFly, FLYROTOR,
  plus BLHeli/Bluejay/AM32 over bidirectional DShot.
- Heli features: 6D stabilization, rotor-speed **governor**, **rescue**, fully customizable
  **servo/motor mixer**, swashplate geometry, advanced gyro filtering (dynamic RPM notch, FFT
  dynamic notch, dynamic LPF), high-speed blackbox.

---

## 3. MSP Protocol & Over-the-Air Config (CRITICAL)

### How config is read/written
All configuration — from both the PC Configurator and the on-radio Lua scripts — uses **MSP
(MultiWii Serial Protocol)**, MSP v2. Rotorflight adds a large set of heli-specific MSP commands
on top of Betaflight's. Confirmed commands in `firmware/src/main/msp/msp.c` include (read + `SET_`
variants for each domain):

`MSP_PID_PROFILE`, `MSP_RC_TUNING` (rates), `MSP_GOVERNOR_CONFIG`, `MSP_GOVERNOR_PROFILE`,
`MSP_RESCUE_PROFILE`, `MSP_MIXER_CONFIG`/`MSP_MIXER_INPUTS`/`MSP_MIXER_RULES`/`MSP_MIXER_OVERRIDE`,
`MSP_SERVO_CONFIGURATIONS`/`MSP_SERVO_OVERRIDE`/`MSP_SET_SERVO_CENTER`, `MSP_BUS_SERVO_CONFIG`,
`MSP_MOTOR_CONFIG`/`MSP_MOTOR_OVERRIDE`/`MSP_MOTOR_TELEMETRY`, `MSP_BATTERY_PROFILE`,
`MSP_TELEMETRY_CONFIG`, `MSP_COPY_PROFILE`, `MSP_GPS_RESCUE`. RF-specific extensions are documented
in `firmware/docs/API/MSP_extensions.md`. (Rotorflight-only opcodes begin around `0x4000`, e.g.
`MSP2_GET_SMARTFUEL_CONFIG = 0x4000`.)

### MSP over CRSF / telemetry — DOES EXIST and is the production mechanism
This is how the Lua scripts talk to the FC through the radio link. There are two transports:

1. **MSP over CRSF** (ExpressLRS / TBS Crossfire). Frame types (from
   `ethos-suite/src/rfsuite/tasks/scheduler/msp/crsf.lua`):
   - `0x7A` = `CRSF_FRAMETYPE_MSP_REQ` (read request)
   - `0x7B` = `CRSF_FRAMETYPE_MSP_RESP` (reply)
   - `0x7C` = `CRSF_FRAMETYPE_MSP_WRITE` (write)
   - Addresses: FC = `0xC8` (Betaflight), TX module = `0xEA`. Each frame carries `[FROM, TO,
     ...mspPayload]`.
2. **MSP over telemetry** for FrSky S.Port / FBUS, gated in firmware by `USE_MSP_OVER_TELEMETRY`
   (`firmware/src/main/telemetry/msp_shared.c`, `crsf.c`). This is inherited/adapted Betaflight code.

The Lua side implements an **MSP queue** (`msp/mspQueue.lua`) and chunking/reassembly
(`msp/mspHelper.lua`, `common.lua`) because telemetry frames are small and the link is half-duplex
and lossy. Transport is selected dynamically per active telemetry type (`msp/msp.lua` loads CRSF,
S.Port, or GHST transport on demand).

**Maturity / honesty:** Over-the-air MSP config is **real, established, and used daily** in the
field — it is the entire basis of the Lua suites. Requirements (from the EdgeTX scripts README):
CRSF v2.11+, **ELRS 2.0.1+**, and **ELRS baud set to 1.87M or higher** in the radio Hardware menu.
**Caveats Evora must respect:** it is **slow** (small frames, queued, retried) — reading/writing a
full page takes noticeable time vs USB; it is **lossy** (needs the queue/retry layer); and there is
a separate richer telemetry path (CRSF custom telemetry, frame type **`0x88`**, decoded by the
suite's `rf2tlm`) for dashboards. There is also an open firmware issue (#81, "Better telemetry with
CRSF/ELRS") about improving passthrough — i.e. telemetry bandwidth is a known constraint. **Exact
throughput numbers were not verified** from source.

---

## 4. Domain Model

Rotorflight's config domain (mirrored across firmware, Configurator tabs, and Lua modules):

- **PID profiles** (multiple banks) + **rate profiles** (multiple banks). Profiles switchable by
  TX bank switch; `MSP_COPY_PROFILE` exists. PID controller has selectable "PID Mode" (default
  Mode 3; Mode 4 experimental per `firmware/Changes.md`).
- **Rates:** multiple rate types (BetaFlight/Actual/etc.) + **rate dynamics** (response/accel shaping).
- **Governor:** master config (`MSP_GOVERNOR_CONFIG`) + per-profile (`MSP_GOVERNOR_PROFILE`); modes
  incl. OFF/PASSTHROUGH/STANDARD/MODE1/MODE2; needs **motor RPM telemetry** (bidir DShot or ESC tlm)
  + correct **gear ratio + motor pole count**. Throttle curve, ramps, filters, TTA.
- **Rescue:** self-leveling bail-out (`MSP_RESCUE_PROFILE`) — climb/hover/flip config per profile.
- **Swashplate / collective / cyclic:** swashplate **type/geometry** selection (e.g. 120°/140°/
  90°/single-servo variants), main-rotor direction (CW/CCW), cyclic ring, collective limits.
- **Servos:** per-servo center (cyclic ~1520us, tail ~760us), endpoints, rate (Hz; cyclic digital
  ~333Hz, tail ~560Hz), reverse, **geometry correction**; bus-servo support.
- **Tail:** rudder/yaw setup; motorized tail + **TTA/TALY**.
- **Mixer:** fully customizable input→output rule mixer (`MSP_MIXER_RULES`/`INPUTS`), plus
  swash-to-mixer calibration and override (for bench setup).
- **Motors / ESC:** throttle protocol (DShot etc.), ESC telemetry, 4-way interface for
  BLHeli_S/Bluejay/AM32 programming (now exposed on-radio too), rotor-speed page.
- **Blackbox / dataflash:** high-speed logging to flash; log management.
- **CLI:** full Betaflight-style CLI (`firmware/docs/Cli.md`) — power-user escape hatch + `diff`/dump.
- **Presets:** server-backed preset system (`rotorflight-presets` repo) surfaced in the
  Configurator's Presets tab; community + official tunes/templates.

---

## 5. On-Radio Tooling Today (MOST IMPORTANT)

There are **three** Rotorflight radio-side Lua repos. Evora will almost certainly build on / extend
the modern one (RFSuite).

| Repo | Platform | Style | Maturity |
|---|---|---|---|
| `rotorflight-lua-scripts` | EdgeTX / OpenTX | text-menu (Tools menu `rf2.lua`) + color widgets | Mature, the long-standing suite |
| `rotorflight-lua-ethos` | FrSky ETHOS | text-menu port of the above (`RF2/`) | Mature, text-based |
| `rotorflight-lua-ethos-suite` ("**RFSuite**") | FrSky ETHOS | **full touchscreen GUI** + dashboards | Most advanced; **2.3.0-RC3** |

### What they already do
**All three can do near-complete config editing over the air**, not just telemetry. The Ethos text
suite (`lua-ethos/RF2/PAGES`) and especially **RFSuite** cover essentially every Configurator domain.
RFSuite modules (`ethos-suite/src/rfsuite/app/modules/`, ~33 modules):

`pids, rates, rates_advanced, filters, governor, profile_governor, profile_mainrotor,
profile_tailrotor, profile_pidcontroller, profile_pidbandwidth, profile_rescue, profile_autolevel,
profile_select, copyprofiles, servos, mixer, esc_motors, esc_tools (BLHeli/AM32/4-way),
accelerometer, alignment, failsafe, telemetry, ports, beepers, modes, adjustments, power, battery,
configuration, radio_config, blackbox, logs, stats, diagnostics, developer (msp_exp/msp_speed)`.

It also ships **dashboards/widgets** (`widgets/dashboard`, `toolbox`, activelook), CRSF/ELRS custom
telemetry (frame `0x88`), a real MSP queue + transport abstraction, **12 UI languages**
(`i18n/`: cs,de,en,es,fr,he,it,nl,no,pl,pt-br,zh-cn), and an interactive **web simulator**. This is a
serious, actively-maintained, near-feature-parity-with-the-PC tool.

### What they do NOT do
- **There is NO setup wizard / guided first-time flow in any of the suites.** Modules are a flat
  menu of expert config pages, one per domain — exactly the Configurator's tabs, on the radio.
  Confirmed: no `wizard/setup/onboard/first` module exists in RFSuite.
- No opinionated "smart defaults by heli class" onboarding; no step-gating, no validation flow that
  walks a beginner from flashed board to first spool-up.
- Behavior nuance: edits are typically only **committed to EEPROM on the Armed→Disarmed transition**
  (Ethos), which is unintuitive for newcomers.

### EdgeTX vs ETHOS — which is more complete?
The **richest, most modern UX is RFSuite, which is ETHOS-only** (FrSky X20/X18 touchscreens). The
**EdgeTX/OpenTX** suite (`rotorflight-lua-scripts`) is functionally broad but is the **text-menu**
generation; there is no EdgeTX equivalent of the RFSuite touchscreen dashboard system.
**Implication for Evora:** Evora targets **EdgeTX**, so it would build on the EdgeTX
`rotorflight-lua-scripts` MSP/transport layer (which is solid and shares the same architecture), but
the polished touchscreen UX patterns to emulate live in the ETHOS RFSuite — Evora would need to
bring that level of UX to EdgeTX itself. (Worth confirming directly with maintainers whether an
EdgeTX RFSuite-style suite is planned.)

---

## 6. Beginner First-Setup Flow Today (via Configurator)

Ordered steps a new user must complete (synthesized from docs + Configurator tabs):

1. **Flash** firmware (Firmware Flasher tab) — pick correct target/MCU.
2. **Setup tab:** accelerometer calibration, check board alignment (orientation).
3. **Ports/Receiver:** choose RX protocol, bind, set channel map + ranges, enable telemetry.
4. **Configuration tab:** select features; set **gear ratio + motor pole count** (needed for gov/RPM).
5. **Power/Battery:** voltage + current source, cell count.
6. **Motors/ESC:** throttle protocol (DShot), ESC telemetry, bidir DShot for RPM.
7. **Servos:** set **center** (cyclic ~1520us / tail ~760us), **rate** (Hz), endpoints, reverse.
8. **Mixer/Swashplate:** choose **swashplate type/geometry**, main-rotor direction, then **calibrate
   the swash** (level, collective travel) and verify servo directions.
9. **Governor** (optional but recommended): mode, headspeed, throttle curve, filtering — docs warn to
   **keep supplied defaults until after a maiden flight** (bad filtering → uncontrollable heli).
10. **Rescue / failsafe / modes / adjustments** as desired.
11. **Blackbox/dataflash** enable, then careful first spool-up.

### Where it's confusing / error-prone (Evora's opportunity)
- **Swashplate + servo geometry/direction calibration** is the classic beginner trap — wrong
  servo direction or swash type = instant crash; requires understanding of geometry.
- **Gear ratio + pole count** must be right or the governor headspeed is wrong/dangerous.
- **Servo center/rate per manufacturer** — easy to mis-set, risks stripping servos.
- **Governor filtering** — docs explicitly warn skipping/changing it can make the heli
  uncontrollable.
- Heavy **terminology load** (PID modes, mixer rules, rate types, TTA) with no progressive
  disclosure; everything is exposed at once.
- **No guided/validated flow** — the Configurator (and Lua suites) present flat expert tabs; nothing
  enforces order, sanity-checks values, or confirms "this is safe to spool up."
- **Smart defaults exist** mainly via the **Presets** system and conservative governor defaults, but
  the user must know to find/apply them; there is no auto "pick my heli class → sensible everything."

---

## 7. What Evora Can Build On

- **MSP v2 + over-the-air transport is solved.** The CRSF MSP frame types (`0x7A/0x7B/0x7C`),
  MSP-over-telemetry, the MSP **queue/chunking/retry** layer, and a clean **transport abstraction**
  all already exist in the EdgeTX `rotorflight-lua-scripts` (and ETHOS suites). Evora should reuse
  this rather than reinvent the link.
- **A complete on-radio domain library:** per-domain MSP read/write Lua modules already exist for
  PIDs, rates, governor, rescue, servos, mixer, ESC, battery, telemetry, etc. These map 1:1 to the
  firmware's RF-specific MSP commands — Evora's "Pro mode" can wrap/expose these directly,
  satisfying the "never dumb down tuning" constraint.
- **RFSuite as a UX reference** for touchscreen config, dashboards, i18n (12 langs), and a web
  simulator workflow — a proven blueprint for radio-only full config.
- **Presets infrastructure** (`rotorflight-presets`) — a ready source of smart defaults Evora's
  wizard can apply by heli class.
- **Conservative firmware defaults** (esp. governor) that are intentionally maiden-flight-safe.
- **Mature, well-factored firmware** (Betaflight pedigree, active 2.3 development) — the protected
  core is stable and unlikely to need Evora changes.

## 8. Gaps Evora Must Fill

1. **A real first-setup WIZARD.** None of the existing tools has one. This is Evora's core value:
   a guided, step-gated, validated flow (flash → orientation → RX → power → ESC → servos → swash
   geometry → governor → safety check → first spool-up).
2. **Beginner-safe swashplate/servo setup** with strong visual feedback and direction/geometry
   verification before any spool-up (the #1 crash cause today).
3. **Heli-class smart defaults**: "pick your heli (e.g. 700-class electric CP) → sane PIDs, rates,
   governor, filtering, geometry" auto-applied from presets, with conservative governor filtering.
4. **Progressive disclosure / gated Pro mode.** Hide expert terminology by default; reveal full
   Rotorflight tuning (the existing modules) only in Pro mode — preserving full power.
5. **An EdgeTX-first polished UX.** The best modern UX (RFSuite) is ETHOS-only; Evora must deliver
   comparable polish on **EdgeTX** (the target stack), building on the EdgeTX MSP layer.
6. **Validation + safety guardrails:** sanity-check pole count/gear ratio, servo rate vs servo type,
   refuse unsafe states, explicit "safe to spool up" gate.
7. **Onboarding for the link itself** (ELRS baud 1.87M+, telemetry enabled) — currently buried in
   READMEs as a prerequisite users miss.

---

## 9. Open Questions / Uncertainty (flagged honestly)

- **Exact over-the-air MSP throughput / per-page latency** not measured from source — only the
  mechanism (queue + small frames + retries) and prerequisites (ELRS 1.87M+) are confirmed.
- Whether an **EdgeTX touchscreen "RFSuite"** equivalent is planned by the project (RFSuite is ETHOS
  only as of 2.3.0-RC3) — should be confirmed with maintainers/Discord.
- The **Configurator Svelte rewrite** is mid-flight on `master` (placeholder version `0.0.0`);
  current stable config UX may differ from what's in the repo.
- Stable-vs-snapshot: firmware source is `4.6.0` / RF 2.3 development; **RF 2.2.x is the current
  stable** end-users run. Evora should target the stable MSP API and track 2.3.
- Precise list of swashplate geometry types and PID Mode semantics not exhaustively enumerated here;
  verify against `firmware/docs/Mixer.md`, `PID tuning.md`, `Governor.md` when implementing.

---

## Sources

### Repos (shallow-cloned to `/tmp/evora-research/rotorflight`)
- Firmware: https://github.com/rotorflight/rotorflight-firmware
  - `src/main/build/version.h` (FC 4.6.0), `Changes.md`, `Releases.md`
  - `src/main/msp/msp.c`, `msp_protocol_v2_rotorflight.h`, `docs/API/MSP_extensions.md`
  - `src/main/telemetry/msp_shared.c` (`USE_MSP_OVER_TELEMETRY`), `telemetry/crsf.c`, `rx/crsf.c`
  - `docs/`: `Governor.md`, `Mixer.md`, `PID tuning.md`, `Cli.md`, `Telemetry.md`, `Profiles.md`
- Configurator (Svelte rewrite): https://github.com/rotorflight/rotorflight-configurator
  - `src/tabs/{governor,motors,gyro,receiver,servos,mixer,profiles,presets}/*.svelte`
  - `src/js/presets/sources.js` → `https://github.com/rotorflight/rotorflight-presets`
- EdgeTX/OpenTX Lua: https://github.com/rotorflight/rotorflight-lua-scripts (`README.md`, `src/SCRIPTS`)
- ETHOS text Lua: https://github.com/rotorflight/rotorflight-lua-ethos (`RF2/PAGES`, `RF2/MSP`)
- ETHOS RFSuite: https://github.com/rotorflight/rotorflight-lua-ethos-suite (**2.3.0-RC3**)
  - `src/rfsuite/app/modules/` (~33 modules), `tasks/scheduler/msp/crsf.lua` (frame types
    0x7A/0x7B/0x7C, addr 0xC8/0xEA), `msp/mspQueue.lua`, `msp/mspHelper.lua`, `i18n/` (12 langs)
- Presets: https://github.com/rotorflight/rotorflight-presets

### Web
- https://rotorflight.org/ (docs) — incl. `docs/setup/lua-scripts`,
  `docs/setup/elrs-custom-telemetry`, `docs/2.0.0/Wiki/Tutorial-Setup/Getting-Started`,
  `docs/2.1.0/setup/setup-mixer`, `docs/configurator/tabs/servos`, `docs/Tuning/tuning-examples`
- https://github.com/rotorflight (org)
- Firmware issue #81 "Better telemetry with CRSF / ELRS"
  (https://github.com/rotorflight/rotorflight-firmware/issues/81)
- DeepWiki overviews: https://deepwiki.com/rotorflight/rotorflight-lua-scripts
- ExpressLRS Lua how-to: https://www.expresslrs.org/quick-start/transmitters/lua-howto/
