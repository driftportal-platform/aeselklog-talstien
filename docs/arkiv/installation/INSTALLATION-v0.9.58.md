# ÆselKlog v0.9.58

Pakken indeholder kun ændrede filer. Udpak den først. Kopiér indholdet til din lokale aeselklog-talstien-mappe, hvor index.html og package.json ligger. Bevar mapperne site, tests og worker, og erstat de eksisterende filer.

## GitHub Desktop og hjemmesiden
1. Åbn projektet i GitHub Desktop. Vælg Repository → Open in Terminal.
2. Kør `npm.cmd test`. Resultatet skal være 46/46 bestået.
3. Kontrollér ændringerne i GitHub Desktop. Skriv fx “Tre sekunder i midten, to ved modstander”, vælg Commit og derefter Push origin.
4. Vent på GitHub Pages-opdateringen. Genindlæs siden. Versionsmærket skal vise 0.9.58.

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
1. Opdater GitHub Pages og Cloudflare med kommandoerne ovenfor. Versionsmærket skal vise 0.9.58. Tidligere rettelser er inkluderet.
2. Læg et kort i midten: pausen skal være 3 sekunder. Læg et kort hos modspiller: pausen skal være 2 sekunder. Under pausen kan andre trykke på æslet.
3. Opdaget fejl giver æselstraf som før. En overset fejl i midten går tilbage til spilleren uden straf. Korrekte kort bliver liggende.

46/46 Node-tests består. Begge frister er kontrolleret på serveren og i Chromium med to isolerede browserprofiler og simuleret Worker-transport. Rigtig iPhone/iPad og live Cloudflare er ikke prøvet herfra. Worker dry-run består. Ikke publiceret; opdater begge dele med vejledningen ovenfor.
