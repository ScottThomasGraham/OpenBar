# New Model — factory reset that preserves RX + bind

_Design, 2026-06-03. Implementation lands with the Rotorflight MSP layer (heli on the bench)._

## Goal
"**New model**" wipes a flybarless unit back to **factory flight defaults** — PIDs, rates, mixer,
swashplate, servos, governor, filters — so the setup wizard starts from a clean slate. It must
**never** disturb the **receiver config or the bind**, so a heli that was bound stays bound.

## The two facts that make this safe
1. **The ELRS bind lives on the receiver, not in Rotorflight.** The bind phrase / link state is stored
   on the RX (ESP8285) firmware. Resetting Rotorflight's flight config can't unbind it. So binding
   survives any FC-side reset automatically.
2. **But a full Rotorflight reset wipes the receiver *config*** (protocol, channel map, serial-port
   assignment, RSSI/telemetry). `MSP_RESET_CONF` (208) → `resetEEPROM()` resets **all** parameter
   groups (`src/main/config/config.c:resetConfig`). So if we just reset, the heli stays *bound* but the
   FC no longer knows how to *read* the receiver — you'd have control loss until reconfigured.

## Recommended approach — snapshot → reset → restore
Surgical selective reset isn't exposed as one MSP call, so wrap the full reset:

1. **Pre-flight gate.** Refuse unless **disarmed** (`MSP_RESET_CONF` is ignored when `ARMING_FLAG(ARMED)`
   — msp.c:2434). Evora shows the motor-safe gate first, same as the wizard.
2. **Snapshot the link config** (MSP reads): `MSP_RX_CONFIG` (44), `MSP_RX_MAP` (64),
   `MSP_RSSI_CONFIG` (50), `MSP_CF_SERIAL_CONFIG` (serial port functions — keep the RX UART),
   `MSP_FEATURE_CONFIG` (36 — note RX_SERIAL / TELEMETRY feature bits).
3. **Reset:** `MSP_RESET_CONF` (208), `defaultsType = 0` (full). The FC reboots
   (`mspRebootFn`), so the link drops briefly.
4. **Reconnect**, then **restore the snapshot** (MSP writes): `MSP_SET_RX_CONFIG` (45),
   `MSP_SET_RX_MAP` (65), `MSP_SET_RSSI_CONFIG` (51), `MSP_SET_CF_SERIAL_CONFIG`, and re-enable the
   RX/telemetry features. Then `MSP_EEPROM_WRITE` (250) and a final reboot.
5. **Hand off to the wizard** at step 1 (Bind is already done → it auto-detects the link and skips
   to servo/heli setup).

Net effect: flight params = factory; receiver + bind = untouched.

## Alternative — selective per-group reset (more surgical, more work)
Instead of full-reset+restore, reset only the flight PGs to defaults and leave the link alone:
- Per PID profile (×4) and per rate profile (×4): the Configurator's profile/rate **Reset** buttons do
  this over MSP — replicate that.
- Reset the mixer / swashplate / servo / governor / filter PGs to their `pgResetFn` defaults via the
  relevant `MSP_SET_*` writes.
This avoids the reboot and the link round-trip, but requires reproducing every PG default. **Prefer
snapshot→reset→restore for v1** (simpler, and the defaults come straight from firmware).

## MSP commands (from `upstream/rotorflight/src/main/msp/msp_protocol.h`)
| Purpose | Read | Write |
|---|---|---|
| Reset config | — | `MSP_RESET_CONF` 208 |
| Save to EEPROM | — | `MSP_EEPROM_WRITE` 250 |
| Receiver config | `MSP_RX_CONFIG` 44 | `MSP_SET_RX_CONFIG` 45 |
| Channel map | `MSP_RX_MAP` 64 | `MSP_SET_RX_MAP` 65 |
| RSSI | `MSP_RSSI_CONFIG` 50 | `MSP_SET_RSSI_CONFIG` 51 |
| Serial ports | `MSP_CF_SERIAL_CONFIG` | `MSP_SET_CF_SERIAL_CONFIG` |
| Features | `MSP_FEATURE_CONFIG` 36 | `MSP_SET_FEATURE_CONFIG` |

## UI wiring (already in place)
Home → **New model** runs the wizard; the **reset is wizard step 0** ("start clean?"). The wizard's
existing motor-safe gate satisfies the disarmed pre-check. The discipline screens then show live
values (over MSP) as they're reconfigured. See [`menu-system.md`](menu-system.md).
