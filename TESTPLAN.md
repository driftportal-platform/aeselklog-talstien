# ÆselKlog v0.9.6 – test af gemt-spil-knappen

## Automatisk

- [x] `python tests/test_home_v096.py` – både portræt og landskab med/uden gemt spil, alle hovedmenuknapper, fortsæt og slet.
- [x] Eksisterende Node-tests `for f in tests/*.test.js; do node "$f"; done`.
- [x] `python tests/test_home_v092.py`, `python tests/browser_smoke.py`, `python tests/persistence_browser.py`, `python tests/cpu_voice_browser.py`.

**Testet lokalt 15. oktober 2026:** Node (8/8), Playwright med mock-/offline-lyd, inklusive seks skærmstørrelser med og uden gemt spil. Ingen rigtige ElevenLabs-kald. Browser-test er Chromium, ikke WebKit/iOS Safari.

## Fysisk iPhone-PWA – kræver manuel test efter upload

- [ ] Luk den installerede ÆselKlog helt; genåbn og sørg for at versionen er opdateret.
- [ ] Uden gemt spil: ingen Fortsæt-knap; Spil, Indstillinger, Topscore og Om spillet kan trykkes.
- [ ] Start et spil, tryk **Gem & afslut**, og kontroller at Fortsæt-knappen står under den blå Spil-knap uden at dække Indstillinger.
- [ ] Tryk på **Fortsæt spil**, og se at position, spillere og tur er uændrede.
- [ ] Gem igen, tryk **✕**, bekræft sletning, og kontroller at fortsæt-knappen forsvinder, men Topscore ikke slettes.
- [ ] Prøv både portræt og landskab på installeret iPhone-PWA; kontrollér også skærmudsnit/safe areas og berøring.
- [ ] Kontrollér AI-/CPU-stemmer og offline-fallback som hidtil (ingen ændret Worker-nøgle).

---

## Tidligere tests

# V0.9.2 – test af ny forside

- [x] Første besøg åbner **Forside** med logo og Spil/Indstillinger/Topscore.
- [x] Spil viser kun navn, alder, CPU og start, ikke alle indstillingsfelter.
- [x] Indstillinger vælger talområde, læringstilstand, tempo, tabel, fysik/digitalt, voksen-niveau samt AI-/CPU-stemmer.
- [x] Indstillinger overføres korrekt til start og opbevares lokalt.
- [x] Gem & afslut går hjem, fortsæt-knappen genoptager gemt spil; Topscore-dialog åbner/lukker.
- [x] Der er testes browser-flow ved 390×844, 844×390 og 1280×800.
- [x] Tidligere action-, voksen-, gemme- og CPU-spiltests bestået.
- [ ] Test med rigtig iPhone og tilsluttet ElevenLabs, inklusive PWA-cache.
- [ ] Test sammen med mindre børn: er de tre forsideknapper lette at forstå?

---

# 🧪 ÆselKlog – praktisk test på iPhone og computer

**Test denne version:** v0.9 (grundtest fra 0.8-E + nye testpunkter)  
**Mål:** Kontrollér om spillet nu er klar til en første større familieprøve. Sæt kryds og skriv eventuelle fejl ned i GitHub Issues.

## Start med teknikken

- [ ] Åbn https://driftportal-platform.github.io/aeselklog-talstien/ og kontrollér versionsmærket **0.8-E**.
- [ ] Vend iPhonen vandret: spillepladen fylder skærmen, og knapper kan nås uden at dække tal/opgaver.
- [ ] Vælg **Stor plade**, prøv zoom, **Hele banen**, **Find æslet** og **✕ Luk**.
- [ ] Lyd til: Vælg Mia eller en anden dansk AI-stemme, tryk **Prøv valgt stemme**. Vælg telefonstemme og test igen.
- [ ] Lyd fra og til: ingen frysning eller uberegnelige CPU-ture, når oplæsning afbrydes.

## Spil og matematik

- [ ] **LEG:** Spil helt uden læringsopgaver med fysisk almindelig terning.
- [ ] **Digital terning:** Tryk på den store terning, se animation og resultat; æslet hopper korrekt på banen.
- [ ] **3–4 år:** Vælg barn på 3 år, kontrollér lette tal-/tælleopgaver uden tidspres.
- [ ] **5–6 år:** Plus/minus skal være let, og der må ikke komme tvungne svære gangestykker.
- [ ] **9 år:** Vælg 7-tabellen + TABELTRÆNING; opgaven skal handle om 7-tabellen hver tur. Prøv derefter blandede tabeller.
- [ ] **Voksen:** Vælg let/mellem/svær, kontrollér 60/30/10 sekunder og at nedtælling starter **efter** oplæsningen.
- [ ] **App i baggrunden:** Skift til en anden app i 10–20 sekunder under voksenopgave; tiden skal først fortsætte, når ÆselKlog åbnes igen.
- [ ] **CPU:** Lad Æslet spille, lyt om det får tid til at tale færdigt, og kontrollér at terning og hop vises. Skift kort væk fra appen under CPU-turen – den bør ikke fortsætte uden at I ser det.

## Handlinger og vindere

- [ ] ⭐ Bonus, 🫏 Hov hov, 🔄 Byt, 🏆 Talmester.
- [ ] 🥕 Gulerod (højst ét ekstra kast), 💧 Vandpyt (næste tur springes over), 🎁 Overraskelse, 🌉 Bro, 🎯 frivillig Superopgave.
- [ ] Actionikon/tekst bliver synligt under æslets tale og til handlingen er afsluttet.
- [ ] Ved forkert svar: ægte æsellyd; ved rigtigt svar: ekstra hop uden at bryde turens rækkefølge.
- [ ] Ved sejr: vinderfejring, antal rigtige svar og **Se topscore**. Tjek at sejren er registreret.
- [ ] Luk og genåbn spillet på **samme enhed**; Topscore skal stadig være der. Test sletning af Topscore, hvis I ønsker det.
- [ ] iPhone-indstilling for reduceret bevægelse: spillet skal stadig fungere uden konfetti.

## Fejl og feedback

Skriv ved en fejl: **enhed og browser, spiltype, valgt alder/tabel, placering på banen, forventet resultat, faktisk resultat**, og gerne et screenshot. Undgå fulde børnenavne og alle API-nøgler.

**Resultat:**

- [ ] Klar til familieprøve
- [ ] Kræver fejlretning (opret GitHub issue)

---

## 🆕 Tilføjelse til testplan – v0.9: gem/fortsæt og adaptive opgaver

- [ ] Kontrollér at startsiden har **Tilpas opgaver automatisk** og mulighed for at slå det fra.
- [ ] Start et spil med fysisk terning og mindst to spillere. Ryk et par felter. Tryk **Gem & afslut** fra spillepladen.
- [ ] Luk **hele** ÆselKlog (og eventuelt Safari) på iPhone. Åbn den samme webapp igen på **samme enhed**.
- [ ] Tryk **Fortsæt spillet**, og bekræft at navne, CPU, positioner, tur, terningevalg og spiltempo er bevaret.
- [ ] Prøv at lukke midt i en **opgave** og fortsætte senere. Opgaven og svarmulighederne skal være de samme.
- [ ] Prøv at lukke midt i en **animation**. Spillet må starte igen fra et sikkert punkt – uden duplikeret bonus.
- [ ] Som voksen: gem midt i en nedtælling. Ved fortsættelse skal resterende tid være bevaret, og nedtællingen starter efter oplæsning.
- [ ] Som barn: svar tre gange rigtigt uden at bruge et tip. Niveauet skal stige ét trin (ses ved spilleren). Svar derefter to gange forkert – niveauet skal blive lidt lettere.
- [ ] Prøv samme kamp med en 3-årig og en 9-årig. Den 3-årige må ikke få gangestykker, mens den 9-årige gerne må få tabelopgaver.
- [ ] Tjek at den lokale topscore stadig findes efter **Slet gemt spil**, men at et afsluttet spil ikke længere kan genoptages.
- [ ] Test AI-stemme og æsellyd både online og i offline/telefonstemme-tilstand.

**Bemærk:** Gemte spil findes kun i browserens lagring på denne enhed. Rydning af webstedsdata eller privat browsing kan fjerne dem.


## v0.9.1 – prøve af sjov CPU-stemme

1. Åbn indstillingerne og vælg Mia som spilleleder. Vælg Glenn eller *Automatisk* under **CPU-æslets egen stemme**.
2. Tryk **▶ Hør CPU-æslet svare**, og lyt efter en anderledes, lidt fjollet stemme.
3. Start et spil med CPU, vælg UDFORDRING eller TABELTRÆNING, og lad Æslet få et spørgsmål.
4. Kontroller, at CPU'en siger sit valgte svar **før** "rigtigt/forkert" vises; svaret skal også være markeret på skærmen.
5. Ved forkert CPU-svar kommer ægte æsellyd. Ved korrekt svar får CPU'en sit ekstra felt. Kontroller tempo og bevægelse.
6. Test at slå lyd fra, genindlæse appen, skifte mellem to stemmer og fortsætte et gemt spil. Test også offline telefonstemmen.
7. Sammenlign AI-credits før og efter 5–10 CPU-spørgsmål. Korte svar bruger stadig separate AI-forespørgsler; kontrollér forbrugsgrænserne.

**Automatiseret:** `node tests/cpuvoice.test.js` og `python tests/cpu_voice_browser.py` (mockede svar og lyd, ingen reelle API-kald).
