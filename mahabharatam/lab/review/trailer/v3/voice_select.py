"""Trailer v3 · choose one take per clip and write voice/ep97/en/<shot>.wav + <shot>.json.

    lab/voicelab/venv/bin/python lab/review/trailer/v3/voice_select.py TAKES_DIR [--report-only]

What changed from v2, and why (the owner heard words "get stuck" and a voice that was not one voice):
  · a sentence is ONE clip and is never cut into two files (the picture cuts inside it; see scenes.js `multi`);
  · ONE VOICE: every take's median pitch is compared with the median of the whole set; a take more than 2 semitones away is
    rejected (a quiet line may not sit above the set at all: +0.5 at most);
  · the recogniser is a FLOOR (a take must be heard as well as the best take of its clip), not the selector. Among the takes
    that pass, the choice is for evenness and warmth, each measured: few pitch jumps (frames more than 3 semitones from the
    frame before), no creak (voiced frames under 75 Hz), harmonics over noise (Praat HNR), low jitter, a pitch range that is
    neither flat nor wild (8–15 semitones wanted), a pitch near the set's, a name the recogniser wrote nearly, how surely the recogniser heard the least sure word (a swallowed consonant
    shows there), and a tail that has died away by itself;
  · NO TIME-STRETCH. A "slow" line is the slowest take that passes;
  · edges: 30 ms of the take's own air before the first sound and up to 200 ms after the last, with 20 ms fades; nothing is
    cut hard. A pause inside a sentence longer than 0.33 s is shortened to 0.33 s at its quietest point with a 12 ms cross-fade
    (listed in select.json);
  · word times for the captions: the recogniser run again on the FINAL file.
Nobody has listened to any of this: every number in select.json is a measurement, not a judgement of how it sounds.
"""
import difflib, glob, hashlib, json, os, re, sys
import numpy as np, soundfile as sf, parselmouth
from parselmouth.praat import call
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from clips import CLIPS, SCRIPT_TEXT, REF
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LAB = f'{ROOT}/lab/voicelab'
from faster_whisper import WhisperModel
TAKES = sys.argv[1]
OUT = f'{ROOT}/voice/ep97/en'
SR = 24000
asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=2, download_root=f'{LAB}/venv/models/whisper')
NAMES = {'bhima', 'krishna', 'duryodhana', 'arjuna', 'bhishma', 'karna', "karna's", 'itihasa', 'iti', 'ha', 'asa', 'aasa'}
SAME = {'steaks': 'stakes', '13': 'thirteen', '1': 'one', 'firstborn': 'first born', 'needlepoint': 'needle point', '100': 'hundred', '5': 'five'}
norm = lambda s: ' '.join(SAME.get(w, w) for w in re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ').replace('’', "'")).split()).split()
CACHE = f'{TAKES}/asr_cache.json'; _c = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
OVERRIDE = json.load(open(f'{HERE}/voice/override.json')) if os.path.exists(f'{HERE}/voice/override.json') else {}
QUIET = {k for k, v in CLIPS.items() if v[1] == 'slow'} | {'cloth1', 'cloth2', 'bow', 'nothing'}


def active(x, th=0.035):
    w = int(0.02 * SR); e = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(w) / w, 'same')); return e, e > th * e.max()


def hear_x(x, key=None):
    k = key or hashlib.sha1(x.tobytes()).hexdigest()[:16]
    if k in _c: return _c[k]
    segs, _ = asr.transcribe(x.astype(np.float32) if SR == 16000 else parselmouth.Sound(x.astype(np.float64), SR).resample(16000).values[0].astype(np.float32), beam_size=5, condition_on_previous_text=False, word_timestamps=True); segs = list(segs)
    _c[k] = [' '.join(s.text.strip() for s in segs), [[w.word.strip(), float(w.start), float(w.end), float(w.probability)] for s in segs for w in (s.words or [])]]
    json.dump(_c, open(CACHE, 'w')); return _c[k]


def measure(x):
    snd = parselmouth.Sound(x.astype(np.float64), SR); f0 = snd.to_pitch(0.01, 55, 350).selected_array['frequency']; v = f0[f0 > 0]
    e, act = active(x); nz = np.nonzero(act)[0]; edb = 20 * np.log10(e[act] + 1e-9)
    if len(v) < 8: return {'f0': 0.0, 'st': 0.0, 'edb': 0.0, 'dur': round((nz[-1] - nz[0]) / SR, 2), 'jumps': 9.0, 'creak': 1.0, 'hnr': 0.0, 'jitter': 9.0, 'tail_db': 0.0}
    st = 12 * np.log2(np.where(f0 > 0, f0, np.nan)); d = np.abs(np.diff(st))
    hn = snd.to_harmonicity_cc(0.01, 60).values; hn = hn[hn > -100]
    pp = call(snd, 'To PointProcess (periodic, cc)', 55, 350); jit = call(pp, 'Get jitter (local)', 0, 0, 0.0001, 0.02, 1.3)
    tail = e[max(0, len(e) - int(0.02 * SR)):].mean() / (e.max() + 1e-9)   # what is left in the last 20 ms: a take cut off mid-sound is not −30 dB there
    return {'f0': round(float(np.median(v)), 1), 'st': round(float(12 * np.log2(np.percentile(v, 95) / np.percentile(v, 5))), 1), 'edb': round(float(np.percentile(edb, 95) - np.percentile(edb, 10)), 1),
            'dur': round((nz[-1] - nz[0]) / SR, 2), 'jumps': round(float(np.nansum(d > 3) / (len(v) / 100)), 2), 'creak': round(float((v < 75).mean()), 3), 'hnr': round(float(hn.mean()), 1) if len(hn) else 0.0,
            'jitter': round(float(jit) * 100 if jit == jit else 9.0, 2), 'tail_db': round(float(20 * np.log10(tail + 1e-6)), 1)}


def errors(ref, hyp):
    r = [w for w in ref if w not in NAMES]; sm = difflib.SequenceMatcher(a=r, b=hyp, autojunk=False)
    return len(r) - sum(b.size for b in sm.get_matching_blocks()), max(0, len(hyp) - len(ref) - 1)


def name_fit(ref, hyp):
    """How nearly the recogniser wrote each name of the line (1 = letter for letter). It has never seen these names: this only
    ranks takes of one clip against each other."""
    ns = [w for w in ref if w in NAMES]
    return float(np.mean([max([difflib.SequenceMatcher(a=n, b=h).ratio() for h in hyp] or [0]) for n in ns])) if ns else 1.0


def bursts(y, min_gap=0.09):
    _, act = active(y, th=0.06); out = []; i = 0; n = len(y)
    while i < n:
        if act[i]:
            j = i; last = i
            while j < n and (act[j] or j - last < int(min_gap * SR)):
                if act[j]: last = j
                j += 1
            out.append((i, last + 1)); i = j
        else: i += 1
    return [b for b in out if (b[1] - b[0]) / SR > 0.08]


def warmth(m, kind, med_dur, minprob):
    """Higher is better. Evenness and warmth, from measurements only."""
    s = 1.2 * m['hnr'] - 6.0 * m['jumps'] - 60 * m['creak'] - 2.0 * m['jitter'] - 0.5 * max(0, 8 - m['st']) - 0.6 * max(0, m['st'] - 15) + 8 * minprob - 0.25 * max(0, m['tail_db'] + 30)
    if kind == 'slow': s += 10 * (m['dur'] / med_dur - 1)
    elif kind in ('hard',): s -= 12 * (m['dur'] / med_dur - 1)
    else: s -= 12 * (m['dur'] / med_dur - 1)   # the film has 90 s: of two takes equally even, the brisker
    return round(float(s), 2)


# ── 1 · measure every take ──
rows = {}
for cid, (text, kind, off, ex, n) in CLIPS.items():
    rows[cid] = []
    for f in sorted(glob.glob(f'{TAKES}/{cid}.s*.wav'), key=lambda q: int(q.split('.s')[-1][:-4])):
        x, sr = sf.read(f, dtype='float32'); assert sr == SR
        heard, words = hear_x(x, os.path.basename(f)); m = measure(x); miss, extra = errors(norm(text), norm(heard))
        rows[cid].append({'take': os.path.basename(f), 'heard': heard, 'missed': miss, 'extra': extra, 'minprob': round(min([w[3] for w in words] or [0]), 2), **m, 'x': x})
    if not rows[cid]: print('NO TAKES', cid)
allf0 = [r['f0'] for c in rows.values() for r in c if r['f0'] > 0 and r['missed'] == 0]
SETMED = float(np.median(allf0)); st_of = lambda f: 12 * np.log2(max(f, 1) / SETMED)
print(f'set median pitch {SETMED:.1f} Hz over {len(allf0)} takes; takes within ±2 semitones: {sum(abs(st_of(f)) <= 2 for f in allf0)}')

# ── 2 · choose ──
chosen, report = {}, []
for cid, (text, kind, off, ex, n) in CLIPS.items():
    R_ = rows[cid]
    if not R_: continue
    med = float(np.median([r['dur'] for r in R_]))
    for r in R_:
        r['bad'] = r['missed'] + 2 * r['extra'] + (3 if r['dur'] > 1.5 * med or r['dur'] < 0.65 * med else 0); r['dst'] = round(st_of(r['f0']), 2); r['name_fit'] = round(name_fit(norm(text), norm(r['heard'])), 2); r['score'] = round(warmth(r, kind, med, r['minprob']) + 10 * r['name_fit'] - 2.0 * abs(r['dst']), 2)
        if kind == 'parts': r['bad'] = 0 if len(bursts(r['x'])) == 3 else 5
    floor = min(r['bad'] for r in R_)
    hi = 0.5 if cid in QUIET else 2.0
    ok = [r for r in R_ if r['bad'] == floor and -2.0 <= r['dst'] <= hi]
    widened = None
    if not ok:   # no take inside the window: the nearest in pitch among those the recogniser passes (said in the report)
        ok = sorted([r for r in R_ if r['bad'] == floor], key=lambda r: abs(r['dst']))[:1]; widened = f"no take within the pitch window; nearest is {ok[0]['dst']:+.1f} st"
    best = max(ok, key=lambda r: r['score'])
    if cid in OVERRIDE: best = next(r for r in R_ if r['take'].endswith(f".s{OVERRIDE[cid][0]}.wav"))
    chosen[cid] = best
    report.append({'clip': cid, 'text': text, 'kind': kind, 'chosen': best['take'], 'passed_floor_and_pitch': len(ok), 'of': len(R_), **({'note': widened} if widened else {}), **({'chosen_by_hand': OVERRIDE[cid][1]} if cid in OVERRIDE else {}),
                   'takes': [{k: v for k, v in r.items() if k != 'x'} for r in R_]})
    print(cid.ljust(9), '→', best['take'].ljust(16), f"f0 {best['f0']:6.1f} ({best['dst']:+.1f} st) range {best['st']:4.1f} hnr {best['hnr']:4.1f} jumps {best['jumps']:.2f} creak {best['creak']:.2f} dur {best['dur']:.2f} pass {len(ok)}/{len(R_)}{' !! ' + widened if widened else ''} | {best['heard']}", flush=True)
if '--report-only' in sys.argv:
    json.dump({'set_median_hz': SETMED, 'clips': report}, open(f'{TAKES}/select-preview.json', 'w'), indent=1); sys.exit(0)


# ── 3 · edges, pauses, level ──
def dress(cid):
    """→ (clip, [pauses shortened]). 30 ms of air before, up to 200 ms after, 20 ms fades; inner pauses of a sentence capped."""
    x = chosen[cid]['x'].astype(np.float64); text, kind, off, ex, n = CLIPS[cid]
    e, act = active(x); nz = np.nonzero(act)[0]; a = max(0, nz[0] - int(0.03 * SR)); b = min(len(x), nz[-1] + int(0.2 * SR)); y = x[a:b].copy()
    cuts = []
    cap = 0.33 if kind != 'parts' else 0.5
    multi_sentence = len(re.findall(r'[.!?]', text)) > 1
    cap = 0.45 if multi_sentence and kind != 'parts' else cap
    while True:
        e, act = active(y); nz = np.nonzero(act)[0]; i = nz[0]; done = True
        while i < nz[-1]:
            if not act[i]:
                j = i
                while not act[j]: j += 1
                if (j - i) / SR > cap + 0.01:
                    cut = (j - i) - int(cap * SR); m = (i + j) // 2; c0 = m - cut // 2; xf = int(0.012 * SR)
                    left, right = y[:c0].copy(), y[c0 + cut:].copy(); w = np.linspace(0, 1, xf)
                    left[-xf:] = left[-xf:] * (1 - w) + right[:xf] * w * 0   # fade the left out …
                    right[:xf] = right[:xf] * w                                # … and the right in (both sides are near silence)
                    y = np.concatenate([left, right]); cuts.append({'at_s': round(c0 / SR, 2), 'was_s': round((j - i) / SR, 2), 'now_s': cap}); done = False; break
                i = j
            else: i += 1
        if done: break
    f = int(0.02 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    e, act = active(y); rms = np.sqrt(np.mean(y[act] ** 2)); y = y * (10 ** ((-21 + off) / 20) / (rms + 1e-9))
    return y.astype(np.float32), cuts


def align(text, words, dur):
    ref = text.split(); rn = [(norm(w) or [''])[0] for w in ref]; hn = [(norm(w[0]) or [''])[0] for w in words]
    sm = difflib.SequenceMatcher(a=rn, b=hn, autojunk=False); T = [None] * len(ref)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): T[blk.a + k] = [words[blk.b + k][1], words[blk.b + k][2]]
    i = 0
    while i < len(ref):
        if T[i] is None:
            j = i
            while j < len(ref) and T[j] is None: j += 1
            t0 = T[i - 1][1] if i else 0.03; t1 = T[j][0] if j < len(ref) else dur - 0.2
            wts = [len(w) + 1.5 for w in ref[i:j]]; acc = 0
            for k in range(i, j): T[k] = [t0 + (t1 - t0) * acc / sum(wts), t0 + (t1 - t0) * (acc + wts[k - i]) / sum(wts)]; acc += wts[k - i]
            i = j
        else: i += 1
    for k in range(len(T)): T[k] = [round(min(max(T[k][0], T[k - 1][0] + 0.02 if k else 0.0), dur - 0.03), 3), round(min(max(T[k][1], T[k][0] + 0.04), dur), 3)]
    return T


def tighten(y, T):
    """The recogniser's word ends run long into a pause. Where the clip is silent between two words, the first word ends and
    the next begins at the edges of the silence (so a measured gap is the real gap)."""
    e, act = active(y, th=0.05)
    for k in range(len(T) - 1):
        a, b = int(T[k][0] * SR), int(T[k + 1][1] * SR); seg = ~act[a:b]
        best = (0, 0, 0); i = 0
        while i < len(seg):
            if seg[i]:
                j = i
                while j < len(seg) and seg[j]: j += 1
                if j - i > best[0]: best = (j - i, i, j)
                i = j
            else: i += 1
        if best[0] / SR > 0.06: T[k][1] = round((a + best[1]) / SR, 3); T[k + 1][0] = round((a + best[2]) / SR, 3)
        else: T[k][1] = T[k + 1][0]   # no silence between them in the file: the words run on (a gap in the recogniser's times is not a gap in the sound)
    return T


os.makedirs(OUT, exist_ok=True)
lines_out, pauses = {}, {}


def write(lid, y, text, T, src, extra=None):
    sf.write(f'{OUT}/{lid}.wav', y, SR); m = measure(y)
    side = {'speaker': 'narrator', 'voice': 'chatterbox (ONNX, CPU); reference: ' + REF, 'engine': 'chatterbox-onnx', 'takes_from': src, 'spoken_as': text,
            'chunks': [{'t0': 0, 't1': round(len(y) / SR, 3), 'words': len(text.split()), 'text': text}], 'wordTimes': T, 'measured': m,
            'note': 'lab/review/trailer/v3/voice_select.py: whole sentences, one take each, no time-stretch; word times are the recogniser\'s (faster-whisper base.en) on this file; nobody has listened'}
    if extra: side.update(extra)
    json.dump(side, open(f'{OUT}/{lid}.json', 'w'), indent=1)
    lines_out[lid] = {'line': lid, 'text': text, 'from': src, 'dur': round(len(y) / SR, 2), **m, 'semitones_from_set_median': round(st_of(m['f0']), 2)}


def one(cid):
    y, cuts = dress(cid); txt = SCRIPT_TEXT.get(cid, CLIPS[cid][0])
    if cuts: pauses[cid] = cuts
    if CLIPS[cid][1] == 'parts':
        bs = bursts(y); T = [[round(a / SR, 3), round(b / SR, 3)] for a, b in bs] if len(bs) == 3 else align(txt, [], len(y) / SR)
    else:
        heard, words = hear_x(y); T = tighten(y, align(txt, words, len(y) / SR))
    return y, txt, T


def join(lid, parts, gaps):
    """Whole clips one after another with silence between (each clip is already faded at both ends: a join cannot click)."""
    out = np.zeros(0, np.float32); T = []; txts = []; src = []
    for k, cid in enumerate(parts):
        y, txt, Tp = one(cid)
        if k: out = np.concatenate([out, np.zeros(int(gaps[k - 1] * SR), np.float32)])
        t0 = len(out) / SR; T += [[round(a + t0, 3), round(b + t0, 3)] for a, b in Tp]; out = np.concatenate([out, y]); txts.append(txt); src.append(chosen[cid]['take'])
    write(lid, out, ' '.join(txts), T, src, {'joined_from': parts, 'silence_between_s': gaps})


JOINS = {'vish': (['v1', 'v2', 'v3'], [0.38, 0.9]), 'word': (['w1', 'itihaasa', 'w3'], [0.3, 0.3])}
for lid, (parts, gaps) in JOINS.items(): join(lid, parts, gaps)
for cid in CLIPS:
    if any(cid in p for p, _ in JOINS.values()): continue
    y, txt, T = one(cid); write(cid, y, txt, T, [chosen[cid]['take']])
f0s = [l['f0'] for l in lines_out.values()]
summary = {'reference': REF, 'set_median_hz_all_takes': round(SETMED, 1), 'lines': len(lines_out), 'median_hz_of_chosen_lines': round(float(np.median(f0s)), 1), 'lowest_line_hz': min(f0s), 'highest_line_hz': max(f0s),
           'spread_semitones_low_to_high': round(float(12 * np.log2(max(f0s) / min(f0s))), 2), 'lines_more_than_2_semitones_from_set_median': [l['line'] for l in lines_out.values() if abs(l['semitones_from_set_median']) > 2],
           'takes_total': sum(len(v) for v in rows.values()), 'time_stretch': 'none', 'pauses_shortened': pauses}
json.dump({'summary': summary, 'clips': report}, open(f'{OUT}/select.json', 'w'), indent=1)
json.dump(lines_out, open(f'{OUT}/lines.json', 'w'), indent=1)
for l in lines_out.values(): print(l['line'].ljust(8), f"{l['dur']:5.2f} s  f0 {l['f0']:6.1f} ({l['semitones_from_set_median']:+.1f} st)  range {l['st']:4.1f}  hnr {l['hnr']:4.1f}  jumps {l['jumps']:.2f}  creak {l['creak']:.2f}  tail {l['tail_db']:.0f} dB  ", ' + '.join(l['from']))
print(json.dumps(summary, indent=1))
