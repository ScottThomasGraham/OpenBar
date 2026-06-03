# Upstream baselines & reference repos

_Last updated: 2026-06-02_

Evora rides three upstream projects. This doc records **exactly which version of each we
build against and why**, and how to keep a **pristine reference copy** of each so we can
diff our forks against clean upstream when things get sticky.

## The pins

| Element | Role in Evora | Upstream | Pinned baseline | Our fork |
|---|---|---|---|---|
| **EdgeTX** | Radio OS we fork (keep engine, replace GUI) | `edgetx/edgetx` | **`v2.12.1`** (commit `1511b3f29`) | `ScottThomasGraham/Evora-TX`, branch `evora` |
| **ExpressLRS** | Radio link, both ends (TX module + RX) we fork | `ExpressLRS/ExpressLRS` | **`3.6.3`** (`288efe1a`) — re-pinned from 4.0.1 on 2026-06-02, see below | `ScottThomasGraham/Evora-Link`, branch `evora` |
| **Rotorflight** | Flight controller — **untouched**, configured over the link via MSP | `rotorflight/rotorflight-firmware` | **`2.2.1`** (current stable; RF2 on Betaflight 4.3) | not forked — we ride it |

Rotorflight requires **CRSF ≥ 2.11 or ELRS ≥ 3.5.0**, so any ELRS 3.5+ satisfies the FC link.

## ⚠️ ExpressLRS version decision: re-pin 4.0.1 → 3.6.3

**Finding (researched 2026-06-02).** Evora Link is currently pinned to **ELRS 4.0.1**, which is
*newer* than what the community trusts. ELRS **4.0** is a stable release but a **major** one with
hard breaking changes:

- **Removed all STM32-based hardware** (R9M, ImmersionRC Ghost, ELRS PP).
- **SPI receivers: "do not update to 4.0 yet."** (Built-in FC receivers are often SPI.)
- **V4 only talks to V4** — both TX and RX must be on 4.x to connect (no cross-version link).
- Community guidance (Oscar Liang, IntoFPV): *if your gear works on 3.x, there's no reason to move
  to 4.0* — the upside is telemetry bandwidth + features, the downside is compatibility breakage.

The trusted stable line is **3.6.x**, with **3.6.3** the latest patch (it specifically fixed SPI
receiver connect/disconnect cycles, wifi/BT stability, and malformed-telemetry stalls). 3.6.1 was
pulled for a serious bug; 3.6.2/3.6.3 are the "recommended for everyone" patches.

**Our hardware** (see [`STATUS.md`](STATUS.md)): TX16S internal **2.4 GHz module (ESP32)** + FlyDragon
F722 **built-in RX (ESP8285 + SX1280)** — both ESP targets, so the STM32-removal doesn't hit us, and
the ESP8285 RX is a *serial* target rather than SPI. So 4.0 *might* work for us — but there is **no
upside today** (the private fast-config channel isn't built yet) and real downside (bleeding-edge,
narrower test base, must keep both ends matched on a young release).

**Recommendation: re-pin Evora Link to `3.6.3` now.** It's effectively **free** — the ELRS fork is
*branding-only so far*, nothing is built on 4.0.1 yet. 3.6.3 is SPI-safe, widely tested, satisfies
Rotorflight's ELRS ≥ 3.5 requirement, and supports our ESP targets. **Revisit 4.x later** once: (a)
our custom FlyDragon RX target is confirmed working, (b) we can measure whether V4's extra telemetry
bandwidth actually helps the private channel, and (c) 4.x has more field history.

> Status: **DONE (2026-06-02).** Evora-Link `evora` branch rebased onto the `3.6.3` tag (brand-only
> commits replayed clean; now `3.6.3-4-g548beb8d`). History was rewritten — push needs
> `--force-with-lease`. Revisit 4.x once the FlyDragon RX target is proven and V4 has matured.

## Reference repos (pristine upstream for diffing)

When a fork behaves oddly, the fastest way to localize the cause is to diff against **clean upstream
at our exact pin**. Keep those checkouts under `Evora/upstream/` (gitignored — not committed):

```bash
./references/fetch-references.sh        # shallow-clones each upstream at its pinned tag
```

This creates:
- `upstream/edgetx`        @ `v2.12.1`
- `upstream/expresslrs`    @ `3.6.3`  (or `4.0.1` until/unless we re-pin)
- `upstream/rotorflight`   @ `2.2.1`

To see exactly what Evora changed vs upstream, e.g.:
```bash
git -C forks/evora-tx diff v2.12.1..evora -- radio/src/gui   # our GUI replacement
diff -ru upstream/edgetx/radio/src/foo forks/evora-tx/radio/src/foo
```

## Updating a pin (procedure)

1. `git -C forks/<fork> fetch upstream --tags`
2. Branch from the new stable tag; rebase/cherry-pick the Evora diff (kept minimal-diff for exactly this).
3. Rebuild + re-run the Phase-0 flash/recovery drills **before** adopting.
4. Update the table above + `STATUS.md`, and bump the reference checkout.
