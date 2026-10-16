# 🫏 ÆselKlog v0.9.17 – Kortspil mod Æslet, frie korttræk og opdagede fejl (16. oktober 2026)

**Kilde:** Samtlige eksisterende kilder og den godkendte `home-fullscreen.webp` i GitHub `main` v0.9.16 blev kontrolleret mod det komplette projektarkiv før udviklingen. Denne v0.9.17-pakke indeholder alle projektfiler; GitHub opdateres **ikke** automatisk. Ægte Safari/iPhone og ElevenLabs er endnu ikke produktionstestet i denne release.

## Nyheder i det digitale kortspil

- **Spil alene mod Æslet:** Vælg "Spil mod Æslet" og én menneskelig spiller. Man kan også vælge 2–6 personer og tilføje CPU som modstander (op til syv deltagere). Kortspillet er stadig lokalt pass-and-play, ikke online-multiplayer. CPU'en vender og lægger kort uden ElevenLabs-forbrug.
- **Vend kort fra bunken:** Tryk på din **lukkede bunke** for at vende det næste kort. Knappen "Vend kort" findes stadig som alternativ til fysisk og tastaturbetjening. Brug enten det nyvendte kort eller toppen af din egen åbne bunke.
- **Træk kort frit:** Flyt kort fra din egen bunke til en række i midten eller modspillernes åbne bunker med **træk-og-slip** (Pointer Events på mus og touch), eller **tryk på kort og derefter på målbunken**. Mobiltræk ved skærmens kant kan rulle siden; det enklere tryk/tap-flow er altid tilgængeligt. Der er også en foreslået lovlig placering som frivillig genvej.
- **Ingen automatisk afvisning af regelfejl:** Man kan lægge et kort på en forkert bunke, lægge et muligt kort i sin egen åbne bunke eller vende videre, selv om et åbent kort kunne bruges. Appen gemmer den synlige placering og retter den ikke uden indsigelse. Reglerne om lovlige træk er fortsat de klassiske: laveste tal starter opadgående midterrækker, ellers ±1 på åbne modspillerbunker med prioritet til midten.
- **Opdaget fejl = fortryd + æselkort:** Tryk på det **store synlige æselkort "Opdaget fejl!"** for at udfordre det *senest lagte kort*. Var trækket forkert, bringes bordet præcis tilbage til tilstanden før trækket, og den ansvarlige får ét æselkort (samt eventuel tilvalgt ekstra kortstraf). Ved korrekt træk gives ingen straf. Der findes fortsat en særskilt manuel strafknap til familieaftaler, uden automatisk fortrydelse.
- **Æslet holder øje – men ikke altid:** CPU kan opdage menneskers forkerte korttræk med en chance på cirka 72 %, efter en kort pause. Det accepterer også lovlige træk. CPU kan desuden indimellem lægge et forkert kort selv; andre kan udfordre det. Dette er en underholdende regelbaseret CPU, ikke en ufejlbarlig dommer.
- **Gem og fortsæt:** Kortspillet benytter fortsat `aeselklog-kortspil-v1`, nu med et valgfrit enkelt checkpoint for seneste træk. En endnu ikke udfordret fejl og CPU-deltageren kan genoptages efter lukning. Gammel v0.9.15/16-gemning læses fortsat, også uden de nye felter.

## Særligt bevaret

- Kortspillets fem talområder (1–20, 21–40, 41–60, 61–80, 81–100), fem kort af hvert tal, begge æselkort-varianter og valgfri ekstra kortstraf. Matematik er fortsat **helt frivillig**.
- Talstiens separate gemning, op til seks personer + CPU, den godkendte forside, fysisk A3-plade, tilfældige specialfelter, læringsprofiler, forældreoversigt, almindelige ElevenLabs-stemmer og lydcache. **Ingen ændringer i Cloudflare Worker eller API-secrets.**

## Installation og test

1. Pak den **komplette ZIP** ud, og læg alle filer i repositoryets rod, inklusive nye testfiler og opdaterede `cardgame-engine.js`, `cardgame-ui.js`, `index.html`, `styles.css` og `sw.js`. Upload ikke kun ZIP-filen.
2. Opdateret cache-id: `aeselklog-talstien-v0917-cards-cpu-free-moves`. Åbn PWA igen, og se **PRØVEVERSION 0.9.17**.
3. Prøv Kortspil med **1 person + Æslet**, vend ved bunken, læg et forkert kort i midten, og tryk **Opdaget fejl!**. Kontrollér fortrydelse og æselstraf. Prøv også træk-og-slip samt Kortspil → Gem/fortsæt.
4. Node-test, Chromium-browserregressioner og PWA-unit-test er gennemført med **simuleret** lyd. Reel iPhone Safari/WebKit, iOS offline-installation/genstart, touch i fuld PWA og familieafprøvning af reglerne skal testes fysisk. Se `TESTPLAN.md`.

Læs `PROJEKTSTATUS.md`, `UDVIKLINGSPLAN.md` og `IDEKATALOG.md` før nye versioner. Alle seks projektdokumenter er opdateret i denne pakke.

---

# 🫏 ÆselKlog v0.9.16 – tydelig spilvælger og op til seks spillere (16. oktober 2026)

**Projektets aktuelle udviklingspakke:** v0.9.16. **Senest verificerede GitHub `main` ved udviklingsstart:** v0.9.15. v0.9.16 er en komplet lokal ZIP, som skal uploades til GitHub, før den er live. Den godkendte forside og de eksisterende spilfunktioner er bevaret.

## Hvad er nyt?

- Under **Spil** er begge valg nu store, tastaturtilgængelige **klikbare kort** med tydelig aktiv markering: 🎲 **Talstien** og 🃏 **Kortspil**. De vises side om side på computer og stablet på mobil.
- Man kan skifte frem og tilbage **fra begge spilmenuer**. Valg af Talstien viser kun navne/aldre/CPU og Talstiens spilindstillinger. Valg af Kortspil viser kun kortspillets talområde, strafregler og navne.
- Talstien understøtter nu **op til seks navngivne menneskespillere samt eventuelt CPU-æslet**. Der er seks særskilte farver og en tydelig grænse ved Tilføj spiller. Kortspillet understøtter fortsat 2–6 menneskespillere.
- `savegame.js` tillader nu **syv deltagere i alt** (6 + CPU); eksisterende schema 1, lagernøgle, gemte spil og CPU-/tale-/læringsregler bevares. Det gamle maksimum på fem deltagere i save-valideringen er løftet, uden at ændre reglerne for kortspil.
- PWA Service Worker cache: `aeselklog-talstien-v0916-mode-selector-six-players`. `index.html`, `app.js`, `savegame.js`, `styles.css`, `sw.js` og tests opdateret. Ingen nye API-nøgler eller cloudlagring.

**Automatisk test:** 20 Node-tests og 15 Chromium-browsertests er bestået lokalt. Talestemmerne er simulerede; ægte iPhone/WebKit, offline-PWA og ElevenLabs mangler stadig verificering.

**Produktfokus:** ÆselKlog er stadig **to selvstændige spil**: Talstien med digital eller fysisk A3-plade og et kortspil med fem talområder. Ingen matematik er obligatorisk i grundspillet; valgfri læring og familiehygge prioriteres.

**Dokumentation som altid skal opdateres ved en release:** `README.md` (detaljer og installation), `UDVIKLINGSPLAN.md` (fremdrift/næste skridt), `TESTPLAN.md` (teststatus), `AGENTS.md` (tekniske regler), **`PROJEKTSTATUS.md`** (kort aktuel status) og **`IDEKATALOG.md`** (beslutninger, uafklarede idéer). Se statusfilen før næste release, og læs altid GitHub-main som den eneste autoritative kodekilde.

## Upload og kontrol

1. Pak hele v0.9.16-ZIP'en ud og læg filerne i roden af `driftportal-platform/aeselklog-talstien` (upload ikke ZIP'en alene).
2. Kontroller `PRØVEVERSION 0.9.16` på spilskærmens sideheader. Test begge store spilknapper, både mobil og desktop.
3. Vælg Kortspil → Talstien → Kortspil. Kontroller at kun den valgte spiltypes opsætning vises.
4. Start Talstien med **6 navne + CPU**, gem, genåbn og fortsæt; der skal stadig være syv deltagere og uændrede farver.
5. Test på fysisk iPhone-PWA, især efter opdatering og uden netværk. Rigtig WebKit/iOS, Æsellyd og ElevenLabs kræver manuel afprøvning. Browserautomatik benytter simuleret tale.

**Kendte afgrænsninger:** Kortspil er fortsat en første lokal digital pass-and-play-prototype uden CPU og uden indbygget AI-tale; den fysiske kortpakke er endnu ikke produceret for alle talområder. A3-pladens trykte specialfelter skal sammenlignes med appens faste layout. Før v1.0 mangler iPhone-/tilgængelighedstest og familieafprøvning.

---

# 🫏 ÆselKlog v0.9.15 – kortspil med fem talområder (16. oktober 2026)

## Nyt: selvstændigt digitalt kortspil ved siden af Talstien

- Tryk **Spil** på den godkendte forside. I spillermenuen vises nu **Talstien** (den eksisterende, uændrede spiltype) og **Kortspil**. Kortspillet har selvstændig opsætning og fuldt digitalt spil på én enhed (2–6 menneskelige spillere, som skiftes).
- Vælg præcis ét af de fem farveområder: **1–20, 21–40, 41–60, 61–80, 81–100**. Hvert valg giver 100 talkort: **fem kopier af hvert af de 20 tal**. Laveste tal i området starter en række i midten (1, 21, 41, 61 eller 81). Der kan påbegyndes indtil fem sådanne rækker. I midten lægges kun næste tal i stigende rækkefølge.
- Har kortet ikke en plads i midten, kan det lægges ovenpå en anden spillers åbne bunke, hvis tallet er ét højere eller ét lavere. Appen prioriterer midten og ellers nærmeste åbne bunke til venstre. Spilleren kan lægge fra toppen af sin egen åbne bunke eller vende det øverste af den lukkede. Hvis et nyt vendt kort ikke passer, lægges det på spillerens åbne bunke, og turen går videre. Når lukkede kort slipper op, vendes den åbne bunke om igen. Den første uden **talkort** vinder.
- **Klassisk ÆselKlog** (standard): 4, 6 eller 8 æselkort som strafkort. Når en spiller får et æselkort, beholdes det. Der findes højst det valgte antal æselkort i alt. Æselkort tælles ikke som talkort i vinderreglen.
- **Send æslet videre**: Ét æselkort i hele spillet. Ved en fejl går det til den nye spiller, der skal have straf, og forsvinder fra den tidligere ejer.
- **Valgfri ekstra straf**, slået fra som standard: ved en fejl modtager spilleren også ét kort fra hver af de andres *lukkede* bunker, hvis de har kort. Da appen ikke kan se, om nogen overser et muligt træk ved et fysisk bord, aktiveres straffen manuelt med bekræftelse. I det digitale spil viser appen kun lovlige placeringer, så fejlstraffen er tiltænkt familiens egne aftaler.
- Talkortene i appen har store tal, rigtige farver, lige/ulige, tiere/enere og primtalsmarkering. Illustrationerne er inspireret af den tidligere 21–40-prototype og er endnu ikke pixel-identiske med den trykte kortgrafik. Kortspillet har **ingen obligatoriske matematikopgaver**; frivillige læringsvarianter og fysisk printintegration kan udvides senere.
- Kortspillet bruger `cardgame-engine.js` (regler) og `cardgame-ui.js` (visning). Én lokal kortspilsgemmning gemmes i `aeselklog-kortspil-v1` – uafhængigt af Talstiens `aeselklog-igangvaerende-v1`. Automatisk gemning efter stabile træk og knapperne Fortsæt kortspil, Gem og tilbage og Slet gemt kortspil. Ingen konto, server eller API-nøgle.

**Vigtig afgrænsning:** Første digitale kortspil er en spilbar *pass-and-play-prototype* (ikke online multiplayer og endnu ingen CPU-modstander eller ElevenLabs-oplæsning i kortspillet). Det trykte kortsæt fra billederne omfatter 21–40 og æselkort som prototypetryk. En komplet fysisk pakke med fem kopier af hvert tal, tryk, præcise fysiske regler og en særskilt fysisk kortspil-assistent færdiggøres senere. Den oprindelige Talstien-PWA, stemmer, læring, fysik/digital plade, gemning og forside bevares.

**Kilde:** GitHub `main` v0.9.14 blev verificeret sammen med `README.md`, `AGENTS.md`, `TESTPLAN.md` og `UDVIKLINGSPLAN.md`. Den lokale ZIP fra v0.9.14 matchede GitHub på de kontrollerede kildefilers Git-SHA. Ingen direkte ændring af GitHub `main` er udført i denne leverance.

**Test:** `node --check` og 19 Node-tests inklusive `cardgame.test.js`; 14 Chromium-browsertests bestået, herunder `cardgame_browser.py` i 390×844, 844×390 og 1280×800. Gammel Talstien-forside, CPU, voksen-timer, stemmecache, profilhistorik, forældreoversigt, fysiske A3-plade, sikker gemning og PWA præcache er regressionsprøvet. Ingen faktiske ElevenLabs-kald. Den særskilte HTTP/Service Worker-installationstest kunne ikke gennemføres: Chromium i dette miljø blokerer `127.0.0.1` med `ERR_BLOCKED_BY_ADMINISTRATOR`. Fysisk iPhone-PWA/WebKit, fysisk kortprototypetest og realistiske familietests er fortsat udestående.

**Upload:** Pak hele ZIP-filen ud og upload alle filer til GitHub-repositoryets rod, især de nye `cardgame-engine.js` og `cardgame-ui.js`, samt ændrede `index.html`, `styles.css`, `app.js` og `sw.js`. Upload ikke ZIP-filen alene. Vent på GitHub Pages og genåbn den installerede PWA. Verificér **PRØVEVERSION 0.9.15**.

---

# 🫏 ÆselKlog – Talstien v0.9.14 (16. oktober 2026)

## Afslut-menu og reel fysisk spilleledervisning

- På spilleskærmen findes nu **⏻ Afslut** øverst; i stor digital plade findes knappen også øverst. Menuen tilbyder **💾 Gem og afslut**, **✕ Afslut uden at gemme** (med ekstra bekræftelse) og **↩ Fortsæt spillet**. Den eksisterende **Gem & afslut**-knap bevares i almindelig brætvisning; på stor plade bruges Afslut-menuen for at give plads til betjeningen.
- Ved en igangværende animation/terning, hvor spillet endnu ikke er sikkert at gemme, er **Gem og afslut** midlertidigt slået fra med forklaring. Man kan stadig annullere eller afslutte uden gemning. Mens Afslut-menuen er åben, venter CPU-æslet og voksenopgavens tidtager. Ved **Fortsæt spillet** går tur og tid videre.
- Valget **Digital plade** fungerer som før: stor levende digital bane, farvede brikker og **ny tilfældig fordeling** af specialfelter ved nyt spil.
- Valget **Fysisk A3-plade** er nu en reel, separat spilleledertilstand: appen starter i almindelig spilvisning med et tydeligt felt om, hvem der er på tur, og hvor den fysiske brik skal stå; **brikkerne flyttes af spillerne på A3-pladen**. Appen styrer stadig tur, regler, læringsopgaver, terninger, lyd, CPU og resultater; den digitale bane er tilgængelig som et frivilligt **Digitalt overblik**. Brikkerne animeres ikke felt-for-felt på appskærmen i fysisk mode.
- Fysisk A3 benytter den **eksisterende faste specialfeltfordeling** (`A.FIELDS`), mens ny digital bane bruger det tilfældige feltlayout. **Kontrollér på jeres konkrete print af A3-pladen, at markeringerne matcher appens faste felter**; tidligere prototypetryk kan afvige. Gemte spil fra ældre versioner beholder nøjagtigt deres gemte specialfelter, også hvis fysisk mode tidligere brugte tilfældig fordeling.
- Spillepladen og den almindelige læringsterning har stadig uafhængige valg af **fysisk eller digital terning**.
- Den uønskede **"0."-markør** ved **Stemme og lyd** er fjernet ved at normalisere detaljemenuens markør; en tydelig pil viser åben/luk.
- **Kortspillet er ikke ændret i denne release.** De fotograferede 21–40-talkort og æselkort indgår som reference til senere udvikling. Aftalte kortregler: standardspillet kan bruge flere af de 8 æselkort, der beholdes når man får dem; en separat variant med ét æselkort kan lade kortet vandre mellem spillerne. Matematik er altid valgfri.

**Sikkerhed og kompatibilitet:** Den godkendte illustration `home-fullscreen.webp` er byte-identisk med v0.9.13. Eksisterende lagernøgle og save-schema er uændret; forældreoversigt, offline-lydcache, stemmevalg og Cloudflare/ElevenLabs-integrationen ændres ikke.

**Kilde:** Verificeret GitHub `main` v0.9.13 mod den komplette tidligere leverede ZIP (matchende Git-blobs). v0.9.14 er udviklet oven på den kode, ikke en ældre pakke. GitHub er ikke automatisk opdateret.

**Tests:** 18 Node-tests samt 13 Chromium-browsertests gennemført lokalt. Den nye `tests/physical_exit_browser.py` tester 390×844, 844×390 og 1280×800, fysisk start, faste specialfelter, gem/genoptag, afslut med/uden lagring, separat digital mode, CPU-pause, voksen-timer og stemmemarkør. Browserlyd og lokallager er simuleret; ingen reelle ElevenLabs-credits er brugt. Fysisk iPhone/WebKit, ægte lydbetjening og placering på den konkrete trykte A3-plade kræver manuel test.

**Installation:** Pak hele ZIP-filen ud og upload filerne direkte til roden af `driftportal-platform/aeselklog-talstien`, også `styles.css`, `app.js`, `index.html` og den opdaterede `sw.js` med cache `aeselklog-talstien-v0914-exit-physical-board`. Genåbn den installerede PWA efter GitHub Pages-opdatering og kontrollér v0.9.14.

---

# 🫏 ÆselKlog – Talstien v0.9.13 (15. oktober 2026)

## Nye varierende specialfelter og fem farvede roser

- **Hvert nyt spil får sin egen tilfældige fordeling** af de ni typer specialfelter på banen 1–100, både med varieret antal og positioner. Intervaller: **Gulerod 3–5**, **Bro 2–4**, **Vandpyt 2–4**, **Bonus 4–6**, **Hov hov 2–4**, **Byt 1–3**, **Talmester 1–3**, **Overraskelse 1–3**, **Superopgave 1–2**. Det er muligt, at et antal gentages tilfældigt fra ét spil til det næste – det er ikke et fast antal.
- Fordelingen er balanceret over de fem farvezoner (højst ét specialfelt til forskel pr. område). Start og mål holdes fri, også i spil med ét valgt talområde (fx 21–40). **Specialfelter ligger aldrig direkte ved siden af hinanden.** Ved 5 eller færre i et talområde forsøges større indbyrdes afstand.
- **Gem & fortsæt** opbevarer den eksakte fordeling i den eksisterende schema-1-spilgemning. **Gemte spil fra v0.9.12 og ældre får den gamle faste fordeling**, så en opdatering ikke flytter specialfelter midt i en kamp. Ved start af et nyt spil laves den tilfældige bane.
- I forklaringen under spillepladen vises **fem ens SVG-roser** – blå 1–20, lyserød 21–40, gul 41–60, grøn 61–80, lilla 81–100. SVG bruges for at bevare farverne på iPhone og Windows.
- Det **fulde æselbillede på terningeskærmen** vises nu uden beskæring. Den runde **Æsellyd-knap** har ekstra afstand fra kanten, både på stor spilleplade og i normal visning.
- Alle tidligere spilregler er bevaret: ingen action-kædereaktioner, frivillig matematik i LEG, CPU følger samme regler, maksimal ét ekstra Gulerod-kast per tur, vindermål, stemmevalg/ventetider, Cloudflare Worker, 35 % “Hov hov!”, lydcache, adaptiv læring, forældreoversigt og den godkendte illustration på forsiden.

**Arkitektur:** `actions.js` har nu `COUNT_RANGES`, `generateLayout()` og `validateLayout()`. `savegame.js` gemmer det valgfri, validerede `specialFields`, uden at ændre lagernøgle eller schema. `app.js` genererer fordeling ved nyt spil, genskaber den ved Fortsæt, og bruger samme kort til både SVG og handlingsreglerne. `styles.css`/`index.html` indeholder roser og de to visuelle rettelser. PWA-cache opdateret til `aeselklog-talstien-v0913-random-action-layout`.

**Kilde:** Nyeste GitHub `main` blev kontrolleret til v0.9.12, og nøglekildefiler i den anvendte komplette v0.9.12-ZIP blev sammenlignet med GitHub via Git-blob-SHA. ZIP-filen her er ikke automatisk publiceret.

**Tests:** 18 Node-tests og 12 Chromium-browsertests, inklusive 700 syntetiske randomiserede baner, 3 skærmstørrelser, bonus-regel, lydknap-geometri, five roser, gem/fortsæt og ældre gemning. AI/telefonlyd er simuleret i browserprøverne. En rigtig iPhone-PWA, WebKit/VoiceOver og live ElevenLabs mangler stadig fysisk test efter upload. Se `TESTPLAN.md`.

**Upload:** Pak hele ZIP-filen ud og upload **indholdet** til roden af `driftportal-platform/aeselklog-talstien`. Bevar eksisterende filer, og sørg for at alle opdaterede `actions.js`, `app.js`, `savegame.js`, `styles.css`, `index.html`, `sw.js` og tests kommer med. Genåbn iPhone-PWA efter GitHub Pages er opdateret.

---

# 🫏 ÆselKlog – Talstien v0.9.12 (15. oktober 2026)

## Nyt: levende specialfelter, uden ændringer i spilreglerne

- Når æslet lander på et **actionfelt**, vises en tydeligere pop-up med actionens symbol og kort forklaring. Bonus, Talmester og Bro får glædes-effekter; Hov hov! får en lille rystelse; Vandpyt en vand-effekt; Byt og Superopgave en rolig effekt; Gulerod viser ekstra kast.
- Pop-up-feltet viser det relevante antal felter (f.eks. **+2**, **−2**, **+4**). Overraskelse starter som et spørgsmål og viser derefter det faktiske resultat, også hvis banegrænsen begrænser flytningen.
- Effekterne styres af et lille **`actionfx.js`**-modul med kun godkendte typer. Al ny animation ligger i pop-up-feltet – **ingen `transform` af SVG-brættets felter eller spillerbrikker**. Feltpositionerne ændres ikke.
- I stående iPhone-format er turpanelet under hop rettet, så teksten ikke klemmes ned i en smal søjle.
- **Reduceret bevægelse** på telefonen slår de nye bevægelseseffekter fra og bevarer al funktionalitet. Pop-up bliver stadig læsbar. Den er markeret som status for skærmlæsere med atomisk oplæsning.
- **Ingen ekstra ElevenLabs-kald**: Vi genbruger den eksisterende oplæsning for hvert actionfelt. Der er ingen nye API-nøgler, dataindsamling eller lagring.
- **Samme regler:** kun én handling pr. landing, ingen action-kædereaktioner, CPU følger samme regler, Gulerod højst ét ekstra kast, og LEG uden obligatorisk matematik.
- **Bevaret:** godkendt forside (`home-fullscreen.webp` er byte-identisk med GitHub), kompakt Fortsæt spil, rund Æsellyd-knap, 35 % Hov hov-variation, individuelle læringsprofiler, forældreoversigt, lokal lydcache, ElevenLabs via eksisterende Cloudflare Worker, gem/fortsæt og PWA-offline.

### Filer og upload

Komplet ZIP til GitHub; alle eksisterende filer plus **`actionfx.js`** og **`tests/actionfx.test.js`** samt **`tests/actionfx_browser.py`**. Nye `actionfx.js` indlæses før `app.js`. Versionen af `sw.js` er `aeselklog-talstien-v0912-lively-actions` og indeholder det nye modul.

**Grundlag:** Nyeste GitHub `main` blev bekræftet som v0.9.11 ved udviklingsstart. Den forrige fulde v0.9.11 ZIP matcher GitHub på de centrale kildefiler og godkendt forside. Ingen automatisk GitHub-upload er udført.

**Test:** `node --check`, alle Node- og Chromium-browsertests med mockede stemmer og offlinelager. Ingen live ElevenLabs-kald eller fysisk Safari/iPhone-PWA-test; se `TESTPLAN.md` for den konkrete teststatus og manuelle kontroller.

**Installation:** Pak ZIP-filen ud, upload de udpakkede projektfiler direkte i roden af `driftportal-platform/aeselklog-talstien`, inklusive `actionfx.js`, `styles.css` og `sw.js`. Upload ikke kun ZIP-filen. Vent på GitHub Pages, og genåbn den installerede iPhone-PWA. Vælg LEG, rul eksempelvis 5 fra start og se ⭐ Bonus-feltet.

---

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
