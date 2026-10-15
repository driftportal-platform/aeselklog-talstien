'use strict';
const assert=require('node:assert/strict');
const E=require('../cardgame-engine.js');
const seeded=(seed)=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
assert.deepEqual(E.RANGES,['1-20','21-40','41-60','61-80','81-100']);
for(const range of E.RANGES){
 const deck=E.shuffledDeck(range,seeded(7));
 const [lo,hi]=E.bounds(range);
 assert.equal(deck.length,100);
 for(let n=lo;n<=hi;n++)assert.equal(deck.filter(v=>v===n).length,5);
 for(const variant of ['collect','passing']){
  const state=E.start({range,variant,names:['Aya','Mikkel','Far'],donkeyCount:8},seeded(42));
  assert(E.validate(state));assert.equal(state.players.length,3);
  assert.equal(state.donkeyCount,variant==='passing'?1:8);
  // Keep the deck valid for repeated, fully deterministic round trips.
  assert(E.validate(E.restore(JSON.stringify(state))));
  let moves=0;
  for(;moves<1600&&!state.finished;moves++){
   if(state.pending!==null){E.play(state);}
   else if(E.openPlay(state)&&moves%3!==0){E.play(state,'open')}
   else E.flip(state);
   assert(E.validate(state),`${range} ${variant}: corrupted at ${moves}`);
  }
  // Some deck permutations can take more than 1,600 moves, but must always conserve all cards.
  assert(moves>2);
 }
}
let state=E.start({range:'21-40',variant:'collect',names:['A','B','C'],donkeyCount:4,extraPenalty:true},seeded(11));
assert.equal(E.stock(state),4);
const before=state.players.map(p=>p.closed.length);
const extra=E.penalty(state,1);assert.deepEqual(extra,{assigned:true,extras:2});
assert.equal(state.players[1].donkeys,1);assert.equal(state.players[1].closed.length,before[1]+2);
assert.equal(state.players[0].closed.length,before[0]-1);
assert.equal(E.stock(state),3);assert(E.validate(state));
for(let i=0;i<10;i++)E.penalty(state,1);
assert.equal(E.stock(state),0);assert.equal(state.players.reduce((s,p)=>s+p.donkeys,0),4);assert(E.validate(state));
state=E.start({range:'1-20',variant:'passing',names:['A','B'],donkeyCount:8},seeded(3));
assert.equal(state.donkeyCount,1);E.penalty(state,0);assert.deepEqual(state.players.map(p=>p.donkeys),[1,0]);
E.penalty(state,1);assert.deepEqual(state.players.map(p=>p.donkeys),[0,1]);
assert(E.validate(state));
assert.equal(E.restore(JSON.stringify({...state,range:'1-100'})),null);
assert.equal(E.restore(JSON.stringify({...state,players:[]})),null);
assert.equal(E.restore('{broken'),null);
console.log('PASS: five ranges, 100 cards each, independent donkey variants, penalties, simulations and safe save validation');
