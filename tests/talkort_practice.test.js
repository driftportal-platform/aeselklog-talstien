const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const src=fs.readFileSync(path.join(__dirname,'..','talkort.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('Talkort has optional local recording and compare controls',()=>{
 for(const id of ['talkortPracticeEnabled','talkortRecord','talkortHearMine','talkortCompare','talkortAuto','talkortDelay','talkortReset'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(src,/getUserMedia\(\{audio:true\}\)/);assert.match(src,/new MediaRecorder\(/);
 assert.match(src,/URL\.revokeObjectURL/);
 assert.doesNotMatch(src,/fetch\([^)]*recordedUrl/);
});
test('Talkort auto waits for complete audio, preserves interruption and offers retry',()=>{
 assert.match(src,/await readForRun\(id\)/);assert.match(src,/ok==='interrupted'/);assert.match(src,/talkortCountResume/);assert.match(src,/AeselCounter.pause/);assert.match(src,/stopAuto\(\)/);
});
