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
