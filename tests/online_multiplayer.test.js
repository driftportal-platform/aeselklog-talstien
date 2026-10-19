const assert=require('node:assert/strict');
(async()=>{
 const {default:worker,GameRoom}=await import('../worker/src.js');
 const origin='https://driftportal-platform.github.io';
 async function lobby(count,sets=1){
  const db=new Map();const storage={get:async k=>structuredClone(db.get(k)),put:async(k,v)=>{await Promise.resolve();db.set(k,structuredClone(v))}};
  const room=new GameRoom({storage},{});let code;
  const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:c=>(code=c),get:()=>({fetch:(r,i)=>room.fetch(r instanceof Request?r:new Request(r,i))})}};
  const r=await worker.fetch(new Request('https://worker/api/create',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({name:'P0',range:'1-20',playerCount:count,deckSets:sets})}),env);
  if(r.status!==200)return {r};
  const host=(await r.json()).secret;
  const call=(route,body,secret)=>room.fetch(new Request('https://room/'+route,{method:body?'POST':'GET',headers:secret?{'x-player-secret':secret}:{},...(body?{body:JSON.stringify(body)}:{})}));
  return {r,db,room,host,call,storage};
 }
 for(let n=2;n<=6;n++)for(let sets=1;sets<=5;sets++){
  const {db,room,host,call}=await lobby(n,sets);assert.equal(db.get('game').phase,'waiting');assert.equal(db.get('game').players[0].closed.length,0);
  const seats=[host];
  for(let i=1;i<n;i++){
   const r=await call('join',{name:'P'+i});assert.equal(r.status,200);seats.push((await r.json()).secret);
   if(i<n-1){assert.equal(db.get('game').phase,'waiting');assert(db.get('game').players.every(p=>p.closed.length===0));}
  }
  const g=db.get('game'),counts=g.players.map(p=>p.closed.length);
  assert.equal(g.phase,'playing');assert.equal(counts.reduce((a,b)=>a+b,0),sets*20);assert(Math.max(...counts)-Math.min(...counts)<=1);
  assert.equal((await call('join',{name:'Extra'})).status,409);
  for(let i=0;i<n;i++){const r=await call('state?secret='+seats[i]);const state=await r.json();assert.equal(state.you,i);assert.equal(state.playerCount,n);assert.equal(state.players.length,n);assert(!JSON.stringify(state).includes(host));}
  const restored=new GameRoom({storage:{get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v))}},{});
  const state=await (await restored.fetch(new Request('https://room/state?secret='+host))).json();assert.equal(state.playerCount,n);
 }
 for(const n of [0,1,7,2.5,'3',null,true])assert.equal((await lobby(n)).r.status,400);
 {const {db,call}=await lobby(6);const joined=await Promise.all(Array.from({length:7},(_,i)=>call('join',{name:'P'+(i+1)})));assert.equal(joined.filter(r=>r.status===200).length,5);assert.equal(db.get('game').players.length,6);assert.equal(db.get('game').players.flatMap(p=>p.closed).length,20);}
 {const {db,call}=await lobby(4);await call('join',{name:'P1'});assert.equal((await call('join',{name:'p1'})).status,400);assert.equal(db.get('game').players.length,2);}
 // Everyone must consent, including seats 2–5. Messages identify the actual sender.
 {const {call,host,db}=await lobby(6);const secrets=[host];for(let i=1;i<6;i++)secrets.push((await (await call('join',{name:'P'+i})).json()).secret);
 for(let i=0;i<5;i++)await call('chat-settings',{secret:secrets[i],enabled:true});
 assert.equal((await call('chat',{secret:host,kind:'text',text:'Hej'})).status,200);
 await call('chat-settings',{secret:secrets[5],enabled:true});assert.equal((await call('chat',{secret:secrets[5],kind:'text',text:'Hej fra seks'})).status,200);
 const history=await (await call('chat',null,host)).json();assert.equal(history.prefs.length,6);assert.equal(history.messages.at(-1).seat,5);assert.equal(history.players[5],'P5');
 await call('chat-settings',{secret:secrets[2],enabled:false});assert.equal((await call('chat',{secret:host,kind:'voice',mime:'audio/mp4',audio:'AA==',duration:1})).status,200);
 }
 const engine=new GameRoom({storage:{}},{});
 const game=n=>({range:'1-20',phase:'playing',playerCount:n,turn:0,pending:null,variant:'collect',extraPenalty:false,donkeyCount:8,centers:[],players:Array.from({length:n},(_,i)=>({name:'P'+i,closed:[i+1],open:[],donkeys:i===0?1:0})),chat:[],chatPrefs:Array(n).fill(false),move:0,lastMove:null});
 for(let n=3;n<=6;n++){
  const g=game(n);for(let i=0;i<n-1;i++){
   assert.equal(g.turn,i);engine.doFlip(g,i);engine.doPlace(g,i,{source:'pending',kind:i===0?'new-center':'center',index:0});
   assert.equal(g.phase,i===n-2?'finished':'playing');
  }
  assert.equal(g.winner,1);assert.equal(g.placements.length,n);assert.equal(g.placements[0],1);assert.equal(g.placements.at(-1),n-1);
 }
 // Skip a player who finished; receiving a card restores their participation.
 {const g=game(4);g.players[0].closed=[];g.finishOrder=[0];g.turn=3;engine.finishOrNext(g);assert.equal(g.turn,1);
 g.pending=2;g.turn=1;g.players[1].closed=[9];engine.doPlace(g,1,{source:'pending',kind:'player',index:0});assert(!g.finishOrder.includes(0));g.turn=3;engine.finishOrNext(g);assert.equal(g.turn,0);}
 // Extra-card penalties bring a previously completed participant back into turn order.
 {const g=game(4);g.players[0].closed=[];g.players.slice(1).forEach(p=>p.closed.push(9));g.finishOrder=[0];g.extraPenalty=true;engine.givePenalty(g,0);assert.equal(g.players[0].closed.length,3);assert(!g.finishOrder.includes(0));g.turn=3;engine.finishOrNext(g);assert.equal(g.turn,0);}
 // A wrong final placement can still be challenged and the podium rolled back.
 {const g=game(3);g.players[0].closed=[];g.finishOrder=[0];g.turn=1;g.pending=8;g.players[1].closed=[];g.centers=[[1]];engine.doPlace(g,1,{source:'pending',kind:'player',index:2});assert.equal(g.phase,'finished');engine.doChallenge(g,2);assert.equal(g.phase,'playing');assert.equal(g.pending,8);assert.deepEqual(g.finishOrder,[0]);assert.deepEqual(g.centers,[[1]]);}
 // All donors contribute only a closed card; passing keeps exactly one donkey.
 {const g=game(6);g.variant='passing';g.extraPenalty=true;g.players[5].donkeys=1;g.players[0].donkeys=0;engine.givePenalty(g,2);assert.equal(g.players[2].closed.length,6);assert.equal(g.players.reduce((s,p)=>s+p.donkeys,0),1);assert.equal(g.players[2].donkeys,1);}
 // Nearest left player wins over another legal receiver, and center has priority.
 {const g=game(4);g.pending=10;g.players[1].open=[9];g.players[2].open=[11];engine.doPlace(g,0,{source:'pending',kind:'player',index:2});assert.equal(g.lastMove.valid,false);engine.doChallenge(g,3);assert.equal(g.pending,10);assert.equal(g.players[0].donkeys,2);assert.equal(g.players[2].open.at(-1),11);}
 // Existing two-player rooms without the new capacity field still start at two.
 {const {db,host,call}=await lobby(6);const g=db.get('game');delete g.playerCount;g.chatPrefs=[false,false];db.set('game',g);assert.equal((await call('join',{name:'P1'})).status,200);assert.equal(db.get('game').phase,'playing');}
 console.log('PASS multiplayer: 2–6 seats × 1–5 sets, concurrent joins, round-robin, consent/names, persistence, ranking, revival, penalties, nearest-left and old rooms');
})().catch(e=>{console.error(e);process.exitCode=1});
