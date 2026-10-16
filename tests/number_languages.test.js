const assert=require('node:assert/strict');const n=require('../numbers.js');
assert.equal(n.normalize('invalid'),'da');
for(const lang of ['da','en','de','es'])for(let x=0;x<=100;x++)assert.ok(n.word(x,lang),`${lang}: ${x}`);
assert.deepEqual(['fjorten','fourteen','vierzehn','catorce'],['da','en','de','es'].map(lang=>n.word(14,lang)));
assert.equal(n.word(21,'es'),'veintiuno');assert.equal(n.word(22,'es'),'veintidós');
assert.equal(n.word(31,'de'),'einunddreißig');assert.equal(n.word(40,'en'),'forty');
assert.deepEqual(n.parts(14,'da-de').map(p=>p.locale),['da-DK','de-DE']);
assert.equal(n.parts(14,'bogus')[0].lang,'da');
console.log('Number language tests passed');
