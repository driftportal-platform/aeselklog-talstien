const assert=require('node:assert/strict'),E=require('../math-engine.js'),M=require('../math-objects.js');
for(const op of Object.keys(E.OPS))for(let a=1;a<=10;a++)for(let b=1;b<=10;b++){
 if(op==='subtract'&&b>a||op==='divide'&&a%b)continue;
 const p=E.problem(op,a,b),s=M.create(p);assert(!M.ready(s));
 if(op==='subtract'||op==='add')for(let i=0;i<b;i++)M.act(s,i);
 else if(op==='multiply')for(let g=0;g<a;g++)for(let i=0;i<b;i++)M.act(s,g);
 else for(let i=0;i<a/b;i++)for(let g=0;g<b;g++)M.act(s,g);
 assert(M.ready(s));assert.equal(M.items(s).length,p.answer);assert.equal(new Set(M.items(s)).size,p.answer);
 if(op==='subtract'){M.act(s,0);assert(!M.ready(s));M.act(s,0);assert(M.ready(s))}else assert.throws(()=>M.act(s,0));
}
const s=M.create(E.problem('divide',10,2));M.act(s,0);assert.throws(()=>M.act(s,0));assert.deepEqual(s.groups,[1,0]);
const z=M.create(E.problem('subtract',10,10));for(let i=0;i<10;i++)M.act(z,i);assert(M.ready(z));assert.deepEqual(M.items(z),[]);
console.log('PASS all four manipulations, removal/undo caps, fair division and count equals arithmetic');
