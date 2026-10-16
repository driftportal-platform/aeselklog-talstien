# ÆselKlog v0.9.19 – test af MP3, offline-cache og original CPU-stemme

**Samlet resultat:** 23 Node-tests og 18 Chromium-browserfiler bestået (mock-/simuleret tale). Den særskilte `pwa_offline_browser.py` blev ikke gennemført pga. blokering af lokal HTTP.

## Automatisk kontrol (16. oktober 2026)

- [x] `node --check` på appfiler samt alle `tests/*.test.js`.
- [x] `tests/music.test.js`: tre faktiske MP3-aktiver, opt-in, lydstyrke, gemte indstillinger, migrering af gamle musikvalg, dæmpning under oplæsning, stop i baggrunden og preview.
- [x] `tests/music_offline_range.test.js`: fuld MP3 og HTTP 206 `Range` direkte fra SW-cachen uden netværk, herunder suffix-range og 416 ved ugyldigt interval.
- [x] `tests/cpuvoice.test.js`: Automatisk foretrækker kun den godkendte originale ÆselKlog-stemme, manuel valgt stemme respekteres, og ukendte ID'er afvises.
- [x] `tests/original_voice_browser.py` med mockede /voices og /tts: standardstemme og manuelt CPU-override via fælles Indstillinger.
- [x] `tests/music_cards_browser.py`: kortspilsmenu, musikvalg, kompakt kortbord og CPU-ventetid i tre Chromium-skærmstørrelser (simuleret lyd).
- [x] `tests/pwa_cache.test.js`: v0.9.19-cache indeholder de tre MP3-filer, kun ÆselKlog-caches slettes, offline-fallback fungerer.
- [x] MP3-filerne er validt kodet og kan afkodes med ffmpeg/ffprobe. Ingen ekstra ElevenLabs-kald ved musik.
- [ ] **Lokalt server-hostet SW-installationsflow:** browseren i testmiljøet afviser localhost og `file://` (`ERR_BLOCKED_BY_ADMINISTRATOR`). Node-tests simulerer offlinecache. **Ikke** fysisk iPhone-test.

## Manuel prøvning efter GitHub-upload

- [ ] Kontrollér `PRØVEVERSION 0.9.19` og beholdt forside. Aktiver musik i Indstillinger; prøv alle tre MP3-lyde i Talstien og Kortspillet og skift lydstyrke.
- [ ] Efter første indlæsning online: sæt iPhone i flytilstand, luk PWA helt, genåbn, og prøv at spille alle tre melodier offline. Hvis PWA'en genindlæser for hurtigt, åbn først online og gentag.
- [ ] Slå oplæsning til og kontrollér at musikken dæmpes imens, at CPU stadig venter til talen er færdig, og at baggrundsskift stopper musikken.
- [ ] Indstillinger → CPU-æslets egen stemme: Automatisk skal bruge **ÆselKlog-original** når den vises på stemmelisten. Ændring til en anden godkendt stemme skal virke straks, også efter en mislykket prøve.
- [ ] Lad både Kortspil og Talstien bruge samme AI-stemmevalg. Prøv efter offline-genstart; kontrollér at ElevenLabs-brug/credits stemmer med forventet niveau.
- [ ] Sammenlign om `Children's March Theme` giver en hørbar loop-pause i MP3-format. Eventuel OGG-løsning for seamless loop gemmes til senere behov.

*Alle automatiske browsertests bruger mockede stemmer og kan ikke dokumentere ægte Safari/iOS eller produktions-ElevenLabs. Hele regressionpakken kontrolleres sammen med denne release.*

---

# ÆselKlog v0.9.18 – testplan: kompakte kort, stemmer, musik og SW

**Udført 16. oktober 2026:**

- [x] `node --check` for alle appmoduler.
- [x] **22 Node-tests**. Ny `music.test.js` kontrollerer 3 originale melodier, opt-in, lokal indstilling, skift mellem spiltyper, dæmpning og stop i baggrunden.
- [x] **17 Chromium-browsertests**. Ny `music_cards_browser.py` kontrollerer kompakt kortbord i 390×844/844×390/1280×800, vendt kort på lukket bunke, fri tap/træk, gemning af musikvalg, music-toggle og fortæller-/CPU-stemmer (simuleret).
- [x] Gamle `cardgame_browser.py` tilpasset til kortfladen uden stort `Dit kort`-panel; `cardgame_interaction_browser.py` gennemfører drag, indsigelse, CPU og gem/fortsæt uændret.
- [x] Regressioner for Talstien, CPU-lydroller, Hov hov-variation, stemmecache, fysisk A3, alle ni specialfelter, 6 + CPU, gem/fortsæt, voksen-timer og forældreoversigt.
- [x] `pwa_cache.test.js` inkluderer `music.js`, ny versionscache, offlineaktiver og cachebegrænsning. `response.clone()` sker nu før asynkron cachelagring.
- [ ] **Lokal Service Worker/PWA offline-installation:** Forsøgt med `python tests/pwa_offline_browser.py`, men Chromium svarede `net::ERR_BLOCKED_BY_ADMINISTRATOR` på `http://127.0.0.1`. Der er derfor **ikke** dokumenteret en rigtig SW-installation/offline-genstart i denne test.
- [ ] **Rigtig iPhone (WebKit/Safari/PWA), live ElevenLabs-credits og faktisk musiklyd:** Skal testes fysisk. Al browsertale er simuleret; ingen produktionskald eller credits under tests.

## Manuel tjekliste efter GitHub-upload

- [ ] iPhone PWA viser **PRØVEVERSION 0.9.18** og den godkendte forside 1:1.
- [ ] Kortspil: Tryk lukket bunke → se det vendte kort oven på bunken. Træk til midten, egen/andres åbne bunker; prøv også tap-kort/tap-mål. Ingen stor `Dit kort`-boks.
- [ ] Test Kortspil med 2–6 mennesker og solo med CPU; æselkort og opdaget fejl fortryder kun det forkerte træk; gem/fortsæt bevarer spillet.
- [ ] Vælg spilleleder og særskilt CPU-stemme under Stemme/lyd. Prøv at CPU taler med eget valg og først flytter videre, når oplæsningen er færdig. Kontrollér rigtige ElevenLabs-kreditter (faste udtryk skal genbruge cache).
- [ ] Musik er fra ved første install. Vælg **Gårdfest**, **Gulerodsdans**, **Rolig bondegård**, justér lydstyrke; prøv Musik til/fra i begge spil. Musikken må ikke overdøve tale, og den stopper ved Afslut eller app-baggrund.
- [ ] Genstart PWA, vælg offline, kontroller at app, kortspil, læring og de lokalt genererede melodier kan åbnes, og at version/cached filer opdateres korrekt uden at slette gemte spil.
- [ ] Test Safari/VoiceOver, touch-træk, orienteringsskift og kontroller ingen skjulte knapper eller fejl i konsollen.

---

# ÆselKlog v0.9.17 – CPU-kortspil, fri placering og kort-indsigelser

## Automatiske tests (16. oktober 2026)

- [x] **21 Node-tests** samt `node --check` af alle projekt- og testmoduler. Ny `tests/cardgame_interaction.test.js` tester én person + CPU, 6 + CPU, ukorrekte træk som bliver liggende (og oversete åbne kort), korrekt/ukorrekt udfordring, tilbagerulning af træk også efter turskift, æselkort, ekstra kortstraf og gamle gemninger.
- [x] **16 Chromium-browserfiler** inklusive `tests/cardgame_interaction_browser.py`. Ny browsertest i **390×844 touch**, **844×390** og **1280×800** tester tryk på kort, valgfri målbunke, rigtig drag-and-drop, ukorrekt placering, æselkort som fortryd/straffeknap, gem/fortsæt, CPU's solo-tur og CPU, der opdager en fejl.
- [x] Eksisterende tests: godkendt forside (seks skærmstørrelser med/uden gemning), valg mellem Talstien/Kortspil, seks personer + CPU i Talstien, fysisk A3, voksen-timer, tilfældige specialfelter, CPU-voice, AI-fallback, lokal lydcache, individuelt læringsniveau, forældreoversigt og sikre gemte spil.
- [x] `tests/pwa_cache.test.js`: v0.9.17 cache og alle JS/CSS-/offline-filer.
- [ ] **Rigtig iPhone-PWA i Safari/WebKit:** touch-træk med automatisk scroll mellem bunker, offline-installation/genstart, VoiceOver og kontrol af animation/scroll er ikke verificeret her.
- [ ] Reel ElevenLabs-produktionsopkobling er ikke prøvet i denne release. Browsertests benytter simulerede stemmer/lyd og kunstigt lager.

## Manuel test efter GitHub-upload

- [ ] **Solo:** Kortspil → Spil mod Æslet → 1 person → Start. Æslet skal selv spille, når det bliver dets tur.
- [ ] **Vend:** Tryk på den lukkede bunke i stedet for en traditionel vend-knap. Kontroller den vendte talkortværdi. Prøv både mobiltap og desktopklik.
- [ ] **Træk:** Flyt det vendte kort og toppen af din åbne bunke til midterrække og andres åbne bunker; prøv både træk og tryk-kort/tryk-bunke. Prøv at scrolle ned med kortet på en smal skærm.
- [ ] **Fejl:** Læg bevidst et forkert kort i midten. Appen må *ikke* afvise trækket med det samme. Tryk på æselkortet “Opdaget fejl!”. Kortet skal komme tilbage, og fejlspilleren skal få straf.
- [ ] **Uopdaget fejl:** Lad et forkert kort ligge, og fortsæt; kun seneste træk kan udfordres. Hvis Æslet er med, kan det opdage fejl, men ikke altid. Prøv også at udfordre et korrekt træk, som ikke skal give straf.
- [ ] **Æslets fejl:** Vent på at CPU forsøger et forkert træk i løbet af flere spil, og udfordr det med æselkortet. Kontrollér forskel på *Behold æslet* og *Send æslet videre*.
- [ ] **Gem/fortsæt:** Gem mens et kort er vendt og efter en foreløbig forkert placering, luk PWA og genoptag; træk/CPU/checkpoint og både talområder samt ekstra kortstraf skal være uændrede.
- [ ] **Eksisterende funktioner:** Talstien, CPU-stemme, lydcache og forældreoversigt er intakte; ingen nye ElevenLabs-kald i kortspillet.
- [ ] Lad børn og voksne teste, om det er sjovt at opdage modspillernes fejl, og om udfordringsknappen er tydelig nok.

---

# ÆselKlog v0.9.16 – spilvalg, seks spillere og gemning

## Automatiske tests (lokalt udviklingsmiljø, 16. oktober 2026)

- [x] `node --check` af alle JavaScript-appmoduler.
- [x] **20 Node-tests** inkl. nye `tests/mode_selector.test.js`: begge spilvalg som knapper, aktive ARIA-statusser, seks særskilte farver, 6 navngivne spillere + CPU med korrekt save/restore og afvisning af for mange deltagere.
- [x] `tests/mode_selector_browser.py` – 390×844, 844×390 og 1280×800: to klikbare spilkort uden overlap, skift mellem spil, korrekt adskilte indstillinger, seks navngivne spillere, CPU samt gem/fortsæt med syv deltagere.
- [x] **15 Chromium-browserregressioner** gennemført: begge spiltyper, fysisk/digital plade, gem/fortsæt, tilfældige specialfelter, alderssikker læring, voksen-timer, CPU-stemme, Hov hov-variation, lydcache, forældreoversigt samt seks spillere + CPU. Alt med simuleret tale.
- [ ] Fysisk iPhone-PWA, iOS Safari/WebKit/VoiceOver, ægte ElevenLabs og offline-genstart – kræver brugertest efter GitHub-upload. Ingen rigtige AI-kald foretages i browsertests.

**Testisolering:** `tests/persistence_browser.py` styrer tilfældige specialfelter væk fra de første landingsfelter i sin test, så den kan kontrollere save/resume og adaptiv fremgang uden at blive afbrudt af en tilfældig Gulerod/Byt/Super. `tests/random_actions_browser.py` og `tests/actionfx_browser.py` tester de virkelige specialfelter separat. Dette ændrer **kun test-fixturen**, ikke appens tilfældige bane.

## Manuel test efter upload

- [ ] På mobil: tryk Spil og se **Talstien** og **Kortspil** som store, tydelige valg. Kun den aktive er markeret.
- [ ] Åbn Kortspil, vælg Talstien igen og derefter Kortspil; kun relevante indstillinger og navne er synlige.
- [ ] Tilføj seks spillere i Talstien; **Tilføj spiller** skal være disabled ved seks. Hver brik har sin egen farve.
- [ ] Markér **Spil mod Æsel**, start med 6 + CPU, gem og genstart. Syv deltagere skal fortsat være synlige.
- [ ] Start kortspillet med 2–6 spillere; kontrol af eget gemt spil og strafvarianter.
- [ ] Gentag på installeret iPhone, også liggende og efter en offline-genstart; test tale, familietempo og behørig afslutning.

---

# ÆselKlog v0.9.15 – Kortspil med fem talområder

## Automatisk udført i lokalt testmiljø

- [x] `node --check` for projektets JavaScript og alle testfiler.
- [x] **19 Node-tests** inklusive `tests/cardgame.test.js` (100 kort pr. niveau, fem eksemplarer pr. tal, 2–6 spillere, to æselkortvarianter, ekstra straf, kortplacering og validering af ugyldige gemninger).
- [x] **14 Chromium-browsertests bestået** inklusive `tests/cardgame_browser.py`: Spil → Kortspil, valg mellem alle fem intervaller, start af kortspil 21–40 med tre spillere, lukkede/åbne bunker, korttræk, manuel straf, gem/fortsæt og den overdragelige ét-æsel-variant i 390×844, 844×390 og 1280×800.
- [x] Eksisterende Talstien-tests: godkendt forside, A3/afslut-menu, gem/fortsæt, randomiserede specialfelter, voksen-timer, CPU-stemme, AI-reserve, stemmecache, individuelle læringsprofiler og forældreoversigt.
- [x] `tests/pwa_cache.test.js`: nye `cardgame-engine.js` og `cardgame-ui.js` præcaches med version v0.9.15; gamle projekters caches berøres ikke.

**Grænse:** Browserregressionerne bruger Chromium med simuleret lyd/browserlager. Ingen reel ElevenLabs eller WebKit/Safari/iPhone-test. Den særskilte HTTP/Service Worker-installationstest kunne ikke gennemføres, da browseren i dette miljø blokerer `127.0.0.1` (`ERR_BLOCKED_BY_ADMINISTRATOR`).

## Manuel test efter upload

- [ ] Åbn Spil og kontrollér, at Talstien stadig kan startes som før; Kortspil-menuen findes ved siden af.
- [ ] Start kortspil i alle fem intervaller og kontrollér, at det laveste tal (1/21/41/61/81) kan begynde en midterstak.
- [ ] Prøv to spillere, tre spillere og evt. seks spillere på én enhed; børn skal forstå kortene og turenes placering.
- [ ] Prøv standard æselkort (4, 6 eller 8), overdragelse af ét æselkort og valgfrie ekstra kort fra andre.
- [ ] Gem et kortspil, luk PWA helt, genåbn og fortsæt. Bekræft, at en Talstien-gemning ikke ændres.
- [ ] Prøv helt offline efter første installation. Test også ElevenLabs, voksen-timer og specialfelter i Talstien efter opdateringen.
- [ ] Sammenlign digitale talkort med de trykte 21–40-kort og aftal evt. ændringer inden kortspillet får endelige produktionsregler.

---

# ÆselKlog v0.9.14 – testplan (16. oktober 2026)

## Automatiserede tests udført

- [x] `node --check` af alle projektets JavaScript-filer.
- [x] **18 Node-tests** (`tests/*.test.js`) inkl. PWA-cache, frivillig LEG, actionregler, lydcache, læring, profilsikkerhed og gamle gemte spil.
- [x] **13 Chromium-browsertests**: `physical_exit_browser.py`, `test_home_v092.py`, `test_home_v096.py`, `actionfx_browser.py`, `random_actions_browser.py`, `narration_browser.py`, `parent_overview_browser.py`, `subject_learning_browser.py`, `voice_cache_browser.py`, `voice_fallback_browser.py`, `cpu_voice_browser.py`, `persistence_browser.py`, `browser_smoke.py`.
- [x] Afslut-knap er klikbar og synlig øverst på stor og lille spilleplade (390×844, 844×390, 1280×800), med korrekt modal **Gem og afslut / Afslut uden at gemme / Fortsæt**.
- [x] Fysisk A3 åbner *uden* automatisk udvidet bræt og med vejledning/position; appen bruger fast `A.FIELDS`, digital mode bruger randomiserede specialfelter.
- [x] Fysisk spil gemmes/genoptages med samme felt og spillemåde; en digital kamp kan stadig startes og gemmes fra den udvidede plade.
- [x] CPU-æslets næste handling afventer lukning af Afslut-dialogen; voksen-timer stopper under dialog og genoptager korrekt.
- [x] HTML/CSS-forklaringen ved Stemme og lyd har ingen nummermarkør i testede skærmstørrelser.
- [ ] Ingen test på **rigtig iPhone/Safari-PWA**, faktisk A3-prototypetryk eller live ElevenLabs udført i denne release.

## Manuel afprøvning efter GitHub-upload

- [ ] Bekræft versionsmærket 0.9.14 i Spil/Indstillinger, og kontrollér uændret godkendt forside.
- [ ] Digital bane: Afslut-menuen øverst, prøv Gem og afslut / Fortsæt spil; prøv Afslut uden at gemme og se, at den aktuelle kamp forsvinder, men Topscore og forældreoversigt består.
- [ ] Prøv under voksenopgave med tidtager: lad Afslut-dialogen stå åben 10 sekunder, luk den og kontrollér, at tiden ikke blev brugt.
- [ ] Prøv på installeret iPhone, både stående og liggende, med VoiceOver og lyd tændt/slukket.
- [ ] Stemmeindstillinger skal have ren pil uden en lille "0." til venstre for boksen.
- [ ] Fysisk A3: Spilledervisning vises, ikke fuldskærmsbræt. Kast en fysisk terning, tryk øjnene i appen og flyt den rigtige brik til den position, appen viser. Prøv også den digitale terning sammen med den fysiske plade.
- [ ] Sammenlign den faste fysiske feltfordeling i appen med **det rigtige print** af jeres A3-plade. Felterne kan variere mellem prototypeprint. Justér før v1.0, hvis de ikke matcher.
- [ ] Fortsæt et ældre gemt spil fra v0.9.13 i fysisk/digital mode og kontrollér at felterne ikke flytter sig.
- [ ] Test offline-genstart, sikker gemning, CPU, lydcache og ElevenLabs efter opdatering af iPhone-PWA.

---

# ÆselKlog v0.9.13 – tests af tilfældige specialfelter, roser og æselknapper

## Automatiske tests gennemført i lokalt udviklingsmiljø

- [x] `node --check` på alle appens JavaScript-filer og Node-testfiler.
- [x] **18 Node-tests** inklusive `tests/random_actions.test.js`: 700 deterministiske baner, varieret antal, alle ni intervalkrav, ingen nabo-felter, fri zoneind-/udgang, højst ét felt i forskel per farvezone, 100 SVG-tal og korrekt gemning.
- [x] **12 Chromium-browsertests**, herunder den nye `tests/random_actions_browser.py`: ny bane for LEG, præcis gem/fortsæt efter lukning, action-reglen for tilfældig Bonus (+2), historisk v0.9.12-spil uden `specialFields`, 390×844, 844×390 og 1280×800. Fem forskellige farvede SVG-roser, uden afklippet dice-billede, og Æsellyd-knap inden for viewport.
- [x] `tests/actionfx_browser.py` regresserer action-pop-up på den historiske bonusposition via test-only legacy-opsætning. Testen måler mens pop-up'en er synlig og kontrollerer reduceret bevægelse.
- [x] Eksisterende test for frivillig LEG, CPU, individuel læring, forældreoversigt, tale, lokal lydcache, gemning, PWA-version og offline-asset-liste.
- [ ] **Rigtig installeret iPhone-PWA, live ElevenLabs, WebKit/VoiceOver og offline-genstart**: ikke testet her; kræver fysisk enhed. Browserprøverne benytter simuleret lyd og lagring.

## Manuel iPhone-/familietest efter upload

- [ ] Opdatér PWA'en, og kontrollér PRØVEVERSION **0.9.13** på Spil-siden.
- [ ] Start to eller tre **nye** spil og se, at specialfelterne varierer i både antal og placering. Typisk varierer Gulerod mellem 3–5, Bro 2–4, Vandpyt 2–4, Bonus 4–6. Der skal ikke være felter lige ved siden af hinanden.
- [ ] Start nyt spil i fx **21–40** og kontrollér at de første tre og sidste to felter i området ikke er specialfelter.
- [ ] Gem et nyt spil, luk den installerede PWA helt, åbn igen og tryk Fortsæt spil. **Den samme fordeling** og spillerposition skal være bevaret.
- [ ] Fortsæt en gemning fra **v0.9.12** og kontrollér at de eksisterende felter ikke flytter sig.
- [ ] Kig på de fem roser i forklaringen: én rose i hver af blå, lyserød, gul, grøn og lilla.
- [ ] Vis terningen og kontrollér at **hele ÆselKlog-æslet** øverst til højre er synligt, uden at billedet skæres af.
- [ ] Se den runde Æsellyd-knap i både stor spilleplade og normal visning, stående/liggende, og afspil lyden.
- [ ] Prøv Gulerod (højst ét ekstra kast), Bro, Vandpyt, Bonus, Superopgave og Overraskelse; ingen action-kædereaktioner.
- [ ] Test CPU-æslet, voksne med tidtagning, reduceret bevægelse, de forskellige AI-stemmer, lydcache og forældreoversigt. Ingen nye ElevenLabs-API-nøgler må kræves.

---

# ÆselKlog v0.9.12 – levende specialfelter, testplan

## Automatiske tests

- [x] Syntaxcheck `node --check` for appen og Node-testene.
- [x] `node tests/actionfx.test.js` – ni specialfelter, farvetone, symbolsikkerhed, korrekte plus/minus-fortegn, Gulerod brugt, ukendt type og banegrænse.
- [x] `python tests/actionfx_browser.py` – LEG uden obligatoriske opgaver, bonusfelt +2, automatisk lukning, synlig status, reduceret bevægelse og placering i 390×844, 844×390 og 1280×800 (Chromium, offline/mock tale).
- [x] **17 Node-tests** og **11 Chromium-browsertests** bestået (inkl. eksisterende spil, læring, CPU-stemmer, forældreoversigt, PWA-cache, gem/fortsæt og mobilforside).
- [x] Kontrolleret at turpanelet i mobilportræt ikke bliver til en smal tekstsøjle under hop.
- [ ] Live iPhone-PWA med ElevenLabs: skal testes på en fysisk iPhone efter upload, ikke antages fra Chromium.

## Gennemgang på fysisk iPhone efter upload

- [ ] Bekræft **PRØVEVERSION 0.9.12** i Spil/Indstillinger. Start med gemt spil og prøv Fortsæt, alle fire menu-hitfelter og forældreoversigt.
- [ ] LEG, fysisk terning og 1–20: land på **⭐ 5** og se **+2**. Ingen matematik eller ekstra talesætning tvinges på. Specialfeltet på den nye position skal **ikke** udføres igen.
- [ ] Prøv **🫏 Hov hov**, **💧 Vandpyt**, **🥕 Gulerod**, **🎁 Overraskelse**, **🌉 Bro**, **🔄 Byt**, **🏆 Talmester** og **🎯 Superopgave**. Kig efter en tydelig, kort pop-up uden at feltnumre eller brikker forskydes.
- [ ] Skift til iOS Indstillinger → Tilgængelighed → Bevægelse → Reducer bevægelse: pop-up-teksten skal stadig vises uden nye hop/rystelser.
- [ ] Test liggende iPhone med fuldskærmsbræt og højrefelt med opgaver. Visuelle effekter skal ikke blokere rigtige knapper eller få spillebrikker til at hoppe ud af felterne.
- [ ] Prøv æsellyd-knappen for sjov, CPU-modstanderen og et forkert svar med rigtig ElevenLabs-stemme. CPU må fortsat først svare, når lyden er færdig; de nye effekter må ikke bruge flere credits.
- [ ] Gem/fortsæt, skift til baggrunden, brug indstillingerne, og kontrollér at niveauer og forældreoversigt stadig findes.

---

# ÆselKlog v0.9.11 – test af forældreoversigt

## Automatiske tests gennemført 15. oktober 2026

- [x] `node --check` af projektets JavaScript og alle Node-tests.
- [x] **16 Node-tests**, inklusive nye `tests/profile_history.test.js` og `tests/parentreport.test.js`: gamle v1-profiler uden historik, kort og sikker 96-forsøgs historik, dobbeltregistrering undgås, korrekt statistik pr. regneart, HTML-escaping mod injektion, sletning af én/alle profiler og lager uden personfølsomme felter.
- [x] **10 Chromium-browsertests**: `tests/test_home_v092.py`, `tests/test_home_v096.py`, `tests/browser_smoke.py`, `tests/persistence_browser.py`, `tests/cpu_voice_browser.py`, `tests/voice_fallback_browser.py`, `tests/voice_cache_browser.py`, `tests/subject_learning_browser.py`, `tests/narration_browser.py`, `tests/parent_overview_browser.py`.
- [x] Den nye browsertest starter med **ingen profiler**, viser en gammel v0.9.10.1-profil uden at opfinde historik, spiller tre plusopgaver med en navngiven barnespiller og ser dem i grafen. Herefter slettes kun den valgte profil, mens en anden profil og et gemt spil stadig findes. Der er også taget preview i mobil og desktop.
- [x] `node tests/pwa_cache.test.js`: `parentreport.js` ligger i offline-asset-listen og PWA-cachen bruger v0.9.11.

**Testgrænse:** Browserne er Chromium med mockede AI-stemmer og lokal lagring, ikke Safari på iPhone. Ingen rigtige ElevenLabs-kald, ingen live-test af Worker og ingen fysisk installeret iPhone-PWA er gennemført. PWA Service Worker-opdateringen er unit-testet; installation/offline-genstart kræver fysisk kontrol.

## Afprøv efter GitHub-upload på fysisk iPhone

- [ ] Åbn appen, og kontrollér versionsmærket **PRØVEVERSION 0.9.11** under Spil/Indstillinger. Forsiden skal stadig være den godkendte illustration med alle fire menuer og kompakt Fortsæt spil.
- [ ] Åbn **Indstillinger → Forældreoversigt**. Se at en gammel profil fra v0.9.10.1 beholder sine niveauer og forsøg, men endnu ikke viser historikkurve, før barnet har svaret i v0.9.11.
- [ ] Start et spil med ét unikt kaldenavn og automatiske opgaver. Besvar tre plusopgaver rigtigt, og åbn oversigten igen. Plusniveau og antal rigtige skal være opdateret, men minus/talforståelse/tabeller må ikke automatisk stige.
- [ ] Prøv et forkert svar og et svar med hjælp. Statistikken tæller det registrerede resultat, og tip må fortsat ikke øge niveau-streak kunstigt.
- [ ] Prøv at bladre/scroll i forældreoversigten i stående og liggende mobilformat. De fire kort og knappen til at lukke oversigten skal kunne bruges uden overlap.
- [ ] Slet den ene valgte profil. Andre børns profiler skal blive. Et tidligere gemt spil og Topscore må ikke slettes. Under et fortsat, gemt spil med automatisk profilhukommelse kan en profil dog oprettes igen ved et **nyt** svar.
- [ ] Slå **Husk barnets niveau mellem spil** fra; start et nyt spil, og kontrollér at der ikke kommer nye historikhændelser i det lokale profillager.
- [ ] Test offline efter tidligere indlæsning: eksisterende oversigt og stemmecache skal kunne vises uden netværk. Prøv også valgte ElevenLabs-stemmer, æsellyd, pauser og 'Hov hov!' variation.
- [ ] Rydning af iPhone-webstedsdata kan fjerne profiler, gemte spil og topscore; dette er en lokal funktion, ikke cloud-backup.

---

# ÆselKlog v0.9.10.1 – "Hov hov!" indledninger

## Automatiske tests udført 15. oktober 2026

- [x] `node --check` på alle JS-filer og testfiler.
- [x] 14 Node-tests, inklusive `tests/narration.test.js`: 35 % med/65 % uden indledning i deterministisk test, CPU-undtagelse, ordret Gentag, specialfeltnavn ikke ændret, sikker lydcache.
- [x] `python tests/narration_browser.py`: mock-telefonstemme og fuldt spil, begge udfald, Gentag uændret.
- [x] `tests/test_home_v092.py` og `tests/test_home_v096.py`: mobilforside, stående/liggende, gemt spil og alle menuer.
- [x] `tests/browser_smoke.py`, `tests/persistence_browser.py`: spilflow og gem/fortsæt.
- [x] `tests/cpu_voice_browser.py`: alternative AI-stemmer og CPU-tur med simuleret AI-lyd.
- [x] `tests/voice_fallback_browser.py`, `tests/voice_cache_browser.py`: offline, timeout og per-stemme cache med simuleret AI-lyd.
- [x] `tests/subject_learning_browser.py`: uafhængig læring og lokale profiler.
- [x] `node tests/pwa_cache.test.js`: ny `narration.js` indeholdt i versioneret offline-cache.
- [ ] Rigtig iOS/Safari PWA-installation, live ElevenLabs samt kredittæller: afventer manuel prøve på brugerens telefon.

## Manuel iPhone-test efter GitHub-upload

- [ ] Kontroller **PRØVEVERSION 0.9.10.1** på Spil-siden.
- [ ] Start/fortsæt flere spil og skift nogle ture: "Hov hov!" bør komme indimellem, ikke hver gang (ca. 35 % over mange relevante oplæsninger).
- [ ] Tryk **Gentag** efter en hilsen både med og uden "Hov hov!"; gentagelsen skal være identisk og bevare stemmen.
- [ ] Test både forskellige ElevenLabs-fortællerstemmer og telefonstemme; CPU skal stadig sige sit svar før resultatet vises.
- [ ] Test specialfeltet **Hov hov**, rund æsellyd-knap, gem/fortsæt og eksisterende læringsprofiler.
- [ ] Tjek at cachen sparer credits ved gentagne anonyme sætninger, også efter genstart, og at den nye PWA-version indlæses.

---

# ÆselKlog v0.9.10 – testplan og status (15. oktober 2026)

## Automatisk gennemført

- [x] GitHub `main` v0.9.9 verificeret, lokal kilde matches på de vigtigste Git-hashes.
- [x] `node --check` af alle JS-filer.
- [x] `tests/subject_progress.test.js`: uafhængige fire niveauer, tip, migrering af v0.9.9-gemning, korrekt regneart på gamle spørgsmål.
- [x] `tests/subject_engine.test.js`: talforståelse, plus, minus, tabeller, alder 3–6, voksnes tid.
- [x] `tests/profiles.test.js`: lokal profil pr. unikt kaldenavn, sletning, navnebegrænsninger, sikker lagring, dubletbeskyttelse.
- [x] Eksisterende Node-tests, inklusive `tests/pwa_cache.test.js`: ny JS med i PWA-forudlagring, kun ÆselKlog-caches ryddes.
- [x] Chromium `tests/test_home_v092.py`, `tests/test_home_v096.py`: alle fire menu-hitfelter og Fortsæt/Slet adskilt i 6 skærmstørrelser med/uden gemt spil.
- [x] Chromium `tests/browser_smoke.py`, `tests/persistence_browser.py`: børn, voksne, CPU, pauser, gem/fortsæt og eksisterende spilflow.
- [x] Chromium `tests/cpu_voice_browser.py`, `tests/voice_fallback_browser.py`, `tests/voice_cache_browser.py`: simulerede AI-lyde, stemmespecifik cache, pause/fallback og rydning.
- [x] Chromium `tests/subject_learning_browser.py`: tre rigtige plusopgaver, minus uændret, ny kamp genbruger samme kaldenavn, læringshukommelse kan ryddes og slås fra.

**Grænse for tests:** Playwright kører Chromium med mockede stemmer og browserlager, ikke den installerede Safari-PWA. Ingen rigtige ElevenLabs-kald/credits. Service Worker er testet med unit-mocks, ikke på fysisk telefon.

## Test fysisk på iPhone efter upload

- [ ] Bekræft `PRØVEVERSION 0.9.10`, den godkendte forside, ikke-overlappende Fortsæt spil i stående/liggende, og alle fire menuer.
- [ ] Start med kaldenavnet fx "Karla", slå talterninger fysisk, vælg UDFORDRING og få tre rigtige plusopgaver. Bekræft at skærmen viser plusområdet som et særskilt niveau.
- [ ] Gem/afslut, genåbn PWA og fortsæt; position, tur og spørgsmål skal være bevaret. Start ny kamp med samme kaldenavn: plusniveauet skal fortsætte, minus på eget niveau.
- [ ] Under Indstillinger: slå `Husk barnets niveau mellem spil` fra; genstart en kamp, som begynder fra neutralt niveau. Slå til igen hvis ønsket.
- [ ] Test `Slet læringsprofiler`; det må ikke fjerne Topscore eller igangværende gemt spil. Prøv to børn med forskellige kaldenavne.
- [ ] Prøv LEG helt uden tvungen matematik, CPU modstander, voksen-timeouts og æsellyd fra den runde knap på spillepladen.
- [ ] Test rigtig AI-oplæsning med to forskellige godkendte stemmer og offline/online skifte, uden ekstra forsinkelse i turstyringen.
- [ ] Kontrollér PWA-offlinegenstart og opdatering af Service Worker på iPhone, samt eventuelle pladsproblemer i skærmretningerne.

---

# ÆselKlog v0.9.9 – UI-oprydning og lydcache-regression

## Automatiske tests udført 15. oktober 2026

- [x] Syntaks for alle JS-filer (`node --check`).
- [x] Alle ti `tests/*.test.js`, inklusive ny `voicecache.test.js` for adskilte stemmer, whitelist/persondata og lagerbegrænsning.
- [x] `python tests/test_home_v092.py` og `tests/test_home_v096.py` – forsider, gem/fortsæt og mobilvisning.
- [x] `python tests/browser_smoke.py` – børn, voksne, CPU, vindere og Topscore.
- [x] `python tests/persistence_browser.py` – gem/fortsæt, positioner, spørgsmål og læringsprogression.
- [x] `python tests/cpu_voice_browser.py` og `tests/voice_fallback_browser.py` – AI-CPU, separate stemmer, timeout/offline-fallback og stemmevalg.
- [x] `python tests/voice_cache_browser.py` – simuleret IndexedDB: Mia og Mads adskilt, CPU-æslets egen stemme, cachehit efter app-geninitialisering, offline afspilning uden nyt AI-kald, rydning og ingen persongemning.
- [x] `node tests/pwa_cache.test.js` – ny `voicecache.js` med i offline-asset-listen.
- [ ] **Lokal HTTP/Service Worker-test:** kan ikke udføres i dette miljø; Chrome blokerer localhost med `ERR_BLOCKED_BY_ADMINISTRATOR`.

Alle Playwright-browser-tests bruger Chromium og **simulerede** AI-lyde og IndexedDB. Ingen virkelige ElevenLabs-credits er brugt i tests.

## På rigtig iPhone-PWA efter upload

- [ ] Kontrollér versionsmærket 0.9.9, og at godkendt forside, Fortsæt/Slet og alle fire menuer er synlige.
- [ ] Vælg fx Mia, tryk "Prøv æslets stemme" to gange: første gang bruger credits, anden gang skal bruge cache. Se antal klip under "Gemte AI-lyde".
- [ ] Vælg Mads eller en anden *godkendt* stemme: første oplæsning med denne stemme skal være et nyt klip. Skift tilbage til Mia: lydklippet skal være den oprindelige Mia-stemme.
- [ ] Vælg særskilt stemme til CPU-æslet og tryk "Hør CPU-æslet svare". Test at CPU'en stadig venter på, at talen afsluttes.
- [ ] Luk PWA helt og åbn igen: gentagne faste sætninger skal afspilles uden nyt AI-kald.
- [ ] Slå Wi-Fi og mobildata fra: et tidligere gemt klip skal bruge AI-lyden; en ikke-gemt sætning skal bruge telefonstemmen.
- [ ] Tryk "Ryd gemte AI-lyde". Antal klip skal blive nul, og næste AI-oplæsning online skal hentes på ny.
- [ ] Test et gemt spil, actionfelter, LEG uden tvungne opgaver og eksisterende ElevenLabs-kreditter.
- [ ] Kontrollér, at browserens rydning af webstedsdata også fjerner stemmeklip (og kan slette andre lokale spil-data).

---

# ÆselKlog v0.9.7 – CSS, offline/PWA, stemme-reserve

## Automatiske regressioner

- [x] JavaScript-syntaks (`node --check`) og alle `tests/*.test.js`.
- [x] `python tests/test_home_v096.py` – iPhone-forside med og uden gemt spil, menuer og knap-hitboxes.
- [x] `python tests/test_home_v092.py`, `python tests/browser_smoke.py`, `python tests/persistence_browser.py` og `python tests/cpu_voice_browser.py`.
- [x] `python tests/voice_fallback_browser.py` – fallback ved timeout (simuleret AbortError), offline og genforsøgspause. Annullering af samtidige sætninger er bevaret fra v0.9.6, men er ikke særskilt regressionstestet her.
- [x] `node tests/pwa_cache.test.js` – versionscache, egne caches og offline-fallback.
- [ ] PWA-test i lokal Chromium med HTTP-server og serviceworker (CSS og billeder skal virke offline). **Forsøgt, men værtsmiljøets browser blokerede `127.0.0.1` (ERR_BLOCKED_BY_ADMINISTRATOR). Ingen reel Service Worker-installation verificeret i denne test.**

## Manuelle iPhone-tests efter upload

- [ ] Kontroller PRØVEVERSION 0.9.7 på installeret PWA (genåbn appen ved behov).
- [ ] Både med og uden gemt spil: Den godkendte forside og alle menuknapper er uændrede.
- [ ] Slå Wi-Fi og mobildata fra efter første installation: app, illustrationer, spil og telefonstemme virker offline.
- [ ] Slå nettet til igen: AI-stemme kan genoptages efter kort pause. Test også en ægte fejl/timeout, hvis muligt.
- [ ] Kontroller med VoiceOver, at menuskift og stemmestatus kan navigeres meningsfuldt.
- [ ] Kontroller, at gemte spil og Topscore stadig er bevaret efter opdatering fra v0.9.6.

---

## Historik – v0.9.6

# ÆselKlog v0.9.6 – test af gemt-spil-knappen

## Automatisk

- [x] `python tests/test_home_v096.py` – både portræt og landskab med/uden gemt spil, alle hovedmenuknapper, fortsæt og slet.
- [x] Eksisterende Node-tests `for f in tests/*.test.js; do node "$f"; done`.
- [x] `python tests/test_home_v092.py`, `python tests/browser_smoke.py`, `python tests/persistence_browser.py`, `python tests/cpu_voice_browser.py`.

**Testet lokalt 15. oktober 2026:** Node (8/8), Playwright med mock-/offline-lyd, inklusive seks skærmstørrelser med og uden gemt spil. Ingen rigtige ElevenLabs-kald. Browser-test er Chromium, ikke WebKit/iOS Safari.

## Fysisk iPhone-PWA – kræver manuel test efter upload

- [ ] Luk den installerede ÆselKlog helt; genåbn og sørg for at versionen er opdateret.
- [ ] Uden gemt spil: ingen Fortsæt-knap; Spil, Indstillinger, Topscore og Om spillet kan trykkes.
- [ ] Start et spil, tryk **Gem & afslut**, og kontroller at Fortsæt-knappen står under den blå Spil-knap uden at dække Indstillinger.
- [ ] Tryk på **Fortsæt spil**, og se at position, spillere og tur er uændrede.
- [ ] Gem igen, tryk **✕**, bekræft sletning, og kontroller at fortsæt-knappen forsvinder, men Topscore ikke slettes.
- [ ] Prøv både portræt og landskab på installeret iPhone-PWA; kontrollér også skærmudsnit/safe areas og berøring.
- [ ] Kontrollér AI-/CPU-stemmer og offline-fallback som hidtil (ingen ændret Worker-nøgle).

---

## Tidligere tests

# V0.9.2 – test af ny forside

- [x] Første besøg åbner **Forside** med logo og Spil/Indstillinger/Topscore.
- [x] Spil viser kun navn, alder, CPU og start, ikke alle indstillingsfelter.
- [x] Indstillinger vælger talområde, læringstilstand, tempo, tabel, fysik/digitalt, voksen-niveau samt AI-/CPU-stemmer.
- [x] Indstillinger overføres korrekt til start og opbevares lokalt.
- [x] Gem & afslut går hjem, fortsæt-knappen genoptager gemt spil; Topscore-dialog åbner/lukker.
- [x] Der er testes browser-flow ved 390×844, 844×390 og 1280×800.
- [x] Tidligere action-, voksen-, gemme- og CPU-spiltests bestået.
- [ ] Test med rigtig iPhone og tilsluttet ElevenLabs, inklusive PWA-cache.
- [ ] Test sammen med mindre børn: er de tre forsideknapper lette at forstå?

---

# 🧪 ÆselKlog – praktisk test på iPhone og computer

**Test denne version:** v0.9 (grundtest fra 0.8-E + nye testpunkter)  
**Mål:** Kontrollér om spillet nu er klar til en første større familieprøve. Sæt kryds og skriv eventuelle fejl ned i GitHub Issues.

## Start med teknikken

- [ ] Åbn https://driftportal-platform.github.io/aeselklog-talstien/ og kontrollér versionsmærket **0.8-E**.
- [ ] Vend iPhonen vandret: spillepladen fylder skærmen, og knapper kan nås uden at dække tal/opgaver.
- [ ] Vælg **Stor plade**, prøv zoom, **Hele banen**, **Find æslet** og **✕ Luk**.
- [ ] Lyd til: Vælg Mia eller en anden dansk AI-stemme, tryk **Prøv valgt stemme**. Vælg telefonstemme og test igen.
- [ ] Lyd fra og til: ingen frysning eller uberegnelige CPU-ture, når oplæsning afbrydes.

## Spil og matematik

- [ ] **LEG:** Spil helt uden læringsopgaver med fysisk almindelig terning.
- [ ] **Digital terning:** Tryk på den store terning, se animation og resultat; æslet hopper korrekt på banen.
- [ ] **3–4 år:** Vælg barn på 3 år, kontrollér lette tal-/tælleopgaver uden tidspres.
- [ ] **5–6 år:** Plus/minus skal være let, og der må ikke komme tvungne svære gangestykker.
- [ ] **9 år:** Vælg 7-tabellen + TABELTRÆNING; opgaven skal handle om 7-tabellen hver tur. Prøv derefter blandede tabeller.
- [ ] **Voksen:** Vælg let/mellem/svær, kontrollér 60/30/10 sekunder og at nedtælling starter **efter** oplæsningen.
- [ ] **App i baggrunden:** Skift til en anden app i 10–20 sekunder under voksenopgave; tiden skal først fortsætte, når ÆselKlog åbnes igen.
- [ ] **CPU:** Lad Æslet spille, lyt om det får tid til at tale færdigt, og kontrollér at terning og hop vises. Skift kort væk fra appen under CPU-turen – den bør ikke fortsætte uden at I ser det.

## Handlinger og vindere

- [ ] ⭐ Bonus, 🫏 Hov hov, 🔄 Byt, 🏆 Talmester.
- [ ] 🥕 Gulerod (højst ét ekstra kast), 💧 Vandpyt (næste tur springes over), 🎁 Overraskelse, 🌉 Bro, 🎯 frivillig Superopgave.
- [ ] Actionikon/tekst bliver synligt under æslets tale og til handlingen er afsluttet.
- [ ] Ved forkert svar: ægte æsellyd; ved rigtigt svar: ekstra hop uden at bryde turens rækkefølge.
- [ ] Ved sejr: vinderfejring, antal rigtige svar og **Se topscore**. Tjek at sejren er registreret.
- [ ] Luk og genåbn spillet på **samme enhed**; Topscore skal stadig være der. Test sletning af Topscore, hvis I ønsker det.
- [ ] iPhone-indstilling for reduceret bevægelse: spillet skal stadig fungere uden konfetti.

## Fejl og feedback

Skriv ved en fejl: **enhed og browser, spiltype, valgt alder/tabel, placering på banen, forventet resultat, faktisk resultat**, og gerne et screenshot. Undgå fulde børnenavne og alle API-nøgler.

**Resultat:**

- [ ] Klar til familieprøve
- [ ] Kræver fejlretning (opret GitHub issue)

---

## 🆕 Tilføjelse til testplan – v0.9: gem/fortsæt og adaptive opgaver

- [ ] Kontrollér at startsiden har **Tilpas opgaver automatisk** og mulighed for at slå det fra.
- [ ] Start et spil med fysisk terning og mindst to spillere. Ryk et par felter. Tryk **Gem & afslut** fra spillepladen.
- [ ] Luk **hele** ÆselKlog (og eventuelt Safari) på iPhone. Åbn den samme webapp igen på **samme enhed**.
- [ ] Tryk **Fortsæt spillet**, og bekræft at navne, CPU, positioner, tur, terningevalg og spiltempo er bevaret.
- [ ] Prøv at lukke midt i en **opgave** og fortsætte senere. Opgaven og svarmulighederne skal være de samme.
- [ ] Prøv at lukke midt i en **animation**. Spillet må starte igen fra et sikkert punkt – uden duplikeret bonus.
- [ ] Som voksen: gem midt i en nedtælling. Ved fortsættelse skal resterende tid være bevaret, og nedtællingen starter efter oplæsning.
- [ ] Som barn: svar tre gange rigtigt uden at bruge et tip. Niveauet skal stige ét trin (ses ved spilleren). Svar derefter to gange forkert – niveauet skal blive lidt lettere.
- [ ] Prøv samme kamp med en 3-årig og en 9-årig. Den 3-årige må ikke få gangestykker, mens den 9-årige gerne må få tabelopgaver.
- [ ] Tjek at den lokale topscore stadig findes efter **Slet gemt spil**, men at et afsluttet spil ikke længere kan genoptages.
- [ ] Test AI-stemme og æsellyd både online og i offline/telefonstemme-tilstand.

**Bemærk:** Gemte spil findes kun i browserens lagring på denne enhed. Rydning af webstedsdata eller privat browsing kan fjerne dem.


## v0.9.1 – prøve af sjov CPU-stemme

1. Åbn indstillingerne og vælg Mia som spilleleder. Vælg Glenn eller *Automatisk* under **CPU-æslets egen stemme**.
2. Tryk **▶ Hør CPU-æslet svare**, og lyt efter en anderledes, lidt fjollet stemme.
3. Start et spil med CPU, vælg UDFORDRING eller TABELTRÆNING, og lad Æslet få et spørgsmål.
4. Kontroller, at CPU'en siger sit valgte svar **før** "rigtigt/forkert" vises; svaret skal også være markeret på skærmen.
5. Ved forkert CPU-svar kommer ægte æsellyd. Ved korrekt svar får CPU'en sit ekstra felt. Kontroller tempo og bevægelse.
6. Test at slå lyd fra, genindlæse appen, skifte mellem to stemmer og fortsætte et gemt spil. Test også offline telefonstemmen.
7. Sammenlign AI-credits før og efter 5–10 CPU-spørgsmål. Korte svar bruger stadig separate AI-forespørgsler; kontrollér forbrugsgrænserne.

**Automatiseret:** `node tests/cpuvoice.test.js` og `python tests/cpu_voice_browser.py` (mockede svar og lyd, ingen reelle API-kald).


## v0.9.20 – taloplæsning i Kortspil
Ved vending og placering af talkort udtaler stemmen nu kortets tal i stedet for generiske vendinger som »Jeg vender et kort« og »Kortet er lagt«. CPU kan sige »Æslet lægger [tal]«. Eksisterende fælles stemmevalg, musik og offline-aktiver er bevaret. Kontrollér på fysisk iPhone efter upload.
