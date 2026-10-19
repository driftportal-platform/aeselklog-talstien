const assert=require('node:assert/strict');
(async()=>{
 const {GameRoom}=await import('../worker/src.js');const db=new Map(),room=new GameRoom({storage:{get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v)),delete:async k=>db.delete(k)}},{}),secret='a'.repeat(48);
 const call=(route,body,token=secret)=>room.fetch(new Request('https://room/'+route,{method:body?'POST':'GET',headers:{'x-player-secret':token},...(body?{body:JSON.stringify({secret:token,...body})}:{})}));
 await call('init',{name:'Alma',code:'ABCDEFGH',range:'1-20',deckSets:1,playerCount:6});
 assert.equal((await call('chat',{kind:'text',text:'Alene i lobbyen, uden samtykke'})).status,200);
 for(let i=0;i<3;i++)assert.equal((await call('chat',{kind:'text',text:'Hurtig '+i})).status,200);
 const bytes=Buffer.alloc(500000,7);let r=await call('chat',{kind:'voice',mime:'audio/mpeg',audio:bytes.toString('base64'),duration:80});assert.equal(r.status,200);const id=(await r.json()).id;
 assert(!JSON.stringify(db.get('game')).includes(bytes.toString('base64')));assert(db.has('clip:'+id));r=await call('clip?id='+id);assert.equal(r.headers.get('content-type'),'audio/mpeg');assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes);
 assert.equal((await call('clip?id='+id,null,'bad')).status,401);
 assert.equal((await call('chat',{kind:'voice',mime:'audio/mp4',audio:'A',duration:1})).status,400);
 assert.equal((await call('chat',{kind:'voice',mime:'audio/mp4',audio:Buffer.alloc(1048577).toString('base64'),duration:1})).status,413);
 const legacy=db.get('game');legacy.chat.push({id:'legacy',seat:0,at:Date.now(),kind:'voice',mime:'audio/ogg',audio:'AA==',duration:2});db.set('game',legacy);assert.equal((await call('clip?id=legacy')).status,200);
 for(let i=0;i<31;i++)await call('chat',{kind:'text',text:'Ny '+i});assert.equal(db.has('clip:'+id),false);assert.equal(db.get('game').chat.length,30);
 r=await call('chat',{kind:'voice',mime:'audio/wav',audio:'AA==',duration:0});const endId=(await r.json()).id;assert(db.has('clip:'+endId));await call('action',{type:'end-game'});assert(!db.has('clip:'+endId));
 console.log('PASS free chat: lobby access, no consent/cooldown, long voice, separate clip storage, authenticated playback, size bound, legacy audio, eviction and end cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
