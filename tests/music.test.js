/* v0.9.18: originale instrumentalmelodier, sikker lokal musikindstilling. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','music.js'),'utf8');
let counter=0,storage={},gainChanges=[],intervals=new Map(),next=1;
class FakeAudioContext{
 constructor(){this.currentTime=0;this.state='running';this.destination={}}
 createGain(){return{gain:{value:0,setTargetAtTime:(n)=>gainChanges.push(n),setValueAtTime() {},exponentialRampToValueAtTime(){}},connect(){}}}
 createOscillator(){counter++;return {type:'sine',frequency:{value:0},connect(){},start(){},stop(){}}}
 resume(){return Promise.resolve()}
}
const listeners={};const doc={hidden:false,addEventListener(name,fn){listeners[name]=fn}};
const g={document:doc,AudioContext:FakeAudioContext,setInterval:(fn,ms)=>{const i=next++;intervals.set(i,{fn,ms});return i},clearInterval:i=>intervals.delete(i),setTimeout:()=>1,localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=String(v)}};
const ctx=vm.createContext({window:g,console,Number,Math,JSON,Promise,Set});vm.runInContext(src,ctx);const M=g.AeselMusic;
assert.equal(Object.keys(M.TRACKS).length,3);
assert.equal(M.get().enabled,false,'music starts muted');
assert.equal(M.get().track,'gaardfest');
M.syncView('game');assert.equal(M.getState().playing,false,'off means no automatic playback');
M.setVolume(1000);assert.equal(M.get().volume,100);
M.setVolume(-10);assert.equal(M.get().volume,0);
M.setVolume(45);M.setTrack('gulerod');M.setEnabled(true);
assert.equal(M.getState().playing,true);assert(intervals.size>0);assert(counter>0);
assert.equal(JSON.parse(storage[M.KEY]).track,'gulerod');
const id=M.beginSpeech();assert(gainChanges.at(-1)<.1);M.endSpeech(id);
M.syncView('home');assert.equal(M.getState().playing,false);
M.syncView('cardsGame');assert.equal(M.getState().playing,true);
doc.hidden=true;listeners.visibilitychange();assert.equal(M.getState().playing,false);
doc.hidden=false;listeners.visibilitychange();assert.equal(M.getState().playing,true);
M.setEnabled(false);assert.equal(M.getState().playing,false);assert.equal(intervals.size,0);
console.log('PASS: three music modes, opt-in, save, game switching, ducking and background pause');
