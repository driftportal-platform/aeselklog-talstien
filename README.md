# 🫏 ÆselKlog Talstien – v0.9

**App:** https://driftportal-platform.github.io/aeselklog-talstien/  
**GitHub:** https://github.com/driftportal-platform/aeselklog-talstien  
**Udviklet:** 14. oktober 2026  
**Status:** v0.9 er kodet og testet i simuleret browsermiljø. **Ikke automatisk uploadet; skal udgives på GitHub og testes på en fysisk iPhone.**

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
2. Åbn https://github.com/driftportal-platform/aeselklog-talstien og upload **alle app-filer fra pakkens rod**, inklusive **de to nye filer** `savegame.js` og `adaptive.js`.
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
| `board.js` / `actions.js` | Tegnet 1–100-bane og actionregler |
| `sw.js` | PWA-cache: `aeselklog-talstien-v09-save-adaptive` |

## Teststatus

✅ Node-regler: `actions`, `board`, `flow`, `tables`, `leaderboard`, `savegame`, `adaptive`.  
✅ Browser-smoke: stående og liggende mobil, desktop, CPU, voksen-timer, sejr.  
✅ Browserbaseret save/resume-simulering gennem flere nye dokumenter med overført, lokalt testlager: feltplaceringer, tur, spørgsmål, individniveau og voksentid.  
✅ Aldersgrænser: 3–6-årige får ikke gangestykker; voksne fortsætter på deres valgte tid/niveau.  
⚠️ Ikke testet på fysisk iPhone/iPad efter upload. Browsersimuleringen erstatter ikke Safari-/hjemmeskærms-test.  
⚠️ Live AI-tale er ikke blevet brugt i automatiske tests og vil stadig være afhængig af ElevenLabs/Cloudflare.

Se [TESTPLAN.md](./TESTPLAN.md) og [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md).
