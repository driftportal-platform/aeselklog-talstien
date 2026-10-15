/* ÆselKlog v0.9.10 – lokale øvelsesniveauer pr. kaldenavn.
   Intet login, ingen netværkskald, ingen alder eller personlige talebeskeder. */
(function(root,factory){
 const api=factory(root?.AeselAdaptive||(typeof require==='function'?require('./adaptive.js'):null));
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselProfiles=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(P){
 'use strict';
 const KEY='aeselklog-laereprofiler-v1';
 const VERSION=1,MAX_PROFILES=12,MAX_IDS=64;
 function normName(name){
  const n=String(name||'').trim().replace(/\s+/g,' ').slice(0,24);
  if(!n||/^spiller\s*\d+$/i.test(n)||/^æs(let|el)$/i.test(n))return '';
  return n.toLocaleLowerCase('da-DK');
 }
 function readAll(storage){
  try{
   const raw=storage?.getItem(KEY);
   if(!raw||raw.length>45000)return {};
   const saved=JSON.parse(raw);
   if(saved?.version!==VERSION||!saved.profiles||typeof saved.profiles!=='object')return {};
   return saved.profiles;
  }catch(_){return {}}
 }
 function read(storage,name){
  if(!P||!normName(name))return null;
  const entry=readAll(storage)[normName(name)];
  return entry&&typeof entry==='object'?P.cleanProgress(entry.progress):null;
 }
 function record(storage,name,progress,exerciseId){
  const key=normName(name);
  if(!storage||!P||!key)return {saved:false,reason:'unavailable'};
  try{
   const all=readAll(storage),existing=all[key];
   const previousIds=Array.isArray(existing?.seen)?existing.seen.filter(s=>typeof s==='string'&&s.length<100).slice(-MAX_IDS):[];
   const id=typeof exerciseId==='string'&&exerciseId.length<100?exerciseId:'';
   if(id&&previousIds.includes(id))return {saved:true,duplicate:true,progress:P.cleanProgress(existing.progress)};
   const nameText=String(name).trim().replace(/\s+/g,' ').slice(0,24);
   all[key]={name:nameText,updatedAt:Date.now(),progress:P.cleanProgress(progress),seen:id?[...previousIds,id].slice(-MAX_IDS):previousIds};
   const ranked=Object.entries(all).filter(([k,v])=>k===normName(k)&&v&&typeof v==='object')
    .sort((a,b)=>(Number(b[1].updatedAt)||0)-(Number(a[1].updatedAt)||0)).slice(0,MAX_PROFILES);
   storage.setItem(KEY,JSON.stringify({version:VERSION,profiles:Object.fromEntries(ranked)}));
   return {saved:true,duplicate:false,progress:P.cleanProgress(progress)};
  }catch(_){return {saved:false,reason:'storage'}}
 }
 function list(storage){
  return Object.values(readAll(storage)).filter(x=>x&&typeof x==='object').map(x=>({name:String(x.name||'').slice(0,24),updatedAt:Number(x.updatedAt)||0}));
 }
 function clear(storage){try{storage?.removeItem(KEY);return Boolean(storage)}catch(_){return false}}
 return {KEY,normName,read,record,list,clear};
});
