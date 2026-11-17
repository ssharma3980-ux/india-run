#!/usr/bin/env python3
"""INDIA RUN build tool.

Bundles the JavaScript sources, the stylesheet and three.js into ONE offline
HTML file (dist/india-run.html) that runs on Android, iOS and desktop browsers.

    python build.py          # build
    python build.py --check  # build + JavaScript syntax check (needs Node.js)
"""
import base64, os, pathlib, subprocess, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
ORDER = [
    "core/util.js", "core/textures.js", "core/materials.js", "core/audio.js",
    "world/env.js", "world/props.js", "world/themes.js", "world/cities2.js", "world/culture.js", "world/world.js",
    "entities/runner.js", "entities/avatar.js",
    "game/progress.js", "game/multiplayer.js", "game/game.js",
    "ui/i18n.js", "ui/i18n2.js", "ui/ui.js",
    "main.js",
]


def vendor():
    """three.js + addons (FBXLoader, Sky, Water, post-processing) -> vendor/three-bundle.js"""
    out = ROOT / "vendor" / "three-bundle.js"
    if out.exists() and "--vendor" not in sys.argv:
        return out
    exe = ROOT / "node_modules" / ".bin" / ("esbuild.cmd" if os.name == "nt" else "esbuild")
    subprocess.run([str(exe), "src/vendor-entry.js", "--bundle", "--minify", "--format=iife",
                    "--legal-comments=none", f"--outfile={out}"], cwd=ROOT, check=True)
    return out


def assets_js():
    """Embed characters, textures and mocap clips as base64 so the game is one offline file."""
    base = ROOT / "assets"
    parts = []
    for f in sorted(base.rglob("*")):
        if f.suffix.lower() in (".fbx", ".jpg", ".png", ".json", ".glb"):
            rel = f.relative_to(base).as_posix()
            parts.append(f'"{rel}":"{base64.b64encode(f.read_bytes()).decode()}"')
    return "IR.ASSETS={" + ",\n".join(parts) + "};"


def build():
    three = vendor().read_text(encoding="utf-8")
    css = (SRC / "ui" / "styles.css").read_text(encoding="utf-8")
    game_js = "\n".join(f"/* ==== {f} ==== */\n" + (SRC / f).read_text(encoding="utf-8") for f in ORDER)
    html = (SRC / "index.template.html").read_text(encoding="utf-8")
    html = html.replace("<!--STYLE-->", f"<style>\n{css}\n</style>")
    esc = lambda s: s.replace("</script", "<\\/script")
    assets = "window.IR=window.IR||{};" + assets_js()
    scripts = (f"<script>/* three.js r158 + addons (MIT) */\n{esc(three)}\n</script>\n"
               f"<script>/* Microsoft Rocketbox avatars & mocap (MIT) */\n{assets}\n</script>\n"
               f"<script>\n{esc(game_js)}\n</script>")
    html = html.replace("<!--SCRIPTS-->", scripts)
    out = ROOT / "dist"
    out.mkdir(exist_ok=True)
    (out / "india-run.html").write_text(html, encoding="utf-8")
    (out / "game.js").write_text(game_js, encoding="utf-8")
    shutil.copy(out / "india-run.html", out / "index.html")
    kb = len(html.encode()) / 1024
    print(f"Built dist/india-run.html  ({kb:,.0f} KB, {len(ORDER)} modules)")
    return out


def check(out):
    node = shutil.which("node")
    if not node:
        print("Node.js not found - skipping syntax check")
        return True
    r = subprocess.run([node, "--check", str(out / "game.js")], capture_output=True, text=True)
    print("Syntax check:", "OK" if r.returncode == 0 else r.stderr)
    return r.returncode == 0


if __name__ == "__main__":
    o = build()
    if "--check" in sys.argv and not check(o):
        sys.exit(1)
