# ÆselKlog – regler for udvikling

Gælder både mennesker og AI-assistenter. Hold denne fil kort og kun med regler, der gælder permanent. Versionshistorik hører til i `CHANGELOG.md`, status og åbne punkter i `PROJEKTSTATUS.md`.

## Arbejdsgang
1. Start fra seneste GitHub `main`; ældre ZIP-filer er kun reference. Læs `PROJEKTSTATUS.md` og denne fil.
2. Kør `npm test` (alle Node-tests) og `node --check` på ændrede JS-filer. Kør de relevante `tests/*.py` (Playwright) hvis UI ændres.
3. Ved hver release: hæv `VERSION` i `sw.js` og versionsmærket (`PRØVEVERSION x.y.z`) i `index.html` (en test kræver at de er ens), tilføj en post i `CHANGELOG.md` og opdatér `PROJEKTSTATUS.md`.
4. Skeln altid mellem det, der er testet automatisk/simuleret, og det, der er prøvet på en rigtig iPhone eller med rigtig ElevenLabs. Påstå aldrig det sidste uden en faktisk prøve.
5. Vedligehold én aktuel `INSTALLATION.md`; opret ikke nye installationsfiler pr. version. Nye filnavne skal bruge ASCII (a-z, tal og bindestreg). Upload alle filer sammen; slet ikke `audio/` og `music/`. Versionsspecifikke INSTALLATION-/UPLOAD-vejledninger, logs (`*.log`), byggeoutput (fx Wrangler dry-run), skærmbilleder og engangs-patchfiler hører ikke hjemme i roden; læg dem i `docs/arkiv/` eller lad være med at committe dem.
6. `.github/` er en skjult mappe og bliver ofte droppet ved upload via GitHubs webgrænseflade. Kontrollér efter upload at `.github/workflows/test.yml` findes.

## Produktregler
- Matematik er altid frivillig. Den godkendte forside (`home-fullscreen.webp`, `home-ui.js`) ændres ikke uden eksplicit godkendelse.
- Talstien, Kortspil og Talkort er selvstændige. Gem aldrig det ene spils data i det andets nøgle.
- Fysisk A3: faste specialfelter (`A.FIELDS`) skal stemme med det trykte bræt. Digitalt bræt: ny tilfældig fordeling pr. spil; gamle gemte spil beholder deres.
- Ingen action-kædereaktioner; højst ét ekstra Gulerod-kast pr. tur.

## Fælles ikoner
- Brug assets/icons via game-icons.js og assets/images til fælles billeder. Tilføj nye filer til sw.js CORE. Navne/oversigt: assets/README.md. Spillernavne og chatindhold må ikke omformes til UI-ikoner.

## Onlineforbindelse
- Nye klienters spilhandlinger bruger requestId + expectedMove. Gem kvitteringen atomisk med trækket, og bevar den ved udfordring/fortrydelse. Gensend kun samme handling med samme ID; udfør ikke et nyt træk, mens udfaldet af det første er ukendt. Statusforespørgsler har timeout og må ikke overlappe.

## Forlad online spil
- Begge online spil: tilbageværende fortsætter ved mindst to aktive spillere. Afgående talkort fordeles rundt i bunden af de resterendes lukkede bunker uden omblanding; æselkort returneres til puljen. Bevar sædeindekser og afvis handlinger fra forladte sæder. Én tilbage i et startet spil lukker runden; en lobby må vente med én.

## Talstien online
- Online bruger narration.js til samme variation af den indledende Hov hov-hilsen som offline; gentag skal beholde den faktisk læste tekst. Brikanimation er kun visning: respekter serverposition, undgå genafspilning ved polling/genindlæsning, og vis direkte ved reduceret bevægelse.
- Fortællerstemmens hændelser kommer fra serveren med stigende ID, så alle deltagere hører samme forløb uden gentagelser ved polling/genopkobling. Online Talstien bruger offline-spillets /voices og /tts ved AI-valg eller lokal dansk stemme ved enhedsvalg. Efter brugerens ønske bruges de indtastede spillernavne i talebeskeder, også ved AI-TTS som offline. Opret ikke permanent TTS-cache med navne. Bevar eksplicit stemmevalg ved fejl og brug midlertidig enhedsstemme. Tale fra skal også gælde manuel Læs op.
- Færdige online-ture skifter automatisk efter kort resultatvisning via Worker-alarm; ingen Næste spiller-knap. Læringsopgaver, ekstra kast, supervalg og byttevalg afsluttes først. Terningvisningen følger offline-spillets store terning; kastkontroller ligger ved banen.
- Online-brættets serverregler i `boardgame-engine.js` genbruger `actions.js`, `engine.js` og `adaptive.js`. Ændr ikke offline `app.js` for online-regler. Rumtypen skal bevares ved invitation og genopkobling. 2–6 mennesker, ingen online-CPU. Offlineprofiler/gemninger uploades ikke.

## Kortspil
- Online: vendte kort på den lukkede bunke er synlige for alle via players[].revealed; kun ejeren på tur må flytte dem. Resterende lukkede kort må aldrig offentliggøres. Korttal må ikke brydes mellem cifre.
- Fem talområder, fem kort af hvert tal. En ny midterrække kan kun starte med områdets laveste tal.
- Online fra v0.9.60: nul sekunders pause ved alle placeringer. Seneste udspil forbliver synligt/udfordringsbart, indtil næste kort placeres; kortvending og genvending udskifter ikke udspillet. Fejl i midten bliver liggende indtil udfordring. Ingen tidsstyret automatisk rettelse. Højst én midterrække pr. kortsæt.
- Onlineplacering: færrest æselkort først blandt alle, så færrest talkort og færdigrækkefølge. Ved Send æslet videre er indehaveren af det ene æselkort sidst. Et sidste åbent talkort kan beholdes med turen videre uden genvending; ved flere kort bruges almindelig bunkevending.
- Hvert tryk på online-æselknappen giver et lydsignal til alle enheder, også afsenderen, også uden en mulig straf. Lokal Æsellyd fra bevares. En fejl kan kun straffes én gang; et forældet udspils-ID må ikke ramme en ny spiller.
- Øvrig fri placering: forkerte træk forhindres ikke på forhånd. Et tryk på æselkortet udfordrer, fortryder kun det seneste træk og giver straf. Et korrekt træk straffes ikke.
- CPU-æslet bruger kun lokal regelkode (ingen AI-kald): skal spille sit åbne kort før det vender, opdager andres fejl med ca. 72 %, begår selv fejl i ca. 7 % af valg med mulige ugyldige mål. Justér først efter familietest.

## Spilsider og Talkort
- Spilmenuen viser kun spilvalg; egne adresser `?spil=talstien`, `kortspil`, `talkort` skal kunne genindlæses. Start først spil ved udtrykkelig handling; bevar gemninger ved retur.
- Talkort åbner tavst med kortet øverst og valg nedenunder. Kort, pil og Læs igen aktiverer oplæsning uden særskilt Start. Auto venter på hele dobbeltsproget lyd; genoptag afbrudt tal ved tilbagevenden, og tilbyd retry ved varig lydfejl.
- De gemte MP3-tal 1–100 bevares. Tællingens nul og valgfri slutbesked må efter brugerens ønske bruge den valgte AI-/enhedsstemme. Ingen permanent TTS-cache af fritekst.

## TorskeKlog
- `fish-engine.js` er fælles regelmotor for offline og Worker. 80 talkort, fire af hvert tal i ét 20-talsområde; 7 kort hver ved 2–3 aktive spillere, ellers 5. Få alle efterspurgte kort og spørg igen; efter Fisk trækkes ét kort, og turen går videre, også ved match. Fire ens samles automatisk; delt sejr ved lige mange sæt.
- Onlinevisningen må kun indeholde egen hånd, dammens antal og modstandernes kortantal/sæt. Ingen rå fiskedam eller skjult trukket kort i offentlige hændelser. Genbrug requestId/expectedMove og eksisterende chat/invitation.
- Offline gemmes separat som `aeselklog-torskeklog-v1`. Hånden skjules ved tursskifte og genoptagelse; et trukket kort vises privat før enheden gives videre. Ved online-forlad returneres hånden til dammen; færdige sæt forbliver ude af spillet.

## ÆselKlog 500
- `rummy-engine.js` er fælles offline/Worker-regler. 83 kort: fire af hvert tal i et 20-talsområde og tre æseljokere. 7 kort hver, 2–6 mennesker. Mindst tre kort i sæt; ens sæt højst fire; rækker er fortløbende uden kulører. Mindst to talkort pr. sæt. Jokerens talværdi fastlægges ved nedlægning og flyttes ikke senere.
- Træk før nedlægning og ét afkast afslutter turen; sidste kort kan lukke som afkast eller nedlægning. Ved tagning fra afkastbunken skal det valgte kort bruges i første nedlægning; ellers kan hele optagningen fortrydes før anden handling. Ingen delvise kortflytninger ved fejl.
- Talkort er 5 point, joker 25. Hvert bordkort giver point til kortets ejer, også ved til-lægning til andres sæt. Hånd giver minus. Point bevares mellem runder; højeste score ved mindst 500 vinder (delt sejr tilladt). Rumopretteren starter næste runde.
- Offline gemmes separat i `aeselklog-500-v1`, med skjult hånd ved tursskifte/genoptagelse. Online må kun egen hånd og offentlige afkast/sæt sendes. Genbrug requestId/expectedMove. Ved forlad går hånd til trækbunken, nedlagte kort bliver på bordet.

## Offline-Æsel i TorskeKlog og 500
- `card-cpu.js` må kun vælge ud fra regelmotorens spillervisning: egen hånd og offentlige oplysninger. Ingen læsning af andres hænder/trækbunke og ingen AI-/netværkskald. CPU-pladser gemmes lokalt i `cpuSeats`; gamle gemninger uden feltet er menneskespil.
- 1–5 personer + ét Æsel, højst 6 i alt. I solospil vises kun menneskets hånd, også under Æslets tur. Ved flere mennesker er hænder skjult under CPU-turen. Online har fortsat ingen CPU.
- Automatiske ture går gennem de samme regler som mennesketræk og gemmes efter hvert træk. `local-cpu.js` skal stoppe ved menu/nystart og holde pause ved skjult side eller åben dialog; genoptagelse må ikke give dobbelte ture.

## RegneKlog
- Separat lokalt regnespil via `?spil=regneklog`; `math-engine.js` er ren regne-/pointlogik. Minus er ikke-negativ, division går op uden rest. Sværhedsgradens højeste tal gælder både operander og svar.
- Højst én pointtildeling pr. opgave: 10 uden hjælp, 5 med hjælp, 0 ved vist løsning. Forkerte forsøg trækker ikke point. Vis aldrig løsningen automatisk. Valg gemmes kun i `aeselklog-regneklog-settings-v1`, point gælder det aktuelle forløb.

- Oplæsning af regnestykke, indtastet svar/feedback og hjælp bruger fælles `AeselVoice.sayWithVoice`. Respektér Lyd fra og eksplicit stemmevalg; afbryd gammel tale ved nyt svar/trin, tælling, skjult side og navigation. Navn er valgfrit, og navngivne lydklip må ikke gemmes permanent. RegneKlogs stemmevalg gemmes i samme separate RegneKlog-nøgle.

- Voksenniveauerne i RegneKlog bruger `math-adult.js`, kun hele tal og ingen visuelle objekter (heller ikke under hjælp). Minus må være negativ; division går op. Undgå at allokere gulerødder/lister ud fra voksental. Hjælpen forklarer metoden, og ± understøtter mobilinput. Børneniveauernes grænser/regler bevares.

## Gemte data og privatliv
- Lagernøgler må ikke ændres uden migrering: `aeselklog-igangvaerende-v1` (Talstien, schema 1), `aeselklog-kortspil-v1`, `aeselklog-laereprofiler-v1`. Gamle gemninger skal fortsat kunne læses.
- Alt er lokalt; ingen automatisk cloud-upload af profiler, navne eller lyd. Intet fritekst eller børnenavne i permanent TTS-cache.
- Ingen API-nøgler i GitHub. ElevenLabs-nøglen ligger kun som Cloudflare Secret. `ORIGINAL_VOICE_ID` i `cpuvoice.js` er et offentligt stemme-ID, ikke en nøgle, og må kun vælges automatisk når Cloudflare `/voices` godkender det. Et eksplicit brugervalg bevares altid.

## Lyd
- Kortspil og Talkort bruger udelukkende de 500 gemte MP3'er i `audio/numbers/` (aldrig ElevenLabs eller telefonstemme som reserve). Talstien kan falde tilbage til AI-/telefonstemme.
- Musik er valgfri, slukket som standard, spiller kun i spilvisninger, dæmpes under tale og fungerer offline. Alle spil har topknap og musikmenu; brug de tre eksisterende melodier. Bevar separate offline-musikprofiler i `aeselklog-lydprofiler-v1` og online-musikprofiler i `aeselklog-online-musik-v1`. Musikændringer må ikke afbryde tale. Licenser står i `MUSIC-LICENSES.md`.
- MP3-svar fra service workeren skal kunne tage `Range` (HTTP 206), da Safari kræver det.

## Service worker (`sw.js`)
- Cachenavnet udledes af `VERSION`. Ryd kun caches med præfikset `aeselklog-talstien-`; lydcachen `aeselklog-number-audio-v1` skal bevares ved opdateringer.
- Klon svar (`response.clone()`) før asynkron `cache.put`. Cache aldrig Cloudflare-/ElevenLabs-svar.
- Kode hentes netværk-først med timeout (`NETWORK_TIMEOUT_MS`); billeder og lyd er cache-first. Nye filer, som appen skal bruge offline, skal føjes til `CORE`.

## Læringsterningen
- ?spil=laering genbruger engine.js uden at skrive Talstiens gemte spil eller læringsprofiler. Egne valg i aeselklog-laeringsterning-v1; musik deler board-profilen.
- Børn har ingen tidsfrist. Voksne har valgt tidsfrist (standard 60/30/10 sekunder). Et afgivet svar/timeout afslutter opgaven og vender automatisk tilbage efter feedback og kort resultatvisning. Bevar begge svarmåder og fælles stemmeadapter med cancellation ved navigation/skjult side. Alderstilpasningen er den samme som brætspillets.

- Før/efter-opgaver vises som plus/minus i fælles engine.js. Worker skal genudgives ved ændringer her. Læringsterningens bordside viser kun målgruppe og valgt betjening (terning eller ikoner), med indstillinger/opgaver i dialoger.
