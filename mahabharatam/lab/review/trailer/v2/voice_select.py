"""Trailer v2 · choose one Chatterbox take per clip, trim it, cut it to the shots, and write voice/ep97/en/<shot>.wav + <shot>.json.

    lab/voicelab/venv/bin/python lab/review/trailer/v2/voice_select.py TAKES_DIR [--only id,id]

A take is chosen by the recogniser first (fewest words of the line not heard, no stray words; names are not counted: the
recogniser has never seen them), then by a score from what the line is FOR: pitch range (5–95 %, semitones) and energy contour
(10–95 % of the level of the active frames, dB) are always wanted; the median pitch is held near 96 Hz on every line (one
deep narrator, not a different man on each line); a take in which the recogniser wrote the line's name more nearly is preferred; a "slow" line also wants length, a "hard" line wants a steep energy contour and no slack.
Every chosen clip has its head and tail trimmed (20 ms / 60 ms), its inner pauses capped, and its level set (active RMS −21 dBFS
as tools/voice.py, then the line's own offset: quiet lines lower, hard lines higher). A sentence that runs over a cut is ONE take
cut between two words at the quietest point, so the shots carry on each other's breath. Caption word times are the recogniser's
word timestamps (faster-whisper base.en), moved with every trim; a word it did not hear is placed between its neighbours.
Nobody has listened to any of this: every number in select.json is a measurement, not a judgement of how it sounds.
"""
import difflib, glob, json, os, re, sys
import numpy as np, soundfile as sf, parselmouth
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
LAB = f'{ROOT}/lab/voicelab'
from faster_whisper import WhisperModel
TAKES = sys.argv[1]
only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
OUT = f'{ROOT}/voice/ep97/en'
SR = 24000
asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=2, download_root=f'{LAB}/venv/models/whisper')
NAMES = {'bhima', 'krishna', 'duryodhana', 'arjuna', 'bhishma', 'karna', "karna's", 'itihasa', 'iti', 'ha', 'asa', 'aasa'}
# what the recogniser writes for the same sounds: not errors ("prince swears" and "prince wears" are one sound in running speech)
SAME = {'steaks': 'stakes', '13': 'thirteen', '1': 'one', 'firstborn': 'first born', 'wears': 'swears'}
norm = lambda s: ' '.join(SAME.get(w, w) for w in re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ').replace('’', "'")).split()).split()
CACHE = f'{TAKES}/asr_cache.json'; _c = json.load(open(CACHE)) if os.path.exists(CACHE) else {}

# clip id → (text given to the model, kind, level offset dB, max inner pause s)
CLIPS = {
 'field': ("Two armies wait. Between them, one archer will not fight.", 'plain', 0, 0.36), 'vow': ("Long before, a prince swears away his throne and his line.", 'plain', 0, 0.3),
 'river': ("A mother gives her first-born to the river.", 'slow', -2.5, 0.3), 'cousins': ("A hundred brothers. Five cousins. One throne.", 'plain', 0, 0.36),
 'lac': ("A palace, built to burn.", 'plain', 0, 0.3), 'demon2': ("Bhima breaks a man-eating demon.", 'hard', 1, 0.28), 'altar': ("A woman rises from a fire altar.", 'plain', 0, 0.3),
 'wheel': ("Krishna lets the wheel fly.", 'plain', 0.5, 0.3), 'dice1': ("Then, the dice.", 'hard', 1.5, 0.3), 'dice23': ("A king stakes his kingdom, his brothers, his wife.", 'hard', 1.5, 0.3),
 'cloth': ("They pull at her cloth. The cloth does not end.", 'plain', -0.5, 0.36), 'exile': ("Thirteen years of exile.", 'plain', 0, 0.3), 'needle': ("Duryodhana will not give a needle-point of earth.", 'hard', 1.5, 0.3),
 'armies': ("Two armies.", 'hard', 1.5, 0.3), 'bow': ("Arjuna lowers his bow.", 'plain', 0, 0.3), 'arrows': ("Bhishma will fall on a bed of arrows.", 'hard', 1, 0.25), 'boy': ("A boy, alone against many.", 'hard', 1, 0.25),
 'mud': ("Karna's wheel, sunk in the earth.", 'hard', 1, 0.25), 'raid': ("A camp raided in its sleep.", 'hard', 1, 0.25), 'curse': ("A mother of a hundred sons will curse Krishna.", 'plain', 0, 0.3),
 'dog': ("And at the end, a king will not abandon his dog.", 'slow', -3, 0.36), 'v1': ("But first, Arjuna asks to see.", 'plain', 0, 0.3), 'v2': ("Krishna shows him everything.", 'awe', 1, 0.3), 'v3': ("I am Time.", 'awe', 1.5, 0.3),
 'w1': ("It calls itself itihasa.", 'slow', -4, 0.3), 'itihaasa': ("Iti. Ha. Aasa.", 'parts', 0, 9), 'iti': ("Iti.", 'part', 0, 9), 'ha': ("Ha.", 'part', 0, 9), 'asa': ("Aasa.", 'part', 0, 9), 'w3': ("So indeed it was.", 'hard', 1, 0.3),
 'every': ("Every book. Every vow. Every war.", 'plain', 0.5, 9), 'first': ("From the first verse to the last.", 'plain', 0, 0.3), 'nothing': ("Nothing added for effect.", 'plain', 0, 0.3), 'follow': ("Follow. Episode one.", 'hard', 1, 0.4),
}


# Chosen by hand from the table of measurements (not by ear), where the score's first choice had a cost the score does not see:
# TAKES/override.json = { clip: [seed, reason] }. The reasons are copied into select.json.
OVERRIDE = json.load(open(f'{TAKES}/override.json')) if os.path.exists(f'{TAKES}/override.json') else {}
REF = open(f'{TAKES}/reference.txt').read().strip() if os.path.exists(f'{TAKES}/reference.txt') else 'see the takes folder'


def active(x, sr=SR, th=0.035):
    w = int(0.02 * sr); e = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(w) / w, 'same')); return e, e > th * e.max()


def measure(x):
    snd = parselmouth.Sound(x.astype(np.float64), SR); p = snd.to_pitch(0.01, 55, 350).selected_array['frequency']; v = p[p > 0]
    e, act = active(x); edb = 20 * np.log10(e[act] + 1e-9)
    nz = np.nonzero(act)[0]; q = ~act[nz[0]:nz[-1]]; worst = run = 0
    for b in q: run = run + 1 if b else 0; worst = max(worst, run)
    return {'f0': round(float(np.median(v)), 1) if len(v) else 0.0, 'st': round(float(12 * np.log2(np.percentile(v, 95) / np.percentile(v, 5))), 1) if len(v) > 5 else 0.0,
            'edb': round(float(np.percentile(edb, 95) - np.percentile(edb, 10)), 1), 'pause': round(worst / SR, 2), 'dur': round((nz[-1] - nz[0]) / SR, 2)}


def hear(f):
    k = os.path.basename(f)
    if k in _c: return _c[k][0], _c[k][1]
    _c[k] = list(_hear(f)); json.dump(_c, open(CACHE, 'w')); return _c[k][0], _c[k][1]


def name_fit(ref, hyp):
    """How nearly the recogniser wrote each name of the line (1 = letter for letter). It has never seen these names, so this
    only ranks takes against each other."""
    ns = [w for w in ref if w in NAMES]
    return float(np.mean([max([difflib.SequenceMatcher(a=n, b=h).ratio() for h in hyp] or [0]) for n in ns])) if ns else 1.0


def _hear(f):
    segs, _ = asr.transcribe(f, beam_size=5, condition_on_previous_text=False, word_timestamps=True); segs = list(segs)
    return ' '.join(s.text.strip() for s in segs), [[w.word.strip(), float(w.start), float(w.end)] for s in segs for w in (s.words or [])]


def errors(ref, hyp):
    r = [w for w in ref if w not in NAMES]; sm = difflib.SequenceMatcher(a=r, b=hyp, autojunk=False)
    return len(r) - sum(b.size for b in sm.get_matching_blocks()), max(0, len(hyp) - len(ref) - 1)


def score(m, kind, med_dur):
    s = min(m['st'], 20) + 0.5 * m['edb'] - 0.6 * max(0, abs(m['f0'] - 96) - 8) - 12 * (1 - m.get('name_fit', 1))   # one narrator: the median pitch stays near 96 Hz (88–104 costs nothing)
    if kind == 'slow': s += 4 * (m['dur'] / med_dur - 1) * 5 - 0.3 * max(0, m['edb'] - 20)
    if kind == 'hard': s += 0.5 * m['edb'] - 3 * max(0, m['dur'] / med_dur - 1.1) * 5
    if kind == 'awe': s += 0.4 * min(m['st'], 20) + 2 * (m['dur'] / med_dur - 1) * 5
    return round(s, 2)


def trim_and_times(x, words, max_pause):
    """→ (clip, word times moved with it). Head/tail trimmed; inner silences longer than max_pause shortened to it."""
    e, act = active(x); nz = np.nonzero(act)[0]; a, b = max(0, nz[0] - int(0.02 * SR)), min(len(x), nz[-1] + int(0.06 * SR))
    keep = np.ones(len(x), bool); keep[:a] = False; keep[b:] = False
    i = nz[0]
    while i < nz[-1]:
        if not act[i]:
            j = i
            while not act[j]: j += 1
            if (j - i) / SR > max_pause:
                cut = (j - i) - int(max_pause * SR); m = (i + j) // 2; keep[m - cut // 2:m - cut // 2 + cut] = False
            i = j
        else: i += 1
    idx = np.cumsum(keep) - 1; y = x[keep].copy()
    r = int(0.008 * SR); y[:r] *= np.linspace(0, 1, r); y[-r:] *= np.linspace(1, 0, r)
    mv = lambda t: float(np.clip(idx[min(len(x) - 1, max(0, int(t * SR)))], 0, len(y) - 1)) / SR
    return y, [[w, mv(t0), mv(t1)] for w, t0, t1 in words]


def level(y, off_db):
    e, act = active(y); rms = np.sqrt(np.mean(y[act].astype(np.float64) ** 2)); return (y * (10 ** ((-21 + off_db) / 20) / (rms + 1e-9))).astype(np.float32)


def align(text, words, dur):
    """Script words ← recogniser word times. Unheard words are spread between their heard neighbours."""
    ref = text.split(); rn = [(norm(w) or [''])[0] for w in ref]; hn = [(norm(w[0]) or [''])[0] for w in words]
    sm = difflib.SequenceMatcher(a=rn, b=hn, autojunk=False); T = [None] * len(ref)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): T[blk.a + k] = [words[blk.b + k][1], words[blk.b + k][2]]
    i = 0
    while i < len(ref):
        if T[i] is None:
            j = i
            while j < len(ref) and T[j] is None: j += 1
            t0 = T[i - 1][1] if i else 0.02; t1 = T[j][0] if j < len(ref) else dur - 0.05
            wts = [len(w) + 1.5 for w in ref[i:j]]; acc = 0
            for k in range(i, j): T[k] = [t0 + (t1 - t0) * acc / sum(wts), t0 + (t1 - t0) * (acc + wts[k - i]) / sum(wts)]; acc += wts[k - i]
            i = j
        else: i += 1
    for k in range(len(T)):   # monotone, inside the clip
        T[k] = [round(min(max(T[k][0], T[k - 1][0] + 0.02 if k else 0.0), dur - 0.03), 3), round(min(max(T[k][1], T[k][0] + 0.04), dur), 3)]
    return T


def cut_between(y, T, k):
    """The sample between script word k-1 and k where the clip is quietest."""
    e, _ = active(y); a, b = int((T[k - 1][1] - 0.08) * SR), int((T[k][0] + 0.06) * SR); a, b = max(1, min(a, b - 2)), min(len(y) - 1, max(b, a + 2))
    w = int(0.03 * SR); sm = np.convolve(e, np.ones(w) / w, 'same'); return a + int(np.argmin(sm[a:b]))


def bursts(y, min_gap=0.09):
    """Runs of speech separated by silences ≥ min_gap → [(i0, i1)]."""
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


chosen, report = {}, []
prev = {r['clip']: r for r in json.load(open(f'{OUT}/select.json')) if 'clip' in r} if only and os.path.exists(f'{OUT}/select.json') else {}
NEED = {'demon': ['demon2'], 'arrows1': ['arrows'], 'boy1': ['boy'], 'mud1': ['mud'], 'dice2': ['dice23'], 'cloth1': ['cloth'], 'needle1': ['needle'], 'vish': ['v1', 'v2', 'v3'], 'word': ['w1', 'w3', 'itihaasa', 'iti', 'ha', 'asa'], 'p1': ['every'], 'follow': ['nothing', 'follow']}
wanted = None if not only else set(c for o in only for c in NEED.get(o, [o]))
for cid, (text, kind, off, mp) in CLIPS.items():
    if wanted is not None and cid not in wanted: continue
    files = sorted(glob.glob(f'{TAKES}/{cid}.s*.wav'))
    if not files: print('NO TAKES', cid); continue
    rows = []
    for f in files:
        x, sr = sf.read(f, dtype='float32'); heard, words = hear(f); m = measure(x); miss, extra = errors(norm(text), norm(heard))
        rows.append({'take': os.path.basename(f), 'heard': heard, 'missed': miss, 'extra': extra, **m, 'name_fit': round(name_fit(norm(text), norm(heard)), 2), 'words': words, 'x': x})
    med = float(np.median([r['dur'] for r in rows]))
    for r in rows: r['score'] = score(r, kind, med); r['bad'] = r['missed'] + 2 * r['extra'] + (3 if r['dur'] > 1.6 * med or r['dur'] < 0.6 * med else 0)
    if kind in ('part', 'parts'):   # single syllables: the recogniser cannot judge them; take the one nearest the median length with the lowest pitch
        if kind == 'parts': rows = [r for r in rows if len(bursts(r['x'])) == 3] or rows
        best = min(rows, key=lambda r: (abs(r['dur'] - med) > 0.25 * med, r['f0'] if r['f0'] > 60 else 999))
    else:
        mb = min(r['bad'] for r in rows); best = max([r for r in rows if r['bad'] == mb], key=lambda r: r['score'])
    if cid in OVERRIDE:
        best = next(r for r in rows if r['take'].endswith(f".{OVERRIDE[cid][0]}.wav"))
    chosen[cid] = best
    report.append({'clip': cid, 'text': text, 'kind': kind, 'chosen': best['take'], **({'chosen_by_hand': OVERRIDE[cid][1]} if cid in OVERRIDE else {}), 'takes': [{k: v for k, v in r.items() if k not in ('x', 'words')} for r in rows]})
    print(cid.ljust(9), '→', best['take'], f"f0 {best['f0']} st {best['st']} edb {best['edb']} dur {best['dur']} missed {best['missed']} | {best['heard']}", '|', [(r['take'][-6:-4], r['bad'], r['score']) for r in rows], flush=True)

os.makedirs(OUT, exist_ok=True)
lines_out = {}


# "Quiet and slow on the river and the dog": this voice speaks every line at about 3 words a second, the river line fastest of all (3.2).
# The two lines are slowed 11 % (ffmpeg's rubberband filter, pitch kept). Not listened to.
STRETCH = {'river': 0.89, 'dog': 0.89}


def clip(cid):
    r = chosen[cid]; text, kind, off, mp = CLIPS[cid]; y, words = trim_and_times(r['x'], r['words'], mp)
    if cid in STRETCH:
        import subprocess
        k = STRETCH[cid]; raw = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'rubberband=tempo={k}', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-'], input=y.astype(np.float32).tobytes(), capture_output=True).stdout
        y2 = np.frombuffer(raw, np.float32).copy(); assert len(y2) > len(y), 'rubberband gave nothing'
        y, words = y2, [[w, a / k, b / k] for w, a, b in words]
    return level(y, off), words


def write(lid, y, text, T, src, extra=None):
    sf.write(f'{OUT}/{lid}.wav', y, SR)
    m = measure(y)
    side = {'speaker': 'narrator', 'voice': 'chatterbox (ONNX, CPU); reference: ' + REF, 'engine': 'chatterbox-onnx', 'takes_from': src, 'spoken_as': text,
            'chunks': [{'t0': 0, 't1': round(len(y) / SR, 3), 'words': len(text.split()), 'text': text}], 'wordTimes': T, 'measured': m,
            'note': 'lab/review/trailer/v2/voice_select.py: word times are the recogniser\'s (faster-whisper base.en), moved with the trims; nobody has listened'}
    if extra: side.update(extra)
    json.dump(side, open(f'{OUT}/{lid}.json', 'w'), indent=1)
    lines_out[lid] = {'line': lid, 'text': text, 'from': src, 'dur': round(len(y) / SR, 2), **m}


def simple(lid, cid, text):
    y, words = clip(cid); write(lid, y, text, align(text, words, len(y) / SR), [chosen[cid]['take']])


def split(cid, text, parts):
    """One take over several shots: parts = [(shot id, number of words)]."""
    y, words = clip(cid); T = align(text, words, len(y) / SR); ws = text.split(); k = 0; a = 0
    for n_, (lid, cnt) in enumerate(parts):
        b = cut_between(y, T, k + cnt) if n_ < len(parts) - 1 else len(y)
        seg = y[a:b].copy(); r = int(0.004 * SR); seg[:r] *= np.linspace(0, 1, r); seg[-r:] *= np.linspace(1, 0, r)
        Tl = [[round(max(0.0, t0 - a / SR), 3), round(min(len(seg) / SR, t1 - a / SR), 3)] for t0, t1 in T[k:k + cnt]]
        write(lid, seg, ' '.join(ws[k:k + cnt]), Tl, [chosen[cid]['take']], {'cut_from': text}); k += cnt; a = b


def join(lid, text, pieces):
    """Several clips in one shot: pieces = [(samples, script text of the piece, recogniser words or None, gap before it in s)]."""
    out = np.zeros(0, np.float32); T = []; src = []
    for y, ptxt, words, gap, take in pieces:
        out = np.concatenate([out, np.zeros(int(gap * SR), np.float32)]); t0 = len(out) / SR
        Tp = align(ptxt, words, len(y) / SR) if words else [[0.02, max(0.1, len(y) / SR - 0.04)]] if len(ptxt.split()) == 1 else align(ptxt, [], len(y) / SR)
        T += [[round(a + t0, 3), round(b + t0, 3)] for a, b in Tp]; out = np.concatenate([out, y]); src.append(take)
    write(lid, out, text, T, src)


def do(lid):
    return not only or lid in only


for lid in ('field', 'vow', 'river', 'cousins', 'exile', 'armies', 'bow', 'curse', 'dog', 'first', 'dice1'):
    if do(lid) and lid in chosen: simple(lid, lid, {'dice1': "Then the dice."}.get(lid, CLIPS[lid][0]))
if do('lac'): simple('lac', 'lac', "A palace built to burn.")
if do('demon'): simple('demon', 'demon2', "Bhima breaks a man-eating demon.")
if do('altar'): simple('altar', 'altar', "A woman rises from a fire-altar.")
if do('wheel'): simple('wheel', 'wheel', "Krishna lets the wheel fly.")
if do('dice2'): split('dice23', "A king stakes his kingdom, his brothers, his wife.", [('dice2', 5), ('dice3', 4)])
if do('cloth1'): split('cloth', "They pull at her cloth. The cloth does not end.", [('cloth1', 5), ('cloth2', 5)])
if do('arrows1'): split('arrows', "Bhishma will fall on a bed of arrows.", [('arrows1', 3), ('arrows2', 5)])
if do('boy1'): split('boy', "A boy, alone against many.", [('boy1', 2), ('boy2', 3)])
if do('mud1'): split('mud', "Karna's wheel, sunk in the earth.", [('mud1', 2), ('mud2', 4)])
if do('raid'): simple('raid', 'raid', "A camp raided in its sleep.")
if do('needle1'): split('needle', "Duryodhana will not give a needle-point of earth.", [('needle1', 4), ('needle2', 4)])
if do('vish'):
    (a, wa), (b, wb), (c, wc) = clip('v1'), clip('v2'), clip('v3')
    join('vish', "But first, Arjuna asks to see. Krishna shows him everything. “I am Time.”", [(a, "But first, Arjuna asks to see.", wa, 0, chosen['v1']['take']), (b, "Krishna shows him everything.", wb, 0.42, chosen['v2']['take']), (c, "“I am Time.”", wc, 1.05, chosen['v3']['take'])])
if do('word'):
    w1, ww1 = clip('w1'); w3, ww3 = clip('w3')
    # the three parts: from the one take that says them as a list if it has exactly three bursts, else from the three single takes
    y3 = chosen['itihaasa']['x']; bs = bursts(y3)
    if len(bs) == 3:
        parts = [level(trim_and_times(y3[max(0, i0 - int(0.03 * SR)):i1 + int(0.05 * SR)], [], 9)[0], 0.5) for i0, i1 in bs]; src3 = [chosen['itihaasa']['take']] * 3
    else:
        parts = [clip(k)[0] for k in ('iti', 'ha', 'asa')]; src3 = [chosen[k]['take'] for k in ('iti', 'ha', 'asa')]
    join('word', "It calls itself itihasa. Iti. Ha. Asa. So indeed it was.", [(w1, "It calls itself itihasa.", ww1, 0, chosen['w1']['take']), (parts[0], "Iti.", None, 0.34, src3[0]), (parts[1], "Ha.", None, 0.22, src3[1]), (parts[2], "Asa.", None, 0.22, src3[2]), (w3, "So indeed it was.", ww3, 0.36, chosen['w3']['take'])])
if do('p1'):
    y, words = clip('every'); T = align("Every book. Every vow. Every war.", words, len(y) / SR); bs = bursts(y, 0.12)
    if len(bs) == 3:
        for (lid, txt), (i0, i1) in zip((('p1', "Every book."), ('p2', "Every vow."), ('p3', "Every war.")), bs):
            seg = y[max(0, i0 - int(0.02 * SR)):min(len(y), i1 + int(0.06 * SR))].copy(); r = int(0.006 * SR); seg[:r] *= np.linspace(0, 1, r); seg[-r:] *= np.linspace(1, 0, r); d = len(seg) / SR
            write(lid, seg, txt, [[0.02, round(d * 0.42, 3)], [round(d * 0.44, 3), round(d - 0.04, 3)]], [chosen['every']['take']], {'cut_from': "Every book. Every vow. Every war."})
    else: print('!! "every" does not fall into three bursts:', len(bs)); split('every', "Every book. Every vow. Every war.", [('p1', 2), ('p2', 2), ('p3', 2)])
if do('follow'):
    n_, wn = clip('nothing'); f_, wf = clip('follow'); Tf = align("Follow. Episode one.", wf, len(f_) / SR); c = cut_between(f_, Tf, 2)
    fa, fb = f_[:c].copy(), f_[c:].copy(); r = int(0.004 * SR); fa[-r:] *= np.linspace(1, 0, r); fb[:r] *= np.linspace(0, 1, r)
    join('follow', "Nothing added for effect. Follow. Episode", [(n_, "Nothing added for effect.", wn, 0, chosen['nothing']['take']), (fa, "Follow. Episode", [w for w in wf if w[1] < c / SR], 0.2, chosen['follow']['take'])])
    write('endcard', fb, "one.", [[0.0, round(len(fb) / SR - 0.04, 3)]], [chosen['follow']['take']], {'cut_from': "Follow. Episode one."})
for r in report: prev[r['clip']] = r
json.dump(list(prev.values()), open(f'{OUT}/select.json', 'w'), indent=1)
pl = f'{OUT}/lines.json'; allL = json.load(open(pl)) if os.path.exists(pl) and only else {}
allL.update(lines_out); json.dump(allL, open(pl, 'w'), indent=1)
for l in lines_out.values(): print(l['line'].ljust(8), l['dur'], 's  f0', l['f0'], 'range', l['st'], 'st  energy', l['edb'], 'dB  pause', l['pause'], ' ', ' + '.join(l['from']))
