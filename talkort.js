/* ÆselKlog v0.9.33 – MP3-only talkort, udtaletræning og automatisk gennemgang. */
(()=>{'use strict';
const $=id=>document.getElementById(id),NUM=window.AeselNumbers;
if(!NUM||!$('talkort'))return;
let number=1,opened=false,started=false,runKind='',runPaused=false,visibilityEpoch=0,readingToken=0,autoSerial=0,auto=false,recorder=null,stream=null,chunks=[],recordedUrl=null,comparisonSerial=0,recordingSerial=0;
const ROLE_KEY='aeselklog-talkort-voice-role-v1',DELAY_KEY='aeselklog-talkort-auto-delay-v1',PRACTICE_KEY='aeselklog-talkort-practice-v1';
let voiceRole='narrator';try{voiceRole=localStorage.getItem(ROLE_KEY)==='donkey'?'donkey':'narrator'}catch(_){}
const bounds=()=>{const r=$('talkortRange').value;return r==='1-100'?[1,100]:r.split('-').map(Number)};
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function clearClip(){comparisonSerial++;if(recordedUrl){URL.revokeObjectURL(recordedUrl);recordedUrl=null} $('talkortHearMine').disabled=true;$('talkortCompare').disabled=true;}
function releaseMic(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function stopRecording(){recordingSerial++;if(recorder&&recorder.state!=='inactive')recorder.stop();else releaseMic();$('talkortRecord').textContent='🎙️ Optag'}
function stopSound(){window.AeselOfflineNumbers?.stop?.();window.AeselVoice?.stop?.()}
function stopAuto(){auto=false;runPaused=false;runKind='';autoSerial++;$('talkortAuto').textContent='▶ Auto';$('talkortAuto').setAttribute('aria-pressed','false');$('talkortCountStart').disabled=false;$('talkortCountStop').hidden=true;$('talkortCountResume').hidden=true}
function stopAll(){const wasRunning=auto;stopAuto();if(wasRunning)$('talkortCountStatus').textContent='Auto stoppet.';readingToken++;comparisonSerial++;stopSound();stopRecording()}
// Talkort uses ONLY the five saved MP3 voices for 1–100. Zero and the optional finale use the selected voice.
function read(){
 const token=++readingToken;
 if(!started||!$('talkort').classList.contains('active'))return Promise.resolve(false);
 const profile=window.AeselAudioSettings?.forMode?.('talkort');
 if(profile?.enabled===false)return Promise.resolve(null);
 const language=NUM.normalize($('talkortLanguage').value);
 if(number===0)return (async()=>{for(const part of NUM.parts(0,language)){if(token!==readingToken)return true;await window.AeselVoice?.sayWithVoice?.(part.text,{voice:voiceRole==='donkey'?'donkey':'current',language:part.locale})}return true})();
 const role=$('talkortVoiceRole').value==='donkey'?'donkey':'narrator';
 if(!window.AeselOfflineNumbers?.play){
  $('talkortVoiceInfo').textContent='Gemte lydfiler er ikke indlæst. Prøv at opdatere appen.';
  return Promise.resolve(false);
 }
 return Promise.resolve(window.AeselOfflineNumbers.play(number,language,role,{reliable:true}))
 .then(ok=>{if(token===readingToken&&!ok)$('talkortVoiceInfo').textContent=`Lydfilen til tal ${number} kunne ikke afspilles. Auto er stoppet. Prøv Læs igen eller kontrollér offline-lydene i Indstillinger.`;return ok==='interrupted'?'interrupted':Boolean(ok)})
 .catch(()=>{if(token===readingToken)$('talkortVoiceInfo').textContent=`Lydfilen til tal ${number} er ikke tilgængelig. Auto er stoppet.`;return false});
}
function render(announce=true){const [lo,hi]=runKind==='count'?[0,100]:bounds();number=Math.max(number===0?0:lo,Math.min(hi,number));const z=Math.max(1,Math.ceil(number/20)),ones=number%10,tens=Math.floor(number/10),prime=isPrime(number),label=number%2===0?'Lige':'Ulige',place=`${tens} ${tens===1?'tier':'tiere'} + ${ones} ${ones===1?'ener':'enere'}`;
 $('talkortCard').className=`talkort-card zone-${z}`;$('talkortCard').setAttribute('aria-label',`Talkort ${number}. ${label}. ${place}.${prime?' Primtal.':''}`);
 $('talkortNumber').textContent=number; $('talkortCornerBottom').textContent=number; $('talkortCard').querySelector('.talkort-corner:not(.talkort-corner-bottom)').textContent=number;
 for(const id of ['talkortParity','talkortParityBottom'])$(id).textContent=label;
 for(const id of ['talkortPlace','talkortPlaceBottom'])$(id).textContent=place;
 for(const id of ['talkortDots','talkortDotsBottom'])$(id).textContent=number%2===0?'● ●':'●';
 for(const id of ['talkortBlocks','talkortBlocksBottom'])$(id).textContent='▮'.repeat(tens)+(tens&&ones?' ':'')+'●'.repeat(ones);
 for(const id of ['talkortPrime','talkortPrimeBottom'])$(id).hidden=!prime;
 for(const id of ['talkortRepeat','talkortAuto','talkortRecord'])$(id).disabled=false;$('talkortPrev').disabled=number<=lo;$('talkortNext').disabled=number>=hi;
 $('talkortProgress').textContent=number===0?'Tal 0':`Tal ${number} · område ${lo}–${hi}`;
 $('talkortJump').value=String(number);$('talkortVoiceInfo').textContent=voiceRole==='donkey'?'🫏 ÆselKlogs gemte danske tal. Tryk på kortet for at høre tallet.':'🎙️ Spillelederens gemte danske tal. Tryk på kortet for at høre tallet.';
 if(announce)return read();return Promise.resolve(null);}
function fillJump(){const [lo,hi]=bounds(),select=$('talkortJump');select.replaceChildren();const zero=document.createElement('option');zero.value='0';zero.textContent='0 · start';select.append(zero);for(let i=lo;i<=hi;i++){const o=document.createElement('option');o.value=String(i);o.textContent=String(i);select.append(o)}}
function manual(target){stopAll();clearClip();number=target;started=true;return render()}
$('talkortPrev').addEventListener('click',()=>manual(Math.max(bounds()[0],number-1)));
$('talkortNext').addEventListener('click',()=>manual(number===0?bounds()[0]:number+1));
$('talkortRepeat').addEventListener('click',()=>{stopAll();started=true;void read()});
$('talkortCard').addEventListener('click',()=>{stopAll();started=true;void read()});
$('talkortCard').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('talkortCard').click()}});
$('talkortReset').addEventListener('click',()=>{stopAll();clearClip();started=false;number=0;render(false)});

const voiceSelect=$('talkortVoiceRole');if(voiceSelect){voiceSelect.value=voiceRole;voiceSelect.addEventListener('change',()=>{stopAll();voiceRole=voiceSelect.value==='donkey'?'donkey':'narrator';window.AeselAudioSettings?.update?.('talkort',{role:voiceRole});try{localStorage.setItem(ROLE_KEY,voiceRole)}catch(_){};void render(false)})}
$('talkortRange').addEventListener('change',()=>{stopAll();clearClip();number=bounds()[0];fillJump();render(false)});
$('talkortJump').addEventListener('change',()=>{stopAll();number=Number($('talkortJump').value);void render(false)});
$('talkortLanguage').addEventListener('change',()=>{window.AeselAudioSettings?.update?.('talkort',{language:$('talkortLanguage').value});stopAll();const s=$('numberLanguageChoice');if(s){s.value=NUM.normalize($('talkortLanguage').value);s.dispatchEvent(new Event('change',{bubbles:true}))}void render(false)});
$('talkortBack').addEventListener('click',()=>{stopAll();clearClip();window.AeselShowView?.('menu')});
try{$('talkortDelay').value=localStorage.getItem(DELAY_KEY)||'2';$('talkortPracticeEnabled').checked=localStorage.getItem(PRACTICE_KEY)==='true'}catch(_){}
$('talkortPractice').hidden=!$('talkortPracticeEnabled').checked;
$('talkortDelay').addEventListener('change',()=>{try{localStorage.setItem(DELAY_KEY,$('talkortDelay').value)}catch(_){}});
$('talkortPracticeEnabled').addEventListener('change',()=>{const on=$('talkortPracticeEnabled').checked;$('talkortPractice').hidden=!on;if(!on){stopRecording();clearClip()}try{localStorage.setItem(PRACTICE_KEY,String(on))}catch(_){}});
const alive=id=>auto&&autoSerial===id&&$('talkort').classList.contains('active');
async function waitVisible(id){while(alive(id)&&document.hidden)await delay(100);return alive(id)}
async function readForRun(id){let attempts=0;while(alive(id)){
 if(!await waitVisible(id))return false;const epoch=visibilityEpoch,ok=await read();if(!alive(id))return false;if(epoch!==visibilityEpoch||ok==='interrupted')continue;if(ok!==false)return true;
 if(++attempts<=2){$('talkortCountStatus').textContent=`Prøver lyden til ${number} igen …`;await delay(400);continue}
 runPaused=true;$('talkortCountResume').hidden=false;$('talkortAuto').textContent='▶ Fortsæt Auto';$('talkortCountStatus').textContent=`Lyden kunne ikke afspilles. Sat på pause ved ${number}; tryk Prøv lyden igen.`;
 while(alive(id)&&runPaused)await delay(100);attempts=0;
 }return false}
async function run(sequence,kind){stopAll();clearClip();started=true;auto=true;runKind=kind;if(kind==='count'){$('talkortRange').value='1-100';fillJump()}const id=++autoSerial;$('talkortCountStart').disabled=true;$('talkortCountStop').hidden=false;$('talkortAuto').textContent='■ Stop Auto';$('talkortAuto').setAttribute('aria-pressed','true');
 try{for(let i=0;i<sequence.length;i++){if(!await waitVisible(id))return;number=sequence[i];render(false);$('talkortCountStatus').textContent=(kind==='count'?'Tæller':'Auto')+`: ${number}`;if(!await readForRun(id))return;if(i<sequence.length-1){await delay(window.AeselCounter.pause($('talkortDelay').value));if(!alive(id))return}}
 if(kind==='count'&&alive(id)){const text=$('talkortCountMessage').value.trim();if(text&&window.AeselAudioSettings?.forMode?.('talkort')?.enabled!==false){if(!await waitVisible(id))return;await window.AeselVoice?.sayWithVoice?.(text,{voice:$('talkortCountVoice').value})}}
 if(alive(id))$('talkortCountStatus').textContent=`Færdig ved ${number}.`;
 }catch(e){if(alive(id))$('talkortCountStatus').textContent=e.message||'Oplæsningen kunne ikke afsluttes.'}finally{if(autoSerial===id)stopAuto()}}
$('talkortAuto').addEventListener('click',()=>{if(auto){if(runPaused){runPaused=false;$('talkortCountResume').hidden=true;return}stopAll();return}void run(window.AeselCounter.sequence(number===0?bounds()[0]:number,bounds()[1]),'auto')});
$('talkortCountStart').addEventListener('click',()=>{const from=Number($('talkortCountFrom').value),to=$('talkortCountDirection').value==='down'?0:Number($('talkortCountTo').value);try{if(!$('talkortCountFrom').value.trim()||$('talkortCountDirection').value==='up'&&!$('talkortCountTo').value.trim())throw Error('Skriv et starttal og et sluttal');if($('talkortCountDirection').value==='up'&&from>to)throw Error('Sluttallet skal være mindst starttallet');void run(window.AeselCounter.sequence(from,to),'count')}catch(e){$('talkortCountStatus').textContent=e.message}});
$('talkortCountStop').addEventListener('click',()=>{stopAll();$('talkortCountStatus').textContent=`Stoppet ved ${number}.`});$('talkortCountResume').addEventListener('click',()=>{runPaused=false;$('talkortCountResume').hidden=true;$('talkortAuto').textContent='■ Stop Auto'});
$('talkortCountDirection').addEventListener('change',()=>{stopAll();const up=$('talkortCountDirection').value==='up';$('talkortCountToField').hidden=!up;if(up&&Number($('talkortCountFrom').value)>1)$('talkortCountFrom').value='1'});
function fillFinalVoices(){const select=$('talkortCountVoice'),old=select.value||'current';select.replaceChildren();for(const v of [{id:'current',name:'Spillelederens valgte stemme'},{id:'device',name:'Telefonens stemme'},...(window.AeselVoice?.listVoices?.()||[])]){const o=document.createElement('option');o.value=v.id;o.textContent=v.name;select.append(o)}if([...select.options].some(o=>o.value===old))select.value=old}
$('talkortCountVoice').addEventListener('focus',()=>window.AeselVoice?.loadVoices?.().then(fillFinalVoices));
document.addEventListener('visibilitychange',()=>{if(document.hidden){visibilityEpoch++;stopSound();if(auto)$('talkortCountStatus').textContent='Pause mens siden er skjult. Fortsætter, når du vender tilbage.'}});
fillFinalVoices();
function status(t){$('talkortPracticeStatus').textContent=t}
$('talkortRecord').addEventListener('click',async()=>{
 if(recorder&&recorder.state==='recording'){recorder.stop();return}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('Denne browser understøtter ikke optagelse.');return}
 stopAuto();stopSound();clearClip();chunks=[];
 try{const session=++recordingSerial;stream=await navigator.mediaDevices.getUserMedia({audio:true});if(session!==recordingSerial){releaseMic();return}const type=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));recorder=new MediaRecorder(stream,type?{mimeType:type}:undefined);
 recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
 recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});releaseMic();$('talkortRecord').textContent='🎙️ Optag';if(session!==recordingSerial)return;if(blob.size){recordedUrl=URL.createObjectURL(blob);$('talkortHearMine').disabled=false;$('talkortCompare').disabled=false;status('Optagelsen er klar. Hør den eller sammenlign.')}else status('Ingen lyd blev optaget.')};
 recorder.start();$('talkortRecord').textContent='■ Stop optagelse';status('Optager… Tryk igen for at stoppe.');
 }catch(e){releaseMic();status('Mikrofonen kunne ikke åbnes. Kontroller tilladelsen i browseren.')}});
function playMine(){if(!recordedUrl)return Promise.resolve();const clip=new Audio(recordedUrl);return new Promise(resolve=>{clip.onended=resolve;clip.onerror=resolve;clip.play().catch(resolve)})}
$('talkortHearMine').addEventListener('click',()=>{stopAuto();stopSound();void playMine()});
$('talkortCompare').addEventListener('click',()=>{if(!recordedUrl)return;started=true;stopAuto();stopSound();const token=++comparisonSerial;status('Afspiller først den rigtige udtale…');void(async()=>{await read();if(token!==comparisonSerial)return;await delay(400);if(token!==comparisonSerial)return;status('Afspiller din optagelse…');await playMine();if(token===comparisonSerial)status('Du kan øve dig igen!')})()});
function activate(){if(!$('talkort').classList.contains('active')){if(opened){stopAll();clearClip()}opened=false;started=false;return}if(opened)return;opened=true;started=false;const saved=window.AeselAudioSettings?.current?.();$('talkortLanguage').value=NUM.normalize(saved?.language||'da');fillJump();render(false);fillFinalVoices();window.AeselVoice?.loadVoices?.().then(fillFinalVoices)}
new MutationObserver(activate).observe($('talkort'),{attributes:true,attributeFilter:['class']});fillJump();render(false);activate();
})();
