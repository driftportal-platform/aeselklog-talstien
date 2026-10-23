const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{const f=await fixture({count:2});try{
 const p=await f.contexts[0].newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto(f.origin+'/aeselklog-talstien/index.html?spil=regneklog');
 await p.evaluate(()=>{const start=AeselMath.start;window.testProblem=['subtract',10,3];AeselMath.start=(options)=>{const s=start(options);s.tasks=Array.from({length:5},()=>AeselMath.problem(...testProblem));return s};window.__spoken=[];AeselOfflineNumbers.play=async n=>{__spoken.push(n);await new Promise(r=>setTimeout(r,20));return true}});
 const begin=async(op,a,b)=>{await p.evaluate(x=>{testProblem=x;__spoken=[]},[op,a,b]);await p.locator('#mathStart').click();assert(await p.locator('#mathCount').isDisabled())};
 await begin('subtract',10,3);
 for(let i=0;i<3;i++)await p.locator(`#mathVisual [data-object="start-${i}"]`).click();assert(await p.locator('#mathCount').isEnabled());assert.equal(await p.locator('.math-removed').count(),3);
 await p.locator('[data-object="start-1"]').click();assert(await p.locator('#mathCount').isDisabled());await p.locator('[data-object="start-1"]').press('Enter');
 await p.locator('#mathCount').click();await p.waitForFunction(()=>document.querySelectorAll('.math-counted').length===7);await p.waitForFunction(()=>document.querySelector('#mathCount').textContent==='Tæl igen');assert.deepEqual(await p.evaluate(()=>__spoken),[1,2,3,4,5,6,7]);assert.match(await p.locator('#mathCountStatus').textContent(),/7 tilbage/);
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:f.shots+'/preview-interactive-minus.png',fullPage:true});
 await p.locator('#mathAnswer').fill('7');await p.locator('#mathCheck').click();assert.equal(await p.locator('#mathScore').textContent(),'5 point');await p.locator('#mathNew').click();
 for(const [op,a,b] of [['add',2,3],['multiply',2,3],['divide',6,2]]){
  await begin(op,a,b);
  if(op==='add')for(let i=0;i<b;i++)await p.locator(`[data-object="supply-${i}"]`).click();
  else if(op==='multiply')for(let g=0;g<a;g++)for(let i=0;i<b;i++)await p.locator('.math-tray').nth(g).getByRole('button').click();
  else {await p.locator('.math-tray').nth(1).getByRole('button').click();await p.locator('.math-tray').nth(1).getByRole('button').click();assert.match(await p.locator('#mathCountStatus').textContent(),/færre/);await p.locator('.math-tray').nth(2).getByRole('button').click();for(let i=0;i<2;i++)for(let g=1;g<=2;g++)await p.locator('.math-tray').nth(g).getByRole('button').click()}
  assert(await p.locator('#mathCount').isEnabled());await p.locator('.math-count-sound input').uncheck();await p.locator('#mathCount').click();const total=op==='add'?a+b:op==='multiply'?a*b:a/b;await p.waitForFunction(n=>document.querySelectorAll('.math-counted').length===n,total);await p.waitForFunction(()=>document.querySelector('#mathCount').textContent==='Tæl igen');assert.deepEqual(await p.evaluate(()=>__spoken),[]);
  for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}
  await p.locator('#mathNew').click();
 }
 await begin('multiply',10,10);for(let g=0;g<10;g++)for(let i=0;i<10;i++)await p.locator('.math-tray').nth(g).getByRole('button').click();await p.setViewportSize({width:320,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('#mathNew').click();
 await begin('subtract',4,2);for(let i=0;i<2;i++)await p.locator(`[data-object="start-${i}"]`).click();await p.locator('.math-count-sound input').check();await p.evaluate(()=>{AeselOfflineNumbers.play=async n=>{__spoken.push(n);return false}});await p.locator('#mathCount').click();await p.waitForFunction(()=>document.querySelector('#mathCount').textContent==='Tæl igen');assert.equal(await p.locator('.math-counted').count(),2);assert.match(await p.locator('#mathCountStatus').textContent(),/Lyden var ikke/);assert.deepEqual(await p.evaluate(()=>__spoken),[1]);await p.locator('#mathNew').click();
 await begin('subtract',3,3);for(let i=0;i<3;i++)await p.locator(`[data-object="start-${i}"]`).click();await p.locator('#mathCount').click();assert.match(await p.locator('#mathCountStatus').textContent(),/0 –/);assert.equal(await p.locator('.math-counted').count(),0);await p.locator('#mathNew').click();
 await begin('subtract',10,3);for(let i=0;i<3;i++)await p.locator(`[data-object="start-${i}"]`).click();await p.locator('.math-count-sound input').check();
 await p.evaluate(()=>{AeselOfflineNumbers.play=n=>{__spoken.push(n);return new Promise(()=>{})}});await p.locator('#mathCount').click();await p.waitForFunction(()=>__spoken.length===1);await p.locator('#mathGameBack').click();await p.waitForTimeout(1000);assert.deepEqual(await p.evaluate(()=>__spoken),[1]);assert(await p.locator('#gameChooser').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS interactive arithmetic: taps, undo, fair sharing, sequential sound, zero, scoring, responsive layout and cancellation');
}finally{await f.close()}})().catch(e=>{console.error(e);process.exitCode=1});
