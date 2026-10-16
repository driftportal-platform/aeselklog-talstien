# ÆselKlog – udviklernote v0.9.17 (kortspil med CPU og fri placering)

1. **Læs seneste GitHub `main` og alle seks dokumenter først:** `README.md`, `AGENTS.md`, `TESTPLAN.md`, `UDVIKLINGSPLAN.md`, `PROJEKTSTATUS.md`, `IDEKATALOG.md`. Bevar den godkendte forside, Talstien-motoren, ElevenLabs-Worker og eksisterende gemme-/profilnøgler.
2. `cardgame-engine.js`: Gammelt `VERSION=1` og `SAVE_KEY=aeselklog-kortspil-v1` bevares. Valgfri `isCPU` (højst én CPU) og `lastMove` med præcis ét *ikke-rekursivt* før-snapshot. Gamle kortspilsgemminger uden disse felter er gyldige. 1–6 mennesker + én CPU eller 2–6 mennesker uden CPU.
3. Nye kortregler i motoren: `flipManual()`, `placeManual(state,source,target)`, `discardManual()` og `challenge()`. Mål valideres **kun strukturelt**, ikke som lovligt taltræk; en korrekt/ukorrekt placering registreres i `lastMove.valid`. `challenge()` verificerer fejl og tilbageruller **kun det seneste træk**, derefter `penalty()` med valgfri ekstra straf. Bevidst ulovlige midterrækker skal derfor også være strukturelt gyldige indtil udfordring. `restore()` validerer bevarede kort og checkpoint.
4. `cardgame-ui.js`: Kort kan vælges via tryk, tastatur eller pointertræk; brug `data-card-source`, `data-card-target`. iOS kræver Pointer Events fremfor HTML5 drag/drop. Tillad scroll ved kanten under træk. Giv ikke automatisk fejl før indsigelse. **`#cardsChallenge` er trykbart æselkort.** Manuel `#cardsGivePenalty` findes som separat administrativ mulighed uden undo.
5. CPU i kortspillet bruger udelukkende lokal regelkode: følger normale ture, kan med lav sandsynlighed selv lægge et forkert kort (~7 %) og kan spotte andres fejl (~72 %). CPU skal vente mellem handlinger, stå stille når vinduet skjules eller regeldialogen er åben, og stoppe når kortspilsmenuen åbnes. Forveksl ikke dette med den eksisterende CPU- og ElevenLabs-motor i Talstien.
6. Gem/fortsæt skal bevare både CPU, `pending`, fejlplaceringer og sidste udfordringscheckpoint. Stop aldrig med at bevare det samlede antal talkort: 5×20 pr. talområde. Æselkort-pulje må ikke overskrides. Ved korrekt indsigelse gives ingen straf.
7. Bevar klassisk variant med 4/6/8 æselkort, drillevariant med ét, valgfri ekstra kortstraf, frivillig matematik og forskellige lokale savegames for Talstien/Kortspil. **Ingen nye netværkskald eller persondata** i kortspillet.
8. Kør `node --check`, alle Node-tests inkl. `tests/cardgame_interaction.test.js`, Chromium `tests/cardgame_interaction_browser.py`, alle øvrige regressioner samt `tests/pwa_cache.test.js`. Reel iPhone/WebKit og live ElevenLabs er særskilt manuelt ansvar, ikke dækket af mocks.

---

# ÆselKlog – udviklernote v0.9.16: spilvælger, seks spillere og dokumentation

1. **Læs altid seneste GitHub `main` før en ny version.** Relevante kilder: `README.md`, `AGENTS.md`, `TESTPLAN.md`, `UDVIKLINGSPLAN.md`, `PROJEKTSTATUS.md`, `IDEKATALOG.md`. Opdater alle seks dokumenter sammen med cache-version ved hver ny release.
2. `#setup` indeholder to **aktive knapper** `#chooseBoardMode` (Talstien) og `#openCardSetup` (Kortspil). `#cardsSetup` indeholder tilsvarende `#cardsChooseBoard` og `#cardsChooseCards`, så begge spilvalg altid kan skiftes frem og tilbage. Skift sker via eksisterende `window.AeselShowView`. Skjul ikke den anden spiltypes kontroller med CSS-fnidder; kun den valgte `view` må være synlig.
3. På det lille skærmformat er spilkortene stablet, desktop er to kolonner. Valgt spiltype skal fremgå med `aria-pressed`, tydelig kant og markør; bevar fokusmarkering og reduceret bevægelse. Den godkendte `home-fullscreen.webp` ændres aldrig uden brugerens nye reference.
4. Talstien har højst **6 menneskespillere**, evt. **1 CPU**. `app.js` har seks forskellige `COLORS`; `savegame.js` `normalize()` tillader syv deltagere og højst én CPU. Skema og lokal lagernøgle `aeselklog-igangvaerende-v1` forbliver uændret. Test både 2, 4, 6 og 6+CPU, gerne på én og samme SAVE.
5. Kortspillet har stadig 2–6 personer i sit separate modul med lagernøglen `aeselklog-kortspil-v1`; rør ikke dets regler ved at ændre Talstiens spillerantal. Stemme, CPU, pauser, A3-fysisk, PWA og actionfelter skal bestå regressionsprøver.
6. Særligt: eksisterende serviceworker cache er `aeselklog-talstien-v0916-mode-selector-six-players`. Den precacher hele den uændrede projektfilstruktur og sletter kun egne caches.
7. Tests: alle `node tests/*.test.js` inkl. nyt `mode_selector.test.js`, alle relevante browserregressioner plus nyt `mode_selector_browser.py` (390×844, 844×390, 1280×800). Fysisk iPhone, WebKit/VoiceOver og reel ElevenLabs er stadig MANUELT udestående.
8. Fysiske kortspil: brugerens kortbilleder fra 21–40 og æselkort er reference. Ingen automatisk udgivelse/printproduktion før kortregler, copyright, kvalitet og oplag er godkendt.

---

# ÆselKlog – udviklernote v0.9.15 (selvstændigt kortspil)

- Start altid fra seneste GitHub `main`. Læs de fire projektdokumenter, og sammenlign aktuelle kilde-hashes, før videre udvikling.
- Nye `cardgame-engine.js` og `cardgame-ui.js` er selvstændige moduler. `index.html` viser **Talstien** og **Kortspil** under eksisterende `#setup`; `app.js` udvider sin visningsnavigator med `#cardsSetup` og `#cardsGame` men ændrer ikke Talstiens fase- eller turmotor.
- Kortspillet har præcis fem gyldige `RANGES`, 20 tal per række, fem kopier af hvert tal; standardvarianten har 4,6,8 beholdte strafkort, `passing` har ét overdrageligt strafkort. Frivillig ekstra straf tager kun kort fra andre spillers lukkede bunker. Matematik er ikke obligatorisk.
- Æselkort gives *manuelt* via bekræftet strafknap, fordi et overset lovligt træk ikke kan afgøres ved en fysisk bordoplevelse. Kort-appens digitale træk er automatisk lovlige. Central stak prioriteres; derefter en anden spillers åbne stak efter rækkefølgen til venstre. Regelvarianten justeres efter fysiske tests, ikke ved gæt.
- `cardgame-engine.js` er testbart i Node og browser og validerer input ved indlæsning. `SAVE_KEY=aeselklog-kortspil-v1` er helt separat fra `savegame.js`/Talstien. Konverter ikke automatisk mellem kortspil og Talstien.
- Bevar originale billedfiler og alle eksisterende funktioner: CPU, IA-stemmer via Cloudflare Worker, 35 % Hov hov, farvede roser, actionfelter, fysisk A3, læringsprofiler, forældreoversigt og PWA-tilgængelighed. Ingen ElevenLabs-secrets i GitHub.
- `sw.js` skal indeholde begge nye JS-moduler. `tests/cardgame.test.js` og `tests/cardgame_browser.py` skal bestå sammen med eksisterende Node/Chromium-tests. De faktiske trykte kort og iPhone-PWA kræver særskilt kontrol.

---

# ÆselKlog – udviklernote v0.9.14 (16. oktober 2026)

1. Kontroller **aktuel GitHub `main`**, `README.md`, `AGENTS.md`, `TESTPLAN.md`, `UDVIKLINGSPLAN.md` før enhver videreudvikling. v0.9.14 bygger på verificeret `main` v0.9.13, ikke en ældre ZIP.
2. **Afslut-menuen** (`#exitGameDialog`) bruges via `#gameExit` i normal visning og `#boardExit` på stor plade. `#boardClose` lukker kun stor plade, ikke spillet. **Gem og afslut** genbruger `saveAndLeave()` i sikre faser; afslut uden gemning kræver bekræftelse, annullerer asynkront spil via `resetAsync()`, og sletter kun den aktuelle lokale savegame. Topscore/læringsprofiler og lydcache røres ikke.
3. Mens afslutningsdialogen er åben, venter `waitUntilVisible` også på `!exitDialogActive`, og en aktiv voksen-timer sættes på pause. `aeselklog-exit-resume` frigiver vente-promise ved annullering. CPU- og taleforløb må ikke fortsætte bag modal. Foretag ændringer med særlig omtanke om `gameToken`-annullering.
4. **Fysisk A3** bruger eksisterende `A.FIELDS`, vises ikke automatisk i stor digital plade, viser `#physicalGuide`, holder stadig den digitale tur/position og alderssikre læring, og hopper straks til digitalt registreret slutposition, så spillerne selv kan flytte deres A3-brikker. Knappen `#physicalShowBoard` giver valgfrit digitalt overblik. Nye digitale spil bruger uændret `A.generateLayout()`. **Ældre gemte spil bruger altid `specialFields` fra gemningen**, aldrig ny generering ved resume.
5. Der er endnu ikke garanteret identitet mellem `A.FIELDS` og alle historiske trykte A3-prototyper. Fysisk bruger må kontrollere markeringerne; printdesigns skal harmoniseres før endelig v1.0.
6. `styles.css` fjerner liste-/nummermarkør for `.voice-settings>summary` med eksplicit `list-style:none`, `::marker` og webkit-regel. Ændr ikke den godkendte forside.
7. **Kortspillet udskydes** efter v0.9.14. 21–40 kortprototype har 20 talkort og 8 æselkort. Standard: flere æselkort beholdes af modtageren; senere vandrevariant: ét æselkort. Regler for talkortenes aflægning skal stadig afklares. Læringsfunktioner er valgfrie.
8. Kør `node --check` på appens JS, alle `tests/*.test.js`, `python tests/physical_exit_browser.py` og alle relevante gamle browserregressioner. Ingen påstand om rigtig Safari/iPhone-PWA eller ægte ElevenLabs ud fra Chromium-mocks.

---

# ÆselKlog – udviklernote v0.9.13 (randomiserede specialfelter)

1. Start altid fra **nyeste GitHub `main`**, og sammenlign byte-hashes med lokale ZIP'er. Læs `README.md`, `AGENTS.md`, `TESTPLAN.md`, `UDVIKLINGSPLAN.md`.
2. `actions.js` eksporterer fortsat **det gamle** `FIELDS`-layout (for gamle savegames og legacy-tests), men nye spil bruger `generateLayout(rng)` og `validateLayout(layout)`. Samme generator bruges til LEG, LÆR, UDFORDRING, TABELTRÆNING, fulde 100 felter og kortere udvalgte talområder. Antallene varierer inden for de faste intervaller og felterne er fordelt over alle fem 20-bands. Ingen nabo-felter og frie ind-/udgange til hvert talområde.
3. `app.js` holder `SPECIAL` som en variabel, genbrugt af både SVG (`B.render`) og tur-/actionregler. **Nyt spil:** `A.generateLayout()` én gang. **Fortsæt:** `state.specialFields || A.FIELDS`. Aldrig generér igen ved render, app-baggrund, gem eller genoptagelse.
4. `savegame.js` beholder lokal lagernøgle `aeselklog-igangvaerende-v1` og schema 1. Det nye valgfri `specialFields`-objekt normaliseres til kendte feltnumre og godkendte actiontyper. Manglende felt i gamle gemninger repræsenteres som `null` og bruger **historisk `A.FIELDS`**, så gamle aktive spil bevarer deres bane. Ikke ændre API-nøgler, profiler, Topscore eller Cloudflare Worker.
5. Spilreglerne ændres ikke: ingen rekursive specialhandlinger, ét ekstra gulerodskast per tur, frivillige spørgsmål, CPU følger samme regler, timer/oplæsning og pauser respekteres. Børnenes aldersloft, forældreoversigt, AI-cache og 'Hov hov!' 35 % skal fortsat testes.
6. Legendeforklaringen bruger fem ens SVG-roser med fem CSS-farver; **brug ikke platformfarvede emoji-roser**, der kan se ens ud. Terningskærmens æselbillede har ingen `clip-path`; æsellyd-knappen må ikke gå ud over viewport på lille mobil.
7. Kør `node tests/random_actions.test.js`, `python tests/random_actions_browser.py`, alle tidligere Node-/Chromium-tests og PWA unit-test før hver release. Fysisk iPhone/WebKit og live ElevenLabs tæller først som test, når de er udført på rigtige enheder.

---

# ÆselKlog – udviklernote v0.9.12 (levende specialfelter)

1. Brug **aktuel GitHub `main`**, læs `README.md`, `AGENTS.md`, `TESTPLAN.md` og `UDVIKLINGSPLAN.md`. Release v0.9.12 bygger på verificeret `main` v0.9.11, ikke gamle ZIP'er.
2. `actionfx.js` er **præsentationslogik**, ingen tur-/spilmotor. `describe(type,{delta,used})` returnerer kun godkendte CSS-toner og sikre badges. Ukendte typer falder tilbage til `choice`.
3. `app.js` viser effekterne via `flashAction` i `#actionToast`. Den oprindelige turorden, pauser, CPU-ventetid og narration/ElevenLabs-kald ændres ikke. Overraskelser opdaterer den viste effekt **efter** tilfældig gevinst/straf; mærk reelt flyttede felter ved banegrænser.
4. `styles.css` animerer **kun pop-up-feltets eget ikon/dekoration**, aldrig `.board-tile`, SVG-transforms eller den geometriske brikposition. Følg `prefers-reduced-motion`. Selve betjeningen/teksten skal fungere uden animation.
5. `actionfx.js` skal ligge **før `app.js`** i `index.html`, alle test-fixtures og `sw.js` præcache. Den lille optional chaining fallback i `app.js` forhindrer total fejl, hvis iOS kortvarigt blander gamle/nye PWA-aktiver.
6. Bevar alt fra v0.9.11: den godkendte fuldskærmsforside, Fortsæt/Slet, rund Æsellyd, frivillig LEG, CPU, Hov hov-variationen, læringsprofiler, forældreoversigt og lokal lydcache. Ingen secrets i GitHub, ingen automatisk cloud-lagring.
7. Test `tests/actionfx.test.js`, `tests/actionfx_browser.py`, alle Node/Chromium-regressioner og PWA offline-cache-test. Fysisk iPhone og ægte ElevenLabs kræver separat manuel test.

---

# ÆselKlog – udviklernote v0.9.11 (forældreoversigt)

1. Start altid med **seneste GitHub `main`**, læs `README.md`, `AGENTS.md`, `TESTPLAN.md` og `UDVIKLINGSPLAN.md`. v0.9.11 er bygget fra GitHub-verificeret v0.9.10.1 og må ikke overtage gamle ZIP'er ukritisk.
2. `profiles.js` bevarer nøglen `aeselklog-laereprofiler-v1` og `version:1`, så gammel historikløs profil læses fortsat. Tilføjet valgfrit `history` med højst 96 hændelser; `LP.record(..., exerciseId, {area,correct,helped,step})` tilføjer én hændelse **kun efter** et nyt gennemført svar. Gentaget `exerciseId` må ikke tælle igen. `LP.report()` og `LP.remove()` er nye. Profildata indeholder ingen alder, opgavetekst, facit eller API-nøgler. Sletning ændrer ikke gemte spil/Topscore.
3. `parentreport.js` er et rent visnings-/opsummeringsmodul med HTML-escaping. `parentReportDialog` åbnes kun fra **Indstillinger**, ikke fra den godkendte forside. Voksne og CPU får ikke læringshistorik. Ingen netværkskald fra rapporten, ingen account-oprettelse.
4. `app.js` opdaterer læringshistorikken inde i `processAnswer`, efter `P.noteArea`, og kun når `config.adaptive`, `config.rememberLearning`, barn med unik, ikke-standard kaldenavn og et reelt svar. LEG forbliver uden tvungne spørgsmål, bortset fra frivillige superopgaver. Ingen ændringer i den eksisterende gemme-schema v1.
5. `sw.js` må kun rydde caches med ÆselKlogs eget præfiks, indeholde `parentreport.js` og versionsmærke v0.9.11. Bevar `home-fullscreen.webp` identisk med godkendt forside. Vær særlig opmærksom på CPU-tale/ventetid, stemmevalg, 'Hov hov!' 35 %, lydcache og iPhone-viewport.
6. Test `tests/profile_history.test.js`, `tests/parentreport.test.js` og `tests/parent_overview_browser.py` sammen med tidligere Node- og Chromium-regressioner. Kald det ikke fysisk iPhone-test, når der er brugt mockede stemmer i Chromium.

---

# ÆselKlog – udviklernote v0.9.10.1

- Byg på den **seneste fulde ZIP** v0.9.10 (GitHub `main` viste v0.9.9 ved opstart). Sammenlign altid mod GitHub-main først.
- Ny `narration.js` er en ren, testbar tekstfunktion. `prepare(text)` udelader *kun* et indledende "Hov hov!" med 65 % sandsynlighed; ved 35 % beholdes det. `cpu:true` og `repeat:true` ændrer aldrig talen. Den samme konkrete variant genbruges på Gentag.
- Den reelle stemme/rolle, ventetid, CPU-turkontrol og talens afbrydelsesmekanik i `app.js` må ikke omgås; varianten vælges kun én gang pr. oplæsning.
- `voicecache.js` må kun gemme whitelistede, anonyme sætninger. Nye indledningsvarianter i samme liste er sikre; aldrig vilkårlige spiller-/børnenavne.
- `narration.js` skal indlæses **før `app.js`** i HTML, browserregressionerne og `sw.js`-listen. Cloudflare Worker, API-nøgler og originale illustrationer er uændrede.
- Test `node tests/narration.test.js`, `python tests/narration_browser.py` sammen med alle øvrige tests. En fysisk iPhone-PWA- og rigtig ElevenLabs-test afventer upload.

---

# ÆselKlog – udviklernote v0.9.10 (15. oktober 2026)

1. **Hent nyeste GitHub `main` og sammenlign med eventuelle ZIP'er**, og læs `README.md`, `UDVIKLINGSPLAN.md`, `TESTPLAN.md` og hele denne fil, før ny udvikling.
2. I `adaptive.js` er `fresh`, `clean`, `note` og `label` bibeholdt til bagudkompatibilitet. `freshProgress`, `cleanProgress`, `noteArea`, `areaStep` og `challengeArea` implementerer fire uafhængige områder: `numbers`, `plus`, `minus`, `tables`. **Aldersloftet vinder altid** over progressionsniveauet.
3. `engine.js` tager et valgfrit `skillSteps`-objekt og fortsat gammelt `skillStep`. Hvert nyt børnespørgsmål returnerer `skillArea` og `adaptiveStep`. Multiplikation/division er `tables`; småbørns tal-tælling er `numbers`. Voksnes niveau påvirkes ikke.
4. `savegame.js` bruger fortsat **schema 1** og lagernøglen `aeselklog-igangvaerende-v1`. Tilføjede felter er bagudkompatible og klampes/valideres. Gamle spørgsmål uden `skillArea` kan klassificeres af `adaptive.challengeArea`.
5. `profiles.js` gemmer kun kaldenavn, faglige niveauer og opgave-ID'er lokalt i `aeselklog-laereprofiler-v1`; ikke alder, API-nøgler, lydoptagelser eller serverdata. Børn skal kunne spille uden profil og ved blokering af localStorage. Gemte spil og Topscore bruger fortsat separate nøgler.
6. De faste produktregler er uændrede: LEG frivillig, ingen tvungne svære opgaver 3–6 år, CPU har samme turregler, pause ved app i baggrunden, voksen-timer 60/30/10 efter oplæsning, stemmevalg og ElevenLabs via eksisterende sikre Worker, ingen actionkæder.
7. Bevar godkendte `home-fullscreen.webp`, design og den runde knap på spillepladen. PWA-cache skal versionsopdateres og indeholde `profiles.js`. Ryd kun egne caches, ikke de andre GitHub Pages-apps.
8. Før release: kør `node --check` på JS, alle `node tests/*.test.js`, de vigtigste Python Playwright tests og nye `tests/subject_learning_browser.py`. Ingen påstand om rigtig telefon- eller ElevenLabs-test uden at den er gennemført.

---

# ÆselKlog – udviklernote v0.9.9

- **Start altid på nyeste GitHub `main`.** Lokal v0.9.9 bygger videre på v0.9.8 med fokus på UI-oprydning. Ingen direkte GitHub-upload udført.
- `voicecache.js` er nyt modul for kun **upersonlige, faste sætninger** i IndexedDB; nøglen indeholder Worker, faktisk stemme-ID, tekst og lydmodel-version. Det er IKKE en generel cache for alle spiller-/børnenavne.
- `app.js` skal vente på cache/lydafspilning som før. CPU må først afgive/afsløre svar efter oplæsning. Test stemmeændring midt i oplæsning og i baggrunden.
- AI-cache må aldrig indeholde ElevenLabs API-nøgler eller private spilleroplysninger. Serverens /tts og /voices anvendes fortsat via Cloudflare Worker; Workerens secrets skal forblive hos Cloudflare.
- Hverken Service Worker eller IndexedDB må automatisk sende, uploade eller synkronisere cache til en server. Cache-grænse 15 MB/70 klip; rydning fra Indstillinger.
- Opdater `voicecache.js`-FORMAT og Service Worker-cachen, hvis AI-model eller stemmeopsætning ændrer sig på serveren, ellers kan gamle lydklip afspilles.
- Verificér `node tests/voicecache.test.js`, `python tests/voice_cache_browser.py`, alle eksisterende regressionstests og en fysisk iPhone-PWA efter upload. Ingen ægte AI-opkald i tests.

---

# ÆselKlog – udviklernote v0.9.2

**Ny navigation:** `#home` (forside), `#settings` (alle indstillinger), `#setup` (kun spillernavne, aldersvalg, CPU), `#game` (spillepladen). `app.js` har navigation via `show(view)`; gemt spil står på forsiden. `#voiceSettings` er flyttet til `#settings`, men alle tidligere stemme-ID'er og den sikre Cloudflare-Worker er beholdt.

**Vigtigt:** Felter til `range`, `learning`, `tablesChoice`, `adaptiveCheck`, `boardMode`, `moveDice`, `learnDice`, `gamePace` og `adultDifficultySetting` er under `#gameOptions`. Deres værdier gemmes lokalt med `aeselklog-praferencer-v092`; kun alder/navn/CPU vælges på `#setup`. Adressen og ElevenLabs-secrets må ikke offentliggøres ud over den allerede offentlige Worker-URL.

**Test før ændringer:** `python tests/test_home_v092.py`, `python tests/browser_smoke.py`, `python tests/cpu_voice_browser.py`, `python tests/persistence_browser.py` og alle `node tests/*.test.js`. De tre WebP-illustrationer skal med i GitHub-upload og serviceworker-cache.

---

# ÆselKlog – faste instruktioner for udvikling

**Start altid med aktuelle GitHub `main`, og læs `UDVIKLINGSPLAN.md`, `README.md` og `TESTPLAN.md`.** Brug ikke gamle ZIP-filer uden sammenligning.

## Kode og arkitektur

- `index.html`: UI og design, også mobil landscape og overlays.
- `app.js`: turstyring, CPU, lyd, animationer og tilknytning af gemning/adaptation.
- `savegame.js`: kun lokal gemning (`aeselklog-igangvaerende-v1`) – validerede snapshots og schema-version.
- `adaptive.js`: børnenes individuelle læringsstreak og -trin.
- `engine.js`: alderssikker opgavegenerator, multiplikation og voksen-timer.
- `leaderboard.js`: separat lokal Topscore (`aeselklog-topscore-v1`), uden alder.
- `board.js` og `actions.js`: programmatisk bane, 100 korrekte numre, 25 handlingsfelter.
- `sw.js`: opdatér PWA-cachen ved release.

## Ufravigelige produktbeslutninger

- LEG uden matematik. Opgaver til børn er frivillige og alderspassende fra 3 år. Voksne har 60/30/10 sekunders opgavetid.
- Fysiske og digitale terninger, CPU med egne kast og mulighed for fejl, farvede æsler, appen i fuldskærm på mobil.
- Turorden: annoncer → terning → hop → evt. opgave → bonus → action. Ingen rekursive actionkæder.
- CPU må ikke spille videre, når appen er i baggrunden. Opgavetid skal pause dér.
- ElevenLabs API-nøglen må **ALDRIG** komme i browserkoden eller offentligt GitHub. Worker-adressen er offentlig.
- Hold kaldenavne korte; under AI-tale sendes kun den nødvendige tekst. Gem ikke følsomme data.
- Gem kun ved stabile ture/faser, undgå halvfærdige specialfelter og dobbelt bonus ved genstart.
- Automatisk opgavestyrke styres **pr. barn**, højst ±2, og må ikke tvinge 3–6-årige til svær matematik. Hjælpemidler må ikke give kunstigt høj streak.
- Bevar `prefers-reduced-motion`, farver og skærmlæsermarkeringer.

## Test før release

- `node --check *.js` (eller hver JS-fil separat)
- `node tests/actions.test.js`, `board.test.js`, `flow.test.js`, `tables.test.js`, `leaderboard.test.js`, `savegame.test.js`, `adaptive.test.js`
- `python tests/browser_smoke.py` og `python tests/persistence_browser.py` ved ændringer i UI/game state.
- Prøv fysisk iPhone/iPad med gem/fortsæt, skift app, digital/fysisk terning, voksen-timer og rigtig ElevenLabs.

**Status 14. oktober 2026:** v0.9 udviklet som ZIP ud fra GitHub `main` v0.8-E. Browser- og Node-test bestået; afventer upload og fysisk telefon-/familietest.


## v0.9.1 – CPU-æslets egen stemme

- **Før udvikling:** læs GitHub `main`, ikke kun gamle ZIP-filer. Den seneste udviklingspakke er v0.9.1, men kan mangle live-upload.
- `cpuvoice.js` er et rent modul for stemmevalg og sjove CPU-svarsætninger; `app.js` håndterer oplæsning/ventetid. `index.html` viser et selvstændigt CPU-stemmevalg.
- CPU skal **fortælle sit konkrete svar** og vente på oplæsningens afslutning, før `processAnswer()` afslører resultatet. Det gælder også forkerte svar; den rigtige æsellyd spilles derefter.
- AI-stemmer må kun vælges blandt de stemmer, som allerede er godkendt af Cloudflare `/voices`; ingen API-nøgler i klientkode.
- Bevar 30 % CPU-fejl, nul tvungne læringsopgaver i LEG, adaptive børneopgaver, voksen-timer, saved games og leaderboard.
- Kør `node tests/cpuvoice.test.js`, de øvrige Node-tests og `python tests/cpu_voice_browser.py` med simuleret lyd. Rigtig mobil/ElevenLabs er en separat manuel test.


## v0.9.7 – kildefiler og offline (15. oktober 2026)

- `styles.css` indeholder al tidligere inline CSS fra `index.html`; **husk begge filer** i enhver GitHub-upload og i `sw.js`-cachelisten. Den godkendte `home-fullscreen.webp` må ikke ændres uden brugerens ønske.
- Behold eksisterende taleintegration i `app.js`: egen CPU-stemme, cache, aktiv lyd-annullering og lokal fallback. Indsæt **ikke** eksempelfilen `voice.js` fra forbedringslisten ukritisk.
- Ved AI-netværksfejl/timeout bruges telefonstemmen og en kort genforsøgspause på 60 sekunder. Skift i valgte stemme nulstiller pausen. Secrets forbliver i Cloudflare.
- `sw.js` må kun rydde egne caches (`aeselklog-talstien-*`), ikke alle caches på `github.io`-domænet. App-kode er network-first, medieaktiver cache-first.
- Browserens `set_content`-tests indlæser CSS som inlinet tekst fra `styles.css` for at fungere uden HTTP-server. Kør også `node tests/pwa_cache.test.js` og `python tests/voice_fallback_browser.py`. En rigtig offline-PWA med Service Worker kræver desuden fysisk iPhone-test eller et miljø, der tillader lokal HTTP-test.
