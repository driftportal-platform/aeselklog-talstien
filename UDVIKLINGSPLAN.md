# ÆselKlog – udviklingsplan v0.9.10 (15. oktober 2026)

**Status:** Kode implementeret og testet lokalt fra nyeste GitHub `main` v0.9.9. Komplet ZIP til manuel upload. Live GitHub Pages og fysisk iPhone-PWA er ikke opdateret/testet herfra.

## v0.9.10 – individuel udvikling pr. regneart

- [x] Fire forskellige niveauer pr. barn: `numbers`, `plus`, `minus`, `tables` (−2 til +2).
- [x] 3 rigtige uden tip øger kun eget område, 2 forkerte sænker det. Tip tæller ikke til streak. Barnets alder er altid primær begrænsning.
- [x] Opgavegenerator med nye `skillSteps` og `skillArea`; gammel `skillStep` fungerer stadig.
- [x] Bagudkompatibel schema-1 migrering af gemte v0.9.9-spil; opgave og voksen-timer bevares.
- [x] Valgfri **Husk barnets niveau mellem spil** (lokal profil pr. unikt kaldenavn); man kan slette profiler under Indstillinger. Ingen alder, cloud eller API-nøgler i profil-lageret.
- [x] Fortsat LEG uden obligatorisk matematik, CPU-ægte stemmer, ElevenLabs-cache, specialfelter og godkendt forside.
- [x] Node og Chromium regressioner, mobil-hitfelter, gem/fortsæt, CPU-stemmer, per-område UI og profil-lagring.
- [x] Service Worker versioneret til `aeselklog-talstien-v0910-subject-learning`; `profiles.js` med i offline-pakke.
- [ ] Upload til GitHub `main` og fysisk iPhone-test, inkl. lokal lagring på rigtig Safari-PWA.
- [ ] Familietest, især om børnene oplever passende sværhedsgrad over flere spilleaftener.

## Fremadrettet (ikke med i denne version)

1. **v0.9.11 – Forældreoversigt** med udviklingen for alle fire områder på den enkelte enhed, samt slet/privatliv. Beslut evt. om en lokal valgfri graf er relevant.
2. Bedre stemme-pauser, flere faste lydklip og billigere credits uden at ændre på det sikre Cloudflare-secret.
3. Tilgængelighed og animationer på spillepladen, uden at SVG-felter forskydes.
4. Afprøvning med børn og familier inden mulig v1.0.

---

# ÆselKlog – udviklingsplan, v0.9.9 (15. oktober 2026)

**Grundlag:** Senest kontrollerede GitHub `main` = v0.9.6. Bygget videre på den lokalt leverede komplette v0.9.7, uden ændringer i det godkendte forsidebillede eller spilmotorens regler. Ikke uploadet til GitHub af assistenten.

## v0.9.9 – forside og spilleplade ryddes op

- [x] Permanent IndexedDB-lydlagring for en lille, eksplicit liste af **upersonlige** sætninger.
- [x] Cache-nøgler omfatter faktisk valgt Worker, AI-stemme-ID, modelcache-version og tekst. Mia, Mads og CPU-æslet kan gemmes separat.
- [x] Gemmes kun **ved brug**, efter at den hentede lyd er valideret. Ingen forbrugsdrivende forudgenerering.
- [x] Lokal lyd afspilles også uden internet; almindelig telefonstemme er fallback for ikke-gemte sætninger.
- [x] Maksimum 15 MB/70 lydklip med automatisk oprydning; brugeren kan rydde cachen fra Indstillinger.
- [x] Gem ikke spiller-/børnenavne i permanent lydcache. Gemte spil og Topscore ligger i separate, uændrede lagre.
- [x] Udvidet browser- og Node-test, ny PWA-cache samt versionsopdateret dokumentation.
- [ ] Manuel iPhone-test med mindst to valgte AI-stemmer og CPU-æsel, herunder test efter genstart og offline.
- [ ] Virkelig ElevenLabs-test med kreditforbrug, når brugeren har uploadet koden.
- [ ] Test i iOS Safari/WebKit – de automatiske browser-tests bruger Chromium og simuleret lyd/IndexedDB.

## Foreslåede næste versioner

1. **v0.9.9** – individuel progression i plus, minus, tabeller og talforståelse, på tværs af spil; børnenavne kræver hensyn til lokal lagring.
2. **v0.9.10** – enkel forældreoversigt med udvikling pr. regneart, børnevenlig visning og lokal datakontrol.
3. Efter flere familietests: levende actionfelter, gennemgang af animationer (uden at flytte SVG-felter), modulopdeling i mindre dele og tilgængelighed.
4. Før v1.0: dansk børne-/familietest, lovligt billedmateriale, offline-genstart og fuld PWA-opdatering på rigtig telefon.

---

# ÆselKlog – udviklingsplan, v0.9.7 (15. oktober 2026)

**Grundlag:** Den komplette, lokalt testede v0.9.6 ZIP. GitHub `main` blev sidst verificeret til v0.9.5. **Ingen automatisk GitHub-upload og ingen påstand om fysisk iPhone-test.**

## v0.9.7 – vedligehold og driftsstabilitet

- [x] Udskil eksisterende CSS i `styles.css` uden at røre det godkendte forsidebillede.
- [x] Revider Service Worker: versioneret cache, lokal scope og oprydning kun i ÆselKlogs egne caches.
- [x] Præcache CSS + tilstand ved offline-net; behold WebP og æsellyd i offline-cache.
- [x] Ved TTS-timeout, netværksfejl eller offline: brug lokal stemme uden at afbryde CPU-flow.
- [x] Behold AI-/CPU-stemmevalg, brug kort backoff ved gentagne stemmefejl.
- [x] Fokus flyttes til den nye side ved menunavigation; AI-status annoncérbar.
- [ ] Afprøv en installeret PWA fysisk på iPhone i portræt og landskab, også ved opdatering af en gemt v0.9.6.
- [ ] Afprøv ægte ElevenLabs/Cloudflare Worker på iOS samt fejltilstand uden internet.
- [ ] Familietest før v1.0.

## Senere forslag fra forbedringslisten

1. Opdel `app.js` i små, klart testbare moduler **uden** at udskifte den fungerende CPU-/lydmotor ukritisk.
2. Forældreoverblik og læringsprogression kræver gennemgang af den faktiske leaderboard- og saved-game-datastruktur (undgå alderslagring og brud på gamle gemninger).
3. Bedre bræt-animationer efter familietest; respekter `prefers-reduced-motion` og undgå at overskrive SVG-positionering med CSS-transform.
4. Ingen obligatorisk onboarding-overlay på den godkendte forside, før børn/familier har ønsket det.

---

## Tidligere – v0.9.6

# ÆselKlog – udviklingsplan, v0.9.6 (15. oktober 2026)

**Senest bekræftede GitHub `main` ved udviklingsstart: v0.9.5.** Denne v0.9.6 er bygget fra identiske kildefiler og billeder, og der er tilføjet en komplet pakke med fire ellers manglende eksisterende filer. **Automatiserede lokale tests gennemført. Afventer upload til GitHub Pages og afprøvning på rigtig iPhone.**

## v0.9.6 – kompakt Fortsæt spil

- [x] Fjern det store `Gemte spil`-panel fra forsiden.
- [x] Vis kun `▶ Fortsæt spil` + `✕ Slet` ved lokalt gemt spil.
- [x] Behold den godkendte 417×883 WebP-forside og de fire menuknapper uændrede.
- [x] I mobil-landskab få en selvstændig lille række til Fortsæt spil uden at dække de fire hovedmenuknapper.
- [x] Versionsmærke og Service Worker-cache opdateret til v0.9.6.
- [x] Tilføj browser-regressionstest for mobilsynlighed, navigation, gem/fortsæt og slet.
- [ ] **Fysisk iPhone-PWA-test**: se at opdateringen lander på hjemskærmsversionen, alle menuer kan trykkes, Fortsæt/Slet virker, og lyd fortsætter uændret.
- [ ] Familietest før v1.0.

## Næste version

- v0.9.7 eller senere: lille oprydning i CSS/JS, mere stabil stemme og bedre PWA-opdateringsoplevelse. Kør regressionspakke og bevar frivillig matematik.

---

## Historik

# ÆselKlog v0.9.5 – fuldskærmsforside som referencebilledet

- Forsiden er én sammenhængende illustration fra det godkendte referencebillede (ikke et billede over gamle knapper).
- Fire klikbare og tilgængelige knapper ligger præcist ovenpå de tegnede knapper: Spil, Indstillinger, Topscore og Om spillet.
- Forsiden fylder mobilens viewport i stående format, uden gammel header, hvide margener eller gamle knapper.
- I liggende mobilformat anvendes et læsbart splitlayout.
- Spil- og indstillingssiderne samt hele spillets motor og ElevenLabs-kode er bevaret fra v0.9.4.
- `home-fullscreen.webp` og `home-ui.js` er nye og skal uploades sammen med alle andre filer.
- Service Worker-cache er opdateret til v0.9.5.
- Før videre udvikling: kontroller altid seneste GitHub-kode og dette dokument.
- Afprøv på rigtig iPhone efter upload; test også alle fire forsideknapper og et gemt spil.

Spil: https://driftportal-platform.github.io/aeselklog-talstien/

## Tidligere noter
# v0.9.4 – Rettet forside efter godkendte skærmbilleder

- Forsiden bruger ét samlet motiv fra godkendt design (ingen halve sidebilleder).
- Tre klikbare menuknapper: Spil, Indstillinger, Topscore.
- Spilmenu: kun spillere, alder og CPU, med øvrige valg under Indstillinger.
- Ingen ændringer i spilmotor, ElevenLabs eller gem/fortsæt.
- Kontrolleret på kode- og filniveau; rigtig iPhone-visning skal afprøves efter upload.

---

## v0.9.3 – forside og spilmenu (15. oktober 2026)
- Ét samlet æselmotiv i toppen uden gentagne sideudsnit.
- Kortere spilmenu med kun nødvendige valg og uden ekstra forklaringer.
- Indstillinger og øvrige spilfunktioner bevaret.

# ÆselKlog – udviklingsplan og fælles status

## 15. oktober 2026 – v0.9.2: Forside og enkel spilstart

**Status:** Kode og pakke lavet, lokale regressionstests gennemført. **Afventer upload til GitHub Pages og test på rigtig iPhone.**

- [x] Ny original ÆselKlog-forside med hyggelig bondegårdsillustration og rigtige knapper.
- [x] Forsideknapper: **Spil**, **Indstillinger**, **Topscore**.
- [x] **Spil** er nu kun spillernavne, aldre, CPU-tilvalg og Start. Voksnes sværhedsgrad vælges globalt under Indstillinger.
- [x] **Indstillinger** rummer alle valgmuligheder (talområde, læringsmode, tabeller, adaptiv, bræt, terninger, tempo, voksenniveau og stemmer).
- [x] Spilindstillinger gemmes lokalt og bruges automatisk næste gang.
- [x] Tidligere gemte spil vises på forsiden; Gem & afslut, Nyt spil og Spil igen vender til forsiden.
- [x] WebP-billeder til desktop og mobil; tilpasset landskab/portræt.
- [x] Node-teste, browser-smoke, CPU-stemme-flow og save/resume bestået uden virkelige ElevenLabs-kald.
- [ ] Kontroller navigation, farver, knapper og stemmer i fysisk iPhone-app.
- [ ] Familietest: kan en 3–6-årig starte spillet uden hjælp, og kan voksne finde alle indstillinger?
- [ ] Vurdér om en ekstra **Regler**-knap skal på forsiden senere.
- [ ] Tjek navne, billeder, illustrationer og rettigheder før kommerciel lancering.

**Næste kandidat:** v0.9.3 med brugerfeedback fra familiens prøvespil, evt. bedre individuel profil og overskueligere rundemenu.

### Opgaveregel til næste udvikler

1. Hent altid nyeste GitHub-main, læs README/AGENTS/UDVIKLINGSPLAN.
2. Bevar `#home`, `#settings`, `#setup`, `#game` og klikbare knapper.
3. Indstillinger gemmes i `aeselklog-praferencer-v092`; stemme- og gemt-spil-data har fortsat deres egne lokale nøgler.
4. Ingen API-nøgler på GitHub. ElevenLabs-Worker og CPU-kode er uændret i denne release.
5. Test valg af voksen: globalt voksenniveau under Indstillinger, alder på Spil-siden.
6. Efter udvikling: versionsnummer, cache, docs, tests og ærlige statusbeskeder skal opdateres.

---

# 🫏 ÆselKlog – udviklingsplan og projektstatus

## Opdatering 14. oktober 2026 – v0.9.1 (CPU-stemme)

**Status: v0.9.1 er udviklet lokalt og pakket til upload, men endnu ikke bekræftet på GitHub Pages.**

- [x] CPU-æslet svarer **selv højt med den valgte konkrete svarmulighed** og nogle sjove, varierede udtryk.
- [x] Separat AI-stemmevælger for **spilleleder** og **CPU**. Automatisk forskellig stemme, hvis muligt (fx Mia til spilleleder og Glenn til CPU), ellers mild toneændring.
- [x] CPU'ens svar vises i taleboble, og facit afsløres **først når stemmen er færdig**.
- [x] Ægte æsellyd ved forkert svar og ca. 30 % CPU-fejl er bevaret.
- [x] Nyt `cpuvoice.js`; stemmevalg gemmes lokalt; ingen ændring af Cloudflare secrets.
- [x] Tests med Node, mobilbrowser og **mockede AI-lydfiler** uden ElevenLabs-forbrug.
- [ ] Rigtig iPhone-test med Mia og en alternativ godkendt dansk ElevenLabs-stemme.
- [ ] Vurdér lydkvalitet og ekstra creditforbrug ved mange CPU-ture.
- [ ] Brugertest med børn og voksne, og eventuel produktion af unik karakterstemme for Æslet.

**Næste forslag:** Testfamilier, finjustering af opgaver/tempo og evt. endnu mere karakteristisk original æselstemme i v1.0.

---


> Dette er **vores fælles, autoritative projektstatus**. Læs filen, `README.md` og `AGENTS.md` sammen med nyeste GitHub `main`, før vi udvikler videre.

**Opdateret:** 14. oktober 2026  
**Senest bekræftet i GitHub `main` før udvikling:** **v0.8-E**  
**Ny udviklingspakke:** **v0.9**, bygget på den seneste v0.8-E-kode fra GitHub, klar til manuel upload.  
**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/  
**Repository:** https://github.com/driftportal-platform/aeselklog-talstien

## 1. Produktprincipper (fastholdes)

- Kortspil + fysisk A3-spilleplade + digital ÆselKlog med mange frivillige læringslege.
- **LEG uden matematik** må aldrig kræve besvarelse af opgaver. Frivillig superopgave kan afslås uden straf.
- Fem talområder 1–20, 21–40, 41–60, 61–80, 81–100. Fysiske kort 63 × 88 mm; foreløbigt fem af hvert tal + otte æselkort pr. pakke.
- Digital bane viser hvert tal 1–100 præcis én gang i snoet rækkefølge. Actionikoner dækker aldrig tal.
- Fysiske/digitale terninger, dansk tale/ægte æsellyd, farvede æselbrikker og CPU der kaster og kan svare forkert.
- Børn fra tre år med lette opgaver uden timer. 5–6 år simple plus/minus, ældre passende tabeller/primtal. Voksen-timer **60/30/10 sekunder**, først efter oplæsning.
- Stor spilleplade i landskab, roligt spiltempo og sammenhængende tur: kast → brik hopper → læring → eventuel bonus → action.
- Spillet gemmer ikke API-nøgler i GitHub. ElevenLabs kaldes gennem eksisterende Cloudflare Worker.

## 2. Versionsstatus

| Version | Leverance | Faktisk status |
|---|---|---|
| 0.8-A | SVG-bane 1–100, bondegård og zoom | ✅ Bekræftet på GitHub |
| 0.8-B | Fuldskærm og ture direkte på spillepladen | ✅ Bekræftet på GitHub |
| 0.8-B.1 | Automatisk AI-adresse og stemmevælger | ✅ Bruger har bekræftet fungerende stemmeskift |
| 0.8-C | Nye actionfelter, Bro, Superopgave, Gulerod m.fl. | ✅ Bekræftet på GitHub |
| 0.8-D | Gangetabeller 2–12, tempo, lokal Topscore | ✅ Videreført i 0.8-E |
| 0.8-E | Baggrundspauser, animationer og kvalitetstjek | ✅ **Lå på GitHub main ved start på v0.9** |
| **0.9** | **Gem/fortsæt og individuel adaptiv matematik** | ✅ Kodet og testet lokalt. ⏳ Ikke uploadet/live-testet på iPhone |

## 3. Implementeret i v0.9

- [x] **Automatiske kontrolpunkter**: gem ved stabile faser i turen, inklusive spilkonfiguration, aktive spillere, felter, CPU og læringsniveau.
- [x] **Fortsæt-knap** på startsiden. Mulighed for **Gem & afslut** og **Slet gemt spil**.
- [x] Én lokal gemmeplads; gemmes i `localStorage` uden brugerlogin eller backend.
- [x] **Spørgsmål og voksen-tid** kan genoptages. Når en ikke-afsluttet animation afbrydes, starter spillet fra sidste sikre checkpoint.
- [x] **Individuel adaptiv progression**: tre rigtige i træk giver et trin op; to forkerte giver et trin ned, maksimalt ±2.
- [x] **Alderssikring** og voksen-undtagelse: voksne beholder deres valgte niveau/timer; 3–6-årige tvinges ikke til tabeller.
- [x] Ny lokal modulstruktur `savegame.js`, `adaptive.js`, øgede tests og opdateret PWA-cache.
- [x] Node-regressionstests og browser-smoke med gemt state genåbnet i en ny browserdokument-simulering.
- [ ] **Virkelig iPhone/PWA-test efter upload**: gem, luk app helt, åbn igen, fortsæt, prøv AI-lyd og voksen-timer.
- [ ] **Familiefeedback**: om progressionen opleves passende og sjov, også når børnene fejler flere gange.

## 4. Regler for lokal gemning

- Automatik gemmer **kun stabile faser**: før kast, ved opgave, efter tur, ved valg af action/bytte. Midt i en animation er sidste checkpoint sikrest.
- Manuel **Gem & afslut** er mulig mellem handlinger. Hvis æslet er ved at hoppe, vises en kort besked om at gemme efter bevægelsen.
- Ved afsluttet spil slettes gemningen, mens resultatet fortsat skrives til separat Topscore.
- Ét gemt spil pr. browser/enhed. Ingen sky-synkronisering. Browseren kan slette webstedsdata; brug ikke som garanteret backup.
- Lokal gemning indeholder midlertidigt spilleres **kaldenavne og aldre** til spørgsmål, men ikke API-nøgler. Topscore indeholder **ikke alder**.

## 5. Læringsalgoritme (foreløbig)

- **Hver børnespiller** har sit eget niveau i intervallet −2 til +2.
- 3 selvstændige rigtige svar i træk → +1, 2 forkerte svar → −1. Rigtige svar med brugt tip tæller med i statistikken, men ikke til streak.
- Sværhedsgraden styrer bl.a. talspænd, længde på regnestykker og niveauet i tabeltræning. Barnets egen alder forbliver den primære begrænsning.
- Børn får ingen timer. Voksne følger valgt Let/Mellem/Svær, og CPU justerer ikke børnenes niveau.
- Progressionen er **spilmotivation**, ikke en pædagogisk diagnose. Ændres efter rigtig børne-/lærertest.

## 6. Næste skridt efter v0.9

1. **0.9.1** – hvis nødvendigt: fejlrettelser fra telefon- og familieafprøvning (herunder lagerbegrænsning i iOS, hviletid i PWA og gemte voksenopgaver).
2. Valgfri **forældreside** med enkle lokale fremskridtsgrafer på tværs af afsluttede spil, helst anonymiseret og uden unødig alderslagring.
3. Bedre tilpasning pr. opgavetype, ikke blot samlet niveau – fx særskilt plus/minus, lige/ulige, tabeller og primtal.
4. Prøvespil hos 5–10 familier og skolebørn i forskellige aldre. Indsaml oplevelse, bugs og om barnet ønsker at spille igen.
5. Efter familietest: materiale til Hyggeonkel, pris- og produktionsvurdering for de fysiske kort/æsker, originale illustrationer og rettighedskontrol.

## 7. Sådan fortsætter vi arbejdet

1. Hent først **aktuelle GitHub main**-filer, og sammenlign med eventuelle nyere lokale ZIP-leverancer.
2. Læs `README.md`, `UDVIKLINGSPLAN.md`, `AGENTS.md` og `TESTPLAN.md`.
3. Bevar alle ældre funktioner og undgå at ændre Cloudflare Worker, medmindre der er konkret grund.
4. Kør alle tests (`node tests/*.test.js` enkeltvis, samt browser-smoke efter store UI-ændringer), og markér hvilke tests der faktisk blev udført.
5. Opdatér versionsnumre i HTML/JS/PWA-cache og roadmap sammen med release.

**Ingen påstand om produktion eller live-telefontest, før den er bekræftet.**
