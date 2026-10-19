(()=>{'use strict';const path=new URL('donkey-bray.wav',document.currentScript.src).href;let ctx=null,loaded=null,source=null,gain=null,fallback=null,playing=false;
function signal(value){playing=value;window.dispatchEvent(new CustomEvent('aesel-effect'))}
function unlock(){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(Context){try{if(!ctx){ctx=new Context();gain=ctx.createGain();gain.gain.value=.75;gain.connect(ctx.destination)}if(ctx.state!=='running')ctx.resume().catch(()=>{});if(!loaded)loaded=fetch(path).then(r=>{if(!r.ok)throw Error('Lydfil mangler');return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b)).catch(e=>{loaded=null;throw e});loaded.catch(()=>{});}catch{ctx=null}}
 if(!ctx&&!fallback){fallback=new Audio(path);fallback.preload='auto';fallback.volume=.75}
}
function stop(){if(source){try{source.stop()}catch{}source=null}fallback?.pause();signal(false)}
async function play(){unlock();if(ctx){const buffer=await loaded;if(ctx.state!=='running')await ctx.resume();if(ctx.state!=='running')throw Error('Tryk for at aktivere lyd');stop();source=ctx.createBufferSource();source.buffer=buffer;source.connect(gain);const current=source;source.onended=()=>{if(source===current){source=null;signal(false)}};source.start();signal(true);return}if(!fallback)throw Error('Lyd understøttes ikke');fallback.currentTime=0;fallback.onended=()=>signal(false);fallback.onplay=()=>signal(true);await fallback.play()}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlock,{capture:true});
window.AeselSound={unlock,play,stop,isPlaying:()=>playing};
})();
