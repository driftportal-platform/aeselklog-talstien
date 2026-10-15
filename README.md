# 🫏 ÆselKlog – Talstien v0.9.11 (15. oktober 2026)

## Ny funktion: Forældreoversigt med lokal læringshistorik

- Åbn **Indstillinger → Husk barnets niveau mellem spil → 📈 Forældreoversigt**. Her kan man vælge et barns selvvalgte kaldenavn og se **talforståelse, plus, minus og gangetabeller** hver for sig.
- Hvert kort viser barnets aktuelle *spiltilpasningsniveau* (−2 til +2), antal rigtige/forsøg, de seneste 30 dages registrerede øvelser og en kurve over højst 12 nyere øvelser. Grøn prik = korrekt svar, orange = forkert svar. Dette er **ikke en faglig vurdering**.
- Fra denne version gemmer `profiles.js` en begrænset historik på maks. **96 gennemførte læringsopgaver pr. barn**, i det eksisterende lokale v1-profilformat. Historikken indeholder kun tidspunkt, regneart, korrekt/forkert, om tip blev brugt og tilpasningsniveau. **Ikke** opgavetekst, eksakt svar, fødselsdato, alder, lyd eller API-nøgler. Ingen server, konto eller synkronisering.
- **Gamle profiler bevares:** eksisterende niveauer og forsøgstal fra v0.9.10.1 vises straks. De nye historikkurver begynder først fra første opgave efter opgraderingen; der opfindes ingen historik.
- **Slet dette barns læringsdata** fjerner én lokal profil med bekræftelse. Den tidligere knap **Slet læringsprofiler** fjerner fortsat alle profiler. Ingen af dem sletter Topscore, PWA-lydcache eller et gemt spil. Vær opmærksom på, at et igangværende spil stadig har sit egen midlertidige læringstilstand.
- Data gemmes kun, når **Husk barnets niveau mellem spil** og automatisk tilpasning er slået til, barnet har et gyldigt og entydigt kaldenavn og der er blevet svaret på en opgave. Uden lokal lagring virker spillet fortsat.
- Den godkendte forside, kompakte Fortsæt spil, rund æsellyd-knap, frivillig LEG, aldersgrænser, CPU-turpauser, varieret 'Hov hov!', stemmevalg, ElevenLabs via Cloudflare, offlinefunktion, lydcache og gemte spil er bevaret. **Ingen ændring af Cloudflare secrets eller det godkendte forsidebillede.**

### Filer og installation

Nyt `parentreport.js`-modul med lokal opsummering og graf samt `tests/parentreport.test.js`, `tests/profile_history.test.js` og `tests/parent_overview_browser.py`. Ændret `profiles.js`, `app.js`, `index.html`, `styles.css`, `sw.js`, browserregressioner og dokumentation. PWA-cache: `aeselklog-talstien-v0911-parent-overview`.

**Kilde:** Nyeste GitHub `main` er verificeret til **v0.9.10.1** før arbejdet. Alle kildefiler i den tidligere v0.9.10.1 ZIP blev sammenlignet med GitHub på relevante Git-hashes. Denne ZIP indeholder hele projektet til manuel upload, ikke blot ændrede filer. For at installere: pak ZIP'en ud og upload indholdet til repositoryets rod, inklusive `parentreport.js`, opdater `sw.js`, og vent på GitHub Pages. Upload **ikke** kun selve ZIP-filen. Genåbn derefter iPhone-PWA og kontrollér versionsmærket v0.9.11.

**Testgrænse:** Automatisk Node-/Chromium-test bruger simuleret tale og lokallager. Reel iPhone-PWA, live ElevenLabs og offline-oplevelsen bør afprøves på fysisk telefon efter upload. Se `TESTPLAN.md` for testresultater og manuelle prøver.

---

# 🫏 ÆselKlog – Talstien v0.9.10.1 (15. oktober 2026)

## Mindre forbedring: Oplæseren siger ikke "Hov hov!" hele tiden

- Når en **almindelig oplæsning** begynder med "Hov hov!", bevares indledningen tilfældigt med **35 % sandsynlighed**. I de øvrige 65 % starter stemmen direkte med beskeden. Det gælder alle valgte fortællerstemmer, både ElevenLabs og telefonens oplæsning.
- Variationen sker **før** ElevenLabs-kald og opslag i lydcachen og kræver ingen ekstra kald eller credits. De eksisterende faste og anonyme sætninger kan stadig gemmes, med og uden indledningen, per valgt stemme. Ingen børnenavne optages i den permanente lydcache.
- **CPU-æslets egne svar ændres ikke**. Hvis "Hov hov" optræder som et actionfeltnavn eller midt i en sætning, ændres det heller ikke. Æsellyden er uændret.
- **Gentag** afspiller samme konkrete formulering igen og bruger samme CPU-/fortællerstemme som originalen.
- Intet er ændret i spillepladen, gemte spil, individuel læring, godkendt forside eller Cloudflare/ElevenLabs-konfiguration.
- Nyt lille `narration.js`, tilføjet til `index.html` og PWA-cache `aeselklog-talstien-v0910-1-intro-variety`. Alle filer skal uploades sammen.

**Grundlag:** GitHub `main` kontrolleret til v0.9.9 ved udviklingsstart. v0.9.10.1 er bygget videre på den *komplette, tidligere leverede* v0.9.10 ZIP, fordi denne endnu ikke var på GitHub ved opstart. Upload alle filer fra **denne** ZIP for at få v0.9.10-funktionerne med. Den godkendte `home-fullscreen.webp` er uændret.

**Test:** Alle 14 Node-tests og 9 Chromium-browsertests er bestået, inklusive mock-telefonstemme, stemmecache, CPU, gem/fortsæt, mobilforside og individuel læring. Ingen rigtige ElevenLabs-kald i testene. Test derefter på installeret iPhone-PWA; reel iOS-afspilning/PWA-cache kan ikke garanteres af Chromium-tests.

---

# 🫏 ÆselKlog – Talstien v0.9.10 (15. oktober 2026)

## Nyhed: hvert barn har fire separate læringsniveauer

- **Talforståelse**, **plus**, **minus** og **gangetabeller** styres nu uafhængigt med trin fra −2 til +2. Tre rigtige i træk uden tip øger kun niveauet i det relevante område; to forkerte reducerer kun samme område. Resultater med tip registreres, men øger ikke en rigtig-streak.
- Opgavegeneratoren markerer hvert nyt spørgsmål med område, og tilpasser sværhedsgraden *efter denne type opgave*. Børnenes alder sætter fortsat den overordnede grænse. 3–6-årige får ikke tvungne gangestykker. Voksnes 60/30/10 sekunder er uændrede.
- **Husk barnets niveau mellem spil** under Indstillinger er slået til som udgangspunkt og kan slås fra. Den lokale hukommelse bruger kun et selvvalgt **kaldenavn**, ikke alder eller login. Standardnavne som "Spiller 1" opretter ikke en vedvarende profil. To spillere med samme kaldenavn i samme spil får ikke fælles profil. På delt enhed anbefales forskellige kaldenavne.
- Knappen **Slet læringsprofiler** sletter kun profilerne på den aktuelle enhed, ikke Topscore eller igangværende gemt spil. Samlet højst 12 lokale navne; ingen cloud-synkronisering.
- Gamle gemte spil med schema v1 kan fortsættes uden at miste tur, spørgsmål eller positioner. Historisk *samlet* sværhedsgrad fra v0.9.9 bruges som startniveau i hvert område, men gamle forsøgsantal fordeles **ikke** på regnearter, som de ikke kan dokumentere.
- **LEG kræver fortsat ingen matematik**, bortset fra helt frivillige superopgaver. Fysiske/digitale terninger, CPU-æsel, specialfelter, den godkendte forside, kompakt Fortsæt spil, rund æsellyd-knap og alle ElevenLabs-stemmevalg er bevaret.
- **Lydcachen fra v0.9.8/v0.9.9 er bevaret** og ændrer ikke på de nye niveauer.
- Filer: nyt `profiles.js`, ændret `adaptive.js`, `engine.js`, `savegame.js`, `app.js`, `index.html`, `styles.css`, `sw.js`, tests og dokumentation. PWA-cache: `aeselklog-talstien-v0910-subject-learning`.

**Kilde:** GitHub `main` (v0.9.9) verificeret 15.10.2026; den seneste v0.9.9-ZIP matchede `main` på filernes Git-hashes. Denne ZIP bygger på den kode. Ingen direkte GitHub-commit er udført.

**Teststatus:** Alle Node-unit/regressionstests og Chromium-browserflow (inkl. spil, CPU, lydcache, stemme-reserve, gem/fortsæt, forside i 6 størrelser og læringsprofiler) er bestået med simuleret tale. Rigtig iOS-PWA og faktisk ElevenLabs skal testes på en fysisk enhed efter upload. Service Worker er undersøgt med Node-mock; den er endnu ikke testet installeret i iOS.

**Installation:** Pak ZIP'en ud, og upload *filerne fra arkivets rod* til GitHub-repositoryets rod – inklusive `profiles.js`. Behold ikke bare ZIP-filen på GitHub. Opdater/genåbn den installerede PWA, kontrollér versionsmærket **0.9.10**, og test indstillingen "Husk barnets niveau mellem spil" med et unikt kaldenavn.

**Næste idé:** En forældreoversigt, som kan vise de allerede gemte fire områder uden at samle yderligere data.

---

# 🫏 ÆselKlog – Talstien v0.9.9 (15. oktober 2026)

## Nyhed: UI-oprydning oven på intelligent lydcache

- `voicecache.js` gemmer **kun udvalgte, faste og upersonlige** ElevenLabs-sætninger på den aktuelle enhed i **IndexedDB**.
- Hvert lydklip identificeres ved **Worker-endpoint + valgt AI-stemme-ID + lydmodel-version + tekst**. Spillelederens stemme (Mia, Mads eller en anden) og CPU-æslets stemme holdes adskilt, når de faktisk bruger forskellige stemme-ID'er.
- Den permanente, stemmespecifikke AI-lydcache fra v0.9.8 er bevaret og uændret.
- Nye lydklip genereres kun, når de bliver brugt første gang. **Ingen forhåndsgenerering**, der forbruger credits uden at barnet spiller.
- Cachebegrænsning: **15 MB / 70 klip**, ældste klip slettes automatisk. Der lagres ingen spiller- eller børnenavne, personlige oplæsninger, adgangsnøgler eller fulde matematikopgaver.
- Under **Indstillinger → Stemme og lyd → Gemte AI-lyde** vises antal klip og størrelse, og man kan trykke **Ryd gemte AI-lyde**.
- Forsiden er justeret, så knappen **Fortsæt spil** ikke overlapper de godkendte menuknapper.
- Eksisterende 24-lydklips RAM-cache, ElevenLabs-Worker, CPU-turpauser, stemmevalg, godkendt forside, spil, gem/fortsæt og adaptiv matematik er bevaret.

**Filer:** Ny `voicecache.js`, ændringer i `app.js`, `index.html`, `styles.css`, `sw.js`, testfiler og dokumentation. PWA-cache: `aeselklog-talstien-v098-voice-cache`.

**Kilde:** Kontrolleret mod GitHub `main`, som ved udviklingsstart stadig viste v0.9.6. Denne version er bygget videre på den fulde lokalt leverede v0.9.7-pakke, som allerede indeholder CSS-opdeling og PWA-forbedringer. ZIP-pakken er **ikke** automatisk uploadet til GitHub.

**Automatisk test:** Node-tests, mobildesign, CPU-stemme, gem/fortsæt, AI-fejl-reserve og mock-IndexedDB til cache og sletning er testet. Der er **ikke** gennemført en reel ElevenLabs-test eller en fysisk iPhone-PWA-test. Lokal HTTP/Service Worker-installation blokeres af testmiljøet, så kontrollen skal udføres på telefon efter GitHub-upload.

**Installation:** Pak hele ZIP'en ud og læg alle projektfiler i GitHub-repositoryets rod, inklusive `voicecache.js` og `styles.css`. GitHub Pages må ikke få selve ZIP-filen som eneste fil. Åbn den installerede PWA igen, så opdateringen kan blive hentet. Gamle gemte spil og topscore bevares.

---

# ÆselKlog v0.9.7 – bedre offline, CSS og stemme-reserve

**Grundlag:** Lokal v0.9.6-releasepakke, som bygger på bekræftet GitHub `main` v0.9.5. `main` er ikke ændret af denne pakke. **Status:** de eksisterende Node- og Chromium-regressionstests samt nye mock-tests er bestået lokalt. Den faktiske Service Worker-installation og iPhone-PWA skal testes efter upload.

## Nyheder i v0.9.7

- CSS er flyttet **uden designændring** fra `index.html` til `styles.css`, så fremtidige rettelser er lettere og mere afgrænsede.
- PWA-cache præindlæser nu også `styles.css`. Den bruger cache-first til billeder/lyde og netværk-first med offline-fallback til HTML/JS/CSS. Kun caches, der tilhører ÆselKlog, bliver ryddet ved opdatering.
- AI-oplæsningen bruger nu også lokal telefonstemme efter **timeout** (AbortError) og ved offline-tilstand. Ved gentagne fejl holder appen 60 sekunders pause fra AI-forsøg, uden at ændre det gemte stemmevalg. Manuel ændring af AI-stemme nulstiller pausen.
- Skift mellem Forside, Spil, Indstillinger og selve spillet flytter tastatur-/skærmlæserfokus til den nye visning. AI-stemmestatus læses op for skærmlæsere.
- Den godkendte fuldskærmsforside, kompakt Fortsæt spil, spilmotor, gemte spil, CPU-regler og Cloudflare Worker er bevaret.

**Upload:** Pak ZIP-filen ud, og upload **alle** filer, inklusive den nye `styles.css`, til GitHub. Der skal ikke uploades ZIP-filen som én fil i roden. Åbn appen via det kendte GitHub Pages-link. Opdatér PWA'en, så den nye Service Worker tager over. Gemte spil ligger lokalt og berøres ikke af denne cacheopdatering.

**Test:** `for f in tests/*.test.js; do node "$f"; done` og Playwright-testene fra `TESTPLAN.md` er kørt med succes. Reelt lokalt HTTP-PWA-smoketest kunne ikke udføres i det begrænsede browsermiljø, hvor adgang til localhost blev blokeret. Test fysisk på iPhone før v1.0. Ingen produktionstest af ElevenLabs er udført.

---

## Tidligere version – v0.9.6

# ÆselKlog v0.9.6 – kompakt Fortsæt spil på forsiden

**Kilde:** GitHub `main` v0.9.5. v0.9.6 er lavet fra filer verificeret byte-for-byte med GitHub, inklusive de originale billeder. **Status:** lokalt udviklet og testet; afventer upload og kontrol på rigtig iPhone-PWA.

## Nyt i v0.9.6

- Den store boks med **Gemte spil** er fjernet fra forsiden. Kun når et gyldigt lokalt gemt spil findes, vises **▶ Fortsæt spil** og en lille **✕** til at slette gemningen.
- I stående format ligger knappen i den smalle overgang mellem den blå Spil-knap og Indstillinger, uden at dække knappernes tekst. Fire oprindelige menuer (Spil, Indstillinger, Topscore, Om spillet) er altid tilgængelige.
- I liggende format får **Fortsæt spil** sin egen lille række mellem Spil og Indstillinger, når der findes et gemt spil.
- Den godkendte illustration (`home-fullscreen.webp`) er **identisk med v0.9.5**, og spilmotor, gemmeformat, stemmer og ElevenLabs-forbindelse er ikke ændret.
- Opdateret Service Worker-cache: `aeselklog-talstien-v096-compact-resume`.
- Version i HTML og dokumentation opdateret til v0.9.6.

## Test

Kør `python tests/test_home_v096.py` til test af begge skærmretninger, menuer, fortsæt og slet. Kør desuden de eksisterende Node- og Playwright-tests beskrevet i `TESTPLAN.md`. Browser-tests benytter kun simuleret lyd, ikke ElevenLabs-credits.

**Efter upload:** Opdatér eller genstart den installerede PWA på iPhone. Tjek at alle fire menuknapper kan vælges både med og uden gemt spil, og at et gemt spil kan genoptages. Den faktiske iOS-PWA og rigtig ElevenLabs-lyd kræver fysisk afprøvning.

App: https://driftportal-platform.github.io/aeselklog-talstien/

---

## Tidligere version – v0.9.5

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
