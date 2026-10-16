/* v0.9.19: tre leverede CC0-MP3, indstillinger, ducking, offline aktiver. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'music.js'),'utf8');
const plays=[],pauses=[],volumeChanges=[],contexts=[];
class FakeAudio{
 constructor(){this.dataset={};this.paused=true;this.src='';this.loop=false;this.preload='';this.volume=1;this.currentTime=0;}
 load(){}
 play(){this.paused=false;plays.push(this.src);return Promise.resolve()}
 pause(){this.paused=true;pauses.push(this.src)}
 addEventListener(){}
}
class FakeAudioContext{
 constructor(){this.state='suspended';this.currentTime=2;this.destination={};contexts.push(this)}
 createMediaElementSource(element){assert(element instanceof FakeAudio);return {connect(){}}}
 createGain(){return{gain:{value:0,setTargetAtTime(value){volumeChanges.push(value)}},connect(){}}}
 resume(){this.state='running';return Promise.resolve()}
}
const events={},storage={},timeouts=new Map();let next=1;
const doc={hidden:false,addEventListener:(name,callback)=>events[name]=callback};
const w={document:doc,Audio:FakeAudio,AudioContext:FakeAudioContext,
 localStorage:{getItem:key=>storage[key]??null,setItem:(key,value)=>storage[key]=String(value)},
 setTimeout:(fn,ms)=>{const id=next++;timeouts.set(id,{fn,ms});return id},clearTimeout:id=>timeouts.delete(id)};
const context=vm.createContext({window:w,console,Number,Math,JSON,Promise,Set});vm.runInContext(code,context);
const M=w.AeselMusic;
assert.equal(Object.keys(M.TRACKS).length,3);
for(const item of Object.values(M.TRACKS)){
 const audio=path.join(root,item.file.replace(/^\.\//,''));
 assert(fs.existsSync(audio),`missing offline music file ${item.file}`);
 assert(fs.statSync(audio).size>500_000,'music MP3 is substantive');
 assert.equal(fs.readFileSync(audio).subarray(0,3).toString(),'ID3','expect valid tagged MP3');
}
assert.equal(M.get().enabled,false);
assert.equal(M.get().track,'gonefishin');
assert.equal(M.clean({track:'gaardfest'}).track,'gonefishin','old choice preserved');
assert.equal(M.clean({track:'gulerod'}).track,'march');
assert.equal(M.clean({track:'rolig'}).track,'beary');
assert.equal(M.clean({track:'__proto__'}).track,'gonefishin','reject unknown or inherited track names');
M.syncView('game');assert.equal(M.getState().playing,false,'music must be opt-in');
M.setVolume(43);M.setTrack('march');M.setEnabled(true);
assert.equal(M.getState().playing,true);
assert(plays.at(-1).endsWith('childrens-march.mp3'));
assert.equal(M.get().volume,43);
assert.equal(JSON.parse(storage[M.KEY]).track,'march');
assert.equal(contexts[0].state,'running');
const normal=volumeChanges.at(-1);const token=M.beginSpeech();assert(volumeChanges.at(-1)<normal/3,'volume lowered under voice');
M.endSpeech(token);assert.equal(volumeChanges.at(-1),normal,'restores music volume');
M.setTrack('beary');assert(plays.at(-1).endsWith('beary-fishy.mp3'));
M.syncView('home');assert.equal(M.getState().playing,false,'music off outside game');
M.syncView('cardsGame');assert.equal(M.getState().playing,true,'music starts in card game');
doc.hidden=true;events.visibilitychange();assert.equal(M.getState().playing,false,'music stops in background');
doc.hidden=false;events.visibilitychange();assert.equal(M.getState().playing,true,'music resumes');
M.setEnabled(false);assert.equal(M.getState().playing,false);
M.syncView('settings');assert(M.playPreview(),'preview without enabling');assert(M.getState().previewing);
[...timeouts.values()][0].fn();assert.equal(M.getState().playing,false,'preview ends');
assert(plays.length>=4&&pauses.length>2);
console.log('PASS: CC0 MP3 files, track selection, old preferences, opt-in, ducking, both games and preview');
