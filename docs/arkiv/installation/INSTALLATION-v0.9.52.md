# ÆselKlog v0.9.52

Pakken indeholder kun ændrede filer. Udpak den først. Kopiér indholdet til din lokale aeselklog-talstien-mappe, hvor index.html og package.json ligger. Bevar mapperne site, tests og worker, og erstat de eksisterende filer.

## GitHub Desktop og hjemmesiden
1. Åbn projektet i GitHub Desktop. Vælg Repository → Open in Terminal.
2. Kør `npm.cmd test`. Resultatet skal være 42/42 bestået.
3. Kontrollér ændringerne i GitHub Desktop. Skriv fx “Større chat, musikpause og prik til spiller”, vælg Commit og derefter Push origin.
4. Vent på GitHub Pages-opdateringen. Genindlæs siden. Versionsmærket skal vise 0.9.52.

## Cloudflare – også nødvendigt
Åbn terminalen i samme projektmappe. Kontrollér først pakken uden at publicere:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --dry-run --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Når kontrollen lykkes, opdater den eksisterende Worker:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Brug det præcise navn aeselklog-online, fordi konfigurationsfilen nævner pilot-navnet. Opret ikke en ny Worker. GAME_ROOM-bindingen og migrationerne bevares. Worker-adressen er https://aeselklog-online.driftportal-platform.workers.dev.

## Prøv efter opdateringen
- Versionsmærket skal vise 0.9.52. Begge onlineadresser er opdateret.
- Åbn chatten. Nyeste besked ligger øverst. Hurtige beskeder kan foldes ud; resten af pladsen bruges til historik. Den kan rulles.
- Slå musik til, og optag en besked. Musikken skal holde pause, mens mikrofonen åbnes og under optagelsen, og fortsætte med samme styrke efter Stop. Prøv også at afvise mikrofonadgang. Dette er automatisk kontrolleret med simuleret lyd; prøv på rigtig iPhone/iPad efter upload.
- Luk chatten, og tryk på en modspillers navn med 👋. På den pågældendes enhed ryster deres eget felt kort, og navnet på afsenderen vises. Ingen kort eller ture flyttes. Vent tre sekunder mellem prik.
- Træk med finger/mus og tryk-på-kort-derefter-bunke er bevaret.

42/42 tests består. Kontrolleret i Chromium med simuleret Worker-transport, lyd og mikrofon. Worker dry-run består. Ingen live deployment udført herfra. Opdater både GitHub Pages og den eksisterende Cloudflare Worker med kommandoerne ovenfor.
