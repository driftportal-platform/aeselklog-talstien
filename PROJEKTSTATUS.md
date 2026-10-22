# ÆselKlog – hvor er vi nu

**Version:** 0.9.82 (lokalt valideret; ikke bekræftet publiceret). Opdateres ved hver release sammen med `CHANGELOG.md`. Hold siden på én skærm pr. afsnit: ingen versionslog her (den hører til i changelogget).

## Hvad er det?
Børnevenligt talspil som PWA (GitHub Pages, repo `driftportal-platform/aeselklog-talstien`). Matematik er altid frivillig; alt offline gemmes lokalt, ingen konti.
- **Talstien** – brætspil 1–100, digital eller fysisk A3-plade, op til 6 spillere + CPU-æsel, specialfelter, valgfri læring med forældreoversigt.
- **Kortspil** – fem talområder, 1–6 personer + CPU-æsel, frie træk, fejl udfordres med æselkortet.
- **RegneKlog** – regn visuelt eller med tal; plus, minus, gange og division, tre niveauer, hjælp og point.
- **Talkort** – ét kort ad gangen med sprogvalg, Auto og udtaletræning.
- **TorskeKlog** – Fisk med fire ens talkort, 2–6 spillere offline (evt. Æsel) eller 2–6 mennesker online på hver sin enhed.
- **ÆselKlog 500** – talkort uden kulører, æseljokere, sæt og talrækker; flere runder til 500.
- **Online** (`online.html`, Cloudflare Worker + Durable Objects) – Kortspil, Talstien, TorskeKlog og 500 for 2–6 mennesker med rumkode, invitationer, chat (slået fra som standard), prik og æsellyd. Ingen online-CPU.
Lyd: 500 gemte MP3-tal (fem stemmer + æselstemme), valgfri musik.

## Status
- **Seneste ændring:** RegneKlog offline: fire regnearter, tre niveauer, billeder/tal, trinvis hjælp og point. 64/64 Node-tests samt browser- og PWA-offlineprøver. Ikonrettelsen fra v0.9.81 er med. Kun GitHub v0.9.82; Worker v0.9.78 er uændret. Ikke publiceret herfra.
- **Automatisk:** 64 af 64 Node-tests (`npm test`, kører i GitHub Actions når `.github/workflows/test.yml` er med). Simulerede Chromium-forløb for online med 3–6 enheder og flere skærmstørrelser.
- **Brugerafprøvet 20. oktober:** online spil på mobil og pc; kortspillet fungerede med enkelte Cloudflare-udfald på 10–15 sekunder, som genoprettede sig selv. Worker /health blev efterfølgende verificeret til v0.9.68. Enhedsmodeller og alle enkeltfunktioner er ikke oplyst.
- **Ikke bekræftet:** fysisk afprøvning af v0.9.72-talevariation og animation, rigtig mikrofon/lyd på iPhone, installeret iPhone-PWA, deling til Beskeder/Mail, live ElevenLabs, VoiceOver, familietest.
- **Cloudflare:** konfigurationens navn er `aeselklog-online-pilot`, den oplyste liveadresse bruger `aeselklog-online`. Brug eksplicit `--name` ved deploy og kontrollér `GAME_ROOM` og `APP_ORIGIN` først.

## Åbent før v1.0
1. Opdatér til v0.9.72 og prøv fortællerstemmen på mindst to fysiske enheder. Bekræft tur/opgaver/felter, Tale fra, chat/mikrofon og musik sammen. Notér resultater her.
2. iPhone-PWA-test (se `TESTPLAN.md`) og familietest (regler, tempo, sværhedsgrad, touch på små skærme).
3. **Online – drift og sikkerhed:** ingen rate limiting fundet i Worker-koden (sæt Cloudflare-regel foran oprettelse af rum). Origin-tjek er ingen sikkerhedsgrænse mod andre klienter end browsere. Spillerens hemmelighed sendes som `?secret=` ved WebSocket, hvor browsere ikke kan sætte headere; overvej en kortlivet token eller godkendelse i første besked.
4. **Online – børn og persondata:** serveren gemmer navne og stemmeklip i 24 timer. Ved AI-stemme sendes nu også de indtastede navne i talebeskeder til samme stemmetjeneste som offline. Beskriv hvad der gemmes og hvem der må chatte (voksenstyret), før linket deles bredt.
5. Trykklare fysiske kort (1–20, 41–60, 61–80, 81–100), æske og regelbog; afstem fast A3-plade med appen.
6. Tilgængelighed (VoiceOver, stor tekst) og rettigheder til billeder og lyd (musik: `MUSIC-LICENSES.md`).

## Idéer (ikke besluttet)
- Kort vinderfanfare (The Reel Winner, ca. 5 s); OGG-udgave af Children's March hvis loop-hul høres på iPhone; flere musiknumre/playliste.
- Fysisk kortspilsassistent; forældrerapport som lokal eksport; justerbar CPU-sværhedsgrad.
- Talkort: quiz ("Hvilket tal er det?"), tilfældig rækkefølge, filtre. Daglig mini-udfordring med lokal æsel-stjerne.
- Stor-tekst og dyslexi-venlig skrift. Vis størrelse (ca. 11 MB) før "Hent alle 500 talelyde".
- Opdel `app.js` (1300+ linjer) i moduler; skriv tests der afprøver adfærd frem for at søge i kildekode.

## Faste regler
Se `AGENTS.md`. Historik: `CHANGELOG.md` og `docs/arkiv/`.
