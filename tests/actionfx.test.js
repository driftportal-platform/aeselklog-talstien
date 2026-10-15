/* v0.9.12 – actioneffects er ren præsentation og ændrer ingen specialfelters regler. */
const assert=require('node:assert/strict');
const FX=require('../actionfx.js');
const rules=require('../actions.js');
const tones=new Set(['reward','oops','water','choice','surprise']);
for(const [type,detail] of Object.entries(rules.DETAILS)){
  const result=FX.describe(type);
  assert(tones.has(result.tone),type);
  assert(result.badge.length>0,type);
  assert(result.symbol===detail.icon,type);
  assert.equal(result.type,type);
  assert(Object.isFrozen(result));
}
assert.deepEqual([FX.describe('overraskelse',{delta:3}).badge,FX.describe('overraskelse',{delta:-2}).badge],['+3','−2']);
assert.equal(FX.describe('overraskelse',{delta:3}).tone,'reward');
assert.equal(FX.describe('overraskelse',{delta:-2}).tone,'oops');
assert.equal(FX.describe('overraskelse').tone,'surprise');
assert.equal(FX.describe('bonus',{delta:0}).badge,'Bliv stående');
assert.equal(FX.describe('gulerod',{used:true}).badge,'Allerede brugt');
assert.equal(FX.describe('bro',{delta:2}).badge,'+2');
const unknown=FX.describe('hack"><script>');
assert.equal(unknown.type,'default');
assert.equal(unknown.tone,'choice');
assert.equal(FX.describe('overraskelse',{delta:10000}).badge,'Hvad mon?');
assert(rules.validate());
console.log('PASS: alle 9 specialfelter, typer, fortegn, begrænsninger og sikre klasser');
