# ÆselKlog v0.9.60 – online-regler og kompakt bord

Udpak pakken. Kopiér indholdet til din aeselklog-talstien-mappe med index.html og package.json. Bevar mappestrukturen og erstat eksisterende filer. Slet ikke resten af projektet, audio eller music.

## GitHub Desktop
1. Åbn projektet → Repository → Open in Terminal. Kør `npm.cmd test`: 47/47 skal bestå.
2. Kontrollér ændringer, lav Commit med fx “Kompakt onlinebord og nye æselregler”, derefter Push origin.
3. Vent på GitHub Pages og genindlæs. Versionsmærket skal vise 0.9.60.

## Cloudflare – nødvendig igen denne gang
Åbn terminalen i projektmappen og kontrollér først:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --dry-run --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Opdater derefter den eksisterende Worker:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Brug præcis aeselklog-online; konfigurationsfilens pilot-navn må ikke oprette en anden Worker. GAME_ROOM og migrationer bevares. Worker-health på https://aeselklog-online.driftportal-platform.workers.dev/health skal vise v0.9.60 efter opdateringen.

## Prøv i et nyt rum
- Færrest æselkort tæller først, derefter færrest talkort og færdigrækkefølge. Ved ét æselkort er indehaveren sidst. Louise færdig/0, Åse ikke færdig/0, Brown færdig/1 giver Louise, Åse, Brown.
- Ingen pause ved kort til modstander eller midten. Senest-linjen viser spiller, tal og mål. Et kort kan udfordres, selv om næste kort er vendt. Når et andet kort lægges, er det dét udspil, æselknappen gælder. Der er ingen automatisk tidsstyret retur af midterfejl.
- Tryk på æselknappen: alle skal høre æsellyden, også den der trykker. Kun et forkert udspil fra en anden spiller giver straf; gentagne tryk giver lyd, men ikke gentagen straf. Hver enhed skal have Æsellyd til. Hvis en enhed viser Aktivér æsellyd, tryk én gang. Prøv også Prøv æsellyd i indstillinger.
- Spillerfelter står tre pr. række. Fire–seks spillere ligger i to rækker. Der står kun kort i alt og æselkort, og midten ligger tættere på.
- Med ét åbent talkort: Behold kortet · næste spiller giver turen videre, mens kortet bliver liggende. Modtages et kort mere, kan bunken igen vendes normalt. Tryk og træk med finger/mus er bevaret.

47/47 Node-tests består. Simulerede browserkontroller dækker tre/seks profiler, 320/390 px, korrekt podium, nul pause, sen udfordring, ét kort/modtagelse, lyd på alle inklusive afsenderen og ingen gentagelse ved genindlæsning. Rigtig iPhone/iPad-lyd og live Worker er ikke prøvet herfra. Worker dry-run består. Ingen publicering udført herfra.
