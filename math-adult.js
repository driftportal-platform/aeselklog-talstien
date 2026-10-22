/* Adult-only whole-number arithmetic and worked methods. No visual objects. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselMathAdult=api})(globalThis,()=>{
 'use strict';
 const LEVELS=Object.freeze({adult:1000000,expert:100000000}),isAdult=level=>Object.hasOwn(LEVELS,level);
 function problem(op,a,b,level){
  const max=LEVELS[level];if(!max||!['add','subtract','multiply','divide'].includes(op)||![a,b].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=max)||op==='divide'&&(b===0||a%b!==0))throw Error('Ugyldigt voksenregnestykke.');
  const answer=op==='add'?a+b:op==='subtract'?a-b:op==='multiply'?a*b:a/b;
  if(!Number.isSafeInteger(answer)||Math.abs(answer)>max)throw Error('Svaret er uden for niveauet.');return {op,a,b,answer,level};
 }
 function generate(op,level,random=Math.random,previous){
  const pick=(min,max)=>{const n=Number(random());if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ugyldigt tilfældigt tal.');return min+Math.floor(n*(max-min+1))};
  if(!isAdult(level))throw Error('Ukendt voksenniveau.');const hard=level==='expert';let a,b;
  if(op==='add'){a=pick(hard?100000:1000,hard?9999999:49999);b=pick(hard?100000:1000,hard?9999999:49999)}
  else if(op==='subtract'){a=pick(hard?100000:1000,hard?9999999:99999);b=pick(hard?100000:1000,hard?9999999:99999)}
  else if(op==='multiply'){a=pick(hard?101:12,hard?9999:199);b=pick(hard?101:12,hard?999:99)}
  else if(op==='divide'){b=pick(hard?101:12,hard?999:99);a=b*pick(hard?101:12,hard?9999:199)}
  else throw Error('Ukendt regneart.');
  if(previous?.op===op&&previous.a===a&&previous.b===b){if(op==='divide')a+=b;else b++}
  return problem(op,a,b,level);
 }
 function split(n,unit=100){let base=Math.floor(n/unit)*unit;if(base===n)base=Math.max(0,base-unit);return [base,n-base]}
 function guide(p){const {op,a,b,answer}=p;let steps,worked;
  if(op==='add'){const [base,rest]=split(b);steps=[`Del ${b} op i ${base} og ${rest}. Læg først den runde del til ${a}.`,`Regn ${a} + ${base} først. Læg derefter ${rest} til. Tjek ved at trække ${b} fra dit resultat.`];worked=`${a} + ${base} = ${a+base}. Læg ${rest} til: ${answer}.`}
  if(op==='subtract'){
   const negative=a<b,large=negative?b:a,small=negative?a:b,[base,rest]=split(small);
   steps=[negative?`${b} er større end ${a}, så svaret bliver negativt. Regn først forskellen ${b} − ${a}, og sæt minus foran til sidst.`:`Del ${b} op i ${base} og ${rest}. Træk den runde del fra først.`, `Regn først ${large} − ${base}, og træk så ${rest} fra.${negative?' Sæt derefter minus foran forskellen.':' Tjek ved at lægge '+b+' til dit svar.'}`];
   worked=`${large} − ${base} = ${large-base}. Træk ${rest} fra: ${large-small}.${negative?' Sæt minus foran: '+answer+'.':''}`;
  }
  if(op==='multiply'){const [base,rest]=split(b,10);steps=[`Del ${b} op i ${base} og ${rest}. Gang ${a} med hver del for sig.`,`Regn ${a} × ${base} og ${a} × ${rest}. Læg de to delprodukter sammen. Ved hele tiere kan du gange med antallet af tiere og sætte et nul bagefter.`];worked=`${a} × ${base} = ${a*base}. ${a} × ${rest} = ${a*rest}. Læg sammen: ${answer}.`}
  if(op==='divide'){
   const digits=String(a);let length=String(b).length,prefix=Number(digits.slice(0,length));if(prefix<b){length++;prefix=Number(digits.slice(0,length))}const first=Math.floor(prefix/b);
   steps=[`Division er omvendt gange. Find det tal, som ganget med ${b} giver ${a}. Brug skriftlig division fra venstre mod højre.`,`Start med de første cifre: ${prefix}. ${b} går ${first} gange op i ${prefix}. Træk ${first*b} fra, træk næste ciffer ned, og gentag. Slut med at kontrollere ved at gange dit svar med ${b}.`];worked=`${a} ÷ ${b} = ${answer}. Kontrol: ${answer} × ${b} = ${a}.`;
  }
  return [...steps,worked];
 }
 return {LEVELS,isAdult,problem,generate,guide};
});
