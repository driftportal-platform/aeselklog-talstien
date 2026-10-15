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
