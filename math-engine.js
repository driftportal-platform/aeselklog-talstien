/* Pure local arithmetic and scoring. No network, timers or shared game saves. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselMath=api})(globalThis,()=>{
 'use strict';
 const OPS=Object.freeze({add:{symbol:'+',name:'Plus'},subtract:{symbol:'−',name:'Minus'},multiply:{symbol:'×',name:'Gange'},divide:{symbol:'÷',name:'Division'}});
 const LEVELS=Object.freeze({easy:10,medium:20,hard:100});
 function problem(op,a,b){
  if(!OPS[op]||![a,b].every(n=>Number.isInteger(n)&&n>=0&&n<=100))throw Error('Ugyldigt regnestykke.');
  if(op==='subtract'&&b>a||op==='divide'&&(b===0||a%b!==0))throw Error('Stykket skal give et helt tal fra 0.');
  const answer=op==='add'?a+b:op==='subtract'?a-b:op==='multiply'?a*b:a/b;
  if(answer>100)throw Error('Svaret må højst være 100.');
  return {op,a,b,answer};
 }
 function randomIndex(size,random){const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ugyldigt tilfældigt tal.');return Math.floor(n*size)}
 function generate(op,level,random=Math.random,previous=null){
  const max=LEVELS[level];if(!max||!OPS[op])throw Error('Vælg en gyldig sværhedsgrad og regneart.');
  const choices=[];
  if(op==='add'||op==='subtract'){
   for(let a=0;a<=max;a++)for(let b=1;b<=max;b++)if(op==='add'?a+b<=max:b<=a)choices.push(problem(op,a,b));
  }else if(op==='multiply'){
   for(let a=1;a<=10;a++)for(let b=1;b<=10;b++)if(a*b<=max)choices.push(problem(op,a,b));
  }else{
   for(let b=2;b<=10;b++)for(let answer=1;answer<=10;answer++)if(b*answer<=max)choices.push(problem(op,b*answer,b));
  }
  const filtered=choices.filter(p=>!previous||p.op!==previous.op||p.a!==previous.a||p.b!==previous.b);
  return filtered[randomIndex(filtered.length,random)];
 }
 function start({operations=['add'],level='easy',mode='visual',length=10}={},random=Math.random){
  if(!Array.isArray(operations)||!operations.length||operations.some(op=>!OPS[op])||new Set(operations).size!==operations.length)throw Error('Vælg mindst én regneart.');
  if(!LEVELS[level]||!['visual','numbers'].includes(mode)||![5,10,20].includes(Number(length)))throw Error('Vælg gyldige opgaveindstillinger.');
  const order=[];while(order.length<Number(length)){
   const bag=[...operations];for(let i=bag.length-1;i>0;i--){const j=randomIndex(i+1,random);[bag[i],bag[j]]=[bag[j],bag[i]]}order.push(...bag);
  }
  const tasks=[];for(const op of order.slice(0,Number(length)))tasks.push(generate(op,level,random,tasks.at(-1)));
  return {options:{operations:[...operations],level,mode,length:Number(length)},tasks,index:0,points:0,records:[],help:0,attempts:0,resolved:false,finished:false};
 }
 function active(s){if(!s||s.finished||s.resolved)throw Error('Opgaven er afsluttet.');return s.tasks[s.index]}
 function complete(s,kind,points){s.points+=points;s.resolved=true;s.records.push({kind,points,attempts:s.attempts});return points}
 function check(s,raw){const p=active(s);if(!/^\d{1,3}$/.test(String(raw).trim())||Number(raw)>100)return {valid:false,correct:false,points:0};const n=Number(raw);s.attempts++;if(n!==p.answer)return {valid:true,correct:false,points:0};return {valid:true,correct:true,points:complete(s,s.help?'helped':'own',s.help?5:10)}}
 function hint(s){active(s);s.help=Math.min(2,s.help+1);return guide(s.tasks[s.index])[s.help-1]}
 function solution(s){const p=active(s);s.help=3;complete(s,'shown',0);return guide(p)[2]}
 function next(s){if(s.finished||!s.resolved)throw Error('Løs opgaven eller se løsningen først.');if(s.index+1===s.tasks.length){s.finished=true;return false}s.index++;s.help=0;s.attempts=0;s.resolved=false;return true}
 function expression(p,show=false){return `${p.a} ${OPS[p.op].symbol} ${p.b} = ${show?p.answer:'?'}`}
 function story(p){const {a,b,op}=p;return op==='add'?`Du har ${a} gulerødder og får ${b} mere. Hvor mange har du i alt?`:op==='subtract'?`Du har ${a} gulerødder. Æslet spiser ${b}. Hvor mange er der tilbage?`:op==='multiply'?`Der er ${a} kurve med ${b} gulerødder i hver. Hvor mange er der i alt?`:`Fordel ${a} gulerødder lige i ${b} kurve. Hvor mange får hver kurv?`}
 function guide(p){const {a,b,answer,op}=p;let steps;
  if(op==='add')steps=[`Plus betyder, at vi samler. Find først de ${a} gulerødder.`, `Læg de ${b} nye gulerødder til. Tæl alle gulerødderne. En hel tieramme tæller som 10.`];
  if(op==='subtract')steps=[`Minus betyder, at vi tager noget væk. Start med ${a} gulerødder.`, `Stryg ${b} gulerødder over. Tæl kun dem, der er tilbage. De overstregede tæller ikke med.`];
  if(op==='multiply')steps=[`Gange er lige store grupper. Find ${a} kurve.`, `Læg ${b} gulerødder i hver kurv. Tæl dem alle eller læg ${Array(a).fill(b).join(' + ')} sammen.`];
  if(op==='divide')steps=[`Division betyder at dele lige. Find ${a} gulerødder og ${b} kurve.`, `Læg én gulerod i hver kurv og gentag, til alle er fordelt. Kurvene skal have lige mange. Tæl i én kurv.`];
  return [...steps,`${expression(p,true)}. ${op==='divide'?`Der er ${answer} i hver kurv.`:op==='subtract'?`Der er ${answer} tilbage.`:`Der er ${answer} i alt.`}`];
 }
 return {OPS,LEVELS,problem,generate,start,check,hint,solution,next,expression,story,guide};
});
