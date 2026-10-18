# ÆselKlog – Online-knap og forbindelsesrettelse

Denne pakke retter den forkerte Worker-adresse i `/site/online-config.js` og flytter knappen fra forsideillustrationen til menuen **Spil**. Ændringerne er målrettede, så nyere kode ikke erstattes af gamle filer.

## Installation (Windows)

1. Hent seneste komplette repository med **Code → Download ZIP** fra https://github.com/driftportal-platform/aeselklog-talstien, og pak det ud.
2. Pak DENNE ZIP ud et andet sted.
3. Åbn Terminal/PowerShell i **roden af ÆselKlog-repositoriet**, samme mappe som `index.html` og `app.js`.
4. Kør med Node (det er allerede installeret):

   `node "C:\STI\TIL\aeselklog_menu_fix\anvend-opdatering.cjs"`

   Erstat stien med den faktiske sti til den udpakkede opdateringsmappe. Tip: I Stifinder kan du kopiere filens sti med højreklik → Kopiér som sti.
5. Upload disse TRE filer til samme placering på GitHub, **uden at slette andre filer**:
   - `index.html` i repository-roden
   - `online-menu.js` i repository-roden
   - `site/online-config.js` i `site`-mappen
6. Åbn ÆselKlog og genindlæs. Klik Spil → Online spil. Test kun med voksne.

Skriptet gemmer `.bak`-filer lokalt, hvis du vil fortryde ændringerne.

## Afgrænsning

Den hidtidige online-Worker (`aeselklog-online`) ændres IKKE. V0.9.39-klienten ser ud til at forvente nye serverfunktioner (fx `discard` og `challenge`), som ikke findes i den tidligere uploadede v0.9.38-worker. Derfor skal den nye Worker-kode gennemgås og deployes, før vi kan kalde det fuldt spillbart. At knappen og API-adressen virker, er kun forbindelsestest.

Forældrelåsen i `/site/parent-gate.js` er lokalt baseret med standardkode 1234 og er IKKE sikker serverbeskyttelse. Online skal fortsat være voksenstyret test.
