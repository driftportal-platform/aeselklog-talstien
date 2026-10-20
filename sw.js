/* ÆselKlog PWA-service worker.
   Hæv KUN VERSION ved en release; cachenavnet udledes derfra. Kode hentes netværk-først med
   timeout, så appen ikke hænger på dårlig wifi, men falder tilbage til cachen. */
const VERSION='0.9.65';
const CACHE_PREFIX='aeselklog-talstien-';
const CACHE=CACHE_PREFIX+'v'+VERSION.replace(/\./g,'');
const NETWORK_TIMEOUT_MS=3000;
const AUDIO_CACHE='aeselklog-number-audio-v1';
const CORE=['./assets/icons/card-game.svg','./assets/icons/board-game.svg','./game-icons.js', './game-icons.css', './assets/icons/attachment.svg', './assets/icons/book.svg', './assets/icons/brain.svg', './assets/icons/bridge.svg', './assets/icons/cards.svg', './assets/icons/carrot.svg', './assets/icons/chat.svg', './assets/icons/check.svg', './assets/icons/clock.svg', './assets/icons/close.svg', './assets/icons/copy.svg', './assets/icons/dice.svg', './assets/icons/donkey.svg', './assets/icons/exit.svg', './assets/icons/flower.svg', './assets/icons/gift.svg', './assets/icons/globe.svg', './assets/icons/hand.svg', './assets/icons/heart.svg', './assets/icons/help.svg', './assets/icons/home.svg', './assets/icons/lock.svg', './assets/icons/mail.svg', './assets/icons/map.svg', './assets/icons/mic.svg', './assets/icons/music.svg', './assets/icons/numbers.svg', './assets/icons/party.svg', './assets/icons/pause.svg', './assets/icons/play.svg', './assets/icons/refresh.svg', './assets/icons/save.svg', './assets/icons/settings.svg', './assets/icons/share.svg', './assets/icons/smile.svg', './assets/icons/sound-off.svg', './assets/icons/sound.svg', './assets/icons/star.svg', './assets/icons/swap.svg', './assets/icons/target.svg', './assets/icons/trophy.svg', './assets/icons/water.svg', './assets/images/donkey-card.webp', './assets/images/mascot.webp','./online-menu.js','./online-board.js','./online-shell.js','./online-sound.js','./online.css','./online-invite.js','./','./index.html','./styles.css','./home-ui.js','./home-fullscreen.webp',
 './app.js','./audio-settings.js','./offline-talkort.js','./talkort.js','./numbers.js','./cardgame-engine.js','./cardgame-ui.js','./music.js','./engine.js','./board.js','./actions.js','./leaderboard.js',
 './adaptive.js','./profiles.js','./parentreport.js','./actionfx.js','./savegame.js','./cpuvoice.js','./voicecache.js','./narration.js','./manifest.webmanifest',
 './icon.svg','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./aeselklog-card.webp','./donkey-bray.wav',
 './music/gone-fishin.mp3','./music/childrens-march.mp3','./music/beary-fishy.mp3',
 './home-illustration.webp','./home-hero-mobile.webp','./home-hero-wide.webp','./home-mascot.webp'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys()
  .then(names=>Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE&&name!==AUDIO_CACHE)
   .map(name=>caches.delete(name))))
  .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 const scope=new URL(self.registration.scope);
 // Kun vores egen app under /aeselklog-talstien/, ikke andre GitHub Pages-projekter.
 if(url.origin!==self.location.origin||!url.pathname.startsWith(scope.pathname))return;
 const media=/\.(?:webp|png|svg|wav|ico|mp3|ogg)$/i.test(url.pathname);
 if(media){
  const isNumberAudio=url.pathname.includes('/audio/numbers/')&&url.pathname.endsWith('.mp3');
  // Fulde talelyde i separat cache, bevaret på tværs af app-versioner.
  event.respondWith((async()=>{
   const store=await caches.open(isNumberAudio?AUDIO_CACHE:CACHE);
   const key=url.href;
   const hit=await store.match(key);
   if(hit)return serveRange(req,hit);
   if(isNumberAudio){
    // Safari sender ofte Range: bytes=0-. Hent en FULL 200-kopi til cachen.
    const res=await fetch(key);
    if(res.ok&&res.status===200){event.waitUntil(store.put(key,res.clone()));return serveRange(req,res)}
    return res;
   }
   const response=await fetch(req);
   if(response.ok&&response.status!==206)event.waitUntil(store.put(key,response.clone()));
   return response;
  })());
 }else{
  // HTML, CSS og JavaScript: netværk først, men giv op efter NETWORK_TIMEOUT_MS og brug cachen.
  event.respondWith(networkFirst(event,req));
 }
});

async function networkFirst(event,req){
 const cached=async()=>(await caches.match(req))||(req.mode==='navigate'?caches.match('./index.html'):undefined);
 const network=fetch(req).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
  return response;
 });
 let timer;
 const timeout=new Promise(resolve=>{timer=setTimeout(()=>resolve(null),NETWORK_TIMEOUT_MS)});
 try{
  const first=await Promise.race([network,timeout]);
  if(first)return first;
  // Langsomt net: server cachen med det samme; hentningen kører videre og opdaterer cachen.
  const hit=await cached();
  if(hit){network.catch(()=>{});return hit}
  return await network;
 }catch(_){
  return (await cached())||Response.error();
 }finally{clearTimeout(timer)}
}

// Kun én bytes-range pr. forespørgsel; uændrede svar til billeder og uden Range.
async function serveRange(req,response){
 const header=req.headers?.get?.('range');
 if(!header||!/\.mp3(?:$|\?)/i.test(req.url))return response;
 const match=/^bytes=(\d*)-(\d*)$/i.exec(header.trim());if(!match)return response;
 const full=await response.arrayBuffer(),size=full.byteLength;
 if(!size)return response;
 let start=match[1]?Number(match[1]):null;
 let end=match[2]?Number(match[2]):null;
 if(start===null){const suffix=end??0;start=Math.max(0,size-suffix);end=size-1;}
 else end=end===null?size-1:Math.min(end,size-1);
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start){
  return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 }
 const body=full.slice(start,end+1),headers=new Headers(response.headers);
 headers.set('Content-Type','audio/mpeg');headers.set('Accept-Ranges','bytes');
 headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(body.byteLength));
 return new Response(body,{status:206,statusText:'Partial Content',headers});
}
