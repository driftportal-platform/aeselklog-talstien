"""No-network Chromium smoke test for save/resume across new browser documents."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).parents[1]


def bootstrap(page,store=None):
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+ (ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''(initial) => {
      window.speechSynthesis.speak = u => setTimeout(()=>u.onend?.(),30);
      window.speechSynthesis.cancel = ()=>{};
      window.fetch=async ()=>{throw Error('Network disabled in browser test')};
      const store={...initial};window.__localItems=store;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
         getItem:key=>store[key]??null,setItem:(key,val)=>{store[key]=String(val)},removeItem:key=>{delete store[key]}
      }});
      window.confirm=()=>true;
    }''',store or {})
    for name in ['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','app.js']:
        page.add_script_tag(content=(ROOT/name).read_text(encoding='utf-8'))


def phase(page,phase,timeout=12000):
    page.wait_for_function('(p)=>document.querySelector("#boardPanelDock").dataset.phase===p',arg=phase,timeout=timeout)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=browser.new_context(viewport={'width':844,'height':390},reduced_motion='reduce')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)+' STACK '+str(e.stack)))
    bootstrap(page)
    page.locator('#homeSettings').click()
    page.locator('#voiceToggle').click()
    page.locator('#range').select_option('21-40')
    page.locator('input[name="learning"][value="leg"]').check()
    page.locator('input[name="moveDice"][value="physical"]').check()
    page.locator('input[name="learnDice"][value="physical"]').check()
    page.locator('#gamePace').select_option('normal')
    page.locator('#settingsDone').click()
    page.locator('#homePlay').click()
    page.locator('#startButton').click()
    page.locator('#turnPanel [data-act="move-1"]').click()
    phase(page,'result')
    key='aeselklog-igangvaerende-v1'
    out=page.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    assert out['phase']=='result' and out['players'][0]['pos']==21,out
    page.locator('#boardExit').click();page.locator('#exitSave').click()
    assert page.locator('#resumeCard').is_visible(),'Resume card not shown after leaving'
    page.screenshot(path=str(ROOT/'preview_resume_setup.png'))
    current=page.evaluate('()=>window.__localItems');page.close()

    page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)+' STACK '+str(e.stack)));bootstrap(page,current)
    assert page.locator('#resumeCard').is_visible(),'Resume card missing on fresh document'
    page.locator('#resumeGame').click();phase(page,'result')
    out=page.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    assert [x['pos'] for x in out['players']]==[21,20]
    page.screenshot(path=str(ROOT/'preview_resumed_board.png'))
    page.locator('#turnPanel [data-act="next"]').click();phase(page,'move')
    assert page.locator('#turnTitle').inner_text().startswith('Spiller 2')
    current=page.evaluate('()=>window.__localItems');page.close()

    page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)+' STACK '+str(e.stack)));bootstrap(page,current)
    assert page.locator('#resumeCard').is_visible(),'Auto save missing'
    page.locator('#resumeGame').click();phase(page,'move')
    assert page.locator('#turnTitle').inner_text().startswith('Spiller 2')
    page.locator('#boardClose').click();page.locator('#newGame').click();assert page.locator('#resumeCard').is_hidden()
    page.locator('#homeSettings').click()
    page.locator('input[name="learning"][value="udfordring"]').check()
    page.locator('input[name="moveDice"][value="physical"]').check()
    page.locator('input[name="learnDice"][value="physical"]').check()
    page.locator('#settingsDone').click()
    page.locator('#homePlay').click()
    page.locator('#startButton').click()
    page.locator('#turnPanel [data-act="move-3"]').click();phase(page,'learn')
    page.locator('#turnPanel [data-act="task-6"]').click();phase(page,'question')
    original=page.locator('.prompt h3').inner_text()
    data=page.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    assert data['phase']=='question' and data['challenge']['question']==original
    current=page.evaluate('()=>window.__localItems');page.close()

    page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)+' STACK '+str(e.stack)));bootstrap(page,current)
    page.locator('#resumeGame').click();phase(page,'question')
    assert page.locator('.prompt h3').inner_text()==original
    data=page.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    i=data['challenge']['options'].index(data['challenge']['correct'])
    page.locator(f'#turnPanel [data-act="answer-{i}"]').click();phase(page,'result')
    data=page.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    assert data['players'][0]['learning']['attempted']==1,data
    assert data['players'][0]['stats']['correct']==1,data
    assert not errors,errors
    page.screenshot(path=str(ROOT/'preview_adaptive_game.png'))
    # Real UI: three correct answers should increase this child's skill by one.
    adaptive=ctx.new_page();adaptive.on('pageerror',lambda e:errors.append(str(e)))
    bootstrap(adaptive);adaptive.locator('#homeSettings').click();adaptive.locator('#voiceToggle').click()
    adaptive.locator('#range').select_option('21-40')
    adaptive.locator('input[name="learning"][value="udfordring"]').check()
    adaptive.locator('input[name="moveDice"][value="physical"]').check()
    adaptive.locator('input[name="learnDice"][value="physical"]').check()
    adaptive.locator('#gamePace').select_option('normal')
    adaptive.locator('#settingsDone').click();adaptive.locator('#homePlay').click()
    adaptive.locator('.remove-player').last.click()
    adaptive.locator('#startButton').click()
    for k in range(3):
       phase(adaptive,'move')
       adaptive.locator('#turnPanel [data-act="move-1"]').click();phase(adaptive,'learn')
       adaptive.locator('#turnPanel [data-act="task-6"]').click();phase(adaptive,'question')
       snap=adaptive.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
       idx=snap['challenge']['options'].index(snap['challenge']['correct'])
       adaptive.locator(f'#turnPanel [data-act="answer-{idx}"]').click();phase(adaptive,'result')
       if k<2:adaptive.locator('#turnPanel [data-act="next"]').click()
    saved=adaptive.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    assert saved['players'][0]['learning']['step']==1, saved['players'][0]['learning']
    assert not errors,errors
    adaptive.close()
    # Adult: save remaining time on an active question, resume without time lost while closed.
    adult=ctx.new_page();adult.on('pageerror',lambda e:errors.append(str(e)))
    bootstrap(adult);adult.locator('#homeSettings').click();adult.locator('#voiceToggle').click()
    adult.locator('#range').select_option('21-40')
    adult.locator('#adultDifficultySetting').select_option('let')
    adult.locator('input[name="learning"][value="udfordring"]').check()
    adult.locator('input[name="moveDice"][value="physical"]').check()
    adult.locator('input[name="learnDice"][value="physical"]').check()
    adult.locator('#gamePace').select_option('normal')
    adult.locator('#settingsDone').click();adult.locator('#homePlay').click()
    adult.locator('.age-select').first.select_option('adult')
    adult.locator('#startButton').click()
    adult.locator('#turnPanel [data-act="move-2"]').click();phase(adult,'learn')
    adult.locator('#turnPanel [data-act="task-6"]').click();phase(adult,'question')
    adult.wait_for_timeout(1400)
    adult.locator('#boardExit').click();adult.locator('#exitSave').click()
    saved=adult.evaluate('(key)=>JSON.parse(window.__localItems[key])',key)
    assert saved['phase']=='question' and 54000<=saved['timeLeftMs']<60000,saved
    current=adult.evaluate('()=>window.__localItems');adult.close()
    adult=ctx.new_page();adult.on('pageerror',lambda e:errors.append(str(e)));bootstrap(adult,current)
    adult.locator('#resumeGame').click()
    adult.evaluate('document.getElementById("voiceToggle").click()');phase(adult,'question')
    adult.wait_for_function('()=>document.querySelector("#clock")?.textContent.includes("sek.")')
    clock=int(adult.locator('#clock').inner_text().split(' ')[0])
    assert clock<=60 and clock>=53,clock
    adult.close()
    print('PASS: safe save, fresh-document resume, turn/position, question restoration, learning state, no JS errors')
    page.close();ctx.close();browser.close()
