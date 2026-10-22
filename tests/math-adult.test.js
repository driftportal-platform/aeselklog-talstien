const assert=require('node:assert/strict'),E=require('../math-engine.js'),A=require('../math-adult.js');
let seed=113;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
for(const level of ['adult','expert'])for(const op of Object.keys(E.OPS)){
 let previous=null,negative=false;
 for(let i=0;i<250;i++){
  const p=E.generate(op,level,random,previous);assert(E.isAdult(p.level));assert(Number.isSafeInteger(p.answer));assert(Math.abs(p.answer)<=E.LEVELS[level]);assert(p.a<=E.LEVELS[level]&&p.b<=E.LEVELS[level]);assert.equal(p.answer,op==='add'?p.a+p.b:op==='subtract'?p.a-p.b:op==='multiply'?p.a*p.b:p.a/p.b);if(previous)assert.notDeepEqual(p,previous);if(p.answer<0)negative=true;
  const guide=E.guide(p);assert.equal(guide.length,3);assert(guide.every(s=>s.length<=350));assert(guide[2].includes(String(p.answer)));assert(!guide.join(' ').includes('gulerod'));previous=p;
 }
 if(op==='subtract')assert(negative);
}
for(const op of Object.keys(E.OPS)){const p=E.generate(op,'expert',()=>0);assert.notDeepEqual(E.generate(op,'expert',()=>0,p),p)}
assert(E.guide(E.problem('multiply',123,47,'adult'))[2].includes('4920'));assert(E.guide(E.problem('multiply',123,47,'adult'))[2].includes('861'));assert(E.guide(E.problem('subtract',2300,4876,'adult'))[2].includes('-2576'));
assert.equal(E.problem('add',9999999,9999999,'expert').answer,19999998);assert.equal(E.problem('subtract',2300,4876,'adult').answer,-2576);assert.equal(E.problem('multiply',123,47,'adult').answer,5781);assert.equal(E.problem('divide',8460,36,'adult').answer,235);assert.throws(()=>E.problem('divide',20,0,'adult'));assert.throws(()=>E.problem('divide',20,3,'adult'));assert.throws(()=>E.problem('add',100000000,1,'expert'));assert.throws(()=>E.problem('subtract',1,2));
const s=E.start({level:'expert',mode:'visual',operations:['add','subtract','multiply','divide'],length:20},random);assert.equal(s.options.mode,'numbers');for(const op of Object.keys(E.OPS))assert.equal(s.tasks.filter(p=>p.op===op).length,5);
for(const raw of ['','1.5','1,5','1e3','NaN','100000001','-100000001'])assert.equal(E.check(s,raw).valid,false);
let total=0;for(let i=0;i<20;i++){const p=s.tasks[s.index];if(i%2){E.hint(s);E.hint(s)}const result=E.check(s,String(p.answer));assert(result.correct);total+=i%2?5:10;assert.equal(s.points,total);assert.throws(()=>E.check(s,p.answer));E.next(s)}assert(s.finished);assert.equal(s.points,150);
const neg=E.start({level:'adult',length:5});neg.tasks[0]=E.problem('subtract',2300,4876,'adult');assert(E.check(neg,'-2576').correct);
console.log('PASS two adult levels, efficient large-number generation, exact signed arithmetic, worked methods, integer validation and scoring');
