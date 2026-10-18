/* Kør alle Node-tests: node tests/run-all.js (bruges af npm test og GitHub Actions). */
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort();
const failed=[];
for(const file of files){
  const r=spawnSync(process.execPath,[path.join('tests',file)],{cwd:root,encoding:'utf8'});
  if(r.status===0)console.log('ok   '+file);
  else{failed.push(file);console.log('FAIL '+file+'\n'+(r.stdout+r.stderr).split('\n').slice(-15).join('\n'))}
}
console.log(`\n${files.length-failed.length}/${files.length} bestået`);
process.exit(failed.length?1:0);
