import asyncio, json
from playwright.async_api import async_playwright
BOT = open('/home/claude/india-run/tools/sim.py').read().split('BOT = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=90000)
        await pg.evaluate("game.renderer.setAnimationLoop(null); game.data.char='raju'"); await pg.add_script_tag(content=BOT)
        r = await pg.evaluate("simBot('yatra','varanasi',4500)")
        print(json.dumps({k:r[k] for k in ['deaths','cities','dist','turns','state']})); print(await pg.evaluate("({cause:game.p.cause,d:game.p.d,L:game.run.L,theme:game.run.theme.id,speed:game.p.speed,x:game.p.x,lane:game.p.laneI,y:game.p.y,near:game.run.obstacles.filter(o=>Math.abs(o.d-game.p.d)<8).map(o=>[o.type,o.lanes,o.d,o.depth])})"))
        print(errs[:5]); await b.close()
asyncio.run(main())
