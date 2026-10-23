/* Danish task/answer narration and cancellation around the shared game-master voices. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselMathSpeech=api})(globalThis,()=>{
 'use strict';
 const words={add:'plus',subtract:'minus',multiply:'gange',divide:'divideret med'};
 const name=value=>String(value||'').replace(/\s+/g,' ').trim().slice(0,25);
 function question(p,player){const n=name(player);return `${n?n+', ':''}hvad er ${p.op==='combined'?p.spoken:p.a+' '+words[p.op]+' '+p.b}?`}
 const replies=Object.freeze({
  right:Object.freeze([
   'Flot klaret{name}! Det er helt rigtigt.',
   'Godt regnet{name}! Du fandt det rigtige svar.',
   'Ja, lige præcis{name}! Det passer.',
   'Sådan{name}! Det var rigtigt regnet.',
   'Rigtigt{name}! Det klarede du flot.',
   'Du fandt svaret{name}! Godt arbejde.',
   'Det passer helt{name}! Flot regnet.',
   'Hurra{name}! Dit svar er rigtigt.',
   'Det var godt klaret{name}! Du regnede rigtigt.',
   'Ja{name}! Du løste regnestykket. Flot arbejde.'
  ]),
  wrong:Object.freeze([
   'Det er ikke helt rigtigt endnu{name}. Skal vi prøve igen?',
   'Godt forsøgt{name}. Se på regnestykket en gang til.',
   'Vi øver os{name}. Du kan prøve et nyt svar.',
   'Det passer ikke helt endnu{name}. Du kan bruge hjælpen.',
   'Tag dig god tid{name}. Lad os prøve igen.',
   'Lad os se på stykket igen{name}. Hjælpen er lige her.',
   'Du må gerne prøve igen{name}. Vi tager det i små skridt.',
   'Et nyt forsøg{name}? Se på tallene en gang til.',
   'Det var ikke svaret på dette stykke{name}. Vi prøver igen.',
   'Vi finder ud af det sammen{name}. Du kan prøve igen.'
  ])
 });
 function answer(raw,correct,player,variant=0){const n=name(player),list=replies[correct?'right':'wrong'],i=Math.max(0,Math.min(list.length-1,Math.floor(Number(variant)||0)));return `Du svarede ${Number(raw)}. ${list[i].replaceAll('{name}',()=>n?', '+n:'')}`}
 function createAnswers(random=Math.random){
  const bags={right:[],wrong:[]},last={right:null,wrong:null};
  return (raw,correct,player)=>{
   const kind=correct?'right':'wrong',bag=bags[kind];
   if(!bag.length){bag.push(...replies[kind].map((_,i)=>i));for(let i=bag.length-1;i>0;i--){const n=Number(random()),j=Math.floor((Number.isFinite(n)?Math.min(.999999999,Math.max(0,n)):0)* (i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(bag[0]===last[kind])[bag[0],bag[1]]=[bag[1],bag[0]]}
   const variant=bag.shift();last[kind]=variant;return answer(raw,correct,player,variant);
  };
 }
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
    const played=await say(text,{voice,language:'da-DK'});if(played===false)throw Error('Lyden kunne ikke afspilles. Prøv valgt stemme igen, eller vælg enhedens danske stemme.');
   }catch(e){issue=e.message||'Oplæsningen kunne ikke starte. Prøv Læs op igen.'}
   finally{if(id===serial){busy=false;if(isActive())status(issue,false)}}
  }
  return {read,stop:cancel};
 }
 return {name,question,answer,createAnswers,create};
});
