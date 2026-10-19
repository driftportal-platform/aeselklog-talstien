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
 for(const [seat,entry] of Array.from({length:6},(_,i)=>[i,i%2?'online.html':'site/online.html'])){
 const context=await browser.newContext({viewport:[{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:320,height:740},{width:844,height:390},{width:1280,height:800}][seat],hasTouch:seat<5});contexts.push(context);
 await context.addInitScript(()=>{window.__played=[];window.__shared=[];window.__copied=[];Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shared.push(data)});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copied.push(text)}});window.Audio=class{
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
 const a=pages[0];
 await a.locator('#playerCount').selectOption('6');await a.locator('#deckSets').selectOption('1');
 assert((await a.locator('#dealPreview').textContent()).includes('3–4 kort til hver'));
 await a.screenshot({path:path.join(root,'preview_online_six_setup.png'),fullPage:true});
 await a.locator('#name').fill('Spiller 1');await a.locator('#create').click();await a.locator('#parentPin').fill('1234');await a.locator('#parentOk').click();await a.locator('#game').waitFor({state:'visible'});
 await a.waitForFunction(()=>document.querySelector('#code').textContent.length===8);const code=await a.locator('#code').textContent();
 for(let i=1;i<6;i++){
  const p=pages[i];if(i===5){await p.evaluate(()=>localStorage.setItem('aeselklog-online-session-v0941',JSON.stringify({code:'ZZZZZZZZ',secret:'a'.repeat(48),at:Date.now()})));await p.goto(origin+'/aeselklog-talstien/site/online.html?room='+code+'&secret=do-not-share');assert.equal(await p.locator('#joinCode').inputValue(),code);assert(await p.locator('#invitedNotice').isVisible())}await p.locator('#name').fill('Spiller '+(i+1));await p.locator('#joinCode').fill(code);await p.locator('#join').click();await p.locator('#parentPin').fill('1234');await p.locator('#parentOk').click();await p.locator('#game').waitFor({state:'visible'});
  if(i<5){assert.equal(db.get('game').phase,'waiting');assert.equal(await p.getByRole('button',{name:'🃏 Vend kort',exact:true}).count(),0)}
 }
 for(const p of pages){await p.locator('#roomMenu').evaluate(e=>e.open=true);await p.locator('#reconnect').click();await p.waitForFunction(()=>document.querySelectorAll('#players .player').length===6)}
 assert.deepEqual(db.get('game').players.map(p=>p.closed.length),[4,4,3,3,3,3]);
 for(const p of pages){const dimensions=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:e.getBoundingClientRect().right})).slice(0,12)}));assert(dimensions.scroll<=dimensions.width,JSON.stringify(dimensions));}
 await a.screenshot({path:path.join(root,'preview_online_table_mobile.png'),fullPage:true});await pages[1].screenshot({path:path.join(root,'preview_online_table_ipad.png'),fullPage:true});

 // Native device sharing, email compose and copy all use the same public invitation.
 await a.locator('#roomMenu').evaluate(e=>e.open=true);await a.locator('#shareInvite').click();const shared=await a.evaluate(()=>window.__shared[0]);assert.equal(new URL(shared.url).searchParams.get('room'),code);assert(!shared.url.includes('secret'));
 await a.locator('#copyInvite').click();assert((await a.evaluate(()=>window.__copied[0])).includes(shared.url));
 const mail=await pages[5].locator('#inviteEmail').getAttribute('href');assert(mail.startsWith('mailto:?'));assert(decodeURIComponent(mail).includes('?room='+code));assert(!mail.includes('do-not-share'));
 await a.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:undefined}));await a.locator('#roomMenu').evaluate(e=>e.open=true);await a.locator('#shareInvite').click();assert.equal(await a.evaluate(()=>window.__copied.length),2);
 await a.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('unavailable')}}}));await a.locator('#copyInvite').click();assert(await a.locator('#inviteText').isVisible());assert((await a.locator('#inviteText').inputValue()).includes(code));

 for(let i=0;i<6;i++){
  const p=pages[i];await p.locator('#chatPanel').evaluate(e=>e.open=true);await p.locator('#chatConsent').check();
  if(i<5)assert(await p.locator('#chatFree').isHidden());
 }
 for(const p of pages){await p.locator('#roomMenu').evaluate(e=>e.open=true);await p.locator('#reconnect').click();await p.locator('#chatText').waitFor({state:'visible'})}
 await pages[5].locator('#chatText').fill('Hej fra spiller seks');await pages[5].locator('#chatSendText').click();await pages[5].waitForFunction(()=>document.querySelector('#chatStatus').textContent==='Sendt');
 await a.locator('#roomMenu').evaluate(e=>e.open=true);await a.locator('#reconnect').click();await a.waitForFunction(()=>document.querySelector('#chatMessages').textContent.includes('Hej fra spiller seks'));
 assert((await a.locator('#chatMessages').textContent()).includes('Spiller 6'));
 // Every seat can act. Exercise a complete round through the rendered buttons.
 let g=db.get('game');g.players.forEach(p=>{p.closed=[10,10];p.open=[]});g.centers=[];g.turn=0;g.pending=null;g.move++;db.set('game',g);
 for(let i=0;i<6;i++){
  const p=pages[i];await p.locator('#roomMenu').evaluate(e=>e.open=true);await p.locator('#reconnect').click();await p.getByRole('button',{name:'🃏 Vend kort',exact:true}).click();await p.getByRole('button',{name:'Læg i egen åbne bunke',exact:true}).click();await p.waitForFunction(name=>document.querySelector('#current').textContent.includes(name),'Spiller '+((i+1)%6+1));
  assert.equal(db.get('game').turn,(i+1)%6);
 }
 // Sixth participant catches a missed center placement. All five donors contribute.
 g=db.get('game');g.pending=1;g.turn=0;g.extraPenalty=true;g.move++;db.set('game',g);await a.locator('#roomMenu').evaluate(e=>e.open=true);await a.locator('#reconnect').click();
 await a.getByRole('button',{name:'Læg i egen åbne bunke',exact:true}).click();await pages[5].locator('#reconnect').click();await pages[5].locator('#challenge').click();await pages[5].waitForFunction(()=>document.querySelector('#message').textContent.includes('blev opdaget'));
 assert.equal(db.get('game').players[0].donkeys,1);assert.equal(db.get('game').players[0].closed.length,6);
 await pages[4].reload();await pages[4].locator('#game').waitFor({state:'visible'});assert.equal(await pages[4].locator('#code').textContent(),code);assert((await pages[4].locator('#roomDeckSets').textContent()).includes('6/6 spillere'));
 // Reach completion through a real move: three medalists rendered on all seats.
 g=db.get('game');g.players.forEach((p,i)=>{p.closed=i===5?[9]:[];p.open=[]});g.pending=5;g.turn=4;g.centers=[[1,2,3,4]];g.finishOrder=[0,1,2,3];g.move++;db.set('game',g);
 const finisher=pages[4];await finisher.locator('#roomMenu').evaluate(e=>e.open=true);await finisher.locator('#reconnect').click();await finisher.locator('#players [data-source]').click();await finisher.locator('#centers .target').first().getByRole('button').click();await finisher.waitForFunction(()=>document.querySelector('#podium').textContent.includes('3. plads'));
 for(const p of pages){await p.locator('#roomMenu').evaluate(e=>e.open=true);await p.locator('#reconnect').click();await p.waitForFunction(()=>document.querySelector('#podium').textContent.includes('3. plads'));assert.equal(await p.locator('#podium p').count(),3)}
 await a.screenshot({path:path.join(root,'preview_online_six_mobile.png'),fullPage:true});await pages[5].screenshot({path:path.join(root,'preview_online_six_desktop.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS six-player Chromium: lobby, balanced deal, six identities, unanimous chat, named sender, round-robin, challenge, five-card penalty, seat 5 reload, invitations/share/mail/copy and three-place podium');
 }finally{for(const c of contexts)await c.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
