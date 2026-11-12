#!/usr/bin/env python3
"""Two recogniser checks (faster-whisper base.en, CPU):
  1. caption sync of the fitted lines RELATIVE to the accepted voice: for every word the recogniser finds in both, the
     start time in the new line minus the start time in the old line (both files start at the line's speechStart, and the
     captions were drawn for the old one). The recogniser's own bias cancels. → sync.json
  2. the nine names of the brief in a carrier sentence ("They told the king about X, long ago."): Kokoro from the IPA in
     tools/voice.py, Chatterbox from the plain spelling and from a respelling. → names.json
"""
import json, os, glob
import numpy as np
from faster_whisper import WhisperModel
from lib import LAB, ROOT, timeline
from measure import norm, align

asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=2, download_root=f'{LAB}/venv/models/whisper')


def words(p):
    segs, _ = asr.transcribe(p, word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    return [((norm(w.word) or ['?'])[0], w.start, w.word.strip()) for s in segs for w in s.words]


tl = [l for l in timeline(44)['lines'] if l.get('voice')]
old = {l['id']: words(f"{ROOT}/{l['voice']}") for l in tl}
sync = {}
for name, d in (('B-kokoro-directed', 'cand/B-am_michael/fit'), ('C-chatterbox', 'cand/C-chatterbox/fit')):
    rows = []
    for l in tl:
        new = words(f"{LAB}/{d}/{l['id']}.wav")
        o = old[l['id']]
        for i, j in align([w[0] for w in o], [w[0] for w in new]):
            if i is not None and j is not None and o[i][0] == new[j][0]:
                rows.append({'line': l['id'], 'w': o[i][2], 'd': round(new[j][1] - o[i][1], 3)})
    dd = np.array([r['d'] for r in rows])
    sync[name] = {'words_compared': len(rows), 'median_s': round(float(np.median(dd)), 3), 'median_abs_s': round(float(np.median(np.abs(dd))), 3),
                  'p90_abs_s': round(float(np.percentile(np.abs(dd), 90)), 3), 'max_abs_s': round(float(np.abs(dd).max()), 3),
                  'within_0.10_s_pct': round(float(100 * np.mean(np.abs(dd) <= 0.10)), 1), 'within_0.20_s_pct': round(float(100 * np.mean(np.abs(dd) <= 0.20)), 1),
                  'worst': sorted(rows, key=lambda r: -abs(r['d']))[:6]}
    print(name, {k: v for k, v in sync[name].items()})
json.dump(sync, open(f'{LAB}/sync.json', 'w'), indent=1)

names = []
for j in json.load(open(f'{LAB}/work/jobs_names.json')):
    p = f"{LAB}/work/cb_names/{j['id']}.s0.wav"
    row = {'name': j['name'], 'engine': 'chatterbox', 'written': j['spelling'], 'heard': ' '.join(w[2] for w in words(p)) if os.path.exists(p) else '(not made)'}
    names.append(row)
    if j['id'].endswith('.plain'):
        k = f"{LAB}/work/names_kokoro/{j['name']}.wav"
        names.append({'name': j['name'], 'engine': 'kokoro (IPA)', 'written': 'IPA', 'heard': ' '.join(w[2] for w in words(k))})
for r in sorted(names, key=lambda r: r['name']):
    print(r)
json.dump(names, open(f'{LAB}/names.json', 'w'), indent=1)
