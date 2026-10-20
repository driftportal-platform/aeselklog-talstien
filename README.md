# 🫏 ÆselKlog

Børnevenligt talspil (3 år til voksne) som PWA: **Talstien** (brætspil 1–100), **Kortspil** (fem talområder) og **Talkort**. Matematik er altid frivillig, alt gemmes lokalt, og appen virker offline.

Live: `https://driftportal-platform.github.io/aeselklog-talstien/`

## Dokumenter
- `PROJEKTSTATUS.md` – hvor er vi nu, åbne opgaver, idéer
- `CHANGELOG.md` – versionshistorik
- `AGENTS.md` – permanente regler for udvikling
- `TESTPLAN.md` – automatiske og manuelle tests
- `START-HER.md`, `LYDPROEVE-VEJLEDNING.md` – generator til de 500 MP3-lyde
- `MUSIC-LICENSES.md` – musiklicenser
- `docs/arkiv/` – ældre lange dokumenter, installationsvejledninger og skærmbilleder

## Udvikling
Ingen build. `npm test` kører alle Node-tests. Åbn `index.html` via en lokal webserver (service worker kræver http/https).
Filer ligger i roden; spillogik i `engine.js`, `board.js`, `cardgame-engine.js`, visning i `app.js`, `cardgame-ui.js`, `talkort.js`.
