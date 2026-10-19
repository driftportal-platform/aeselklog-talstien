# ÆselKlog v0.9.59 – æselstemme i online

Pakken indeholder ændrede filer til den eksisterende v0.9.58. Udpak den, og kopiér indholdet til projektmappen med index.html og package.json. Bevar mapperne site og tests. Erstat de gamle filer; slet ikke resten af projektet eller lydmapperne.

1. Åbn projektet i GitHub Desktop. Vælg Repository → Open in Terminal, og kør `npm.cmd test`. Resultatet skal være 46/46 bestået.
2. Kontrollér ændringerne, lav Commit med fx “Æselstemme i online”, og vælg Push origin.
3. Vent på GitHub Pages, og genindlæs hjemmesiden. Versionsmærket skal vise 0.9.59.
4. Åbn online-spillets tandhjul → Lyd og musik → Sprog og stemme → Dansk – æselstemme. Tale skal være slået til.
5. Vend et kort, eller vælg Hør tallet igen. Tallet skal læses med æselstemmen. Valget gemmes på denne enhed.

Denne rettelse kræver ingen Cloudflare-opdatering. Den eksisterende Worker fra v0.9.58 kan bruges. De 100 æsel-tal findes allerede i audio/numbers/donkey; ingen lydfiler skal genoprettes. Æselbrølet ved straf har fortsat sin separate knap.

46/46 Node-tests består. Begge onlineindgange, valg, gentagelse, genindlæsning og individuelle sprogvalg er browserkontrolleret med simuleret lyd. Fysisk iPhone/iPad-lyd er ikke prøvet herfra. Pakken er ikke publiceret.
