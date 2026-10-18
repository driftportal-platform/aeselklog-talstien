const assert=require('node:assert/strict');
const E=require('../cardgame-engine.js');
function game(variant,extraPenalty,names=['Alma','Bo','Cecilie']){
  const s=E.start({names,variant,extraPenalty,deckSets:1,donkeyCount:8});
  return s;
}
// Æslet sendes videre, også fra en spiller som ikke længere har talkort.
{
  const s=game('passing',false);
  E.penalty(s,0);assert.deepEqual(s.players.map(p=>p.donkeys),[1,0,0]);
  E.penalty(s,2);assert.deepEqual(s.players.map(p=>p.donkeys),[0,0,1]);
  E.penalty(s,1);assert.deepEqual(s.players.map(p=>p.donkeys),[0,1,0]);
  assert(E.validate(s));
}
// Ekstra kortstraf uddeles kun fra andre spilleres lukkede bunker.
{
  const s=game('passing',true),before=s.players.map(p=>p.closed.length);
  const r=E.penalty(s,1);
  assert.equal(r.extras,2);
  assert.equal(s.players[1].closed.length,before[1]+2);
  assert.equal(s.players[0].closed.length,before[0]-1);
  assert.equal(s.players[2].closed.length,before[2]-1);
  assert(E.validate(s));
}
// Spiller der får nye talkort efter at være færdig, mister sin foreløbige målpassage.
{
  const s=game('collect',true);
  const first=s.players[0],moved=first.closed.splice(0);
  s.centers=[moved]; s.finishOrder=[0];
  assert(E.validate(s));
  const r=E.penalty(s,0);
  assert.equal(r.extras,2);
  assert(!s.finishOrder.includes(0));
  assert(E.validate(s));
}
console.log('PASS: passing-æslet, ekstra kortstraf og tilbagevenden til spil');
