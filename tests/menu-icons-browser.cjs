const assert=require('node:assert/strict'),fixture=require('./online-browser-harness.cjs');
(async()=>{const f=await fixture({count:2});try{
 const p=await f.contexts[0].newPage();await p.goto(f.origin+'/aeselklog-talstien/index.html?spil=menu');
 for(const width of [320,390,768,1280]){
  await p.setViewportSize({width,height:844});await p.locator('#gameChooser').waitFor();
  const sizes=await p.locator('.game-mode-card').evaluateAll(cards=>cards.map(card=>{
   const box=card.querySelector('.game-mode-icon').getBoundingClientRect(),img=card.querySelector('.game-mode-icon img').getBoundingClientRect(),text=card.querySelector('.game-mode-copy').getBoundingClientRect();
   return {id:card.id,box:{x:box.x,y:box.y,width:box.width,height:box.height},img:{x:img.x,y:img.y,width:img.width,height:img.height},textX:text.x};
  }));
  const reference=sizes.find(x=>x.id==='chooseBoardMode');
  for(const id of ['openFishSetup','openRummySetup']){
   const item=sizes.find(x=>x.id===id);assert(item);
   assert.equal(item.img.width,reference.img.width);assert.equal(item.img.height,reference.img.height);
   assert(item.img.x>=item.box.x && item.img.y>=item.box.y);
   assert(item.img.x+item.img.width<=item.box.x+item.box.width+.1);
   assert(item.img.y+item.img.height<=item.box.y+item.box.height+.1);
   assert(item.img.x+item.img.width<item.textX);
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:f.root+'/preview-icons.png',fullPage:true});
 console.log('PASS menu icons: matching dimensions, contained artwork, no label overlap at 320/390/768/1280 px');
}finally{await f.close()}})().catch(e=>{console.error(e);process.exitCode=1});
