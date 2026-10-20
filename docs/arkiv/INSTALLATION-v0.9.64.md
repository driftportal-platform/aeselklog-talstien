# ÆselKlog v0.9.64 – fælles spilmenu og Start i Talkort

Kopiér pakkens indhold ind i din eksisterende projektmappe med index.html og package.json. Erstat filerne og bevar undermapperne. Pakken bygger på GitHub main 615d1a8e2649e275bf06503739c11e69a6c6873e (v0.9.63).

Bevar assets-mappen fra v0.9.63. Der er ingen ændrede ikoner eller lydfiler i denne pakke, så de skal ikke uploades igen. Slet ikke noget fra projektet.

1. GitHub Desktop → Repository → Open in Terminal → `npm.cmd test`: 50/50 skal bestå.
2. Kontrollér ændringerne → Commit med fx “Fælles spilmenu og manuel start af Talkort” → Push origin.
3. Vent på GitHub Pages. Genindlæs, og kontrollér versionsmærket 0.9.64.

Cloudflare Worker er uændret og skal ikke deployes igen.

## Kontrollér
- Spil viser fire valg: Talstien, Kortspil, Talkort og Online. De samme fire valg bliver stående, når der skiftes mellem de lokale opsætninger. Overflødige Spilmenu-knapper i opsætningen er fjernet fra visningen.
- Online viser først Kortspil og Talstien. Hvis der findes et igangværende online-rum på enheden, vises Genoptag dit online-spil. Det gamle rum slettes ikke. Vælges genoptagelse, åbnes samme rum; F5 i rummet genoptager stadig.
- Spilmenu online er en indrammet knap. Den fører til spilvalget.
- Talkort: vælg sprog, område og tal uden oplæsning. Tryk Start talkort inde ved kortet for at høre det valgte tal. Derefter virker Næste, Læs igen og Auto. Ved genåbning og Nulstil skal Start vælges igen.

50/50 Node-tests, relevante simulerede browserforløb og en reel lokal offline-PWA-test består. Ingen fysisk iPhone/iPad- eller live Worker-test og ingen automatisk publicering.
