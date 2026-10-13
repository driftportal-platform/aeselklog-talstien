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
 return {FIELDS,DETAILS,SURPRISES,surprise,destination,validate};
});
