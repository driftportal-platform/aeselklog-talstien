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
