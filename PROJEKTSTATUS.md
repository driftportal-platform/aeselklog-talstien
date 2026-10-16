# 🫏 ÆselKlog – fælles projektstatus v0.9.17

**Opdateret:** 16. oktober 2026 · **Senest bekræftet GitHub `main` før ny kode:** v0.9.16 · **Ny udviklingspakke:** v0.9.17, lokalt udviklet og automatisk testet, **ikke uploadet til GitHub af assistenten**. Korrekt kilde ved ny udvikling er altid aktuel `main` og de seks projektdokumenter. Dokumentationen opdateres sammen med PWA-cache ved hver release.

## Implementeret og automatiseret testet

- **Talstien:** Den godkendte illustration på forsiden, 100 felter, digital eller fysisk A3-plade, op til seks menneskelige deltagere + CPU, fysisk/digital terning, ni specialfelttyper, tilfældige specialfelter digitalt og faste ved fysisk A3, pause/fortryd, gem/fortsæt.
- **Stemmer:** ElevenLabs gennem Cloudflare Worker uden offentlige secrets, separat CPU-stemme, 35 % Hov hov-varianter, lokal stemmespecifik lydcache og gratis/offline telefonstemme som reserve.
- **Læring:** Valgfri LEG, talforståelse/plus/minus/tabeller med individuelle trin, lokale profiler og forældreoversigt uden konto.
- **Kortspil:** Alle fem talområder, 100 talkort per område, 4/6/8 beholdte æselkort eller ét vandrende, valgfri ekstra straf, 2–6 mennesker eller **1–6 mennesker + CPU**, lokalt gemt spil med adskilt nøgle.
- **v0.9.17:** Kort vendes ved tryk på lukket bunke. Vendt/åbent kort kan trækkes eller vælges og tappes på en målbunke. Regelmæssigt forkerte træk blokeres ikke. En opdaget fejl udfordres via synligt æselkort, fortryder *seneste* ugyldige træk og giver æselstraf. CPU kan også opdage fejl og kan begå egne fejl.

**Automatisk test:** 21 Node-tests og 16 Chromium-browsertests bestået. Tests bruger simulerede lyde og lokallager, ikke fysisk iPhone/iOS. Service Worker-testen er en unit/mock-test.

## Mangler eller er ikke verificeret

- Fysisk iPhone-PWA, iOS Safari/WebKit/VoiceOver, mobiltræk med automatisk rulning, offline-genstart og cache-udskiftning; test på den installerede app.
- Reel ElevenLabs-kreditmåling, opdatering og fallback i fysiske telefonmiljøer.
- Kortspilsfamilietest: korttræk, regler for afsløring af fejl, tempo for solo-CPU, antal fejl per kamp, og om "Opdaget fejl"-kortet er let at finde.
- Sammenlign faste A3-specialfelter i appen med de faktisk trykte A3-plader.
- Fysiske trykklare kort 1–20, 41–60, 61–80 og 81–100 samt endelig regelbog og æske. 21–40-/æselkortprototyper eksisterer.
- Endelig sikkerheds-, tilgængeligheds- og familieafprøvning før v1.0.

## Arbejdsgang ved næste udvikling

1. Upload alle filer fra v0.9.17-arkivet, ikke blot ZIP-filen, til GitHub `main`.
2. Prøv Kortspil med ét navn + CPU. Tryk på bunken, læg bevidst forkert i midten, udfordr med æselkortet, og test gem/fortsæt.
3. Test resten af Talstien på rigtig iPhone og dokumentér konkrete fejl eller ønsker.
4. Indsamlede idéer og beslutninger står i `IDEKATALOG.md`. Start hver ny release med at kontrollere `main`, README, TESTPLAN, AGENTS, UDVIKLINGSPLAN, PROJEKTSTATUS og IDEKATALOG.
