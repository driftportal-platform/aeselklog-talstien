/* ÆselKlog v0.9.26 – selvstændig Talkort-viser med fælles talstemme. */
(()=>{'use strict';
const $=id=>document.getElementById(id), NUM=window.AeselNumbers;
if(!NUM||!$('talkort'))return;
let number=1,opened=false,readingToken=0;
const ROLE_KEY='aeselklog-talkort-voice-role-v1';
let voiceRole='narrator';
try{voiceRole=localStorage.getItem(ROLE_KEY)==='donkey'?'donkey':'narrator'}catch(_){}
const bounds=()=>{const r=$('talkortRange').value;if(r==='1-100')return [1,100];return r.split('-').map(Number)};
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
function read(){
 const token=++readingToken;
 if(!$('talkort').classList.contains('active')||!window.AeselVoice?.enabled?.())return;
 void Promise.resolve(window.AeselVoice.number(number,{cpu:voiceRole==='donkey',preferSelectedVoice:true})).catch(()=>{
  if(token===readingToken)$('talkortVoiceInfo').textContent='Oplæsning er ikke tilgængelig på denne enhed.';
 });
}
function render(announce=true){
 const [lo,hi]=bounds();number=Math.max(lo,Math.min(hi,number));
 const z=Math.ceil(number/20),ones=number%10,tens=Math.floor(number/10),prime=isPrime(number);
 const label=number%2===0?'Lige':'Ulige',place=`${tens} ${tens===1?'tier':'tiere'} + ${ones} ${ones===1?'ener':'enere'}`;
 const dots=number%2===0?'● ●':'●',blocks='▮'.repeat(tens)+(tens&&ones?' ':'')+'●'.repeat(ones);
 $('talkortCard').className=`talkort-card zone-${z}`;$('talkortCard').setAttribute('aria-label',`Talkort ${number}. ${label}. ${place}.${prime?' Primtal.':''}`);
 $('talkortNumber').textContent=number;
 for(const id of ['talkortCornerBottom'])$(id).textContent=number;
 $('talkortCard').querySelector('.talkort-corner:not(.talkort-corner-bottom)').textContent=number;
 for(const id of ['talkortParity','talkortParityBottom'])$(id).textContent=label;
 for(const id of ['talkortPlace','talkortPlaceBottom'])$(id).textContent=place;
 for(const id of ['talkortDots','talkortDotsBottom'])$(id).textContent=dots;
 for(const id of ['talkortBlocks','talkortBlocksBottom'])$(id).textContent=blocks;
 for(const id of ['talkortPrime','talkortPrimeBottom'])$(id).hidden=!prime;
 $('talkortPrev').disabled=number<=lo;$('talkortNext').disabled=number>=hi;
 $('talkortProgress').textContent=`Tal ${number} · område ${lo}–${hi}`;
 $('talkortJump').value=String(number);
 $('talkortVoiceInfo').textContent=voiceRole==='donkey'?'🫏 ÆselKlogs stemme til danske tal · gemte lydklip bruges, når de findes.':'🎙️ Spillelederens stemme til danske tal · gemte lydklip bruges, når de findes.';
 if(announce)read();
}
function fillJump(){const [lo,hi]=bounds(),select=$('talkortJump');select.replaceChildren();for(let i=lo;i<=hi;i++){const o=document.createElement('option');o.value=String(i);o.textContent=`${i}`;select.append(o);}}
function change(delta){number+=delta;render()}
$('talkortPrev').addEventListener('click',()=>change(-1));$('talkortNext').addEventListener('click',()=>change(1));
$('talkortRepeat').addEventListener('click',read);
const voiceSelect=$('talkortVoiceRole');
if(voiceSelect){voiceSelect.value=voiceRole;voiceSelect.addEventListener('change',()=>{voiceRole=voiceSelect.value==='donkey'?'donkey':'narrator';try{localStorage.setItem(ROLE_KEY,voiceRole)}catch(_){}read()})}
$('talkortRange').addEventListener('change',()=>{const [lo]=bounds();number=lo;fillJump();render();});
$('talkortJump').addEventListener('change',()=>{number=Number($('talkortJump').value);render();});
$('talkortLanguage').addEventListener('change',()=>{const s=$('numberLanguageChoice');if(s){s.value=NUM.normalize($('talkortLanguage').value);s.dispatchEvent(new Event('change',{bubbles:true}));}render();});
$('talkortBack').addEventListener('click',()=>{window.AeselOfflineNumbers?.stop?.();window.AeselVoice?.stop?.();window.AeselShowView?.('setup');});
function activate(){if(!$('talkort').classList.contains('active')){opened=false;return;}if(opened)return;opened=true;
 const select=$('numberLanguageChoice');$('talkortLanguage').value=NUM.normalize(select?.value||'da');fillJump();render();}
const observer=new MutationObserver(activate);observer.observe($('talkort'),{attributes:true,attributeFilter:['class']});
fillJump();render(false);activate();
})();
