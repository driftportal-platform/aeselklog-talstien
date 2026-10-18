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
  put: async()=>{},
  match: async req=> (typeof req==='string'&&req.endsWith('home-fullscreen.webp')?{ok:true,from:'media-cache'}:undefined)
};
const caches={
  open:async name=>{cacheMap.set(name,cache);return cache},
  keys:async()=>['unrelated-app-cache','aeselklog-talstien-v096-compact-resume','aeselklog-talstien-v097-offline','aeselklog-talstien-v098-voice-cache','aeselklog-talstien-v099-voice-cache'],
  delete:async name=>{deleted.push(name);return true},
  match:async req=>typeof req==='string'&&req==='./index.html' ? {ok:true,from:'index-offline'} : req.mode==='navigate' ? undefined : (req.url||'').endsWith('home-fullscreen.webp') ? {ok:true,from:'media-cache'} : {ok:true,from:'asset-offline'}
};
let fetches=0;
let networkOffline=true,networkHangs=false;
async function fetchMock(req){fetches++;if(networkHangs)return new Promise(()=>{});if(networkOffline)throw Error('offline');return {ok:true,clone(){return this},from:'network'}}
const scope='https://example.org/aeselklog-talstien/';
const self={
  addEventListener:(name,cb)=>{listeners[name]=cb},
  skipWaiting:async()=>{},
  clients:{claim:async()=>{}},
  location:{origin:'https://example.org'},
  registration:{scope}
};
// Kort timeout i testen i stedet for de rigtige 3 sekunder.
const fastTimeout=fn=>setTimeout(fn,5);
vm.runInNewContext(worker,{self,caches,fetch:fetchMock,URL,Promise,console,setTimeout:fastTimeout,clearTimeout});
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
  assert([...cacheMap.keys()].some(name=>/^aeselklog-talstien-v\d+$/.test(name)),'PWA must use a cache name derived from VERSION');
  assert(precached.includes('./cardgame-engine.js'),'new card game rules must work offline');
  assert(precached.includes('./cardgame-ui.js'),'card game UI must work offline');
  assert(precached.includes('./music.js'),'offline music must precache');
  assert(precached.includes('./numbers.js'),'number speech must work offline');
  assert(precached.includes('./talkort.js'),'talkort viewer must work offline');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  for(const icon of manifest.icons){const rel=icon.src.replace(/^\.\//,'');assert(fs.existsSync(path.join(root,rel)),'manifest icon missing '+icon.src);assert(precached.includes(icon.src),'manifest icon must be precached '+icon.src)}
  assert(manifest.icons.some(i=>i.type==='image/png'&&i.sizes==='512x512'&&i.purpose==='maskable'),'maskable PNG icon required');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(html.includes('rel="apple-touch-icon"'),'iOS needs apple-touch-icon');
  assert(precached.includes('./apple-touch-icon.png'),'apple-touch-icon must be precached');
  const swVersion=/const VERSION='([0-9.]+)'/.exec(worker)?.[1],pageVersion=/PRØVEVERSION ([0-9.]+)/.exec(html)?.[1];
  assert.equal(swVersion,pageVersion,'sw.js VERSION must match the version shown in index.html');
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
  networkHangs=true;
  const slow=await dispatch('fetch',{method:'GET',url:scope+'app.js',mode:'same-origin'});
  assert.equal(slow.from,'asset-offline','hanging network must fall back to cache after the timeout');
  const slowNav=await dispatch('fetch',{method:'GET',url:scope,mode:'navigate'});
  assert.equal(slowNav.from,'index-offline','hanging network must serve precached index for navigation');
  console.log('PASS: CSS precache, app-only cache cleanup, 3 MP3 media assets, fresh JS online, network timeout fallback');
})().catch(error=>{console.error(error);process.exit(1)});
