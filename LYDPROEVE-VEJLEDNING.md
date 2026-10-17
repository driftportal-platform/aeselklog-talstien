# ÆselKlog – prøve med faste ElevenLabs-lydklip (1–20)

Denne app indeholder **ikke** ElevenLabs-lydfiler endnu. Den er gjort klar til dem. Hvis lydfilerne findes, afspilles de fra `audio/numbers/`. Manglende filer bruger den nuværende oplæsning. Ved komplet 1–20-sæt undgår talkortene stemmeskift på dette talinterval.

## Valg af stemmer

Der skal vælges i alt fem stemme-ID'er: `narrator` (dansk spilleleder), `donkey` (dansk æsel), `en` (engelsk), `de` (tysk) og `es` (spansk). Prøv først tallene 5, 11, 12, 15 og 20 i ElevenLabs med de ønskede stemmer. Forskellige stemmer er ikke automatisk modersmålstalere; lyt efter naturlig udtale. Gem ikke en API-nøgle i appen eller GitHub.

## Generér filerne

`tools/generer_tallyde.py` er et lokalt Python-program til ElevenLabs' officielle TTS-API. Det kræver internet, en ElevenLabs API-nøgle i en lokal miljøvariabel samt fem voice-ID'er i miljøvariablerne:

```
ELEVENLABS_API_KEY
ELEVEN_VOICE_DA_NARRATOR
ELEVEN_VOICE_DA_DONKEY
ELEVEN_VOICE_EN
ELEVEN_VOICE_DE
ELEVEN_VOICE_ES
```

Standardmodellen er `eleven_multilingual_v2`. Kør `python3 tools/generer_tallyde.py` fra projektmappen efter at miljøvariablerne er sat. Programmet opretter op til 100 MP3-klip fordelt på fem undermapper under `audio/numbers/` og springer eksisterende klip over. Generering bruger ElevenLabs-credits. Ingen nøgle skrives til disk af programmet.

**Test lydstyrke og de danske tal grundigt, før du genererer 21–100.** Programmet normaliserer ikke lydstyrken; det skal gøres på optagelserne efter godkendt udtale. PWA'en gemmer selve appkoden offline, mens lydfilerne bør medtages i cachelisten efter genereringen. Kommercielle rettigheder afhænger af ElevenLabs-abonnement og vilkår.


v0.9.28: De genererede 500 MP3-filer er inkluderet i appen. Generering skal ikke gentages.
