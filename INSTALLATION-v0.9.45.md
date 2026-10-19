# ÆselKlog Online v0.9.45 – vælg antal kortsæt

Opdatering oven på v0.9.44. Bygger på GitHub main 437a9ddac7032e380ffbc3601da436b56605cae3, hentet 19. oktober 2026. Intet er deployet af denne opgave.

## Det nye valg

Under Talområde findes nu Antal kortsæt: 1–5. Ét sæt indeholder ét af hvert tal i det valgte område.

| Sæt | Talkort i alt | Kort til hver spiller |
|---|---|---|
| 1 | 20 | 10 |
| 2 | 40 | 20 |
| 3 | 60 | 30 |
| 4 | 80 | 40 |
| 5 | 100 | 50 |

Standard er fem sæt, som hidtil. Den, der opretter rummet, vælger; deltageren følger rummets valg. Begge ser antallet under rumkoden. Antallet gemmes også ved genopkobling. Opret et nyt rum for at bruge et nyt sætantal. Igangværende spil beholder deres kort.

## 1. Kopiér filerne og Push fra GitHub Desktop

1. Åbn GitHub Desktop, og vælg aeselklog-talstien. Vælg Repository → Show in Explorer. Det åbner din projektmappe.
2. Hent nyeste main med Fetch/Pull, og pak ZIP-filen ud i en separat mappe.
3. Kopiér ZIP-pakkens indhold ind i din projektmappe. Erstat filer med samme navn, og bevar undermapperne site/, worker/ og tests/. Slet ikke andre filer.
4. Klik i projektmappens adresselinje i Stifinder, skriv powershell, og tryk Enter. Kør:

```powershell
npm.cmd test
```

5. Forvent 35/35 bestået. Gå tilbage til GitHub Desktop, kontrollér Changes, skriv fx “Online v0.9.45 – vælg kortsæt” som Summary, klik Commit to main og derefter Push origin.

GitHub Pages-filer: site/online.html, site/online.js, online.html, online.js, index.html og sw.js.
Serverkode: worker/src.js. Den skal også i GitHub, men kræver separat Cloudflare-deployment.
Tests/dokumentation: alle medfølgende filer i tests/ samt CHANGELOG.md, PROJEKTSTATUS.md og denne vejledning skal også med.
Ingen lydfiler, konto-/nøglefiler eller Cloudflare-konfiguration er ændret.

## 2. Cloudflare skal opdateres separat

Valget virker først fuldt ud, når både hjemmesiden og Worker er opdateret. GitHub Push opdaterer ikke Worker i sig selv.

Åbn projektmappen som ovenfor, skriv powershell i adresselinjen, og kør først:

```powershell
cd worker
npx.cmd wrangler deploy --dry-run --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

Kontrollér GAME_ROOM → GameRoom og APP_ORIGIN. Brug den eksisterende Worker bag https://aeselklog-online.driftportal-platform.workers.dev. Konfigurationsfilens standardnavn er aeselklog-online-pilot; det eksplicitte --name ovenfor vælger live-Workerens navn fra den oplyste adresse. Hvis dit verificerede live-navn er et andet, brug det i begge kommandoer. Bevar eksisterende Durable Object-binding og migrationer.

Når du vil publicere serverændringen, kør fra samme worker-mappe:

```powershell
npx.cmd wrangler deploy --name aeselklog-online --keep-vars --var APP_ORIGIN:https://driftportal-platform.github.io
```

/health skal bagefter vise v0.9.45. Genindlæs hjemmesiden på begge enheder, opret et nyt rum med ét sæt, og deltag fra den anden enhed: hver spiller skal starte med 10 lukkede kort. Prøv derefter fem sæt: hver skal starte med 50. Kontrollér også F5/genopkobling.

## Kontrol udført

35/35 Node-tests; alle 25 kombinationer af talområde og kortsæt, ugyldige valg, gamle rum uden sætantal, gemning og begge spilleres status. Chromium med mobil-/desktopprofiler tester det faktiske oprettelsesvalg, uddeling, visning og F5 sammen med de eksisterende onlineforløb. Eksisterende Python/Playwright-tests for offlinekortspil og CPU er kørt. Wrangler dry-run med GAME_ROOM og APP_ORIGIN består.

Browsernes transport, mikrofon og afspilning er simuleret. Der er ikke kørt en fysisk iPhone-test eller deployet til den aktive Cloudflare-server herfra.
