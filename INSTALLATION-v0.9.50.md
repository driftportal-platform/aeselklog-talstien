# ÆselKlog Online v0.9.50 – afslut spil og begynd igen

Opdatering oven på v0.9.49. Udgangspunkt: GitHub main cb0bb4a92fffc1bb5856f19cf22360ae90b56726, hentet 19. oktober 2026. Intet er publiceret af denne opgave.

## Sådan afslutter I spillet

1. Rumopretteren åbner rum-menuen øverst ved at trykke på Rum og rumkoden.
2. Tryk Afslut spil for alle, og bekræft. Annullér beholder spillet.
3. Alle deltagere får besked om, at spillet er afsluttet. Forbindelsen til det gamle rum lukkes; tale og musik stopper. Gemte sessioner fjernes, så F5 ikke automatisk vender tilbage.
4. Tryk Opret nyt spil. Du kommer til opsætningen, hvor dit navn er bevaret. Opret et nyt rum og del den nye invitation. Der bruges en ny rumkode.

Kun rumopretteren kan afslutte for alle. Andre kan fortsat bruge Forlad på denne enhed; det forlader kun lokalt og afslutter ikke rummet for de andre. Afslut spil for alle kan også bruges, mens I venter, og efter et naturligt afsluttet spil.
Et afsluttet rum afviser gamle invitationer, handlinger og chat. Chat og lydbeskeder i det afsluttede rum ryddes. Lokale lydvalg bevares.

## 1. GitHub Desktop

1. Vælg aeselklog-talstien og hent nyeste main med Fetch/Pull. Vælg Repository → Show in Explorer.
2. Pak ZIP ud separat. Kopiér filerne ind i projektmappen med undermapperne site/, worker/ og tests/. Erstat filer med samme navn; slet ingen øvrige filer.
3. Klik i Stifinders adresselinje i projektmappen, skriv powershell, og tryk Enter. Kør:

```powershell
npm.cmd test
```

4. Forvent 40/40 bestået. Kontrollér Changes i GitHub Desktop, skriv fx “Online v0.9.50 – afslut spil og nyt rum”, klik Commit to main og Push origin.

Webfiler: online.html, online.js, online.css, site/online.html, site/online.js, index.html og sw.js.
Serverkode: worker/src.js (skal også deployes separat).
Tests: tests/online_end_game.test.js og tests/online_end_game_browser.cjs.
Dokumentation: CHANGELOG.md, PROJEKTSTATUS.md og denne vejledning.
Ingen lydfiler, billeder, konto-/nøglefiler eller Cloudflare-konfiguration er ændret.

## 2. Cloudflare

Åbn PowerShell i projektmappen. Kør først:

```powershell
cd worker
npx.cmd wrangler deploy --dry-run --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Kontrollér GAME_ROOM → GameRoom og APP_ORIGIN. Bevar binding og migrationer.
Det eksplicitte navn vælger Workeren bag https://aeselklog-online.driftportal-platform.workers.dev; wrangler.jsonc har ellers standardnavnet aeselklog-online-pilot. Brug dit verificerede live-navn, hvis det er anderledes.

Når du er klar til at publicere serverændringen, kør:

```powershell
npx.cmd wrangler deploy --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

/health skal vise v0.9.50. Genindlæs alle deltagernes sider efter både GitHub Pages og Worker er opdateret. Serverændringen er nødvendig for at afslutte rummet for alle.

## 3. Prøv på to enheder

- Opret et rum og deltag fra den anden enhed. Find Afslut spil for alle hos opretteren; gæsten skal ikke have knappen.
- Prøv først Annullér. Spillet skal fortsætte.
- Bekræft derefter. Begge skal få afslutningssiden, og lyd skal stoppe. Ved reserveopdatering kan den anden enhed modtage beskeden nogle sekunder senere.
- Tryk Opret nyt spil, og kontrollér at det nye rum har en ny kode. Invitér igen.
- Prøv F5 hos den anden deltager: det gamle rum skal ikke genoptages automatisk. Et gammelt invitationslink kan ikke genåbne et afsluttet spil.

## Kontrol udført

40/40 Node-tests inklusive opretteradgang, afslutning før/under/efter spil, afvisning af sene tilmeldinger/handlinger, afslutningsbesked efterfulgt af lukning af sockets og uændret afslutning ved gentagne anmodninger.
Chromium med to profiler dækker bekræftelse/annullering, automatisk besked til den anden spiller, fjernet gammel session, ny rumkode og F5. De øvrige online-browsertests samt offline-/CPU-tests er kørt, og Worker dry-run består. Nettransport, lyd og enheder er simuleret; rigtig iPhone/iPad og live Cloudflare skal prøves efter installation.
