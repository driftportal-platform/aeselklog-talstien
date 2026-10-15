const assert=require('node:assert/strict');
const P=require('../adaptive.js'),V=require('../parentreport.js');
const now=Date.now();
const base=P.freshProgress();
let state=P.noteArea(base,'plus',true).state;
state=P.noteArea(state,'plus',true).state;
state=P.noteArea(state,'plus',true).state;
const report={name:'<img src=x onerror=alert(1)>',progress:state,updatedAt:now,
 history:[{area:'plus',correct:true,helped:false,step:0,t:now-86400000},
 {area:'plus',correct:true,helped:false,step:0,t:now-1000},
 {area:'plus',correct:true,helped:false,step:1,t:now}]};
const summary=V.summary(report,now);
assert.equal(summary.areas.find(x=>x.id==='plus').level,1);
assert.equal(summary.areas.find(x=>x.id==='plus').percentage,100);
assert.equal(summary.areas.find(x=>x.id==='minus').percentage,null);
assert.equal(summary.areas.find(x=>x.id==='plus').last30,3);
assert.equal(summary.areas.find(x=>x.id==='plus').recent.length,3);
const html=V.renderHtml(report,now);
assert(html.includes('Talforståelse')&&html.includes('Plus')&&html.includes('Minus')&&html.includes('Gangetabeller'));
assert(html.includes('3 af 3 rigtige'));
assert(html.includes('&lt;img src=x onerror=al'));
assert(!html.includes('<img src=x onerror'));
assert(!html.includes('null %')&&!html.includes('NaN'));
assert(V.renderHtml(null).includes('Ingen lokal'));
const old=V.renderHtml({name:'Karla',progress:P.freshProgress(),history:[]},now);
assert(old.includes('Historik kommer'));
console.log('PASS: four-area learning view, accuracy, timeline, empty state, privacy wording and XSS escaping');
