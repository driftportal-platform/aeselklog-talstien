# ÆselKlog – changelog

Nyeste øverst. Én kort post pr. version. Detaljer, testresultater og filoversigter for ældre versioner
findes i `docs/arkiv/`. Versioner uden post (fx 0.9.8 udover lydcache, 0.9.21, 0.9.26) var ikke
dokumenteret separat i de gamle noter.

## v0.9.50 – afslut online-spillet og opret et nyt (19. oktober 2026)
- Rumopretteren kan vælge Afslut spil for alle i rum-menuen og bekræfte. Virker i ventelobby, under spillet og efter sejr.
- Serveren gemmer rummet som afsluttet, sender slutstatus til alle og lukker WebSocket-forbindelserne. Gamle invitationer, træk og chat kan ikke genåbne rummet. Rumchat/lydbeskeder ryddes ved afslutning.
- Alle får en afslutningsside med Opret nyt spil. Gemte sessioner fjernes, genopkobling/polling stoppes, og tale/musik afbrydes. Et nyt spil får en ny rumkode. Lokale lydindstillinger bevares.
- Forsinkede svar fra det gamle spil kan ikke genåbne det efter afslutning eller overtage et nyt rum. Forlad på denne enhed er stadig kun lokal.
- 40/40 Node-tests; ny Chromium-test dækker annullér/bekræft, afslutning hos begge spillere, glemt gammel session, ny rumkode og F5. Øvrige online-, offline-/CPU-browsertests og Worker dry-run består. Ikke deployet herfra.

## v0.9.49 – vend på lukket bunke og æsellyd (19. oktober 2026)
- Rettet efter præcisering: kortet vendes oven på egen lukkede bunke og bliver dér, indtil spilleren flytter det. Den åbne bunke ændres først ved eget valg.
- Flytning til egen åbne bunke afslutter turen automatisk. Flytning til modspiller/midte lader spilleren fortsætte. Ingen Afslut tur-knap i onlinevisningen.
- Eksisterende sammenfoldelige paneler, æselknap ved spillerkortene og træk/tryk er bevaret.
- Den eksisterende donkey-bray.wav afspilles ved faktisk tildelt æselstraf, også Send æslet videre. Korrekte udfordringer eller en tom æselkortpulje giver ingen lyd. Nyt hændelsesnummer hindrer gentagelser ved polling/F5. Æsellyd kan slås til/fra pr. enhed, uafhængigt af talestemmen.
- 39/39 Node-tests; Chromium tester touch fra vendt kort på lukket bunke til midte, musetræk til modspiller, tur ved egen åben bunke, lydhændelse én gang pr. enhed, lokal mute og ingen gentaget lyd efter F5. Online med to/seks spillere, 60-sekundersstart, offline/CPU og Worker dry-run består. Afspilning er simuleret; rigtig iPhone/iPad skal prøves efter upload.

## v0.9.48 – kompakt spillebord og kort direkte i åben bunke (19. oktober 2026)
- Rum/invitationer, lyd og chat kan foldes ud/sammen. Under spil starter de sammenfoldet; rumoplysninger er åbne i ventelobbyen. Turbesked og 60-sekundersstart forbliver synlige. Åbne/lukkede paneler bevares under løbende statusopdateringer.
- Æselknap og gentag tal sidder lige under spillerkortene, før midterrækkerne. Spillets overskrift fylder mindre.
- Et tryk på egen lukkede bunke vender nu kortet direkte til egen åbne bunke. Turen fortsætter, mens kort flyttes til midten eller andre spillere. “Afslut tur” sender turen videre.
- Oversete placeringer ved næste vending eller afsluttet tur kan udfordres. Serveren fortryder kun den seneste handling og giver valgt straf. Tidligere pending-kort og ældre klienthandlinger kan fortsat læses.
- Pointer Events giver træk med finger, mus og pen, inklusive rulning nær skærmkanten. Tryk på kort og derefter mål samt tastatur er bevaret. Chat viser antal beskeder, også sammenfoldet.
- 38/38 Node-tests; Chromium med to og seks profiler, rigtig simuleret touch-input og musetræk, foldning, invitationer, lyd, podium og 60-sekundersstart. Offline-/CPU-browsertests og Worker dry-run består. Ingen fysisk iPhone-test eller deployment udført herfra.

## v0.9.47 – start uden de sidste inviterede (19. oktober 2026)
- Efter 60 sekunder fra rummets oprettelse kan opretteren starte med de tilmeldte, hvis mindst to er med. Ingen automatisk start ved tidsgrænsen; I kan fortsætte med at vente.
- Nedtælling vises i rummet og bevares efter genindlæsning. Serveren kontrollerer tid, opretterens adgang og minimumsantal.
- Når opretteren starter, lukkes de ledige pladser, kortene fordeles blandt deltagerne, og chatgodkendelser tilpasses dem, der er med. Sene invitationer kan ikke ændre et startet spil.
- Normal start, når alle valgte deltagere er med, er bevaret. Samtidig sidste tilmelding/startknap kan ikke uddele kort to gange.
- 37/37 Node-tests, Chromium med to/seks profiler, ny nedtællings-/starttest og eksisterende offline/CPU-browsertests består; Worker dry-run består. Ingen deployment udført herfra.

## v0.9.46 – flere spillere, hyggeligt spillebord og invitationer (19. oktober 2026)
- Online understøtter 2–6 spillere. Rumopretteren vælger antal; alle tilmelder sig med samme rumkode. Kortene uddeles, når rummet er fuldt, så lige som muligt.
- Turrækkefølge, nærmeste spiller til venstre, begge æselkortvarianter, ekstra kortstraf, færdige/tilbagevendende spillere og podium virker med flere deltagere. Gamle rum fortsætter som tospillerspil.
- Samtidige tilmeldinger og øvrige rumhandlinger behandles i rækkefølge, så pladser og kort ikke overskrives.
- Opret-siden og spillebordet har appens æselkort, varme farver, store knapper, farvede spillerfelter og et layout til mobil, iPad og pc. Åbne bunker er direkte mål for tryk og træk. Forsiden i den almindelige app er bevaret.
- Del invitation åbner enhedens delingsmenu, hvor tilgængelige apps vælges. Mail-knap åbner en mailkladde; invitationen kan også kopieres. Linket udfylder rumkoden og indeholder ingen spillerhemmelighed. Deling/afsendelse vælges af brugeren.
- Chat viser afsenderens navn og kræver samtykke fra alle til fri tekst/lyd.
- 36/36 Node-tests, online Chromium med to og seks isolerede profiler, størrelser fra 320 til 1280 px, simuleret deling/lyd, samt eksisterende offline-/CPU-browsertests består. Worker dry-run består. Ingen deployment eller test på fysiske enheder udført herfra.

## v0.9.45 – vælg 1–5 kortsæt online (19. oktober 2026)
- Rumopretteren vælger 1–5 kortsæt: 20–100 talkort i alt, 10–50 til hver spiller. Standard er fortsat fem sæt.
- Serveren validerer valget, gemmer det i rummet og bruger det ved kortuddeling. Begge spillere ser rummets antal sæt og kort.
- Ældre rum/klienter uden feltet bruger fem sæt. Igangværende spil ændres ikke.
- 35 Node-tests, online Chromium mobil/desktop samt eksisterende offline/CPU-browsertests. Alle 25 kombinationer af talområde/kortsæt dækkes; Wrangler dry-run består. Ikke deployet herfra.

## v0.9.44 – online chat, talelyd og æselkort (19. oktober 2026)
- CORS tillader `x-player-secret`; lydklip beholder deres MIME-type, og WebSocket-upgrades videresendes intakte.
- Alle vendte kort vises nu som ventende kort, så tale, frivillig placering og udfordringer følger offlinekortspillet. Et overset åbent kort kan udfordres.
- Tydelig æselkort-knap, gentag talelyd, eksisterende danske/engelske/tyske/spanske MP3'er, tosproget vend/placér-oplæsning og dæmpning af musik under tale.
- Begge onlineindgange bruger samme spilflade. Sejrspodie viser navne, placeringer og æselkort. Lokale lydvalg og gemt session bevares.
- Udfordringer bevarer nyere chat, samtykke og stigende opdateringsnummer. Serveren validerer kortkilde og mål før flytning.
- Chat opdateres også uden WebSocket. Fejl ved afsendelse bevarer tekst/lyd til nyt forsøg; optagelsestimer afsluttes korrekt.
- 34/34 Node-tests; Chromium online med to isolerede enheder og simuleret transport/lyd; offlinekortspil i tre skærmstørrelser samt CPU/udfordringer. Wrangler dry-run består. Ingen live-deployment eller fysisk iPhone-test.
- Windows-linjeskift accepteres i flowtesten; ældre browserfixtures bruger fejl på eksisterende bunker i stedet for en forbudt rækkestart.

## v0.9.36 – stabilitet, ikoner og dokumentation (18. oktober 2026)
- Tests: 7 fejlende Node-tests rettet (de fleste testede forældet kode); alle 31 består. Dobbelt `board.test.js` i roden fjernet.
- Service worker: kode hentes netværk-først med 3 sekunders timeout og falder tilbage til cachen. Cachenavn udledes af `VERSION`. Ny test dækker hængende net.
- PNG-ikoner (192, 512, maskable 512, apple-touch-icon 180) i manifest, `index.html` og precache.
- CI: GitHub Actions kører `npm test` (`tests/run-all.js`). Ny test sikrer at `sw.js` `VERSION` matcher versionen på forsiden.
- Dokumentation samlet i `PROJEKTSTATUS.md`, `CHANGELOG.md`, `AGENTS.md`, `TESTPLAN.md`; de gamle seks filer er flyttet til `docs/arkiv/`.

## v0.9.35 – kortoplysninger i kø (17. oktober 2026)
- Kortoplysninger køes uden overlap; CPU kan ikke gennemføre ugyldige træk (skal spille sit åbne kort før det vender).

## v0.9.34 – kortspillets lyd (17. oktober 2026)
- Kortspil bruger kun gemte MP3-tal. Dansk ved vending, fremmedsprog ved placering. CPU trækker lovligt og får ikke strafkort.

## v0.9.33 – Talkort-træning (17. oktober 2026)
- Talkort: MP3-only, udtaletræning med mikrofon og automatisk gennemgang.

## v0.9.32 – kun gemte Talkort-stemmer
- Talkort afspiller kun `audio/numbers/`; manglende lyd giver fejlbesked i stedet for TTS/ElevenLabs.

## v0.9.31 – lydprofiler
- Brætspil, Kortspil og Talkort har hver sine lokale lydprofiler (sprog, oplæsning, musik, niveau) via ⚙️ Lyd.

## v0.9.30 – (17. oktober 2026)
- Korrekt æselkortbillede på Talkort, sekventiel Auto-oplæsning, faste MP3-stemmer i kortspil.

## v0.9.29 – Talkort: udtale, Auto og nulstil (17. oktober 2026)
- Valgfri lokal mikrofonoptagelse (kun i hukommelsen) og sammenligning med den gemte lyd; Auto med justerbar pause; Nulstil til 0; ÆselKlog-logoer på kortets hjørner.

## v0.9.28 – 500 talelyde (17. oktober 2026)
- 500 MP3'er (1–100 i fem stemmer). MP3 prioriteres over ElevenLabs. Separat Service Worker-cache der overlever opdateringer. Knap til at hente alle lydene. (v0.9.27: `lydproeve.html`-generatoren.)

## v0.9.25 – Talkort-stemmevalg (16. oktober 2026)
- Valg mellem Spilleleder og ÆselKlog til danske tal i Talkort.

## v0.9.24 – Talkort (16. oktober 2026)
- Tredje funktion: 100 talkort i fem farvezoner med lige/ulige, tiere/enere og primtal; Forrige/Læs igen/Næste og sprogvalg.

## v0.9.23 – taloplæsning og mobilknap (16. oktober 2026)
- Auto-tale kun ved vending i kortspil; 1,5 s pause mellem dansk og fremmedsprog; "Hør tallet igen" under spillerbunkerne.

## v0.9.22 – flersproget taloplæsning og midterrækker (16. oktober 2026)
- Dansk/engelsk/tysk/spansk og dansk + sprog. Tal udtales som ord.
- Rettelse: en ny midterrække kan kun starte med områdets laveste tal (1, 21, 41, 61, 81).

## v0.9.20 – taloplæsning i Kortspil
- Stemmen siger kortets tal i stedet for generiske vendinger.

## v0.9.19 – musik og original æselstemme (16. oktober 2026)
- Tre CC0-MP3-melodier (valgfri baggrundsmusik, slukket som standard, dæmpes under tale). Fælles CPU-stemme i begge spil med automatisk præference for den originale ÆselKlog-stemme når den er godkendt i Cloudflare.

## v0.9.18 – kompakt kortspil (16. oktober 2026)
- Kompakt kortbord, tryk/træk fra lukket bunke, fælles spillerleder- og CPU-stemmer, første udgave af valgfri musik.

## v0.9.17 – Kortspil mod Æslet (16. oktober 2026)
- 1–6 personer + CPU-æsel, frie korttræk uden forhåndsblokering, opdagede fejl udfordres med æselkortet (fortryder seneste træk + straf).

## v0.9.16 – spilvælger og seks spillere (16. oktober 2026)
- Tydelig spilvælger (Talstien/Kortspil), op til seks menneskespillere i Talstien + CPU.

## v0.9.15 – Kortspil (16. oktober 2026)
- Selvstændigt digitalt kortspil med fem talområder, klassisk (4/6/8 æselkort) og "send æslet videre"-variant.

## v0.9.14 – afslut-menu og fysisk A3 (16. oktober 2026)
- ⏻ Afslut (gem og afslut / afslut uden gem). Reel fysisk A3-spilleledervisning med faste specialfelter.

## v0.9.13 – tilfældige specialfelter (15. oktober 2026)
- Hvert nyt digitalt spil får egen fordeling af ni typer specialfelter; fem farvede roser. Gamle gemte spil beholder den faste fordeling.

## v0.9.12 – levende specialfelter (15. oktober 2026)
- Pop-up og effekter ved actionfelter (`actionfx.js`), respekterer reduceret bevægelse.

## v0.9.11 – forældreoversigt (15. oktober 2026)
- Lokal læringshistorik (maks. 96 opgaver pr. barn), kurver og sletning pr. barn.

## v0.9.10.1 / v0.9.10 – læring og variation (15. oktober 2026)
- "Hov hov!" bevares kun i 35 % af oplæsningerne. Fire uafhængige læringsniveauer pr. barn (talforståelse, plus, minus, tabeller; −2 til +2) med lokale profiler.

## v0.9.9 / v0.9.8 – lydcache og oprydning (15. oktober 2026)
- Lokal, stemmespecifik cache af faste, anonyme ElevenLabs-sætninger (15 MB / 70 klip). UI-oprydning på forsiden.

## v0.9.7 – offline og stemme-reserve (15. oktober 2026)
- CSS flyttet til `styles.css`; netværk-først SW med offline-fallback; AI-tale falder tilbage til telefonstemme ved timeout.

## v0.9.2 – v0.9.6 (14.–15. oktober 2026)
- Ny forside og enkel spilstart (0.9.2–0.9.3), godkendt fuldskærmsforside (0.9.5), kompakt "Fortsæt spil" (0.9.6).

## v0.9 / v0.9.1 (14. oktober 2026)
- Gem/fortsæt og adaptive opgaver; første prøve af sjov CPU-stemme.
