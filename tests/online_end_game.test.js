const assert=require('node:assert/strict');
(async()=>{
 const {GameRoom}=await import('../worker/src.js');
 async function game(count=2,join=true){const db=new Map(),room=new GameRoom({storage:{get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v))}},{}),host='a'.repeat(48),secrets=[host];const call=(route,data)=>room.fetch(new Request('https://room/'+route,{method:data?'POST':'GET',...(data?{body:JSON.stringify(data)}:{})}));await call('init',{code:'ABCDEFGH',secret:host,name:'Alma',range:'1-20',deckSets:5,playerCount:count});if(join)for(let i=1;i<count;i++)secrets.push((await (await call('join',{name:'P'+i})).json()).secret);return {db,room,host,secrets,call}}
 for(const count of [2,3,6]){const x=await game(count);assert.equal((await x.call('action',{secret:x.secrets[1],type:'end-game'})).status,400);assert.equal(x.db.get('game').phase,'playing');assert.equal((await x.call('action',{secret:'bad',type:'end-game'})).status,401);
 const events=[];x.room.clients.set({send:v=>events.push(JSON.parse(v).state.phase),close:(code,reason)=>events.push([code,reason])},1);
 const r=await x.call('action',{secret:x.host,type:'end-game'});assert.equal(r.status,200);assert.equal((await r.json()).phase,'closed');assert.equal(events[0],'closed');assert.equal(events[1][0],1000);assert.equal(x.room.clients.size,0);const g=x.db.get('game');assert.equal(g.lastMove,null);assert.deepEqual(g.chat,[]);assert(g.closedAt>0);
 for(const type of ['flip','flip-open','challenge','start-early','place'])assert.equal((await x.call('action',{secret:x.host,type})).status,409);
 for(const route of ['join','chat-settings','chat'])assert.equal((await x.call(route,{name:'Late',secret:x.host})).status,410);
 assert.equal((await x.call('ws?secret='+x.host)).status,410);assert.equal((await (await x.call('state?secret='+x.host)).json()).phase,'closed');
 assert.equal((await x.call('action',{secret:x.host,type:'end-game'})).status,200);assert.deepEqual(x.db.get('game'),g);
 assert.equal((await x.call('action',{secret:x.secrets[1],type:'end-game'})).status,400);
 }
 for(const phase of ['waiting','finished']){const x=await game(2,phase!=='waiting');const g=x.db.get('game');g.phase=phase;x.db.set('game',g);assert.equal((await x.call('action',{secret:x.host,type:'end-game'})).status,200);assert.equal(x.db.get('game').phase,'closed')}
 // A queued late join cannot re-open the ended room.
 {const x=await game(6,false);const results=await Promise.all([x.call('action',{secret:x.host,type:'end-game'}),x.call('join',{name:'Late'})]);assert.equal(results[0].status,200);assert.equal(results[1].status,410)}
 console.log('PASS end game: host-only, waiting/playing/finished, all sockets notified then closed, stale actions/late joins blocked, persisted closure and idempotent retry');
})().catch(e=>{console.error(e);process.exitCode=1});
