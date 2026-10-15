# 🫏 ÆselKlog Talstien – v0.9.2 (ny forside)

**App:** https://driftportal-platform.github.io/aeselklog-talstien/  
**GitHub:** https://github.com/driftportal-platform/aeselklog-talstien  
**Status:** v0.9.2 er bygget og testet lokalt på baggrund af GitHub-main v0.9.1. Skal uploades manuelt, før ændringen er live.

## Nyt i v0.9.2

- **Rigtig forside** med ÆselKlog-logo/bondegårdsmotiv samt tre store, tydelige knapper: **🎲 Spil, ⚙️ Indstillinger og 🏆 Topscore**.
- **Spil** åbner kun enkel tilmelding: 1–4 spillere, kaldenavn, alder (3–17 eller voksen) og tilvalg af CPU-æslet. Start-knap under spillerne.
- **Indstillinger** samler talområde (1–100 eller et niveau), LEG/LÆR/UDFORDRING/TABELTRÆNING, tabelvalg, adaptiv læring, fysisk/digital bane, terninger, tempo, voksnes sværhedsgrad og alle stemmeindstillinger (inkl. Mia og CPU-æsel).
- Spilindstillinger gemmes automatisk på **den pågældende enhed**. Voksnes sværhedsgrad vælges nu i Indstillinger og gælder de voksne i næste spil, mens alder vælges på Spil-siden.
- **Topscore** kan åbnes fra forsiden. **Fortsæt spillet** ses også på forsiden, hvis der ligger et gemt spil.
- **Gem & afslut**, **Nyt spil** og **Spil igen** vender tilbage til forsiden, uden at ændre de eksisterende spilregler.
- Mobil, tablet og computer har tilpassede menulayouts. Forsiden bruger billedgrafik til udsmykning og rigtige HTML-knapper til betjening.
- Ingen ændring i Cloudflare/ElevenLabs. API-nøgler findes kun på serversiden.

## Test og forbehold

- ✅ Alle eksisterende 8 Node-regressionstests bestået: bane, actionfelter, voksen/børneopgaver, gangetabeller, CPU, gemning, adaptiv læring og topscore.
- ✅ Browser-smoketests med simuleret oplæsning bestået (mobil liggende, mobil stående, computer).
- ✅ CPU-tale og save/resume-browserregressioner bestået.
- ✅ Ny navigationstest: Forside → Indstillinger → Spil → Gem → Forside → Fortsæt → Topscore.
- ⚠️ Live ElevenLabs-lyd og rigtig iPhone-installation er ikke testet i denne version; eksisterende stemmefunktion er bevaret.
- ⚠️ Test af brugervenlighed hos 3–7-årige og voksne er næste skridt.

## Sådan opdateres GitHub Pages

1. Pak den medfølgende ZIP ud.
2. Upload **alle rod-filerne** til det eksisterende GitHub-repository (erstat samme filnavne), herunder **de tre nye WebP-billeder** (`home-hero-wide.webp`, `home-hero-mobile.webp`, `home-mascot.webp`).
3. Bevar eksisterende mapper og upload også README, udviklingsplan og tests, hvis du vil beholde testhistorik.
4. Commit ændringerne. Service worker får ny cacheversion og henter de nye filer.
5. Genindlæs appen (evt. luk og genåbn hjemmeskærms-appen) og kontrollér versionsmærket `PRØVEVERSION 0.9.2`.

## For tidligere funktioner

v0.9.1 har fortsat: ElevenLabs Mia og CPU-stemmevalg, ægte æsellyd, synlig CPU-terning, 100 felter, 25 actions, gangetabeller, tempo, topscore og gem/fortsæt. Se `UDVIKLINGSPLAN.md` og `AGENTS.md`.

---

## Historik: v0.9.1

# 🫏 ÆselKlog Talstien – v0.9.1 (CPU-æslet taler selv)

**App:** https://driftportal-platform.github.io/aeselklog-talstien/  
**GitHub:** https://github.com/driftportal-platform/aeselklog-talstien  
**Udviklet:** 14. oktober 2026  
**Status:** v0.9.1 er kodet og testet lokalt (inkl. simuleret AI-lyd). **Ikke automatisk uploadet; skal udgives på GitHub og testes på en fysisk iPhone.**


## Nyt i v0.9.1 – CPU-æslet har sin egen stemme

- CPU-æslet **siger nu sit konkrete svar højt** på enhver matematikopgave, også hvis det gætter forkert. Det gør det med korte fjollede udtryk som "Høhø! Jeg tror, svaret er ...".
- Spilleleder og CPU har **hver deres stemmevalg** under **🎙️ Indstil æslets stemme**. Spilleleder kan fx være Mia, og CPU kan vælge Glenn. Standard "Automatisk" vælger en anden godkendt stemme, hvis tilgængelig. Hvis der kun findes én, anvendes den med en mild, lysere CPU-effekt.
- Svaret vises også i en tydelig taleboble og markeres blandt svarmulighederne. **Facit kommer først, når CPU-stemmen er færdig.**
- Ved forkert svar lyder fortsat det rigtige æselskry. CPU'en svarer stadig bevidst forkert ca. 30 % af gangene. Ved korrekt svar fortsætter den normale spilleleder.
- Den valgte CPU-stemme gemmes lokalt på samme enhed. Også ved telefonens offline-stemme får CPU'en lidt sjovere toneleje.
- Ingen ny Cloudflare Worker og ingen ekstra API-nøgler. Dette kræver dog **en ekstra ElevenLabs-talegenerering per CPU-svar** og kan derfor øge kreditforbruget.
- Nyt modul: `cpuvoice.js`; appens cache opdateret til `aeselklog-talstien-v091-cpu-voice`.
- **Testet:** Node-test for stemmevalg/svar, de eksisterende regressions- og mobilbrowsertests samt browser-test med simuleret ElevenLabs-lyd, hvor CPU anvender en anden godkendt stemme end spilleleder. **Endnu ikke testet med rigtige ElevenLabs-credits på fysisk iPhone.**

**Sådan afprøver du:** Upload hele ZIP-pakken til roden af GitHub-repository, inklusive den nye `cpuvoice.js`. Genindlæs appen, og kontroller "PRØVEVERSION 0.9.1". Vælg **Spillelederens stemme: Mia**, **CPU-æslets egen stemme: Automatisk eller Glenn** og tryk **▶ Hør CPU-æslet svare**. Sæt derefter kryds ved **Spil også mod Æslet**.

---

## Nyt i v0.9

### 💾 Gem og fortsæt spil

- Appen **gemmer automatisk** den aktuelle kamp på **sikre kontrolpunkter**: før et kast, ved læringsterning/opgave, efter en tur og ved valg af specialfelt.
- Der er også en knap **💾 Gem & afslut** på spilbrættet. Når du vender tilbage til startsiden, viser appen **▶ Fortsæt spillet**, med spillernavne og seneste gemmetid.
- Gemningen indeholder valgt talområde, spillere, placeringer, CPU, tur, terningeopsætning, spiltempo, aktuel opgave og barnets individuelle læringsniveau. Ved voksenopgaver gemmes den resterende svartid, så man ikke mister tid ved at holde pause.
- Gemning foregår **kun på telefonen/computeren** i browserens `localStorage`, uden konto eller netværk. Den gemte kamp synkroniserer **ikke** mellem enheder. Kun én aktiv kamp kan ligge gemt ad gangen.
- Hvis appen lukkes midt i en **terninge-/brik-animation**, starter man efter genåbning fra det seneste sikre kontrolpunkt. En uafsluttet handling kan dermed skulle udføres igen; det undgår halv-gennemførte bonusser.
- Ved afsluttet spil slettes gemningen automatisk, og topscore registreres som tidligere. *Slet gemt spil* påvirker **ikke** topscoren.
- Børnenes **kaldenavne og alder i en aktiv kamp** lagres lokalt, fordi de bruges til opgaverne; der sendes ingen gemte profiler til en server. Browserens privatlivsindstillinger/rydning af webstedsdata kan slette det gemte spil.

### 🧠 Automatisk tilpasning af børneopgaver

- Slå **“Tilpas opgaver automatisk”** til eller fra inden kampstart (som udgangspunkt til).
- **Tre rigtige svar i træk uden hjælp** → lidt sværere opgaver, højst to trin over udgangspunktet.
- **To forkerte svar i træk** → lidt lettere opgaver, højst to trin under udgangspunktet.
- Bruger barnet **tip**, tæller et rigtigt svar stadig til spilstatistikken, men ikke til en række med tre selvstændigt løste opgaver.
- Børn på **3–4 år** får fortsat lette tal-/tælleopgaver. Omkring 5–6 år gælder først og fremmest plus/minus. Fra cirka 7 år kan der arbejdes med valgte tabeller. Voksne beholder deres manuelt valgte niveau og **60/30/10 sekunders** opgavetid.
- Tilpasning følger **den enkelte spiller**, ikke hele familien, og bevares i et gemt spil. Det er et simpelt spilbaseret niveau, **ikke** en vurdering af barnets faglige standpunkt.

## Bevarede funktioner

- Sti 1–100 med fem farveområder og 25 actionfelter, tre visnings-/tempoindstillinger, fysiske og digitale terninger, fuldskærmsplade.
- LEG (uden matematik), LÆR, UDFORDRING og TABELTRÆNING med 2–12-tabeller, herunder faste og blandede tabeller.
- Computer-Æslet kaster synligt og kan svare forkert, også på superopgaver. Alle æsler animeres på pladen.
- ElevenLabs Mia/andre valgte stemmer via eksisterende Cloudflare Worker og ægte æselskry ved fejl. Telefonstemmen fungerer som fallback.
- Lokal Topscore med kampe, sejre og rigtige svar, uden central konto.

## Installation på GitHub

1. Udpak `AeselKlog_v09.zip`.
2. Åbn https://github.com/driftportal-platform/aeselklog-talstien og upload **alle app-filer fra pakkens rod**, inklusive `savegame.js`, `adaptive.js` og **den nye fil `cpuvoice.js`**.
3. Erstat eksisterende filer med samme navn, og upload gerne `tests/`, `README.md`, `AGENTS.md`, `UDVIKLINGSPLAN.md` og `TESTPLAN.md`.
4. Vælg **Commit changes**, åbn appen igen, og kontrollér, at der står **PRØVEVERSION 0.9** øverst. Genindlæs eventuelt, hvis PWA'en viser gamle filer.

**Cloudflare og ElevenLabs:** Ingen ændringer nødvendig. Den allerede fungerende Worker og hemmelige API-nøgle forbliver urørte. Upload **aldrig** API-secrets til GitHub.

## Kodeoversigt

| Fil | Ansvar |
|---|---|
| `index.html` | Visning, knapper, gem/fortsæt-panel, børnevenlige opgavefelter |
| `app.js` | Spilflow, lokalt savepoint, resume, CPU, lyd og integration af adaptiv læring |
| `savegame.js` | Sikre lokale spil-snapshots, validering og sletning |
| `adaptive.js` | Individuelle sværhedstrin og streak-regler |
| `engine.js` | Opgavegenerator: tilpassede talspænd, alder, tabelopgaver og voksentid |
| `leaderboard.js` | Separat, lokal Topscore |
| `cpuvoice.js` | Vælger CPU-stemme og danner de sjove svarudsagn |
| `board.js` / `actions.js` | Tegnet 1–100-bane og actionregler |
| `sw.js` | PWA-cache: `aeselklog-talstien-v091-cpu-voice` |

## Teststatus

✅ Node-regler: `actions`, `board`, `flow`, `tables`, `leaderboard`, `savegame`, `adaptive`.  
✅ Browser-smoke: stående og liggende mobil, desktop, CPU, voksen-timer, sejr.  
✅ Browserbaseret save/resume-simulering gennem flere nye dokumenter med overført, lokalt testlager: feltplaceringer, tur, spørgsmål, individniveau og voksentid.  
✅ Aldersgrænser: 3–6-årige får ikke gangestykker; voksne fortsætter på deres valgte tid/niveau.  
⚠️ Ikke testet på fysisk iPhone/iPad efter upload. Browsersimuleringen erstatter ikke Safari-/hjemmeskærms-test.  
⚠️ Live AI-tale er ikke blevet brugt i automatiske tests og vil stadig være afhængig af ElevenLabs/Cloudflare.

Se [TESTPLAN.md](./TESTPLAN.md) og [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md).
