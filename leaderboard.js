/* ÆselKlog v0.8-D – lokale resultater. Kun kaldenavne og spilstatistik, ingen aldersdata/netværk. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselLeaderboard=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
'use strict';
const KEY='aeselklog-topscore-v1';
function cleanName(x){return String(x||'Spiller').trim().slice(0,24)||'Spiller';}
function cleanRecords(input){
 if(!Array.isArray(input))return [];
 return input.slice(0,150).filter(o=>o&&typeof o==='object').map(o=>({
  name:cleanName(o.name),isCPU:Boolean(o.isCPU),
  games:Math.max(0,Math.floor(Number(o.games)||0)),
  wins:Math.max(0,Math.floor(Number(o.wins)||0)),
  correct:Math.max(0,Math.floor(Number(o.correct)||0)),
  attempted:Math.max(0,Math.floor(Number(o.attempted)||0))
 })).map(o=>({...o,wins:Math.min(o.wins,o.games),correct:Math.min(o.correct,o.attempted)}));
}
function read(storage){
 try{return cleanRecords(JSON.parse(storage?.getItem(KEY)||'[]'));}catch(_){return [];}
}
function save(storage,records){try{storage?.setItem(KEY,JSON.stringify(cleanRecords(records)));return true;}catch(_){return false;}}
function sorted(records){return [...cleanRecords(records)].sort((a,b)=>b.wins-a.wins || b.correct-a.correct || b.games-a.games || a.name.localeCompare(b.name,'da'));}
function record(storage,players,winnerId){
 if(!Array.isArray(players)||!winnerId)return [];
 const records=read(storage);
 for(const p of players){
  const name=cleanName(p.name),isCPU=Boolean(p.isCPU);
  const prior=records.find(x=>x.isCPU===isCPU&&x.name.toLocaleLowerCase('da')===name.toLocaleLowerCase('da'));
  const item=prior||{name,isCPU,games:0,wins:0,correct:0,attempted:0};
  item.games++;
  item.wins+=p.id===winnerId?1:0;
  item.correct+=Math.max(0,Math.floor(Number(p.stats?.correct)||0));
  item.attempted+=Math.max(0,Math.floor(Number(p.stats?.attempted)||0));
  if(!prior)records.push(item);
 }
 save(storage,records);
 return sorted(records);
}
function clear(storage){try{storage?.removeItem(KEY);return true;}catch(_){return false;}}
return {KEY,read,save,sorted,record,clear};
});
