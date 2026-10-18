// ÆselKlog online pilot – authoritative two-player game server.
// No login, short-lived invite codes, access tokens never shown to other players.
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
function response(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...headers}})}
function random(length){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(length));return [...bytes].map(n=>alphabet[n%alphabet.length]).join('')}
function token(){return [...crypto.getRandomValues(new Uint8Array(24))].map(v=>v.toString(16).padStart(2,'0')).join('')}
function cors(origin,env){return origin===env.APP_ORIGIN?{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}:{}}
function validOrigin(request,env){return request.headers.get('origin')===env.APP_ORIGIN}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('origin');
  if(request.method==='GET'&&url.pathname==='/health')return response({status:'ready',service:'ÆselKlog Online Pilot'});
  if(!validOrigin(request,env))return response({error:'Hjemmesiden er ikke tilladt'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin,env)});
  if(url.pathname==='/api/create'&&request.method==='POST'){
   let input;try{input=await request.json()}catch{return response({error:'Ugyldigt JSON'},400,cors(origin,env))}
   const name=String(input.name||'').trim().slice(0,25);if(!name)return response({error:'Skriv et spillernavn'},400,cors(origin,env));
   const range=['1-20','21-40','41-60','61-80','81-100'].includes(input.range)?input.range:'1-20';
   // Room code is the Durable Object name; random collisions are exceedingly unlikely but checked inside room.
   const code=random(8),secret=token();const id=env.GAME_ROOM.idFromName(code);const stub=env.GAME_ROOM.get(id);
   const roomResponse=await stub.fetch('https://room/init',{method:'POST',body:JSON.stringify({name,range,secret,code})});
   return new Response(roomResponse.body,{status:roomResponse.status,headers:{...JSON_HEADERS,...cors(origin,env)}});
  }
  const match=url.pathname.match(/^\/api\/room\/([A-Z2-9]{8})\/(join|state|action|ws)$/);
  if(!match)return response({error:'Ukendt adresse'},404,cors(origin,env));
  const [_,code,action]=match;const stub=env.GAME_ROOM.get(env.GAME_ROOM.idFromName(code));
  if(action==='ws'){
   if(request.headers.get('upgrade')!=='websocket')return response({error:'Forventer websocket'},426,cors(origin,env));
   // Browser websockets cannot set Authorization header; short-lived bearer token is sent in query URL.
   const secret=url.searchParams.get('secret')||'';
   return stub.fetch(new Request('https://room/ws?secret='+encodeURIComponent(secret),{headers:request.headers}));
  }
  const forward=new Request('https://room/'+action,{method:request.method,headers:request.headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body});
  const r=await stub.fetch(forward);return new Response(r.body,{status:r.status,headers:{...JSON_HEADERS,...cors(origin,env)}});
 }
};
export class GameRoom {
 constructor(state,env){this.state=state;this.env=env;this.clients=new Map();this.room=null;}
 async load(){if(!this.room)this.room=await this.state.storage.get('room')||null;return this.room}
 async save(){await this.state.storage.put('room',this.room)}
 publicState(seat){const g=this.room;
  if(!g)return null;
  return {code:g.code,range:g.range,phase:g.phase,turn:g.turn,move:g.move,message:g.message,
   centers:g.centers.map(p=>({top:p.at(-1),count:p.length})),
   players:g.players.map((p,i)=>({name:p.name,closed:p.closed.length,open:p.open.at(-1)||null,openCount:p.open.length,donkeys:p.donkeys,seat:i})),
   you:seat, pending:seat===g.turn?g.pending:null,winner:g.winner};
 }
 broadcast(){for(const [ws,seat] of this.clients){try{ws.send(JSON.stringify({type:'state',state:this.publicState(seat)}))}catch{this.clients.delete(ws)}}}
 seat(secret){const g=this.room;return g?.players.findIndex(p=>p.secret===secret)??-1}
 target(n,actor){const g=this.room,first=Number(g.range.split('-')[0]);
  for(let i=0;i<g.centers.length;i++)if(g.centers[i].at(-1)+1===n)return {kind:'center',index:i};
  if(n===first&&g.centers.length<5)return {kind:'new-center',index:g.centers.length};
  for(let j=1;j<2;j++){const other=(actor+j)%2;if(g.players[other].open.length&&Math.abs(g.players[other].open.at(-1)-n)===1)return {kind:'player',index:other}}
  return null;
 }
 async fetch(request){const url=new URL(request.url),route=url.pathname;let g=await this.load();
  if(route==='/init'&&request.method==='POST'){
   if(g)return response({error:'Rummet findes allerede'},409);
   const b=await request.json();
   g=this.room={code:b.code,range:b.range,phase:'waiting',players:[{name:b.name,secret:b.secret,closed:[],open:[],donkeys:0}],centers:[],turn:0,pending:null,move:0,message:'Venter på spiller 2',winner:null,created:Date.now()};
   await this.save();return response({secret:b.secret,code:g.code});
  }
  if(!g)return response({error:'Spillet findes ikke'},404);
  if(route==='/join'&&request.method==='POST'){
   if(g.players.length!==1||g.phase!=='waiting')return response({error:'Rummet er allerede fuldt'},409);
   const b=await request.json(),name=String(b.name||'').trim().slice(0,25);
   if(!name||name.toLowerCase()===g.players[0].name.toLowerCase())return response({error:'Vælg et andet navn'},400);
   const secret=token();g.players.push({name,secret,closed:[],open:[],donkeys:0});
   const [lo,hi]=g.range.split('-').map(Number),deck=[];for(let n=lo;n<=hi;n++)for(let i=0;i<5;i++)deck.push(n);
   for(let i=deck.length-1;i>0;i--){const v=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[deck[i],deck[v]]=[deck[v],deck[i]]}
   deck.forEach((n,i)=>g.players[i%2].closed.push(n));g.phase='playing';g.message='Spillet er startet. Spiller 1 begynder.';g.move++;await this.save();this.broadcast();return response({secret});
  }
  if(route==='/state'&&request.method==='GET'){
   const seat=this.seat(request.headers.get('x-player-secret')||'');if(seat<0)return response({error:'Ugyldig adgang'},401);return response(this.publicState(seat));
  }
  if(route==='/ws'){
   const seat=this.seat(url.searchParams.get('secret')||'');if(seat<0)return response({error:'Ugyldig adgang'},401);
   const pair=new WebSocketPair();const client=pair[0],server=pair[1];server.accept();this.clients.set(server,seat);server.send(JSON.stringify({type:'state',state:this.publicState(seat)}));
   server.addEventListener('close',()=>this.clients.delete(server));server.addEventListener('error',()=>this.clients.delete(server));
   return new Response(null,{status:101,webSocket:client});
  }
  if(route==='/action'&&request.method==='POST'){
   let b;try{b=await request.json()}catch{return response({error:'Ugyldigt JSON'},400)}
   const seat=this.seat(b.secret||'');if(seat<0)return response({error:'Ugyldig adgang'},401);
   if(g.phase!=='playing'||g.turn!==seat)return response({error:'Det er ikke din tur'},409);
   const p=g.players[seat],n=g.pending;try{
    if(b.type==='flip'){
     if(n!==null)throw Error('Læg først det vendte kort.');
     if(p.open.length&&this.target(p.open.at(-1),seat))throw Error('Læg først det øverste åbne kort.');
     if(!p.closed.length){if(!p.open.length)throw Error('Du har ingen kort');p.closed=p.open.reverse();p.open=[]}
     const card=p.closed.pop(),target=this.target(card,seat);if(target){g.pending=card;g.message=`${p.name} vendte ${card} – vælg korrekt bunke.`}
     else{p.open.push(card);g.turn=1-seat;g.message=`${p.name} vendte et kort uden placering.`}
    }else if(b.type==='place'){
     const source=b.source==='open'?'open':'pending';const card=source==='pending'?g.pending:p.open.at(-1);
     if(card==null)throw Error('Intet kort at lægge');
     const expected=this.target(card,seat);if(!expected)throw Error('Kortet kan ikke placeres. Vend i stedet et nyt kort.');
     if(b.kind!==expected.kind||Number(b.index)!==expected.index)throw Error('Reglerne kræver en anden bunke.');
     if(source==='pending')g.pending=null;else p.open.pop();
     if(expected.kind==='new-center')g.centers.push([card]);else if(expected.kind==='center')g.centers[expected.index].push(card);else g.players[expected.index].open.push(card);
     g.message=`${p.name} lagde ${card}.`;
     if(!p.closed.length&&!p.open.length&&g.pending===null){g.phase='finished';g.winner=seat;g.message=`${p.name} vandt!`}
    }else if(b.type==='pass'){
     if(g.pending!==null||p.open.length&&this.target(p.open.at(-1),seat))throw Error('Du har et kort, der skal lægges først.');g.turn=1-seat;g.message=`${g.players[g.turn].name}s tur.`;
    }else throw Error('Ukendt handling');
   }catch(e){return response({error:e.message},400)}
   g.move++;await this.save();this.broadcast();return response(this.publicState(seat));
  }
  return response({error:'Ukendt handling'},404);
 }
}
