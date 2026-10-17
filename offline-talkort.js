/* ÆselKlog – 500 forudgenererede MP3-tal. Hent efter behov eller offline-pakke. */
(()=>{'use strict';
const CACHE='aeselklog-number-audio-v1';
const base='./audio/numbers/';
const langs=new Set(['da','en','de','es']);
const names=['narrator','donkey','en','de','es'];
const allPaths=names.flatMap(name=>Array.from({length:100},(_,i)=>`${base}${name}/${String(i+1).padStart(3,'0')}.mp3`));
let serial=0,active=null,activeResolve=null,downloading=false,cancelDownload=false;
const ui=id=>document.getElementById(id);
const pathFor=(number,lang,role)=>`${base}${lang==='da'?(role==='donkey'?'donkey':'narrator'):lang}/${String(number).padStart(3,'0')}.mp3`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function stop(){serial++;if(active){active.pause();active.removeAttribute('src');active.load();active=null}if(activeResolve){const done=activeResolve;activeResolve=null;done()}}
async function play(number,selection,role='narrator'){
 const n=Number(number),parts=window.AeselNumbers?.parts(n,selection)||[];
 if(!Number.isInteger(n)||n<1||n>100||!parts.length)return false;
 const paths=parts.filter(p=>langs.has(p.lang)).map(p=>pathFor(n,p.lang,role));
 if(paths.length!==parts.length)return false;
 stop();const id=serial;
 const duck=window.AeselMusic?.beginSpeech?.();
 try{
  for(let i=0;i<paths.length;i++){
   if(id!==serial)return true;
   if(i){await wait(650);if(id!==serial)return true}
   const audio=new Audio(paths[i]);active=audio;audio.volume=1;audio.preload='auto';
   await new Promise((resolve,reject)=>{const finish=()=>{if(activeResolve===finish)activeResolve=null;resolve()};activeResolve=finish;audio.onended=finish;audio.onerror=()=>{if(activeResolve===finish)activeResolve=null;reject(new Error('MP3 mangler eller er beskadiget'))};audio.play().catch(error=>{if(activeResolve===finish)activeResolve=null;reject(error)})});
  }
  return true;
 }catch(err){
  if(id!==serial)return true;
  console.warn('Gemt talelyd ikke tilgængelig – brug fallback',err);
  return false;
 }finally{if(id===serial)active=null;if(duck!==undefined)window.AeselMusic?.endSpeech?.(duck)}
}
async function cachedCount(){
 if(!('caches' in window))return 0;
 const cache=await caches.open(CACHE);
 const keys=await cache.keys();
 return keys.filter(k=>k.url.includes('/audio/numbers/')&&k.url.endsWith('.mp3')).length;
}
async function refresh(){
 const e=ui('numberAudioStatus');if(!e)return;
 try{const n=await cachedCount();e.textContent=`${n} af 500 talelyde hentet til offlinebrug${n===500?' – klar!':''}.`}
 catch(_){e.textContent='Offline-lydlager kunne ikke åbnes på denne enhed.'}
}
async function downloadAll(){
 if(downloading||!('caches' in window))return;
 downloading=true;cancelDownload=false;
 const start=ui('downloadNumberAudio'),stopBtn=ui('stopNumberAudio');
 if(start)start.disabled=true;if(stopBtn)stopBtn.disabled=false;
 const status=ui('numberAudioStatus');
 try{
  const cache=await caches.open(CACHE);
  const urls=new Set((await cache.keys()).map(req=>req.url));
  let have=allPaths.filter(p=>urls.has(new URL(p,location.href).href)).length;
  if(status)status.textContent=`${have} af 500 talelyde hentet…`;
  for(const path of allPaths){
   if(cancelDownload)break;
   const url=new URL(path,location.href).href;
   if(urls.has(url))continue;
   // Download den fulde fil (aldrig et delvist Range-svar).
   const res=await fetch(url,{cache:'no-store'});
   if(!res.ok||res.status!==200||!res.headers.get('content-type')?.includes('audio'))throw new Error(`Kunne ikke hente ${path} (HTTP ${res.status})`);
   await cache.put(url,res.clone());urls.add(url);have++;
   if(status)status.textContent=`${have} af 500 talelyde hentet…`;
   if(have%10===0)await wait(80);
  }
  if(status)status.textContent=cancelDownload?`${have} af 500 gemt. Du kan fortsætte senere.`:`${have} af 500 gemt til offlinebrug${have===500?' – klar!':''}.`;
 }catch(err){if(status)status.textContent=`Download stoppet: ${err.message}. Tidligere hentede lyde er bevaret.`}
 finally{downloading=false;if(start)start.disabled=false;if(stopBtn)stopBtn.disabled=true}
}
ui('downloadNumberAudio')?.addEventListener('click',downloadAll);
ui('stopNumberAudio')?.addEventListener('click',()=>{cancelDownload=true});
window.AeselOfflineNumbers={play,stop,refresh,downloadAll,cachedCount,allPaths};
window.addEventListener('load',refresh);
})();
