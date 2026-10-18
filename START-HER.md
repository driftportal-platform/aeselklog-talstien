# ÆselKlog Online – første tekniske pilot

Dette er **en selvstændig prototype**, ikke en færdig multiplayer-integration i det eksisterende kortspil. Den kræver en Cloudflare Worker med Durable Objects og to nye filer i GitHub Pages. De 500 MP3-lyde skal ikke gen-uploades.

## 1. Deploy serveren (Cloudflare)

På din egen computer med Node.js installeret:

```bash
cd worker
npm install -g wrangler
npx wrangler login
npx wrangler deploy
```

`worker/wrangler.jsonc` bruger en SQLite-backed Durable Object `GameRoom` til hvert spil. Afhængig af Cloudflare-plan og kontokonfiguration kan Durable Objects kræve Workers Paid eller konfigurationsændringer; gennemgå Cloudflares aktuelle prisside. Workeren oprettes som **aeselklog-online-pilot**, separat fra ElevenLabs-workeren.

**Efter deploy** i Cloudflare Workers → aeselklog-online-pilot → Settings → Variables and Secrets: tilføj almindelig variabel:

- `APP_ORIGIN` = `https://driftportal-platform.github.io`

Deploy ændringen. Indstillingen begrænser kald til din GitHub Pages-side. Det er ikke en brugergodkendelse; deltagelseskoden og personlige adgangstokens giver spilleradgang. Tokens gemmes i browserens sessionStorage og tilgås ikke af andre deltagere.

## 2. Opsæt GitHub Pages

I `site/online-config.js` erstatter du:

`https://DIN-WORKER.workers.dev`

med den præcise Cloudflare Worker URL, du fik efter deploy (ingen skråstreg til sidst).

Upload **kun** disse filer fra `site/` til roden af dit eksisterende repo:

- `online.html`
- `online.js`
- `online-config.js`

Slet ingen eksisterende filer. Åbn `https://driftportal-platform.github.io/aeselklog-talstien/online.html` i to forskellige browsere eller på to telefoner. Opret et rum på den ene; kopiér linket og åbn på den anden. Linket indeholder rumkode, ikke personligt adgangstoken.

## 3. Begrænsninger i piloten

- To spillere, fem talområder, fem kort af hvert tal. Regler kontrolleres på serveren.
- Enkle, lovlige træk: læg et åbent kort, vend, placer vendt kort; hvis ingen placering findes, ryger det vendte kort automatisk i den åbne bunke.
- **Ikke implementeret:** klassiske æselkortstraffe, udfordringsknap, variant med ét æselkort, CPU, gemte spilleres score, fuld lydstyring, online Talstien.
- Hold invitationskoder private. Ingen konti, ingen matchmaking, ingen moderation. Undgå personlige oplysninger i kaldenavne.
- Spilrum bliver i Durable Object-lager, indtil de ryddes. Der er endnu ikke indbygget automatisk oprydning eller sletning – derfor kun en privat pilot, ikke offentlig lancering.
- Connection reconnect kræver, at browserens sessionStorage stadig har spillerens token. En tabt session kan ikke genskabes uden videre.
- Begge spillere kan have siden åben samtidig. Serveren sender kun antal lukkede kort, ikke modstanderens skjulte værdier.
- Browseren modtager ikke de 500 MP3-optagelser direkte i denne pilot.

## 4. Test først

- Opret 1–20-spil, deltag fra anden telefon, observer to navne.
- Prøv at vende et kort og se, at begge enheder opdaterer skærmen.
- Prøv at lægge tallet 1 i ny midterrække, derefter 2 i samme række.
- Kontroller, at den anden telefon ikke kan handle på den forkerte tur.
- Genindlæs en telefon, og kontrollér, at den får korrekt spiltilstand igen.

**Note:** Prototypen er syntakskontrolleret, men ikke live-deployet på din Cloudflare-konto. Den skal afprøves og gennemgås med yderligere sikkerhedstest før bred anvendelse.
