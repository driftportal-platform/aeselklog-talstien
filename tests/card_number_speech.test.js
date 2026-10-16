const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=fs.readFileSync(require('node:path').join(__dirname,'../cardgame-ui.js'),'utf8');
test('Kortspil siger kortets tal ved vending og placering',()=>{
 assert.match(ui,/else if\(out&&Number\.isFinite\(out\.number\)\)line=`\$\{out\.number\}\.`/);
 assert.match(ui,/Æslet lægger \$\{out\.number\}/);
 assert.doesNotMatch(ui,/Jeg vender et kort\.|Kortet er vendt\.|Et kort er lagt\.|Jeg lægger et kort\./);
});
