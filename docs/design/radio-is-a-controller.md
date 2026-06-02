# Core principle: the radio is a universal controller

_Design law for OpenBar. 2026-06-01. Do not drift from this._

## The Xbox-controller model
The OpenBar radio is a **universal controller**, like an Xbox controller. You never change stick
directions, channel maps, reverses, trims, mixes, or endpoints on an Xbox controller — the **game**
decides what the inputs do. For OpenBar, the "game" is the **flybarless unit running Rotorflight**.

Consequences:
- **The radio's channel output is FIXED and IDENTICAL for every OpenBar user.** One standard channel
  map, baked into the firmware. No per-model radio config. No trims, no reverses, no subtrim, no
  channel reordering, no mixes exposed or edited on the radio.
- **All "layering" lives in the FBL (Rotorflight):** what each channel does, servo reverses, endpoints,
  swashplate mixing, tail, governor, banks, rescue. Configured **over the link via MSP** — never on the
  radio.
- **The radio has essentially no "radio settings."** The only radio-side calibration is **stick/gimbal
  calibration** (physical endpoints). Beyond that, only device *preferences* (sound, haptic, backlight,
  units, language) — the equivalent of an Xbox controller's volume, not game settings.
- The **setup wizard configures the FBL/Rotorflight**, not the radio. It is "in-game settings."

## The OpenBar standard channel map (decided 2026-06-01)

OpenBar's radio outputs this **fixed 12-channel layout for every user** — the de-facto Rotorflight
heli standard (`AECR1T23`), per rotorflight.org's EdgeTX/ELRS setup. (We deliberately do NOT use
Rotorflight's *bare firmware* default `AETRC123`: it puts collective on CH5 / throttle on CH3 — wrong
for heli + ELRS first-4 prioritization — and a default model has **no** ARM/rescue/profile/governor
assigned, so it can't even arm. So we standardize and bake the rest.)

| CH | Function | | CH | Function |
|----|----------|--|----|----------|
| 1  | Aileron (roll)   | | 7  | AUX2 — Profile/bank (3-pos: profiles 1-3) |
| 2  | Elevator (pitch) | | 8  | AUX3 — Rescue |
| 3  | **Collective**   | | 9  | AUX4 — Blackbox |
| 4  | Rudder (yaw)     | | 10 | AUX5 — Beeper |
| 5  | AUX1 — **Arm**   | | 11 | AUX6 — Adjustment enable |
| 6  | **Throttle** (governor headspeed selector) | | 12 | AUX7 — Adjustment value |

Notes: Collective and Throttle are **separate** channels in Rotorflight. Collective is a stabilized
mixer input (the collective stick); the Throttle channel drives the **motor via the governor**
(headspeed selector), not the swash. Collective is in the first 4 so it survives ELRS's high-rate
channels; Arm on AUX1 (ELRS requires this).

### What OpenBar bakes into the standard Rotorflight preset (FlyDragon)
So a freshly-flashed OpenBar heli is flyable with **zero channel config**:
- `set rc_map = AECR1T23`
- Mode Activation Conditions: ARM on AUX1(CH5), Profile/bank on AUX2(CH7, 3 ranges), Rescue on
  AUX3(CH8), Blackbox AUX4(CH9), Beeper AUX5(CH10), Adjustments AUX6/7(CH11/12).
- Governor: **per-airframe, NOT in the universal preset** — headspeed/gear ratio/poles depend on the
  heli; the setup **wizard** sets these via MSP. Keep the universal map governor-agnostic.

(Source: rotorflight-firmware `pg/rx.c`, `rx/rx.c`, `pg/modes.c`, `pg/governor.c`; rotorflight.org
radio-setup + governor docs. Re-verify the profile-switch mechanism against the bundled RF version.)

## The standardized FBL config
Because the radio output is identical for everyone, the FBL must expect that same fixed channel map.
This requires a **standardized OpenBar config baked into Rotorflight for the FlyDragon** (a Rotorflight
preset/target shipped/flashed with OpenBar). Key engineering task on the FBL/link side. The user never
sees or sets channel order — it just works.

## Binding flow (the OpenBar pairing experience)
1. Turn the radio on. Plug in the heli → the FBL powers up.
2. If the FBL is **not already bound** to a radio it knows, it waits ~10s then **auto-enters bind mode**.
3. The user taps the **Link / chain button** on the radio → OpenBar scans and lists **all receivers
   currently in bind mode**.
4. The user taps the receiver → OpenBar auto-sets the binding (phrase or equivalent) → **paired.**
5. From then on: power that heli near its radio → **auto-connect, user does nothing.**

## What this means for the UI
- **"Models" → "Helicopters":** the list is *bound craft* (name + which FBL it's paired to), not radio
  configs. Selecting one is choosing which paired heli you're flying.
- **Link/Bind is first-class:** a prominent chain button → "searching for helis in bind mode" → tap to
  pair. Auto-reconnect afterward.
- **"System" loudly states there are no flight settings here** — they live in your heli (Rotorflight).
  Offers: **Stick calibration** + device preferences only.
- The **flight home + wizard** stay as designed (wizard = FBL config via MSP).
