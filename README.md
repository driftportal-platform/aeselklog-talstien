# ÆselKlog Talstien – v0.7 med ElevenLabs Mia

## Funktioner
Denne version viderefører v0.6, herunder fysisk/digital terning, farvede æselbrikker, CPU-modstander med terningkast, opgaver fra 3 år til voksen, voksentimer og den **ægte æsellyd** ved forkerte svar.

## Nyt
- AI-stemmeindstillingen er klar til **ElevenLabs Eleven v4** via en lille sikker Cloudflare Worker (se separat ZIP).
- Forlænget ventetid på genereret AI-tale til 25 sekunder, fordi Eleven v4 kan bruge lidt længere tid.
- Opdateret visning og ny cacheversion v0.7.
- De gamle talestemmeindstillinger fra v0.6 bevares, herunder din valgte stemmetjeneste-URL.

## Upload til GitHub
Udpak og upload alle otte appfiler fra denne mappe direkte til roden af dit eksisterende ÆselKlog-repository:
- `index.html`, `app.js`, `engine.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `aeselklog-card.webp`, `donkey-bray.wav`.
Erstat de gamle filnavne. Du må ikke uploade hemmelige API-nøgler eller Cloudflare Workerkode i denne mappe.

## ElevenLabs-opsætning
Se den separate Worker-ZIP `AeselKlog_Cloudflare_ElevenLabs_Mia_v07.zip`. Appen fungerer som før uden Worker – så bruges telefonstemmen. Når Worker-adressen er indsat i stemmeindstillingerne, kan Mia læse nye opgaver højt. Der kan være forsinkelse ved første generation.

**Status:** App og Worker er testet med simulerede server-/lydsvar, men en rigtig ElevenLabs-konto, Mia-Voice ID og API-secret er endnu ikke koblet på og er derfor ikke live-testet.
