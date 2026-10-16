/* v0.9.16: mode choices are actual buttons; full party can be resumed. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const save=require('../savegame.js');
const originals=['chooseBoardMode','openCardSetup','cardsChooseBoard','cardsChooseCards'];
for(const id of originals){
  assert(new RegExp('<button\\b[^>]*\\bid="'+id+'"').test(html),`${id} must be a button`);
  assert(app.includes(`$('${id}')`)||['openCardSetup','cardsChooseBoard','cardsChooseCards'].includes(id),`click handler missing ${id}`);
}
assert(css.includes('.game-mode-card[aria-pressed="true"]'),'selected choice highlight missing');
assert(app.includes('setupPlayers.length>=6'),'six-player button limit');
assert(app.includes('setupPlayers.length<6'),'six-player addition limit');
assert(html.includes('Op til 6 spillere'),'limit not documented in UI');
const colors=app.match(/const COLORS=\[([^\]]+)\]/)[1].match(/#[0-9a-f]{6}/gi);
assert.equal(colors.length,6,'six distinct player colors');assert.equal(new Set(colors).size,6);
const people=Array.from({length:6},(_,i)=>({name:'Spiller '+(i+1),id:'player'+(i+1),kind:'child',age:7,isCPU:false,pos:0,color:colors[i]}));
const cpu={name:'Æsel',id:'cpu',kind:'cpu',age:8,isCPU:true,pos:0,color:'#c18b46'};
const snapshot={schema:1,config:{raw:'1-100',learning:'leg',boardMode:'digital'},players:[...people,cpu],phase:'move',turn:6};
const normalized=save.normalize(snapshot);
assert(normalized,'seven total slots (6 humans + 1 CPU) must be saved');assert.equal(normalized.players.length,7);assert.equal(normalized.turn,6);
assert.equal(save.normalize({...snapshot,players:[...people,cpu,cpu]}),null,'overcapacity still rejected');
const storage={data:new Map(),setItem(k,v){this.data.set(k,v)},getItem(k){return this.data.get(k)},removeItem(k){this.data.delete(k)}};
assert(save.write(storage,snapshot));assert.equal(save.read(storage).players.length,7);
console.log('PASS: both clickable game modes, six colors, six humans plus CPU, save/resume and bounds');
