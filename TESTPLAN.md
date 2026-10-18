# ÆselKlog – testplan

## Automatisk
- `npm test` kører alle Node-tests (`tests/*.test.js`). Kræver Node 22. Kører også i GitHub Actions.
- `tests/*.py` er Playwright/Chromium-browsertests. De køres manuelt (ikke i CI) og bruger simuleret tale og lokallager. De er ikke bevis for iPhone/WebKit.

## Manuel prøve på iPhone efter upload (installeret PWA)
Notér dato, enhed og iOS-version samt fund i `PROJEKTSTATUS.md`.
1. **Installation og opdatering:** åbn siden i Safari online, føj til hjemmeskærm (tjek ikonet), åbn, luk, åbn i flytilstand. Upload ny version, åbn online og kontrollér at versionsmærket skifter.
2. **Offline-lyd:** Indstillinger → Hent alle 500 talelyde. Slå flytilstand til og afspil Talkort 5, 12, 22 på dansk, dansk + tysk og med Auto.
3. **Talkort:** skift stemme (Spilleleder/ÆselKlog), Nulstil, Auto med pause, og mikrofonoptagelse + sammenligning (tilladelse spørges første gang).
4. **Kortspil:** ét navn + CPU. Tryk på bunken, læg bevidst forkert, udfordr med æselkortet, gem og fortsæt. Tjek at tal siges ved vending og at "Hør tallet igen" virker. Prøv træk med fingeren på lille skærm.
5. **Talstien:** spil en runde med 2 spillere + CPU; digital og fysisk terning; gem og afslut, og fortsæt.
6. **Lydprofiler:** ⚙️ Lyd i hvert spil; skift mellem spil og kontrollér at indstillingerne holdes adskilt.
7. **Musik:** tænd, vælg alle tre melodier, hør dæmpning under tale og at musikken stopper uden for spil. Lyt efter hul i loopet.
8. **ElevenLabs (hvis i brug):** kontrollér at den originale ÆselKlog-stemme først vælges automatisk, når Cloudflare viser den som godkendt.
9. **Tilgængelighed:** VoiceOver gennem forsiden, et spil og Talkort; sæt "Reducer bevægelse" til.

## Før v1.0
Familietest, A3-plade mod app, trykte kort, rettigheder til billeder og lyd.
