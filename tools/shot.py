import asyncio, sys, json
from playwright.async_api import async_playwright
URL = 'file:///home/claude/india-run/dist/india-run.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':412,'height':860}, device_scale_factor=1)
        errs=[]
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        await pg.goto(URL)
        
        for i in range(40):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!document.querySelector('#bPlay')"): print("ready after",i+1,"s"); break
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/s_menu.png')
        print('\n'.join(errs[:20])); print(await pg.evaluate("document.querySelector('#loading small').textContent"))
        if not await pg.evaluate("!!document.querySelector('#bPlay')"): return
        await pg.evaluate("document.querySelector('#bPlay').click()")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/tmp/s_run1.png')
        await pg.wait_for_timeout(2000)
        await pg.screenshot(path='/tmp/s_run2.png')
        st = await pg.evaluate("({state:game.state, d:game.p.d, dist:game.p.dist, fps:game.fps, cause:game.p.cause, coins:game.p.coins, calls:game.renderer.info.render.calls, tris:game.renderer.info.render.triangles})")
        print(json.dumps(st))
        print('\n'.join(errs[:20]))
        await b.close()
asyncio.run(main())
