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
