/* ÆselKlog v0.9.10.1 – versioneret offline-cache. Ingen Cloudflare/ElevenLabs-data caches. */
const CACHE_PREFIX='aeselklog-talstien-';
const CACHE='aeselklog-talstien-v0910-1-intro-variety';
const CORE=['./','./index.html','./styles.css','./home-ui.js','./home-fullscreen.webp',
 './app.js','./engine.js','./board.js','./actions.js','./leaderboard.js',
 './adaptive.js','./profiles.js','./savegame.js','./cpuvoice.js','./voicecache.js','./narration.js','./manifest.webmanifest',
 './icon.svg','./aeselklog-card.webp','./donkey-bray.wav',
 './home-illustration.webp','./home-hero-mobile.webp','./home-hero-wide.webp','./home-mascot.webp'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys()
  .then(names=>Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE)
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
 const media=/\.(?:webp|png|svg|wav|ico)$/i.test(url.pathname);
 if(media){
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{
   if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,response.clone())));
   return response;
  })));
 }else{
  // HTML, CSS og JavaScript: hent seneste ved netforbindelse, brug cache offline.
  event.respondWith(fetch(req).then(response=>{
   if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,response.clone())));
   return response;
  }).catch(async()=> (await caches.match(req)) || (req.mode==='navigate' ? caches.match('./index.html') : undefined)));
 }
});
