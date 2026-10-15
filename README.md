# ÆselKlog v0.9.6 – kompakt Fortsæt spil på forsiden

**Kilde:** GitHub `main` v0.9.5. v0.9.6 er lavet fra filer verificeret byte-for-byte med GitHub, inklusive de originale billeder. **Status:** lokalt udviklet og testet; afventer upload og kontrol på rigtig iPhone-PWA.

## Nyt i v0.9.6

- Den store boks med **Gemte spil** er fjernet fra forsiden. Kun når et gyldigt lokalt gemt spil findes, vises **▶ Fortsæt spil** og en lille **✕** til at slette gemningen.
- I stående format ligger knappen i den smalle overgang mellem den blå Spil-knap og Indstillinger, uden at dække knappernes tekst. Fire oprindelige menuer (Spil, Indstillinger, Topscore, Om spillet) er altid tilgængelige.
- I liggende format får **Fortsæt spil** sin egen lille række mellem Spil og Indstillinger, når der findes et gemt spil.
- Den godkendte illustration (`home-fullscreen.webp`) er **identisk med v0.9.5**, og spilmotor, gemmeformat, stemmer og ElevenLabs-forbindelse er ikke ændret.
- Opdateret Service Worker-cache: `aeselklog-talstien-v096-compact-resume`.
- Version i HTML og dokumentation opdateret til v0.9.6.

## Test

Kør `python tests/test_home_v096.py` til test af begge skærmretninger, menuer, fortsæt og slet. Kør desuden de eksisterende Node- og Playwright-tests beskrevet i `TESTPLAN.md`. Browser-tests benytter kun simuleret lyd, ikke ElevenLabs-credits.

**Efter upload:** Opdatér eller genstart den installerede PWA på iPhone. Tjek at alle fire menuknapper kan vælges både med og uden gemt spil, og at et gemt spil kan genoptages. Den faktiske iOS-PWA og rigtig ElevenLabs-lyd kræver fysisk afprøvning.

App: https://driftportal-platform.github.io/aeselklog-talstien/

---

## Tidligere version – v0.9.5

# ÆselKlog v0.9.5 – fuldskærmsforside som referencebilledet

- Forsiden er én sammenhængende illustration fra det godkendte referencebillede (ikke et billede over gamle knapper).
- Fire klikbare og tilgængelige knapper ligger præcist ovenpå de tegnede knapper: Spil, Indstillinger, Topscore og Om spillet.
- Forsiden fylder mobilens viewport i stående format, uden gammel header, hvide margener eller gamle knapper.
- I liggende mobilformat anvendes et læsbart splitlayout.
- Spil- og indstillingssiderne samt hele spillets motor og ElevenLabs-kode er bevaret fra v0.9.4.
- `home-fullscreen.webp` og `home-ui.js` er nye og skal uploades sammen med alle andre filer.
- Service Worker-cache er opdateret til v0.9.5.
- Før videre udvikling: kontroller altid seneste GitHub-kode og dette dokument.
- Afprøv på rigtig iPhone efter upload; test også alle fire forsideknapper og et gemt spil.

Spil: https://driftportal-platform.github.io/aeselklog-talstien/
