# ÆselKlog – instruktioner til fortsat udvikling

> Dette er en familie- og læringsspilsprototype. **Læs altid `UDVIKLINGSPLAN.md`, `README.md` og `TESTPLAN.md`**, og kontrollér GitHub `main`, før du ændrer kode.

## Projektets struktur

- `index.html` – opsætning, design, mobilvisning, overlays.
- `app.js` – spilflow, CPU, terninger, taletiming, animationsflow, viser actionfelter.
- `engine.js` – alders- og gangetabel-opgaver, svar og voksentider.
- `board.js` – SVG-spilleplade 1–100.
- `actions.js` – alle 25 felter og én fælles actionmotor.
- `leaderboard.js` – lokal statistik/topscore.
- `sw.js` – offline-cache, opdater version ved ændringer.
- `tests/` – automatiserede Node- og browsersmoketests.

## Bevar disse beslutninger

1. LEG uden påkrævet matematik skal altid virke. Læring og superopgaver er frivillige.
2. Fem områder: 1–20, 21–40, 41–60, 61–80 og 81–100. Ingen talfejl eller dubletter.
3. Børn fra 3 år til voksne, med individuelle aldersopgaver. 3–6-årige må ikke tvinges gennem voksen-gangetabeller.
4. Ingen tidsgrænse for børn. Voksne vælger 60/30/10 sek.; timer begynder først **efter oplæsning** og skal pauses når appen er i baggrunden.
5. CPU viser egne terningkast og kan svare forkert. CPU/automatisk brikbevægelse venter, når appen er i baggrunden.
6. Den ægte æsellyd og stemmevælgeren via ElevenLabs + Cloudflare skal bevares; lokal dansk telefonstemme ved offline/fejl.
7. Fuldskærms-plade i landskab og kontrollér mobilens safe areas og zoom; terninger/opgaver som overlays.
8. Actionflytning udløser aldrig en ny automatisk action, og en Gulerod giver højst ét ekstra kast pr. tur. Actionbesked bliver synlig under oplæsning.
9. Topscore er lokalt på enheden og må **ikke** lagre børnealder eller kontakte en server.
10. Brug originalt design og egne illustrationer. Kontroller rettigheder/legetøjskrav før kommerciel udgivelse.

## Kvalitetsrutine

1. Find den faktiske kodeversion i GitHub og i eventuelt nyere ZIP-arkiv, før du vælger udgangspunkt.
2. Tjek `UDVIKLINGSPLAN.md` og notér status, åben fejl og relevante testkrav.
3. Lav små, kontrollerede ændringer. Undgå at skrive appen forfra eller at miste tidligere funktioner.
4. Kør `node --check` på JS-filer, alle fem Node-suiter i `tests/` og ved behov `python tests/browser_smoke.py` (Playwright/Chromium).
5. Test på fysisk iPhone før du mærker en udgave **klar til release**. Inline browser-smoke, simuleret AI og lokalt lager er ikke det samme som en live-test.
6. Opdatér README, `UDVIKLINGSPLAN.md`, `TESTPLAN.md` og `sw.js`-cacheversion sammen med koden.
7. Vis præcist hvad der er blevet implementeret, og hvad der stadig mangler; rapportér ikke uprøvede ting som testet.

## Sikkerhed

- **ALDRIG** ElevenLabs API-secrets i browser-JavaScript, GitHub eller screenshots. Den offentlige Cloudflare Worker-URL er okay i browserkode.
- Appen kan sende tekst med kaldenavne til ElevenLabs for oplæsning. Undgå fulde børnenavne og personfølsomme data.
- Topscore skal fortsat kun ligge i lokalStorage, uden automatisk online synkronisering.
- Respektér funktionerne `prefers-reduced-motion`, lyd fra/til og skærmlæsernes aria-mærkninger.

## Aktuel fase

**v0.8-E** samlet pakke; lavet ud fra seneste v0.8-D-arkiv. GitHub `main` var **v0.8-C** ved udviklingsstart, så pakke skal uploades og afprøves på rigtig iPhone. Næste udviklingsfase: **v0.9** med gem/fortsæt, adaptiv læring og familietest.
