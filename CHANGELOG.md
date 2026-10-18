# ÆselKlog – changelog

Nyeste øverst. Én kort post pr. version. Detaljer, testresultater og filoversigter for ældre versioner
findes i `docs/arkiv/`. Versioner uden post (fx 0.9.8 udover lydcache, 0.9.21, 0.9.26) var ikke
dokumenteret separat i de gamle noter.

## v0.9.36 – stabilitet, ikoner og dokumentation (18. oktober 2026)
- Tests: 7 fejlende Node-tests rettet (de fleste testede forældet kode); alle 31 består. Dobbelt `board.test.js` i roden fjernet.
- Service worker: kode hentes netværk-først med 3 sekunders timeout og falder tilbage til cachen. Cachenavn udledes af `VERSION`. Ny test dækker hængende net.
- PNG-ikoner (192, 512, maskable 512, apple-touch-icon 180) i manifest, `index.html` og precache.
- CI: GitHub Actions kører `npm test` (`tests/run-all.js`). Ny test sikrer at `sw.js` `VERSION` matcher versionen på forsiden.
- Dokumentation samlet i `PROJEKTSTATUS.md`, `CHANGELOG.md`, `AGENTS.md`, `TESTPLAN.md`; de gamle seks filer er flyttet til `docs/arkiv/`.

## v0.9.35 – kortoplysninger i kø (17. oktober 2026)
- Kortoplysninger køes uden overlap; CPU kan ikke gennemføre ugyldige træk (skal spille sit åbne kort før det vender).

## v0.9.34 – kortspillets lyd (17. oktober 2026)
- Kortspil bruger kun gemte MP3-tal. Dansk ved vending, fremmedsprog ved placering. CPU trækker lovligt og får ikke strafkort.

## v0.9.33 – Talkort-træning (17. oktober 2026)
- Talkort: MP3-only, udtaletræning med mikrofon og automatisk gennemgang.

## v0.9.32 – kun gemte Talkort-stemmer
- Talkort afspiller kun `audio/numbers/`; manglende lyd giver fejlbesked i stedet for TTS/ElevenLabs.

## v0.9.31 – lydprofiler
- Brætspil, Kortspil og Talkort har hver sine lokale lydprofiler (sprog, oplæsning, musik, niveau) via ⚙️ Lyd.

## v0.9.30 – (17. oktober 2026)
- Korrekt æselkortbillede på Talkort, sekventiel Auto-oplæsning, faste MP3-stemmer i kortspil.

## v0.9.29 – Talkort: udtale, Auto og nulstil (17. oktober 2026)
- Valgfri lokal mikrofonoptagelse (kun i hukommelsen) og sammenligning med den gemte lyd; Auto med justerbar pause; Nulstil til 0; ÆselKlog-logoer på kortets hjørner.

## v0.9.28 – 500 talelyde (17. oktober 2026)
- 500 MP3'er (1–100 i fem stemmer). MP3 prioriteres over ElevenLabs. Separat Service Worker-cache der overlever opdateringer. Knap til at hente alle lydene. (v0.9.27: `lydproeve.html`-generatoren.)

## v0.9.25 – Talkort-stemmevalg (16. oktober 2026)
- Valg mellem Spilleleder og ÆselKlog til danske tal i Talkort.

## v0.9.24 – Talkort (16. oktober 2026)
- Tredje funktion: 100 talkort i fem farvezoner med lige/ulige, tiere/enere og primtal; Forrige/Læs igen/Næste og sprogvalg.

## v0.9.23 – taloplæsning og mobilknap (16. oktober 2026)
- Auto-tale kun ved vending i kortspil; 1,5 s pause mellem dansk og fremmedsprog; "Hør tallet igen" under spillerbunkerne.

## v0.9.22 – flersproget taloplæsning og midterrækker (16. oktober 2026)
- Dansk/engelsk/tysk/spansk og dansk + sprog. Tal udtales som ord.
- Rettelse: en ny midterrække kan kun starte med områdets laveste tal (1, 21, 41, 61, 81).

## v0.9.20 – taloplæsning i Kortspil
- Stemmen siger kortets tal i stedet for generiske vendinger.

## v0.9.19 – musik og original æselstemme (16. oktober 2026)
- Tre CC0-MP3-melodier (valgfri baggrundsmusik, slukket som standard, dæmpes under tale). Fælles CPU-stemme i begge spil med automatisk præference for den originale ÆselKlog-stemme når den er godkendt i Cloudflare.

## v0.9.18 – kompakt kortspil (16. oktober 2026)
- Kompakt kortbord, tryk/træk fra lukket bunke, fælles spillerleder- og CPU-stemmer, første udgave af valgfri musik.

## v0.9.17 – Kortspil mod Æslet (16. oktober 2026)
- 1–6 personer + CPU-æsel, frie korttræk uden forhåndsblokering, opdagede fejl udfordres med æselkortet (fortryder seneste træk + straf).

## v0.9.16 – spilvælger og seks spillere (16. oktober 2026)
- Tydelig spilvælger (Talstien/Kortspil), op til seks menneskespillere i Talstien + CPU.

## v0.9.15 – Kortspil (16. oktober 2026)
- Selvstændigt digitalt kortspil med fem talområder, klassisk (4/6/8 æselkort) og "send æslet videre"-variant.

## v0.9.14 – afslut-menu og fysisk A3 (16. oktober 2026)
- ⏻ Afslut (gem og afslut / afslut uden gem). Reel fysisk A3-spilleledervisning med faste specialfelter.

## v0.9.13 – tilfældige specialfelter (15. oktober 2026)
- Hvert nyt digitalt spil får egen fordeling af ni typer specialfelter; fem farvede roser. Gamle gemte spil beholder den faste fordeling.

## v0.9.12 – levende specialfelter (15. oktober 2026)
- Pop-up og effekter ved actionfelter (`actionfx.js`), respekterer reduceret bevægelse.

## v0.9.11 – forældreoversigt (15. oktober 2026)
- Lokal læringshistorik (maks. 96 opgaver pr. barn), kurver og sletning pr. barn.

## v0.9.10.1 / v0.9.10 – læring og variation (15. oktober 2026)
- "Hov hov!" bevares kun i 35 % af oplæsningerne. Fire uafhængige læringsniveauer pr. barn (talforståelse, plus, minus, tabeller; −2 til +2) med lokale profiler.

## v0.9.9 / v0.9.8 – lydcache og oprydning (15. oktober 2026)
- Lokal, stemmespecifik cache af faste, anonyme ElevenLabs-sætninger (15 MB / 70 klip). UI-oprydning på forsiden.

## v0.9.7 – offline og stemme-reserve (15. oktober 2026)
- CSS flyttet til `styles.css`; netværk-først SW med offline-fallback; AI-tale falder tilbage til telefonstemme ved timeout.

## v0.9.2 – v0.9.6 (14.–15. oktober 2026)
- Ny forside og enkel spilstart (0.9.2–0.9.3), godkendt fuldskærmsforside (0.9.5), kompakt "Fortsæt spil" (0.9.6).

## v0.9 / v0.9.1 (14. oktober 2026)
- Gem/fortsæt og adaptive opgaver; første prøve af sjov CPU-stemme.
