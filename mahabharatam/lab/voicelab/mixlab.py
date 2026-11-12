#!/usr/bin/env python3
"""The episode mix of tools/mix.py (episode 41 on: three stems + voice, −14 LUFS, true peak ≤ −1.5 dBTP, real silences
before "rest" lines, mixDb dynamics, the quiet Next), with the voice lines taken from a lab directory instead of
voice/epNN/en. Nothing under audio/ or voice/ is written. Functions are imported from tools/mix.py and tools/score.py.

    mix_episode(voice_dir, out_wav, ep=44, starts=None, speech_ends=None, room=False)

voice_dir/<id>.wav: one file per line, placed at the timeline's speechStart (or starts[id]).
speech_ends: {id: s} if the new voice ends at another time than the timeline's speechEnd (the rests are cut from it).
room: add a short, quiet early-reflection room to the voice stem (lab option; off = exactly the pipeline's chain).
"""
import json, os, sys
import numpy as np
from scipy import signal as sps
from scipy.ndimage import maximum_filter1d, uniform_filter1d

LAB = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(LAB))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
_argv, sys.argv = sys.argv, sys.argv[:1]
import mix as M          # noqa: E402  (main() is guarded)
from score import SR, lufs, true_peak_db, write_wav, db   # noqa: E402
sys.argv = _argv


def room_ir(rt=0.28, pre=0.012, seed=7):
    """A small dry room: sparse early reflections + a short noise tail, band-limited 250 Hz – 5 kHz. Deterministic."""
    rng = np.random.default_rng(seed)
    n = int(SR * (rt + pre + 0.05))
    t = np.arange(n) / SR
    tail = rng.standard_normal((2, n)) * np.exp(-6.9 * t / rt)
    tail[:, :int(pre * SR)] = 0
    for d, g in ((0.013, 0.5), (0.019, -0.4), (0.027, 0.33), (0.034, -0.25)):
        tail[:, int(d * SR)] += g * 6 * np.array([1.0, 0.8 if g > 0 else 1.1])
    sos = sps.butter(2, [250, 5000], 'bandpass', fs=SR, output='sos')
    tail = sps.sosfilt(sos, tail, axis=-1)
    return tail / np.sqrt((tail ** 2).sum(1, keepdims=True))


def deess(x, amount_db=4.0):
    """Split-band de-esser: the 5–10 kHz band is turned down (up to amount_db) only while it dominates the 0.3–3 kHz band."""
    hi = sps.sosfilt(sps.butter(4, [5000, 10000], 'bandpass', fs=SR, output='sos'), x, axis=-1)
    lo = sps.sosfilt(sps.butter(2, [300, 3000], 'bandpass', fs=SR, output='sos'), x, axis=-1)
    w = int(0.008 * SR)
    eh = np.sqrt(np.maximum(uniform_filter1d((hi ** 2).max(0), w), 0)) + 1e-9
    el = np.sqrt(np.maximum(uniform_filter1d((lo ** 2).max(0), w), 0)) + 1e-9
    over = np.clip((20 * np.log10(eh / el) + 6) / 10, 0, 1)      # starts when the s-band is within 6 dB of the body
    g = db(-amount_db * uniform_filter1d(over, int(0.004 * SR)))
    return x - hi * (1 - g)


def mix_episode(voice_dir, out_wav, ep=44, starts=None, speech_ends=None, room=False, de_ess=False, report_path=None):
    tag = f'ep{ep:02d}'
    tl = json.load(open(os.path.join(ROOT, 'build', f'timeline.{tag}.en.json')))
    SL = {l['id']: l for l in json.load(open(os.path.join(ROOT, 'script', f'{tag}.en.json')))['lines']}
    N = int(round(tl['duration'] * SR))
    starts, speech_ends = starts or {}, speech_ends or {}
    voice = np.zeros((2, N))
    placed = []
    for l in tl['lines']:
        if not l.get('voice'):
            continue
        v = M.read_wav(os.path.join(voice_dir, l['id'] + '.wav'))
        i0 = int(round(starts.get(l['id'], l['speechStart']) * SR))
        n = min(v.shape[1], N - i0)
        voice[:, i0:i0 + n] += v[:, :n]
        placed.append(l['id'])
    voice = M.voice_eq(voice)
    if de_ess:
        voice = deess(voice)
    if room:
        wet = np.stack([sps.fftconvolve(voice[c], room_ir()[c])[:N] for c in range(2)])
        voice = voice + wet * db(-19.0)
    voice *= db(M.VOICE_LUFS - lufs(voice))
    e = maximum_filter1d(np.abs(voice).max(0), int(0.03 * SR))
    key = np.clip((20 * np.log10(e + 1e-9) + 45) / 15, 0, 1)
    hold = maximum_filter1d(key, int(0.4 * SR))
    sm = uniform_filter1d(hold, int(0.06 * SR))
    mix = voice.copy()
    rep = {}
    for n_, d_ in M.STEM_DUCK.items():
        st_ = M.read_wav(os.path.join(ROOT, 'audio', tag, f'{n_}.wav'))[:, :N]
        st_ = np.pad(st_, ((0, 0), (0, N - st_.shape[1])))
        mix += st_ * db(-d_ * sm)
        if n_ == 'mus':
            on, offm = sm > 0.9, sm < 0.1
            rms = lambda z: 10 * np.log10(np.mean(z ** 2) + 1e-12)
            rep['music_under_voice_db'] = round(float(rms((st_ * db(-d_ * sm))[:, on]) - rms(st_[:, offm])), 1)
    for l in tl['lines']:
        if l['id'] == 'next' and not l.get('voice'):
            i0, i1 = int(l['start'] * SR), N
            g = np.ones(N)
            ramp = min(int(0.25 * SR), i1 - i0)
            g[i0:i0 + ramp] = np.linspace(1, db(-9.0), ramp)
            g[i0 + ramp:i1] = db(-9.0)
            mix = mix * g
    n0 = int(0.35 * SR)
    mix[:, :n0] *= np.linspace(0, 1, n0) ** 1.5
    pre = mix
    for mult in (1.0, 1.5, 2.0, 2.6):
        mix = M.master(pre * M.line_gains(tl, SL, N, mult), M.CEIL_41)
        if M.lra(mix) >= M.LRA_MIN:
            break
    L = tl['lines']
    nx = next((l for l in L if l['id'] == 'next' and not l.get('voice')), None)
    if nx:
        i0 = int(nx['start'] * SR)
        for _ in range(4):
            under = lufs(mix[:, :i0]) - lufs(mix[:, i0:])
            if under >= M.NEXT_UNDER - 0.2:
                break
            g = np.ones(N)
            ramp = int(0.04 * SR)
            k = db(-(M.NEXT_UNDER + 0.3 - under))
            g[i0 - ramp:i0] = np.linspace(1, k, ramp)
            g[i0:] = k
            mix = mix * g
    ti = next((i for i, l in enumerate(L) if 'TURN' in SL.get(l['id'], {}).get('note', '')), None)
    rests = [i for i, l in enumerate(L) if i and (i == ti or SL.get(l['id'], {}).get('rest'))]
    rep['rests'] = []
    for ti in rests:
        prev = next((l for l in reversed(L[:ti]) if l.get('voice')), None)
        a = (speech_ends.get(prev['id'], prev['speechEnd']) if prev else L[ti]['start']) + 0.06
        b = starts.get(L[ti]['id'], L[ti]['speechStart']) - 0.03
        rep['rests'].append({'before': L[ti]['id'], 'seconds': round(max(0, b - a), 2)})
        if b - a >= 0.3:
            g = np.ones(N)
            i0, i1, r = int(a * SR), int(b * SR), int(0.05 * SR)
            g[i0:i1] = 1e-3
            g[i0:i0 + r] = np.linspace(1, 1e-3, r)
            g[i1 - r:i1] = np.linspace(1e-3, 1, r)
            mix = mix * g
    write_wav(out_wav, mix)
    rep.update({'lufs': round(float(lufs(mix)), 2), 'true_peak_dbtp': round(float(true_peak_db(mix)), 2), 'lra': round(M.lra(mix), 1),
                'stems': list(M.STEM_DUCK), 'duck_db': M.STEM_DUCK, 'timeline': tl['signature'], 'voiced': len(placed), 'room': room, 'de_ess': de_ess})
    if report_path:
        json.dump(rep, open(report_path, 'w'), indent=1)
    return rep


if __name__ == '__main__':
    # self-check: the pipeline's own voice through this copy of the chain must reproduce audio/ep44/mix.en.wav
    out = os.path.join(LAB, 'work', 'A.mix.wav')
    print(mix_episode(os.path.join(ROOT, 'voice', 'ep44', 'en'), out))
    a, b = M.read_wav(out), M.read_wav(os.path.join(ROOT, 'audio', 'ep44', 'mix.en.wav'))
    n = min(a.shape[1], b.shape[1])
    print('max |difference| to audio/ep44/mix.en.wav:', float(np.abs(a[:, :n] - b[:, :n]).max()))
