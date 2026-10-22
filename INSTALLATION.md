# Installation af ÆselKlog

Aktuel opdatering: v0.9.82 – RegneKlog med billeder, hjælp, sværhedsgrader og point.

1. Pak opdateringen ud i projektmappen og erstat filerne. Bevar undermapper, audio, music og assets. Alle nye math-filer og assets/icons/math-game.svg skal med.
2. Kør `npm.cmd test`: 64/64 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub opdateres. Cloudflare/Worker v0.9.78 er uændret.
4. Når GitHub Pages er færdig: genåbn appen og kontrollér versionsmærket 0.9.82. Vælg RegneKlog i spilmenuen. Rettelsen af TorskeKlog-/500-ikonstørrelsen er også med.

## Prøv RegneKlog
Vælg en eller flere regnearter, Let/Mellem/Svær og billeder eller kun tal. Start med 5 opgaver. Prøv et forkert svar og derefter et rigtigt (10 point), en opgave med hjælp (5 point) og Vis løsningen (0 point). Slutoversigten viser point og hvor mange der er løst selv/med hjælp/gennemgået. Hjælp kan vise billeder i begge visninger.

Minus giver ikke negative tal, og division går op uden rest. Valg huskes på denne enhed; point gælder ét forløb. Genindlæsning eller et nyt forløb starter fra valgsiden. Spillet kræver ingen konto eller server.

Valideret: 64/64 Node-tests, alle fire regnearter på tre niveauer i Chromium, komplette pointforløb, mobil/tablet/pc-layout, eksisterende spilsider og lokal HTTP/PWA-offline. Ingen fysisk telefonprøve eller publicering herfra.
