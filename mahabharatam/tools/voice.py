#!/usr/bin/env python3
"""Narration: script/<lang>.json → voice/<lang>/<id>.wav with Kokoro (82M, Apache-2.0).

    python3 tools/voice.py --model DIR [--lang en] [--voice am_michael] [--speed 0.9]

DIR holds Kokoro's model.onnx and voice .bin files (onnx-community/Kokoro-82M-v1.0-ONNX).
Sanskrit names are spoken from the hand-written phonemes in NAMES, not English spelling.
"""
import argparse, glob, json, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

NAMES = {  # IPA, as Kokoro's phoneme set spells it
    "Naimisha": "nˈaɪmɪʃə",
    "Ugrashravas": "ˈʊɡɹəʃɹəvəs",
    "Lomaharshana": "lˌoʊməhˈɑːɹʃənə",
    "Janamejaya's": "dʒˌʌnəmˈeɪdʒəjəz",
    "Vyasa": "vjˈɑːsə",
    "Mahabharatam": "məhˌɑːbˈɑːɹətəm",
}

ap = argparse.ArgumentParser()
ap.add_argument('--model', required=True); ap.add_argument('--lang', default='en')
ap.add_argument('--voice', default='am_michael'); ap.add_argument('--speed', type=float, default=0.9)
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vs = {os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob(a.model + '/*.bin')}
np.savez(a.model + '/voices.npz', **vs)
k, tok = Kokoro(a.model + '/model.onnx', a.model + '/voices.npz'), Tokenizer()
g2p = 'en-gb' if a.voice.startswith('b') else 'en-us'
script = json.load(open(f'{root}/script/{a.lang}.json'))
os.makedirs(f'{root}/voice/{a.lang}', exist_ok=True)
pat = re.compile('(' + '|'.join(map(re.escape, NAMES)) + ')')
for line in script['lines']:
    text = line['text'].replace('…', '...').replace('—', ',')
    def seg(p):
        if p in NAMES: return NAMES[p]
        if not p.strip(): return p
        return (' ' if p[0] == ' ' else '') + tok.phonemize(p.strip(), g2p) + (' ' if p[-1] == ' ' else '')
    ph = ''.join(seg(p) for p in pat.split(text))
    audio, sr = k.create(ph, voice=a.voice, speed=a.speed, is_phonemes=True)
    nz = np.nonzero(np.abs(audio) > 0.01)[0]  # trim silence
    audio = audio[max(0, nz[0] - 480): nz[-1] + 2400] if len(nz) else audio
    sf.write(f"{root}/voice/{a.lang}/{line['id']}.wav", audio, sr)
    print(f"{line['id']:8s} {len(audio)/sr:5.2f}s  {ph}")
