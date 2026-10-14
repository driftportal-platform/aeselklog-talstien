const CACHE='aeselklog-talstien-v09-save-adaptive';
const CORE=['./','./index.html','./app.js','./engine.js','./board.js','./actions.js','./leaderboard.js','./adaptive.js','./savegame.js','./manifest.webmanifest','./icon.svg','./aeselklog-card.webp','./donkey-bray.wav'];
self.addEventListener('install',ev=>ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',ev=>ev.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',ev=>{if(ev.request.method!=='GET'||new URL(ev.request.url).origin!==location.origin)return;
 ev.respondWith(fetch(ev.request).then(response=>{const copy=response.clone();if(response.ok)caches.open(CACHE).then(c=>c.put(ev.request,copy)).catch(()=>{});return response;}).catch(()=>caches.match(ev.request)));
});
