/* ÆselKlog v0.9.19: original CPU-stemme og fælles lydvalg; CC0-MP3 i begge spil. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const qs=sel=>document.querySelector(sel);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COLORS=['#d84464','#227fcb','#24a667','#9361c9','#d69c34','#258f9d'];
const S=window.AeselEngine;
const B=window.AeselBoard;
if(!B||!B.validate()){document.body.textContent='ÆselKlog kan ikke starte: board.js mangler eller har ugyldige felter.';return;}
if(!S){document.body.textContent='ÆselKlog kan ikke starte: engine.js mangler.';return;}
const L=window.AeselLeaderboard;
const G=window.AeselSave;
const P=window.AeselAdaptive;
const LP=window.AeselProfiles;
const PR=window.AeselParentReport;
const CV=window.AeselCpuVoice;
const N=window.AeselNarration;
const VC=window.AeselVoiceCache;
if(!G||!P||!LP||!PR||!CV||!VC||!N){document.body.textContent='ÆselKlog kan ikke starte: et af spillets moduler mangler.';return;}
const A=window.AeselActions;
if(!A||!A.validate()){document.body.textContent='ÆselKlog kan ikke starte: actions.js mangler eller har ugyldige felter.';return;}
let SPECIAL=A.FIELDS; // Den gamle bane bruges kun til eksisterende gemninger uden eget layout.
const SPECIAL_ICON=Object.fromEntries(Object.entries(A.DETAILS).map(([key,d])=>[key,d.icon]));
const AF=window.AeselActionFX; // Præsentation alene; ingen ekstra AI-kald eller turændringer.
const LEARN_DIE=['1 2 3','L / U','10 + 1','👑','> <','+ −'];
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const radio=name=>qs(`input[name="${name}"]:checked`)?.value;
const defer=(ms)=>new Promise(ok=>setTimeout(ok,ms));
// Public Cloudflare Worker address (never a secret). API key remains exclusively in Cloudflare.
const AI_VOICE_BASE='https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev';
const AI_TTS_ENDPOINT=AI_VOICE_BASE+'/tts';
const AI_VOICES_ENDPOINT=AI_VOICE_BASE+'/voices';
const NUM=window.AeselNumbers;
const NUMBER_LANGUAGE_KEY='aeselklog-tal-sprog-v1';
let numberLanguage='da';try{numberLanguage=NUM.normalize(localStorage.getItem(NUMBER_LANGUAGE_KEY))}catch(_){}
let lastSpokenNumber=null;
const sound={on:true,last:'',lastCPU:false,selected:'auto',rate:1,pitch:1,mode:'ai',aiVoice:'mia',cpuVoice:'auto'};
const voiceKey='aeselklog-voice-v03';
let aiVoices=[{id:'mia',name:'Mia – varm dansk fortæller'}],aiVoicesLoadedAt=0,aiVoiceLoading=null;
let setupPlayers=[{name:'Spiller 1',age:6,kind:'child',difficulty:'mellem'},{name:'Spiller 2',age:8,kind:'child',difficulty:'mellem'}];
let players=[],config=null,turn=0,phase='setup',challenge=null,pending=null,resultLines=[],winner=null;
let busy=false,gameToken=0,showDiceState=null,taskTimer=null,taskDeadline=0,taskPausedAt=null;
let extraRollUsed=false,actionBannerSerial=0;
let resumeAdultMs=null,helpUsed=false,restoringGame=false,lastSaveOk=null,saveStatusTimer=null;
let lastNarration=Promise.resolve();
let exitDialogActive=false;
let activeVoiceDone=null;
const PACE={normal:{hop:380,rest:240,roll:1100},rolig:{hop:630,rest:460,roll:1450},ekstra:{hop:900,rest:800,roll:1800}};
function pace(){return PACE[config?.pace]||PACE.rolig;}
function pauseBeat(){return defer(prefersLessMotion?120:pace().rest);}
// A game may be interrupted by calls or screen locks. Do not let CPU actions
// or animations rush ahead while the tab/app is in the background.
function waitUntilVisible(){
 if(!document.hidden&&!exitDialogActive)return Promise.resolve();
 return new Promise(resolve=>{
  const visible=()=>{
   if(!document.hidden&&!exitDialogActive){
    document.removeEventListener('visibilitychange',visible);
    document.removeEventListener('aeselklog-exit-resume',visible);
    resolve();
   }
  };
  document.addEventListener('visibilitychange',visible);
  document.addEventListener('aeselklog-exit-resume',visible);
 });
}
const prefersLessMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let boardScale=0.73,followActive=true,boardExpanded=false,boardFitMode=false;
let bray=null;
try{bray=new Audio('./donkey-bray.wav');bray.preload='auto';bray.volume=.78;}catch(e){}

// AI-tale kræver HTTPS-stemmetjeneste. API-nøglen findes ALDRIG på telefonen.
let speechSerial=0,aiFetch=null,aiSource=null,aiHtmlAudio=null,audioContext=null;
// Ved fejl bruger vi kortvarigt telefonstemmen uden at ændre brugerens valgte AI-stemme.
let aiRetryAfter=0;
const AI_RETRY_COOLDOWN_MS=60_000;
const speechCache=new Map(); // 24 klip i RAM under spillet.
// Kun de faste, anonyme udsagn i voicecache.js må gemmes permanent.
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
 $('aiVoiceControls').hidden=sound.mode!=='ai';
 renderAIVoices();
 renderCPUVoices();
 $('deviceVoiceControls').hidden=sound.mode==='ai';
 $('voiceAvailability').hidden=sound.mode==='ai';
 aiStatus();
}
function aiStatus(message){
 $('aiVoiceStatus').textContent=message||'AI-stemme er klar til prøve. Mia er standardstemme.';
}
function renderCPUVoices(){
 const select=$('cpuVoiceChoice'),value=sound.cpuVoice;
 if(!select)return;
 const original=CV.ORIGINAL_VOICE_ID;
 const ordered=[...aiVoices].sort((a,b)=>Number(b.id===original)-Number(a.id===original));
 const opts=[{id:'auto',name:'Automatisk · ÆselKlog-original hvis tilgængelig'},...ordered.map(v=>v.id===original?{...v,name:'🫏 ÆselKlog – original stemme'}:v)];
 select.replaceChildren(...opts.map(v=>{const el=document.createElement('option');el.value=v.id;el.textContent=v.name;return el}));
 if(opts.some(v=>v.id===value))select.value=value;
 else if(aiVoicesLoadedAt){sound.cpuVoice='auto';select.value='auto';saveVoice()}
 else select.value='auto';
}
function renderAIVoices(){
 const select=$('aiVoiceChoice');
 const value=sound.aiVoice;
 select.replaceChildren(...aiVoices.map(v=>{
  const option=document.createElement('option');option.value=v.id;option.textContent=v.name;return option;
 }));
 if(aiVoices.some(v=>v.id===value))select.value=value;
 else if(aiVoicesLoadedAt){sound.aiVoice='mia';select.value='mia';saveVoice()}
 else select.value='mia'; // Preserve a saved alternative until /voices finishes loading.
}
async function loadAIVoices(force=false){
 if(aiVoiceLoading)return aiVoiceLoading;
 if(!force&&aiVoicesLoadedAt&&Date.now()-aiVoicesLoadedAt<3*60*1000)return;
 aiStatus('Henter tilgængelige danske stemmer…');
 aiVoiceLoading=(async()=>{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetch(AI_VOICES_ENDPOINT,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error('HTTP '+response.status);
   const data=await response.json();
   if(!Array.isArray(data.voices))throw new Error('Ingen stemmeliste');
   const voices=[{id:'mia',name:'Mia – varm dansk fortæller'}];
   for(const voice of data.voices.slice(0,35)){
    if(!voice||typeof voice.id!=='string'||typeof voice.name!=='string'||!/^[a-zA-Z0-9_-]{1,50}$/.test(voice.id))continue;
    const name=voice.name.trim().slice(0,65);
    if(name&&!voices.some(v=>v.id===voice.id))voices.push({id:voice.id,name});
   }
   aiVoices=voices;aiVoicesLoadedAt=Date.now();renderAIVoices();renderCPUVoices();
   aiStatus(voices.length>1?`${voices.length} AI-stemmer tilgængelige. Vælg en, og tryk Prøv valgt stemme.`:
    (typeof data.hint==='string'&&data.hint.length<180?data.hint:'Mia er klar. Andre stemmer kan tilføjes i ElevenLabs.'));
  }catch(error){
   aiVoices=[{id:'mia',name:'Mia – varm dansk fortæller'}];renderAIVoices();renderCPUVoices();
   aiStatus('Kun Mia vises lige nu. Opdater Cloudflare Worker for flere stemmer. ('+error.message+')');
  }finally{clearTimeout(timeout);aiVoiceLoading=null}
 })();
 return aiVoiceLoading;
}
function saveVoice(){
 try{localStorage.setItem(voiceKey,JSON.stringify({selected:sound.selected,rate:sound.rate,pitch:sound.pitch,mode:sound.mode,aiVoice:sound.aiVoice,cpuVoice:sound.cpuVoice}))}catch(e){}
}
function stopCurrentVoice(){
 window.AeselOfflineNumbers?.stop?.();
 speechSerial++;
 // Løs også de afventende Promise'er ved en afbrudt tale, så CPU aldrig fryser.
 if(activeVoiceDone){const done=activeVoiceDone;activeVoiceDone=null;done();}
 if(aiFetch){aiFetch.abort();aiFetch=null}
 if(aiSource){try{aiSource.stop()}catch(e){}aiSource.disconnect();aiSource=null}
 if(aiHtmlAudio){aiHtmlAudio.pause();if(aiHtmlAudio._blobUrl)URL.revokeObjectURL(aiHtmlAudio._blobUrl);aiHtmlAudio.src='';aiHtmlAudio=null}
 try{window.speechSynthesis?.cancel?.()}catch(e){}
}
function waitForPlayback(begin,maxMs){
 return new Promise(resolve=>{
  let finished=false,timer;
  const finish=()=>{
   if(finished)return;
   finished=true;clearTimeout(timer);
   if(activeVoiceDone===finish)activeVoiceDone=null;
   resolve();
  };
  activeVoiceDone=finish;
  timer=setTimeout(finish,maxMs);
  try{begin(finish)}catch(e){console.warn('Oplæsning kunne ikke afspilles',e);finish()}
 });
}
function speakLocally(text,{cpu=false,language='da-DK'}={}){
 if(!('speechSynthesis' in window)||!sound.on)return Promise.resolve();
 try{
  const sentence=normalizedSpeech(text);
  const u=new SpeechSynthesisUtterance(sentence);
  u.lang=language;u.rate=cpu?Math.min(1.15,sound.rate*1.04):sound.rate;u.pitch=cpu?Math.min(1.5,sound.pitch*1.17):sound.pitch;
  const ds=language==='da-DK'?danishVoices():voiceOptions().filter(v=>(v.lang||'').slice(0,2)===language.slice(0,2));const narrator=ds.find(v=>(v.voiceURI||v.name)===sound.selected)||ds.find(v=>/premium|enhanced/i.test(v.name))||ds.find(v=>v.default)||ds[0]||null;
  u.voice=cpu?(ds.find(v=>v!==narrator)||narrator):narrator;
  return waitForPlayback(done=>{u.onend=done;u.onerror=done;speechSynthesis.speak(u)},Math.min(28000,4000+sentence.length*160));
 }catch(e){console.warn('Lokal oplæsning kunne ikke starte',e);return Promise.resolve()}
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
async function speakAI(text,id,{cpu=false,strictVoice=false,boost=1,voiceOverride=null,language='da-DK'}={}){
 const endpoint=AI_TTS_ENDPOINT;
 // Brug det faktisk valgte ID (inkl. CPU'ens eget valg), ikke rollen eller standardnavnet.
 const voiceId=voiceOverride||(cpu?CV.chooseVoice(aiVoices,sound.aiVoice,sound.cpuVoice):sound.aiVoice);
 const clip={endpoint,voiceId,text};
 const key=endpoint+'|'+voiceId+'|'+text;
 let bytes=null,downloaded=false,fromStoredCache=false;
 try{
  if(speechCache.has(key))bytes=speechCache.get(key);
  else if(VC.isSafePhrase(text)){
   bytes=await VC.get(clip);
   fromStoredCache=!!bytes;
   if(bytes){speechCache.set(key,bytes);if(speechCache.size>24)speechCache.delete(speechCache.keys().next().value)}
  }
  // Appen kan være skiftet til en ny tur/stemme, mens IndexedDB blev læst.
  if(id!==speechSerial||!sound.on)return;
  if(!bytes){
   // Lokal cache kontrolleres FØR offline/cooldown – gemte AI-lyde virker også uden net.
   if(navigator.onLine===false||Date.now()<aiRetryAfter){
    aiStatus('🫏 Denne oplæsning er ikke gemt. Telefonens stemme bruges midlertidigt.');
    if(strictVoice){aiStatus('⚠️ Den valgte AI-stemme er midlertidigt utilgængelig. Prøv Læs igen.');document.getElementById('talkortVoiceInfo')?.replaceChildren(document.createTextNode('⚠️ Spillelederens stemme er midlertidigt utilgængelig. Tryk Læs igen.'));return;}
    return speakLocally(text,{cpu,language});
   }
   const abort=new AbortController();aiFetch=abort;
   const timeout=setTimeout(()=>abort.abort(),25000);
   try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice:voiceId}),signal:abort.signal,cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    if(!String(response.headers.get('Content-Type')||'').includes('audio/'))throw new Error('Svaret indeholdt ikke lyd');
    bytes=await response.arrayBuffer();
   }finally{clearTimeout(timeout)}
   if(bytes.byteLength<500||bytes.byteLength>2_500_000)throw new Error('Lydfilens størrelse var ugyldig');
   if(id!==speechSerial||!sound.on)return;
   downloaded=true;
   speechCache.set(key,bytes);if(speechCache.size>24)speechCache.delete(speechCache.keys().next().value);
  }
  if(id!==speechSerial||!sound.on)return;
  const chosen=aiVoices.find(v=>v.id===voiceId)?.name||'valgt AI-stemme';
  const cacheLabel=fromStoredCache?'Gemte AI-lyde afspilles':'AI-lyd afspilles';
  const ctx=ensureAudioContext();
  if(ctx){
   if(ctx.state==='suspended')await ctx.resume();
   const decoded=await ctx.decodeAudioData(bytes.slice(0));
   if(id!==speechSerial||!sound.on)return;
   // Gem først når lyden er valideret af dekoderen. Fejlende lyd må ikke lagres.
   if(downloaded&&VC.isSafePhrase(text))void VC.put(clip,bytes).then(ok=>{if(ok&&$('voiceSettings').open)void refreshAudioCacheStatus()});
   const node=ctx.createBufferSource();node.buffer=decoded;node.playbackRate.value=cpu?1.07:1;if(boost!==1){const gain=ctx.createGain();gain.gain.value=boost;node.connect(gain);gain.connect(ctx.destination)}else node.connect(ctx.destination);aiSource=node;
   aiStatus(cacheLabel+': '+chosen+(cpu?' · CPU-æsel.':'.'));
   await waitForPlayback(done=>{node.onended=()=>{if(aiSource===node)aiSource=null;done()};node.start()},Math.min(45000,Math.max(2000,decoded.duration*1000/(cpu?1.07:1)+2000)));
  }else{
   const blob=new Blob([bytes],{type:'audio/mpeg'});
   const objectUrl=URL.createObjectURL(blob);
   const audio=new Audio(objectUrl);audio._blobUrl=objectUrl;audio.playbackRate=cpu?1.07:1;aiHtmlAudio=audio;
   aiStatus(cacheLabel+': '+chosen+(cpu?' · CPU-æsel.':'.'));
   try{
    await waitForPlayback(done=>{
     audio.onended=done;audio.onerror=done;
     audio.play().catch(done);
    },45000);
    if(downloaded&&VC.isSafePhrase(text))void VC.put(clip,bytes).then(ok=>{if(ok&&$('voiceSettings').open)void refreshAudioCacheStatus()});
   }finally{URL.revokeObjectURL(objectUrl);if(aiHtmlAudio===audio)aiHtmlAudio=null;audio.src='';}
  }
 }catch(e){
  if(id!==speechSerial)return;
  // Fejlagtige klip skal fjernes både i RAM og i IndexedDB.
  if(fromStoredCache){speechCache.delete(key);void VC.remove(clip)}
  console.warn('Kunne ikke hente eller afspille AI-lyd',e);
  aiRetryAfter=Date.now()+AI_RETRY_COOLDOWN_MS;
  const reason=/HTTP 502|HTTP 429|HTTP 402/.test(String(e?.message||''))?' Tjek også din ElevenLabs-creditgrænse.':'';
  aiStatus('🫏 AI-lyden er ikke tilgængelig lige nu.'+reason+' Telefonens stemme bruges midlertidigt.');
  if(strictVoice){aiStatus('⚠️ Kunne ikke afspille den valgte AI-stemme. Tryk Læs igen for et nyt forsøg.');document.getElementById('talkortVoiceInfo')?.replaceChildren(document.createTextNode('⚠️ Spillelederens stemme er utilgængelig. Tryk Læs igen.'));return;}
  return speakLocally(text,{cpu,language});
 }finally{if(id===speechSerial)aiFetch=null}
}

function say(text,{cpu=false,repeat=false}={}){
 // Variation sker præcis én gang før cacheopslag og stemmeafspilning.
 // Ved Gentag genbruges den faktiske tidligere oplæsning ordret.
 const line=N.prepare(text,{cpu,repeat});
 sound.last=line;sound.lastCPU=cpu;
 stopCurrentVoice();
 if(!sound.on){lastNarration=Promise.resolve();return lastNarration}
 const t=normalizedSpeech(line),id=speechSerial;
 const music=window.AeselMusic,duck=music?.beginSpeech?.();
 const speaking=sound.mode==='ai'?speakAI(t,id,{cpu}):speakLocally(t,{cpu});
 lastNarration=Promise.resolve(speaking).finally(()=>{if(duck!==undefined)music?.endSpeech?.(duck)});
 return lastNarration;
}
// Kortspillet bruger præcis samme valgte stemmer/Cloudflare-forbindelse som Talstien.
// Ingen ekstra API-nøgle eller tilsvarende kopieret stemmemotor.
async function speakNumber(number,{repeat=false,cpu=false,preferSelectedVoice=false}={}){
 const n=Number(number);if(!Number.isInteger(n)||n<0||n>100)return Promise.resolve();
 lastSpokenNumber=n;
 stopCurrentVoice();
 const numberSpeechId=speechSerial;
 const parts=NUM.parts(n,numberLanguage);
 // Først de faste 500 lydfiler. Gemmes efter behov; ingen ElevenLabs-kreditter.
 if(sound.on&&n>=1&&window.AeselOfflineNumbers){
  const partsForAudio=NUM.parts(n,numberLanguage);
  const role=cpu?'donkey':'narrator';
  const result=await window.AeselOfflineNumbers.play(n,numberLanguage,role);
  if(numberSpeechId!==speechSerial||result)return;
  // Fallback bruger den eksisterende AI-/telefonstemme, hvis MP3 ikke kan hentes.
 }
 // Same narrator voice for numbers on human and CPU turns; no English guessing by AI.
 // Foreign-language numbers use the device's locale-specific voice, without ElevenLabs credits.
 if(numberSpeechId!==speechSerial||!sound.on)return Promise.resolve();
 if(parts.length===1&&parts[0].lang==='da'){
  // Danske 'fem' udtales på enkelte multilingvale AI-stemmer som et engelsk ord.
  // Vælg en faktisk dansk lokal stemme når den findes, ellers behold den valgte AI-stemme.
  if(preferSelectedVoice||n!==5||!('speechSynthesis' in window)||!speechSynthesis.getVoices().some(v=>/^da(?:-|$)/i.test(v.lang||'')))return say(n===5?'tallet fem':parts[0].text,{repeat,cpu});
 }
 stopCurrentVoice();
 const id=speechSerial;
 const music=window.AeselMusic,duck=music?.beginSpeech?.();
 const speakPart=part=>{
  if(id!==speechSerial||!sound.on)return Promise.resolve();
  // Talkort: danske tal bruger den valgte ElevenLabs-/telefonstemme for rollen.
  // Andre sprog bruger en lokalt installeret stemme med korrekt sprogkode.
  if(part.lang==='da'&&preferSelectedVoice)return sound.mode==='ai'?speakAI(n===5?'tallet fem':part.text,id,{cpu,strictVoice:true,boost:cpu?1:1.14}):speakLocally(part.text,{cpu});
  if(!('speechSynthesis' in window))return Promise.resolve();
  const u=new SpeechSynthesisUtterance(part.text);u.lang=part.locale;u.rate=sound.rate;u.pitch=sound.pitch;u.volume=parts.length>1&&part.lang!=='da'?0.82:1;
  const voices=speechSynthesis.getVoices();const choices=voices.filter(v=>(v.lang||'').toLowerCase().startsWith(part.lang));
  const selected=choices.find(v=>v.default)||choices[0];if(selected)u.voice=selected;
  return waitForPlayback(done=>{u.onend=done;u.onerror=done;speechSynthesis.speak(u)},Math.min(22000,5000+part.text.length*180));
 };
 const playing=(async()=>{for(let i=0;i<parts.length;i++){
  if(id!==speechSerial)break;
  if(i>0){await new Promise(resolve=>setTimeout(resolve,650));if(id!==speechSerial)break;}
  await speakPart(parts[i]);
 }})();
 return playing.finally(()=>{if(duck!==undefined)music?.endSpeech?.(duck)});
}
// Separate audio profiles. Called on game-mode transitions and by each mode's audio menu.
window.AeselApplyAudioProfile=function(profile){
 if(!profile)return;
 stopCurrentVoice();
 sound.on=profile.enabled!==false;
 numberLanguage=NUM.normalize(profile.language||'da');
 const languageControl=$('numberLanguageChoice');if(languageControl)languageControl.value=numberLanguage;
 const toggle=$('voiceToggle');if(toggle){toggle.textContent=sound.on?'🔊 Lyd til':'🔇 Lyd fra';toggle.setAttribute('aria-pressed',String(sound.on));}
 const music=window.AeselMusic;
 if(music){music.setTrack(profile.track||'gonefishin');music.setVolume(profile.volume??32);music.setEnabled(profile.music===true);}
};
async function sayWithVoice(text,{voice='current',language='da-DK'}={}){
 if(!sound.on)return;const line=normalizedSpeech(text);if(!line)return;stopCurrentVoice();const id=speechSerial,duck=window.AeselMusic?.beginSpeech?.();
 try{if(voice==='device'||voice==='current'&&sound.mode==='device')return await speakLocally(line,{language});if(voice!=='current'&&voice!=='donkey'&&!aiVoices.some(v=>v.id===voice))throw Error('Vælg en tilgængelig stemme');const chosen=voice==='current'?sound.aiVoice:voice==='donkey'?CV.chooseVoice(aiVoices,sound.aiVoice,sound.cpuVoice):voice;return await speakAI(line,id,{voiceOverride:chosen,language})}finally{if(duck!==undefined)window.AeselMusic?.endSpeech?.(duck)}
}
window.AeselVoice={sayWithVoice,listVoices:()=>aiVoices.map(v=>({...v})),loadVoices:()=>loadAIVoices(),say:(text,options={})=>say(text,options),number:(number,options={})=>speakNumber(number,options),repeatNumber:()=>lastSpokenNumber!==null?speakNumber(lastSpokenNumber,{repeat:true}):Promise.resolve(),stop:stopCurrentVoice,enabled:()=>sound.on,choices:()=>({mode:sound.mode,aiVoice:sound.aiVoice,cpuVoice:sound.cpuVoice,numberLanguage})};
const numberSelect=$('numberLanguageChoice');if(numberSelect){numberSelect.value=numberLanguage;numberSelect.addEventListener('change',e=>{numberLanguage=NUM.normalize(e.target.value);try{localStorage.setItem(NUMBER_LANGUAGE_KEY,numberLanguage)}catch(_){};numberSelect.value=numberLanguage;});}
$('numberPreview')?.addEventListener('click',()=>void speakNumber(14));
$('numberRepeatBoard')?.addEventListener('click',()=>void speakNumber(players?.[turn]?.pos||1));
function playBray(){
 stopCurrentVoice();
 if(!sound.on||!bray)return Promise.resolve();
 try{
  bray.pause();bray.currentTime=0;
  return waitForPlayback(done=>{
    bray.onended=done;bray.onerror=done;
    bray.play().catch(done);
  },Math.min(8500,Math.max(3500,(Number(bray.duration)||3.5)*1000+1200)));
 }catch(e){return Promise.resolve()}
}
function loadVoice(){
 try{
  // Behold brugerens tidligere lokale taleindstillinger.
  const p=JSON.parse(localStorage.getItem(voiceKey)||localStorage.getItem('aeselklog-voice-v02')||'{}');
  if(typeof p.selected==='string')sound.selected=p.selected;
  if(p.rate>=.8&&p.rate<=1.15)sound.rate=Number(p.rate);
  if(p.pitch>=.85&&p.pitch<=1.2)sound.pitch=Number(p.pitch);
  if(p.mode==='ai'||p.mode==='device')sound.mode=p.mode;
  if(typeof p.aiVoice==='string'&&/^[a-zA-Z0-9_-]{1,50}$/.test(p.aiVoice))sound.aiVoice=p.aiVoice;
  if(typeof p.cpuVoice==='string'&&(p.cpuVoice==='auto'||/^[a-zA-Z0-9_-]{1,50}$/.test(p.cpuVoice)))sound.cpuVoice=p.cpuVoice;
 }catch(e){}
 syncVoiceControls();refreshVoice();
}
loadVoice();
window.speechSynthesis?.addEventListener?.('voiceschanged',refreshVoice);
async function refreshAudioCacheStatus(){
 const el=$('audioCacheStatus');if(!el)return;
 const s=await VC.stats();
 el.textContent=s.available?`${s.count} gemte lydklip · ${(s.bytes/1024/1024).toFixed(1).replace('.',',')} MB af 15 MB. Gemt kun på denne enhed.`:
  'Lokal lydlagring er ikke tilgængelig her. Oplæsning og spil virker stadig.';
}
$('clearAudioCache').addEventListener('click',async()=>{
 const btn=$('clearAudioCache');btn.disabled=true;
 const ok=await VC.clear();speechCache.clear();
 btn.disabled=false;
 await refreshAudioCacheStatus();
 if(!ok)$('audioCacheStatus').textContent='Kunne ikke rydde lydlageret på denne enhed.';
});
$('voiceSettings').addEventListener('toggle',()=>{
 if($('voiceSettings').open){refreshVoice();void refreshAudioCacheStatus();if(sound.mode==='ai')void loadAIVoices()}
});
$('voiceMode').addEventListener('change',e=>{
 stopCurrentVoice();aiRetryAfter=0;sound.mode=e.target.value;syncVoiceControls();saveVoice();
 if(sound.mode==='ai')void loadAIVoices();
 else say('Hov hov! Nu bruger jeg telefonens stemme.');
});
$('aiVoiceChoice').addEventListener('change',e=>{
 stopCurrentVoice();aiRetryAfter=0;sound.aiVoice=e.target.value;saveVoice();
 aiStatus('Valgt: '+(aiVoices.find(v=>v.id===sound.aiVoice)?.name||'AI-stemme')+'. Tryk Prøv valgt stemme.');
});
$('cpuVoiceChoice').addEventListener('change',e=>{
 stopCurrentVoice();aiRetryAfter=0;sound.cpuVoice=e.target.value;saveVoice();
 aiStatus('CPU-æslets stemme er valgt. Prøv den med knappen nedenfor.');
});
$('cpuVoicePreview').addEventListener('click',()=>say(CV.makePreview(),{cpu:true}));
$('reloadAIVoices').addEventListener('click',()=>{aiRetryAfter=0;void loadAIVoices(true)});
$('voiceChoice').addEventListener('change',e=>{sound.selected=e.target.value;saveVoice();say('Hov hov! Jeg glæder mig til at lege med tallene!')});
$('voiceSpeed').addEventListener('input',e=>{sound.rate=Number(e.target.value);syncVoiceControls();saveVoice()});
$('voicePitch').addEventListener('input',e=>{sound.pitch=Number(e.target.value);syncVoiceControls();saveVoice()});
$('voicePreview').addEventListener('click',()=>say('Hov hov! Du står på syvogtyve. Er fireogtredive større eller mindre end syvogtyve?'));
if($('brayPreview'))$('brayPreview').addEventListener('click',playBray);
if($('boardBray'))$('boardBray').addEventListener('click',playBray);
$('voiceToggle').addEventListener('click',()=>{sound.on=!sound.on;$('voiceToggle').textContent=sound.on?'🔊 Lyd til':'🔇 Lyd fra';$('voiceToggle').setAttribute('aria-pressed',String(sound.on));if(sound.on)say('Hov hov! Nu kan du høre mig!');else {stopCurrentVoice();bray?.pause()}});
if($('testVoice'))$('testVoice').addEventListener('click',()=>say('Hov hov! Jeg er ÆselKlog, og jeg glæder mig til at spille med jer!')); 
$('speakAgain').addEventListener('click',()=>say(sound.last||'Nu er det din tur.',{cpu:sound.lastCPU,repeat:true}));

function safeStorage(){try{return window.localStorage}catch(_){return null}}
function timeLeftForSave(){
 if(phase!=='question'||players[turn]?.kind!=='adult')return 0;
 if(resumeAdultMs!==null)return resumeAdultMs;
 if(!taskDeadline)return (challenge?.timeLimit||30)*1000;
 return Math.max(0,taskDeadline-(taskPausedAt??Date.now()));
}
function snapshot(){
 return {config,players,turn,phase,pending,challenge,resultLines,extraRollUsed,timeLeftMs:timeLeftForSave(),specialFields:SPECIAL};
}
function updateSaveBadge(message){
 const badge=$('saveStatus');if(!badge)return;clearTimeout(saveStatusTimer);badge.textContent=message;
 if(message)saveStatusTimer=setTimeout(()=>{if(badge.textContent===message)badge.textContent=''},4400);
}
function safePhase(){return G.PHASES.has(phase)}
function saveCheckpoint({notify=false}={}){
 if(!config||!players.length||!safePhase()||restoringGame)return false;
 const ok=G.write(safeStorage(),snapshot());lastSaveOk=ok;
 if(notify)updateSaveBadge(ok?'💾 Spillet er gemt på denne enhed.':'⚠️ Kunne ikke gemme på denne enhed.');
 return ok;
}
function renderResumeCard(){
 const card=$('resumeCard');if(!card)return;
 const record=G.read(safeStorage());card.hidden=!record;
 if(!record)return;
 const time=new Date(record.savedAt).toLocaleString('da-DK',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 const names=record.players.map(p=>p.name).slice(0,5).join(', ');
 $('resumeInfo').textContent=`${record.config.raw} · ${names} · ${time}`;
}
function syncBoardMode(){
 if(!config)return;
 const physical=config.boardMode==='physical';
 $('game').classList.toggle('physical-game',physical);
 $('physicalGuide').hidden=!physical;
 $('boardModeLabel').textContent=physical?'Fysisk A3-plade · app-overblik':'Digital spilleplade';
 $('boardExpand').textContent=physical?'🗺 Digitalt overblik':'⛶ Stor plade';
 updatePhysicalGuide();
}
function updatePhysicalGuide(){
 if(!config||config.boardMode!=='physical'||!players[turn])return;
 const p=players[turn];
 const position=p.pos===config.start?'START':`felt ${p.pos}`;
 const action={move:'Klar til næste terningkast',moving:'Flyt brikken på A3-pladen',learn:'Vælg opgave',question:'Besvar opgaven',feedback:'Svar afgjort',result:'Klar til næste spiller',skipped:'Tur springes over',swap:'Byt brikkerne fysisk',win:'Mål!', 'super-offer':'Frivillig opgave'}[phase]||'Følg turen i appen';
 $('physicalGuidePosition').textContent=`${p.name}: ${position} · ${action}.`;
}
function closeExitDialog(){
 const dlg=$('exitGameDialog');
 if(dlg.open){if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open');}
 if(!exitDialogActive)return;
 exitDialogActive=false;
 document.dispatchEvent(new Event('aeselklog-exit-resume'));
 resumeAdultTimer();
}
function openExitDialog(){
 if(!config||exitDialogActive)return;
 exitDialogActive=true;
 pauseAdultTimer();
 const safe=!busy&&!showDiceState&&safePhase();
 $('exitSave').disabled=!safe;
 $('exitGameWarning').textContent=safe?'':phase==='win'?'Spillet er afsluttet. Resultatet er gemt i Topscore.':'Vent til den igangværende handling er færdig, hvis du vil gemme spillet.';
 const dlg=$('exitGameDialog');
 if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
}
$('gameExit').addEventListener('click',()=>{exitToMenu=false;openExitDialog()});
for(const id of ['gameMenu','boardMenuExpanded'])$(id).addEventListener('click',()=>{exitToMenu=true;openExitDialog()});
$('boardExit').addEventListener('click',()=>{exitToMenu=false;openExitDialog()});
$('exitCancel').addEventListener('click',closeExitDialog);
$('exitGameDialog').addEventListener('cancel',event=>{event.preventDefault();closeExitDialog()});
$('exitSave').addEventListener('click',()=>{if($('exitSave').disabled)return;closeExitDialog();saveAndLeave()});
$('exitDiscard').addEventListener('click',()=>{
 if(!window.confirm('Afslutte uden at gemme? Det nuværende spil kan så ikke fortsættes.'))return;
 closeExitDialog();resetAsync();G.clear(safeStorage());
 config=null;players=[];phase='setup';winner=null;pending=null;challenge=null;
 show(exitToMenu?'menu':'home');renderResumeCard();
});
$('physicalShowBoard').addEventListener('click',()=>setBoardExpanded(true));

function saveAndLeave(){
 if(!config)return;
 if(busy||!safePhase()||showDiceState){updateSaveBadge('🫏 Gem spillet efter den igangværende handling.');return;}
 if(!saveCheckpoint({notify:true})){window.alert('Spillet kunne ikke gemmes. Kontrollér, at privat browsing eller browserlager ikke blokerer.');return;}
 resetAsync();config=null;players=[];phase='setup';winner=null;pending=null;challenge=null;
 show(exitToMenu?'menu':'home');renderResumeCard();
}
async function resumeSavedGame(){
 if(busy)return;
 const state=G.read(safeStorage());if(!state){renderResumeCard();window.alert('Det gemte spil kunne ikke læses.');return;}
 resetAsync();restoringGame=true;
 config=state.config;SPECIAL=state.specialFields||A.FIELDS;players=state.players.map(p=>({...p,learning:P.cleanProgress(p.learning)}));
 turn=state.turn;phase=state.phase;pending=state.pending;challenge=state.challenge;
 resultLines=state.resultLines;winner=null;extraRollUsed=state.extraRollUsed;
 helpUsed=false;resumeAdultMs=state.phase==='question'&&players[turn]?.kind==='adult'?state.timeLeftMs:null;
 $('rangeTitle').textContent=config.all?'Hele Talstien · 1–100':`Talområde ${config.raw}`;
 syncBoardMode();
 show('game');buildBoard();render();setBoardExpanded(config.boardMode!=='physical');restoringGame=false;
 updateSaveBadge('💾 Spillet blev fortsat fra et lokalt gemt punkt.');
 const player=players[turn],g=gameToken;
 const line=phase==='question'?`${player.name}, vi fortsætter med din opgave. ${challenge.question}`:`Hov hov! Velkommen tilbage, ${player.name}. Vi er på felt ${player.pos}.`;
 const narration=say(line);
 if(phase==='question'){
  if(player.isCPU)scheduleCPU('question');
  else if(player.kind==='adult')void narration.then(()=>{if(g===gameToken&&phase==='question')startAdultTimer()});
 }else if(player.isCPU&&phase==='move')scheduleCPU('move');
 else if(player.isCPU&&phase==='learn')scheduleCPU('learn');
 else if(player.isCPU&&phase==='super-offer')void narration.then(async()=>{await pauseBeat();await waitUntilVisible();if(g===gameToken&&phase==='super-offer')chooseSuper(Math.random()<.75)});
 else if(player.isCPU&&phase==='skipped')void narration.then(async()=>{await pauseBeat();await waitUntilVisible();if(g===gameToken&&phase==='skipped')nextTurn()});
}
$('resumeGame').addEventListener('click',()=>void resumeSavedGame());
$('deleteSave').addEventListener('click',()=>{
 if(window.confirm('Vil du slette det gemte spil på denne enhed? Topscoren bliver ikke slettet.')){G.clear(safeStorage());renderResumeCard()}
});
$('saveGame').addEventListener('click',saveAndLeave);
renderResumeCard();
function refreshTopscore(){
 const root=$('topscoreContent');
 if(!L){root.innerHTML='<p class="topscore-empty">Topscoren er ikke tilgængelig.</p>';return}
 const records=L.sorted(L.read(safeStorage()));
 if(!records.length){root.innerHTML='<p class="topscore-empty">Ingen færdige spil endnu. Første vinder får en plads her! 🥕</p>';return}
 root.innerHTML=`<ol class="topscore-list">${records.slice(0,20).map((r,i)=>`<li class="topscore-item"><span class="topscore-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'}</span><div><div class="topscore-name">${r.isCPU?'🫏 ':''}${esc(r.name)}</div><div class="topscore-meta">${r.games} spil · ${r.correct}/${r.attempted} rigtige svar</div></div><span class="topscore-wins">${r.wins} ${r.wins===1?'sejr':'sejre'}</span></li>`).join('')}</ol>`;
}
function openTopscore(){refreshTopscore();const dlg=$('topscoreDialog');if(typeof dlg.showModal==='function'&&!dlg.open)dlg.showModal();else dlg.hidden=false}
function closeTopscore(){const dlg=$('topscoreDialog');if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.hidden=true}
$('openTopscoreSetup')?.addEventListener('click',openTopscore);
$('openTopscoreGame').addEventListener('click',openTopscore);
$('closeTopscore').addEventListener('click',closeTopscore);
$('clearTopscore').addEventListener('click',()=>{
 if(!window.confirm('Vil du slette alle lokale ÆselKlog-resultater på denne enhed?'))return;
 L?.clear(safeStorage());refreshTopscore();
});
function renderSetupPlayers(){
 const holder=$('playerInputs');holder.innerHTML='';
 setupPlayers.forEach((p,i)=>{
  const row=document.createElement('div');row.className='player-input';
  row.innerHTML=`<span class="player-dot" style="background:${COLORS[i]}"></span>
    <input type="text" aria-label="Navn for spiller ${i+1}" maxlength="24" value="${esc(p.name)}">
    <select aria-label="Alder for spiller ${i+1}" class="age-select">${Array.from({length:15},(_,j)=>`<option value="${j+3}" ${p.kind!=='adult'&&p.age===j+3?'selected':''}>${j+3} år</option>`).join('')}<option value="adult" ${p.kind==='adult'?'selected':''}>Voksen (18+)</option></select>
    <button type="button" class="remove-player" aria-label="Fjern spiller ${i+1}" title="Fjern spiller">×</button>`;
  const name=row.querySelector('input');name.addEventListener('input',e=>p.name=e.target.value);
  const age=row.querySelector('.age-select');age.addEventListener('change',e=>{
   p.kind=e.target.value==='adult'?'adult':'child';if(p.kind==='child')p.age=Number(e.target.value);
  });
  row.querySelector('.remove-player').addEventListener('click',()=>{if(setupPlayers.length>1){setupPlayers.splice(i,1);renderSetupPlayers()}});
  holder.append(row);
 });
 $('addPlayer').disabled=setupPlayers.length>=6;
}
renderSetupPlayers();

// Spilvalg sættes under Indstillinger og gemmes lokalt. Ingen spilleraldre lagres her.
const SETTINGS_KEY='aeselklog-praferencer-v092';
const GAME_SELECT_IDS=['range','tablesChoice','gamePace','adultDifficultySetting'];
const GAME_CHECK_IDS=['adaptiveCheck','rememberLearning'];
const GAME_RADIOS=['learning','boardMode','moveDice','learnDice'];
function saveGameOptions(){
 const state={};
 GAME_SELECT_IDS.forEach(id=>state[id]=$(id).value);
 GAME_CHECK_IDS.forEach(id=>state[id]=$(id).checked);
 GAME_RADIOS.forEach(name=>state[name]=radio(name));
 try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(state))}catch(_){/* privat browsing */}
}
function restoreGameOptions(){
 let state;try{state=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null')}catch(_){return}
 if(!state||typeof state!=='object')return;
 GAME_SELECT_IDS.forEach(id=>{const v=state[id],el=$(id);if(typeof v==='string'&&Array.from(el.options).some(opt=>opt.value===v))el.value=v});
 GAME_CHECK_IDS.forEach(id=>{if(typeof state[id]==='boolean')$(id).checked=state[id]});
 GAME_RADIOS.forEach(name=>{let value=state[name];if(typeof value!=='string')return;const choice=Array.from(document.querySelectorAll(`input[name="${name}"]`)).find(el=>el.value===value);if(choice)choice.checked=true});
}
function updateSettingsSummary(){
 const type={leg:'Kun leg',laer:'Lær',udfordring:'Udfordring',tabel:'Tabeltræning'}[radio('learning')]||'Lær';
 const range=$('range').value==='1-100'?'1–100':$('range').value.replace('-', '–');
 $('settingsSummary').querySelector('span').textContent=`⚙️ ${type} · Tal ${range} · ${$('gamePace').selectedOptions[0].textContent.split('–')[0].trim()} tempo`;
}
restoreGameOptions();
$('gameOptions').addEventListener('change',saveGameOptions);
function refreshLearningProfileStatus(message=''){
 const status=$('learningProfileStatus');if(!status)return;
 const count=LP.list(safeStorage()).length;
 status.textContent=message||`${count} ${count===1?'lokal læringsprofil':'lokale læringsprofiler'} på denne enhed.`;
}
refreshLearningProfileStatus();
$('clearLearningProfiles').addEventListener('click',()=>{
 if(!window.confirm('Slet alle læringsprofiler på denne enhed? Gemte spil og Topscore berøres ikke.'))return;
 refreshLearningProfileStatus(LP.clear(safeStorage())?'Læringsprofilerne er slettet.':'Det lokale lager kunne ikke ryddes.');
});
function updateParentReportBody(){
 const name=$('parentReportSelect').value;
 $('parentReportContent').innerHTML=PR.renderHtml(LP.report(safeStorage(),name));
 $('deleteParentProfile').disabled=!name;
}
function refreshParentReport(selectedName=''){
 const select=$('parentReportSelect'),records=LP.list(safeStorage());
 const key=LP.normName(selectedName||select.value);
 select.replaceChildren();
 if(!records.length){
  const option=document.createElement('option');option.textContent='Ingen profiler endnu';option.value='';select.append(option);
 }else{
  records.forEach(({name})=>{const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option)});
  const chosen=records.find(p=>LP.normName(p.name)===key);
  if(chosen)select.value=chosen.name;
 }
 select.disabled=!records.length;
 updateParentReportBody();
}
$('openParentReport').addEventListener('click',()=>{
 refreshParentReport(LP.list(safeStorage())[0]?.name||'');
 const dlg=$('parentReportDialog');
 if(typeof dlg.showModal==='function'&&!dlg.open)dlg.showModal();else dlg.hidden=false;
});
$('parentReportSelect').addEventListener('change',updateParentReportBody);
$('closeParentReport').addEventListener('click',()=>{
 const dlg=$('parentReportDialog');if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.hidden=true;
});
$('deleteParentProfile').addEventListener('click',()=>{
 const name=$('parentReportSelect').value;
 if(!name||!window.confirm('Slet læringshistorik og niveauer for '+name+'? Gemte spil og Topscore berøres ikke.'))return;
 if(LP.remove(safeStorage(),name)){
  refreshLearningProfileStatus();refreshParentReport();
 }else $('parentReportContent').textContent='Profilen kunne ikke slettes på denne enhed.';
});
let pageView='home',applyingAddress=false,exitToMenu=false;
$('homePlay').addEventListener('click',()=>show('menu'));
 $('openOnlineGame')?.addEventListener('click',()=>{location.href='./site/online.html?menu=1'});
$('homeSettings').addEventListener('click',()=>show('settings'));
$('homeTopscore').addEventListener('click',openTopscore);



// Musikken er slukket som udgangspunkt. Samme indstilling bruges i begge spiltyper.
const bgMusic=window.AeselMusic;
function syncMusicButtons(){if(!bgMusic)return;const p=bgMusic.get();
 const enabled=$('musicEnabled'),track=$('musicTrack'),volume=$('musicVolume'),out=$('musicVolumeValue');
 if(enabled)enabled.checked=p.enabled;if(track)track.value=p.track;if(volume)volume.value=p.volume;
 if(out)out.textContent=p.volume+' %';
 for(const id of ['gameMusicToggle','boardMusicToggle','cardsMusicToggle']){
  const b=$(id);if(!b)continue;b.textContent=p.enabled?'🎵 Musik til':'🎵 Musik fra';b.setAttribute('aria-pressed',String(p.enabled));
 }
}
if(bgMusic){
 $('musicEnabled')?.addEventListener('change',e=>bgMusic.setEnabled(e.target.checked));
 $('musicTrack')?.addEventListener('change',e=>bgMusic.setTrack(e.target.value));
 $('musicVolume')?.addEventListener('input',e=>bgMusic.setVolume(e.target.value));
 $('musicPreview')?.addEventListener('click',()=>{bgMusic.playPreview();});
 for(const id of ['gameMusicToggle','boardMusicToggle','cardsMusicToggle'])$(id)?.addEventListener('click',()=>bgMusic.setEnabled(!bgMusic.get().enabled));
 bgMusic.onChange(syncMusicButtons);syncMusicButtons();bgMusic.syncView('home');
}
function finishSettings(){saveGameOptions();if($('settings').classList.contains('embedded-settings')){$('boardSetupOptions').open=false;show('setup')}else show('menu')}
$('settingsBack').addEventListener('click',finishSettings);
$('settingsDone').addEventListener('click',finishSettings);
$('boardSetupBack').addEventListener('click',()=>{saveGameOptions();show('menu')});
$('boardResume').addEventListener('click',resumeSavedGame);
$('setupBack').addEventListener('click',()=>show('home'));
$('setupEditSettings').addEventListener('click',()=>show('settings'));

$('addPlayer').addEventListener('click',()=>{if(setupPlayers.length<6){setupPlayers.push({name:`Spiller ${setupPlayers.length+1}`,age:7,kind:'child',difficulty:'mellem'});renderSetupPlayers()}});
function show(view){
 if(view!=='cardsGame')window.AeselCardGamePause?.();if(view!=='fishGame')window.AeselFishPause?.();
 let openOptions=false;if(view==='settings'&&pageView==='setup'&&!applyingAddress){view='setup';openOptions=true}
 if(view==='setup'){if($('boardSettingsSlot')?.append){$('boardSettingsSlot').append($('settings'));$('settings').classList.add('embedded-settings');$('settingsBack').hidden=true}if(openOptions)$('boardSetupOptions').open=true;$('boardResume').hidden=!G.read(safeStorage())}
 else if(view==='settings'){$('settings').classList.remove('embedded-settings');$('settingsBack').hidden=false;document.querySelector('main')?.append($('settings'))}
 pageView=view;updatePageAddress(view);
 const pageBrand={fishSetup:['TorskeKlog','fish-game'],fishGame:['TorskeKlog','fish-game'],setup:['Talstien','board-game'],game:['Talstien','board-game'],cardsSetup:['Kortspil','card-game'],cardsGame:['Kortspil','card-game'],talkort:['Talkort','numbers']}[view];
 if($('pageTitle')){
  if(pageBrand)$('pageTitle').textContent=pageBrand[0]==='TorskeKlog'?'TorskeKlog':'ÆselKlog - '+pageBrand[0];else $('pageTitle').innerHTML='Æsel<span class="red">Klog</span> · Talstien';
  const icon=$('pageBrandIcon');icon.replaceChildren();
  if(pageBrand){const img=document.createElement('img');img.src='./assets/icons/'+pageBrand[1]+'.svg';img.alt='';icon.append(img)}
  else icon.textContent='🫏';
  icon.classList.toggle('game-brand-icon',Boolean(pageBrand));
 }

 $('gameChooser').hidden=view!=='menu';for(const [id,selected] of [['chooseBoardMode','setup'],['openCardSetup','cardsSetup'],['openTalkort','talkort']])$(id).setAttribute('aria-pressed',String(view===selected));
 ['home','setup','settings','game','cardsSetup','cardsGame','talkort','fishSetup','fishGame'].forEach(id=>$(id).classList.toggle('active',view===id));
 document.body.classList.toggle('home-active',view==='home');
 window.AeselVoice?.stop?.();
 window.AeselAudioSettings?.activate?.(view);
 window.AeselMusic?.syncView?.(view);
 if(view==='setup')updateSettingsSummary();
 document.title=({fishSetup:'TorskeKlog',fishGame:'TorskeKlog',menu:'Spilmenu',setup:'Talstien',game:'Talstien',cardsSetup:'Kortspil',cardsGame:'Kortspil',talkort:'Talkort',settings:'Indstillinger'}[view]||'Talstien')+' · ÆselKlog';
 if(view==='home')renderResumeCard();
 window.scrollTo({top:0,behavior:'instant'});
 // Flyt også tastatur- og skærmlæserfokus, når den tidligere side skjules.
 const target={
  home:$('homePlay'),
  menu:document.querySelector('#gameChooser h2'),
  setup:$('pageTitle'),
  settings:document.querySelector('#settings .page-heading h2'),
  game:$('boardHud'),
  cardsSetup:$('pageTitle'),
  cardsGame:$('cardsTurnHeading'),
  talkort:$('talkortProgress')
 }[view];
 if(target){
  if(!target.hasAttribute('tabindex')&&target.tagName!=='BUTTON')target.setAttribute('tabindex','-1');
  try{target.focus({preventScroll:true})}catch(_){/* Ældre browsere */}
 }
}
window.AeselShowView=show;
$('openCardSetup').addEventListener('click',()=>show('cardsSetup'));
$('chooseBoardMode').addEventListener('click',()=>show('setup'));
$('openTalkort').addEventListener('click',()=>show('talkort'));
function resetAsync(){gameToken++;resumeAdultMs=null;helpUsed=false;const fanfare=$('victoryFanfare');if(fanfare)fanfare.remove();clearInterval(taskTimer);taskTimer=null;taskPausedAt=null;taskDeadline=0;busy=false;extraRollUsed=false;showDiceState=null;hideDice();hideActionFlash();if(boardExpanded)setBoardExpanded(false);stopCurrentVoice();bray?.pause();}
$('startButton').addEventListener('click',()=>{ saveGameOptions();
 resetAsync();G.clear(safeStorage());renderResumeCard();
 const raw=$('range').value,all=raw==='1-100';
 const start=all?0:Number(raw.split('-')[0])-1,goal=all?100:Number(raw.split('-')[1]);
 config={raw,all,start,goal,learning:radio('learning'),boardMode:radio('boardMode'),moveDice:radio('moveDice'),learnDice:radio('learnDice'),pace:['normal','rolig','ekstra'].includes($('gamePace').value)?$('gamePace').value:'rolig',tables:$('tablesChoice').value||'auto',adaptive:$('adaptiveCheck').checked,rememberLearning:$('rememberLearning').checked};
 SPECIAL=config.boardMode==='physical'?A.FIELDS:A.generateLayout();
 const named=setupPlayers.map((p,i)=>(p.name||'').trim()||`Spiller ${i+1}`);
 const duplicateNames=new Set(named.map(name=>LP.normName(name)).filter(name=>name&&named.filter(n=>LP.normName(n)===name).length>1));
 players=setupPlayers.map((p,i)=>{
  const name=named[i],unique=LP.normName(name)&&!duplicateNames.has(LP.normName(name));
  const prior=config.adaptive&&config.rememberLearning&&p.kind==='child'&&unique?LP.read(safeStorage(),name):null;
  return {...p,difficulty:p.kind==='adult'?$('adultDifficultySetting').value:p.difficulty,name,color:COLORS[i],id:`player${i+1}`,isCPU:false,pos:start,skipNextTurn:false,stats:{correct:0,attempted:0},learning:prior||P.freshProgress()};
 });
 if($('cpuCheck').checked)players.push({name:'Æsel',kind:'cpu',age:8,color:'#c18b46',id:'cpu',isCPU:true,pos:start,skipNextTurn:false,stats:{correct:0,attempted:0},learning:P.freshProgress()});
 if($('cpuCheck').checked&&sound.mode==='ai')void loadAIVoices();
 turn=0;phase='move';challenge=null;pending=null;resultLines=[];winner=null;extraRollUsed=false;
 $('rangeTitle').textContent=all?'Hele Talstien · 1–100':`Talområde ${raw}`;
 syncBoardMode();
 show('game');buildBoard();render();setBoardExpanded(config.boardMode!=='physical');say(`Hov hov! Velkommen til Talstien. ${players[turn].name} starter!`);
});
$('newGame').addEventListener('click',()=>{if(window.confirm('Vil I afslutte spillet og starte forfra? Det gemte spil slettes.')){resetAsync();G.clear(safeStorage());config=null;players=[];phase='setup';show('home');renderResumeCard()}});
$('editPos').addEventListener('click',()=>{
 if(busy||!config||phase==='win'||showDiceState)return;
 const p=players[turn];const requested=window.prompt(`Vælg felt for ${p.name}: ${config.start}–${config.goal}`,p.pos);
 if(requested===null)return;const n=Number(requested);if(!Number.isInteger(n)||n<config.start||n>config.goal)return window.alert('Vælg et felt inden for banen.');
 p.pos=n;render();scrollToTile(n,true);
});

function donkeySvg(color){
 if(window.AeselIcons)return window.AeselIcons.donkey();
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
 $('boardExit').hidden=!expanded;$('boardMenuExpanded').hidden=!expanded;
 $('boardExpand').setAttribute('aria-expanded',String(expanded));
 // Behold den eksisterende opgave-komponent og alle dens event listeners.
 (expanded?$('boardPanelDock'):$('turnPanelHome')).append($('turnPanel'));
 if(expanded){requestAnimationFrame(coverBoard)}
 else{$('boardBox').classList.remove('fit-view');boardFitMode=false;requestAnimationFrame(()=>{if(config&&players[turn])scrollToTile(players[turn].pos,true)});}
 updateBoardHud();
}
function updateBoardHud(){
 const p=players[turn];if(!p)return;
 $('boardHudDot').style.background=p.color;
 $('boardHudName').textContent=phase==='win'?'🏆 Vinder: '+winner.name:(p.isCPU?'🫏 ':'')+p.name+'s tur';
 $('boardHudPosition').textContent=(p.pos===config?.start?'START':`Felt ${p.pos}`)+
  ' · '+({move:extraRollUsed?'Ekstra kast':'Slå terningen',learn:'Læringsterning',question:'Svar på opgaven',moving:'Æslet hopper',feedback:'Svar afgjort',result:'Næste spiller',swap:'Byt felt',skipped:'Spring tur over', 'super-offer':'Frivillig superopgave',win:'MÅL!'}[phase]||'Spil');
 $('boardPanelDock').dataset.phase=phase;
}
$('boardRepeat').addEventListener('click',()=>say(sound.last||`Nu er det ${players[turn]?.name||'din'} tur.`,{cpu:sound.lastCPU,repeat:true}));
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
 $('scores').innerHTML=players.map((p,i)=>`<div class="score-card ${i===turn?'active':''}"><span class="mini-donkey" style="--fur:${p.color}">${donkeySvg(p.color)}</span><div><strong>${esc(p.name)}</strong><div class="meta">${p.isCPU?'Computer':p.kind==='adult'?`Voksen · ${p.difficulty==='svaer'?'Svær':p.difficulty==='let'?'Let':'Mellem'}`:`${p.age} år`}${p.skipNextTurn?' · 💧 En tur over':''}${config.adaptive&&p.kind==='child'?' · 🧠 4 læringsområder':''}</div></div><div style="margin-left:auto;text-align:right"><span class="pos">${p.pos===config.start?'START':p.pos}</span><div class="meta">felt</div></div></div>`).join('');
}
function btn(label,action,style='main'){return `<button type="button" class="btn ${style}" data-act="${action}">${label}</button>`}
function hideActionFlash(){
 actionBannerSerial++;
 const toast=$('actionToast');if(toast){toast.hidden=true;toast.classList.remove('show')}
}
function flashAction(type,title,detail,durationMs=2300,opts={}){
 const toast=$('actionToast');if(!toast)return;
 const id=++actionBannerSerial;
 const fx=AF?.describe?.(type,opts)||{type:'default',tone:'choice',badge:'',symbol:SPECIAL_ICON[type]||'⭐'};
 const decor=['reward','surprise'].includes(fx.tone)?'✨':fx.tone==='water'?'💦':fx.tone==='oops'?'💨':'✦';
 // Kun de faste klasseværdier fra actionfx.js kan tilføjes her. Data og navne escapes.
 toast.className='action-toast fx-'+fx.tone;
 toast.dataset.action=fx.type;
 toast.innerHTML=`<span class="toast-decoration" aria-hidden="true">${decor}</span>`+
  `<div class="toast-icon" aria-hidden="true">${fx.symbol}</div>`+
  `<div class="toast-copy"><strong>${esc(title)}</strong><small>${esc(detail)}</small>`+
  `${fx.badge?`<span class="toast-badge" aria-hidden="true">${esc(fx.badge)}</span>`:''}</div>`;
 toast.hidden=false;void toast.offsetWidth;toast.classList.add('show');
 if(durationMs>0)setTimeout(()=>{if(id===actionBannerSerial)hideActionFlash()},durationMs);
}

function render(){
 if(!config)return;
 if(phase==='win'){G.clear(safeStorage());lastSaveOk=null;}else if(safePhase())saveCheckpoint();
 drawScores();drawBoard();updateBoardHud();updatePhysicalGuide();const p=players[turn];
 $('turnTitle').textContent=phase==='win'?'🏆 Talstien er gennemført!':`${p.isCPU?'🫏 ':''}${p.name}s tur`;
 $('turnSubtitle').textContent=phase==='win'?'Hov hov! Vi har en vinder!':`${p.name} står på ${p.pos===config.start?'START':`felt ${p.pos}`} · målet er ${config.goal}.`;
 const panel=$('turnPanel');
 if(phase==='win'){
  panel.innerHTML=`<div class="finish"><div class="donkey">🏆🫏</div><h2>Hov hov! ${esc(winner.name)} vandt!</h2><p>Flot klaret på Talstien!</p><p class="hint">${winner.stats?.correct||0} rigtige svar ud af ${winner.stats?.attempted||0} opgaver i dette spil.</p><div class="win-actions">${btn('🏆 Se topscore','topscore','soft')}${btn('Spil igen','restart')}</div></div>`;return;
 }
 if(phase==='move'){
  panel.innerHTML=`<h2>🎲 ${extraRollUsed?'🥕 Ekstra kast! ':''}${p.isCPU?'Nu slår Æslet terningen':`${esc(p.name)}, slå terningen`}</h2><p class="hint">${p.isCPU?'Æslets terning bliver også kastet og vist på skærmen.':config.moveDice==='physical'?'Kast din fysiske terning, og tryk på det antal øjne, du slog.':'Terningen fylder hele skærmen, når du slår.'}</p>${p.isCPU?'<p class="cpu-note">🫏 Vent et øjeblik – Æslet gør sig klar til sit slag …</p>':config.moveDice==='digital'?btn('🎲 Vis terningen','roll'):`<div class="dice-options">${[1,2,3,4,5,6].map(n=>`<button type="button" data-act="move-${n}">${n}</button>`).join('')}</div>`}`;
  return;
 }
 if(phase==='learn'){
  panel.innerHTML=`<h2>🧠 Læringsterning</h2><p class="hint">${esc(p.name)} slog ${pending.roll} og skal til felt <strong>${pending.landing}</strong>. Æslet har først hoppet til feltet. Nu kommer opgaven.</p>${p.isCPU?'<p class="cpu-note">🫏 Æslet slår også læringsterningen …</p>':config.learnDice==='physical'?`<p class="hint">Kast den fysiske læringsterning, og tryk på det viste ikon:</p><div class="learning-options">${S.TASKS.map((t,i)=>`<button data-act="task-${i+1}" type="button"><span class="ico">${t.short}</span>${esc(t.name)}</button>`).join('')}</div>`:btn('🎲 Vis læringsterningen','rollLearn')}${p.isCPU?'':`<div class="voicebar">${btn('Spring opgaven over','skip','soft')}</div>`}`;
  return;
 }
 if(phase==='question'){
  panel.innerHTML=`<h2>🫏 ${pending?.superTask?'🎯 Superopgave':p.isCPU?'Æslet tænker …':'Æslet spørger!'}</h2><span class="age-chip">${esc(challenge.tier)} ${p.kind==='adult'?'· Tid på opgaven':'· Uden tidsgrænse'}</span><div class="prompt ${p.kind==='child'&&p.age<=4?'early':''}"><div class="tiny">${esc(challenge.tableLabel||S.TASKS[challenge.type-1].name)} · felt ${p.pos}</div><h3>${esc(challenge.question)}</h3>${challenge.adapted?'<p class="hint">Opgaven er gjort lettere til dit niveau.</p>':''}${config.adaptive&&p.kind==='child'?`<p class="adapt-level">🧠 ${esc(P.TITLES[P.challengeArea(challenge)])}: ${esc(P.label(P.areaStep(p.learning,P.challengeArea(challenge))))}</p>`:''}</div>${pending?.superTask?'<p class="super-prize">🎯 Frivillig bonus: +3 felter for et rigtigt svar · ingen straf for fejl</p>':''}
   ${!p.isCPU&&p.kind==='adult'?`<div class="question-time" id="questionTime"><span>⏱️ Du har</span><strong id="clock" class="clock-big">${challenge.timeLimit||30} sek.</strong><div class="time-track"><div id="timeFill" class="time-fill"></div></div></div>`:''}
   <div class="choices">${challenge.options.map((opt,i)=>`<button class="choice ${p.kind==='child'&&p.age<=4?'early':''}" ${p.isCPU?'disabled':''} data-act="answer-${i}">${esc(opt)}</button>`).join('')}</div>
   ${p.isCPU?'<p class="cpu-says" id="cpuSays" aria-live="polite">🫏 Æslet tænker … snart fortæller det sit svar højt!</p>':`<div class="voicebar">${btn('🔊 Læs op','read','soft')} ${btn('💡 Få et tip','help','soft')}</div><div id="tip" class="help" hidden>${esc(challenge.help)}</div>`}`;
  return;
 }
 if(phase==='feedback'){
  const good=pending?.superTask?pending.superCorrect:pending.correct;
  panel.innerHTML=`<div class="feedback ${good?'':'error'}"><h2>${good?(pending?.superTask?'🎯 Superklaret!':'✅ Godt svaret!'):'🫏 Iiiih-åååh! Iiiih-åååh!'}</h2><p>${esc(pending.feedback)}</p><p class="hint">${p.isCPU?'Æslet skal også hoppe på banen.':'Nu ser vi om du får et ekstra skridt …'}</p></div>`;return;
 }
 if(phase==='moving'){
  panel.innerHTML=config.boardMode==='physical'
   ?`<div class="move-message"><div><h2>🏡 Flyt brikken på A3-pladen</h2><p id="moveProgress">${esc(p.name)}: gå fra ${p.pos===config.start?'START':'felt '+p.pos} mod felt ${pending?.target??pending?.landing??'?'}.</p><p class="hint">Appen registrerer placeringen, mens I flytter den rigtige brik.</p></div></div>`
   :`<div class="move-message"><div class="moving-donkey" style="--fur:${p.color}">${donkeySvg(p.color)}</div><div><h2>Hop, hop, hop! 🥕</h2><p id="moveProgress">${esc(p.name)} hopper fra felt ${p.pos} mod felt ${pending?.target??pending?.landing??'?'} …</p><p class="hint">Følg det farvede æsel, mens det hopper felt for felt.</p></div></div>`;return;
 }
 if(phase==='swap'){
  const others=players.filter((_,i)=>i!==turn);
  panel.innerHTML=`<h2>🔄 Byt felt!</h2><p class="hint">Du landede på Byt. Vælg en anden spiller eller behold din plads.</p><div class="choices">${others.map(o=>`<button class="choice" data-act="swap-${esc(o.id)}">${esc(o.name)} · felt ${o.pos}</button>`).join('')}</div><div class="voicebar">${btn('Behold min plads','swap-none','soft')}</div>`;return;
 }
 if(phase==='super-offer'){
  panel.innerHTML=`<h2>🎯 Frivillig superopgave!</h2><p class="hint">${esc(p.name)} landede på et superfelt. Prøv en alderspassende ekstra opgave og vind <strong>3 felter</strong>. I kan altid sige nej tak – også i LEG.</p>${p.isCPU?'<p class="cpu-note">🫏 Æslet beslutter sig …</p>':`<div class="choices">${btn('🎯 Prøv for +3 felter','super-yes')}${btn('Nej tak · næste spiller','super-no','soft')}</div>`}`;return;
 }
 if(phase==='skipped'){
  panel.innerHTML=`<div class="feedback"><h2>💧 Vandpyt-pause!</h2><p>${esc(p.name)} står over denne tur og rykker ikke.</p></div>${p.isCPU?'<p class="cpu-note">Æslet venter pænt, til næste spiller er klar …</p>':btn('Næste spiller →','next')}`;return;
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
 if(auto)setTimeout(()=>{void (async()=>{await waitUntilVisible();if(g===gameToken&&showDiceState&&!showDiceState.rolling)animateDie()})()},650);
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
 while(Date.now()-start<(prefersLessMotion?200:pace().roll)){
  await waitUntilVisible();
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
 await defer(prefersLessMotion?130:pace().rest+650);if(g!==gameToken)return;
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
 await say(`${p.name} slog ${pending.roll}. Nu hopper vi!`);
 if(g!==gameToken)return;
 await hopSteps(p,pending.landing);
 if(g!==gameToken)return;
 busy=false;
 if(p.pos>=config.goal){declareWin(p);return;}
 const wantsTask=['udfordring','tabel'].includes(config.learning)||(config.learning==='laer'&&Boolean(SPECIAL[p.pos]));
 if(wantsTask){
  phase='learn';render();
  if(config.learning==='tabel')receiveLearnRoll(6,true);
  else {say(`${p.name} er landet på felt ${p.pos}. Nu kommer læringsterningen!`);if(p.isCPU)scheduleCPU('learn')}
 }else void resolveLandingAction();
}
function skillStepsFor(player){
 return Object.fromEntries(P.AREAS.map(area=>[area,config?.adaptive&&player.kind==='child'?P.areaStep(player.learning,area):0]));
}
function newExerciseId(){
 return 'q'+Date.now().toString(36)+'_'+Math.floor(Math.random()*1e9).toString(36);
}
function receiveLearnRoll(type,forceTable=false){
 if(phase!=='learn'||busy)return;
 const p=players[turn];
 const skills=skillStepsFor(p);
 challenge=S.makeChallenge({player:p,type,field:p.pos,roll:pending.roll,tables:config.tables,forceTable,skillStep:config.adaptive?p.learning?.step||0:0,skillSteps:skills,rng:Math.random});
 challenge.exerciseId=newExerciseId();helpUsed=false;
 phase='question';render();
 const task=challenge;const g=gameToken;
 const spoken=say(`${p.name}! ${challenge.question}`);
 if(p.isCPU)scheduleCPU('question');
 else void spoken.then(()=>{if(g===gameToken&&phase==='question'&&challenge===task)startAdultTimer()});
}
function startAdultTimer(resume=false){
 clearInterval(taskTimer);taskTimer=null;
 const p=players[turn];if(p.kind!=='adult'||phase!=='question')return;
 const sec=challenge.timeLimit||30;
 if(!resume){taskDeadline=Date.now()+(resumeAdultMs!==null?Math.max(1000,resumeAdultMs):sec*1000);resumeAdultMs=null;}
 // iOS may put the web app in the background mid-question. Time is paused there.
 if(document.hidden||exitDialogActive){taskPausedAt=Date.now();return;}
 const tick=()=>{
  if(phase!=='question'){clearInterval(taskTimer);taskTimer=null;return;}
  if(document.hidden||exitDialogActive){pauseAdultTimer();return;}
  const remaining=Math.max(0,taskDeadline-Date.now()),secs=Math.ceil(remaining/1000);
  if($('clock'))$('clock').textContent=`${secs} sek.`;
  if($('timeFill'))$('timeFill').style.width=(remaining/(sec*1000)*100)+'%';
  if($('questionTime'))$('questionTime').classList.toggle('urgent',secs<=5);
  if(remaining<=0){clearInterval(taskTimer);taskTimer=null;processAnswer(null,true)}
 };
 taskTimer=setInterval(tick,100);tick();
}
function pauseAdultTimer(){
 if(phase!=='question'||players[turn]?.kind!=='adult'||!taskDeadline||taskPausedAt!==null)return;
 taskPausedAt=Date.now();clearInterval(taskTimer);taskTimer=null;
}
function resumeAdultTimer(){
 if(taskPausedAt===null)return;
 const ms=Date.now()-taskPausedAt;
 taskPausedAt=null;
 if(phase==='question'&&players[turn]?.kind==='adult'&&taskDeadline){
  taskDeadline+=ms;
  startAdultTimer(true);
 }
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){pauseAdultTimer();if(config&&safePhase())saveCheckpoint();}else if(!exitDialogActive)resumeAdultTimer();
});
function processAnswer(idx,timedOut=false){
 if(phase!=='question')return;
 clearInterval(taskTimer);taskTimer=null;taskPausedAt=null;
 const p=players[turn],got=idx===null?null:challenge.options[idx];
 const correct=!timedOut&&got===challenge.correct;
 const isSuper=Boolean(pending?.superTask);
 if(isSuper)pending.superCorrect=correct;else pending.correct=correct;
 const prize=isSuper?3:1;
 pending.feedback=timedOut?`Tiden løb ud! Det rigtige svar var ${challenge.correct}.`:
    correct?`Det er rigtigt, ${p.name}! Du får ${prize} ekstra ${prize===1?'skridt':'felter'}.`:`${p.name} svarede ${got}. Det rigtige svar var ${challenge.correct}.`;
 resultLines.push(correct?`✅ Rigtigt svar: +${prize} felter.`:timedOut?'⏱️ Tiden gik! Intet ekstra felt.':'🫏 Forkert svar: intet ekstra felt.');
 p.stats ||= {correct:0,attempted:0};
 p.stats.attempted++;if(correct)p.stats.correct++;
 let learningNotice='';
 if(config.adaptive&&p.kind==='child'&&!p.isCPU){
  const area=P.challengeArea(challenge),update=P.noteArea(p.learning,area,correct,{helped:helpUsed});
  p.learning=update.state;
  if(config.rememberLearning&&LP.normName(p.name)&&players.filter(x=>!x.isCPU&&LP.normName(x.name)===LP.normName(p.name)).length===1){
   const persisted=LP.record(safeStorage(),p.name,p.learning,challenge.exerciseId,{area,correct,helped:helpUsed,step:update.step});
   // After a crash/resume, answering a previously recorded exercise again
   // must not count twice in a saved learning profile.
   if(persisted.duplicate)p.learning=persisted.progress;
  }
  const areaName=P.TITLES[area];
  if(update.change>0)learningNotice=`Du klarer dig godt med ${areaName.toLowerCase()}! Næste gang bliver det lidt sværere.`;
  else if(update.change<0)learningNotice=`Vi prøver lidt lettere opgaver i ${areaName.toLowerCase()} næste gang.`;
  if(learningNotice){pending.feedback+=' '+learningNotice;resultLines.push('🧠 '+learningNotice)}
 }
 phase='feedback';render();
 const g=gameToken;
 void (async()=>{
   if(correct)await say(`${p.name}, det er rigtigt. Godt klaret! ${learningNotice}`);
   else await playBray();
   await pauseBeat();
   if(g===gameToken&&phase==='feedback')await (isSuper?finishSuper():finishLearning());
 })();
}
function skipChallenge(){if(phase!=='learn')return;pending.skip=true;pending.correct=false;resultLines.push('Opgaven blev sprunget over.');void finishLearning()}
async function hopSteps(p,to,speed){
 speed=Number(speed)||pace().hop;
 const g=gameToken;
 const goal=Math.max(config.start,Math.min(config.goal,to));
 if(p.pos===goal)return;
 if(config.boardMode==='physical'){
  await waitUntilVisible();
  if(g!==gameToken||!config)return;
  p.pos=goal;p.moving=false;
  drawScores();drawBoard();updateBoardHud();updatePhysicalGuide();
  const el=$('moveProgress');if(el)el.textContent=`🏡 Flyt ${p.name}s brik til felt ${goal} på A3-pladen.`;
  return;
 }
 const direction=goal>p.pos?1:-1;
 // Den farvede æselbrik opdateres for hvert enkelt nummer på den digitale bane.
 while(p.pos!==goal){
  await waitUntilVisible();
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
  await hopSteps(p,pending.target);
  if(g!==gameToken)return;
 }
 busy=false;
 if(p.pos>=config.goal){declareWin(p);return;}
 void resolveLandingAction();
}
// Specialfelter afvikles kun én gang på slutpositionen. Nye flytninger udløser IKKE flere felter.
function completeTurn({announce=true}={}){
 const p=players[turn];
 if(p.pos>=config.goal){declareWin(p);return;}
 phase='result';render();
 if(announce)say(`Hov hov! ${p.name} er nu på felt ${p.pos}.`);
}
async function resolveLandingAction(){
 if(!pending||busy||pending.actionHandled)return;
 const g=gameToken,p=players[turn],special=SPECIAL[p.pos];
 pending.actionHandled=true;
 if(!special){completeTurn();return;}
 busy=true;
 const d=A.DETAILS[special];
 const baseDelta={bonus:2,hov:-2,mester:1,bro:4}[special];
 const displayDelta=Number.isInteger(baseDelta)?A.destination(p.pos,baseDelta,config.start,config.goal)-p.pos:undefined;
 flashAction(special,d.label,d.description,0,{delta:displayDelta,used:special==='gulerod'&&extraRollUsed});
 resultLines.push(`${d.icon} ${d.label} på felt ${p.pos}.`);
 // Kun én oplæsning pr. handling: undgå at afbryde AI-stemmen og forbruge ekstra credits.
 await say(`${p.name}! ${d.label}. ${d.description}.`);
 if(g!==gameToken)return;
 await pauseBeat();
 if(g!==gameToken)return;
 if(special==='gulerod'){
  if(!extraRollUsed){
   extraRollUsed=true;resultLines.push('🥕 Du får ét ekstra almindeligt terningkast!');
   pending=null;challenge=null;busy=false;phase='move';hideActionFlash();render();
   if(p.isCPU)scheduleCPU('move');
   return;
  }
  resultLines.push('🥕 Du har allerede fået dit ekstra kast på denne tur.');

 }
 if(special==='vandpyt'){
  p.skipNextTurn=true;
  resultLines.push('💧 Våde hove: du står over din næste tur.');

 }
 if(special==='super'){
  hideActionFlash();busy=false;phase='super-offer';render();
  if(p.isCPU){setTimeout(()=>{void (async()=>{await waitUntilVisible();if(g===gameToken&&phase==='super-offer'&&players[turn]===p)chooseSuper(Math.random()<.75)})()},Math.max(450,pace().rest))}
  return;
 }
 if(special==='bonus'||special==='hov'||special==='mester'||special==='bro'||special==='overraskelse'){
  let delta=special==='bonus'?2:special==='hov'?-2:special==='mester'?1:special==='bro'?4:0;
  if(special==='overraskelse'){
   const surprise=A.surprise();delta=surprise.delta;
   resultLines.push(`🎁 ${surprise.title}: ${delta>0?'+':''}${delta} felter.`);
   flashAction(special,surprise.title,surprise.speech,0,{delta:A.destination(p.pos,delta,config.start,config.goal)-p.pos});
   await say(surprise.speech);
   if(g!==gameToken)return;
  }else {
   resultLines.push(`${d.icon} ${delta>0?'+':''}${delta} felter.`);
  }
  pending.target=A.destination(p.pos,delta,config.start,config.goal);
  phase='moving';render();
  await hopSteps(p,pending.target);
  if(g!==gameToken)return;
 }
 if(special==='byt'&&players.length>1){
  if(p.isCPU){
   const o=players.filter(x=>x!==p).sort((a,b)=>b.pos-a.pos)[0];
   if(o&&o.pos>p.pos){const old=p.pos;
    p.pos=o.pos;o.pos=old;
    resultLines.push(`🔄 Æslet byttede plads med ${o.name}.`);
    drawBoard();drawScores();updateBoardHud();scrollToTile(p.pos);await defer(650);
    if(g!==gameToken)return;
   }else resultLines.push('🔄 Æslet blev på sit felt.');
  }else{hideActionFlash();busy=false;phase='swap';render();return;}
 }
 if(g!==gameToken)return;
 hideActionFlash();busy=false;completeTurn({announce:false});
}
function chooseSuper(yes){
 if(busy||phase!=='super-offer')return;
 const p=players[turn];
 if(!yes){resultLines.push('🎯 Superopgaven blev sprunget over.');completeTurn({announce:false});return;}
 pending.superTask=true;
 // Små børn får et simpelt tal; ældre børn og voksne får et regnestykke.
 const type=(p.kind==='child'&&p.age<=4)?1:6;
 challenge=S.makeChallenge({player:p,type,field:p.pos,roll:pending.roll,tables:config.tables,skillStep:config.adaptive?p.learning?.step||0:0,skillSteps:skillStepsFor(p)});
 challenge.exerciseId=newExerciseId();helpUsed=false;
 phase='question';render();const task=challenge,g=gameToken;
 const spoken=say(`${p.name}! Her kommer din superopgave: ${challenge.question}`);
 if(p.isCPU)scheduleCPU('question');else void spoken.then(()=>{if(g===gameToken&&phase==='question'&&challenge===task)startAdultTimer()});
}
async function finishSuper(){
 if(!pending||busy)return;
 const g=gameToken,p=players[turn];busy=true;
 if(pending.superCorrect){
  pending.target=A.destination(p.pos,3,config.start,config.goal);
  phase='moving';render();await hopSteps(p,pending.target);
  if(g!==gameToken)return;
 }
 busy=false;completeTurn({announce:false});
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
function celebrateWin(){
 if(prefersLessMotion)return;
 const old=$('victoryFanfare');if(old)old.remove();
 const fanfare=document.createElement('div');fanfare.id='victoryFanfare';
 fanfare.className='victory-fanfare';fanfare.setAttribute('aria-hidden','true');
 const symbols=['⭐','🥕','✨','🎉'];
 for(let i=0;i<20;i++){
  const spark=document.createElement('span');spark.className='victory-spark';
  spark.textContent=symbols[i%symbols.length];
  spark.style.left=(5+(i*37)%90)+'%';spark.style.animationDelay=(i%6)*.12+'s';
  spark.style.animationDuration=(2.2+(i%5)*.21)+'s';
  fanfare.append(spark);
 }
 document.body.append(fanfare);
 setTimeout(()=>fanfare.remove(),4000);
}
function declareWin(p){
 if(phase==='win')return;
 winner=p;phase='win';G.clear(safeStorage());
 if(L){try{L.record(safeStorage(),players,p.id)}catch(e){console.warn('Topscore kunne ikke gemmes',e)}}
 render();celebrateWin();say(`Hov hov! Tillykke ${p.name}! Du vandt ÆselKlog Talstien!`);
}
function nextTurn(){
 if(busy||(phase!=='result'&&phase!=='skipped'))return;
 turn=(turn+1)%players.length;phase='move';pending=null;challenge=null;resultLines=[];extraRollUsed=false;
 const p=players[turn];
 if(p.skipNextTurn){
  p.skipNextTurn=false;phase='skipped';resultLines=[`💧 ${p.name} springer denne tur over efter vandpytten.`];
  render();say(`${p.name} har våde hove og står over denne tur!`);
  if(p.isCPU){const g=gameToken;void (async()=>{await lastNarration;await pauseBeat();await waitUntilVisible();if(g===gameToken&&phase==='skipped'&&players[turn]===p)nextTurn()})()}
  return;
 }
 render();say(`Hov hov! Nu er det ${p.name}s tur.`);
 if(p.isCPU)scheduleCPU('move');
}
function scheduleCPU(which){
 const g=gameToken,p=players[turn];
 // CPU må ikke fortsætte, mens Mia stadig læser spillerens tur eller opgaven højt.
 const speaking=lastNarration;
 void (async()=>{
  await speaking;
  await pauseBeat();
  await waitUntilVisible();
  if(g!==gameToken||phase!==which||players[turn]!==p||!p.isCPU||busy)return;
  if(which==='question'){
   const pass=Math.random()>.30;
   const idx=pass?challenge.options.indexOf(challenge.correct):challenge.options.findIndex(v=>v!==challenge.correct);
   if(idx<0)return;
   const spokenAnswer=challenge.options[idx];
   const bubble=$('cpuSays');
   if(bubble)bubble.textContent='🫏 Æslet svarer: '+spokenAnswer;
   const chosen=$(`turnPanel`)?.querySelector(`button[data-act="answer-${idx}"]`);
   if(chosen)chosen.classList.add('cpu-chosen');
   await say(CV.makeReply(spokenAnswer),{cpu:true});
   await pauseBeat();
   await waitUntilVisible();
   if(g===gameToken&&phase==='question'&&players[turn]===p&&!busy)processAnswer(idx);
  }else showDie(which);
 })();
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
 else if(a==='help'&&phase==='question'){helpUsed=true;$('tip').hidden=!$('tip').hidden;say(challenge.help)}
 else if(a==='skip')skipChallenge();
 else if(a.startsWith('swap-')&&phase==='swap')swapWith(a.slice(5));
 else if(a==='swap-none'&&phase==='swap'){resultLines.push('🔄 Ingen bytte.');phase='result';render()}
 else if(a==='super-yes'&&phase==='super-offer')chooseSuper(true);
 else if(a==='super-no'&&phase==='super-offer')chooseSuper(false);
 else if(a==='next')nextTurn();
 else if(a==='topscore')openTopscore();
 else if(a==='restart'){resetAsync();G.clear(safeStorage());config=null;players=[];phase='setup';show('home');renderResumeCard()}
});
function updatePageAddress(view){
 if(applyingAddress||typeof history==='undefined'||!location.href)return;
 try{const url=new URL(location.href),names={menu:'menu',fishSetup:'torskeklog',fishGame:'torskeklog',setup:'talstien',game:'talstien',cardsSetup:'kortspil',cardsGame:'kortspil',talkort:'talkort',settings:'indstillinger'};if(names[view])url.searchParams.set('spil',names[view]);else url.searchParams.delete('spil');url.hash='';if(url.href!==location.href)history.pushState(null,'',url)}catch{}
}
function openGameAddress(){
 let selected;try{selected=new URL(location.href).searchParams.get('spil')}catch{return}
 const view=location.hash==='#spilmenu'?'menu':({menu:'menu',torskeklog:'fishSetup',talstien:'setup',kortspil:'cardsSetup',talkort:'talkort',indstillinger:'settings'}[selected]||'home');
 if($('game').classList.contains('active')){if(config&&!busy&&!showDiceState&&safePhase())saveCheckpoint();resetAsync()}
 applyingAddress=true;show(view);applyingAddress=false;
}
window.addEventListener('hashchange',openGameAddress);window.addEventListener('popstate',openGameAddress);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openGameAddress,{once:true});else openGameAddress();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
