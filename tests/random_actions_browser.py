"""v0.9.13 Chromium-integration: RNG layout, save/continue, legacy and responsive UI.
Uses inline JS/CSS and a fake localStorage/voice. No ElevenLabs calls or real PWA installation.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json
ROOT=Path(__file__).parents[1]
SCRIPTS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js',
         'profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js',
         'narration.js','actionfx.js','app.js','home-ui.js']

def setup(page,store=None):
    html=(ROOT/'index.html').read_text('utf-8').replace('<link rel="stylesheet" href="./styles.css">',
         '<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''(items)=>{
      const data=items;window.__localItems=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>delete data[k]
      }});
      window.fetch=async()=>{throw Error('mock offline')};
      window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),15);
      window.speechSynthesis.cancel=()=>{};
      window.confirm=()=>true;
    }''', store or {})
    for f in SCRIPTS:page.add_script_tag(content=(ROOT/f).read_text('utf-8'))

def snapshot(page):
    return page.evaluate('''()=>JSON.parse(window.__localItems['aeselklog-igangvaerende-v1'])''')

def begin(page):
    page.evaluate("AeselShowView('settings')")
    page.locator('#range').select_option('1-100')
    page.locator('input[name="learning"][value="leg"]').check()
    page.locator('input[name="moveDice"][value="physical"]').check()
    page.locator('#gamePace').select_option('normal')
    page.locator('#settingsDone').click()
    page.locator('#homePlay').click()
    page.locator('#voiceToggle').click() # silence during gameplay
    page.locator('#startButton').click()
    page.wait_for_function('()=>document.querySelector("#boardPanelDock").dataset.phase==="move"')

def run(browser,w,h):
    page=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    setup(page);begin(page)
    initial=snapshot(page)
    layout=initial['specialFields']
    assert layout and len(layout)>15, 'random layout missing from snapshot'
    assert page.evaluate('''(layout)=>window.AeselActions.validateLayout(layout)''',layout), 'Randomized layout is invalid'
    assert page.locator('.legend-rose').count()==5,'Every range needs a rose'
    colors=page.locator('.legend-rose').evaluate_all('nodes=>nodes.map(node=>getComputedStyle(node).color)')
    assert len(set(colors))==5,('Rose colors are not unique',colors)
    assert page.locator('.dice-mascot img').evaluate('el=>getComputedStyle(el).clipPath')=='none','Dice mascot still cropped'
    visible_actions=page.locator('#boardTiles .board-action-symbol').count()
    assert visible_actions==len(layout),(visible_actions,len(layout))
    # Every SVG symbol must correspond to the saved map, not old static fields.
    for key,type_ in list(layout.items())[:7]:
        name=page.locator(f'#tile-{key}').get_attribute('aria-label')
        assert name and ', ' in name, (key,type_,name)
    # The enlarged/normal board sound button must be inside the viewport.
    page.wait_for_timeout(80)
    btn=page.locator('#boardBray').bounding_box()
    assert btn and btn['x']>=0 and btn['x']+btn['width']<=w+1 and btn['y']>=0 and btn['y']+btn['height']<=h+1,btn
    # Bonus effect still functions when randomized: move current piece right before bonus, roll one.
    bonus=min(int(n) for n,t in layout.items() if t=='bonus')
    page.locator('#boardClose').click()
    page.evaluate(f'window.prompt=()=>"{bonus-1}"')
    page.locator('#editPos').click()
    page.locator('#boardExpand').click()
    page.locator('#turnPanel [data-act="move-1"]').click()
    page.wait_for_function('()=>document.querySelector("#actionToast").dataset.action==="bonus" && document.querySelector("#actionToast").classList.contains("show")',timeout=15000)
    page.wait_for_function('()=>document.querySelector("#boardPanelDock").dataset.phase === "result"',timeout=15000)
    after=snapshot(page)
    assert after['players'][0]['pos']==bonus+2,('Bonus +2 not applied',bonus,after['players'][0]['pos'])
    assert after['specialFields']==layout, 'Game changed randomized fields after action'
    page.locator('#boardClose').click()
    page.locator('#saveGame').click()
    persisted=page.evaluate('()=>window.__localItems')
    assert page.locator('#resumeCard').is_visible()
    page.close()
    # New document simulates closing app then resuming.
    resumed=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
    resumed.on('pageerror',lambda e:errors.append(str(e)))
    setup(resumed,persisted)
    assert resumed.locator('#resumeCard').is_visible()
    resumed.locator('#resumeGame').click()
    resumed.wait_for_function('()=>document.querySelector("#boardSvg") && document.querySelector("#game").classList.contains("active")')
    assert snapshot(resumed)['specialFields']==layout
    assert resumed.locator('#boardTiles .board-action-symbol').count()==len(layout)
    assert resumed.locator('#tile-'+str(bonus)).get_attribute('aria-label').endswith('Bonus')
    # An old v0.9.12 save with no specialFields must preserve the historical fixed board.
    legacy=snapshot(resumed)
    del legacy['specialFields']
    store={'aeselklog-igangvaerende-v1':json.dumps(legacy,ensure_ascii=False)}
    resumed.close()
    old=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
    old.on('pageerror',lambda e:errors.append(str(e)))
    setup(old,store)
    old.locator('#resumeGame').click()
    old.wait_for_function('()=>document.querySelector("#boardSvg")')
    assert old.locator('#tile-5').get_attribute('aria-label')=='Felt 5, Bonus'
    assert old.locator('#tile-7').get_attribute('aria-label')=='Felt 7, Gulerod'
    old.close()
    assert not errors,errors
    print('PASS random actions browser',w,h,'count',len(layout),'bonus',bonus,'and old save')

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(390,844),(844,390),(1280,800)]:run(browser,w,h)
    browser.close()
