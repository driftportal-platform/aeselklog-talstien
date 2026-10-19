const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const {default:worker,GameRoom}=await import('../worker/src.js');
 const origin='https://driftportal-platform.github.io';
 const records=new Map(),storage={get:async k=>structuredClone(records.get(k)),put:async(k,v)=>records.set(k,structuredClone(v))};
 const room=new GameRoom({storage},{});
 const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:c=>c,get:()=>({fetch:(input,init)=>room.fetch(input instanceof Request?input:new Request(input,init))})}};
 const call=(path,method='GET',data,secret)=>worker.fetch(new Request('https://worker'+path,{method,headers:{origin,'content-type':'application/json',...(secret?{'x-player-secret':secret}:{})},...(data?{body:JSON.stringify(data)}:{})}),env);
 const base='/api/room/ABCDEFGH/';
 let r=await call(base+'chat','OPTIONS');assert.equal(r.status,204);assert.match(r.headers.get('access-control-allow-headers'),/x-player-secret/);
 const initSecret='a'.repeat(48);
 await room.fetch(new Request('https://room/init',{method:'POST',body:JSON.stringify({code:'ABCDEFGH',name:'Alma',range:'1-20',secret:initSecret})}));
 r=await call(base+'join','POST',{name:'Bo'});const other=(await r.json()).secret;assert(other);
 r=await call(base+'chat','GET',null,'bad');assert.equal(r.status,401);assert.equal(r.headers.get('access-control-allow-origin'),origin);
 r=await call(base+'chat','POST',{secret:initSecret,kind:'quick',text:'👏 Godt spil!'});assert.equal(r.status,200);
 r=await call(base+'chat','POST',{secret:other,kind:'text',text:'Hej'});assert.equal(r.status,200);
 for(const secret of [initSecret,other])assert.equal((await call(base+'chat-settings','POST',{secret,enabled:true})).status,200);
 r=await call(base+'chat','POST',{secret:other,kind:'text',text:'Hej'});assert.equal(r.status,200);
 let g=records.get('game');g.chat.forEach(m=>m.at-=2000);records.set('game',g);
 const bytes=Buffer.from([0,1,2,3,255]);
 r=await call(base+'chat','POST',{secret:initSecret,kind:'voice',mime:'audio/mp4',audio:bytes.toString('base64'),duration:1});assert.equal(r.status,200);const id=(await r.json()).id;
 r=await call(base+'clip?id='+id,'GET',null,other);assert.equal(r.headers.get('content-type'),'audio/mp4');assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes);
 r=await call(base+'chat','GET',null,other);const history=await r.json();assert.equal(history.messages.length,4);assert(!history.messages.some(m=>'audio'in m));
 // WebSocket upgrades must be returned intact (Node's Response disallows real 101).
 const upgrade={status:101,webSocket:{}};
 const upgraded=await worker.fetch(new Request('https://worker'+base+'ws?secret='+other,{headers:{origin}}),{...env,GAME_ROOM:{idFromName:c=>c,get:()=>({fetch:async()=>upgrade})}});assert.equal(upgraded,upgrade);
 const fresh=(variant='collect',extraPenalty=false)=>({range:'1-20',variant,extraPenalty,donkeyCount:4,phase:'playing',turn:0,pending:2,centers:[[1]],players:[{name:'A',secret:initSecret,closed:[7],open:[],donkeys:0},{name:'B',secret:other,closed:[8,9],open:[],donkeys:0}],chat:[],chatPrefs:[false,false],move:12,lastMove:null});
 for(const variant of ['collect','passing']){
  const s=fresh(variant,true);if(variant==='passing')s.players[1].donkeys=1;
  room.doPlace(s,0,{source:'pending',kind:'self-open',index:0});assert.equal(s.lastMove.valid,false);
  s.chat=[{text:'bevar mig'}];s.chatPrefs=[true,true];s.move=19;
  room.doChallenge(s,1);assert.equal(s.pending,2);assert.equal(s.players[0].donkeys,1);assert.equal(s.players[0].closed.length,2);assert.equal(s.players[1].closed.length,1);assert.equal(s.move,19);assert.equal(s.chat[0].text,'bevar mig');assert.deepEqual(s.chatPrefs,[true,true]);
  if(variant==='passing')assert.equal(s.players[1].donkeys,0);
 }
 {const s=fresh();room.doPlace(s,0,{source:'pending',kind:'center',index:0});room.doChallenge(s,1);assert.equal(s.players[0].donkeys,0);assert.deepEqual(s.centers,[[1,2]]);}
 {const s=fresh();s.pending=null;s.players[0].open=[2];room.doFlip(s,0);assert.equal(s.pending,7);assert.equal(s.lastMove.type,'flip');room.doChallenge(s,1);assert.equal(s.pending,null);assert.deepEqual(s.players[0].closed,[7]);}
 for(const dons of [[0,0],[2,0],[0,2]]){const s=fresh();s.players.forEach((p,i)=>p.donkeys=dons[i]);s.players[0].closed=[];room.doPlace(s,0,{source:'pending',kind:'center',index:0});assert.equal(s.winner,dons[0]>dons[1]?1:0);assert.equal(s.placements[0],s.winner);room.doChallenge(s,1);assert.equal(s.phase,'finished');}
 {const s=fresh();const before=structuredClone(s);assert.throws(()=>room.doPlace(s,0,{source:'pending',kind:'center',index:9}));assert.deepEqual(s,before);}
 {const s=fresh();s.pending=null;s.players[0].open=[];room.doFlip(s,0);assert.equal(s.pending,7);assert.equal(s.turn,0);}
 console.log('PASS online: CORS, two participants, quick/text/voice bytes, upgrade, variants, rollback, winners, invalid targets');
})().catch(e=>{console.error(e);process.exitCode=1});
