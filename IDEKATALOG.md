# 🫏 ÆselKlog – idékatalog og vedtagne beslutninger

**Opdateret 16. oktober 2026 · Kilde:** Projektforløb, tidligere kort-/A3-prototyper og GitHub v0.9.15. Dette er vores fælles liste til næste tråd. Se `PROJEKTSTATUS.md` for det, der er implementeret, og `UDVIKLINGSPLAN.md` for prioritering.

## Faste produktbeslutninger (skal bevares)

- ÆselKlog består af **et selvstændigt klassisk kortspil** og **Talstien** (digital eller fysisk brætspil). Der er fem talområder med egen farve: 1–20, 21–40, 41–60, 61–80, 81–100. Skift mellem to spiltyper skal være tydeligt.
- **Matematik er altid frivillig** og kan slås helt fra. Opgaver må ikke overbelaste 3–6-årige. Voksne kan få sværere opgaver og timer.
- De fysiske talkort måler 63×88 mm. Et talområde indeholder fem kort af hvert tal (100 talkort). 21–40 og otte æselkort er prototyper med store tal, lige/ulige, tiere/enere og primtalsmarkering.
- **Klassisk kortspil:** Flere æselkort i spil (4, 6 eller 8; standard 8). Fejl giver ét æselkort, som spilleren beholder. **Valgfri ekstra straf:** også ét kort fra hver modspillers lukkede bunke, hvis der er et.
- **Drillevarianten Send æslet videre:** Præcis ét æselkort i hele spillet, som overgår til den næste spiller, der laver fejl; den valgfri ekstra talkortstraf er separat.
- Kortspillets talkort spilles stigende i fælles række(r) fra laveste tal i valgt niveau; tilladt op/ned på de andre spilleres åbne bunker. Matematik kræves ikke.
- Talstien: 9 actiontyper; digital fordeling varierer pr. ny kamp og gemmes uændret. Fysisk A3 har fast specialfeltfordeling. Spillerne kan vælge fysisk/digital terning uafhængigt.
- **Godkendt fuldskærmsforside skal bevares**; AI-nøgler findes kun som Cloudflare-secret; lokal lagring af spil og læring; undgå unødige persondata.
- v0.9.16 giver seks navngivne deltagere + CPU i Talstien, 2–6 i kortspillet; alle deltagere har unikke farver.

## Implementeret i den digitale app

- Forside, Talstien 1–100, specialfelter, pause, æsellyd-knap, ElevenLabs og telefonstemme, lydcache, gem/fortsæt, individuelle læringsniveauer og forældreoversigt.
- Selvstændigt digitalt Kortspil med fem talområder, lokal pass-and-play, strafregler og egen gemmeplads.
- To store klikbare spilvalg med aktiv markering og ekstra 6.-spillerfarve i v0.9.16.

## Planlagte nødvendige trin (ikke implementeret / skal afprøves)

1. Rigtig iPhone-PWA-installation/genstart/offline, fysisk A3-kontrol, korrekt CPU-tale og voksen-timer.
2. Familieafprøvning i både Talstien og kortspillet, især med 3–7-årige og voksne; notér fejl og oplevet spiltempo.
3. Fysisk komplet kortsæt for alle områder med korrekt antal gentagelser, bagsider, æske, regler og originalt illustrationstjek.
4. Beslut endelig fysisk standardkortregel og valgfri ekstra straf efter familieafprøvning.
5. Gennemfør tilgængelighed (VoiceOver, zoom, kontrast), performance og produktionsrettigheder før v1.0.

## Mulige senere funktioner (idéer – IKKE lovet til næste release)

- Valgfri oplæsning til kortspillet, ÆselKlog som CPU-kortmodstander og tydeligere tutorial med de originale regler.
- En simpel fysisk kortspils-assistent, som tæller kort/æselstraffe uden at erstatte de trykte kort.
- Eksport af forældreoversigt som en lokal fil uden automatisk synkronisering; eventuel sikker lokal backup/import af niveauer.
- Flere rolige og sjove visuelle æselreaktioner, men altid med reduceret bevægelse og uden at flytte SVG-brættets felter.
- Mere langsigtet: originale spilæsker/kort i flere talområder, test hos familier/skoler og vurdering af kommerciel udgivelse.

## Historik og kildepolitik

- Brug **altid** nyeste GitHub-main frem for gamle ZIP'er. Ny leverance skal være én komplet ZIP med nye cache-version og opdateret dokumentation.
- Tidligere udkast kan foreslå regler, men de senest godkendte beslutninger i dette dokument er retningsgivende. Afklar nye regelændringer med brugeren før spilmekanik ændres.
- Markér skarpt forskellen på: **kodet/testet lokalt**, **uploadet til GitHub**, **verificeret på rigtig iPhone**, **testet med familier**.
