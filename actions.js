/* ÆselKlog Talstien v0.8-C – ét fælles regelsæt for digitale specialfelter.
   Ren logik, testbar i Node og browser. Ingen persondata eller netværk. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselActions=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const FIELDS=Object.freeze({
  5:'bonus',7:'gulerod',10:'hov',15:'byt',16:'vandpyt',
  24:'mester',27:'overraskelse',29:'bonus',35:'byt',37:'bro',
  44:'bonus',47:'gulerod',50:'mester',55:'hov',57:'super',
  64:'hov',67:'vandpyt',69:'bonus',75:'byt',78:'overraskelse',
  84:'bonus',86:'gulerod',90:'hov',93:'super',95:'mester'
 });
 const DETAILS=Object.freeze({
  bonus:{icon:'⭐',label:'Bonus',description:'Ryk 2 felter frem'},
  hov:{icon:'🫏',label:'Hov hov!',description:'Ryk 2 felter tilbage'},
  byt:{icon:'🔄',label:'Byt',description:'Byt plads med en anden spiller'},
  mester:{icon:'🏆',label:'Talmester',description:'Ryk 1 felt frem'},
  gulerod:{icon:'🥕',label:'Gulerod',description:'Et ekstra terningkast, højst én gang på samme tur'},
  vandpyt:{icon:'💧',label:'Vandpyt',description:'Stå over din næste tur'},
  overraskelse:{icon:'🎁',label:'Overraskelse',description:'Vind eller tab felter'},
  bro:{icon:'🌉',label:'Bro',description:'Tag genvejen 4 felter frem'},
  super:{icon:'🎯',label:'Superopgave',description:'Frivillig opgave: vind 3 felter'}
 });
 // Antallet bliver valgt særskilt ved hvert nyt spil. Det gamle FIELDS-kort
 // beholdes af hensyn til allerede gemte spil fra før v0.9.13.
 const COUNT_RANGES=Object.freeze({
  gulerod:[3,5],bro:[2,4],vandpyt:[2,4],bonus:[4,6],
  hov:[2,4],byt:[1,3],mester:[1,3],overraskelse:[1,3],super:[1,2]
 });
 function randomUnit(rng){
  const value=Number(rng());
  return Number.isFinite(value)?Math.min(1-Number.EPSILON,Math.max(0,value)):0;
 }
 function randomInteger(min,max,rng){return min+Math.floor(randomUnit(rng)*(max-min+1));}
 function shuffle(values,rng){
  for(let i=values.length-1;i>0;i--){
   const j=randomInteger(0,i,rng);[values[i],values[j]]=[values[j],values[i]];
  }
  return values;
 }
 // 15 mulige pladser i hvert af de fem talområder; start/mål friholdes
 // også når man kun vælger ét område (fx 21–40).
 function chooseLaneFields(lane,count,rng){
  const gap=count<=5?3:2;
  const choices=15-(gap-1)*(count-1);
  const picks=shuffle(Array.from({length:choices},(_,i)=>i),rng).slice(0,count).sort((a,b)=>a-b);
  return picks.map((index,i)=>20*lane+4+index+(gap-1)*i);
 }
 function generateLayout(rng=Math.random){
  const types=[];
  for(const [type,[min,max]] of Object.entries(COUNT_RANGES)){
   const count=randomInteger(min,max,rng);
   for(let i=0;i<count;i++)types.push(type);
  }
  const orderedLanes=shuffle([0,1,2,3,4],rng);
  const totals=Array(5).fill(Math.floor(types.length/5));
  for(let i=0;i<types.length%5;i++)totals[orderedLanes[i]]++;
  const positions=[];
  for(let lane=0;lane<5;lane++)positions.push(...chooseLaneFields(lane,totals[lane],rng));
  shuffle(types,rng);
  const layout={};
  positions.sort((a,b)=>a-b).forEach((number,i)=>{layout[number]=types[i];});
  return layout;
 }
 function validateLayout(layout){
  if(!layout||typeof layout!=='object'||Array.isArray(layout))return false;
  const entries=Object.entries(layout),counts={},lanes=[0,0,0,0,0];
  for(const [type] of Object.entries(COUNT_RANGES))counts[type]=0;
  const numbers=[];
  for(const [text,type] of entries){
   const n=Number(text),lane=Math.floor((n-1)/20);
   if(!Number.isInteger(n)||String(n)!==text||lane<0||lane>4||n<lane*20+4||n>lane*20+18||!Object.prototype.hasOwnProperty.call(COUNT_RANGES,type))return false;
   counts[type]++;lanes[lane]++;numbers.push(n);
  }
  numbers.sort((a,b)=>a-b);
  if(numbers.some((n,i)=>i>0&&n-numbers[i-1]<2))return false;
  if(Math.max(...lanes)-Math.min(...lanes)>1)return false;
  return Object.entries(COUNT_RANGES).every(([type,[min,max]])=>counts[type]>=min&&counts[type]<=max);
 }
 const SURPRISES=Object.freeze([
  {delta:3,title:'Heldig gulerod!',speech:'En gulerodsmagi sender dig tre felter frem!'},
  {delta:2,title:'Medvind!',speech:'Medvind i ørerne! Du hopper to felter frem!'},
  {delta:-1,title:'Hø på vejen!',speech:'Ups! Der lå hø i vejen. Ét felt tilbage!'},
  {delta:-2,title:'Æselspjæt!',speech:'Hov hov! To felter tilbage!'}
 ]);
 function surprise(rng=Math.random){
  const n=rng();
  const i=Math.max(0,Math.min(SURPRISES.length-1,Math.floor(Number.isFinite(n)?n*SURPRISES.length:0)));
  return SURPRISES[i];
 }
 function destination(position,delta,start,goal){
  return Math.max(start,Math.min(goal,position+delta));
 }
 function validate(){
  const slots=Object.entries(FIELDS);
  if(slots.length!==25)return false;
  const counts=[0,0,0,0,0];
  for(const [k,type] of slots){const n=Number(k);if(!Number.isInteger(n)||n<1||n>100||!DETAILS[type])return false;counts[Math.floor((n-1)/20)]++;}
  return counts.every(n=>n===5);
 }
 return {FIELDS,DETAILS,COUNT_RANGES,SURPRISES,surprise,destination,validate,validateLayout,generateLayout};
});
