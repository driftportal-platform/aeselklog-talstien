const assert=require('node:assert/strict');const fs=require('node:fs');const test=require('node:test');
const card=fs.readFileSync('cardgame-ui.js','utf8'),app=fs.readFileSync('app.js','utf8'),html=fs.readFileSync('index.html','utf8');
test('Tal siges kun på flip (ikke place) og gentageknap ligger ved bunker',()=>{
 assert.match(card,/game\.lastAction==='flip'/);
 assert.match(card,/speechDone=window\.AeselVoice\?\.number/);
 assert.ok(html.indexOf('id="cardsRepeatNumber"')>html.indexOf('id="cardsPlayers"'));
 assert.ok(html.indexOf('id="cardsRepeatNumber"')<html.indexOf('id="cardsCenter"'));
});
test('Pause mellem sprog og dansk fem',()=>{
 assert.match(app,/setTimeout\(resolve,1500\)/);
 assert.match(app,/n!==5/);
 assert.match(app,/\^da\(\?:-\|\$\)/);
});
