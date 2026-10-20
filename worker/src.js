import '../actions.js';
import '../engine.js';
import '../adaptive.js';
import '../boardgame-engine.js';
const BoardGame=globalThis.AeselBoardGame;
const boardRandom=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
// ÆselKlog Online v0.9.67 – serverstyret kortspil og Talstien (2–6 spillere).
// Regler matcher det lokale cardgame-engine.js. Ingen CPU. Chat og genopkobling bevaret.
const QUICK=['🫏 Hov hov!','👏 Godt spil!','😂 Haha!','🎉 Flot klaret!','🥕 Din tur!','❤️ Tak for spillet!'];

const MAX_VOICE_BASE64=1400000,MAX_TEXT=10000,CHAT_KEEP_MS=24*60*60*1000;
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
function response(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...headers}})}
function random(length){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(length));return [...bytes].map(n=>alphabet[n%alphabet.length]).join('')}
function token(){return [...crypto.getRandomValues(new Uint8Array(24))].map(v=>v.toString(16).padStart(2,'0')).join('')}
function cors(origin,env){return origin===env.APP_ORIGIN?{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type, x-player-secret'}:{}}
function validOrigin(request,env){return request.headers.get('origin')===env.APP_ORIGIN}

function bounds(range){const [a,b]=range.split('-').map(Number);return [a,b]}
function centerTarget(state,n){
  const [first]=bounds(state.range);
  for(let i=0;i<state.centers.length;i++){
    const row=state.centers[i];
    if(row.length&&row[row.length-1]+1===n)return {kind:'center',index:i,caption:`Række ${i+1}`};
  }
  if(n===first&&state.centers.length<(state.deckSets??5))return {kind:'new-center',index:state.centers.length,caption:'Ny række'};
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
function allCards(g){return [...g.players.flatMap(p=>[...p.closed,...p.open]),...g.centers.flat(),...(g.pending!=null?[g.pending]:[])]}
function fingerprint(g){return allCards(g).sort((a,b)=>a-b).join(',')}
function activeSeats(g){return g.players.map((p,i)=>p.leftAt?null:i).filter(i=>i!==null)}
function remaining(state,index){const p=state.players[index];return countCards(p)+(state.turn===index&&state.pending!==null?1:0)}

export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('origin');
    if(request.method==='GET'&&url.pathname==='/health')return response({status:'ready',service:'ÆselKlog Online v0.9.67'});
    if(!validOrigin(request,env))return response({error:'Hjemmesiden er ikke tilladt'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin,env)});
    if(url.pathname==='/api/create'&&request.method==='POST'){
      let input;try{input=await request.json()}catch{return response({error:'Ugyldigt JSON'},400,cors(origin,env))}
      const gameType=input.gameType??'cards';if(!['cards','board'].includes(gameType))return response({error:'Vælg kortspil eller Talstien'},400,cors(origin,env));
      let boardConfig,boardProfile;try{if(gameType==='board'){boardConfig=BoardGame.config(input.boardConfig);boardProfile=BoardGame.profile(input.boardProfile)}}catch(e){return response({error:e.message},400,cors(origin,env))}
      const name=String(input.name||'').trim().slice(0,25);if(!name)return response({error:'Skriv et spillernavn'},400,cors(origin,env));
      const range=['1-20','21-40','41-60','61-80','81-100'].includes(input.range)?input.range:'1-20';
      const deckSets=input.deckSets===undefined?5:input.deckSets;
      if(!Number.isInteger(deckSets)||deckSets<1||deckSets>5)return response({error:'Vælg 1–5 kortsæt'},400,cors(origin,env));
      const playerCount=input.playerCount===undefined?2:input.playerCount;
      if(!Number.isInteger(playerCount)||playerCount<2||playerCount>6)return response({error:'Vælg 2–6 spillere'},400,cors(origin,env));
      const variant=input.variant==='passing'?'passing':'collect';
      const extraPenalty=input.extraPenalty===true;
      const donkeyCount=variant==='passing'?1:([1,4,6,8].includes(Number(input.donkeyCount))?Number(input.donkeyCount):8);
      const code=random(8),secret=token();const id=env.GAME_ROOM.idFromName(code);const stub=env.GAME_ROOM.get(id);
      const roomResponse=await stub.fetch('https://room/init',{method:'POST',body:JSON.stringify({name,range,secret,code,variant,extraPenalty,donkeyCount,deckSets,playerCount,gameType,boardConfig,boardProfile})});
      if(roomResponse.status===101)return roomResponse;
    const headers=new Headers(roomResponse.headers);
    for(const [key,value] of Object.entries(cors(origin,env)))headers.set(key,value);
    return new Response(roomResponse.body,{status:roomResponse.status,headers});
    }
    const match=url.pathname.match(/^\/api\/room\/([A-Z0-9]{8})(\/.*)?$/);
    if(!match)return response({error:'Ukendt sti'},404,cors(origin,env));
    const code=match[1],id=env.GAME_ROOM.idFromName(code);const stub=env.GAME_ROOM.get(id);
    const roomUrl=new URL(request.url);roomUrl.pathname=match[2]||'/';// Bevar query-parametre til WebSocket og lydklip.
    const roomRequest=new Request(roomUrl,request);
    const roomResponse=await stub.fetch(roomRequest);
    if(roomResponse.status===101)return roomResponse;
    const headers=new Headers(roomResponse.headers);
    for(const [key,value] of Object.entries(cors(origin,env)))headers.set(key,value);
    return new Response(roomResponse.body,{status:roomResponse.status,headers});
  }
};

export class GameRoom {
  constructor(state,env){this.state=state;this.env=env;this.clients=new Map();this.queue=Promise.resolve()}
  fetch(request){
    // Serialize room reads/writes, including simultaneous joins and challenges.
    const result=this.queue.then(()=>this.handleFetch(request));
    this.queue=result.catch(()=>{});return result;
  }
  async handleFetch(request){
    const url=new URL(request.url),route=url.pathname;
    let g=await this.state.storage.get('game')||null;
    if(route==='/init'&&request.method==='POST'){
      if(g)return response({error:'Rummet findes allerede'},409);
      const b=await request.json();
      const deckSets=b.deckSets===undefined?5:b.deckSets;
      if(!Number.isInteger(deckSets)||deckSets<1||deckSets>5)return response({error:'Vælg 1–5 kortsæt'},400);
      const playerCount=b.playerCount===undefined?2:b.playerCount;
      if(!Number.isInteger(playerCount)||playerCount<2||playerCount>6)return response({error:'Vælg 2–6 spillere'},400);
      g={code:b.code,range:b.range,deckSets,playerCount,variant:b.variant==='passing'?'passing':'collect',extraPenalty:b.extraPenalty===true,donkeyCount:b.variant==='passing'?1:Number(b.donkeyCount)||8,phase:'waiting',turn:0,pending:null,centers:[],players:[{name:b.name,secret:b.secret,closed:[],open:[],donkeys:0}],chat:[],chatPrefs:Array(playerCount).fill(false),created:Date.now(),move:0,lastMove:null,message:`Venter på spillere: 1 af ${playerCount} er tilmeldt.`};
      g.gameType=b.gameType==='board'?'board':'cards';if(g.gameType==='board'){try{g.boardConfig=BoardGame.config(b.boardConfig);g.players[0].boardProfile=BoardGame.profile(b.boardProfile)}catch(e){return response({error:e.message},400)}}
      await this.state.storage.put('game',g);return response({code:b.code,secret:b.secret});
    }
    if(!g)return response({error:'Rummet findes ikke'},404);
    await this.settleReview(g);
    await this.settleBoard(g);
    if(route==='/leave'&&request.method==='POST'){
      let b;try{b=await request.json()}catch{return response({error:'Ugyldigt JSON'},400)}
      const seat=this.seat(b.secret||'',g,true);if(seat<0)return response({error:'Ugyldig adgang'},401);
      if(g.players[seat].leftAt)return response(this.publicState(g,seat));
      if(g.phase==='closed')return response(this.publicState(g,seat));
      const before=fingerprint(g);this.depart(g,seat);if(fingerprint(g)!==before)return response({error:'Kortregnskabet kunne ikke bevares. Prøv igen.'},409);
      if(g.phase==='closed'){for(const m of g.chat||[])await this.state.storage.delete?.('clip:'+m.id);g.chat=[];g.chatPrefs=Array(g.players.length).fill(false)}
      await this.state.storage.put('game',g);await this.scheduleBoard(g);this.broadcast(g);
      for(const [ws,other] of this.clients){if(other===seat||g.phase==='closed'){try{ws.close(1000,'Spilleren har forladt spillet')}catch{}this.clients.delete(ws)}}
      return response(this.publicState(g,seat));
    }
    if(g.phase==='closed'&&route!=='/state'&&route!=='/action')return response({error:'Spillet er afsluttet. Opret et nyt rum.'},410);
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
      const seat=this.seat(url.searchParams.get('secret')||'',g,true);if(seat<0)return response({error:'Ugyldig adgang'},401);
      return response(this.publicState(g,seat));
    }
    if(route==='/attention'&&request.method==='POST'){
      let b;try{b=await request.json()}catch{return response({error:'Ugyldigt JSON'},400)}
      const seat=this.seat(b.secret||'',g);if(seat<0)return response({error:'Ugyldig adgang'},401);
      if(!Number.isInteger(b.target)||b.target<0||b.target>=g.players.length||b.target===seat||g.players[b.target]?.leftAt)return response({error:'Vælg en anden spiller'},400);
      const now=Date.now();if(now-(g.nudgeTimes?.[seat]||0)<3000)return response({error:'Vent et øjeblik før næste prik'},429);
      g.nudgeTimes={...g.nudgeTimes,[seat]:now};g.attention={...g.attention,[b.target]:{id:token(),at:now,from:seat}};
      await this.state.storage.put('game',g);this.broadcast(g);return response({ok:true});
    }
    if(route==='/action'&&request.method==='POST'){
      let b;try{b=await request.json()}catch{return response({error:'Ugyldigt JSON'},400)}
      const seat=this.seat(b.secret||'',g);if(seat<0)return response({error:'Ugyldig adgang'},401);
      if(g.phase==='closed'&&b.type!=='end-game')return response({error:'Spillet er afsluttet. Opret et nyt rum.'},409);
      if(g.gameType==='board'&&!['end-game','start-early','challenge'].includes(b.type)){
        if(g.phase!=='playing'||!g.board)return response({error:'Brætspillet er ikke startet'},400);
        if(b.expectedMove!==undefined&&b.expectedMove!==g.move)return response({error:'Spillet er opdateret. Prøv igen.'},409);
        const effects=g.board.effectSeq;
        try{BoardGame.action(g.board,seat,b,boardRandom,Date.now())}catch(e){return response({error:e.message},400)}
        g.donkeySoundId=(g.donkeySoundId||0)+g.board.effectSeq-effects;this.syncBoard(g);g.move++;
        await this.state.storage.put('game',g);await this.scheduleBoard(g);this.broadcast(g);return response(this.publicState(g,seat));
      }
      const cardsBefore=fingerprint(g);
      try{

        if(b.type==='end-game'){
          if(seat!==(g.hostSeat??0))throw Error('Kun rumopretteren kan afslutte spillet for alle.');
          if(g.phase==='closed')return response(this.publicState(g,seat));
          for(const m of g.chat||[])await this.state.storage.delete?.('clip:'+m.id);g.phase='closed';g.closedAt=Date.now();g.review=null;g.lastMove=null;g.chat=[];g.chatPrefs=Array(g.players.length).fill(false);g.message=`${g.players[seat].name} afsluttede spillet.`;
        }else if(b.type==='start-early'){
          if(seat!==(g.hostSeat??0))throw Error('Kun rumopretteren kan starte spillet.');
          if(g.phase!=='waiting')throw Error('Spillet er allerede startet.');
          if(activeSeats(g).length<2)throw Error('Der skal være mindst to spillere.');
          if(this.earlyStartWait(g)>0)throw Error('Vent 60 sekunder fra rummet blev oprettet.');
          this.startGame(g);
        }else if(b.type==='challenge'){
          g.donkeySoundId=(g.donkeySoundId||0)+1;
          if(b.moveId!==undefined&&b.moveId!==g.lastPlayed?.id)g.message='Der er lagt et nyt kort. Se det seneste udspil før du udfordrer.';
          else if(g.lastMove&&g.lastMove.actor!==seat)this.doChallenge(g,seat);
          else g.message='🫏 Hov hov!';
        }
        else{
          if(g.phase!=='playing'||g.turn!==seat)throw Error('Det er ikke din tur');
          if(b.type==='flip-open')this.doFlipOpen(g,seat);
          else if(b.type==='end-turn')this.doEndTurn(g,seat);
          else if(b.type==='keep-single')this.doKeepSingle(g,seat);
          else if(b.type==='recycle')this.doRecycle(g,seat);
          else if(b.type==='flip'){if(b.manualRecycle===true&&!g.players[seat].closed.length)throw Error('Vend først din åbne bunke.');this.doFlip(g,seat);}
          else if(b.type==='place')this.doPlace(g,seat,b);
          else if(b.type==='discard')this.doDiscard(g,seat);
          else throw Error('Ukendt handling');
        }
      }catch(e){return response({error:e.message},400)}
      if(b.type!=='start-early'&&fingerprint(g)!==cardsBefore)return response({error:'Trækket kunne ikke gemmes, fordi kortantallet ændrede sig. Prøv at opdatere spillet.'},409);
      g.move++;await this.state.storage.put('game',g);if(g.review)await this.state.storage.setAlarm?.(g.review.until);else await this.state.storage.deleteAlarm?.();this.broadcast(g);
      if(g.phase==='closed'){for(const [ws] of this.clients){try{ws.close(1000,'Spillet er afsluttet')}catch{}}this.clients.clear()}
      return response(this.publicState(g,seat));
    }
    if(route==='/join'&&request.method==='POST'){
      if(activeSeats(g).length>=(g.playerCount??2)||g.players.length>=64||g.phase!=='waiting')return response({error:'Rummet er allerede fuldt'},409);
      const b=await request.json(),name=String(b.name||'').trim().slice(0,25);
      if(!name||g.players.some(p=>!p.leftAt&&p.name.toLocaleLowerCase('da-DK')===name.toLocaleLowerCase('da-DK')))return response({error:'Vælg et andet navn'},400);
      let boardProfile;if(g.gameType==='board'){try{boardProfile=BoardGame.profile(b.boardProfile)}catch(e){return response({error:e.message},400)}}
      const secret=token();g.players.push({name,secret,closed:[],open:[],donkeys:0,...(boardProfile?{boardProfile}:{})});
      if(activeSeats(g).length===(g.playerCount??2))this.startGame(g);
      else g.message=`Venter på spillere: ${activeSeats(g).length} af ${g.playerCount} er tilmeldt.`;
      g.move++;
      await this.state.storage.put('game',g);this.broadcast(g);return response({secret});
    }
    // Chat: kun deltagere i rummet; hurtigbeskeder eller frivillig tekst/lyd.
    const notifyChat=()=>{for(const [ws] of this.clients){try{ws.send(JSON.stringify({type:'chat-update'}))}catch{}}};
    const expired=(g.chat||[]).filter(m=>Date.now()-m.at>=CHAT_KEEP_MS);if(expired.length){for(const m of expired)await this.state.storage.delete?.('clip:'+m.id);g.chat=g.chat.filter(m=>!expired.includes(m));await this.state.storage.put('game',g)}
    if(route==='/chat'&&request.method==='GET'){
      const seat=this.seat(request.headers.get('x-player-secret')||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      return response({messages:(g.chat||[]).map(({audio,...rest})=>rest),prefs:this.chatPrefs(g),players:g.players.map(p=>p.name)});
    }
    if(route==='/clip'&&request.method==='GET'){
      const seat=this.seat(request.headers.get('x-player-secret')||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      const item=(g.chat||[]).find(m=>m.id===url.searchParams.get('id')&&m.kind==='voice');
      if(!item)return response({error:'Lyd er udløbet'},404);
      const clip=item.audio?item:await this.state.storage.get('clip:'+item.id);if(!clip)return response({error:'Lyd er udløbet'},404);
      const binary=Uint8Array.from(atob(clip.audio),c=>c.charCodeAt(0));
      return new Response(binary,{headers:{'content-type':item.mime,'cache-control':'no-store','x-content-type-options':'nosniff'}});
    }
    if(route==='/chat-settings'&&request.method==='POST'){
      const b=await request.json(),seat=this.seat(b.secret||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      g.chatPrefs=this.chatPrefs(g);
      g.chatPrefs[seat]=b.enabled===true;
      await this.state.storage.put('game',g);this.broadcast(g);notifyChat();
      return response({prefs:g.chatPrefs});
    }
    if(route==='/chat'&&request.method==='POST'){
      if(Number(request.headers.get('content-length')||0)>1500000)return response({error:'Beskeden er for stor'},413);
      let b;try{b=await request.json()}catch{return response({error:'Ugyldig besked'},400)}
      const seat=this.seat(b.secret||'',g);
      if(seat<0)return response({error:'Ingen adgang'},401);
      const now=Date.now(),full=g.chat||[];
      let item={id:token().slice(0,16),seat,at:now};
      if(b.kind==='quick'){
        if(!QUICK.includes(b.text))return response({error:'Ukendt hurtigbesked'},400);
        item={...item,kind:'quick',text:b.text};
      }else if(b.kind==='text'){
        const value=String(b.text||'').trim();
        if(!value||value.length>MAX_TEXT||/[\x00-\x08]/.test(value))return response({error:'Teksten skal være 1–10.000 tegn'},400);
        item={...item,kind:'text',text:value};
      }else if(b.kind==='voice'){
        if(!['audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/wav','audio/x-wav','audio/aac','audio/flac','audio/x-m4a'].includes(b.mime)||typeof b.audio!=='string'||!b.audio.length||b.audio.length%4!==0||b.audio.length>MAX_VOICE_BASE64||!/^[A-Za-z0-9+/]*={0,2}$/.test(b.audio)||!Number.isFinite(Number(b.duration))||Number(b.duration)<0)return response({error:'Lydfilen skal være en understøttet lydtype og højst 1 MB'},400);
        let binary;try{binary=atob(b.audio)}catch{return response({error:'Ugyldig lydfil'},400)}if(binary.length>1048576)return response({error:'Lydfilen må højst være 1 MB'},413);
        await this.state.storage.put('clip:'+item.id,{audio:b.audio,mime:b.mime});
        item={...item,kind:'voice',mime:b.mime,duration:Math.round(Number(b.duration)*10)/10};
      }else return response({error:'Ukendt beskedtype'},400);
      g.chat=[...full.filter(m=>now-m.at<CHAT_KEEP_MS),item].slice(-30);
      for(const m of full)if(!g.chat.some(kept=>kept.id===m.id))await this.state.storage.delete?.('clip:'+m.id);
      await this.state.storage.put('game',g);notifyChat();return response({ok:true,id:item.id});
    }
    return response({error:'Ukendt sti'},404);
  }
  depart(g,seat){
    const p=g.players[seat],at=Date.now();p.leftAt=at;p.donkeys=0;const active=activeSeats(g);
    if(g.phase!=='waiting')g.playerCount=active.length;g.departure={id:token(),seat,name:p.name,at};g.lastMove=null;g.lastPlayed=null;g.review=null;
    if((g.hostSeat??0)===seat&&active.length)g.hostSeat=active[0];
    if(g.gameType==='board'&&g.board){
      g.board.players[seat].leftAt=at;
      if(g.phase==='playing'&&g.board.turn===seat&&active.length){g.board.phase='result';BoardGame.action(g.board,seat,{type:'board-next'},boardRandom,at);this.syncBoard(g)}
    }else if(active.length&&g.phase==='playing'){
      const cards=[...p.closed,...p.open,...(g.turn===seat&&g.pending!=null?[g.pending]:[])];p.closed=[];p.open=[];if(g.turn===seat)g.pending=null;
      const recipients=Array.from({length:g.players.length-1},(_,i)=>(seat+1+i)%g.players.length).filter(i=>!g.players[i].leftAt),batches=recipients.map(()=>[]);
      cards.forEach((n,i)=>batches[i%recipients.length].push(n));recipients.forEach((i,k)=>{g.players[i].closed=[...batches[k],...g.players[i].closed]});
      g.finishOrder=(g.finishOrder||[]).filter(i=>!g.players[i].leftAt&&remaining(g,i)===0);
      if(g.phase==='playing'){this.finishWinner(g,g.turn);if(g.phase==='playing'&&(g.turn===seat||remaining(g,g.turn)===0))this.advanceTurn(g)}
    }
    if(!active.length||g.phase!=='waiting'&&active.length<2){g.phase='closed';g.closedAt=at;g.message=`${p.name} har forladt spillet. Der er ikke nok spillere tilbage. Opret et nyt rum.`}
    else{if(g.phase==='playing'&&g.gameType==='board')g.board.message=`${g.players[g.turn].name}s tur.`;g.message=`${p.name} har forladt spillet. `+(g.phase==='waiting'?`Venter på spillere: ${active.length} af ${g.playerCount}.`:g.phase==='finished'?'Runden er færdig.':`${g.players[g.turn].name}s tur.`)}
    g.move++;
  }
  earlyStartWait(g){return Math.max(0,60000-(Date.now()-(g.created??Date.now())))}
  startGame(g){
    if(g.phase!=='waiting'||activeSeats(g).length<2)throw Error('Spillet kan ikke startes.');
    // Close vacant seats before dealing, so late invitations cannot change this game.
    const active=activeSeats(g);g.playerCount=active.length;g.turn=active[0];
    g.chatPrefs=this.chatPrefs(g);
    if(g.gameType==='board'){g.board=BoardGame.start(g.boardConfig,g.players,boardRandom);this.syncBoard(g);return}
    const [lo,hi]=bounds(g.range),deck=[];
    for(let n=lo;n<=hi;n++)for(let i=0;i<(g.deckSets??5);i++)deck.push(n);
    for(let i=deck.length-1;i>0;i--){const v=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[deck[i],deck[v]]=[deck[v],deck[i]]}
    deck.forEach((n,i)=>g.players[active[i%active.length]].closed.push(n));
    g.phase='playing';g.message=`Spillet er startet med ${active.length} spillere. ${g.players[g.turn].name} begynder.`;
  }
  async scheduleBoard(g){
    const at=g.phase==='playing'?(g.board?.question?.deadline||g.board?.advanceAt):0;
    if(at)await this.state.storage.setAlarm?.(at);else await this.state.storage.deleteAlarm?.();
  }
  async settleBoard(g){
    if(!g.board||g.phase!=='playing')return false;
    const s=g.board,effects=s.effectSeq;let changed=BoardGame.tick(s,Date.now(),boardRandom);
    if(['result','skipped'].includes(s.phase)&&!s.advanceAt){this.syncBoard(g);changed=true}
    if(['result','skipped'].includes(s.phase)&&s.advanceAt&&Date.now()>=s.advanceAt){
      const result=s.lines.length?s.lines.join(' '):s.message;
      s.advanceAt=null;BoardGame.action(s,s.turn,{type:'board-next'},boardRandom,Date.now());s.previousResult=result;changed=true;
    }
    if(changed){g.donkeySoundId=(g.donkeySoundId||0)+s.effectSeq-effects;this.syncBoard(g);g.move++;await this.state.storage.put('game',g);this.broadcast(g)}
    await this.scheduleBoard(g);return changed;
  }
  alarm(){const result=this.queue.then(async()=>{const g=await this.state.storage.get('game');if(!g)return;if(g.board){await this.settleBoard(g);return}if(!await this.settleReview(g)&&g.review)await this.state.storage.setAlarm?.(g.review.until)});this.queue=result.catch(()=>{});return result}
  async settleReview(g){
    if(!g.review)return false;
    // Migrate an older in-progress pause without silently moving its card.
    g.review=null;g.move++;await this.state.storage.put('game',g);await this.state.storage.deleteAlarm?.();this.broadcast(g);return true;
  }
  chatPrefs(g){return Array.from({length:g.playerCount??2},(_,i)=>g.chatPrefs?.[i]===true)}
  seat(secret,g,includeLeft=false){return g.players.findIndex(p=>p.secret===secret&&(includeLeft||!p.leftAt))}
  doFlipOpen(g,seat){
    if(g.pending!==null)throw Error('Læg først det allerede vendte kort.');
    const p=g.players[seat],skipped=p.open.length&&preferredTarget(g,p.open.at(-1),seat);
    const before=skipped?snapshot(g):null,number=p.open.at(-1);
    if(!p.closed.length){
      if(!p.open.length)throw Error('Ingen talkort tilbage.');
      p.closed=p.open.slice().reverse();p.open=[];
    }
    const n=p.closed.pop();p.open.push(n);
    g.lastMove=skipped?{actor:seat,valid:false,number,type:'flip',before}:null;
    g.message=`${p.name} vendte ${n} til sin åbne bunke. Flyt kortet, eller afslut turen.`;
  }
  doEndTurn(g,seat){
    // Allow an older pending card to finish normally after reconnecting/updating.
    if(g.pending!==null)return this.doDiscard(g,seat);
    const n=g.players[seat].open.at(-1),before=snapshot(g);
    const valid=n==null||!preferredTarget(g,n,seat);
    this.finishOrNext(g);
    g.lastMove={actor:seat,valid,number:n??0,type:'end-turn',before};
    if(g.phase!=='finished')g.message=`${g.players[seat].name} afsluttede turen. ${g.players[g.turn].name}s tur.`;
  }
  doKeepSingle(g,seat){
    const p=g.players[seat];if(remaining(g,seat)!==1||!p.open.length||g.pending!==null)throw Error('Du skal have ét åbent kort tilbage.');
    this.finishOrNext(g);if(g.phase!=='finished')g.message=`${p.name} beholder sit sidste åbne kort. ${g.players[g.turn].name}s tur.`;
  }
  doRecycle(g,seat){
    if(g.pending!==null)throw Error('Læg først det vendte kort.');
    const p=g.players[seat];if(!p.closed.length&&p.open.length===1)return this.doKeepSingle(g,seat);if(p.closed.length)throw Error('Din lukkede bunke er ikke tom.');
    if(!p.open.length)throw Error('Ingen åben bunke at vende.');
    p.closed=p.open.slice().reverse();p.open=[];

    g.message=`${p.name} vendte sin åbne bunke. Tryk på den lukkede bunke for at vende et kort.`;
  }
  doFlip(g,seat){
    if(g.pending!==null)throw Error('Læg først det vendte kort.');
    const p=g.players[seat];
    if(!p.closed.length&&p.open.length===1)return this.doKeepSingle(g,seat);
    if(!p.closed.length){
      if(!p.open.length)throw Error('Ingen talkort tilbage.');
      p.closed=p.open.slice().reverse();p.open=[];
    }
    g.pending=p.closed.pop();

    g.message=`${p.name} vendte ${g.pending}. Vælg en bunke.`;
  }
  doPlace(g,seat,b){
    if(!['open','pending'].includes(b.source))throw Error('Vælg et kort.');
    const source=b.source;
    if(source==='open'&&g.pending!==null)throw Error('Læg først det vendte kort.');
    const p=g.players[seat];
    const n=source==='pending'?g.pending:p.open.at(-1);
    if(n==null)throw Error('Intet kort at lægge');
    const dest={kind:b.kind,index:Number(b.index)};
    if(dest.kind==='new-center'){
      if(g.centers.length>=(g.deckSets??5))throw Error(`Der må højst være ${g.deckSets??5} midterrækker.`);
      dest.index=g.centers.length;
    }else if(dest.kind==='center'){
      if(!Number.isInteger(dest.index)||!g.centers[dest.index])throw Error('Ukendt række.');
    }else if(dest.kind==='player'){
      if(g.players[dest.index]?.leftAt)throw Error('Spilleren har forladt spillet.');
      if(!Number.isInteger(dest.index)||!g.players[dest.index]||dest.index===seat)throw Error('Vælg modstanderens bunke.');
    }else if(dest.kind==='self-open'){
      if(source!=='pending')throw Error('Vælg et vendt kort.');
      dest.index=seat;
    }else throw Error('Ukendt mål.');
    const expected=preferredTarget(g,n,seat);
    const [first,last]=bounds(g.range);const row=dest.kind==='center'?g.centers[dest.index]:null;
    const valid=dest.kind==='new-center'?n===first:row?row.length>0&&row.every((v,i)=>v===first+i)&&row.at(-1)<last&&n===row.at(-1)+1:dest.kind==='self-open'?!expected:sameTarget(dest,expected);
    const before=snapshot(g);
    if(source==='pending')g.pending=null;else p.open.pop();
    if(dest.kind==='self-open')p.open.push(n);
    else if(dest.kind==='new-center')g.centers.push([n]);
    else if(dest.kind==='center')g.centers[dest.index].push(n);
    else if(dest.kind==='player')g.players[dest.index].open.push(n);
    else throw Error('Ukendt mål');
    if(Array.isArray(g.finishOrder))g.finishOrder=g.finishOrder.filter(i=>remaining(g,i)===0);
    g.lastMove={actor:seat,valid,number:n,type:dest.kind==='self-open'?'discard':'place',before};
    g.lastPlayed={id:(g.move||0)+1,actor:seat,number:n,kind:dest.kind,index:dest.index};
    if(dest.kind==='self-open'){
      this.finishOrNext(g);
      g.message=`${p.name} lagde ${n} i sin åbne bunke.`;
    }else if(remaining(g,seat)===0){
      this.finishWinner(g,seat);
      if(g.phase!=='finished')this.advanceTurn(g);
    }else g.message=`${p.name} lagde ${n}.`;
  }
  doDiscard(g,seat){return this.doPlace(g,seat,{source:'pending',kind:'self-open'})}
  doChallenge(g,seat){
    if(!g.lastMove)throw Error('Der er ikke et træk at udfordre.');
    if(g.lastMove.actor===seat)throw Error('Du kan ikke udfordre dit eget træk.');
    if(g.lastMove.valid){g.message='Trækket var korrekt. Ingen æselstraf.';g.lastMove=null;return}
    const actor=g.lastMove.actor,number=g.lastMove.number,played=g.lastPlayed;
    const restored=JSON.parse(JSON.stringify(g.lastMove.before));
    // Undo cards only; preserve newer chat, consent and the monotonic revision.
    Object.assign(restored,{attention:g.attention,nudgeTimes:g.nudgeTimes,chat:g.chat,chatPrefs:g.chatPrefs,move:g.move,penaltySoundId:g.penaltySoundId||0,donkeySoundId:g.donkeySoundId||0});
    Object.keys(g).forEach(k=>delete g[k]);Object.assign(g,restored);
    const penalty=this.givePenalty(g,actor);
    if(penalty.assigned)g.penaltySoundId=g.move+1;
    this.finishWinner(g,actor);
    if(g.phase!=='finished'&&remaining(g,g.turn)===0)this.advanceTurn(g);
    g.lastMove=null;if(played)g.lastPlayed={...played,challenged:true};
    g.message=`🫏 ${g.players[actor].name} blev opdaget! Trækket med ${number} blev fortrudt. ${g.penaltyMessage}`;
    delete g.penaltyMessage;
  }
  givePenalty(g,actor){
    const p=g.players[actor];let assigned=false;
    if((g.variant||'collect')==='passing'){
      for(const other of g.players)other.donkeys=0;
      p.donkeys=1;assigned=true;
    }else if(g.players.reduce((v,item)=>v+(item.donkeys||0),0)<(g.donkeyCount||8)){
      p.donkeys=(p.donkeys||0)+1;assigned=true;
    }
    let extras=0;
    if(g.extraPenalty===true){
      for(let i=0;i<g.players.length;i++){
        if(i!==actor&&g.players[i].closed.length){p.closed.push(g.players[i].closed.pop());extras++}
      }
    }
    if(extras && Array.isArray(g.finishOrder))g.finishOrder=g.finishOrder.filter(i=>i!==actor);
    if(extras && g.phase==='finished'){
      g.phase='playing';g.winner=null;g.placements=null;
    }
    g.penaltyMessage=`${assigned?'Æselkort givet':'Ingen ledige æselkort'}${extras?` og ${extras} ekstra talkort`:''}.`;
    return {assigned,extras};
  }
  finishWinner(g,finisher){
    // Online: donkey cards first, then remaining cards and finishing order.
    const active=activeSeats(g),done=(g.finishOrder||[]).filter(i=>!g.players[i]?.leftAt&&remaining(g,i)===0);
    for(let i=0;i<g.players.length;i++)if(!g.players[i].leftAt&&remaining(g,i)===0&&!done.includes(i))done.push(i);
    g.finishOrder=done;
    if(!done.length)return;
    if(active.length>2&&done.length<active.length-1)return;
    g.placements=active.sort((a,b)=>
      (g.players[a].donkeys||0)-(g.players[b].donkeys||0)||
      remaining(g,a)-remaining(g,b)||
      (done.indexOf(a)<0?Infinity:done.indexOf(a))-(done.indexOf(b)<0?Infinity:done.indexOf(b))||a-b);
    g.phase='finished';g.winner=g.placements[0];
    g.message=`🏆 ${g.players[g.winner].name} vandt! `+g.placements.slice(0,3).map((i,k)=>`${['🥇','🥈','🥉'][k]} ${g.players[i].name}`).join(' · ');
  }
  advanceTurn(g){
    for(let step=0;step<g.players.length;step++){
      g.turn=(g.turn+1)%g.players.length;
      if(!g.players[g.turn].leftAt&&remaining(g,g.turn)>0)break;
    }
  }
  finishOrNext(g){
    this.finishWinner(g,g.turn);
    if(g.phase==='finished')return;
    this.advanceTurn(g);
    g.message=`${g.players[g.turn].name}s tur.`;
  }
  syncBoard(g){if(['result','skipped'].includes(g.board.phase)){const key=g.board.turn+':'+g.board.phase;if(g.board.advanceKey!==key||!g.board.advanceAt)g.board.advanceAt=Date.now()+1800;g.board.advanceKey=key}else{g.board.advanceAt=null;g.board.advanceKey=null}g.turn=g.board.turn;g.phase=g.board.phase==='win'?'finished':'playing';g.winner=g.board.winner;g.message=g.board.message}
  publicState(g,seat){
    const playerCards=g.players.reduce((sum,p)=>sum+countCards(p),0)+(g.pending!=null?1:0),centerCards=g.centers.reduce((sum,c)=>sum+c.length,0);
    return {
      hostSeat:g.hostSeat??0,activeCount:activeSeats(g).length,departure:g.departure||null,youLeft:!!g.players[seat].leftAt,gameType:g.gameType||'cards',board:g.board?BoardGame.view(g.board,seat):null,boardConfig:g.boardConfig||null,
      reviewUntil:0,reviewRemainingMs:0,lastPlayed:g.lastPlayed||null,donkeySoundId:g.donkeySoundId||0,
      cardCount:{players:playerCards,centers:centerCards,total:playerCards+centerCards,expected:(g.deckSets??5)*20},
      attention:g.phase!=='closed'?(g.attention?.[seat]||null):null,phase:g.phase,penaltySoundId:g.penaltySoundId||0,startWaitMs:g.phase==='waiting'?this.earlyStartWait(g):0,turn:g.turn,pending:g.turn===seat?g.pending:null,centers:g.centers.map(c=>({top:c.at(-1),length:c.length,cards:[...c]})),
      players:g.players.map((p,i)=>({name:p.name,left:!!p.leftAt,closed:p.closed.length,revealed:i===g.turn&&g.pending!=null?g.pending:null,turned:i===g.turn&&g.pending!=null?1:0,total:remaining(g,i),open:i===seat||true?p.open.at(-1):null,openCount:p.open.length,donkeys:p.donkeys})),
      you:seat,playerCount:g.playerCount??2,deckSets:g.deckSets??5,variant:g.variant||'collect',extraPenalty:g.extraPenalty===true,donkeyCount:g.donkeyCount||8,message:g.message,move:g.move,canChallenge:!!g.lastMove&&g.lastMove.actor!==seat,winner:g.winner,placements:g.placements||null
    };
  }
  broadcast(g){
    for(const [ws,seat] of this.clients){
      try{ws.send(JSON.stringify({type:'state',state:this.publicState(g,seat)}))}catch{}
    }
  }
}
