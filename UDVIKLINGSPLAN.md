# ÆselKlog – udviklingsplan v0.9.16 (16. oktober 2026)

**Senest verificeret på GitHub ved start:** `main` = v0.9.15. **Aktuel leverance:** v0.9.16 – kodet i komplet lokal pakke; ikke automatisk lagt på GitHub. Den godkendte illustration bevares. Se også **`PROJEKTSTATUS.md`** for status og **`IDEKATALOG.md`** for fælles beslutninger og næste idéer.

## v0.9.16 – stor spilvælger og udvidet deltagerantal

- [x] Gør både Talstien og Kortspil til **rigtige knapper** med tilgængeligt navn, synlig aktiv tilstand og separat opsætning.
- [x] Spiltyper kan skiftes frem og tilbage, også når man står inde i kortspillets opsætning.
- [x] To flottere, store kort på desktop; et kort pr. række på mobil. Fokusmarkering og reduceret bevægelse.
- [x] Talstien udvidet fra **4 til 6 navngivne spillere + CPU**. Seks forskellige spillerfarver.
- [x] Bagudkompatibel validering og lokal gemning af op til **7 deltagere**; gamle gemninger genoptages fortsat.
- [x] `sw.js`, README, AGENTS, TESTPLAN, PROJEKTSTATUS og IDEKATALOG opdateret til udviklingspakke v0.9.16.
- [x] **20 Node-tests + 15 Chromium-browsertests bestået** (simuleret lyd, ikke iOS Safari).
- [ ] **Fysisk iPhone-/WebKit-test og produktionstest med ElevenLabs** efter GitHub-upload.

## Næste trin efter v0.9.16

1. **Stabilitet og familieprøver:** test 6 spillere + CPU, gem/fortsæt, lille iPhone, fysisk/digital plade og valg mellem begge spiltyper. Ret fejl fra rigtige familier før flere funktioner.
2. **Kortspil-funktioner:** finjuster de oprindelige regler på trykte kort, afklar om der skal være en fysisk kortspil-assistent, valgfri oplæsning og senere CPU i kortspillet. Alle fem talområder er allerede tilgængelige digitalt.
3. **Fysiske kort og A3:** trykklare sæt 1–20, 21–40, 41–60, 61–80, 81–100 med fem kopier af hvert tal; 21–40- og æselkortprototypen findes. Sammenlign trykt A3 mod faste specialfelter og gennemgå trykrettigheder.
4. **v1.0-kvalitet:** iOS Safari/WebKit, VoiceOver, PWA-offlineopdatering, tilgængelighed, familietest og realt ElevenLabs-kreditforbrug. Release kun når disse er verificeret.
5. **Frivillige, senere idéer:** lokal eksport af forældreoversigt, onboarding/regelforklaring, supplerende læringslege og mere avanceret kortspil. Intet af dette må gøre matematik obligatorisk.

## Faste beslutninger

- Talstien og Kortspil må aldrig overskrive hinandens savegame. Godkendt 1:1-forside ændres ikke.
- Klassisk kortspil: 4/6/8 æselkort som beholdes ved straf (standard 8). Send-videre: ét æselkort. Ekstra talkortstraf er frivillig og slået fra som standard.
- Kortspillet har fem separate områder 1–20, 21–40, 41–60, 61–80, 81–100, med fem af hvert tal i niveauet. Matematik altid frivillig.
- Talstien digital: tilfældige specialfelter ved ny kamp. Fysisk A3: fast fordeling for at kunne matche trykt plade. Gemte kampe bevarer deres bane.
- Cloudflare ElevenLabs-nøgle aldrig på GitHub. Lokal læringshistorik og lydcache synkroniseres ikke til cloud.

---

# ÆselKlog – udviklingsplan v0.9.15 (16. oktober 2026)

**Status:** GitHub `main` bekræftet v0.9.14 før udviklingen. v0.9.15 udviklet og automatisk testet lokalt. Afventer manuel GitHub-upload, fysisk iPhone-PWA, familietest og afprøvning med trykte kort.

## Kortspil v0.9.15 – implementeret

- [x] Eksisterende godkendt forside og Talstien-flow bevaret. Under **Spil** kan man nu vælge **Kortspil** ved siden af Talstien.
- [x] Fem kortniveauer 1–20, 21–40, 41–60, 61–80, 81–100, med fem af hvert tal pr. niveau (100 talkort). Kort vist med lige/ulige, tiere/enere og primtal.
- [x] Digital pass-and-play for 2–6 spillere med lukkede/åbne bunker, korrekt rækkefølge, op til fem rækker i midten, åbne bunker hos modspillere, genvending og vinderregistrering i kortspiltilstanden.
- [x] **Behold æselkort** (4/6/8 kort, standard 8) og **Send æslet videre** (præcis ét kort). Manuel bekræftet straf ved fejl, valgfrit ekstra kort fra hver anden spillers lukkede bunke.
- [x] Kortspil gemmes lokalt under selvstændig nøgle, ikke i Talstiens gemning; fuld fortsæt/slet i Kortspil-menu. Ingen API-kald eller aldersdata.
- [x] Ny PWA-cache v0.9.15 med begge kortmoduler. Tidligere spilmotor, den godkendte forside, stemmer, actionfelter, fysisk/digital A3-plade og individuelle læringsprofiler bevares.
- [x] 19 Node-tests og relevante Chromium-browsertests inkl. tre mobil/desktop-størrelser.
- [ ] Fysisk iPhone-Safari/WebKit, offline-genstart og rigtig brugertest med de fem kortområder.

## Mangler før kortspil v1.0

1. Afprøv og justér de præcise **fysiske** kortregler sammen med børn og voksne, især placering på åbne bunker, kortprioritet og frivillige strafregler. Første digitale version er ikke en endelig officiel regelbog.
2. Færdiggør trykklare kort for samtlige fem områder med korrekt antal kopier, original grafik og kortbagsider. Prototypebillederne viser kun 21–40 og æselkort.
3. Beslut om fysisk kortspil skal have en spilassistent i appen, og om der ønskes CPU i kortspilsvarianten. Første version er lokal pass-and-play.
4. Gennemfør VoiceOver, større skrifter, rigtig iPhone-PWA, offline-opdatering og familietest før markering som v1.0.

---

# ÆselKlog – udviklingsplan v0.9.14 (16. oktober 2026)

**Grundlag:** GitHub `main` verificeret til v0.9.13; komplette kildearkiv matcher GitHub Git-blobs. v0.9.14 lokalt udviklet og automatisk testet, ikke uploadet til GitHub af assistenten. Fysisk iPhone-PWA-test afventer.

## v0.9.14 – afslut, stemmemarkør og fysisk A3-spilleleder

- [x] Fast **Afslut** øverst på spilleskærmen og stor plade, med Gem / Uden gemning / Fortsæt og bekræftelse ved destruktiv handling.
- [x] Gemning kun ved stabile faser; CPU og voksen-timer afventer under Afslut-menu, og fortsætter ved annullering.
- [x] Fjern den uønskede "0." ved stemmeindstillingernes detaljemenu (ren pil, uden nummermarkør).
- [x] **Fysisk A3** viser spilleledervisning og flytninger på trykt bræt i stedet for at udvide den digitale plade automatisk. Den bruger en **fast specialfeltfordeling** (`A.FIELDS`). Digital mode har uændret randomiserede specialfelter.
- [x] Valgfrit digitalt overblik i fysisk mode, stadig fysisk/digital terning uafhængigt.
- [x] Gammelt savegame schema/lokallager intakt, gemte specialfelter bevares 1:1.
- [x] 18 Node-tests og 13 Chromium-browserprøver gennemført, inklusive ny test for fysisk A3 og Afslut-dialogens tidsstyring. PWA-cache v0.9.14.
- [ ] Kontrol af fast feltlayout mod brugerens **konkrete A3-print**. De fysiske tryk kan have andre symbolplaceringer end `A.FIELDS`.
- [ ] Reel iPhone/WebKit/VoiceOver, ElevenLabs og familietest før v1.0.

## Fysiske spillekort – beslutninger og næste trin (udsat efter denne release)

- Den foreviste 21–40-prototype viser talkort 21–40 med lige/ulige, tiere/enere og primtal samt **otte æselkort** (63×88 mm).
- **Grundspillet:** flere æselkort kan deles ud; når en spiller får et æselkort, beholder spilleren det resten af spillet.
- **Senere drillevariant:** præcis ét æselkort kan gives videre mellem spillere efter særskilte regler.
- Begge kortspilsformer skal kunne spilles uden matematik; ekstra læring er frivilligt.
- Der mangler endelig aftale om **hvornår/hvordan talkort lægges af**, antal kort per spiller, tildeling og scoring. Integration af digitalt/fysisk kortspil og kortdesign/produktion gennemføres som eget spor efter de nuværende spilrettelser.

## Foreslået næste skridt

1. Upload og fysisk test af v0.9.14 på iPhone og sammen med A3-pladen. Ret eventuelle forskelle i trykt feltfordeling.
2. Fastlæg almindelige kortspilsregler og integrér valgfrit kortspil på egen side efter godkendt design.
3. Familietest og releasekontrol før en mulig v1.0.

---

# ÆselKlog – udviklingsplan v0.9.13 (15. oktober 2026)

**Status:** GitHub `main` var bekræftet v0.9.12 ved start, og den komplette v0.9.12-ZIP matchede relevante kildefilers Git-hashes. v0.9.13 er kodet, testet i Node/Chromium og pakket til manuel upload. Ingen GitHub-commit eller fysisk iPhone-/ElevenLabs-test er udført i denne omgang.

## v0.9.13 – varieret antal og placering af actionfelter

- [x] Gulerod 3–5, Bro 2–4, Vandpyt 2–4, Bonus 4–6; Hov hov 2–4, Byt 1–3, Talmester 1–3, Overraskelse 1–3, Superopgave 1–2. Både antallet og feltplaceringerne trækkes tilfældigt ved nyt spil.
- [x] Alle fem talområder har omtrent lige mange specialfelter, fri plads nær start/slut og ingen nabofelter. Samme regelsæt og pop-up-effekter fra v0.9.12.
- [x] Ny tilfældig bane gemmes og indlæses eksakt i schema-1 `aeselklog-igangvaerende-v1`. Gammel gemning uden layout bevarer den originale faste bane fra v0.9.12 og ældre.
- [x] Alle fem farveforklaringer er roser (originale SVG-ikoner) med blå, lyserød, gul, grøn og lilla farve.
- [x] Æsellyd-knap får ekstra margin til kanten, og det beskårne æsel på terningeskærmen vises i sin helhed.
- [x] PWA-cache opdateret til `aeselklog-talstien-v0913-random-action-layout`, projektets dokumenter og tests opdateret.
- [x] 18 Node-tests og 12 Chromium-browserprøver. Alle AI-opkald er simuleret; ingen påstand om fysisk iOS test.
- [ ] Test med installeret iPhone-PWA og familier, særligt variation i opgavenes balance, nye feltplaceringer og bevarelse af gemte spil.

## Næste skridt

1. Upload v0.9.13, prøv 3 nye spil og én gem/fortsæt på iPhone.
2. Brugertest med et par familier før v1.0: forstår børn roserne, nye specialfelter og læringsopgaverne?
3. Udbedr observerede fejl, især små skærme, iOS-opdateringer og talepauser. Ingen ændring af den godkendte forside uden ny reference.

---

# ÆselKlog – udviklingsplan v0.9.12 (15. oktober 2026)

**Ved start:** GitHub `main` blev bekræftet som v0.9.11. Denne release er udviklet lokalt på de samme kilder. GitHub-upload og rigtig iPhone-test afventer.

## v0.9.12 – Levende specialfelter

- [x] Bedre og tydeligere visuel effekt for alle ni specialfelter med passende farver, ikoner og forklaringer.
- [x] Fortegn og faktisk ændret feltposition ved Overraskelse og banegrænser.
- [x] Reduceret bevægelse respekteres; ingen animation på SVG-felternes koordinattransforms.
- [x] I mobilportræt får turpanelet sin normale bredde, også i bevægelsesfasen.
- [x] `actionfx.js` tilføjet, `sw.js`-cache versionsopdateret, README/AGENTS/TESTPLAN opdateret.
- [x] Bevarer stemmer, CPU/ventetid, lokal læring, forældreoversigt og alle eksisterende regler.
- [ ] Fysisk iPhone-PWA-test med live ElevenLabs og familiefeedback.

## Næste skridt frem mod v1.0

1. Test med børn og familier: er effekter, spiltempo og opgaver sjove og tilpas tydelige? Ret faktiske fejl før flere funktioner.
2. Tilgængelighed på mobil (VoiceOver/kontrast, fokus og tekststørrelser) uden at ændre forsidens godkendte reference.
3. Overvej frivillig lokal eksport af forældreoversigten (ingen automatisk overførsel eller upload).
4. Test komplet offline/genåbning/PWA-opdatering på rigtig iPhone før eventuel offentlig v1.0.

---

# ÆselKlog – udviklingsplan v0.9.11 (15. oktober 2026)

**Status ved udviklingsstart:** GitHub `main` er bekræftet opdateret til v0.9.10.1. Ny v0.9.11 er udviklet fra den samme kilde; upload til GitHub Pages og fysisk iPhone-test afventer stadig.

## Forældreoversigt, første version

- [x] Fire læringsområder synlige enkeltvis: talforståelse, plus, minus og gangetabeller.
- [x] Aktuelt tilpasningsniveau, rigtige/forsøg og lille visuel udvikling over de seneste opgaver.
- [x] Begrænset, lokal historik (96 opgaver/kaldenavn) med resultat, område, trin og tidspunkt; ingen alder, facit eller opgavetekst.
- [x] Eksisterende v1-læringsprofiler læses uden migreringsproblemer. Der vises ikke opfundet historik for gamle data.
- [x] Forældreoversigt under Indstillinger; slet enkelt profil eller alle læringsprofiler med bekræftelse.
- [x] Samme spilmotor, valgfri LEG, gamle gemte spil, CPU-æslets ventetid, PWA-lyd, cache og original forside.
- [x] PWA-versionering og tests af database/visning, dublikatsikring og sletning.
- [ ] Test på fysisk iPhone og med familier. Afprøv at grafer og tekster er forståelige, også ved meget få opgaver.

## Næste forslag

1. Indsaml feedback fra et par familier om brugbarheden af forældreoversigten og læringstrinene – uden at gøre matematik obligatorisk.
2. Justér opgavernes pædagogiske progression pr. aldersgruppe, når vi har faktiske erfaringer fra spillet.
3. Forbedr tilgængelighed og de sjove animationer uden at ændre SVG-felternes placering.
4. Overvej en frivillig lokal eksport af læringsoversigten før en mulig v1.0. Den skal aldrig udsende data automatisk.

---

# ÆselKlog – udviklingsplan v0.9.10.1 (15. oktober 2026)

**Status:** v0.9.10.1 er en lille taleopdatering bygget på den tidligere leverede komplette v0.9.10 ZIP; ved opstart viste GitHub `main` v0.9.9. Koden og automatiserede tests er gennemført lokalt. Upload til GitHub og test på installeret iPhone/ægte ElevenLabs mangler.

## v0.9.10.1 – varieret "Hov hov!"

- [x] Oplæserens *indledende* "Hov hov!" beholdes tilfældigt i 35 % af de hidtidige hilsener; ellers læses beskeden uden indledningen.
- [x] CPU-svar, handlingsfeltet "Hov hov", original lyd, ElevenLabs-Worker, tidsstyring og turflow ændres ikke.
- [x] Gentag genbruger samme variant og faktisk stemmerolle.
- [x] Whitelistet lydcache understøtter både med/uden indledning, uden at gemme spillernavne.
- [x] PWA-cache og alle fire projektfiler opdateret; nyt `narration.js` med automatiske regressionsprøver.
- [x] Alle 14 Node-tests og 9 Chromium-browserprøver bestået. Ingen reelle AI-kald i tests.
- [ ] Fysisk iPhone-/familietest, ægte ElevenLabs og GitHub-opdatering.

## Næste planlagte funktion

**v0.9.11 – forældreoversigt:** lokal oversigt over fremskridt i talforståelse, plus, minus og tabeller samt let tilgængelig sletning/privatliv. Matematik forbliver frivillig.

---

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
