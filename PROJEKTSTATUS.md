# ÆselKlog – hvor er vi nu

**Version:** 0.9.36 (prøveversion, 18. oktober 2026). Opdateres ved hver release sammen med `CHANGELOG.md`.

## Hvad er det?
Børnevenligt talspil som PWA (GitHub Pages, repo `driftportal-platform/aeselklog-talstien`) med tre selvstændige dele og frivillig matematik:
- **Talstien** – brætspil 1–100, digital eller fysisk A3-plade, op til 6 spillere + CPU-æsel, specialfelter, valgfri læring med forældreoversigt.
- **Kortspil** – fem talområder, 1–6 personer + CPU-æsel, frie træk, fejl udfordres med æselkortet.
- **Talkort** – ét kort ad gangen med lige/ulige, tiere/enere, primtal, sprogvalg, Auto og udtaletræning.
Lyd: 500 gemte MP3-tal (fem stemmer), valgfri baggrundsmusik, ElevenLabs kun via Cloudflare Worker. Alt gemmes lokalt, ingen konti.

## Status
- **Automatisk:** 31 af 31 Node-tests består (`npm test`, kører også i GitHub Actions). Røgtest i Chromium: appen indlæses, service worker aktiveres, ingen sidefejl.
- **Ikke kørt i v0.9.36:** de Python/Playwright-browsertests i `tests/*.py` (de kører ikke i CI).
- **Aldrig bekræftet på rigtigt udstyr:** installeret iPhone-PWA (offline MP3 med Range, autoplay, lydstyrke, SW-opdatering, mikrofon), live ElevenLabs og Cloudflare `/voices`, VoiceOver, familietest.

## Åbent før v1.0
1. iPhone-PWA-test efter upload (se `TESTPLAN.md`).
2. Familietest: kortspilsregler, CPU-tempo, hvor ofte fejl opdages, touch-træk på små skærme, sværhedsgrad.
3. Trykklare fysiske kort (1–20, 41–60, 61–80, 81–100), æske, bagsider og regelbog. 21–40 og æselkort findes som prototyper. Afstem appens faste A3-specialfelter med den trykte plade.
4. Tilgængelighed (VoiceOver, stor tekst), sikkerhed, rettigheder til billeder og lyd (musik: se `MUSIC-LICENSES.md`).
5. Ryd op: `OPDATERING-v0.9.31.md` er forældet og kan slettes.

## Næste skridt
1. Upload v0.9.36. Ved senere releaser skal `sw.js` `VERSION` og forsidens versionsmærke hæves sammen (en test fanger det).
2. Gennemfør iPhone-tjeklisten i `TESTPLAN.md` og notér konkrete fejl her.
3. Justér CPU (72 % opdagelse, ca. 7 % egne fejl) først efter familietest.

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
