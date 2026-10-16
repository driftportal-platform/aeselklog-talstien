'use strict';
const assert=require('node:assert/strict');
const E=require('../cardgame-engine.js');
function game(opts={}){return E.start({range:'21-40',names:['Klara','Simon'],...opts},()=>.52)}
function toTop(p,n){let i=p.closed.indexOf(n);if(i<0)throw Error('testkort findes ikke');let j=p.closed.length-1;[p.closed[i],p.closed[j]]=[p.closed[j],p.closed[i]];}
{
 const s=game({names:['Klara'],vsCPU:true});
 assert.equal(s.players.length,2);assert.equal(s.players[1].isCPU,true);assert.equal(s.players[0].isCPU,false);assert(E.validate(s));
 assert(E.restore(JSON.stringify(s)).players[1].isCPU);
 assert.throws(()=>game({names:['Klara'],vsCPU:false}),/2–6/);
 const full=game({names:['A','B','C','D','E','F'],vsCPU:true});assert.equal(full.players.length,7);assert(E.validate(full));
}
{
 let s=game();toTop(s.players[0],31);
 assert.equal(E.flipManual(s).number,31);
 assert.throws(()=>E.placeManual(s,'pending',{kind:'new-center'}),/starte med 21/);
 assert.deepEqual(s.centers,[]);assert.equal(s.pending,31);assert(E.validate(s));
 // Forkert kort på en EKSISTERENDE række må stadig lægges og udfordres.
 // Flyt et 21-kort til en række, uden at ødelægge antal-kort-kontrollen.
 const source=s.players.find(p=>p.closed.includes(21));
 s.centers.push([source.closed.splice(source.closed.indexOf(21),1)[0]]);
 const out=E.placeManual(s,'pending',{kind:'center',index:0});
 assert.equal(out.legal,false);assert.deepEqual(s.centers,[[21,31]]);
 const saved=E.restore(JSON.stringify(s));assert(saved.lastMove);
 const verdict=E.challenge(saved);
 assert.equal(verdict.caught,true);assert.equal(verdict.number,31);
 assert.equal(saved.players[0].donkeys,1);assert.equal(saved.pending,31);
 assert.deepEqual(saved.centers,[[21]]);assert.equal(saved.turn,0);
 assert(E.validate(saved));
}
{
 const s=game({variant:'passing',donkeyCount:8,extraPenalty:true});toTop(s.players[0],21);
 E.flipManual(s);const r=E.placeManual(s,'pending',{kind:'new-center'});assert(r.legal);
 const n=JSON.stringify(s.centers);const before=JSON.stringify(s.players);
 assert.deepEqual(E.challenge(s),{caught:false});assert.equal(JSON.stringify(s.centers),n);
 assert.equal(JSON.stringify(s.players),before);assert(E.validate(s));
}
{
 const s=game();toTop(s.players[0],21);E.flipManual(s);
 const r=E.discardManual(s);
 assert.equal(r.legal,false);assert.equal(s.turn,1);assert.equal(s.players[0].open.at(-1),21);
 const v=E.challenge(s);assert(v.caught);
 assert.equal(s.turn,0);assert.equal(s.pending,21);assert.equal(s.players[0].donkeys,1);
 assert(E.validate(s));
}
{
 const s=game({names:['A'],vsCPU:true});toTop(s.players[0],31);
 E.flipManual(s);let wrong=E.placeManual(s,'pending',{kind:'player',index:1});
 assert(!wrong.legal);assert.equal(s.players[1].open.at(-1),31);
 E.challenge(s);assert.equal(s.players[1].open.length,0);assert.equal(s.players[0].donkeys,1);
 assert(E.validate(s));
}
{
 const s=game();
 const take=(n,dest)=>{for(const p of s.players){const i=p.closed.indexOf(n);if(i>=0){dest.push(p.closed.splice(i,1)[0]);return;}}throw Error('Missing card '+n)};
 take(31,s.players[0].open);take(30,s.players[1].open);
 assert(E.validate(s));assert(E.openPlay(s));
 const previousCount=s.players[0].closed.length;
 E.flipManual(s);assert.equal(s.lastMove?.type,'flip');assert.equal(s.lastMove?.valid,false);
 const done=E.challenge(s);assert(done.caught);assert.equal(s.pending,null);
 assert.equal(s.players[0].closed.length,previousCount);
 assert.equal(s.players[0].open.at(-1),31);assert.equal(s.players[0].donkeys,1);assert(E.validate(s));
}
{
 // Begge slags deltagere skal kunne gennemføre lange, manuelle kortforløb
 // uden at miste kort eller gøre checkpoint-rekursion uendelig.
 const s=E.start({range:'61-80',names:['Aya'],vsCPU:true},(()=>{let n=0;return ()=>((n= (Math.imul(n,1664525)+1013904223)>>>0)/2**32)})());
 for(let step=0;step<1000&&!s.finished;step++){
  if(s.pending!==null){const target=E.preferredTarget(s,s.pending);E.placeManual(s,'pending',target||{kind:'self-open'});}
  else{const target=E.openPlay(s);if(target&&step%4===0)E.placeManual(s,'open',target);else E.flipManual(s);}
  assert(E.validate(s),'manual turn '+step);if(step%100===0)assert(E.restore(JSON.stringify(s)));
 }
}
{
 // Gamle gemninger v1 uden isCPU/lastMove kan fortsat læses.
 const old=game();old.players.forEach(p=>delete p.isCPU);delete old.lastMove;
 assert(E.restore(JSON.stringify(old)));assert(E.validate(old));
}
console.log('PASS: solo CPU, free illegal drops, correct challenges, undo+penalty, optional extra penalty and v1 save compatibility');
