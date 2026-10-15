/* ÆselKlog v0.9.12 – små visuelle hændelser, kun præsentation. Ingen nye spilregler. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselActionFX=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const STYLES=Object.freeze({
  bonus:{tone:'reward',badge:'+2',symbol:'⭐'},
  mester:{tone:'reward',badge:'+1',symbol:'🏆'},
  bro:{tone:'reward',badge:'+4',symbol:'🌉'},
  hov:{tone:'oops',badge:'−2',symbol:'🫏'},
  vandpyt:{tone:'water',badge:'Næste tur over',symbol:'💧'},
  gulerod:{tone:'reward',badge:'Ekstra kast',symbol:'🥕'},
  byt:{tone:'choice',badge:'Vælg spiller',symbol:'🔄'},
  overraskelse:{tone:'surprise',badge:'Hvad mon?',symbol:'🎁'},
  super:{tone:'choice',badge:'Frivillig',symbol:'🎯'}
 });
 function describe(type,{delta,used=false}={}){
  const name=Object.hasOwn(STYLES,type)?type:'default';
  const base=STYLES[name]||{tone:'choice',badge:'',symbol:'⭐'};
  let tone=base.tone,badge=base.badge;
  // For overraskelse vises først ?, derpå præcis antal felter (efter clipping).
  if(type==='overraskelse'&&Number.isInteger(delta)&&Math.abs(delta)<=100){
   tone=delta>0?'reward':delta<0?'oops':'choice';
   badge=delta>0?'+'+delta:delta<0?'−'+Math.abs(delta):'Bliv stående';
  }
  if(type==='gulerod'&&used)badge='Allerede brugt';
  // Den faktiske flytning kan begrænses af banegrænserne.
  if(type!=='overraskelse'&&['bonus','mester','bro','hov'].includes(type)&&Number.isInteger(delta)&&Math.abs(delta)<=100){
    badge=delta>0?'+'+delta:delta<0?'−'+Math.abs(delta):'Bliv stående';
  }
  return Object.freeze({type:name,tone,badge,symbol:base.symbol});
 }
 return Object.freeze({describe});
});
