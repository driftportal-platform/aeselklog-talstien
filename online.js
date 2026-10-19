(()=>{'use strict';
// v0.9.45: egne offline-MP3-stemmer, musik og eksisterende chatklient.
const $=id=>document.getElementById(id),API=String(window.AESEL_ONLINE_URL||'').replace(/\/$/,''),KEY='aeselklog-online-session-v0941';
let code='',secret='',state=null,ws=null,serial=0,retry=null,delay=1000,busy=false,selected=null,lastUpdate=0,requestSerial=0;
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
function displaySetup(){ $('setup').classList.remove('hidden');$('game').classList.add('hidden')}
function displayGame(){ $('setup').classList.add('hidden');$('game').classList.remove('hidden')}
function myTurn(){return state?.phase==='playing'&&state.turn===state.you}
function sourceValue(src){return src==='pending'?state?.pending:state?.players?.[state.you]?.open}
function card(n,src){const e=node('div','card'+(n==null?' back':'')+(src?' selectable':''),n==null?'🫏':n);if(n!=null)e.classList.add('card-number');if(src){e.tabIndex=0;e.setAttribute('role','button');e.setAttribute('aria-label',`Vælg kort ${n}`);if(selected===src)e.classList.add('selected');e.onclick=()=>select(src);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(src)}};e.draggable=true;e.ondragstart=ev=>ev.dataTransfer.setData('text/plain',src)}return e}
function select(src){if(!myTurn()||sourceValue(src)==null)return;selected=selected===src?null:src;render(state)}
function target(kind,index,title,top,active){const t=node('div','target'+(active?' active':''));t.append(node('h3','',title));if(top!=null)t.append(card(top));if(active){t.append(button('Læg kort her',()=>place(kind,index)));t.ondragover=ev=>ev.preventDefault();t.ondrop=ev=>{ev.preventDefault();const src=ev.dataTransfer.getData('text/plain');if(src==='pending'||src==='open')place(kind,index,src)}}return t}
function render(data){if(!data||!Array.isArray(data.players))return;const changed=state&&(state.move!==data.move||state.turn!==data.turn||state.pending!==data.pending);if(changed)selected=null;state=data;if(Number.isInteger(data.pending)){lastNumber=data.pending;$('repeatNumber').disabled=false}lastUpdate=Date.now();displayGame();updateAudio();syncChat(data);put('code',code);put('roomDeckSets',`${data.deckSets??5} kortsæt · ${(data.deckSets??5)*20} talkort i alt`);put('message',data.message||'');
const active=myTurn(),mine=data.you,pl=$('players');pl.replaceChildren();data.players.forEach((p,i)=>{const box=node('div','player'+(i===data.turn?' turn':''));box.append(node('h3','',p.name+(i===mine?' (dig)':'')));box.append(node('p','muted',`Lukkede: ${p.closed??0} · Åbne: ${p.openCount??0} · Æselkort: ${p.donkeys??0}`));const piles=node('div','flex');const closed=node('div');closed.append(node('p','muted','Lukket bunke'));const cover=card(null);if(active&&i===mine&&data.pending==null){cover.classList.add('selectable');cover.tabIndex=0;cover.setAttribute('role','button');cover.onclick=()=>action('flip');cover.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action('flip')}}}closed.append(cover);piles.append(closed);const open=node('div');open.append(node('p','muted','Åben bunke'));if(p.open!=null)open.append(card(p.open,i===mine&&active&&data.pending==null?'open':null));piles.append(open);box.append(piles);pl.append(box)});
const cs=$('centers');cs.replaceChildren();const playable=active&&(selected!=null||data.pending!=null);(data.centers||[]).forEach((c,i)=>cs.append(target('center',i,`Række ${i+1}`,c.top,playable)));if((data.centers||[]).length<5)cs.append(target('new-center',(data.centers||[]).length,'+ Ny række',null,playable));
if(active){const dest=node('div','targets');dest.append(target('self-open',mine,'Egen åbne bunke',null,data.pending!=null));data.players.forEach((p,i)=>{if(i!==mine)dest.append(target('player',i,`Læg hos ${p.name}`,p.open,playable))});cs.append(dest)}
$('challenge').disabled=!data.canChallenge||busy;
$('challenge').setAttribute('aria-describedby','challengeHelp');
const podium=$('podium');podium.replaceChildren();if(data.phase==='finished'){(data.placements||[data.winner,1-data.winner]).forEach((i,k)=>podium.append(node('p','',`${['🥇 1.','🥈 2.'][k]} plads: ${data.players[i].name} · 🫏 ${data.players[i].donkeys} æselkort`)))}const actions=$('actions');actions.replaceChildren();$('pendingArea').replaceChildren();if(data.phase==='waiting'){put('current','Venter på spiller 2…');return}if(data.phase==='finished'){put('current',data.winner===mine?'🏆 Du vandt!':`${data.players[data.winner]?.name||'Modstanderen'} vandt!`);return}if(!active){put('current','Vent på din modstander.');return}if(data.pending!=null){put('current','Vælg det vendte kort, og læg det i en bunke.');$('pendingArea').append(card(data.pending,'pending'));actions.append(button('Læg i egen åbne bunke',()=>place('self-open',mine,'pending')))}else{put('current','Vend et kort eller spil fra din åbne bunke.');actions.append(button('🃏 Vend kort',()=>action('flip')));if(data.players[mine]?.open!=null)actions.append(button('Vælg åbent kort',()=>select('open')))}if(selected)actions.prepend(node('strong','',`Valgt: ${sourceValue(selected)}`));}
async function action(type,extra={}){if(busy)return;busy=true;try{fail('');const prior=state;const moved=extra.source==='open'?prior?.players?.[prior.you]?.open:prior?.pending;const data=await post(endpoint('action'),{secret,type,...extra});selected=null;render(data);if(type==='flip'&&Number.isInteger(data.pending))sayNumber(data.pending,'flip');else if(type==='place'&&Number.isInteger(moved))sayNumber(moved,'place')}catch(e){fail(e);try{render(await current())}catch{}}finally{busy=false;if(state)$('challenge').disabled=!state.canChallenge}}
function place(kind,index,src=selected){if(!myTurn()||!['open','pending'].includes(src)||sourceValue(src)==null)return fail(Error('Vælg først dit kort.'));if(kind==='self-open'&&src!=='pending')return fail(Error('Du kan kun lægge et vendt kort i egen åbne bunke.'));return action('place',{source:src,kind,index:Number(index)})}
async function refresh(silent=false){if(!code||!secret)return;const mySerial=requestSerial;try{const data=await current();if(mySerial!==requestSerial)return;if(!state||data.move>=state.move)render(data);window.AeselChat?.refresh?.();put('connectionStatus',ws?.readyState===WebSocket.OPEN?'Liveforbindelse aktiv':'Spilstatus opdateret');}catch(e){if(!silent)put('connectionStatus',e.message)}}
function closeSocket(){serial++;clearTimeout(retry);if(ws){const old=ws;ws=null;old.onclose=null;old.onmessage=null;old.onerror=null;try{old.close()}catch{}}}
function connect(){closeSocket();if(!code||!secret)return;const n=serial;let sock;try{sock=new WebSocket(API.replace(/^http/,'ws')+`/api/room/${code}/ws?secret=${encodeURIComponent(secret)}`)}catch{put('connectionStatus','Liveforbindelse utilgængelig; bruger statusopdatering.');return}ws=sock;sock.onopen=()=>{if(n!==serial)return;delay=1000;put('connectionStatus','Liveforbindelse aktiv');refresh(true)};sock.onmessage=e=>{if(n!==serial)return;try{const msg=JSON.parse(e.data);if(msg.type==='state'&&(!state||msg.state.move>=state.move))render(msg.state);if(msg.type==='chat-update')window.AeselChat?.refresh?.()}catch{}};sock.onclose=()=>{if(n!==serial)return;ws=null;put('connectionStatus','Forbindelsen er afbrudt; forsøger igen…');retry=setTimeout(()=>{if(n===serial)connect()},delay);delay=Math.min(delay*2,30000)};sock.onerror=()=>put('connectionStatus','Liveforbindelsen har en fejl; reserveopdatering kører.')}
async function session(c,s,initial){requestSerial++;code=c;secret=s;state=null;selected=null;save();displayGame();if(initial)render(initial);connect();await refresh()}
function guard(fn){return()=>{if(!window.AeselParentGate?.requireParent){put('setupError','Forældrelåsen kunne ikke indlæses.');return}window.AeselParentGate.requireParent(fn)}}
$('create').onclick=guard(async()=>{try{put('setupError','');const name=$('name').value.trim();if(!name)throw Error('Skriv dit navn.');const r=await post(`${API}/api/create`,{name,range:$('range').value,deckSets:Number($('deckSets').value),variant:$('variant').value,donkeyCount:Number($('donkeyCount').value),extraPenalty:$('extraPenalty').checked});await session(r.code,r.secret)}catch(e){put('setupError',e.message)}});
$('join').onclick=guard(async()=>{try{put('setupError','');const name=$('name').value.trim(),c=$('joinCode').value.trim().toUpperCase();if(!name||!/^[A-Z0-9]{8}$/.test(c))throw Error('Angiv navn og en gyldig rumkode.');const r=await post(`${API}/api/room/${c}/join`,{name});await session(c,r.secret)}catch(e){put('setupError',e.message)}});
$('challenge').onclick=()=>{action('challenge')};
$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(code);put('connectionStatus','Rumkoden er kopieret.')}catch{put('connectionStatus',`Rumkode: ${code}`)}};
$('reconnect').onclick=()=>{connect();refresh()};$('leave').onclick=()=>{if(!confirm('Forlad spillet på denne enhed?'))return;requestSerial++;closeSocket();forget();window.AeselChat?.leave?.();window.__aeselChatRoom=null;state=null;musicAudio.pause();stopSpeech();code='';secret='';selected=null;lastNumber=null;$('repeatNumber').disabled=true;displaySetup()};
setInterval(()=>{if(code&&secret&&!document.hidden&&Date.now()-lastUpdate>2500)refresh(true)},3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&code)refresh()});window.addEventListener('online',()=>{if(code){connect();refresh()}});
async function restore(){let s;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}if(!s||!/^[A-Z0-9]{8}$/.test(s.code)||!/^[a-f0-9]{48}$/.test(s.secret)||Date.now()-s.at>24*60*60*1000){displaySetup();return}code=s.code;secret=s.secret;displayGame();put('connectionStatus','Henter seneste spilstatus…');try{render(await current());connect()}catch(e){put('connectionStatus','Kunne ikke genoprette: '+e.message+'. Prøv Opdater igen.');connect()}}
if(!/^https:\/\//.test(API)){displaySetup();put('setupError','Cloudflare-adressen mangler i online-config.js.')}else restore();
// Lydindstillinger pr. online-enhed (adskilt fra offline-spillene).
const AUDIO_KEY='aeselklog-online-audio-v0942';
let audioPref={voice:true,language:'da',music:false,track:'gonefishin',volume:32};
try{Object.assign(audioPref,JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}'))}catch{}
const trackPaths={gonefishin:'./music/gone-fishin.mp3',march:'./music/childrens-march.mp3',beary:'./music/beary-fishy.mp3'};
let speechQueue=Promise.resolve(),soundSerial=0,spoken=null,lastNumber=null;
const musicAudio=new Audio();musicAudio.loop=true;musicAudio.preload='none';
function saveAudio(){try{localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPref))}catch{}}
function updateAudio(){
 $('voiceToggle').textContent=audioPref.voice?'🔊 Tale til':'🔇 Tale fra';
 $('voiceLanguage').value=audioPref.language;
 $('musicToggle').textContent=audioPref.music?'🎵 Musik til':'🎵 Musik fra';
 $('musicTrack').value=audioPref.track;$('musicVolume').value=audioPref.volume;
 musicAudio.volume=Math.min(1,Math.max(0,audioPref.volume/100))*(spoken?.paused===false ? .12 : .4);
 if(audioPref.music&&state&&!document.hidden){const path=trackPaths[audioPref.track];if(musicAudio.getAttribute('src')!==path)musicAudio.src=path;musicAudio.play().catch(()=>{})}
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
 const path=`./audio/numbers/${file}/${String(n).padStart(3,'0')}.mp3`;
 speechQueue=speechQueue.catch(()=>{}).then(()=>new Promise(resolve=>{
  if(serial!==soundSerial||!audioPref.voice)return resolve();
  const a=new Audio(path);spoken=a;const done=()=>{if(spoken===a){spoken=null;updateAudio()}resolve()};a.onended=done;a.onerror=()=>{fail('Talelyden kunne ikke afspilles. Tryk på Hør tallet igen.');done()};a.onplay=()=>updateAudio();a.play().catch(()=>{fail('Tryk på Hør tallet igen for at starte talelyden.');done()});
 }));
}
$('repeatNumber').onclick=()=>{if(lastNumber!=null)sayNumber(lastNumber,'repeat')};
$('voiceToggle').onclick=()=>{audioPref.voice=!audioPref.voice;if(!audioPref.voice)stopSpeech();saveAudio();updateAudio()};
$('voiceLanguage').onchange=e=>{audioPref.language=e.target.value;stopSpeech();saveAudio();updateAudio()};
$('musicToggle').onclick=()=>{audioPref.music=!audioPref.music;saveAudio();updateAudio()};
$('musicTrack').onchange=e=>{audioPref.track=e.target.value;saveAudio();updateAudio()};
$('musicVolume').oninput=e=>{audioPref.volume=Number(e.target.value);saveAudio();updateAudio()};
document.addEventListener('visibilitychange',updateAudio);
updateAudio();
function syncChat(data){if(!window.AeselChat||!code||!secret)return;
 const seat=data.you;
 if(seat!==0&&seat!==1)return;
 if(!window.__aeselChatRoom||window.__aeselChatRoom!==code){window.__aeselChatRoom=code;window.AeselChat.begin(API,code,secret,seat)}
 else window.AeselChat.updateSeat(seat);
}
})();
