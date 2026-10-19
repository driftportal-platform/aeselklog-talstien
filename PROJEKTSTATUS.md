# ÆselKlog – hvor er vi nu

**Version:** 0.9.47 (lokalt valideret opdateringspakke, 19. oktober 2026; ikke publiceret). Opdateres ved hver release sammen med `CHANGELOG.md`.

## Hvad er det?
Børnevenligt talspil som PWA (GitHub Pages, repo `driftportal-platform/aeselklog-talstien`) med tre selvstændige dele og frivillig matematik:
- **Talstien** – brætspil 1–100, digital eller fysisk A3-plade, op til 6 spillere + CPU-æsel, specialfelter, valgfri læring med forældreoversigt.
- **Kortspil** – fem talområder, 1–6 personer + CPU-æsel, frie træk, fejl udfordres med æselkortet.
- **Talkort** – ét kort ad gangen med lige/ulige, tiere/enere, primtal, sprogvalg, Auto og udtaletræning.
Lyd: 500 gemte MP3-tal (fem stemmer), valgfri baggrundsmusik, ElevenLabs kun via Cloudflare Worker. Alt gemmes lokalt, ingen konti.

## Status
- v0.9.47 tilføjer valgfri start efter 60 sekunder med mindst to tilmeldte. Kun opretteren kan starte; tiden regnes på serveren fra oprettelse og nulstilles ikke ved F5. Ledige pladser lukkes ved start; kort og chattilsagn følger de faktiske deltagere. Ingen automatisk start ved tidsgrænsen.
- Nedtælling, opretteradgang, præcis tidsgrænse, samtidig tilmelding/start og genopkobling er testet.
- Udgangspunkt for v0.9.46: GitHub main `1ffebc1ab0c8779d175dddaef2f375637176a60c`.
- Nyt: 2–6 online-spillere, 1–5 kortsæt, ventelobby indtil alle er med, så lige uddeling som muligt, turrækkefølge, færdige/tilbagevendende spillere og podium med tre medaljepladser.
- Nyt design til online opsætning og spillebord med eksisterende æselgrafik og appens farver. Åbne bunker kan modtage kort direkte. Den almindelige appforside er uændret bortset fra versionsmærket.
- Invitationer: native deling, mailkladde og kopiering. Offentligt rumlink udfylder kode uden at dele spillerens secret. Gæster får en enkel deltag-side; et gammelt gemt rum overtager ikke en ny invitation.
- Chat navngiver afsenderen; alle deltagere godkender fri tekst/lyd. Samtidige tilmeldinger er testet.
- Onlinefejl rettet: CORS/chat, MIME-type på lydklip, WebSocket-videresendelse, oplæsning af alle vendte kort, synligt æselkort, gentag tal, udfordringer uden tab af nyere chat eller opdateringsnummer. Begge onlineindgange er opdateret.
- **Automatisk:** 37/37 Node-tests består. Ny servertest dækker begge deltagere, CORS, hurtigtekst/fri tekst/lyddata, adgang, udfordringer, begge varianter, ekstra kortstraf og vinderregler.
- **Chromium/simuleret:** online med to og seks isolerede browserprofiler, størrelser 320×740, 390×844, 768×1024, 1024×768, 844×390 og 1280×800. Worker-logik via simuleret transport, simuleret mikrofon/afspilning/deling, mail-link, kopiering/reservefelt, invitationslink, genindlæsning, lokale sprogvalg, straf og podium. Offlinekortspil ved 390×844, 844×390 og 1280×800; træk, tryk, udfordringer og CPU består.
- **Cloudflare:** lokal Wrangler dry-run består med GAME_ROOM og eksplicit APP_ORIGIN. Eksisterende bindinger og migrationsfil er uændrede. Konfigurationens navn er `aeselklog-online-pilot`, mens den oplyste liveadresse bruger `aeselklog-online`; følg installationsvejledningens eksplicitte `--name`.
- **Ikke bekræftet:** faktisk deployment på Cloudflare, live WebSocket på flere fysiske enheder, rigtig deling til Beskeder/Messenger, mailapp, rigtig mikrofon/lydafspilning på iPhone, installeret iPhone-PWA eller live ElevenLabs.
- Ingen lydfiler genoprettet eller ændret; ingen konto-/nøglefiler i pakken.

## Åbent før v1.0
1. iPhone-PWA-test efter upload (se `TESTPLAN.md`).
2. Familietest: kortspilsregler, CPU-tempo, hvor ofte fejl opdages, touch-træk på små skærme, sværhedsgrad.
3. Trykklare fysiske kort (1–20, 41–60, 61–80, 81–100), æske, bagsider og regelbog. 21–40 og æselkort findes som prototyper. Afstem appens faste A3-specialfelter med den trykte plade.
4. Tilgængelighed (VoiceOver, stor tekst), sikkerhed, rettigheder til billeder og lyd (musik: se `MUSIC-LICENSES.md`).
5. Ryd op: `OPDATERING-v0.9.31.md` er forældet og kan slettes.

## Næste skridt
1. Installér filerne fra v0.9.47-pakken efter INSTALLATION-v0.9.47.md; Commit og Push origin via GitHub Desktop.
2. Deploy Worker særskilt efter aftale til den eksisterende Worker, og kontrollér GAME_ROOM og APP_ORIGIN først.
3. Gennemfør tjeklisten med to fysiske enheder: chat, rigtig mikrofon/afspilning, sprog, udfordringer, musik og F5. Notér resultater her.
4. Fortsæt iPhone- og familietest fra TESTPLAN.md.

## Idéer (ikke besluttet)
Fra tidligere:
- Kort vinderfanfare (The Reel Winner, ca. 5 s) efter sejr.
- OGG-udgave af Children's March hvis MP3-gabet i loopet høres på iPhone.
- Flere musiknumre, playliste/shuffle; mere varierede CPU-replikker uden at bruge ElevenLabs-credits.
- Fysisk kortspilsassistent (tur og straf, uden at erstatte kortene).
- Forældrerapport som frivillig lokal eksport.
- Justerbar CPU-sværhedsgrad.
- Talkort: tilfældig rækkefølge, quiz, filtre (primtal, lige/ulige).
Nye forslag fra gennemgangen 18. oktober:
- Quiz i Talkort: "Hvilket tal er det?" med lyd og tre kort (bruger de eksisterende MP3'er).
- Daglig mini-udfordring (5 tal) med lokal æsel-stjerne.
- Stor-tekst-tilstand og dyslexi-venlig skrift.
- Vis størrelse (ca. 11 MB) før "Hent alle 500 talelyde", og hent kun valgt talområde som standard.
- Opdel `app.js` (1300+ linjer) i moduler; skriv tests der afprøver adfærd frem for at søge i kildekode.

## Faste regler
Se `AGENTS.md`.
