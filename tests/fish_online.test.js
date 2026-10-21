const assert=require('node:assert/strict');
(async()=>{const {default:worker,GameRoom}=await import('../worker/src.js');const E=globalThis.TorskeKlog,db=new Map(),storage={get:async k=>structuredClone(db.get(k)),put:async(k,v)=>db.set(k,structuredClone(v)),delete:async k=>db.delete(k)},room=new GameRoom({storage},{});const origin='https://driftportal-platform.github.io';const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:x=>x,get:()=>({fetch:(r,i)=>room.fetch(r instanceof Request?r:new Request(r,i))})}};const call=(path,data)=>worker.fetch(new Request('https://worker.test'+path,{method:data?'POST':'GET',headers:{origin,'content-type':'application/json'},...(data?{body:JSON.stringify(data)}:{})}),env);
let r=await call('/api/create',{name:'A',gameType:'fish',playerCount:3,range:'41-60'});assert.equal(r.status,200);const first=await r.json(),base='/api/room/'+first.code+'/',secrets=[first.secret];for(const name of ['B','C']){r=await call(base+'join',{name});assert.equal(r.status,200);secrets.push((await r.json()).secret)}
assert.equal(db.get('game').phase,'playing');assert(E.assert(db.get('game').fish));const read=async i=>(await call(base+'state?secret='+secrets[i])).json();let view=await read(0);assert.equal(view.gameType,'fish');assert.equal(view.fish.hand.length,7);assert.equal(view.fish.pond,59);assert(view.fish.players.every(p=>!('hand' in p)));assert(!JSON.stringify(view).includes(secrets[1]));assert(!('lastDraw' in view.fish));
const g=db.get('game'),n=g.fish.players[0].hand[0];const payload={secret:secrets[0],type:'fish-ask',number:n,target:1,requestId:'a'.repeat(32),expectedMove:g.move};r=await call(base+'action',payload);assert.equal(r.status,200);const after=structuredClone(db.get('game'));r=await call(base+'action',payload);assert.equal(r.status,200);assert.deepEqual(db.get('game'),after,'retry must not move cards twice');assert((await read(0)).acknowledgedActions.includes(payload.requestId));
r=await call(base+'action',{...payload,target:2});assert.equal(r.status,409);r=await call(base+'action',{...payload,requestId:'b'.repeat(32)});assert.equal(r.status,409,'stale move rejected');r=await call(base+'action',{secret:'bad',type:'fish-draw'});assert.equal(r.status,401);
// Continue after replacing the Durable Object instance (storage/reconnect).
const reconnected=new GameRoom({storage},{});let s=await(await reconnected.fetch(new Request('https://room/state?secret='+secrets[2]))).json();assert.deepEqual(s.fish.hand,db.get('game').fish.players[2].hand);
r=await call(base+'leave',{secret:secrets[0]});assert.equal(r.status,200);assert.equal(db.get('game').phase,'playing');assert.equal(db.get('game').hostSeat,1);assert(E.assert(db.get('game').fish));assert.equal(db.get('game').fish.players[0].hand.length,0);assert((await read(1)).departure.name==='A');
r=await call(base+'action',{secret:secrets[0],type:'fish-ask',number:n,target:1});assert.equal(r.status,401);
// Host can close for all and state remains available.
s=await read(1);r=await call(base+'action',{secret:secrets[1],type:'end-game',expectedMove:s.move,requestId:'c'.repeat(32)});assert.equal(r.status,200);assert.equal((await read(2)).phase,'closed');
// Run complete games through the server action endpoint for every party size.
for(let count=2;count<=6;count++){
 const data=new Map(),room2=new GameRoom({storage:{get:async k=>structuredClone(data.get(k)),put:async(k,v)=>data.set(k,structuredClone(v))}},{}),keys=['x'.repeat(48)];
 const request=(path,body)=>room2.fetch(new Request('https://room/'+path,{method:body?'POST':'GET',...(body?{body:JSON.stringify(body)}:{})}));
 await request('init',{code:'ABCDEFGH',name:'P0',secret:keys[0],gameType:'fish',range:'1-20',playerCount:count});
 for(let k=1;k<count;k++)keys.push((await(await request('join',{name:'P'+k})).json()).secret);
 let step=0,seed=123;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 while(data.get('game').phase==='playing'&&step++<15000){const g=data.get('game'),f=g.fish,seat=f.turn,p=f.players[seat];let b={type:'fish-draw'};if(!f.pending){const ranks=[...new Set(p.hand)],targets=f.players.map((_,i)=>i).filter(i=>i!==seat);b={type:'fish-ask',number:ranks[Math.floor(rand()*ranks.length)],target:targets[Math.floor(rand()*targets.length)]}}
 const reply=await request('action',{...b,secret:keys[seat],expectedMove:g.move,requestId:step.toString(16).padStart(32,'0')});assert.equal(reply.status,200);const v=await reply.json();assert(v.fish.players.every(q=>!('hand' in q)));assert(E.assert(data.get('game').fish));}
 assert.equal(data.get('game').phase,'finished');assert.equal(data.get('game').fish.players.reduce((n,p)=>n+p.books.length,0),20);
}
console.log('PASS TorskeKlog Worker create/join, private hand, no secrets/draw leak, idempotency, stale/unauthorized requests, storage resume, host succession, leave and end');
})().catch(e=>{console.error(e);process.exitCode=1});
