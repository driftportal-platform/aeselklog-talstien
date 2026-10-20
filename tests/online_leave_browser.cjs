const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{for(const gameType of ['cards','board']){const x=await fixture({gameType,count:3});try{const [a,b,c]=x.pages;
 assert(await b.locator('#leave').isVisible());
 b.once('dialog',d=>d.dismiss());await b.locator('#leave').click();assert.equal(x.db.get('game').players[1].leftAt,undefined);
 await b.route('**/leave',r=>r.abort());let dialogs=0;b.on('dialog',async d=>{dialogs++;await d.accept()});await b.locator('#leave').click();await b.waitForTimeout(200);assert.equal(x.db.get('game').players[1].leftAt,undefined);assert(await b.evaluate(()=>!!localStorage.getItem('aeselklog-online-session-v0941')));assert(dialogs>=2);b.removeAllListeners('dialog');await b.unroute('**/leave');b.once('dialog',d=>d.accept());await b.locator('#leave').click();await b.waitForFunction(()=>!document.querySelector('#onlineChooser').hidden);assert.equal(await b.evaluate(()=>localStorage.getItem('aeselklog-online-session-v0941')),null);
 await x.refresh(a);await x.refresh(c);assert.match(await a.locator('#departureNotice').textContent(),/Spiller 2/);assert.equal(await a.locator('[data-seat="1"]').count(),0);assert.equal(x.db.get('game').phase,'playing');assert.equal(x.db.get('game').players[1].leftAt>0,true);
 await x.settings(a);a.once('dialog',d=>d.accept());await a.locator('#hostLeave').click();await x.refresh(c);assert.equal(x.db.get('game').phase,'closed');assert.match(await c.locator('#departureNotice').textContent(),/Spiller 1/);assert.deepEqual(x.errors,[]);
 console.log('PASS browser leave '+gameType);
 }finally{await x.close()}}})().catch(e=>{console.error(e);process.exitCode=1});
