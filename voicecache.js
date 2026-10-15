/* ÆselKlog v0.9.8 – lokal lydcache for udvalgte, upersonlige AI-sætninger.
   Lagrer hverken børnenavne, frit indtastet tekst, API-nøgler eller opgaver med navne.
   IndexedDB gemmer lyden på den aktuelle enhed; ingen uploads eller synkronisering. */
(function(root,factory){
 const api=factory(root);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselVoiceCache=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(root){
 'use strict';
 const DATABASE='aeselklog-ai-lyd-v1';
 const STORE='clips';
 const FORMAT='tts-worker-v1'; // Ændr denne ved ændringer i Workerens lydmodel/stemmeopsætning.
 const MAX_BYTES=15*1024*1024;
 const MAX_ITEMS=70;
 const MAX_CLIP_BYTES=2_500_000;
 const MIN_CLIP_BYTES=500;
 let openPromise=null;
 const normalize=text=>String(text??'').replace(/ÆselKlog/g,'Æsel Klog').replace(/Hov hov!/g,'Hov, hov!').trim().slice(0,350);
 // Bevidst snæver positivliste: disse sætninger indeholder ingen spilleroplysninger.
 const fixed=[
  'Hov, hov! I byttede pladser.',
  'Hov, hov! Nu er det din tur.',
  'Hov, hov! Nu kan du høre mig!',
  'Hov, hov! Jeg er Æsel Klog, og jeg glæder mig til at spille med jer!',
  'Hov, hov! Du står på syvogtyve. Er fireogtredive større eller mindre end syvogtyve?',
  'Hov, hov! Jeg glæder mig til at lege med tallene!',
  'Høhø! Jeg er Æslet. Fem gange tre? Jeg gætter på femten!',
  'En gulerodsmagi sender dig tre felter frem!',
  'Medvind i ørerne! Du hopper to felter frem!',
  'Ups! Der lå hø i vejen. Ét felt tilbage!',
  'Hov, hov! To felter tilbage!'
 ];
 // CPU-æslet hedder altid "Æslet" og bruger de offentlige, faste actionbeskrivelser.
 const actionDescriptions=[
  ['Bonus','Ryk 2 felter frem'],['Hov hov!','Ryk 2 felter tilbage'],
  ['Byt','Byt plads med en anden spiller'],['Talmester','Ryk 1 felt frem'],
  ['Gulerod','Et ekstra terningkast, højst én gang på samme tur'],
  ['Vandpyt','Stå over din næste tur'],['Overraskelse','Vind eller tab felter'],
  ['Bro','Tag genvejen 4 felter frem'],['Superopgave','Frivillig opgave: vind 3 felter']
 ];
 for(const [name,description] of actionDescriptions)fixed.push(`Æslet! ${name}. ${description}.`);
 const safe=new Set(fixed.map(normalize));
 // Begge udgaver af de samme anonyme sætninger må gemmes lokalt.
 // Variationen tilføjer ALDRIG brugerdefinerede eller personlige sætninger.
 for(const phrase of fixed){
  const text=normalize(phrase);
  if(/^Hov, hov!\s+/.test(text))safe.add(text.replace(/^Hov, hov!\s+/,''));
 }
 function isSafePhrase(text){return safe.has(normalize(text))}
 function makeKey({endpoint,voiceId,text}={}){
  if(!isSafePhrase(text)||typeof voiceId!=='string'||!/^[a-zA-Z0-9_-]{1,50}$/.test(voiceId)||
    typeof endpoint!=='string'||!/^https:\/\/[^\s]{5,160}\/tts$/.test(endpoint))return null;
  // Samme tekst må ALDRIG deles mellem forskellige AI-stemmer eller Workers.
  return `${FORMAT}|${endpoint}|${voiceId}|${normalize(text)}`;
 }
 async function database(){
  if(openPromise)return openPromise;
  openPromise=new Promise(resolve=>{
   if(!root?.indexedDB){resolve(null);return}
   let done=false,request;
   const finish=db=>{if(done){db?.close?.();return}done=true;clearTimeout(timer);resolve(db)};
   const timer=setTimeout(()=>finish(null),3000); // Undgå at blokere en tur på iOS.
   try{request=root.indexedDB.open(DATABASE,1)}catch(_){finish(null);return}
   request.onupgradeneeded=()=>{
    try{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'key'})}catch(_){}
   };
   request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();finish(db)};
   request.onerror=()=>finish(null);
   request.onblocked=()=>finish(null);
  });
  return openPromise;
 }
 function read(db,key){
  return new Promise(resolve=>{
   let request;
   try{request=db.transaction(STORE,'readonly').objectStore(STORE).get(key)}
   catch(_){resolve(null);return}
   request.onsuccess=()=>{
    const entry=request.result;
    resolve(entry?.bytes instanceof ArrayBuffer&&entry.bytes.byteLength>=MIN_CLIP_BYTES&&
      entry.bytes.byteLength<=MAX_CLIP_BYTES?entry.bytes:null);
   };
   request.onerror=()=>resolve(null);
  });
 }
 async function get(options){
  const key=makeKey(options);if(!key)return null;
  const db=await database();if(!db)return null;
  try{return await read(db,key)}catch(_){return null}
 }
 async function put(options,bytes){
  const key=makeKey(options);
  if(!key||!(bytes instanceof ArrayBuffer)||bytes.byteLength<MIN_CLIP_BYTES||bytes.byteLength>MAX_CLIP_BYTES)return false;
  const db=await database();if(!db)return false;
  return new Promise(resolve=>{
   let completed=false;
   const finish=ok=>{if(!completed){completed=true;resolve(ok)}};
   try{
    const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
    const req=store.getAll();
    req.onsuccess=()=>{
     const others=(req.result||[]).filter(r=>r.key!==key).sort((a,b)=>a.createdAt-b.createdAt);
     let count=others.length,total=others.reduce((sum,r)=>sum+(r.size||0),0);
     while(others.length&&(count>=MAX_ITEMS||total+bytes.byteLength>MAX_BYTES)){
      const oldest=others.shift();store.delete(oldest.key);count--;total-=oldest.size||0;
     }
     store.put({key,bytes,size:bytes.byteLength,createdAt:Date.now()});
    };
    req.onerror=()=>{try{tx.abort()}catch(_){}};
    tx.oncomplete=()=>finish(true);
    tx.onerror=()=>finish(false);
    tx.onabort=()=>finish(false);
   }catch(_){finish(false)}
  });
 }
 async function stats(){
  const db=await database();if(!db)return {available:false,count:0,bytes:0,limit:MAX_BYTES};
  return new Promise(resolve=>{
   const result=(available,count=0,bytes=0)=>resolve({available,count,bytes,limit:MAX_BYTES});
   try{
    const request=db.transaction(STORE,'readonly').objectStore(STORE).getAll();
    request.onsuccess=()=>result(true,request.result.length,request.result.reduce((n,r)=>n+(r.size||0),0));
    request.onerror=()=>result(false);
   }catch(_){result(false)}
  });
 }
 async function clear(){
  const db=await database();if(!db)return false;
  return new Promise(resolve=>{
   try{
    const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false);
   }catch(_){resolve(false)}
  });
 }
 async function remove(options){
  const key=makeKey(options);if(!key)return false;
  const db=await database();if(!db)return false;
  return new Promise(resolve=>{
   try{
    const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false);
   }catch(_){resolve(false)}
  });
 }
 return Object.freeze({get,put,stats,clear,remove,isSafePhrase,makeKey,MAX_BYTES,MAX_ITEMS});
});
