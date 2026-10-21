# Fælles billeder og ikoner

- `icons/`: 44 faste SVG-ikoner til alle spil, både offline og online. Egne vektortegninger i spillets blå, creme, grønne og gule farver. Ingen ikonfont, eksterne tjenester eller platformafhængige emoji-billeder.
- `images/donkey-card.webp`: det eksisterende æselkort, fælles for kortspil, Talkort og online. Samme billede som den gamle aeselklog-card.webp.
- `images/mascot.webp`: den eksisterende maskotillustration samlet til genbrug. Forsidens baggrund ligger fortsat på sin kendte adresse.
- `icon-overview.html`: åbn filen for at se alle ikoner.

`game-icons.js` er den fælles oversigt. Brug `AeselIcons.url('dice')` til et ikon, `AeselIcons.svgImage('gulerod',12,13,22,22)` i spillepladens SVG og `AeselIcons.donkey()` til en brik. Specialfelter bruger faste navne i aliases. `game-icons.css` styrer størrelsen.

Kontroller og faste overskrifter med ikonpræfiks bliver vist med samme SVG. Knaptekster, adgangsnavne og emoji i chat bevares. Spillernavne, brugerbeskeder, indtastning, tal og spilregler ændres ikke. Native valglister bevarer tekst, fordi de ikke kan indeholde billeder.

Nye ikoner: tilføj SVG her, registrér navnet i game-icons.js og tilføj filen til CORE i sw.js. Brug et eksisterende ikon til samme handling i alle spil. Ikon- og billedfiler caches lokalt, så de også virker offline.

Gamle billedfiler i projektroden beholdes af hensyn til tidligere versioner og gemte genveje. Opret ikke nye kopier der.

Spilvalg: card-game.svg og board-game.svg bruger det eksisterende originale æselkort som motiv, med en lille Talsti til brætspillet. De samme to illustrationer bruges i offline- og online-spilvalg.

- `icons/fish-game.svg`: fælles TorskeKlog-ikon til offline/online; genbruger æselvektoren med en fisk.
