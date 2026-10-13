# ÆselKlog Talstien – v0.8-A: den snoede bondegårdsbane

**Spil:** https://driftportal-platform.github.io/aeselklog-talstien/  
**Status:** v0.8-A er bygget og browserafprøvet lokalt og leveres som ZIP til manuel GitHub-upload. GitHub Pages ændres ikke, før ZIP'en er uploadet.

## Hvad er nyt i v0.8-A?

- Ny, original og langt mere levende **SVG-Talsti** med stald, gulerødder, hegn, blomster, træer, høns, dam, sol og mål.
- **Alle tal fra 1 til 100 genereres automatisk** og går i zigzag på fem bølgende baner; ikke ét eneste tal er tegnet ind i et billede.
- Tydelige farver pr. talområde og mindre actionikoner, så hvert nummer er synligt.
- **Stor plade** for næsten heldækkende visning, **✕ Luk** uden at nulstille spillet.
- Panorering, zoom +/- og knib-til-zoom (på berøringsskærme), **Hele banen** og **🫏 Find æslet**.
- De farvede spilleræsler inklusive CPU-æslet vises og kan hoppe på den nye bane.
- Tidligere funktioner er videreført: fysisk/digital terning, opgaver fra 3 år til voksen, voksen-tidsgrænser, CPU, ægte æselskry, AI-stemmeindstillinger og lokal fallback.

## Vigtigt: dette er kun fase A

Version **0.8-B** flytter terninge- og opgaveforløbet ind som overlays på den store plade og retter rækkefølgen til **kast → flyt → læringsterning → svar → evt. ekstra skridt → action**.

Lige nu ligger det gamle terninge-/opgavepanel stadig oven over spillepladen. Luk udvidet plade med X for at bruge panelet. Flere actionfelter som Gulerod og Vandpyt kommer i fase **0.8-C**, ikke i denne release.

## Sådan lægger du den på GitHub

1. Pak ZIP'en ud.
2. Upload **appfilerne og `board.js`** til roden af `driftportal-platform/aeselklog-talstien` og erstat eksisterende filer med samme navn.
3. Upload `UDVIKLINGSPLAN.md`, `AGENTS.md` og `tests/board.test.js`. README.md opdateres også.
4. Commit ændringerne på `main` og åbn GitHub Pages-adressen.
5. På iPhone: Genindlæs siden, og prøv **Stor plade**, **Find æslet** samt et almindeligt spil. Hvis hjemmeskærmsappen viser en gammel version, luk den og åbn den igen, så Service Worker får mulighed for at opdatere.

**Cloudflare Worker skal ikke ændres.** API-nøglen må aldrig uploades i offentlig GitHub-kode.

## Test

Kør `node tests/board.test.js` (kræver kun Node.js) for at kontrollere 100 felter, retning, koordinater og SVG-markup. Appen er også afprøvet i Chromium på mobilstørrelse og desktop med to almindelige spillere og CPU.

**Begrænsninger:** Ikke endnu testet fysisk på iPhone/iPad, og ElevenLabs-lyd er ikke live-testet i v0.8-A. Den nuværende AI-forbindelse er ikke ændret.

## Fremtidigt arbejde

Læs altid [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md) først. [AGENTS.md](./AGENTS.md) beskriver arbejdsrutinen. Hold afkrydsningerne opdateret ved næste version.
