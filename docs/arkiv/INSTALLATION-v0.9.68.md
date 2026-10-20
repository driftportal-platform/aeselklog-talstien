# ÆselKlog v0.9.68 – stabil genopkobling

Pakken indeholder også ændringerne fra v0.9.67. Kopiér indholdet ind i projektmappen og erstat filerne, mens undermapperne bevares. Slet ikke assets, audio eller music.

## Opdatér begge dele
1. Kør `npm.cmd test`: 54/54 skal bestå.
2. Kontrollér GitHub Desktop, Commit og Push origin.
3. Deploy Cloudflare fra projektmappen med index.html og worker-mappen:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Står terminalen i worker-mappen, brug `--config wrangler.jsonc`. Workerens /health skal vise v0.9.68. Genindlæs derefter spillet på alle enheder. Den nye klient kræver den nye Worker for at sende spiltræk.

## Prøv sammen
Spil kortspil med mindst to enheder. Ved et kortvarigt udfald vises en besked øverst, og seneste status hentes automatisk igen. Et usikkert træk afklares, før der kan sendes et nyt. Kort må ikke forsvinde eller flyttes to gange. Prøv også at genindlæse midt i et udfald.

Online Talstiens store terning og automatiske turskift fra v0.9.67 er bevaret.

54/54 Node-tests samt simulerede Chromium-forløb og Worker dry-run. Der er ikke foretaget live deployment eller test på fysisk iPhone/iPad. Den konkrete årsag til de rapporterede udfald er ikke bevist uden serverlogge.
