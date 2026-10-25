"""v0.9.8 mock browser test: voice-specific IndexedDB cache, offline hits and clearing.
Does not call ElevenLabs. Mock IDB persists across new app instance in the same page.
Full native IndexedDB across an actual PWA restart still requires physical browser testing.
"""
import re, base64, wave
from pathlib import Path
from io import BytesIO
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
JS=['engine.js','board.js','actions.js','leaderboard.js','adaptive.js','profiles.js','parentreport.js','savegame.js','cpuvoice.js','voicecache.js','narration.js','actionfx.js','app.js','home-ui.js']
buf=BytesIO()
with wave.open(buf,'wb') as wav:
    wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(16000);wav.writeframes(b'\0\0'*7000)
WAV=base64.b64encode(buf.getvalue()).decode('ascii')
html=(ROOT/'index.html').read_text('utf-8')
html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(ROOT/'styles.css').read_text('utf-8')+'</style>')
html=re.sub(r'<script\s+src="[^"]+"\s+defer></script>','',html)
MOCK = r'''wavBase64=>{
 const data=new Map(); let initialized=false;
 function fakeTransaction(){
   let pending=0,scheduled=false;
   const tx={oncomplete:null,onerror:null,onabort:null};
   const later=()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;if(pending===0)tx.oncomplete?.()},0)};
   function request(fn){
     const r={result:null,onsuccess:null,onerror:null};pending++;
     queueMicrotask(()=>{try{r.result=fn();r.onsuccess?.()}catch(e){r.error=e;r.onerror?.();tx.onerror?.()}finally{pending--;if(pending===0)later()}});
     return r;
   }
   tx.objectStore=()=>({
     get:key=>request(()=>data.get(key)),
     getAll:()=>request(()=>[...data.values()]),
     put:value=>request(()=>{data.set(value.key,value);return value.key}),
     delete:key=>request(()=>data.delete(key)),
     clear:()=>request(()=>data.clear())
   });
   return tx;
 }
 const fakeDb={
   objectStoreNames:{contains:()=>initialized},
   createObjectStore:()=>{initialized=true},
   transaction:()=>fakeTransaction(), close:()=>{}
 };
 Object.defineProperty(window,'indexedDB',{configurable:true,value:{open:()=>{
   const req={result:fakeDb,onsuccess:null,onerror:null,onupgradeneeded:null};
   queueMicrotask(()=>{if(!initialized)req.onupgradeneeded?.();req.onsuccess?.()});
   return req;
 }}});
 window.__idbStore=data;
 const local={};
 Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>local[k]??null,setItem:(k,v)=>local[k]=String(v),removeItem:k=>delete local[k]}});
 window.__calls=[];window.__localSpeechCount=0;
 Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>window.__online!==false});
 window.__online=true;
 window.speechSynthesis.speak=u=>{window.__localSpeechCount++;setTimeout(()=>u.onend?.(),20)};
 window.speechSynthesis.cancel=()=>{};
 const wav=Uint8Array.from(atob(wavBase64),s=>s.charCodeAt(0));
 window.fetch=async (url,params={})=>{
   if(String(url).endsWith('/voices'))return new Response(JSON.stringify({voices:[{id:'mads123',name:'Mads'},{id:'cpu123',name:'ÆselKlog'}]}),{status:200,headers:{'Content-Type':'application/json'}});
   if(String(url).endsWith('/tts')){
     if(!window.__online)throw Error('No network');
     const v=JSON.parse(params.body||'{}');window.__calls.push(v);
     return new Response(wav,{status:200,headers:{'Content-Type':'audio/wav'}});
   }
   throw Error('Unexpected '+url);
 };
 window.confirm=()=>true;
}'''

def inject(page):
    page.set_content(html,wait_until='load')
    for name in JS:page.add_script_tag(content=(ROOT/name).read_text('utf-8'))
    page.evaluate("AeselShowView('settings')")
    page.locator('#voiceSettings summary').click()
    page.wait_for_function("()=>document.querySelector('#aiVoiceChoice').options.length>=3",timeout=6000)

def count(page):return page.evaluate('window.__calls.length')

with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
  page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content('<div>initial state</div>');page.evaluate(MOCK,WAV)
  inject(page)
  page.locator('#aiVoiceChoice').select_option('mia')
  page.locator('#cpuVoiceChoice').select_option('mia')
  page.locator('#cpuVoicePreview').click(force=True)
  page.wait_for_function('()=>window.__idbStore.size===1',timeout=7000)
  assert count(page)==1,'First Mia clip must call worker once'
  page.locator('#cpuVoicePreview').click(force=True)
  page.wait_for_timeout(350)
  assert count(page)==1,'Repeat same clip and voice must reuse audio'
  page.locator('#aiVoiceChoice').select_option('mads123')
  page.locator('#cpuVoiceChoice').select_option('mads123')
  page.locator('#cpuVoicePreview').click(force=True)
  page.wait_for_function('()=>window.__idbStore.size===2',timeout=7000)
  assert count(page)==2,'Mads must not reuse Mia voice clip'
  page.locator('#cpuVoiceChoice').select_option('cpu123')
  page.locator('#cpuVoicePreview').click(force=True)
  page.wait_for_function('()=>window.__idbStore.size===3',timeout=7000)
  assert count(page)==3 and page.evaluate('window.__calls[2].voice')=='cpu123', 'CPU uses its own ID'
  assert page.evaluate("window.AeselVoiceCache.isSafePhrase('Hej Amalie, du slog 4')") is False
  before=page.evaluate('window.__idbStore.size')
  assert page.evaluate('''async ()=>window.AeselVoiceCache.put({endpoint:'https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev/tts',voiceId:'mia',text:'Hej Amalie, du slog 4'},new ArrayBuffer(1200))''') is False
  assert page.evaluate('window.__idbStore.size')==before
  # Simulate restarting the app: fresh app.js memory, same IndexedDB contents.
  page.evaluate('window.__online=false')
  inject(page)
  page.locator('#aiVoiceChoice').select_option('mads123')
  page.locator('#cpuVoiceChoice').select_option('mads123')
  page.locator('#cpuVoicePreview').click(force=True)
  page.wait_for_function('()=>document.querySelector("#aiVoiceStatus").textContent.includes("Gemte AI-lyde")',timeout=7000)
  assert count(page)==3,'Offline repeat must use stored AI audio, not worker'
  assert page.evaluate('window.__localSpeechCount')==0,'Offline cached audio must not downgrade to device voice'
  page.locator('#clearAudioCache').click(force=True)
  page.wait_for_function('()=>window.__idbStore.size===0',timeout=5000)
  page.locator('#cpuVoicePreview').click(force=True)
  page.wait_for_function('()=>window.__localSpeechCount===1',timeout=5000)
  assert count(page)==3,'Offline after clearing must not make network request'
  # Quota/LRU-like FIFO eviction: keep total stored audio at most 15 MB.
  quota=page.evaluate('''async()=>{
    const clip='Hov, hov! I byttede pladser.';
    const bytes=new ArrayBuffer(400000);
    const endpoint='https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev/tts';
    for(let i=0;i<55;i++)await window.AeselVoiceCache.put({endpoint,voiceId:'v'+i,text:clip},bytes);
    return await window.AeselVoiceCache.stats();
  }''')
  assert quota['count']<=70 and quota['bytes']<=15*1024*1024,quota
  assert quota['count']<55,'Oldest clips should be evicted at 15 MB limit'
  page.locator('#clearAudioCache').click(force=True)
  page.wait_for_function('()=>window.__idbStore.size===0',timeout=5000)
  assert not errors,errors
  print('PASS: per-voice Mia/Mads/CPU; same-voice cache hits; restart simulation; offline AI replay; no personal storage; clear and fallback')
  browser.close()
