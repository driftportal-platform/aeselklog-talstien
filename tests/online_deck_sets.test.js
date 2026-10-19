const assert=require('node:assert/strict');
(async()=>{
 const {default:worker,GameRoom}=await import('../worker/src.js');
 const origin='https://driftportal-platform.github.io';
 async function create(deckSets,range='1-20',legacy=false){
  const saved=new Map();let code;
  const room=new GameRoom({storage:{get:async k=>structuredClone(saved.get(k)),put:async(k,v)=>saved.set(k,structuredClone(v))}},{});
  const env={APP_ORIGIN:origin,GAME_ROOM:{idFromName:c=>(code=c),get:()=>({fetch:(r,i)=>room.fetch(r instanceof Request?r:new Request(r,i))})}};
  const input={name:'Alma',range,...(deckSets===undefined?{}:{deckSets})};
  const r=await worker.fetch(new Request('https://worker/api/create',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(input)}),env);
  if(r.status!==200)return {r};
  const {secret}=await r.json();
  if(legacy){const g=saved.get('game');delete g.deckSets;saved.set('game',g)}
  // Reconstruct the Durable Object: setting must survive storage/reconnection.
  const restored=new GameRoom({storage:{get:async k=>structuredClone(saved.get(k)),put:async(k,v)=>saved.set(k,structuredClone(v))}},{});
  const joined=await restored.fetch(new Request('https://room/join',{method:'POST',body:JSON.stringify({name:'Bo',deckSets:1})}));assert.equal(joined.status,200);
  const second=(await joined.json()).secret;
  for(const token of [secret,second]){
   const state=await (await restored.fetch(new Request('https://room/state?secret='+token))).json();
   assert.equal(state.deckSets,legacy?5:deckSets??5);assert.equal(state.players[0].closed,(legacy?5:deckSets??5)*10);assert.equal(state.players[1].closed,state.players[0].closed);
  }
  return {r,g:saved.get('game')};
 }
 for(const range of ['1-20','21-40','41-60','61-80','81-100'])for(let sets=1;sets<=5;sets++){
  const {g}=await create(sets,range);const cards=g.players.flatMap(p=>p.closed);assert.equal(cards.length,sets*20);
  const [lo,hi]=range.split('-').map(Number);for(let n=lo;n<=hi;n++)assert.equal(cards.filter(c=>c===n).length,sets);
 }
 await create(undefined);await create(3,'1-20',true);
 for(const invalid of [0,6,-1,1.5,'2',null,true]){const {r}=await create(invalid);assert.equal(r.status,400);assert.equal(r.headers.get('access-control-allow-origin'),origin)}
 console.log('PASS online deck sets: 1–5 × all ranges, exact card counts, both seats, persistence, host setting, legacy default, invalid input');
})().catch(e=>{console.error(e);process.exitCode=1});
