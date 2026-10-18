# ÆselKlog – kortspil, æselfejl, menu og tilbageknap

Dette er en **målrettet kildekodeopdatering** – ikke en komplet app. Den indeholder ingen MP3-filer, ændrer ingen Cloudflare Worker og sender intet til GitHub automatisk.

## Installation på Windows
1. Hent **den seneste kode** fra GitHub `driftportal-platform/aeselklog-talstien` via **Code → Download ZIP**, og pak den ud i en ny mappe. Brug ikke en gammel v0.9.36 ZIP: dit GitHub indeholder nyere onlinefiler.
2. Pak denne opdaterings-ZIP ud. Behold mappen `aeselklog-opdatering` samlet (den indeholder `anvend-opdatering.cjs` og `changes.json`).
3. Kopiér hele `aeselklog-opdatering`-mappen ind i hovedmappen af den nyligt udpakkede GitHub-kode, ved siden af `index.html`.
4. Åbn hovedmappen i Stifinder. Skriv `powershell` i adresselinjen. Kør:

   `node .\aeselklog-opdatering\anvend-opdatering.cjs`

5. Hvis den viser `KLAR`, upload disse opdaterede filer til de **samme placeringer** i GitHub: `index.html`, `app.js`, `styles.css`, `sw.js`, `cardgame-engine.js`, `cardgame-ui.js`, `site/online.html`. Brug GitHub's Upload files i rodmappen (for `site/online.html` skal du åbne `site` i repo først).
6. Test på mobil efter GitHub Pages er opdateret.

Ved fejl stopper programmet uden at gemme nye filer. For filer, det ændrer, laves en `.before-aeselklog-update.bak`-kopi. **Upload ikke** backupfilerne eller `aeselklog-opdatering` til GitHub.

## Hvad der ændres
- Online spil flyttes fra forside til Spil-menu; links fortsat til `/site/online.html`.
- Online får en tydelig `← Tilbage til spilmenu`-knap.
- Kortspil: 1–5 kopier af hvert tal i valgt område (20–100 talkort).
- CPU-fejl valgfri, fra som standard; fejlprocent bruges kun ved mulige korttræk, hvor Æslet kan overse at placere det vendte kort.
- Æslet kan nu få strafkort ved en gyldig udfordring på samme vilkår som mennesker. CPU-straf vises i bunkeoversigten, og manuel straf kan målrettes CPU.
- Den store knap `Opdaget fejl!` er flyttet op over `Hør tallet igen`.
- Ny PWA-cache-version til kode, uden sletning af den separate MP3-lydcache.

## Afgrænsning
- **Dette ændrer det lokale Kortspil**, ikke antal kort i Cloudflare-online-versionen. Online kræver en særskilt serverændring for variable kortsæt.
- Den valgte CPU-fejlprocent angiver sandsynlighed *pr. relevant, vendt kort med et muligt placeringstræk*, ikke af alle ture.
- Æslet laver fejl ved at lægge et ellers spilbart kort i sin åbne bunke. Spilleren skal opdage og udfordre fejlen, før senere træk overskriver den seneste hændelse.
- Den nuværende forældrelås til online er stadig kun en voksenstyret pilot, ikke en stærk serverbeskyttelse.
- Børnenes iPhone/PWA-afprøvning og live-synkronisering er ikke automatisk testet.

## Forslag til prøver
1. Start kortspil i 1–20 med 1, 2, 3, 4 og 5 sæt: kontroller 20, 40, 60, 80, 100 kort.
2. Start mod Æslet med fejl slået fra. Test et almindeligt spil.
3. Vælg CPU-fejl 100 %, vend til et træk hvor kortet ellers kunne placeres. Tryk på Æselkortets `Opdaget fejl!` før næste træk. Æslet skal nu modtage strafkort, og kortet tilbageføres.
4. Kontroller både Spil-menu og online Tilbage-knap på iPhone.
5. Test et gemt kortspil fra før opdateringen.

## Kendte begrænsninger
Der er gennemført JavaScript-syntakskontrol samt de tre eksisterende kortspilstests og en særskilt test for 1–5 kortsæt og CPU-straf. Det er **ikke** en live-test på brugerens seneste GitHub-version eller iPhone. Opdateringsprogrammet stopper, hvis afgørende kodeafsnit ikke findes, i stedet for at gætte.
