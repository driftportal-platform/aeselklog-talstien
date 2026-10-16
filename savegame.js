/* ÆselKlog v0.9.10: bagudkompatible kontrolpunkter med områdebaseret læring. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselSave=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const KEY='aeselklog-igangvaerende-v1',SCHEMA=1;
 const PHASES=new Set(['move','learn','question','swap','super-offer','skipped','result']);
 const LEARNING=new Set(['leg','laer','udfordring','tabel']);
 const DICE=new Set(['digital','physical']);
 const PACE=new Set(['normal','rolig','ekstra']);
 const TABLES=new Set(['off','auto','mix',...Array.from({length:11},(_,i)=>String(i+2))]);
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function boundedNumber(n,a,b,defaultValue=a){const k=Number(n);return Number.isFinite(k)?clamp(Math.floor(k),a,b):defaultValue}
 const txt=(t,n=150)=>String(t??'').slice(0,n);
 const ACTION_TYPES=new Set(['bonus','hov','byt','mester','gulerod','vandpyt','overraskelse','bro','super']);
 function normalizeSpecialFields(fields){
  if(fields==null)return null; // Gammelt spil – det oprindelige faste A.FIELDS-kort.
  if(!fields||typeof fields!=='object'||Array.isArray(fields))return null;
  const entries=Object.entries(fields);
  if(entries.length<1||entries.length>40)return null;
  const normalized={};
  for(const [key,type] of entries){
   const n=Number(key);
   if(!Number.isInteger(n)||n<1||n>100||String(n)!==key||!ACTION_TYPES.has(type))return null;
   normalized[key]=type;
  }
  return normalized;
 }
 function normalize(snapshot){
  if(!snapshot||typeof snapshot!=='object'||snapshot.schema!==SCHEMA)return null;
  const c=snapshot.config;
  const allowedRanges=['1-100','1-20','21-40','41-60','61-80','81-100'];
  if(!c||!allowedRanges.includes(c.raw))return null;
  const all=c.raw==='1-100',range=c.raw.split('-').map(Number),start=all?0:range[0]-1,goal=range[1];
  const config={raw:c.raw,all,start,goal,learning:LEARNING.has(c.learning)?c.learning:'leg',
   boardMode:c.boardMode==='physical'?'physical':'digital',moveDice:DICE.has(c.moveDice)?c.moveDice:'digital',
   learnDice:DICE.has(c.learnDice)?c.learnDice:'digital',pace:PACE.has(c.pace)?c.pace:'rolig',
   tables:TABLES.has(String(c.tables))?String(c.tables):'auto',adaptive:c.adaptive!==false,rememberLearning:c.rememberLearning!==false};
  if(!Array.isArray(snapshot.players)||snapshot.players.length<1||snapshot.players.length>7)return null;
  let cpuCount=0;
  const players=[];
  for(const [i,p] of snapshot.players.entries()){
   if(!p||typeof p!=='object')return null;
   const isCPU=Boolean(p.isCPU);if(isCPU)cpuCount++;
   const adult=p.kind==='adult'&&!isCPU;
   const id=txt(p.id,24)||`player${i+1}`;
   const name=txt(p.name,24).trim()||`Spiller ${i+1}`;
   if(!/^[a-zA-Z0-9_-]{1,24}$/.test(id))return null;
   const stats=p.stats||{};const attempted=boundedNumber(stats.attempted,0,200000,0);
   const learning=p.learning||{};
   const legacyStep=boundedNumber(learning.step,-2,2,0);
   const sanitizeArea=v=>({step:boundedNumber(v?.step,-2,2,legacyStep),
    rightStreak:boundedNumber(v?.rightStreak,0,2,0),wrongStreak:boundedNumber(v?.wrongStreak,0,1,0),
    attempted:boundedNumber(v?.attempted,0,200000,0),correct:boundedNumber(v?.correct,0,200000,0)});
   const areas=Object.fromEntries(['numbers','plus','minus','tables'].map(area=>[area,sanitizeArea(learning.areas?.[area])]));
   players.push({id,name,kind:isCPU?'cpu':adult?'adult':'child',isCPU,
    age:isCPU?8:adult?18:boundedNumber(p.age,3,17,7),
    difficulty:['let','mellem','svaer'].includes(p.difficulty)?p.difficulty:'mellem',
    color:/^#[0-9a-f]{6}$/i.test(String(p.color))?p.color:(isCPU?'#c18b46':['#d84464','#227fcb','#24a667','#9361c9'][i%4]),
    pos:boundedNumber(p.pos,start,goal,start),skipNextTurn:Boolean(p.skipNextTurn),
    stats:{attempted,correct:boundedNumber(stats.correct,0,attempted,0)},
    learning:{step:legacyStep,rightStreak:boundedNumber(learning.rightStreak,0,2,0),
     wrongStreak:boundedNumber(learning.wrongStreak,0,1,0),attempted:boundedNumber(learning.attempted,0,200000,0),correct:boundedNumber(learning.correct,0,200000,0),areas} });
  }
  if(cpuCount>1||new Set(players.map(x=>x.id)).size!==players.length)return null;
  let phase=PHASES.has(snapshot.phase)?snapshot.phase:'move';
  const turn=boundedNumber(snapshot.turn,0,players.length-1,0);
  const pending=normalizePending(snapshot.pending,start,goal);
  const challenge=normalizeChallenge(snapshot.challenge);
  if(['question'].includes(phase)&&(!pending||!challenge))phase='learn';
  if(['learn','swap','super-offer'].includes(phase)&&!pending)phase='move';
  if(phase==='result'&&(!Array.isArray(snapshot.resultLines)))phase='move';
  const resultLines=(Array.isArray(snapshot.resultLines)?snapshot.resultLines:[]).slice(0,18).map(t=>txt(t,240));
  return {schema:SCHEMA,savedAt:boundedNumber(snapshot.savedAt,0,Date.now()+86400000,Date.now()),
   config,players,turn,phase,pending,challenge:phase==='question'?challenge:null,resultLines,
   extraRollUsed:Boolean(snapshot.extraRollUsed),timeLeftMs:boundedNumber(snapshot.timeLeftMs,0,60000,0),
   specialFields:normalizeSpecialFields(snapshot.specialFields)};
 }
 function normalizePending(p,start,goal){
  if(!p||typeof p!=='object')return null;
  return {from:boundedNumber(p.from,start,goal,start),roll:boundedNumber(p.roll,1,6,1),
   landing:boundedNumber(p.landing,start,goal,start),target:boundedNumber(p.target,start,goal,start),
   correct:Boolean(p.correct),skip:Boolean(p.skip),actionHandled:Boolean(p.actionHandled),
   superTask:Boolean(p.superTask),superCorrect:Boolean(p.superCorrect),
   feedback:txt(p.feedback,300)};
 }
 function normalizeChallenge(q){
  if(!q||typeof q!=='object'||!Array.isArray(q.options))return null;
  const type=boundedNumber(q.type,1,6,0);if(!type)return null;
  const options=q.options.slice(0,6).map(v=>txt(v,120));
  if(options.length<2||new Set(options).size!==options.length||!options.includes(txt(q.correct,120)))return null;
  return {type,question:txt(q.question,360),correct:txt(q.correct,120),options,help:txt(q.help,300),
   tier:txt(q.tier,60),timeLimit:boundedNumber(q.timeLimit,0,60,0),tableLabel:txt(q.tableLabel,80),
   adapted:Boolean(q.adapted),adaptiveStep:boundedNumber(q.adaptiveStep,-2,2,0),
   skillArea:['numbers','plus','minus','tables'].includes(q.skillArea)?q.skillArea:'',
   exerciseId:/^[a-zA-Z0-9_-]{1,80}$/.test(String(q.exerciseId||''))?q.exerciseId:''};
 }
 function read(storage){
  try{const raw=storage?.getItem(KEY);return raw&&raw.length<40000?normalize(JSON.parse(raw)):null}catch(_){return null}
 }
 function write(storage,state){
  try{const saved=normalize({...state,schema:SCHEMA,savedAt:Date.now()});if(!saved||!storage)return false;
   storage.setItem(KEY,JSON.stringify(saved));return true;
  }catch(_){return false}
 }
 function clear(storage){try{storage?.removeItem(KEY);return true}catch(_){return false}}
 return {KEY,SCHEMA,PHASES,normalize,normalizeSpecialFields,read,write,clear};
});
