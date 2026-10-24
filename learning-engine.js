/* A separate practice session around the board game's existing question engine. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./engine.js'):root.AeselEngine);if(typeof module!=='undefined'&&module.exports)module.exports=api;root.AeselLearning=api})(globalThis,Engine=>{
 'use strict';
 const LEVELS=['child3','child5','child7','child10','child15','adult-let','adult-mellem','adult-svaer'];
 function player(level){if(!LEVELS.includes(level))throw Error('Vælg et gyldigt niveau.');return level.startsWith('child')?{kind:'child',age:Number(level.slice(5))}:{kind:'adult',difficulty:level.slice(6)}}
 function normal(value){const text=String(value).normalize('NFKC').toLocaleLowerCase('da-DK').trim().replace(/[×*]/g,' gange ').replace(/[÷\\/]/g,' divideret med ').replace(/[−–]/g,'-').replace(/\s+/g,' ');return /^-?\d+$/.test(text)?String(Number(text)):text.replace(/[.!?]+$/,'')}
 function create(level,type,random=Math.random,previous=null){const p=player(level);let task;for(let i=0;i<8;i++){task=Engine.makeChallenge({player:p,type,tables:'off',rng:random});if(!previous||task.question!==previous.question)break}return task}
 function roll(random=Math.random){const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Ugyldigt terningkast.');return 1+Math.floor(n*6)}
 function check(task,answer){return String(answer).trim()!==''&&normal(answer)===normal(task.correct)}
 function spoken(text){return String(text).replaceAll('🥕',' gulerod ').replaceAll('×',' gange ').replaceAll('÷',' divideret med ').replaceAll('−',' minus ').replaceAll('+',' plus ').replace(/\s+/g,' ').trim()}
 return {LEVELS,player,create,roll,check,normal,spoken,TASKS:Engine.TASKS};
});
