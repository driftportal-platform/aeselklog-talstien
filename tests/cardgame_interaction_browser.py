"""New card-game gestures & CPU smoke tests. Chromium with mocked audio; no ElevenLabs credits."""
import json,re,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import os,tempfile
ROOT=Path(__file__).resolve().parents[1]
SHOTS=Path(os.environ.get('PREVIEW_DIR') or tempfile.gettempdir())
ORDER=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','music.js','cardgame-engine.js','app.js','home-ui.js','cardgame-ui.js']
def load(page):
 html=(ROOT/'index.html').read_text(encoding='utf8').replace('<head>', '<head><base href="https://aeselklog.test/">')
 html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text(encoding='utf8')+'</style>')
 html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
 page.route('https://aeselklog.test/**', lambda route: route.fulfill(status=200,body=(ROOT/route.request.url.rsplit('/',1)[-1]).read_bytes(),content_type='image/webp') if route.request.url.rsplit('/',1)[-1] in ('aeselklog-card.webp','home-fullscreen.webp') else route.abort())
 page.set_content(html,wait_until='load')
 page.evaluate('''() => {
  window.fetch=async()=>{throw Error('offline simulated')};
  const store={};window.__cardStore=store;
  Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}});
  window.speechSynthesis.speak=function(u){setTimeout(()=>u.onend?.(),20)};window.speechSynthesis.cancel=function(){};
  window.confirm=()=>true;
 }''')
 for script in ORDER:page.add_script_tag(content=(ROOT/script).read_text(encoding='utf-8'))
def get_state(page):return page.evaluate('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1"))')
def prepare_wrong(page):
 page.locator('#cardsHome').click()
 # Preserve all cards: seed 31 on top and a valid row starting at 21.
 page.evaluate('''() => {const E=window.AeselCards;let state=E.start({range:'21-40',names:['Aya','Simon']},()=>.5);
 const p=state.players[0],other=state.players[1],j=p.closed.length-1;
 let i=p.closed.indexOf(31);if(i>=0){[p.closed[i],p.closed[j]]=[p.closed[j],p.closed[i]];}
 else {i=other.closed.indexOf(31);if(i<0)throw Error('missing 31');[other.closed[i],p.closed[j]]=[p.closed[j],other.closed[i]];}
 const owner=state.players.find(p=>p.closed.includes(21));state.centers=[[owner.closed.splice(owner.closed.indexOf(21),1)[0]]];
 localStorage.setItem(E.SAVE_KEY,JSON.stringify(state));}''')
 page.locator('#cardsContinue').click()
def run(page,dimensions,touch=False):
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 load(page)
 page.locator('#homePlay').click();page.locator('#openCardSetup').click()
 page.locator('#cardCpuCheck').check()
 page.locator('#cardPlayerCount').select_option('1')
 assert page.locator('#cardPlayerNames input').count()==1
 page.locator('#cardStart').click()
 s=get_state(page);assert len(s['players'])==2 and s['players'][1]['isCPU']
 assert page.locator('.card-person--cpu').count()==1
 page.locator('[data-card-flip="true"]').first.click()
 assert get_state(page)['pending'] is not None
 assert page.locator('[data-card-source="pending"]').count()==1
 # A tap must select a card even on touchscreen (Pointer Events, not HTML5 drag/drop).
 if touch:
  page.locator('[data-card-source="pending"]').scroll_into_view_if_needed();r=page.locator('[data-card-source="pending"]').bounding_box();page.touchscreen.tap(r['x']+r['width']/2,r['y']+r['height']/2)
 else:page.locator('[data-card-source="pending"]').click()
 expect(page.locator('[data-card-source="pending"]')).to_have_class(re.compile('card-selected'))
 # Select a target (including a deliberately illegal one): do not block the move.
 page.locator('[data-target-kind="player"]').click()
 s=get_state(page);assert s['lastMove'] and s['lastMove']['type']=='place';assert s['players'][1]['open']
 # challenge the previous human's illegal play if it happened to be invalid.
 if not s['lastMove']['valid']:
  page.locator('#cardsChallenge').click()
  s=get_state(page);assert s['players'][0]['donkeys']==1 and not s['centers'] and s['pending'] is not None
  assert 'fortrudt' in page.locator('#cardsMessage').inner_text().lower()
 # Reopen deterministic two-human test state for drag and button actions.
 page.locator('#cardsFinish').click();page.locator('#openCardSetup').click() if page.locator('#openCardSetup').is_visible() else None
 page.locator('#cardCpuCheck').uncheck();page.locator('#cardPlayerCount').select_option('2');page.locator('#cardStart').click()
 prepare_wrong(page)
 page.locator('[data-card-flip="true"]').click()
 assert get_state(page)['pending']==31
 source=page.locator('[data-card-source="pending"]');target=page.locator('[data-target-kind="center"]')
 source.scroll_into_view_if_needed();a=source.bounding_box()
 page.mouse.move(a['x']+a['width']/2,a['y']+a['height']/2)
 page.mouse.down();page.mouse.move(a['x']+a['width']/2+15,a['y']+a['height']/2+15,steps=3)
 target.scroll_into_view_if_needed();b=target.bounding_box()
 page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2,steps=12);page.mouse.up()
 s=get_state(page)
 assert s['centers']==[[21,31]],s
 assert s['lastMove']['valid'] is False
 # Check persistence of an *uncontested* incorrect move and the undo checkpoint.
 page.locator('#cardsSaveHome').click();page.locator('#cardsContinue').click()
 assert get_state(page)['lastMove']
 page.locator('#cardsChallenge').click()
 s=get_state(page)
 assert s['centers']==[[21]] and s['pending']==31 and s['players'][0]['donkeys']==1,s
 # A player can throw a card on their own open pile, even if it should fit elsewhere.
 page.locator('#cardDiscard').click() if page.locator('#cardDiscard').count() else page.locator('#cardPlayPending').click()
 assert get_state(page)['turn']==1
 page.screenshot(path=str(SHOTS/f'preview_card_interaction_{dimensions}.png'),full_page=True)
 assert not errors,(dimensions,errors)
 print('PASS card gesture/challenge',dimensions)

def solo_cpu(page):
 load(page)
 page.locator('#homePlay').click();page.locator('#openCardSetup').click()
 page.locator('#cardCpuCheck').check();page.locator('#cardPlayerCount').select_option('1')
 page.locator('#cardStart').click()
 s=get_state(page); assert len(s['players'])==2
 # The CPU gets a turn after a human discards a card. Prevent auto challenge to observe CPU's next action.
 page.evaluate('Math.random=()=>.99')
 page.locator('[data-card-flip="true"]').click()
 page.locator('#cardDiscard').click() if page.locator('#cardDiscard').count() else page.locator('#cardPlayPending').click()
 assert get_state(page)['turn']==1
 page.wait_for_function('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).pending!==null || JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).turn!==1',timeout=8000)
 print('PASS solo CPU turn')


def cpu_spots_mistake(page):
 load(page)
 page.locator('#homePlay').click();page.locator('#openCardSetup').click()
 page.locator('#cardCpuCheck').check();page.locator('#cardPlayerCount').select_option('1')
 page.locator('#cardStart').click();page.locator('#cardsSaveHome').click()
 page.evaluate('''() => {const E=window.AeselCards,state=JSON.parse(localStorage.getItem(E.SAVE_KEY)),p=state.players[0];
 let i=p.closed.findIndex(n=>n!==1);const j=p.closed.length-1;
 [p.closed[i],p.closed[j]]=[p.closed[j],p.closed[i]];
 localStorage.setItem(E.SAVE_KEY,JSON.stringify(state));}''')
 page.locator('#cardsContinue').click()
 page.evaluate('Math.random=()=>0.4')
 page.locator('[data-card-flip="true"]').click()
 page.locator('#cardFlip').count() and None
 page.locator('[data-card-source="pending"]').click()
 page.locator('[data-target-kind="player"]').click()
 assert get_state(page)['lastMove']['valid'] is False
 page.wait_for_function('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).players[0].donkeys===1',timeout=6500)
 assert not get_state(page)['centers']
 print('PASS CPU catches an illegal human move and restores it')

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h,touch in [(390,844,True),(844,390,False),(1280,800,False)]:
  context=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
  page=context.new_page()
  try:run(page,f'{w}x{h}',touch)
  finally:context.close()
 context=browser.new_context(viewport={'width':390,'height':844});page=context.new_page()
 try:solo_cpu(page)
 finally:context.close()
 context=browser.new_context(viewport={"width":390,"height":844});page=context.new_page()
 try:cpu_spots_mistake(page)
 finally:context.close()
 browser.close()
