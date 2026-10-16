'use strict';
const assert=require('node:assert/strict');
const E=require('../cardgame-engine.js');
for(const range of E.RANGES){
 const [first]=E.bounds(range);
 const s=E.start({range,names:['A','B']},()=>.43);
 const player=s.players[0];
 let pos=player.closed.indexOf(first+3);assert(pos>=0);
 const j=player.closed.length-1;[player.closed[pos],player.closed[j]]=[player.closed[j],player.closed[pos]];
 E.flipManual(s);
 assert.throws(()=>E.placeManual(s,'pending',{kind:'new-center'}),new RegExp('starte med '+first));
 assert.equal(s.centers.length,0);assert.equal(s.pending,first+3);
 const holder=s.players.find(p=>p.closed.includes(first));
 s.centers.push([holder.closed.splice(holder.closed.indexOf(first),1)[0]]);
 assert(E.validate(s));
 // Fejl på eksisterende række tillades og kan opdages med æselkort.
 const move=E.placeManual(s,'pending',{kind:'center',index:0});
 assert.equal(move.legal,false);assert.equal(E.challenge(s).caught,true);
 assert.deepEqual(s.centers,[[first]]);
 assert(E.validate(s));
}
console.log('PASS: every new center pile begins with the minimum number in all five ranges');
