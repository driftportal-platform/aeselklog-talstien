const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const {default:worker,GameRoom}=await import('../worker/src.js');
 const root=path.resolve(__dirname,'..'),origin='https://driftportal-platform.github.io';
 const db=new Map(),room=new GameRoom({storage:{get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v))}},{});
 const rooms=new Map();const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:x=>x,get:id=>{if(!rooms.has(id)){const records=rooms.size===0?db:new Map();rooms.set(id,new GameRoom({storage:{get:async k=>structuredClone(records.get(k)),put:async(k,v)=>records.set(k,structuredClone(v))}},{}))}return {fetch:(r,i)=>rooms.get(id).fetch(r instanceof Request?r:new Request(r,i))}}}};
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
 await a.locator('#name').fill('Alma');await a.locator('#create').click();await a.locator('#parentPin').fill('1234');await a.locator('#parentOk').click();await a.waitForFunction(()=>document.querySelector('#code').textContent.length===8);const code=await a.locator('#code').textContent();
 await b.locator('#name').fill('Bo');await b.locator('#joinCode').fill(code);await b.locator('#join').click();await b.locator('#parentPin').fill('1234');await b.locator('#parentOk').click();await b.locator('#game').waitFor({state:'visible'});
 await a.locator('#roomMenu').evaluate(e=>e.open=true);await a.locator('#reconnect').click();await a.waitForFunction(()=>document.querySelector('#roomDeckSets').textContent.includes('2/2'));
 assert(await b.locator('#endGame').isHidden());await a.locator('#roomMenu').evaluate(e=>e.open=true);
 a.once('dialog',d=>d.dismiss());await a.locator('#endGame').click();assert.equal(db.get('game').phase,'playing');
 a.once('dialog',d=>d.accept());await a.locator('#endGame').click();await a.locator('#closedPanel').waitFor({state:'visible'});assert.equal(db.get('game').phase,'closed');assert(await a.locator('#liveGame').isHidden());assert.equal(await a.evaluate(()=>localStorage.getItem('aeselklog-online-session-v0941')),null);
 // Guest's normal fallback polling receives the closure without a manual click.
 await b.locator('#closedPanel').waitFor({state:'visible',timeout:8000});assert.equal(await b.evaluate(()=>localStorage.getItem('aeselklog-online-session-v0941')),null);assert(await b.locator('#chatPanel').isHidden());
 await a.screenshot({path:path.join(root,'preview_online_ended.png'),fullPage:true});
 await a.locator('#newGame').click();await a.locator('#setup').waitFor({state:'visible'});assert.equal(await a.locator('#name').inputValue(),'Alma');assert.equal(await a.locator('#joinCode').inputValue(),'');
 await a.locator('#create').click();await a.locator('#parentPin').fill('1234');await a.locator('#parentOk').click();await a.waitForFunction(old=>document.querySelector('#code').textContent.length===8&&document.querySelector('#code').textContent!==old,code);assert.equal(rooms.size,2);assert(await a.locator('#closedPanel').isHidden());
 await b.reload();await b.locator('#setup').waitFor({state:'visible'});assert(await b.locator('#game').isHidden());
 assert.deepEqual(errors,[]);console.log('PASS end-game Chromium: cancel/confirm, host-only control, all clients close, forgotten sessions, new room/new code and F5 stays at setup');
 }finally{for(const c of contexts)await c.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
