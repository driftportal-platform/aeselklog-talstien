# ÆselKlog Online v0.9.49

Samlet opdatering fra den aktuelle GitHub v0.9.47 (commit 265c1444cb5c9201d4d2e1bc838d199a573e5c83). Pakken inkluderer de kompakte paneler fra v0.9.48 og retter kortflowet efter den seneste præcisering. Du kan installere den oven på v0.9.47 eller v0.9.48. Intet er deployet herfra.

## Sådan virker kortene nu

1. Tryk på din lukkede bunke. Det øverste kort vendes på denne bunke; din åbne bunke ændres ikke endnu.
2. Træk det vendte kort med finger/mus til en bunke, eller tryk på kortet og derefter på målet.
3. Egen åbne bunke: turen går automatisk videre.
4. Modspillers åbne bunke eller midterrække: du kan fortsætte, som i appen.
5. Der er ingen Afslut tur-knap. Oversete placeringer og fejl kan stadig udfordres med æselkortet.

Rum/invitationer, lyd og chat kan foldes sammen. Æselknappen ligger direkte under spillerkortene. 2–6 spillere, 1–5 kortsæt og opretterens valgfri start efter 60 sekunder er bevaret.

## Æsellyd

Den eksisterende donkey-bray.wav genbruges. Lyd udløses, når en udfordring faktisk giver et æselkort. Den virker også i Send æslet videre. Korrekte træk giver ingen straf/lyd; er alle æselkort allerede uddelt i behold-varianten, udløses heller ingen ny æsellyd.
Hver enhed har sin egen Æsellyd til/fra-knap under Lyd og musik. Talestemme og musik har fortsat deres egne indstillinger. Lydhændelsen afspilles kun én gang; F5 skal ikke afspille en gammel straf igen. Browseren forsøges gjort klar til lyd ved første tryk. Autoplay og faktisk æsellyd skal efterprøves på rigtig iPhone/iPad.

## GitHub Desktop

1. Hent nyeste main med Fetch/Pull. Vælg Repository → Show in Explorer.
2. Pak ZIP ud separat. Kopiér indholdet ind i projektmappen, erstat filerne med samme navn, og bevar site/, worker/ og tests/. Slet ingen øvrige filer.
3. Klik i Stifinders adresselinje i projektmappen, skriv powershell, og tryk Enter. Kør:

```powershell
npm.cmd test
```

4. Forvent 39/39 bestået. Kontrollér Changes i GitHub Desktop, skriv fx “Online v0.9.49 – vendt kort og æsellyd”, klik Commit to main og derefter Push origin.

Alle medfølgende filer skal med i GitHub: online.html, online.js, online.css, chat.js, site/online.html, site/online.js, site/chat.js, index.html, sw.js, worker/src.js samt tests og dokumentation.
Billeder, musik, audio/, donkey-bray.wav, online-invite.js og wrangler-konfiguration er eksisterende filer og bevares. Ingen konto-/nøglefiler medfølger.

## Cloudflare – separat opdatering

Åbn PowerShell i projektmappen. Kør først prøvebygning:

```powershell
cd worker
npx.cmd wrangler deploy --dry-run --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Kontrollér GAME_ROOM → GameRoom og APP_ORIGIN. Bevar eksisterende binding og migrationer. Det eksplicitte navn vælger Workeren bag https://aeselklog-online.driftportal-platform.workers.dev; wrangler.jsonc har ellers standardnavnet aeselklog-online-pilot. Brug dit verificerede live-navn, hvis det er anderledes.

Når du vil publicere serverændringen, kør fra samme worker-mappe:

```powershell
npx.cmd wrangler deploy --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

/health skal bagefter vise v0.9.49. Genindlæs begge/alle spilleres sider efter både Pages og Worker er opdateret. Serveropdateringen er nødvendig for at sende æsellydhændelser.

## Prøv efter opdateringen

- Vend kort ved at trykke på egen lukkede bunke. Kontrollér at kortet vises dér og kan trækkes/trykkes til hver måltype.
- Egen åbne bunke skal skifte tur; midten/modspiller skal lade dig fortsætte.
- Lav en fejl og udfordr fra en anden enhed. Kontrollér æselstraf og lyd på hver enhed. Prøv Æsellyd fra på én enhed og F5 uden gentaget straflyd.
- Kontrollér sammenfoldelige paneler, tale, chat, invitationer, flere spillere og 60-sekundersstart.

## Kontrol udført

39/39 Node-tests. Chromium med to og seks isolerede profiler, touch-input og musetræk, foldning, kortflow, lokale lydvalg og én lydhændelse pr. ny straf. Lyd og nettransport er simuleret. Eksisterende offline-/CPU-browsertests og Worker dry-run består. Ingen fysisk iPhone/iPad-test, live-deployment eller beskedafsendelse er udført herfra.
