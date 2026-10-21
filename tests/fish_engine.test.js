const assert=require('node:assert/strict'),E=require('../fish-engine.js');
function rng(seed){return()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)}
for(let count=2;count<=6;count++)for(let seed=1;seed<=12;seed++){
 const r=rng(seed),g=E.start({range:seed%2?'1-20':'81-100',names:Array.from({length:count},(_,i)=>'P'+i)},r);
 assert.equal(g.players[0].hand.length+g.players[0].books.length*4,count<4?7:5);assert(E.assert(g));
 assert.throws(()=>E.action(g,(g.turn+1)%count,{type:'fish-draw'}));assert.throws(()=>E.action(g,g.turn,{type:'fish-ask',number:999,target:1}));
 let steps=0,success=0,miss=0;
 while(g.phase==='playing'&&steps++<15000){const seat=g.turn,p=g.players[seat],before=structuredClone(g);if(g.pending){E.action(g,seat,{type:'fish-draw'});assert.notEqual(g.turn,seat)}else{const values=[...new Set(p.hand)],n=values[Math.floor(r()*values.length)],targets=g.players.map((q,i)=>i!==seat&&!q.left?i:null).filter(i=>i!==null),target=targets[Math.floor(r()*targets.length)],available=g.players[target].hand.filter(v=>v===n).length;E.action(g,seat,{type:'fish-ask',number:n,target});if(available){success++;assert.equal(g.players[target].hand.filter(v=>v===n).length,0);if(g.phase==='playing'&&g.players[seat].hand.length)assert.equal(g.turn,seat)}else miss++}assert(E.assert(g));for(const i of g.players.keys()){const v=E.view(g,i);assert.deepEqual(v.hand,g.players[i].hand);assert(!('pondCards' in v));assert(v.players.every(x=>!('hand' in x)))} }
 assert.equal(g.phase,'finished','must finish '+count+'/'+seed);assert.equal(g.players.reduce((a,p)=>a+p.books.length,0),20);assert(success&&miss);
}
// A leaving hand goes back to the pond; completed sets remain accounted for.
const g=E.start({names:['A','B','C']},rng(42));E.leave(g,0,rng(3));assert(g.players[0].left);assert.equal(g.players[0].hand.length,0);assert.notEqual(g.turn,0);assert(E.assert(g));
console.log('PASS 60 complete TorskeKlog games, all deal sizes, four-card conservation, asking restrictions, turns, sets, privacy and leave');
