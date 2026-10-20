# ÆselKlog v0.9.61 – Talstien online

Udpak pakken, og kopiér indholdet ind i din aeselklog-talstien-mappe (den med index.html og package.json). Erstat filerne og bevar undermapperne. Slet ikke andre filer, audio eller music. Pakken indeholder kun ændringer siden v0.9.60.

## 1. GitHub Desktop
1. Åbn projektet → Repository → Open in Terminal. Kør `npm.cmd test`: 49/49 skal bestå.
2. Kontrollér ændringerne. Commit med fx “Talstien som online-brætspil”, derefter Push origin.
3. Vent på GitHub Pages. Genindlæs siden; versionsmærket skal vise 0.9.61.

## 2. Cloudflare – også nødvendig denne gang
Kør følgende fra projektmappen, altså den med index.html og worker-mappen:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Hvis terminalens sti allerede ender med `\worker`, skal du i stedet bruge:

```powershell
npx.cmd wrangler deploy --config wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Brug kun én af kommandoerne. Det er placeringen af konfigurationsfilen, som er forskellig. Navnet skal være aeselklog-online, så den eksisterende Worker opdateres. Du skal ikke uploade en enkelt JavaScript-fil manuelt.

Kontrollér bagefter https://aeselklog-online.driftportal-platform.workers.dev/health – den skal vise 0.9.61.

## 3. Prøv et nyt spil
- Åbn Spil → Online spil → Talstien. Kortspillet kan vælges samme sted.
- Vælg antal spillere, talområde og spillemåde. Flere valg til Talstien indeholder digital eller fast A3-plade, egen/skærmterning og tabeller.
- Opgaver til mig angiver barn/alder eller voksen/sværhed. Hver deltager vælger selv. Offlineprofiler bliver ikke hentet eller sendt.
- Opret rum og invitér via tandhjulet: del, mail eller kopiér link. Spillet starter, når alle er tilsluttet; efter 60 sekunder kan opretteren starte med mindst to.
- Den aktive spiller slår terningen og vælger Næste spiller efter turens resultat. Bondegårdsbanen kan rulles med finger/mus; Find mig og Hele banen hjælper med overblikket. Felter viser reglerne.
- Prøv gulerodens ene ekstrakast, vandpyt, byt, superopgaver og et spil med frivillige opgaver. Chatten og æsellyden virker som i onlinekortspillet.
- Tandhjul → Afslut spil for alle lukker rummet, hvorefter et nyt spil kan oprettes.

Online-brætspillet er for 2–6 menneskelige spillere. CPU-spiller, lokal topscore, gemte offlineprofiler og forældreoversigt er fortsat offline-funktioner. Online-rum kan genåbnes på samme enhed, mens de eksisterer.

49/49 Node-tests og simulerede Chromium-forløb består; Worker dry-run består. Rigtig iPhone/iPad-lyd og liveforbindelse skal afprøves efter opdateringen. Ingen publicering er udført herfra.
