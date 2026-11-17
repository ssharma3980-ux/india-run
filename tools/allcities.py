import asyncio, sys
from playwright.async_api import async_playwright
BOT = open('/home/claude/india-run/tools/sim.py').read().split('BOT = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=90000)
        await pg.evaluate("game.renderer.setAnimationLoop(null)"); await pg.add_script_tag(content=BOT)
        cities = sys.argv[1].split(',')
        for c in cities:
            r = await pg.evaluate(f"simBot('city','{c}',{sys.argv[2] if len(sys.argv)>2 else 75})")
            for k in range(25): await pg.evaluate("game.updateVisuals(1/60); game.world.process(50)")
            await pg.evaluate("document.getElementById('cityBanner').classList.remove('on'); game.render()")
            await pg.screenshot(path=f'/tmp/city_{c}.png'); print(c, r['deaths'], r['dist'])
        print(errs[:8]); await b.close()
asyncio.run(main())
