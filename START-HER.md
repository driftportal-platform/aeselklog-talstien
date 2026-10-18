# ÆselKlog Online v0.9.38 – chatpilot

Dette er en selvstændig pilot til **online-kortspillet**, baseret på v0.9.37. Den ændrer ikke eksisterende Kortspil, Talstien, Talkort eller de 500 MP3-filer.

## Indhold
- `site/online.html`, `site/online.js`, `site/chat.js`, `site/online-config.js`: hjemmeside til online-kortspillet
- `worker/src.js`, `worker/wrangler.jsonc`: Cloudflare Worker og Durable Object
- `test-chat.mjs`: lokal adgangs-/chat-smoketest

## Første opsætning
1. Cloudflare: opret Worker **aeselklog-online-pilot** via Wrangler fra `worker/`. Durable Objects kræver egnet konto/plan. For en ny Worker skal `new_sqlite_classes` migrationen bevares.
2. Tilføj miljøvariabel `APP_ORIGIN` med nøjagtig `https://driftportal-platform.github.io` (ingen slut-skråstreg).
3. Kør fra worker-mappen: `npx wrangler deploy`. Dette opretter/opdaterer både Worker og bindingen GAME_ROOM.
4. Find den offentlige Workers-URL, eksempelvis `https://aeselklog-online-pilot.<subdomain>.workers.dev`. Indsæt **den faktiske URL** i `site/online-config.js` som `window.AESEL_ONLINE_URL = 'https://...';`.
5. Upload `site/online.html`, `site/online.js`, `site/chat.js`, `site/online-config.js` til roden af GitHub Pages-repositoriet **uden** at slette eksisterende filer.
6. Besøg `https://driftportal-platform.github.io/aeselklog-talstien/online.html` på to enheder. Spiller 1 opretter, spiller 2 deltager med rumkode.
7. Test hurtigbeskeder; aktivér derefter chat på begge enheder for at afprøve tekst og korte optagelser.

## Chat og sikkerhed
- Kun spillere med deres individuelle, tilfældige hemmelige sessionstoken kan hente chat/lyd. Invitér kun personer, I kender.
- Hurtigbeskeder kan sendes uden opt-in, men kun efter begge spillere er tilsluttet. Fri tekst og lyd kræver opt-in fra **begge** spillere og er fra som standard.
- Tekst højst 160 tegn; lydoptagelse automatisk højst 10 sekunder (derudover en størrelsesgrænse). Server kontrollerer metadata og maksimal filstørrelse; den foretager **ikke** indholdsmoderation eller verificerer lydvarighed fra codec.
- De 30 seneste chatbeskeder (inklusive lydklip) opbevares i rumlagringen, højst cirka 24 timer, og ryddes når rummet næste gang tilgås efter udløbet. Dette er **ikke** en garanteret aktiv automatisk sletning på præcis 24-timersgrænsen.
- Ingen lyd sendes til ElevenLabs. Mikrofonen kræver HTTPS og tilladelse i browseren. Test i Safari og installeret iPhone-PWA.
- Del ikke personlige eller følsomme oplysninger i chatten. Pilot beregnet til familie/venner. Fravælg fri chat til mindre børn.

## Status
Node-syntaks kontrolleret og chat-serverens adgangskontrol smoke-test bestået. Ingen live-test på Cloudflare eller to telefoner udført. Onlinespillets øvrige kendte pilotbegrænsninger gælder stadig (bl.a. udfordringer, æselkort og CPU er ikke færdiggjort).
