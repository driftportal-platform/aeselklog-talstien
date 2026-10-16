# 🫏 ÆselKlog – idékatalog v0.9.19

**Aftaler i v0.9.19:** Samme stemmevalg i både Kortspil og Talstien, original ÆselKlog-stemme som *automatisk* CPU-favorit når godkendt, og tre rigtige brugerleverede CC0-MP3'er som valgfri offline-baggrundsmusik. Musikvalg og lydstyrke er fælles. Matematik forbliver helt frivillig. Licens- og kildefiler dokumenteres i `MUSIC-LICENSES.md`.

## Idéer, vi udskyder

- **The Reel Winner** (ca. 5 sekunder) som kort vinderfanfare, eventuelt efter sejr i Talstien eller Kortspil. Bør ikke køre i endeløst loop. Kræver særskilt accept/lydtest.
- Eventuel alternativ OGG til **Children's March Theme** for et helt sømløst loop, hvis MP3-gabet bliver mærkbart på iPhone; WAV er for stort til standard PWA-cache.
- Flere CC0-/originalkomponerede musiknumre, playliste/shuffle og mulig musik kun under bestemte begivenheder, hvis børn/forældre efterspørger det.
- Kortspilsintro og mere varierede CPU-replikker med stemmespecifik cache, men ikke på bekostning af ElevenLabs-credits eller CPU-ventetid.

## Ufravigelige gamle beslutninger

- Godkendt fuldskærmsforside uændret. Kortspil og Talstien er to selvstændige spil med egne gemninger. Fem talområder, frivillig læring og originale fysiske talkort 63×88 mm.
- CPU-æslet har samme rolle/stemmevalg i begge spil; ingen API-secrets på GitHub. A3-pladens faste felter skal stemme med det fysiske tryk; digital Talstien har tilfældige specialfelter.
- Før v1.0: iPhone PWA, offline, VoiceOver, ægte lyd, familietest og ophavsrettigheder skal dokumenteres. Ingen automatisk upload af persondata.

---

# 🫏 ÆselKlog – idéer og godkendte produktbeslutninger (v0.9.18)

**Opdateret:** 16. oktober 2026. Dette dokument adskiller **besluttede**, **implementerede** og **endnu ikke gennemførte** idéer; alle seks dokumenter opdateres ved hver release.

## Besluttet og implementeret i v0.9.18

- Kortspillet skal være fysisk og digitalt og fungere uden matematik; fem farveinddelte områder, fem kort af hvert tal og to æselkortvarianter. Æselkort gives ved opdagede fejl; valgfri ekstra kortstraf. Solo mod CPU er muligt.
- Spiller skal **selv vende kort fra sin lukkede bunke og lægge det direkte på valgfrit sted**. Tryk og træk er ligeværdige alternativer. Forkerte træk må ikke forhåndsstoppes, men kan udfordres via æselkortet med tilbagekald og straf.
- Kortspillet skal have en kompakt mobilvisning uden den separate store "Dit kort"-boks.
- Kortspillet skal bruge samme bruger-valgte spillelederstemme og CPU-æselstemme som Talstien. Korte gentagne replikker gemmes kun som anonyme, stemmespecifikke lydklip.
- Begge spil skal have **valgfri baggrundsmusik**, slukket som standard, lydstyrke og et udvalg af glade børnevenlige melodier. Tre små originale, offline syntetiske instrumentalmelodier er implementeret som første udgave. Musik skal dæmpes under tale og stoppe, når spillet forlades.
- Den godkendte full-screen forside må ikke redesignes uden eksplicit godkendelse, og Cloudflare ElevenLabs API-secrets må aldrig placeres i GitHub.

## Senere / endnu ikke besluttet i detaljer

1. Test om de tre melodier er gode nok til børn og om de skal erstattes med længere originalt indspillede musikstykker med kontrollerede rettigheder.
2. Endelig fysisk kortspilassistent til eksisterende fysiske kort, og eventuelt lydvalg/CPU-tempo-justering efter familietest.
3. Trykklare kort for 1–20, 41–60, 61–80 og 81–100; æske, bagsider og endelig spilleregler. 21–40 og æselkort er eksisterende prototyper.
4. Evt. lokal backup eller eksport af forældrerapporten uden automatisk cloud-overførsel.
5. Fysisk iPhone, WebKit/VoiceOver og fuld offline-PWA-installation, familietest, rettigheder, sikkerhed og v1.0-forberedelse.

---

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


## v0.9.20 – taloplæsning i Kortspil
Ved vending og placering af talkort udtaler stemmen nu kortets tal i stedet for generiske vendinger som »Jeg vender et kort« og »Kortet er lagt«. CPU kan sige »Æslet lægger [tal]«. Eksisterende fælles stemmevalg, musik og offline-aktiver er bevaret. Kontrollér på fysisk iPhone efter upload.
