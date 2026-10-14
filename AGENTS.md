# ÆselKlog – vejledning til udvikling

Dette repository er et familie-/læringsspil. **Læs altid `UDVIKLINGSPLAN.md` før kodeændringer.** Det er projektets fælles huskeliste, acceptkriterier og roadmap.

## Hver gang vi fortsætter

1. Læs aktuel `README.md`, `UDVIKLINGSPLAN.md` og de seneste kildefiler i **GitHub main**. Antag aldrig, at en gammel ZIP fra en tidligere chat er den nyeste version.
2. Kontrollér faktisk versionsnummer i `index.html`, `app.js`, `sw.js` og README.
3. Gennemgå afkrydsninger, besluttede regler og åbne opgaver i `UDVIKLINGSPLAN.md`.
4. Bevar alle eksisterende funktioner: fysisk/digital terning, CPU, aldersopgaver (3 år til voksen), voksentimer, korrekt æsellyd, valgfri læring, AI-tale med lokal fallback.
5. Ændringer af spilmotoren skal følge turflowet i planen. Kontroller alle 100 tal automatisk og undgå specialfelt-løkker.
6. Test de relevante funktioner; skriv ikke **færdig/testet**, før det er udført.
7. Efter kodeændringer: opdater versionsnummer, serviceworker-cache, README og `UDVIKLINGSPLAN.md` med det faktiske resultat.

## Sikkerhed og privatliv

- Ingen ElevenLabs API-nøgler eller andre secrets i dette offentlige repository, browserkode, commits eller screenshots.
- Cloudflare Worker håndterer hemmelige nøgler, adgang og forbrugsbegrænsninger.
- Brug helst spilleres kaldenavne. Send kun den tekst, der skal læses højt, til AI-stemmetjenesten.
- Undgå unødig indsamling eller lagring af børneoplysninger.

## Produktprincipper

- Matematik er **altid valgfri**. Spillet skal kunne spilles for sjov uden opgaver.
- Kort- og brætdesign skal være originalt; tallene er vigtigere end dekorationer.
- Appen bør fungere på iPhone, iPad, Android og desktop, både ved fysiske og digitale terninger.
- Den aktuelle arbejdsleverance er **v0.8-C (pakket til upload, endnu ikke bekræftet på GitHub Pages)**. Næste fase er **v0.8-D** (animationer, lyd og feedback). Den samlede v0.8 er ikke færdig, indtil statusfilen dokumenterer det.


## Stemmer – v0.8-B.1
Den offentlige Worker-URL ligger som konstant i `app.js`. API-nøglen findes kun i Cloudflare Secrets. AI-stemmer hentes fra `/voices` og afspilles via `/tts`, aldrig direkte fra ElevenLabs i browseren. Arbejd videre fra den nyeste GitHub-`main` og den separate Worker-kilde. Ny stemme kræver enten ElevenLabs Voices: Read + konto-stemme eller eksplicit godkendelse i Worker-konfigurationen. Ved release skal både app og Worker dokumenteres/testes separat.

## Actionfelter – v0.8-C

- Actionfelter, ikoner, regler for overraskelser og flyttegrænser er samlet i `actions.js` (`AeselActions`). `board.js` tegner dem. `app.js` udfører dem.
- **Ingen handlingskæder**: bonus-/straf-/broflytning må ikke udløse et nyt specialfelt på destinationen.
- Gulerod giver højst ét ekstra kast på en tur. Vandpyt springer præcis næste tur over, også ved CPU. Overraskelser giver +3, +2, -1 eller -2 felter. Bro giver +4. Superopgaven er **altid frivillig** og har ingen straf ved fejl.
- CPU skal deltage i alle handlinger, og alle bevægelser skal respektere det valgte talområdes start og mål.
- Kør `node tests/actions.test.js`, `node tests/board.test.js` og `node tests/flow.test.js`, og kontrollér derefter på rigtig iPhone før release.

## v0.8-D – særlige hensyn

- Gangeopgaver ligger fortsat i `engine.js`, og valget `tablesChoice`/`learning=tabel` er globalt pr. spil. Tre- til seksårige får ikke tvungne gangestykker.
- `say()` returnerer nu en Promise, der først afsluttes **når lydafspilningen slutter** (eller efter afbrydelse/fejl). CPU-flow og voksen-timer må ikke erstattes af faste tidsforsinkelser.
- Bevar fallback til enhedens stemme. Brug aldrig en server-API-nøgle i kode på GitHub.
- `leaderboard.js` gemmer udelukkende kaldenavne og statistiske resultater **lokalt** og bruger ingen server. Gem aldrig børnealder i toplisten.
- `PACE` styrer hop/pauser; fuldskærms mobil skal bevares.
- Nye tests: `tests/tables.test.js`, `tests/leaderboard.test.js`, `tests/browser_smoke.py`, `tests/browser_table.py`, `tests/speech.test.py`. Playwright-testene fungerer ved at indlæse inline HTML, da navigation til en lokal server er blokeret i den aktuelle browserkørsel.
