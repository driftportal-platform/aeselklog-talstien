const assert=require('node:assert/strict'),N=require('../math-speech.js'),VC=require('../voicecache.js');
for(const [op,word] of Object.entries({add:'plus',subtract:'minus',multiply:'gange',divide:'divideret med'})){assert.equal(N.question({op,a:6,b:2},' Aya '),`Aya, hvad er 6 ${word} 2?`);assert(!N.question({op,a:6,b:2},'').startsWith(','))}
assert.equal(N.name('  Aya   Marie  '),'Aya Marie');assert.equal(N.name('x'.repeat(40)).length,25);
assert.equal(N.answer('007',true,'Aya'),'Du svarede 7. Flot klaret, Aya! Det er helt rigtigt.');assert.equal(N.answer('8',false,'Aya'),'Du svarede 8. Det er ikke helt rigtigt endnu, Aya. Skal vi prøve igen?');assert(!N.answer(2,false,'').includes(',,')&&!N.answer(2,false,'').includes('undefined'));
for(const text of [N.question({op:'add',a:6,b:1},'Aya'),N.answer(7,true,'Aya'),N.answer(8,false,'Aya')])assert(!VC.isSafePhrase(text),'Personal speech must not enter permanent cache');
for(const correct of [true,false]){
 const lines=new Set();for(let i=0;i<10;i++){const text=N.answer(7,correct,'Aya',i);lines.add(text);assert(text.startsWith('Du svarede 7. '));assert(text.includes('Aya'));assert(!VC.isSafePhrase(text));const unnamed=N.answer(7,correct,'',i);assert(!unnamed.includes('undefined')&&!unnamed.includes('{name}')&&!/[, ]+[.!?]/.test(unnamed))}assert.equal(lines.size,10);
}
let seed=31;const draw=N.createAnswers(()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32}),previous={true:'',false:''};
for(let cycle=0;cycle<10;cycle++){const sets={true:new Set(),false:new Set()};for(let i=0;i<10;i++)for(const correct of [true,false]){const line=draw(7,correct,'Aya');assert.notEqual(line,previous[correct]);sets[correct].add(line);previous[correct]=line}assert.equal(sets.true.size,10);assert.equal(sets.false.size,10)}
(async()=>{let active=true,enabled=true,voice='current',voices=[],calls=[],stops=0,messages=[],resolveLoad,resolveSay;
 const s=N.create({isActive:()=>active,isEnabled:()=>enabled,getVoice:()=>voice,listVoices:()=>voices,loadVoices:()=>new Promise(r=>{resolveLoad=r}),say:(text,options)=>{calls.push({text,options});return new Promise(r=>{resolveSay=r})},stop:()=>{stops++;resolveSay?.()},status:(text,busy)=>messages.push({text,busy})});
 enabled=false;await s.read('muted');assert.equal(calls.length,0);assert(messages.at(-1).text.includes('Lyd er slået fra'));enabled=true;
 voice='anne';const pending=s.read('old');s.stop();voices=[{id:'anne'}];resolveLoad();await pending;assert.equal(calls.length,0);
 voice='current';const first=s.read('first');const second=s.read('second');assert.equal(stops,2);assert.deepEqual(calls.map(x=>x.text),['first','second']);resolveSay();await Promise.all([first,second]);assert.equal(messages.at(-1).text,'');
 voice='device';const local=s.read('local');assert.equal(calls.at(-1).options.voice,'device');s.stop();await local;
 active=false;await s.read('invisible');assert.equal(calls.length,3);
 active=true;voice='missing';voices=[];const missing=s.read('missing');resolveLoad();await missing;assert(messages.at(-1).text.includes('ikke tilgængelig'));assert.equal(calls.length,3);
 console.log('PASS named arithmetic/answers, no persistent personal speech cache, shared voice choice, mute, cancellation and stale loads');
})().catch(e=>{console.error(e);process.exitCode=1});
