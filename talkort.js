/* ÆselKlog v0.9.29 – talkort, udtaletræning og automatisk gennemgang. */
(()=>{'use strict';
const $=id=>document.getElementById(id),NUM=window.AeselNumbers;
if(!NUM||!$('talkort'))return;
let number=1,opened=false,readingToken=0,autoSerial=0,auto=false,recorder=null,stream=null,chunks=[],recordedUrl=null,comparisonSerial=0,recordingSerial=0;
const ROLE_KEY='aeselklog-talkort-voice-role-v1',DELAY_KEY='aeselklog-talkort-auto-delay-v1',PRACTICE_KEY='aeselklog-talkort-practice-v1';
let voiceRole='narrator';try{voiceRole=localStorage.getItem(ROLE_KEY)==='donkey'?'donkey':'narrator'}catch(_){}
const bounds=()=>{const r=$('talkortRange').value;return r==='1-100'?[1,100]:r.split('-').map(Number)};
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function clearClip(){comparisonSerial++;if(recordedUrl){URL.revokeObjectURL(recordedUrl);recordedUrl=null} $('talkortHearMine').disabled=true;$('talkortCompare').disabled=true;}
function releaseMic(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function stopRecording(){recordingSerial++;if(recorder&&recorder.state!=='inactive')recorder.stop();else releaseMic();$('talkortRecord').textContent='🎙️ Optag'}
function stopSound(){window.AeselOfflineNumbers?.stop?.();window.AeselVoice?.stop?.()}
function stopAuto(){auto=false;autoSerial++;$('talkortAuto').textContent='▶ Auto';$('talkortAuto').setAttribute('aria-pressed','false')}
function stopAll(){stopAuto();readingToken++;comparisonSerial++;stopSound();stopRecording()}
function read(){const token=++readingToken;if(number<1||!$('talkort').classList.contains('active')||!window.AeselVoice?.enabled?.())return Promise.resolve();
 return Promise.resolve(window.AeselVoice.number(number,{cpu:voiceRole==='donkey',preferSelectedVoice:true})).catch(()=>{if(token===readingToken)$('talkortVoiceInfo').textContent='Oplæsning er ikke tilgængelig på denne enhed.'});}
function render(announce=true){const [lo,hi]=bounds();number=Math.max(number===0?0:lo,Math.min(hi,number));const z=Math.max(1,Math.ceil(number/20)),ones=number%10,tens=Math.floor(number/10),prime=isPrime(number),label=number%2===0?'Lige':'Ulige',place=`${tens} ${tens===1?'tier':'tiere'} + ${ones} ${ones===1?'ener':'enere'}`;
 $('talkortCard').className=`talkort-card zone-${z}`;$('talkortCard').setAttribute('aria-label',`Talkort ${number}. ${label}. ${place}.${prime?' Primtal.':''}`);
 $('talkortNumber').textContent=number; $('talkortCornerBottom').textContent=number; $('talkortCard').querySelector('.talkort-corner:not(.talkort-corner-bottom)').textContent=number;
 for(const id of ['talkortParity','talkortParityBottom'])$(id).textContent=label;
 for(const id of ['talkortPlace','talkortPlaceBottom'])$(id).textContent=place;
 for(const id of ['talkortDots','talkortDotsBottom'])$(id).textContent=number%2===0?'● ●':'●';
 for(const id of ['talkortBlocks','talkortBlocksBottom'])$(id).textContent='▮'.repeat(tens)+(tens&&ones?' ':'')+'●'.repeat(ones);
 for(const id of ['talkortPrime','talkortPrimeBottom'])$(id).hidden=!prime;
 $('talkortPrev').disabled=number<=lo;$('talkortNext').disabled=number>=hi;
 $('talkortProgress').textContent=number===0?'Nulstillet · klar til start':`Tal ${number} · område ${lo}–${hi}`;
 $('talkortJump').value=String(number);$('talkortVoiceInfo').textContent=voiceRole==='donkey'?'🫏 ÆselKlogs stemme til danske tal · gemte lydklip bruges, når de findes.':'🎙️ Spillelederens stemme til danske tal · gemte lydklip bruges, når de findes.';
 if(announce&&number>0)return read();return Promise.resolve();}
function fillJump(){const [lo,hi]=bounds(),select=$('talkortJump');select.replaceChildren();const zero=document.createElement('option');zero.value='0';zero.textContent='0 · start';select.append(zero);for(let i=lo;i<=hi;i++){const o=document.createElement('option');o.value=String(i);o.textContent=String(i);select.append(o)}}
function manual(target){stopAll();clearClip();number=target;return render()}
$('talkortPrev').addEventListener('click',()=>manual(Math.max(bounds()[0],number-1)));
$('talkortNext').addEventListener('click',()=>manual(number===0?bounds()[0]:number+1));
$('talkortRepeat').addEventListener('click',()=>{stopAuto();stopSound();void read()});
$('talkortReset').addEventListener('click',()=>{stopAll();clearClip();number=0;render(false)});
const voiceSelect=$('talkortVoiceRole');if(voiceSelect){voiceSelect.value=voiceRole;voiceSelect.addEventListener('change',()=>{stopAll();voiceRole=voiceSelect.value==='donkey'?'donkey':'narrator';window.AeselAudioSettings?.update?.('talkort',{role:voiceRole});try{localStorage.setItem(ROLE_KEY,voiceRole)}catch(_){};void render()})}
$('talkortRange').addEventListener('change',()=>{stopAll();clearClip();number=bounds()[0];fillJump();render()});
$('talkortJump').addEventListener('change',()=>void manual(Number($('talkortJump').value)));
$('talkortLanguage').addEventListener('change',()=>{window.AeselAudioSettings?.update?.('talkort',{language:$('talkortLanguage').value});stopAll();const s=$('numberLanguageChoice');if(s){s.value=NUM.normalize($('talkortLanguage').value);s.dispatchEvent(new Event('change',{bubbles:true}))}void render()});
$('talkortBack').addEventListener('click',()=>{stopAll();clearClip();window.AeselShowView?.('setup')});
try{$('talkortDelay').value=localStorage.getItem(DELAY_KEY)||'2';$('talkortPracticeEnabled').checked=localStorage.getItem(PRACTICE_KEY)==='true'}catch(_){}
$('talkortPractice').hidden=!$('talkortPracticeEnabled').checked;
$('talkortDelay').addEventListener('change',()=>{try{localStorage.setItem(DELAY_KEY,$('talkortDelay').value)}catch(_){}});
$('talkortPracticeEnabled').addEventListener('change',()=>{const on=$('talkortPracticeEnabled').checked;$('talkortPractice').hidden=!on;if(!on){stopRecording();clearClip()}try{localStorage.setItem(PRACTICE_KEY,String(on))}catch(_){}});
$('talkortAuto').addEventListener('click',()=>{if(auto){stopAuto();stopSound();return}stopRecording();clearClip();auto=true;const id=++autoSerial;$('talkortAuto').textContent='⏸ Stop auto';$('talkortAuto').setAttribute('aria-pressed','true');
 void (async()=>{try{stopSound();if(number===0){number=bounds()[0]}while(auto&&autoSerial===id&&$('talkort').classList.contains('active')){stopSound();await render(true);if(!auto||autoSerial!==id)break;if(number>=bounds()[1])break;await delay(Number($('talkortDelay').value)*1000);if(!auto||autoSerial!==id)break;number++;clearClip()}}finally{if(autoSerial===id)stopAuto()}})();});
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
$('talkortCompare').addEventListener('click',()=>{if(!recordedUrl||number===0)return;stopAuto();stopSound();const token=++comparisonSerial;status('Afspiller først den rigtige udtale…');void(async()=>{await read();if(token!==comparisonSerial)return;await delay(400);if(token!==comparisonSerial)return;status('Afspiller din optagelse…');await playMine();if(token===comparisonSerial)status('Du kan øve dig igen!')})()});
function activate(){if(!$('talkort').classList.contains('active')){if(opened){stopAll();clearClip()}opened=false;return}if(opened)return;opened=true;const saved=window.AeselAudioSettings?.current?.();$('talkortLanguage').value=NUM.normalize(saved?.language||'da');fillJump();render()}
new MutationObserver(activate).observe($('talkort'),{attributes:true,attributeFilter:['class']});fillJump();render(false);activate();
})();
