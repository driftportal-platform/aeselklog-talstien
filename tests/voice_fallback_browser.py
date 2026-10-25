"""v0.9.7: AI-fejl/timeout og offline giver telefonstemme uden at ændre valg.
Kun Chromium med mockede responses; ingen eksterne ElevenLabs-kald.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re

ROOT=Path(__file__).parents[1]
JS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','app.js','home-ui.js']

def load(page, offline=False):
    html=(ROOT/'index.html').read_text('utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''offline=>{
        const state={};
        Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:key=>state[key]??null,
            setItem:(key,val)=>{state[key]=String(val)},
            removeItem:key=>{delete state[key]}
        }});
        window.__calls={remote:0,local:0};
        window.speechSynthesis.cancel=()=>{};
        window.speechSynthesis.speak=utterance=>{
            window.__calls.local++;
            setTimeout(()=>utterance.onend?.(),15);
        };
        Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>!offline});
        window.fetch=async (url,options)=>{
            if(String(url).endsWith('/voices'))return new Response(JSON.stringify({voices:[]}), {status:200,headers:{'content-type':'application/json'}});
            if(String(url).endsWith('/tts')){
                window.__calls.remote++;
                throw new DOMException('Simuleret timeout','AbortError');
            }
            throw Error('Ukendt anmodning');
        };
        window.confirm=()=>true;
    }''', offline)
    for name in JS:
        page.add_script_tag(content=(ROOT/name).read_text('utf-8'))

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for offline in [False,True]:
        page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        load(page,offline)
        page.evaluate("AeselShowView('settings')")
        assert page.locator('#voiceMode').input_value()=='ai'
        page.locator('#voiceSettings summary').click()
        page.locator('#cpuVoicePreview').click()
        page.wait_for_function('()=>window.__calls.local===1',timeout=3000)
        calls=page.evaluate('()=>({...window.__calls})')
        assert calls['remote']==(0 if offline else 1), (offline,calls)
        assert 'telefonens stemme' in page.locator('#aiVoiceStatus').inner_text().lower()
        page.locator('#cpuVoicePreview').click()
        page.wait_for_function('()=>window.__calls.local>=2',timeout=3000)
        assert page.evaluate('window.__calls.remote')==(0 if offline else 1),'Cooldown/Offline triggered repeated AI request'
        assert page.locator('#voiceMode').input_value()=='ai','Fallback silently changed persisted AI preference'
        assert not errors,(offline,errors)
        print('PASS AI fallback to device voice, offline='+str(offline))
        page.close()
    browser.close()
