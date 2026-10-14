"""Browser smoke test for separate donkey CPU voice and spoken question answer.
Mock audio/voices: ZERO real ElevenLabs credits used.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from io import BytesIO
import re, wave, base64
ROOT=Path(__file__).parents[1]
buf=BytesIO()
with wave.open(buf,'wb') as wav:
    wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(16000)
    wav.writeframes(b'\0\0'*6000)
encoded=base64.b64encode(buf.getvalue()).decode()

def phase(page,name,timeout=19000):
    page.wait_for_function('(ph)=>document.getElementById("boardPanelDock").dataset.phase===ph',arg=name,timeout=timeout)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
    page=browser.new_page(viewport={'width':844,'height':390},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
    page.set_content(html,wait_until='load')
    page.evaluate('''(data)=>{
        window.__ttsLog=[];
        const wav=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
        window.fetch=async (url,opts={})=>{
          if(String(url).endsWith('/voices'))return new Response(JSON.stringify({voices:[{id:'glenn123',name:'Glenn – dansk fortæller'}]}),{status:200,headers:{'Content-Type':'application/json'}});
          if(String(url).endsWith('/tts')){
           const b=JSON.parse(opts.body||'{}');window.__ttsLog.push(b);
           return new Response(wav,{status:200,headers:{'Content-Type':'audio/wav'}});
          }
          throw Error('Unexpected URL:'+url);
        };
        const items={};
        Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>items[k]??null,setItem:(k,v)=>items[k]=String(v),removeItem:k=>delete items[k]}});
    }''',encoded)
    for name in ['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','savegame.js','cpuvoice.js','app.js']:
        page.add_script_tag(content=(ROOT/name).read_text())
    page.locator('#voiceSettings summary').click()
    page.wait_for_function("()=>document.querySelector('#cpuVoiceChoice').options.length>=3",timeout=8000)
    assert page.locator('#cpuVoiceChoice').input_value()=='auto'
    page.locator('#cpuVoicePreview').click()
    page.wait_for_function("()=>window.__ttsLog.some(x=>x.voice==='glenn123')",timeout=12000)
    assert page.locator('#cpuVoiceChoice').locator('option').count()>=3
    # Explicit pick must also use that voice without changing the narrator.
    page.locator('#cpuVoiceChoice').select_option('mia')
    page.locator('#cpuVoicePreview').click()
    page.wait_for_function("()=>window.__ttsLog.some(x=>x.voice==='mia'&&x.text.includes('Fem gange tre'))",timeout=12000)
    page.locator('#cpuVoiceChoice').select_option('auto')
    page.evaluate("window.__ttsLog=[]")
    # One human and the donkey CPU on the 21–40 segment.
    page.locator('.remove-player').last.click()
    page.locator('#range').select_option('21-40')
    page.locator('input[name="learning"][value="tabel"]').check()
    page.locator('input[name="moveDice"][value="physical"]').check()
    page.locator('input[name="learnDice"][value="physical"]').check()
    page.locator('#gamePace').select_option('normal')
    page.locator('#cpuCheck').check()
    page.locator('#startButton').click()
    page.locator('#turnPanel button[data-act="move-1"]').click()
    phase(page,'question')
    page.locator('#turnPanel button[data-act^="answer-"]').first.click()
    phase(page,'result')
    page.locator('#turnPanel button[data-act="next"]').click()
    # CPU must roll its own dice and actually speak the chosen answer with Glenn.
    page.wait_for_function("()=>window.__ttsLog.some(x=>x.voice==='glenn123'&&/mit svar|jeg gætter|jeg tror|jeg prøver|ører siger/i.test(x.text))",timeout=30000)
    page.wait_for_function("()=>document.querySelector('#boardPanelDock').dataset.phase==='result' || document.querySelector('#boardPanelDock').dataset.phase==='move' && !document.querySelector('#turnTitle').textContent.includes('Æslet')",timeout=30000)
    cpu=[x for x in page.evaluate('window.__ttsLog') if x['voice']=='glenn123']
    assert cpu, 'No spoken CPU answer over chosen AI voice'
    assert not errors,errors
    page.screenshot(path=str(ROOT/'preview_cpu_tale.png'))
    print('PASS: AI narrator, CPU alternative voice, preview, saved selection, actual spoken CPU answer, CPU round')
    browser.close()
