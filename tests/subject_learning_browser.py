"""v0.9.10: real Chromium DOM smoke test for per-subject levels and nickname profile recall.
AI/network mocked. Does not prove physical iPhone/PWA or call ElevenLabs.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).parents[1]
JS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js',
    'savegame.js','cpuvoice.js','voicecache.js','narration.js','app.js','home-ui.js']

def bootstrap(page,store=None):
    html=(ROOT/'index.html').read_text('utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''initial=>{
      window.__localItems={...initial};
      const store=window.__localItems;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}});
      window.fetch=async()=>{throw Error('Offline mock')};
      window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),20);
      window.speechSynthesis.cancel=()=>{};
      window.confirm=()=>true;
      Math.random=()=>.8;
    }''',store or {})
    for filename in JS:page.add_script_tag(content=(ROOT/filename).read_text('utf-8'))

def phase(page,value,timeout=18000):
    page.wait_for_function('(p)=>document.querySelector("#boardPanelDock").dataset.phase===p',arg=value,timeout=timeout)

with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  bootstrap(page)
  page.locator('#homeSettings').click()
  assert page.locator('#rememberLearning').is_checked()
  page.locator('#voiceToggle').click()
  page.locator('#range').select_option('21-40')
  page.locator('input[name=learning][value=udfordring]').check()
  page.locator('input[name=moveDice][value=physical]').check()
  page.locator('input[name=learnDice][value=physical]').check()
  page.locator('#gamePace').select_option('normal')
  page.locator('#settingsDone').click()
  page.locator('#homePlay').click()
  page.locator('.remove-player').last.click()
  page.locator('#playerInputs input[type=text]').first.fill('Karla')
  page.locator('#startButton').click()
  for n in range(3):
    phase(page,'move')
    page.locator('#turnPanel button[data-act="move-1"]').click()
    phase(page,'learn')
    page.locator('#turnPanel button[data-act="task-6"]').click()
    phase(page,'question')
    state=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"])')
    assert state['challenge']['skillArea']=='plus',state['challenge']
    assert 'Plus:' in page.locator('.adapt-level').inner_text()
    answer=state['challenge']['options'].index(state['challenge']['correct'])
    page.locator(f'#turnPanel [data-act="answer-{answer}"]').click()
    phase(page,'result')
    if n<2:page.locator('#turnPanel [data-act="next"]').click()
  current=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"])')
  assert current['players'][0]['learning']['areas']['plus']['step']==1
  assert current['players'][0]['learning']['areas']['minus']['step']==0
  profile=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-laereprofiler-v1"])')
  assert profile['profiles']['karla']['progress']['areas']['plus']['step']==1
  assert 'age' not in str(profile)
  page.locator('#saveGame').click(force=True)
  assert page.locator('#resumeCard').is_visible()
  # New game with same nickname picks up progress, not old turn/position.
  page.locator('#homePlay').click()
  page.locator('#startButton').click()
  second=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"])')
  assert second['players'][0]['pos']==20
  assert second['players'][0]['learning']['areas']['plus']['step']==1
  assert second['players'][0]['learning']['areas']['minus']['step']==0
  # Offline / manual wipe from the settings menu.
  page.locator('#saveGame').click(force=True)
  page.locator('#homeSettings').click()
  page.locator('#clearLearningProfiles').click()
  assert page.evaluate('window.__localItems["aeselklog-laereprofiler-v1"]') is None
  page.locator('#rememberLearning').uncheck()
  page.locator('#settingsDone').click()
  page.locator('#homePlay').click()
  page.locator('#startButton').click()
  third=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"])')
  assert third['players'][0]['learning']['areas']['plus']['step']==0
  assert third['config']['rememberLearning']==False
  assert not errors,errors
  print('PASS: independent plus progress, local nickname recall, settings toggle, clear profiles, no JS errors')
  browser.close()
