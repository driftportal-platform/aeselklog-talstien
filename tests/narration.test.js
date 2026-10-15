/* Variation er deterministisk testbar, men i spillet vælges stemmen tilfældigt. */
const assert=require('node:assert/strict');
const N=require('../narration.js');
const VC=require('../voicecache.js');
assert.equal(N.HOV_CHANCE,0.35);
const greeting='Hov hov! Nu er det Lisas tur.';
assert.equal(N.prepare(greeting,{random:()=>0}),greeting);
assert.equal(N.prepare(greeting,{random:()=>0.349}),greeting);
assert.equal(N.prepare(greeting,{random:()=>0.35}),'Nu er det Lisas tur.');
assert.equal(N.prepare(greeting,{random:()=>0.999}),'Nu er det Lisas tur.');
assert.equal(N.prepare('Hov, hov! Velkommen til spillet.',{random:()=>0.9}),'Velkommen til spillet.');
assert.equal(N.prepare('Hov hov!',{random:()=>0.9}),'Hov hov!');
assert.equal(N.prepare('Æslet! Hov hov! Ryk to felter tilbage.',{random:()=>0.9}),'Æslet! Hov hov! Ryk to felter tilbage.');
assert.equal(N.prepare('Hov hov! Nu er det Lisas tur.',{cpu:true,random:()=>0.9}),greeting);
assert.equal(N.prepare(greeting,{repeat:true,random:()=>0.9}),greeting);
assert.equal(N.prepare('Nu er det Lisas tur.',{random:()=>0}),'Nu er det Lisas tur.');
// Fordeling 350 af 1000 for kendte, kontrollerede udfald.
let keep=0;
for(let i=0;i<1000;i++){
 if(N.prepare(greeting,{random:()=>i/1000}).startsWith('Hov hov!'))keep++;
}
assert.equal(keep,350);
// Udvalgte foruddefinerede, upersonlige sætninger må caches MED/UDEN indledning.
assert(VC.isSafePhrase('Hov, hov! I byttede pladser.'));
assert(VC.isSafePhrase('I byttede pladser.'));
assert(!VC.isSafePhrase('Nu er det Lisas tur.'));
assert(!VC.isSafePhrase('Hov, hov! Nu er det Lisas tur.'));
console.log('PASS: 35% tilfældig indledning, CPU undtaget, Gentag stabil, stemmesikker cache');
