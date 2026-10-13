// Kør med: node tests/actions.test.js
const assert=require('node:assert/strict');
const A=require('../actions.js');
const B=require('../board.js');
assert(A.validate(),'Alle actionfelter skal ligge rigtigt');
assert.equal(Object.keys(A.FIELDS).length,25,'Fem specialfelter i hvert af de fem talområder');
for(let group=0;group<5;group++){
 const n=Object.keys(A.FIELDS).map(Number).filter(n=>Math.floor((n-1)/20)===group);
 assert.equal(n.length,5,`Talområde ${group+1} skal have fem actionfelter`);
}
for(const k of ['bonus','hov','byt','mester','gulerod','vandpyt','overraskelse','bro','super'])
 assert(Object.values(A.FIELDS).includes(k),`Mangler specialtype ${k}`);
assert.equal(A.surprise(()=>0).delta,3);
assert.equal(A.surprise(()=>0.3).delta,2);
assert.equal(A.surprise(()=>0.5).delta,-1);
assert.equal(A.surprise(()=>0.99).delta,-2);
assert.equal(A.destination(38,4,20,40),40,'Bro må ikke flytte ud over talområdet');
assert.equal(A.destination(22,-4,20,40),20,'Straf må ikke flytte før talområdets start');
const board=B.render(A.FIELDS);
assert.equal((board.match(/id="tile-\d+"/g)||[]).length,100);
assert(board.includes('aria-label="Felt 7, Gulerod"'));
assert(board.includes('aria-label="Felt 16, Vandpyt"'));
assert(board.includes('aria-label="Felt 27, Overraskelse"'));
assert(board.includes('aria-label="Felt 37, Bro"'));
assert(board.includes('aria-label="Felt 57, Superopgave"'));
assert(board.includes('aria-label="Felt 100"'));
console.log('OK: 25 felter, 9 actiontyper, fire overraskelser, banebounds og actionlabels.');
