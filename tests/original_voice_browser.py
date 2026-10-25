"""v0.9.19: approved ÆselKlog original is CPU default in both games, manual choice preserved. No live ElevenLabs calls."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
ORDER=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','music.js','cardgame-engine.js','app.js','home-ui.js','cardgame-ui.js']
html=(ROOT/'index.html').read_text('utf-8').replace('<head>','<head><base href="https://aeselklog.test/">')
html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
ORIGINAL='F6ZuXSkDhi5i4KLiT7Id'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  page.set_content(html,wait_until='load')
  page.evaluate('''original => {
    const items={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>items[k]??null,setItem:(k,v)=>items[k]=String(v),removeItem:k=>delete items[k]}});
    window.__voicesCalled=[];
    window.fetch=async(url,opts={})=>{
      if(String(url).endsWith('/voices'))return new Response(JSON.stringify({voices:[{id:original,name:'ÆselKlog – original'},{id:'mads123',name:'Mads'}]}),{status:200,headers:{'Content-Type':'application/json'}});
      if(String(url).endsWith('/tts')){window.__voicesCalled.push(JSON.parse(opts.body));return new Response('Service temporarily unavailable',{status:502})}
      throw Error('Unexpected request '+url)
    };
    window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),10);window.speechSynthesis.cancel=()=>{};
  }''',ORIGINAL)
  for f in ORDER:page.add_script_tag(content=(ROOT/f).read_text('utf-8'))
  page.evaluate("AeselShowView('settings')");page.locator('#voiceSettings summary').click()
  page.wait_for_function(f"()=>Array.from(document.querySelector('#cpuVoiceChoice').options).some(o=>o.value==='{ORIGINAL}')",timeout=8000)
  assert page.locator('#cpuVoiceChoice').input_value()=='auto'
  assert 'original' in page.locator('#cpuVoiceChoice option[value="auto"]').text_content().lower()
  page.locator('#cpuVoicePreview').click()
  page.wait_for_function('window.__voicesCalled.length>=1',timeout=4000)
  assert page.evaluate('window.__voicesCalled[0].voice')==ORIGINAL,'default CPU must use approved ÆselKlog-original voice ID'
  page.locator('#cpuVoiceChoice').select_option('mads123');page.locator('#cpuVoicePreview').click()
  page.wait_for_function('window.__voicesCalled.length>=2',timeout=4000)
  assert page.evaluate('window.__voicesCalled[1].voice')=='mads123','explicit CPU voice must stay in both games'
  assert not errors,errors
  print('PASS approved original CPU voice default + explicit override via shared voice settings')
 finally:browser.close()
