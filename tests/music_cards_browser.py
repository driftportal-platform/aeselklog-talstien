"""v0.9.19: CC0-MP3, kompakt kortspil, fælles CPU-stemme; simuleret lyd."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
ORDER=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','music.js','cardgame-engine.js','app.js','home-ui.js','cardgame-ui.js']
def load(page):
 html=(ROOT/'index.html').read_text(encoding='utf-8').replace('<head>','<head><base href="https://aeselklog.test/">')
 html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
 html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
 page.route('https://aeselklog.test/**',lambda route:route.fulfill(body=(ROOT/route.request.url.rsplit('/',1)[-1]).read_bytes(),content_type='image/webp') if route.request.url.rsplit('/',1)[-1] in ('aeselklog-card.webp','home-fullscreen.webp') else route.abort())
 page.set_content(html,wait_until='load')
 page.evaluate('''() => {
  const items={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>items[k]??null,setItem:(k,v)=>items[k]=String(v),removeItem:k=>delete items[k]}});
  window.fetch=async()=>{throw Error('offline simulation')};
  window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),16);window.speechSynthesis.cancel=()=>{};
  window.confirm=()=>true;
  // Fake HTMLMediaElement: træk/spilflow testes uden browserens autoplay-/codec-afhængighed.
  window.Audio=class FakeAudio {
   constructor(src=''){this.src=src;this.dataset={};this.paused=true;this.volume=1;this.loop=false;}
   addEventListener(){} load(){}
   play(){this.paused=false;return Promise.resolve()}
   pause(){this.paused=true}
  };
 }''')
 for f in ORDER:page.add_script_tag(content=(ROOT/f).read_text(encoding='utf-8'))
def run(page,w,h):
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 load(page)
 assert page.locator('#musicEnabled').count()==1
 assert not page.locator('#musicEnabled').is_checked()
 page.locator('#homeSettings').click()
 assert page.locator('#musicTrack option').count()==3
 page.locator('#musicTrack').select_option('march')
 page.locator('#musicVolume').fill('47')
 page.locator('#musicEnabled').check()
 assert page.evaluate('JSON.parse(localStorage.getItem("aeselklog-baggrundsmusik-v1")).volume')==47
 assert page.evaluate('window.AeselMusic.get().track')=='march'
 page.locator('#settingsDone').click()
 page.evaluate('''() => {
   window.__cardSpeech=[];window.AeselVoice={say:(line,options)=>{window.__cardSpeech.push({line,cpu:!!options?.cpu});return new Promise(resolve=>setTimeout(resolve,35))},enabled:()=>true,stop:()=>{}};
   Math.random=()=>.98;
 }''')
 page.locator('#homePlay').click();page.locator('#openCardSetup').click()
 page.locator('#cardCpuCheck').check();page.locator('#cardPlayerCount').select_option('1')
 page.locator('#cardStart').click()
 assert page.locator('#cardsGame').is_visible()
 assert page.locator('#cardsPending').count()==0,'old giant selected-card panel removed'
 assert page.locator('.card-person').count()==2
 assert page.locator('#cardsMusicToggle').get_attribute('aria-pressed')=='true'
 assert page.evaluate('window.AeselMusic.getState().playing') is True
 assert page.locator('.card-flipped-over').count()==0
 page.locator('[data-card-flip="true"]').click()
 assert page.locator('.card-flipped-over [data-card-source="pending"]').count()==1
 source=page.locator('.card-flipped-over [data-card-source="pending"]')
 source.click();assert 'card-selected' in source.get_attribute('class')
 page.locator('[data-target-kind="self-open"]').click()
 assert page.locator('.card-flipped-over').count()==0
 assert page.locator('.card-person--cpu').count()==1
 assert page.locator('.card-quick-actions').count()==1
 page.wait_for_function('window.__cardSpeech.some(x=>x.cpu)',timeout=10000)
 assert any(not x['cpu'] for x in page.evaluate('window.__cardSpeech'))
 assert page.locator('#cardsVoiceToggle').get_attribute('aria-pressed')=='true'
 page.locator('#cardsVoiceToggle').click()
 assert page.locator('#cardsVoiceToggle').get_attribute('aria-pressed')=='false'
 page.locator('#cardsMusicToggle').click()
 assert not page.evaluate('window.AeselMusic.get().enabled')
 assert page.locator('#cardsMusicToggle').get_attribute('aria-pressed')=='false'
 page.screenshot(path=str(ROOT/f'preview_v0918_cards_{w}x{h}.png'),full_page=True)
 assert not errors,(w,h,errors)
 print('PASS v0.9.19 compact cards + shared voice + MP3 music',w,h)
def cpu_waits_for_voice(page):
    """CPU'en må ikke fortsætte før oplæsningen er afsluttet."""
    load(page)
    page.evaluate("() => { window.__voiceRelease=null; window.AeselVoice={say:(line,opts)=>line==='Et kort er lagt.'?new Promise(resolve=>window.__voiceRelease=resolve):Promise.resolve(),enabled:()=>true,stop:()=>{}}; Math.random=()=>.99; }")
    page.locator('#homePlay').click();page.locator('#openCardSetup').click()
    page.locator('#cardCpuCheck').check();page.locator('#cardPlayerCount').select_option('1')
    page.locator('#cardStart').click()
    page.locator('[data-card-flip="true"]').click();page.locator('#cardDiscard').click()
    page.wait_for_function('typeof window.__voiceRelease === "function"',timeout=5000)
    page.wait_for_timeout(1600)
    game=page.evaluate('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1"))')
    assert game['turn']==1 and game['pending'] is None,'CPU skal vente på stemmen'
    page.evaluate('window.__voiceRelease()')
    page.wait_for_function('() => {const g=JSON.parse(localStorage.getItem("aeselklog-kortspil-v1"));return g.pending!==null||g.turn!==1}',timeout=8000)
    print('PASS CPU venter på hele kortspils-oplæsningen')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(390,844),(844,390),(1280,800)]:
  page=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
  try:run(page,w,h)
  finally:page.close()
 context=browser.new_context(viewport={'width':390,'height':844});page=context.new_page()
 try:cpu_waits_for_voice(page)
 finally:context.close()
 browser.close()
