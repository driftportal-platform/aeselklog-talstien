# ÆselKlog – sikker lydgenerator (25 prøveklip)

Dette er **kun en hjælpepakke** til prøveoptagelser – ikke en ny appversion. ÆselKlog/Talkort er ikke ændret.

## Sådan bruges den

1. Upload `lydproeve.html` **i roden** af GitHub-repositoriet `driftportal-platform/aeselklog-talstien`, sammen med den eksisterende app. Der skal ikke ændres Worker-kode eller API-nøgler.
2. Åbn `https://driftportal-platform.github.io/aeselklog-talstien/lydproeve.html` i browseren. Dobbeltklik på en lokal HTML-fil fungerer ikke: Workerens Origin-kontrol kræver GitHub Pages-domænet.
3. Klik **1. Kontroller stemmer (gratis)**. Programmet kontrollerer, at alle fem faste stemmer findes på Workerens tilladte liste. Stemmelisten kan være cachet i ca. tre minutter.
4. Kun den danske spilleleder er markeret som standard. Tryk **2. Generér valgte MP3-klip** og bekræft udgiften. Det laver fem klip i første omgang (5, 11, 12, 15, 20). Lyt og godkend, før du markerer flere stemmer.
5. Tryk **3. Hent ZIP**. Hvis Workeren giver HTTP 429 eller anden fejl, stopper generatoren – hent en delvis ZIP med klip, der allerede er produceret. Ingen automatiske genforsøg.
6. Gentag efter behov for øvrige stemmer. Upload ZIP-filerne til ChatGPT til kvalitetstjek. Ved samlet generation med alle fem stemmer bliver det 25 klip.

## Vigtigt

- **Ingen API-nøgle i browseren**. TTS-kald går til eksisterende Worker `https://aeselklog-mia-stemme-test.driftportal-platform.workers.dev/tts` fra godkendt GitHub Pages-Origin.
- Credits bruges kun, når du aktivt starter genereringen. Stemmekontrol er et gratis katalogkald.
- Voice-ID'er er fastlåst til de fem valgte stemmer; browseren kan ikke ændre sikkerhedskontrollen på Workeren.
- 2,5 sekunders afstand mellem kald. Workerens grænser har forrang; ved 429 skal du ikke omgå begrænsningen eller forsøge igen straks.
- Programmet springer færdige klip over **i den aktuelle åbne fane**. Hvis du lukker fanen, skal du bevare de ZIP-filer, du har hentet. Der er ingen gemning af MP3-filer i browseren på tværs af sessioner.
- MP3-lydstyrke er endnu ikke normaliseret. Dette gøres efter du har godkendt optagelserne, inden filerne integreres i appen og PWA-cachen.
- De nye MP3-filer sendes **ikke** automatisk til GitHub eller appen. Appens design er uændret.
- Workeren tillader kun tekstlængde 2–350 tegn; prøveordene overholder dette.
