/* v0.9.7: test Service Worker cache rules without network or browser. */
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const listeners={};
const deleted=[];
const cacheMap=new Map();
const precached=[];
const cache={
  addAll: async files=>{precached.push(...files)},
  put: async()=>{}
};
const caches={
  open:async name=>{cacheMap.set(name,cache);return cache},
  keys:async()=>['unrelated-app-cache','aeselklog-talstien-v096-compact-resume','aeselklog-talstien-v097-offline','aeselklog-talstien-v098-voice-cache','aeselklog-talstien-v099-voice-cache'],
  delete:async name=>{deleted.push(name);return true},
  match:async req=>typeof req==='string'&&req==='./index.html' ? {ok:true,from:'index-offline'} : req.mode==='navigate' ? undefined : (req.url||'').endsWith('home-fullscreen.webp') ? {ok:true,from:'media-cache'} : {ok:true,from:'asset-offline'}
};
let fetches=0;
let networkOffline=true;
async function fetchMock(req){fetches++;if(networkOffline)throw Error('offline');return {ok:true,clone(){return this},from:'network'}}
const scope='https://example.org/aeselklog-talstien/';
const self={
  addEventListener:(name,cb)=>{listeners[name]=cb},
  skipWaiting:async()=>{},
  clients:{claim:async()=>{}},
  location:{origin:'https://example.org'},
  registration:{scope}
};
vm.runInNewContext(worker,{self,caches,fetch:fetchMock,URL,Promise,console});
async function dispatch(name,request){
  let result;
  let lifetime=[];
  const ev={request,waitUntil:pr=>{lifetime.push(Promise.resolve(pr))},respondWith:pr=>{result=Promise.resolve(pr)}};
  listeners[name](ev);
  if(result)await result;
  await Promise.all(lifetime);
  return result;
}
(async()=>{
  await dispatch('install');
  assert(precached.includes('./styles.css'),'external CSS must be available offline');
  assert(precached.includes('./voicecache.js'),'voice cache module must be available offline');
  assert(precached.includes('./narration.js'),'narrator variation must be available offline');
  assert(precached.includes('./profiles.js'),'learning profiles module must be available offline');
  assert(precached.includes('./parentreport.js'),'parent report module must be available offline');
  assert(precached.includes('./actionfx.js'),'action effects must be available offline');
  assert(worker.includes('aeselklog-talstien-v0923-number-pauses'),'PWA must use v0.9.23 cache');
  assert(precached.includes('./cardgame-engine.js'),'new card game rules must work offline');
  assert(precached.includes('./cardgame-ui.js'),'card game UI must work offline');
  assert(precached.includes('./music.js'),'offline music must precache');
  assert(precached.includes('./numbers.js'),'number speech must work offline');
  for(const name of ['gone-fishin.mp3','childrens-march.mp3','beary-fishy.mp3'])assert(precached.includes('./music/'+name),'PWA must precache '+name);
  for(const asset of precached){
    const relative=asset.replace(/^\.\//,'');
    if(relative)assert(fs.existsSync(path.join(root,relative)),`missing precached file ${asset}`);
  }
  await dispatch('activate');
  assert(deleted.includes('aeselklog-talstien-v096-compact-resume'));
  assert(deleted.includes('aeselklog-talstien-v097-offline'));
  assert(deleted.includes('aeselklog-talstien-v099-voice-cache'));
  assert(!deleted.includes('unrelated-app-cache'),'SW must not delete other sites caches');
  const art=await dispatch('fetch',{method:'GET',url:scope+'home-fullscreen.webp',mode:'same-origin'});
  assert.equal(art.from,'media-cache');assert.equal(fetches,0,'image must use pre-cache first');
  const js=await dispatch('fetch',{method:'GET',url:scope+'app.js',mode:'same-origin'});
  assert.equal(js.from,'asset-offline');assert.equal(fetches,1,'JS must try network and fall back offline');
  const nav=await dispatch('fetch',{method:'GET',url:scope+'?utm=abc',mode:'navigate'});
  // Navigation with query parameters falls back to precached ./index.html.
  assert.equal(nav.from,'index-offline');
  assert.equal(fetches,2);
  networkOffline=false;
  const jsFresh=await dispatch('fetch',{method:'GET',url:scope+'app.js',mode:'same-origin'});
  assert.equal(jsFresh.from,'network','JS must use fresh version online');
  console.log('PASS: CSS precache, app-only cache cleanup, 3 MP3 media assets, fresh JS online');
})().catch(error=>{console.error(error);process.exit(1)});
