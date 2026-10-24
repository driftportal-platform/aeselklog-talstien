"""v0.9.7 end-to-end offline PWA smoke test over a local HTTP server.
Mock/no ElevenLabs API consumption; Chromium tests not a substitute for real iOS Safari.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
thread=Thread(target=server.serve_forever,daemon=True);thread.start()
url=f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        context=browser.new_context(viewport={'width':390,'height':844},service_workers='allow')
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.route('**/aeselklog-mia-stemme-test.driftportal-platform.workers.dev/**',lambda route: route.abort())
        page.goto(url,wait_until='load')
        page.wait_for_function('()=>navigator.serviceWorker.controller !== null',timeout=25000)
        assert page.locator('#homePlay').is_visible()
        assert page.locator('.home-art').evaluate('e=>e.naturalWidth')==417
        assert page.evaluate("()=>getComputedStyle(document.body).getPropertyValue('--navy').trim()")=='#113c70', 'CSS not loaded'
        context.set_offline(True)
        page.reload(wait_until='load',timeout=15000)
        assert page.locator('#homePlay').is_visible(), 'homepage failed offline'
        assert page.locator('.home-art').evaluate('e=>e.naturalWidth')==417, 'home image failed offline'
        assert page.evaluate("()=>getComputedStyle(document.body).getPropertyValue('--navy').trim()")=='#113c70', 'CSS failed offline'
        page.wait_for_function('()=>Boolean(window.AeselIcons)')
        loaded=page.evaluate('''async()=>{const files=AeselIcons.names.map(n=>AeselIcons.url(n));files.push(new URL('./assets/images/donkey-card.webp',location.href).href);await Promise.all(files.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>reject(Error(src));i.src=src})));return files.length}''')
        assert loaded==48, 'Shared icons/card art failed offline'
        page.goto(url+'?spil=regneklog',wait_until='load')
        assert page.locator('#mathSetup').is_visible()
        page.locator('#mathStart').click()
        assert page.locator('#mathGame').is_visible()
        assert page.locator('#mathVisual .math-carrot').count()>0
        page.locator('#mathHelp').click()
        page.locator('#mathHintNext').click()
        page.locator('#mathSolution').click()
        assert page.locator('#mathNext').is_visible()
        assert page.locator('#mathScore').inner_text()=='0 point'
        page.goto(url+'?spil=regneklog',wait_until='load')
        page.locator('#mathLevel').select_option('expert')
        page.locator('#mathStart').click()
        assert page.locator('#mathGame.math-adult').is_visible()
        page.locator('#mathHelp').click()
        assert not page.locator('#mathVisual').is_visible()
        page.locator('#mathHintNext').click()
        assert page.locator('#mathGuideText').inner_text()
        page.goto(url,wait_until='load')
        page.locator('#homeSettings').click()
        assert page.locator('#settings').is_visible()
        page.locator('#settingsBack').click()
        assert page.locator('#gameChooser').is_visible()
        page.locator('#chooseBoardMode').click()
        assert page.locator('#setup').is_visible()
        page.goto(url+'?spil=talkort',wait_until='load')
        assert page.locator('#talkort').is_visible()
        assert not page.locator('#talkortCountStart').is_visible()
        assert page.locator('#talkortNext').is_enabled()
        page.goto(url+'?spil=torskeklog',wait_until='load')
        assert page.locator('#fishSetup').is_visible()
        page.locator('#fishStart').click()
        assert page.locator('#fishGame').is_visible()
        page.locator('#fishGame [data-game-rules]').click()
        assert page.locator('#newGameRulesDialog').is_visible()
        assert 'TorskeKlog' in page.locator('#newGameRulesTitle').inner_text()
        page.get_by_role('button',name='Luk regler',exact=True).click()
        assert page.locator('#fishLocalTable .fish-number').count()==0
        page.get_by_role('button',name='Vis mine kort · Spiller 1').click()
        assert page.locator('#fishLocalTable .fish-number').count()>0
        page.goto(url+'?spil=500',wait_until='load')
        assert page.locator('#rummySetup').is_visible()
        page.locator('#rummyStart').click()
        assert page.locator('#rummyGame').is_visible()
        page.locator('#rummyGame [data-game-rules]').click()
        assert page.locator('#newGameRulesDialog').is_visible()
        assert '500' in page.locator('#newGameRulesTitle').inner_text()
        page.get_by_role('button',name='Luk regler',exact=True).click()
        page.get_by_role('button',name='Vis mine kort · Spiller 1').click()
        assert page.locator('#rummyLocalTable > .fish-cards .rummy-card').count()==7
        for route,prefix,key in [('torskeklog','fish','aeselklog-torskeklog-v1'),('500','rummy','aeselklog-500-v1')]:
            page.goto(url+'?spil='+route,wait_until='load')
            page.locator('#'+prefix+'CpuCheck').check()
            page.once('dialog',lambda d:d.accept())
            page.locator('#'+prefix+'Start').click()
            assert page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).cpuSeats[0]',key)==1
            page.evaluate('''key=>{const g=JSON.parse(localStorage.getItem(key));g.turn=1;g.pending=null;if(g.stock)g.step='draw';localStorage.setItem(key,JSON.stringify(g))}''',key)
            page.reload(wait_until='load')
            page.locator('#'+prefix+'Resume').click()
            seq=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).seq',key)
            page.wait_for_function('''({key,seq})=>JSON.parse(localStorage.getItem(key)).seq>seq''',arg={'key':key,'seq':seq},timeout=7000)
        page.goto(url+'?spil=laering',wait_until='load')
        assert page.locator('#learning').is_visible()
        page.locator('#learningSettings').click()
        page.locator('#learningAutoRead').uncheck()
        page.locator('#learningControlMode').select_option('icons')
        page.locator('#learningAnswerMode').select_option('write')
        page.locator('#learningCloseSettings').click()
        page.locator('#learningIcons [data-type="1"]').click()
        assert page.locator('#learningQuestion').inner_text()
        assert page.locator('#learningAnswer').is_visible()
        page.locator('#learningHelp').click()
        assert page.locator('#learningHint').is_visible()
        assert not errors,errors
        print('PASS: real local HTTP PWA installation, cached HTML/CSS/illustration, offline reload + menus')
        context.close();browser.close()
finally:
    server.shutdown();server.server_close()
