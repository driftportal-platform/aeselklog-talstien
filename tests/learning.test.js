const assert=require('node:assert/strict'),E=require('../learning-engine.js');
let seed=45;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
for(const level of E.LEVELS)for(let type=1;type<=6;type++)for(let i=0;i<80;i++){
 const t=E.create(level,type,random);assert.equal(t.type,type);assert(t.options.includes(t.correct));assert(E.check(t,t.correct));assert(E.check(t,'  '+t.correct.toUpperCase()+'  '));assert(!E.check(t,''));assert(!E.check(t,'not-an-answer'));assert(t.help.length);assert(t.question.length);assert(!E.spoken(t.question).includes('🥕'));
}
assert.equal(E.roll(()=>0),1);assert.equal(E.roll(()=>.9999),6);assert.throws(()=>E.roll(()=>1));assert.throws(()=>E.create('bad',1));assert.throws(()=>E.create('child7',7));assert(E.check({correct:'6 × 7'},'6*7'));assert(E.check({correct:'4'},'04'));assert(!E.check({correct:'4'},'4x'));assert.equal(E.spoken('4 × 5 − 3 + 2 ÷ 1'),'4 gange 5 minus 3 plus 2 divideret med 1');
console.log('PASS learning dice: all eight levels and six topics, answer modes, narration and dice bounds');

for(const level of E.LEVELS.filter(l=>l!=='child3'))for(let i=0;i<50;i++){const t=E.create(level,1,random);const m=t.question.match(/^(\d+) ([+−]) (\d+) = \?$/);assert(m,t.question);assert.equal(Number(t.correct),m[2]==='+'?Number(m[1])+Number(m[3]):Number(m[1])-Number(m[3]));}

const S=require('../engine.js');
for(let age=3;age<=17;age++)for(let type=1;type<=6;type++)for(let i=0;i<30;i++){
 const t=S.makeChallenge({player:{kind:'child',age},type,tables:'off',rng:random});assert.equal(t.topicLabel,S.taskTitle(t));
 if(t.question.startsWith('Tryk på tallet'))assert.equal(t.topicLabel,'Talgenkendelse');
 if(t.question.startsWith('Tæl gulerødderne'))assert.equal(t.topicLabel,'Tæl gulerødder');
 if(type===4){if(age<=4)assert.equal(t.topicLabel,'Talgenkendelse');else if(age<=6)assert.equal(t.topicLabel,'Plus');else if(age<=8)assert.equal(t.topicLabel,'Delelighed med 2');else assert.equal(t.topicLabel,'Primtal')}
}
assert.equal(S.taskTitle({type:4,question:'Er 16 deleligt med 2 uden rest?'}),'Delelighed med 2');
assert.equal(S.taskTitle({type:4,question:'Er 17 et primtal?'}),'Primtal');

const B=require('../boardgame-engine.js'),board=B.start({},[{name:'Barn',boardProfile:{kind:'child',age:7}},{name:'Voksen',boardProfile:{kind:'adult'}}]);board.question=S.makeChallenge({player:{kind:'child',age:7},type:4,rng:()=>.4});board.phase='question';assert.equal(B.view(board,0).question.topicLabel,'Delelighed med 2');assert(!Object.hasOwn(B.view(board,0).question,'correct'));delete board.question.topicLabel;assert.equal(B.view(board,0).question.topicLabel,'Delelighed med 2');

assert.equal(E.spoken('28 − 1 = ?'),'Hvad er 28 minus 1?');assert.equal(E.spoken('4 + 2 = ?'),'Hvad er 4 plus 2?');
