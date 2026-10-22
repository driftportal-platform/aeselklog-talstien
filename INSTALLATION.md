# Installation af ÆselKlog

Aktuel opdatering: v0.9.87 – voksenopgaver i RegneKlog. Musik-/stemme-/tekstændringerne fra v0.9.85–86 er også med.

1. Pak ZIP-filen ud i en separat mappe. Kopiér indholdet ind i projektmappen og vælg Erstat filerne. Bevar assets, audio, music, .git og .github. Vælg ikke Opret kopier. De nye music-controls.js og math-adult.js skal med.
2. Kør `npm.cmd test`: 67/67 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub opdateres. Cloudflare/Worker er uændret.
4. Genindlæs, luk appen helt, og åbn igen efter GitHub Pages er færdig. Kontrollér version 0.9.87.

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

Valideret: 67/67 Node-tests, voksenopgaver og eksisterende børneforløb, Chromium med simuleret lyd/HTTP, musikprofiler og knapper i alle spil, begge onlineklienter, RegneKlog-stemme med simuleret trykbegrænsning, navigation og lokal HTTP/PWA-offline. Ikke prøvet med rigtig iPhone-lyd eller live AI-lyd. Ikke publiceret herfra.
