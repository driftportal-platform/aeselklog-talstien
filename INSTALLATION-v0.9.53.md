# ÆselKlog v0.9.53

Pakken indeholder kun ændrede filer. Udpak den først. Kopiér indholdet til din lokale aeselklog-talstien-mappe, hvor index.html og package.json ligger. Bevar mapperne site, tests og worker, og erstat de eksisterende filer.

## GitHub Desktop og hjemmesiden
1. Åbn projektet i GitHub Desktop. Vælg Repository → Open in Terminal.
2. Kør `npm.cmd test`. Resultatet skal være 43/43 bestået.
3. Kontrollér ændringerne i GitHub Desktop. Skriv fx “Sidste kort og manuel vending af åben bunke”, vælg Commit og derefter Push origin.
4. Vent på GitHub Pages-opdateringen. Genindlæs siden. Versionsmærket skal vise 0.9.53.

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
1. Versionsmærket skal vise 0.9.53. Begge onlineindgange er opdateret. Rettelserne fra v0.9.52 er også inkluderet.
2. Vend sidste kort i den lukkede bunke. Vent nogle sekunder. Kortet skal blive liggende, og din åbne bunke må ikke ændres.
3. Flyt kortet med tryk eller finger/mus til en bunke. Hvis du fortsat har turen, og lukket bunke er tom, vises Vend åben bunke.
4. Tryk Vend åben bunke. De eksisterende åbne kort vendes til lukket bunke, uden blanding eller nye kort. Der vendes ikke samtidig et kort. Tryk derefter på den lukkede bunke for at vende et kort.
5. Prøv også et langsomt træk, hvor fingeren holdes på kortet nogle sekunder. Statusopdatering må ikke afbryde trækket.

43/43 Node-tests består. Test med simuleret Worker-transport og Chromium-touch/mus. Rigtig iPhone/iPad skal også afprøves efter upload. Cloudflare dry-run består. Opdater både GitHub Pages og den eksisterende Worker med kommandoerne ovenfor. Ingen publicering udført herfra.
