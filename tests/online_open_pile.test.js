const assert=require('node:assert/strict');
(async()=>{
 const {GameRoom}=await import('../worker/src.js');const room=new GameRoom({storage:{}},{});
 const game=(n=2)=>({range:'1-20',phase:'playing',playerCount:n,turn:0,pending:null,variant:'collect',extraPenalty:false,donkeyCount:8,centers:[[1]],players:Array.from({length:n},(_,i)=>({name:'P'+i,closed:[9,2],open:[],donkeys:0})),chat:[],chatPrefs:Array(n).fill(false),move:0,lastMove:null});
 {const g=game();room.doFlipOpen(g,0);assert.equal(g.pending,null);assert.equal(g.turn,0);assert.equal(g.players[0].open.at(-1),2);assert.equal(g.players[0].closed.length,1);room.doPlace(g,0,{source:'open',kind:'center',index:0});assert.deepEqual(g.centers,[[1,2]]);assert.equal(g.turn,0);assert.equal(g.players[0].open.length,0);}
 {const g=game(3);room.doFlipOpen(g,0);const before=structuredClone(g);room.doEndTurn(g,0);assert.equal(g.turn,1);assert.equal(g.lastMove.valid,false);room.doChallenge(g,2);assert.equal(g.turn,0);assert.deepEqual(g.players[0].open,before.players[0].open);assert.deepEqual(g.players[0].closed,before.players[0].closed);assert.equal(g.players[0].donkeys,1);assert.equal(g.pending,null);}
 {const g=game();g.centers=[];room.doFlipOpen(g,0);room.doEndTurn(g,0);assert.equal(g.turn,1);assert.equal(g.lastMove.valid,true);room.doChallenge(g,1);assert.equal(g.players[0].donkeys,0);}
 {const g=game();g.players[0].open=[2];const before=structuredClone(g);room.doFlipOpen(g,0);assert.equal(g.lastMove.type,'flip');room.doChallenge(g,1);assert.deepEqual(g.players[0].open,before.players[0].open);assert.deepEqual(g.players[0].closed,before.players[0].closed);}
 {const g=game();g.centers=[];g.players[0].closed=[];g.players[0].open=[3,7];room.doFlipOpen(g,0);assert.deepEqual(g.players[0].closed,[7]);assert.deepEqual(g.players[0].open,[3]);assert.equal(g.turn,0);}
 for(let n=2;n<=6;n++){const g=game(n);g.centers=[];for(let seat=0;seat<n;seat++){room.doFlipOpen(g,seat);room.doEndTurn(g,seat);assert.equal(g.turn,(seat+1)%n)}assert.equal(g.players.flatMap(p=>[...p.closed,...p.open]).length,2*n);}
 {const g=game();g.pending=2;assert.throws(()=>room.doFlipOpen(g,0));room.doEndTurn(g,0);assert.equal(g.pending,null);assert.equal(g.players[0].open.at(-1),2);assert.equal(g.turn,1);}
 {const g=game();g.players[0].closed=[2];room.doFlipOpen(g,0);assert.equal(g.phase,'playing');room.doPlace(g,0,{source:'open',kind:'center',index:0});assert.equal(g.phase,'finished');}
 console.log('PASS open-pile flow: direct reveal, move/continue/end, missed placements, undo/penalty, recycling, 2–6 turns, old pending cards and finish');
})().catch(e=>{console.error(e);process.exitCode=1});
