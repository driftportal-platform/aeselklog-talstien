# ÆselKlog – lydgenerator til alle 500 MP3-filer

1. Upload **lydproeve.html** til roden af GitHub-repository `driftportal-platform/aeselklog-talstien` (overskriv den gamle prøvefil). ÆselKlog v0.9.27 skal ikke uploades for at bruge generatoren.
2. Åbn `https://driftportal-platform.github.io/aeselklog-talstien/lydproeve.html` i en normal browser (ikke privat).
3. **Importér** først `AeselKlog_Lydproever_15_klip.zip` og evt. andre tidligere ZIP-filer. De 15 klip tæller så med og optages ikke igen.
4. Klik **Kontrollér stemmer**; vælg alle fem og tal 1–100.
5. Pause 8 sekunder anbefales ved dine normale Cloudflare-grænser på 12 forespørgsler/minut. Hvis du midlertidigt øger grænserne, kan 3–5 sekunder bruges, men ElevenLabs har egne grænser.
6. Klik **Generér manglende klip** og bekræft kreditforbruget. Hvert færdigt klip gemmes i browserens IndexedDB. Bliver du afbrudt, kan du genåbne samme adresse i samme browserprofil og fortsætte.
7. Hent periodisk **samlet ZIP** som backup. Når indikatoren viser 500/500, hent den endelige ZIP.
8. Sæt eventuelt forhøjede Cloudflare-grænser tilbage til `CLIENT_LIMIT=12/60s` og `GLOBAL_LIMIT=24/60s`.
9. Upload den samlede ZIP til ChatGPT for kvalitetstjek og indbygning i ÆselKlogs PWA. Dette værktøj ændrer **ikke** selve spillet.

Stemmer: dansk fortæller `4RklGmuxoAskAbGXplXN`, dansk æsel `F6ZuXSkDhi5i4KLiT7Id`, engelsk `aHCytOTnUOgfGPn5n89j`, tysk `yVKATr0ZJETwd3tQtpNG`, spansk `x5IDPSl4ZUbhosMmVFTk`. Kun offentlig Voice ID; aldrig API-secret i GitHub.

## Bemærk
- Gemte browserdata kan blive slettet af browseren, brug derfor løbende ZIP-backups.
- Den eksisterende Worker anvender rate limits og må ikke erstattes af en usikker batch-endpoint.
- Eksisterende lydklip importeres uændret; de normaliseres først efter godkendt lydkontrol.
- Et gennemført API-kald, hvor svaret går tabt inden lokal lagring, kan i sjældne tilfælde have brugt credits uden at levere filen.
- ZIP-import kræver MP3-filer i ZIP som ukomprimerede entries (formatet fra den gamle prøve-generator).
