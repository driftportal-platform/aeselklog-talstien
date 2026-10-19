const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
module.exports=async function fixture({count=3,joined=count,sets=1}={}){
 const {default:worker,GameRoom}=await import('../worker/src.js');const root=path.resolve(__dirname,'..'),origin='https://driftportal-platform.github.io',db=new Map(),rooms=new Map();
 const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:x=>x,get:id=>{if(!rooms.has(id)){const records=rooms.size===0?db:new Map();rooms.set(id,new GameRoom({storage:{get:async k=>structuredClone(records.get(k)),put:async(k,v)=>records.set(k,structuredClone(v)),delete:async k=>records.delete(k)}},{}))}return {fetch:(r,i)=>rooms.get(id).fetch(r instanceof Request?r:new Request(r,i))}}}};
 const browser=await chromium.launch({headless:true}),contexts=[],pages=[],errors=[];
 for(let i=0;i<joined;i++){
  const viewport=[{width:390,height:844},{width:768,height:1024},{width:1280,height:800},{width:320,height:740},{width:844,height:390},{width:1024,height:768}][i];
  const context=await browser.newContext({viewport,hasTouch:i!==2});contexts.push(context);
  await context.addInitScript(()=>{
   window.__soundContexts=[];window.__audios=[];window.__brays=0;window.__played=[];window.__shared=[];window.__copied=[];window.__blockSound=false;
   window.AudioContext=class{constructor(){this.state='suspended';this.destination={};window.__soundContexts.push(this)}resume(){if(window.__blockSound)return Promise.reject(Error('blocked'));this.state='running';return Promise.resolve()}createGain(){return {gain:{value:1},connect(){}}}decodeAudioData(){return Promise.resolve({duration:3})}createBufferSource(){return {connect(){},start(){window.__brays++;setTimeout(()=>this.onended?.(),10)},stop(){this.onended?.()}}}};
   window.Audio=class{constructor(src=''){this.src=src;this.paused=true;window.__audios.push(this)}getAttribute(){return this.src}removeAttribute(){this.src=''}pause(){this.paused=true}play(){this.paused=false;window.__played.push(this.src);this.onplay?.();if(!this.loop)setTimeout(()=>{this.paused=true;this.onended?.()},10);return Promise.resolve()}};
   Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shared.push(data)});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async data=>window.__copied.push(data)}});
  });
  await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());
   if(url.hostname==='worker.test'){try{const response=await worker.fetch(new Request(req.url(),{method:req.method(),headers:req.headers(),...(req.postData()?{body:req.postData()}:{})}),env);return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())})}catch(e){errors.push(String(e));return route.abort()}}
   const rel=decodeURIComponent(url.pathname).replace(/^\/aeselklog-talstien\//,'');if(url.hostname===new URL(origin).hostname){if(rel.endsWith('online-config.js'))return route.fulfill({contentType:'application/javascript',body:"window.AESEL_ONLINE_URL='https://worker.test'"});const file=path.join(root,rel);if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file})}return route.abort();
  });
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));pages.push(p);await p.goto(origin+'/aeselklog-talstien/'+(i%2?'online.html':'site/online.html'));
 }
 async function gate(p,id){await p.locator('#'+id).click();await p.locator('#parentPin').fill('1234');await p.locator('#parentOk').click()}
 async function settings(p){if(!await p.locator('#settingsDialog').evaluate(e=>e.open))await p.locator('#openSettings').click()}
 async function closeSettings(p){if(await p.locator('#settingsDialog').evaluate(e=>e.open))await p.locator('#closeSettings').click()}
 async function refresh(p){await settings(p);await p.locator('#reconnect').click();await p.waitForTimeout(50);await closeSettings(p)}
 async function chat(p){if(!await p.locator('#chatDialog').evaluate(e=>e.open))await p.locator('#chatLauncher').click()}
 async function closeChat(p){if(await p.locator('#chatDialog').evaluate(e=>e.open))await p.locator('#closeChat').click()}
 const a=pages[0];await a.locator('#playerCount').selectOption(String(count));await a.locator('#deckSets').selectOption(String(sets));await a.locator('#name').fill('Spiller 1');await gate(a,'create');await a.waitForFunction(()=>document.querySelector('#code').textContent.length===8);const code=await a.locator('#code').textContent();
 for(let i=1;i<joined;i++){const p=pages[i];await p.goto(p.url()+'?room='+code+'&secret=must-not-leak');await p.locator('#name').fill('Spiller '+(i+1));await p.locator('#joinCode').fill(code);await gate(p,'join');await p.waitForFunction(()=>document.querySelector('#code').textContent.length===8)}
 for(const p of pages)await refresh(p);
 return {root,origin,db,rooms,browser,contexts,pages,errors,code,gate,settings,closeSettings,refresh,chat,closeChat,async close(){for(const c of contexts)await c.close();await browser.close()}};
};
