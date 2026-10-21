const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../offline-talkort.js'),'utf8');
function fixture(mode){
 let made=0,plays=[],clock=0;
 const window={AeselNumbers:require('../numbers.js'),addEventListener(){}};
 class Audio{
  constructor(){this.index=++made;this.currentTime=0;this.duration=NaN;this.ended=false}
  set src(value){this.url=value;this.currentTime=0;this.duration=NaN;this.ended=false}
  play(){plays.push(this.url);if(mode==='policy'&&this.index>1)return Promise.reject(Error('NotAllowedError'));
   if(mode==='stall')return new Promise(()=>{});
   this.duration=.1;
   setTimeout(()=>{this.currentTime=.1;this.ended=true;if(mode!=='missing-ended')this.onended?.()},1);
   return Promise.resolve();
  }
  pause(){this.paused=true}
  load(){} removeAttribute(){}
 }
 vm.runInNewContext(source,{window,Audio,document:{getElementById:()=>null},console:{warn(){}},Date:{now:()=>clock},setTimeout:(fn,ms)=>setTimeout(()=>{clock+=ms;fn()},Math.min(ms,3)),clearTimeout});
 return {api:window.AeselOfflineNumbers,plays,made:()=>made};
}
(async()=>{
 const f=fixture('policy');
 for(let n=5;n>=1;n--)assert.equal(await f.api.play(n,'da-en','narrator',{reliable:true}),true);
 assert.equal(f.made(),1,'all automatic clips must share the user-unlocked element');
 assert.equal(f.plays.length,10);
 const missing=fixture('missing-ended');
 assert.equal(await missing.api.play(2,'da-en','narrator',{reliable:true}),true,'end position must finish even without ended event');
 assert.equal(missing.plays.length,2);
 const stalled=fixture('stall');
 assert.equal(await stalled.api.play(2,'da','narrator',{reliable:true}),false,'unresolved play promise must time out');
 const cancelled=fixture('stall');const pending=cancelled.api.play(3,'da','narrator',{reliable:true});cancelled.api.stop();assert.equal(await pending,'interrupted');
 console.log('PASS shared mobile audio permission, missing ended event, stalled play timeout and cancellation');
})().catch(e=>{console.error(e);process.exitCode=1});
