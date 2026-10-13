# 🫏 ÆselKlog – Talstien v0.8-C

**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/  
**GitHub:** https://github.com/driftportal-platform/aeselklog-talstien  
**Status:** v0.8-C er udviklet som pakke til GitHub og testet med automatiske Node-tests. **Den er ikke live, før de nye filer er uploadet**, og skal afprøves på en rigtig iPhone.

## Hvad er nyt i v0.8-C?

Den snoede bane med 100 korrekte tal har nu **25 actionfelter (fem i hvert talområde)**. Nye felter:

| Ikon | Navn | Handling |
| --- | --- | --- |
| 🥕 | Gulerod | Ét ekstra almindeligt terningkast, **maks. én gang i samme tur** |
| 💧 | Vandpyt | Spillerens **næste tur** springes over. Gælder også CPU |
| 🎁 | Overraskelse | Tilfældig gevinst/straf: **+3, +2, −1 eller −2 felter** |
| 🌉 | Bro | Fire felter frem (aldrig forbi målet i valgt talområde) |
| 🎯 | Superopgave | Helt **frivillig**, også i LEG. Alderspassende spørgsmål giver **+3 felter** ved rigtigt svar; nej tak/fejl giver ingen ekstra felter og ingen anden straf |

De gamle actionfelter **Bonus (+2), Hov hov! (−2), Byt og Talmester (+1)** fungerer fortsat. Der er en lille **🎁 Felter**-hjælpemenu på den store spilleplade, og ved specialfelter vises en kort animation med tekst.

### Spilleregler for actionfelter

- Efter almindeligt terningkast bevæger æslet sig først, og en valgt læringsopgave kommer derefter. Actionfeltet afvikles **på slutpositionen** efter en eventuel læringsbonus.
- Et actionfelt udløses **kun én gang**, og et frem-/tilbagehop til et nyt actionfelt aktiverer det **ikke** igen.
- Et ekstra Gulerod-kast kan føre til en ny handling, men **ikke endnu et ekstra Gulerod-kast** samme tur.
- **CPU-æslet** deltager i alle handlinger, også Gulerod, Vandpyt og frivillig Superopgave.
- Læring er altid frivillig. LEG kan spilles uden matematik, og Superopgave kan altid afvises uden straf.
- Der bruges lokale matematikopgaver fra `engine.js` med gradvist sværere opgaver fra 3 år til voksen. Voksne har fortsat deres 60/30/10-sekunders timer.

## Bevarede funktioner

Fuldskærmsbane i liggende mobilformat, touch-zoom og følg æslet; farvede æselbrikker; fysiske/digitale terninger; CPU-modstander der kaster synligt og indimellem svarer forkert; aldersopgaver, voksen-timer, ægte æsellyd og dansk AI-tale med automatisk Cloudflare-adresse, Mia og andre stemmer fra brugerens ElevenLabs-konto.

**Ingen ændringer er nødvendige i Cloudflare Workeren for v0.8-C.** Din ElevenLabs API-nøgle må aldrig uploades til GitHub.

## Upload til GitHub

1. Download og udpak ZIP-filen med v0.8-C.
2. Åbn eksisterende repository `driftportal-platform/aeselklog-talstien`.
3. Upload **alle filerne i roden**, særligt **NYE `actions.js`**, ændrede `app.js`, `board.js`, `index.html` og `sw.js`.
4. Erstat eksisterende filer, og upload dokumenterne `README.md`, `UDVIKLINGSPLAN.md`, `AGENTS.md`. Testfiler kan lægges i `tests/` som de fremgår af ZIP-filen.
5. Vælg **Commit changes** og genindlæs GitHub Pages. En installeret PWA kan skulle lukkes helt og åbnes igen for at hente nyt cache-indhold.

## Tests og begrænsninger

Kør i projektmappen:

```bash
node tests/actions.test.js
node tests/board.test.js
node tests/flow.test.js
```

- ✅ Nodeskript-tests for actionfelter, banenumre og et simuleret spilforløb inkl. CPU.
- ✅ Syntakskontrol (`node --check`) af alle JavaScript-filer.
- ⚠️ **Rigtig browser-/iPhone-test mangler**. Test-browseren i det aktuelle arbejdsmiljø blokerer navigation, så visuel rendering, touch og virkelig lyd kunne ikke gennemtestes her.
- ⚠️ **AI-tale er ikke forbrugs-/integrationstestet i denne pakke**. Den eksisterende Cloudflare-forbindelse er bevaret uændret og fungerer ifølge brugertest.

## Projektstyring

Læs [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md) og [AGENTS.md](./AGENTS.md) før næste ændring. Næste udviklingsfase: **v0.8-D – mere levende lyd, animationsfeedback og bedre tilgængelighed**.
