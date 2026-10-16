/* ÆselKlog v0.9.19 – tre lokale CC0-MP3-filer, samme musik i Kortspil og Talstien.
   Musik er opt-in. iOS-lydstyrke og dæmpning styres med Web Audio gain, hvor muligt.
   Ingen eksterne lyd-URL'er, tracking eller automatiske musikdownloads under spil. */
(function(global){'use strict';
 const KEY='aeselklog-baggrundsmusik-v1'; // Bevar tidligere indstillinger.
 const TRACKS=Object.freeze({
  gonefishin:Object.freeze({label:"Gone Fishin'",file:'./music/gone-fishin.mp3',artist:'Memoraphile',license:'CC0'}),
  march:Object.freeze({label:"Children's March Theme",file:'./music/childrens-march.mp3',artist:'Cleyton Kauffman',license:'CC0'}),
  beary:Object.freeze({label:'Beary Fishy Menu Screen',file:'./music/beary-fishy.mp3',artist:'Memoraphile',license:'CC0'})
 });
 const LEGACY={gaardfest:'gonefishin',gulerod:'march',rolig:'beary'};
 function clean(raw){
  const r=raw&&typeof raw==='object'?raw:{};
  const key=Object.hasOwn(LEGACY,r.track)?LEGACY[r.track]:r.track;
  const vol=Number(r.volume);
  return {enabled:r.enabled===true,track:Object.hasOwn(TRACKS,key)?key:'gonefishin',volume:Number.isFinite(vol)?Math.max(0,Math.min(100,Math.round(vol))):32};
 }
 let prefs=clean(null);
 try{prefs=clean(JSON.parse(global.localStorage?.getItem(KEY)||'null'))}catch(_){/* Privat/ingen storage */}
 let audio=null,ctx=null,gain=null,source=null,view='home',previewTimer=null,playRequested=false;
 let requestId=0,lastFailure='',nextSpeech=0;
 const speechIds=new Set(),listeners=new Set();
 function notify(){for(const l of listeners){try{l({...prefs,view,playing:playRequested,previewing:previewTimer!==null})}catch(_){}}}
 function save(){try{global.localStorage?.setItem(KEY,JSON.stringify(prefs))}catch(_){}notify()}
 function allowed(){return prefs.enabled&&(view==='game'||view==='cardsGame')&&!global.document?.hidden}
 function volumeGain(){return Math.pow(prefs.volume/100,1.35)*.45*(speechIds.size?.22:1)}
 function updateGain(){const value=volumeGain();
  if(gain&&ctx){try{gain.gain.setTargetAtTime(value,ctx.currentTime,.12)}catch(_){gain.gain.value=value}}
  else if(audio){try{audio.volume=value}catch(_){}}
 }
 function init(){
  if(audio)return audio;
  if(typeof global.Audio!=='function')return null;
  try{
   audio=new global.Audio();audio.preload='auto';audio.loop=true;
   audio.addEventListener?.('error',()=>{playRequested=false;lastFailure='Musikfilen kunne ikke afspilles';notify()});
   const C=global.AudioContext||global.webkitAudioContext;
   if(typeof C==='function'){
    try{ctx=new C();gain=ctx.createGain();source=ctx.createMediaElementSource(audio);source.connect(gain);gain.connect(ctx.destination);audio.volume=1}
    catch(_){gain=null;ctx=null;source=null}
   }
   updateGain();return audio;
  }catch(_){audio=null;lastFailure='Lydafspiller er ikke tilgængelig';return null}
 }
 function loadTrack(){const a=init();if(!a)return null;
  if((a.dataset?.track??a.__aeselTrack)!==prefs.track){
   a.pause?.();a.src=TRACKS[prefs.track].file;
   if(a.dataset)a.dataset.track=prefs.track;
   else a.__aeselTrack=prefs.track;
   a.load?.();
  }
  return a;
 }
 function play(){
  const a=loadTrack();if(!a)return false;
  const ticket=++requestId;playRequested=true;lastFailure='';updateGain();notify();
  try{
   if(ctx?.state==='suspended')void Promise.resolve(ctx.resume()).catch(()=>{});
   const p=a.play();
   if(p&&typeof p.catch==='function')void p.catch(error=>{
    if(ticket===requestId){playRequested=false;lastFailure=String(error?.message||'Musik kræver et tryk for at starte');notify()}
   });
   return true;
  }catch(error){playRequested=false;lastFailure=String(error?.message||'Afspilning mislykkedes');notify();return false}
 }
 function stop(){
  ++requestId;
  if(previewTimer!==null){global.clearTimeout?.(previewTimer);previewTimer=null}
  if(audio){try{audio.pause()}catch(_){}}
  playRequested=false;notify();
 }
 function start(){if(!allowed())return false;
  if(playRequested)return true;
  return play();
 }
 function setEnabled(v){prefs.enabled=!!v;save();if(allowed())start();else stop();return {...prefs}}
 function setTrack(v){const k=Object.hasOwn(LEGACY,v)?LEGACY[v]:v;if(!Object.hasOwn(TRACKS,k))return {...prefs};
  const wasPreview=previewTimer!==null;prefs.track=k;save();
  stop();if(allowed())start();else if(wasPreview)playPreview();return {...prefs}
 }
 function setVolume(v){prefs.volume=clean({...prefs,volume:v}).volume;save();updateGain();return {...prefs}}
 function syncView(next){view=String(next||'home');if(allowed())start();else stop();notify()}
 function beginSpeech(){const n=++nextSpeech;speechIds.add(n);updateGain();return n}
 function endSpeech(n){speechIds.delete(n);updateGain()}
 function playPreview(){
  if(allowed())return start();
  stop();if(global.document?.hidden)return false;
  const ok=play();if(!ok)return false;
  previewTimer=global.setTimeout?.(()=>{previewTimer=null;if(!allowed())stop()},12000)??null;
  notify();return true;
 }
 if(global.document){
  global.document.addEventListener?.('visibilitychange',()=>{if(global.document.hidden)stop();else if(allowed())start()});
  const unlock=()=>{if(allowed()&&!playRequested)start();else if(allowed()&&ctx?.state==='suspended')void Promise.resolve(ctx.resume()).catch(()=>{})};
  global.document.addEventListener?.('pointerdown',unlock,{passive:true});
  global.document.addEventListener?.('keydown',unlock);
 }
 const api={KEY,TRACKS,clean,get:()=>({...prefs}),onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)},setEnabled,setTrack,setVolume,syncView,beginSpeech,endSpeech,playPreview,stop,start,getState:()=>({playing:playRequested,view,previewing:previewTimer!==null,hasAudio:typeof global.Audio==='function',lastFailure})};
 global.AeselMusic=api;
 if(typeof module!=='undefined'&&module.exports)module.exports={TRACKS,clean};
})(typeof window!=='undefined'?window:globalThis);
