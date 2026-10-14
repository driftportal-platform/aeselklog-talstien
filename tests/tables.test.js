const assert=require('node:assert/strict');
const E=require('../engine.js');
const users=[
 {kind:'child',age:3},{kind:'child',age:5},{kind:'child',age:6},
 {kind:'child',age:7},{kind:'child',age:9},{kind:'adult',age:34,difficulty:'let'},
 {kind:'adult',age:34,difficulty:'mellem'},{kind:'adult',age:34,difficulty:'svaer'}
];
for(let i=0;i<3500;i++){
 const p=users[i%users.length];
 const selected=['auto','mix','off','2','5','7','9','12'][i%8];
 const task=E.makeChallenge({player:p,type:6,tables:selected,field:27,roll:3});
 assert(task.options.includes(task.correct));
 assert.equal(task.options.length,new Set(task.options).size);
 assert(task.options.length>=2);
 if(p.age<=6)assert(!task.table,'Børn 3–6 får ikke tabeller');
 if(selected==='off')assert(!task.table,'Deaktiverede tabeller er respekteret');
 if(task.table){assert(task.table>=2&&task.table<=12);if(/^\d+$/.test(selected))assert.equal(task.table,Number(selected));}
 if(p.kind==='adult')assert([10,30,60].includes(task.timeLimit));
 else assert(!task.timeLimit,'Ingen tid for børn');
}
for(let table=2;table<=12;table++){
 for(let i=0;i<60;i++){
  const task=E.makeChallenge({player:{kind:'child',age:9},type:6,tables:String(table)});
  assert.equal(task.table,table);
  assert(task.question.includes(`${table} × `));
 }
}
console.log('PASS: Gangetabeller 2–12, alderstilpasning, korrekte svar og tidsgrænser.');
