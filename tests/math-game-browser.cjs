const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{const f=await fixture({count:2});try{
 const p=await f.contexts[0].newPage();const errors=[];p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push(e.message));const base=f.origin+'/aeselklog-talstien/index.html';
 await p.goto(base+'?spil=menu');await p.locator('#openMathSetup').click();await p.waitForURL('**?spil=regneklog');assert(await p.locator('#mathSetup').isVisible());assert(await p.locator('#gameChooser').isHidden());await p.reload();assert(await p.locator('#mathSetup.active').isVisible());
 await p.locator('[name=mathOperation][value=add]').uncheck();await p.locator('#mathStart').click();assert.match(await p.locator('#mathSetupError').textContent(),/Vælg mindst/);await p.locator('[name=mathOperation][value=add]').check();
 const solve=async()=>{const text=await p.locator('#mathEquation').textContent(),m=text.match(/(\d+) ([+−×÷]) (\d+)/);const a=+m[1],b=+m[3];return m[2]==='+'?a+b:m[2]==='−'?a-b:m[2]==='×'?a*b:a/b};
 // All operations and all levels; screen layout, help and score behavior.
 for(const level of ['easy','medium','hard'])for(const op of ['add','subtract','multiply','divide']){
  for(const name of ['add','subtract','multiply','divide'])await p.locator(`[name=mathOperation][value=${name}]`).setChecked(name===op);
  await p.locator('#mathLevel').selectOption(level);await p.locator('#mathLength').selectOption('5');await p.locator('#mathMode').selectOption('visual');await p.locator('#mathStart').click();
  assert(await p.locator('#mathVisual').isVisible());assert(await p.locator('#mathNext').isHidden());
  await p.locator('#mathAnswer').fill('');await p.locator('#mathCheck').click();assert.match(await p.locator('#mathFeedback').textContent(),/Skriv/);
  const answer=await solve();await p.locator('#mathAnswer').fill(String(answer+1));await p.locator('#mathCheck').click();assert.equal(await p.locator('#mathScore').textContent(),'0 point');assert(await p.locator('#mathNext').isHidden());
  await p.locator('#mathHelp').click();assert.match(await p.locator('#mathGuideTitle').textContent(),/Trin 1/);await p.locator('#mathHintNext').click();assert.match(await p.locator('#mathGuideTitle').textContent(),/Trin 2/);
  if(op==='subtract')assert.equal(await p.locator('#mathVisual .math-removed').count(),+(await p.locator('#mathEquation').textContent()).match(/− (\d+)/)[1]);
  if(op==='divide'){const m=(await p.locator('#mathEquation').textContent()).match(/(\d+) ÷ (\d+)/);assert.equal(await p.locator('#mathVisual .math-baskets .math-carrot').count(),+m[1]);assert.equal(await p.locator('#mathVisual .math-baskets .math-tray').count(),+m[2])}
  for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${level}/${op}/${width}`)}
  await p.locator('#mathHideHelp').click();await p.locator('#mathAnswer').fill(String(answer));await p.locator('#mathAnswer').press('Enter');assert.equal(await p.locator('#mathScore').textContent(),'5 point');assert(await p.locator('#mathCheck').isDisabled());await p.locator('#mathNew').click();
 }

 // A complete numbers-only round: invalid input, own answer, hint, revealed solution,
 // no double credit, next-task reset and the final point summary.
 await p.locator('#mathMode').selectOption('numbers');await p.locator('#mathStart').click();
 assert(await p.locator('#mathVisual').isHidden());await p.locator('#mathAnswer').fill(String(await solve()));await p.locator('#mathCheck').click();
 assert.equal(await p.locator('#mathScore').textContent(),'10 point');await p.locator('#mathNext').click();
 await p.locator('#mathHelp').click();assert(await p.locator('#mathVisual').isVisible());
 await p.locator('#mathHintNext').click();await p.locator('#mathSolution').click();assert.equal(await p.locator('#mathScore').textContent(),'10 point');assert.match(await p.locator('#mathGuideTitle').textContent(),/Løsningen/);await p.locator('#mathNext').click();
 assert(await p.locator('#mathVisual').isHidden());assert(await p.locator('#mathGuide').isHidden());await p.locator('#mathAnswer').fill(String(await solve()));await p.locator('#mathCheck').click();await p.locator('#mathNext').click();
 await p.locator('#mathHelp').click();await p.locator('#mathHideHelp').click();await p.locator('#mathAnswer').fill(String(await solve()));await p.locator('#mathCheck').click();assert.equal(await p.locator('#mathScore').textContent(),'25 point');await p.locator('#mathNext').click();
 await p.locator('#mathAnswer').fill(String(await solve()));await p.locator('#mathCheck').click();await p.locator('#mathNext').click();
 assert(await p.locator('#mathSummary').isVisible());assert.match(await p.locator('#mathSummaryText').textContent(),/35 af 50/);assert.match(await p.locator('#mathSummaryDetail').textContent(),/3 løst selv · 1 løst med hjælp · 1 løsninger/);
 await p.locator('#mathAgain').click();assert.equal(await p.locator('#mathMode').inputValue(),'numbers');await p.reload();assert.equal(await p.locator('#mathMode').inputValue(),'numbers');assert(await p.locator('#mathSetup').isVisible());
 await p.locator('#mathMode').selectOption('visual');await p.locator('#mathLevel').selectOption('easy');await p.locator('[name=mathOperation][value=divide]').uncheck();await p.locator('[name=mathOperation][value=subtract]').check();await p.locator('#mathStart').click();await p.locator('#mathHelp').click();await p.locator('#mathHintNext').click();
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:f.root+'/preview-math-mobile.png',fullPage:true});await p.setViewportSize({width:1280,height:900});await p.screenshot({path:f.root+'/preview-math-desktop.png',fullPage:true});
 await p.locator('#mathGameBack').click();assert(await p.locator('#gameChooser').isVisible());await p.goBack();assert(await p.locator('#mathSetup').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS math browser: routes, choices, all operations/levels, helpers, scoring and responsive layout');
}finally{await f.close()}})().catch(e=>{console.error(e);process.exitCode=1});
