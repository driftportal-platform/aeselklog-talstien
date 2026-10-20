"""v0.9.16: responsive, keyboard-accessible mode switch and six board players with CPU.
Uses local files and simulated voice/Storage, no paid API.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','music.js','cardgame-engine.js','app.js','cardgame-ui.js','home-ui.js']

def load(page, storage=None):
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+ (ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''(initial) => {
      const items={...initial};window.__testStorage=items;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>items[k]??null,setItem:(k,v)=>{items[k]=String(v)},removeItem:k=>delete items[k]}});
      window.confirm=()=>true;
      window.fetch=async()=>{throw Error('offline mock')};
      window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),30);
      window.speechSynthesis.cancel=()=>{};
    }''',storage or {})
    for filename in SCRIPTS: page.add_script_tag(content=(ROOT/filename).read_text(encoding='utf-8'))

def visit(page, tag):
    faults=[];page.on('pageerror',lambda e:faults.append(str(e)))
    load(page)
    page.locator('#homePlay').click()
    assert page.locator('#setup').is_visible()
    assert page.locator('#chooseBoardMode').is_visible()
    assert page.locator('#openCardSetup').is_visible()
    assert page.locator('#chooseBoardMode').get_attribute('aria-pressed')=='true'
    assert page.locator('#openCardSetup').get_attribute('aria-pressed')=='false'
    # All selection surfaces are large and the visible cards don't overlap.
    board=page.locator('#chooseBoardMode').bounding_box();cards=page.locator('#openCardSetup').bounding_box()
    assert board and cards and board['height']>=85 and cards['height']>=85
    assert board['x']+board['width']<=cards['x']+1 or board['y']+board['height']<=cards['y']+1
    page.screenshot(path=str(ROOT/f'preview_game_modes_{tag}.png'),full_page=True)
    # Switch to card setup, validate that board controls are hidden, switch back.
    page.locator('#openCardSetup').click()
    assert page.locator('#cardsSetup').is_visible() and not page.locator('#setup').is_visible()
    assert page.locator('#openCardSetup').get_attribute('aria-pressed')=='true'
    assert page.locator('#chooseBoardMode').get_attribute('aria-pressed')=='false'
    assert not page.locator('#cpuCheck').is_visible()
    assert page.locator('#cardRange').is_visible()
    page.screenshot(path=str(ROOT/f'preview_card_mode_{tag}.png'),full_page=True)
    page.locator('#chooseBoardMode').click()
    assert page.locator('#setup').is_visible() and not page.locator('#cardsSetup').is_visible()
    assert page.locator('#cpuCheck').is_visible() and not page.locator('#cardRange').is_visible()
    # Six player slots plus CPU, unique colors, save and resume unchanged.
    for index in range(4):page.locator('#addPlayer').click()
    assert page.locator('#playerInputs .player-input').count()==6
    assert page.locator('#addPlayer').is_disabled()
    colors=page.locator('#playerInputs .player-dot').evaluate_all('(nodes)=>nodes.map(n=>getComputedStyle(n).backgroundColor)')
    assert len(set(colors))==6,colors
    assert page.locator('#boardPlayerLimitNote').is_visible()
    page.screenshot(path=str(ROOT/f'preview_six_players_{tag}.png'),full_page=True)
    page.locator('#cpuCheck').check()
    page.locator('#voiceToggle').click()
    page.locator('#startButton').click()
    assert page.locator('#game').is_visible() and page.locator('#scores .score-card').count()==7
    page.locator('#boardExit').click()
    page.locator('#exitSave').click()
    assert page.locator('#home').is_visible() and page.locator('#resumeCard').is_visible()
    stored=page.evaluate('()=>JSON.parse(localStorage.getItem("aeselklog-igangvaerende-v1"))')
    assert len(stored['players'])==7 and stored['players'][-1]['isCPU'] and stored['turn']==0
    # New localStorage is not required; re-open same saved game after returning home.
    page.locator('#resumeGame').click()
    assert page.locator('#game').is_visible() and page.locator('#scores .score-card').count()==7
    assert not faults,(tag,faults)
    print('PASS mode chooser + 6 humans/CPU/resume',tag)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
    for w,h in [(390,844),(844,390),(1280,800)]:
        pg=browser.new_page(viewport={'width':w,'height':h},locale='da-DK',reduced_motion='reduce')
        try:visit(pg,f'{w}x{h}')
        finally:pg.close()
    browser.close()
