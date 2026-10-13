// Integration-smoketest uden rigtig browser: indlæser app.js i et isoleret DOM-mock.
// Kør med: node tests/flow.test.js
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const nodes=new Map();
function element(id=''){
 const classNames=new Set();
 const e={id,classList:{add:x=>classNames.add(x),remove:x=>classNames.delete(x),contains:x=>classNames.has(x),toggle:(x,b)=>{if(b===undefined)b=!classNames.has(x);if(b)classNames.add(x);else classNames.delete(x);return b}},
   dataset:{},style:{},value:'',hidden:false,innerHTML:'',textContent:'',disabled:false,checked:false,options:[],
   clientWidth:844,clientHeight:390,scrollLeft:0,scrollTop:0,offsetWidth:3,
   addEventListener:()=>{},querySelector:()=>element(),append:()=>{},replaceChildren:()=>{},
   setAttribute:()=>{},getBoundingClientRect:()=>({width:320,height:200}),scrollTo:()=>{}};
 if(id==='boardScroll'){e.clientWidth=844;e.clientHeight=390;}
 return e;
}
const document={
 body:element('body'),
 getElementById:id=>{if(!nodes.has(id))nodes.set(id,element(id));return nodes.get(id)},
 querySelector:selector=>element(selector),
 createElement:()=>element(),
 addEventListener:()=>{}
};
const window={
 AeselEngine:require(path.join(root,'engine.js')),
 AeselBoard:require(path.join(root,'board.js')),
 AeselActions:require(path.join(root,'actions.js')),
 matchMedia:()=>({matches:false}),
 addEventListener:()=>{},scrollTo:()=>{},
 speechSynthesis:{getVoices:()=>[],cancel:()=>{},speak:()=>{},addEventListener:()=>{}}
};
const realSetTimeout=setTimeout;
const speedTimeout=(callback,ms=0)=>realSetTimeout(callback,Math.min(ms,15));
const context={document,window,console,
   navigator:{},location:{protocol:'file:'},localStorage:{getItem:()=>null,setItem:()=>{}},
   URL,AbortController,
   setTimeout:speedTimeout,clearTimeout, setInterval:(callback,ms)=>setInterval(callback,Math.min(ms,20)),clearInterval,
   getComputedStyle:()=>({paddingLeft:'0',paddingTop:'0'}),
   requestAnimationFrame:callback=>speedTimeout(callback,1),
   Audio:class{constructor(){} play(){return Promise.resolve()} pause(){}},
   SpeechSynthesisUtterance:class{constructor(s){this.text=s}},
   matchMedia:window.matchMedia,globalThis:null,
};
context.globalThis=context;
let code=fs.readFileSync(path.join(root,'app.js'),'utf8');
const hook=`globalThis.__t={
 reset({people=[{name:'Anna',pos:0,age:6,kind:'child',isCPU:false}],start=0,goal=100,learning='leg'}={}){
  gameToken++;config={raw:'1-100',all:true,start,goal,learning,boardMode:'digital',moveDice:'physical',learnDice:'physical'};
  players=people.map((p,i)=>({...p,id:p.id||'p'+i,color:'#d84464',skipNextTurn:!!p.skipNextTurn}));
  turn=0;phase='move';pending=null;challenge=null;resultLines=[];winner=null;extraRollUsed=false;busy=false;
  sound.on=false;buildBoard();render();
 },
 get(){return {phase,turn,players:players.map(p=>({name:p.name,pos:p.pos,skipNextTurn:p.skipNextTurn,isCPU:p.isCPU})),pending,extraRollUsed,lines:[...resultLines],challenge}},
 receiveMoveRoll, nextTurn,chooseSuper,processAnswer,resolveLandingAction,scrollToTile
};`;
assert(code.endsWith('})();\n')||code.endsWith('})();'));
code=code.replace(/\}\)\(\);\s*$/,hook+'\n})();');
vm.runInNewContext(code,context,{filename:'app.js'});
const T=context.__t;
async function until(f,label){for(let i=0;i<300;i++){if(f())return;await new Promise(ok=>setTimeout(ok,10))}throw new Error('Timeout '+label+': '+JSON.stringify(T.get()));}
async function test(){
 // Gulerod: én ekstra turdel og ingen actionkæde
 T.reset({people:[{name:'Anna',pos:6,age:6,kind:'child'}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='move'&&T.get().extraRollUsed,'gulerod reroll');
 assert.equal(T.get().players[0].pos,7);
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='result','extra roll finished');
 assert.equal(T.get().players[0].pos,8);
 T.nextTurn();assert.equal(T.get().extraRollUsed,false,'Ekstra kast nulstilles ved ny tur');
 // Vandpyt
 T.reset({people:[{name:'Anna',pos:15,age:6,kind:'child'}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='result','puddle');
 assert.equal(T.get().players[0].skipNextTurn,true);
 T.nextTurn();assert.equal(T.get().phase,'skipped');
 T.nextTurn();assert.equal(T.get().phase,'move');assert.equal(T.get().players[0].skipNextTurn,false);
 // Overraskelse går direkte til afslutning, ikke actions på det nye felt
 T.reset({people:[{name:'Anna',pos:26,age:6,kind:'child'}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='result','surprise');
 assert(T.get().lines.some(x=>x.includes('Overraskelse')));
 assert(T.get().players[0].pos>=25&&T.get().players[0].pos<=30);
 // Bro kan ikke gå uden for valgt talområde
 T.reset({start:20,goal:40,people:[{name:'Anna',pos:36,age:6,kind:'child'}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='win','bridge goal');
 assert.equal(T.get().players[0].pos,40);
 // Frivillig superopgave
 T.reset({people:[{name:'Anna',pos:56,age:6,kind:'child'}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='super-offer','super offer');
 T.chooseSuper(false);assert.equal(T.get().phase,'result');assert.equal(T.get().players[0].pos,57);
 T.nextTurn(); // another round
 // reset directly for correct supercase
 T.reset({people:[{name:'Anna',pos:56,age:6,kind:'child'}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='super-offer','super offer 2');
 T.chooseSuper(true);assert.equal(T.get().phase,'question');
 const c=T.get().challenge;T.processAnswer(c.options.indexOf(c.correct));
 await until(()=>T.get().phase==='result','super correct');assert.equal(T.get().players[0].pos,60);
 // CPU kan sige nej til superopgave, og kan få ekstra terningkast
 T.reset({people:[{name:'Æslet',pos:56,age:8,kind:'cpu',isCPU:true}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='super-offer','CPU super offer');
 T.chooseSuper(false);assert.equal(T.get().phase,'result');
 T.reset({people:[{name:'Æslet',pos:6,age:8,kind:'cpu',isCPU:true}]});
 T.receiveMoveRoll(1);await until(()=>T.get().phase==='move'&&T.get().extraRollUsed,'CPU carrot extra roll');
 await until(()=>T.get().phase==='result'&&T.get().players[0].pos!==7,'CPU finished animated extra dice roll');
 console.log('PASS: gulerod, vandpyt, overraskelse, bro, frivillig superopgave og CPU-turflow.');
}
test().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
