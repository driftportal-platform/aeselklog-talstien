# ÆselKlog – udviklingsplan og projektstatus

> **Projektets fælles huskeliste og facit for fremdrift.** Denne fil skal holdes opdateret og læses sammen med koden, hver gang vi arbejder videre. Den beskriver både hvad der virker, hvad vi har besluttet, og hvad der mangler.

**Opdateret:** 13. oktober 2026  
**Senest bekræftede kodeversion i GitHub `main` før denne udvikling:** v0.8-A (13. oktober 2026)  
**Ny klar udviklingspakke til GitHub:** v0.8-B (skal uploades før den er live)  
**Næste udviklingsfase:** v0.8-C – flere actionfelter og sjovere hændelser  
**Repository:** https://github.com/driftportal-platform/aeselklog-talstien  
**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/

## 1. Den overordnede idé

ÆselKlog skal være et hyggeligt familiespil, der også kan lære børn matematik. Der findes fysiske talkort, en fysisk Talstien-spilleplade og en app, der kan bruges sammen med eller uden det fysiske spil. **Læringsopgaver er frivillige.** Man skal altid kunne spille uden skoleopgaver.

**Beslutninger, vi bevarer:**

- Fem talområder med hver sin lyse farve: **1–20, 21–40, 41–60, 61–80 og 81–100**.
- Fysiske kort i **63 × 88 mm**. Foreløbigt produktkoncept pr. talområde: 5 af hvert tal og 8 æselkort. Et enkelt print-testsæt kan bestå af ét af hvert tal + 8 æselkort.
- Kortene har store, tydelige tal, kan læses fra begge ender, har diskrete læringssymboler og samme bagside.
- Spil fra cirka **3 år til voksen**. Meget lette opgaver til de yngste; lettere plus/minus allerede omkring 5–6 år; gradvist større udfordringer, gangestykker, division, primtal og blandet hovedregning.
- **Børn: ingen tidsgrænse som udgangspunkt. Voksne: 60, 30 eller 10 sekunder afhængigt af sværhedsgraden.**
- Flere spillere med kaldenavn, alder og personlig brikfarve. **Æslet som CPU** skal kaste terninger, få opgaver og indimellem svare forkert (foreløbig ca. 30 %).
- Både fysisk og digital bevægelsesterning og læringsterning. CPU kaster altid synligt i appen.
- **Ægte æselskry** ved forkerte svar. ElevenLabs-stemmen *Mia* til tale, med enhedens lokale oplæsning som reserve. AI-nøgler ligger kun som secrets hos Cloudflare, aldrig i offentlig GitHub-kode.
- Oprindeligt æselspil-inspireret spilprincip, men helt eget navn, figurer og design; rettighedskontrol før salg.

## 2. Aktuel status – hvad findes i v0.8-B?

Denne status er baseret på GitHubs v0.8-A-filer og en ny v0.8-B-kodepakke afprøvet lokalt i Chromium den 13. oktober 2026. Upload til GitHub er endnu ikke udført for v0.8-B.

| Område | Status | Bemærkning |
| --- | --- | --- |
| Spilleroprettelse, alder, voksenvalg | ✅ I koden | Testet tidligere i prototypen; gentest efter ændringer |
| Talområder og eksisterende digital 1–100-bane | ✅ I koden | 100 unikke, programmatisk tegnede felter i ny v0.8-A-pakke |
| Fysisk/digital terning og læringsterning | ✅ I koden | Nyt overlay-flow ønskes |
| Aldersopdelte opgaver, voksen-timer | ✅ I koden | `engine.js` |
| CPU og farvede æselbrikker | ✅ I koden | Mere synlig tursekvens ønskes |
| Ægte æsellyd | ✅ I koden | `donkey-bray.wav` |
| ElevenLabs / Cloudflare AI-stemme | 🟡 Under afprøvning | Bruger har hørt ændret stemme; endelig live-verifikation, forbrug og kvalitet mangler |
| Fuldskærms-spilleplade og snoet bane | ✅ v0.8-B-kode | Automatisk ved spilstart, fylder 100dvh i landskab, zoom/følg; iPhone-test udestår |
| Nye actionfelter (Gulerod, Vandpyt, Overraskelse) | ⬜ Planlagt | Hører til v0.8-C; eksisterende fire actionfelter fungerer |

**Kodens fordeling:** `board.js` = original SVG-bane og felternes koordinater; `index.html` = layout/styling; `app.js` = spilforløb, terninger, brikker, lyd, specialfelter; `engine.js` = matematikopgaver; `sw.js` = cache/offline; `aeselklog-card.webp` = maskot; `donkey-bray.wav` = æselskry.

> **Vigtigt:** Byg videre på den seneste version i GitHub. Undgå at starte forfra eller miste eksisterende funktioner og filer.

## 3. Mål for v0.8

**Hovedmål:** Spillepladen er centrum. Efter spilstart bliver spilleren på en stor, levende spilleplade, hvor terninger, læringsspørgsmål og actionfelter vises ovenpå uden hop tilbage til hovedmenuen.

### 3.1 Ny visuel spilleplade – v0.8-A

**Implementeret i ZIP-pakken (ikke automatisk live på GitHub Pages):**

- [x] Større visning med **Stor plade** og **✕ Luk**, uden at nulstille spillets stilling. CSS-baseret heldækkende visning og iPhone-safe-area.
- [x] Et originalt bondegårdslandskab med stald, træer, blomster, hegn, dam, gulerødder, høns, sol og målskilt.
- [x] **Alle 100 tal vises præcis én gang**, og den sammenhængende sti går i korrekt rækkefølge.
- [x] 1–20 venstre → højre, 21–40 højre → venstre, 41–60 venstre → højre, 61–80 højre → venstre, 81–100 venstre → højre. Buer ved vendingerne.
- [x] Fem lyse farvezoner. De gamle actionfelter vises med ikon **uden at skjule tallet**.
- [x] Alle felter genereres deterministisk i et separat modul `board.js` (SVG), ingen tekst sat på billeder.
- [x] Mobil panorering, zoom +/- samt knib-til-zoom, **Find æslet**, **Hele banen** og automatisk scroll/følg ved hop.
- [x] Farvede spilleræsler og CPU-brik indtegnes dynamisk på SVG-stien.
- [x] Respekt for `prefers-reduced-motion`, store knapper og viewport-sikker placering.
- [x] **Næste tur, terninger og opgaver direkte oven på den store plade** i v0.8-B; X lukker til det almindelige oversigtspanel uden at afbryde spillet.
- [ ] Virkelig iPhone/Safari og tablet-test mangler; Chromium er testet med mobilvisning både liggende og stående samt desktopvisning.

**Testet lokalt 2026-10-13:** JavaScript uden fejl, 100 unikke felter, mobil 390×844 og desktop 1360×970, zoom, udvid/luk, menneskespiller med fysisk terning og udfordringsopgave, CPU's terning-/opgaveforløb. Ingen live-test på telefonen eller AI-stemmen i denne ændring.

### 3.2 Turforløb uden sideskift – v0.8-B

**Status 13. oktober 2026: IMPLEMENTERET OG BROWSERTESTET (endnu ikke live-afprøvet på iPhone).**

- [x] Efter **Start spillet** åbner banen automatisk i en CSS-baseret fuldskærmsvisning (`100vw × 100dvh`), også i liggende mobilformat.
- [x] Lille X lukker til normalvisningen uden at nulstille spillet; *Stor plade* åbner den igen.
- [x] Flydende HUD med aktivt spillernavn og felt; **Gentag**, **Find æslet**, **Hele banen** og zoom ligger på pladen.
- [x] Eksisterende turpanel flyttes ind på selve spillepladen, så terninger, spørgsmål, svarmuligheder og **Næste spiller** vises over banen uden sideskift.
- [x] Terningekast → **almindeligt hop først** → læringsterning/spørgsmål → eventuelt +1 hop → specialfelt på slutpositionen.
- [x] CPU beholder sin digitale terning og kan svare forkert. Fysisk terning, LEG/LÆR/UDFORDRING og voksentimer er videreført.
- [x] Ved zoom/følg forsøger kameraet at vise den aktive brik til venstre for opgavekortet; **Hele banen** viser overblikket.
- [x] Store tomme sidekanter undgås ved at vælge et beskåret udsnit i standardvisningen i stedet for at presse hele banen ind på skærmen.
- [x] Rettet rækkefølge for specialfelter: handlingen udføres på **aktuel slutposition**, ikke altid på det oprindelige terningelandingsfelt.
- [ ] Fysisk iPhone Safari, hjemmeskærms-PWA, iPad og alle skærmrotationer skal gennemtestes efter upload.


**Den præcise rækkefølge er vigtig og er besluttet sådan:**

1. Spillepladen er synlig. Æslet/Mia siger eksempelvis: *“Så er det Annas tur!”*
2. Bevægelsesterningen vises som et stort kort-overlay med ÆselKlog-logo. Brugeren slår digitalt (terningen hopper/ruller) eller indtaster resultat af fysisk terning. CPU ruller synligt selv.
3. **Først flytter det farvede æsel sig det antal felter, terningen viste** – ét animeret hop pr. felt. Kameraet følger brikken.
4. Hvis læringsdelen er valgt: Vis læringsterning (digital/fysisk) og lav en opgave, der passer til spillerens alder, niveau og det **nye felt**. Læs spørgsmålet højt.
5. Spilleren svarer. Børn har normalt ingen timer. Voksne har efter valgt niveau 60/30/10 sekunder.
6. **Rigtigt svar:** fejring og **ét ekstra animeret felt**. **Forkert/tid ude:** ægte æselskry, ingen ekstra felt. CPU kan også fejle.
7. **Specialfeltets handling sker på slutpositionen** efter en eventuel læringsbonus. Bonus/straf/bytte animeres. Ekstra flytninger må ikke sætte uendelige nye actions i gang.
8. Pladen forbliver åben. Vis **Næste tur** og annoncer næste spiller; samme flow igen.

**LEG-tilstand:** uden læringsopgaver springes punkt 4–6 over. I alle tilstande må man altid kunne bruge de almindelige spilregler.

**Foreslået teknisk state machine:** `boardReady → announce → moveDie → animateMove → learnDie → question → answer → bonusMove → specialAction → turnFinished → boardReady`. Den konkrete implementering kan navngives anderledes, men må ikke ændre rækkefølgen eller udløse dobbeltslag.

### 3.3 Flere actionfelter – v0.8-C

| Ikon | Handling | Status |
| --- | --- | --- |
| ⭐ Bonus | Gå 2 felter frem | Findes allerede |
| 🫏 Hov hov! | Gå 2 felter tilbage | Findes allerede |
| 🔄 Byt | Byt plads med en anden spiller | Findes allerede |
| 🏆 Talmester | Gå 1 felt frem | Findes allerede |
| 🥕 Gulerod | Få ét ekstra almindeligt terningkast; max én gang i samme tur | Nyt i v0.8 |
| 💧 Vandpyt | Stå over din næste tur; tilstand vises ved spillerens navn | Nyt i v0.8 |
| 🎁 Overraskelse | Træk tilfældig, enkel hændelse (positiv eller negativ) | Nyt i v0.8 |

Sørg for jævn fordeling og rimelig balance – ingen action på næsten alle felter. Definér actionplaceringer centralt i koden og brug samme data til både visning og effekt. Ingen uendelige actionkæder. Test særskilt med CPU og flere spillere.

**Til idébanken efter v0.8:** 🌉 Bro/genvej, 🛖 Staldpause/skjold, 🎯 Superopgave, 🤝 Hjælp en ven, 🫏 Æselhop.

### 3.4 Animationer, lyd og oplevelse – v0.8-D

- [ ] Stor terningeanimation midt på skærmen, gerne med kortdesign og logo; samme for CPU.
- [ ] Opgave og svarmuligheder i tydeligt overlay, mens pladen kan ses bagved.
- [ ] Farvet æsel hopper felt for felt; også på ekstra skridt og actions.
- [ ] Rigtigt svar = kort fejring. Forkert svar = ægte æselskry.
- [ ] Mia annoncerer spiller, slag, opgave, korrekt/ukorrekt og actions; lokal tale som fallback.
- [ ] Giv mulighed for at slå lyd fra og gentage opgaven.
- [ ] Beskyt mod dobbelte tryk, dobbelt handling, hurtige CPU-ture og animationer, der afbryder hinanden.
- [ ] Behold privatlivsprincippet: børnenavne helst kaldenavne; ingen API-nøgle i appen; send kun oplæsningstekst til stemmetjenesten.

## 4. Implementeringsplan og fremdrift

| Milepæl | Leverance | Status |
| --- | --- | --- |
| **0.8-A** | Korrekt snoet 1–100-bane, baggrund, udvid/luk, mobilzoom | ✅ Uploadet til GitHub; iPhone-test afventes |
| **0.8-B** | Automatisk fuldskærm, flydende kontrolpanel, kast → flyt → læring → ekstra skridt → action | ✅ Bygget og browserafprøvet; skal uploades og iPhone-testes |
| **0.8-C** | Flere actions, CPU-flow, æselanimationer | ⬜ Ikke startet |
| **0.8-D** | Talerutiner, opgave-overlays, voksen-timer, tilgængelighed | ⬜ Ikke startet |
| **0.8-E** | Test, fejlrettelser, dokumentation, versionering og udgivelse | ⬜ Ikke startet |

**Anbefalet prioritering:** Færdiggør og test A + B først, før vi udvider med mange actiontyper. På den måde får vi den vigtigste forbedring uden at skabe nye fejl i spillemotoren.

## 5. Testkrav før en udgave må kaldes v0.8 færdig

- [x] Alle 100 tal ligger én gang og i korrekt, sammenhængende rækkefølge (automatisk model- og DOM-test).
- [x] Actionikoner skjuler ikke tal, og start-/slutpositioner er modelleret for alle fem områder; nærmere spiltest på mobil mangler.
- [x] Appen beholder spillepladen som hovedvisning under en hel tur i browserens mobil-landskabsvisning (virkelig iPhone-test afventes).
- [x] Bevægelsesbrikken går **før** læringsopgaven, og ekstra skridt sker **efter** rigtigt svar (browsertest med fysisk terning og opgave).
- [x] Fysisk terning, digital terning-overlay og CPU-terning kontrolleret i browser; CPU-forkert-svar logik videreført fra v0.7.
- [ ] Treårige får lette genkendelsesopgaver; 5–6-årige kan få let plus/minus; ældre får gradvist sværere spørgsmål; voksentimer virker.
- [ ] Alle actionfelter og spring over tur virker uden løkker eller utilsigtet dobbeltflytning.
- [ ] Tale, æselskry og lyden fra ElevenLabs/fallback afbryder ikke spillets flow.
- [ ] Offline-funktioner for grundspillet bevares; internet kræves kun til AI-tale.
- [ ] iPhone/Safari/PWA samt mindst én desktopbrowser er testet; touch, zoom og skærmrotation fungerer.
- [x] Versionsnummer, serviceworker-cache, README og UDVIKLINGSPLAN er opdateret til v0.8-B i leverancepakken.

## 6. Kendte risici / afklaringer

1. **100 tal på en lille mobilskærm:** kræver zoom/følg aktiv brik samt overbliksvisning. Undgå at presse alle små tal ind samtidig.
2. **Animation + terninger + CPU:** brug én central turtilstand for at undgå parallelle hændelser.
3. **Hvornår virker specialfeltet?** V0.8-regel: på slutpositionen efter læringsbonus. Afprøves med børn.
4. **Gulerod/ekstra kast:** højst ét ekstra kast i samme tur, så runder kan afsluttes.
5. **ElevenLabs og Cloudflare:** først rigtig live-test af Mia, forbrugsbegrænsninger og status ved nedbrud; en ændret stemme er ikke i sig selv bevis for korrekt AI-forbindelse.
6. **Design og kommercielt salg:** egne figurer og nye regler; rettigheder, CE/legetøj og lydrettigheder undersøges før salg.

## 7. Efter v0.8 – idébank

- Flere banetemaer og årstider, brik-tilpasning, flere sjove æselreaktioner.
- Nye actions som bro, skjold, superopgave, hjælp en ven og æselhop.
- Mere individuel progression, læringsstatistik for forældre/lærere med passende privatlivsbeskyttelse.
- Gem/fortsæt spil samt mere gnidningsfri brug med fysiske kort og A3-plade.
- Særlige samarbejdsrunder, udfordringer og flere spilvarianter til hver aldersgruppe.

## 8. Fast udviklingsrutine – så vi altid tager udgangspunkt i det nyeste

**Før en ny ændring:**
1. Hent de nyeste filer fra GitHub `main`, ikke en tidligere chat-ZIP.
2. Læs `README.md`, denne `UDVIKLINGSPLAN.md` og `AGENTS.md`.
3. Kontrollér den faktiske version i `index.html`, `app.js` og `sw.js`; noter hvad der virker, og hvad der endnu kun er planlagt.
4. Lav målrettede ændringer med små testbare milepæle, og bevar funktionerne fra tidligere versioner.

**Efter en ændring:**
1. Kør relevante tests og markér tydeligt forskellen mellem implementeret, testet og planlagt.
2. Opdatér afkrydsningerne her, kendte fejl og versionsnummer.
3. Opdatér README og serviceworker-cache, når spilfiler ændres.
4. Gem ændringerne i GitHub med en meningsfuld commit, så næste udviklingsrunde kan begynde fra den faktiske seneste status.

### Dokumentets ændringslog

- **2026-10-13 (v0.8-B):** Stor bane som automatisk heldækkende spilvisning (844×390, 390×844 og 1280×800 afprøvet), flydende turpanel og HUD, terning/opgaver oven på banen; omordnet turflow til **kast → hop → opgave → bonus → action**, CPU-terning beholdt. Testet 100 SVG-felter, fysisk bonuskast 5→7, flytning før læring, korrekt svar +1, CPU-terning og X-luk/genåbn. Browser- og kildekontrol uden JavaScript-fejl. Test på rigtig iPhone og ElevenLabs live mangler. Ingen nye actiontyper i B.

- **2026-10-13 (v0.8-A):** Ny original SVG-bane, 100 testede numre, farveområder, bondegårdsgrafik, zoom/følg og udvid/luk. Appens øvrige spilmotor og stemmekode videreført. 0.8-B/C/D/E stadig åbne.

- **2026-10-13:** Første fælles status- og udviklingsplan. Kortlagt v0.7 i GitHub og planlagt v0.8 med ny bane, turflow, actionfelter og animations-/talesystem.
