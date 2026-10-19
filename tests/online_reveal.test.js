const assert=require('node:assert/strict');
(async()=>{
 const {GameRoom}=await import('../worker/src.js');const room=new GameRoom({storage:{}},{});
 const game=()=>({phase:'playing',range:'1-20',turn:0,pending:null,move:10,variant:'collect',extraPenalty:false,donkeyCount:8,centers:[[1]],players:[{name:'A',closed:[9,2],open:[],donkeys:0},{name:'B',closed:[8],open:[],donkeys:0}],chat:[],chatPrefs:[false,false]});
 {const g=game();room.doFlip(g,0);assert.equal(g.pending,2);assert.deepEqual(g.players[0].open,[]);room.doPlace(g,0,{source:'pending',kind:'self-open'});assert.equal(g.turn,1);assert.equal(g.pending,null);assert.deepEqual(g.players[0].open,[2]);room.doChallenge(g,1);assert.equal(g.pending,2);assert.equal(g.turn,0);assert.equal(g.players[0].donkeys,1);assert.equal(room.publicState(g,1).penaltySoundId,11);}
 {const g=game();room.doFlip(g,0);room.doPlace(g,0,{source:'pending',kind:'center',index:0});assert.equal(g.turn,0);assert.equal(g.pending,null);assert.deepEqual(g.players[0].open,[]);room.doChallenge(g,1);assert.equal(room.publicState(g,1).penaltySoundId,0);}
 {const g=game();g.players[0].donkeys=8;room.doFlip(g,0);room.doPlace(g,0,{source:'pending',kind:'self-open'});room.doChallenge(g,1);assert.equal(g.players[0].donkeys,8);assert.equal(room.publicState(g,1).penaltySoundId,0);}
 {const g=game();g.variant='passing';g.players[1].donkeys=1;room.doFlip(g,0);room.doPlace(g,0,{source:'pending',kind:'self-open'});room.doChallenge(g,1);assert.equal(g.players[1].donkeys,0);assert.equal(g.players[0].donkeys,1);assert.equal(g.penaltySoundId,11);}
 console.log('PASS closed-pile reveal: own-open ends turn, center continues, correct challenge silent, assigned donkey sound event and exhausted pool silent');
})().catch(e=>{console.error(e);process.exitCode=1});
