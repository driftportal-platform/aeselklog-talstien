/* ÆselKlog v0.9.1 – sjove, selvstændige CPU-svar og sikkert valg af AI-stemme.
   Ren logik: ingen API-nøgler, netværk eller spilleroplysninger. */
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AeselCpuVoice=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 function chooseVoice(voices,narrator,preference='auto'){
  const approved=(Array.isArray(voices)?voices:[]).filter(v=>v&&typeof v.id==='string'&&/^[a-zA-Z0-9_-]{1,50}$/.test(v.id));
  if(preference!=='auto'&&approved.some(v=>v.id===preference))return preference;
  const narratorName=approved.find(v=>v.id===narrator)?.name|| (narrator==='mia'?'Mia':'');
  const distinct=approved.find(v=>v.id!==narrator && (!narratorName||!v.name||!String(v.name).toLowerCase().includes(String(narratorName).toLowerCase().split(' ')[0])));
  return distinct?.id||narrator||'mia';
 }
 const intros=[
  'Høhø! Jeg tror, svaret er',
  'Hmmm, mine lange ører siger',
  'Ih, jeg prøver med',
  'Nu skal I høre! Mit svar er',
  'Hov hov! Jeg gætter på'
 ];
 function makeReply(answer,random=Math.random){
  const index=Math.min(intros.length-1,Math.max(0,Math.floor(Number(random())*intros.length)||0));
  const safe=String(answer??'').trim().slice(0,48);
  return `${intros[index]} ${safe}.`;
 }
 function makePreview(){return 'Høhø! Jeg er Æslet. Fem gange tre? Jeg gætter på femten!';}
 return Object.freeze({chooseVoice,makeReply,makePreview});
});
