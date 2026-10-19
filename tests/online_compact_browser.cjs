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
 await context.addInitScript(()=>{window.__played=[];window.__effects=[];window.Audio=class{
 constructor(src=''){this.src=src;this.paused=true}getAttribute(){return this.src}removeAttribute(){this.src=''}pause(){this.paused=true}
 play(){this.paused=false;if(this.src.endsWith('donkey-bray.wav')&&!this.muted)window.__effects.push(this.src);if(this.src.includes('/numbers/'))window.__played.push(this.src);this.onplay?.();if(!this.loop)setTimeout(()=>{this.paused=true;this.onended?.()},5);return Promise.resolve()}};
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
 async function refresh(p){await p.locator('#roomMenu').evaluate(e=>e.open=true);await p.locator('#reconnect').click();await p.waitForTimeout(80);await p.locator('#roomMenu').evaluate(e=>e.open=false)}
 await refresh(a);await refresh(b);
 for(const p of pages){for(const id of ['roomMenu','audioMenu','chatPanel'])assert.equal(await p.locator('#'+id).evaluate(e=>e.open),false);assert(await p.locator('#challenge').evaluate(e=>!!e.closest('.player-board')))}
 await a.locator('#audioMenu > summary').click();assert(await a.locator('#voiceLanguage').isVisible());await a.locator('#voiceLanguage').selectOption('en');await refresh(a);assert(await a.locator('#audioMenu').evaluate(e=>e.open));await a.locator('#audioMenu > summary').click();
 let g=db.get('game');g.players[0].closed=[9,2];g.players[0].open=[];g.players[1].closed=[8,8];g.players[1].open=[5];g.centers=[[1]];g.turn=0;g.pending=null;g.move++;db.set('game',g);await refresh(a);
 await a.locator('#players .player').first().locator('.back.selectable').tap();await a.waitForFunction(()=>document.querySelector('#players [data-source="pending"]')?.textContent==='2');assert.equal(db.get('game').pending,2);assert.equal(db.get('game').players[0].open.length,0);assert.equal(db.get('game').turn,0);assert.equal(await a.locator('#pendingArea .card').count(),0);assert(await a.locator('#players .revealed-pile [data-source]').evaluate(e=>e.closest('.revealed-pile')!==null));assert.equal(await a.getByRole('button',{name:'Afslut tur →',exact:true}).count(),0);
 const source=a.locator('#players [data-source="pending"]'),target=a.locator('#centers .target').first();
 const absolute=await source.evaluate(e=>e.getBoundingClientRect().top+scrollY);await a.evaluate(y=>scrollTo(0,Math.max(0,y-100)),absolute);const from=await source.boundingBox(),to=await target.boundingBox();
 assert(to.y+to.height/2<844,'touch target fits below source');
 const cdp=await contexts[0].newCDPSession(a);const start={x:from.x+from.width/2,y:from.y+from.height/2},end={x:to.x+to.width/2,y:to.y+to.height/2};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});for(let i=1;i<=10;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/10,y:start.y+(end.y-start.y)*i/10}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await a.waitForFunction(()=>document.querySelector('#message').textContent.includes('lagde 2'));assert.deepEqual(db.get('game').centers,[[1,2]]);assert.equal(db.get('game').players[0].open.length,0);assert.equal(db.get('game').turn,0);
 // Mouse gesture moves from B's actual open pile to A's actual open pile.
 g=db.get('game');g.turn=1;g.players[0].open=[5];g.players[1].closed=[8,6];g.players[1].open=[];g.move++;db.set('game',g);await refresh(b);
 await b.locator('#players .player').nth(1).locator('.back.selectable').click();await b.waitForFunction(()=>document.querySelector('#players [data-source="pending"]')?.textContent==='6');
 const src=b.locator('#players [data-source="pending"]'),dest=b.locator('#players .player').first().locator('[data-drop-kind="player"]');await src.scrollIntoViewIfNeeded();const p=await src.boundingBox(),q=await dest.boundingBox();await b.mouse.move(p.x+p.width/2,p.y+p.height/2);await b.mouse.down();await b.mouse.move(q.x+q.width/2,q.y+q.height/2,{steps:12});await b.mouse.up();await b.waitForFunction(()=>document.querySelector('#message').textContent.includes('lagde 6'));assert.equal(db.get('game').players[0].open.at(-1),6);
 await b.waitForTimeout(450);await b.getByRole('button',{name:'🃏 Vend kort',exact:true}).click();await b.getByRole('button',{name:'Læg i egen åbne bunke',exact:true}).click();await b.waitForFunction(()=>document.querySelector('#current').textContent.includes('Alma'));assert.equal(db.get('game').turn,0);
 // A missed center placement yields exactly one donkey sound per connected device.
 g=db.get('game');g.turn=0;g.pending=2;g.players[0].closed=[9];g.players[0].open=[];g.centers=[[1]];g.move++;db.set('game',g);await refresh(a);await a.getByRole('button',{name:'Læg i egen åbne bunke',exact:true}).click();await refresh(b);await b.locator('#challenge').click();await b.waitForFunction(()=>document.querySelector('#message').textContent.includes('blev opdaget'));await refresh(a);assert.equal(await a.evaluate(()=>window.__effects.length),1);assert.equal(await b.evaluate(()=>window.__effects.length),1);await refresh(a);assert.equal(await a.evaluate(()=>window.__effects.length),1);
 await b.locator('#audioMenu').evaluate(e=>e.open=true);await b.locator('#effectToggle').click();await a.getByRole('button',{name:'Læg i egen åbne bunke',exact:true}).click();await refresh(b);await b.locator('#challenge').click();await b.waitForFunction(()=>document.querySelector('#message').textContent.includes('blev opdaget'));await refresh(a);assert.equal(await a.evaluate(()=>window.__effects.length),2);assert.equal(await b.evaluate(()=>window.__effects.length),1);await b.reload();await b.waitForFunction(()=>document.querySelector('#code').textContent.length===8);assert.equal(await b.evaluate(()=>window.__effects.length),0);
 await b.locator('#chatPanel > summary').click();await b.locator('#chatQuick button').first().click();await refresh(a);await a.waitForFunction(()=>document.querySelector('#chatBadge').textContent.includes('1 besked'));assert.equal(await a.locator('#chatPanel').evaluate(e=>e.open),false);await a.locator('#chatPanel > summary').click();assert(await a.locator('#chatMessages').isVisible());await a.locator('#chatPanel > summary').click();
 await a.locator('#players').scrollIntoViewIfNeeded();await a.screenshot({path:path.join(root,'preview_online_compact_mobile.png'),fullPage:true});await b.locator('#roomMenu').evaluate(e=>e.open=false);await b.locator('#chatPanel').evaluate(e=>e.open=false);await b.screenshot({path:path.join(root,'preview_online_compact_desktop.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS compact Chromium: folded tools, fold persistence, nearby donkey, reveal on closed pile, real touch drag to center, mouse drag to player, automatic turn on own-open placement and donkey sound and collapsed chat badge');
 }finally{for(const c of contexts)await c.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
