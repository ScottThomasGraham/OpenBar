# OpenBar Research 03 — ExpressLRS (ELRS): The Link Layer

**Scope.** ELRS is the open-source RC control link OpenBar will use to carry both RC channels
and — critically — the over-the-air (OTA) configuration pipe that the OpenBar setup wizard uses
to configure a Rotorflight/Betaflight flight controller (FC) from the radio. This report
characterizes the architecture, the MSP-over-CRSF tunnel (the load-bearing pipe), binding &
onboarding, configuring ELRS itself, and telemetry to EdgeTX. Findings are drawn from the ELRS
source (shallow clone, `master` as of 2026-06) and the official docs.

> **Headline for OpenBar:** The OTA config pipe (MSP-over-CRSF) is real and is exactly how
> Betaflight/Rotorflight Lua configurators already run from the radio today — but it is a
> **narrow, half-duplex, telemetry-rate-limited channel**, not a USB-like link. Full FC
> configuration over the air is feasible but **slow and bursty**, and OpenBar must design its
> wizard around chunked transfers, a constrained telemetry budget, and the 8-byte uplink write
> limit. See "MSP-over-CRSF constraints" below.

---

## 1. Architecture

### TX module + RX
- **TX module** plugs into the radio's module bay (or is internal) and talks to EdgeTX over a
  UART using the **CRSF serial protocol** (`CRSF_SYNC_BYTE 0xC8`, full-duplex, uninverted UART
  pair). The radio is `CRSF_ADDRESS_RADIO_TRANSMITTER (0xEA)`; the TX module is
  `CRSF_ADDRESS_CRSF_TRANSMITTER (0xEE)`; the ELRS-specific Lua endpoint is
  `CRSF_ADDRESS_ELRS_LUA (0xEF)`.
- **RX** sits on the aircraft, talks to the FC over CRSF on a UART (or outputs SBUS/PWM/etc.).
  The FC is `CRSF_ADDRESS_FLIGHT_CONTROLLER (0xC8)`, RX is `CRSF_ADDRESS_CRSF_RECEIVER (0xEC)`.
- The link is a routed bus: a `CRSFRouter` moves frames between connectors (radio↔TX over UART,
  TX↔RX over RF, RX↔FC over UART), addressing by `dest_addr`/`orig_addr` in the extended header.
  *(src: `src/lib/CrsfProtocol/CRSFRouter.*`, `src/include/crsf_protocol.h`)*

### CRSF protocol
- Frames: `[sync][len][type][payload...][crc8]`, max packet **64 bytes** (`CRSF_MAX_PACKET_LEN`),
  CRC poly `0xD5`. Extended-header frames (types 0x28–0x96) add `dest`/`orig` address bytes and
  cover device discovery, parameter settings, MSP, and commands.
- **RC channels:** `CRSF_FRAMETYPE_RC_CHANNELS_PACKED (0x16)` packs 16 channels × 11 bits.
  Channel value range maps 988–2012 µs to CRSF 172–1811 (center 992). *(src: `crsf_protocol.h`
  `crsf_channels_s`, `CRSF_to_US`)*
- **Parameter system** (this is how the ELRS Lua menu works, NOT MSP): `DEVICE_PING (0x28)`,
  `DEVICE_INFO (0x29)`, `PARAMETER_SETTINGS_ENTRY (0x2B)`, `PARAMETER_READ (0x2C)`,
  `PARAMETER_WRITE (0x2D)`, `ELRS_STATUS (0x2E)`, `COMMAND (0x32)`. Field types include folders,
  text-selections, int/float, command, etc. *(src: `crsf_protocol.h` `crsf_frame_type_e`,
  `crsf_value_type_e`; handled in `src/lib/rx-crsf/RXEndpoint.cpp::handleMessage`)*

### Supported bands / packet rates
- **Bands by radio chip** (compile-time `RATE_MAX`): SX127x (900 MHz LoRa) RATE_MAX 6; SX128x
  (2.4 GHz: 2×FLRC + 2×DVDA + 4×LoRa + 2×FullRes) RATE_MAX 10; LR1121 (dual-band 900+2.4)
  RATE_MAX 20. *(src: `src/include/common.h` ~L273–290)*
- **Packet rates** exposed in Lua: 50Hz…1000Hz incl. modes F500, F1000 (FLRC), D250/D500 (DVDA),
  K1000 (dual-band). Higher rate = lower link latency but smaller telemetry budget.
- **Regulatory domains** (compile-time, region-locked): `ISM_2400`, `FCC_915`, `EU_868`,
  `IN_866`, `AU_915`, `AU_433`, `EU_433`, `US_433`/`US_433_WIDE`. *(src: `src/include/targets.h`
  L49–66; `src/python/binary_configurator.py::domain_number`)*

### Model match
- A per-model **Model ID** is sent from the TX; the RX only accepts control if its stored Model
  ID matches (when Model Match is enabled). `config.SetModelId(payload[2])` is set from a CRSF
  command on the RX; `connectionHasModelMatch` gates the link and is surfaced to EdgeTX in link
  stats. *(src: `RXEndpoint.cpp` L41, `src/src/rx_main.cpp` L413; config in
  `src/lib/CONFIG/config.h` `GetModelMatch`/`SetModelId`)*
- Purpose: prevents flying the wrong airframe with the wrong model config. On mismatch the RX
  blinks 3× fast and refuses to connect ("Model Mismatch").

### Telemetry path & link statistics
- Telemetry is the **downlink** (aircraft→radio), interleaved with RC at a configurable
  **telemetry ratio** (1:2 … 1:128, plus Off). The downlink carries FC sensor frames AND the
  MSP responses (see §2/§6).
- **Link statistics** `CRSF_FRAMETYPE_LINK_STATISTICS (0x14)`: uplink RSSI ant1/ant2, **uplink
  LQ (%)**, uplink SNR, active antenna, RF mode, **uplink TX power (enum)**, downlink RSSI,
  downlink LQ, downlink SNR (ELRS adds downlink RSSI ant2). These become the `1RSS/2RSS/RQly/RSNR/
  TPWR/TRSS/RxBt` sensors in EdgeTX. *(src: `crsf_protocol.h` `crsfPayloadLinkstatistics_s` /
  `elrsLinkStatistics_s`)*

---

## 2. MSP over CRSF (the critical pipe)

ELRS tunnels **MSP** (the MultiWii Serial Protocol used by Betaflight/Rotorflight) through the
CRSF bus, end-to-end: radio Lua/EdgeTX → TX module → OTA → RX → FC, and the FC's MSP response
comes back the same way. This is the mechanism a Betaflight/Rotorflight TX Lua configurator uses
to read and write FC settings from the radio with no PC. **It is OpenBar's setup-wizard pipe.**

### How the tunnel works (from source)
MSP frames (`$M<…`/`$X<…`, V1/V1-Jumbo/V2) are **fragmented into CRSF chunks** and reassembled.

- **TX/downward (`MSP2CROSSFIRE`, `src/lib/CRSF2MSP/msp2crsf.cpp`):** an MSP frame is split into
  chunks of up to **`CRSF_MSP_MAX_BYTES_PER_CHUNK = 57` bytes** (`crsfmsp_common.h`). Each CRSF
  carrier frame has a **status byte** holding a **4-bit sequence number**, a **new-frame bit
  (bit 4)**, a 2-bit MSP-version field (bits 5–6), and an **error bit (bit 7)**.
- **RX/reassembly (`CROSSFIRE2MSP`, `src/lib/CRSF2MSP/crsf2msp.cpp`):** validates monotonic
  sequence (`(prev+1) & 0b1111`); on **sequence gap or error bit it resets and drops the whole
  in-flight MSP frame** (`if ((!newFrame && seqError) || error) { reset(); return; }`). It
  appends the MSP checksum (XOR for V1, CRC8/0xD5 for V2) and emits the completed frame.
- **Max MSP frame size:** `MSP_FRAME_MAX_LEN = 512` bytes (`crsfmsp_common.h`). Larger payloads
  are not supported by the tunnel buffer.

### The asymmetry that matters most (uplink vs downlink)
Three distinct CRSF MSP frame types, with **very different size budgets**:
- `CRSF_FRAMETYPE_MSP_REQ  = 0x7A` — request (uses MSP sequence as command)
- `CRSF_FRAMETYPE_MSP_RESP = 0x7B` — **reply with 58-byte chunked binary** (downlink, roomy)
- `CRSF_FRAMETYPE_MSP_WRITE = 0x7C` — **write with 8-byte chunked binary** — the source comment
  states the reason explicitly: *"(OpenTX outbound telemetry buffer limit)"*.
  *(src: `crsf_protocol.h` L84–90; also `CRSF_MSP_REQ_PAYLOAD_SIZE 8` /
  `CRSF_MSP_RESP_PAYLOAD_SIZE 58`)*

So **reads from the FC come back in 58-byte chunks**, but **writes to the FC from the radio go
out in 8-byte chunks** because of the radio-side (OpenTX/EdgeTX) outbound telemetry buffer. A
large "save settings" MSP write therefore takes **many** 8-byte fragments, each riding the
RC/telemetry frame cadence.

### Throughput / reliability reality (cite explicitly)
- **Shared, rate-limited budget.** MSP rides the same telemetry slots as link stats and FC
  sensors, gated by the **telemetry ratio**. The ELMAVLink docs give the order of magnitude of
  what the whole downlink can carry: **~4000 bps on dual-band (K1000)**, and **~400 bps on
  single-band 900 MHz** at any usable rate — at which "parameter downloading takes 2+ minutes."
  MSP shares this same pipe. *(src: expresslrs.org/software/mavlink)*
- **Half-duplex, request/response, lockstep.** Each MSP read/write is an exchange; you cannot
  flood writes. Throughput is bounded by (telemetry-slot frequency × 8 bytes per write chunk).
- **No retransmit at the tunnel layer.** A single corrupted/dropped CRSF chunk (`error` or
  `seqError`) **discards the entire in-flight MSP frame** — the upper layer (Lua/configurator)
  must time out and retry. Under marginal LQ, large transfers stall.
- **Practical mitigation (community/docs):** raise telemetry ratio to **1:4 or 1:2** before bulk
  config, ensure the radio shows **>10 telemetry sensors** before launching a configurator,
  avoid the highest packet rates during config (they shrink the telemetry budget), and never
  push config while armed (can desync → failsafe). *(src: WebSearch — Betaflight TX Lua / ELRS
  troubleshooting)*

**Bottom line for OpenBar:** full OTA FC configuration is viable (it is the existing Betaflight
CMS/configurator workflow), but treat the pipe as a **slow, lossy serial line**: chunk
everything, expect 8-byte uplink writes, drive a robust request/response state machine with
timeouts + retries, show progress, and pick a telemetry-ratio/packet-rate profile during setup
that prioritizes throughput over RC latency. Do NOT assume USB-class bandwidth.

---

## 3. Binding & onboarding today

### Binding phrase vs traditional bind
- **Binding phrase (recommended):** A text string compiled/flashed into both TX and RX. The UID
  is derived as **the first 6 bytes of `md5("-DMY_BINDING_PHRASE=\"<phrase>\"")`**
  *(src: `src/python/binary_configurator.py` L43; `src/python/build_flags.py` L40/L72)*. Any TX
  and RX flashed with the same phrase are **automatically bound — no bind procedure** ("bind and
  go"). Docs recommend ≥8 alphanumeric chars (e.g. your pilot handle).
- **Traditional bind:** Only works if the RX has **no** phrase. Power-cycle RX 3× to enter bind
  (double-blink), press **[Bind]** in the Lua script; the TX sends its master UID over MSP
  (`SendUIDOverMSP()` → `MSP_ELRS_BIND` + 4 UID bytes) at the locked **binding rate** (50 Hz,
  inverted IQ). *(src: `src/src/tx_main.cpp` L995–1029)*
- A blank phrase = UID all-zeros = "unbound." On the RX, a non-bound or matching UID triggers
  `EnterBindingMode()`. *(src: `config.cpp` L19; `rx_main.cpp` L1639+)*

### Where beginners get confused (smooth these in OpenBar)
1. **"Bind button does nothing."** A phrase-equipped RX **will not** enter manual bind, no matter
   how many power cycles — you must reflash without a phrase. Big footgun. *(docs: binding)*
2. **Region/domain mismatch.** Domain is **compile-time** and region-locked; a 915 MHz RX won't
   talk to an 868 MHz TX. Beginners flash the wrong target.
3. **Model Match surprises.** Enabling Model Match then changing the radio's model selection makes
   a previously-working aircraft show "Model Mismatch" / refuse to connect.
4. **Telemetry-not-showing.** CRSF needs a **full, uninverted, full-duplex UART pair** to the FC;
   half-wired/inverted UARTs give RC but no telemetry/MSP. *(WebSearch: configuring-fc)*
5. **Flashing/updating sprawl.** Multiple update paths (WebUI over WiFi, ExpressLRS Configurator,
   Betaflight passthrough, BetaflightConfigurator). TX and RX **must run matching/compatible
   firmware**; OTA version mismatch breaks the link.
6. **Failsafe setup** lives partly on the RX (PWM failsafe modes: set-position / no-pulse /
   last-position — `eServoOutputFailsafeMode`) and partly in the FC; beginners don't know which
   owns what. *(src: `common.h` `eServoOutputFailsafeMode`/`eFailsafeMode`)*
7. **AUX/switch config** — switch mode (Hybrid/Wide), arming channel, AUX mapping — is split
   between the ELRS Lua menu and the FC's modes tab.

---

## 4. Configuring ELRS itself (can OpenBar fold it into one wizard?)

- **Yes, via the CRSF parameter system** (not MSP). The on-radio `elrs.lua` script walks the TX
  module's parameter tree using `DEVICE_PING/PARAMETER_SETTINGS_ENTRY/READ/WRITE` and renders a
  folder/field UI. *(src: `src/lua/elrs.lua`; `RXEndpoint.cpp` handles 0x28/0x2C/0x2D)*
- **Settable from Lua:** Packet Rate, Telemetry Ratio, RF band, **TX Power** + Dynamic Power,
  Switch Mode (Hybrid/Wide), Antenna mode (Gemini/single/switching), **Model Match**, Link Mode
  (Normal/MAVLink), VTX admin, Backpack/WiFi, RX protocol selection, bind storage, Team Race.
  *(docs: lua-howto)*
- **Two separate control planes.** ELRS-link settings use **CRSF parameters**; FC settings use
  **MSP-over-CRSF**. OpenBar **can present one unified wizard**, but under the hood it must speak
  *both* protocols on the same CRSF bus (different frame types, different endpoints/addresses).
- **Caveat:** changing Packet Rate or Switch Mode forces a **link renegotiation / brief
  disconnect**; changing settings while armed can desync → failsafe. OpenBar's wizard should
  sequence link-layer changes first (and out of armed state), then FC config.

---

## 5. Telemetry to EdgeTX (for OpenBar dashboards)

Sensors that surface in EdgeTX (from CRSF frame types in `crsf_protocol.h`), all over the
telemetry-ratio-limited downlink:
- **Link stats** (`0x14`): `1RSS`,`2RSS` (uplink RSSI dBm), `RQly` (uplink LQ %), `RSNR`, `ANT`,
  `RFMD`, `TPWR` (TX power), `TRSS`/downlink RSSI, downlink LQ, downlink SNR.
- **Battery** (`0x08`): voltage, current, capacity, remaining %.
- **GPS** (`0x02`/`0x03`): lat/lon, groundspeed, heading, altitude, sats; GPS time.
- **Attitude** (`0x1E`): pitch/roll/yaw (rad×10000).
- **Baro/Vario** (`0x09`/`0x07`): altitude, vertical speed.
- **Flight mode** (`0x21`): 16-char string.
- **RPM** (`0x0C`, up to 19 sources), **Temp** (`0x0D`, up to 20), **Cells** (`0x0E`, up to 29),
  **Airspeed** (`0x0A`), **Heartbeat** (`0x0B`).

These give OpenBar dashboards link health (RSSI/LQ/SNR), pack voltage/current, attitude, and —
relevant for helis — RPM and ESC/FC temperatures, all without extra wiring. Note: richer sensors
(many RPM/temp sources) consume more downlink budget and compete with MSP config traffic.

---

## 6. What OpenBar must orchestrate at the link layer for bind-and-go

1. **Pair via binding phrase by default.** Generate/derive the UID
   (`md5("-DMY_BINDING_PHRASE=\"<phrase>\"")[0:6]`) and flash both TX and RX with the same phrase
   so binding is automatic — no manual bind step. Treat the phrase like a household secret.
2. **Verify region/domain match before anything else** (compile-time domain is the #1 silent
   failure). Refuse to proceed on 915/868/2.4 mismatch with a clear message.
3. **Confirm link is up + healthy** using link-stat sensors (LQ%, RSSI) before opening the config
   pipe; require a minimum sensor count (community heuristic: >10 sensors present).
4. **Set a "config profile" on the ELRS link** via CRSF parameters: raise **telemetry ratio
   (1:2/1:4)**, choose a packet rate with enough telemetry budget, ensure unarmed — *then* start
   FC config. Restore the user's flying profile afterward.
5. **Drive FC config over MSP-over-CRSF** with a robust chunked state machine: 8-byte uplink
   writes, 58-byte downlink reads, sequence/error handling, per-frame timeout + retry, and a
   progress UI. Keep individual MSP frames ≤512 B.
6. **Wire/validate the CRSF UART** (full-duplex, uninverted) RX↔FC; detect "RC works but no
   telemetry/MSP" and guide the fix.
7. **Manage failsafe + AUX/switch + Model Match coherently** across the ELRS link (RX failsafe
   mode, switch mode, model ID) and the FC (modes, failsafe stage), so the user sets each once.
8. **Sequence link-layer changes safely** (packet rate / switch mode cause reconnects; never
   change while armed).
9. **Handle firmware compatibility** — check TX/RX/OTA versions match before relying on the pipe;
   offer a guided update path.

---

## 7. MSP-over-CRSF constraints — called out explicitly

| Constraint | Value / behavior | Source |
|---|---|---|
| Uplink write chunk (radio→FC) | **8 bytes/chunk** ("OpenTX outbound telemetry buffer limit") | `crsf_protocol.h` L87; `CRSF_MSP_REQ_PAYLOAD_SIZE 8` |
| Downlink read chunk (FC→radio) | **58 bytes/chunk** | `crsf_protocol.h` L86; `CRSF_MSP_RESP_PAYLOAD_SIZE 58` |
| Internal CRSF MSP chunk payload | **57 bytes** (`CRSF_MSP_MAX_BYTES_PER_CHUNK`) | `crsfmsp_common.h` L10 |
| Max MSP frame | **512 bytes** (`MSP_FRAME_MAX_LEN`) | `crsfmsp_common.h` L12 |
| CRSF max packet | **64 bytes** | `crsf_protocol.h` L29 |
| Reassembly sequence | **4-bit** seq; gap/error → **whole frame dropped, no retransmit** | `crsf2msp.cpp` L18–27 |
| MSP versions tunneled | V1, V1-Jumbo, V2 (checksum XOR / CRC8-0xD5) | `crsf2msp.cpp` `getChecksum` |
| Bandwidth (whole downlink, incl. MSP) | **~4000 bps dual-band**, **~400 bps 900 MHz**; 900 MHz param load "2+ min" | docs/mavlink |
| Pacing | Half-duplex, gated by **telemetry ratio** (1:2…1:128) | docs/lua-howto |
| Failure modes | marginal LQ stalls big transfers; config-while-armed → desync/failsafe | WebSearch (troubleshooting) |

---

## Sources

**Repository** (shallow clone `master`, `/tmp/openbar-research/elrs`):
- `src/include/crsf_protocol.h` — CRSF frame types, addresses, MSP_REQ/RESP/WRITE sizes, link
  stats struct, telemetry sensor structs, channel scaling.
- `src/lib/CRSF2MSP/crsfmsp_common.h` — chunk/frame-size constants (57/512), MSP version enum.
- `src/lib/CRSF2MSP/msp2crsf.cpp` — MSP→CRSF fragmentation (chunking, seq/new-frame/version bits).
- `src/lib/CRSF2MSP/crsf2msp.cpp` — CRSF→MSP reassembly, sequence/error handling, checksums.
- `src/lib/CrsfProtocol/CRSFRouter.*`, `CRSFEndpoint.h` — bus routing/addressing.
- `src/lib/rx-crsf/RXEndpoint.cpp` — RX handling of bind cmd, MSP_RESP/WRITE (VTX), parameter
  read/write, Model ID set.
- `src/src/tx_main.cpp` — `EnterBindingMode`, `SendUIDOverMSP` (`MSP_ELRS_BIND`), sync packet,
  rate locking.
- `src/src/rx_main.cpp` — binding from config, model match in link stats.
- `src/lib/CONFIG/config.{h,cpp}` — Model Match/Model ID, UID/binding-phrase storage, bind
  storage modes.
- `src/include/common.h` — RATE_MAX per radio chip, RATE_BINDING, failsafe/serial/AUX enums.
- `src/include/targets.h` — regulatory domain definitions.
- `src/python/binary_configurator.py`, `src/python/build_flags.py` — binding-phrase→UID via MD5,
  domain numbering.
- `src/lua/elrs.lua` — on-radio ELRS settings UI over CRSF parameters.

**Official docs / web:**
- https://www.expresslrs.org/quick-start/binding/ — binding phrase vs traditional, model match,
  beginner footguns.
- https://www.expresslrs.org/software/mavlink/ — downlink bandwidth (~4000 bps dual-band /
  ~400 bps 900 MHz), telemetry-ratio forcing, "2+ minutes" param load.
- https://www.expresslrs.org/quick-start/transmitters/lua-howto/ — Lua-settable parameters,
  CRSF-parameter communication, apply-on-disconnect behavior.
- https://www.expresslrs.org/quick-start/receivers/configuring-fc/ — CRSF needs full-duplex
  uninverted UART pair.
- https://www.expresslrs.org/quick-start/troubleshooting/ — telemetry-ratio mitigation, >10
  sensors before launching configurators.
- https://oscarliang.com/setup-expresslrs-2-4ghz/ — flashing/setup walkthrough (community).
- https://github.com/ExpressLRS/ExpressLRS/discussions/3066 — Lua↔FC MSP communication discussion.

---

## Uncertainties / to verify on hardware
- **Exact effective MSP throughput** for a full Rotorflight config dump is not documented as a
  single number; the 4000/400 bps figures are MAVLink-mode references for the shared downlink —
  treat as order-of-magnitude for MSP too, and **measure on real hardware** with target packet
  rate + telemetry ratio.
- **Whether the 8-byte uplink write limit still holds on current EdgeTX** (the comment cites
  "OpenTX"); EdgeTX may have changed the outbound telemetry buffer. **Verify against EdgeTX
  source** before sizing OpenBar's write batches.
- **Rotorflight-specific MSP coverage** (vs Betaflight) over CRSF — confirm Rotorflight's MSP
  command set and any larger payloads are within the 512-byte frame limit.
- **Lua/parameter-system rate limits** for bulk ELRS-link config aren't quantified here.
