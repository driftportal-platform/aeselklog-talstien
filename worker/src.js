// ÆselKlog Online v0.9.39 – serverstyret kortspil (2 spillere).
// Regler matcher det lokale cardgame-engine.js. Ingen CPU. Chat og genopkobling bevaret.
const QUICK=['🫏 Hov hov!','👏 Godt spil!','😂 Haha!','🎉 Flot klaret!','🥕 Din tur!','❤️ Tak for spillet!'];
const MAX_VOICE_BASE64=240000,MAX_TEXT=160,CHAT_KEEP_MS=24*60*60*1000;
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
function response(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...headers}})}
function random(length){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(length));return [...bytes].map(n=>alphabet[n%alphabet.length]).join('')}
function token(){return [...crypto.getRandomValues(new Uint8Array(24))].map(v=>v.toString(16).padStart(2,'0')).join('')}
function cors(origin,env){return origin===env.APP_ORIGIN?{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}:{}}
function validOrigin(request,env){return request.headers.get('origin')===env.APP_ORIGIN}

function bounds(range){const [a,b]=range.split('-').map(Number);return [a,b]}
function centerTarget(state,n){
  const [first]=bounds(state.range);
  for(let i=0;i<state.centers.length;i++){
    const row=state.centers[i];
    if(row.length&&row[row.length-1]+1===n)return {kind:'center',index:i,caption:`Række ${i+1}`};
  }
  if(n===first&&state.centers.length<5)return {kind:'new-center',index:state.centers.length,caption:'Ny række'};
  return null;
}
function preferredTarget(state,n,fromPlayer=state.turn){
  const center=centerTarget(state,n);if(center)return center;
  for(let step=1;step<state.players.length;step++){
    const i=(fromPlayer+step)%state.players.length;
    const pile=state.players[i].open;
    if(pile.length&&Math.abs(pile[pile.length-1]-n)===1)return {kind:'player',index:i,caption:`${state.players[i].name}s åbne`};
  }
  return null;
}
function sameTarget(a,b){return !!a&&!!b&&a.kind===b.kind&&a.index===b.index}
function snapshot(state){const s=JSON.parse(JSON.stringify(state));s.lastMove=null;return s}
function countCards(p){return (p.closed?.length||0)+(p.open?.length||0)}
function remaining(state,index){const p=state.players[index];return countCards(p)+(state.turn===index&&state.pending!==null?1:0)}

export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('origin');
    if(request.method==='GET'&&url.pathname==='/health')return response({status:'ready',service:'ÆselKlog Online v0.9.39'});
    if(!validOrigin(request,env))return response({error:'Hjemmesiden er ikke tilladt'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin,env)});
    if(url.pathname==='/api/create'&&request.method==='POST'){
      let input;try{input=await request.json()}catch{return response({error:'Ugyldigt JSON'},400,cors(origin,env))}
      const name=String(input.name||'').trim().slice(0,25);if(!name)return response({error:'Skriv et spillernavn'},400,cors(origin,env));
      const range=['1-20','21-40','41-60','61-80','81-100'].includes(input.range)?input.range:'1-20';
      const code=random(8),secret=token();const id=env.GAME_ROOM.idFromName(code);const stub=env.GAME_ROOM.get(id);
      const roomResponse=await stub.fetch('https://room/init',{method:'POST',body:JSON.stringify({name,range,secret,code})});
      return new Response(roomResponse.body,{status:roomResponse.status,headers:{...JSON_HEADERS,...cors(origin,env)}});
    }
    const match=url.pathname.match(/^\/api\/room\/([A-Z0-9]{8})(\/.*)?$/);
    if(!match)return response({error:'Ukendt sti'},404);
    const code=match[1],id=env.GAME_ROOM.idFromName(code);const stub=env.GAME_ROOM.get(id);
    const roomUrl=new URL(request.url);roomUrl.pathname=match[2]||'/';// Bevar query-parametre til WebSocket og lydklip.
    const roomRequest=new Request(roomUrl,request);
    const roomResponse=await stub.fetch(roomRequest);
    return new Response(roomResponse.body,{status:roomResponse.status,headers:{...JSON_HEADERS,...cors(origin,env)}});
  }
};

export class GameRoom {
  constructor(state,env){this.state=state;this.env=env;this.clients=new Map()}
  async fetch(request){
    const url=new URL(request.url),route=url.pathname;
    let g=await this.state.storage.get('game')||null;
    if(route==='/init'&&request.method==='POST'){
      if(g)return response({error:'Rummet findes allerede'},409);
      const b=await request.json();
      g={code:b.code,range:b.range,phase:'waiting',turn:0,pending:null,centers:[],players:[{name:b.name,secret:b.secret,closed:[],open:[],donkeys:0}],chat:[],chatPrefs:[false,false],created:Date.now(),move:0,lastMove:null,message:'Venter på spiller 2…'};
      await this.state.storage.put('game',g);return response({code:b.code,secret:b.secret});
    }
    if(!g)return response({error:'Rummet findes ikke'},404);
    if(route==='/ws'){
      const pair=new WebSocketPair();const [client,server]=Object.values(pair);
      const seat=this.seat(url.searchParams.get('secret')||'',g);
      if(seat<0)return response({error:'Ugyldig adgang'},401);
      this.clients.set(server,seat);
      server.accept();
      server.send(JSON.stringify({type:'state',state:this.publicState(g,seat)}));
      server.addEventListener('close',()=>this.clients.delete(server));
      server.addEventListener('error',()=>this.clients.delete(server));
      return new Response(null,{status:101,webSocket:client});
    }
    if(route==='/state'&&request.method==='GET'){
      const seat=this.seat(url.searchParams.get('secret')||'',g);if(seat<0)return response({error:'Ugyldig adgang'},401);
      return response(this.publicState(g,seat));
    }
    if(route==='/action'&&request.method==='POST'){
      let b;try{b=await request.json()}catch{return response({error:'Ugyldigt JSON'},400)}
      const seat=this.seat(b.secret||'',g);if(seat<0)return response({error:'Ugyldig adgang'},401);
      try{
        if(b.type==='challenge'){this.doChallenge(g,seat)}
        else{
          if(g.phase!=='playing'||g.turn!==seat)throw Error('Det er ikke din tur');
          if(b.type==='flip')this.doFlip(g,seat);
          else if(b.type==='place')this.doPlace(g,seat,b);
          else if(b.type==='discard')this.doDiscard(g,seat);
          else throw Error('Ukendt handling');
        }
      }catch(e){return response({error:e.message},400)}
      g.move++;await this.state.storage.put('game',g);this.broadcast(g);return response(this.publicState(g,seat));
    }
    if(route==='/join'&&request.method==='POST'){
      if(g.players.length!==1||g.phase!=='waiting')return response({error:'Rummet er allerede fuldt'},409);
      const b=await request.json(),name=String(b.name||'').trim().slice(0,25);
      if(!name||name.toLowerCase()===g.players[0].name.toLowerCase())return response({error:'Vælg et andet navn'},400);
      const secret=token();g.players.push({name,secret,closed:[],open:[],donkeys:0});
      const [lo,hi]=bounds(g.range);const deck=[];
      for(let n=lo;n<=hi;n++)for(let i=0;i<5;i++)deck.push(n);
      for(let i=deck.length-1;i>0;i--){const v=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[deck[i],deck[v]]=[deck[v],deck[i]]}
      deck.forEach((n,i)=>g.players[i%2].closed.push(n));
      g.phase='playing';g.message='Spillet er startet. Spiller 1 begynder.';g.move++;
      await this.state.storage.put('game',g);this.broadcast(g);return response({secret});
    }
    // Chat: kun deltagere i rummet; hurtigbeskeder eller frivillig tekst/lyd.
    const notifyChat=()=>{for(const [ws] of this.clients){try{ws.send(JSON.stringify({type:'chat-update'}))}catch{}}};
    if(g.created&&Date.now()-g.created>CHAT_KEEP_MS&&g.chat?.length){g.chat=[];await this.state.storage.put('game',g)}
    if(route==='/chat'&&request.method==='GET'){
      const seat=this.seat(request.headers.get('x-player-secret')||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      return response({messages:(g.chat||[]).map(({audio,...rest})=>rest),prefs:g.chatPrefs||[false,false]});
    }
    if(route==='/clip'&&request.method==='GET'){
      const seat=this.seat(request.headers.get('x-player-secret')||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      const item=(g.chat||[]).find(m=>m.id===url.searchParams.get('id')&&m.kind==='voice');
      if(!item)return response({error:'Lyd er udløbet'},404);
      const binary=Uint8Array.from(atob(item.audio),c=>c.charCodeAt(0));
      return new Response(binary,{headers:{'content-type':item.mime,'cache-control':'no-store','x-content-type-options':'nosniff'}});
    }
    if(route==='/chat-settings'&&request.method==='POST'){
      const b=await request.json(),seat=this.seat(b.secret||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      if(!Array.isArray(g.chatPrefs))g.chatPrefs=[false,false];
      g.chatPrefs[seat]=b.enabled===true;
      await this.state.storage.put('game',g);this.broadcast(g);notifyChat();
      return response({prefs:g.chatPrefs});
    }
    if(route==='/chat'&&request.method==='POST'){
      if(Number(request.headers.get('content-length')||0)>260000)return response({error:'Beskeden er for stor'},413);
      let b;try{b=await request.json()}catch{return response({error:'Ugyldig besked'},400)}
      const seat=this.seat(b.secret||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      if(g.players.length<2)return response({error:'Vent på spiller 2'},409);
      const now=Date.now(),full=g.chat||[];
      if(full.some(m=>m.seat===seat&&now-m.at<1800))return response({error:'Vent lidt mellem beskeder'},429);
      let item={id:token().slice(0,16),seat,at:now};
      if(b.kind==='quick'){
        if(!QUICK.includes(b.text))return response({error:'Ukendt hurtigbesked'},400);
        item={...item,kind:'quick',text:b.text};
      }else if(b.kind==='text'){
        if(!(g.chatPrefs||[]).every(Boolean))return response({error:'Begge spillere skal slå fri chat til'},403);
        const value=String(b.text||'').trim();
        if(!value||value.length>MAX_TEXT||/[<>\x00-\x08]/.test(value))return response({error:'Teksten skal være 1–160 tegn'},400);
        item={...item,kind:'text',text:value};
      }else if(b.kind==='voice'){
        if(!(g.chatPrefs||[]).every(Boolean))return response({error:'Begge spillere skal slå lydchat til'},403);
        if(!['audio/webm','audio/mp4','audio/ogg'].includes(b.mime)||typeof b.audio!=='string'||b.audio.length>MAX_VOICE_BASE64||!/^[A-Za-z0-9+/]*={0,2}$/.test(b.audio)||Number(b.duration)>10.2||Number(b.duration)<0.1)return response({error:'Lydklip skal være højst 10 sekunder'},400);
        item={...item,kind:'voice',mime:b.mime,audio:b.audio,duration:Math.round(Number(b.duration)*10)/10};
      }else return response({error:'Ukendt beskedtype'},400);
      g.chat=[...full.filter(m=>now-m.at<CHAT_KEEP_MS),item].slice(-30);
      await this.state.storage.put('game',g);notifyChat();return response({ok:true,id:item.id});
    }
    return response({error:'Ukendt sti'},404);
  }
  seat(secret,g){return g.players.findIndex(p=>p.secret===secret)}
  doFlip(g,seat){
    if(g.pending!==null)throw Error('Læg først det vendte kort.');
    const p=g.players[seat];
    if(!p.closed.length){
      if(!p.open.length)throw Error('Ingen talkort tilbage.');
      p.closed=p.open.slice().reverse();p.open=[];
    }
    const n=p.closed.pop();
    const target=preferredTarget(g,n,seat);
    if(!target){
      p.open.push(n);
      this.finishOrNext(g);
      g.message=`${p.name} vendte ${n}. Det passer ikke endnu.`;
    }else{
      g.pending=n;
      g.message=`${p.name} vendte ${n}. Det kan lægges på ${target.caption}.`;
    }
    g.lastMove=null;
  }
  doPlace(g,seat,b){
    const source=b.source==='open'?'open':'pending';
    const p=g.players[seat];
    const n=source==='pending'?g.pending:p.open.at(-1);
    if(n==null)throw Error('Intet kort at lægge');
    const dest={kind:b.kind,index:Number(b.index)};
    const expected=preferredTarget(g,n,seat);
    const valid=dest.kind==='self-open'?!expected:sameTarget(dest,expected);
    const before=snapshot(g);
    if(source==='pending')g.pending=null;else p.open.pop();
    if(dest.kind==='self-open')p.open.push(n);
    else if(dest.kind==='new-center')g.centers.push([n]);
    else if(dest.kind==='center')g.centers[dest.index].push(n);
    else if(dest.kind==='player')g.players[dest.index].open.push(n);
    else throw Error('Ukendt mål');
    g.lastMove={actor:seat,valid,number:n,type:dest.kind==='self-open'?'discard':'place',before};
    if(dest.kind==='self-open'){
      this.finishOrNext(g);
      g.message=`${p.name} lagde ${n} i sin åbne bunke.`;
    }else if(remaining(g,seat)===0){
      this.finishWinner(g,seat);
    }else g.message=`${p.name} lagde ${n}.`;
  }
  doDiscard(g,seat){return this.doPlace(g,seat,{source:'pending',kind:'self-open'})}
  doChallenge(g,seat){
    if(!g.lastMove)throw Error('Der er ikke et træk at udfordre.');
    if(g.lastMove.actor===seat)throw Error('Du kan ikke udfordre dit eget træk.');
    if(g.lastMove.valid){g.message='Trækket var korrekt. Ingen æselstraf.';return}
    const actor=g.lastMove.actor,number=g.lastMove.number;
    const restored=JSON.parse(JSON.stringify(g.lastMove.before));
    Object.keys(g).forEach(k=>delete g[k]);Object.assign(g,restored);
    g.players[actor].donkeys=(g.players[actor].donkeys||0)+1;
    g.lastMove=null;
    g.message=`🫏 ${g.players[actor].name} blev opdaget! Trækket med ${number} er fortrudt. Æselkort i straf.`;
  }
  finishWinner(g,finisher){
    const opponent=1-finisher;
    const winner=g.players[finisher].donkeys>g.players[opponent].donkeys?opponent:finisher;
    g.phase='finished';g.winner=winner;g.placements=[winner,1-winner];
    g.message=`🏆 ${g.players[winner].name} vandt! 🥇 ${g.players[winner].name} · 🥈 ${g.players[1-winner].name}`;
  }
  finishOrNext(g){
    if(remaining(g,g.turn)===0&&g.pending===null){
      this.finishWinner(g,g.turn);return;
    }
    g.turn=1-g.turn;
    g.message=`${g.players[g.turn].name}s tur.`;
  }
  publicState(g,seat){
    return {
      phase:g.phase,turn:g.turn,pending:g.turn===seat?g.pending:null,centers:g.centers.map(c=>({top:c.at(-1),length:c.length})),
      players:g.players.map((p,i)=>({name:p.name,closed:p.closed.length,open:i===seat||true?p.open.at(-1):null,openCount:p.open.length,donkeys:p.donkeys})),
      you:seat,message:g.message,move:g.move,canChallenge:!!g.lastMove&&g.lastMove.actor!==seat,winner:g.winner,placements:g.placements||null
    };
  }
  broadcast(g){
    for(const [ws,seat] of this.clients){
      try{ws.send(JSON.stringify({type:'state',state:this.publicState(g,seat)}))}catch{}
    }
  }
}
