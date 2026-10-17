const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
test('500 unique MP3 files, 100 in each language/role',()=>{
 const roles=['narrator','donkey','en','de','es'];let total=0;
 for(const role of roles){for(let n=1;n<=100;n++){const file=path.join(root,'audio','numbers',role,String(n).padStart(3,'0')+'.mp3');assert(fs.existsSync(file),file);const buf=fs.readFileSync(file);assert(buf.length>1000,`short ${file}`);assert(buf.subarray(0,3).toString()==='ID3'||(buf[0]===0xff&&(buf[1]&0xe0)===0xe0),`not MP3 ${file}`);total++;}}
 assert.equal(total,500);
});
test('offline audio cache is preserved during upgrades; no precache of 500',()=>{
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.match(sw,/const AUDIO_CACHE='aeselklog-number-audio-v1'/);assert.match(sw,/name!==AUDIO_CACHE/);assert.doesNotMatch(sw,/\.\/audio\/numbers\/narrator\/001\.mp3.*CORE/);
});
test('talkort and common voice playback prefer the recorded numbers',()=>{
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),ui=fs.readFileSync(path.join(root,'talkort.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(app,/AeselOfflineNumbers\.play\(n,numberLanguage,role\)/);assert.match(ui,/AeselVoice\.number\(number/);assert.match(html,/id="downloadNumberAudio"/);assert.match(html,/id="stopNumberAudio"/);
});
