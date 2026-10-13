/* ÆselKlog Talstien v0.8-B: fuldskærmsbane og sekventielt kast → hop → læring → bonus → action. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const qs=sel=>document.querySelector(sel);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COLORS=['#d84464','#227fcb','#24a667','#9361c9','#d69c34'];
const S=window.AeselEngine;
const B=window.AeselBoard;
if(!B||!B.validate()){document.body.textContent='ÆselKlog kan ikke starte: board.js mangler eller har ugyldige felter.';return;}
if(!S){document.body.textContent='ÆselKlog kan ikke starte: engine.js mangler.';return;}
const SPECIAL={5:'bonus',10:'hov',15:'byt',24:'mester',29:'bonus',35:'byt',44:'bonus',50:'mester',55:'hov',64:'hov',69:'bonus',75:'byt',84:'bonus',90:'hov',95:'mester'};
const SPECIAL_ICON={bonus:'⭐',hov:'🫏',byt:'🔄',mester:'🏆'};
const LEARN_DIE=['1 2 3','L / U','10 + 1','👑','> <','+ −'];
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const radio=name=>qs(`input[name="${name}"]:checked`)?.value;
const defer=(ms)=>new Promise(ok=>setTimeout(ok,ms));
const sound={on:true,last:'',selected:'auto',rate:1,pitch:1,mode:'device',endpoint:''};
const voiceKey='aeselklog-voice-v03';
let setupPlayers=[{name:'Spiller 1',age:6,kind:'child',difficulty:'mellem'},{name:'Spiller 2',age:8,kind:'child',difficulty:'mellem'}];
let players=[],config=null,turn=0,phase='setup',challenge=null,pending=null,resultLines=[],winner=null;
let busy=false,gameToken=0,showDiceState=null,taskTimer=null,taskDeadline=0;
const prefersLessMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let boardScale=0.73,followActive=true,boardExpanded=false,boardFitMode=false;
let bray=null;
try{bray=new Audio('./donkey-bray.wav');bray.preload='auto';bray.volume=.78;}catch(e){}

// AI-tale kræver HTTPS-stemmetjeneste. API-nøglen findes ALDRIG på telefonen.
let speechSerial=0,aiFetch=null,aiSource=null,aiHtmlAudio=null,audioContext=null;
const speechCache=new Map();
function normalizedSpeech(text){return String(text).replace(/ÆselKlog/g,'Æsel Klog').replace(/Hov hov!/g,'Hov, hov!').trim().slice(0,350)}
function voiceOptions(){return ('speechSynthesis' in window)?window.speechSynthesis.getVoices():[]}
function danishVoices(){return voiceOptions().filter(v=>String(v.lang||'').toLowerCase().startsWith('da'))}
function refreshVoice(){
 const sel=$('voiceChoice'),vs=danishVoices(),value=sound.selected;
 sel.innerHTML='<option value="auto">Automatisk dansk stemme</option>';
 vs.forEach(v=>{const el=document.createElement('option');el.value=v.voiceURI||v.name;el.textContent=`${v.name} (${v.lang})`;sel.append(el)});
 sel.value=Array.from(sel.options).some(o=>o.value===value)?value:'auto';
 $('voiceAvailability').textContent=vs.length?`Der er ${vs.length} dansk${vs.length===1?' stemme':'e stemmer'} tilgængelig${vs.length===1?'':'e'}.`:'Ingen dansk stemme fundet endnu. Oplæsning afhænger af din enhed.';
}
function syncVoiceControls(){
 $('voiceSpeed').value=sound.rate.toFixed(2);$('voicePitch').value=sound.pitch.toFixed(2);
 $('voiceSpeedValue').textContent=sound.rate.toFixed(2).replace('.',',')+'×';
 $('voicePitchValue').textContent=sound.pitch.toFixed(2).replace('.',',')+'×';
 $('voiceMode').value=sound.mode;
 $('aiEndpoint').value=sound.endpoint;
 $('aiVoiceControls').hidden=sound.mode!=='ai';
 $('deviceVoiceControls').hidden=sound.mode==='ai';
 $('voiceAvailability').hidden=sound.mode==='ai';
 aiStatus();
}
function aiStatus(message){
 const msg=message||(sound.endpoint?'Klar til at prøve den tilsluttede AI-stemme.':'Ingen stemmetjeneste angivet endnu – telefonstemmen bruges som reserve.');
 $('aiVoiceStatus').textContent=msg;
}
function validEndpoint(value){
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&u.pathname.endsWith('/tts')?u.href:null}catch(e){return null}
}
function saveVoice(){
 try{localStorage.setItem(voiceKey,JSON.stringify({selected:sound.selected,rate:sound.rate,pitch:sound.pitch,mode:sound.mode,endpoint:sound.endpoint}))}catch(e){}
}
function stopCurrentVoice(){
 speechSerial++;
 if(aiFetch){aiFetch.abort();aiFetch=null}
 if(aiSource){try{aiSource.stop()}catch(e){}aiSource.disconnect();aiSource=null}
 if(aiHtmlAudio){aiHtmlAudio.pause();if(aiHtmlAudio._blobUrl)URL.revokeObjectURL(aiHtmlAudio._blobUrl);aiHtmlAudio.src='';aiHtmlAudio=null}
 try{window.speechSynthesis?.cancel?.()}catch(e){}
}
function speakLocally(text){
 if(!('speechSynthesis' in window)||!sound.on)return;
 try{
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(normalizedSpeech(text));
  u.lang='da-DK';u.rate=sound.rate;u.pitch=sound.pitch;
  const ds=danishVoices();u.voice=ds.find(v=>(v.voiceURI||v.name)===sound.selected)||ds.find(v=>/premium|enhanced/i.test(v.name))||ds.find(v=>v.default)||ds[0]||null;
  speechSynthesis.speak(u);
 }catch(e){console.warn('Lokal oplæsning kunne ikke starte',e)}
}
function ensureAudioContext(){
 const C=window.AudioContext||window.webkitAudioContext;
 if(!C)return null;
 if(!audioContext)audioContext=new C();
 if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
 return audioContext;
}
// iOS tillader pålideligt Web Audio efter en brugerhandling (tryk på spil/terning).
document.addEventListener('pointerdown',()=>{if(sound.on&&sound.mode==='ai')ensureAudioContext()}, {passive:true});
document.addEventListener('keydown',()=>{if(sound.on&&sound.mode==='ai')ensureAudioContext()}, {passive:true});
async function speakAI(text,id){
 const endpoint=validEndpoint(sound.endpoint);
 if(!endpoint){aiStatus('Manglende eller ugyldig HTTPS-adresse. Afspiller telefonstemmen.');speakLocally(text);return}
 let bytes;
 const key=endpoint+'|'+text;
 try{
  if(speechCache.has(key))bytes=speechCache.get(key);
  else{
   const abort=new AbortController();aiFetch=abort;
   const timeout=setTimeout(()=>abort.abort(),25000);
   let response;
   try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:abort.signal,cache:'no-store'});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   if(!String(response.headers.get('Content-Type')||'').includes('audio/'))throw new Error('Svaret indeholdt ikke lyd');
   bytes=await response.arrayBuffer();}
   finally{clearTimeout(timeout)}
   if(bytes.byteLength<500||bytes.byteLength>2_500_000)throw new Error('Lydfilens størrelse var ugyldig');
   if(id===speechSerial){speechCache.set(key,bytes);if(speechCache.size>24)speechCache.delete(speechCache.keys().next().value)}
  }
  if(id!==speechSerial||!sound.on)return;
  const ctx=ensureAudioContext();
  if(ctx){
   if(ctx.state==='suspended')await ctx.resume();
   const decoded=await ctx.decodeAudioData(bytes.slice(0));
   if(id!==speechSerial||!sound.on)return;
   const node=ctx.createBufferSource();node.buffer=decoded;node.connect(ctx.destination);aiSource=node;
   node.onended=()=>{if(aiSource===node)aiSource=null};node.start();
  }else{
   const blob=new Blob([bytes],{type:'audio/mpeg'});
   const objectUrl=URL.createObjectURL(blob);
   const audio=new Audio(objectUrl);audio._blobUrl=objectUrl;aiHtmlAudio=audio;
   audio.onended=()=>{URL.revokeObjectURL(objectUrl);if(aiHtmlAudio===audio)aiHtmlAudio=null};
   try{await audio.play()}catch(err){URL.revokeObjectURL(objectUrl);throw err}
  }
  if(id===speechSerial)aiStatus('Dansk AI-lyd afspilles.');
 }catch(e){
  if(id!==speechSerial||e.name==='AbortError')return;
  console.warn('Kunne ikke hente AI-lyd',e);
  aiStatus('AI-lyden kunne ikke hentes ('+e.message+'). Telefonstemmen bruges i stedet.');
  speakLocally(text);
 }finally{if(id===speechSerial)aiFetch=null}
}
function say(text){
 sound.last=text;
 stopCurrentVoice();
 if(!sound.on)return;
 const t=normalizedSpeech(text),id=speechSerial;
 if(sound.mode==='ai')void speakAI(t,id);
 else speakLocally(t);
}
function playBray(){
 if(!sound.on||!bray)return;
 stopCurrentVoice();
 try{bray.pause();bray.currentTime=0;bray.play().catch(()=>{})}catch(e){}
}
function loadVoice(){
 try{
  // Behold brugerens tidligere lokale taleindstillinger.
  const p=JSON.parse(localStorage.getItem(voiceKey)||localStorage.getItem('aeselklog-voice-v02')||'{}');
  if(typeof p.selected==='string')sound.selected=p.selected;
  if(p.rate>=.8&&p.rate<=1.15)sound.rate=Number(p.rate);
  if(p.pitch>=.85&&p.pitch<=1.2)sound.pitch=Number(p.pitch);
  if(p.mode==='ai'||p.mode==='device')sound.mode=p.mode;
  if(typeof p.endpoint==='string')sound.endpoint=p.endpoint.trim();
 }catch(e){}
 syncVoiceControls();refreshVoice();
}
loadVoice();
window.speechSynthesis?.addEventListener?.('voiceschanged',refreshVoice);
$('voiceSettings').addEventListener('toggle',()=>{if($('voiceSettings').open)refreshVoice()});
$('voiceMode').addEventListener('change',e=>{stopCurrentVoice();sound.mode=e.target.value;syncVoiceControls();saveVoice();if(sound.mode==='device')say('Hov hov! Nu bruger jeg telefonens stemme.')});
$('aiEndpoint').addEventListener('change',e=>{sound.endpoint=e.target.value.trim();stopCurrentVoice();saveVoice();aiStatus()});
$('voiceChoice').addEventListener('change',e=>{sound.selected=e.target.value;saveVoice();say('Hov hov! Jeg glæder mig til at lege med tallene!')});
$('voiceSpeed').addEventListener('input',e=>{sound.rate=Number(e.target.value);syncVoiceControls();saveVoice()});
$('voicePitch').addEventListener('input',e=>{sound.pitch=Number(e.target.value);syncVoiceControls();saveVoice()});
$('voicePreview').addEventListener('click',()=>{sound.endpoint=$('aiEndpoint').value.trim();saveVoice();say('Hov hov! Du står på syvogtyve. Er fireogtredive større eller mindre end syvogtyve?')});
$('brayPreview').addEventListener('click',playBray);
$('voiceToggle').addEventListener('click',()=>{sound.on=!sound.on;$('voiceToggle').textContent=sound.on?'🔊 Lyd til':'🔇 Lyd fra';$('voiceToggle').setAttribute('aria-pressed',String(sound.on));if(sound.on)say('Hov hov! Nu kan du høre mig!');else {stopCurrentVoice();bray?.pause()}});
$('testVoice').addEventListener('click',()=>say('Hov hov! Jeg er ÆselKlog, og jeg glæder mig til at spille med jer!'));
$('speakAgain').addEventListener('click',()=>say(sound.last||'Hov hov! Nu er det din tur.'));

function renderSetupPlayers(){
 const holder=$('playerInputs');holder.innerHTML='';
 setupPlayers.forEach((p,i)=>{
  const row=document.createElement('div');row.className='player-input';
  row.innerHTML=`<span class="player-dot" style="background:${COLORS[i]}"></span>
    <input type="text" aria-label="Navn for spiller ${i+1}" maxlength="24" value="${esc(p.name)}">
    <select aria-label="Alder for spiller ${i+1}" class="age-select">${Array.from({length:15},(_,j)=>`<option value="${j+3}" ${p.kind!=='adult'&&p.age===j+3?'selected':''}>${j+3} år</option>`).join('')}<option value="adult" ${p.kind==='adult'?'selected':''}>Voksen (18+)</option></select>
    <select class="difficulty ${p.kind==='adult'?'show':''}" aria-label="Sværhedsgrad for spiller ${i+1}"><option value="let" ${p.difficulty==='let'?'selected':''}>Let · 60 sek.</option><option value="mellem" ${p.difficulty==='mellem'?'selected':''}>Mellem · 30 sek.</option><option value="svaer" ${p.difficulty==='svaer'?'selected':''}>Svær · 10 sek.</option></select>
    <button type="button" class="remove-player" aria-label="Fjern spiller ${i+1}" title="Fjern spiller">×</button>`;
  const name=row.querySelector('input');name.addEventListener('input',e=>p.name=e.target.value);
  const age=row.querySelector('.age-select');age.addEventListener('change',e=>{
   p.kind=e.target.value==='adult'?'adult':'child';if(p.kind==='child')p.age=Number(e.target.value);
   row.querySelector('.difficulty').classList.toggle('show',p.kind==='adult');
  });
  row.querySelector('.difficulty').addEventListener('change',e=>p.difficulty=e.target.value);
  row.querySelector('.remove-player').addEventListener('click',()=>{if(setupPlayers.length>1){setupPlayers.splice(i,1);renderSetupPlayers()}});
  holder.append(row);
 });
 $('addPlayer').disabled=setupPlayers.length>=4;
}
renderSetupPlayers();
$('addPlayer').addEventListener('click',()=>{if(setupPlayers.length<4){setupPlayers.push({name:`Spiller ${setupPlayers.length+1}`,age:7,kind:'child',difficulty:'mellem'});renderSetupPlayers()}});
function show(view){['setup','game'].forEach(id=>$(id).classList.toggle('active',view===id));window.scrollTo({top:0,behavior:'instant'})}
function resetAsync(){gameToken++;clearInterval(taskTimer);taskTimer=null;busy=false;showDiceState=null;hideDice();if(boardExpanded)setBoardExpanded(false);stopCurrentVoice();bray?.pause();}
$('startButton').addEventListener('click',()=>{
 resetAsync();
 const raw=$('range').value,all=raw==='1-100';
 const start=all?0:Number(raw.split('-')[0])-1,goal=all?100:Number(raw.split('-')[1]);
 config={raw,all,start,goal,learning:radio('learning'),boardMode:radio('boardMode'),moveDice:radio('moveDice'),learnDice:radio('learnDice')};
 players=setupPlayers.map((p,i)=>({...p,name:(p.name||'').trim()||`Spiller ${i+1}`,color:COLORS[i],id:`player${i+1}`,isCPU:false,pos:start}));
 if($('cpuCheck').checked)players.push({name:'Æslet',kind:'cpu',age:8,color:'#c18b46',id:'cpu',isCPU:true,pos:start});
 turn=0;phase='move';challenge=null;pending=null;resultLines=[];winner=null;
 $('rangeTitle').textContent=all?'Hele Talstien · 1–100':`Talområde ${raw}`;
 $('boardModeLabel').textContent=config.boardMode==='physical'?'Fysisk bræt + app-overblik':'Digital spilleplade';
 show('game');buildBoard();render();setBoardExpanded(true);say(`Hov hov! Velkommen til Talstien. ${players[turn].name} starter!`);
});
$('newGame').addEventListener('click',()=>{if(window.confirm('Vil I afslutte spillet og starte forfra?')){resetAsync();phase='setup';show('setup')}});
$('editPos').addEventListener('click',()=>{
 if(busy||!config||phase==='win'||showDiceState)return;
 const p=players[turn];const requested=window.prompt(`Vælg felt for ${p.name}: ${config.start}–${config.goal}`,p.pos);
 if(requested===null)return;const n=Number(requested);if(!Number.isInteger(n)||n<config.start||n>config.goal)return window.alert('Vælg et felt inden for banen.');
 p.pos=n;render();scrollToTile(n,true);
});

function donkeySvg(color){
 // Originalt simpelt æselhoved. Pelsfarven kommer fra spillerens farve.
 return `<svg viewBox="0 0 64 64" class="donkey-svg" aria-hidden="true"><g stroke="#273449" stroke-width="3" stroke-linejoin="round"><path d="M12 25 7 5Q6 1 11 2L25 18M40 18 52 2Q57-1 56 6L51 25" fill="${color}"/><path d="M12 7 19 20 17 23 10 7M47 20 53 7 46 23" fill="#f5b7a9" stroke-width="1"/><path d="M10 31Q9 18 21 17L26 13 29 17 32 13 36 18Q56 14 56 36Q54 58 33 58Q10 57 10 31Z" fill="${color}"/><path d="M16 42Q16 35 32 36Q50 35 50 43Q50 57 33 57Q15 57 16 42Z" fill="#ffebdb"/><path d="M27 46Q24 43 22 48M40 46Q43 43 45 48" fill="none" stroke="#79574d" stroke-width="2"/><circle cx="23" cy="31" r="3.4" fill="#fff"/><circle cx="42" cy="31" r="3.4" fill="#fff"/><circle cx="23.6" cy="31.2" r="1.9" fill="#172c41" stroke="none"/><circle cx="41.5" cy="31.2" r="1.9" fill="#172c41" stroke="none"/><path d="M27 49Q32 53 38 49" fill="none" stroke="#673b36" stroke-width="2"/></g></svg>`;
}
// v0.8-A: En præcist optegnet, responsiv SVG-bane med 100 numre.
function boardPadding(){
 const b=$('board'),css=getComputedStyle(b);
 return {left:parseFloat(css.paddingLeft)||0,top:parseFloat(css.paddingTop)||0};
}
function buildBoard(){
 $('board').innerHTML=B.render(SPECIAL);
 setBoardZoom($('boardScroll').clientWidth>=700?.72:.68,{preserve:false});
 followActive=true;
 requestAnimationFrame(()=>scrollToTile(players[turn]?.pos??config.start,true));
}
function setBoardZoom(value,{preserve=true}={}){
 const sc=$('boardScroll'),svg=$('boardSvg');if(!svg||!sc)return;
 const old=boardPadding(),oldScale=boardScale;
 const worldX=(sc.scrollLeft+sc.clientWidth/2-old.left)/oldScale;
 const worldY=(sc.scrollTop+sc.clientHeight/2-old.top)/oldScale;
 boardScale=Math.max(.18,Math.min(2.2,value));
 svg.style.width=(B.WIDTH*boardScale)+'px';
 svg.style.height=(B.HEIGHT*boardScale)+'px';
 $('boardZoomValue').textContent=Math.round(boardScale*100)+' %';
 if(preserve){const pad=boardPadding();sc.scrollLeft=worldX*boardScale+pad.left-sc.clientWidth/2;sc.scrollTop=worldY*boardScale+pad.top-sc.clientHeight/2;}
}
function scrollToTile(n,force=false){
 if(!followActive&&!force)return;
 const sc=$('boardScroll');if(!sc)return;
 const p=B.position(Math.max(0,Math.min(100,n))),pad=boardPadding();
 // Hold aktivt æsel på venstre side, når opgavekortet dækker højre side.
 const panelWidth=boardExpanded&&!boardFitMode?$('boardPanelDock').getBoundingClientRect().width:0;
 const visibleCenterX=boardExpanded&&!boardFitMode?(sc.clientWidth-panelWidth)/2:sc.clientWidth/2;
 sc.scrollTo({left:Math.max(0,p.x*boardScale+pad.left-visibleCenterX),
   top:Math.max(0,p.y*boardScale+pad.top-sc.clientHeight/2),
   behavior:prefersLessMotion?'instant':'smooth'});
}
function coverBoard(){
 const sc=$('boardScroll');if(!sc)return;
 boardFitMode=false;$('boardBox').classList.remove('fit-view');followActive=true;
 // Beskær hellere lidt af verdenskanterne end at efterlade brede tomme striber.
 const cover=Math.max(sc.clientWidth/B.WIDTH,sc.clientHeight/B.HEIGHT);
 setBoardZoom(Math.max(.4,cover*1.045),{preserve:false});
 requestAnimationFrame(()=>scrollToTile(players[turn]?.pos??config.start,true));
}
function fitBoard(){
 const sc=$('boardScroll');if(!sc)return;
 followActive=false;boardFitMode=true;$('boardBox').classList.add('fit-view');
 const fit=Math.min((sc.clientWidth-6)/B.WIDTH,(sc.clientHeight-6)/B.HEIGHT);
 setBoardZoom(fit,{preserve:false});
 sc.scrollTo({left:0,top:0,behavior:'instant'});
}
function setBoardExpanded(expanded){
 boardExpanded=expanded;
 $('boardBox').classList.toggle('expanded',expanded);
 document.body.classList.toggle('board-expanded',expanded);
 $('boardExpand').hidden=expanded;
 $('boardClose').hidden=!expanded;
 $('boardExpand').setAttribute('aria-expanded',String(expanded));
 // Behold den eksisterende opgave-komponent og alle dens event listeners.
 (expanded?$('boardPanelDock'):$('turnPanelHome')).append($('turnPanel'));
 if(expanded){requestAnimationFrame(coverBoard)}
 else{$('boardBox').classList.remove('fit-view');boardFitMode=false;requestAnimationFrame(()=>scrollToTile(players[turn]?.pos??config.start,true));}
 updateBoardHud();
}
function updateBoardHud(){
 const p=players[turn];if(!p)return;
 $('boardHudDot').style.background=p.color;
 $('boardHudName').textContent=phase==='win'?'🏆 Vinder: '+winner.name:(p.isCPU?'🫏 ':'')+p.name+'s tur';
 $('boardHudPosition').textContent=(p.pos===config?.start?'START':`Felt ${p.pos}`)+
  ' · '+({move:'Slå terningen',learn:'Læringsterning',question:'Svar på opgaven',moving:'Æslet hopper',feedback:'Svar afgjort',result:'Næste spiller',swap:'Byt felt',win:'MÅL!'}[phase]||'Spil');
 $('boardPanelDock').dataset.phase=phase;
}
$('boardRepeat').addEventListener('click',()=>say(sound.last||`Nu er det ${players[turn]?.name||'din'} tur.`));
window.addEventListener('resize',()=>{
 if(!boardExpanded)return;
 // Reskalér efter mobilens rotation og bevar automatisk fokus på aktivt æsel.
 requestAnimationFrame(()=>{if(boardFitMode)fitBoard();else coverBoard();});
});
$('boardExpand').addEventListener('click',()=>setBoardExpanded(true));
$('boardClose').addEventListener('click',()=>setBoardExpanded(false));
$('boardZoomIn').addEventListener('click',()=>{boardFitMode=false;$('boardBox').classList.remove('fit-view');setBoardZoom(boardScale*1.25);scrollToTile(players[turn]?.pos??config.start,true);});
$('boardZoomOut').addEventListener('click',()=>{boardFitMode=false;$('boardBox').classList.remove('fit-view');setBoardZoom(boardScale/1.25);scrollToTile(players[turn]?.pos??config.start,true);});
$('boardFit').addEventListener('click',fitBoard);
$('boardFollow').addEventListener('click',()=>{
 if(boardFitMode){boardFitMode=false;$('boardBox').classList.remove('fit-view');}
 followActive=true;
 if(boardScale<.52)setBoardZoom(.78,{preserve:false});
 scrollToTile(players[turn]?.pos??config.start,true);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&boardExpanded)setBoardExpanded(false)});
// Knib-til-zoom på telefon. Enkelt fingertræk panorerer naturligt i scrollområdet.
let pinchStart=null;
$('boardScroll').addEventListener('touchstart',e=>{
 if(e.touches.length===2){
  const [a,b]=e.touches;
  pinchStart={distance:Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY),scale:boardScale};
 }
},{passive:true});
$('boardScroll').addEventListener('touchmove',e=>{
 if(e.touches.length===2&&pinchStart){
  e.preventDefault();followActive=false;
  const [a,b]=e.touches;
  const d=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
  boardFitMode=false;$('boardBox').classList.remove('fit-view');setBoardZoom(pinchStart.scale*d/Math.max(1,pinchStart.distance));
 }
},{passive:false});
$('boardScroll').addEventListener('touchend',e=>{if(e.touches.length<2)pinchStart=null},{passive:true});
function boardTokens(){
 const byPos=new Map();
 players.forEach(p=>{if(!byPos.has(p.pos))byPos.set(p.pos,[]);byPos.get(p.pos).push(p)});
 const tags=[];
 byPos.forEach((ps,n)=>{
  const c=B.position(n);
  ps.forEach((p,i)=>{
   const dx=(i-(ps.length-1)/2)*18;
   const dy=(i%2)*-7;
   const focused=p.id===players[turn]?.id;
   tags.push(`<g class="board-piece ${p.moving?'piece-hop':''}${focused?' is-active':''}" transform="translate(${(c.x+dx-20).toFixed(1)} ${(c.y+dy-62).toFixed(1)})">
    <circle cx="20" cy="20" r="23" fill="#fffef9" stroke="${p.color}" stroke-width="4"/>
    ${donkeySvg(p.color).replace('class="donkey-svg"','class="donkey-svg board-token-icon" x="0" y="0" width="40" height="40"')}
   </g>`);
  });
 });
 return tags.join('');
}
function drawBoard(){
 if(!config)return;
 for(let n=1;n<=100;n++){
  const t=$(`tile-${n}`);if(!t)continue;
  t.classList.toggle('outside',!config.all&&(n<=config.start||n>config.goal));
  t.classList.toggle('current',n===players[turn]?.pos);
  t.classList.toggle('landing-target',Boolean(pending&&(pending.target??pending.landing)===n&&phase!=='moving'));
 }
 const layer=$('boardPlayers');if(layer)layer.innerHTML=boardTokens();
}
function drawScores(){
 $('scores').innerHTML=players.map((p,i)=>`<div class="score-card ${i===turn?'active':''}"><span class="mini-donkey" style="--fur:${p.color}">${donkeySvg(p.color)}</span><div><strong>${esc(p.name)}</strong><div class="meta">${p.isCPU?'Computer':p.kind==='adult'?`Voksen · ${p.difficulty==='svaer'?'Svær':p.difficulty==='let'?'Let':'Mellem'}`:`${p.age} år`}</div></div><div style="margin-left:auto;text-align:right"><span class="pos">${p.pos===config.start?'START':p.pos}</span><div class="meta">felt</div></div></div>`).join('');
}
function btn(label,action,style='main'){return `<button type="button" class="btn ${style}" data-act="${action}">${label}</button>`}
function render(){
 if(!config)return;
 drawScores();drawBoard();updateBoardHud();const p=players[turn];
 $('turnTitle').textContent=phase==='win'?'🏆 Talstien er gennemført!':`${p.isCPU?'🫏 ':''}${p.name}s tur`;
 $('turnSubtitle').textContent=phase==='win'?'Hov hov! Vi har en vinder!':`${p.name} står på ${p.pos===config.start?'START':`felt ${p.pos}`} · målet er ${config.goal}.`;
 const panel=$('turnPanel');
 if(phase==='win'){
  panel.innerHTML=`<div class="finish"><div class="donkey">🏆🫏</div><h2>Hov hov! ${esc(winner.name)} vandt!</h2><p>Flot klaret på Talstien!</p>${btn('Spil igen','restart')}</div>`;return;
 }
 if(phase==='move'){
  panel.innerHTML=`<h2>🎲 ${p.isCPU?'Nu slår Æslet terningen':`${esc(p.name)}, slå terningen`}</h2><p class="hint">${p.isCPU?'Æslets terning bliver også kastet og vist på skærmen.':config.moveDice==='physical'?'Kast din fysiske terning, og tryk på det antal øjne, du slog.':'Terningen fylder hele skærmen, når du slår.'}</p>${p.isCPU?'<p class="cpu-note">🫏 Vent et øjeblik – Æslet gør sig klar til sit slag …</p>':config.moveDice==='digital'?btn('🎲 Vis terningen','roll'):`<div class="dice-options">${[1,2,3,4,5,6].map(n=>`<button type="button" data-act="move-${n}">${n}</button>`).join('')}</div>`}`;
  return;
 }
 if(phase==='learn'){
  panel.innerHTML=`<h2>🧠 Læringsterning</h2><p class="hint">${esc(p.name)} slog ${pending.roll} og skal til felt <strong>${pending.landing}</strong>. Æslet har først hoppet til feltet. Nu kommer opgaven.</p>${p.isCPU?'<p class="cpu-note">🫏 Æslet slår også læringsterningen …</p>':config.learnDice==='physical'?`<p class="hint">Kast den fysiske læringsterning, og tryk på det viste ikon:</p><div class="learning-options">${S.TASKS.map((t,i)=>`<button data-act="task-${i+1}" type="button"><span class="ico">${t.short}</span>${esc(t.name)}</button>`).join('')}</div>`:btn('🎲 Vis læringsterningen','rollLearn')}${p.isCPU?'':`<div class="voicebar">${btn('Spring opgaven over','skip','soft')}</div>`}`;
  return;
 }
 if(phase==='question'){
  panel.innerHTML=`<h2>🫏 ${p.isCPU?'Æslet tænker …':'Æslet spørger!'}</h2><span class="age-chip">${esc(challenge.tier)} ${p.kind==='adult'?'· Tid på opgaven':'· Uden tidsgrænse'}</span><div class="prompt ${p.kind==='child'&&p.age<=4?'early':''}"><div class="tiny">${esc(S.TASKS[challenge.type-1].name)} · felt ${p.pos}</div><h3>${esc(challenge.question)}</h3>${challenge.adapted?'<p class="hint">Opgaven er gjort lettere til dit niveau.</p>':''}</div>
   ${!p.isCPU&&p.kind==='adult'?`<div class="question-time" id="questionTime"><span>⏱️ Du har</span><strong id="clock" class="clock-big">${challenge.timeLimit||30} sek.</strong><div class="time-track"><div id="timeFill" class="time-fill"></div></div></div>`:''}
   <div class="choices">${challenge.options.map((opt,i)=>`<button class="choice ${p.kind==='child'&&p.age<=4?'early':''}" ${p.isCPU?'disabled':''} data-act="answer-${i}">${esc(opt)}</button>`).join('')}</div>
   ${p.isCPU?'<p class="hint">Æslet prøver selv – det kan også svare forkert!</p>':`<div class="voicebar">${btn('🔊 Læs op','read','soft')} ${btn('💡 Få et tip','help','soft')}</div><div id="tip" class="help" hidden>${esc(challenge.help)}</div>`}`;
  return;
 }
 if(phase==='feedback'){
  const good=pending.correct;
  panel.innerHTML=`<div class="feedback ${good?'':'error'}"><h2>${good?'✅ Godt svaret!':'🫏 Iiiih-åååh! Iiiih-åååh!'}</h2><p>${esc(pending.feedback)}</p><p class="hint">${p.isCPU?'Æslet skal også hoppe på banen.':'Nu ser vi om du får et ekstra skridt …'}</p></div>`;return;
 }
 if(phase==='moving'){
  panel.innerHTML=`<div class="move-message"><div class="moving-donkey" style="--fur:${p.color}">${donkeySvg(p.color)}</div><div><h2>Hop, hop, hop! 🥕</h2><p id="moveProgress">${esc(p.name)} hopper fra felt ${p.pos} mod felt ${pending?.target??pending?.landing??'?'} …</p><p class="hint">Følg det farvede æsel, mens det hopper felt for felt.</p></div></div>`;return;
 }
 if(phase==='swap'){
  const others=players.filter((_,i)=>i!==turn);
  panel.innerHTML=`<h2>🔄 Byt felt!</h2><p class="hint">Du landede på Byt. Vælg en anden spiller eller behold din plads.</p><div class="choices">${others.map(o=>`<button class="choice" data-act="swap-${esc(o.id)}">${esc(o.name)} · felt ${o.pos}</button>`).join('')}</div><div class="voicebar">${btn('Behold min plads','swap-none','soft')}</div>`;return;
 }
 if(phase==='result'){
  panel.innerHTML=`<h2>✨ Sådan gik turen</h2><p class="result-text">${esc(resultLines.join('\n'))}</p>${btn('Næste spiller →','next')}`;return;
 }
}

function diceIcon(type){return LEARN_DIE[type-1]||'⭐'}
function showDie(kind){
 if(showDiceState||!config)return;
 const p=players[turn],auto=p.isCPU;showDiceState={kind,auto,rolling:false};
 const ov=$('diceOverlay');ov.hidden=false;document.body.classList.add('dice-open');
 $('diceTitle').textContent=kind==='move'?`${p.name} · almindelig terning`:`${p.name} · læringsterning`;
 $('dicePrompt').textContent=auto?'🫏 Æslet gør klar til at kaste!':'Tryk på terningen for at slå!';
 $('dicePips').hidden=kind!=='move';$('diceLearnIcon').hidden=kind==='move';
 $('dicePips').className='dice-face face-1';$('diceLearnIcon').textContent='1 2 3';
 $('diceMain').classList.remove('is-rolling');$('diceMain').disabled=auto;
 $('diceCancel').hidden=auto;
 const g=gameToken;
 if(auto)setTimeout(()=>{if(g===gameToken&&showDiceState&&!showDiceState.rolling)animateDie()},650);
}
function hideDice(){
 $('diceOverlay').hidden=true;document.body.classList.remove('dice-open');$('diceMain').classList.remove('is-rolling');
}
function cancelDie(){if(!showDiceState||showDiceState.auto||showDiceState.rolling)return;showDiceState=null;hideDice();}
$('diceCancel').addEventListener('click',cancelDie);
$('diceMain').addEventListener('click',animateDie);
async function animateDie(){
 const state=showDiceState;if(!state||state.rolling)return;
 state.rolling=true;$('diceMain').disabled=true;
 const kind=state.kind,g=gameToken,final=rand(1,6);
 // Ens synlig animation for både rigtige spillere og CPU.
 $('dicePrompt').textContent='Terningen hopper …';
 $('diceMain').classList.remove('is-rolling');void $('diceMain').offsetWidth;$('diceMain').classList.add('is-rolling');
 const start=Date.now();
 while(Date.now()-start<1250){
  const temporary=rand(1,6);
  if(kind==='move')$('dicePips').className=`dice-face face-${temporary}`;
  else $('diceLearnIcon').textContent=diceIcon(temporary);
  await defer(95);
  if(g!==gameToken)return;
 }
 if(kind==='move')$('dicePips').className=`dice-face face-${final}`;
 else $('diceLearnIcon').textContent=diceIcon(final);
 $('diceMain').classList.remove('is-rolling');
 $('dicePrompt').textContent=kind==='move'?`🎲 ${final} øjne!`:`🧠 ${S.TASKS[final-1].name}`;
 await defer(950);if(g!==gameToken)return;
 showDiceState=null;hideDice();
 if(kind==='move')receiveMoveRoll(final);else receiveLearnRoll(final);
}
function receiveMoveRoll(roll){
 if(phase!=='move'||busy)return;
 const p=players[turn],landing=Math.min(config.goal,p.pos+roll);
 pending={from:p.pos,roll,landing,target:landing,correct:false,feedback:'',skip:false};
 resultLines=[`${p.name} slog ${roll}: ${p.pos===config.start?'START':p.pos} → ${landing}.`];
 void moveFirst();
}
async function moveFirst(){
 if(busy||!pending)return;
 const g=gameToken,p=players[turn];
 busy=true;phase='moving';render();
 await hopSteps(p,pending.landing);
 if(g!==gameToken)return;
 busy=false;
 if(p.pos>=config.goal){declareWin(p);return;}
 const wantsTask=config.learning==='udfordring'||(config.learning==='laer'&&Boolean(SPECIAL[p.pos]));
 if(wantsTask){
  phase='learn';render();say(`${p.name} er landet på felt ${p.pos}. Nu kommer læringsterningen!`);
  if(p.isCPU)scheduleCPU('learn');
 }else void resolveLandingAction();
}
function receiveLearnRoll(type){
 if(phase!=='learn'||busy)return;
 const p=players[turn];
 challenge=S.makeChallenge({player:p,type,field:p.pos,roll:pending.roll});
 phase='question';render();say(`${p.name}! ${challenge.question}`);
 if(p.isCPU)scheduleCPU('question');else startAdultTimer();
}
function startAdultTimer(){
 clearInterval(taskTimer);const p=players[turn];if(p.kind!=='adult'||phase!=='question')return;
 const sec=challenge.timeLimit||30;taskDeadline=Date.now()+sec*1000;
 taskTimer=setInterval(()=>{
  if(phase!=='question'){clearInterval(taskTimer);return;}
  const remaining=Math.max(0,taskDeadline-Date.now());const s=Math.ceil(remaining/1000);
  if($('clock'))$('clock').textContent=`${s} sek.`;
  if($('timeFill'))$('timeFill').style.width=(remaining/(sec*1000)*100)+'%';
  if($('questionTime'))$('questionTime').classList.toggle('urgent',s<=5);
  if(remaining<=0){clearInterval(taskTimer);processAnswer(null,true)}
 },100);
}
function processAnswer(idx,timedOut=false){
 if(phase!=='question')return;
 clearInterval(taskTimer);taskTimer=null;
 const p=players[turn],got=idx===null?null:challenge.options[idx];
 const correct=!timedOut&&got===challenge.correct;
 pending.correct=correct;
 pending.feedback=timedOut?`Tiden løb ud! Det rigtige svar var ${challenge.correct}.`:
    correct?`Det er rigtigt, ${p.name}! Du får ét ekstra skridt.`:`${p.name} svarede ${got}. Det rigtige svar var ${challenge.correct}.`;
 resultLines.push(correct?'✅ Rigtigt svar: +1 felt.':timedOut?'⏱️ Tiden gik! Intet ekstra felt.':'🫏 Forkert svar: intet ekstra felt.');
 phase='feedback';render();if(!correct)playBray();else say(`${p.name}, det er rigtigt. Godt klaret!`);
 const g=gameToken;
 setTimeout(()=>{if(g===gameToken&&phase==='feedback')void finishLearning()},correct?1000:(sound.on?3550:850));
}
function skipChallenge(){if(phase!=='learn')return;pending.skip=true;pending.correct=false;resultLines.push('Opgaven blev sprunget over.');void finishLearning()}
async function hopSteps(p,to,speed=245){
 const g=gameToken;
 const goal=Math.max(config.start,Math.min(config.goal,to));
 if(p.pos===goal)return;
 const direction=goal>p.pos?1:-1;
 // Den farvede æselbrik opdateres for hvert enkelt nummer på den digitale bane.
 while(p.pos!==goal){
  if(g!==gameToken||!config)return;
  p.pos+=direction;p.moving=true;drawScores();drawBoard();updateBoardHud();scrollToTile(p.pos);
  const el=$('moveProgress');if(el)el.textContent=`🫏 ${p.name}: felt ${p.pos} af ${goal}`;
  await defer(prefersLessMotion?35:speed);
 }
 p.moving=false;drawBoard();updateBoardHud();
}
async function finishLearning(){
 if(!pending||busy)return;
 const g=gameToken,p=players[turn];busy=true;
 if(pending.correct){
  pending.target=Math.min(config.goal,p.pos+1);
  phase='moving';render();
  await hopSteps(p,pending.target,310);
  if(g!==gameToken)return;
 }
 busy=false;
 if(p.pos>=config.goal){declareWin(p);return;}
 void resolveLandingAction();
}
async function resolveLandingAction(){
 if(!pending||busy)return;
 const g=gameToken,p=players[turn],special=SPECIAL[p.pos];
 busy=true;
 if(special==='bonus'||special==='hov'||special==='mester'){
  const effect=special==='bonus'?2:special==='hov'?-2:1;
  resultLines.push(special==='bonus'?'⭐ Bonus: +2 felter.':special==='hov'?'🫏 Hov hov!: −2 felter.':'🏆 Talmester: +1 felt.');
  pending.target=Math.max(config.start,Math.min(config.goal,p.pos+effect));
  phase='moving';render();
  if(special==='hov')say(`${p.name}, hov hov! Du skal to felter tilbage!`);
  await hopSteps(p,pending.target);
  if(g!==gameToken)return;
 }
 if(g!==gameToken)return;
 busy=false;
 if(p.pos>=config.goal){declareWin(p);return;}
 if(special==='byt'&&players.length>1){
  if(p.isCPU){
   const o=players.filter(x=>x!==p).sort((a,b)=>b.pos-a.pos)[0];
   if(o&&o.pos>p.pos){const target=o.pos,old=p.pos;resultLines.push(`🔄 Æslet byttede plads med ${o.name}.`);
    p.pos=target;o.pos=old;drawBoard();drawScores();updateBoardHud();scrollToTile(target);await defer(650);
    if(g!==gameToken)return;
   }else resultLines.push('🔄 Æslet blev på sit felt.');
  }else{phase='swap';render();return;}
 }
 if(p.pos>=config.goal){declareWin(p);return;}
 phase='result';render();say(`Hov hov! ${p.name} er nu på felt ${p.pos}.`);
}
async function swapWith(playerId){
 if(phase!=='swap'||busy)return;
 const p=players[turn],other=players.find(x=>x.id===playerId);
 if(!other||other===p)return;
 let a=p.pos;p.pos=other.pos;other.pos=a;
 drawScores();drawBoard();scrollToTile(p.pos);
 resultLines.push(`🔄 Byttede plads med ${other.name}.`);
 if(p.pos>=config.goal){declareWin(p);return;}
 phase='result';render();say(`Hov hov! I byttede pladser.`);
}
function declareWin(p){winner=p;phase='win';render();say(`Hov hov! Tillykke ${p.name}! Du vandt ÆselKlog Talstien!`)}
function nextTurn(){
 if(busy||phase!=='result')return;
 turn=(turn+1)%players.length;phase='move';pending=null;challenge=null;resultLines=[];
 render();say(`Hov hov! Nu er det ${players[turn].name}s tur.`);
 if(players[turn].isCPU)scheduleCPU('move');
}
function scheduleCPU(which){
 const g=gameToken;
 if(which==='question'){
  setTimeout(()=>{if(g!==gameToken||phase!=='question'||!players[turn].isCPU)return;
    const pass=Math.random()>.30;const idx=pass?challenge.options.indexOf(challenge.correct):challenge.options.findIndex(v=>v!==challenge.correct);
    processAnswer(idx);
  },2300);
 }else{
  setTimeout(()=>{if(g===gameToken&&phase===which&&players[turn].isCPU)showDie(which)},800);
 }
}
$('turnPanel').addEventListener('click',e=>{
 const target=e.target.closest('button[data-act]');if(!target||busy||showDiceState)return;
 const a=target.dataset.act;
 if(a==='roll'&&phase==='move')showDie('move');
 else if(a.startsWith('move-')&&phase==='move')receiveMoveRoll(Number(a.slice(5)));
 else if(a==='rollLearn'&&phase==='learn')showDie('learn');
 else if(a.startsWith('task-')&&phase==='learn')receiveLearnRoll(Number(a.slice(5)));
 else if(a.startsWith('answer-')&&phase==='question')processAnswer(Number(a.slice(7)));
 else if(a==='read'&&phase==='question')say(challenge.question);
 else if(a==='help'&&phase==='question'){$('tip').hidden=!$('tip').hidden;say(challenge.help)}
 else if(a==='skip')skipChallenge();
 else if(a.startsWith('swap-')&&phase==='swap')swapWith(a.slice(5));
 else if(a==='swap-none'&&phase==='swap'){resultLines.push('🔄 Ingen bytte.');phase='result';render()}
 else if(a==='next')nextTurn();
 else if(a==='restart'){resetAsync();phase='setup';show('setup')}
});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
