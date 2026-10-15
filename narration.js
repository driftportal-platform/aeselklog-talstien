/* ÆselKlog v0.9.10.1 – variation af oplæserens indledning.
   Ren tekstlogik: intet netværk, ingen ekstra stemmekald og ingen ændringer af CPU-svar. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselNarration=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const HOV_CHANCE=0.35;
 // Kun en INDLEDENDE hilsen kan udelades. Handlingsfelter og beskeder
 // der nævner 'Hov hov' senere i teksten må ikke ændres.
 const INTRO=/^\s*Hov\s*,?\s*hov!\s*/i;
 function prepare(text,{cpu=false,repeat=false,random=Math.random}={}){
  const line=String(text??'');
  if(cpu||repeat)return line;
  const match=INTRO.exec(line);
  if(!match)return line;
  const withoutIntro=line.slice(match[0].length).trimStart();
  if(!withoutIntro)return line;
  // Omtrent 35 % beholder 'Hov hov!'; resten går direkte til beskeden.
  const n=Number(random());
  return n>=0&&n<HOV_CHANCE?line:withoutIntro;
 }
 return Object.freeze({prepare,HOV_CHANCE});
});
