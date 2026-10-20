# ÆselKlog v0.9.67 – terning og automatisk tur

Bygger på nyeste GitHub main 983a2044ec1a3c1dec4960444c746a9e589a8a07 (v0.9.66).

1. Pak ZIP ud og kopiér filerne ind i projektmappen. Erstat filerne og bevar undermapperne. Bevar assets, audio og music.
2. Kør `npm.cmd test`: 53/53 skal bestå. Kontrollér ændringer i GitHub Desktop, Commit og Push origin.
3. Cloudflare skal også opdateres. Fra projektmappen med index.html og worker-mappen:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Står terminalen allerede i worker-mappen, brug `--config wrangler.jsonc` i stedet. /health skal vise v0.9.67.

Genindlæs på alle enheder. Start et online Talstien-spil: kast-knappen ligger lige under banen og åbner den store terning. Tryk på terningen for at kaste. Efter færdig tur vises resultatet kort, så skifter turen automatisk. Opgaver, ekstra kast og valg ved specialfelter afventer fortsat spilleren. Ingen Næste spiller-knap.

53/53 Node-tests, simulerede browserforløb og Worker dry-run. Ikke publiceret automatisk og ikke prøvet på fysisk iPhone/iPad.
