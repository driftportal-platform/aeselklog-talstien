const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{const f=await fixture({count:2});try{const p=await f.contexts[0].newPage();p.on('pageerror',e=>f.errors.push(e.message));p.on('dialog',d=>d.accept());
for(const width of [390,1280]){await p.setViewportSize({width,height:900});
 for(const [route,title,icon,options,field,start] of [['talstien','Talstien','board-game','boardSetupOptions','range','startButton'],['kortspil','Kortspil','card-game','cardsSetupOptions','cardRange','cardStart']]){
 await p.goto(f.origin+'/aeselklog-talstien/index.html?spil='+route);await p.locator('#'+start).waitFor();
 assert.equal(await p.locator('#pageTitle').textContent(),'ÆselKlog - '+title);assert((await p.locator('#pageBrandIcon img').getAttribute('src')).endsWith('/'+icon+'.svg'));
 assert.equal(await p.locator('.view.active > .page-heading').count(),0);assert.equal(await p.locator('.card-setup-intro').count(),0);
 assert(await p.locator('#'+field).isHidden());assert(await p.locator('#'+start).isVisible());
 await p.screenshot({path:f.root+'/preview_setup_'+route+'_'+width+'_v0975.png',fullPage:true});
 await p.locator('#'+options+' > summary').click();assert(await p.locator('#'+field).isVisible());await p.locator('#'+field).selectOption('21-40');
 await p.locator('#'+options+' > summary').click();assert(await p.locator('#'+field).isHidden());assert.equal(await p.locator('#'+field).inputValue(),'21-40');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#'+start).click();await p.locator(route==='talstien'?'#game.active':'#cardsGame.active').waitFor();
 }
 await p.goto(f.origin+'/aeselklog-talstien/index.html?spil=talkort');await p.locator('#talkort.active').waitFor();assert(await p.locator('#talkortLanguage').isHidden());await p.locator('#talkortOptions > summary').click();assert(await p.locator('#talkortLanguage').isVisible());
}assert.deepEqual(f.errors,[]);console.log('PASS matching menu icons, one page heading, collapsible settings preserve options and start both games at mobile/desktop sizes');}finally{await f.close()}})().catch(e=>{console.error(e);process.exitCode=1});
