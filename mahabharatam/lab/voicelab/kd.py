#!/usr/bin/env python3
"""Candidate B: Kokoro, directed. Same engine and NAMES table as tools/voice.py, used differently:

  1. ONE PASS PER LINE. tools/voice.py cuts a line at every comma and [p:N] and synthesises each piece as its own
     utterance, so every piece starts its melody again. Here the whole sentence goes through the model once (it plans the
     intonation over the sentence); the pauses the model makes at punctuation are then found in the audio and lengthened
     to the directed length. A [p:N] with no punctuation is not cut (there is no silence to cut in).
  2. PACE BY MEANING, from fields the scripts already have: hook quicker; a line after a real silence ("rest": the turn,
     grief) slower; an intimate line (mixDb ≤ −4) slower; a peak (mixDb ≥ 1) quicker; music "joy" a little quicker.
  3. PAUSES BY PUNCTUATION: comma 150 ms, colon/semicolon 240, sentence end inside a line 420, plus the script's [p:N].
  4. Voice: any Kokoro voice or a blend ("am_michael:0.6+bm_george:0.4").

    venv/bin/python kd.py --voice SPEC --out DIR [--base 0.86] [--ep 44] [--fit]
With --fit each line is re-synthesised at the speed that makes its speech as long as the line's speech in the existing
timeline (÷ the pace-by-meaning factor), for fit.py.
Writes DIR/<id>.wav (24 kHz) + DIR/<id>.json (segments: t0, t1, words, text; speed) + DIR/log.json (compute seconds).
"""
import argparse, json, os, re, time
import numpy as np
import soundfile as sf
from lib import (ROOT, kokoro, style, phonemes, trim, silences, norm_rms, spoken_lines, old_meta, cast, SR_K)

PAUSE = {',': 150, ';': 240, ':': 240, '.': 420, '?': 420, '!': 420, '…': 420, '—': 280}
MARK = re.compile(r'\[p:(\d+)\]|\{s(?::[\d.]+)?\}')


def parse(say):
    """→ (text without marks, [boundary after word index j: {'j', 'ms'}]) for punctuation inside the line."""
    toks = MARK.sub(lambda m: f' ⟦{m.group(1) or 0}⟧ ', say).split()
    words, bounds = [], []
    for tk in toks:
        if tk.startswith('⟦'):
            if bounds and bounds[-1]['j'] == len(words) - 1:
                bounds[-1]['ms'] += int(tk[1:-1])       # [p:N] after punctuation: added to the punctuation's pause
            continue
        words.append(tk)
        core = tk.rstrip('"”’)')
        if core and core[-1] in PAUSE:
            bounds.append({'j': len(words) - 1, 'ms': PAUSE[core[-1]]})
    bounds = [b for b in bounds if b['j'] < len(words) - 1]
    return words, bounds


def pace(line):
    m = 1.0
    if line.get('role') == 'hook':
        m *= 1.10
    if line.get('rest'):
        m *= 0.94
    if line.get('mixDb', 0) <= -4:
        m *= 0.96
    if line.get('mixDb', 0) >= 1:
        m *= 1.06
    if line.get('music') == 'joy':
        m *= 1.03
    return round(m, 3)


def synth(words, bounds, voice, speed, g2p, _depth=0):
    """One pass; → [(audio, words in it, pause after ms)]. Splits only where the model itself left a silence."""
    text = ' '.join(words)
    ph = phonemes(text, g2p)
    x, sr = kokoro().create(ph, voice=voice, speed=speed, is_phonemes=True, sentence_pause=0, clause_pause=0)
    x = trim(x, sr, 0.02, 0.08)
    sil = silences(x, sr, min_len=0.045, rel_db=-30)
    D = len(x) / sr
    cuts, used = [], set()
    nchar = len(text)
    for b in bounds:
        frac = len(' '.join(words[:b['j'] + 1])) / nchar
        best = None
        for i, (s0, s1) in enumerate(sil):
            if i in used:
                continue
            d = abs((s0 + s1) / 2 / D - frac)
            if d < 0.16 and (best is None or d < best[0]):
                best = (d, i)
        if best:
            used.add(best[1])
            cuts.append((sil[best[1]], b))
    if len(cuts) < len(bounds) and _depth == 0:
        # the model ran over a punctuation mark without a silence: synthesise the punctuation groups one by one (as tools/voice.py does)
        segs, w0 = [], 0
        for b in bounds + [{'j': len(words) - 1, 'ms': 0}]:
            g, _ = synth(words[w0:b['j'] + 1], [], voice, speed, g2p, 1)
            segs.append([g[0][0], words[w0:b['j'] + 1], b['ms']])
            w0 = b['j'] + 1
        return segs, len(bounds) - len(cuts)
    cuts.sort(key=lambda c: c[0][0])
    segs, t, w0 = [], 0.0, 0
    for (s0, s1), b in cuts:
        a = x[int(t * sr): int((s0 + 0.03) * sr)]
        segs.append([a, words[w0:b['j'] + 1], max(b['ms'], int(1000 * (s1 - s0)) - 50)])
        t, w0 = s1 - 0.02, b['j'] + 1
    segs.append([x[int(t * sr):], words[w0:], 0])
    for s in segs:   # 8 ms fades at the cut points
        n = int(0.008 * sr)
        s[0] = s[0].copy()
        s[0][:n] *= np.linspace(0, 1, n)
        s[0][-n:] *= np.linspace(1, 0, n)
    return segs, len(bounds) - len(cuts)


def write_line(out, lid, segs, meta_extra):
    pieces, meta, t = [], [], 0.0
    for a, w, p in segs:
        d = len(a) / SR_K
        meta.append({'t0': round(t, 4), 't1': round(t + d, 4), 'words': len(w), 'text': ' '.join(w), 'pause_ms': p})
        pieces += [a, np.zeros(int(SR_K * p / 1000), np.float32)]
        t += d + p / 1000
    x = norm_rms(np.concatenate(pieces))
    sf.write(f'{out}/{lid}.wav', x, SR_K)
    json.dump({**meta_extra, 'chunks': meta}, open(f'{out}/{lid}.json', 'w'), indent=1)
    return len(x) / SR_K


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', default='am_michael'); ap.add_argument('--out', required=True); ap.add_argument('--base', type=float, default=0.86)
    ap.add_argument('--ep', type=int, default=44); ap.add_argument('--fit', action='store_true'); ap.add_argument('--g2p', default=None)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    g2p = a.g2p or ('en-gb' if a.voice.startswith('b') else 'en-us')
    t0 = time.time()
    st = style(a.voice)
    log = {'voice': a.voice, 'base': a.base, 'g2p': g2p, 'fit': a.fit, 'load_s': round(time.time() - t0, 1), 'lines': []}
    for line in spoken_lines(a.ep):
        if line.get('speaker', 'narrator') != 'narrator':
            continue
        t = time.time()
        words, bounds = parse(line.get('say', line['text']))
        m = pace(line)
        sp = a.base * m
        segs, missed = synth(words, bounds, st, sp, g2p)
        passes = 1
        if a.fit:
            # the speed that makes the speech as long as the speech it replaces, but never more than ±8 % from the directed
            # speed: a line that is still shorter keeps its pace and gets longer pauses (fit.py starts each group on its old time)
            old = old_meta(a.ep, line['id'])['chunks']
            target = 0.97 * sum(c['t1'] - c['t0'] for c in old)
            cur = sum(len(s[0]) for s in segs) / SR_K
            sp2 = float(np.clip(sp * cur / target, sp * 0.92, sp * 1.08))
            if abs(sp2 / sp - 1) > 0.015:
                sp = sp2
                segs, missed = synth(words, bounds, st, sp, g2p)
                passes += 1
        d = write_line(a.out, line['id'], segs, {'speaker': 'narrator', 'voice': a.voice, 'speed': round(sp, 3), 'pace': m, 'pitch': 0})
        row = {'id': line['id'], 'speed': round(sp, 3), 'pace': m, 'segments': len(segs), 'punct_without_silence': missed, 'audio_s': round(d, 2),
               'compute_s': round(time.time() - t, 1), 'passes': passes}
        log['lines'].append(row)
        print(row, flush=True)
    log['total_s'] = round(time.time() - t0, 1)
    json.dump(log, open(f'{a.out}/log.json', 'w'), indent=1)
