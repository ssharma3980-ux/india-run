import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=60000)
        await pg.evaluate("game.renderer.setAnimationLoop(null); IR.ui.open('chars')")
        for i in range(10):
            await pg.evaluate("for(let k=0;k<90;k++){game.updateVisuals(1/60);} game.render()")
            await pg.screenshot(path=f'/tmp/c_{i}.png')
            await pg.evaluate("IR.ui.charStep(1)")
        await b.close()
asyncio.run(main())
