#!/usr/bin/env python3
"""Fit a candidate's lines inside the line windows of an existing timeline (the pictures and captions are already rendered).

    venv/bin/python fit.py segment --dir DIR            # for an engine with no chunk sidecar (Chatterbox): find the pauses
    venv/bin/python fit.py fit --dir DIR --out FITDIR   # → FITDIR/<id>.wav (starts at the line's speechStart), FITDIR/fit.json
    venv/bin/python fit.py narration --dir DIR --out X.wav   # the lines in order with the timeline's gaps (no fitting)

Rules of the fit:
  · every punctuation group of the new line starts where the same words start in the old voice (old chunk times, from
    voice/epNN/en/<id>.json), so the rendered captions re-synchronise at every pause;
  · a group that is too long for its slot is sped up, a group more than 8 % short is slowed, never by more than ±8 %
    (ffmpeg atempo, pitch kept); nothing is ever cut: what still does not fit pushes the following group later and is reported;
  · DROP-IN: a fitted file has exactly the old file's length (same sample count), so tools/timeline.mjs rebuilds the
    identical timeline (same signature), the two real silences stay as they are, and mix / gate / soundcheck run unchanged.
"""
import argparse, json, os
import numpy as np
import soundfile as sf
from scipy import signal as sps
from lib import ROOT, script, timeline, old_meta, atempo, silences, norm_rms, trim
from kd import parse

MAXF = 1.08
GAP = 0.06


def segment(d, ep=44):
    """Write <id>.json for wavs that have none: groups split at the punctuation where the audio has a silence."""
    for line in script(ep)['lines']:
        p = f"{d}/{line['id']}.wav"
        if line.get('voice') is False or not os.path.exists(p):
            continue
        x, sr = sf.read(p, dtype='float32')
        words, bounds = parse(line.get('say', line['text']))
        sil = silences(x, sr, min_len=0.07, rel_db=-30)
        D, nchar, used, cuts = len(x) / sr, len(' '.join(words)), set(), []
        for b in bounds:
            frac = len(' '.join(words[:b['j'] + 1])) / nchar
            best = None
            for i, (s0, s1) in enumerate(sil):
                dd = abs((s0 + s1) / 2 / D - frac)
                if i not in used and dd < 0.16 and (best is None or dd < best[0]):
                    best = (dd, i)
            if best:
                used.add(best[1])
                cuts.append((sil[best[1]], b))
        cuts.sort(key=lambda c: c[0][0])
        chunks, t, w0 = [], 0.0, 0
        for (s0, s1), b in cuts:
            chunks.append({'t0': round(t, 4), 't1': round(s0 + 0.03, 4), 'words': b['j'] + 1 - w0, 'text': ' '.join(words[w0:b['j'] + 1]), 'pause_ms': int(1000 * (s1 - s0 - 0.05))})
            t, w0 = s1 - 0.02, b['j'] + 1
        chunks.append({'t0': round(t, 4), 't1': round(D, 4), 'words': len(words) - w0, 'text': ' '.join(words[w0:]), 'pause_ms': 0})
        json.dump({'speaker': 'narrator', 'chunks': chunks, 'punct_without_silence': len(bounds) - len(cuts)}, open(f"{d}/{line['id']}.json", 'w'), indent=1)


def fit(d, out, ep=44):
    os.makedirs(out, exist_ok=True)
    tl, sc = timeline(ep), {l['id']: l for l in script(ep)['lines']}
    L = [l for l in tl['lines'] if l.get('voice')]
    rep = {'lines': [], 'starts': {}, 'speech_ends': {}}
    for i, l in enumerate(L):
        lid = l['id']
        x, sr = sf.read(f'{d}/{lid}.wav', dtype='float32')
        new = json.load(open(f'{d}/{lid}.json'))['chunks']
        old = old_meta(ep, lid)['chunks']
        nxt = tl['lines'][tl['lines'].index(l) + 1] if tl['lines'].index(l) + 1 < len(tl['lines']) else None
        oi = sf.info(f"{ROOT}/{l['voice']}")
        assert oi.samplerate == sr, 'the candidate must be at the old file\'s sample rate'
        limit = oi.frames / sr                          # DROP-IN: the new file is exactly as long as the old one, so
        #                                                 tools/timeline.mjs gives the same timeline and signature
        # old groups that hold the same words as each new segment
        groups, k = [], 0
        for c in new:
            n, k0 = 0, k
            while k < len(old) and n < c['words']:
                n += old[k]['words']
                k += 1
            if n != c['words']:
                groups = None
                break
            groups.append((old[k0]['t0'], old[k - 1]['t1'], sum(o['t1'] - o['t0'] for o in old[k0:k])))
        if groups is None:       # the pauses fell elsewhere: fit the line as one block
            new = [{'t0': new[0]['t0'], 't1': new[-1]['t1'], 'words': sum(c['words'] for c in new)}]
            groups = [(old[0]['t0'], old[-1]['t1'], sum(o['t1'] - o['t0'] for o in old))]
        y = np.zeros(int((limit + 3) * sr), np.float32)
        t, rows, chunks = 0.0, [], []
        for j, (c, (g0, g1, gs)) in enumerate(zip(new, groups)):
            a = x[int(c['t0'] * sr): int(c['t1'] * sr)]
            nz = np.nonzero(np.abs(a) > 0.004)[0]           # the group's silent tail is not speech: it may hang over
            if len(nz):
                a = a[:min(len(a), nz[-1] + int(0.03 * sr))].copy()
                a[-int(0.01 * sr):] *= np.linspace(1, 0, int(0.01 * sr))
            dur = len(a) / sr
            start = max(g0, t)
            avail = (groups[j + 1][0] - GAP if j + 1 < len(groups) else limit) - start
            f = 1.0
            if dur > avail:
                f = min(MAXF, 1.012 * dur / avail)
            elif dur < (g1 - g0) / MAXF and j + 1 < len(groups):
                f = max(1 / MAXF, dur / (g1 - g0))
            if f != 1.0:
                a = atempo(a, sr, f)
                dur = len(a) / sr
            i0 = int(start * sr)
            y[i0:i0 + len(a)] += a
            chunks.append({'t0': round(start, 4), 't1': round(start + dur, 4), 'words': c['words'], 'text': c.get('text', '')})
            rows.append({'old_start': round(g0, 3), 'start': round(start, 3), 'late_s': round(start - g0, 3), 'tempo': round(f, 3), 'dur': round(dur, 3), 'old_span': round(g1 - g0, 3)})
            t = start + dur + GAP
        end = t - GAP
        over = max(0.0, end - limit)
        n_old = oi.frames
        if over > 0:                                    # never cut a word: keep it whole and report (the file is then longer)
            y = y[:int((end + 0.02) * sr)]
        else:
            y = y[:n_old]
        sf.write(f'{out}/{lid}.wav', y, sr)
        json.dump({'speaker': 'narrator', 'chunks': chunks}, open(f'{out}/{lid}.json', 'w'), indent=1)
        rep['lines'].append({'id': lid, 'old_speech_s': round(l['speechEnd'] - l['speechStart'], 3), 'new_speech_s': round(end, 3), 'limit_s': round(limit, 3),
                             'over_s': round(over, 3), 'max_tempo_dev_pct': round(100 * max(abs(r['tempo'] - 1) for r in rows), 1),
                             'max_group_late_s': round(max(r['late_s'] for r in rows), 3), 'groups': rows, 'fits': over < 1e-3})
        rep['speech_ends'][lid] = round(l['speechStart'] + end, 4)
    rep['lines_not_fitting'] = [r['id'] for r in rep['lines'] if not r['fits']]
    rep['worst_over_s'] = max(r['over_s'] for r in rep['lines'])
    rep['max_tempo_dev_pct'] = max(r['max_tempo_dev_pct'] for r in rep['lines'])
    rep['max_group_late_s'] = max(r['max_group_late_s'] for r in rep['lines'])
    json.dump(rep, open(f'{out}/fit.json', 'w'), indent=1)
    return rep


def narration(d, out, ep=44):
    tl = timeline(ep)
    L = [l for l in tl['lines'] if l.get('voice')]
    parts = [np.zeros(int(48000 * 0.3), np.float32)]
    for i, l in enumerate(L):
        x, sr = sf.read(f"{d}/{l['id']}.wav", dtype='float32', always_2d=True)
        x = sps.resample_poly(x.mean(1), 48000 // np.gcd(48000, sr), sr // np.gcd(48000, sr)).astype(np.float32)
        gap = (L[i + 1]['speechStart'] - l['speechEnd']) if i + 1 < len(L) else 0.3
        parts += [x, np.zeros(int(48000 * gap), np.float32)]
    y = np.concatenate(parts)
    sf.write(out, y, 48000, subtype='PCM_16')
    return len(y) / 48000


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd'); ap.add_argument('--dir', required=True); ap.add_argument('--out'); ap.add_argument('--ep', type=int, default=44)
    a = ap.parse_args()
    if a.cmd == 'segment':
        segment(a.dir, a.ep)
    elif a.cmd == 'fit':
        r = fit(a.dir, a.out, a.ep)
        for row in r['lines']:
            print({k: v for k, v in row.items() if k != 'groups'})
        print('not fitting:', r['lines_not_fitting'], '· worst over', r['worst_over_s'], 's · max tempo change', r['max_tempo_dev_pct'], '% · latest group start', r['max_group_late_s'], 's')
    elif a.cmd == 'narration':
        print(round(narration(a.dir, a.out, a.ep), 2), 's')
