# Installation af ÆselKlog

Aktuel opdatering: v0.9.84 – oplæsning, spillernavn og venlig feedback i RegneKlog.

1. Pak ZIP-filen ud i en separat mappe. Kopiér indholdet ind i projektmappen og vælg Erstat filerne. Bevar eksisterende assets, audio, music, .git og .github. Vælg ikke Opret kopier. Den nye math-speech.js skal med.
2. Kør `npm.cmd test`: 66/66 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub opdateres. Cloudflare/Worker er uændret.
4. Genåbn appen efter GitHub Pages er færdig og kontrollér version 0.9.84.

## Navn, stemme og oplæsning
Åbn RegneKlog → Navn og spillelederens stemme. Skriv fx Aya. Vælg Spillelederens valgte stemme, enhedens danske stemme eller tryk Hent spillelederstemmer og vælg en af de tilgængelige stemmer. Du kan ændre valgene både før og under spillet.

Læs nye regnestykker op og Læs mit svar og tilbagemeldingen op kan slås til/fra hver for sig. Læs stykket op og Læs hjælpen op kan altid bruges manuelt, når Lyd er til. Gentagelse giver ikke ekstra hjælpfradrag. Stop oplæsning afbryder talen.

Ved Tjek svar læses det indtastede tal og feedback med navnet. Forkert svar: samme opgave bliver stående, og barnet kan rette tallet, få hjælp og prøve igen så mange gange, det vil. Ingen point tabes. Rigtigt svar giver fortsat 10 point uden hjælp eller 5 med hjælp; kun én gang. Vis løsningen giver 0.

AI-stemmer bruger den eksisterende tjeneste og modtager teksten med barnets navn. Der gemmes ingen navngivne lydklip i permanent TTS-cache. Enhedens stemme kan bruges uden AI-tjenesten; offlineudtale afhænger af installerede stemmer. De eksisterende gulerods- og MP3-tællefunktioner bevares.

Valideret: 66/66 Node-tests, Chromium med simuleret lyd/HTTP, valgte stemme-ID'er og tekster, stop/retry/gemte valg, øvrige regneforløb samt lokal HTTP/PWA-offline. Ikke afprøvet med rigtig iPhone-lyd eller live ElevenLabs. Ikke publiceret herfra.
