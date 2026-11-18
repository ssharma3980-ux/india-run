# India Run on itch.io: page kit

## Create the page (itch.io → Dashboard → Create new project)
| Field | Value |
|---|---|
| Title | India Run: Legends of Bharat |
| Project URL | india-run |
| Short description | Run through 15 Indian cities, monuments and festivals! |
| Classification | Games |
| Kind of project | HTML (playable in browser) |
| Pricing | No payments |
| Uploads | `india-run-web.zip` → tick "This file will be played in the browser" · `india-run.apk` → tick Android |
| Embed options | Viewport 412 × 800 (mobile friendly), tick "Mobile friendly" (orientation: portrait), tick "Fullscreen button" |
| Genre | Action |
| Tags | endless-runner, 3d, india, casual, mobile, family-friendly, runner, culture |
| Cover image | `cover_630x500.png` |
| Screenshots | `shot2_agra.png`, `shot5_diwali.png`, `shot1_menu.png`, `shot7_passport.png`, `shot4_hyderabad.png` |
| Visibility | Public |

## Description (paste)
Run through the heart of India! 🇮🇳

INDIA RUN: Legends of Bharat is a 3D endless runner set in 15 real Indian cities: Varanasi, Delhi, Agra, Jaipur, Mumbai, Amritsar, Kashmir, Udaipur, Ahmedabad, Hyderabad, Kolkata, Bengaluru, Chennai, Kochi and Puri.

🏛️ Run past monuments inspired by the Taj Mahal, India Gate, Qutub Minar, Charminar, Gateway of India and Hawa Mahal, and learn a fact about each city.
🪔 Festival runs: Diwali, Holi, Navratri, Uttarayan and Onam.
⚡ Indian power-ups: peacock-feather magnet, laddoo double coins, dhol multiplier, kite glide, shield and the Rath.
💎 3 hidden treasures in every city.
🏃 10 runners, including a horse, camel, deer and dog.
👥 Challenge a friend with a ghost-race link, or play Pass & Play on one phone.
📅 Daily challenges and rewards.

Controls: swipe (or arrow keys) left/right to change lanes, up to jump, down to slide.
Android: download the APK below. Works offline, no ads, no sign-in.

Made in India by Saurabh Eduverse.

## Automatic updates (optional)
1. itch.io → Settings → API keys → Generate new API key.
2. GitHub → india-run repo → Settings → Secrets and variables → Actions → add:
   - `BUTLER_API_KEY` = that key
   - `ITCH_GAME` = `your-itch-username/india-run`
3. Every new build on GitHub then uploads the web game and APK to itch.io by itself.
