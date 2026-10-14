# 🫏 ÆselKlog – udviklingsplan og projektstatus

> **Læs dette dokument, README.md, AGENTS.md og seneste kode før næste ændring.** Opdater status ved hver udviklingsversion. Skeln mellem implementeret, browser-testet og afprøvet på rigtig telefon.

**Opdateret:** 14. oktober 2026  
**Senest kontrolleret GitHub `main`:** v0.8-C  
**Seneste samlede, udviklede prøvepakke:** v0.8-E (baseret på det komplette v0.8-D-arkiv), klar til GitHub-upload  
**Næste udviklingsfase:** v0.9 efter iPhone/familietest  
**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/  
**Kode:** https://github.com/driftportal-platform/aeselklog-talstien

## 1. Projektets faste principper

- ÆselKlog skal altid kunne spilles uden matematik (**LEG**); læringsopgaver er frivillige.
- Digital Talstien og fysisk A3-plade: tal 1–100 i fem farvede områder, aldrig manglende eller duplikerede feltnumre.
- Fysiske kort: 63 × 88 mm, fem af hvert tal og otte æselkort pr. variant som foreløbig plan. Ens bagsider, enkel original grafik, aflæselige fra begge ender.
- Børn fra 3 år og voksne skal kunne spille sammen. Treårige får opgaver i talgenkendelse, 5–6-årige let plus/minus, 7+ år tabeller og gradvist sværere opgaver. Børn uden tidspres; voksne 60/30/10 sekunder efter valg.
- Digitale/fysiske terninger, farvede æselbrikker, CPU-modstander som også kaster og kan svare forkert, stor spilleplade i mobilens liggende format.
- Spilflow: annoncer tur → almindelig terning → hop → eventuel læringsterning/opgave → ekstra hop ved korrekt svar → actionfelt → næste spiller. Specialfelt-flytning udløser ikke automatisk nye actionfelter.
- Ægte æsellyd ved fejl; dansk AI-stemme via Cloudflare/ElevenLabs og offline telefonstemme som fallback. API-secrets må aldrig indgå i offentligt GitHub.
- Brug kaldenavne; undgå at sende unødige personoplysninger til online stemmetjenester.

## 2. Versionshistorik og faktisk status

| Version | Indhold | Status |
| --- | --- | --- |
| v0.8-A | Korrekt SVG-bane 1–100, bondegård, zoom og pan | ✅ På GitHub, videreført |
| v0.8-B | Fuldskærmsbræt, tur → terning → hop → læringsopgave | ✅ På GitHub, videreført |
| v0.8-B.1 | Automatisk Cloudflare-adresse og stemmevælger | ✅ På GitHub, ElevenLabs bekræftet fungerende af bruger |
| v0.8-C | 25 actionfelter, ni actiontyper og CPU-adfærd | ✅ Bekræftet i GitHub `main` |
| v0.8-D | Gangetabeller, TABELTRÆNING, langsommere spil og lokal Topscore | ✅ Indeholder tests, leveret i ZIP; **ikke set på GitHub** |
| **v0.8-E** | **Samlet kvalitetstest, baggrundspauser, længere actionbeskeder og lille vinderfejring** | ✅ Bygget og browser-testet lokalt; **endnu ikke live-testet på iPhone** |
| v0.9 | Gem/fortsæt, adaptiv læring, statistik og familiepilot | 📋 Planlagt |

**Vigtigt:** Upload **hele v0.8-E-pakken**, ikke kun ændrede filer fra E. Den indeholder også v0.8-D (herunder den nye `leaderboard.js`), som endnu ikke er bekræftet uploadet.

## 3. Actionfelter og regler

| Talområde | Handlinger |
| --- | --- |
| 1–20 | 5 Bonus · 7 Gulerod · 10 Hov hov · 15 Byt · 16 Vandpyt |
| 21–40 | 24 Talmester · 27 Overraskelse · 29 Bonus · 35 Byt · 37 Bro |
| 41–60 | 44 Bonus · 47 Gulerod · 50 Talmester · 55 Hov hov · 57 Superopgave |
| 61–80 | 64 Hov hov · 67 Vandpyt · 69 Bonus · 75 Byt · 78 Overraskelse |
| 81–100 | 84 Bonus · 86 Gulerod · 90 Hov hov · 93 Superopgave · 95 Talmester |

- ⭐ Bonus +2, 🫏 Hov hov −2, 🔄 Byt plads, 🏆 Talmester +1.
- 🥕 Gulerod: ét ekstra almindeligt kast, maks. én gang samme tur; CPU får også ekstra kast.
- 💧 Vandpyt: stå over netop næste tur, også CPU.
- 🎁 Overraskelse: tilfældig +3, +2, −1 eller −2, altid inden for talområdet.
- 🌉 Bro: +4, aldrig forbi målet.
- 🎯 Superopgave: altid frivillig; korrekt svar +3, fejl/nej tak ingen ekstra straf.
- Actionflytninger udløser ikke ny handling på landingsfeltet; undtagelsen er et nyt almindeligt kast fra Gulerod, dog ikke flere ekstra gulerodskast samme tur.

## 4. Opnået i v0.8-D og videreført i v0.8-E

- [x] Gangetabeller 2–12, én tabel eller blanding, frivillig TABELTRÆNING hver tur.
- [x] Alderspassende tilpasning af regning, også når voksne og børn spiller sammen.
- [x] Tempo Normalt, Roligt (standard), Ekstra roligt; CPU afventer lydslut, bevægelser sker langsomt.
- [x] Enhedens topscore med sejre, kampe og rigtige svar; ingen centralt lagrede børnedata.
- [x] Oplæsning kan gentages; ElevenLabs-worker og stemmevælger er uændret.

## 5. Forbedringer i v0.8-E

- [x] Voksen-timer sættes automatisk på pause, når telefon/browser går i baggrunden, og fortsætter efter tilbagevenden.
- [x] CPU venter, når spillet ligger i baggrunden. Animerede hop og automatisk terning venter også ved tilbagevenden.
- [x] Actionfeltets besked bliver synlig, mens tilknyttet stemme og feltflytning afvikles.
- [x] Vinderfejring med diskrete symboler; brugerens indstilling for reduceret bevægelse respekteres.
- [x] Vinderens rigtige svar vises; *Se topscore* er tilgængelig direkte efter sejren.
- [x] Alle tidligere Node-tests består; browser-smoke for tre skærmstørrelser, CPU, voksen-timer, Topscore og afslutning består.
- [ ] Endelig kontrol af rigtig iPhone med internet og ElevenLabs, inklusive låseskærm/samtaleafbrydelse.
- [ ] Afprøv PWA-automatisk opdatering fra v0.8-C til v0.8-E på brugerens telefon.
- [ ] Test udvidede opgaveeksempler på rigtige børn i forskellige aldre (reel læringseffekt er endnu ikke dokumenteret).
- [ ] Kontrollér lydbelastning, evt. forbrug og børnevenlig sværhedsgrad i en reel familiepilot.

## 6. Test og kvalitetskrav

Kør dette i projektmappen:

```bash
node --check app.js
node --check engine.js
node --check actions.js
node --check board.js
node --check leaderboard.js
node tests/actions.test.js
node tests/board.test.js
node tests/flow.test.js
node tests/tables.test.js
node tests/leaderboard.test.js
```

Valgfri browser-smoke (kræver Python med Playwright og Chromium): `python tests/browser_smoke.py`. Browser-smoke anvender inline HTML/JS og simuleret tale/lokal lager, så der bruges **ingen ElevenLabs-credits** i testen.

**Praktisk mobiltest:** Se `TESTPLAN.md`. Test fysisk terning, digital terning, CPU, 3-årig, 6-årig, 9-årig, voksen, actionfelter, skærmrotation og Topscore.

## 7. Hvad kommer efter v0.8-E?

**Version v0.9 – foreslået rækkefølge:**

1. **Gem og fortsæt spil** lokalt, også efter at browseren er lukket, uden login.
2. **Adaptivt læringsniveau**, der bliver gradvist sværere ved mange rigtige svar og lettere ved gentagne fejl.
3. **Valgfri lokal forældreoversigt** over øvede emner og udvikling, uden registrering af følsomme børnedata.
4. **Test hos 5–10 familier** med forskellige aldre; observer om regler, tale og animationer passer.
5. **Præsentationspakke til Hyggeonkel**: kort prototypevideo, produktark, trykpriser og feedback.

## 8. Arbejdsrutine

- Start altid med nyeste GitHub `main` samt seneste ikke-uploadede ZIP-version, hvis der findes én.
- Læs `AGENTS.md`, `README.md`, denne plan og de relevante JS-filer, **før** ændringer.
- Adskil i dokumentationen hvad der er udviklet, testet med simulering og afprøvet på rigtig telefon.
- Udvid testene, opdatér version i HTML/app/sw/cache samt udviklingsplan efter hver release.
- Læg aldrig API-nøgler eller hemmelige oplysninger i GitHub; kopiér aldrig tidligere brugerdata ind i test.

## Ændringslog

- **2026-10-14:** v0.8-E: kvalitetstest i browser, baggrundspauser, vedvarende action-feedback og vinderfejring. Status: klar til manuel iPhone-test, ikke endeligt released.
- **2026-10-13:** v0.8-D: tabeltræning, tempo, taleventetid og lokal topscore.
- **2026-10-13:** v0.8-C: nye specialfelter og CPU-/spilflow.
