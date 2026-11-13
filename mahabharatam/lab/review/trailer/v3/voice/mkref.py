import sys, soundfile as sf
sys.path.insert(0, '/home/user/dental-crm/mahabharatam/lab/voicelab')
from lib import kokoro
k = kokoro()
txt = "Sit down. I will tell you how it happened. Long ago, before the war, there was a vow. It cost a prince his throne, and it bound three generations to a single field, where two armies waited for the dawn."
for v, lang in (('bm_george', 'en-gb'), ('am_michael', 'en-us'), ('bm_lewis', 'en-gb'), ('am_fenrir', 'en-us'), ('bm_daniel', 'en-gb')):
    x, sr = k.create(txt, voice=v, speed=0.8, lang=lang); sf.write(f'kref_{v}.wav', x, sr); print(v, len(x) / sr, sr)
