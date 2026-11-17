"""Headless gameplay simulation: a bot plays fairly (no invulnerability) using only
the visible obstacle layout. Validates turns, collisions, jumps/slides, coins, cities."""
import asyncio, json, sys
from playwright.async_api import async_playwright
BOT = r"""
window.simBot = (mode, city, meters, cont) => {
  if (!cont) { game.data.city = city; game.data.settings.tutorial = false; IR.ui.hideAll(); game.startRun(mode); }
  const L = IR.LANES, log = {deaths: [], cities: {}, frames: 0};
  let guard = 0;
  while (game.p.dist < meters && guard++ < 200000) {
    const p = game.p, r = game.run;
    log.cities[r.theme.id] = 1;
    if (game.state === 'dying') { log.deaths.push({cause: p.cause, d: Math.round(p.d), run: r.i, L: r.L, th: r.theme.id, v: Math.round(p.speed), lane: p.laneI, near: r.obstacles.filter(o => Math.abs(o.d - p.d) < 6).map(o => o.type + ':' + o.lanes + '@' + Math.round(o.d))}); game.data.coins += 99999; game.state = 'revive'; game.revive(); continue; }
    if (game.state === 'revive') { log.deaths.push({cause: p.cause, d: Math.round(p.d), run: r.i, L: r.L}); game.data.coins += 99999; game.revive(); continue; }
    if (game.state !== 'playing') break;
    if (p.d > r.L - 9 && !p.turnQ) game.action(r.turn < 0 ? 'left' : 'right');
    const ahead = r.obstacles.filter(o => !o.cleared && o.d - p.d > -0.6 && o.d - p.d < 16).sort((a, b) => a.d - b.d);
    const v = p.speed;
    for (const o of ahead) {
      const dd = o.d - p.d - (o.depth || 0) / 2;
      const myLane = p.laneI;
      if (o.type === 'block' && o.lanes.includes(myLane) && dd < 14) {
        const sameD = r.obstacles.filter(q => Math.abs(q.d - o.d) < 1 && !q.cleared);
        const blocked = new Set(sameD.filter(q => q.type === 'block').flatMap(q => q.lanes));
        const free = [0,1,2].filter(l => !blocked.has(l)).sort((a,b)=>Math.abs(a-myLane)-Math.abs(b-myLane))[0];
        if (free !== undefined && free !== myLane) game.action(free < myLane ? 'left' : 'right');
        break;
      }
      const inLane = o.lanes.includes(myLane) || o.type === 'gap';
      if (!inLane) continue;
      if ((o.type === 'hurdle' || o.type === 'gap') && dd < v * 0.16 + 0.4 && p.grounded) { game.action('up'); break; }
      if (o.type === 'banner' && dd < v * 0.12 + 0.5 && p.slideT <= 0.1) { game.action('down'); break; }
      break;
    }
    game.updatePlay(1 / 60); log.frames++;
    game.updateVisuals(1 / 60);
  }
  log.dist = Math.round(game.p.dist); log.coins = game.p.coins; log.turns = game.p.turns; log.jumps = game.p.jumps; log.slides = game.p.slides; log.score = Math.round(game.p.score); log.state = game.state; log.runs = game.world.runs.length;
  return log;
};
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':412,'height':860})
        errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        pg.on('console', lambda m: errs.append(m.text[:300]) if m.type=='error' else None)
        await pg.goto('file:///home/claude/india-run/dist/india-run.html')
        await pg.wait_for_function("!!document.querySelector('#bPlay')", timeout=60000)
        await pg.evaluate("game.renderer.setAnimationLoop(null)")
        await pg.add_script_tag(content=BOT)
        import sys as _s
        mode = _s.argv[1]; city=_s.argv[2]; stops=[int(x) for x in _s.argv[3].split(',')]
        first=True
        for i,m in enumerate(stops):
            res = await pg.evaluate(f"simBot('{mode}','{city}',{m},{'false' if first else 'true'})"); first=False
            for k in range(30): await pg.evaluate("game.updateVisuals(1/60); game.world.process(50)")
            await pg.evaluate("game.render()")
            await pg.screenshot(path=f'/tmp/g_{city}_{i}.png')
            print(m, res['cities'], res['deaths'], res['state'], await pg.evaluate("game.run.theme.id+' calls='+game.renderer.info.render.calls"))
        print('\n'.join(errs[:10]))
        await b.close()
asyncio.run(main())
