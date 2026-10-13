# ÆselKlog Talstien – v0.8-B.1 (automatisk AI-stemme og stemmevalg)

**App:** https://driftportal-platform.github.io/aeselklog-talstien/  
**Repository:** https://github.com/driftportal-platform/aeselklog-talstien

## Nye funktioner i v0.8-B.1

- Appen kender nu den offentlige **Cloudflare Worker-adresse** i koden. Der er **ikke længere et adressefelt**, og API-nøglen er stadig kun gemt som Secret hos Cloudflare.
- Nye installationer foreslår **AI-stemme med Mia** som standard. Tidligere valgte indstillinger på enheden respekteres.
- Under **🎙️ Indstil æslets stemme** kan man vælge mellem tilgængelige AI-stemmer, prøve stemmen og gemme valget.
- Flere danske AI-stemmer indlæses fra Cloudflare `/voices`, hvis din ElevenLabs API-nøgle må læse stemmelisten, eller hvis ekstra stemmer er angivet i Worker-konfigurationen.
- Der er fortsat mulighed for **telefonens danske stemmer**, som også virker offline.
- Hvis ElevenLabs er utilgængelig, bruges telefonstemmen automatisk. Den ægte æsellyd ved forkert svar bevares.
- Hele spiloplevelsen fra **0.8-B** (fuldskærmsplade, CPU, terninger, voksne/børn, opgaver) er uændret.

## Sådan får du ændringerne i drift

**1. Opdatér Cloudflare først (anbefalet).** Brug pakken `AeselKlog_Cloudflare_Stemmer_v0.8-B.1.zip`, **ikke GitHub-appen**. Udpak lokalt i din Worker-mappe og erstat `worker.js` og `wrangler.jsonc`. Kontrollér at `wrangler.jsonc` indeholder korrekt Worker-navn og `ALLOWED_ORIGIN`. Kør derefter i PowerShell:

```powershell
npx.cmd wrangler deploy
```

Den samme Worker bruges som før: `aeselklog-mia-stemme-test.driftportal-platform.workers.dev`. Din eksisterende `ELEVENLABS_API_KEY` og `ELEVENLABS_VOICE_ID` skal fortsat ligge som *Secrets* hos Cloudflare; læg dem **aldrig** i projektets filer. Hvis `/health` ikke viser `klar` efter deploy, så kontrollér Secrets og bindings i dashboardet.

**2. Opdatér appen.** Upload indholdet af dette ZIP-arkiv til roden af det eksisterende GitHub-repository, og erstat filer med samme navn. Workerkoden skal **ikke** uploades til GitHub.

**3. Prøv en stemme.** Åbn spillet → **Indstil æslets stemme** → vælg **AI-stemme** og **Mia** eller en anden tilgængelig stemme → **Prøv valgt stemme**. Intet adressefelt er nødvendigt. Vælg **Telefonens stemme** hvis du hellere vil bruge de lokale danske stemmer.

## Hvis der kun vises Mia

Det er forventeligt, hvis ElevenLabs API-nøglen kun har tilladelse til at generere tale (Text to Speech).

- I ElevenLabs: vælg andre stemmer under **Voices → Explore**, helst med **Danish** som sprog, og tilføj dem til **My Voices**.
- Giv API-nøglen **Voices: Read**-tilladelse, hvis ElevenLabs tilbyder at redigere den eksisterende nøgle. Hvis ikke, opret en ny begrænset nøgle med både Text to Speech og Voices: Read, og **udskift nøglen som Cloudflare Secret** (aldrig i chat eller GitHub).
- Tryk **↻ Opdater stemmer** i ÆselKlog. Workerens liste opdateres med få minutters mellemrum.
- Alternativt: Skriv de ekstra stemmers ID og navn ind i `ELEVENLABS_EXTRA_VOICES` i den separate Worker-konfiguration. Format og eksempel findes i Worker-pakkens README.

Andre stemmer kan være engelsksprogede eller internationale; afprøv udtalen på dansk før brug med børn. Nogle Voice Library-stemmer kan kræve betalt plan.

## Sikkerhed, forbrug og tests

- `https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev/tts` er en **offentlig URL, ikke en hemmelighed**. Kun **API-nøglen** skal være hemmelig.
- Workeren indeholder stadig rate-limit-bindings. Origin/CORS alene er **ikke adgangskontrol**; behold en lav ElevenLabs-creditgrænse for denne offentligt tilgængelige prototype.
- Brugerens kaldenavn kan indgå i tekst, der sendes til ElevenLabs. Brug helst kaldenavne for børn.
- ✅ Testet lokalt i Chromium: automatisk adresse, 2 simulerede AI-stemmer, stemmevalg, lagring, telefonstemme og mobilens fuldskærmsbræt.
- ✅ Worker testet med simulerede ElevenLabs-svar for Mira/Mia, andre godkendte stemmer, forkerte valg, Origin/CORS og opkald.
- ⚠️ **Selve ElevenLabs-integrationen er ikke live-testet på din konto**. Test den på din iPhone efter begge opdateringer.

## Videre udvikling

Læs altid [UDVIKLINGSPLAN.md](./UDVIKLINGSPLAN.md) og [AGENTS.md](./AGENTS.md), før der arbejdes videre. Næste planlagte spilfase er **v0.8-C: flere actionfelter**.
