# Evora — VBar-style sectioned right-side menu (design spec)

_2026-06-03 · approved by owner. Theme: the active "aerospace instrument" look (navy + amber + teal,
Rajdhani/Barlow). Replaces the home's bottom toolbar + inline CTAs as the primary navigation._

## Goal
Replicate the **VBar Control Touch** menu structure: a panel that **slides in from the right** over the
(dimmed) home, a **scrollable list grouped into sections**, each row an **icon + label + one-line
description**. Carries over VBar's **context-gating** (only relevant items show) and **progressive
disclosure** (an `expert` marker reveals raw values behind simplified ones).

## The three-layer model logic
- **New model** — build from scratch: the guided **wizard** (hard set-once setup). Also *erase & start
  fresh*.
- **Edit model** — same hard-setup params, **less guided, drill-down by discipline** (set-once geometry).
- **Tuning** — the **feel** layer tweaked between flights (PID, rate/expo, governor gain).
- Rule: **structure/geometry → Edit Model · feel → Tuning · from scratch → New Model.** A given
  Rotorflight parameter lives in exactly one place.

## Menu structure
- **MODEL** — New model · Edit model · Switch model · Bind a heli
- **TUNING** — Main rotor · Tail rotor · ESC · Governor
- **MONITOR** — Flight dashboard · ESC & motor · Battery · Governor/RPM
- **RADIO** — Sticks & calibration · Sound · Backlight · Units · About
- **TOOLS** — Servo test · Receiver · Channel monitor

### Edit Model — 3 disciplines (down from the old long list)
- **Main rotor** — head/swash: servos, swash type, directions, geometry, collective/cyclic limits.
- **Tail rotor** — tail servo, direction, travel limits.
- **ESC / Throttle** (Throttle if nitro) — ESC type, **governor type (ESC ↔ FBL set here)**, throttle range.

### Tuning — 4 tiles, fast tap-to-adjust (`[-] value [+]` steppers)
- **Main rotor** — PID (cyclic P/I/D + gain) · stick feel (rate °/s, expo). `expert` reveals raw PID.
- **Tail rotor** — PID (yaw P/I/D, stop gain) · stick feel (rate °/s, expo).
- **ESC** — ESC PID / throttle-governor response control.
- **Governor** — headspeed (rpm) · gain · spool/ramp · mode.

## Behaviors
- **New model = start-fresh + reset.** On an existing model: confirm *"Erase the current model and start
  fresh?"* → load default Rotorflight params (wipe) → run the wizard. **Keeps the receiver binding** (no
  re-bind of the same heli).
- **Open mechanism:** a slim **amber tab on the right edge** of the home + swipe-from-right; tap the tab
  (or swipe) to slide the panel in; scrim or ✕ to close.
- **Context-gating:** MONITOR + TUNING appear only when a heli is connected (`TELEMETRY_STREAMING()`).
- **Progressive disclosure:** rows that open deeper expert pages show a teal `▲ expert` marker.
- **MSP:** Tuning/Edit writes go to Rotorflight over MSP — **UI shells / local overrides until that link
  is wired** (consistent with the rest of the firmware; values are demo placeholders).

## Implementation notes (firmware)
- New `EvoraMenu` overlay built on `EvoraHome` (adapt the shelved instrument-drawer pattern; the
  Brutalist drawer on `Evora-TX@brutalist-theme` is a code reference for the slide/scrim/anim).
- Rows wire to existing `EvoraScreen::open(Kind)` (Helicopters/System/Bind/Tools) + `openEdit()`; new
  `Page`s for the 4 Tuning tiles (reuse the `renderChips`/chip-editor pattern).
- Sections are data-driven (`{section, rows[]}`) so order/gating is table-edited, not hand-laid.
- Authored in logical 480×272, `EV_SC` scales to both panels.

## Out of scope (v1)
Live telemetry/MSP wiring; the actual factory-reset param load (stub the confirm + flow); MK3 binary.
Mockup: `docs/mockups/gallery/menu-vbar.{html,png}`.
