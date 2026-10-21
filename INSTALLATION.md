# Installation af ÆselKlog

Aktuel opdatering: v0.9.78 – ÆselKlog 500 offline og online. TorskeKlog og Talkort-menuerne fra tidligere opdateringer er med.

## 1. GitHub
Pak hele opdateringen ud i projektmappen og erstat filerne, inklusive nye filer og undermapper. Bevar audio, music og assets. Kontrollér især rummy-filerne, assets/icons/500-game.svg og worker/src.js.

Kør `npm.cmd test`: 62/62 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.

## 2. Cloudflare skal også opdateres
Åbn PowerShell i projektroden, hvor index.html og worker-mappen ligger, og kør denne ene linje:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Står du inde i worker-mappen, brug `--config wrangler.jsonc` i stedet. rummy-engine.js og fish-engine.js skal ligge i projektroden. Ingen ny binding, API-nøgle eller migration kræves; bevar GAME_ROOM.

Worker-adressens /health skal derefter vise `ÆselKlog Online v0.9.78`. Vent også på GitHub Pages, genåbn appen og kontrollér versionsmærket 0.9.78. Opret et nyt 500-rum.

## 3. Prøv 500
Offline: vælg ÆselKlog – 500, spillere og Start. Prøv træk, tre ens, talrække med joker, afkast, skjult hånd, gem/fortsæt, point og næste runde.

Online: vælg Online spil → ÆselKlog – 500. Invitér mindst én anden fysisk enhed. Prøv også optagning fra afkastbunken, Læg bunken tilbage, Læg til valgt sæt, chat/lyd, genindlæsning og Forlad/Afslut. Regler står i docs/500.md og i spillets indstillinger.

Valideret her: 62/62 Node-tests, komplette kampe med 2–6 spillere frem til 500, browserforløb med tre onlineklienter og offline point/ny runde/afkast, lokal HTTP/PWA-offlineprøve og Wrangler dry-run. Ingen publicering eller fysisk telefonprøve herfra.
