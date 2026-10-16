# 🫏 ÆselKlog – fælles projektstatus v0.9.19

**Dato:** 16. oktober 2026. **GitHub `main` ved udviklingsstart:** verificeret v0.9.18. **Ny lokal pakke:** v0.9.19, ikke automatisk uploadet, ikke fysisk iPhone-testet. Projektet skal fortsættes fra nyeste `main` og disse dokumenter.

**Automatisk teststatus:** 23 Node- og 18 Chromium-browsertests bestået med simuleret tale. Rigtig iPhone og ElevenLabs står stadig åbent.

## Implementeret i v0.9.19

- Tre brugerleverede, optimerede MP3-melodier i `music/` til begge spil: Gone Fishin', Children's March Theme og Beary Fishy Menu Screen, cirka 4,7 MB i alt. Tilhørende CC0-dokumentation i `MUSIC-LICENSES.md`.
- Fælles og huskede musikindstillinger (tænd/sluk, lydstyrke, melodi), offline precache samt Safari-kompatible HTTP-206 Range-svar; Web Audio-lydstyrke og automatisk dæmpning ved tale.
- Fælles CPU-stemme i Talstien og Kortspil med automatisk præference for den originale ÆselKlog-stemme, **kun når den vises som godkendt fra Cloudflare**. Tidligere manuelle valg respekteres. CPU-stemmeskift nulstiller cooldown efter AI-fejl.
- V0.9.18-funktionerne uændrede: Godkendt forside, to spiltyper, kompakt kortbord, korttræk, CPU og straf, lokal gemning, Talstien-bræt, læring, forældreoversigt og lydcache.

## Fortsat utestet eller åbent

- Installeret fysisk iPhone-PWA: offline MP3 med Range, autoplay/user gesture, faktisk lydstyrke, stemme i Kortspil, pause ved tale, SW-cacheopdatering. Node og Chromium alene beviser ikke dette.
- Live Cloudflare `/voices`-liste: original ÆselKlog-stemme kan kun vælges automatisk hvis ID'et faktisk er tilgængeligt dér. Kreditter/ElevenLabs testes manuelt.
- Den korte The Reel Winner-fil (5,2 s) er et muligt vinderlyd-forslag, **ikke** integreret i denne release.
- Familietest, endelig fysisk A3/kortproduktion, VoiceOver og kontrol af billeder/lydlicenser før v1.0.

## Næste arbejdsgang

1. Upload ZIP-indholdet fra v0.9.19 til GitHub `main`, herunder `music/` og `MUSIC-LICENSES.md`.
2. Kontrollér PWA online én gang, test flytilstand/offline og alle tre melodier. Prøv CPU-æslets stemme i begge spil og bekræft 1:1-stemmerne.
3. Registrér iPhone- og familiefeedback i `TESTPLAN.md` og `IDEKATALOG.md` før næste featurebeslutning.

---

# 🫏 ÆselKlog – projektstatus v0.9.18

**Opdateret:** 16. oktober 2026. **Senest verificerede GitHub main ved start:** v0.9.17. **Ny komplet releasepakke:** v0.9.18, lokal ZIP (ikke automatisk uploadet). Spillet og dokumenterne fortsættes altid fra nyeste GitHub main.

## Færdigkodet og regressionstestet

- Godkendt 1:1-forside samt to valgfrie spiltyper: **Talstien** (digital/fysisk A3) og **Kortspil** (alle fem talområder). Matematik er altid frivillig.
- Talstien: op til seks menneskespillere + CPU, specialfelter, terninger, individuelle læringstrin, forældreoversigt, to slags plade, lyd/ElevenLabs og selvstændig savegame.
- Kortspil: 1–6 personer + evt. CPU, egne gemte spil, to æselkortvarianter, fri kortplacering, indsigelse/fortrydelse og straf. **v0.9.18** har kompakt kortbord uden separat Dit kort-boks, tap/træk fra lukket bunke og fortæller/CPU-stemmer fra de fælles indstillinger.
- Fælles **valgfri baggrundsmusik** med tre offline/Web Audio-melodier, lydstyrke, tænd/sluk og dæmpning under stemmer. Slukket som standard.
- PWA-cache med sikker `response.clone`-håndtering, stemmespecifik lydcache og lokallagring uden automatisk synkronisering eller API-secrets.
- **Automatiske prøver:** 22 Node-tests + 17 Chromium-browsertests bestået. Ingen ægte ElevenLabs-kald i tests.

## Ikke bekræftet / mangler

- Fysisk iPhone-PWA/WebKit, touch-træk over rulning, ægte musiklyd og tale/credits; lokal HTTP-test stoppes af `ERR_BLOCKED_BY_ADMINISTRATOR`.
- Familietest og balance af CPU's fejl/detektion, kortspilsregler og pædagogisk sværhedsgrad.
- Trykklare kort i de øvrige områder, kortæske/spilleregler og sammenligning af den trykte A3-plade med faste specialfelter.
- Sikkerhed/tilgængelighed/VoiceOver, original lyd-/billedrettighed, offline-PWA-opdatering og stabil v1.0-release.

## Næste handling

Upload alle projektfiler fra den komplette v0.9.18 ZIP til GitHub, test på iPhone og notér konkrete fejl fra familietest. Se `IDEKATALOG.md` for besluttede og kommende funktioner.

---

# 🫏 ÆselKlog – fælles projektstatus v0.9.17

**Opdateret:** 16. oktober 2026 · **Senest bekræftet GitHub `main` før ny kode:** v0.9.16 · **Ny udviklingspakke:** v0.9.17, lokalt udviklet og automatisk testet, **ikke uploadet til GitHub af assistenten**. Korrekt kilde ved ny udvikling er altid aktuel `main` og de seks projektdokumenter. Dokumentationen opdateres sammen med PWA-cache ved hver release.

## Implementeret og automatiseret testet

- **Talstien:** Den godkendte illustration på forsiden, 100 felter, digital eller fysisk A3-plade, op til seks menneskelige deltagere + CPU, fysisk/digital terning, ni specialfelttyper, tilfældige specialfelter digitalt og faste ved fysisk A3, pause/fortryd, gem/fortsæt.
- **Stemmer:** ElevenLabs gennem Cloudflare Worker uden offentlige secrets, separat CPU-stemme, 35 % Hov hov-varianter, lokal stemmespecifik lydcache og gratis/offline telefonstemme som reserve.
- **Læring:** Valgfri LEG, talforståelse/plus/minus/tabeller med individuelle trin, lokale profiler og forældreoversigt uden konto.
- **Kortspil:** Alle fem talområder, 100 talkort per område, 4/6/8 beholdte æselkort eller ét vandrende, valgfri ekstra straf, 2–6 mennesker eller **1–6 mennesker + CPU**, lokalt gemt spil med adskilt nøgle.
- **v0.9.17:** Kort vendes ved tryk på lukket bunke. Vendt/åbent kort kan trækkes eller vælges og tappes på en målbunke. Regelmæssigt forkerte træk blokeres ikke. En opdaget fejl udfordres via synligt æselkort, fortryder *seneste* ugyldige træk og giver æselstraf. CPU kan også opdage fejl og kan begå egne fejl.

**Automatisk test:** 21 Node-tests og 16 Chromium-browsertests bestået. Tests bruger simulerede lyde og lokallager, ikke fysisk iPhone/iOS. Service Worker-testen er en unit/mock-test.

## Mangler eller er ikke verificeret

- Fysisk iPhone-PWA, iOS Safari/WebKit/VoiceOver, mobiltræk med automatisk rulning, offline-genstart og cache-udskiftning; test på den installerede app.
- Reel ElevenLabs-kreditmåling, opdatering og fallback i fysiske telefonmiljøer.
- Kortspilsfamilietest: korttræk, regler for afsløring af fejl, tempo for solo-CPU, antal fejl per kamp, og om "Opdaget fejl"-kortet er let at finde.
- Sammenlign faste A3-specialfelter i appen med de faktisk trykte A3-plader.
- Fysiske trykklare kort 1–20, 41–60, 61–80 og 81–100 samt endelig regelbog og æske. 21–40-/æselkortprototyper eksisterer.
- Endelig sikkerheds-, tilgængeligheds- og familieafprøvning før v1.0.

## Arbejdsgang ved næste udvikling

1. Upload alle filer fra v0.9.17-arkivet, ikke blot ZIP-filen, til GitHub `main`.
2. Prøv Kortspil med ét navn + CPU. Tryk på bunken, læg bevidst forkert i midten, udfordr med æselkortet, og test gem/fortsæt.
3. Test resten af Talstien på rigtig iPhone og dokumentér konkrete fejl eller ønsker.
4. Indsamlede idéer og beslutninger står i `IDEKATALOG.md`. Start hver ny release med at kontrollere `main`, README, TESTPLAN, AGENTS, UDVIKLINGSPLAN, PROJEKTSTATUS og IDEKATALOG.


## v0.9.20 – taloplæsning i Kortspil
Ved vending og placering af talkort udtaler stemmen nu kortets tal i stedet for generiske vendinger som »Jeg vender et kort« og »Kortet er lagt«. CPU kan sige »Æslet lægger [tal]«. Eksisterende fælles stemmevalg, musik og offline-aktiver er bevaret. Kontrollér på fysisk iPhone efter upload.
