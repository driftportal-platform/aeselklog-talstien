"""v0.9.12: Rigtige DOM-effekter, uden AI-netværk. Også reduceret bevægelse.
Bruger Chromium og simuleret tale. Ingen iPhone-/ElevenLabs-live-test.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).parents[1]
FILES=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js',
       'profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js',
       'narration.js','actionfx.js','app.js','home-ui.js']

def load(page):
    html=(ROOT/'index.html').read_text('utf-8').replace('<link rel="stylesheet" href="./styles.css">',
              '<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''()=>{
       const store={};window.__localItems=store;
       Object.defineProperty(window,'localStorage',{configurable:true,value:{
         getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]
       }});
       window.fetch=async()=>{throw Error('Offline mock')};
       window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),20);
       window.speechSynthesis.cancel=()=>{};
       window.confirm=()=>true;
    }''')
    for file in FILES:
        # Denne regression tester den kendte bonus på felt 5 fra ældre spil;
        # nye tilfældige placeringer testes særskilt i random_actions_browser.py.
        if file=='app.js':
            page.evaluate('window.AeselActions.generateLayout=()=>({...window.AeselActions.FIELDS})')
        page.add_script_tag(content=(ROOT/file).read_text('utf-8'))

def test(page,w,h,reduced=True):
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    load(page)
    assert page.locator('#home').is_visible()
    page.evaluate("AeselShowView('settings')")
    page.locator('#range').select_option('1-20')
    page.locator('input[name=learning][value=leg]').check()
    page.locator('input[name=moveDice][value=physical]').check()
    page.locator('#gamePace').select_option('normal')
    page.locator('#settingsDone').click()
    page.locator('#homePlay').click()
    page.locator('#voiceToggle').click() # ingen AI-kald, fokus er visuel effekttest
    page.locator('#startButton').click()
    assert page.locator('#boardBox').evaluate('el=>el.classList.contains("expanded")')
    assert page.locator('#boardBray').is_visible()
    page.wait_for_function('()=>document.querySelector("#boardPanelDock").dataset.phase === "move"')
    page.locator('#turnPanel [data-act="move-5"]').click()
    page.wait_for_function('()=>document.querySelector("#actionToast").classList.contains("show")',timeout=13000)
    effect=page.locator('#actionToast')
    assert effect.get_attribute('data-action')=='bonus'
    assert 'fx-reward' in effect.get_attribute('class')
    assert '+2' in effect.inner_text()
    assert 'Bonus' in effect.inner_text()
    assert effect.get_attribute('aria-atomic')=='true'
    # Mål pop-up straks, mens den er synlig: den skjules automatisk efter få sekunder.
    box=effect.bounding_box()
    assert box and box['width']>130 and box['x']>=0 and box['x']+box['width']<=w+2,(w,h,box)
    if reduced and (w,h)==(390,844):
        page.screenshot(path='/mnt/data/AeselKlog_v0912_Specialfelt_iPhone.png')
    if reduced and (w,h)==(844,390):
        page.screenshot(path='/mnt/data/AeselKlog_v0912_Specialfelt_Liggende.png')
    animation=effect.locator('.toast-icon').evaluate('el=>getComputedStyle(el).animationName')
    assert (animation=='none') is reduced, f'Bevægelsesindstilling ikke respekteret: {animation} vs reduced={reduced}'
    if w<h:
        moving=page.locator('#boardPanelDock').bounding_box()
        assert moving and moving['width']>=w*.75, (w,h,'turpanel for smalt',moving)
    page.wait_for_function('()=>document.querySelector("#boardPanelDock").dataset.phase==="result"',timeout=18000)
    assert page.locator('#actionToast').is_hidden()
    assert page.locator('#boardSvg').is_visible()
    assert not errors,errors
    print(f'PASS action-felt, reduced={reduced} og geometri {w}x{h}')

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(390,844),(844,390),(1280,800)]:
        page=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
        test(page,w,h)
        page.close()
    page=browser.new_page(viewport={"width":390,"height":844},reduced_motion="no-preference")
    test(page,390,844,reduced=False)
    page.close()
    browser.close()
