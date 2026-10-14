/* ÆselKlog v0.9: alderssikker, individuel progression uden konto eller netværk. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselAdaptive=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function clean(input){
  const s=input&&typeof input==='object'?input:{};
  const num=(n,max)=>clamp(Math.floor(Number(n)||0),0,max);
  return {step:clamp(Math.round(Number(s.step)||0),-2,2),
   rightStreak:num(s.rightStreak,2),wrongStreak:num(s.wrongStreak,1),
   attempted:num(s.attempted,100000),correct:num(s.correct,100000)};
 }
 function fresh(){return clean({})}
 function note(state,correct,{helped=false}={}){
  const s=clean(state);s.attempted++;if(correct)s.correct++;
  const previous=s.step;
  if(correct){
   s.wrongStreak=0;s.rightStreak=helped?0:s.rightStreak+1;
   if(s.rightStreak>=3){s.step=clamp(s.step+1,-2,2);s.rightStreak=0;}
  }else{
   s.rightStreak=0;s.wrongStreak++;
   if(s.wrongStreak>=2){s.step=clamp(s.step-1,-2,2);s.wrongStreak=0;}
  }
  return {state:s,change:s.step-previous};
 }
 function label(step){return ({'-2':'Ekstra hjælp','-1':'Lidt lettere','0':'Passende niveau','1':'Lidt sværere','2':'Ekstra udfordring'})[clamp(Math.round(Number(step)||0),-2,2)]}
 return {clean,fresh,note,label};
});
