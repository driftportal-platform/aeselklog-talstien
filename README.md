# ÆselKlog Talstien – version 0.4

Dette er en fungerende lokal webapp-prototype uden login eller server til børnenes navne og aldre.

## Nye funktioner
- **Begge terninger bliver kastet synligt**, også på CPU-æslets tur. CPU bruger altid digitale terninger, selv hvis spilleren har valgt fysiske terninger.
- **Spillernes farvede æsler bevæger sig felt for felt på den digitale spilleplade**, efter at opgaven er besvaret. Både menneskers, børns og CPU-æslets brikker vises.
- Små hopper ved almindelige træk, bonusfelter og straf. Byttefelter opdaterer begge æslers position.
- **CPU kan svare forkert** (ca. 30 % af CPU-opgaverne) og får da ikke sit ekstra skridt. Forkert svar giver en syntetisk æsellyd.
- Aldersopgaver fra 3 år og op, voksenopgaver med 60/30/10 sekunders tid efter sværhedsgrad. Ingen tidsgrænse for børn.
- Dansk oplæsning fra telefonens indbyggede stemme, med stemmevalg, tempo og toneleje.

## Upload til GitHub Pages
1. Udpak ZIP-filen.
2. Åbn dit eksisterende ÆselKlog-repository på GitHub.
3. Upload **alle de udpakkede filer direkte til roden af repositoryet** (ikke mappen som en undermappe), og erstat de gamle filer med samme navn.
4. Under **Settings → Pages**: vælg `Deploy from a branch`, `main`, `/ (root)`.
5. Når GitHub Pages er opdateret, genindlæs appen på iPhone. Hvis den gamle udgave stadig vises, luk appen fra hjemmeskærmen, åbn webadressen i Safari igen og opdater siden. Serviceworkerens cache har nyt versionsnummer.

## Brug
- Vælg spillere, børnenes alder eller `Voksen (18+)` og eventuel voksensværhedsgrad.
- Vælg `Spil også mod Æslet` for CPU.
- Ved digital terning trykkes der på terningen på kortlignende fuldskærm. CPU kaster automatisk, men animationen vises.
- Hvis opgaven er slået med læringsterningen, besvares den, inden brikken flyttes. Ved fysiske terninger indtastes resultatet i appen.
- Den animerede bane viser alle fem niveauer fra 1 til 100. Talstien kan stadig bruges sammen med den fysiske A3-plade.

## Filer
`index.html`, `app.js`, `engine.js`, `icon.svg`, `manifest.webmanifest`, `sw.js`, `aeselklog-card.webp`, `donkey-bray.wav`.

**Bemærk:** Dette er fortsat en prototype, ikke en udgivet App Store-app. Dansk oplæsning og æsellyd bør også prøves på din egen iPhone. CPU'ens svar er tilfældigt simuleret og er ikke en online AI-model.
