import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=90000)
        await pg.evaluate("game.renderer.setAnimationLoop(null); game.data.settings.tutorial=false; game.data.settings.allCities=true")
        for city in ['delhi','hyderabad','mumbai','agra','jaipur','kolkata','bengaluru','udaipur']:
            await pg.evaluate(f"""(()=>{{ game.data.city='{city}'; IR.ui.hideAll(); game.startRun('city',{{city:'{city}'}}); const r=game.run; game.p.d = r.mon.d - (r.mon.side===0 ? 38 : 30); game.p.dist=game.p.d;
              for(let k=0;k<60;k++){{ game.updateVisuals(1/60); game.world.process(80);}} game.state='menu';
              const R=game.runner.root, c=game.camera; const fx=-Math.sin(r.yaw), fz=-Math.cos(r.yaw); const side=r.mon.side;
              c.position.set(R.position.x - fx*6, 3.2, R.position.z - fz*6); 
              const t=new THREE.Vector3(); game.world.toWorld(r, r.mon.d, side*30, side? 12:14, t); c.lookAt(t); c.fov=70; c.updateProjectionMatrix(); document.getElementById('cityBanner').classList.remove('on'); game.render(); }})()""")
            await pg.screenshot(path=f'/tmp/mon_{city}.png')
        await b.close()
asyncio.run(main())
