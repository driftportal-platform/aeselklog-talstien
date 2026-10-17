# ÆselKlog v0.9.31 – lydindstillinger pr. spil

Upload KUN indholdet af ZIP-filen oven i eksisterende GitHub-repository. SLET IKKE gamle filer. De 500 MP3-lyde og musikfilerne skal blive liggende.

- Inde i hvert spil findes knappen **⚙️ Lyd**.
- Brætspil, Kortspil og Talkort gemmer særskilt: lyd til/fra, talenes sprog, musik til/fra, melodi og lydstyrke.
- Talkort kan desuden vælge spilleleder eller ÆselKlog til dansk oplæsning; kortspillet bruger spilleleder ved menneskers tal og æsel ved CPU-tal.
- Sprogvalg opdateres uden at overskrive de øvrige spils indstillinger.
- De fælles MP3-optagelser bruges fortsat, og ingen nye ElevenLabs-optagelser er nødvendige.

## Afprøvning på iPhone
1. Brætspil: vælg dansk, musik fra.
2. Kortspil: vælg dansk + tysk, musik til. Vend et kort som spiller og som CPU.
3. Talkort: vælg dansk + spansk og prøv Auto. Stop og prøv optagelse.
4. Gå tilbage til hver spiltype og kontroller, at hvert sprog/musikvalg er bevaret.
5. Test flytilstand efter at talelydene er hentet.

To ældre tests fra basiskoden er ikke opdateret til service-workerens cache-API og den nyeste taleimplementering. En fuldstændig iPhone-test er ikke udført.
