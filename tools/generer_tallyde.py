#!/usr/bin/env python3
"""Generér 1-20 fra ElevenLabs TTS. Kør lokalt; nøgle kun i miljøvariabel."""
import json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
VOICE_IDS={
    'narrator':os.getenv('ELEVEN_VOICE_DA_NARRATOR',''),
    'donkey':os.getenv('ELEVEN_VOICE_DA_DONKEY',''),
    'en':os.getenv('ELEVEN_VOICE_EN',''),
    'de':os.getenv('ELEVEN_VOICE_DE',''),
    'es':os.getenv('ELEVEN_VOICE_ES',''),
}
DA=['','en','to','tre','fire','fem','seks','syv','otte','ni','ti','elleve','tolv','tretten','fjorten','femten','seksten','sytten','atten','nitten','tyve']
EN=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty']
DE=['','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn','zwanzig']
ES=['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte']
WORDS={'narrator':DA,'donkey':DA,'en':EN,'de':DE,'es':ES}
LANG={'narrator':'da','donkey':'da','en':'en','de':'de','es':'es'}

def main():
    key=os.getenv('ELEVENLABS_API_KEY','')
    missing=[name for name,vid in VOICE_IDS.items() if not vid]
    if not key or missing:
        print('Mangler ELEVENLABS_API_KEY eller voice-ID til: '+', '.join(missing),file=sys.stderr)
        sys.exit(2)
    model=os.getenv('ELEVEN_MODEL_ID','eleven_multilingual_v2')
    generated=0
    for role, voice in VOICE_IDS.items():
        directory=ROOT/'audio'/'numbers'/role
        directory.mkdir(parents=True,exist_ok=True)
        for n in range(1,21):
            target=directory/f'{n:03d}.mp3'
            if target.exists() and target.stat().st_size>500:
                continue
            body=json.dumps({'text':WORDS[role][n], 'model_id':model, 'language_code':LANG[role], 'output_format':'mp3_44100_128'},ensure_ascii=False).encode('utf-8')
            url=f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128'
            # language_code should be omitted for older models not supporting it.
            payload=json.loads(body);payload.pop('output_format')
            if model=='eleven_multilingual_v2':payload.pop('language_code',None)
            request=urllib.request.Request(url,data=json.dumps(payload,ensure_ascii=False).encode(),headers={'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},method='POST')
            try:
                with urllib.request.urlopen(request,timeout=45) as resp: data=resp.read()
            except urllib.error.HTTPError as e:
                print(f'Fejl {e.code} ved {role} {n}: {e.read(350).decode(errors="replace")}',file=sys.stderr)
                sys.exit(1)
            if len(data)<500:raise RuntimeError(f'Fejl i lydklip {role} {n}')
            target.write_bytes(data)
            generated+=1
            print(f'{role} {n}/20',flush=True)
            time.sleep(0.15)
    print(f'Færdig. {generated} nye MP3-filer oprettet. Kontroller udtale og lydniveau før offentliggørelse.')

if __name__=='__main__':main()
