# INDIA RUN: Legends of Bharat

A 3D endless runner through Indian cities. Written in **JavaScript** (Three.js / WebGL), with **Python** build and test tools. It runs in any modern browser on Android, iOS and PC, and works offline as a single file.

**Characters:** real rigged 3D humans from the **Microsoft Rocketbox Avatar Library** (MIT licence — free for commercial use, see `assets/characters/ROCKETBOX_LICENSE.md`), animated with Rocketbox motion-capture clips (run, idle, crouch/slide, cheer). Each runner gets an Indian scarf/dupatta with cloth motion.

**Graphics:** physically based Preetham sky with volumetric-style clouds, sky-based image lighting, real-time reflective water (High), soft shadows, normal-mapped stone/wood/facades, bloom + cinematic colour grade, lens flare, rain/snow/dust particles. Quality adapts automatically to keep phones smooth.

Buildings, textures, music and sound effects are generated in code. Nothing is copied from Temple Run (no characters, levels, audio or branding).

## Play
- **Phone / PC:** open `dist/india-run.html` in Chrome, Edge or Safari.
- **Local server (lets you test on your phone over Wi-Fi):** `python serve.py`, then open the address it prints.

## Controls
| Action | Touch | Keyboard |
|---|---|---|
| Change lane / turn at a gate | Swipe ← → | ← → or A D |
| Jump | Swipe ↑ | ↑ / W / Space |
| Slide | Swipe ↓ | ↓ / S |
| Pause | ❚❚ button | P / Esc |

## Build
```
python build.py --check     # bundles src/ + three.js into dist/india-run.html and syntax-checks it (needs Node.js)
python tools/sim.py yatra varanasi 1000,2000   # headless bot plays the game fairly and takes screenshots (needs Playwright)
```

## Project structure
```
src/
  core/      util.js (RNG, geometry batcher), textures.js (procedural PBR textures),
             materials.js, audio.js (tabla/flute/santoor/sitar synth + SFX)
  world/     env.js (sky shader, sun + shadows, water, panorama, weather, birds)
             props.js (temples, havelis, chhatris, boats, stalls, trees, lamps, gates)
             themes.js (5 city themes + obstacle models), world.js (procedural track + 90° turns + streaming)
  entities/  avatar.js (Rocketbox 3D runners + mocap state machine), runner.js (procedural fallback)
  game/      game.js (controller, collisions, camera, power-ups), progress.js (save, missions, daily rewards, upgrades)
  ui/        ui.js, i18n.js (English / हिन्दी / ગુજરાતી), styles.css
vendor/      three-bundle.js (three.js r158 + addons, MIT — rebuilt from src/vendor-entry.js with `python build.py --vendor`)
assets/      characters/ (Rocketbox FBX + textures), anims/ (mocap clips)
build.py     bundler      serve.py   local/phone test server      tools/   Playwright test bots
```

## Features
- 15 playable cities, all unlocked: Varanasi, Agra, Delhi, Amritsar, Kashmir, Jaipur, Udaipur, Ahmedabad, Mumbai, Hyderabad, Bengaluru, Chennai, Kochi, Kolkata, Puri. The original 5: **Varanasi** (ghats, temples, boats, diyas), **Kashmir** (snow, Dal Lake boardwalk, shikaras, houseboats), **Jaipur** (pink havelis, bazaars), **Mumbai** (monsoon rain, sea drive, skyline), **Delhi** (red sandstone fort walls, markets). Each city has its own sky, weather, music scale, ambient sound and obstacles.
- Procedural track with 90° turns at gates, gaps with collapsing slabs, hurdles, overhead banners and lane blockers.
- Power-ups: Coin Magnet, Kavach Shield, Double Coins, Score x2, Vayu Boost, Patang (kite) Glider.
- Modes: Bharat Yatra (travel from city to city), City Run, Timed 2:00, Daily Challenge.
- Missions with a growing score multiplier, achievements, checkpoints every 1,000 m, a 7-day daily reward, an upgrade shop, unlockable characters and outfits, revive, and pause/resume.
- Graphics settings Low / Medium / High, plus a camera FOV slider.

## Runners (10, all free)
Humans (Rocketbox, MIT): Arjun, Meera, Kabir, Zoya, Rohan, Ayesha — mocap run/idle/crouch/cheer.
Animals (Rocketbox, MIT, procedural gallop): Sheru the Dog, Badal the Horse, Hiran the Deer, Raju the Camel.

## Adding a city
Add an entry to `src/world/cities2.js` (atmosphere, floor, panorama, music, obstacles, left/right/far builders) and list it in `IR.CITY_ORDER`.

## Play online (GitHub Pages)
This repository publishes itself: every push to `main` runs `.github/workflows/pages.yml`, which deploys `index.html` (the built game) to GitHub Pages.
One-time setup: repository **Settings → Pages → Source: GitHub Actions**. The game is then live at `https://<your-username>.github.io/india-run/`.
After changing code in `src/`, run `python build.py` and copy `dist/india-run.html` to `index.html` before pushing.
