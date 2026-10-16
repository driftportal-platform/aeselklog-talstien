"""Kør i miljø hvor lokal HTTP- eller file-URL adgang er tilladt."""
from playwright.sync_api import sync_playwright
import os
URL=os.environ.get('AESELKLOG_URL','http://localhost:8000/')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width,height in [(390,844),(844,390),(1280,800)]:
  page=browser.new_page(viewport={'width':width,'height':height})
  page.goto(URL)
  page.locator('#homePlay').click()
  page.locator('#openTalkort').click()
  assert page.locator('#talkortNumber').inner_text()=='1'
  page.locator('#talkortNext').click()
  assert page.locator('#talkortNumber').inner_text()=='2'
  page.locator('#talkortRange').select_option('21-40')
  assert page.locator('#talkortNumber').inner_text()=='21'
  assert 'zone-2' in page.locator('#talkortCard').get_attribute('class')
  page.locator('#talkortLanguage').select_option('de')
  assert page.locator('#numberLanguageChoice').input_value()=='de'
  page.locator('#talkortJump').select_option('23')
  assert not page.locator('#talkortPrime').is_hidden()
  page.locator('#talkortRange').select_option('81-100')
  page.locator('#talkortJump').select_option('100')
  assert page.locator('#talkortNext').is_disabled()
  assert 'zone-5' in page.locator('#talkortCard').get_attribute('class')
  page.close()
 browser.close()
