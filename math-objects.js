(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselMathObjects=api})(globalThis,()=>{
 'use strict';
 function create(p){return {op:p.op,a:p.a,b:p.b,moved:[],groups:Array(p.op==='multiply'?p.a:p.op==='divide'?p.b:0).fill(0)}}
 function ready(s){return s.op==='subtract'||s.op==='add'?s.moved.length===s.b:s.op==='multiply'?s.groups.every(n=>n===s.b):s.groups.reduce((a,b)=>a+b,0)===s.a}
 function act(s,index){
  if(!Number.isInteger(index)||index<0)throw Error('Vælg en gulerod eller kurv.');
  if(s.op==='subtract'||s.op==='add'){
   if(index>=(s.op==='subtract'?s.a:s.b))throw Error('Guleroden findes ikke.');
   const at=s.moved.indexOf(index);
   if(at>=0){if(s.op==='subtract')s.moved.splice(at,1);else throw Error('Guleroden er allerede flyttet.');}
   else {if(s.moved.length===s.b)throw Error('Du har fjernet nok. Du kan lægge en tilbage.');s.moved.push(index)}
  }else{
   if(index>=s.groups.length)throw Error('Kurven findes ikke.');
   if(ready(s))throw Error('Alle gulerødder er lagt.');
   if(s.op==='multiply'&&s.groups[index]>=s.b)throw Error('Denne kurv er fuld. Vælg en anden.');
   if(s.op==='divide'&&s.groups[index]>Math.min(...s.groups))throw Error('Vælg en kurv med færre gulerødder, så du deler lige.');
   s.groups[index]++;
  }
 }
 function items(s){
  if(s.op==='subtract')return Array.from({length:s.a},(_,i)=>i).filter(i=>!s.moved.includes(i)).map(i=>'start-'+i);
  if(s.op==='add')return [...Array.from({length:s.a},(_,i)=>'start-'+i),...s.moved.map(i=>'new-'+i)];
  return s.groups.flatMap((n,g)=>s.op==='divide'&&g>0?[]:Array.from({length:n},(_,i)=>`group-${g}-${i}`));
 }
 return {create,ready,act,items};
});
