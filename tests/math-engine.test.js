const assert=require('node:assert/strict'),E=require('../math-engine.js');
let seed=7;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
for(const [level,max] of Object.entries(E.LEVELS))for(const op of Object.keys(E.OPS)){
 let previous=null;
 for(let i=0;i<300;i++){
  const p=E.generate(op,level,random,previous);assert(p.a>=0&&p.a<=max);assert(p.b>0&&p.b<=max);assert(Number.isInteger(p.answer)&&p.answer>=0&&p.answer<=max);
  assert.equal(p.answer,op==='add'?p.a+p.b:op==='subtract'?p.a-p.b:op==='multiply'?p.a*p.b:p.a/p.b);
  if(op==='multiply')assert(p.a<=10&&p.b<=10);
  if(op==='divide')assert(p.b>=2&&p.b<=10&&p.answer<=10);
  if(previous)assert.notDeepEqual(p,previous);assert.equal(E.guide(p).length,3);assert(E.guide(p)[2].includes(E.expression(p,true)));previous=p;
 }
}
assert.equal(E.problem('subtract',4,4).answer,0);assert.equal(E.problem('add',0,3).answer,3);
assert.throws(()=>E.problem('divide',5,0));assert.throws(()=>E.problem('divide',5,2));assert.throws(()=>E.problem('subtract',2,3));assert.throws(()=>E.start({operations:[]}));assert.throws(()=>E.start({operations:['oops']}));assert.throws(()=>E.start({level:'other'}));
const s=E.start({operations:Object.keys(E.OPS),level:'hard',mode:'numbers',length:20},random);
for(const op of Object.keys(E.OPS))assert.equal(s.tasks.filter(p=>p.op===op).length,5);
let expected=0;
for(let i=0;i<20;i++){
 const p=s.tasks[s.index];assert.throws(()=>E.next(s));assert.deepEqual(E.check(s,''),{valid:false,correct:false,points:0});assert.equal(E.check(s,'3.5').valid,false);assert.equal(E.check(s,'-1').valid,false);assert.equal(E.check(s,p.answer+1).correct,false);assert.equal(s.points,expected);
 if(i%3===0){assert.equal(E.check(s,p.answer).points,10);expected+=10}
 else if(i%3===1){E.hint(s);E.hint(s);E.hint(s);assert.equal(s.help,2);assert.equal(E.check(s,p.answer).points,5);expected+=5}
 else {E.solution(s);assert.equal(s.records.at(-1).kind,'shown')}
 assert.equal(s.points,expected);assert.throws(()=>E.check(s,p.answer));assert.throws(()=>E.solution(s));assert.equal(E.next(s),i<19);
}
assert(s.finished);assert.equal(s.records.length,20);assert.equal(s.points,expected);assert.throws(()=>E.next(s));
console.log('PASS arithmetic bounds at three levels, exact division, balanced mixed rounds, help, retries, no double scoring and completion');
