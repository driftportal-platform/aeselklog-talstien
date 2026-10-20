# ÆselKlog – hvor er vi nu

**Version:** 0.9.63 (lokalt valideret; ikke bekræftet publiceret). Opdateres ved hver release sammen med `CHANGELOG.md`. Hold siden på én skærm pr. afsnit: ingen versionslog her (den hører til i changelogget).

## Hvad er det?
Børnevenligt talspil som PWA (GitHub Pages, repo `driftportal-platform/aeselklog-talstien`). Matematik er altid frivillig; alt offline gemmes lokalt, ingen konti.
- **Talstien** – brætspil 1–100, digital eller fysisk A3-plade, op til 6 spillere + CPU-æsel, specialfelter, valgfri læring med forældreoversigt.
- **Kortspil** – fem talområder, 1–6 personer + CPU-æsel, frie træk, fejl udfordres med æselkortet.
- **Talkort** – ét kort ad gangen med sprogvalg, Auto og udtaletræning.
- **Online** (`online.html`, Cloudflare Worker + Durable Objects) – Kortspil og Talstien for 2–6 mennesker med rumkode, invitationer, chat (slået fra som standard), prik og æsellyd. Ingen online-CPU.
Lyd: 500 gemte MP3-tal (fem stemmer + æselstemme), valgfri musik.

## Status
- **Seneste ændring:** invitationens rumkode som almindelig beskedtekst og kopiknap; indsætning kan læse en hel besked. Spilmenu går til spilvalg, og opretterens Afslut er øverst. Fælles assets-mappe med 44 ikoner, herunder nye æselillustrationer til spilvalgene. Oprydningen fra main 2acf15c og Worker v0.9.61 er bevaret; denne opdatering kræver kun GitHub Pages.
- **Automatisk:** 50 af 50 Node-tests (`npm test`, kører i GitHub Actions når `.github/workflows/test.yml` er med). Simulerede Chromium-forløb for online med 3–6 enheder og flere skærmstørrelser.
- **Ikke bekræftet:** faktisk Cloudflare-deployment og live WebSocket på flere fysiske enheder, rigtig mikrofon/lyd på iPhone, installeret iPhone-PWA, deling til Beskeder/Mail, live ElevenLabs, VoiceOver, familietest.
- **Cloudflare:** konfigurationens navn er `aeselklog-online-pilot`, den oplyste liveadresse bruger `aeselklog-online`. Brug eksplicit `--name` ved deploy og kontrollér `GAME_ROOM` og `APP_ORIGIN` først.

## Åbent før v1.0
1. Deploy Worker og test med to fysiske enheder (chat, mikrofon, sprog, udfordringer, musik, F5). Notér resultater her.
2. iPhone-PWA-test (se `TESTPLAN.md`) og familietest (regler, tempo, sværhedsgrad, touch på små skærme).
3. **Online – drift og sikkerhed:** ingen rate limiting fundet i Worker-koden (sæt Cloudflare-regel foran oprettelse af rum). Origin-tjek er ingen sikkerhedsgrænse mod andre klienter end browsere. Spillerens hemmelighed sendes som `?secret=` ved WebSocket, hvor browsere ikke kan sætte headere; overvej en kortlivet token eller godkendelse i første besked.
4. **Online – børn og persondata:** serveren gemmer navne og stemmeklip i 24 timer. Beskriv hvad der gemmes og hvem der må chatte (voksenstyret), før linket deles bredt.
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
