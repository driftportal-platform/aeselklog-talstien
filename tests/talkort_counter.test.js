const assert=require('node:assert/strict'),C=require('../talkort-counter.js');
assert.deepEqual(C.sequence(3,0),[3,2,1,0]);assert.deepEqual(C.sequence(1,4),[1,2,3,4]);assert.deepEqual(C.sequence(0,0),[0]);assert.equal(C.sequence(100,0).length,101);for(const x of [-1,101,2.2,NaN])assert.throws(()=>C.sequence(x,0));assert.equal(C.pause(.1),100);assert.equal(C.pause(2.5),2500);assert.equal(C.pause(999),60000);
console.log('PASS counting sequences: inclusive zero/target, bounds, single number and adjustable delay');
