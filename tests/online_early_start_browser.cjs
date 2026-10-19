const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const {default:worker,GameRoom}=await import('../worker/src.js');
 const root=path.resolve(__dirname,'..'),origin='https://driftportal-platform.github.io';
 const db=new Map(),room=new GameRoom({storage:{get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v))}},{});
 const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:x=>x,get:()=>({fetch:(r,i)=>room.fetch(r instanceof Request?r:new Request(r,i))})}};
 const browser=await chromium.launch({headless:true});
 const contexts=[],pages=[],errors=[];
 try{
 for(const [seat,entry] of [[0,'site/online.html'],[1,'online.html']]){
 const context=await browser.newContext({viewport:{width:seat?1280:390,height:seat?800:844},hasTouch:!seat});contexts.push(context);
 await context.addInitScript(()=>{window.__played=[];window.Audio=class{
 constructor(src=''){this.src=src;this.paused=true}getAttribute(){return this.src}removeAttribute(){this.src=''}pause(){this.paused=true}
 play(){this.paused=false;if(this.src.includes('/numbers/'))window.__played.push(this.src);this.onplay?.();if(!this.loop)setTimeout(()=>{this.paused=true;this.onended?.()},5);return Promise.resolve()}};
 });
 await context.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url());
 if(url.hostname==='worker.test'){
 try{const r=await worker.fetch(new Request(req.url(),{method:req.method(),headers:req.headers(),...(req.postData()?{body:req.postData()}:{})}),env);await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())})}catch(e){errors.push(String(e));await route.abort()}return;
 }
 if(url.hostname===new URL(origin).hostname){
 const rel=decodeURIComponent(url.pathname).replace(/^\/aeselklog-talstien\//,'');
 if(rel.endsWith('online-config.js'))return route.fulfill({contentType:'application/javascript',body:"window.AESEL_ONLINE_URL='https://worker.test'"});
 const file=path.join(root,rel);if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file});
 }await route.abort();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));pages.push(page);await page.goto(origin+'/aeselklog-talstien/'+entry);
 }
 const [a,b]=pages;
 await a.locator('#playerCount').selectOption('6');await a.locator('#name').fill('Alma');await a.locator('#create').click();await a.locator('#parentPin').fill('1234');await a.locator('#parentOk').click();await a.waitForFunction(()=>document.querySelector('#code').textContent.length===8);
 const code=await a.locator('#code').textContent();await b.locator('#name').fill('Bo');await b.locator('#joinCode').fill(code);await b.locator('#join').click();await b.locator('#parentPin').fill('1234');await b.locator('#parentOk').click();await b.locator('#game').waitFor({state:'visible'});
 await a.locator('#reconnect').click();assert.equal(db.get('game').phase,'waiting');assert(await a.locator('#startEarly').isHidden());assert(await b.locator('#startEarly').isHidden());
 // Age the server fixture; the final short countdown uses real browser timers.
 const g=db.get('game');g.created=Date.now()-58000;db.set('game',g);
 await a.reload();await a.locator('#earlyStartPanel').waitFor({state:'visible'});await a.locator('#startEarly').waitFor({state:'visible',timeout:7000});assert(await a.locator('#startEarly').isEnabled());assert.equal(db.get('game').phase,'waiting');
 await b.locator('#reconnect').click();assert(await b.locator('#startEarly').isHidden());
 await a.screenshot({path:path.join(root,'preview_online_start_early.png'),fullPage:true});
 await a.locator('#startEarly').click();await a.waitForFunction(()=>document.querySelector('#message').textContent.includes('startet med 2'));
 assert.equal(db.get('game').playerCount,2);assert.deepEqual(db.get('game').players.map(p=>p.closed.length),[50,50]);assert(await a.locator('#earlyStartPanel').isHidden());
 await b.locator('#reconnect').click();await b.waitForFunction(()=>document.querySelector('#roomDeckSets').textContent.includes('2/2 spillere'));
 await a.reload();await a.waitForFunction(()=>document.querySelector('#roomDeckSets').textContent.includes('2/2 spillere'));assert(await a.locator('#startEarly').isHidden());
 assert.deepEqual(errors,[]);console.log('PASS early-start Chromium: host countdown, persisted deadline, guest cannot start, optional click, two-player deal, broadcast fallback and reload');
 }finally{for(const c of contexts)await c.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
