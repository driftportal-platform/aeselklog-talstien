// Kør med: node tests/board.test.js
const assert = require('node:assert/strict');
const B = require('./board.js');
assert.equal(B.WIDTH,1700);
assert.equal(B.HEIGHT,1210);
assert(B.validate(),'Banens geometriske rækkefølge skal være gyldig');
const nums = Array.from({length:100},(_,i)=>i+1);
const xy = nums.map(n=>B.position(n));
assert.equal(new Set(xy.map(p=>`${p.x},${p.y}`)).size,100,'Ingen talfelter må ligge oven på hinanden');
for(let lane=0;lane<5;lane++){
 const positions=nums.slice(lane*20,(lane+1)*20).map(n=>B.position(n));
 for(let i=1;i<positions.length;i++){
  if(lane%2===0)assert(positions[i].x>positions[i-1].x,`Række ${lane+1} skal gå mod højre`);
  else assert(positions[i].x<positions[i-1].x,`Række ${lane+1} skal gå mod venstre`);
 }
}
const specials={5:'bonus',10:'hov',15:'byt',29:'bonus',90:'hov',95:'mester'};
const svg=B.render(specials);
assert.equal((svg.match(/class="board-tile r\d/g)||[]).length,100);
const actual=Array.from(svg.matchAll(/id="tile-(\d+)"/g),m=>Number(m[1]));
assert.deepEqual(actual,nums,'SVG skal indeholde samtlige tal 1–100 i stigende DOM-rækkefølge');
assert(svg.includes('aria-label="Felt 5, Bonus"'),'Actionfelterne skal beholde nummer og ikon');
assert(svg.includes('aria-label="Felt 100"'),'Felt 100 skal være med');
const svgPlain=B.render({});
assert.equal((svgPlain.match(/class="board-tile r\d/g)||[]).length,100);
// Sammenhængende vej: de største hop må kun være U-sving mellem rækkerne.
for(let i=1;i<xy.length;i++){
 const a=xy[i-1],b=xy[i];
 const d=Math.hypot(b.x-a.x,b.y-a.y);
 assert(d>1&&d<220,`Ingen brud mellem felterne ${i} og ${i+1}: ${d.toFixed(1)}`);
}
console.log('OK: 100 unikke tal, fem korrekt snoede rækker, actionnumre og sammenhængende SVG-bane.');
