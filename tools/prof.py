import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        pg.on('console', lambda m: print(m.type, m.text[:300]))
        pg.on('pageerror', lambda e: print('PAGEERR', e))
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        for i in range(12):
            await pg.wait_for_timeout(2000)
            print(i, await pg.evaluate("(document.querySelector('#loading .bar i')||{}).style?.width + ' ' + (window.game&&game.state)"))
        await b.close()
asyncio.run(main())
