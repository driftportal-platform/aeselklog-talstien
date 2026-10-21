# Installation af ÆselKlog

Aktuel opdatering: v0.9.73 – egne spilsider og tælling i Talkort.

1. Pak opdateringen ud og kopiér indholdet ind i projektmappen. Erstat filerne og bevar undermapper. Slet ikke assets, audio eller music.
2. Kør `npm.cmd test`: 57/57 skal bestå. Kontrollér GitHub Desktop, Commit og Push origin. Bevar `.github/workflows/test.yml`.
3. Kun GitHub skal opdateres denne gang. Cloudflare-koden er uændret; eksisterende Worker bevares.

## Prøv navigationen
Spilmenuen viser kun de fire valg. Hvert offline-spil åbner sin egen adresse og side. Talstien har spillere, Start og indstillinger der kan foldes ud. Tilbage går via Spilmenu. Gem og fortsæt skal fungere i begge spil. Browserens tilbageknap og genindlæsning skal åbne den rigtige side. Online spil har fortsat sine egne to spilvalg.

## Prøv Talkort
Kortet vises øverst uden lyd. Tryk på kortet, Læs igen eller en pil for at læse. Vælg fx dobbeltsprog Dansk + engelsk og pause 1 sekund.

Tæl ned: vælg starttal 25 og en valgfri besked/stemme. Tryk Start tælling. Den læser 25 til 0 og derefter beskeden. Tæl op: vælg starttal og sluttal. Begge sprog skal være færdige før næste tal.

Tallene 1–100 bruger de gemte MP3'er. Nul og slutbeskeden bruger den valgte stemme. Vælges AI, sendes slutteksten til samme stemmetjeneste som offline, uden permanent cache af teksten. Telefonstemme kan vælges i stedet. Ingen ny API-nøgle kræves.

Auto genprøver samme tal ved kort lydfejl. Ved vedvarende fejl forbliver forløbet på pause og kan genoptages med Prøv lyden igen. Skjules siden, pauser den og fortsætter ved retur. Stop og tilbage må ikke udløse en senere slutbesked.

57/57 Node-tests og simulerede Chromium-prøver, herunder reel lokal HTTP/PWA-offlineprøve. Stemmeafspilning er simuleret; prøv især dobbeltsprog, nul, sluttekst og baggrund/retur på fysisk iPhone/iPad og pc.
