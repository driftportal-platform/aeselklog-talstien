# 🫏 ÆselKlog – udviklingsplan og projektstatus

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
