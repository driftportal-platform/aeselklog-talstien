# Installation af ÆselKlog

Aktuel opdatering: v0.9.95 – Talstiens læringsterning som selvstændig aktivitet. Musik-/stemme-/tekstændringerne fra v0.9.85–86 er også med.


## Ny forside og Om appen
Forsiden har Spil, Topscore og Om spillet. Indstillinger findes inde i hvert spil. Om spillet fortæller nu om hele appen og kan rulles på små skærme.

Det nye billede home-fullscreen-v095.webp skal med. Bevar det gamle billede; intet skal slettes. Erstat opdateringens filer som normalt, og kontrollér PRØVEVERSION 0.9.95 i spilmenuen efter genindlæsning. Denne ændring kræver kun GitHub.

## Voksentid og automatisk retur
Voksen let/mellem/svær bruger som standard 60/30/10 sekunder. Under tandhjulet kan du vælge en anden tidsfrist. Tiden starter efter første oplæsning, og børn har ingen tidsfrist. Ved udløb tæller opgaven som forkert, svarene låses, og resultatet vises.

Alle svar afslutter nu opgaven, også forkerte svar. Efter feedbackoplæsningen og 1,5 sekunders resultatvisning vender siden tilbage til terningen eller ikonerne. Du kan også trykke Tilbage med det samme. Tomt tekstfelt afslutter ikke opgaven. Når siden skjules, holder nedtællingen pause.

Denne ændring kræver kun GitHub. Pakken indeholder dog også de tidligere ændringer, som kræver Cloudflare, hvis de endnu ikke er installeret.

## Dansk stemme i læringsterningen
Åbn tandhjulet → Spillelederens stemme → Samme stemme som Talstien. Det følger Talstiens valgte fortæller. Du kan også hente og vælge de samme spillelederstemmer direkte i listen. Prøv stemme afprøver dit valg.

Regnestykker bliver læst som hele danske spørgsmål. Ved Enhedens danske stemme kræves en dansk stemme på telefonen; ellers vises en besked frem for at læse med en udenlandsk stemme. Vælg da en spillelederstemme eller installer dansk tale på enheden. Din valgte stemme ændres ikke automatisk.

Lydrettelsen er i GitHub-filerne. Pakken indeholder også v0.9.92: Cloudflare skal genudgives, hvis den rettelse endnu ikke er deployet. Kommandoen står nedenfor.

## Korrekte børneoverskrifter
Opgavens overskrift følger indholdet på barnets niveau. Er 16 deleligt med 2 uden rest? står under Delelighed med 2. Plus-, tælle- og talgenkendelsesopgaver får også passende overskrifter. Primtal står ved egentlige primtalsspørgsmål. Dette gælder Læringsterningen og Talstien offline/online. Opdatér også Cloudflare med kommandoen nedenfor.

## Læringsterningen
Siden viser børne-/voksenvalg og en stor terning. Tryk på terningen for samme hop-animation som Talstien. Spørgsmålet åbner i en dialog; Tilbage til terningen gør klar til næste kast.

Tandhjulet åbner indstillinger: vælg Kun læringsikoner for at skjule terningen, eller Stor læringsterning for at skjule ikonerne. Vælg børneniveau og voksenniveau hver for sig, svarforslag/skrevet svar og oplæsning. Musik og Lyd til/fra ligger også her. Valgene gemmes lokalt.

Før/efter-spørgsmål bliver nu vist som plus-/minusstykker i alle spil. Allerede gemte eller igangværende spørgsmål ændres ikke; nye spørgsmål bruger de nye formuleringer.

## Cloudflare skal også opdateres denne gang
Worker bruger den fælles engine.js. Efter filerne er erstattet, åbn PowerShell i projektets rodmappe (mappen med index.html) og kør:

```powershell
npx.cmd wrangler deploy --config worker/wrangler.jsonc --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Det er samme Worker-navn som i brugerens tidligere deployment. Bevar eksisterende secrets og bindings. Koden er ikke deployet herfra.

1. Pak ZIP-filen ud i en separat mappe. Kopiér indholdet ind i projektmappen og vælg Erstat filerne. Bevar assets, audio, music, .git og .github. Vælg ikke Opret kopier. De nye music-controls.js, math-adult.js og math-combined.js skal med.
2. Kør `npm.cmd test`: 69/69 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Opdatér både GitHub og Cloudflare som beskrevet ovenfor.
4. Genindlæs, luk appen helt, og åbn igen efter GitHub Pages er færdig. Kontrollér version 0.9.95.

## Svære opgaver med små tal
Vælg et voksenniveau, slå Kombinationsopgaver til og vælg Små tal · svær regnerækkefølge. Tallene i opgaven er højst 100; svar og mellemregninger kan være større eller negative. Ekstra svær har flere trin og indlejrede parenteser. Store tal er stadig et valg, og valget gemmes.

## Pas og kombinationsopgaver
Pas springer straks til næste opgave og giver 0 point. På sidste opgave åbnes pointoversigten, som tæller de oversprungne opgaver.

Vælg et voksenniveau og slå Kombinationsopgaver til. Her blandes +, minus, gange, division og procent. % betyder procent (fx 25 % af 2400), ikke restdivision. Hjælp mig forklarer regnerækkefølgen og mellemregningerne. Alle svar er hele tal.

## Voksenopgaver
Vælg RegneKlog → Sværhedsgrad → Voksen · svær eller Voksen · ekstra svær. Vælg de ønskede regnearter og start. Opgaverne er med større heltal; minus kan give negative resultater, og division går op uden rest.

Voksenniveauerne viser kun tal. Hjælp mig forklarer metoden i to trin uden billeder, og Læs hjælpen op bruger samme stemmevalg. Vis løsningen viser mellemregning eller kontrol. Skriv svaret uden punktum/mellemrum og brug ± til negative svar. Forkert svar kan prøves igen uden pointtab. De tre børneniveauer med billeder er stadig tilgængelige.

## Nye replikker
RegneKlog varierer automatisk mellem 10 replikker til rigtige og 10 til forkerte svar. Barnets indtastede tal og valgfrie navn er med. Alle 10 bruges før ny blanding, og samme replik kommer ikke direkte igen. Samme tekst vises og læses op; point og mulighed for at prøve igen er uændrede.

## Musik
Alle seks offline-spil har Musik som menu og en topknap. På Talstiens store plade findes musikmenuen i værktøjslinjen og topknappen ved pladens øvrige knapper. Menuen giver til/fra, melodi og lydstyrke. De eksisterende Gone Fishin', Children's March Theme og Beary Fishy bruges.

Online har alle fire spil en topknap og de samme valg under Indstillinger → Lyd og musik. Musikvalget gælder kun din enhed og det valgte spil. Gamle kortspilsvalg bevares. Musik dæmpes under oplæsning; menu/forside og skjult side stopper musikken. Ved lydstyrke 0 skal der skrues op for at høre den.

## Hvis stemmen ikke høres
I RegneKlog: åbn Navn og spillelederens stemme, vælg stemmen og tryk Prøv valgt stemme. Kontrollér Lyd til øverst og telefonens medielydstyrke. Opdateringen aktiverer lyden under selve trykket, før stemmen hentes. Hvis afspilningen fejler, vises en besked, og du kan prøve igen eller vælge enhedens danske stemme. AI-stemmer kræver den eksisterende stemmeforbindelse; valget bevares ved fejl.

Valideret: 69/69 Node-tests, voksenopgaver og eksisterende børneforløb, Chromium med simuleret lyd/HTTP, musikprofiler og knapper i alle spil, begge onlineklienter, RegneKlog-stemme med simuleret trykbegrænsning, navigation og lokal HTTP/PWA-offline. Ikke prøvet med rigtig iPhone-lyd eller live AI-lyd. Ikke publiceret herfra.
