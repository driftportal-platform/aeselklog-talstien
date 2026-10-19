const assert=require('node:assert/strict');
(async()=>{
 const {GameRoom}=await import('../worker/src.js');
 const originalNow=Date.now;let now=1000000;Date.now=()=>now;
 try{
 async function lobby(count=6,joined=2,sets=5){
 const db=new Map(),storage={get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v))};
 const room=new GameRoom({storage},{}),host='a'.repeat(48),secrets=[host];
 const call=(route,data)=>room.fetch(new Request('https://room/'+route,{method:data?'POST':'GET',...(data?{body:JSON.stringify(data)}:{})}));
 await call('init',{code:'ABCDEFGH',secret:host,name:'P0',range:'21-40',deckSets:sets,playerCount:count});
 for(let i=1;i<joined;i++)secrets.push((await (await call('join',{name:'P'+i})).json()).secret);
 return {db,storage,room,call,host,secrets};
 }
 {const x=await lobby();const created=now;
 assert.equal((await (await x.call('state?secret='+x.host)).json()).startWaitMs,60000);
 assert.equal((await x.call('action',{type:'start-early',secret:'bad'})).status,401);
 now=created+59999;assert.equal((await x.call('action',{type:'start-early',secret:x.host})).status,400);assert.equal(x.db.get('game').phase,'waiting');
 now=created+60000;assert.equal((await x.call('action',{type:'start-early',secret:x.secrets[1]})).status,400);
 assert.equal(x.db.get('game').phase,'waiting');assert(x.db.get('game').players.every(p=>p.closed.length===0));
 // Waiting never starts a game by itself. Host remains host after object reconstruction.
 const restored=new GameRoom({storage:x.storage},{});const r=await restored.fetch(new Request('https://room/action',{method:'POST',body:JSON.stringify({type:'start-early',secret:x.host})}));assert.equal(r.status,200);
 const state=await r.json();assert.equal(state.phase,'playing');assert.equal(state.playerCount,2);assert.deepEqual(state.players.map(p=>p.closed),[50,50]);
 const before=structuredClone(x.db.get('game'));assert.equal((await x.call('action',{type:'start-early',secret:x.host})).status,400);assert.deepEqual(x.db.get('game'),before);assert.equal((await x.call('join',{name:'Late'})).status,409);
 }
 {const x=await lobby(6,1);now+=60000;assert.equal((await x.call('action',{type:'start-early',secret:x.host})).status,400);assert.equal(x.db.get('game').phase,'waiting');}
 for(let sets=1;sets<=5;sets++){
 const x=await lobby(6,3,sets);now+=60000;
 await Promise.all(x.secrets.map(secret=>x.call('chat-settings',{secret,enabled:true})));
 assert.equal((await x.call('action',{type:'start-early',secret:x.host})).status,200);
 const g=x.db.get('game'),all=g.players.flatMap(p=>p.closed);assert.equal(all.length,20*sets);assert.equal(g.playerCount,3);assert.deepEqual(g.chatPrefs,[true,true,true]);
 for(let n=21;n<=40;n++)assert.equal(all.filter(c=>c===n).length,sets);
 const counts=g.players.map(p=>p.closed.length);assert(Math.max(...counts)-Math.min(...counts)<=1);
 assert.equal((await x.call('chat',{secret:x.secrets[2],kind:'text',text:'Vi tre spiller nu'})).status,200);
 }
 // The final invited participant may still trigger the normal automatic start before 60s.
 {const x=await lobby(3,2);assert.equal((await x.call('join',{name:'Final'})).status,200);assert.equal(x.db.get('game').phase,'playing');}
 // Last join versus early start is serialized: no lost participant, no second deal.
 for(const startFirst of [true,false]){const x=await lobby(3,2);now+=60000;const early=()=>x.call('action',{type:'start-early',secret:x.host}),join=()=>x.call('join',{name:'Late'});const results=await Promise.all(startFirst?[early(),join()]:[join(),early()]);assert.equal(results[0].status,200);assert.equal(results[1].status,startFirst?409:400);const g=x.db.get('game');assert.equal(g.players.flatMap(p=>p.closed).length,100);assert.equal(g.playerCount,startFirst?2:3);}
 console.log('PASS early start: exact 60s, host auth, minimum two, no auto timeout, storage restore, late join race, one deal, 1–5 sets and trimmed consent');
 }finally{Date.now=originalNow}
})().catch(e=>{console.error(e);process.exitCode=1});
