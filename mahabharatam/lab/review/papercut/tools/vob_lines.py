"""Voice over bed per line (pipeline 95): the median and 10th percentile of the 100 ms local fit (lab/review/vob.py's measure) inside each line's speech."""
import json, sys, numpy as np, soundfile as sf
mixf = sys.argv[1] if len(sys.argv) > 1 else 'audio/ep95/mix.en.wav'
m, sr = sf.read(mixf); v, _ = sf.read('audio/ep95/voice-stem.en.wav'); m = m.mean(1); v = v.mean(1); n = min(len(m), len(v))
tl = json.load(open('build/timeline.ep95.en.json')); w = int(sr * .1)
for l in tl['lines']:
    if not l.get('voice'): continue
    out = []
    for i in range(int(l['speechStart'] * sr), min(n, int(l['speechEnd'] * sr)) - w, w):
        vv = v[i:i + w]; e = np.mean(vv ** 2)
        if 10 * np.log10(e + 1e-12) < -45: continue
        mm = m[i:i + w]; a = np.dot(mm, vv) / np.dot(vv, vv); r = mm - a * vv
        out.append(10 * np.log10(np.mean((a * vv) ** 2) / (np.mean(r ** 2) + 1e-12)))
    o = np.array(out); print(l['id'].ljust(9), 'median %5.1f  p10 %5.1f  n %d' % (np.median(o), np.percentile(o, 10), len(o)))
