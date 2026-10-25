"""v0.9.14 responsive physical board/exit dialog integration. Chromium offline mock."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64
import os,tempfile
ROOT=Path(__file__).resolve().parents[1]
SHOTS=Path(os.environ.get('PREVIEW_DIR') or tempfile.gettempdir())
SCRIPTS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','app.js','home-ui.js']
def bootstrap(page,items=None):
    html=(ROOT/'index.html').read_text('utf-8').replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    for filename in ['home-fullscreen.webp','aeselklog-card.webp']:
        path=ROOT/filename
        html=html.replace('./'+filename,'data:image/webp;base64,'+base64.b64encode(path.read_bytes()).decode())
    page.set_content(html,wait_until='load')
    page.evaluate('''initial=>{
      const data={...initial};window.__localItems=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
      window.fetch=async()=>{throw Error('offline mock')};
      window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),30);
      window.speechSynthesis.cancel=()=>{};
      window.confirm=()=>true;
    }''',items or {})
    for f in SCRIPTS:page.add_script_tag(content=(ROOT/f).read_text('utf-8'))
def begin(page,physical=False,cpu=False):
    page.evaluate("AeselShowView('settings')")
    page.locator('#range').select_option('1-20')
    page.locator('input[name="learning"][value="leg"]').check()
    page.locator('input[name="boardMode"][value="physical"]' if physical else 'input[name="boardMode"][value="digital"]').check()
    page.locator('input[name="moveDice"][value="physical"]').check()
    page.locator('#gamePace').select_option('normal')
    page.locator('#settingsDone').click()
    page.locator('#homePlay').click()
    if cpu: page.locator('.remove-player').last.click();page.locator('#cpuCheck').check()
    else: page.locator('.remove-player').last.click()
    page.locator('#voiceToggle').click()
    page.locator('#startButton').click()
def phase(page,p,timeout=9000):
    page.wait_for_function('(phase)=>document.querySelector("#boardPanelDock").dataset.phase===phase',arg=p,timeout=timeout)
def key(page):
    return page.evaluate('()=>window.__localItems["aeselklog-igangvaerende-v1"]')

with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for size in [(390,844),(844,390),(1280,800)]:
        page=browser.new_page(viewport={'width':size[0],'height':size[1]},reduced_motion='reduce')
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        bootstrap(page)
        page.evaluate("AeselShowView('settings')")
        assert page.locator('.voice-settings>summary').evaluate('(el)=>getComputedStyle(el).listStyleType')=='none'
        page.locator('#settingsBack').click()
        begin(page,physical=True)
        assert page.locator('#physicalGuide').is_visible(),size
        assert not page.locator('#boardBox').evaluate('(el)=>el.classList.contains("expanded")'),size
        assert page.locator('#physicalGuidePosition').inner_text().find('START')>=0
        snap=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"])')
        assert snap['config']['boardMode']=='physical'
        assert snap['specialFields']['5']=='bonus',snap['specialFields']
        page.locator('#turnPanel [data-act="move-3"]').click()
        phase(page,'result')
        assert 'felt 3' in page.locator('#physicalGuidePosition').inner_text()
        if size==(390,844): page.screenshot(path=str(SHOTS/'preview_physical_assistant_iPhone.png'),full_page=True)
        page.locator('#physicalShowBoard').click()
        assert page.locator('#boardBox').evaluate('(el)=>el.classList.contains("expanded")')
        assert page.locator('#boardExit').is_visible()
        assert not page.locator('#saveGame').is_visible()
        # Clickability and hit area in portrait/landscape/full-width.
        hit=page.locator('#boardExit').evaluate('''el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest("button")?.id}''')
        assert hit=='boardExit',(size,'exit occluded',hit)
        page.screenshot(path=str(SHOTS/('preview_physical_expanded_%dx%d.png'%size)))
        page.locator('#boardExit').click()
        assert page.locator('#exitGameDialog').evaluate('el=>el.open')
        if size==(390,844): page.screenshot(path=str(SHOTS/'preview_exit_menu_iPhone.png'))
        assert page.locator('#exitSave').is_enabled()
        page.locator('#exitCancel').click()
        assert not page.locator('#exitGameDialog').evaluate('el=>el.open')
        page.locator('#boardClose').click()
        page.locator('#gameExit').click()
        page.locator('#exitSave').click()
        assert page.locator('#home').is_visible()
        assert page.locator('#resumeCard').is_visible()
        stored=page.evaluate('()=>({...window.__localItems})')
        page.close()
        # Resumed physical mode must remain collapsed and static.
        resumed=browser.new_page(viewport={'width':size[0],'height':size[1]},reduced_motion='reduce')
        bootstrap(resumed,stored)
        resumed.locator('#resumeGame').click()
        assert resumed.locator('#physicalGuide').is_visible()
        assert not resumed.locator('#boardBox').evaluate('(el)=>el.classList.contains("expanded")')
        assert 'felt 3' in resumed.locator('#physicalGuidePosition').inner_text()
        resumed.locator('#gameExit').click()
        resumed.locator('#exitDiscard').click()
        assert resumed.locator('#home').is_visible()
        assert not resumed.locator('#resumeCard').is_visible()
        assert not resumed.evaluate('()=>window.__localItems["aeselklog-igangvaerende-v1"]')
        resumed.close()
        assert not errors,(size,errors)
        print('PASS physical+exit:',size)
    page=browser.new_page(viewport={'width':844,'height':390},reduced_motion='reduce')
    bootstrap(page);begin(page,physical=False)
    assert not page.locator('#physicalGuide').is_visible()
    assert page.locator('#boardBox').evaluate('el=>el.classList.contains("expanded")')
    assert page.evaluate('''()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"]).specialFields!==null''')
    page.locator('#boardExit').click()
    page.locator('#exitSave').click()
    assert page.locator('#resumeCard').is_visible()
    print('PASS digital mode stays expanded; exit menu saves')
    page.close()
    # CPU cannot continue while Exit dialog is open.
    cpu=browser.new_page(viewport={'width':844,'height':390},reduced_motion='reduce')
    bootstrap(cpu);begin(cpu,physical=False,cpu=True)
    cpu.locator('#turnPanel [data-act="move-2"]').click();phase(cpu,'result')
    cpu.locator('#turnPanel [data-act="next"]').click();phase(cpu,'move')
    cpu.locator('#boardExit').click()
    cpu.wait_for_timeout(1200)
    assert cpu.locator('#exitGameDialog').evaluate('el=>el.open')
    assert cpu.locator('#boardPanelDock').get_attribute('data-phase')=='move','CPU played while Exit was open'
    assert cpu.locator('#diceOverlay').get_attribute('hidden') is not None
    cpu.locator('#exitDiscard').click();assert cpu.locator('#home').is_visible()
    cpu.close()
    print('PASS CPU paused while exit options visible')
    # Adult question countdown must not run behind Exit dialog.
    adult=browser.new_page(viewport={'width':844,'height':390},reduced_motion='reduce')
    bootstrap(adult)
    adult.evaluate("AeselShowView('settings')")
    adult.locator('input[name="learning"][value="udfordring"]').check()
    adult.locator('input[name="moveDice"][value="physical"]').check()
    adult.locator('input[name="learnDice"][value="physical"]').check()
    adult.locator('#adultDifficultySetting').select_option('let')
    adult.locator('#gamePace').select_option('normal')
    adult.locator('#settingsDone').click();adult.locator('#homePlay').click()
    adult.locator('.remove-player').last.click()
    adult.locator('.age-select').first.select_option('adult')
    adult.locator('#voiceToggle').click();adult.locator('#startButton').click()
    adult.locator('#turnPanel [data-act="move-2"]').click();phase(adult,'learn')
    adult.locator('#turnPanel [data-act="task-6"]').click();phase(adult,'question')
    adult.wait_for_timeout(650)
    adult.locator('#boardExit').click()
    initial=adult.locator('#clock').inner_text()
    adult.wait_for_timeout(1400)
    assert initial==adult.locator('#clock').inner_text(),'adult timer advanced under dialog'
    adult.locator('#exitCancel').click();adult.wait_for_timeout(1350)
    assert initial!=adult.locator('#clock').inner_text(),'adult timer did not resume'
    adult.close()
    print('PASS adult timer pauses & resumes around exit menu')
    browser.close()
