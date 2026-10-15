/* v0.9.13: variation, fair fordeling og bagudkompatibilitet, uden netværk. */
const assert=require('node:assert/strict');
const A=require('../actions.js');
const B=require('../board.js');
const G=require('../savegame.js');
const TYPES=Object.keys(A.COUNT_RANGES);
function rng(seed){let v=seed>>>0;return ()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);}
let variants=new Set(),sizeSets=new Set();
for(let seed=1;seed<=700;seed++){
 const layout=A.generateLayout(rng(seed));
 assert(A.validateLayout(layout),`Invalid random layout with seed ${seed}`);
 const nums=Object.keys(layout).map(Number).sort((a,b)=>a-b);
 const counts=Object.fromEntries(TYPES.map(type=>[type,Object.values(layout).filter(t=>t===type).length]));
 for(const [type,[min,max]] of Object.entries(A.COUNT_RANGES)){
  assert(counts[type]>=min&&counts[type]<=max,`${type} ${counts[type]} not in ${min}..${max}`);
 }
 const lanes=Array(5).fill(0);
 for(const n of nums){
  const band=Math.floor((n-1)/20);
  lanes[band]++;
  assert(n>=band*20+4&&n<=band*20+18,`Action too close to range end: ${n}`);
 }
 assert(Math.max(...lanes)-Math.min(...lanes)<=1,'Uneven distribution among lanes');
 assert(nums.every((n,i)=>!i||n-nums[i-1]>=2),'Two adjacent action fields');
 const svg=B.render(layout);
 assert.equal((svg.match(/class="board-tile /g)||[]).length,100,'All numbers still present');
 assert.equal((svg.match(/class="board-action-symbol"/g)||[]).length,nums.length,'SVG icons match random map');
 variants.add(nums.map(n=>n+':'+layout[n]).join(','));
 sizeSets.add(TYPES.map(t=>counts[t]).join(','));
}
assert(variants.size>680,'Random placements should vary across games');
assert(sizeSets.size>150,'Action counts should vary across games');
const old={schema:1,config:{raw:'1-100'},players:[{id:'player1',name:'Test',age:7,kind:'child',pos:0,stats:{attempted:0,correct:0}}],turn:0,phase:'move'};
const oldNormalized=G.normalize(old);
assert(oldNormalized&&oldNormalized.specialFields===null,'Old saves should keep the original fixed layout');
let fresh=A.generateLayout(rng(777));
const stored=G.normalize({...old,specialFields:fresh});
assert.deepEqual(stored.specialFields,fresh,'Random map saved and restored exactly');
const store=new Map(),local={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,String(val)),removeItem:key=>store.delete(key)};
assert(G.write(local,{...old,specialFields:fresh}));
assert.deepEqual(G.read(local).specialFields,fresh,'Random map survives serialization');
assert.equal(G.normalize({...old,specialFields:{'0':'bonus','10':'gulerod'}}).specialFields,null,'Invalid map is rejected');
assert.equal(G.normalize({...old,specialFields:{'5':'<script>'}}).specialFields,null,'Malicious type rejected');
console.log(`PASS random actions: 700 layouts, ${variants.size} unique boards and ${sizeSets.size} count mixes, 5 lanes, save+legacy`);
