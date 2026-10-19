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
 assert.equal(await a.locator('#deckSets').inputValue(),'5');assert.equal(await a.locator('#deckSets option').count(),5);await a.locator('#deckSets').selectOption('2');await a.screenshot({path:path.join(root,'preview_online_decksets_mobile.png'),fullPage:true});await a.locator('#name').fill('Alma');await a.locator('#create').click();await a.locator('#parentPin').fill('1234');await a.locator('#parentOk').click();await a.locator('#game').waitFor({state:'visible'});
 await a.waitForFunction(()=>document.querySelector('#code').textContent.length===8);const code=await a.locator('#code').textContent();
 await b.locator('#name').fill('Bo');await b.locator('#joinCode').fill(code);await b.locator('#join').click();await b.locator('#parentPin').fill('1234');await b.locator('#parentOk').click();await b.locator('#game').waitFor({state:'visible'});
 await a.locator('#reconnect').click();await a.waitForFunction(()=>document.querySelectorAll('#players .player').length===2);
 assert.equal(db.get('game').deckSets,2);assert.deepEqual(db.get('game').players.map(p=>p.closed.length),[20,20]);assert((await a.locator('#roomDeckSets').textContent()).includes('40 talkort'));assert((await b.locator('#roomDeckSets').textContent()).includes('40 talkort'));assert(await a.locator('#challenge').isVisible());assert(await a.locator('#challenge').isDisabled());
 await a.locator('#chatQuick button').first().click();await b.locator('#reconnect').click();await b.waitForFunction(()=>document.querySelector('#chatMessages').textContent.includes('Hov hov'));
 await a.locator('#chatConsent').check();await b.locator('#chatConsent').check();await a.locator('#reconnect').click();await a.locator('#chatText').waitFor({state:'visible'});
 // Age the quick message so server rate limiting does not slow the regression test.
 let g=db.get('game');g.chat.forEach(m=>m.at-=2000);db.set('game',g);
 await a.locator('#chatText').fill('Hej fra mobil');await a.locator('#chatSendText').click();await a.waitForFunction(()=>document.querySelector('#chatStatus').textContent==='Sendt');await b.locator('#reconnect').click();await b.waitForFunction(()=>document.querySelector('#chatMessages').textContent.includes('Hej fra mobil'));
 // Microphone/recorder are simulated; exercise preview, upload and playback UI.
 g=db.get('game');g.chat.forEach(m=>m.at-=2000);db.set('game',g);
 await a.evaluate(()=>{
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
 window.MediaRecorder=class {static isTypeSupported(t){return t==='audio/mp4'}constructor(){this.state='inactive';this.mimeType='audio/mp4'}start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable({data:new Blob([new Uint8Array([0,1,2,255])],{type:this.mimeType})});this.onstop()}};
 });
 await a.locator('#chatRecord').click();await a.waitForTimeout(150);await a.locator('#chatRecord').click();await a.locator('#chatPreview').click();await a.locator('#chatSendVoice').click();await a.waitForFunction(()=>document.querySelector('#chatStatus').textContent==='Sendt');
 await b.locator('#reconnect').click();await b.getByRole('button',{name:/Talebesked/}).click();
 assert.equal(db.get('game').chat.at(-1).kind,'voice');
 // A deterministic wrong discard with Danish/English, then challenge on device B.
 g=db.get('game');g.players[0].closed=[9,2];g.players[0].open=[];g.players[1].closed=[6,8];g.players[1].open=[];g.centers=[[1]];g.turn=0;g.pending=null;g.extraPenalty=true;g.move++;db.set('game',g);
 await a.locator('#reconnect').click();await a.locator('#voiceLanguage').selectOption('da-en');
 await a.getByRole('button',{name:'🃏 Vend kort',exact:true}).click();await a.waitForFunction(()=>window.__played.some(p=>p.endsWith('narrator/002.mp3')));
 await a.getByRole('button',{name:'Læg i egen åbne bunke',exact:true}).click();await a.waitForFunction(()=>window.__played.some(p=>p.endsWith('en/002.mp3')));
 await b.locator('#reconnect').click();await b.locator('#challenge').click();await b.waitForFunction(()=>document.querySelector('#message').textContent.includes('blev opdaget'));
 assert.equal(db.get('game').players[0].donkeys,1);assert.equal(db.get('game').pending,2);
 // Repeat both languages, local preference isolation, persistence after reload.
 await a.locator('#reconnect').click();await a.locator('#repeatNumber').click();await a.waitForFunction(()=>window.__played.filter(p=>p.endsWith('en/002.mp3')).length>=2);
 assert.equal(await b.locator('#voiceLanguage').inputValue(),'da');
 for(const lang of ['en','de','es']){await a.locator('#voiceLanguage').selectOption(lang);await a.locator('#repeatNumber').click();await a.waitForFunction(l=>window.__played.some(p=>p.endsWith(l+'/002.mp3')),lang)}
 await a.locator('#voiceLanguage').selectOption('da-en');
 await a.reload();await a.locator('#game').waitFor({state:'visible'});assert.equal(await a.locator('#voiceLanguage').inputValue(),'da-en');assert.equal(await a.locator('#code').textContent(),code);assert((await a.locator('#roomDeckSets').textContent()).includes('2 kortsæt'));
 // Touch selection and target placement; finished board exposes a challenge and podium.
 await a.locator('#pendingArea .card').tap();await a.locator('#centers .target').first().getByRole('button').click();await a.waitForFunction(()=>document.querySelector('#message').textContent.includes('lagde 2'));
 g=db.get('game');g.players[0].closed=[];g.players[0].open=[];g.pending=3;g.turn=0;g.move++;db.set('game',g);await a.locator('#reconnect').click();await a.locator('#pendingArea .card').tap();await a.locator('#centers .target').first().getByRole('button').click();await a.waitForFunction(()=>document.querySelector('#podium').textContent.includes('1. plads'));
 assert((await a.locator('#podium').textContent()).includes('Bo'));
 await a.screenshot({path:path.join(root,'preview_online_mobile.png'),fullPage:true});await b.screenshot({path:path.join(root,'preview_online_desktop.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS online Chromium: deck selector and room persistence, mobile taps, two devices, chat, bilingual MP3 paths, challenge/penalty, reload, isolated settings, podium');
 }finally{for(const c of contexts)await c.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
