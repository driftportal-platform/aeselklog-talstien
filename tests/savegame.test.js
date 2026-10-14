const assert=require('node:assert/strict');
const G=require('../savegame.js');
const P=require('../adaptive.js');
const storage=new Map();
const local={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const obj={
 config:{raw:'21-40',all:false,start:20,goal:40,learning:'udfordring',boardMode:'digital',moveDice:'physical',learnDice:'physical',pace:'rolig',tables:'7',adaptive:true},
 players:[{name:'Anna',id:'player1',age:6,kind:'child',isCPU:false,difficulty:'mellem',color:'#d84464',pos:26,skipNextTurn:false,stats:{attempted:6,correct:4},learning:{step:1,wrongStreak:0,rightStreak:1,attempted:6,correct:4}},{name:'Æslet',id:'cpu',age:8,kind:'cpu',isCPU:true,color:'#c18b46',pos:33,skipNextTurn:true,stats:{attempted:3,correct:1}}],
 turn:0,phase:'question',pending:{from:23,roll:3,landing:26,target:26,correct:false,feedback:'',actionHandled:false},
 challenge:{type:6,question:'Hvad er 7 × 5?',correct:'35',options:['30','35','40'],help:'Gang med syv',tier:'5–6 år',adaptiveStep:1,timeLimit:0},
 resultLines:['Anna slog 3.'],extraRollUsed:false,timeLeftMs:0
};
assert.equal(G.write(local,obj),true);
const out=G.read(local);
assert.equal(out.schema,1);assert.equal(out.config.raw,'21-40');assert.equal(out.config.start,20);
assert.equal(out.players[0].learning.step,1);assert.equal(out.players[1].skipNextTurn,true);
assert.equal(out.challenge.correct,'35');assert.equal(out.phase,'question');
assert.equal(out.players[1].age,8);
assert(!storage.get(G.KEY).includes('ELEVENLABS'));
const clone=structuredClone(obj);clone.phase='moving';assert.equal(G.normalize({...clone,schema:G.SCHEMA})?.phase,'move');
clone.players[1].id='player1';assert.equal(G.normalize({...clone,schema:G.SCHEMA}),null);
assert.equal(G.clear(local),true);assert.equal(G.read(local),null);
const adaptive=P.fresh();let x=adaptive;
for(let i=0;i<3;i++)x=P.note(x,true).state;
assert.equal(x.step,1);
x=P.note(x,false).state;x=P.note(x,false).state;
assert.equal(x.step,0);
x=P.note(x,true,{helped:true}).state;
assert.equal(x.rightStreak,0);
console.log('PASS: gem/læs/slet, valide snapshots, dataafgrænsning og progression.');
