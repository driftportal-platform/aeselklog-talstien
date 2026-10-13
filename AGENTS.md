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
- Den aktuelle arbejdsleverance er **v0.8-B** (udviklet; ikke automatisk uploadet til GitHub). Næste fase er **v0.8-C**, med flere actionfelter. Den samlede v0.8 er ikke færdig, indtil statusfilen dokumenterer det.
