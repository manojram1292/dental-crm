"""Shared helpers for the voice lab (lab/voicelab). Nothing here writes outside lab/voicelab."""
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal as sps

LAB = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(LAB))
KMODEL = os.environ.get('KOKORO_DIR', '/tmp/claude-0/-home-user-dental-crm/98c18506-4c60-5696-b6d2-9400870fcaf8/scratchpad/kmodel')
SR_K = 24000


def script(ep=44):
    return json.load(open(f'{ROOT}/script/ep{ep:02d}.en.json'))


def timeline(ep=44):
    return json.load(open(f'{ROOT}/build/timeline.ep{ep:02d}.en.json'))


def cast():
    return json.load(open(f'{ROOT}/script/cast.json'))


def old_meta(ep, lid):
    return json.load(open(f'{ROOT}/voice/ep{ep:02d}/en/{lid}.json'))


def load_names():
    """The NAMES table of tools/voice.py, read from its source (the tool itself is a script and cannot be imported)."""
    src = open(f'{ROOT}/tools/voice.py').read()
    i, j = src.index('NAMES = {'), src.index('\nap = argparse')
    ns = {}
    exec(src[i:j], ns)
    return ns['NAMES']


NAMES = load_names()
_pat = re.compile(r'(?<![\w])(' + '|'.join(sorted(map(re.escape, NAMES), key=len, reverse=True)) + r')(?![\w])')
_tok = None


def tok():
    global _tok
    if _tok is None:
        from kokoro_onnx.tokenizer import Tokenizer
        _tok = Tokenizer()
    return _tok


def phonemes(text, g2p='en-us'):
    """As tools/voice.py: names from NAMES, the rest from espeak."""
    def seg(p):
        if p in NAMES:
            v = NAMES[p]
            return v[g2p] if isinstance(v, dict) else v
        if not p.strip():
            return p
        body, tail = p.strip(), ''
        m = re.search(r'(?:^|\s)([aA])$', body)
        if m and p[-1] == ' ':
            body, tail = body[:m.start(1)].strip(), ('ɐ' if g2p == 'en-us' else 'ə')
        ph = tok().phonemize(body, g2p) if body else ''
        return (' ' if p[0] == ' ' else '') + ' '.join(x for x in (ph, tail) if x) + (' ' if p[-1] == ' ' else '')
    return ''.join(seg(p) for p in _pat.split(text))


_k = None


def kokoro():
    global _k
    if _k is None:
        import onnxruntime as ort
        from kokoro_onnx import Kokoro
        so = ort.SessionOptions()
        so.intra_op_num_threads = 2
        sess = ort.InferenceSession(KMODEL + '/model.onnx', so, providers=['CPUExecutionProvider'])
        _k = Kokoro.from_session(sess, KMODEL + '/voices.npz')
    return _k


def style(spec):
    """'am_michael' or a blend 'am_michael:0.6+bm_george:0.4' → the (510,1,256) style array."""
    k = kokoro()
    parts = [p.split(':') for p in spec.split('+')]
    w = np.array([float(p[1]) if len(p) > 1 else 1.0 for p in parts])
    w = w / w.sum()
    return sum(wi * k.get_voice_style(p[0]) for wi, p in zip(w, parts)).astype(np.float32)


def trim(x, sr, head=0.02, tail=0.06, thr=0.01):
    nz = np.nonzero(np.abs(x) > thr)[0]
    if not len(nz):
        return x
    return x[max(0, nz[0] - int(head * sr)): nz[-1] + int(tail * sr)]


def env_db(x, sr, win=0.02):
    n = max(1, int(sr * win))
    e = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(n) / n, 'same'))
    return 20 * np.log10(e + 1e-9)


def silences(x, sr, min_len=0.06, rel_db=-32):
    """Runs where the 20 ms envelope is rel_db under the file's 95th-percentile level → [(t0, t1)], inner only."""
    e = env_db(x, sr)
    thr = np.percentile(e, 95) + rel_db
    q = e < thr
    out, i, n = [], 0, len(q)
    while i < n:
        if q[i]:
            j = i
            while j < n and q[j]:
                j += 1
            if i > 0 and j < n and (j - i) / sr >= min_len:
                out.append((i / sr, j / sr))
            i = j
        else:
            i += 1
    return out


def norm_rms(x, target=-21.0, peak=-1.0):
    act = np.abs(x) > 0.005
    g = 10 ** ((target - 20 * np.log10(np.sqrt(np.mean(x[act] ** 2)) + 1e-9)) / 20)
    g = min(g, 10 ** (peak / 20) / (np.abs(x).max() + 1e-9))
    return (x * g).astype(np.float32)


def atempo(x, sr, factor):
    """Pitch-preserving tempo change (ffmpeg atempo, WSOLA). factor > 1 = faster."""
    if abs(factor - 1) < 0.004:
        return x
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', '-af', f'atempo={factor:.5f}',
                        '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-'], input=x.astype('<f4').tobytes(), capture_output=True)
    return np.frombuffer(p.stdout, '<f4').copy()


def spoken_lines(ep=44):
    return [l for l in script(ep)['lines'] if l.get('voice') is not False]


def f0_stats(x, sr, floor=55, ceil=330):
    """Pitch contour numbers for one utterance (Praat autocorrelation pitch, 10 ms step), in semitones about its own median."""
    import parselmouth
    snd = parselmouth.Sound(x.astype(np.float64), sampling_frequency=sr)
    p = snd.to_pitch_ac(time_step=0.01, pitch_floor=floor, pitch_ceiling=ceil)
    f = p.selected_array['frequency']
    v = f[f > 0]
    if len(v) < 10:
        return None
    st = 12 * np.log2(v / np.median(v))
    # movement: mean absolute slope inside voiced runs (st/s), after a 50 ms smoothing
    full = np.where(f > 0, 12 * np.log2(np.maximum(f, 1) / np.median(v)), np.nan)
    d = np.abs(np.diff(full)) / 0.01
    d = d[np.isfinite(d) & (d < 150)]
    return {'median_hz': round(float(np.median(v)), 1), 'range_st': round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2),
            'sd_st': round(float(st.std()), 2), 'slope_st_s': round(float(d.mean()), 1) if len(d) else 0.0,
            'voiced_frac': round(len(v) / len(f), 2)}


def bands(x, sr):
    f, p = sps.welch(x, sr, nperseg=4096)
    tot = p.sum()
    b = lambda lo, hi: round(100 * float(p[(f >= lo) & (f < hi)].sum() / tot), 2)
    return {'<150': b(0, 150), '150-500': b(150, 500), '500-2k': b(500, 2000), '2k-5k': b(2000, 5000), '5k-9k': b(5000, 9000), '>9k': b(9000, sr / 2),
            'centroid_hz': round(float((f * p).sum() / tot))}
