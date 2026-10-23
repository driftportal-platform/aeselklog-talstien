const assert=require('node:assert/strict'),E=require('../math-engine.js'),C=require('../math-combined.js');
let seed=81;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
const n=C.number,b=C.binary;
assert.equal(C.expression(b('multiply',b('add',n(2),n(3)),n(4))),'(2 + 3) × 4');
assert.equal(C.evaluate(b('add',C.percent(25,n(2400)),b('multiply',n(18),n(7)))),726);
for(const bad of [b('divide',n(1),n(0)),b('divide',n(1),n(3)),C.percent(12,n(11)),b('bad',n(1),n(2))])assert.throws(()=>C.evaluate(bad));
for(const level of ['adult','expert']){
 const next=C.generator(level,random);let previous='';
 for(let i=0;i<2000;i++){const p=next();assert(Number.isSafeInteger(p.answer));assert(Math.abs(p.answer)<=E.LEVELS[level]);assert.notEqual(p.text,previous);previous=p.text;assert.equal(C.evaluate(p.ast),p.answer);assert(C.guide(p).every(s=>s.length<=350));assert(p.spoken.length<=350)}
 const s=E.start({level,combined:true,length:5},random);assert(s.tasks.some(p=>p.text.includes('%')));assert.equal(s.options.mode,'numbers');
 for(let i=0;i<5;i++){E.hint(s);E.skip(s);assert.throws(()=>E.skip(s));E.next(s)}assert(s.finished);assert.equal(s.points,0);assert(s.records.every(r=>r.kind==='skipped'));
}
assert.throws(()=>E.start({combined:true,level:'easy'}));assert.throws(()=>E.start({combined:'yes',level:'adult'}));
const s=E.start({length:5});E.check(s,'99');E.skip(s);E.next(s);assert.equal(s.index,1);assert.equal(s.points,0);assert.equal(s.attempts,0);
console.log('PASS mixed arithmetic bounds, exact percentages, precedence, guidance, speech and zero-point skipping');

function leaves(ast){return ast.op==='number'?[ast.value]:ast.op==='percent'?[ast.rate,...leaves(ast.base)]:[...leaves(ast.left),...leaves(ast.right)]}
for(const level of ['adult','expert']){
 const next=C.generator(level,random,true);let neg=false;
 for(let i=0;i<2000;i++){const p=next();assert(leaves(p.ast).every(v=>v>=0&&v<=100));assert(Number.isSafeInteger(p.answer));assert.equal(C.evaluate(p.ast),p.answer);assert(C.guide(p).every(t=>t.length<=350));assert(p.spoken.length<=350);if(p.answer<0)neg=true}assert(neg);
 const s=E.start({level,combined:true,smallNumbers:true,length:5},random);assert(s.options.smallNumbers);assert(s.tasks.every(p=>leaves(p.ast).every(v=>v<=100)));assert(E.check(s,String(s.tasks[0].answer)).correct);assert.equal(s.points,10);
}
assert.throws(()=>E.start({smallNumbers:'small'}));
console.log('PASS small-number mixed tasks: bounded operands, nested parentheses, negative answers and scoring');
