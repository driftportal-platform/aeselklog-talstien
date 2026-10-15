/* Local per-child history remains private, bounded and backward-compatible. */
const assert=require('node:assert/strict');
const P=require('../adaptive.js'),LP=require('../profiles.js');
const data=new Map();
const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
const oldProgress=P.noteArea(P.freshProgress(),'numbers',true).state;
// Simulate a real v0.9.10.1 entry with no history property.
storage.setItem(LP.KEY,JSON.stringify({version:1,profiles:{liv:{name:'Liv',updatedAt:1000,progress:oldProgress,seen:['old-id']}}}));
assert.equal(LP.read(storage,'Liv').areas.numbers.correct,1);
assert.deepEqual(LP.report(storage,'Liv').history,[]);
let state=oldProgress;
const start=Date.now()-5*86400000;
const first={area:'plus',correct:true,helped:false,step:0,t:start};
state=P.noteArea(state,'plus',true).state;
assert.equal(LP.record(storage,'Liv',state,'exercise-01',first).saved,true);
assert.equal(LP.report(storage,'Liv').history[0].area,'plus');
assert.equal(LP.report(storage,'Liv').history[0].correct,true);
assert.equal(LP.record(storage,'Liv',P.noteArea(state,'plus',false).state,'exercise-01',
 {area:'plus',correct:false,t:start+1000}).duplicate,true);
assert.equal(LP.report(storage,'Liv').history.length,1);
assert.equal(LP.report(storage,'Liv').progress.areas.plus.attempted,1);
const invalid={area:'unknown',correct:true,t:Date.now()};
LP.record(storage,'Liv',state,'exercise-02',invalid);
assert.equal(LP.report(storage,'Liv').history.length,1,'invalid area is not persisted');
for(let n=0;n<140;n++){
 state=P.noteArea(state,'minus',n%2===0,{helped:n%3===0}).state;
 LP.record(storage,'Liv',state,`long-run-${n}`,{area:'minus',correct:n%2===0,helped:n%3===0,step:state.areas.minus.step,t:start+n*1000});
}
const report=LP.report(storage,'Liv');
assert.equal(report.history.length,96);
assert.equal(report.history.at(-1).area,'minus');
assert(report.history.at(-1).t<=Date.now());
assert.equal(report.progress.areas.numbers.correct,1,'old profile progress remains');
const raw=storage.getItem(LP.KEY);
assert(!raw.includes('"age"')&&!raw.includes('"question"')&&!raw.includes('"answer"')&&!raw.includes('apiKey'));
assert(raw.length<180000);
LP.record(storage,'Mathilde',P.freshProgress(),'other-01',{area:'numbers',correct:false,t:Date.now()});
assert.equal(LP.list(storage).length,2);
assert(LP.remove(storage,'LiV'));
assert.equal(LP.report(storage,'Liv'),null);
assert.equal(LP.list(storage).length,1);
assert.equal(LP.read(storage,'Mathilde').areas.numbers.attempted,0);
assert(LP.clear(storage));
assert.equal(LP.list(storage).length,0);
console.log('PASS: legacy levels, bounded local history, unique exercises, privacy, per-child deletion, and full clear');
