# ÆselKlog v0.9.40 – samlet GitHub-pakke

Dette er den samlede projektmappe baseret på den uploadede `aeselklog-talstien-main-ny.zip`.

## Rettet og kontrolleret

- `index.html`: vist versionsnummer 0.9.40 matcher `sw.js`.
- `board.test.js` i projektroden: stien til `board.js` rettet.
- `worker/src.js`: manglende chat-API genindsat (hurtigbeskeder, tekst, lydklip og samtykke) og URL-queryparametre bevaret ved forwarding til spilrum.
- Nyeste lokale ændringer til 1–5 kortsæt, Æslets valgfri fejlprocent, strafkort til Æslet, online i spilmenu og Tilbage-knap er bevaret.
- 37/37 Node-tests bestået lokalt. Syntax check af `worker/src.js`, `app.js` og `cardgame-ui.js` bestået.

## Upload til GitHub

1. Gem en kopi af det eksisterende GitHub-repository / seneste fungerende commit.
2. Pak ZIP ud og upload indholdet af `aeselklog-talstien-main` til **roden** af repository `driftportal-platform/aeselklog-talstien`, med mappernes relative placering bevaret. Upload ikke selve topmappen som ekstra underfolder.
3. Filer med samme navn overskrives. Du kan også bruge GitHub Desktop eller Git til en samlet commit.
4. Kontroller hovedsiden og menuen **Spil → Online spil** efter GitHub Pages har opdateret.

## Cloudflare kræver separat opdatering

`worker/src.js` i denne pakke deployes **ikke** ved GitHub-upload. Hvis online spil og chat skal bruge serverændringerne, skal de deployes særskilt fra mappen `worker` via `npx.cmd wrangler deploy`, efter at `APP_ORIGIN` og den eksisterende `GAME_ROOM`-binding er kontrolleret. Tag først backup og test mellem to enheder. `worker/wrangler.jsonc` skal beholde Worker-navnet `aeselklog-online`.

## Begrænsninger

Online er fortsat en voksenstyret pilot. Den nuværende lokale PIN er ikke en sikker server-side forældrekontrol. Vi har ikke afprøvet live-lyd og PWA-opdatering på iPhone eller multiplayer på to fysiske telefoner. De 500 MP3-filer er bevaret i ZIP-filen.
