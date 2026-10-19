# ÆselKlog – hvor er vi nu

**Version:** 0.9.60 (lokalt valideret opdateringspakke, 19. oktober 2026; ikke publiceret). Opdateres ved hver release sammen med `CHANGELOG.md`.

## Hvad er det?
Børnevenligt talspil som PWA (GitHub Pages, repo `driftportal-platform/aeselklog-talstien`) med tre selvstændige dele og frivillig matematik:
- **Talstien** – brætspil 1–100, digital eller fysisk A3-plade, op til 6 spillere + CPU-æsel, specialfelter, valgfri læring med forældreoversigt.
- **Kortspil** – fem talområder, 1–6 personer + CPU-æsel, frie træk, fejl udfordres med æselkortet.
- **Talkort** – ét kort ad gangen med lige/ulige, tiere/enere, primtal, sprogvalg, Auto og udtaletræning.
Lyd: 500 gemte MP3-tal (fem stemmer), valgfri baggrundsmusik, ElevenLabs kun via Cloudflare Worker. Alt gemmes lokalt, ingen konti.

## Status
- v0.9.60 ændrer online-regler efter brugerens seneste instruktion: ingen pauser og ingen tidsstyret midterkorrektion. Seneste placering vises og kan udfordres frem til næste placering; almindelig kortvending bevarer den. Fejl kan fortrydes efter en mellemliggende vending, mens chat, prik og kortregnskab bevares.
- Rangering: æselkort, talkort, færdigrækkefølge. Det ene æselkort giver sidstepladsen, selv om indehaveren er færdig. Offline-regler er ikke ændret.
- Kompakte felter, højst tre spillere pr. række, 4–6 under første række. Antal i alt og æselkort vises; bunkenavne er kun adgangsnavne. Sidste åbne kort kan beholdes, mens turen gives videre, og får normal bunkevending igen efter modtagelse af flere kort.
- Æselknappen kan altid bruges i rummet. Hvert autentificeret tryk giver separat lydsignal til alle og udfordrer kun et aktuelt udspil fra en anden. Forsinket/stale kort-ID giver ikke straf på et andet udspil. Lokal lyd fra bevares. Rigtig iPhone-afspilning mangler.
- Udgangspunkt main `2a248872750f2114e66d79220499c63aef773335` (v0.9.59). 47/47 Node-tests; relevante browserkontroller og Worker dry-run består. Begge onlineindgange opdateret; ny Worker-deployment kræves. Ikke publiceret herfra.
- v0.9.59: Dansk – æselstemme er tilføjet i onlinefeltet Sprog og stemme. De eksisterende 100 tal i audio/numbers/donkey bruges uden nye lydfiler eller netværks-TTS.
- Valg, kortvending, gentagelse, lokal lagring/genindlæsning og uafhængigt engelsk valg på anden enhed er kontrolleret i begge onlineindgange. 46/46 Node-tests består. Afspilning er simuleret; rigtig iPhone ikke prøvet.
- Udgangspunkt er main `247b8cab25f9b87c2f6e4220b150f726a49e7c56` (v0.9.58). Denne pakke ændrer kun hjemmesiden; ingen ny Worker-deployment nødvendig. Ikke publiceret herfra.
- v0.9.58: 3 sekunder i midten og 2 sekunder ved modspiller. Dette erstatter den tidligere 5-sekunders midterpause. Fejlplacering, manuel udfordring, overset midterfejls retur og kortregnskab er bevaret.
- 46/46 tests samt server- og browserkontrol af begge frister består. Worker dry-run består. Ingen fysisk iPhone/iPad-test eller publicering herfra. Pakken indeholder tidligere rettelser siden main `54bee3832bc7a330294979f4f92c174a316c8b3a`.
- v0.9.57: pausen ved kort til modstander er 2 sekunder; i midten stadig 5 sekunder. Serverfrister, nedtælling, æselknap, kortregnskab og automatisk retur af overset midterfejl er bevaret.
- Reserveopdatering uden liveforbindelse og under pause kører hurtigere. Ny browserkontrol uden liveforbindelse ser modtagerens pause automatisk og kan udfordre. Serverkontrol af 1.999/2.000 ms og fortsat 5.000 ms i midten. 46/46 tests består samt relevante browserkontroller og Worker dry-run.
- Pakken bygger fortsat på main `54bee3832bc7a330294979f4f92c174a316c8b3a` og indeholder alle efterfølgende rettelser. Ikke publiceret herfra. Fysisk iPhone/iPad er ikke prøvet.
- v0.9.56 erstatter v0.9.55: fejl i midten skal kunne opdages manuelt. Fem sekunders pause efter placering hos modstander eller i midten. Nye spilhandlinger er blokeret servermæssigt; udfordring og afslutning er tilladt. Nedtælling/æselknap vises hos klienterne.
- Ved opdaget fejl: eksisterende rollback og æsel-/ekstrastraf. Ved overset fejl i midten: automatisk rollback til den oprindelige kilde/tur uden straf. Korrekte kort bliver, og uopdagede modstanderfejl accepteres som før. Ingen nye talkort eller blanding.
- Pausen gemmes i rumstatus og afsluttes via Durable Object-alarm eller næste forespørgsel. Seriel behandling, idempotent udløb, genopstart, sen udfordring, slutkort og afsluttet rum er kontrolleret. Sejr udsættes til pauseudløb.
- 46/46 Node-tests og relevante online-browserkontroller består; simuleret Worker-transport/lyd/touch, ikke fysiske telefoner. Worker dry-run består. Udgangspunkt fortsat main `54bee3832bc7a330294979f4f92c174a316c8b3a` (v0.9.53), så kortregnskab og øvrige efterfølgende rettelser er inkluderet. Ikke deployet.
- v0.9.55 ændrer online-reglen efter brugerens præcisering: midterbunker accepterer kun fortløbende kort fra talområdets første til sidste tal, højst én række pr. kortsæt. Forkerte forsøg bevarer kort/kilde. Dette erstatter tidligere fri placering i online-midten; øvrige mål er uændrede.
- Korrekt kort på enhver passende række er gyldigt. Gammel ugyldig række kan ikke udvides; nyt rum anbefales efter opdateringen, ingen automatisk omfordeling. Kortregnskab og beskyttelse fra v0.9.54 følger med.
- Udgangspunkt GitHub main er fortsat `54bee3832bc7a330294979f4f92c174a316c8b3a` (v0.9.53). Pakken indeholder derfor også v0.9.54. 46/46 tests og relevante browserkontroller; Worker dry-run. Ikke publiceret herfra.
- v0.9.54: tydelig opdeling mellem lukkede, vendt og åbne kort; I alt pr. spiller og samlet kortregnskab. Midterbunker har faktisk antal og Se-knap med alle allerede åbne kort. Ingen automatisk fejlretning.
- Serveren afviser at gemme handlinger, som ændrer talkortenes samlede multiset. Der skabes ikke erstatningskort. Regnskabstests og en billedlignende position dokumenterer, at topkort 79/63 ikke beviser rækkeindhold. Konkrete brugerdata kan ikke læses fra et billede; ingen bekræftet årsag til det rapporterede live-forløb.
- Udgangspunkt v0.9.54: GitHub main `54bee3832bc7a330294979f4f92c174a316c8b3a` (v0.9.53). 46/46 Node-tests; simuleret browserkontrol og Worker dry-run. Ikke publiceret herfra.
- v0.9.53: tom lukket bunke viser en eksplicit Vend åben bunke-handling. Denne vender kun bunken; et nyt tryk vender et kort. Pending skal placeres først. Kortorden bevares; ingen nye kort eller blanding. Nye klienter kræver manuel vending, gamle klienters flip-API er bevaret for kompatibilitet.
- Uændrede statusopdateringer genopbygger ikke kortenes DOM, så ventetid og fingertræk over polling bevarer kortet. v0.9.52 er inkluderet i pakken, da GitHub main stadig er `36cac3bf335a777c11ad462b7717a4221ec40f46` (v0.9.51). Ikke publiceret herfra.
- v0.9.52: større chat med nyeste beskeder øverst og sammenfoldelige hurtigbeskeder. Polling bevarer læsepositionen ved uændret historik.
- Musik pause under mikrofonanmodning/optagelse, også ved periodiske opdateringer. Genoptages med samme valg efter mikrofonfrigivelse. Rigtig iPhone-lydrouting er ikke afprøvet.
- Prik ved tryk på modspillers navn; deres eget felt markeres på deres enhed med afsenderbesked. Auth/gyldige mål/tresekunders mellemrum kontrolleres af Worker. Kort, tur og udfordringsgrundlag ændres ikke; prik bevares ved udfordring.
- Udgangspunkt v0.9.52: GitHub main `36cac3bf335a777c11ad462b7717a4221ec40f46`. Ikke deployet herfra. 46/46 Node-tests og simulerede browserkontroller består.
- v0.9.51: kompakte spillerkort med midterbunker direkte nedenunder; vandret rulning ved mange spillere. Tandhjul åbner indstillinger, invitationer, lyd og afslutning. Chat som rundt ikon med ulæste beskeder og et vindue, der kan lukkes igen.
- Fri tekst, optagelser og lydfiler uden samtykkekrav, beskedventetid eller 10-sekundersgrænse. Teknisk lydfilgrænse 1 MiB. Klip opbevares separat, hentes med spilleradgang og ryddes ved udløb/afslutning.
- Æsellyd via Web Audio ved faktisk straf, én gang pr. deltager; prøveknap og manuel aktivering ved browserblokering. Automatisk kontrol simulerer afspilning på tre enheder; fysisk iPhone/iPad mangler.
- Udgangspunkt for v0.9.51: GitHub main `78176e2cd8f6f115f3bdd943b9f5e04bbbd439e7`. Begge onlineindgange opdateret. Ingen deployment udført.
- v0.9.50: opretteren kan afslutte rummet for alle med bekræftelse. Afsluttet status gemmes på serveren; sockets lukkes, sessioner glemmes, polling/genopkobling og lyd stoppes. Chat/lydbeskeder i rummet ryddes. Alle kan vælge Opret nyt spil og får en ny rumkode.
- Adgang, afslutning i ventende/aktivt/færdigt spil, gentagne anmodninger, sene tilmeldinger og forbindelseslukning er testet. Ny browserkontrol dækker ny oprettelse og F5 uden tilbagevenden til det afsluttede rum.
- Udgangspunkt for v0.9.50: GitHub main `cb0bb4a92fffc1bb5856f19cf22360ae90b56726`.
- v0.9.49: vend på egen lukkede bunke, flyt selv til egen/modspillers åbne bunke eller midten. Egen åbne bunke sender turen videre; modspiller/midte lader spilleren fortsætte. Afslut tur-knappen er fjernet. Dette erstatter kortflowet fra v0.9.48.
- Fra v0.9.51 ligger indstillinger bag et tandhjul; æselknappen er rund og sidder ved spillerkortene.
- Æsellyd bruger den eksisterende donkey-bray.wav ved faktisk tildelt æselkort. Lokal Æsellyd til/fra findes under Lyd og musik. Hændelsesnummer sikrer én afspilning pr. ny straf, uden gentagelse ved polling eller F5. Browserkontrol simulerer lydafspilning; fysisk iPhone/iPad mangler.
- Udgangspunkt for denne pakke: GitHub main `265c1444cb5c9201d4d2e1bc838d199a573e5c83`.
- v0.9.47 tilføjer valgfri start efter 60 sekunder med mindst to tilmeldte. Kun opretteren kan starte; tiden regnes på serveren fra oprettelse og nulstilles ikke ved F5. Ledige pladser lukkes ved start; kort og chattilsagn følger de faktiske deltagere. Ingen automatisk start ved tidsgrænsen.
- Nedtælling, opretteradgang, præcis tidsgrænse, samtidig tilmelding/start og genopkobling er testet.
- Udgangspunkt for v0.9.46: GitHub main `1ffebc1ab0c8779d175dddaef2f375637176a60c`.
- Nyt: 2–6 online-spillere, 1–5 kortsæt, ventelobby indtil alle er med, så lige uddeling som muligt, turrækkefølge, færdige/tilbagevendende spillere og podium med tre medaljepladser.
- Nyt design til online opsætning og spillebord med eksisterende æselgrafik og appens farver. Åbne bunker kan modtage kort direkte. Den almindelige appforside er uændret bortset fra versionsmærket.
- Invitationer: native deling, mailkladde og kopiering. Offentligt rumlink udfylder kode uden at dele spillerens secret. Gæster får en enkel deltag-side; et gammelt gemt rum overtager ikke en ny invitation.
- Chat navngiver afsenderen; fri tekst/lyd er altid tilgængelig fra v0.9.51. Samtidige tilmeldinger er testet.
- Onlinefejl rettet: CORS/chat, MIME-type på lydklip, WebSocket-videresendelse, oplæsning af alle vendte kort, synligt æselkort, gentag tal, udfordringer uden tab af nyere chat eller opdateringsnummer. Begge onlineindgange er opdateret.
- **Automatisk:** 46/46 Node-tests består. Ny servertest dækker begge deltagere, CORS, hurtigtekst/fri tekst/lyddata, adgang, udfordringer, begge varianter, ekstra kortstraf og vinderregler.
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
1. Installér filerne fra v0.9.50-pakken efter INSTALLATION-v0.9.50.md; Commit og Push origin via GitHub Desktop.
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
