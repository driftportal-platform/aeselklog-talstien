/* ÆselKlog v0.9.10: uafhængig, alderssikker progression i fire opgaveområder.
   Bevarer de oprindelige P.clean/P.fresh/P.note til ældre gemninger. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselAdaptive=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const AREAS=Object.freeze(['numbers','plus','minus','tables']);
 const TITLES=Object.freeze({numbers:'Talforståelse',plus:'Plus',minus:'Minus',tables:'Gangetabeller'});
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const count=(n,max)=>clamp(Math.floor(Number(n)||0),0,max);
 function clean(input){
  const s=input&&typeof input==='object'?input:{};
  return {step:clamp(Math.round(Number(s.step)||0),-2,2),
   rightStreak:count(s.rightStreak,2),wrongStreak:count(s.wrongStreak,1),
   attempted:count(s.attempted,200000),correct:count(s.correct,200000)};
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
 function isArea(area){return AREAS.includes(area)}
 function freshProgress(){return {...fresh(),areas:Object.fromEntries(AREAS.map(area=>[area,fresh()]))}}
 // For a pre-v0.9.10 saved game, keep its global level as an initial starting
 // point for each subject; do NOT distribute historical answers across areas.
 function cleanProgress(input){
  const base=clean(input),areas={};
  for(const area of AREAS){
   if(input?.areas && Object.prototype.hasOwnProperty.call(input.areas,area))areas[area]=clean(input.areas[area]);
   else areas[area]={...fresh(),step:base.step};
  }
  return {...base,areas};
 }
 function areaStep(state,area){
  const key=isArea(area)?area:'numbers';
  return cleanProgress(state).areas[key].step;
 }
 function noteArea(state,area,correct,options={}){
  const key=isArea(area)?area:'numbers';
  const old=cleanProgress(state);
  const global=note(old,correct,options);
  const local=note(old.areas[key],correct,options);
  return {state:{...global.state,areas:{...old.areas,[key]:local.state}},area:key,change:local.change,
   step:local.state.step};
 }
 // Opgaver fra gamle gemte spil har ikke et områdefelt. Regne-siden og
 // tabelfeltet kan udledes af den allerede gemte opgavetekst.
 function challengeArea(task){
  if(isArea(task?.skillArea))return task.skillArea;
  if(!task||typeof task!=='object')return 'numbers';
  if(task.tableLabel||task.table)return 'tables';
  if(task.type!==6 && task.type!==4)return 'numbers';
  const question=String(task.question||'');
  if(/[×÷]/.test(question))return 'tables';
  if(/\d\s*\+\s*\d/.test(question))return 'plus';
  if(/[\d)]\s*[−-]\s*\d/.test(question))return 'minus';
  return 'numbers';
 }
 return {AREAS,TITLES,clean,fresh,note,label,isArea,freshProgress,cleanProgress,areaStep,noteArea,challengeArea};
});
