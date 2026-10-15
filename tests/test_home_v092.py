"""Homepage/settings regression, no external network, no ElevenLabs credits."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
ROOT=Path(__file__).parents[1]
JS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','app.js']

def load(page,previous=None):
    html=(ROOT/'index.html').read_text('utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+ (ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    for filename in ['home-hero-wide.webp','home-hero-mobile.webp','home-mascot.webp','aeselklog-card.webp']:
        data=base64.b64encode((ROOT/filename).read_bytes()).decode()
        html=html.replace('./'+filename,'data:image/webp;base64,'+data)
    page.set_content(html,wait_until='load')
    page.evaluate('''(initial)=>{
      window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),30);
      window.speechSynthesis.cancel=()=>{};
      window.fetch=async ()=>{throw Error('Offline test')};
      const store={...initial};window.__localItems=store;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}});
      window.confirm=()=>true;
    }''',previous or {})
    for script in JS:page.add_script_tag(content=(ROOT/script).read_text('utf-8'))

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
    for w,h,name in [(390,844,'portrait'),(844,390,'landscape'),(1280,800,'desktop')]:
        page=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce',locale='da-DK');errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        load(page)
        assert page.locator('#home').is_visible(),'home missing'
        assert page.locator('#homePlay').is_visible() and page.locator('#homeSettings').is_visible()
        assert not page.locator('#setup').is_visible()
        page.screenshot(path=str(ROOT/f'preview_home_{name}.png'),full_page=True)
        page.locator('#homeSettings').click(); assert page.locator('#settings').is_visible()
        page.locator('#range').select_option('21-40')
        page.locator('input[name=learning][value=leg]').check(force=True)
        page.locator('#gamePace').select_option('ekstra')
        page.locator('#adultDifficultySetting').select_option('let')
        page.screenshot(path=str(ROOT/f'preview_settings_{name}.png'),full_page=True)
        page.locator('#settingsDone').click();assert page.locator('#home').is_visible()
        page.locator('#homePlay').click();assert page.locator('#setup').is_visible()
        assert not page.locator('#range').is_visible(),'options leaked into quick setup'
        assert '21–40' in page.locator('#settingsSummary').inner_text()
        assert page.locator('#cpuCheck').is_visible()
        assert page.locator('#playerInputs .player-input').count()==2
        page.locator('#playerInputs .age-select').first.select_option('adult')
        assert page.locator('#playerInputs select.difficulty').count()==0
        page.screenshot(path=str(ROOT/f'preview_players_{name}.png'),full_page=True)
        page.locator('#cpuCheck').check(force=True)
        # Disable voice so this does not contact a live API.
        page.locator('#voiceToggle').click()
        page.locator('#startButton').click();page.wait_for_timeout(200)
        assert page.locator('#game').is_visible()
        assert page.locator('#boardBox.expanded').count()==1
        page.locator('#saveGame').click(force=True)
        page.wait_for_timeout(50)
        assert page.locator('#home').is_visible(),'Save did not return to home'
        assert page.locator('#resumeCard').is_visible(),'missing resume card'
        stored=page.evaluate('()=>window.__localItems')
        page2=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce',locale='da-DK')
        page2.on('pageerror',lambda e:errors.append(str(e)))
        load(page2,stored)
        assert page2.locator('#home').is_visible() and page2.locator('#resumeCard').is_visible(),'not persisted'
        page2.locator('#resumeGame').click();page2.wait_for_timeout(70)
        assert page2.locator('#game').is_visible()
        page2.locator('#saveGame').click(force=True)
        page2.locator('#homeTopscore').click();assert page2.locator('#topscoreDialog').is_visible()
        page2.locator('#closeTopscore').click(); assert not page2.locator('#topscoreDialog').is_visible()
        assert not errors,f'JS errors in {name}: {errors}'
        print('PASS '+name)
        page2.close();page.close()
    browser.close()
