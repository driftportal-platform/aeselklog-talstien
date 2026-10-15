/* ÆselKlog 0.9.15: separate pass-and-play Kortspil interface, no AI requests. */
(()=>{'use strict';
const E=window.AeselCards;
if(!E)return;
const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const unit=(n)=>n===1?'kort':'kort';
let game=null;
let focusedInputCount=2;
const audio=(()=>{try{return new Audio('./donkey-bray.wav')}catch(_){return null}})();
function navigate(view){if(typeof window.AeselShowView==='function')window.AeselShowView(view)}
function safeStore(){try{return window.localStorage}catch(_){return null}}
function readSaved(){try{return E.restore(safeStore()?.getItem(E.SAVE_KEY)||null)}catch(_){return null}}
function save(){try{const store=safeStore();if(!store)return; if(game&&!game.finished)store.setItem(E.SAVE_KEY,JSON.stringify(game));else store.removeItem(E.SAVE_KEY)}catch(_){/* storage full/private */}}
function clear(){try{safeStore()?.removeItem(E.SAVE_KEY)}catch(_){}}
function renderResume(){const saved=readSaved();$('cardsResume').hidden=!saved;
 if(saved)$('cardsResumeInfo').textContent=`${saved.range.replace('-', '–')} · ${saved.players.map(p=>p.name).join(', ')}`;
}
function renderNameInputs(count){
 const holder=$('cardPlayerNames');const prior=[...holder.querySelectorAll('input')].map(x=>x.value);
 holder.replaceChildren();
 for(let i=0;i<count;i++){
  const label=document.createElement('label');label.className='field card-player-field';label.textContent=`Spiller ${i+1}`;
  const input=document.createElement('input');input.type='text';input.maxLength=25;input.required=true;
  input.autocomplete='off';input.name=`cardPlayer${i+1}`;input.value=prior[i]||`Spiller ${i+1}`;
  label.appendChild(input);holder.appendChild(label);
 }
 focusedInputCount=count;
}
function syncVariant(){const isPassing=$('cardVariant').value==='passing';$('cardDonkeySetting').hidden=isPassing;
 $('cardVariantInfo').textContent=isPassing?'Kun ét æselkort findes. Det flyttes til den seneste spiller, der får straf.':'Flere æselkort er i puljen. Har man fået et, beholder man det resten af spillet.';
}
function isPrime(number){if(number<2)return false;for(let i=2;i*i<=number;i++)if(number%i===0)return false;return true;}
function formatNum(n,small=false){
 if(n===null||n===undefined)return '<span class="card-blank">Intet kort</span>';
 const range=Math.ceil(n/20),prime=isPrime(n),ones=n%10;
 return `<article class="number-card number-card--${range} ${small?'number-card--small':''}" aria-label="Talkort ${n}, ${n%2===0?'lige':'ulige'}${prime?', primtal':''}">
   <div class="number-card-info"><span>${n%2?'Ulige':'Lige'}</span><span>${Math.floor(n/10)} tiere + ${ones} enere</span></div>
   <strong>${n}</strong><div class="number-card-foot"><span>${prime?'★ Primtal':(n%2?'● Ulige':'●● Lige')}</span><span>ÆselKlog</span></div></article>`;
}
function cardBack(){return '<div class="card-back" aria-label="Lukket bunke">🫏<small>ÆselKlog</small></div>';}
function renderStack(){
 const center=$('cardsCenter');const [lowest]=E.bounds(game.range);
 center.innerHTML=game.centers.map((cards,i)=>`<div class="card-center-stack"><span>Række ${i+1}</span>${formatNum(cards.at(-1),true)}<small>${lowest}–${cards.at(-1)} · ${cards.length} kort</small></div>`).join('') || '<div class="card-center-empty">Vend det laveste tal, og begynd rækken i midten.</div>';
 const players=$('cardsPlayers');players.innerHTML=game.players.map((p,i)=>{
  const active=i===game.turn;
  return `<div class="card-person ${active?'card-person--active':''}">
    <div class="card-person-top"><strong>${escape(p.name)} ${active&&!game.finished?'· tur':''}</strong><span>${E.remaining(game,i)} talkort</span></div>
    <div class="card-person-cards"><div class="card-person-closed">${p.closed.length?cardBack():'<span class="card-blank">Tom</span>'}<small>Lukket · ${p.closed.length}</small></div><div class="card-person-open">${p.open.length?formatNum(p.open.at(-1),true):'<span class="card-blank">Tom</span>'}<small>Åben · ${p.open.length}</small></div></div>
    <div class="card-person-donkeys">${p.donkeys?`<span class="card-donkey-icons">${Array.from({length:p.donkeys},()=>'<img src="./aeselklog-card.webp" alt="Æselkort">').join('')}</span>`:'Ingen æselkort'} <small>${p.donkeys?'· strafkort':''}</small></div>
   </div>`}).join('');
}
function render(){if(!game)return;
 $('cardsPlayTitle').textContent=`🃏 Kortspil ${game.range.replace('-', '–')} · ${game.variant==='collect'?'Behold æslet':'Send æslet videre'}`;
 $('cardsTurnHeading').textContent=game.finished?'🏆 Spillet er slut':`🎲 ${game.players[game.turn].name}s tur`;
 $('cardsMessage').textContent=game.message;
 $('cardsPending').innerHTML=game.pending!==null?`<span class="card-pending-title">Kortet du vendte</span>${formatNum(game.pending)}`:'<span class="card-pending-quiet">Vend et kort fra den lukkede bunke, eller brug det øverste af dine åbne kort.</span>';
 renderStack();
 const buttons=$('cardMoveButtons');buttons.replaceChildren();
 if(game.finished){
  const h=document.createElement('p');h.className='card-win-text';h.textContent=`🏆 ${game.players[game.winner].name} slap først af med alle talkortene! Æselkortene er straf, ikke talkort.`;buttons.append(h);
  $('cardPenalties').hidden=true;
 }else{
  $('cardPenalties').hidden=false;
  if(game.pending!==null){
   const target=E.preferredTarget(game,game.pending);
   const play=document.createElement('button');play.className='btn main';play.id='cardPlayPending';play.type='button';
   play.textContent=`✓ Læg ${game.pending} på ${target?.caption||'rækken'}`;
   play.addEventListener('click',()=>apply(()=>E.play(game,'pending')));
   buttons.append(play);
  }else{
   const open=E.openPlay(game);
   if(open){
    const card=game.players[game.turn].open.at(-1);
    const play=document.createElement('button');play.type='button';play.id='cardPlayOpen';play.className='btn green';
    play.textContent=`↪ Brug åbent kort ${card} → ${open.caption}`;
    play.addEventListener('click',()=>apply(()=>E.play(game,'open')));
    buttons.append(play);
   }
   const draw=document.createElement('button');draw.type='button';draw.id='cardFlip';draw.className='btn main';draw.textContent='🃏 Vend næste kort';
   draw.addEventListener('click',()=>apply(()=>E.flip(game)));
   buttons.append(draw);
  }
 }
 const selected=Number($('cardPenaltyPlayer').value);
 $('cardPenaltyPlayer').replaceChildren();
 game.players.forEach((p,i)=>{const opt=document.createElement('option');opt.value=String(i);opt.textContent=p.name;$('cardPenaltyPlayer').append(opt)});
 $('cardPenaltyPlayer').value=String(Number.isInteger(selected)&&selected>=0&&selected<game.players.length?selected:game.turn);
 $('cardPenaltyDesc').textContent=game.variant==='passing'
  ?`Et æselkort i hele spillet · ${game.players.find(p=>p.donkeys)?.name||'i puljen'}`
  :`${E.stock(game)} af ${game.donkeyCount} æselkort tilbage i strafpuljen`;
 $('cardsPlayInfo').textContent=`${game.players.length} spillere · ${game.extraPenalty?'Ekstra kortstraf tilvalgt':'Kun æselkort ved fejl'} · ${game.turnCount}. tur`;
}
function apply(fn){try{const result=fn();save();render();return result;}catch(err){$('cardsMessage').textContent=err.message||'Kunne ikke udføre trækket.';return null;}}
function begin(options){try{
 game=E.start(options);save();navigate('cardsGame');render();
 }catch(err){$('cardsSetupError').textContent=err.message}
}
function menu(){game=null;renderResume();navigate('cardsSetup')}
$('cardVariant').addEventListener('change',syncVariant);
$('cardPlayerCount').addEventListener('change',()=>renderNameInputs(Number($('cardPlayerCount').value)));
$('openCardSetup').addEventListener('click',()=>{renderResume();navigate('cardsSetup')});
$('cardsSetupBack').addEventListener('click',()=>navigate('setup'));
$('cardStart').addEventListener('click',()=>{
 $('cardsSetupError').textContent='';
 const names=[...$('cardPlayerNames').querySelectorAll('input')].map(input=>input.value.trim());
 if(readSaved()&&!window.confirm('Et tidligere kortspil bliver erstattet. Vil I starte et nyt?'))return;
 begin({range:$('cardRange').value,variant:$('cardVariant').value,
  donkeyCount:Number($('cardDonkeyCount').value),extraPenalty:$('cardExtraPenalty').checked,names});
});
$('cardsContinue').addEventListener('click',()=>{const saved=readSaved();if(!saved){renderResume();return}game=saved;navigate('cardsGame');render()});
$('cardsDeleteSave').addEventListener('click',()=>{if(!window.confirm('Slet det gemte kortspil? Talstien og læringsprofiler berøres ikke.'))return;clear();renderResume()});
$('cardsHome').addEventListener('click',()=>{save();menu()});
$('cardsSaveHome').addEventListener('click',()=>{save();menu()});
$('cardsGivePenalty').addEventListener('click',()=>{
 if(!game||game.finished)return;
 const index=Number($('cardPenaltyPlayer').value);
 if(!window.confirm(`Giv ${game.players[index]?.name||'spilleren'} straf for et overset eller forkert træk?`))return;
 const result=apply(()=>E.penalty(game,index));
 if(result&&audio){try{audio.currentTime=0;audio.play().catch(()=>{});}catch(_){}}
});
$('cardsRules').addEventListener('click',()=>{$('cardRulesDialog').showModal()});
$('cardsRulesClose').addEventListener('click',()=>{$('cardRulesDialog').close()});
$('cardPhysicalRules').addEventListener('click',()=>{$('cardRulesDialog').showModal()});
$('cardsFinish').addEventListener('click',()=>{
 if(!window.confirm('Afslut kortspillet og slet den lokale kortspil-gemning?'))return;
 clear();menu();
});
renderNameInputs(focusedInputCount);syncVariant();renderResume();
})();
