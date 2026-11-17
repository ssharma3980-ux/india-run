import asyncio, sys
from playwright.async_api import async_playwright
BOT = open('/home/claude/india-run/tools/sim.py').read().split('BOT = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=90000)
        await pg.evaluate("game.renderer.setAnimationLoop(null)"); await pg.add_script_tag(content=BOT)
        for i,ch in enumerate(sys.argv[1].split(',')):
            await pg.evaluate(f"game.data.char='{ch}'; game.data.outfit=0")
            r = await pg.evaluate(f"simBot('city','varanasi',{40+i*7})")
            # side camera to inspect gait
            await pg.evaluate("""(()=>{ for(let k=0;k<8;k++){game.updatePlay(1/60);} const R=game.runner.root, c=game.camera; game.updateVisuals(1/60); const yaw=game.run.yaw; c.position.set(R.position.x+Math.cos(yaw)*4.2, 1.2, R.position.z-Math.sin(yaw)*4.2); c.lookAt(R.position.x,0.8,R.position.z); game.render(); })()""")
            await pg.screenshot(path=f'/tmp/an_{ch}.png'); print(ch, r['deaths'], r['dist'])
        print(errs[:5]); await b.close()
asyncio.run(main())
