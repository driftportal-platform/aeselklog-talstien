/* Danish task/answer narration and cancellation around the shared game-master voices. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselMathSpeech=api})(globalThis,()=>{
 'use strict';
 const words={add:'plus',subtract:'minus',multiply:'gange',divide:'divideret med'};
 const name=value=>String(value||'').replace(/\s+/g,' ').trim().slice(0,25);
 function question(p,player){const n=name(player);return `${n?n+', ':''}hvad er ${p.a} ${words[p.op]} ${p.b}?`}
 function answer(raw,correct,player){const n=name(player),value=Number(raw);return `Du svarede ${value}. ${correct?`Flot klaret${n?', '+n:''}! Det er helt rigtigt.`:`Det er ikke helt rigtigt endnu${n?', '+n:''}. Skal vi prøve igen?`}`}
 function create({isActive,isEnabled,getVoice,listVoices,loadVoices,say,stop,status}){
  let serial=0,busy=false;
  function cancel(){serial++;if(busy)stop();busy=false;status('')}
  async function read(text){
   cancel();const id=serial;
   if(!isActive())return;
   if(!isEnabled()){status('Lyd er slået fra. Slå Lyd til øverst for at høre oplæsningen.');return}
   busy=true;status('Læser op…',true);let issue='';
   try{
    const voice=getVoice();
    if(!['current','device'].includes(voice)&&!listVoices().some(v=>v.id===voice))await loadVoices();
    if(id!==serial||!isActive()||!isEnabled())return;
    if(!['current','device'].includes(voice)&&!listVoices().some(v=>v.id===voice))throw Error('Den valgte stemme er ikke tilgængelig. Hent stemmer igen, eller vælg en anden.');
    await say(text,{voice,language:'da-DK'});
   }catch(e){issue=e.message||'Oplæsningen kunne ikke starte. Prøv Læs op igen.'}
   finally{if(id===serial){busy=false;if(isActive())status(issue,false)}}
  }
  return {read,stop:cancel};
 }
 return {name,question,answer,create};
});
