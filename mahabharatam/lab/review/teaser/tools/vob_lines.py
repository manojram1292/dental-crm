# voice over the rest of the mix, per line (the RULES2 method: local fit per 100 ms over windows of actual speech)
import json, sys, numpy as np, soundfile as sf
mix, sr = sf.read('audio/ep96/mix.en.wav'); vo, _ = sf.read('audio/ep96/voice-stem.en.wav')
mm, vm = mix.mean(1), vo.mean(1); w = int(0.1 * sr); tl = json.load(open('build/timeline.ep96.en.json'))
lv = np.array([10 * np.log10(np.mean(vm[i:i + w] ** 2) + 1e-12) for i in range(0, len(vm) - w, w)]); thr = max(-45, np.median(lv[lv > -45]) - 12)
res = {}
for k, i in enumerate(range(0, len(vm) - w, w)):
    vv = vm[i:i + w]; e = np.mean(vv ** 2)
    if 10 * np.log10(e + 1e-12) < thr: continue
    a = np.dot(mm[i:i + w], vv) / e / w; r = mm[i:i + w] - a * vv; d = 10 * np.log10(np.mean((a * vv) ** 2) / (np.mean(r ** 2) + 1e-12))
    t = i / sr; lid = next((l['id'] for l in tl['lines'] if l['start'] <= t < l['end']), '?'); res.setdefault(lid, []).append(d)
for k, v in res.items(): print(k.ljust(9), 'n', len(v), 'median', round(float(np.median(v)), 1), 'p10', round(float(np.percentile(v, 10)), 1))
