#!/usr/bin/env python3
"""Pick one Chatterbox take per line: fewest recogniser errors against the script (names not counted), then the take whose
length is nearer the old line's. → OUT/<id>.wav (trimmed, levelled like tools/voice.py: active RMS −21 dBFS) + OUT/select.json

    venv/bin/python cb_select.py --takes work/cb_default --out cand/C-chatterbox/lines
"""
import argparse, glob, json, os
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel
from lib import LAB, ROOT, script, trim, norm_rms
from measure import norm, align, NAME_SET

ap = argparse.ArgumentParser(); ap.add_argument('--takes', required=True); ap.add_argument('--out', required=True); a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=2, download_root=f'{LAB}/venv/models/whisper')
sel = []
for line in script(44)['lines']:
    takes = sorted(glob.glob(f"{a.takes}/{line['id']}.s*.wav"))
    if not takes:
        continue
    old = sf.info(f"{ROOT}/voice/ep44/en/{line['id']}.wav").duration
    ref, rows = norm(line['text']), []
    for t in takes:
        segs, _ = asr.transcribe(t, beam_size=5, condition_on_previous_text=False)
        txt = ' '.join(s.text.strip() for s in segs)
        hyp = norm(txt)
        e = sum(1 for i, j in align(ref, hyp) if not (i is not None and ref[i] in NAME_SET) and (ref[i] if i is not None else None) != (hyp[j] if j is not None else None))
        d = sf.info(t).duration
        rows.append({'take': os.path.basename(t), 'heard': txt, 'errors': e, 'dur_s': round(d, 2), 'old_dur_s': round(old, 2)})
    best = min(rows, key=lambda r: (r['errors'], abs(r['dur_s'] - r['old_dur_s'])))
    x, sr = sf.read(f"{a.takes}/{best['take']}", dtype='float32')
    sf.write(f"{a.out}/{line['id']}.wav", norm_rms(trim(x, sr, 0.02, 0.08)), sr)
    sel.append({'id': line['id'], 'chosen': best['take'], 'takes': rows})
    print(line['id'], '→', best['take'], [(r['take'], r['errors'], r['dur_s'], r['heard']) for r in rows], flush=True)
json.dump(sel, open(f'{a.out}/select.json', 'w'), indent=1)
