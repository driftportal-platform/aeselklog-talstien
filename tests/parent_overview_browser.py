"""v0.9.11 real Chromium test (mocked AI/IndexedDB): local parent view + UI flows.
No live ElevenLabs calls and not a physical iPhone-PWA test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re

import os,tempfile
ROOT=Path(__file__).parents[1]
SHOTS=Path(os.environ.get('PREVIEW_DIR') or tempfile.gettempdir())
JS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js',
    'parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','app.js','home-ui.js']

def bootstrap(page):
    html=(ROOT/'index.html').read_text('utf-8').replace('<link rel="stylesheet" href="./styles.css">',
         '<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''()=>{
      const state={};window.__localItems=state;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:k=>state[k]??null,setItem:(k,v)=>state[k]=String(v),removeItem:k=>delete state[k]}});
      window.fetch=async()=>{throw Error('Offline mock')};
      window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),20);
      window.speechSynthesis.cancel=()=>{};
      window.confirm=()=>true;
      Math.random=()=>.8;
    }''')
    for name in JS:page.add_script_tag(content=(ROOT/name).read_text('utf-8'))

def phase(page,value,timeout=23000):
    page.wait_for_function('(p)=>document.querySelector("#boardPanelDock").dataset.phase===p',arg=value,timeout=timeout)

with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                                       args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844},locale='da-DK',reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    bootstrap(page)
    page.evaluate("AeselShowView('settings')")
    page.locator('#openParentReport').click()
    assert page.locator('#parentReportDialog').is_visible()
    assert page.locator('#parentReportContent').inner_text().find('Ingen lokal læringsprofil')>=0
    assert page.locator('#deleteParentProfile').is_disabled()
    page.locator('#closeParentReport').click()

    # A v0.9.10.1 profile must display existing totals without inventing history.
    page.evaluate('''()=>{
      const a=window.AeselAdaptive; const p=a.noteArea(a.freshProgress(),'numbers',true).state;
      window.__localItems['aeselklog-laereprofiler-v1']=JSON.stringify({version:1,profiles:{
        mathilde:{name:'Mathilde',updatedAt:Date.now()-300000,progress:p,seen:[]}
      }});
    }''')
    page.locator('#openParentReport').click()
    assert page.locator('#parentReportSelect').input_value()=='Mathilde'
    assert page.locator('#parentReportContent').get_by_text('Historik kommer').count()==4
    assert '1 af 1 rigtige' in page.locator('#parentReportContent').inner_text()
    page.locator('#closeParentReport').click()

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
        page.locator('#turnPanel [data-act="move-1"]').click()
        phase(page,'learn')
        page.locator('#turnPanel [data-act="task-6"]').click()
        phase(page,'question')
        saved=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-igangvaerende-v1"])')
        assert saved['challenge']['skillArea']=='plus'
        correct=saved['challenge']['options'].index(saved['challenge']['correct'])
        page.locator(f'#turnPanel [data-act="answer-{correct}"]').click()
        phase(page,'result')
        if n<2:page.locator('#turnPanel [data-act="next"]').click()
    profile=page.evaluate('()=>JSON.parse(window.__localItems["aeselklog-laereprofiler-v1"])')
    assert profile['profiles']['karla']['progress']['areas']['plus']['step']==1
    assert len(profile['profiles']['karla']['history'])==3
    assert all(e['area']=='plus' and e['correct'] for e in profile['profiles']['karla']['history'])
    assert '"age"' not in str(profile) and '"question"' not in str(profile)
    page.locator('#boardExit').click();page.locator('#exitSave').click()
    assert page.locator('#resumeCard').is_visible()
    page.evaluate("AeselShowView('settings')")
    page.locator('#openParentReport').click()
    assert page.locator('#parentReportSelect').input_value()=='Karla'
    assert page.locator('.parent-skill').count()==4
    assert '3 af 3 rigtige' in page.locator('#parentReportContent').inner_text()
    assert page.locator('.parent-trend').count()==1
    page.locator('#parentReportDialog').screenshot(path=str(SHOTS/'preview_parent_overview_portrait.png'))
    page.locator('#deleteParentProfile').click()
    assert page.locator('#parentReportSelect').input_value()=='Mathilde'
    assert 'karla' not in page.evaluate('()=>window.__localItems["aeselklog-laereprofiler-v1"]')
    assert 'aeselklog-igangvaerende-v1' in page.evaluate('()=>window.__localItems')
    page.locator('#closeParentReport').click()
    assert '1 lokal læringsprofil' in page.locator('#learningProfileStatus').inner_text()
    page.locator('#clearLearningProfiles').click()
    page.locator('#openParentReport').click()
    assert page.locator('#deleteParentProfile').is_disabled()
    assert page.locator('#parentReportContent').get_by_text('Ingen lokal læringsprofil').count()==1
    assert not errors,errors
    page.close()
    # Larger layout and deep link test: preview with realistic local data
    wide=browser.new_page(viewport={'width':1040,'height':740},locale='da-DK',reduced_motion='reduce')
    bootstrap(wide)
    wide.evaluate('''()=>{
      let p=window.AeselAdaptive.freshProgress();let hist=[];
      for(let i=0;i<9;i++){
        const changed=window.AeselAdaptive.noteArea(p,'numbers',i%3!==0);p=changed.state;
        hist.push({t:Date.now()-(9-i)*86400000,area:'numbers',correct:i%3!==0,helped:false,step:changed.step});
      }
      window.__localItems['aeselklog-laereprofiler-v1']=JSON.stringify({version:1,profiles:{
        liv:{name:'Liv',updatedAt:Date.now(),progress:p,seen:[],history:hist}
      }});
    }''')
    wide.evaluate("AeselShowView('settings')");wide.locator('#openParentReport').click()
    assert wide.locator('.parent-trend').count()==1
    wide.locator('#parentReportDialog').screenshot(path=str(SHOTS/'preview_parent_overview_desktop.png'))
    wide.close();browser.close()
    print('PASS: local parent view, historic migration, actual learning answers, trends, selective deletion, preserved save, phone/desktop layout')
