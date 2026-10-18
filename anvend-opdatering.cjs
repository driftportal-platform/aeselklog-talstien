/* Kør med node anvend-opdatering.cjs FRA RODEN AF ÆselKlog-repositoriet.
   Skriptet ændrer kun de målrettede steder og gemmer .bak-kopier. */
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const input = path.join(root, 'index.html');
const source = path.join(__dirname, 'online-menu.js');
const config = path.join(__dirname, 'site', 'online-config.js');
if (!fs.existsSync(input) || !fs.existsSync(path.join(root, 'app.js')) || !fs.existsSync(path.join(root, 'site','online.html'))) {
  console.error('FEJL: Åbn terminal i hovedmappen af ÆselKlog-projektet (index.html, app.js, site/).');
  process.exit(1);
}
let html = fs.readFileSync(input, 'utf8');
const before = html;
// Remove only the inserted orange homepage button, preserving existing fullscreen artwork/hotspots.
html = html.replace(/\s*<button\b[^>]*\bid="homeOnline"[^>]*>[\s\S]*?<\/button>/, '');
if (!html.includes('id="openOnlineGame"')) {
  const needle = /(<button\b[^>]*\bid="openTalkort"[^>]*>[\s\S]*?<\/button>)/;
  if (!needle.test(html)) {
    console.error('FEJL: Kunne ikke finde Talkort-valget. Ingen filer ændret.');
    process.exit(1);
  }
  html = html.replace(needle, `$1\n      <button type="button" id="openOnlineGame" class="game-mode-card game-mode-online" aria-label="Online kortspil – voksenstyret pilot">\n        <span class="game-mode-icon" aria-hidden="true">🌐</span>\n        <span class="game-mode-copy"><strong>Online spil 🔒</strong><small>Spil kort på hver sin enhed · voksenstyret pilot</small></span>\n        <span class="game-mode-check" aria-hidden="true">➜</span>\n      </button>`);
}
if (!html.includes('src="./online-menu.js"')) {
  if (!html.includes('</body>')) throw new Error('index.html mangler </body>');
  html = html.replace('</body>', '  <script src="./online-menu.js" defer></script>\n</body>');
}
if (html !== before) {
  fs.writeFileSync(input+'.bak',before);
  fs.writeFileSync(input,html);
}
for (const [src,dst] of [[source,path.join(root,'online-menu.js')],[config,path.join(root,'site','online-config.js')]]) {
  if (fs.existsSync(dst)) fs.copyFileSync(dst,dst+'.bak');
  fs.copyFileSync(src,dst);
}
console.log('KLAR: Online spil er flyttet ind i Spil-menuen. site/online-config.js bruger korrekt Worker.');
console.log('GitHub upload: index.html, online-menu.js, site/online-config.js (sidste fil i site-mappen).');
