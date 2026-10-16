# 🫏 ÆselKlog – fælles projektstatus

**Opdateret:** 16. oktober 2026 · **Næste komplette udviklingspakke:** v0.9.16 · **Senest verificeret GitHub `main` ved start:** v0.9.15. **v0.9.16 er ikke live, før ZIP-filerne er uploadet til `main`.**

Dette dokument er den korte sandhed om status. Se `UDVIKLINGSPLAN.md` for detaljer, `TESTPLAN.md` for evidens og `IDEKATALOG.md` for beslutninger og forslag. Start altid videreudvikling med en frisk kontrol af GitHub `main` og dokumenternes versionsnumre.

## Digitalt spil – implementeret og lokalt testet

- Godkendt ÆselKlog-forside som én illustration med Spil, Indstillinger, Topscore og Om.
- **Talstien** på digital eller fysisk A3-plade; 100 felter, fem farveområder, roser, actionfelter med skiftende antal/placering (digital), CPU-æsel, terning, lyd og frivillige matematikopgaver.
- **Kortspil** i første lokale digitale pass-and-play-prototype: niveauerne 1–20, 21–40, 41–60, 61–80, 81–100; 2–6 personer, to æselkort-varianter og frivillig ekstra kortstraf.
- Gem og fortsæt i begge spiltyper med **adskilte lokale nøgler**. Talstiens ældre gemninger er fortsat kompatible.
- ElevenLabs via Cloudflare Worker, individuel AI-stemme til spilleleder og CPU, 35 % indledende “Hov hov”, offline reserve via telefonstemme og lokal stemmespecifik lydcache.
- Automatisk, alderssikker individuel matematik i fire fagområder samt lokal forældreoversigt; matematik er **ikke tvunget** i LEG.
- **v0.9.16:** flot spilvælger med to rigtige klikbare valg og **6 navngivne personer + CPU** i Talstien, bevarede savegames.

**Automatiseret kontrol for v0.9.16:** 20 Node-tests og 15 Chromium-browsertests bestået. Tests med rigtig iPhone og live ElevenLabs er endnu ikke udført.

## Stadig åbent og IKKE bekræftet

- Rigtig iPhone-PWA / Safari-WebKit, især serviceworker-opdateringer, offline-genstart, knappers trykflader, talepauser og VoiceOver.
- Ægte ElevenLabs-belastning, lydtimer og credits ved familietest; kun simuleret tale i automatiske regressioner.
- Fuld fysisk A3-sammenligning mod `A.FIELDS` for tidligere print, plus rigtige familietests.
- Det digitale kortspils originale regler er en første prototype; fysiske kort, tryk/æske, fysisk kortspilassistent og måske CPU/kort-oplæsning mangler eller er ikke besluttet.
- Kortene til samtlige fem områder skal færdiggøres fysisk; 21–40 og æselkort er prototypen.
- Før v1.0: sikkerhed, rettigheder, stabilitet, kontrast, fejlrapportering, familietest og minimum test på reelle telefoner.

## Release og næste arbejdsgang

1. Test v0.9.16 lokalt og upload komplet ZIP-indhold til GitHub `main`.
2. Bed brugeren om at teste spilvalg, 6 spillere + CPU og gem/fortsæt på rigtig iPhone.
3. Indsaml konkrete fejl; ret dem før yderligere funktioner. Beslut derefter om næste version er kortspilsforbedringer, fysisk materiale eller v1.0-releasekandidat.
4. Opdater altid README, AGENTS, TESTPLAN, UDVIKLINGSPLAN, PROJEKTSTATUS, IDEKATALOG og Service Worker-cache ved hver ny versionspakke.
