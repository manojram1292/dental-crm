#!/usr/bin/env python3
"""Objective comparison of narration candidates. PROXIES ONLY: nobody listened; the owner's ear decides.

    venv/bin/python measure.py --cand NAME=DIR[,FITDIR] ... --out metrics.json [--whisper base.en] [--no-asr]

Per candidate (DIR/<id>.wav, one file per script line):
  pitch      per line: 5th–95th percentile range and standard deviation of F0 in semitones (Praat autocorrelation, 10 ms),
             mean |slope|; "melody sameness" = mean correlation between the time-normalised F0 contours of different lines
             (1 = every sentence has the same tune)
  pauses     silences ≥ 70 ms inside lines (30 dB under the line's loud level): count, median, spread
  rate       syllables per second of speech (pauses taken out) per line; coefficient of variation across lines
  spectrum   share of energy per band over all the speech, centroid, sibilance (5–9 kHz) share
  ASR        faster-whisper transcript per line against the script: word error rate without the names, and what was
             heard in place of each Sanskrit name
  sync       (FITDIR) for the fitted lines: the recogniser's word start times against the caption word times in the timeline
"""
import argparse, json, os, re
import numpy as np
import soundfile as sf
from lib import ROOT, script, timeline, f0_stats, bands, silences, NAMES

NAME_SET = {n.lower() for n in NAMES if n[0].isupper()}
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower().replace('’', "'")).split()


def syllables(text):
    n = 0
    for w in norm(text):
        w = w.strip("'")
        g = re.findall(r'[aeiouy]+', w)
        k = len(g)
        if w.endswith('e') and not w.endswith(('le', 'ee')) and k > 1:
            k -= 1
        if w.endswith('ed') and not w.endswith(('ted', 'ded')) and k > 1:
            k -= 1
        n += max(1, k)
    return n


def contour(x, sr, n=30):
    import parselmouth
    f = parselmouth.Sound(x.astype(np.float64), sampling_frequency=sr).to_pitch_ac(time_step=0.01, pitch_floor=55, pitch_ceiling=330).selected_array['frequency']
    v = np.nonzero(f > 0)[0]
    if len(v) < 10:
        return None
    st = 12 * np.log2(f[v] / np.median(f[v]))
    c = np.interp(np.linspace(v[0], v[-1], n), v, st)
    return (c - c.mean()) / (c.std() + 1e-9)


def align(ref, hyp):
    """Levenshtein alignment → [(ref word or None, hyp word or None)]."""
    R, H = len(ref), len(hyp)
    D = np.zeros((R + 1, H + 1), int)
    D[:, 0], D[0, :] = np.arange(R + 1), np.arange(H + 1)
    for i in range(1, R + 1):
        for j in range(1, H + 1):
            D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]))
    out, i, j = [], R, H
    while i or j:
        if i and j and D[i, j] == D[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]):
            out.append((i - 1, j - 1)); i, j = i - 1, j - 1
        elif i and D[i, j] == D[i - 1, j] + 1:
            out.append((i - 1, None)); i -= 1
        else:
            out.append((None, j - 1)); j -= 1
    return out[::-1]


def measure(name, d, fitd, asr, ep=44):
    sc, tl = script(ep), timeline(ep)
    TL = {l['id']: l for l in tl['lines']}
    rows, conts, allx, pauses = [], [], [], []
    errs = words_n = 0
    heard, sync = [], []
    for line in sc['lines']:
        p = f"{d}/{line['id']}.wav"
        if line.get('voice') is False or not os.path.exists(p):
            continue
        x, sr = sf.read(p, dtype='float32', always_2d=True)
        x = x.mean(1)
        sil = [(a, b) for a, b in silences(x, sr, min_len=0.07, rel_db=-30)]
        speech = len(x) / sr - sum(b - a for a, b in sil)
        f0 = f0_stats(x, sr) or {}
        c = contour(x, sr)
        if c is not None:
            conts.append(c)
        pauses += [round(b - a, 3) for a, b in sil]
        allx.append(x / (np.sqrt(np.mean(x[np.abs(x) > 0.005] ** 2)) + 1e-9))
        row = {'id': line['id'], 'dur_s': round(len(x) / sr, 2), 'pauses': len(sil), 'pause_s': round(sum(b - a for a, b in sil), 2),
               'syll_per_s': round(syllables(line['text']) / speech, 2), **f0}
        if asr:
            segs, _ = asr.transcribe(p, word_timestamps=True, beam_size=5, condition_on_previous_text=False)
            ws = [w for s in segs for w in s.words]
            hyp = [h for w in ws for h in norm(w.word)]
            ref = norm(line['text'])
            row['heard'] = ' '.join(w.word.strip() for w in ws)
            al = align(ref, hyp)
            for i, j in al:
                r, h = (ref[i] if i is not None else None), (hyp[j] if j is not None else None)
                if r is not None and r in NAME_SET:
                    continue
                if r is None and any(i2 is not None and ref[i2] in NAME_SET for i2, _ in al[max(0, al.index((i, j)) - 1): al.index((i, j)) + 2]):
                    continue        # an extra word next to a name is part of how the name was heard
                words_n += r is not None
                errs += r != h
            for k, (i, j) in enumerate(al):
                if i is not None and ref[i] in NAME_SET:
                    got = [hyp[j]] if j is not None else []
                    q = k + 1
                    while q < len(al) and al[q][0] is None:
                        got.append(hyp[al[q][1]]); q += 1
                    q = k - 1
                    while q >= 0 and al[q][0] is None:
                        got.insert(0, hyp[al[q][1]]); q -= 1
                    heard.append({'line': line['id'], 'name': ref[i], 'heard': ' '.join(got) or '(nothing)'})
            row['line_errors'] = sum(1 for i, j in al if (ref[i] if i is not None else None) != (hyp[j] if j is not None else None))
        rows.append(row)
        if asr and fitd and os.path.exists(f"{fitd}/{line['id']}.wav"):
            segs, _ = asr.transcribe(f"{fitd}/{line['id']}.wav", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
            ws = [w for s in segs for w in s.words]
            cw = TL[line['id']].get('words') or []
            if cw:
                hyp = [(norm(w.word) or ['?'])[0] for w in ws]
                ref = [(norm(w['w']) or ['?'])[0] for w in cw]
                t0 = TL[line['id']]['speechStart']
                for i, j in align(ref, hyp):
                    if i is not None and j is not None:
                        sync.append({'line': line['id'], 'w': cw[i]['w'], 'd': round(t0 + ws[j].start - cw[i]['t0'], 3)})
    X = np.concatenate(allx)
    cc = [float(np.dot(conts[i], conts[j]) / len(conts[i])) for i in range(len(conts)) for j in range(i + 1, len(conts))]
    rate = np.array([r['syll_per_s'] for r in rows])
    rng = np.array([r['range_st'] for r in rows if 'range_st' in r])
    sd = np.array([r['sd_st'] for r in rows if 'sd_st' in r])
    out = {'name': name, 'dir': os.path.relpath(d, ROOT), 'lines': rows,
           'pitch': {'median_hz': round(float(np.median([r['median_hz'] for r in rows if 'median_hz' in r])), 1),
                     'range_st_mean': round(float(rng.mean()), 2), 'range_st_min': round(float(rng.min()), 2), 'range_st_max': round(float(rng.max()), 2),
                     'sd_st_mean': round(float(sd.mean()), 2), 'sd_of_line_ranges': round(float(rng.std()), 2),
                     'slope_st_s_mean': round(float(np.mean([r['slope_st_s'] for r in rows if 'slope_st_s' in r])), 1),
                     'melody_sameness': round(float(np.mean(cc)), 3)},
           'pauses': {'count': len(pauses), 'median_s': round(float(np.median(pauses)), 3) if pauses else 0, 'sd_s': round(float(np.std(pauses)), 3) if pauses else 0,
                      'min_s': min(pauses, default=0), 'max_s': max(pauses, default=0), 'all_s': sorted(pauses)},
           'rate': {'syll_per_s_mean': round(float(rate.mean()), 2), 'cv_pct': round(float(100 * rate.std() / rate.mean()), 1), 'min': float(rate.min()), 'max': float(rate.max())},
           'spectrum': bands(X, sr), 'sample_rate': sr}
    if asr:
        out['asr'] = {'words': int(words_n), 'errors': int(errs), 'wer_pct_without_names': round(100 * errs / max(1, words_n), 1), 'names': heard}
    if sync:
        dd = np.array([s['d'] for s in sync])
        out['sync'] = {'words': len(sync), 'median_s': round(float(np.median(dd)), 3), 'median_abs_s': round(float(np.median(np.abs(dd))), 3),
                       'p90_abs_s': round(float(np.percentile(np.abs(dd), 90)), 3), 'max_abs_s': round(float(np.abs(dd).max()), 3),
                       'worst': sorted(sync, key=lambda s: -abs(s['d']))[:5]}
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--cand', action='append', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--whisper', default='base.en'); ap.add_argument('--no-asr', action='store_true')
    a = ap.parse_args()
    asr = None
    if not a.no_asr:
        from faster_whisper import WhisperModel
        asr = WhisperModel(a.whisper, device='cpu', compute_type='int8', cpu_threads=2,
                           download_root=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'models', 'whisper'))
    res = json.load(open(a.out)) if os.path.exists(a.out) else {}
    for c in a.cand:
        name, _, dirs = c.partition('=')
        d, _, fitd = dirs.partition(',')
        m = measure(name, d, fitd or None, asr)
        res[name] = m
        print(name, json.dumps({k: v for k, v in m.items() if k in ('pitch', 'pauses', 'rate', 'spectrum')}))
        if 'asr' in m:
            print('   WER', m['asr']['wer_pct_without_names'], '%', [(n['name'], n['heard']) for n in m['asr']['names']])
            for r in m['lines']:
                print('    ', r['id'], '|', r.get('heard'))
        if 'sync' in m:
            print('   sync', {k: v for k, v in m['sync'].items() if k != 'worst'})
        json.dump(res, open(a.out, 'w'), indent=1)
