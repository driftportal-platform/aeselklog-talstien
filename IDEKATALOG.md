# 🫏 ÆselKlog – idékatalog og godkendte beslutninger

**Opdateret:** 16. oktober 2026 · **Kilde:** Senest kontrollerede GitHub `main` v0.9.16 og aftaler fra udviklingsforløbet. Ny lokal udviklingspakke v0.9.17. Se `PROJEKTSTATUS.md` for faktisk status, `TESTPLAN.md` for gennemførte tests og `UDVIKLINGSPLAN.md` for rækkefølge.

## Faste produktbeslutninger

- ÆselKlog er både **selvstændigt kortspil** og **Talstien** på digital eller fysisk A3-plade; intet krav om matematik i de almindelige spil. Fem talområder i de samme farver: 1–20, 21–40, 41–60, 61–80, 81–100.
- De fysiske talkort er 63×88 mm; ét niveau består af **fem af hvert tal** (100 talkort). Prototyperne 21–40 har lige/ulige, tiere/enere og primtal; der er lavet otte æselkort.
- **Klassisk kortspil:** 4, 6 eller 8 æselkort (standard 8). Opdaget fejl giver et æselkort, som beholdes. **Drillevariant:** Ét æselkort går videre til den senest straffede. Valgfri ekstra straf (fra hver modspillers lukkede bunke) er slået fra som standard.
- **Kortspil v0.9.17:** Som i det gamle fysiske Æselspil vælger spilleren selv bunken, uden automatisk ulovlighedsblokering. Kort kan vendes ved tryk på lukket bunke og trækkes fra vendt kort/egen åben bunke. Et andet menneske eller CPU kan opdage fejlen; et tryk på det synlige æselkort **fortryder det seneste forkerte træk og giver straf**. Et korrekt træk skal ikke straffes.
- **CPU-kortspil:** Mindst én person og højst seks + ét CPU-æsel. Æslet spiller automatisk, kan med omtrent 72 % sandsynlighed opdage en fejl, men kan også selv tage fejl (omtrent 7 % af valg med mulige ugyldige mål). Justér først disse værdier efter familietest. Ingen AI-kald/credits kræves for kortspillets CPU.
- Talstien digital får ny tilfældig specialfeltfordeling per spil; fysisk A3 har faste felter, som skal afstemmes mod den trykte plade. Savegames i Talstien og Kortspil må aldrig overskrive hinanden.
- Godkendt forside som én illustration, ElevenLabs API-key kun i Cloudflare Secret, stemmer per faktisk ID og ingen automatisk sky-upload af læringsprofiler eller stemmecache.

## Implementeret

- Talstien 1–100, flere spillere inkl. CPU, store terninger, roser, ni typer actionfelter, frivillig matematik, voksen-timer, tale/lyd, pause, lokal gemning.
- Individuel matematik-tilpasning, forældreoversigt og lokal anonymiseret historik.
- Kortspil med fem talområder, to æselkortvarianter, frie korttræk, kort-indsigelser med fortrydelse, valgfri ekstra kortstraf, solo mod CPU og separat gem/fortsæt.
- Spilvælger med store Talstien/Kortspil-kort og v0.9.16-seks-farver i Talstien.

## Åbent til senere versioner (må ikke betragtes som implementeret)

1. Fysiske kort: producér komplette originale printark og æskedesign til de manglende talområder, afprøv 63×88 mm og endelig trykkvalitet.
2. Rigtige familietests af kortspilsregler, drillevarianter, CPU-fart, hvor ofte fejl opdages og touchtræk på små skærme. Måske justerbar CPU-sværhedsgrad, efter konkret feedback.
3. Mulig **fysisk kortspilassistent**: Lad appen hjælpe med strafkort og turstyring uden at erstatte kortene. Ikke en del af v0.9.17.
4. Valgfri AI-/telefonoplæsning og sjove CPU-replikker i **kortspillet**. Talstiens eksisterende stemmer fungerer, men kortspillet bruger endnu kun lokal CPU og æsellyd, ikke ny ElevenLabs-tale.
5. Forældrerapport som frivillig lokal eksport, hjælp til de originale kortregler, bedre introduktion og valgfri pædagogiske variationer.
6. v1.0: dokumenteret iOS/WebKit/VoiceOver, offline-opdatering, familietests, grafik-/lydrettigheder, korrekt PWA-adfærd og reale kreditgrænser.

## Arbejdsprincipper

- Start altid fra seneste GitHub `main`; gamle ZIP'er er kun referencer. Opdater `README.md`, `AGENTS.md`, `TESTPLAN.md`, `UDVIKLINGSPLAN.md`, `PROJEKTSTATUS.md`, `IDEKATALOG.md`, versionsmærke og PWA-cache i alle nye releaser.
- Del strengt mellem det, der **er kodet og testet lokalt**, og det, der faktisk **er på GitHub eller testet på en fysisk telefon**.
