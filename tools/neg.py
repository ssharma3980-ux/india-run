import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=60000)
        await pg.evaluate("game.renderer.setAnimationLoop(null)")
        for t in range(4):
            r = await pg.evaluate("""(()=>{game.data.settings.tutorial=false; IR.ui.hideAll(); game.startRun('city'); let n=0; while(game.state==='playing'&&n++<20000){ game.updatePlay(1/60);} 
              const o = game.run.obstacles.filter(o=>Math.abs(o.d-game.p.d)<3).map(o=>o.type+':'+o.lanes); return {state:game.state,cause:game.p.cause,d:Math.round(game.p.d),L:game.run.L,near:o, lane:game.p.laneI}; })()""")
            print(json.dumps(r))
            await pg.evaluate("clearInterval(IR.ui.rvTimer); game.state='menu'")
        await b.close()
asyncio.run(main())
