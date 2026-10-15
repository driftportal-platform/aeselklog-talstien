"""v0.9.10.1: browser test af speak() med Hov hov-variation, Gentag og TTS.
Bruger kun simuleret telefonstemme. Ingen AI-credits forbruges.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
JS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js',
    'savegame.js','cpuvoice.js','voicecache.js','narration.js','app.js','home-ui.js']
html=(ROOT/'index.html').read_text('utf-8')
html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
    for random_value, expected_intro in ((0.8,False),(0.1,True)):
        page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='load')
        page.evaluate('''(v)=>{
          const store={'aeselklog-voice-v03':JSON.stringify({mode:'device'})};
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
           getItem:k=>store[k]??null,setItem:(k,val)=>store[k]=String(val),removeItem:k=>delete store[k]
          }});
          Math.random=()=>v;
          window.__spoken=[];
          speechSynthesis.speak=u=>{window.__spoken.push(u.text);setTimeout(()=>u.onend?.(),35)};
          speechSynthesis.cancel=()=>{};
          window.fetch=async()=>{throw new Error('Ingen AI-kald i denne test')};
        }''',random_value)
        for filename in JS:page.add_script_tag(content=(ROOT/filename).read_text('utf-8'))
        page.locator('#homePlay').click()
        page.locator('#startButton').click()
        page.wait_for_function('()=>window.__spoken.length>=1',timeout=12000)
        first=page.evaluate('window.__spoken[0]')
        assert first.startswith('Hov, hov!') is expected_intro,first
        assert 'Velkommen til Talstien' in first
        # Gentag må bruge samme konkrete sætning, IKKE trække en ny tilfældig indledning.
        page.locator('#boardRepeat').click()
        page.wait_for_function('()=>window.__spoken.length>=2',timeout=12000)
        repeated=page.evaluate('window.__spoken[1]')
        assert first==repeated,(first,repeated)
        assert not errors,errors
        page.close()
    print('PASS: talens Hov hov-hilsen 35%, browser afspiller begge varianter, Gentag uændret')
    browser.close()
