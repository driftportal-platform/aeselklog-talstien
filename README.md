# ÆselKlog Talstien – v0.6 med RIGTIG æsellyd

Den lydfil, du uploadede, er tilpasset og lagt direkte ind i appen som `donkey-bray.wav` (ca. 3,5 sekunder). Ved et forkert svar — også når CPU-æslet svarer forkert — afspiller appen den rigtige æsellyd. Appen venter, så lydklippet når at spille færdigt før brikken flytter.

Under **Indstil æslets stemme** kan du klikke **🫏 Prøv æsellyd** for at høre optagelsen.

## Upload til GitHub Pages

Udpak ZIP-filen. Upload **alle** disse filer til roden af dit eksisterende ÆselKlog-repository på GitHub (erstat de eksisterende med samme navn):

- `index.html`, `app.js`, `engine.js`, `sw.js`
- `donkey-bray.wav`, `aeselklog-card.webp`, `icon.svg`, `manifest.webmanifest`

Ingen ekstra tjenester er nødvendige for den rigtige æsellyd. Filerne kan også bruges offline efter, at siden er blevet indlæst og gemt i appens cache.

**VIGTIGT:** Hvis du stadig hører den gamle lyd på iPhone, kan det skyldes appens cache. Luk ÆselKlog helt, genåbn og opdater siden. Den nye version vises som `PRØVEVERSION 0.6` øverst.

## Hvad med Mia-stemmen?

Denne opdatering ændrer **kun æsellyden**. Den mere naturlige danske AI-oplæsningsstemme kræver fortsat, at ElevenLabs og Cloudflare forbindes som beskrevet i v0.5. Telefonens stemme er fallback.

## Rettigheder

Før spillet eller appen sælges eller offentliggøres som et kommercielt produkt, skal brugsvilkår/licens for det uploadede æselklip være afklaret. Du skal have lov til at bruge og videredistribuere lydfilen.
