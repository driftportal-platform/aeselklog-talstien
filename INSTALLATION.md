# Installation af ÆselKlog

Aktuel opdatering: v0.9.77 – TorskeKlog offline og online. Talkort-menuerne fra v0.9.76 er med.

## 1. Filer og GitHub
Pak opdateringen ud i projektmappen. Erstat filerne, og bevar alle undermapper. Slet ikke audio, music eller assets. Kontrollér især de nye fish-filer og assets/icons/fish-game.svg.

Kør `npm.cmd test`: 60/60 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`, som er skjult i nogle uploadvisninger.

## 2. Cloudflare skal også opdateres
Åbn PowerShell i selve projektmappen, hvor index.html og mappen worker ligger. Kør denne ene linje:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Står PowerShell allerede inde i worker-mappen, skal stien efter --config i stedet være `wrangler.jsonc`.

Denne release kræver den nye Worker, fordi TorskeKlog-reglerne kører på serveren. Den nye fish-engine.js skal derfor være i projektroden ved deploy. Ingen ny Cloudflare-binding, nøgle eller migration kræves. Bevar GAME_ROOM.

Kontrollér bagefter Worker-adressens /health: den skal vise `ÆselKlog Online v0.9.77`. Genåbn appen efter GitHub Pages er færdig, og kontrollér også versionsmærket 0.9.77. Opret et nyt TorskeKlog-rum.

## 3. Prøv TorskeKlog
Offline: vælg TorskeKlog, tilføj 2–6 spillere og start. Tryk Vis mine kort. Vælg et tal og en modspiller. Kontrollér både aflevering, Fisk/træk, privat visning af det fiskede kort, tursskifte og gem/fortsæt.

Online: vælg Online spil → TorskeKlog. Opret et rum og send invitationen. Prøv på mindst to fysiske enheder: egen hånd, fire ens, chat/lyd, genindlæsning, Forlad og Afslut. Se reglerne i docs/torskeklog.md.

Valideret her: 60/60 Node-tests, komplette regler/Worker-spil med 2–6 spillere, browserprøve med tre onlineklienter og faktisk lokal HTTP/PWA-offlineprøve. Wrangler dry-run har bundlet Worker. Ingen deployment eller fysisk telefonprøve er foretaget herfra.
