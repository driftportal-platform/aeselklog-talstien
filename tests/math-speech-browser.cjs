const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{const f=await fixture({count:2});try{
 const p=await f.contexts[0].newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto(f.origin+'/aeselklog-talstien/index.html?spil=regneklog');
 await p.evaluate(()=>{const start=AeselMath.start;AeselMath.start=o=>{const s=start(o);s.tasks=Array.from({length:5},()=>AeselMath.problem('add',6,1));return s};window.lines=[];window.stops=0;let done;AeselVoice.sayWithVoice=(text,options)=>{lines.push({text,options});return new Promise(r=>{done=r})};AeselVoice.stop=()=>{stops++;done?.()};AeselVoice.listVoices=()=>window.testVoices||[{id:'mia',name:'Mia'}];AeselVoice.loadVoices=async()=>{testVoices=[{id:'mia',name:'Mia'},{id:'anne',name:'Anne'}]}});
 assert.equal(await p.evaluate(()=>lines.length),0);
 const setup=p.locator('#mathSetup .math-speech-options');await setup.locator('summary').click();await setup.locator('.math-player-name').fill('Aya');await setup.locator('.math-load-voices').click();await setup.locator('.math-speech-voice').selectOption('anne');
 await p.locator('#mathStart').click();await p.waitForFunction(()=>lines.length===1);assert.equal((await p.evaluate(()=>lines[0])).text,'Aya, hvad er 6 plus 1?');assert.equal((await p.evaluate(()=>lines[0])).options.voice,'anne');assert(await p.locator('#mathStopRead').isVisible());
 await p.locator('#mathStopRead').click();assert(await p.locator('#mathStopRead').isHidden());await p.locator('#mathRead').click();assert.equal(await p.evaluate(()=>lines.length),2);
 await p.locator('#mathAnswer').fill('8');await p.locator('#mathCheck').click();assert.equal(await p.locator('#mathScore').textContent(),'0 point');assert(await p.locator('#mathNext').isHidden());assert.equal(await p.locator('#mathProgress').textContent(),'Opgave 1 af 5');assert.match((await p.evaluate(()=>lines.at(-1))).text,/Du svarede 8.*Aya.*prøve igen/);assert.equal(await p.locator('#mathAnswer').inputValue(),'8');assert(await p.locator('#mathAnswer').isEnabled());
 await p.locator('#mathAnswer').fill('');const before=await p.evaluate(()=>lines.length);await p.locator('#mathCheck').click();assert.equal(await p.evaluate(()=>lines.length),before);
 await p.locator('#mathHelp').click();await p.locator('#mathReadHelp').click();assert.equal((await p.evaluate(()=>lines.at(-1))).text,await p.locator('#mathGuideText').textContent());assert.match(await p.locator('#mathGuideTitle').textContent(),/Trin 1/);await p.locator('#mathHintNext').click();await p.locator('#mathReadHelp').click();assert.equal((await p.evaluate(()=>lines.at(-1))).text,await p.locator('#mathGuideText').textContent());
 await p.locator('#mathAnswer').fill('7');await p.locator('#mathCheck').click();assert.equal(await p.locator('#mathScore').textContent(),'5 point');assert.match((await p.evaluate(()=>lines.at(-1))).text,/Du svarede 7.*Flot klaret, Aya.*helt rigtigt/);assert(await p.locator('#mathNext').isVisible());
 await p.locator('#mathNext').click();assert.equal((await p.evaluate(()=>lines.at(-1))).text,'Aya, hvad er 6 plus 1?');
 const game=p.locator('#mathGame .math-speech-options');await game.locator('summary').click();await game.locator('.math-read-feedback').uncheck();const n=await p.evaluate(()=>lines.length);await p.locator('#mathAnswer').fill('8');await p.locator('#mathCheck').click();assert.equal(await p.evaluate(()=>lines.length),n);
 await game.locator('.math-speech-voice').selectOption('device');await p.locator('#mathRead').click();assert.equal((await p.evaluate(()=>lines.at(-1))).options.voice,'device');
 await p.evaluate(()=>{AeselVoice.enabled=()=>false});const muted=await p.evaluate(()=>lines.length);await p.locator('#mathRead').click();assert.equal(await p.evaluate(()=>lines.length),muted);assert.match(await p.locator('#mathSpeechStatus').textContent(),/Lyd er slået fra/);
 await p.evaluate(()=>{AeselVoice.enabled=()=>true});await p.locator('#mathRead').click();const nav=await p.evaluate(()=>lines.length);await p.locator('#mathGameBack').click();await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>lines.length),nav);assert(await p.locator('#gameChooser').isVisible());
 await p.locator('#openMathSetup').click();await p.reload();await p.locator('#mathSetup .math-speech-options summary').click();assert.equal(await p.locator('#mathSetup .math-player-name').inputValue(),'Aya');assert.equal(await p.locator('#mathSetup .math-speech-voice').inputValue(),'device');assert(!await p.locator('#mathSetup .math-read-feedback').isChecked());
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}

 // Real shared voice adapter with mocked HTTP/audio: verify selected voice and
 // personal text reach the existing TTS contract, without a paid service call.
 const q=await f.contexts[0].newPage(),requests=[];
 q.on('pageerror',e=>errors.push(e.message));
 await q.route('https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev/**',async route=>{
  if(new URL(route.request().url()).pathname==='/voices')return route.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({voices:[{id:'anne',name:'Anne'}]})});
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST'}});
  requests.push(route.request().postDataJSON());return route.fulfill({contentType:'audio/mpeg',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.alloc(600)});
 });
 await q.goto(f.origin+'/aeselklog-talstien/index.html?spil=regneklog');
 await q.evaluate(()=>{localStorage.setItem('aeselklog-regneklog-settings-v1',JSON.stringify({speech:{name:'Aya',voice:'anne',autoRead:true,feedback:true}}))});await q.reload();await q.locator('#mathStart').click();
 await q.waitForFunction(()=>document.querySelector('#mathStopRead').hidden);assert(requests.length>0);assert.equal(requests[0].voice,'anne');assert.match(requests[0].text,/Aya, hvad er/);
 const m=(await q.locator('#mathEquation').textContent()).match(/(\d+) ([+−×÷]) (\d+)/),a=+m[1],b=+m[3],answer=m[2]==='+'?a+b:m[2]==='−'?a-b:m[2]==='×'?a*b:a/b;
 await q.locator('#mathAnswer').fill(String(answer));await q.locator('#mathCheck').click();await q.waitForFunction(()=>document.querySelector('#mathStopRead').hidden);assert.equal(requests.at(-1).voice,'anne');assert.match(requests.at(-1).text,new RegExp('Du svarede '+answer+'.*Aya'));
 await q.locator('#mathNext').click();await q.locator('#mathHelp').click();await q.locator('#mathReadHelp').click();await q.waitForFunction(()=>document.querySelector('#mathStopRead').hidden);assert.equal(requests.at(-1).text,await q.locator('#mathGuideText').textContent());
 await q.setViewportSize({width:390,height:844});await q.screenshot({path:f.root+'/preview-math-speech.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS math voices: named questions and answers, retry, readable hints, choices, mute, stop and settings persistence');
}finally{await f.close()}})().catch(e=>{console.error(e);process.exitCode=1});
