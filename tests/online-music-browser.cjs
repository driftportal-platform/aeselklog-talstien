const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{for(const gameType of ['cards','board','fish','rummy']){const f=await fixture({count:2,gameType});try{
 const p=f.pages[0],other=f.pages[1];assert(await p.locator('#onlineMusicToggle').isVisible());assert.equal(await p.locator('#onlineMusicToggle').getAttribute('aria-pressed'),'false');await p.locator('#onlineMusicToggle').click();
 assert.equal(await p.locator('#onlineMusicToggle').getAttribute('aria-pressed'),'true');assert.equal(await other.locator('#onlineMusicToggle').getAttribute('aria-pressed'),'false');
 await f.settings(p);assert.equal(await p.locator('#musicToggle').getAttribute('aria-pressed'),'true');await p.locator('#musicTrack').selectOption('beary');await p.locator('#musicVolume').evaluate(n=>{n.value='24';n.dispatchEvent(new Event('input',{bubbles:true}))});await f.closeSettings(p);
 const loop=await p.evaluate(()=>{const a=__audios.find(x=>x.loop);return {paused:a.paused,src:a.src}});assert(!loop.paused);assert(loop.src.endsWith('beary-fishy.mp3'));
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),gameType+' '+width);const b=await p.locator('#onlineMusicToggle').boundingBox();assert(b&&b.y>=0)}
 await p.reload();await p.locator('#game:not(.hidden)').waitFor();assert.equal(await p.locator('#onlineMusicToggle').getAttribute('aria-pressed'),'true');await p.locator('#onlineMusicToggle').click();assert(await p.evaluate(()=>__audios.find(x=>x.loop).paused));

 await p.goto(f.origin+'/aeselklog-talstien/site/online.html');await p.locator('#game:not(.hidden)').waitFor();assert.equal(await p.locator('#onlineMusicToggle').getAttribute('aria-pressed'),'false');await p.locator('#onlineMusicToggle').click();assert((await p.evaluate(()=>__audios.find(x=>x.loop).src)).startsWith('../music/'));
 if(gameType==='cards'){const q=await f.contexts[0].newPage();await q.goto(f.origin+'/aeselklog-talstien/online.html?menu=1');await q.locator('#chooseOnlineBoard').click();await q.locator('#name').fill('Musikprøve');await f.gate(q,'create');await q.waitForFunction(()=>document.querySelector('#code').textContent.length===8);assert.equal(await q.locator('#onlineMusicToggle').getAttribute('aria-pressed'),'false')}
 assert.deepEqual(f.errors,[]);console.log('PASS online music '+gameType+': button, menu, volume, per-device preference, reload and responsive layout');
}finally{await f.close()}}})().catch(e=>{console.error(e);process.exitCode=1});
