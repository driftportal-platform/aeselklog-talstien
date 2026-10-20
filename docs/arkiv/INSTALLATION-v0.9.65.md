# ÆselKlog v0.9.65 – hele korttal og synlige vendte kort

Pakken bygger på den nyeste GitHub main 838dbae94b12d2f8bbaa8cb195a25999d9b2b83b (v0.9.64).

## GitHub
1. Kopiér pakkens indhold ind i projektmappen med index.html og package.json. Erstat filerne og bevar undermapperne. Slet ikke assets, audio eller music.
2. GitHub Desktop → Repository → Open in Terminal → `npm.cmd test`: 51/51 skal bestå.
3. Kontrollér ændringerne → Commit med fx “Synlige vendte kort og hele korttal” → Push origin.

## Cloudflare – nødvendig denne gang
Worker skal også opdateres, så modstandernes enheder modtager det allerede vendte kort.

Fra projektmappen (med index.html og worker-mappen):

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Hvis terminalens sti allerede ender med \worker, brug i stedet:

```powershell
npx.cmd wrangler deploy --config wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Brug kun én af kommandoerne. https://aeselklog-online.driftportal-platform.workers.dev/health skal derefter vise v0.9.65.

## Prøv på begge enheder
- Vent på GitHub Pages, og genindlæs på alle enheder. Siden skal vise 0.9.65.
- Vend et kort på din lukkede bunke: både du og modstanderne skal se tallet på den bunke. De øvrige lukkede kort afsløres ikke. En modstander kan se, men ikke vælge eller flytte, dit vendte kort.
- Placér kortet: den lukkede bunke viser igen bagsiden (eller Tom), mens det placerede kort vises på målet. Kortantal og bunkeorden ændres kun som følge af selve spilhandlingerne.
- Kontrollér 20 og andre tocifrede tal: de står samlet på én linje. 100 er også tilpasset den lille kortbredde.

51/51 Node-tests, simulerede browserkontroller for to/seks spillere ved 320–1366 px, genindlæsning og placering består. Worker dry-run består. Fysisk iPhone/iPad og live Worker er ikke prøvet, og intet er publiceret automatisk.
