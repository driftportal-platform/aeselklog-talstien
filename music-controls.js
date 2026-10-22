/* One music menu in each offline game, backed by the existing audio profiles. */
(()=>{'use strict';const $=id=>document.getElementById(id),M=window.AeselMusic,A=window.AeselAudioSettings;
 let mode=null;
 const top=document.createElement('button');top.id='topMusicToggle';top.type='button';top.className='btn soft small';top.hidden=true;top.setAttribute('aria-pressed','false');document.querySelector('.top-actions').append(top);
 const modes={board:['setup','game'],cards:['cardsSetup','cardsGame'],talkort:['talkort'],fish:['fishSetup','fishGame'],rummy:['rummySetup','rummyGame'],math:['mathSetup','mathGame']};
 const menus=[];
 for(const [kind,views] of Object.entries(modes))for(const view of views){
  const host=$(view),details=document.createElement('details');details.className='paper game-options shared-music-options';details.dataset.musicMode=kind;
  const summary=document.createElement('summary');summary.textContent='🎵 Musik';details.append(summary);
  const body=document.createElement('div');body.className='options-content';
  const toggle=document.createElement('button');toggle.className='btn soft music-menu-toggle';toggle.type='button';toggle.onclick=()=>A.update(kind,{music:!A.forMode(kind).music});body.append(toggle);
  const label=document.createElement('label');label.className='field';label.textContent='Melodi';const track=document.createElement('select');track.className='music-menu-track';for(const [id,item] of Object.entries(M.TRACKS)){const o=document.createElement('option');o.value=id;o.textContent=item.label;track.append(o)}label.append(track);body.append(label);track.onchange=()=>A.update(kind,{track:track.value});
  const volLabel=document.createElement('label');volLabel.className='field';const text=document.createElement('span'),out=document.createElement('output');text.append('Musikstyrke ',out);const volume=document.createElement('input');volume.type='range';volume.min='0';volume.max='100';volume.step='1';volume.className='music-menu-volume';volLabel.append(text,volume);body.append(volLabel);volume.oninput=()=>A.update(kind,{volume:Number(volume.value)});
  const note=document.createElement('p');note.className='tiny';note.textContent='Musikken dæmpes under tale. Dit valg huskes for dette spil på denne enhed.';body.append(note);const status=document.createElement('p');status.className='tiny music-menu-status';status.setAttribute('role','status');body.append(status);details.append(body);menus.push({kind,summary,toggle,track,volume,out,status});
  if(view==='talkort')document.querySelector('.talkort-settings-group').prepend(details);
  else if(view==='game')host.querySelector('.board-toolbar').append(details);
  else if(view==='cardsGame')host.querySelector('.card-game-top').after(details);
  else if(view==='mathGame')host.querySelector('.math-speech-options').before(details);
  else host.append(details);
 }
 function paint(){for(const item of menus){const p=A.forMode(item.kind);item.summary.textContent='🎵 Musik · '+(p.music?'til':'fra');item.toggle.textContent=p.music?'🎵 Musik til':'🎵 Musik fra';item.toggle.setAttribute('aria-pressed',String(p.music===true));item.track.value=p.track;item.volume.value=p.volume;item.out.textContent=p.volume+' %';item.status.textContent=p.music&&p.volume===0?'Musikstyrken er 0 %. Skru op for at høre musikken.':mode===item.kind&&M.getState().lastFailure?M.getState().lastFailure:''}if(mode){const on=A.forMode(mode).music===true;top.textContent=on?'🎵 Musik til':'🎵 Musik fra';top.setAttribute('aria-pressed',String(on))}}
 top.onclick=()=>{if(mode)A.update(mode,{music:!A.forMode(mode).music})};
 function activate(view){mode=A.modeFor(view);top.hidden=!mode||view==='game';paint()}
 M.onChange(paint);window.AeselMusicControls={activate};activate(document.querySelector('.view.active')?.id||'home');
})();
