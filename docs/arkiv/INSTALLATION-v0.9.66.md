# ÆselKlog v0.9.66 – forlad online spil

Bygger på GitHub main 2318348d8a14cd51d5825bab7bfbd832523bfe92.

## GitHub
1. Pak ZIP ud og kopiér indholdet ind i projektmappen. Erstat filerne og bevar undermapperne. Slet ikke assets, audio eller music.
2. Kør `npm.cmd test` fra projektmappen: 52/52 skal bestå.
3. Kontrollér i GitHub Desktop, Commit og Push origin.

## Cloudflare – skal også opdateres
Fra projektmappen (med index.html og worker-mappen):

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Hvis terminalen allerede står i worker-mappen, brug i stedet `--config wrangler.jsonc`.
Workerens /health skal derefter vise v0.9.66. Ingen manuel upload af enkelte Worker-filer er nødvendig.

## Prøv efter opdatering
- Genindlæs alle enheder og opret et nyt rum med mindst tre spillere i hvert online spil.
- En deltager trykker Forlad i toppen: de øvrige får besked og fortsætter. Værten kan forlade via indstillinger; værtsrollen overdrages.
- I kortspillet: talkort fordeles i bunden af de resterendes lukkede bunker; ingen talkort forsvinder eller oprettes. Æselkort returneres til puljen (1 eller 8, afhængigt af valget).
- I Talstien: den forladtes brik fjernes; næste aktive spiller fortsætter.
- Er der kun én tilbage i en startet runde, lukkes rummet. En lobby med én kan stadig invitere.

52/52 Node-tests, simulerede Chromium-forløb og Worker dry-run. Ikke prøvet på fysisk iPhone/iPad eller publiceret automatisk.
