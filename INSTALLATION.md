# Installation af ÆselKlog

Aktuel opdatering: v0.9.71 – Kast over banen, læselige feltforklaringer og navne i tale.

1. Pak opdateringen ud og kopiér indholdet ind i projektmappen. Erstat filerne og bevar undermapper. Bevar assets, audio og music.
2. Kør `npm.cmd test`: 55/55 skal bestå. Kontrollér i GitHub Desktop, Commit og Push origin. `.github/workflows/test.yml` skal fortsat findes.
3. Opdatér Cloudflare fra projektmappen med index.html og worker-mappen:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Hvis terminalen allerede står i worker-mappen, brug `--config wrangler.jsonc`. /health skal vise v0.9.71.

Genindlæs alle enheder. Åbn online Talstien → Indstillinger → Lyd og musik → Fortællerstemme i Talstien. Vælg AI-stemme eller Telefonens stemme. AI-listen er den samme som i offline Talstien; tryk Opdater stemmelisten ved behov og Prøv valgt stemme. ÆselKlog-original vises kun, hvis stemmetjenesten returnerer den.

Hver enhed gemmer sit eget onlinevalg; ved første brug arves offline-valget. Stemmetjenestens Worker er den samme som offline; dens eksisterende API-nøgle skal ikke kopieres til spillet eller GitHub. Denne pakke ændrer ikke stemme-Workerens kode.

AI-stemmen bruger nu de indtastede navne, som ønsket. Navnene indgår i teksten til den samme stemmetjeneste som offline; der gemmes ikke en permanent lydcache med navnene. Ved fejl bruges telefonstemmen midlertidigt, mens det valgte AI-ID bevares. Slå Tale fra for at stoppe talebeskeder. Musikkens lydstyrke dæmpes under tale.

Prøv først valgt stemme på to fysiske enheder, derefter tur/opgave/specialfelt, Tale fra, musik og genindlæsning. 55/55 Node-tests og simulerede browserprøver består; ægte ElevenLabs-lyd og iPhone-autoplay er ikke testet herfra.

Denne ene fil opdateres fremover. Ældre installationsfiler i docs/arkiv er historik.

Kast-knappen ligger nu over spillepladen til højre. Tryk på terningen med teksten Kast. Felter folder alle forklaringer ud i fuld bredde lige over banen. Prøv også med smal mobilskærm og de faktiske spillernavne.
