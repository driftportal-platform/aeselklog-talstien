/* Structured mixed arithmetic: no eval, exact whole-number percentages/division. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselMathCombined=api})(globalThis,()=>{
 'use strict';const symbols={add:'+',subtract:'−',multiply:'×',divide:'÷'},words={add:'plus',subtract:'minus',multiply:'gange',divide:'divideret med'};
 const number=value=>({op:'number',value}),binary=(op,left,right)=>({op,left,right}),percent=(rate,base)=>({op:'percent',rate,base});
 function evaluate(node,depth=0){
  if(!node||depth>12)throw Error('Ugyldigt kombinationsstykke.');
  if(node.op==='number'){if(!Number.isSafeInteger(node.value))throw Error('Ugyldigt tal.');return node.value}
  let value;
  if(node.op==='percent'){if(!Number.isInteger(node.rate)||node.rate<0||node.rate>100)throw Error('Ugyldig procent.');value=evaluate(node.base,depth+1)*node.rate/100}
  else{if(!Object.hasOwn(symbols,node.op))throw Error('Ukendt regneart.');const a=evaluate(node.left,depth+1),b=evaluate(node.right,depth+1);if(node.op==='divide'&&b===0)throw Error('Division med nul.');value=node.op==='add'?a+b:node.op==='subtract'?a-b:node.op==='multiply'?a*b:a/b}
  if(!Number.isSafeInteger(value))throw Error('Opgaven skal give hele tal i alle trin.');return value;
 }
 const precedence=n=>n.op==='add'||n.op==='subtract'?1:n.op==='multiply'||n.op==='divide'?2:n.op==='percent'?3:4;
 function expression(n){
  if(n.op==='number')return String(n.value);
  if(n.op==='percent')return `${n.rate} % af ${n.base.op==='number'?expression(n.base):'('+expression(n.base)+')'}`;
  const part=(child,right)=>{const text=expression(child),wrap=precedence(child)<precedence(n)||right&&precedence(child)===precedence(n)&&!(n.op==='add'&&child.op==='add'||n.op==='multiply'&&child.op==='multiply');return wrap?'('+text+')':text};
  return `${part(n.left,false)} ${symbols[n.op]} ${part(n.right,true)}`;
 }
 function spoken(n){if(n.op==='number')return n.value<0?'minus '+Math.abs(n.value):String(n.value);if(n.op==='percent')return `${n.rate} procent af ${n.base.op==='number'?spoken(n.base):'parentes '+spoken(n.base)+' slut parentes'}`;const part=child=>child.op==='number'?spoken(child):'parentes '+spoken(child)+' slut parentes';return `${part(n.left)} ${words[n.op]} ${part(n.right)}`}
 function steps(n,out=[]){
  if(n.op==='number')return out;
  if(n.op==='percent'){steps(n.base,out);out.push(`${n.rate} % af ${evaluate(n.base)} = ${evaluate(n)}`)}
  else{steps(n.left,out);steps(n.right,out);out.push(`${evaluate(n.left)} ${symbols[n.op]} ${evaluate(n.right)} = ${evaluate(n)}`)}return out;
 }
 function problem(ast,level){const answer=evaluate(ast),max=level==='adult'?1000000:level==='expert'?100000000:0;if(!max||Math.abs(answer)>max||ast.op==='number')throw Error('Ugyldigt voksenniveau eller for stort svar.');return {op:'combined',level,ast,answer,text:expression(ast),spoken:spoken(ast)}}
 function generator(level,random=Math.random){
  if(!['adult','expert'].includes(level))throw Error('Kombi er kun til voksne.');const expert=level==='expert',rates=[5,10,12,15,20,25,30,40,50,75];let bag=[],last=-1,previous='';
  const pick=(min,max)=>{const n=Number(random());if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ugyldigt tilfældigt tal.');return min+Math.floor(n*(max-min+1))},n=(min,max)=>number(pick(min,max)),rate=()=>rates[pick(0,rates.length-1)],pc=()=>percent(rate(),number(100*pick(expert?100:10,expert?5000:500)));
  const add=(a,b)=>binary('add',a,b),sub=(a,b)=>binary('subtract',a,b),mul=(a,b)=>binary('multiply',a,b),div=(a,b)=>binary('divide',a,b),quotient=()=>{const d=pick(12,99);return div(number(d*pick(expert?100:12,expert?9999:999)),number(d))};
  const builders=expert?[
   ()=>sub(mul(add(pc(),quotient()),n(12,199)),n(1000,999999)),
   ()=>{const d=pick(12,99);return div(sub(mul(number(d*pick(101,999)),n(12,999)),number(d*pick(100,9999))),number(d))},
   ()=>add(mul(sub(n(1000,99999),n(1000,99999)),n(12,199)),pc()),
   ()=>add(percent(rate(),add(number(100*pick(100,5000)),number(100*pick(100,5000)))),quotient()),
   ()=>{const d=pick(12,99);return sub(div(mul(number(d*pick(100,9999)),n(12,99)),number(d)),mul(n(100,9999),n(12,199)))}
  ]:[
   ()=>add(n(1000,19999),mul(n(12,199),n(12,49))),
   ()=>mul(add(n(100,4999),n(100,4999)),n(3,49)),
   ()=>sub(quotient(),n(100,2999)),
   ()=>add(pc(),mul(n(12,99),n(12,99))),
   ()=>{const d=pick(12,99);return mul(sub(n(100,1999),n(100,1999)),div(number(d*pick(12,99)),number(d)))},
   ()=>{const price=number(100*pick(10,999));return sub(price,percent(rate(),price))}
  ];
  return ()=>{if(!bag.length){bag=builders.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=pick(0,i);[bag[i],bag[j]]=[bag[j],bag[i]]}if(bag[0]===last)[bag[0],bag[1]]=[bag[1],bag[0]]}const kind=bag.shift();last=kind;let p=problem(builders[kind](),level);if(p.text===previous)p=problem(binary('add',p.ast,number(1)),level);previous=p.text;return p};
 }
 function guide(p){const trace=steps(p.ast);return ['Regn parenteser og procentdele først. Gange og division kommer før plus og minus. På samme niveau regner du fra venstre mod højre.',`Begynd med denne del: ${trace[0]}. Erstat den med resultatet, og fortsæt i den rigtige rækkefølge.`,trace.join('. ')+'.']}
 return {number,binary,percent,evaluate,expression,spoken,steps,problem,generator,guide};
});
