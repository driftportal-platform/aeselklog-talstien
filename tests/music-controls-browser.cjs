const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{const f=await fixture({count:2});try{
 const p=await f.contexts[0].newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());const base=f.origin+'/aeselklog-talstien/index.html';
 await p.goto(base+'?spil=menu');assert(await p.locator('#topMusicToggle').isHidden());
 const cases=[['talstien','setup','game','startButton','board'],['kortspil','cardsSetup','cardsGame','cardStart','cards'],['talkort','talkort','talkort',null,'talkort'],['torskeklog','fishSetup','fishGame','fishStart','fish'],['500','rummySetup','rummyGame','rummyStart','rummy'],['regneklog','mathSetup','mathGame','mathStart','math']];
 for(const [route,setup,game,start,mode] of cases){
  await p.goto(base+'?spil='+route);assert(await p.locator('#topMusicToggle').isVisible());assert.equal(await p.locator('#topMusicToggle').getAttribute('aria-pressed'),'false');if(start)await p.locator('#'+start).click();
  await p.locator('#'+game+'.active').waitFor();const toggle=p.locator(game==='game'?'#boardMusicToggle':'#topMusicToggle');await toggle.click();assert(await p.evaluate(()=>AeselMusic.getState().playing),game+' '+JSON.stringify(await p.evaluate(()=>({state:AeselMusic.getState(),pref:AeselMusic.get(),audio:AeselAudioSettings.current()})))+' errors:'+errors.join('|'));assert.equal(await toggle.getAttribute('aria-pressed'),'true');
  const menu=p.locator('#'+game+' .shared-music-options');await menu.locator('summary').click();assert.equal(await menu.locator('.music-menu-toggle').getAttribute('aria-pressed'),'true');await menu.locator('.music-menu-track').selectOption('march');await menu.locator('.music-menu-volume').evaluate(n=>{n.value='27';n.dispatchEvent(new Event('input',{bubbles:true}))});
  assert.deepEqual(await p.evaluate(()=>({track:AeselMusic.get().track,volume:AeselMusic.get().volume})),{track:'march',volume:27});
  assert.equal(await p.evaluate(m=>AeselAudioSettings.forMode(m).music,mode),true);if(mode==='math'){await p.setViewportSize({width:390,height:844});await p.screenshot({path:f.root+'/preview-music-menu.png',fullPage:true})}
  for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),game+' '+width)}
  await p.goto(base+'?spil=menu');assert(!await p.evaluate(()=>AeselMusic.getState().playing));await p.goto(base+'?spil='+route);assert.equal(await p.locator('#topMusicToggle').getAttribute('aria-pressed'),'true');if(start)await p.locator('#'+start).click();
  assert(await p.evaluate(()=>AeselMusic.getState().playing));await toggle.click();assert(!await p.evaluate(()=>AeselMusic.getState().playing));
 }
 assert.deepEqual(errors,[]);console.log('PASS music: six offline games, independent saved profiles, menus/top button, three tracks, volume, responsive layout and menu stop');
}finally{await f.close()}})().catch(e=>{console.error(e);process.exitCode=1});
