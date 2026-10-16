# ÆselKlog – musikfiler og licensoplysninger (v0.9.19)

Alle musikfiler nedenfor blev leveret af projektets ejer den 16. oktober 2026 og stammer fra de angivne OpenGameArt-sider. Siderne angiver **CC0** som anvendelig licens, herunder for kommercielle spil. Vi krediterer alligevel ophavspersonerne. Dette dokument skal følge med ved eventuel udgivelse.

| Melodi | Komponist / ophav | Fil i appen | Kilde | Licens |
|---|---|---|---|---|
| Gone Fishin' | Memoraphile / You're Perfect Studio | `music/gone-fishin.mp3` | https://opengameart.org/content/gone-fishin | CC0 (siden viser også CC-BY 4.0 og OGA-BY 3.0 som alternative licenser) |
| Children's March Theme | Cleyton Kauffman | `music/childrens-march.mp3` | https://opengameart.org/content/childrens-march-theme | CC0 |
| Beary Fishy Menu Screen | Memoraphile / You're Perfect Studio | `music/beary-fishy.mp3` | https://opengameart.org/content/gone-fishin | CC0 (alternativt også CC-BY 4.0/OGA-BY 3.0) |

Musiknumrene blev omkodet til 160 kbit/s MP3, 44,1 kHz stereo for at mindske PWA-størrelsen. De musikalske arrangementer er ellers ikke ændret. Den oprindelige kildefil skal ikke med i webappen. Filmusikken bruges **kun som baggrundsmusik**, slukket som standard, og indlæses fra ÆselKlogs egne lokale filer uden tredjepartskald under afspilning.

### Andre modtagne musikfiler

`the_reel_winner_by_memoraphile_CC0.mp3` (ca. 5 sekunder) blev også leveret fra samme Memoraphile-samling, men er **ikke en del af v0.9.19**. Gemmes som mulig senere vinderfanfare, hvis vi ønsker det. `Children's March Theme.ogg` og `.wav` er alternative formater til den anvendte MP3 og medtages ikke for at spare plads.

### Offline og rettigheder

Alle tre MP3-filer findes i projektets `music/`-mappe og er med i Service Workerens precache. Både almindelige og `Range: bytes=...`-forespørgsler kan besvares fra cachen. Et installeret iOS-PWA kan under lagerpres få slettet browsercache, og appen skal derfor genåbnes med internet for at hente filerne igen. Før endelig fysisk/kommerciel udgivelse skal ophav, filidentitet og licens verificeres på ny som almindelig produktkontrol.
