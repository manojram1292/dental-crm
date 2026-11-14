#!/usr/bin/env python3
"""The episode voice from "rules": 2 on (the trailer's approved pipeline, owner's decision of 14 Nov 2026).

    lab/voicelab/venv/bin/python tools/voice2.py jobs   --ep 50 [--takes 5] [--alt "Name=Spelling,Name2=Spelling2"] [--only id,id]
    lab/voicelab/venv/bin/python tools/voice2.py gen    --ep 50          (the heavy step: Chatterbox on the CPU, about 1 minute a take)
    lab/voicelab/venv/bin/python tools/voice2.py select --ep 50 [--report-only] [--pace 40]
    lab/voicelab/venv/bin/python tools/voice2.py names                    (prints the per-name record, voice/names.json)

What it holds to (README "Standing rules learned from the trailer"; the gate reads the side-cars it writes):
  · ONE VOICE for the whole film: Chatterbox with the bm_daniel reference read slowly (lab/review/trailer/v3/voice/ref_daniel.wav).
    Every line is spoken by it, quoted speech too (a storyteller reads the speeches; script/cast.json's Kokoro voices are not used).
  · A LINE IS ONE TAKE, start to end, never spliced from clips (a line of two sentences is still one take).
  · Every chosen take within 2 semitones of the film's median pitch (the median of all takes the recogniser passed).
  · NO TIME-STRETCH ("stretch": 0 in the side-car; the gate fails anything over 4 %).
  · Edges: 30 ms of the take's own air before the first sound, 200 ms after the last (never under 120, never over 250), 20 ms fades.
    A pause inside the line longer than 0.30 s (0.42 s between two sentences) is shortened at its quietest point with a 12 ms fade.
  · Captions are timed from the recogniser's word times on the FINAL file ("wordTimes", read by tools/timeline.mjs).
  · NAMES: voice/names.json keeps, per name, the spelling given to the model that the recogniser wrote most nearly, and is reused by
    every later episode. `jobs --alt` adds takes with another spelling for the lines that carry the name; `select` then chooses
    over all takes and updates the record. The recogniser (faster-whisper base.en) has never seen these names: "fit" is how nearly
    it wrote the name (1 = letter for letter), a measurement to rank spellings by, not a judgement of the pronunciation.
The recogniser is a FLOOR (a take must be heard as well as the best take of its line); among the takes that pass, the choice is by
measured evenness and warmth (few pitch jumps, no creak, harmonics over noise, low jitter, a pitch range neither flat nor wild, the
least-sure word, a tail that has died away). Takes are kept in lab/review/epNN/voice/takes (in the repo tree: the scratchpad does not
survive a restart). Nobody has listened: every number written is a measurement.
"""
import difflib, glob, hashlib, json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LAB = f'{ROOT}/lab/voicelab'
REF = f'{ROOT}/lab/review/trailer/v3/voice/ref_daniel.wav'
REF_NOTE = 'Kokoro bm_daniel reading a calm storyteller passage at 0.8 speed (lab/review/trailer/v3/voice/ref_daniel.wav), the approved trailer\'s reference'
NAMES_FILE = f'{ROOT}/voice/names.json'
SR = 24000
NAME_OK = 0.72
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
cmd = sys.argv[1] if len(sys.argv) > 1 else 'help'
ep = int(arg('--ep', 0)); tag = f'ep{ep:02d}'
TAKES = f'{ROOT}/lab/review/{tag}/voice/takes'
OUT = f'{ROOT}/voice/{tag}/en'


def load_names():
    return json.load(open(NAMES_FILE)) if os.path.exists(NAMES_FILE) else {}


def script():
    return json.load(open(f'{ROOT}/script/{tag}.en.json'))


def voiced(sc):
    return [l for l in sc['lines'] if l.get('voice') is not False and l['id'] != 'next']


def name_list(sc):
    """The proper names of the script: its "names" map, plus every capitalised word of tools/voice.py's NAMES table that a line uses."""
    tbl = set(re.findall(r'"([A-Z][A-Za-z]+)(?:\'s)?":', open(f'{ROOT}/tools/voice.py').read()))
    ns = set(sc.get('names', {}))
    for l in voiced(sc):
        for w in re.findall(r"[A-Za-z]+", l['text']):
            if w in tbl: ns.add(w)
    return ns - {'I', 'Next'}


def spoken(text, spell):
    """What the model is given: the caption's words without quote marks, each name in the spelling the record (or --alt) says."""
    t = re.sub(r'[“”"]', '', text).strip()
    for n, s in spell.items():
        t = re.sub(rf'\b{re.escape(n)}\b', s, t)
    return t


if cmd == 'names':
    for n, r in sorted(load_names().items()): print(n.ljust(14), 'given as', r['spelling'].ljust(16), 'heard', str(r['heard']).ljust(16), 'fit', r['fit'], 'ok' if r['ok'] else 'WEAK', '· tried', len(r.get('tried', [])))
    sys.exit(0)

if cmd == 'jobs':
    sc = script(); rec = load_names(); ns = name_list(sc); n_takes = int(arg('--takes', 5))
    alt = dict(p.split('=') for p in arg('--alt', '').split(',') if p)
    only = set(arg('--only', '').split(',')) - {''}
    os.makedirs(TAKES, exist_ok=True)
    vf = f'{TAKES}/variants.json'; variants = json.load(open(vf)) if os.path.exists(vf) else {}
    base = {n: rec[n]['spelling'] for n in ns if n in rec}
    spell = {**base, **alt}
    jobs = []
    for l in voiced(sc):
        if only and l['id'] not in only: continue
        if alt and not only and not any(re.search(rf'\b{re.escape(n)}\b', l['text']) for n in alt): continue
        txt = spoken(l['text'], spell)
        vs = variants.setdefault(l['id'], [])
        hit = next((v for v in vs if v['text'] == txt), None)
        if not hit: hit = {'k': len(vs), 'text': txt, 'spell': {n: s for n, s in spell.items() if re.search(rf'\b{re.escape(n)}\b', l['text'])}, 'seeds': 0}; vs.append(hit)
        quoted = bool(re.match(r'\s*[“"]', l['text'])); n = n_takes + (2 if l.get('role') == 'hook' else 0)
        seeds = list(range(hit['seeds'], hit['seeds'] + n)) if (only or alt) and hit['seeds'] else list(range(max(n, hit['seeds'])))
        hit['seeds'] = max(hit['seeds'], seeds[-1] + 1)
        jobs.append({'id': f"{l['id']}~{hit['k']}", 'text': txt, 'ref': REF, 'exag': 0.55 if quoted else 0.5, 'temp': 0.7, 'seeds': seeds})
    json.dump(variants, open(vf, 'w'), indent=1); json.dump(jobs, open(f'{TAKES}/jobs.json', 'w'), indent=1)
    todo = sum(1 for j in jobs for s in j['seeds'] if not os.path.exists(f"{TAKES}/{j['id']}.s{s}.wav"))
    print(f'{tag}: {len(jobs)} lines, {todo} takes to make → {TAKES}')
    for j in jobs: print('  ', j['id'].ljust(12), j['text'])
    sys.exit(0)

if cmd == 'gen':
    sys.exit(subprocess.call([sys.executable, f'{ROOT}/lab/review/trailer/v3/voice/gen.py', f'{TAKES}/jobs.json', TAKES], env={**os.environ, 'CB_THREADS': os.environ.get('CB_THREADS', '3')}))

if cmd != 'select':
    print(__doc__); sys.exit(0)

# ───────────────────────────────────────────────── select ─────────────────────────────────────────────────
import numpy as np, soundfile as sf, parselmouth
from parselmouth.praat import call
from faster_whisper import WhisperModel
asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=3, download_root=f'{LAB}/venv/models/whisper')
sc = script(); LINES = voiced(sc); NS = name_list(sc); NSL = {n.lower() for n in NS} | {n.lower() + "'s" for n in NS}
variants = json.load(open(f'{TAKES}/variants.json'))
SAME = {'here': 'hear', 'rode': 'rowed', "god's": 'gods', 'sun': 'son', '13': 'thirteen', '1': 'one', '100': 'hundred', '5': 'five', '2': 'two', '1000': 'thousand', 'firstborn': 'first born', 'gods\'': 'gods', 'ok': 'okay'}
norm = lambda s: ' '.join(SAME.get(w, w) for w in re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ').replace('’', "'")).split()).split()
CACHE = f'{TAKES}/asr_cache.json'; _c = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
PACE = float(arg('--pace', 40))   # weight on a take's length against its line's median: positive prefers the slower of two equally even takes (this voice reads at about 3 words a second; the gate's limit is 2.6 with the pauses between lines)


def active(x, th=0.035):
    w = int(0.02 * SR); e = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(w) / w, 'same')); return e, e > th * e.max()


def hear_x(x, key=None):
    k = key or hashlib.sha1(x.tobytes()).hexdigest()[:16]
    if k in _c: return _c[k]
    segs, _ = asr.transcribe(parselmouth.Sound(x.astype(np.float64), SR).resample(16000).values[0].astype(np.float32), beam_size=5, condition_on_previous_text=False, word_timestamps=True); segs = list(segs)
    _c[k] = [' '.join(s.text.strip() for s in segs), [[w.word.strip(), float(w.start), float(w.end), float(w.probability)] for s in segs for w in (s.words or [])]]
    json.dump(_c, open(CACHE, 'w')); return _c[k]


def measure(x):
    snd = parselmouth.Sound(x.astype(np.float64), SR); f0 = snd.to_pitch(0.01, 55, 350).selected_array['frequency']; v = f0[f0 > 0]
    e, act = active(x); nz = np.nonzero(act)[0]; edb = 20 * np.log10(e[act] + 1e-9)
    if len(v) < 8: return {'f0': 0.0, 'st': 0.0, 'edb': 0.0, 'dur': round((nz[-1] - nz[0]) / SR, 2), 'jumps': 9.0, 'creak': 1.0, 'hnr': 0.0, 'jitter': 9.0, 'tail_db': 0.0}
    st = 12 * np.log2(np.where(f0 > 0, f0, np.nan)); d = np.abs(np.diff(st))
    hn = snd.to_harmonicity_cc(0.01, 60).values; hn = hn[hn > -100]
    pp = call(snd, 'To PointProcess (periodic, cc)', 55, 350); jit = call(pp, 'Get jitter (local)', 0, 0, 0.0001, 0.02, 1.3)
    tail = e[max(0, len(e) - int(0.02 * SR)):].mean() / (e.max() + 1e-9)
    return {'f0': round(float(np.median(v)), 1), 'st': round(float(12 * np.log2(np.percentile(v, 95) / np.percentile(v, 5))), 1), 'edb': round(float(np.percentile(edb, 95) - np.percentile(edb, 10)), 1),
            'dur': round((nz[-1] - nz[0]) / SR, 2), 'jumps': round(float(np.nansum(d > 3) / (len(v) / 100)), 2), 'creak': round(float((v < 75).mean()), 3), 'hnr': round(float(hn.mean()), 1) if len(hn) else 0.0,
            'jitter': round(float(jit) * 100 if jit == jit else 9.0, 2), 'tail_db': round(float(20 * np.log10(tail + 1e-6)), 1)}


def errors(ref, hyp):
    r = [w for w in ref if w not in NSL]; sm = difflib.SequenceMatcher(a=r, b=hyp, autojunk=False)
    return len(r) - sum(b.size for b in sm.get_matching_blocks()), max(0, len(hyp) - len(ref) - 1)


def heard_name(name, hyp):
    """→ (what the recogniser wrote where the name is, fit 0–1). One word or two neighbours joined ("Satya Vati")."""
    ph = lambda w: re.sub(r'(.)\1', r'\1', w.replace("'s", '').replace('ph', 'f').replace('c', 'k').replace('q', 'k').replace('w', 'v').replace('y', 'i').replace('ee', 'i').replace('oo', 'u'))   # the same sound spelt another way is not an error ("Canva" for Kanva)
    n = ph(name.lower()); cands = hyp + [a + b for a, b in zip(hyp, hyp[1:])]
    best = max(cands or [''], key=lambda h: difflib.SequenceMatcher(a=n, b=ph(h)).ratio())
    return best, round(difflib.SequenceMatcher(a=n, b=ph(best)).ratio(), 2)


def warmth(m, med_dur, minprob):
    s = 1.2 * m['hnr'] - 6.0 * m['jumps'] - 60 * m['creak'] - 2.0 * m['jitter'] - 0.5 * max(0, 8 - m['st']) - 0.6 * max(0, m['st'] - 15) + 8 * minprob - 0.25 * max(0, m['tail_db'] + 30)
    return round(float(s + PACE * (m['dur'] / med_dur - 1)), 2)


# 1 · measure every take
rows = {}
for l in LINES:
    rows[l['id']] = []; names_here = [n for n in NS if re.search(rf'\b{re.escape(n)}\b', l['text'])]
    ref = norm(re.sub(r'[“”"]', '', l['text']))
    for f in sorted(glob.glob(f"{TAKES}/{l['id']}~*.s*.wav")):
        x, sr = sf.read(f, dtype='float32'); assert sr == SR
        b = os.path.basename(f); k = int(b.split('~')[1].split('.')[0])
        if len(variants[l['id']][k]['text'].split()) != len(l['text'].split()): continue   # takes of an earlier wording of this line
        heard, words = hear_x(x, b); hyp = norm(heard); m = measure(x); miss, extra = errors(ref, hyp)
        nf = {n: heard_name(n, hyp) for n in names_here}
        rows[l['id']].append({'take': b, 'variant': k, 'heard': heard, 'missed': miss, 'extra': extra, 'minprob': round(min([w[3] for w in words] or [0]), 2), 'names': nf, 'name_fit': round(float(np.mean([v[1] for v in nf.values()])) if nf else 1.0, 2), **m, 'x': x})
    if not rows[l['id']]: sys.exit(f"no takes for line {l['id']}: run `voice2.py jobs` and `gen` first")
allf0 = [r['f0'] for c in rows.values() for r in c if r['f0'] > 0 and r['missed'] == 0]
SETMED = float(np.median(allf0)); st_of = lambda f: 12 * np.log2(max(f, 1) / SETMED)
print(f'{tag}: film median pitch {SETMED:.1f} Hz over {len(allf0)} takes the recogniser passed; within ±2 semitones: {sum(abs(st_of(f)) <= 2 for f in allf0)}')

# 2 · choose
chosen, report = {}, []
for l in LINES:
    R_ = rows[l['id']]; med = float(np.median([r['dur'] for r in R_]))
    for r in R_:
        r['bad'] = r['missed'] + 2 * r['extra'] + (3 if r['dur'] > 1.5 * med or r['dur'] < 0.65 * med else 0); r['dst'] = round(st_of(r['f0']), 2)
        r['score'] = round(warmth(r, med, r['minprob']) + 14 * r['name_fit'] - 2.0 * abs(r['dst']), 2)
        if l.get('role') == 'hook': r['score'] = round(r['score'] - 2 * PACE * (r['dur'] / med - 1) - (50 if r['dur'] > 2.75 else 0), 2)   # the hook must be spoken by 3.0 s: the brisker take, and none that would end after it
    floor = min(r['bad'] for r in R_)
    ok = [r for r in R_ if r['bad'] == floor and abs(r['dst']) <= 2.0]; widened = None
    if not ok: ok = sorted([r for r in R_ if r['bad'] == floor], key=lambda r: abs(r['dst']))[:1]; widened = f"no take within the pitch window; nearest is {ok[0]['dst']:+.1f} st"
    best = max(ok, key=lambda r: r['score']); chosen[l['id']] = best
    report.append({'line': l['id'], 'text': l['text'], 'chosen': best['take'], 'given_to_the_model': variants[l['id']][best['variant']]['text'], 'recogniser_errors_of_chosen': floor, 'passed_floor_and_pitch': len(ok), 'of': len(R_), **({'note': widened} if widened else {}),
                   'takes': [{k: v for k, v in r.items() if k != 'x'} for r in R_]})
    print(l['id'].ljust(9), '→', best['take'].ljust(18), f"f0 {best['f0']:6.1f} ({best['dst']:+.1f} st) range {best['st']:4.1f} hnr {best['hnr']:4.1f} jumps {best['jumps']:.2f} dur {best['dur']:.2f} err {floor} pass {len(ok)}/{len(R_)}{' !! ' + widened if widened else ''} | {best['heard']}", flush=True)
if '--report-only' in sys.argv:
    json.dump({'film_median_hz': SETMED, 'lines': report}, open(f'{TAKES}/select-preview.json', 'w'), indent=1); sys.exit(0)


# 3 · edges, pauses, level
def dress(l):
    x = chosen[l['id']]['x'].astype(np.float64); text = l['text']
    e, act = active(x); nz = np.nonzero(act)[0]; a = max(0, nz[0] - int(0.03 * SR)); b = nz[-1] + int(0.2 * SR)
    y = x[a:min(len(x), b)].copy()
    if b > len(x): y = np.concatenate([y, np.zeros(max(0, nz[-1] + int(0.12 * SR) - len(x)))])   # a take that ends sooner: at least 120 ms after the last sound
    cuts = []; n_sent = len(re.findall(r'[.!?:;]', text.strip(' "”')[:-1]))   # pauses that may be 0.45 s: as many as the line has sentence ends inside it (the longest ones); every other pause 0.33 s
    while True:
        e, act = active(y, th=0.05); nz = np.nonzero(act)[0]; i = nz[0]; done = True   # the threshold the word times are tightened with: the gate then measures the same pause
        gaps_ = []; k_ = nz[0]
        while k_ < nz[-1]:
            if not act[k_]:
                j_ = k_
                while not act[j_]: j_ += 1
                gaps_.append(j_ - k_); k_ = j_
            else: k_ += 1
        long_ = sorted(gaps_, reverse=True)[:n_sent]; thr_ = min(long_) if long_ else 10 ** 9
        while i < nz[-1]:
            if not act[i]:
                j = i
                while not act[j]: j += 1
                cap = 0.42 if (j - i) >= thr_ and n_sent else 0.30   # under the gate's 0.35 with room: the gate measures the silence with a higher threshold, which reads longer
                if (j - i) / SR > cap + 0.01:
                    cut = (j - i) - int(cap * SR); m = (i + j) // 2; c0 = m - cut // 2; xf = int(0.012 * SR)
                    left, right = y[:c0].copy(), y[c0 + cut:].copy(); w = np.linspace(0, 1, xf)
                    left[-xf:] = left[-xf:] * (1 - w); right[:xf] = right[:xf] * w
                    y = np.concatenate([left, right]); cuts.append({'at_s': round(c0 / SR, 2), 'was_s': round((j - i) / SR, 2), 'now_s': cap}); done = False; break
                i = j
            else: i += 1
        if done: break
    f = int(0.02 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    e, act = active(y); nz = np.nonzero(act)[0]; rms = np.sqrt(np.mean(y[act] ** 2)); y = y * (10 ** (-21 / 20) / (rms + 1e-9))
    return y.astype(np.float32), cuts, round(1000 * nz[0] / SR), round(1000 * (len(y) - 1 - nz[-1]) / SR)


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
    """The recogniser's word ends run long into a pause: where the file is silent between two words, the first ends and the next
    begins at the edges of that silence; the last word ends where the sound ends."""
    e, act = active(y, th=0.05); nz = np.nonzero(act)[0]
    for k in range(len(T) - 1):
        a, b = int(T[k][0] * SR), int(T[k + 1][1] * SR); seg = ~act[a:b]; best = (0, 0, 0); i = 0
        while i < len(seg):
            if seg[i]:
                j = i
                while j < len(seg) and seg[j]: j += 1
                if j - i > best[0]: best = (j - i, i, j)
                i = j
            else: i += 1
        if best[0] / SR > 0.06: T[k][1] = round((a + best[1]) / SR, 3); T[k + 1][0] = round((a + best[2]) / SR, 3)
        else: T[k][1] = T[k + 1][0]
    T[-1][1] = round(min(max(T[-1][0] + 0.04, (nz[-1] + 1) / SR), len(y) / SR), 3)
    T[0][0] = round(min(T[0][0], max(0.0, nz[0] / SR)), 3) if T[0][0] > nz[0] / SR + 0.15 else T[0][0]
    return T


os.makedirs(OUT, exist_ok=True)
for f in glob.glob(f'{OUT}/*.wav') + glob.glob(f'{OUT}/*.json'): os.remove(f)   # the earlier voice (Kokoro) is in git history
lines_out, pauses = {}, {}
rec = load_names()
for l in LINES:
    y, cuts, lead_ms, tail_ms = dress(l); txt = l['text']; c = chosen[l['id']]
    if cuts: pauses[l['id']] = cuts
    heard, words = hear_x(y); T = tighten(y, align(txt, words, len(y) / SR)); m = measure(y)
    gaps = [round(T[k + 1][0] - T[k][1], 2) for k in range(len(T) - 1)]
    sf.write(f"{OUT}/{l['id']}.wav", y, SR)
    json.dump({'speaker': 'narrator', 'script_speaker': l.get('speaker', 'narrator'), 'voice': 'chatterbox (ONNX, CPU); reference: ' + REF_NOTE, 'engine': 'chatterbox-onnx', 'takes_from': [c['take']], 'one_take': True, 'stretch': 0,
               'spoken_as': variants[l['id']][c['variant']]['text'], 'heard': heard, 'recogniser_errors': c['bad'], 'chunks': [{'t0': 0, 't1': round(len(y) / SR, 3), 'words': len(txt.split()), 'text': txt}], 'wordTimes': T,
               'lead_air_ms': lead_ms, 'tail_air_ms': tail_ms, 'longest_pause_s': max(gaps or [0]), 'pauses_shortened': cuts, 'measured': m, 'film_median_hz': round(SETMED, 1), 'semitones_from_film_median': round(st_of(m['f0']), 2),
               'names': {n: {'heard': v[0], 'fit': v[1]} for n, v in c['names'].items()},
               'note': 'tools/voice2.py: one take, no time-stretch; word times are the recogniser\'s (faster-whisper base.en) on this file; nobody has listened'}, open(f"{OUT}/{l['id']}.json", 'w'), indent=1)
    lines_out[l['id']] = {'line': l['id'], 'text': txt, 'from': c['take'], 'dur': round(len(y) / SR, 2), **m, 'semitones_from_film_median': round(st_of(m['f0']), 2), 'tail_air_ms': tail_ms, 'heard': heard}
    # the per-name record: for each name of this line, every spelling tried so far (best take of each), and the best spelling
    for n in c['names']:
        r = rec.setdefault(n, {'spelling': n, 'heard': None, 'fit': 0, 'ok': False, 'tried': []})
        for v in variants[l['id']]:
            ts = [q for q in rows[l['id']] if q['variant'] == v['k'] and n in q['names']]
            if not ts: continue
            fits = sorted(q['names'][n][1] for q in ts); bestq = max(ts, key=lambda q: q['names'][n][1]); sp = v['spell'].get(n, n)
            r['tried'] = [t for t in r['tried'] if not (t['spelling'] == sp and t['ep'] == ep and t['line'] == l['id'])] + [{'spelling': sp, 'ep': ep, 'line': l['id'], 'takes': len(ts), 'best_heard': bestq['names'][n][0], 'best_fit': fits[-1], 'median_fit': fits[len(fits) // 2]}]
        used = variants[l['id']][c['variant']]['spell'].get(n, n)
        if c['names'][n][1] >= r['fit'] or r['spelling'] == used or not r['ok']:
            r.update({'spelling': used, 'heard': c['names'][n][0], 'fit': c['names'][n][1], 'ok': c['names'][n][1] >= NAME_OK, 'from': f"{tag}/{l['id']}"})
json.dump(rec, open(NAMES_FILE, 'w'), indent=1, ensure_ascii=False)
f0s = [q['f0'] for q in lines_out.values()]
weak = sorted({n for l in LINES for n, v in chosen[l['id']]['names'].items() if v[1] < NAME_OK})
summary = {'episode': ep, 'reference': REF_NOTE, 'film_median_hz_all_passing_takes': round(SETMED, 1), 'lines': len(lines_out), 'lowest_line_hz': min(f0s), 'highest_line_hz': max(f0s), 'spread_semitones_low_to_high': round(float(12 * np.log2(max(f0s) / min(f0s))), 2),
           'lines_more_than_2_semitones_from_film_median': [q['line'] for q in lines_out.values() if abs(q['semitones_from_film_median']) > 2], 'lines_with_recogniser_errors': {r['line']: r['recogniser_errors_of_chosen'] for r in report if r['recogniser_errors_of_chosen']},
           'names_weak_in_the_chosen_takes': weak, 'takes_total': sum(len(v) for v in rows.values()), 'time_stretch': 'none', 'pauses_shortened': pauses, 'speech_seconds': round(sum(q['dur'] for q in lines_out.values()), 2)}
json.dump({'summary': summary, 'lines': report}, open(f'{OUT}/select.json', 'w'), indent=1)
for q in lines_out.values(): print(q['line'].ljust(9), f"{q['dur']:5.2f} s  f0 {q['f0']:6.1f} ({q['semitones_from_film_median']:+.1f} st)  range {q['st']:4.1f}  tail air {q['tail_air_ms']} ms |", q['heard'])
print(json.dumps(summary, indent=1))
if weak: print('WEAK NAMES (fix here, before the mix): ' + ', '.join(weak) + ' → `voice2.py jobs --ep N --alt "Name=Spelling"`, `gen`, `select` again')
