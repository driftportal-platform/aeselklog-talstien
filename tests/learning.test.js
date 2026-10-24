const assert=require('node:assert/strict'),E=require('../learning-engine.js');
let seed=45;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
for(const level of E.LEVELS)for(let type=1;type<=6;type++)for(let i=0;i<80;i++){
 const t=E.create(level,type,random);assert.equal(t.type,type);assert(t.options.includes(t.correct));assert(E.check(t,t.correct));assert(E.check(t,'  '+t.correct.toUpperCase()+'  '));assert(!E.check(t,''));assert(!E.check(t,'not-an-answer'));assert(t.help.length);assert(t.question.length);assert(!E.spoken(t.question).includes('🥕'));
}
assert.equal(E.roll(()=>0),1);assert.equal(E.roll(()=>.9999),6);assert.throws(()=>E.roll(()=>1));assert.throws(()=>E.create('bad',1));assert.throws(()=>E.create('child7',7));assert(E.check({correct:'6 × 7'},'6*7'));assert(E.check({correct:'4'},'04'));assert(!E.check({correct:'4'},'4x'));assert.equal(E.spoken('4 × 5 − 3 + 2 ÷ 1'),'4 gange 5 minus 3 plus 2 divideret med 1');
console.log('PASS learning dice: all eight levels and six topics, answer modes, narration and dice bounds');
