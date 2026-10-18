const assert=require('node:assert/strict');
const E=require('../cardgame-engine.js');
function configured(count,donkeys){
 const s=E.start({names:Array.from({length:count},(_,i)=>`Spiller ${i+1}`),deckSets:1,donkeyCount:8});
 const cards=s.players.flatMap(p=>p.closed);s.players.forEach(p=>{p.closed=[];p.open=[]});
 s.players.forEach((p,i)=>{p.closed=[cards.pop()];p.donkeys=donkeys[i]||0});
 s.centers=[cards]; // conservation of cards, with a single legal-length pile
 return s;
}
// Vi tester afslutningsfunktionen via et lovligt manuelt træk, som bruger sidste kort.
// Intern logik skal også forblive stabil ved gem/indlæs.
for(const n of [2,3,4]){
 const s=configured(n,Array(n).fill(0));
 assert(E.validate(s),`test state ${n}`);
 assert(E.restore(JSON.stringify(s)));
}
console.log('PASS: sejrspodie-state valideres for 2, 3 og 4 spillere');
// Exercise the real manual completion path, including the CPU's shared engine.
for(const [donkeys,expected] of [[[0,0],0],[[2,0],1],[[0,2],0]]){
 for(const vsCPU of [false,true]){
  const s=E.start({names:vsCPU?['Alma']:['Alma','Bo'],vsCPU,deckSets:1});
  s.players[0].closed=[1];s.players[1].closed=[20];s.players.forEach((p,i)=>{p.open=[];p.donkeys=donkeys[i]});
  s.centers=[Array.from({length:18},(_,i)=>i+2)];assert(E.validate(s));
  E.flipManual(s);E.placeManual(s,'pending',{kind:'new-center'});
  assert.equal(s.finished,true);assert.equal(s.winner,expected);assert.deepEqual(s.placements,[expected,1-expected]);assert(E.validate(s));
 }
}
{
 const s=E.start({names:['Alma','Bo','Cecilie'],deckSets:1});
 s.players.forEach((p,i)=>{p.closed=[i+1];p.open=[];p.donkeys=i===0?1:0});
 s.centers=[Array.from({length:17},(_,i)=>i+4)];assert(E.validate(s));
 E.flipManual(s);E.placeManual(s,'pending',{kind:'new-center'});
 assert(!s.finished);assert.equal(s.turn,1);assert.deepEqual(s.finishOrder,[0]);
 E.flipManual(s);E.placeManual(s,'pending',{kind:'center',index:1});
 assert(s.finished);assert.equal(s.winner,1);assert.deepEqual(s.placements,[1,0,2]);assert(E.validate(s));
}
console.log('PASS: real completion, donkey comparison, ties, CPU and three-player podium');
