# ÆselKlog v0.9.51

Pakken indeholder kun ændrede filer. Udpak den først. Kopiér indholdet til din lokale aeselklog-talstien-mappe, hvor index.html og package.json ligger. Bevar mapperne site, tests og worker, og erstat de eksisterende filer.

## GitHub Desktop og hjemmesiden
1. Åbn projektet i GitHub Desktop. Vælg Repository → Open in Terminal.
2. Kør `npm.cmd test`. Resultatet skal være 41/41 bestået.
3. Kontrollér ændringerne i GitHub Desktop. Skriv fx “Kompakt onlinebord og flydende chat”, vælg Commit og derefter Push origin.
4. Vent på GitHub Pages-opdateringen. Genindlæs siden. Versionsmærket skal vise 0.9.51.

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
- Opret et nyt rum på to eller tre enheder. Spillerkortene ligger i én række; stryg sidelæns ved flere spillere. Midterbunkerne er lige nedenunder.
- Tandhjulet øverst samler invitationer, lyd og Afslut spil. Runde æsel- og højttalerknapper er ved spillerkortene.
- Åbn chat med den runde knap. Send tekst, optag lyd eller vælg en lydfil. Luk vinduet igen; nye beskeder fra andre får knappen til at pulsere.
- Chat kræver ikke fælles godkendelse. Ingen 10-sekundersgrænse eller ventetid mellem beskeder. En lydfil må højst fylde 1 MiB; større filer vises med en forklaring.
- Prøv “Prøv æsellyd” under indstillinger på hver enhed. Æsellyd skal være slået til. Hvis browseren blokerer, tryk “Aktivér æsellyd”. Giv derefter et æselkort efter et forkert træk, og kontrollér lyden hos alle spillere.

41/41 automatiske tests og seks online-browserkontroller består, herunder to/seks spillere, træk med mus og touch, tidlig start, afslutning, chat og lydsignal på tre profiler. Cloudflare dry-run består. Rigtig iPhone/iPad-lyd, mikrofon og live forbindelser skal afprøves efter upload. Pakken er ikke publiceret herfra.
