const assert=require('node:assert/strict');const fs=require('node:fs');const test=require('node:test');
const path=require('node:path'),root=path.join(__dirname,'..');
const card=fs.readFileSync(path.join(root,'cardgame-ui.js'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('Tal siges kun på flip (ikke place) og gentageknap ligger ved bunker',()=>{
 assert.match(card,/game\.lastAction==='flip'/);
 assert.match(card,/speechDone=Promise\.resolve\(speechDone\)/);
 assert.match(card,/AeselOfflineNumbers\?\.play/);
 assert.ok(html.indexOf('id="cardsRepeatNumber"')>html.indexOf('id="cardsPlayers"'));
 assert.ok(html.indexOf('id="cardsRepeatNumber"')<html.indexOf('id="cardsCenter"'));
});
test('Pause mellem sprog og dansk fem',()=>{
 assert.match(app,/setTimeout\(resolve,650\)/);
 assert.match(app,/n!==5/);
 assert.match(app,/\^da\(\?:-\|\$\)/);
});
