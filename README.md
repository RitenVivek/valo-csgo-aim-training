# SIGHTLINE

A free, browser-based aim trainer built for Valorant players who want to warm up before queuing or sharpen a specific skill — flicks, tracking, peeking, or multi-target switches.

No installs, no accounts, no backend. Open `index.html` in a browser and start training.

![status](https://img.shields.io/badge/status-active-brightgreen) ![platform](https://img.shields.io/badge/platform-browser-blue) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Why this exists

Valorant rewards crosshair placement and clean micro-adjustments more than raw reflexes. SIGHTLINE isolates those skills into short, focused drills you can run before a session — instead of warming up in a deathmatch where bad habits and good ones train side by side.

## Drills

| Drill | Trains | How it works |
|---|---|---|
| **Flickshot** | Raw flick accuracy | Static targets spawn one at a time — flick, click, reset |
| **Tracking** | Smooth crosshair control | A single target drifts and strafes — keep your crosshair glued to it |
| **Peek Reaction** | Reflexes & trigger discipline | Targets pop from cover on either side; some are decoys — don't flinch-click |
| **Target Switch** | Multi-target speed | Several targets live on screen at once — clear them fast and in order |

Each drill tracks accuracy, reaction time, and score, and saves your personal bests locally so you can see progress run over run.

## Crosshair styles

Pick from four built-in crosshairs — **Cross**, **Dot**, **Asterisk**, and **Reticle** — from the nav bar or the in-trainer settings panel. Your choice is saved automatically.

## Settings

Inside any drill, the ⚙ settings panel lets you adjust:
- **Target size** — make drills easier or harder
- **Spawn speed** — how fast targets appear/move
- **Session length** — 15 to 60 second rounds

## Suggested routine

1. **Warm up (3 min)** — Flickshot, low target count, prioritize clean first shots over speed
2. **Build control (4 min)** — Tracking, smooth low-sens corrections
3. **Apply in context (5 min)** — Peek Reaction or Target Switch to bring it into duel-like pressure

Then queue up.

## Tech

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step. Stats and crosshair preference persist via `localStorage`.

## Roadmap ideas

- [ ] Sensitivity-matching calibration step
- [ ] Adjustable crosshair color/size
- [ ] Session history graph over time
- [ ] Additional drill: strafe-aim hybrid

## Disclaimer

SIGHTLINE is an independent fan-made training tool and is not affiliated with or endorsed by Riot Games.

## License

MIT — use it, fork it, modify it.
