# Installation af ÆselKlog

Aktuel opdatering: v0.9.79 – Regler-knapper til TorskeKlog og 500.

1. Pak opdateringen ud i projektmappen. Erstat filerne og bevar undermapper. Slet ikke audio, music eller assets.
2. Kør `npm.cmd test`: 62/62 skal bestå. Commit og Push origin i GitHub Desktop. Bevar `.github/workflows/test.yml`.
3. Kun GitHub skal opdateres denne gang. Worker v0.9.78 er uændret og skal ikke deployes igen.
4. Efter GitHub Pages er færdig, genåbn appen og kontrollér versionsmærket 0.9.79.

## Prøv reglerne
TorskeKlog og 500 har nu en Regler-knap ved Spilmenu både i opsætningen og under offline-spillet. Online har Regler sin egen knap i toppen under spillet og ved opsætningens overskrift før start.

Åbn reglerne, rul teksten, og luk med Luk eller Escape. Kort, tur og score skal være uændrede. Offline må en skjult hånd fortsat være skjult. Online må genopkobling/statusopdatering ikke lukke vinduet.

62/62 Node-tests og simulerede browserprøver af begge spil offline/online ved lille skærm samt reel lokal HTTP/PWA-offlineprøve. Ingen fysisk telefonprøve eller publicering herfra.
