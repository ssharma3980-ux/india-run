import asyncio, json, sys
from playwright.async_api import async_playwright
BOT = open('/home/claude/india-run/tools/sim.py').read().split('BOT = r"""')[1].split('"""')[0]
BOT += r"""
window.runTo = (meters) => {
  const L = IR.LANES; let guard = 0, deaths = [];
  while (game.p.dist < meters && guard++ < 100000) {
    const p = game.p, r = game.run;
    if (game.state === 'dying') { deaths.push(p.cause + '@' + Math.round(p.d) + ' ' + r.theme.id); game.data.coins += 99999; game.state = 'revive'; game.revive(); continue; }
    if (game.state !== 'playing') break;
    if (p.d > r.L - 9 && !p.turnQ) game.action(r.turn < 0 ? 'left' : 'right');
    const ahead = r.obstacles.filter(o => !o.cleared && o.d - p.d > -0.6 && o.d - p.d < 16).sort((a, b) => a.d - b.d);
    for (const o of ahead) {
      const dd = o.d - p.d - (o.depth || 0) / 2, my = p.laneI;
      if (o.type === 'block' && o.lanes.includes(my) && dd < 14) { const bl = new Set(r.obstacles.filter(q => Math.abs(q.d - o.d) < 1 && q.type === 'block' && !q.cleared).flatMap(q => q.lanes)); const f = [0,1,2].filter(l => !bl.has(l)).sort((a,b)=>Math.abs(a-my)-Math.abs(b-my))[0]; if (f !== undefined && f !== my) game.action(f < my ? 'left' : 'right'); break; }
      if (!(o.lanes.includes(my) || o.type === 'gap')) continue;
      if ((o.type === 'hurdle' || o.type === 'gap') && dd < p.speed * 0.16 + 0.4 && p.grounded) { game.action('up'); break; }
      if (o.type === 'banner' && dd < p.speed * 0.12 + 0.5 && p.slideT <= 0.1) { game.action('down'); break; }
      break;
    }
    game.updatePlay(1/60); game.updateVisuals(1/60);
  }
  return { deaths, dist: Math.round(game.p.dist), tokens: game.p.tokens, treasures: game.p.treasures, facts: game.p.facts, city: game.run.theme.id, fest: game.festival, mon: game.run.mon ? game.run.mon.cfg.k + '@' + game.run.mon.d : null, d: Math.round(game.p.d) };
};
window.snap = () => { for (let k = 0; k < 20; k++) { game.updateVisuals(1/60); game.world.process(50); } document.getElementById('cityBanner').classList.remove('on'); game.render(); };
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=90000)
        await pg.evaluate("game.renderer.setAnimationLoop(null); game.data.settings.tutorial=false; game.data.settings.allCities=true"); await pg.add_script_tag(content=BOT)
        print('monuments loaded:', await pg.evaluate("Object.keys(IR.Monuments.models).length"))
        tests = [('delhi','diwali',[70, 300]), ('jaipur','holi',[55]), ('mumbai',None,[60]), ('agra','navratri',[55]), ('hyderabad','uttarayan',[80]), ('kolkata','onam',[50]), ('bengaluru',None,[45]), ('udaipur',None,[50])]
        for city, fest, stops in tests:
            mode = 'festival' if fest else 'city'
            await pg.evaluate(f"game.data.city='{city}'; IR.ui.hideAll(); game.startRun('{mode}', {{city:'{city}', festival:{json.dumps(fest)}}})")
            for i, m in enumerate(stops):
                r = await pg.evaluate(f"runTo({m})"); await pg.evaluate("snap()")
                await pg.screenshot(path=f'/tmp/v3_{city}_{i}.png'); print(city, fest, json.dumps(r))
            await pg.evaluate("clearInterval(IR.ui.rvTimer); game.state='menu'")
        # long yatra + daily + challenge link round trip
        await pg.evaluate("game.data.settings.allCities=false; game.data.city='varanasi'; IR.ui.hideAll(); game.startRun('yatra')")
        r = await pg.evaluate("runTo(1700)"); print('yatra', json.dumps(r), await pg.evaluate("JSON.stringify(game.data.unlocked)"))
        await pg.evaluate("game.gameOver()")
        link = await pg.evaluate("IR.mp.makeLink({v:1,n:'Saurabh',c:'varanasi',m:'yatra',f:null,s:game.runSeed,sc:Math.floor(game.p.score),ds:Math.floor(game.p.dist),ch:game.data.char})")
        print('link length', len(link))
        await pg.evaluate("document.querySelector('#bOHome').click()")
        info = await pg.evaluate(f"(()=>{{const i=IR.mp.parseLink('{link[link.index('#'):]}'); return {{n:i.n, s:i.s, g:i.ghost.length}}}})()"); print('parsed', info)
        await pg.evaluate(f"IR.ui.incoming(IR.mp.parseLink('{link[link.index('#'):]}'))"); await pg.evaluate("snap()"); await pg.screenshot(path='/tmp/v3_incoming.png')
        await pg.evaluate("document.querySelector('#bAcc').click()")
        r = await pg.evaluate("runTo(160)"); await pg.evaluate("snap()"); await pg.screenshot(path='/tmp/v3_ghost.png')
        print('ghost run', json.dumps(r), await pg.evaluate("({vis: IR.mp.ghost && IR.mp.ghost.runner.root.visible, lead: IR.mp.ghost && Math.round(IR.mp.ghost.lead)})"))
        await pg.evaluate("game.gameOver()"); await pg.evaluate("snap()"); await pg.screenshot(path='/tmp/v3_over.png')
        await pg.evaluate("game.toMenu()")
        for scr in ['passport','daily','multi']:
            await pg.evaluate(f"IR.ui.open('{scr}')"); await pg.evaluate("snap()"); await pg.screenshot(path=f'/tmp/v3_scr_{scr}.png'); await pg.evaluate("IR.ui.back()")
        # pass & play flow
        await pg.evaluate("IR.ui.open('multi'); document.querySelector('#bParty').click(); document.querySelector('#bGo').click()")
        await pg.evaluate("runTo(80); game.gameOver()"); await pg.evaluate("document.querySelector('#bPN').click(); document.querySelector('#bGo').click()")
        await pg.evaluate("runTo(120); game.gameOver()"); await pg.evaluate("snap()"); await pg.screenshot(path='/tmp/v3_party.png')
        print('party', await pg.evaluate("JSON.stringify(IR.mp.party.players)"))
        print('ERRORS', errs[:10]); await b.close()
asyncio.run(main())
