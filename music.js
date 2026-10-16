/* ÆselKlog v0.9.18: originale, offline genererede korte baggrundsmelodier. Ingen eksterne lydfiler. */
(function(global){'use strict';
 const KEY='aeselklog-baggrundsmusik-v1';
 const TRACKS={
  gaardfest:{label:'Gårdfest',bpm:116,wave:'triangle',notes:['C5','E5','G5','E5','A5','G5','E5','C5','D5','F5','A5','F5','G5','E5','D5','C5'],bass:['C3','A2','F3','G2']},
  gulerod:{label:'Gulerodsdans',bpm:138,wave:'sine',notes:['E5','G5','A5','G5','E5','D5','C5','D5','E5','G5','C6','B5','A5','G5','E5','C5'],bass:['C3','G2','A2','F3']},
  rolig:{label:'Rolig bondegård',bpm:86,wave:'sine',notes:['C5','D5','E5','G5','E5','D5','C5',null,'A4','C5','D5','F5','E5','D5','C5',null],bass:['C3','F3','A2','G2']}
 };
 function clean(raw){const r=raw&&typeof raw==='object'?raw:{};return {enabled:r.enabled===true,track:TRACKS[r.track]?r.track:'gaardfest',volume:Number.isFinite(Number(r.volume))?Math.max(0,Math.min(100,Math.round(Number(r.volume)))):32};}
 function freq(note){if(!note)return 0;const match=/^([A-G])(#?)(-?\d)$/.exec(note);if(!match)return 0;
  const semitones={C:0,D:2,E:4,F:5,G:7,A:9,B:11};const midi=(Number(match[3])+1)*12+semitones[match[1]]+(match[2]?1:0);return 440*Math.pow(2,(midi-69)/12);
 }
 let prefs=clean(null);try{prefs=clean(JSON.parse(global.localStorage?.getItem(KEY)||'null'))}catch(_){/* offline/private */}
 let ctx=null,gain=null,ticker=null,index=0,view='home',speechIds=new Set(),nextSpeech=0,lastFailure=false;
 const AudioCtor=()=>global.AudioContext||global.webkitAudioContext;
 function save(){try{global.localStorage?.setItem(KEY,JSON.stringify(prefs))}catch(_){}notify()}
 const listeners=new Set();function notify(){for(const l of listeners)try{l({...prefs,view,playing:!!ticker})}catch(_){}}
 function allowed(){return prefs.enabled&&(view==='game'||view==='cardsGame')&&!global.document?.hidden;}
 function output(){return Math.pow(prefs.volume/100,1.4)*.11*(speechIds.size?.22:1)}
 function updateGain(){if(!gain||!ctx)return;try{gain.gain.setTargetAtTime(output(),ctx.currentTime,.15)}catch(_){gain.gain.value=output()}}
 function prepareContext(){const C=AudioCtor();if(!C)return null;
  try{if(!ctx){ctx=new C();gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);}if(ctx.state==='suspended')void ctx.resume()?.catch?.(()=>{});return ctx}catch(_){lastFailure=true;return null}
 }
 function noteSound(frequency,time,seconds,kind,level){if(!ctx||!frequency)return;
  try{const osc=ctx.createOscillator(),env=ctx.createGain();osc.type=kind;osc.frequency.value=frequency;
   env.gain.setValueAtTime(.0001,time);env.gain.exponentialRampToValueAtTime(Math.max(.0002,level),time+.018);
   env.gain.exponentialRampToValueAtTime(.0001,time+seconds);osc.connect(env);env.connect(gain);
   osc.start(time);osc.stop(time+seconds+.025);
  }catch(_){}
 }
 function playBeat(){if(!allowed()){stop();return;}if(!prepareContext())return;
  const t=TRACKS[prefs.track],step=60/t.bpm/2,time=ctx.currentTime+.025;
  noteSound(freq(t.notes[index%16]),time,step*.84,t.wave,.31);
  if(index%4===0)noteSound(freq(t.bass[Math.floor(index/4)%4]),time,step*3.2,'sine',.19);
  if(index%2===0&&prefs.track!=='rolig')noteSound(freq('G4'),time,step*.26,'triangle',.035);
  index++; // Kun én kort tone pr. tick, ingen ubegrænset lydkø.
 }
 function start(){if(!allowed())return false;if(ticker)return true;if(!prepareContext())return false;
  index=0;updateGain();playBeat();ticker=global.setInterval(playBeat,60000/TRACKS[prefs.track].bpm/2);notify();return true;
 }
 function stop(){if(ticker!==null){global.clearInterval(ticker);ticker=null}if(gain){try{gain.gain.setTargetAtTime(0,ctx.currentTime,.05)}catch(_){gain.gain.value=0}}notify();}
 function setEnabled(value){prefs.enabled=!!value;save();if(allowed())start();else stop();notify();return {...prefs}}
 function setTrack(value){if(!TRACKS[value])return {...prefs};prefs.track=value;save();const playing=!!ticker;stop();if(playing&&allowed())start();return {...prefs}}
 function setVolume(value){prefs.volume=clean({...prefs,volume:value}).volume;save();updateGain();return {...prefs}}
 function syncView(next){view=String(next||'home');if(allowed())start();else stop();notify()}
 function beginSpeech(){const id=++nextSpeech;speechIds.add(id);updateGain();return id}
 function endSpeech(id){speechIds.delete(id);updateGain()}
 function playPreview(){if(allowed())return start();const oldView=view;view='preview';if(!prepareContext())return false;
  const t=TRACKS[prefs.track],step=60/t.bpm/2;
  gain.gain.setTargetAtTime(Math.max(.015,output()),ctx.currentTime,.05);
  for(let i=0;i<8;i++){const at=ctx.currentTime+.05+i*step;noteSound(freq(t.notes[i]),at,step*.8,t.wave,.18)}
  global.setTimeout(()=>{if(!ticker)try{gain.gain.setTargetAtTime(0,ctx.currentTime,.12)}catch(_){}},Math.ceil(8*step*1000)+250);
  view=oldView;return true;
 }
 if(global.document){global.document.addEventListener('visibilitychange',()=>{if(global.document.hidden)stop();else if(allowed())start()});
  const unlock=()=>{if(allowed())start()};global.document.addEventListener('pointerdown',unlock,{passive:true});global.document.addEventListener('keydown',unlock);
 }
 global.AeselMusic={KEY,TRACKS,clean,get:()=>({...prefs}),onChange(cb){listeners.add(cb);return()=>listeners.delete(cb)},setEnabled,setTrack,setVolume,syncView,beginSpeech,endSpeech,playPreview,stop,start,getState:()=>({playing:!!ticker,view,hasAudio:!!AudioCtor(),lastFailure})};
 if(typeof module!=='undefined'&&module.exports)module.exports={TRACKS,clean,freq};
})(typeof window!=='undefined'?window:globalThis);
