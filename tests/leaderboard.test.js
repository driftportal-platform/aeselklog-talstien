const assert=require('node:assert/strict');
const T=require('../leaderboard.js');
const memory=new Map();
const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const group=[
 {id:'one',name:'Aya',age:7,stats:{correct:4,attempted:5}},
 {id:'two',name:'Mikkel',age:15,stats:{correct:3,attempted:6}},
 {id:'cpu',name:'Æslet',isCPU:true,stats:{correct:1,attempted:2}}
];
let out=T.record(storage,group,'one');
assert.equal(out.length,3);assert.equal(out[0].name,'Aya');assert.equal(out[0].wins,1);
assert.equal(out[0].correct,4);assert.equal(out[0].attempted,5);
assert(!JSON.stringify(out).includes('age'),'Alder må ikke gemmes');
out=T.record(storage,group,'cpu');assert.equal(out.find(x=>x.name==='Æslet').wins,1);
assert.equal(out.find(x=>x.name==='Aya').games,2);
assert.deepEqual(T.read(storage).find(x=>x.name==='Aya'),{name:'Aya',isCPU:false,games:2,wins:1,correct:8,attempted:10});
assert(T.clear(storage));assert.equal(T.read(storage).length,0);
console.log('PASS: Lokal topscore, antal kampe, sejre, rigtige svar og sletning.');
