# ÆselKlog Talstien – v0.8-B: fuldskærmsplade og flydende spil

**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/  
**Kode:** https://github.com/driftportal-platform/aeselklog-talstien  
**Status:** v0.8-B er udviklet og browserafprøvet lokalt. **Den er ikke live før ZIP-filerne er uploadet til GitHub.**

## Det nye i v0.8-B

- Når spillet starter, bliver **den snoede ÆselKlog-bane automatisk hovedskærmen** – den fylder hele browserens skærmareal i både mobilens liggende og stående format.
- **Spillerstatus og knapper ligger på spillepladen.** Brug **✕ Luk** for at gå til det gamle kontrolpanel uden at nulstille spillet; brug **Stor plade** for at åbne igen.
- **Terninger, opgaver, svarmuligheder og Næste spiller** vises i overlays oven på spillepladen. Intet sideskift mellem turene.
- Banen fokuserer på aktivt æsel og beskærer om nødvendigt en del af landskabet, så den fylder hele skærmen. Træk, knib-zoom, zoomknapper, **Find æslet** og **Hele banen** fungerer fortsat.
- **Rigtig rækkefølge:** annoncer tur → almindelig terning → æslet hopper felt for felt → evt. læringsterning/opgave → korrekt svar giver ét ekstra hop, forkert svar giver æselskry → specialfelt på slutpositionen → Næste spiller.
- CPU-æslet viser stadig sit eget digitale kast, kan svare forkert og flytter sin farvede brik. Børn har ingen tidsgrænse, voksne kan stadig spille med tidspres.
- De hidtidige fire specialfelter er bevaret. **Nye actionfelter kommer først i 0.8-C.**
- Dansk telefonstemme, Cloudflare/ElevenLabs-tilvalg og rigtig æsellyd er ikke ændret.

## Sådan opdaterer du på GitHub

1. Download ZIP, og pak den ud.
2. Upload filerne til roden af repository `driftportal-platform/aeselklog-talstien` og erstat filerne med samme navne. Upload `tests/board.test.js` til **tests/**.
3. Sørg for, at `index.html`, `app.js`, `board.js`, `engine.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `aeselklog-card.webp`, `donkey-bray.wav`, `README.md`, `UDVIKLINGSPLAN.md` og `AGENTS.md` ligger samme sted som før.
4. Vælg **Commit changes** på branch `main`, åbn GitHub Pages og opdatér siden. Ved gammel version: luk hjemmeskærmsappen helt og åbn igen, så serviceworker kan opdatere.

## Browser- og logiktest

- ✅ 100 unikke tal, fem korrekt vendende rækker: `node tests/board.test.js`.
- ✅ Fuldskærms visningsmål: **844×390 mobil landscape, 390×844 portrait og 1280×800 desktop**.
- ✅ Digital terning-overlay, X-luk/genåbn og bevarelse af spilstatus.
- ✅ Fysisk terning, LEG: START → 5 → Bonus +2 → felt 7.
- ✅ UDFORDRING: START → 3 **før** opgaven; korrekt svar → felt 4.
- ✅ CPU-spiller får en synlig terning efter næste tur.
- ✅ Ingen JavaScript-fejl i de afprøvede Chromium-forløb.
- ⚠️ Rigtig iPhone Safari/hjemmeskærms-PWA og ElevenLabs-stemme er endnu ikke afprøvet i denne release. Mere fuldstændige CPU- og voksentimertests følger senere.

## Næste udvikling

Læs altid [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md) og [AGENTS.md](./AGENTS.md) før videre arbejde. **v0.8-C** tilføjer nye actionfelter som Gulerod, Vandpyt og Overraskelse. **v0.8-D** er finpudsning af animationer, tale og feedback; **v0.8-E** er samlet mobiltest og fejlrettelser.

**API-hemmeligheder:** Ingen ElevenLabs-nøgler må lægges i dette offentlige repository. Cloudflare Worker gemmer dem som Secrets.
