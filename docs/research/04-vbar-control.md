# Mikado VBar Control — Setup UX Research (for Evora)

Research target: Mikado's **VBar Control** radio + **VBar NEO/Silverline** flybarless (FBL)
ecosystem. The thing Evora wants to clone is VBar's tight, wizard-driven, **no-PC**
setup UX — the radio talks to the FBL unit, reads its parameters, and renders setup menus
natively. We are *not* cloning VBar's flight tuning (our team believes Rotorflight already
flies better); we want VBar's *setup/UX magic* and want to improve where we can.

Date compiled: 2026-06-01. Primary sources: mikado-heli.de, vstabi.info (official wiki),
plus forum/review sentiment (HeliFreak, RCGroups, independent blogs). See Sources.

---

## 1. Ecosystem Overview

VBar is sold as a **vertically integrated, single-vendor system** — radio, link, and flight
controller are all Mikado, designed to talk to each other. This integration is the whole
point: it's what makes the setup feel seamless, and it's also the main criticism (closed,
expensive).

**Radios (transmitters):**
- **VBar Control** — original radio. Navigated by a single rotary push-dial called the
  **EDS Dial** (Easy Dialog System): rotate to move through menus, press to select. Monochrome
  screen. Powered on by pressing + rotating the dial 90° clockwise (off = reverse).
- **VBar Control Touch / Touch EVO** — successor with a 5.8" bright capacitive multi-touch
  color display, ambient-light auto-brightness, WiFi. Same conceptual model, richer UI.
- Both use an **80-channel 2.4 GHz FHSS bidirectional** link (telemetry comes back over the
  same link). Receivers are small **satellites** (VBar Control receiver satellites).

**Flight controllers (FBL units):**
- **VBar NEO** — current FBL unit; successor to both the older **VBar Mini** and **VBar
  Silverline**. Combines Mini's small size with Silverline's connectivity. Holds all the
  model's setup data **on the unit itself**.
- Sold with firmware **feature tiers** (Express / Pro / Pro+Rescue). The hardware is the
  same; you pay to unlock capability (e.g. non-standard swashplates, certain in-flight gain
  tuning, Rescue mode). This is a deliberate gating lever (see §4).

**Software / distribution:**
- **VBar Control Manager / Synchronizer** (PC app) — used for firmware updates and to access
  the online **App Shop**; you connect the radio to a computer over USB.
- **On-radio App Store** — the radio runs **apps** (Heli, Airplane, Tandem, Talking
  Telemetry, "Susan" voice pack, etc.). Touch can do **WiFi over-the-air** updates and app
  installs directly; the older Control goes through the PC Manager. You install only the apps
  you need, which keeps the menu surface small (a UX gating mechanism in itself).

**Key architectural idea Evora must internalize:** the FBL unit is the **source of truth**.
Each VBar stores its own complete setup. The radio is a *renderer/editor* — when you connect,
the radio reads the unit's parameters and presents the menus. There is no separate PC config
tool required for normal setup. (Older VBar firmware *did* require PC software for some tail
gain tuning; the modern story is "do it all on the radio.")

**Connectivity note / closed-ness:** modern VBar dropped legacy receiver inputs — no generic
PPM, no arbitrary full-size receiver with per-channel wiring. Inputs are limited to the VBar
Control satellite, Spektrum satellites, Futaba S-Bus, or UDI. This tightens the integration
but locks you in.

---

## 2. The Setup UX — Beginner sets up a NEW heli, end to end

This is the most important section. The flow below is the on-radio **Heli Setup Wizard**
("Create new setup"), reconstructed from the VStabi wizard pages and setup manuals. The
defining trait is that it is a **linear, guided checklist** with a confirm/verify gate at each
step, and the radio shows graphics of exactly what to plug where.

Entry point: **Model Setup → Setup Tools → Heli Setup Wizard**, then **Create new setup**.
Safety: the radio prompts you to set the **motor switch to OFF** before anything spins.

Ordered wizard flow:

1. **Create new setup / confirm.** User chooses to start fresh; radio confirms before wiping.
   Selecting NEO version (1 unit, or 2 for tandem) erases old values and uploads a clean base
   setup to the unit.

2. **Receiver / link.** Choose the input type (VBar Control satellite to the radio's link;
   or Spektrum sats to Tele 1/2; bus RX to AUX1). For the all-Mikado path this is essentially
   automatic.

3. **Transmitter side check.** Assign the control switches: **motor/throttle** switch
   (Stop / Idle / Run), and the **bank switch** that selects flight profiles (banks). Verify
   stick directions, center, and endpoints. (The radio enforces these as mandatory before
   flight.)

4. **Sensor mounting / VBar orientation.** Tell the unit how the FBL is physically mounted
   (orientation), with an option for an external sensor. The radio shows the mounting graphic.

5. **Main rotor direction.** Pick clockwise or counter-clockwise head rotation.

6. **Swashplate type / geometry.** Choose the swash type (e.g. 120°/140°/90°, single-servo,
   etc.). **Non-standard types require Pro firmware** — a clean example of tier gating inside
   the wizard. Expert sub-settings (servo angles, arm distances, rotation) live behind a
   secondary/long-press layer.

7. **Collective direction.** "VBar needs to know which way the swash moves for *positive*
   collective." User moves the stick; the system learns/sets direction. Wrong direction is
   caught here, not in the air.

8. **Servo connection + directions.** The radio shows **which servo plugs into which port
   (CH 1/2/3)** as a graphic. User connects, then steps through each servo and reverses any
   that move the wrong way. The wizard verifies each function (aileron / elevator / collective)
   visually before moving on.

9. **Swashplate centering.** Level the swash at **zero pitch**. The wizard lets you nudge
   each servo / function, then you set servo horns to ~90° and adjust pushrods mechanically so
   the swash sits level at mid. A pitch gauge is used to confirm. This is the
   "mechanical-meets-digital" step the wizard babysits.

10. **Collective travel.** Set total collective throw to the recommended band (~80–100 units),
    checking for mechanical binding at extremes (a "throw check" with adequate headroom).

11. **Cyclic throw.** Set cyclic to the recommended band (~80–110).

12. **Tail setup.** Select tail **servo type** (from a known servo list so timing/limits are
    right), connect the tail servo, verify stick → rotor-slider direction, and set the
    mechanical end limits so the slider doesn't bind. (Tail *gain* is tuned later / in flight;
    older firmware pushed gain tuning to PC software — a wart Evora should avoid.)

13. **Governor / ESC.** Choose governor mode: **External Governor** (ESC governs head speed;
    VBar just passes throttle through) or **VBar e-Governor** (radio + FBL govern RPM). Then set
    throttle values / **target head speeds per bank** (flight profile). Curves are
    per-bank.

14. **Finish.** "Finished" button writes everything to the unit and drops you back to the
    flight menu. The model is ready.

After the first run you re-enter the wizard via **Edit Current Model** to tweak any single
step without redoing the whole flow — the wizard doubles as the *editor*, so beginners and
experts use the same mental model.

**What makes it low-friction (the replicable essence):**
- One linear path, one decision per screen, with a confirm/verify gate before advancing.
- The radio draws the **wiring/mounting picture** at the exact moment you need it.
- Direction and centering are **caught and confirmed on the bench**, not discovered in flight.
- Known **servo lists** mean the user picks their servo by name instead of entering raw
  timing numbers.
- The FBL is the source of truth, so there's no "did I save it / which copy is current?"
  confusion. No PC, no cables for normal setup.
- The wizard is reusable as a per-step editor (Edit Current Model).

---

## 3. Banks / Profiles & In-the-field Operation

- **Banks** = flight profiles (think Rotorflight rate/governor profiles) selected by the
  assigned bank switch. Head speed, curves, and gains can differ per bank.
- All flight-critical setup lives on the VBar unit, so a model "travels" with its FBL.
- In-flight tuning of certain parameters (e.g. gain) is exposed on the radio dial — but only
  if the firmware tier allows it (Express vs Pro).

---

## 4. BASIC vs PRO/EXPERT gating — the mental model Evora should steal

VBar hides depth using several layered mechanisms, not one:

1. **Progressive disclosure via long-press.** In the menu UI, a **small blue triangle** in the
   corner of a select button signals that an **advanced/expert menu** exists; you reveal it by
   **pressing the button longer**. Beginners see and tap the simple option; experts long-press
   to drill in. Same screen serves both audiences.

2. **Wizard vs Edit.** Beginners run the linear wizard once. Experts use "Edit Current Model"
   to jump to any single parameter. The depth is the same data, two doors.

3. **App-level gating.** You install only the apps you need; unused capability simply isn't on
   the radio, so the menu tree stays small. Complexity is opt-in by installation.

4. **Firmware feature tiers (Express / Pro / Pro+Rescue).** Advanced capabilities (custom
   swashplates, some in-flight tuning, Rescue) are locked behind paid tiers. Beginners on the
   base tier literally cannot wander into the deep end.

5. **Context-only menus.** With no receiver/unit connected, only transmitter-setup options
   appear; flight menus only show once a model is connected. The UI never shows irrelevant
   options.

For Evora the portable pattern is: **one data model, progressively disclosed** — a default
"basic" view with the 5–6 decisions that matter, an expert layer one gesture away, and the
whole thing context-gated so you never see settings that don't apply right now. (We'd replace
"pay to unlock" with a simple Basic/Expert toggle — see §6.)

---

## 5. Telemetry / Dashboards on the radio

VBar's bidirectional link brings data back to the radio, and the radio is a real
**telemetry/dashboard + logger**, not just a controller:

- **Live telemetry:** voltage, current, RPM, speed, power/consumption (some values need extra
  sensor hardware). Real-time **graphical vibration analysis** on the display.
- **User-designed dashboard ("userscreen"):** the pilot composes a screen from display
  elements showing the values they care about.
- **Logging:** real-time flight logging with an on-radio **graphical log analyzer** (overview,
  energy consumption, event log) readable directly on the display — no PC needed to review a
  flight.
- **Talking telemetry:** up to **16 per-model announcements**, each gated by up to 2
  switches/positions, each composed as **prefix + value + suffix** with controllable spoken
  length. Requires the "Susan" voice app. Units are set once, system-wide, for all apps.
- **Multimodal feedback:** information, hints, and warnings via **optical + tactile (vibration)
  + acoustic** channels; timers/reminders can warn by sound, voice, or vibration.

---

## 6. What users love / criticize (real sentiment)

**Loved:**
- **Setup speed/ease is the #1 praise.** Independent reviewer: the wizard "walks you through
  it like a checklist — plug it in, follow the steps, and you're airborne," with newcomers
  going "from unboxing to hovering in under an hour."
- **Integration / no-PC workflow.** Radio talks straight to the FBL: read params, change on
  the fly, update firmware — all through the radio. Per-setting **inline explanations** make
  tuning approachable ("each setting had an explanation next to it").
- **Reliability and polish** of the whole integrated package; strong telemetry/logging.

**Criticized:**
- **Price.** Recurring "is it worth the extra $$$?" threads; premium cost vs alternatives, and
  paid firmware tiers on top.
- **Closed ecosystem / lock-in.** No generic receivers, no PPM; you're all-in on Mikado.
  Described as "a closed box" where experimental builds need "jury-rig" workarounds (e.g.
  motorized tails it can't easily do).
- **Tuning granularity / flight feel.** The sharpest criticism, and the one that favors
  Rotorflight: VBar **combines pitch and roll into one "cyclic" setting**, so you can't tune
  them independently — "like trying to fix a car with half the tools missing." Pilots
  comparing to Brain2/Rotorflight say rivals can feel more precise once tuned, and Rotorflight
  gives you **every parameter** (feed-forward, D gains) plus **flight logs/data** so you're
  "not guessing." Multiple top pilots reportedly moving to Rotorflight.

**Net:** VBar wins on *getting set up* and *integration*; it loses on *openness, price, and
deep tuning/feel* — exactly the gap Evora is positioned to fill.

---

## 7. VBar UX patterns Evora SHOULD replicate

1. **The FBL is the source of truth; the radio is a renderer/editor.** On connect, read the
   flight controller's params and render native menus. No mandatory PC tool, no cables for
   normal setup. (Evora: EdgeTX Lua/widget reads Rotorflight params over the link/CRSF.)
2. **A single linear "new model" wizard** = ordered checklist, one decision per screen, with a
   **confirm/verify gate** before advancing. Order roughly: link → switches/sticks → mounting
   → head direction → swash type → collective direction → servo wiring+directions → centering
   → collective travel → cyclic throw → tail → governor → finish.
3. **Show the wiring/mounting graphic at the moment of need** — picture of which servo goes in
   which port, mounting orientation diagram.
4. **Catch direction & centering on the bench** with explicit verify steps (move stick →
   confirm swash/tail moves correctly) so nothing dangerous is discovered in flight.
5. **Pick servos/components by name from a known list** instead of typing raw timing values.
6. **Progressive disclosure: basic option visible, expert one gesture away** (VBar's blue
   triangle + long-press). Same data model, two doors.
7. **Wizard doubles as the per-step editor** ("Edit Current Model") so beginners and experts
   share one mental model.
8. **Context-gated menus** — never show settings that don't apply to the current
   connection/state.
9. **Inline per-setting explanations** right next to each control.
10. **Banks/profiles** with simple switch-based selection and per-bank curves/head speed.
11. **On-radio telemetry dashboard + log review + configurable spoken announcements**
    (prefix/value/suffix, switch-gated), with optical+tactile+acoustic warnings.
12. **Install-only-what-you-need apps/modules** to keep the menu surface small.

## 8. Where Evora CAN DO BETTER

1. **Free the gating.** Replace pay-to-unlock firmware tiers with a simple, free **Basic ↔
   Expert toggle**. Same progressive-disclosure UX, none of the paywall.
2. **Open ecosystem.** EdgeTX + ExpressLRS + Rotorflight means any compatible RX/link/FC —
   no single-vendor lock-in, no dropped legacy support, cheaper hardware.
3. **Expose full tuning without losing the easy path.** Keep VBar's friendly wizard as the
   default, but in Expert mode expose **independent pitch vs roll**, feed-forward, D-gains —
   the granularity VBar withholds and Rotorflight already provides.
4. **No-PC for everything.** Make sure *all* tuning (including tail gain, which old VBar
   firmware pushed to PC software) is doable on the radio.
5. **Data-driven tuning on the radio.** Rotorflight already produces blackbox/flight logs;
   surface log-derived suggestions and on-radio graphs so users aren't guessing — go beyond
   VBar's analyzer.
6. **Community + transparency.** Open docs, open data formats, fast community fixes — the
   things VBar's closed model can't match.
7. **Cost.** Deliver the wizard-grade onboarding on commodity hardware at a fraction of VBar's
   price.

---

## Sources

- VBar Control Owner's Manual (Mikado) — https://www.mikado-heli.de/downloads/anleitungen/vcontrol/VBar%20Control%20Touch_201_EN.pdf
- VBar Control Setup Manual (Mikado, PDF) — https://www.mikado-heli.de/downloads/anleitungen/vcontrol/VBar%20Control%20Setup%20Manual.pdf
- VStabi wiki — Using the Wizard — https://www.vstabi.info/en/node/1888
- VStabi wiki — Basic Setup — https://www.vstabi.info/en/node/2325
- VStabi wiki — Basic Transmitter Operation (EDS dial, menus, blue-triangle/long-press) — https://www.vstabi.info/en/node/1807
- VStabi wiki — Wiring your NEO VBar — https://www.vstabi.info/en/node/1889
- VStabi wiki — VBar Control FAQ — https://www.vstabi.info/en/node/1664
- VStabi wiki — VBar NEO/EVO FAQ — https://www.vstabi.info/en/node/1961
- VStabi wiki — Tail servo list — https://www.vstabi.info/en/tailservos
- VStabi wiki — Talking Telemetry / userscreen — https://www.vstabi.info/en/node/2347
- VStabi wiki — RPM Telemetry Setup — https://www.vstabi.info/en/node/1687
- VStabi wiki — Versions / feature matrix (tiers) — https://www.vstabi.info/en/featurematrix
- VBar NEO Quick Start Guide (Express firmware, PDF) — https://www.mikado-heli.de/downloads/anleitungen/vbar_neo/QSG-Broschuere_A6_NEO_en_web.pdf
- VBar Control Touch product page — https://shop.mikado-heli.de/VBar-VStabi-Electronics/VBar-Control-Radio-System/VBar-Control-Touch.htm
- Model Aviation — Mikado VBar Control Touch review — https://www.modelaviation.com/mikado-vbar-control
- RC-Thoughts — "VBar NEO – what's new?" — https://www.rc-thoughts.com/2015/07/vbar-neo-whats-new/
- Angel Rojas Jr — "Mikado VBar vs. Rotorflight: The Real Deal on Flybarless Systems" (2025) — https://www.angelrojasjr.com/2025/03/13/mikado-vbar-vs-rotorflight-the-real-deal-on-flybarless-systems/
- HeliFreak — "Is the mikado VBar control even worth it?" — https://www.helifreak.com/showthread.php?t=877661
- HeliFreak — "Is the V-Bar Control worth the extra $$$?" — https://www.helifreak.com/showthread.php?t=750243
- HeliFreak — "vbar control is a large investment - any negatives?" — https://www.helifreak.com/showthread.php?t=645956
- HeliFreak — "Is VBar still dominant?" — https://www.helifreak.com/showthread.php?p=8871033
- RCHelicopterFun — Best Flybarless System / Flight Controller 2025 — https://www.rchelicopterfun.com/best-flybarless-system.html
- RCHelicopterRichard — Mikado VBar basic setup / VControl Touch setup — https://rchelicopterrichard.com/mikado-vbar-basic-setup/

> Note on source confidence: the wizard *sequence* (§2) and the basic/expert gating model
> (§4) are well corroborated across the official VStabi wiki, manuals, and an independent
> review, and should be treated as solid. Thinner / lower-confidence areas, flagged for
> follow-up: (a) exact NEO-EVO wizard wording and whether the absolute step order matches the
> latest Touch EVO firmware (manuals span several firmware generations); (b) precisely which
> tuning is on-radio vs PC on the *current* firmware (older docs say tail gain was PC-only —
> likely improved, not fully re-verified); (c) some HeliFreak threads were paywalled
> (tollbit/402), so forum quotes lean on search snippets + the independent blog rather than
> full-thread reading.
