#!/usr/bin/env python3
"""Predict each line's voice length BEFORE it is voiced, so a script can be gated on its own (episode 41 on).

    python3 -I tools/estimate.py --calibrate            fit the model on the voiced episodes 21–40 → tools/voice-rates.json
    python3 -I tools/estimate.py --ep 41 [--write]      print the prediction per line; --write stores "estVoice" (s) in
                                                        the script (tools/timeline.mjs then times the unvoiced script
                                                        exactly as a voiced one: pre + estVoice + post)

Model (least squares, per speaker where it has ≥ 12 lines, else all speakers scaled by the cast speeds):
    seconds = (a · letters + b · words) / (cast speed × line speed) + c · commas + d · stops + explicit pauses + e
`say` marks are read as tools/voice.py reads them ([p:N], …, —, mid-line stops). Reported with its error on the
calibration set; a real voice replaces the estimate as soon as tools/voice.py has run.
"""
import json, os, re, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATES = os.path.join(ROOT, 'tools', 'voice-rates.json')
CAST = json.load(open(os.path.join(ROOT, 'script', 'cast.json')))


def feats(line, pauses):
    say = line.get('say', line['text'])
    expl = sum(int(m) for m in re.findall(r'\[p:(\d+)\]', say)) / 1000
    core = re.sub(r'\[p:\d+\]|\{s(:[\d.]+)?\}', ' ', say)
    expl += core.count('…') * pauses.get('ellipsis', 420) / 1000 + core.count('—') * pauses.get('dash', 280) / 1000
    letters = len(re.sub(r'[^A-Za-z]', '', core))
    words = len(core.split())
    commas = len(re.findall(r'[,;:]', core))
    stops = len(re.findall(r'[.?!](?=\s+\S)', core))
    sp = CAST.get(line.get('speaker', 'narrator'), CAST['narrator']).get('speed', 0.81) * line.get('speed', 1.0)
    return [letters / sp, words / sp, commas, stops, 1.0], expl


def wav_dur(p):
    with wave.open(p) as w:
        return w.getnframes() / w.getframerate()


def calibrate():
    rows = {}
    for ep in range(21, 41):
        sc = json.load(open(os.path.join(ROOT, 'script', f'ep{ep:02d}.en.json')))
        for l in sc['lines']:
            wf = os.path.join(ROOT, 'voice', f'ep{ep:02d}', 'en', l['id'] + '.wav')
            if l.get('voice') is False or not os.path.exists(wf):
                continue
            f, expl = feats(l, sc.get('voice', {}).get('pauses', {}))
            rows.setdefault(l.get('speaker', 'narrator'), []).append((f, wav_dur(wf) - expl))
    allr = [r for v in rows.values() for r in v]
    out = {}
    for name, rs in [('*', allr)] + list(rows.items()):
        if len(rs) < 12:
            continue
        X, y = np.array([r[0] for r in rs]), np.array([r[1] for r in rs])
        coef = np.linalg.lstsq(X, y, rcond=None)[0]
        err = X @ coef - y
        out[name] = {'coef': [round(float(c), 5) for c in coef], 'n': len(rs), 'mae': round(float(np.abs(err).mean()), 3), 'p95': round(float(np.percentile(np.abs(err), 95)), 3)}
    json.dump(out, open(RATES, 'w'), indent=1)
    for k, v in out.items():
        print(f'{k:12s} n={v["n"]:3d}  mean abs error {v["mae"]:.2f} s  p95 {v["p95"]:.2f} s')


def predict(line, pauses, rates):
    f, expl = feats(line, pauses)
    m = rates.get(line.get('speaker', 'narrator'), rates['*'])
    return max(0.3, float(np.dot(f, m['coef'])) + expl)


def main():
    a = sys.argv[1:]
    if '--calibrate' in a:
        return calibrate()
    ep = int(a[a.index('--ep') + 1])
    path = os.path.join(ROOT, 'script', f'ep{ep:02d}.en.json')
    sc = json.load(open(path))
    rates = json.load(open(RATES))
    tot = 0.0
    for l in sc['lines']:
        if l.get('voice') is False:
            tot += l.get('est', 0)
            continue
        v = round(predict(l, sc.get('voice', {}).get('pauses', {}), rates), 2)
        d = (l.get('pre', 120) + l.get('post', 350)) / 1000 + v - l.get('jcut', 0) / 1000 - (l.get('lcut', 0) + (l.get('post', 350) if l.get('lcut') else 0)) / 1000
        tot += d
        print(f'  {l["id"]:10s} voice ≈ {v:5.2f} s  line {d:5.2f} s  {len(l["text"].split()):2d} w  {len(l["text"].split()) / v:.2f} w/s')
        if '--write' in a:
            l['estVoice'] = v
            l['est'] = round(d, 2)
    print(f'ep {ep}: ≈ {tot + sc.get("timing", {}).get("tail", 0):.1f} s')
    if '--write' in a:
        json.dump(sc, open(path, 'w'), indent=2, ensure_ascii=False)
        open(path, 'a').write('\n')


if __name__ == '__main__':
    main()
