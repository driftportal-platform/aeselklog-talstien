# Installation af ÆselKlog

Aktuel opdatering: v0.9.74 – rettelse af Auto og tælling i Talkort.

1. Pak opdateringen ud i projektmappen. Erstat filerne og bevar undermapperne. Bevar audio, music og assets.
2. Kør `npm.cmd test`: 58/58 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub skal opdateres. Cloudflare-koden er uændret.
4. Når GitHub Pages er færdig, genåbn appen og kontrollér versionsmærket **0.9.74**, før du prøver igen.

## Prøv på den enhed, hvor tællingen stoppede
- Talkort: Auto fra 1 til 100, først dansk, derefter dansk + engelsk.
- Nedtælling fra 25 til 0 med slutbesked; optælling fra 1 til 25. Vælg fx 1 sekund mellem tal.
- Begge sprog skal afsluttes inden næste tal. Stop skal stoppe straks. Skjul siden under et tal, og gå tilbage: samme tal skal genoptages.
- Ved reel manglende lydfil eller blokering skal Prøv lyden igen fortsat være tilgængelig; der springes ikke lydløst over tal.

Afspilleren genbruges nu i stedet for at blive oprettet på ny for hvert tal. Den kan registrere slutningen selv ved manglende ended-hændelse. Det er kontrolleret i automatiske fejlscenarier, som fejler med den gamle kode. Browserlyd er simuleret; den konkrete mobilfejl er endnu ikke bekræftet løst på fysisk telefon.
