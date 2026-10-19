(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const candidate=new URL(location.href).searchParams.get('room')?.trim().toUpperCase()||'';
 const room=/^[A-Z0-9]{8}$/.test(candidate)?candidate:'';
 let activeCode='',invite=null;
 const status=text=>{$('inviteStatus').textContent=text};
 if(room){$('setup').classList.add('has-invite');$('joinCode').value=room;$('invitedNotice').hidden=false;$('name').placeholder='Dit navn – så er du klar';}
 let activeGame='';
 function setRoom(code,game=window.AeselOnlineGameType||'cards'){
  if(code===activeCode&&game===activeGame)return;activeGame=game;
  activeCode=code;const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('room',code);if(game==='board')url.searchParams.set('game','board');
  const text=`Vil du være med til ÆselKlog? 🫏\nÅbn linket, skriv dit navn, og deltag i vores ${game==='board'?'Talstien-brætspil':'kortspil'}.\nRumkode: ${code}\n${url.href}`;
  invite={title:'Kom og spil ÆselKlog',text,url:url.href};
  $('inviteLink').value=url.href;$('inviteText').value=text;
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
  try{await navigator.share({title:invite.title,text:`Kom og spil ÆselKlog med mig! 🫏 Rumkode: ${activeCode}`,url:invite.url});status('Invitationen er klar i den valgte app.')}
  catch(e){if(e?.name!=='AbortError')status('Deling kunne ikke åbnes. Brug Kopiér invitation eller Invitér via mail.')}
 };
 window.AeselInvite={room,setRoom};
})();
