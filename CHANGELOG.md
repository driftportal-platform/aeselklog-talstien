# ÆselKlog – changelog

Nyeste øverst. Én kort post pr. version. Detaljer, testresultater og filoversigter for ældre versioner
findes i `docs/arkiv/`. Versioner uden post (fx 0.9.21, 0.9.26 og 0.9.37–0.9.43) var ikke dokumenteret separat. Den lange udgave af changelogget
(v0.9.61) ligger i `docs/arkiv/CHANGELOG-v0.9.61-lang.md`.


## v0.9.83 – regn ved at trykke og tælle med (22. oktober 2026)
- Alle fire regnearter har interaktive gulerødder. Plus flytter nye gulerødder til samlingen; minus fjerner valgte gulerødder med mulighed for at lægge dem tilbage; gange fylder lige store kurve; division fordeler én ad gangen uden skæv deling.
- Efter placering/fjernelse kan Tæl med fremhæve og nummerere én gulerod ad gangen, med valgfri dansk oplæsning fra de eksisterende talelyde. Division tæller én kurv. Nul vises som ingen tilbage; der afspilles ingen MP3 for nul.
- Store trykfelter, tastaturbetjening, nulstil billeder, stop tælling og reduceret bevægelse. Tælling stoppes ved menuside, nye opgaver og skjult side; manglende lyd fortsætter visuelt. Rene regnestykker bevares, billeder kan åbnes med Hjælp.
- Tæl med regnes som hjælp (5 point ved rigtigt svar). Manipulation alene giver ikke hjælpfradrag; svaret indtastes og kontrolleres fortsat af barnet. Ingen automatisk pointtildeling.
- 65/65 Node-tests samt Chromium-prøver af tryk/fortryd, deling, nul, lydenes rækkefølge, lydfejl, stop ved navigation, store tal og mobil-layout. Eksisterende RegneKlog-forløb og lokal HTTP/PWA-offline prøvet. Ingen fysisk telefonprøve. Kun GitHub; Worker uændret.

## v0.9.82 – RegneKlog med billeder, hjælp og point (22. oktober 2026)
- Nyt selvstændigt offline-regnespil via spilmenuen og `?spil=regneklog`. Plus, minus, gange og division kan vælges enkeltvis eller blandes. Let: op til 10; mellem: 20; svær: 100. Ingen negative resultater eller division med rest; tabeller op til 10.
- Visuelt med fælles gulerodsikon, tierammer, overstregning, lige store grupper og deling i kurve. Alternativt rene regnestykker. Hjælp i to trin kan altid åbne billeder; løsningen vises kun efter eget valg.
- 5, 10 eller 20 opgaver. 10 point for rigtigt uden hjælp, 5 med hjælp, 0 ved vist løsning. Ubegrænsede forsøg, ingen tidspres eller pointtab; afslutning med samlet pointoversigt. Valg gemmes separat lokalt; point gælder ét forløb.
- Alle nye filer og ikon er med i offlinecachen. Ikonrettelsen fra v0.9.81 bevares. Forsidens artwork, de øvrige gemninger og Worker v0.9.78 ændres ikke.
- 64/64 Node-tests; browserprøver af alle 12 regneart/niveau-kombinationer, komplette pointforløb, ren talvisning/hjælp, navigation, 320–1280 px samt reel lokal HTTP/PWA-offline. Eksisterende spilsider og responsive menu prøvet. Ikke prøvet på fysisk telefon og ikke publiceret herfra.

## v0.9.81 – ens ikonstørrelse i spilmenuen (22. oktober 2026)
- TorskeKlog og 500 bruger samme ikonramme og responsive størrelse som de øvrige spil. Ikonerne overlapper ikke længere teksten på mobil.
- Valideret: 63/63 Node-tests, ikonmål og ingen overlap ved 320/390/768/1280 px i Chromium samt eksisterende responsive spilmenuprøver. Ingen fysisk telefonprøve.
- Kun GitHub; Worker og spilleregler er uændrede.

## v0.9.80 – Spil mod Æslet offline i TorskeKlog og 500 (21. oktober 2026)
- Nyt Spil mod Æslet-valg: én person alene mod Æslet eller op til fem personer og Æslet. Æslet er ekstra spiller; højst seks i alt. Automatisk spørgen/fiskeri i TorskeKlog og træk, afkastoptagning, sæt, til-lægning og afkast i 500.
- Lokal strategi bruger kun egen hånd og offentlige oplysninger. Æslets hånd vises aldrig. Solospilleren beholder sin egen hånd på skærmen; flere mennesker bruger privat håndoverdragelse.
- CPU-valg og ture bevares i separate eksisterende gemninger. Timeren pauser ved skjult side/regler/dialog og annulleres ved menu/nystart. Gamle menneskespil fortsætter som før.
- 63/63 Node-tests, herunder 20 komplette Fisk-spil og fem 500-kampe med 2–6 pladser gennem CPU-strategien. Browserprøvet solo/flere mennesker, skjulte kort, regelsidepause, stop/genoptag og reel PWA-offline. Kun GitHub; online og Worker v0.9.78 bevares.

## v0.9.79 – reglerknapper i TorskeKlog og 500 (21. oktober 2026)
- Tydelig Regler-knap både før start og under spillet i de to offline- og onlineudgaver. Fælles læsevenligt vindue med fulde regler, point, turforløb og forlad; Luk, Escape og rulning på mobil.
- Reglerne ligger uden for spillebordets genoptegning, så onlineopdateringer ikke lukker dem. Åbning/lukning flytter ingen kort og viser ikke private hænder. Det tidligere indlejrede 500-regelfelt erstattes af knappen.
- 62/62 Node-tests samt browserprøve af begge offline-spil og onlineklienter ved 320 px, inklusive genopkobling mens reglerne er åbne. PWA-offline kontrolleret. Kun GitHub; Worker v0.9.78 bevares.

## v0.9.78 – ÆselKlog 500 offline og online (21. oktober 2026)
- Nyt 500-spil i samme design som de øvrige spil: 2–6 spillere, talkort uden kulører, tre æseljokere, ens sæt og talrækker, træk/afkast og til-lægning til eksisterende sæt. Talområde 1–20 som standard; øvrige 20-talsområder kan vælges.
- Afkastbunken kan tages fra et valgt kort; det skal bruges straks. Optagning kan lægges helt tilbage, før andre handlinger. Jokeres værdi fastholdes. Fejl ændrer ingen kort.
- Automatisk plus/minus ved rundens slutning, ejerpoint for til-lægning, score på tværs af runder, ny runde og sejr ved 500 point. Uafgjort giver delt sejr. Tom trækbunke genbruger ældre afkast; uden mulighed for træk afsluttes runden.
- Offline: privat håndoverdragelse og separat gem/fortsæt. Online: privat hånd, invitation, chat/lyd, idempotente træk, genopkobling, Forlad og Afslut. Afgående hånd returneres til trækbunken; bordkort bliver liggende.
- Fælles regelmotor, visning og spilmenuikon. 62/62 Node-tests inklusive komplette kampe med 2–6 spillere frem til 500; browserprøve af tre onlineklienter og offline runde/point/afkast. PWA-offline og Worker dry-run kontrolleret; ingen deployment eller fysisk telefonprøve herfra. Både GitHub og Cloudflare opdateres.

## v0.9.77 – TorskeKlog offline og online (21. oktober 2026)
- Nyt selvstændigt Fisk-spil med talkort: 2–6 spillere, fem talområder, fire af hvert tal, 7/5 kort på hånden, fiskedam, fire ens, fortsat tur efter modtagne kort og næste tur efter fiskeri. Tomme hænder genopfyldes fra dammen; delt sejr understøttes.
- Offline: privat håndoverdragelse på samme enhed, privat visning af fisket kort og separat gem/fortsæt. Tal læses med de eksisterende gemte MP3'er og respekt for Lyd fra.
- Online: nyt spilvalg, invitation/rumkode, kun egen hånd fra serveren, eksisterende chat/lyd, genopkobling, requestId/expectedMove, Afslut og Forlad. Afgående hånd returneres til dammen; færdige sæt bevares i kortregnskabet.
- Fælles fisk-/æselikon, fælles DOM-visning og regelmotor. Service worker cacher nye offline-filer. Talkort-menuerne fra v0.9.76 er med.
- 60/60 Node-tests: 60 komplette lokale regelsimulationer og komplette Worker-spil med 2–6 spillere. Browserprøve af offline + tre onlineklienter, invitation, genindlæsning, forlad og faktisk lokal HTTP/PWA-offline. Worker bundler med Wrangler dry-run; ingen publicering eller fysisk telefonprøve herfra. Både GitHub og Cloudflare skal opdateres.

## v0.9.76 – samlede Talkort-menuer (21. oktober 2026)
- Talkort har fire lukkede menuer under kort/pile: Talområde, sprog og stemme (inkl. pause), Automatisk oplæsning, Tæl op eller ned, Øv min udtale.
- Stop, prøv igen og kørestatus står uden for menuerne, så et forløb kan stoppes selv med indstillingerne foldet sammen. Sammenfoldning ændrer ikke valg eller afbryder lyd.
- 58/58 Node-tests samt browserprøve på mobil/pc-størrelser af menuer, valg, tælling/Auto og Stop. Ingen Worker-ændring.

## v0.9.75 – fælles spilikoner og roligere opsætning (21. oktober 2026)
- Talstien og Kortspil bruger spilmenuens respektive æselikoner og én hovedoverskrift: ÆselKlog - Talstien / ÆselKlog - Kortspil. Ekstra overskriftsbjælker og kortspillets intro fjernes; Spilmenu bevares.
- Kortspillets kort-/regel-/strafvalg og avancerede CPU-valg foldes ud som på Talstien. Spillere og Start er synlige. Talkorts talområde, sprog og stemme samles også i et lukket indstillingsfelt.
- Browserprøver ved mobil/pc-størrelser kontrollerer ikoner, overskrifter, indstillingsvalg og start/gem/fortsæt. 58/58 Node-tests. Kun GitHub; Worker uændret.

## v0.9.74 – stabil sammenhængende talelyd (21. oktober 2026)
- Auto og tælling genbruger samme MP3-afspiller, så mobilbrowseren ikke skal godkende et nyt lydelement for hvert tal/sprog. Første afspilning starter direkte fra brugertrykket uden unødigt asynkront mellemtrin.
- Afslutning kontrolleres også via lydens slutposition, hvis browserens ended-besked udebliver. En fastlåst play-promise har timeout; timere og gamle hændelser ryddes ved stop/fejl. Begge sprog afsluttes før næste tal.
- Regressionstest fremkalder fejl med v0.9.73 og består med rettelsen. 58/58 Node-tests samt simulerede browserprøver af Auto/tælling, afbrydelse og slutstemme. Fysisk iPhone-afprøvning mangler. Kun GitHub; ingen Worker-ændring.

## v0.9.73 – egne spilsider og tælling i Talkort (21. oktober 2026)
- Menuen viser kun fire spilvalg. Talstien, Kortspil og Talkort får egne adresser, indstillinger/Start og Spilmenu tilbage. Browsertilbage, genindlæsning og online-linket understøttes; Talstiens indstillinger er samlet på dets side. Gem/fortsæt bevares.
- Talkort viser kortet først, derefter kontroller og valg. Indgang/indstillinger er tavse; kort, pil eller Læs igen læser uden særskilt Start.
- Tæl ned fra valgt 0–100-tal til 0 eller op fra start til valgt sluttal. Pause 0,1–60 sekunder, begge sprog færdige før næste tal, valgfri sluttekst (350 tegn) og stemme fra den eksisterende stemmeliste.
- Auto forsøger samme tal igen ved kort lydfejl; varig fejl pauser med retryknap i stedet for at afslutte. Skjult side pauser, og et afbrudt dobbeltsproget tal læses færdigt igen ved retur. MP3-afspilning har timeout og rapporterer afbrydelse til tællingen.
- 1–100 bruger fortsat de 500 gemte MP3'er. Nul og sluttekst bruger den valgte stemme (AI eller enhed); AI-sluttekst går til den eksisterende stemmetjeneste uden permanent cache af fritekst.
- 57/57 Node-tests; Chromium-prøver af separate sider, gem/fortsæt, offline PWA, tælling/begge sprog, fejl/retry, valgt slutstemme og tavs indgang. Ægte lyd/mikrofon og iPhone skal fortsat prøves fysisk. Kun GitHub-opdatering; Cloudflare-koden er uændret.

## v0.9.72 – varieret fortæller og hoppende onlinebrikker (20. oktober 2026)
- Online Talstien genbruger offline-spillets narration.js: cirka 35 % af indledende Hov hov-hilsner beholdes, resten går direkte til beskeden. Hov hov-specialfeltet og andre omtaler inde i teksten bevares. Hør igen gentager den faktisk læste tekst.
- Brikker hopper felt for felt på alle enheder, inklusive landing og efterfølgende bevægelse frem/tilbage. Den lokale animation venter på, at den store terning lukkes. Gentagne statusopdateringer starter ikke animationen forfra; genindlæsning og reduceret bevægelse viser den aktuelle serverposition direkte.
- 55/55 Node-tests og simulerede browserforløb for frem/tilbage, polling, genindlæsning, reduceret bevægelse, talevariation og digitale kast. Serverregler og Worker ændres ikke. Kun GitHub Pages skal opdateres; ikke prøvet på fysisk iPhone herfra.

## v0.9.71 – Kast over banen, læselige felter og rigtige navne (20. oktober 2026)
- Online Talstien har en firkantet terningknap med teksten Kast øverst til højre over banen. Digital terning/læringsterning åbner fortsat den store visning; fysiske kast beholder deres talvalg.
- Feltforklaringer folder ud i fuld bredde mellem værktøjer og bane, uden den tidligere popup der blev afskåret på mobilen. Kontrolleret ved 320/390/768/1366 px.
- Efter brugerens ønske læser AI-stemmen de indtastede spillernavne som offline. Navnene indgår dermed i TTS-teksten til den eksisterende stemmetjeneste. Lydklip ligger kun midlertidigt i RAM og gemmes ikke permanent.
- 55/55 Node-tests, simulerede browserprøver af placering, alle ni feltforklaringer, digitale/fysiske kast og navne i TTS-payload. Ikke prøvet med ægte AI-lyd/fysisk iPhone herfra. GitHub og Worker skal opdateres; pakken bevarer v0.9.69–70.

## v0.9.70 – samme stemmevalg online og offline (20. oktober 2026)
- Online Talstien har AI-/telefonstemmevalg, samme /voices-stemmeliste og /tts-endpoint som offline Talstien, med Mia og ÆselKlog-original når den godkendes af stemmetjenesten. Prøv valgt stemme og Opdater stemmelisten findes i lydindstillingerne.
- Onlinevalget gemmes på enheden og arver offline-stemmeindstillinger ved første brug. Skift af stemme afbryder gammel lyd. Fejl bevarer det valgte ID og bruger telefonstemmen midlertidigt; musikken dæmpes under afspilning. Talkort/kortspil bruger fortsat deres gemte MP3-stemmer.
- Faktiske spillernavne erstattes med spillernumre inden TTS. Ingen ny API-nøgle i klienten, ingen permanent cache af navne/opgaver; højst 24 anonyme klip i RAM.
- 55/55 Node-tests samt simulerede browserprøver af original/anden stemme, korrekt valgt ID, cache, genindlæsning, midlertidig reserve, anonymiseret tekst og telefonstemme. Ægte ElevenLabs-lyd/iPhone-autoplay er ikke testet herfra. GitHub og Worker skal opdateres (pakken omfatter også v0.9.69).

## v0.9.69 – fortællerstemme i online Talstien (20. oktober 2026)
- Alle deltagere får talebeskeder om kast/felt, tur, de ni specialfelter, opgaver, tip, rigtige svar, bytte og sejr. Tekster genbruger offline-spillets forklaringer; brætspillets regler og automatiske turskift ændres ikke. Eksisterende æsellyd ved fejl bevares.
- Dansk enhedsstemme, egen Tale til/fra, Hør beskeden igen og dæmpet musik under tale. Ingen nye eksterne stemmekald eller upload af navne. Talbeskeder køres i en begrænset kø; skjulte faner/chatoptagelse afbryder tale.
- Serveren gemmer op til 32 talebeskeder med stigende ID. Klienten undgår gentagelser ved polling/genopkobling og afspiller ikke gamle felthændelser efter genindlæsning. En ny tilslutning får kun den aktuelle tur/opgave.
- 55/55 Node-tests og simulerede Chromium-forløb med tre enheder (tur, felt, opgave, tip, ros, lokal mute og genindlæsning). Worker dry-run består. Rigtig stemme/autoplay på fysisk iPhone/iPad kræver fortsat prøve. GitHub Pages og Cloudflare skal opdateres; ikke publiceret herfra. Én aktuel INSTALLATION.md fremover.

## v0.9.68 – genopkobling og sikre gentagelser (20. oktober 2026)
- Onlineklienten afbryder hængende forespørgsler efter 4,5 sekunder, tillader kun én statusforespørgsel ad gangen og begrænser genforsøg. WebSocket-genforsøg venter højst fem sekunder. Tydelig besked øverst ved HTTP-udfald; status hentes automatisk igen.
- Hvert nyt træk får et requestId og forventet revision. Worker gemmer kvitteringen sammen med trækket, afviser forældede nye træk og genkender gensendelser også efter en genstart eller en udfordring. En usikker handling gemmes lokalt og afklares før næste træk. Serveren offentliggør kun egne kvitterings-ID'er, aldrig andres payloads.
- 54/54 Node-tests samt simulerede browserforløb med tabt svar efter servercommit, fejl før afsendelse, hængende status, kortregnskab og automatisk genopkobling. Kort- og brætspilsforløb og Worker dry-run består. Årsagen til familiens konkrete udfald er ikke fastslået; ingen live Worker-/fysisk iPhone-test herfra.
- GitHub Pages og Cloudflare skal opdateres sammen; klienten kræver den nye Worker for at sende spiltræk. Pakken bevarer også v0.9.67. Bygger på senest verificerede GitHub main 983a204 + lokal v0.9.67; ikke publiceret automatisk.

## v0.9.67 – stor terning og automatisk tur online (20. oktober 2026)
- Talstien online bruger offline-spillets store æselkort og terning med prikker, læringssymboler og hoppeanimation. Kast-knap, fysiske kast og opgaver ligger lige under spillepladen.
- Næste spiller-knappen er fjernet. Worker gemmer en frist og skifter automatisk efter 1,8 sekunders resultatvisning, også uden den aktive spillers browser. Vandpytter springes automatisk over; opgaver, ekstra kast, super- og byttevalg afsluttes først. Sejr afslutter stadig runden.
- 53/53 Node-tests; simulerede browserforløb for fysiske/digitale terninger, læringsopgaver, 3/6 enheder og mobil/liggende visning. Worker dry-run består. Bygger på main 983a204. GitHub Pages og Cloudflare skal opdateres; ikke publiceret eller prøvet på fysisk iPhone/iPad herfra.

## v0.9.66 – forlad begge online spil (20. oktober 2026)
- Ny Forlad-knap til deltagere i toppen; rumopretteren kan forlade via indstillinger eller afslutte for alle fra toppen. Alle andre får navnet på spilleren, der forlod spillet.
- Mindst to tilbage fortsætter. Talkort, inklusive et vendt kort, fordeles rundt i bunden af de resterendes lukkede bunker uden omblanding. Æselkort returneres til puljen i begge varianter. Talstien springer den forladte spiller over, og værtens rolle overdrages ved behov.
- En tilbage i en startet runde afslutter rummet; en lobby med én kan fortsat invitere. Kortregnskab og stabile sædeindekser bevares; gamle udfordringer nulstilles ved afgang.
- 52/52 Node-tests samt simulerede browserforløb i begge spil og Worker dry-run. Bygger på main 2318348. GitHub Pages og Cloudflare skal opdateres. Ikke publiceret eller prøvet på fysisk iPhone/iPad herfra.

## v0.9.65 – hele tal på kortene og synlige vendte kort (20. oktober 2026)
- Talkortenes cifre kan ikke brydes over flere linjer. To-/trecifrede tal tilpasses de kompakte spillerkort; 20, 80 og 100 er kontrolleret ved 2/6 spillere og 320–1366 px.
- Alle deltagere ser det aktuelle vendte kort oven på spillerens lukkede bunke, også efter genindlæsning. Kun ejeren på tur kan vælge/flytte kortet. Øvrige lukkede kort og spillerhemmeligheder forbliver skjulte. Placering fjerner visningen af det vendte kort og viser kortet på målet.
- Worker sender det offentlige felt players[].revealed; det eksisterende pending-felt er fortsat kun til den aktive spiller. Kortregnskab, bunkeorden, tur og regler ændres ikke. Både GitHub Pages og Cloudflare Worker skal opdateres.
- 51/51 Node-tests; simulerede browserkontroller af flere enheder, kortplacering og genindlæsning; Worker dry-run består. Bygger på main 838dbae. Ikke publiceret og ikke prøvet på fysisk iPhone/iPad herfra.

## v0.9.64 – fast spilvalg og Start i Talkort (20. oktober 2026)
- Én fælles menu med Talstien, Kortspil, Talkort og Online vises i alle lokale opsætninger. Valgene flyttes ikke mellem forskellige menuer; overflødige Spilmenu-knapper i Kortspil/Talkort-opsætning er skjult.
- Online fra Spil-menuen viser altid Kortspil og Talstien først. Et eksisterende rum kan vælges med Genoptag dit online-spil; genindlæsning inde i et rum genoptager som hidtil. Spilmenu-linket online har knapramme og mindst 44 px trykflade.
- Talkort er stille ved åbning, indstillingsændringer og genåbning. Start talkort sætter oplæsningen i gang; Nulstil kræver igen Start. Næste, gentagelse, Auto og optagelse er først aktive efter Start.
- 50/50 Node-tests og relevante simulerede Chromium-/offline-PWA-forløb består. Opryddet main 615d1a8, fælles assets og Worker er bevaret; ingen Cloudflare-opdatering. Ikke publiceret eller prøvet på fysisk iPhone/iPad herfra.

## v0.9.63 – invitationstekst, spilmenu og fælles æselikoner (20. oktober 2026)
- Invitation og deling har rumkoden som separat tekstlinje, også til Messenger. Tydelig kopiering af koden hos både afsender og modtager. Rumkodefeltet kan finde koden i en hel indsat invitationsbesked eller et invitationslink; manuel markering bruges, hvis udklipsholderen er blokeret.
- Spilmenu vender tilbage til valg af spil, og opretterens Afslut-knap står øverst mellem tilbage og indstillinger. Samme afslutningsbekræftelse og lukning for alle bevares; gæster får ikke opretterknappen.
- Den fælles assets-mappe fra v0.9.62 følger med: 44 SVG-ikoner og fælles kortbilleder til offline/online. De to spilvalg har nu æselillustrationer fra det eksisterende kortmotiv. Alt er med i PWA-cachen.
- 50/50 Node-tests og simulerede Chromium-forløb, inklusive kopiering/deling, fuld beskedindsætning, topknap ved 320 px, menu/genoptagelse, begge onlinespil og reel lokal offline-cache. Rigtig Messenger/iPhone/iPad er ikke afprøvet. Bygger på det opryddede main 2acf15c; Worker og opryddede arkiver er bevaret. Ingen Cloudflare-opdatering eller publicering herfra.

## v0.9.61 – Talstien som online-brætspil (19. oktober 2026)
- Online-menuen vælger mellem Kortspil og Talstien. Serverstyret bondegårdsbane for 2–6 mennesker (genbruger `actions.js`, `engine.js`, `adaptive.js`): alle talområder, samme specialfelter, serverafgjort digital terning eller indtastet egen, frivillig superopgave, byt og vandpyt, Leg/Lær/Udfordring/Tabeller og voksenur på serveren.
- Ingen online-CPU og ingen import af offlineprofiler. 49/49 Node-tests; simuleret Chromium (3–6 enheder), ikke fysiske telefoner.

## v0.9.60 – online: frie træk og æselkort først (19. oktober 2026)
- Ingen pauser. Seneste udspil forbliver udfordrings­bart til næste placering. Rangering: færrest æselkort først, så færrest talkort og færdigrækkefølge; ved én æselvariant ender indehaveren sidst. Offlinekortspillet er uændret.

## v0.9.59 – æselstemme i online-taloplæsning (19. oktober 2026)
- Dansk – æselstemme i online-valget Sprog og stemme (de eksisterende MP3'er i `audio/numbers/donkey`). Valget gemmes lokalt.

## v0.9.55–v0.9.58 – online-midterbunkens regler (19. oktober 2026)
- Flere justeringer af rækkefølgekrav (fortløbende tal fra områdets første til sidste) og pauser (5 s → 2/3 s). Erstattet af den endelige regel i v0.9.60 (ingen pauser).

## v0.9.54 – synligt kortregnskab (19. oktober 2026)
- Vendte kort tælles særskilt; samlet regnskab (spillere + midten, forventet 20 × kortsæt); indhold i midterbunker vises.

## v0.9.53 – sidste kort og vending (19. oktober 2026)
- Sidste vendte kort bliver på egen lukkede plads; "Vend åben bunke" er et separat tryk.

## v0.9.52 – større chat og prik (19. oktober 2026)
- Chat med nyeste øverst; musik holder pause under mikrofonoptagelse; prik til en bestemt spiller.

## v0.9.51 – kompakt spillebord (19. oktober 2026)
- Vandret spillerrække med midterbunker nedenunder; tandhjul samler indstillinger, invitationer, lyd og afslutning; flydende chat og æsellyd.

## v0.9.50 – afslut rummet (19. oktober 2026)
- Opretteren kan afslutte rummet for alle; serveren gemmer status og lukker forbindelserne.

## v0.9.49 – vending på egen bunke (19. oktober 2026)
- Kortet vendes oven på egen lukkede bunke og bliver dér; flytning til egen åbne bunke afslutter turen; æsellyd.

## v0.9.48 – foldbare paneler (19. oktober 2026)
- Rum/lyd/chat kan foldes; kort lægges direkte i åben bunke.

## v0.9.47 – start uden de sidste (19. oktober 2026)
- Opretteren kan starte efter 60 sekunder med mindst to tilmeldte; serveren styrer tiden.

## v0.9.46 – 2–6 online-spillere (19. oktober 2026)
- Rumkode, lige uddeling, turrækkefølge, begge æselkortvarianter og podium.

## v0.9.45 – 1–5 kortsæt (19. oktober 2026)
- Opretteren vælger 20–100 talkort; serveren validerer valget.

## v0.9.44 – første online-udgave af chat, tale og æselkort (19. oktober 2026)
- CORS, MIME-type på lydklip og WebSocket-videresendelse rettet; alle vendte kort vises som ventende, så tale og udfordringer følger offlinekortspillet.

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
