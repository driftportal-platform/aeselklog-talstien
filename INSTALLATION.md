# Installation af ÆselKlog

Aktuel opdatering: v0.9.83 – tryk på gulerødder og tæl med i RegneKlog.

1. Pak ZIP-filen ud i en separat mappe. Kopiér indholdet ind i din eksisterende projektmappe, og vælg Erstat filerne. Bevar eksisterende assets, audio, music, .git og .github; vælg ikke Opret kopier. Den nye math-objects.js skal med.
2. Kør `npm.cmd test`: 65/65 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub opdateres. Cloudflare/Worker v0.9.78 er uændret.
4. Genåbn appen efter GitHub Pages er færdig. Kontrollér versionsmærket 0.9.83.

## Prøv RegneKlog
- Plus: tryk de nye gulerødder hen til din samling.
- Minus: tryk det antal væk, der skal trækkes fra. Tryk en tom plads for at lægge en tilbage.
- Gange: læg én gulerod ad gangen i kurvene, til hver kurv har det ønskede antal.
- Division: del én til hver kurv, indtil alle gulerødder er fordelt ligeligt.
- Tryk Tæl med. Gulerødderne fremhæves og tælles én ad gangen. I division tælles én kurv. Lyd kan slås til/fra; bruger den valgte fortællers eksisterende danske MP3-tal. Lyden skal være hentet for at kunne bruges helt offline; uden lyd tæller skærmen videre.
- Tæl med giver hjælpstatus (5 point ved et efterfølgende rigtigt svar). Du skriver stadig selv svaret. Manipulation uden tællehjælp bevarer muligheden for 10 point. Vis løsningen giver stadig 0.

Prøv også 3−3 (nul), Stop tælling, Start billederne forfra, retur til Spilmenu under tale og kun tal + Hjælp. Tællingen stopper ved skjult side og genstartes med Tæl med.

Valideret: 65/65 Node-tests, Chromium-prøver og lokal HTTP/PWA-offline. Ingen fysisk telefon-/lydprøve eller publicering herfra.
