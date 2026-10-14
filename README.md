# 🫏 ÆselKlog – Talstien v0.8-D

**App:** https://driftportal-platform.github.io/aeselklog-talstien/  
**Repository:** https://github.com/driftportal-platform/aeselklog-talstien  
**Status:** Denne v0.8-D er en **udviklet prøvepakke til manuel GitHub-upload**. Den er endnu ikke automatisk udgivet på GitHub Pages.

## Nyheder i 0.8-D

1. **Gangetabeller og valgfri TABELTRÆNING:** Under spilopsætning kan I vælge én bestemt gangetabel fra 2 til 12, en blanding eller automatisk opgavemiks. Vælges TABELTRÆNING, kommer en opgave hver tur uden først at kaste læringsterningen. I LÆR/UDFORDRING kan tabelopgaver også dukke op ved regne-siden på terningen. De yngste (3–6 år) beholder alderspassende talopgaver og enkle plus/minus-regnestykker.
2. **Roligere tempo:** Vælg *Normalt*, *Roligt* (standard) eller *Ekstra roligt*. Æsler hopper nu langsommere fra felt til felt. CPU-æslet venter på, at AI-/telefonoplæsningen er **færdig**, før det svarer eller kaster igen.
3. **Oplæsning styrer spilflowet:** Også den almindelige flytning afventer den korte annoncering af slaget. Feedback ved rigtigt svar afventer tale, og ved fejl afventes den ægte æsellyd. **Voksnes opgavetimer starter først, når oplæsningen er færdig.** Lyden kan stadig slås fra, og afbrudt tale spærrer ikke spillet.
4. **🏆 Topscore:** Åbn listen fra opsætningen eller den store spilleplade. Vis de mest vindende spillere, antal gennemførte spil og antal rigtige svar. Et afsluttet spil tælles én gang for alle deltagere, også CPU. Resultater gemmes **kun i browserens lokale lager**, uden navn/aldersdata til en server. Brug kaldenavne. Der er en knap til at slette listen.

## Eksisterende funktioner – beholdt

- Fuldskærms, snoet 1–100-bane med fem talområder og 25 specialfelter.
- Fysisk/digital almindelig terning og læringsterning, synlig CPU-terning og farvede æselbrikker.
- Gulerod, vandpyt, overraskelse, bro, superopgave samt de klassiske felter.
- Almindeligt spil (LEG) **uden påkrævet matematik**.
- Aldersopgaver til børn fra 3 år; voksne vælger sværhedsgrad med 60/30/10 sekunder.
- ElevenLabs Mia og andre godkendte stemmer via eksisterende Cloudflare-Worker. Der bruges **samme adresse** som før, uden adressefelt og uden nye secrets.
- Ægte æsellyd ved fejl og indbygget dansk telefonstemme som reserve/offline.

## Upload til GitHub

1. Pak ZIP-pakken ud.
2. Upload alle appfiler i ZIP'ens rod til repository **`driftportal-platform/aeselklog-talstien`**, og erstat filer med samme navn. Den nye **`leaderboard.js`** skal også med.
3. Upload `tests/` (valgfri for selve appen, god idé for projektstatus), `README.md`, `UDVIKLINGSPLAN.md` og `AGENTS.md`.
4. Commit ændringerne og genindlæs GitHub Pages på telefonen. PWA-cachen hedder nu `aeselklog-talstien-v08d-tables-voice-topscore`.

**Cloudflare skal IKKE opdateres** for denne version. Du må ikke uploade API-nøgler til GitHub.

## Sådan tester du på telefonen

- Vælg TABELTRÆNING + 7-tabellen, og tjek, at næste opgave efter et slag er i 7-tabellen. Prøv også *2-tabellen* og *Bland tabellerne*.
- Prøv et barn på 6 år, som stadig skal få enkle regneopgaver uden tidspres.
- Sæt tempoet til *Ekstra roligt*, og spil mod Æslet. Lad Mia læse helt færdigt; prøv også at slå lyd fra.
- Vælg en voksen på sværere niveau og kontroller, at nedtællingen først starter, efter talen er færdig.
- Gennemfør et kort spil, og kontrollér at sejre og antal rigtige svar dukker op under Topscore. Genstart appen og tjek, at de stadig er der.
- Prøv den ægte æsellyd ved et forkert svar.

## Tests udført lokalt

- Node: `tests/board.test.js`, `actions.test.js`, `flow.test.js`, `tables.test.js`, `leaderboard.test.js`.
- Chromium via indlæst HTML (lokal webnavigation er blokeret i testmiljøet): mobil-landscape fuldskærm, åbning af Topscore, almindelig tur og CPU-tur, tabeltræning og ingen JavaScript-fejl i de gennemgåede cases.
- Tale: simuleret AI-lyd, hvor Promise først afsluttes når lyden slutter; afbrydelse frigiver forløbet straks (`tests/speech.test.py`).

**Mangler:** Reel iPhone-test og live ElevenLabs-latens/lydkvalitet efter denne opdatering; rigtig lokal top-score-lagring er dækket af unit tests, men bør også prøves på iPhone. Ingen ny Cloudflare-/API-opsætning er nødvendig.

## Projektstyring

Læs altid [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md) og [AGENTS.md](./AGENTS.md) før nye ændringer. Næste fase: **v0.8-E – samlet test, fejlrettelser og finpudsning**.
