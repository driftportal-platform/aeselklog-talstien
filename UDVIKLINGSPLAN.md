# ÆselKlog – udviklingsplan og fælles projektstatus

> Dette er vores **eneste løbende status- og planlægningsfil**. Læs nyeste GitHub-`main` + `README.md` + `AGENTS.md`, før du udvikler videre. Opdater status, tests og kendte fejl efter hver version.

**Opdateret:** 13. oktober 2026  
**Sidst bekræftet på GitHub `main` før ændringen:** v0.8-C  
**Ny lokal udviklingspakke:** v0.8-D, **endnu ikke bekræftet live**  
**Næste fase:** v0.8-E, samlet mobiltest og polering  
**Repository:** https://github.com/driftportal-platform/aeselklog-talstien  
**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/

## Nyeste status – v0.8-D (13. oktober 2026)

**Bygget i separat ZIP, endnu ikke live**, med udgangspunkt i den v0.8-C-kode, der ligger i GitHub `main`.

- [x] TABELTRÆNING hver tur og valgfri 2–12-tabel, alle tabeller eller automatisk blanding. Treårige til seksårige får fortsat nemme opgaver.
- [x] Roligt tempo som standard samt Normalt/Ekstra roligt. Hop er langsommere. CPU afventer, at der er *reelt afsluttet tale*, ikke blot en fast 2-sekunders forsinkelse.
- [x] Flytning afventer kort oplæsning af slag; korrekt-svar-feedback afventer tale og forkert svar afventer æsellyd. Voksen-nedtælling begynder efter oplæsning.
- [x] Topscore med sejre, gennemførte spil og rigtige svar gemt på enheden via `leaderboard.js`. Intet login eller cloud-lager; kun kaldenavne og statistik gemmes.
- [x] Kodekontrol, Node- og Chromium-smoketests inkl. simuleret AI-lyd og tabelopgaver.
- [ ] Upload v0.8-D på GitHub, kontrollér den nye PWA-cache og afprøv reel ElevenLabs-oplæsning på iPhone.
- [ ] Test at en gennemført kamp gemmes og genfindes i topscoren efter genåbning på iPhone.

**Vigtigt:** Den eksisterende Cloudflare Worker er **uændret**; den nye løsning bruger samme stemmevalg og serveradresse som v0.8-C.

---

## 1. Grundidé – beslutninger vi bevarer

- ÆselKlog er et originalt familiespil med fysisk kortspil, fysisk A3-spilleplade og en valgfri digital app.
- **Læringsopgaver skal altid være frivillige.** En LEG-variant uden matematik er obligatorisk.
- Fem lysfarvede talområder: 1–20, 21–40, 41–60, 61–80, 81–100; alle tal én gang og korrekt rækkefølge.
- Fysiske kort: 63 × 88 mm. Foreløbig produktidé: 5 af hvert tal og 8 æselkort pr. talområde. Alle kort kan læses i begge ender.
- Spillere får navn (helst kaldenavn), alder og farvet æselbrik. Børn fra 3 år med lette opgaver, 5–6 år også enkel plus/minus; ældre får gangetabeller, primtal og hovedregning.
- Børn **uden tidspres** som standard. Voksne: 60 / 30 / 10 sekunder efter sværhedsgrad.
- Fysiske eller digitale terninger, CPU-Æsel som kaster synligt og svarer forkert en del af tiden.
- Fuldskærms-snoet bane på mobil, automatisk fokus på æslet, zoom/pan, terninge-/opgavepanel som overlay.
- Ægte æsellyd ved forkerte svar, AI-stemmer fra ElevenLabs via Cloudflare Worker, offline telefonstemme som fallback. **Ingen secrets i GitHub**.

## 2. Versionsoversigt og fremdrift

| Fase | Indhold | Status |
| --- | --- | --- |
| 0.8-A | Korrekt SVG-bane 1–100, bondegård, touchzoom | ✅ På GitHub og videreført |
| 0.8-B | Fuldskærms-spilleplade, terning → hop → læring → bonus → action | ✅ På GitHub og videreført |
| 0.8-B.1 | Automatisk ElevenLabs-URL og stemmevælger (Mia + andre) | ✅ På GitHub, **bekræftet af bruger at virke** |
| **0.8-C** | **Nye actionfelter med regler, feedback og CPU-adfærd** | ✅ Bekræftet i GitHub `main`; brugerprøve af alle felter anbefales |
| **0.8-D** | **Gangetabeller, roligere CPU/tale, Topscore og langsommere hop** | ✅ Bygget og testet lokalt; mangler upload/live iPhone-test |
| 0.8-E | Helhedstest mobil, alder, CPU, lydforbrug og release | ⬜ Ikke startet |
| 0.9 | Gem/fortsæt spil, adaptiv læring og test med familier/Hyggeonkel | 📋 Fremtidig idé |

## 3. V0.8-C – regler og handlinger

**Alle specialfelter skal beholde deres tal på banen. 25 felter fordelt 5 i hvert talområde.** Felter og effektgrundlag ligger samlet i `actions.js`, tegningen i `board.js` og handlingen i `app.js`.

| Talområde | Specielle felter (tal: handling) |
| --- | --- |
| 1–20 | 5: Bonus · **7: Gulerod** · 10: Hov hov · 15: Byt · **16: Vandpyt** |
| 21–40 | 24: Talmester · **27: Overraskelse** · 29: Bonus · 35: Byt · **37: Bro** |
| 41–60 | 44: Bonus · **47: Gulerod** · 50: Talmester · 55: Hov hov · **57: Superopgave** |
| 61–80 | 64: Hov hov · **67: Vandpyt** · 69: Bonus · 75: Byt · **78: Overraskelse** |
| 81–100 | 84: Bonus · **86: Gulerod** · 90: Hov hov · **93: Superopgave** · 95: Talmester |

### Vigtige spilleregler

- ⭐ Bonus +2, 🫏 Hov hov −2, 🔄 Byt plads, 🏆 Talmester +1 (gamle felter).
- 🥕 Gulerod: **ét ekstra almindeligt kast** med animation; højst én bonusrulle pr. tur, også for CPU.
- 💧 Vandpyt: **stå over præcis den næste tur**; status vises ved spillerens navn. CPU springer også over.
- 🎁 Overraskelse: tilfældig +3, +2, −1 eller −2 felter; ekstra flytning vises.
- 🌉 Bro: +4 felter; stop ved talområdets slutning.
- 🎯 Superopgave: **altid frivillig**, også i LEG. Passende for alder; korrekt svar → +3 felter, forkert/nej tak → ingen straf eller ekstra felter. Den voksne spiller får normal tidsgrænse.
- Alle actionflytninger respekterer start og mål; **de udløser ikke nye specialfelter** på destinationen. En ekstra gulerodsrulle er en selvstændig turdel og må udløse andre specialfelter – blot ikke flere gulerodsruller.
- Action udføres **efter almindeligt kast → bevægelse → valgt læringsterning → eventuel læringsbonus**. På actionfelt vises kort animation/tekst og én relevant stemmereaktion, så vi sparer ElevenLabs-credits.

## 4. Kodeorganisation

| Fil | Ansvar |
| --- | --- |
| `index.html` | Skærm, layout, specialfelt-menu og animationslag |
| `board.js` | Programmatisk SVG-bane, 100 nummererede felter og actionikoner |
| `actions.js` | **NY:** Specialfelter, beskrivelser, overraskelser og bevægelsesgrænser |
| `app.js` | Spilflow, tur-rækkefølge, CPU, actions, stemmevalg og animation |
| `engine.js` | Lokale, aldersbestemte matematikopgaver og voksentimer |
| `sw.js` | Offline-cache; husk at øge cachens version ved opdateringer |
| `donkey-bray.wav` | Ægte æsellyd ved forkert svar |
| `aeselklog-card.webp` / `icon.svg` | Spillets maskot og ikon |
| `tests/` | Node-tests af bane, actionmotor og spilflow |

## 5. Teststatus og åbne kontrolpunkter

- [x] 100 heltalsfelter 1–100 og sammenhængende zigzag-bane kontrolleret (Node).
- [x] 25 specialfelter og 9 handlingstyper kontrolleret (Node).
- [x] Overraskelse +3/+2/−1/−2 og klampning ved områdegrænser kontrolleret (Node).
- [x] Gulerod kun én ekstra turdel; nulstilling næste tur (simuleret Node-spilflow).
- [x] Vandpyt springer en enkelt efterfølgende tur over (simuleret Node-spilflow).
- [x] Bro, superopgave, valgfrit nej tak og +3 ved korrekt svar (simuleret Node-spilflow).
- [x] CPU-bonus og CPU-superafslag (simuleret Node-spilflow).
- [x] `node --check` på ny JS, `node tests/actions.test.js`, `node tests/board.test.js`, `node tests/flow.test.js`.
- [ ] **Gennemspil alle specialfelter på rigtig iPhone i liggende format.** Browsernavigation i udviklingsmiljø er blokeret, så fuld visuel browsertest er ikke gennemført.
- [ ] Kontrollér CPU'ens automatiske ekstra terningkast og tur der springes over på rigtig telefon.
- [ ] Afprøv 3-årige børn, 5–6-årige og voksen-timer under actionquizzer.
- [ ] Bekræft AI-tale, æsellyd og om taleafbrydelser/forbrug er acceptable i dette release.
- [ ] Bekræft PWA-cachen v0.8-D på mobil efter upload.

## 6. Opfølgning efter v0.8-D

- Glattere og sjovere terninge-/æselanimationer, vinder-confetti og synlig belønning.
- Klarere opgave-overlays og hjælp til de yngste uden at skjule brættet.
- Bedre timing i AI-tale og handlinger; understøt altid lyd fra/til og gentagelse.
- Børnevenlige, letlæselige kontroller, sikkerhed ved hurtige tryk, reduceret bevægelse.
- Mulige senere felter: staldpause/skjold, hjælp en ven, æselhop, ekstra banetemaer.

## 7. Arbejdsgang ved næste version

1. Hent **aktuel GitHub `main`** før ændringer. Læs `AGENTS.md`, `README.md`, denne fil og de relevante JS-filer.
2. Verificér faktisk versionsnummer og hvad der er live/implementeret/testet. Bevar tidligere funktioner og appens Cloudflare-forbindelse.
3. Udvikl ændringen i små, kontrollerbare trin, og kør relevante tests.
4. Opdatér roadmap, README, versionsnummer og serviceworker-cache. Del ZIP/commit og vær åben om utestede funktioner.
5. Del ALDRIG ElevenLabs-secrets; brug kaldenavne til børn, og kontroller rettigheder før salg.

## 8. Version 0.8-E – foreløbige testpunkter

- Afprøv reel iPhone lyd/taletiming (AI, fallback, CPU, rigtigt/forkert svar), og tilpas eventuelle lange pauser.
- Afprøv Topscore efter et afsluttet spil og efter lukning/genåbning; dokumentér at lokal lager kan slettes uden at påvirke spillet.
- Test alle læringsniveauer fra 3 år til voksen inkl. valgte tabeller, blandede regnestykker, tidsgrænser og LEG.
- Test gang, vandpyt, ekstra kast, bro, overraskelse, superopgave og CPU sammen.
- Eventuelt tilføje diskret konfetti, sejrsanimation og reduceret animationstilstand.
