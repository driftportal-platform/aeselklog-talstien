/* ÆselKlog v0.9.11 – lokale, valgfri læringsprofiler og begrænset øvelseshistorik.
   Bevarer v1-lagernøglen og gamle profiler uden historik. Ingen alder, facit,
   opgavetekst, følsomme data eller serverforbindelse. */
(function(root,factory){
 const api=factory(root?.AeselAdaptive||(typeof require==='function'?require('./adaptive.js'):null));
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselProfiles=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(P){
 'use strict';
 const KEY='aeselklog-laereprofiler-v1';
 const VERSION=1,MAX_PROFILES=12,MAX_IDS=64,MAX_HISTORY=96,MAX_DATA_BYTES=180000;
 function normName(name){
  const n=String(name||'').trim().replace(/\s+/g,' ').slice(0,24);
  if(!n||/^spiller\s*\d+$/i.test(n)||/^æs(let|el)$/i.test(n))return '';
  return n.toLocaleLowerCase('da-DK');
 }
 function readAll(storage){
  try{
   const raw=storage?.getItem(KEY);
   if(!raw||raw.length>MAX_DATA_BYTES)return {};
   const saved=JSON.parse(raw);
   if(saved?.version!==VERSION||!saved.profiles||typeof saved.profiles!=='object'||Array.isArray(saved.profiles))return {};
   return saved.profiles;
  }catch(_){return {}}
 }
 function read(storage,name){
  if(!P||!normName(name))return null;
  const all=readAll(storage),key=normName(name);
  const entry=Object.prototype.hasOwnProperty.call(all,key)?all[key]:null;
  return entry&&typeof entry==='object'?P.cleanProgress(entry.progress):null;
 }
 // History is stored as bounded, anonymised per-exercise *outcomes*, not question
 // contents, names of other players, age or exact answers.
 function cleanAttempt(attempt){
  if(!attempt||typeof attempt!=='object'||!P?.isArea(attempt.area)||typeof attempt.correct!=='boolean')return null;
  const at=Number(attempt.t??attempt.at??Date.now());
  if(!Number.isFinite(at)||at<0||at>Date.now()+86400000)return null;
  return {t:Math.floor(at),area:attempt.area,correct:attempt.correct,
   helped:Boolean(attempt.helped),step:Math.max(-2,Math.min(2,Math.round(Number(attempt.step)||0)))};
 }
 function cleanHistory(raw){
  if(!Array.isArray(raw))return [];
  return raw.slice(-MAX_HISTORY).map(cleanAttempt).filter(Boolean);
 }
 function record(storage,name,progress,exerciseId,attempt){
  const key=normName(name);
  if(!storage||!P||!key)return {saved:false,reason:'unavailable'};
  try{
   const all=Object.assign(Object.create(null),readAll(storage));
   const existing=Object.prototype.hasOwnProperty.call(all,key)?all[key]:null;
   const previousIds=Array.isArray(existing?.seen)?existing.seen.filter(s=>typeof s==='string'&&s.length<100).slice(-MAX_IDS):[];
   const id=typeof exerciseId==='string'&&exerciseId.length<100?exerciseId:'';
   if(id&&previousIds.includes(id))return {saved:true,duplicate:true,progress:P.cleanProgress(existing.progress)};
   const nameText=String(name).trim().replace(/\s+/g,' ').slice(0,24);
   const oldHistory=cleanHistory(existing?.history);
   const detail=cleanAttempt(attempt);
   const history=detail?[...oldHistory,detail].slice(-MAX_HISTORY):oldHistory;
   all[key]={name:nameText,updatedAt:Date.now(),progress:P.cleanProgress(progress),
    seen:id?[...previousIds,id].slice(-MAX_IDS):previousIds,history};
   const ranked=Object.entries(all).filter(([k,v])=>k===normName(k)&&v&&typeof v==='object')
    .sort((a,b)=>(Number(b[1].updatedAt)||0)-(Number(a[1].updatedAt)||0)).slice(0,MAX_PROFILES);
   storage.setItem(KEY,JSON.stringify({version:VERSION,profiles:Object.fromEntries(ranked)}));
   return {saved:true,duplicate:false,progress:P.cleanProgress(progress)};
  }catch(_){return {saved:false,reason:'storage'}}
 }
 function list(storage){
  return Object.values(readAll(storage)).filter(x=>x&&typeof x==='object'&&normName(x.name))
   .map(x=>({name:String(x.name).slice(0,24),updatedAt:Number(x.updatedAt)||0}))
   .sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,MAX_PROFILES);
 }
 function report(storage,name){
  const key=normName(name);if(!key||!P)return null;
  const all=readAll(storage);
  const entry=Object.prototype.hasOwnProperty.call(all,key)?all[key]:null;
  if(!entry||typeof entry!=='object')return null;
  return {name:String(entry.name||'').slice(0,24),updatedAt:Number(entry.updatedAt)||0,
   progress:P.cleanProgress(entry.progress),history:cleanHistory(entry.history)};
 }
 function remove(storage,name){
  const key=normName(name);if(!storage||!key)return false;
  try{
   const all=readAll(storage);if(!Object.prototype.hasOwnProperty.call(all,key))return false;
   delete all[key];
   if(Object.keys(all).length)storage.setItem(KEY,JSON.stringify({version:VERSION,profiles:all}));
   else storage.removeItem(KEY);
   return true;
  }catch(_){return false}
 }
 function clear(storage){try{storage?.removeItem(KEY);return Boolean(storage)}catch(_){return false}}
 return {KEY,normName,read,record,list,report,remove,clear};
});
