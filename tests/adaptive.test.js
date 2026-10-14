const assert=require('node:assert/strict');
const S=require('../engine.js');
const P=require('../adaptive.js');
function seeded(seed=123){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}}
function mean(age,step){const rng=seeded(1987),p={kind:'child',age};let sum=0;for(let i=0;i<250;i++){const c=S.makeChallenge({player:p,type:6,field:32,roll:2,tables:'off',skillStep:step,rng});assert(c.options.includes(c.correct));assert.strictEqual(c.adaptiveStep,step);sum+=Number(c.correct);}return sum/250;}
assert(mean(6,2)>mean(6,-2),'6-årige bør få gradvist større regnestykker');
assert(mean(8,2)>mean(8,-2),'8-årige skal opleve sværhedsændring');
for(let age=3;age<=6;age++)for(let step=-2;step<=2;step++){
 const p={kind:'child',age};for(let type=1;type<=6;type++)for(let i=0;i<30;i++){
  const c=S.makeChallenge({player:p,type,skillStep:step,rng:seeded(i+type*100)});
  assert(c.options.includes(c.correct));
  if(age<=6)assert(!/[×÷]/.test(c.question),`For svær opgave for ${age} år: ${c.question}`);
 }
}
const adult={kind:'adult',age:18,difficulty:'mellem'};
const first=S.makeChallenge({player:adult,type:6,tables:'off',skillStep:-2,rng:seeded(999)});
const last=S.makeChallenge({player:adult,type:6,tables:'off',skillStep:2,rng:seeded(999)});
assert.equal(first.question,last.question,'Voksne skal beholde valgt sværhedsgrad');
assert.equal(last.timeLimit,30);
assert.deepEqual(P.fresh(),{step:0,rightStreak:0,wrongStreak:0,attempted:0,correct:0});
console.log('PASS: adaptiv progression, børnealdre, rigtige svar og fast voksen-timer.');
