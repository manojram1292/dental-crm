"""Pick one Chatterbox take per trailer line: complete, no stray words (recogniser), fewest errors, then nearest the median length.
Writes voice/ep97/en/<id>.wav (24 kHz, trimmed, active RMS -21 dBFS like tools/voice.py) + <id>.json, and select.json."""
import glob, json, os, re, sys
import numpy as np, soundfile as sf
sys.path.insert(0, '/home/user/dental-crm/mahabharatam/lab/voicelab'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from faster_whisper import WhisperModel
from lib import LAB, trim, norm_rms
from lines import LINES
ROOT = '/home/user/dental-crm/mahabharatam'; TAKES = sys.argv[1].split(','); OUT = f'{ROOT}/voice/ep97/en'; os.makedirs(OUT, exist_ok=True)
only = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower().replace('-', ' ')).split()
NAMES = {'mahabharata', 'bhima', 'bheema', 'krishna', 'duryodhana', 'dur', 'yodhana', 'arjuna', 'bhishma', 'bheeshma', 'karna', "karna's", 'itihasa', 'iti', 'haasa', 'ha', 'asa', 'aasa'}
def errs(ref, hyp):
    import difflib
    r = [w for w in ref if w not in NAMES]; h = hyp
    sm = difflib.SequenceMatcher(a=r, b=h); miss = len(r) - sum(b.size for b in sm.get_matching_blocks())
    return miss, max(0, len(h) - len(ref) - 1)   # words of the line not heard; extra words heard
asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=3, download_root=f'{LAB}/venv/models/whisper')
selp = f'{OUT}/select.json'; sel = {r['id']: r for r in json.load(open(selp))} if os.path.exists(selp) else {}
for lid, text, spoken in LINES:
    if only and lid not in only: continue
    rows = []
    for d in TAKES:
        for f in sorted(glob.glob(f'{d}/{lid}.s*.wav')):
            segs, _ = asr.transcribe(f, beam_size=5, condition_on_previous_text=False); txt = ' '.join(s.text.strip() for s in segs)
            m, x = errs(norm(spoken or text), norm(txt)); rows.append({'take': f, 'heard': txt, 'missed': m, 'extra': x, 'dur': round(sf.info(f).duration, 2)})
    med = float(np.median([r['dur'] for r in rows]))
    best = min(rows, key=lambda r: (r['missed'] + 2 * r['extra'], abs(r['dur'] - med)))
    x, sr = sf.read(best['take'], dtype='float32'); y = norm_rms(trim(x, sr, 0.02, 0.08)); sf.write(f'{OUT}/{lid}.wav', y, sr)
    # caption chunks: split at sentence ends, timed in proportion to the letters (the recogniser's times are not trusted for names)
    parts = re.findall(r'[^.!?]+[.!?]+|[^.!?]+$', text); dur = len(y) / sr
    if len(parts) > 1:
        wts = [len(p.strip()) + 6 for p in parts]; tot = sum(wts); t0 = 0; ch = []
        for p, w in zip(parts, wts): t1 = t0 + dur * w / tot; ch.append({'t0': round(t0, 3), 't1': round(t1 - 0.12, 3), 'words': len(p.split()), 'text': p.strip()}); t0 = t1
    else: ch = [{'t0': 0, 't1': round(dur, 3), 'words': len(text.split()), 'text': text}]
    json.dump({'speaker': 'narrator', 'voice': 'chatterbox:default', 'engine': 'chatterbox-onnx', 'spoken_as': spoken or text, 'chunks': ch, 'note': 'written by the trailer take selector (scratchpad/trailer/select.py): chunk times are proportional, not measured'}, open(f'{OUT}/{lid}.json', 'w'), indent=1)
    sel[lid] = {'id': lid, 'chosen': os.path.basename(best['take']), 'dur': round(dur, 2), 'takes': [{**r, 'take': os.path.basename(r['take'])} for r in rows]}
    print(lid, '->', os.path.basename(best['take']), round(dur, 2), '|', [(os.path.basename(r['take'])[-6:-4], r['missed'], r['extra'], r['heard']) for r in rows], flush=True)
json.dump(list(sel.values()), open(selp, 'w'), indent=1)
