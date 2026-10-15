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
        page.locator('#homeSettings').click()
        assert page.locator('#settings').is_visible()
        page.locator('#settingsBack').click()
        page.locator('#homePlay').click()
        assert page.locator('#setup').is_visible()
        assert not errors,errors
        print('PASS: real local HTTP PWA installation, cached HTML/CSS/illustration, offline reload + menus')
        context.close();browser.close()
finally:
    server.shutdown();server.server_close()
