"""v0.9.6 homepage/PWA-layout regression. Offline Chromium, no ElevenLabs credits."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
import re

ROOT = Path(__file__).parents[1]
JS = ['engine.js', 'board.js', 'actions.js', 'leaderboard.js',
      'adaptive.js', 'profiles.js','parentreport.js', 'savegame.js', 'cpuvoice.js', 'voicecache.js', 'narration.js', 'app.js', 'home-ui.js']


def inline_html():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+ (ROOT/'styles.css').read_text(encoding='utf-8')+'</style>')
    html = re.sub(r'<script\s+src="[^"]+"\s+defer></script>', '', html)
    for filename in ['home-fullscreen.webp', 'home-hero-wide.webp', 'home-hero-mobile.webp',
                     'home-mascot.webp', 'home-illustration.webp', 'aeselklog-card.webp']:
        path = ROOT / filename
        if path.exists():
            uri = 'data:image/webp;base64,' + base64.b64encode(path.read_bytes()).decode('ascii')
            html = html.replace('./' + filename, uri)
    return html


def load(page, html, previous=None):
    page.set_content(html, wait_until='load')
    page.evaluate('''initial => {
       const data={...initial}; window.__localItems=data;
       Object.defineProperty(window,'localStorage',{configurable:true,value:{
         getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
       window.confirm=()=>true;
       window.speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),25);
       window.speechSynthesis.cancel=()=>{};
       window.fetch=async()=>{throw Error('Mock: offline test')};
    }''', previous or {})
    for name in JS:
        page.add_script_tag(content=(ROOT / name).read_text(encoding='utf-8'))


def check_hit_centers(page):
    return page.evaluate('''() => Object.fromEntries([
      'homePlay','homeSettings','homeTopscore','homeAbout','resumeGame','deleteSave'
    ].map(id=>{
      const r=document.getElementById(id).getBoundingClientRect();
      const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return [id,hit?.closest('button')?.id===id];
    }))''')


def check_visible_menus(page):
    for ident in ['homePlay','homeSettings','homeTopscore','homeAbout']:
        assert page.locator('#'+ident).is_visible(), f'{ident} missing'
    page.locator('#homeSettings').click()
    assert page.locator('#settings').is_visible()
    page.locator('#settingsBack').click()
    page.locator('#homeTopscore').click()
    assert page.locator('#topscoreDialog').is_visible()
    page.locator('#closeTopscore').click()
    page.locator('#homeAbout').click()
    assert page.locator('#aboutDialog').is_visible()
    page.locator('#closeAbout').click()
    page.locator('#homePlay').click()
    assert page.locator('#setup').is_visible()
    page.locator('#setupBack').click()
    assert page.locator('#home').is_visible()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                         args=['--no-sandbox', '--disable-dev-shm-usage'])
    html = inline_html()
    setup = browser.new_page(viewport={'width':390, 'height':844}, reduced_motion='reduce')
    load(setup, html)
    assert setup.locator('#resumeCard').is_hidden(), 'Resume is shown with no saved game'
    setup.locator('#homePlay').click()
    setup.locator('#startButton').click()
    setup.locator('#saveGame').click(force=True)
    assert setup.locator('#resumeCard').is_visible(), 'Save does not reveal resume action'
    saved = setup.evaluate('() => ({...window.__localItems})')
    assert 'aeselklog-igangvaerende-v1' in saved
    setup.close()

    for width, height in [(390, 844), (375, 667), (430, 932),
                          (844, 390), (667, 375), (1280, 800)]:
        for with_save in [False, True]:
            page = browser.new_page(viewport={'width':width,'height':height},
                                     reduced_motion='reduce', locale='da-DK')
            errors=[]
            page.on('pageerror', lambda e:errors.append(str(e)))
            load(page, html, saved if with_save else None)
            assert page.locator('#resumeCard').is_visible() is with_save
            assert page.locator('.home-art').evaluate('el=>el.naturalWidth') == 417
            if with_save:
                hits=check_hit_centers(page)
                assert all(hits.values()), f'{width}x{height}: intercepted buttons: {hits}'
                box=page.locator('#resumeCard').bounding_box()
                assert box is not None and box['width'] < width*.9 and box['height'] < height*.15
                if width < height or height > 550:
                    play=page.locator('#homePlay').bounding_box()
                    settings=page.locator('#homeSettings').bounding_box()
                    # Since v0.9.9 the continue action is below all four menu buttons;
                    # the backdrop artwork stays untouched and all hit regions are separate.
                    for menu in ['homePlay','homeSettings','homeTopscore','homeAbout']:
                        hit=page.locator('#'+menu).bounding_box()
                        separated=box['y']>=hit['y']+hit['height'] or box['y']+box['height']<=hit['y']
                        assert separated, (width,height,'Continue overlaps '+menu,box,hit)
                else:
                    play=page.locator('#homePlay').bounding_box()
                    settings=page.locator('#homeSettings').bounding_box()
                    assert box['y'] >= play['y']+play['height'], 'Landscape resume not below Spil'
                    assert box['y']+box['height'] <= settings['y'], 'Landscape resume overlaps Settings'
            check_visible_menus(page)
            if with_save:
                page.locator('#resumeGame').click()
                assert page.locator('#game').is_visible(), 'Resume failed'
                page.locator('#saveGame').click(force=True)
                assert page.locator('#home').is_visible()
                page.locator('#deleteSave').click()
                assert page.locator('#resumeCard').is_hidden(), 'Delete did not hide resume'
                assert page.evaluate('window.__localItems["aeselklog-igangvaerende-v1"]') is None
                assert all(page.locator('#'+id).is_visible() for id in
                           ['homePlay','homeSettings','homeTopscore','homeAbout'])
            assert not errors, f'{width}x{height} save={with_save}: {errors}'
            print(f'PASS {width}x{height} saved={with_save}')
            page.close()
    browser.close()
