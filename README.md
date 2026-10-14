# 🫏 ÆselKlog Talstien – v0.8-E (samlet spiltest)

**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/  
**GitHub:** https://github.com/driftportal-platform/aeselklog-talstien  
**Dato:** 14. oktober 2026  
**Udgivelsesstatus:** Lokal v0.8-E-pakke klar til manuel upload; **ikke automatisk live**. Ved udviklingsstart var GitHub `main` stadig på **v0.8-C**. Denne pakke er derfor baseret på det seneste v0.8-D-arkiv, som indeholder de nye tabelopgaver og topscoren.

## Kort fortalt

ÆselKlog er en farverig talsti med frivillig læring fra cirka 3 år til voksen. Spil med digitale eller fysiske terninger, læringsterning og en valgfri CPU-modstander. Alle 100 felter har korrekte numre, og de 25 actionfelter er fælles for mennesker og CPU. LEG kan spilles helt uden regneopgaver.

### Denne pakke indeholder BÅDE v0.8-D og v0.8-E

**Det, der kom i v0.8-D og er bevaret:**

- **TABELTRÆNING** hver tur med 2–12-tabellen, én bestemt tabel eller blanding. De yngste får fortsat alderspassende opgaver frem for svære gangestykker.
- Tre tempoer: **Normalt**, **Roligt** og **Ekstra roligt**. CPU venter på afsluttet oplæsning, og farvede æsler hopper langsommere.
- **Topscore**, der gemmer kaldenavne, antal spil, sejre og korrekte svar **kun lokalt på enheden**.
- ElevenLabs Mia og andre valgte AI-stemmer via den eksisterende Cloudflare-Worker; lokal telefonstemme som fallback. Den rigtige æsellyd ved fejl er fortsat indbygget.

**Forbedringerne i v0.8-E:**

- ⏸️ **Fair voksen-timer:** Hvis iPhone skifter til en anden app, låses eller browseren går i baggrunden, sættes tidsfristen på pause, indtil spillet er aktivt igen.
- 🫏 **CPU- og brikbevægelse stopper midlertidigt i baggrunden** og fortsætter, når spillet vises igen. Det hindrer, at CPU'en spiller videre, mens man ikke kigger.
- 🥕 **Actionbeskeder vises, mens æslet taler**, i stedet for automatisk at forsvinde midt i forklaringen.
- 🎉 **Lille vinderfejring** med stjerner/gulerødder, som automatisk deaktiveres for brugere, der har valgt reduceret animation.
- 🏆 **Vindervinduet** viser antal rigtige svar og knappen *Se topscore*.
- 🧪 Flere tests af fuldskærm i mobilformat, fysisk terning, læringsopgaver, CPU, baggrundspauser, voksen-timer, afslutning og topscore.

## Upload til GitHub

1. Udpak denne ZIP på computeren.
2. Åbn https://github.com/driftportal-platform/aeselklog-talstien.
3. Upload **alle filer fra ZIP-pakkens rod** og erstat filerne med samme navn. Husk især **`leaderboard.js`**, som ikke findes i den ældre v0.8-C.
4. Upload gerne **`tests/`** og `TESTPLAN.md` som dokumentation (de påvirker ikke gameplay).
5. Vælg *Commit changes*. Kontrollér derefter hjemmesidens versionsmærke **0.8-E** og genindlæs appen, hvis en gammel version stadig vises.

**Cloudflare:** Ingen ny konfiguration er nødvendig. Bevar din eksisterende Worker og API-secrets. Læg aldrig en API-nøgle i dette offentlige GitHub-repository.

## Kodeoversigt

| Fil | Funktion |
| --- | --- |
| `index.html` | Layout, kort, fuldskærms-spilleplade, vinderanimation |
| `app.js` | Hele spilforløbet, CPU, visning, stemmer, animation og fair baggrundstiming |
| `engine.js` | Alderspassende matematik, primtal og gangetabeller |
| `board.js` | Den tegnede 1–100-bane og farvekoder |
| `actions.js` | Specialfelter og regler |
| `leaderboard.js` | Lokal topscore uden server |
| `sw.js` | PWA-cache – nu `aeselklog-talstien-v08e-quality` |
| `donkey-bray.wav` | Ægte æsellyd |
| `UDVIKLINGSPLAN.md` / `AGENTS.md` / `TESTPLAN.md` | Status, vedligehold og manuel test |

## Tests udført 14. oktober 2026

- ✅ **Node**: `tests/actions.test.js`, `tests/board.test.js`, `tests/flow.test.js`, `tests/tables.test.js`, `tests/leaderboard.test.js`.
- ✅ **JavaScript-syntaks**: alle appfiler med `node --check`.
- ✅ **Chromium-browser-test**: mobil liggende (844 × 390), mobil stående (390 × 844), desktop (1280 × 800). Gennemført terning → læring → svar → resultat uden JavaScript-fejl.
- ✅ **CPU-test**: synligt kast og turafvikling; simuleret baggrundsskift stopper næste handling, indtil appen vises igen.
- ✅ **Voksentimer**: simuleret appskift, hvor nedtællingen holder pause og derefter fortsætter.
- ✅ **Sejr og topscore**: et gennemført testspil skriver et resultat til et simuleret lokalt lager; *Se topscore* åbner listen.
- ✅ **Vinderanimation**: vist i headless Chromium med bevægelser aktiveret.

**Testmetode:** Chromium-koden blev indlæst lokalt uden rigtige API-kald. Der blev brugt simuleret tale samt lokal-lager-simulering i testen. Filerne i ZIP'en er den rigtige webapp, men dette er **ikke** en endelig iPhone-/live-ElevenLabs-test.

## Hvad mangler stadig?

- ⚠️ Test på rigtig iPhone/iPad, især skærmrotation, touch og afbrydelser ved låseskærm.
- ⚠️ Afprøv konkret ElevenLabs-stemme og æsellyd med den nye timing under en længere spilrunde samt eventuelt forbrug.
- ⚠️ Gennemspil med børn og voksne og få feedback på tempo, sværhedsgrad og actionfelter.
- ⚠️ Kontrollér, at Topscore stadig er der efter lukning og genåbning på den **samme** enhed; den synkroniserer ikke mellem telefoner.
- ⚠️ Produktet er fortsat en prototype og ikke klar til kommerciel lancering uden rettigheds-, sikkerheds- og brugertest.

## Næste fase

**v0.9:** Gem og fortsæt spil, adaptiv opgavesværhedsgrad efter tidligere svar, valgfri forældrestatistik og familieafprøvning. Brug `UDVIKLINGSPLAN.md` som projektets opdaterede facit og `TESTPLAN.md` som mobil-tjekliste.
