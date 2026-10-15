/* ÆselKlog 0.9.15: standalone, offline card-game rules. No changes to Talstien. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.AeselCards=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const VERSION=1;
 const RANGES=Object.freeze(['1-20','21-40','41-60','61-80','81-100']);
 const SAVE_KEY='aeselklog-kortspil-v1';
 function bounds(range){
  if(!RANGES.includes(range))throw Error('Vælg et gyldigt talområde.');
  return range.split('-').map(Number);
 }
 const countOf=(p)=>p.closed.length+p.open.length;
 const copy=(state)=>JSON.parse(JSON.stringify(state));
 function shuffledDeck(range,rng=Math.random){
  const [first,last]=bounds(range),cards=[];
  for(let n=first;n<=last;n++)for(let i=0;i<5;i++)cards.push(n);
  for(let i=cards.length-1;i>0;i--){const v=Number(rng());const j=Math.max(0,Math.min(i,Math.floor((Number.isFinite(v)?v:0.5)*(i+1))));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
 }
 function start({range='1-20',variant='collect',extraPenalty=false,donkeyCount=8,names=['Spiller 1','Spiller 2']}={},rng=Math.random){
  bounds(range);
  if(!['collect','passing'].includes(variant))throw Error('Ugyldig kortvariant.');
  if(!Array.isArray(names)||names.length<2||names.length>6)throw Error('Kortspillet kræver 2–6 spillere.');
  const clean=names.map((s,i)=>String(s||'').trim().slice(0,25)||`Spiller ${i+1}`);
  if(new Set(clean.map(s=>s.toLocaleLowerCase('da-DK'))).size!==clean.length)throw Error('Spillerne skal have forskellige navne.');
  const total=variant==='passing'?1:Number(donkeyCount);
  if(![1,4,6,8].includes(total))throw Error('Ugyldigt antal æselkort.');
  const players=clean.map(name=>({name,closed:[],open:[],donkeys:0}));
  shuffledDeck(range,rng).forEach((n,i)=>players[i%players.length].closed.push(n));
  const state={version:VERSION,range,variant,extraPenalty:!!extraPenalty,donkeyCount:total,players,centers:[],turn:0,pending:null,finished:false,winner:null,turnCount:1,message:'Spillet er klar! Første spiller må vende et kort.',lastAction:'start'};
  if(!validate(state))throw Error('Kunne ikke starte kortspillet.');
  return state;
 }
 function readable(n){return Number.isInteger(n)&&n>0&&n<=100;}
 function validate(state){
  if(!state||typeof state!=='object'||state.version!==VERSION||!RANGES.includes(state.range)||!['collect','passing'].includes(state.variant))return false;
  if(typeof state.extraPenalty!=='boolean'||!Number.isInteger(state.donkeyCount)||![1,4,6,8].includes(state.donkeyCount))return false;
  if(state.variant==='passing'&&state.donkeyCount!==1)return false;
  if(!Array.isArray(state.players)||state.players.length<2||state.players.length>6)return false;
  if(!Array.isArray(state.centers)||state.centers.length>5)return false;
  if(!Number.isInteger(state.turn)||state.turn<0||state.turn>=state.players.length)return false;
  if(typeof state.finished!=='boolean'||(state.winner!==null&&(!Number.isInteger(state.winner)||state.winner<0||state.winner>=state.players.length)))return false;
  if(state.finished!==(state.winner!==null))return false;
  const [first,last]=bounds(state.range);
  const counted=new Map(Array.from({length:20},(_,i)=>[first+i,0]));
  const push=n=>{if(!Number.isInteger(n)||n<first||n>last)return false;counted.set(n,counted.get(n)+1);return true;};
  let donkeySum=0;
  for(const p of state.players){
   if(!p||typeof p.name!=='string'||p.name.length>25||!Array.isArray(p.closed)||!Array.isArray(p.open)||!Number.isInteger(p.donkeys)||p.donkeys<0||p.donkeys>8)return false;
   donkeySum+=p.donkeys;
   if(p.closed.length+p.open.length>100)return false;
   for(const n of [...p.closed,...p.open])if(!push(n))return false;
  }
  if(donkeySum>state.donkeyCount||(state.variant==='passing'&&donkeySum>1))return false;
  for(const pile of state.centers){
   if(!Array.isArray(pile)||pile.length<1||pile.length>20||pile[0]!==first)return false;
   if(pile.some((n,i)=>n!==first+i||!push(n)))return false;
  }
  if(state.pending!==null&&(!push(state.pending)||state.finished))return false;
  if([...counted.values()].some(v=>v!==5))return false;
  if(state.finished&&countOf(state.players[state.winner])!==0)return false;
  if(!Number.isSafeInteger(state.turnCount)||state.turnCount<1||state.turnCount>200000)return false;
  if(typeof state.message!=='string'||state.message.length>400)return false;
  return true;
 }
 function restore(raw){
  let state;try{state=typeof raw==='string'?JSON.parse(raw):copy(raw)}catch(_){return null}
  if(!validate(state))return null;
  return state;
 }
 function centerTarget(state,n){
  const [first]=bounds(state.range);
  // Keep completed center rows separate: only a direct successor may be added.
  for(let i=0;i<state.centers.length;i++){
   const row=state.centers[i];if(row[row.length-1]+1===n)return {kind:'center',index:i,caption:`Række ${i+1} i midten`};
  }
  if(n===first&&state.centers.length<5)return {kind:'new-center',index:state.centers.length,caption:'Ny række i midten'};
  return null;
 }
 function preferredTarget(state,n,fromPlayer=state.turn){
  const center=centerTarget(state,n);if(center)return center;
  // From the current player, the nearest pile to the left has priority.
  for(let step=1;step<state.players.length;step++){
   const i=(fromPlayer+step)%state.players.length;
   const pile=state.players[i].open;
   if(pile.length&&Math.abs(pile[pile.length-1]-n)===1)return {kind:'player',index:i,caption:`${state.players[i].name}s åbne bunke`};
  }
  return null;
 }
 function isPlayersTurn(state){if(!validate(state)||state.finished)throw Error('Kortspillet er afsluttet.');}
 function finishOrNext(state){
  if(countOf(state.players[state.turn])===0&&state.pending===null){
   state.winner=state.turn;state.finished=true;
   state.message=`🏆 ${state.players[state.turn].name} kom af med alle talkortene!`;
   return;
  }
  state.turn=(state.turn+1)%state.players.length;
  state.turnCount++;
  state.message=`${state.players[state.turn].name}s tur – vend et kort eller brug et åbent kort.`;
 }
 function flip(state){
  isPlayersTurn(state);
  if(state.pending!==null)throw Error('Læg det vendte kort først.');
  const p=state.players[state.turn];
  if(!p.closed.length){
   if(!p.open.length)throw Error('Ingen talkort tilbage.');
   // Flipping an entire face-up pile exposes its former bottom card first.
   p.closed=p.open.slice().reverse();p.open=[];
  }
  const n=p.closed.pop();
  const target=preferredTarget(state,n);
  state.lastAction='flip';
  if(!target){
   p.open.push(n);
   finishOrNext(state);
   state.message=`${p.name} vendte ${n}. Det passer ikke endnu og lægges i den åbne bunke. Nu er det ${state.players[state.turn].name}s tur.`;
   return {placed:false,number:n,next:true};
  }
  state.pending=n;
  state.message=`${p.name} vendte ${n}. Det kan lægges på ${target.caption}.`;
  return {placed:false,number:n,next:false,target};
 }
 function addToTarget(state,n,target){
  if(target.kind==='center')state.centers[target.index].push(n);
  else if(target.kind==='new-center')state.centers.push([n]);
  else if(target.kind==='player')state.players[target.index].open.push(n);
  else throw Error('Ukendt mål for kortet.');
 }
 function play(state,source='pending'){
  isPlayersTurn(state);
  const p=state.players[state.turn];
  let n;
  if(source==='pending'){
   if(state.pending===null)throw Error('Vend et kort først.');
   n=state.pending;
  }else if(source==='open'){
   if(state.pending!==null)throw Error('Det vendte kort skal lægges først.');
   if(!p.open.length)throw Error('Der er ingen åbne kort.');
   n=p.open[p.open.length-1];
  }else throw Error('Ugyldig kortkilde.');
  const target=preferredTarget(state,n);
  if(!target)throw Error('Kortet kan ikke bruges endnu.');
  if(source==='pending')state.pending=null;
  else p.open.pop();
  addToTarget(state,n,target);
  state.lastAction='play';state.message=`${p.name} lagde ${n} på ${target.caption}.`;
  const won=!countOf(p)&&state.pending===null;
  if(won){state.winner=state.turn;state.finished=true;state.message+=` 🏆 ${p.name} vandt!`}
  return {number:n,target,won};
 }
 function openPlay(state){if(!state||state.finished||state.pending!==null)return null;const p=state.players[state.turn];const n=p.open[p.open.length-1];return n===undefined?null:preferredTarget(state,n);}
 function penalty(state,index){
  isPlayersTurn(state);
  if(!Number.isInteger(index)||index<0||index>=state.players.length)throw Error('Vælg en spiller.');
  if(state.pending!==null)throw Error('Læg først det vendte kort.');
  const p=state.players[index];let assigned=false;
  if(state.variant==='passing'){
   for(const other of state.players)other.donkeys=0;
   p.donkeys=1;assigned=true;
  }else if(state.players.reduce((sum,item)=>sum+item.donkeys,0)<state.donkeyCount){
   p.donkeys++;assigned=true;
  }
  let extras=0;
  if(state.extraPenalty){
   for(let i=0;i<state.players.length;i++){
    if(i!==index&&state.players[i].closed.length){p.closed.push(state.players[i].closed.pop());extras++}
   }
  }
  state.lastAction='penalty';
  state.message=`🫏 ${p.name} fik ${assigned?'et æselkort':'ikke et nyt æselkort (alle er uddelt)'}${extras?` og ${extras} ekstra talkort`:''}.`;
  return {assigned,extras};
 }
 function stock(state){return state.donkeyCount-state.players.reduce((sum,p)=>sum+p.donkeys,0);}
 function remaining(state,index){const p=state.players[index];return countOf(p)+(state.turn===index&&state.pending!==null?1:0);}
 return Object.freeze({VERSION,RANGES,SAVE_KEY,bounds,start,restore,validate,shuffledDeck,preferredTarget,openPlay,flip,play,penalty,stock,remaining});
});
