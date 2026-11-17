import asyncio
from playwright.async_api import async_playwright
BOT = open('/home/claude/india-run/tools/sim.py').read().split('BOT = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':800,'height':500})
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=90000)
        await pg.evaluate("game.renderer.setAnimationLoop(null)"); await pg.add_script_tag(content=BOT)
        for i,d in enumerate([118, 150, 205]):
            await pg.evaluate(f"simBot('city','varanasi',{d},{'true' if i else 'false'})")
            for k in range(30): await pg.evaluate("game.updateVisuals(1/60); game.world.process(50)")
            await pg.evaluate("document.getElementById('ui').style.display='none'; game.render()")
            await pg.screenshot(path=f'/tmp/thumb_{i}.png')
        await b.close()
asyncio.run(main())
