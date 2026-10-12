# ÆselKlog – Talstien (første prøve)

Dette er en **første prototype**, ikke en færdig kommerciel app.

## Hvad fungerer allerede?

- 1–4 spillere med kaldenavn og alder 5–14 år
- Tilføj Æslet som computerstyret modstander
- Spil hele Talstien 1–100 eller ét talområde ad gangen
- Almindelig terning og læringsterning, både virtuelt og med fysisk slag indtastet i appen
- Dansk tekst-til-tale gennem enhedens egne stemmer (afhænger af browser og stemmer)
- De seks opgavetyper: før/efter, lige/ulige, tiere/enere, primtal, større/mindre, plus/minus
- Automatisk spørgsmål og svarmuligheder – med bonus for korrekt svar
- Specialfelter: Bonus, Hov hov, Byt og Talmester
- Digital spilleplade med synlig position; kan også bruges ved siden af en fysisk A3-plade
- Kan fungere uden internet **efter første besøg**, når den hostes på HTTPS med service worker

## Sådan prøver du den

**På computer:** Åbn `index.html` i en moderne browser.

**På mobil:** Upload hele mappen til en webserver (f.eks. Cloudflare Pages eller GitHub Pages med HTTPS). Åbn linket på mobilen, og vælg **Del > Føj til hjemmeskærm** på iPhone.

Dansk oplæsning kræver, at enheden har en egnet stemme. På nogle enheder skal en knap trykkes, før oplæsning må starte.

## Ting der skal udvikles før en rigtig lancering

- Brugertest med børn, pædagoger og forældre; finpudsning af spørgsmål og pointbalance
- Gem/fortsæt spil på enheden, eventuelt profiler uden persondata
- Egen professionel æselgrafik, lyd og animation
- Særlige opgaver for de fem niveauer og specialfelter
- Grundig test på Safari iOS og Android samt tilgængelighed
- Produktionstest og vurdering af privatliv og sikkerhed for børn

Der bruges ingen eksterne biblioteker, ingen konto og ingen dataoverførsel fra spillet til en server.
