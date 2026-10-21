# Installation af ÆselKlog

Aktuel opdatering: v0.9.80 – Spil mod Æslet i TorskeKlog og 500 offline.

1. Pak opdateringen ud i projektmappen. Erstat filerne, og bevar undermapper samt audio, music og assets. De nye card-cpu.js og local-cpu.js skal med.
2. Kør `npm.cmd test`: 63/63 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub opdateres. Worker v0.9.78 og online-reglerne er uændrede.
4. Efter GitHub Pages er færdig: genåbn appen og kontrollér versionsmærket 0.9.80.

## Prøv Æslet
Vælg TorskeKlog eller ÆselKlog 500 offline. Slå Spil mod Æslet til. Vælg 1 person til solo eller 2–5 personer plus Æslet. Start spillet; Æslet tager automatisk sine egne ture.

Med én person vises dine egne kort også under Æslets tur. Dets hånd er skjult. Flere mennesker bruger privat håndoverdragelse som før. Regler/dialoger og skjult side holder pause; Spilmenu stopper automatikken og gemmer. Prøv Fortsæt, også fra en gemt Æsel-tur. Ældre gemninger uden Æsel skal stadig fungere.

Valideret: 63/63 Node-tests, komplette spil gennem CPU-strategier, browserprøver af solo/flere mennesker, pause/stop/genoptag og reel lokal HTTP/PWA-offline. Ingen fysisk telefonprøve eller publicering herfra.
