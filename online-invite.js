(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const candidate=new URL(location.href).searchParams.get('room')?.trim().toUpperCase()||'';
 const room=/^[A-Z0-9]{8}$/.test(candidate)?candidate:'';
 let activeCode='',invite=null;
 const status=text=>{$('inviteStatus').textContent=text};
 function codeStatus(text){status(text);$('invitedCodeStatus').textContent=text}
 if(room){$('invitedRoomCode').textContent=room;$('setup').classList.add('has-invite');$('joinCode').value=room;$('invitedNotice').hidden=false;$('name').placeholder='Dit navn – så er du klar';}
 let activeGame='';
 function setRoom(code,game=window.AeselOnlineGameType||'cards'){
  if(code===activeCode&&game===activeGame)return;activeGame=game;
  activeCode=code;const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('room',code);if(['board','fish'].includes(game))url.searchParams.set('game',game);
  const text=`Vil du være med til ÆselKlog? 🫏\nÅbn linket, skriv dit navn, og deltag i vores ${game==='fish'?'TorskeKlog-spil':game==='board'?'Talstien-brætspil':'kortspil'}.\n\nRumkode:\n${code}\n\n${url.href}`;
  invite={title:'Kom og spil ÆselKlog',text,url:url.href};
  $('inviteCodeValue').value=code;$('inviteLink').value=url.href;$('inviteText').value=text;
  $('inviteEmail').href=`mailto:?subject=${encodeURIComponent('Kom og spil ÆselKlog 🫏')}&body=${encodeURIComponent(text)}`;
 }
 async function copy(){
  if(!invite)return;
  try{await navigator.clipboard.writeText(invite.text);status('Invitationen er kopieret. Sæt den ind i en besked eller mail.')}
  catch{const field=$('inviteTextField');field.hidden=false;field.closest('details').open=true;$('inviteText').focus();$('inviteText').select();status('Markér og kopiér teksten i feltet. Den indeholder invitationslinket.')}
 }
 $('copyInvite').onclick=copy;
 $('shareInvite').onclick=async()=>{
  if(!invite)return;
  if(!navigator.share){await copy();return}
  try{await navigator.share({title:invite.title,text:`Kom og spil ÆselKlog med mig! 🫏\n${activeGame==='fish'?'TorskeKlog':activeGame==='board'?'Talstien':'Kortspil'}\n\nRumkode:\n${activeCode}\n\nÅbn linket og skriv dit navn:`,url:invite.url});status('Invitationen er klar i den valgte app.')}
  catch(e){if(e?.name!=='AbortError')status('Deling kunne ikke åbnes. Brug Kopiér invitation eller Invitér via mail.')}
 };
 async function copyCode(){const value=activeCode||room;if(!value)return;try{await navigator.clipboard.writeText(value);codeStatus('Rumkoden er kopieret. Sæt den ind i Messenger eller en anden besked.')}catch{const input=activeCode?$('inviteCodeValue'):$('joinCode');input.focus();input.select();input.setSelectionRange(0,input.value.length);codeStatus('Rumkoden er markeret. Hold på den, og vælg Kopiér.')}}
 function extractCode(text){const value=String(text||'').trim();if(/^[A-Z0-9]{8}$/i.test(value))return value.toUpperCase();const match=value.match(/\bRumkode\s*:\s*([A-Z0-9]{8})(?![A-Z0-9])/i)||value.match(/[?&]room=([A-Z0-9]{8})(?:[&#\s]|$)/i);return match?match[1].toUpperCase():null}
 const pastedStatus=document.createElement('p');pastedStatus.id='joinCodeStatus';pastedStatus.className='tiny';pastedStatus.setAttribute('role','status');$('joinCode').closest('label').after(pastedStatus);
 $('joinCode').addEventListener('paste',event=>{const code=extractCode(event.clipboardData?.getData('text/plain'));if(!code)return;event.preventDefault();$('joinCode').value=code;pastedStatus.textContent='Rumkoden er indsat fra beskeden.'});
 $('copyJoinCode').onclick=copyCode;
 window.AeselInvite={room,setRoom,copyCode,extractCode};
})();
