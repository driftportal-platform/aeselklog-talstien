# ÆselKlog Online v0.9.46

Samlet opdatering oven på v0.9.45: 2–6 spillere, nyt hyggeligt design og nem invitation.
Udgangspunkt: GitHub main 1ffebc1ab0c8779d175dddaef2f375637176a60c, hentet 19. oktober 2026. Intet er publiceret af denne opgave.

## Sådan bruger I det nye spil

1. Opretteren skriver sit navn og vælger 2–6 spillere samt 1–5 kortsæt.
2. Tryk Opret rum. Spillet viser, hvor mange der mangler. Kortene uddeles automatisk, når alle valgte spillere er tilmeldt.
3. Tryk Del invitation på mobil/iPad. Enhedens delingsmenu viser de apps, den understøtter, fx Beskeder eller Messenger. Hvis deling ikke understøttes, kopieres invitationen i stedet.
4. På pc kan du bruge Invitér via mail. Det åbner din mailapp med emne og invitation; du vælger modtagere og sender selv. Kopiér invitation virker også til Messenger, mail, SMS og andre apps. Hvis kopiering er blokeret, vises et tekstfelt, som du kan markere og kopiere.
5. Modtageren åbner linket, skriver sit navn og trykker Deltag i spillet. Rumkoden er allerede udfyldt. Forældrelåsen er bevaret.

Kun rumkoden deles i linket. Din personlige spilleradgang deles ikke. Del invitationen med dem, der skal spille med.
Spillerantallet kan ikke ændres midt i et rum; opret et nyt rum, hvis I vil være flere eller færre.

Kortene fordeles så lige som muligt. Eksempel: ét sæt = 20 talkort. Ved seks spillere får to spillere fire kort og fire spillere tre kort. Ved to spillere får hver ti.
To-spiller-vinderreglen er bevaret. Ved flere spillere følger placeringerne offlinekortspillets logik: spillet fortsætter, til alle undtagen én er færdige; færdige spillere rangeres efter æselkort og derefter tidspunktet, de blev færdige. Tomme spillere springes over og kommer tilbage, hvis de får nye kort. Podiet viser de første tre.

## 1. Installér i GitHub Desktop-projektet

1. Åbn GitHub Desktop, vælg aeselklog-talstien, og hent nyeste main med Fetch/Pull.
2. Vælg Repository → Show in Explorer. Det er denne projektmappe, filerne skal ind i.
3. Pak ZIP-filen ud i en separat mappe. Kopiér hele indholdet ind i projektmappen, erstat filer med samme navn, og bevar site/, worker/ og tests/. Slet ingen øvrige filer.
4. Klik i Stifinders adresselinje i projektmappen, skriv powershell, og tryk Enter. Kør:

```powershell
npm.cmd test
```

5. Forvent 36/36 bestået. Gå tilbage til GitHub Desktop. Kontrollér Changes, skriv fx “Online v0.9.46 – flere spillere og invitationer” som Summary, klik Commit to main og derefter Push origin.

Webfiler til GitHub Pages:
- online.css og online-invite.js (nye filer; skal ligge i projektets rod)
- site/online.html, site/online.js, site/chat.js
- online.html, online.js, chat.js (den direkte onlineadresse)
- index.html og sw.js (versionsmærke og cache)

Serverkode:
- worker/src.js (kræver også separat Cloudflare-deployment)

Tests og dokumentation:
- tests/online_browser.cjs, tests/online_multiplayer.test.js og tests/online_multiplayer_browser.cjs
- CHANGELOG.md, PROJEKTSTATUS.md og denne vejledning

Eksisterende billeder og MP3'er genbruges. Ingen konto-/nøglefiler eller wrangler-konfiguration medfølger.

## 2. Deploy Worker separat

GitHub Push installerer ikke Worker. Opdatér både Pages og Worker, før du prøver et nyt rum med flere spillere.

Åbn PowerShell i projektmappen som ovenfor. Kør:

```powershell
cd worker
npx.cmd wrangler deploy --dry-run --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Kontrollér GAME_ROOM → GameRoom og APP_ORIGIN. Bevar den eksisterende Durable Object-binding og migrationer.
Den oplyste liveadresse er https://aeselklog-online.driftportal-platform.workers.dev, mens wrangler.jsonc har standardnavnet aeselklog-online-pilot. Derfor angiver kommandoen live-navnet eksplicit. Hvis dit verificerede live-navn er et andet, brug det i begge kommandoer.

Når du er klar til at publicere serverændringen, kør fra samme worker-mappe:

```powershell
npx.cmd wrangler deploy --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

/health skal vise v0.9.46. Genindlæs hjemmesiden på alle enheder. Opret et nyt rum; eksisterende rum forbliver tospillerspil med deres gamle kort.

## 3. Prøv på jeres enheder

- Vælg tre spillere og ét sæt. Invitér to andre. Rummet skal vente på begge, inden kort uddeles. Prøv også seks spillere.
- Åbn invitation på iPhone/iPad, og kontrollér at rumkoden er udfyldt. Afprøv afsendelse via Beskeder/Messenger i delingsmenuen. Tilgængelige apps afhænger af enheden. Mail-knappen kræver en opsat mailapp; ellers brug Kopiér invitation.
- Vend kort, og læg dem på midterrækker eller direkte på andre spilleres åbne bunker. Prøv tryk og træk. Kontrollér turen rundt om bordet.
- Udfordr et forkert træk fra en tredje eller sjette spiller. Prøv begge æselkortvarianter og ekstra kortstraf. Straf skal følge reglerne, og et afsluttende forkert træk skal stadig kunne udfordres.
- Kontrollér chatnavne og at alle skal godkende fri tekst/lyd. Send en rigtig talebesked mellem forskellige deltagere.
- Genindlæs med F5, og kontrollér at du kommer tilbage på din egen plads. Prøv også invitationslink, når enheden tidligere har gemt et andet rum.
- Afslut spillet, og kontrollér vinder og tre medaljepladser. Prøv tale og musik uafhængigt på hver enhed.

## Udført kontrol

36/36 Node-tests. Alle kombinationer af 2–6 spillere og 1–5 kortsæt; samtidige tilmeldinger, adgang, samtykke, gemning, turrækkefølge, straf, genindtræden, vinderregler og ældre rum.
Chromium med to og seks isolerede profiler: mobil, tablet/iPad-størrelser og pc fra 320 til 1280 px; ingen vandret overflydning i det testede spillebord. Invitationer, mail-link, native-share-kald, kopi/reservefelt, genindlæsning, chat, simuleret lyd, straf og podium består. Eksisterende Python/Playwright-tests for offlinekortspil og CPU består.
Worker dry-run med GAME_ROOM og APP_ORIGIN samt syntakskontrol består.

Browsertransport, mikrofon, lyd og native deling er simuleret. Rigtig iPhone/iPad, Messenger/Beskeder, mailafsendelse og live Cloudflare skal prøves efter installation. Ingen beskeder er sendt, og ingen deployment er udført herfra.
