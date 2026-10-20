# ÆselKlog – regler for udvikling

Gælder både mennesker og AI-assistenter. Hold denne fil kort og kun med regler, der gælder permanent. Versionshistorik hører til i `CHANGELOG.md`, status og åbne punkter i `PROJEKTSTATUS.md`.

## Arbejdsgang
1. Start fra seneste GitHub `main`; ældre ZIP-filer er kun reference. Læs `PROJEKTSTATUS.md` og denne fil.
2. Kør `npm test` (alle Node-tests) og `node --check` på ændrede JS-filer. Kør de relevante `tests/*.py` (Playwright) hvis UI ændres.
3. Ved hver release: hæv `VERSION` i `sw.js` og versionsmærket (`PRØVEVERSION x.y.z`) i `index.html` (en test kræver at de er ens), tilføj en post i `CHANGELOG.md` og opdatér `PROJEKTSTATUS.md`.
4. Skeln altid mellem det, der er testet automatisk/simuleret, og det, der er prøvet på en rigtig iPhone eller med rigtig ElevenLabs. Påstå aldrig det sidste uden en faktisk prøve.
5. Upload alle filer sammen; slet ikke `audio/` og `music/`. Versionsspecifikke INSTALLATION-/UPLOAD-vejledninger, logs (`*.log`), byggeoutput (fx Wrangler dry-run), skærmbilleder og engangs-patchfiler hører ikke hjemme i roden; læg dem i `docs/arkiv/` eller lad være med at committe dem.
6. `.github/` er en skjult mappe og bliver ofte droppet ved upload via GitHubs webgrænseflade. Kontrollér efter upload at `.github/workflows/test.yml` findes.

## Produktregler
- Matematik er altid frivillig. Den godkendte forside (`home-fullscreen.webp`, `home-ui.js`) ændres ikke uden eksplicit godkendelse.
- Talstien, Kortspil og Talkort er selvstændige. Gem aldrig det ene spils data i det andets nøgle.
- Fysisk A3: faste specialfelter (`A.FIELDS`) skal stemme med det trykte bræt. Digitalt bræt: ny tilfældig fordeling pr. spil; gamle gemte spil beholder deres.
- Ingen action-kædereaktioner; højst ét ekstra Gulerod-kast pr. tur.

## Fælles ikoner
- Brug assets/icons via game-icons.js og assets/images til fælles billeder. Tilføj nye filer til sw.js CORE. Navne/oversigt: assets/README.md. Spillernavne og chatindhold må ikke omformes til UI-ikoner.

## Talstien online
- Online-brættets serverregler i `boardgame-engine.js` genbruger `actions.js`, `engine.js` og `adaptive.js`. Ændr ikke offline `app.js` for online-regler. Rumtypen skal bevares ved invitation og genopkobling. 2–6 mennesker, ingen online-CPU. Offlineprofiler/gemninger uploades ikke.

## Kortspil
- Online: vendte kort på den lukkede bunke er synlige for alle via players[].revealed; kun ejeren på tur må flytte dem. Resterende lukkede kort må aldrig offentliggøres. Korttal må ikke brydes mellem cifre.
- Fem talområder, fem kort af hvert tal. En ny midterrække kan kun starte med områdets laveste tal.
- Online fra v0.9.60: nul sekunders pause ved alle placeringer. Seneste udspil forbliver synligt/udfordringsbart, indtil næste kort placeres; kortvending og genvending udskifter ikke udspillet. Fejl i midten bliver liggende indtil udfordring. Ingen tidsstyret automatisk rettelse. Højst én midterrække pr. kortsæt.
- Onlineplacering: færrest æselkort først blandt alle, så færrest talkort og færdigrækkefølge. Ved Send æslet videre er indehaveren af det ene æselkort sidst. Et sidste åbent talkort kan beholdes med turen videre uden genvending; ved flere kort bruges almindelig bunkevending.
- Hvert tryk på online-æselknappen giver et lydsignal til alle enheder, også afsenderen, også uden en mulig straf. Lokal Æsellyd fra bevares. En fejl kan kun straffes én gang; et forældet udspils-ID må ikke ramme en ny spiller.
- Øvrig fri placering: forkerte træk forhindres ikke på forhånd. Et tryk på æselkortet udfordrer, fortryder kun det seneste træk og giver straf. Et korrekt træk straffes ikke.
- CPU-æslet bruger kun lokal regelkode (ingen AI-kald): skal spille sit åbne kort før det vender, opdager andres fejl med ca. 72 %, begår selv fejl i ca. 7 % af valg med mulige ugyldige mål. Justér først efter familietest.

## Gemte data og privatliv
- Lagernøgler må ikke ændres uden migrering: `aeselklog-igangvaerende-v1` (Talstien, schema 1), `aeselklog-kortspil-v1`, `aeselklog-laereprofiler-v1`. Gamle gemninger skal fortsat kunne læses.
- Alt er lokalt; ingen automatisk cloud-upload af profiler, navne eller lyd. Intet fritekst eller børnenavne i permanent TTS-cache.
- Ingen API-nøgler i GitHub. ElevenLabs-nøglen ligger kun som Cloudflare Secret. `ORIGINAL_VOICE_ID` i `cpuvoice.js` er et offentligt stemme-ID, ikke en nøgle, og må kun vælges automatisk når Cloudflare `/voices` godkender det. Et eksplicit brugervalg bevares altid.

## Lyd
- Kortspil og Talkort bruger udelukkende de 500 gemte MP3'er i `audio/numbers/` (aldrig ElevenLabs eller telefonstemme som reserve). Talstien kan falde tilbage til AI-/telefonstemme.
- Musik er valgfri, slukket som standard, spiller kun i spilvisninger, dæmpes under tale og fungerer offline. Licenser står i `MUSIC-LICENSES.md`.
- MP3-svar fra service workeren skal kunne tage `Range` (HTTP 206), da Safari kræver det.

## Service worker (`sw.js`)
- Cachenavnet udledes af `VERSION`. Ryd kun caches med præfikset `aeselklog-talstien-`; lydcachen `aeselklog-number-audio-v1` skal bevares ved opdateringer.
- Klon svar (`response.clone()`) før asynkron `cache.put`. Cache aldrig Cloudflare-/ElevenLabs-svar.
- Kode hentes netværk-først med timeout (`NETWORK_TIMEOUT_MS`); billeder og lyd er cache-first. Nye filer, som appen skal bruge offline, skal føjes til `CORE`.
