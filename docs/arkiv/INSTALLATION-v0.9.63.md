# ÆselKlog v0.9.63

Pakken bygger på det opryddede GitHub-projekt, main 2acf15ce17213c291e5b0ce2128ae4c34c8d09b6. Den vedhæftede GitHub-ZIP stemte med samme kildekode. Gamle fjernede filer, logs og byggeoutput gendannes ikke.

## Læg opdateringen ind
1. Udpak pakken, og kopiér indholdet ind i projektmappen med index.html og package.json. Erstat filer og bevar undermapperne.
2. Hele assets-mappen skal med, inklusive icons og images. Der er 44 små ikonfiler, to eksisterende billeder samt en oversigt/vejledning. Slet ikke andre filer eller audio/music.
3. GitHub Desktop → Repository → Open in Terminal → `npm.cmd test`. Der skal stå 50/50 bestået.
4. Kontrollér ændringerne → Commit → Push origin. Vent på GitHub Pages, og genindlæs. Siden skal vise 0.9.63.

## Cloudflare
Denne opdatering ændrer ikke Worker. Den eksisterende v0.9.61 beholdes. Du skal derfor ikke køre Cloudflare-deployment igen for disse ændringer.

## Prøv ændringerne
- Opret et rum. Afslut står øverst mellem Spilmenu og Indstillinger hos opretteren. Annullér én gang, og kontrollér at spillet fortsætter. Ved godkendt afslutning lukkes det for alle.
- Tandhjul → rum: Kopiér rumkode kopierer kun de otte tegn. Del invitation og Kopiér invitation inkluderer koden på en separat linje i selve teksten, med link nedenunder. Det er den tekst, som kan sendes i Messenger.
- Modtageren kan kopiere koden fra beskeden og indsætte den i spillet. Hvis Messenger kopierer hele beskeden, kan den også indsættes direkte i rumkodefeltet: spillet finder koden. Ved åbning af linket er koden allerede udfyldt, og en Kopiér rumkode-knap vises.
- Spilmenu fører til spilvalget frem for forsiden. Et online-rum kan genoptages ved at vælge Online spil igen på samme enhed.
- Kortspil og Talstien har æselmotiver, og fælles ikoner/billeder bruges offline og online. assets/icon-overview.html viser alle ikoner.

50/50 Node-tests samt relevante Chromium- og lokale offline-PWA-kontroller består. Deling, udklipsholder og online-transport er simuleret. Rigtig Messenger, iPhone/iPad og live Worker er ikke afprøvet herfra. Intet er publiceret automatisk.
