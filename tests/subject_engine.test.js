const assert=require('node:assert/strict');
const E=require('../engine.js');
const child={kind:'child',age:9},six={kind:'child',age:6};
const levels={numbers:0,plus:2,minus:-2,tables:1};
const table=E.makeChallenge({player:child,type:6,tables:'7',skillSteps:levels,rng:()=>.37});
assert.equal(table.skillArea,'tables');assert.equal(table.adaptiveStep,1);assert.equal(table.table,7);
const nums=E.makeChallenge({player:child,type:1,skillSteps:levels,rng:()=>.37});
assert.equal(nums.skillArea,'numbers');assert.equal(nums.adaptiveStep,0);
const youngPlus=E.makeChallenge({player:six,type:4,skillSteps:levels,rng:()=>.37});
assert.equal(youngPlus.skillArea,'plus');assert.equal(youngPlus.adaptiveStep,2);
const olderPrim=E.makeChallenge({player:child,type:4,skillSteps:levels,rng:()=>.37});
assert.equal(olderPrim.skillArea,'numbers');
const plus=E.makeChallenge({player:child,type:6,tables:'off',skillSteps:levels,rng:()=>0});
assert.equal(plus.skillArea,'plus');assert.equal(plus.adaptiveStep,2);
const minus=E.makeChallenge({player:child,type:6,tables:'off',skillSteps:levels,rng:()=>.4});
assert.equal(minus.skillArea,'minus');assert.equal(minus.adaptiveStep,-2);
const samePlus=E.makeChallenge({player:child,type:6,tables:'off',skillSteps:{...levels,minus:2,tables:-2},rng:()=>0});
assert.equal(plus.question,samePlus.question,'Changing minus must not affect plus challenge');
const older={kind:'adult',age:34,difficulty:'mellem'};
for(let i=0;i<200;i++){
 const rng=(()=>{let n=i+1;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}})();
 const c=E.makeChallenge({player:six,type:(i%6)+1,skillSteps:levels,rng});
 assert(!/[×÷]/.test(c.question),'3–6 year olds must not get multiplication/division');
 assert(c.options.includes(c.correct));
 const adult=E.makeChallenge({player:older,type:(i%6)+1,skillSteps:levels,skillStep:-2,rng});
 assert.equal(adult.timeLimit,30);
}
console.log('PASS: subject-specific engine levels, age caps, previous adult timing, table choice');
