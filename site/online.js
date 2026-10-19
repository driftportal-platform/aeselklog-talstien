(()=>{'use strict';
// v0.9.53: egne offline-MP3-stemmer, musik og eksisterende chatklient.
const $=id=>document.getElementById(id),API=String(window.AESEL_ONLINE_URL||'').replace(/\/$/,''),KEY='aeselklog-online-session-v0941';
let lastAttention=null,attentionTimer=null;
let code='',secret='',state=null,ws=null,serial=0,retry=null,delay=1000,busy=false,selected=null,lastUpdate=0,requestSerial=0,earlyStartDeadline=0,menuPhase=null,lastPenaltySoundId=null,bray=null;
const endpoint=path=>`${API}/api/room/${encodeURIComponent(code)}/${path}`;
const put=(id,value)=>{$(id).textContent=String(value??'')};
const fail=e=>put('actionError',e?.message||String(e));
const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e};
const button=(txt,cb)=>{const b=node('button','',txt);b.type='button';b.onclick=cb;return b};
async function json(url,options={}){let r;try{r=await fetch(url,{cache:'no-store',...options})}catch{throw Error('Kan ikke kontakte Cloudflare.')}let v;try{v=await r.json()}catch{throw Error('Serveren returnerede ikke gyldig JSON.')}if(!r.ok)throw Error(v.error||`HTTP ${r.status}`);return v}
const post=(url,data)=>json(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
function save(){try{localStorage.setItem(KEY,JSON.stringify({code,secret,at:Date.now()}))}catch{}}
function forget(){try{localStorage.removeItem(KEY)}catch{}}
function current(){return json(endpoint('state')+`?secret=${encodeURIComponent(secret)}`)}
function displaySetup(){window.AeselOverlay?.setActive(false); $('setup').classList.remove('hidden');$('game').classList.add('hidden')}
function displayGame(){window.AeselOverlay?.setActive(state?.phase!=='closed'); $('setup').classList.add('hidden');$('game').classList.remove('hidden')}
function myTurn(){return state?.phase==='playing'&&state.turn===state.you}
function sourceValue(src){return src==='pending'?state?.pending:state?.players?.[state.you]?.open}
function card(n,src){const e=node('div','card'+(n==null?' back':'')+(src?' selectable':''),n==null?'🫏':n);if(n!=null)e.classList.add('card-number');if(src){e.tabIndex=0;e.setAttribute('role','button');e.setAttribute('aria-label',`Vælg kort ${n}`);if(selected===src)e.classList.add('selected');e.dataset.source=src;e.onclick=ev=>{ev.stopPropagation();if(performance.now()>suppressClickUntil)select(src)};e.onkeydown=ev=>{ev.stopPropagation();if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(src)}};e.draggable=false;e.ondragstart=ev=>ev.preventDefault()}return e}
function select(src){if(!myTurn()||sourceValue(src)==null)return;selected=selected===src?null:src;render(state)}
function target(kind,index,title,top,active){const t=node('div','target'+(active?' active':''));t.append(node('h3','',title));if(top!=null)t.append(card(top));if(active){t.dataset.dropKind=kind;t.dataset.dropIndex=index;t.append(button('Læg kort her',()=>place(kind,index)));t.ondragover=ev=>ev.preventDefault();t.ondrop=ev=>{ev.preventDefault();const src=ev.dataTransfer.getData('text/plain');if(src==='pending'||src==='open')place(kind,index,src)}}return t}
let drag=null,suppressClickUntil=0,scrollFrame=null;
function clearDrag(){if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=null;drag?.ghost?.remove();drag=null}
function scrollDrag(){
 if(!drag?.moving)return;
 const velocity=drag.y<80?-10:drag.y>innerHeight-80?10:0;
 if(velocity)window.scrollBy(0,velocity);
 scrollFrame=requestAnimationFrame(scrollDrag);
}
$('game').addEventListener('pointerdown',e=>{
 const source=e.target.closest('[data-source]');if(!source||!myTurn()||busy||e.button>0)return;
 clearDrag();drag={id:e.pointerId,source:source.dataset.source,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,element:source,moving:false,ghost:null};
});
document.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;drag.x=e.clientX;drag.y=e.clientY;
 if(!drag.moving&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>9){
  drag.moving=true;drag.ghost=drag.element.cloneNode(true);drag.ghost.classList.add('online-drag-ghost');drag.ghost.removeAttribute('tabindex');drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);scrollFrame=requestAnimationFrame(scrollDrag);
 }
 if(drag.moving){e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px'}
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const {source,moving}=drag,target=moving?document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop-kind]'):null;
 clearDrag();if(!moving)return;e.preventDefault();suppressClickUntil=performance.now()+400;
 if(target)place(target.dataset.dropKind,Number(target.dataset.dropIndex),source);else fail('Slip kortet på en åben bunke eller en midterrække. Kortet ligger stadig hos dig.');
});
document.addEventListener('pointercancel',clearDrag);
document.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}},true);
let boardSignature=null;
function render(data){if(!data||!Array.isArray(data.players)||state?.phase==='closed'&&data.phase!=='closed')return;
if(data.phase==='closed'){
 state=data;selected=null;displayGame();$('liveGame').hidden=true;$('closedPanel').hidden=false;put('closedMessage',data.message||'I kan nu oprette et nyt rum.');
 requestSerial++;closeSocket();forget();window.AeselChat?.leave?.();window.__aeselChatRoom=null;clearDrag();stopSpeech();window.AeselSound?.stop();musicAudio.pause();return;
}
const signature=JSON.stringify([code,data,selected]);if(data!==state&&signature===boardSignature){lastUpdate=Date.now();return}boardSignature=signature;
$('liveGame').hidden=false;$('closedPanel').hidden=true;$('endGame').hidden=data.you!==0;
const previousTurn=state?.turn,previousYou=state?.you;const changed=state&&(state.move!==data.move||state.turn!==data.turn||state.pending!==data.pending);if(changed)selected=null;if(lastPenaltySoundId!==null&&data.penaltySoundId&&data.penaltySoundId>lastPenaltySoundId)playDonkey();lastPenaltySoundId=Math.max(lastPenaltySoundId??0,data.penaltySoundId||0);state=data;if(menuPhase!==data.phase){$('roomMenu').open=data.phase==='waiting';menuPhase=data.phase}earlyStartDeadline=performance.now()+(data.startWaitMs??0);updateEarlyStart();const repeatable=data.pending??data.players[data.you]?.open;if(Number.isInteger(repeatable)){lastNumber=repeatable;$('repeatNumber').disabled=false}lastUpdate=Date.now();displayGame();updateAudio();syncChat(data);put('code',code);window.AeselInvite?.setRoom(code);put('roomDeckSets',`${data.deckSets??5} kortsæt · ${(data.deckSets??5)*20} talkort i alt · ${data.players.length}/${data.playerCount??2} spillere`);put('message',data.message||'');
const active=myTurn(),mine=data.you,pl=$('players');pl.replaceChildren();data.players.forEach((p,i)=>{const box=node('div','player'+(data.phase==='playing'&&i===data.turn?' turn':''));box.dataset.seat=i;const heading=node('h3','');if(i!==mine){const ping=button(p.name+' 👋',async()=>{try{await post(endpoint('attention'),{secret,target:i});put('actionError',`Du prikkede til ${p.name}.`)}catch(e){fail(e)}});ping.className='player-nudge';ping.setAttribute('aria-label',`Prik til ${p.name}`);heading.append(ping)}else heading.textContent=p.name+' (dig)';box.append(heading);box.append(node('p','muted',`Lukkede: ${p.closed??0} · Åbne: ${p.openCount??0} · Æselkort: ${p.donkeys??0}`));const piles=node('div','flex');const closed=node('div');closed.append(node('p','muted','Lukket bunke'));const recycle=p.closed===0&&p.openCount>0;const cover=p.closed>0?card(null):node(recycle&&active&&i===mine?'button':'div','empty-pile'+(recycle?' recycle-pile':''),recycle&&active&&i===mine?'↶ Vend åben bunke':'Tom');if(active&&i===mine&&data.pending==null&&(p.closed>0||recycle)){cover.classList.add('selectable');cover.tabIndex=0;cover.setAttribute('role','button');cover.setAttribute('aria-label',recycle?'Vend din åbne bunke til lukket bunke':'Vend et kort');cover.onclick=()=>action(recycle?'recycle':'flip');cover.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action(recycle?'recycle':'flip')}}}if(i===mine&&data.pending!=null){closed.append(card(data.pending,active?'pending':null));closed.classList.add('revealed-pile')}else closed.append(cover);piles.append(closed);const open=node('div');open.append(node('p','muted','Åben bunke'));const shown=p.open;const source=i===mine&&active&&data.pending==null?'open':null;if(shown!=null)open.append(card(shown,source));if(shown==null)open.append(node('div','empty-pile','Tom'));if(active&&(i!==mine||data.pending!=null)){open.classList.add('pile-target');open.dataset.dropKind=i===mine?'self-open':'player';open.dataset.dropIndex=i;open.tabIndex=0;open.setAttribute('role','button');open.setAttribute('aria-label',i===mine?'Læg i din åbne bunke':`Læg hos ${p.name}`);const drop=src=>place(i===mine?'self-open':'player',i,src||selected||(data.pending!=null?'pending':null));open.onclick=()=>drop();open.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();drop()}};open.ondragover=e=>e.preventDefault();open.ondrop=e=>{e.preventDefault();drop(e.dataTransfer.getData('text/plain'))}}piles.append(open);box.append(piles);pl.append(box)});if(active&&(previousTurn!==data.turn||previousYou!==mine)&&pl.children[mine])pl.scrollLeft=pl.children[mine].offsetLeft-pl.children[0].offsetLeft;showAttention(data);
const cs=$('centers');cs.replaceChildren();const playable=active&&(sourceValue('open')!=null||data.pending!=null);(data.centers||[]).forEach((c,i)=>cs.append(target('center',i,`Række ${i+1}`,c.top,playable)));if(data.phase!=='finished'&&(data.centers||[]).length<5)cs.append(target('new-center',(data.centers||[]).length,'+ Ny række',null,playable));

$('challenge').disabled=!data.canChallenge||busy;
$('challenge').setAttribute('title','Udfordr sidste træk med æselkortet');
const podium=$('podium');podium.replaceChildren();if(data.phase==='finished'){(data.placements||[data.winner,1-data.winner]).slice(0,3).forEach((i,k)=>podium.append(node('p','',`${['🥇 1.','🥈 2.','🥉 3.'][k]} plads: ${data.players[i].name} · 🫏 ${data.players[i].donkeys} æselkort`)))}const actions=$('actions');actions.replaceChildren();$('pendingArea').replaceChildren();if(data.phase==='waiting'){put('current',`Venter på spillere: ${data.players.length} af ${data.playerCount??2}. Spillet starter, når alle er med. Efter 60 sekunder kan opretteren starte med mindst to.`);return}if(data.phase==='finished'){put('current',data.winner===mine?'🏆 Du vandt!':`${data.players[data.winner]?.name||'Modstanderen'} vandt!`);return}if(!active){put('current',`${data.players[data.turn]?.name||'En anden spiller'} er på tur.`);return}if(data.pending!=null){put('current','Flyt det vendte kort fra din lukkede bunke.');actions.append(button('Læg i egen åbne bunke',()=>place('self-open',mine,'pending')))}else{put('current',data.players[mine].closed===0?'Spil dit åbne kort, eller vend den åbne bunke med et tryk.':'Vend et kort fra din lukkede bunke, eller spil et åbent kort.');const recycle=data.players[mine].closed===0&&data.players[mine].openCount>0;actions.append(button(recycle?'↶ Vend åben bunke':'🃏 Vend kort',()=>action(recycle?'recycle':'flip')));if(data.players[mine]?.open!=null)actions.append(button('Vælg åbent kort',()=>select('open')))}if(selected)actions.prepend(node('strong','',`Valgt: ${sourceValue(selected)}`));}
async function action(type,extra={}){if(busy)return;const actionSerial=requestSerial;busy=true;try{fail('');const prior=state;const moved=type==='end-turn'?(prior?.pending??prior?.players?.[prior.you]?.open):(extra.source==='open'?prior?.players?.[prior.you]?.open:prior?.pending);const data=await post(endpoint('action'),{secret,type,...(type==='flip'?{manualRecycle:true}:{}),...extra});if(actionSerial!==requestSerial)return;selected=null;render(data);if(state?.phase==='closed')return;if(type==='flip-open'&&Number.isInteger(data.players[data.you]?.open))sayNumber(data.players[data.you].open,'flip');else if(type==='flip'&&Number.isInteger(data.pending))sayNumber(data.pending,'flip');else if((type==='place'||type==='end-turn')&&Number.isInteger(moved))sayNumber(moved,'place')}catch(e){if(actionSerial!==requestSerial)return;fail(e);try{const latest=await current();if(actionSerial===requestSerial)render(latest)}catch{}}finally{busy=false;if(state)$('challenge').disabled=!state.canChallenge;updateEarlyStart()}}
function place(kind,index,src=selected){if(!myTurn()||!['open','pending'].includes(src)||sourceValue(src)==null)return fail(Error('Vælg først dit kort.'));if(kind==='self-open'&&src!=='pending')return fail(Error('Du kan kun lægge et vendt kort i egen åbne bunke.'));return action('place',{source:src,kind,index:Number(index)})}
async function refresh(silent=false){if(!code||!secret||state?.phase==='closed')return;const mySerial=requestSerial;try{const data=await current();if(mySerial!==requestSerial)return;if(!state||data.move>=state.move)render(data);if(state?.phase==='closed')return;window.AeselChat?.refresh?.();put('connectionStatus',ws?.readyState===WebSocket.OPEN?'Liveforbindelse aktiv':'Spilstatus opdateret');}catch(e){if(!silent)put('connectionStatus',e.message)}}
function closeSocket(){serial++;clearTimeout(retry);if(ws){const old=ws;ws=null;old.onclose=null;old.onmessage=null;old.onerror=null;try{old.close()}catch{}}}
function showAttention(data){const ping=data.attention;if(!ping||Date.now()-ping.at>5000)return;const own=$('players').children[data.you];own?.classList.add('player-attention');if(ping.id===lastAttention)return;lastAttention=ping.id;own?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});let note=$('attentionNotice');if(!note){note=node('p','attention-notice');note.id='attentionNotice';note.setAttribute('role','status');$('players').before(note)}note.textContent=`👋 ${data.players[ping.from]?.name||'En spiller'} prikker til dig!`;clearTimeout(attentionTimer);attentionTimer=setTimeout(()=>{for(const e of document.querySelectorAll('.player-attention'))e.classList.remove('player-attention');note.remove()},5000)}
function connect(){closeSocket();if(!code||!secret||state?.phase==='closed')return;const n=serial;let sock;try{sock=new WebSocket(API.replace(/^http/,'ws')+`/api/room/${code}/ws?secret=${encodeURIComponent(secret)}`)}catch{put('connectionStatus','Liveforbindelse utilgængelig; bruger statusopdatering.');return}ws=sock;sock.onopen=()=>{if(n!==serial)return;delay=1000;put('connectionStatus','Liveforbindelse aktiv');refresh(true)};sock.onmessage=e=>{if(n!==serial)return;try{const msg=JSON.parse(e.data);if(msg.type==='state'&&(!state||msg.state.move>=state.move))render(msg.state);if(msg.type==='chat-update')window.AeselChat?.refresh?.()}catch{}};sock.onclose=()=>{if(n!==serial)return;ws=null;put('connectionStatus','Forbindelsen er afbrudt; forsøger igen…');retry=setTimeout(()=>{if(n===serial)connect()},delay);delay=Math.min(delay*2,30000)};sock.onerror=()=>put('connectionStatus','Liveforbindelsen har en fejl; reserveopdatering kører.')}
async function session(c,s,initial){requestSerial++;code=c;secret=s;state=null;selected=null;save();displayGame();if(initial)render(initial);connect();await refresh()}
function guard(fn){return()=>{if(!window.AeselParentGate?.requireParent){put('setupError','Forældrelåsen kunne ikke indlæses.');return}window.AeselParentGate.requireParent(fn)}}
function updateDealPreview(){const total=Number($('deckSets').value)*20,count=Number($('playerCount').value),lo=Math.floor(total/count),hi=Math.ceil(total/count);put('dealPreview',`${count} spillere · ${total} talkort · ${lo===hi?lo:lo+'–'+hi} kort til hver. Spillet starter, når alle er med. Efter 60 sekunder kan opretteren starte med mindst to.`)}
$('variant').onchange=()=>{$('donkeyCountField').hidden=$('variant').value==='passing'};
$('deckSets').onchange=updateDealPreview;$('playerCount').onchange=updateDealPreview;updateDealPreview();
$('create').onclick=guard(async()=>{try{put('setupError','');const name=$('name').value.trim();if(!name)throw Error('Skriv dit navn.');const r=await post(`${API}/api/create`,{name,range:$('range').value,deckSets:Number($('deckSets').value),playerCount:Number($('playerCount').value),variant:$('variant').value,donkeyCount:Number($('donkeyCount').value),extraPenalty:$('extraPenalty').checked});await session(r.code,r.secret)}catch(e){put('setupError',e.message)}});
$('join').onclick=guard(async()=>{try{put('setupError','');const name=$('name').value.trim(),c=$('joinCode').value.trim().toUpperCase();if(!name||!/^[A-Z0-9]{8}$/.test(c))throw Error('Angiv navn og en gyldig rumkode.');const r=await post(`${API}/api/room/${c}/join`,{name});await session(c,r.secret)}catch(e){put('setupError',e.message)}});
function updateEarlyStart(){
 const panel=$('earlyStartPanel'),button=$('startEarly');
 const waiting=state?.phase==='waiting'&&Number.isFinite(state.startWaitMs);
 panel.hidden=!waiting;if(!waiting){button.hidden=true;button.disabled=true;return}
 const seconds=Math.max(0,Math.ceil((earlyStartDeadline-performance.now())/1000)),host=state.you===0,enough=state.players.length>=2;
 button.hidden=!host||seconds>0;button.disabled=busy||!enough||seconds>0;
 put('earlyStartStatus',seconds>0?`Vi venter på de sidste. Om ${seconds} sek. kan rumopretteren starte med mindst to spillere.`:enough?(host?'I kan starte nu med dem, der er med, eller vente på de sidste.':'Rumopretteren kan nu starte med dem, der er med.'): 'Invitér mindst én anden spiller, før spillet kan startes.');
}
$('startEarly').onclick=()=>action('start-early');setInterval(updateEarlyStart,1000);
$('challenge').onclick=()=>{action('challenge')};
$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(code);put('connectionStatus','Rumkoden er kopieret.')}catch{put('connectionStatus',`Rumkode: ${code}`)}};
$('endGame').onclick=()=>{if(confirm('Afslut spillet for alle? I skal oprette et nyt rum for at spille igen.'))action('end-game')};
$('newGame').onclick=()=>{
 requestSerial++;closeSocket();forget();window.AeselChat?.leave?.();window.__aeselChatRoom=null;clearDrag();state=null;selected=null;menuPhase=null;lastPenaltySoundId=null;lastNumber=null;code='';secret='';stopSpeech();window.AeselSound?.stop();musicAudio.pause();$('repeatNumber').disabled=true;$('joinCode').value='';$('invitedNotice').hidden=true;$('setup').classList.remove('has-invite');$('liveGame').hidden=false;$('closedPanel').hidden=true;
 const url=new URL(location.href);url.search='';url.hash='';history.replaceState(null,'',url);displaySetup();$('name').focus();
};
$('reconnect').onclick=()=>{connect();refresh()};$('leave').onclick=()=>{if(!confirm('Forlad spillet på denne enhed?'))return;requestSerial++;closeSocket();forget();window.AeselChat?.leave?.();window.__aeselChatRoom=null;state=null;musicAudio.pause();stopSpeech();code='';secret='';selected=null;menuPhase=null;lastPenaltySoundId=null;lastNumber=null;$('repeatNumber').disabled=true;displaySetup()};
setInterval(()=>{if(code&&secret&&state?.phase!=='closed'&&!document.hidden&&Date.now()-lastUpdate>2500)refresh(true)},3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&code)refresh()});window.addEventListener('online',()=>{if(code){connect();refresh()}});
async function restore(){let s;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}if(window.AeselInvite?.room&&s?.code!==window.AeselInvite.room){displaySetup();return}if(!s||!/^[A-Z0-9]{8}$/.test(s.code)||!/^[a-f0-9]{48}$/.test(s.secret)||Date.now()-s.at>24*60*60*1000){displaySetup();return}code=s.code;secret=s.secret;displayGame();put('connectionStatus','Henter seneste spilstatus…');try{render(await current());if(state?.phase!=='closed')connect()}catch(e){put('connectionStatus','Kunne ikke genoprette: '+e.message+'. Prøv Opdater igen.');connect()}}
if(!/^https:\/\//.test(API)){displaySetup();put('setupError','Cloudflare-adressen mangler i online-config.js.')}else restore();
// Lydindstillinger pr. online-enhed (adskilt fra offline-spillene).
const AUDIO_KEY='aeselklog-online-audio-v0942';
let audioPref={voice:true,language:'da',music:false,track:'gonefishin',volume:32,effects:true};
try{Object.assign(audioPref,JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'))}catch{}
const trackPaths={gonefishin:'../music/gone-fishin.mp3',march:'../music/childrens-march.mp3',beary:'../music/beary-fishy.mp3'};
let speechQueue=Promise.resolve(),soundSerial=0,spoken=null,lastNumber=null;
const musicAudio=new Audio();musicAudio.loop=true;musicAudio.preload='none';
function saveAudio(){try{localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPref))}catch{}}
function updateAudio(){
 $('effectToggle').textContent=audioPref.effects?'🫏 Æsellyd til':'🫏 Æsellyd fra';
 $('voiceToggle').textContent=audioPref.voice?'🔊 Tale til':'🔇 Tale fra';
 $('voiceLanguage').value=audioPref.language;
 $('musicToggle').textContent=audioPref.music?'🎵 Musik til':'🎵 Musik fra';
 $('musicTrack').value=audioPref.track;$('musicVolume').value=audioPref.volume;
 musicAudio.volume=Math.min(1,Math.max(0,audioPref.volume/100))*((spoken?.paused===false||window.AeselSound?.isPlaying()) ? .12 : .4);
 if(!window.AeselChat?.audioBusy&&audioPref.music&&state&&state.phase!=='closed'&&!document.hidden){const path=trackPaths[audioPref.track];if(musicAudio.getAttribute('src')!==path)musicAudio.src=path;musicAudio.play().catch(()=>{})}
 else musicAudio.pause();
}
function stopSpeech(){soundSerial++;if(spoken){spoken.pause();spoken.removeAttribute('src');spoken=null}speechQueue=Promise.resolve();updateAudio()}
function sayNumber(n,stage='flip'){
 if(!Number.isInteger(n)||n<1||n>100)return;
 lastNumber=n;$('repeatNumber').disabled=false;
 if(!audioPref.voice)return;
 const lang=audioPref.language;
 if(stage==='repeat'){stopSpeech();for(const language of lang.split('-'))queueNumber(n,language);return}
 const spokenLang=lang.includes('-')?(stage==='flip'?'da':lang.split('-')[1]):(stage==='flip'?lang:null);
 if(!spokenLang)return;
 queueNumber(n,spokenLang);
}
function queueNumber(n,spokenLang){
 const file=spokenLang==='da'?'narrator':spokenLang;
 const serial=soundSerial;
 const path=`../audio/numbers/${file}/${String(n).padStart(3,'0')}.mp3`;
 speechQueue=speechQueue.catch(()=>{}).then(()=>new Promise(resolve=>{
  if(serial!==soundSerial||!audioPref.voice)return resolve();
  const a=new Audio(path);spoken=a;const done=()=>{if(spoken===a){spoken=null;updateAudio()}resolve()};a.onended=done;a.onerror=()=>{fail('Talelyden kunne ikke afspilles. Tryk på Hør tallet igen.');done()};a.onplay=()=>updateAudio();a.play().catch(()=>{fail('Tryk på Hør tallet igen for at starte talelyden.');done()});
 }));
}
let pendingDonkey=false;
function playDonkey(){if(!audioPref.effects)return;window.AeselSound.play().then(()=>{$('unlockSound').hidden=true;pendingDonkey=false}).catch(()=>{pendingDonkey=true;$('unlockSound').hidden=false})}
$('unlockSound').onclick=()=>{window.AeselSound.unlock();if(pendingDonkey)playDonkey()};
$('testDonkey').onclick=()=>{window.AeselSound.unlock();window.AeselSound.play().catch(()=>{$('unlockSound').hidden=false;pendingDonkey=true})};
$('effectToggle').onclick=()=>{audioPref.effects=!audioPref.effects;if(!audioPref.effects){window.AeselSound.stop();pendingDonkey=false;$('unlockSound').hidden=true}saveAudio();updateAudio()};
window.addEventListener('aesel-effect',updateAudio);
$('repeatNumber').onclick=()=>{if(lastNumber!=null)sayNumber(lastNumber,'repeat')};
$('voiceToggle').onclick=()=>{audioPref.voice=!audioPref.voice;if(!audioPref.voice)stopSpeech();saveAudio();updateAudio()};
$('voiceLanguage').onchange=e=>{audioPref.language=e.target.value;stopSpeech();saveAudio();updateAudio()};
window.addEventListener('aesel-chat-audio',updateAudio);
$('musicToggle').onclick=()=>{audioPref.music=!audioPref.music;saveAudio();updateAudio()};
$('musicTrack').onchange=e=>{audioPref.track=e.target.value;saveAudio();updateAudio()};
$('musicVolume').oninput=e=>{audioPref.volume=Number(e.target.value);saveAudio();updateAudio()};
document.addEventListener('visibilitychange',updateAudio);
updateAudio();
function syncChat(data){if(!window.AeselChat||!code||!secret)return;
 const seat=data.you;
 if(!Number.isInteger(seat)||seat<0||seat>=data.players.length)return;
 if(!window.__aeselChatRoom||window.__aeselChatRoom!==code){window.__aeselChatRoom=code;window.AeselChat.begin(API,code,secret,seat)}
 else window.AeselChat.updateSeat(seat);
}
})();
