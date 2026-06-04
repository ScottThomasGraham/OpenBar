# Evora — design gallery

Rendered mockups and real-firmware (simulator) screenshots from the design process.
HTML files are static mockups; `sim-*.png` are captures of the actual firmware in the EdgeTX simulator.

## Active — current instrument theme + sectioned menu
- `menu-vbar.{html,png}` — the VBar-style sectioned right-side menu (mockup) · `generate-menu.js`
- `sim-menu.png` — that menu running in firmware
- `sim-tune-main.png` — a Tuning page (Main rotor: PID + stick feel) in firmware
- `sim-home-instrument-restored.png` — the current home

## Design history (kept for reference — not the current look)

**12-concept exploration** (choosing a visual direction): `concept-01..12.html`, `sheet-A/B.{html,png}`, `generate.js`.

**Brutalist direction — built, then SHELVED 2026-06-03.** The owner preferred the original "aerospace
instrument" look after living with it; the full Brutalist build is preserved on branch
`Evora-TX@brutalist-theme`. Artefacts:
- finalist boards: `board-01/06/12.{html,png}` (+ per-screen `board-0X-{disc,drawer,edithub,flight}.html`)
- functional color system: `board-06x.{html,png}`, `board-06x-white.png`
- firmware renders: `sim-home-brutalist.png`, `sim-home-drawer-closed.png`, `sim-drawer-open.png`,
  `sim-discipline.png`, `sim-edithub.png`, `sim-home-final.png`, `spread.{html,png}` + `spread-*.png`
- generators: `generate2.js`, `generate3.js`

See [`../../STATUS.md`](../../STATUS.md) session log + the `evora-design-language` memory for the full theme history.
