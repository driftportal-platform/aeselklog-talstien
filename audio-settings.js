/* ÆselKlog v0.9.31 – isolated audio preferences for each game mode. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),KEY='aeselklog-lydprofiler-v1';
 const ids=['board','cards','talkort','fish','rummy','math'];const defaults={
  board:{enabled:true,language:'da',role:'narrator',music:false,track:'gonefishin',volume:32},
  cards:{enabled:true,language:'da',role:'narrator',music:false,track:'gonefishin',volume:32},
  talkort:{enabled:true,language:'da',role:'narrator',music:false,track:'gonefishin',volume:32},
  fish:{music:false,track:'gonefishin',volume:32},rummy:{music:false,track:'gonefishin',volume:32},math:{music:false,track:'gonefishin',volume:32}
 };
 let prefs=JSON.parse(JSON.stringify(defaults)),currentMode='board';
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');for(const id of ids){if(saved?.[id]&&typeof saved[id]==='object')prefs[id]={...prefs[id],...saved[id]}}}catch(_){}
 const modeFor=view=>view==='fishGame'||view==='fishSetup'?'fish':view==='rummyGame'||view==='rummySetup'?'rummy':view==='mathGame'||view==='mathSetup'?'math':view==='talkort'?'talkort':view==='cardsGame'||view==='cardsSetup'?'cards':view==='game'||view==='setup'||view==='learning'?'board':null;
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(_){}};
 function applyMusic(){const p=prefs[currentMode],m=window.AeselMusic;if(!m)return;const now=m.get();if(now.track!==p.track)m.setTrack(p.track);if(now.volume!==p.volume)m.setVolume(p.volume);if(now.enabled!==(p.music===true))m.setEnabled(p.music===true)}
 function apply(){if(['board','cards','talkort'].includes(currentMode))window.AeselApplyAudioProfile?.(prefs[currentMode]);else applyMusic()
  if(currentMode==='talkort'){const l=$('talkortLanguage'),r=$('talkortVoiceRole');if(l)l.value=prefs.talkort.language;if(r)r.value=prefs.talkort.role;}
  const c=$('cardsVoiceToggle');if(c&&currentMode==='cards'){c.setAttribute('aria-pressed',String(prefs.cards.enabled));c.textContent=prefs.cards.enabled?'🔊 Tale til':'🔇 Tale fra'}
 }
 function update(mode,patch){if(!ids.includes(mode))return;prefs[mode]={...prefs[mode],...patch};save();if(currentMode===mode){if(Object.keys(patch).every(k=>['music','track','volume'].includes(k)))applyMusic();else apply();fill()}}
 function activate(view){const m=modeFor(view);if(!m)return;currentMode=m;apply();fill()}
 const dialog=document.createElement('dialog');dialog.id='aeselAudioDialog';dialog.className='aesel-audio-dialog';dialog.setAttribute('aria-label','Lydindstillinger');dialog.innerHTML=`<form method="dialog" class="aesel-audio-panel"><div class="aesel-audio-title"><h2 id="aeselAudioTitle">Lyd</h2><button class="btn soft small" value="close" aria-label="Luk lydindstillinger">✕ Luk</button></div><label class="field"><span>Lyd og oplæsning</span><select id="aeselAudioEnabled"><option value="on">Til</option><option value="off">Fra</option></select></label><label class="field"><span>Taloplæsning</span><select id="aeselAudioLanguage"><option value="da">🇩🇰 Dansk</option><option value="en">🇬🇧 Engelsk</option><option value="de">🇩🇪 Tysk</option><option value="es">🇪🇸 Spansk</option><option value="da-en">🇩🇰 + 🇬🇧 Dansk og engelsk</option><option value="da-de">🇩🇰 + 🇩🇪 Dansk og tysk</option><option value="da-es">🇩🇰 + 🇪🇸 Dansk og spansk</option></select></label><label class="field" id="aeselAudioRoleField"><span>Dansk oplæser</span><select id="aeselAudioRole"><option value="narrator">Spilleleder</option><option value="donkey">ÆselKlog</option></select></label><p class="tiny" id="aeselAudioHint">CPU-æslet bruger altid sin egen optagede stemme ved tal.</p><label class="field"><span>Baggrundsmusik</span><select id="aeselAudioMusic"><option value="off">Fra</option><option value="on">Til</option></select></label><label class="field"><span>Melodi</span><select id="aeselAudioTrack"><option value="gonefishin">Gone Fishin'</option><option value="march">Children's March</option><option value="beary">Beary Fishy</option></select></label><label class="field"><span>Musiklydstyrke <output id="aeselAudioVolumeValue">32 %</output></span><input type="range" id="aeselAudioVolume" min="0" max="100" step="5"></label><p class="tiny">Valgene gemmes særskilt for hvert spil på denne enhed. De 500 MP3-tal deles mellem spillene.</p></form>`;document.body.append(dialog);
 function fill(){if(!['board','cards','talkort'].includes(currentMode))return;const p=prefs[currentMode];$('aeselAudioTitle').textContent=({board:'🎲 Brætspil – lyd',cards:'🃏 Kortspil – lyd',talkort:'🔢 Talkort – lyd'})[currentMode];$('aeselAudioEnabled').value=p.enabled?'on':'off';$('aeselAudioLanguage').value=p.language;$('aeselAudioRole').value=p.role;$('aeselAudioRoleField').hidden=currentMode==='cards';$('aeselAudioMusic').value=p.music?'on':'off';$('aeselAudioTrack').value=p.track;$('aeselAudioVolume').value=p.volume;$('aeselAudioVolumeValue').textContent=p.volume+' %';}
 function open(mode){currentMode=mode;fill();if(!dialog.open)dialog.showModal()}
 for(const [mode,selector] of [['board','#game .status .row'],['cards','#cardsGame .card-game-top .row'],['talkort','#talkortOptions .talkort-options']]){
  const parent=document.querySelector(selector);if(!parent)continue;const b=document.createElement('button');b.type='button';b.className='btn soft small aesel-audio-open';b.textContent='⚙️ Lyd';b.addEventListener('click',()=>open(mode));parent.append(b);
 }
 for(const [id,key,convert] of [['aeselAudioEnabled','enabled',v=>v==='on'],['aeselAudioLanguage','language',v=>v],['aeselAudioRole','role',v=>v],['aeselAudioMusic','music',v=>v==='on'],['aeselAudioTrack','track',v=>v],['aeselAudioVolume','volume',v=>Number(v)]]){
  $(id).addEventListener(id==='aeselAudioVolume'?'input':'change',e=>update(currentMode,{[key]:convert(e.target.value)}));
 }
 for(const [id,key,convert] of [['musicEnabled','music',e=>e.checked],['musicTrack','track',e=>e.value],['musicVolume','volume',e=>Number(e.value)]]){
  $(id)?.addEventListener(id==='musicVolume'?'input':'change',event=>{event.stopImmediatePropagation();update(currentMode,{[key]:convert(event.target)})},true);
 }
 // Existing quick music buttons must update the active mode's profile, not the old shared flag.
 document.addEventListener('click',event=>{
  const id=event.target?.closest?.('button')?.id;
  const mode=id==='cardsMusicToggle'?'cards':id==='gameMusicToggle'||id==='boardMusicToggle'?'board':null;
  if(!mode)return;
  event.preventDefault();event.stopImmediatePropagation();
  update(mode,{music:!prefs[mode].music});
 },true);
 window.AeselAudioSettings={modeFor,activate,update,current:()=>({...prefs[currentMode]}),forMode:mode=>({...prefs[mode]}),open};
 activate(document.querySelector('.view.active')?.id);
})();
