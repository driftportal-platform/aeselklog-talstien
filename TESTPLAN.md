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


## RegneKlog (v0.9.82)
- Åbn fra spilmenu og direkte ?spil=regneklog. Prøv tilbage og genindlæsning; valgene huskes, spillet starter først ved Start.
- Prøv plus, minus, gange og division i Let/Mellem/Svær og blandede opgaver. Minus skal være mindst 0, division uden rest. Maksimalt tal 10/20/100.
- Prøv billeder og kun tal; Hjælp skal kunne vise billeder i begge. To trin før Vis løsningen. Overstregninger i minus og lige fordeling i division skal passe.
- Rigtigt uden hjælp: 10 point. Med hjælp: 5. Vist løsning: 0. Forkerte/ugyldige svar må ikke give/tab point eller gå videre. Samme opgave giver kun point én gang.
- Afslut 5/10/20 opgaver og kontrollér samlet oversigt. Prøv 320 px og stor tekst. Afprøv på fysisk iPhone/Android og installeret PWA; endnu ikke bekræftet.


## Interaktive gulerødder (v0.9.83)
Prøv 10−3: fjern tre vilkårlige gulerødder, fortryd én, fjern igen. Der må ikke kunne fjernes for mange. Tæl med skal fremhæve de syv tilbage i rækkefølge og vente på hvert lydklip. Prøv også 3−3 og 100−1.
Prøv plus som flytning, gange som kurve og division som ligelig fordeling. I division tælles kun én kurv. Brug tastatur, 320 px og reduceret bevægelse. Stop eller forlad siden midt i tællingen; der må ikke komme forsinkede tal. Lydfejl må ikke blokere den visuelle tælling. Rigtigt efter tællehjælp giver kun 5 point én gang.


## RegneKlog-stemme (v0.9.84)
- Skriv Aya og vælg en af de samme spillelederstemmer. Prøv også enhedsstemme, tomt navn og Lyd fra. Åbning af valgsiden skal være tavs.
- Start, gentag stykket og skift opgave. Tjek forkert svar: indtastet tal/navn skal siges, samme opgave blive stående, og tallet kunne rettes. Rigtigt svar læser tal og ros og tildeler kun point én gang.
- Åbn Hjælp og tryk Læs hjælpen op på begge trin. Gentagelse skal hverken flytte trin eller vise løsningen. Slå automatisk opgave-/feedbacklæsning fra og prøv manuelle knapper.
- Afbryd med Stop, næste trin, tælling, nyt svar, Lyd fra og Spilmenu. Skjul siden mens stemmer hentes; der må ikke komme forsinket tale. Genindlæs og kontrollér navn/stemme/valg.
- Fysisk telefon og live stemmetjeneste skal stadig afprøves. Navngivne klip må ikke komme i permanent TTS-cache.


## Musik og lydaktivering (v0.9.85)
- Prøv topknap/menu, alle tre melodier og lydstyrke i alle seks offline-spil og fire online-spil. Valgene skal være adskilt pr. spil/enhed og huskes efter genindlæsning, også direkte adresser. Kontroller begge onlineadresser.
- Talstien: prøv normal/stor plade og musikmenu fra værktøjslinjen. Musik må ikke fortsætte på forsiden/menu eller skjult side. Tale skal dæmpe musikken og fortsætte ved ændring af musikstyrken.
- RegneKlog: med fælles fortæller sat til enhed og særskilt AI-valg skal Prøv valgt stemme/Start/Læs op aktivere lyd ved trykket. Fejl i afspilning skal være synlig, og nyt tryk skal kunne prøve igen. Fysisk iPhone og rigtig stemmetjeneste skal prøves.


## Varierede tilbagemeldinger (v0.9.86)
Prøv gentagne forkerte og rigtige svar med/uden navn. Samme variant må ikke komme direkte igen, og det indtastede tal skal være med i både tekst og tale. Forkert svar bliver på samme opgave uden pointtab. Genblanding efter 10 varianter må ikke starte med den senest brugte variant. Stemmevalg og Lyd fra skal stadig respekteres.


## Voksenniveauer (v0.9.87)
- Prøv Voksen · svær og Voksen · ekstra svær med hver regneart og blandet. Ingen billeder må vises, heller ikke med hjælp åben. Børneniveauernes billeder skal fortsat virke.
- Prøv fx 4876+2978, 2300−4876, 123×47 og 8460÷36, store svar og ±. Decimaler/tusindtalsseparatorer afvises; fejl bliver på samme opgave uden pointtab.
- Hjælp skal forklare en gyldig metode, kunne læses op og give 5 point ved rigtigt svar. Uden hjælp 10, vist løsning 0. Prøv negative svar på mobil og valgene efter genindlæsning.
