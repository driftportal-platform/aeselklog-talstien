/* ÆselKlog v0.9.18 – kompakt bord, tryk/træk, valgte fortæller/CPU-stemmer. */
(()=>{'use strict';
const E=window.AeselCards;if(!E)return;
const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let game=null,focusedInputCount=2,chosenSource=null,cpuTimer=null,cpuWatchTimer=null,revision=0,ignoreTapUntil=0;
const audio=(()=>{try{const a=new Audio('./donkey-bray.wav');a.volume=.75;return a;}catch(_){return null}})();
function donkeySound(){if(!audio)return;try{audio.pause();audio.currentTime=0;void audio.play().catch(()=>{});}catch(_){}}
const CARD_VOICE_KEY='aeselklog-korttale-v1';
let cardVoiceOn=true;try{cardVoiceOn=localStorage.getItem(CARD_VOICE_KEY)!=='off'}catch(_){}
let speechDone=Promise.resolve();
let lastCardNumber=null,lastCardCpu=false;
function updateVoiceToggle(){const b=$('cardsVoiceToggle');if(!b)return;b.textContent=cardVoiceOn?'🔊 Tale til':'🔇 Tale fra';b.setAttribute('aria-pressed',String(cardVoiceOn));}
function announceCard(message,{cpu=false}={}){
 if(!cardVoiceOn||!window.AeselVoice?.enabled?.())return Promise.resolve();
 const content=String(message||'').slice(0,230).trim();if(!content)return Promise.resolve();
 try{return Promise.resolve(window.AeselVoice.say(content,{cpu})).catch(()=>{})}catch(_){return Promise.resolve()}
}
function stopVoice(){window.AeselVoice?.stop?.();speechDone=Promise.resolve();}

function navigate(view){if(typeof window.AeselShowView==='function')window.AeselShowView(view)}
function safeStore(){try{return window.localStorage}catch(_){return null}}
function readSaved(){try{return E.restore(safeStore()?.getItem(E.SAVE_KEY)||null)}catch(_){return null}}
function save(){try{const s=safeStore();if(!s)return;if(game&&!game.finished)s.setItem(E.SAVE_KEY,JSON.stringify(game));else s.removeItem(E.SAVE_KEY)}catch(_){}}
function clear(){try{safeStore()?.removeItem(E.SAVE_KEY)}catch(_){}}
function stopTimers(){revision++;clearTimeout(cpuTimer);clearTimeout(cpuWatchTimer);cpuTimer=null;cpuWatchTimer=null;}
function renderResume(){const saved=readSaved();$('cardsResume').hidden=!saved;
 if(saved)$('cardsResumeInfo').textContent=`${saved.range.replace('-', '–')} · ${saved.players.map(p=>p.name+(p.isCPU?' (CPU)':'')).join(', ')}`;}
function renderNameInputs(count){
 const holder=$('cardPlayerNames'),prior=[...holder.querySelectorAll('input')].map(input=>input.value);
 holder.replaceChildren();
 for(let i=0;i<count;i++){
  const label=document.createElement('label');label.className='field card-player-field';label.textContent=`Spiller ${i+1}`;
  const input=document.createElement('input');input.type='text';input.maxLength=25;input.required=true;input.autocomplete='off';input.name=`cardPlayer${i+1}`;
  input.value=prior[i]||`Spiller ${i+1}`;label.appendChild(input);holder.appendChild(label);
 }
 focusedInputCount=count;
}
function syncCpuSetting(){
 const isCpu=$('cardCpuCheck').checked;
 const one=$('cardPlayerCount').querySelector('option[value="1"]');if(one)one.disabled=!isCpu;
 if(!isCpu&&Number($('cardPlayerCount').value)<2)$('cardPlayerCount').value='2';
 renderNameInputs(Number($('cardPlayerCount').value));
 $('cardCpuHint').textContent=isCpu?'Du kan spille alene mod Æslet. Æslet vender og lægger selv kort, og kan opdage fejl – men ikke altid.':'I spiller på samme enhed og holder selv øje med de andres træk.';
}
function syncVariant(){const passing=$('cardVariant').value==='passing';$('cardDonkeySetting').hidden=passing;
 $('cardVariantInfo').textContent=passing?'Kun ét æselkort findes. Det flyttes til den seneste spiller, der får straf.':'Flere æselkort er i puljen. Har man fået et, beholder man det resten af spillet.';}
function isPrime(n){if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true}
function numCard(n,small=false){
 if(n===null||n===undefined)return '<span class="card-blank">Intet kort</span>';
 const prime=isPrime(n),ones=n%10,range=Math.ceil(n/20);
 return `<article class="number-card number-card--${range} ${small?'number-card--small':''}" aria-label="Talkort ${n}, ${n%2===0?'lige':'ulige'}${prime?', primtal':''}">
  <div class="number-card-info"><span>${n%2?'Ulige':'Lige'}</span><span>${Math.floor(n/10)} tiere + ${ones} enere</span></div>
  <strong>${n}</strong><div class="number-card-foot"><span>${prime?'★ Primtal':(n%2?'● Ulige':'●● Lige')}</span><span>ÆselKlog</span></div></article>`;
}
function cardBack(){return '<div class="card-back" aria-hidden="true">🫏<small>ÆselKlog</small></div>'}
const userTurn=()=>game&&!game.finished&&!game.players[game.turn].isCPU;
function sourceElement(source,markup){return `<div class="card-draggable ${chosenSource===source?'card-selected':''}" role="button" tabindex="0" aria-label="Vælg kort til at flytte" data-card-source="${source}">${markup}</div>`;}
function targetAttributes(kind,index){return `data-card-target="true" data-target-kind="${kind}" data-target-index="${index}" tabindex="0" role="button" aria-label="Læg kort på ${kind==='center'?`midterrække ${index+1}`:kind==='new-center'?'ny midterrække':kind==='self-open'?'egen åbne bunke':game.players[index].name+'s åbne bunke'}"`;}
function renderStacks(){
 const [lowest]=E.bounds(game.range);
 $('cardsCenter').innerHTML=game.centers.map((row,i)=>`<div class="card-center-stack card-dropzone" ${targetAttributes('center',i)}><span>Række ${i+1}</span>${numCard(row.at(-1),true)}<small>${lowest}–${row.at(-1)} · ${row.length} kort</small></div>`).join('')+
  (game.centers.length<5?`<div class="card-new-center card-dropzone" ${targetAttributes('new-center',game.centers.length)}><span>＋</span><strong>Ny række</strong><small>Begynd en ny række i midten</small></div>`:'');
 $('cardsPlayers').innerHTML=game.players.map((p,i)=>{
  const active=i===game.turn,canAct=active&&userTurn(),canFlip=canAct&&game.pending===null;
  const ownOpen=canAct&&game.pending!==null;
  const openSource=canAct&&game.pending===null&&p.open.length>0;
  const dest=i!==game.turn?'player':ownOpen?'self-open':null;
  const openAttrs=dest?targetAttributes(dest,i):'';
  return `<div class="card-person ${active?'card-person--active':''} ${p.isCPU?'card-person--cpu':''}">
    <div class="card-person-top"><strong>${escape(p.name)}${p.isCPU?' 🫏 CPU':''} ${active&&!game.finished?'· tur':''}</strong><span>${E.remaining(game,i)} talkort</span></div>
    <div class="card-person-cards"><div class="card-person-closed ${canFlip?'card-closed-clickable':''}" ${canFlip?'data-card-flip="true" role="button" tabindex="0" aria-label="Vend et kort fra din lukkede bunke"':''}>${p.closed.length?cardBack():'<span class="card-blank">Tom</span>'}${active&&game.pending!==null?`<div class="card-flipped-over" aria-label="Vendt kort ${game.pending}">${canAct?sourceElement('pending',numCard(game.pending,true)):numCard(game.pending,true)}</div>`:''}<small>${game.pending!==null&&active?'Vendt kort · ': 'Lukket · '}${p.closed.length}</small></div>
    <div class="card-person-open ${dest?'card-dropzone':''}" ${openAttrs}>${openSource?sourceElement('open',numCard(p.open.at(-1),true)):(p.open.length?numCard(p.open.at(-1),true):'<span class="card-blank">Tom</span>')}<small>Åben · ${p.open.length}</small></div></div>
    <div class="card-person-donkeys">${p.donkeys?`<span class="card-donkey-icons">${Array.from({length:p.donkeys},()=>'<img src="./aeselklog-card.webp" alt="Æselkort">').join('')}</span>`:'Ingen æselkort'} <small>${p.donkeys?'· strafkort':''}</small></div></div>`;
 }).join('');
}
function chooseSource(src){if(!userTurn())return;chosenSource=chosenSource===src?null:src;render();
 if(chosenSource)$('cardInteractionHint').textContent='Vælg en bunke i midten eller hos en anden spiller. Et forkert træk bliver ikke blokeret.';
}
function act(fn){
 if(!game)return null;
 stopTimers();chosenSource=null;
 try{const priorTurn=game.turn,out=fn();save();render();
  const speaker=game.players[priorTurn];
  let line='';
  if(out?.caught)line='Hov hov! Det var en fejl. Et æselkort!';
  else if(game.finished)line='Hurra! Vi har en vinder!';
  else if(out?.target&&Number.isFinite(out.number))line=speaker.isCPU?`Æslet lægger ${out.number}.`:`${out.number}.`;
  else if(out&&Number.isFinite(out.number))line=`${out.number}.`;
  else if(out?.assigned!==undefined)line='Et æselkort i straf!';
  else if(game.turn!==priorTurn)line='Næste spillers tur!';
  if(Number.isInteger(out?.number)&&!out?.caught&&game.lastAction==='flip'){lastCardNumber=out.number;lastCardCpu=!!speaker?.isCPU;speechDone=cardVoiceOn&&window.AeselVoice?.enabled?.()?Promise.resolve(window.AeselVoice.number(out.number,{cpu:lastCardCpu,preferSelectedVoice:true})):Promise.resolve();}
  else if(out?.target&&Number.isFinite(out.number)){speechDone=Promise.resolve();}
  else speechDone=announceCard(line,{cpu:!!speaker?.isCPU});
  schedule(out);return out;}
 catch(err){$('cardsMessage').textContent=err.message||'Trækket kunne ikke udføres.';renderControls();return null;}
}
function place(src,target){if(!userTurn())return;act(()=>E.placeManual(game,src,target));}
function flip(){if(!userTurn())return;act(()=>E.flipManual(game));}
function discard(){if(!userTurn())return;act(()=>E.discardManual(game));}
function renderControls(){
 const holder=$('cardMoveButtons');if(!holder)return;holder.replaceChildren();
 if(!game)return;
 if(game.finished){holder.innerHTML=`<p class="card-win-text">🏆 ${escape(game.players[game.winner].name)} kom af med sine talkort!</p>`;return;}
 const p=game.players[game.turn];if(p.isCPU)return;
 const button=(label,id,act)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='btn soft small';b.textContent=label;b.addEventListener('click',act);holder.append(b)};
 if(game.pending!==null){button('↪ Læg i egen åbne bunke','cardDiscard',discard);}
 else{button('🃏 Vend kort','cardFlip',flip);}
}
function render(){if(!game)return;
 $('cardsPlayTitle').textContent=`🃏 Kortspil ${game.range.replace('-', '–')} · ${game.variant==='collect'?'Behold æslet':'Send æslet videre'}`;
 const p=game.players[game.turn];
 $('cardsTurnHeading').textContent=game.finished?'🏆 Spillet er slut':`${p.isCPU?'🫏 ': '🎲 '}${p.name}s tur`;
 $('cardsMessage').textContent=game.message;
 renderStacks();renderControls();
 const sel=Number($('cardPenaltyPlayer').value);$('cardPenaltyPlayer').replaceChildren();
 game.players.forEach((x,i)=>{const opt=document.createElement('option');opt.value=String(i);opt.textContent=x.name+(x.isCPU?' (CPU)':'');$('cardPenaltyPlayer').append(opt)});
 const last=game.lastMove;
 $('cardPenaltyPlayer').value=String(last&&last.actor>=0?last.actor:Number.isInteger(sel)&&sel>=0&&sel<game.players.length?sel:game.turn);
 $('cardsChallenge').disabled=!last;
 $('cardsChallenge').setAttribute('aria-disabled',String(!last));
 $('cardChallengeHint').textContent=last?`Udfordr ${game.players[last.actor].name}s seneste træk med kort ${last.number}. Er det forkert, bliver det fortrudt og giver straf.`:'Tryk på æselkortet, når I opdager et forkert træk. Appen retter ikke kort automatisk.';
 $('cardPenalties').hidden=false;
 $('cardPenaltyDesc').textContent=game.variant==='passing'?`Ét æselkort i spil · ${game.players.find(x=>x.donkeys)?.name||'i puljen'}`:`${E.stock(game)} af ${game.donkeyCount} æselkort tilbage i strafpuljen`;
 $('cardsPlayInfo').textContent=`${game.players.filter(x=>!x.isCPU).length} personer${game.players.some(x=>x.isCPU)?' + Æslet':''} · ${game.extraPenalty?'Ekstra kortstraf tilvalgt':'Kun æselkort ved fejl'} · ${game.turnCount}. tur`;
 $('cardInteractionHint').textContent=chosenSource?'Tryk på en bunke for at lægge kortet – også hvis placeringen er forkert.':'Træk et kort, eller tryk først på kortet og derefter på den ønskede bunke.';
}
function punish(){if(!game||!game.lastMove)return;
 const move=game.lastMove;
 if(!window.confirm(`Har I opdaget en fejl i ${game.players[move.actor].name}s seneste træk?`))return;
 const result=act(()=>E.challenge(game));if(result?.caught)donkeySound();
}
function manualPenalty(){if(!game||game.finished)return;
 const index=Number($('cardPenaltyPlayer').value);
 if(!window.confirm(`Giv ${game.players[index]?.name||'spilleren'} manuel æselstraf? (Fortryder ikke et korttræk, medmindre I bruger æselkort-knappen.)`))return;
 const result=act(()=>E.penalty(game,index));if(result)donkeySound();
}
function cpuChoiceTarget(source){
 const n=source==='pending'?game.pending:game.players[game.turn].open.at(-1);
 const good=E.preferredTarget(game,n),candidates=[];
 for(let i=0;i<game.centers.length;i++)candidates.push({kind:'center',index:i});
 if(game.centers.length<5)candidates.push({kind:'new-center'});
 for(let i=0;i<game.players.length;i++)if(i!==game.turn)candidates.push({kind:'player',index:i});
 if(source==='pending')candidates.push({kind:'self-open'});
 const illegal=candidates.filter(x=>!(good&&x.kind===good.kind&&(x.kind==='new-center'||x.index===good.index))&&!(x.kind==='self-open'&&!good));
 if(illegal.length&&Math.random()<.07)return illegal[Math.floor(Math.random()*illegal.length)];
 return good||{kind:'self-open'};
}
function cpuStep(){if(!game||game.finished||!game.players[game.turn].isCPU||document.hidden)return;
 const p=game.players[game.turn];
 if(game.pending!==null){act(()=>E.placeManual(game,'pending',cpuChoiceTarget('pending')));return;}
 const open=E.openPlay(game);
 if(open&&(p.closed.length===0||Math.random()<.5)){act(()=>E.placeManual(game,'open',cpuChoiceTarget('open')));return;}
 act(()=>E.flipManual(game));
}
function schedule(result){if(!game||game.finished||!$('cardsGame').classList.contains('active')||document.hidden||$('cardRulesDialog').open)return;
 const thisRevision=revision;
 void Promise.resolve(speechDone).catch(()=>{}).then(()=>{if(thisRevision!==revision||!game||game.finished||document.hidden||!$('cardsGame').classList.contains('active')||$('cardRulesDialog').open)return;runTurnTimers(thisRevision);});
}
function runTurnTimers(thisRevision){
 const cpuIndex=game.players.findIndex(x=>x.isCPU);
 if(cpuIndex>=0&&game.lastMove&&!game.lastMove.valid&&game.lastMove.actor!==cpuIndex){
  const actualMove=game.lastMove;
  cpuWatchTimer=setTimeout(()=>{
   if(thisRevision!==revision||!game||game.lastMove!==actualMove||document.hidden)return;
   if(Math.random()<.72){const found=act(()=>E.challenge(game));if(found?.caught)donkeySound()}
  },1100);
 }
 if(game.players[game.turn]?.isCPU){
  cpuTimer=setTimeout(()=>{if(thisRevision!==revision)return;cpuStep();},game.lastMove?.actor===cpuIndex?1700:1100);
 }
}
function begin(options){try{stopTimers();game=E.start(options);save();navigate('cardsGame');render();speechDone=announceCard('Velkommen til kortspillet!');schedule();}catch(e){$('cardsSetupError').textContent=e.message}}
function menu(){stopTimers();stopVoice();chosenSource=null;game=null;renderResume();navigate('cardsSetup')}
function targetFrom(el){const t=el?.closest('[data-card-target="true"]');if(!t)return null;
 return {kind:t.dataset.targetKind,index:Number(t.dataset.targetIndex)};}
function onBoardClick(event){if(!game)return;
 if(event.target.closest('[data-card-flip="true"]')){flip();return;}
 const source=event.target.closest('[data-card-source]');
 if(source){if(Date.now()>=ignoreTapUntil)chooseSource(source.dataset.cardSource);return;}
 const target=targetFrom(event.target);
 if(target&&chosenSource){const src=chosenSource;place(src,target);}
}
// Pointer Events (ikke HTML5 drag/drop, som er upålideligt på iPhone).
let drag=null,edgeVelocity=0,edgeFrame=null;
function scrollOnEdge(){
 if(!drag?.moving||!edgeVelocity){edgeFrame=null;return;}
 window.scrollBy(0,edgeVelocity);
 edgeFrame=window.requestAnimationFrame(scrollOnEdge);
}
function dragCleanup(){
 if(edgeFrame!==null)cancelAnimationFrame(edgeFrame);edgeFrame=null;edgeVelocity=0;
 if(!drag)return;drag.ghost?.remove();drag=null;
 document.querySelectorAll('.card-dropzone.card-hover').forEach(x=>x.classList.remove('card-hover'));
}
function dragStart(e){const source=e.target.closest('[data-card-source]');if(!source||!userTurn()||e.button>0)return;
 dragCleanup();drag={id:e.pointerId,source:source.dataset.cardSource,x:e.clientX,y:e.clientY,ghost:null,moving:false};
 if(e.pointerType!=='mouse')e.preventDefault();
}
function dragMove(e){if(!drag||e.pointerId!==drag.id)return;
 const dist=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);
 if(dist>9&&!drag.moving){drag.moving=true;drag.ghost=document.createElement('div');drag.ghost.className='card-drag-ghost';
  const n=drag.source==='pending'?game.pending:game.players[game.turn].open.at(-1);drag.ghost.innerHTML=numCard(n,true);document.body.appendChild(drag.ghost);}
 if(!drag.moving)return;e.preventDefault();
 edgeVelocity=e.clientY>window.innerHeight-85?14:e.clientY<65?-14:0;
 if(edgeVelocity&&!edgeFrame)edgeFrame=requestAnimationFrame(scrollOnEdge);
 drag.ghost.style.left=`${e.clientX}px`;drag.ghost.style.top=`${e.clientY}px`;
 document.querySelectorAll('.card-dropzone.card-hover').forEach(x=>x.classList.remove('card-hover'));
 document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-card-target="true"]')?.classList.add('card-hover');
}
function dragEnd(e){if(!drag||e.pointerId!==drag.id)return;
 const {source,moving}=drag,target=moving?targetFrom(document.elementFromPoint(e.clientX,e.clientY)):null;
 dragCleanup();if(moving){e.preventDefault();if(target)place(source,target);else $('cardInteractionHint').textContent='Slip kortet på en bunke. Kortet ligger stadig hos dig.';}
 else{ignoreTapUntil=Date.now()+180;chooseSource(source);}
 // Efter pointerup kan browseren sende endnu et click-event. Det må ikke ophæve valg af kort.
}
const playRoot=$('cardsGame');playRoot.addEventListener('click',onBoardClick);
playRoot.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"][tabindex]')){e.preventDefault();e.target.click()}});
playRoot.addEventListener('pointerdown',dragStart);document.addEventListener('pointermove',dragMove,{passive:false});document.addEventListener('pointerup',dragEnd);
document.addEventListener('pointercancel',dragCleanup);
$('cardVariant').addEventListener('change',syncVariant);
$('cardCpuCheck').addEventListener('change',syncCpuSetting);
$('cardPlayerCount').addEventListener('change',()=>renderNameInputs(Number($('cardPlayerCount').value)));
$('openCardSetup').addEventListener('click',()=>{renderResume();navigate('cardsSetup')});
$('cardsSetupBack').addEventListener('click',()=>navigate('setup'));
$('cardStart').addEventListener('click',()=>{
 $('cardsSetupError').textContent='';const names=[...$('cardPlayerNames').querySelectorAll('input')].map(input=>input.value.trim());
 if(readSaved()&&!window.confirm('Et tidligere kortspil bliver erstattet. Vil I starte et nyt?'))return;
 begin({range:$('cardRange').value,variant:$('cardVariant').value,donkeyCount:Number($('cardDonkeyCount').value),extraPenalty:$('cardExtraPenalty').checked,names,vsCPU:$('cardCpuCheck').checked});
});
$('cardsContinue').addEventListener('click',()=>{const saved=readSaved();if(!saved){renderResume();return}stopTimers();game=saved;navigate('cardsGame');render();speechDone=announceCard('Vi fortsætter kortspillet!');schedule()});
$('cardsDeleteSave').addEventListener('click',()=>{if(!window.confirm('Slet det gemte kortspil? Talstien og læringsprofiler berøres ikke.'))return;clear();renderResume()});
$('cardsRepeatNumber')?.addEventListener('click',()=>{if(lastCardNumber!==null)void window.AeselVoice?.number?.(lastCardNumber,{repeat:true,cpu:lastCardCpu,preferSelectedVoice:true});});
$('cardsVoiceToggle')?.addEventListener('click',()=>{cardVoiceOn=!cardVoiceOn;try{localStorage.setItem(CARD_VOICE_KEY,cardVoiceOn?'on':'off')}catch(_){};if(!cardVoiceOn)stopVoice();updateVoiceToggle();});
updateVoiceToggle();
$('cardsHome').addEventListener('click',()=>{save();menu()});
$('cardsSaveHome').addEventListener('click',()=>{save();menu()});
$('cardsChallenge').addEventListener('click',punish);
$('cardsGivePenalty').addEventListener('click',manualPenalty);
function openRules(){stopTimers();$('cardRulesDialog').showModal()}
$('cardsRules').addEventListener('click',openRules);
$('cardsRulesClose').addEventListener('click',()=>{$('cardRulesDialog').close()});
$('cardPhysicalRules').addEventListener('click',openRules);
$('cardRulesDialog').addEventListener('close',()=>{if(game)schedule()});
$('cardsFinish').addEventListener('click',()=>{if(!window.confirm('Afslut kortspillet og slet den lokale kortspil-gemning?'))return;clear();menu()});
// Undgå at CPU tager nye træk, mens spillet er i baggrunden.
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTimers()}else if(game&&$('cardsGame').classList.contains('active'))schedule()});
renderNameInputs(focusedInputCount);syncVariant();syncCpuSetting();renderResume();
})();
