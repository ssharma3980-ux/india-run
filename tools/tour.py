import asyncio, json, sys
from playwright.async_api import async_playwright
CITIES = sys.argv[1:] or ['varanasi','kashmir','jaipur','mumbai','delhi']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=60000)
        for city in CITIES:
            await pg.evaluate(f"game.data.city='{city}'; game.data.settings.tutorial=false; IR.ui.hideAll(); game.startRun('city'); game.p.invuln=1e9;")
            # bot: turn automatically & dodge nothing (invulnerable)
            await pg.evaluate("""window.bot && clearInterval(window.bot); window.bot=setInterval(()=>{const p=game.p,r=game.run; p.invuln=1e9; if(r && p.d>r.L-10 && !p.turnQ) game.action(r.turn<0?'left':'right');},100)""")
            await pg.wait_for_timeout(3500)
            await pg.screenshot(path=f'/tmp/t_{city}_a.png')
            await pg.wait_for_timeout(9000)
            await pg.screenshot(path=f'/tmp/t_{city}_b.png')
            st = await pg.evaluate("({city:game.run.theme.id, turns:game.p.turns, dist:Math.round(game.p.dist), state:game.state, calls:game.renderer.info.render.calls, runs:game.world.runs.length, jobs:game.world.jobs.length})")
            print(json.dumps(st))
        print('\n'.join(errs[:10]))
        await b.close()
asyncio.run(main())
