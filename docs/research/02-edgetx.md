# Evora Research 02 — EdgeTX as the On-Radio GUI Platform

**Question:** How "native" and polished can Evora's on-radio GUI realistically be using
Lua scripts/widgets, vs. what would require forking EdgeTX's C++ firmware?

**Scope:** Color/touch EdgeTX radios (RadioMaster TX16S and successors). Findings are taken
from the EdgeTX source tree (`git clone --depth 1 https://github.com/edgetx/edgetx`,
commit current as of 2026-06-01) plus the official Lua reference (luadoc.edgetx.org) and
Rotorflight docs. File paths below are relative to the repo root.

---

## TL;DR Verdict

**A pure-Lua Evora can feel genuinely app-like — far closer to VBar Control than
most people assume — because modern EdgeTX exposes a full LVGL widget toolkit to Lua
(`lvgl.*`): buttons, dialogs, sliders, text/number editors, choice pickers, pages,
menus, an "app mode" that takes over the whole screen, plus a 6 MB Lua memory budget on
color radios.** The two hard ceilings are: (1) **there is no Lua API to create/select/copy
a model** — model provisioning is C++ only — and (2) **the radio's own settings/theme
chrome (top bar, menus, fonts) cannot be restyled from Lua.** Both ceilings have practical
Lua-level workarounds (write a `.yml` template to the SD card via `io.write`; run Evora
as a full-screen "app" so the EdgeTX chrome is hidden). **Recommendation: build Evora as
a Lua/LVGL "app" suite first; reserve a C++ fork only if you need true model auto-creation,
custom system theming, or higher MSP throughput.**

---

## 1. Lua scripting API on color/touch radios

### 1.1 Script types & lifecycle

(Source: luadoc.edgetx.org Part I; `radio/src/lua/lua_api.h`, `interface.cpp`,
`radio/src/gui/colorlcd/standalone_lua.cpp`)

| Type | Where it lives | Run cadence | Full screen? | Lifecycle |
|------|----------------|-------------|--------------|-----------|
| **One-Time / "Tool"** (`SCRIPTS/TOOLS/*.lua`) | Tools menu, or "Standalone" | Runs `run()` every refresh until it returns ≠0; **suspends all other scripts** while active | **Yes — full control of the screen** | `init()` once → `run(event,touch)` loop → exit. Can also use the LVGL `{init=…, run=…}` table form (`standalone_lua.cpp:88-109`). |
| **Widget** (`WIDGETS/<name>/main.lua`) | A widget zone on a model screen | Periodic when visible; `background()` when not | Can request full screen | `create()` → `update()` → `refresh()` / `background()` |
| **Telemetry** | Telemetry screen page | When visible; `background()` always (used by Rotorflight rf2tlm) | Yes, when its page is shown | `init`/`run`/`background` |
| **Mix / "Custom" script** | Per-model mixer | ~ every 30 ms, GUI thread, not guaranteed | **No LCD access** | `init`/`run`; needs firmware built with `LUA_MIXER=Y` |
| **Function** (Special Function `Lua`) | Triggered by a switch/logical switch | While condition true | No LCD access | `init`/`run` |

For Evora, the **One-Time / Tool** type (preferably the LVGL "app" variant) is the right
host: it can take over the whole screen and read touch.

### 1.2 What Lua can READ / WRITE on the model

The model library (`radio/src/lua/api_model.cpp`, table `modellib` at lines 1962-2006)
exposes full read **and write** access to almost every per-model setting:

- **Mixes:** `getMixesCount`, `getMix`, `insertMix`, `deleteMix`, `deleteMixes`
- **Inputs:** `getInputsCount`, `getInput`, `insertInput`, `deleteInput`, `deleteInputs`, `defaultInputs`
- **Outputs (channels):** `getOutput`, `setOutput` (covers channel min/max/reverse/center/curve — i.e. channel order/direction)
- **Logical switches:** `getLogicalSwitch`, `setLogicalSwitch`
- **Special/Custom functions:** `getCustomFunction`, `setCustomFunction`
- **Curves:** `getCurve`, `setCurve`
- **Global variables:** `getGlobalVariable`/`setGlobalVariable` (+ `…Details`)
- **Telemetry sensors:** `getSensor`, `resetSensor` (read/reset; **no create-sensor or set-sensor-config from Lua** — discovery is done by the radio)
- **Timers, flight modes, modules, swash ring, switch warnings, model info:** `get/setTimer`, `resetTimer`, `get/setFlightMode`, `deleteFlightModes`, `get/setModule`, `get/setSwashRing`, `get/setSwitchWarning`, `get/setInfo`
- **Failsafe:** set via `model.setModule(...)` (failsafe mode + per-channel values live in the module config), not a dedicated call.

General/global helpers (`api_general.cpp`, `etxlib`): `getValue`, `getSourceValue`,
`getFieldInfo`, `getGeneralSettings`, `getRSSI`, `getSwitch*`, `getLogicalSwitchValue`,
`setStickySwitch`, plus audio (`playFile/playNumber/playTone/playHaptic`),
`popupInput/Warning/Confirmation`, `loadScript`, `getUsage`, `getAvailableMemory`.

### 1.3 What Lua CANNOT do to models

- **No `model.create` / `selectModel` / `copyModel` / `deleteModel` / `saveModel`.** A grep
  of the entire `radio/src/lua/` tree finds none. Creating, selecting, or duplicating a
  model is **C++ only**: `createModel()` in `radio/src/storage/sdcard_common.cpp:157`,
  `ModelsList::addModel()` in `radio/src/storage/modelslist.cpp:1351`, and the model
  template UI in `radio/src/gui/colorlcd/model/model_templates.cpp`.
- **No sensor creation/config write.** Lua can read and reset sensors, not define them.
- **Settings persist only when the radio next writes the model file.** Lua writes go into
  the live in-RAM model struct; EdgeTX persists it on its normal schedule.

**Workaround for provisioning:** Lua *does* have file I/O — see §3.3 — so Evora can write
a complete `model.yml` (or a `/TEMPLATES` entry) to the SD card and then ask the user to
instantiate it via the built-in model wizard (one tap), or have Evora mutate an
already-created model in place via the `model.*` write API above.

### 1.4 Drawing, touch, fonts, performance, storage

- **Two drawing paths.**
  1. **Immediate-mode `lcd.*`** (`api_colorlcd.cpp`): `drawText`, `drawNumber`, `drawLine`,
     `drawRectangle`/`Filled`, `drawCircle`/`Filled`, `drawTriangle`, `drawArc`, `drawPie`,
     `drawAnnulus`, `drawGauge`, `drawBitmap`, `setColor`/`RGB`, `drawHudRectangle`,
     `getColor`, `sizeText`, etc. Bitmaps load via `Bitmap.open`, `resize`, `toMask`.
  2. **Retained-mode LVGL `lvgl.*`** (`api_colorlcd_lvgl.cpp`, `lua_lvgl_widget.cpp`) —
     **this is the key to an "app-like" UI.** Object types: `label`, `rectangle`, `line`,
     `circle`, `arc`, `image`, `qrcode`, `button`, `momentaryButton`, `toggle`,
     `textEdit`, `numberEdit`, `choice`, `slider`, `verticalSlider`, `box`, `page`,
     `dialog`, `confirm`, `message`, `menu`, plus pickers for `font`, `color`, `align`,
     `timer`, `switch`, `source`, `file`, and a `setting` row widget. Objects support
     `set/show/hide/enable/disable/close`, callbacks (`press`, `longpress`, `release`,
     `changed`), flex layout (`flexFlow`, `flexPad`), scrolling, rounded corners, opacity,
     bg color. `lvgl.isAppMode()` / `isFullScreen()` tell the script it owns the screen.
- **Touch API** (`lua_event.cpp`, `lua_touch.h`): the `run(event, touch)` callback receives
  a touch table with `x`, `y`, `tapCount`, and for slides `slideX`/`slideY`; the firmware
  derives swipe direction (`EVT_TOUCH_SWIPE_*`). LVGL widgets get touch routed to their
  callbacks automatically, so you rarely hand-handle coordinates.
- **Fonts:** standard EdgeTX font sizes (XXS/XS/SMALL/STD/BOLD/L/XL/XXL via flags); the
  LVGL `font` picker exposes the same set. No arbitrary TTF loading from Lua.
- **Memory / performance:** color targets define `LUA_MEM_MAX = 6 MB`
  (`radio/src/targets/horus/board.h:61`, `st16`, `pl18`, `pa01`, `stm32h7s78-dk`,
  `boards/rm-h750`, etc.); exceeding it kills the script (`interface.cpp:1312-1318`).
  B/W Taranis targets are `0` (unlimited but tiny RAM). `getUsage()` returns % of the
  per-cycle instruction budget (watchdog); long synchronous work in `run()` will be
  throttled/killed, so heavy work must be chunked across frames. `MAX_SCRIPTS` = 9
  (color) / 7 (B/W) (`dataconstants.h:51`).
- **Persistent storage for scripts:**
  - `setShmVar(id,val)` / `getShmVar(id)` — small shared-memory ints, **RAM only, not
    persisted across reboot** (`api_general.cpp:2487`).
  - **Real persistence = the SD card via the `io` + `dir` libraries** (§3.3). This is how
    Evora would store its own config/state.

---

## 2. CRSF / MSP passthrough (the Rotorflight mechanism)

- **Primitive:** `crossfireTelemetryPush(command, dataTable)` and `crossfireTelemetryPop()`
  (`api_general.cpp`, `luaCrossfireTelemetryPush` at line 1195, `…Pop` nearby). Push only
  works when a module is running the CRSF protocol (`PROTOCOL_CHANNELS_CROSSFIRE`), else it
  returns `nil`. The firmware frames it as
  `[MODULE_ADDRESS][len][command][payload…][CRC8]` (CRC8_D5; COMMAND_ID frames add a CRC8_BA),
  and routes to the internal or external module automatically.
- **Hard size limit:** the output telemetry buffer is **`TELEMETRY_OUTPUT_BUFFER_SIZE = 64`
  bytes** (`radio/src/telemetry/telemetry.h:151`). `crossfireTelemetryPush` rejects calls
  where the argument count exceeds that (`api_general.cpp:1209`). So **one CRSF frame carries
  at most ~60 bytes of MSP payload after framing/CRC.** Larger MSP requests/responses must be
  **chunked across multiple frames** by the Lua layer — exactly what the Rotorflight Lua
  suite does (it wraps MSP-over-CRSF and reassembles). MSP uses the CRSF
  `MSP_REQ`/`MSP_RESP`/`MSP_WRITE` frame types (0x7A/0x7B/0x7C); the radio is the MSP
  "origin", the FC the "destination".
- **Rate:** push only succeeds when `outputTelemetryBuffer.isAvailable()` (one in-flight frame
  at a time); throughput is bounded by the CRSF telemetry slot rate / ELRS telemetry ratio,
  i.e. tens of frames/sec, not hundreds. Rotorflight requires CRSF ≥ v2.11 or ELRS ≥ 3.5.0.
- **Rotorflight integration shape** (rotorflight.org/docs/setup/lua-scripts): user copies the
  `SCRIPTS/` folder to the radio; `rf2.lua` appears in `SCRIPTS/TOOLS`; a background
  **telemetry** script (`rf2tlm.lua`) keeps the link alive; the tool then reads API version +
  FC device ID and presents PID/rate/filter/failsafe/governor pages, "Save page" pushes
  changes via MSP-over-CRSF. **This is the exact pattern Evora would reuse.**
- **Alternative tunnel:** `serialWrite`/`serialRead`/`setSerialBaudrate` (`api_general.cpp`)
  allow raw serial (e.g. USB-serial or a configured aux port) — relevant only for bench/PC
  flows, not the in-air CRSF link.

---

## 3. Model templates / wizards / file format / provisioning

### 3.1 Model file format
- Color/EdgeTX models are **YAML** (`model<N>.yml`) under `/MODELS` on the SD card; radio
  config under `/RADIO`. (OpenTX `.bin` is legacy.) The YAML schema mirrors the C++
  `ModelData` struct (`radio/src/datastructs_private.h`).

### 3.2 Built-in wizard / templates (C++)
- EdgeTX ships a **model template picker** (not a step-by-step "wizard" like VBar): browse
  `/TEMPLATES` for `.yml` files and instantiate one as a new model.
  `radio/src/gui/colorlcd/model/model_templates.cpp` (matches `YAML_EXT` at line 115);
  `TEMPLATES_PATH = ROOT_PATH "TEMPLATES"`, with a `/2.Personal` subfolder for user
  templates (`radio/src/sdcard.h:38-40`).
- **EdgeTX Companion** (desktop) can author/edit models and write them to the radio, but it
  is **not on the radio** and is irrelevant to a no-PC Evora flow.

### 3.3 Can provisioning be fully script-driven on the radio?
- **Partly.** Lua **cannot** call "create model" directly. But Lua **can write files**: the
  `io` library is compiled in (`thirdparty/lua/src/linit.c:110`) with working
  `io.open`/`io.read`/`io.write`/`io.close` (`liolib.c`), plus a `dir` library
  (`api_filesystem.cpp`) exposing `dir`, `fstat`, `del`, `chdir`, `mkdir`, `rename`.
- **Therefore Evora's realistic provisioning flow is:**
  1. Evora Lua tool gathers heli setup via its own touch UI.
  2. It writes a fully-formed `Evora-Heli.yml` into `/TEMPLATES/2.Personal/`.
  3. User taps "create model from template" once (built-in C++ screen) — or Evora mutates
     a freshly-created blank model in place using the `model.*` write API (§1.2).
  4. Evora then talks to the FC over MSP-over-CRSF (§2) to push Rotorflight config.
- A **single-tap, fully-automated** "create + select + configure" with zero EdgeTX-native
  screens is the one thing that needs a C++ change (expose `createModel`/`selectModel` to
  Lua, or add an Evora provisioning hook).

---

## 4. Touch UI / theming & the visual ceiling

- **Screen resolutions across color targets** (`radio/src/targets/*/hal.h`):
  - **480×272** — TX16S / Horus X10/X12 class (the current reference radio).
  - **480×320** — `st16`, `t15pro`, `tx15`, newer Horus variant.
  - **320×480 (portrait)** — `pl18` (Jumper T-Pro-ish), `pa01`.
  - **800×480** — `tx16smk3` and `stm32h7s78-dk` (H7-class). The **next-gen radio is very
    likely an 800×480 H7 target**, so design Evora layouts resolution-independently
    (LVGL flex layout + relative coords), not pixel-pinned to 480×272.
- **Theme system:** EdgeTX has a C++ theme/Yaml theme system for the *radio's own* UI
  (colors, top bar, menus). **Lua scripts cannot redefine the global theme or the system
  chrome.** What Lua *can* do is take over the **entire screen** in app/full-screen mode and
  draw whatever it wants with LVGL — so within an Evora tool you are not constrained by the
  EdgeTX look at all; you only see EdgeTX chrome when you *leave* Evora.
- **Realistic look-and-feel ceiling for pure Lua:** rich, scrollable, multi-page,
  touch-driven app with custom colors, icons (PNG via `Bitmap.open`/`image`), QR codes,
  styled buttons/cards, modal dialogs, sliders and number spinners, and your own navigation.
  This is comfortably "VBar-Control-class" for the *setup-wizard* experience. The ceiling is:
  no custom fonts beyond the built-in set, no animation framework beyond LVGL basics exposed,
  no replacing the radio's boot/home/model-select screens, and per-cycle CPU budget forces
  you to keep frame work light.

---

## 5. The realistic verdict: Lua-only vs Lua+theme vs C++ fork

| Option | What it unlocks | Cost / maintainability |
|--------|-----------------|------------------------|
| **A. Pure-Lua / LVGL "app" suite** (recommended start) | Full custom touch UI, read+write all model mixes/inputs/outputs/LS/curves/SF/GVs, MSP-over-CRSF to Rotorflight, SD-card config persistence, write `.yml` templates. ~90% of the VBar setup experience. | **Lowest.** Ships as a folder of `.lua` on the SD card; survives EdgeTX upgrades with little/no change (stable Lua API). No build toolchain. Distributable like Rotorflight's suite. |
| **B. Lua suite + a custom EdgeTX theme** | Everything in A, plus the *radio's own* chrome (home screen, top bar, model list) matches Evora branding. | **Low-moderate.** Theme is data/Yaml + maybe minor C++; cosmetic only, doesn't unlock new capability. Theme format can drift across versions. |
| **C. C++ firmware fork** | True one-tap model auto-create/select, sensor provisioning, custom fonts, deeper UI, larger/faster MSP transport, removing the per-cycle Lua throttle, system-level wizards. | **Highest.** Must track upstream EdgeTX (frequent releases), maintain CI/builds per target, re-flash radios, and users can't use stock firmware. Reserve for capabilities A+B genuinely cannot deliver. |

**Recommended path:** Build Evora as **Option A** (Lua/LVGL app + MSP-over-CRSF, modeled on
the Rotorflight suite), optionally add **Option B** branding. Only escalate to **Option C**
if the product demands fully unattended model creation or a deeper system integration than
the Lua API allows — and even then, consider upstreaming a minimal "Lua model-provisioning"
PR to EdgeTX instead of a long-lived fork.

---

## 6. "Lua can / Lua cannot" capability table (Evora use case)

| Capability | Lua? | Notes / source |
|------------|------|----------------|
| Full-screen custom touch UI (app mode) | ✅ | `lvgl.*` app mode, `standalone_lua.cpp` |
| Buttons, sliders, text/number edit, choice, dialogs, menus, pages | ✅ | `api_colorlcd_lvgl.cpp`, `lua_lvgl_widget.cpp` |
| Custom icons/images, QR codes | ✅ | `Bitmap.open`, `lvgl.image`, `lvgl.qrcode` |
| Read touch (tap/swipe/coords) | ✅ | `lua_event.cpp`, `lua_touch.h` |
| Read **and modify** mixes/inputs/outputs (channel order/reverse) | ✅ | `model.*` write API, `api_model.cpp` |
| Read/modify logical switches, special functions, curves, GVs, timers, flight modes | ✅ | `api_model.cpp` table 1962-2006 |
| Set failsafe (via module config) | ✅ | `model.setModule` |
| Read telemetry sensors / values | ✅ | `model.getSensor`, `getValue` |
| **Create a telemetry sensor / set its config** | ❌ | only `getSensor`/`resetSensor` |
| MSP tunnel to FC over CRSF (Rotorflight) | ✅ | `crossfireTelemetryPush/Pop`, 64-byte frame cap, chunk in Lua |
| Persist Evora's own config to SD | ✅ | `io.open/write`, `dir.mkdir` etc. |
| Write a `model.yml` template to SD | ✅ | `io.write` + `/TEMPLATES/2.Personal` |
| **Create / select / copy / delete a model** | ❌ | C++ only: `createModel()`, `ModelsList::addModel` |
| **One-tap auto-create+select+configure (no native screen)** | ❌ | needs C++ hook |
| Restyle the radio's own theme / home / model-select screens | ❌ | C++ theme system, not Lua |
| Custom fonts (TTF) | ❌ | built-in font set only |
| Unlimited CPU per frame | ❌ | per-cycle instruction watchdog (`getUsage`) |
| Large Lua programs / assets | ✅ (≤6 MB) | `LUA_MEM_MAX = 6 MB` on color targets |

---

## 7. Uncertainties / to verify on hardware

- **Exact failsafe write surface** via `model.setModule` (field names per module type) — verify
  against `api_model.cpp` `luaModelSetModule` and a real `.yml`.
- **Real-world MSP-over-CRSF throughput** for a full Rotorflight config push (frame rate
  depends on ELRS telemetry ratio) — benchmark on the link.
- **Whether the next-gen radio is 800×480 H7** (`tx16smk3`/`stm32h7s78-dk` profile) — confirm
  when hardware arrives; design layouts resolution-independently regardless.
- **`io` library availability on every shipping color build** — it's in `linit.c`, but confirm
  no target disables it; if blocked, fall back to the `dir`/`api_filesystem` helpers.
- **Mix/Function script LCD restriction** — confirmed "no LCD access" in docs; Evora must use
  Tool/Widget/Telemetry types for any UI.

---

## Sources

### Repo files (`/tmp/evora-research/edgetx`, depth-1 clone, 2026-06-01)
- `radio/src/lua/api_model.cpp` — model read/write API (table `modellib`, lines 1962-2006)
- `radio/src/lua/api_general.cpp` — global API; `crossfireTelemetryPush` (l.1195), `serialWrite`, `setShmVar`/`getShmVar` (l.2487)
- `radio/src/lua/api_colorlcd.cpp` — immediate-mode `lcd.*` drawing primitives
- `radio/src/lua/api_colorlcd_lvgl.cpp` — `lvgl.*` toolkit + app mode (`isAppMode` l.392)
- `radio/src/lua/lua_lvgl_widget.cpp` / `.h` — LVGL widget object definitions
- `radio/src/lua/lua_event.cpp`, `radio/src/lua/lua_touch.h` — touch/swipe events
- `radio/src/lua/interface.cpp` — script lifecycle, `LUA_MEM_MAX` enforcement (l.1312-1318)
- `radio/src/lua/api_filesystem.cpp` — `dir` library (mkdir/rename/del/fstat)
- `radio/src/thirdparty/lua/src/linit.c` (l.110) + `liolib.c` — `io` library enabled
- `radio/src/gui/colorlcd/standalone_lua.cpp` — standalone/app lifecycle (`init`/`run`)
- `radio/src/storage/sdcard_common.cpp` (`createModel`, l.157), `radio/src/storage/modelslist.cpp` (`addModel`, l.1351)
- `radio/src/gui/colorlcd/model/model_templates.cpp` / `.h` — template picker (YAML, l.115)
- `radio/src/sdcard.h` (l.38-40) — `TEMPLATES_PATH`, `/2.Personal`
- `radio/src/telemetry/telemetry.h` (l.151) — `TELEMETRY_OUTPUT_BUFFER_SIZE = 64`
- `radio/src/telemetry/crossfire.h` — CRSF frame periods
- `radio/src/dataconstants.h` (l.51, 387-388) — `MAX_SCRIPTS`, `MAX_SCRIPT_INPUTS/OUTPUTS`
- `radio/src/targets/*/board.h` — `LUA_MEM_MAX = 6 MB` (horus/st16/pl18/pa01/stm32h7s78-dk; taranis = 0)
- `radio/src/targets/*/hal.h` — `LCD_W`/`LCD_H` per radio (480×272, 480×320, 320×480, 800×480)

### Web
- EdgeTX Lua Reference Guide — https://luadoc.edgetx.org/ (script types, `model.*`, `crossfireTelemetryPush`, `loadScript`)
- Lua reference repo — https://github.com/EdgeTX/lua-reference-guide
- `crossfireTelemetryPush()` — https://luadoc.edgetx.org/lua-api-reference/rf-module/crossfiretelemetrypush
- EdgeTX Lua examples — https://github.com/EdgeTX/lua-scripts
- Rotorflight Lua scripts (setup) — https://rotorflight.org/docs/setup/lua-scripts
- Rotorflight ELRS custom telemetry — https://rotorflight.org/docs/next/setup/elrs-custom-telemetry
- Rotorflight Lua scripts repo — https://github.com/rotorflight/rotorflight-lua-scripts
- EdgeTX User Manual — SD card / model files — https://manual.edgetx.org/bw-radios/radio-settings/sd-card
- RadioMaster TX16S (480×272 4.3") — https://radiomasterrc.com/products/tx16s-hall-radio-controller
- EdgeTX Lua API (DeepWiki overview) — https://deepwiki.com/EdgeTX/edgetx/6.2-lua-api-reference
