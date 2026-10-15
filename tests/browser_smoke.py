"""Browser-based regression on the actual HTML/JS loaded inline (no external network or ElevenLabs calls)."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import re, time
ROOT=Path(__file__).parents[1]


def load(page):
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+ (ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
    # App scripts run as injected text, keeping tests entirely offline and avoiding any API credits.
    html=re.sub(r'<script\s+src="[^\"]+"\s+defer></script>','',html)
    page.set_content(html, wait_until='load')
    page.evaluate('''() => {
      window.speechSynthesis.speak = function(u){setTimeout(()=>{if(u.onend)u.onend();},40)};
      window.speechSynthesis.cancel = function(){};
      window.fetch = async () => {throw Error('Offline browser test — no network')};
      const data={};window.__localItems=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
    }''')
    for name in ['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','app.js']:
        page.add_script_tag(content=(ROOT/name).read_text(encoding='utf-8'))


def config_game(page, learning='udfordring', cpu=False, range_name='21-40', adult=False):
    page.locator('#homeSettings').click()
    page.locator('#range').select_option(range_name)
    page.locator(f'input[name="learning"][value="{learning}"]').check()
    page.locator('input[name="moveDice"][value="physical"]').check()
    page.locator('input[name="learnDice"][value="physical"]').check()
    page.locator('#gamePace').select_option('normal')
    page.locator('#settingsDone').click()
    page.locator('#homePlay').click()
    if cpu:
        page.locator('.remove-player').last.click()
        page.locator('#cpuCheck').check()
    if adult: page.locator('.age-select').first.select_option('adult')
    page.locator('#voiceToggle').click()
    page.locator('#startButton').click()


def wait_phase(page, phase, timeout=10000):
    page.wait_for_function('(phase) => document.getElementById("boardPanelDock").dataset.phase === phase', arg=phase, timeout=timeout)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for config in [{'width':844,'height':390},{'width':390,'height':844},{'width':1280,'height':800}]:
        page=browser.new_page(viewport=config,reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        load(page)
        assert page.locator('#homePlay').is_visible()
        config_game(page)
        assert page.locator('#boardBox').evaluate('(el)=>el.classList.contains("expanded")')
        assert page.locator('#boardSvg').is_visible()
        assert page.locator('#boardPlayers').count()==1
        # First physical roll, then physical learning die, then answer.
        page.locator('#turnPanel [data-act="move-3"]').click()
        wait_phase(page,'learn')
        page.locator('#turnPanel [data-act="task-6"]').click()
        wait_phase(page,'question')
        assert page.locator('#turnPanel button[data-act^="answer-"]').count()>=2
        page.locator('#turnPanel button[data-act^="answer-"]').first.click()
        wait_phase(page,'result')
        assert 'Næste spiller' in page.locator('#turnPanel').inner_text()
        assert not errors, (config,errors)
        name=f'{config["width"]}x{config["height"]}'
        page.screenshot(path=str(ROOT/f'preview_{name}.png'))
        page.close()
        print('OK child round:',name)

    page=browser.new_page(viewport={'width':844,'height':390},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load(page)
    config_game(page,learning='leg',cpu=True,range_name='1-20')
    page.locator('#turnPanel [data-act="move-1"]').click()
    wait_phase(page,'result')
    # Backgrounded phone should not let CPU race through its turn.
    page.evaluate('''() => {window.__fakeHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__fakeHidden});document.dispatchEvent(new Event('visibilitychange'));}''')
    page.locator('#turnPanel [data-act="next"]').click()
    page.wait_for_timeout(1150)
    assert page.locator('#diceOverlay').get_attribute('hidden') is not None, 'CPU rolled while app hidden'
    assert page.locator('#boardPanelDock').get_attribute('data-phase')=='move', 'CPU moved while hidden'
    page.evaluate('''() => {window.__fakeHidden=false;document.dispatchEvent(new Event('visibilitychange'));}''')
    # CPU may roll extra carrots etc.; wait until its result or human's next turn.
    page.wait_for_function('() => document.querySelector("#turnTitle").textContent.includes("Æsel")',timeout=7000)
    page.wait_for_function('() => {const t=document.querySelector("#boardPanelDock").dataset.phase;return t === "result" || t === "move" && !document.querySelector("#turnTitle").textContent.includes("Æsel")}',timeout=15000)
    assert not errors,errors
    page.screenshot(path=str(ROOT/'preview_cpu.png'))
    print('OK CPU dice round')
    page.close()

    page=browser.new_page(viewport={'width':844,'height':390},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load(page)
    config_game(page,adult=True)
    page.locator('#turnPanel [data-act="move-3"]').click()
    wait_phase(page,'learn')
    page.locator('#turnPanel [data-act="task-6"]').click()
    wait_phase(page,'question')
    page.wait_for_function('() => !!document.querySelector("#clock") && document.querySelector("#clock").textContent.trim().length>0',timeout=3000)
    assert 'sek' in page.locator('#clock').inner_text()
    # Simulate iPhone lock/other tab: adult time must not run down in background.
    page.evaluate('''() => {window.__fakeHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__fakeHidden});document.dispatchEvent(new Event('visibilitychange'));}''')
    paused_at=page.locator('#clock').inner_text()
    page.wait_for_timeout(1150)
    assert page.locator('#clock').inner_text()==paused_at,('Timer advanced while hidden',paused_at,page.locator('#clock').inner_text())
    page.evaluate('''() => {window.__fakeHidden=false;document.dispatchEvent(new Event('visibilitychange'));}''')
    page.wait_for_timeout(1150)
    assert page.locator('#clock').inner_text()!=paused_at,('Timer did not resume',paused_at,page.locator('#clock').inner_text())
    assert not errors,errors
    print('OK adult question timer')
    page.close()

    # Score test: one winning game is recorded after reaching a target field.
    page=browser.new_page(viewport={'width':844,'height':390},reduced_motion='no-preference')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load(page)
    config_game(page,learning='leg',range_name='21-40')
    # Exiting expanded view allows board position edit for test.
    page.locator('#boardClose').click()
    page.evaluate('window.prompt = () => "39";')
    page.locator('#editPos').click()
    page.locator('#boardExpand').click()
    page.locator('#turnPanel [data-act="move-1"]').click()
    wait_phase(page,'win')
    rec=page.evaluate('window.__localItems["aeselklog-topscore-v1"]')
    assert rec and 'Spiller 1' in rec,rec
    assert page.locator('#turnPanel [data-act=topscore]').count()==1
    assert page.locator('#victoryFanfare').count()==1, 'Winner celebration missing'
    page.screenshot(path=str(ROOT/'preview_win.png'))
    page.locator('#turnPanel [data-act=topscore]').click()
    assert page.locator('#topscoreDialog').get_attribute('open') is not None, 'Topscore dialog not open'
    assert 'Spiller 1' in page.locator('#topscoreContent').inner_text()
    assert not errors,errors
    print('OK finish and local topscore')
    page.close()
    browser.close()
