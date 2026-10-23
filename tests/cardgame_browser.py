"""Offline Chromium smoke test for new digital card game, no ElevenLabs calls."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import re, json, os
import os,tempfile
ROOT=Path(__file__).resolve().parents[1]
SHOTS=Path(os.environ.get('PREVIEW_DIR') or tempfile.gettempdir())
ORDER=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','music.js','cardgame-engine.js','app.js','home-ui.js','cardgame-ui.js']

def load(page):
    html=(ROOT/'index.html').read_text(encoding='utf-8').replace('<head>', '<head><base href="https://aeselklog.test/">')
    page.route('https://aeselklog.test/**', lambda route: route.fulfill(status=200,body=(ROOT/route.request.url.rsplit('/',1)[-1]).read_bytes(),content_type='image/webp') if route.request.url.rsplit('/',1)[-1] in ('aeselklog-card.webp','home-fullscreen.webp') else route.abort())
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''() => {
      window.fetch=async()=>{throw Error('offline simulated')};
      const data={};window.__cardTestStorage=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>delete data[k]}});
      window.speechSynthesis.speak=function(u){setTimeout(()=>u.onend?.(),30)};
      window.speechSynthesis.cancel=function(){};
      window.confirm=()=>true;
    }''')
    for item in ORDER:page.add_script_tag(content=(ROOT/item).read_text(encoding='utf-8'))

def run(page, dimensions):
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load(page)
    page.locator('#homePlay').click()
    assert page.locator('#openCardSetup').is_visible()
    assert page.locator('#startButton').is_visible()
    page.locator('#openCardSetup').click()
    assert page.locator('#cardsSetup').is_visible()
    assert page.locator('#cardRange option').count()==5
    assert page.locator('#cardRange option[value="1-100"]').count()==0
    page.locator('#cardRange').select_option('21-40')
    page.locator('#cardPlayerCount').select_option('3')
    page.locator('#cardVariant').select_option('collect')
    page.locator('#cardDonkeyCount').select_option('6')
    page.locator('#cardExtraPenalty').check()
    page.locator('#cardPlayerNames input').nth(0).fill('Amalie')
    page.locator('#cardPlayerNames input').nth(1).fill('Aya')
    page.locator('#cardPlayerNames input').nth(2).fill('Far')
    page.locator('#cardStart').click()
    assert page.locator('#cardsGame').is_visible()
    assert '21–40' in page.locator('#cardsPlayTitle').inner_text()
    assert page.locator('#cardFlip').is_visible()
    assert page.locator('.card-person').count()==3
    assert page.evaluate('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).players.length')==3
    assert page.evaluate('localStorage.getItem("aeselklog-igangvaerende-v1")') is None
    page.locator('[data-card-flip="true"]').click()
    assert page.locator('.card-flipped-over [data-card-source="pending"]').count()==1
    # Et vendt kort kan nu lægges direkte i egen åbne bunke, uden det gamle "Dit kort"-panel.
    page.locator('#cardDiscard').click()
    assert page.locator('#cardsMessage').inner_text()
    page.locator('#cardPenalties summary').click()
    page.locator('#cardPenaltyPlayer').select_option('1')
    page.locator('#cardsGivePenalty').click()
    assert page.evaluate('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).players[1].donkeys')==1
    page.locator('#cardsSaveHome').click()
    assert page.locator('#cardsSetup').is_visible()
    assert page.locator('#cardsResume').is_visible()
    page.locator('#cardsContinue').click()
    assert page.locator('#cardsGame').is_visible()
    assert page.locator('.card-person-donkeys').nth(1).locator('img').count()==1
    assert not errors,(dimensions,errors)
    page.screenshot(path=str(SHOTS/f'preview_cards_{dimensions}.png'),full_page=True)
    page.locator('#cardsSaveHome').click()
    page.locator('#cardsDeleteSave').click()
    assert not page.locator('#cardsResume').is_visible()
    page.locator('#cardVariant').select_option('passing')
    assert not page.locator('#cardDonkeySetting').is_visible()
    page.locator('#cardStart').click()
    assert page.locator('#cardsGame').is_visible()
    if not page.locator('#cardPenalties').evaluate('(el)=>el.open'): page.locator('#cardPenalties summary').click()
    page.locator('#cardPenaltyPlayer').select_option('0');page.locator('#cardsGivePenalty').click()
    assert page.evaluate('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).players[0].donkeys')==1
    page.locator('#cardPenaltyPlayer').select_option('2');page.locator('#cardsGivePenalty').click()
    assert page.evaluate('JSON.parse(localStorage.getItem("aeselklog-kortspil-v1")).players.map(p=>p.donkeys).join(",")')=='0,0,1'
    assert not errors,(dimensions,errors)
    print('PASS card game',dimensions)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(390,844),(844,390),(1280,800)]:
        page=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
        try:run(page,f'{w}x{h}')
        finally:page.close()
    browser.close()
