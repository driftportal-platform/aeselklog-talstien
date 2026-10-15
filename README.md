# 🫏 ÆselKlog – Talstien v0.9.8 (15. oktober 2026)

## Nyhed: permanent, stemmespecifik AI-lydcache

- `voicecache.js` gemmer **kun udvalgte, faste og upersonlige** ElevenLabs-sætninger på den aktuelle enhed i **IndexedDB**.
- Hvert lydklip identificeres ved **Worker-endpoint + valgt AI-stemme-ID + lydmodel-version + tekst**. Spillelederens stemme (Mia, Mads eller en anden) og CPU-æslets stemme holdes adskilt, når de faktisk bruger forskellige stemme-ID'er.
- En genkendt sætning læses fra lydcachen **før** et nyt ElevenLabs-kald – også uden internet eller under midlertidig AI-fejl.
- Nye lydklip genereres kun, når de bliver brugt første gang. **Ingen forhåndsgenerering**, der forbruger credits uden at barnet spiller.
- Cachebegrænsning: **15 MB / 70 klip**, ældste klip slettes automatisk. Der lagres ingen spiller- eller børnenavne, personlige oplæsninger, adgangsnøgler eller fulde matematikopgaver.
- Under **Indstillinger → Stemme og lyd → Gemte AI-lyde** vises antal klip og størrelse, og man kan trykke **Ryd gemte AI-lyde**.
- Telefonstemmen bruges stadig, hvis AI-lyd ikke kan hentes, og en sætning endnu ikke er gemt. Hvis browseren ikke tillader IndexedDB, fungerer spillet uden permanent lydcache.
- Eksisterende 24-lydklips RAM-cache, ElevenLabs-Worker, CPU-turpauser, stemmevalg, godkendt forside, spil, gem/fortsæt og adaptiv matematik er bevaret.

**Filer:** Ny `voicecache.js`, ændringer i `app.js`, `index.html`, `styles.css`, `sw.js`, testfiler og dokumentation. PWA-cache: `aeselklog-talstien-v098-voice-cache`.

**Kilde:** Kontrolleret mod GitHub `main`, som ved udviklingsstart stadig viste v0.9.6. Denne version er bygget videre på den fulde lokalt leverede v0.9.7-pakke, som allerede indeholder CSS-opdeling og PWA-forbedringer. ZIP-pakken er **ikke** automatisk uploadet til GitHub.

**Automatisk test:** Node-tests, mobildesign, CPU-stemme, gem/fortsæt, AI-fejl-reserve og mock-IndexedDB til cache og sletning er testet. Der er **ikke** gennemført en reel ElevenLabs-test eller en fysisk iPhone-PWA-test. Lokal HTTP/Service Worker-installation blokeres af testmiljøet, så kontrollen skal udføres på telefon efter GitHub-upload.

**Installation:** Pak hele ZIP'en ud og læg alle projektfiler i GitHub-repositoryets rod, inklusive `voicecache.js` og `styles.css`. GitHub Pages må ikke få selve ZIP-filen som eneste fil. Åbn den installerede PWA igen, så opdateringen kan blive hentet. Gamle gemte spil og topscore bevares.

---

# ÆselKlog v0.9.7 – bedre offline, CSS og stemme-reserve

**Grundlag:** Lokal v0.9.6-releasepakke, som bygger på bekræftet GitHub `main` v0.9.5. `main` er ikke ændret af denne pakke. **Status:** de eksisterende Node- og Chromium-regressionstests samt nye mock-tests er bestået lokalt. Den faktiske Service Worker-installation og iPhone-PWA skal testes efter upload.

## Nyheder i v0.9.7

- CSS er flyttet **uden designændring** fra `index.html` til `styles.css`, så fremtidige rettelser er lettere og mere afgrænsede.
- PWA-cache præindlæser nu også `styles.css`. Den bruger cache-first til billeder/lyde og netværk-first med offline-fallback til HTML/JS/CSS. Kun caches, der tilhører ÆselKlog, bliver ryddet ved opdatering.
- AI-oplæsningen bruger nu også lokal telefonstemme efter **timeout** (AbortError) og ved offline-tilstand. Ved gentagne fejl holder appen 60 sekunders pause fra AI-forsøg, uden at ændre det gemte stemmevalg. Manuel ændring af AI-stemme nulstiller pausen.
- Skift mellem Forside, Spil, Indstillinger og selve spillet flytter tastatur-/skærmlæserfokus til den nye visning. AI-stemmestatus læses op for skærmlæsere.
- Den godkendte fuldskærmsforside, kompakt Fortsæt spil, spilmotor, gemte spil, CPU-regler og Cloudflare Worker er bevaret.

**Upload:** Pak ZIP-filen ud, og upload **alle** filer, inklusive den nye `styles.css`, til GitHub. Der skal ikke uploades ZIP-filen som én fil i roden. Åbn appen via det kendte GitHub Pages-link. Opdatér PWA'en, så den nye Service Worker tager over. Gemte spil ligger lokalt og berøres ikke af denne cacheopdatering.

**Test:** `for f in tests/*.test.js; do node "$f"; done` og Playwright-testene fra `TESTPLAN.md` er kørt med succes. Reelt lokalt HTTP-PWA-smoketest kunne ikke udføres i det begrænsede browsermiljø, hvor adgang til localhost blev blokeret. Test fysisk på iPhone før v1.0. Ingen produktionstest af ElevenLabs er udført.

---

## Tidligere version – v0.9.6

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
