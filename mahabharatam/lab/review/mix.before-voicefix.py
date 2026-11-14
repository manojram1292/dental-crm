#!/usr/bin/env python3
"""
Mix whatever stems exist into audio/epNN/mix.<lang>.wav (what tools/render.mjs muxes).

  music  audio/epNN/music.wav            (tools/score.py; must match the current timeline)
  voice  voice/epNN/<lang>/<line id>.wav (optional, any sample rate / channels / PCM16/24/32/float32)

Each voice line is placed at its line's speechStart from build/timeline.<lang>.json,
the narration stem is lightened (VOICE_EQ: a gentle 90 Hz high-pass, a −4 dB low shelf
at 170 Hz and a −1.5 dB air shelf at 7.5 kHz: less boom, softer edges; no compressor),
then normalised to −16 LUFS, and the music is ducked under
it (−8 dB, 60 ms attack / 400 ms release, keyed by the voice's own envelope).
A silent Next card (a line with "voice": false at the end) sits 9 dB under the rest: the card is quiet.
MASTER (from the November remaster; independent review item 3): the mix is brought to −14 LUFS
integrated with a look-ahead true-peak limiter at −1 dBTP (4× oversampled peaks, a 10 ms min-hold
and an 8 ms smoothing window, so the gain is never above what any peak allows). Before this the
whole mix was only peak-normalised and released at −19 to −21 LUFS.

FROM EPISODE 31 (independent review 21–30, items 5 and 10; measured on the mp4 by tools/scorecard.py):
  · the Next window is set NEXT_UNDER dB (10) under the body's integrated loudness AFTER mastering (before, the limiter
    squeezed the body and the Next ended only 1–2 dB under it on the mp4);
  · REAL SILENCE before the turn (the line whose note says "TURN"): everything is muted (≤ −60 dB) between the end of the
    previous speech and the turn's speech, with 50 ms ramps, so silencedetect finds a ≥ 0.6 s rest at −45 dB;
  · DYNAMICS: a script line may carry "mixDb" (e.g. −5 for an intimate line, +1 for a peak), applied to the whole mix over
    the line; when the loudness range (LRA, EBU R128 short-term, computed here) is under 4 LU, the mixDb offsets are
    deepened (×1.5, ×2) until it reaches 4.2 LU.

    python3 tools/mix.py [--ep 1] [--lang en]
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal as sps
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

sys.path.insert(0, os.path.dirname(__file__))
from score import SR, ROOT, lufs, true_peak_db, write_wav, db, ep_tag  # noqa: E402

VOICE_LUFS = -16.0
DUCK_DB = 8.0
# Voice-stem EQ ("lighter, less heavy and boomy, softer"): (kind, freq Hz, gain dB, Q or slope)
VOICE_EQ = [('hp', 90.0, 0.0, 0.707), ('lowshelf', 170.0, -4.0, 0.8), ('highshelf', 7500.0, -1.5, 0.7)]


def biquad(kind, f0, gain_db, q):
    """RBJ audio-EQ-cookbook biquad → (b, a). Shelves take q as the slope S."""
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    c, s = np.cos(w), np.sin(w)
    if kind == 'hp':
        al = s / (2 * q)
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
        a = [1 + al, -2 * c, 1 - al]
    elif kind == 'peak':   # a bell (used by the trailer's third cut only)
        al = s / (2 * q)
        b = [1 + al * A, -2 * c, 1 - al * A]
        a = [1 + al / A, -2 * c, 1 - al / A]
    else:
        al = s / 2 * np.sqrt((A + 1 / A) * (1 / q - 1) + 2)
        sq = 2 * np.sqrt(A) * al
        if kind == 'lowshelf':
            b = [A * ((A + 1) - (A - 1) * c + sq), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - sq)]
            a = [(A + 1) + (A - 1) * c + sq, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - sq]
        else:
            b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
            a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    b, a = np.array(b), np.array(a)
    return b / a[0], a / a[0]


# The trailer's second cut (script "scoreStops"; nothing else): a deep narrator keeps his chest. The episodes' EQ cuts at 90 Hz and
# shelves −4 dB under 170 Hz, which is where this voice's fundamental (about 96 Hz) lives.
VOICE_EQ_TRAILER = [('hp', 58.0, 0.0, 0.707), ('lowshelf', 160.0, 1.0, 0.8), ('highshelf', 7500.0, -1.0, 0.7)]


def voice_eq(x, eq=None):
    for kind, f0, g, q in (eq or VOICE_EQ):
        x = sps.lfilter(*biquad(kind, f0, g, q), x, axis=-1)
    return x


def read_wav(path):
    """Read a RIFF WAV (PCM 16/24/32 or IEEE float 32) → float (2, n) at SR."""
    with open(path, 'rb') as f:
        b = f.read()
    assert b[:4] == b'RIFF' and b[8:12] == b'WAVE', f'{path}: not a WAV file'
    off, fmt, data = 12, None, None
    while off + 8 <= len(b):
        cid, ln = b[off:off + 4], int.from_bytes(b[off + 4:off + 8], 'little')
        if cid == b'fmt ':
            fmt = b[off + 8:off + 8 + ln]
        elif cid == b'data':
            data = b[off + 8:off + 8 + ln]
            break
        off += 8 + ln + (ln & 1)
    tag, ch, sr = int.from_bytes(fmt[0:2], 'little'), int.from_bytes(fmt[2:4], 'little'), int.from_bytes(fmt[4:8], 'little')
    bits = int.from_bytes(fmt[14:16], 'little')
    if tag == 0xFFFE:
        tag = int.from_bytes(fmt[24:26], 'little')
    if tag == 3 and bits == 32:
        x = np.frombuffer(data, '<f4').astype(np.float64)
    elif bits == 16:
        x = np.frombuffer(data, '<i2') / 32768.0
    elif bits == 24:
        a = np.frombuffer(data, np.uint8).reshape(-1, 3).astype(np.int32)
        v = a[:, 0] | (a[:, 1] << 8) | (a[:, 2] << 16)
        x = np.where(v >= 1 << 23, v - (1 << 24), v) / float(1 << 23)
    elif bits == 32:
        x = np.frombuffer(data, '<i4') / 2147483648.0
    else:
        raise ValueError(f'{path}: unsupported WAV format (tag {tag}, {bits} bit)')
    x = x[: len(x) // ch * ch].reshape(-1, ch).T
    x = np.vstack([x[0], x[0]]) if ch == 1 else x[:2]
    if sr != SR:
        g = np.gcd(sr, SR)
        x = sps.resample_poly(x, SR // g, sr // g, axis=-1)
    return x


TARGET_LUFS_MASTER = -14.0
CEIL = -1.0


def limit(x, ceil_db=CEIL):
    """Look-ahead true-peak limiter: per-sample gain from 4×-oversampled peaks, min-held over 10 ms and
    averaged over 8 ms (an average of a wider min-hold never exceeds the gain any peak needs)."""
    c = db(ceil_db - 1.0)   # 1 dB of headroom for the AAC encode (sharp voice onsets overshoot by up to +1.9 dB on the mp4)
    up = sps.resample_poly(np.abs(x).max(0), 4, 1)
    pk = up.reshape(-1, 4).max(1) if len(up) % 4 == 0 else np.pad(up, (0, (-len(up)) % 4)).reshape(-1, 4).max(1)
    pk = np.maximum(pk[:x.shape[1]], np.abs(x).max(0))
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    g = minimum_filter1d(g, int(0.010 * SR))
    g = uniform_filter1d(g, int(0.008 * SR))
    return x * g


def master(x, ceil=CEIL):
    for _ in range(4):
        x = x * db(TARGET_LUFS_MASTER - lufs(x))
        x = limit(x, ceil)
        if abs(lufs(x) - TARGET_LUFS_MASTER) < 0.2 and true_peak_db(x) <= ceil:
            break
    if true_peak_db(x) > ceil:
        x = x * db(ceil - 0.05 - true_peak_db(x))
    return x


STEM_DUCK = {'mus': 11.0, 'amb': 5.0, 'foley': 2.0}   # dB under the voice (episode 41 on)
CEIL_41 = -1.5   # true-peak ceiling from episode 41 (measured on the mix; the AAC headroom is inside limit())
report = {}
NEXT_UNDER = 10.0
LRA_MIN = 4.6   # a margin over the gate's 4.0 (ffmpeg's ebur128 and this estimate differ by a few tenths)


STEM_DUCK_TRAILER3 = {'mus': 8.0, 'amb': 3.0, 'foley': 2.0}   # the trailer's third cut: the music no more than 8 dB under the voice
VOICE_EQ_TRAILER3_ADD = [('peak', 3200.0, 1.5, 0.9), ('peak', 320.0, -1.5, 1.0)]


def voice_room(x):
    """A short room for a voice that was synthesised dry (the trailer's third cut only): four early reflections and 70 ms of
    decaying noise, 15 dB under the voice, band-limited. Enough that it sits in a space; not enough to hear as reverb."""
    r = np.random.default_rng(97)
    n = int(0.11 * SR)
    t = np.arange(n) / SR
    ir = np.zeros((2, n))
    for ch in range(2):
        ir[ch] = r.standard_normal(n) * np.exp(-t / 0.028) * (t > 0.012)
        for d_, g_ in ((0.0071, 0.5), (0.0113, -0.4), (0.0173, 0.33), (0.0229, -0.25)):
            ir[ch, int((d_ + 0.0011 * ch) * SR)] += g_ * 6
    from scipy.signal import fftconvolve, butter, sosfilt
    wet = np.stack([fftconvolve(x[ch], ir[ch])[:x.shape[1]] for ch in range(2)])
    wet = sosfilt(butter(2, [250, 5500], 'bandpass', fs=SR, output='sos'), wet, axis=-1)
    k = db(-15.0) * np.sqrt(np.mean(x ** 2) + 1e-12) / np.sqrt(np.mean(wet ** 2) + 1e-12)
    return x + wet * k


def divine_voice(voice, tl, cfg, N, octave_path):
    """Krishna's own words in the trailer (script "divine"): under the voice, the same words an octave below (formants kept; made
    by lab/review/trailer/v3/divine.py); a wide double (two short delays, one each side, slowly moving); and a temple hall
    (pre-delay, a long tail) that rings on into the next shot. The sentence before gets a lighter share. Returns the voice bus
    with the double and the chorus in it, and the hall on a bus of its own (it must not hold the music down while it rings)."""
    from scipy.signal import fftconvolve, butter, sosfilt
    l = next(q for q in tl['lines'] if q['id'] == cfg['line'])
    w = l['words']
    tA, tB, tE = w[cfg['lightFromWord']]['t0'] - 0.05, w[cfg['fromWord']]['t0'] - 0.06, w[-1]['t1'] + 0.25
    env = np.zeros(N)   # 0 outside, the light share on the sentence before, 1 on the quoted words
    lightk = db(cfg['lightDb'] - cfg['octaveDb'])
    env[int(tA * SR):int(tB * SR)] = lightk
    env[int(tB * SR):int(tE * SR)] = 1.0
    env = uniform_filter1d(env, int(0.04 * SR))
    octv = read_wav(octave_path)
    i0 = int(round(l['speechStart'] * SR))
    o = np.zeros((2, N))
    n = min(octv.shape[1], N - i0)
    o[:, i0:i0 + n] = octv[:, :n]
    a, b = int(tB * SR), int(tE * SR)
    rms = lambda z: np.sqrt(np.mean(z ** 2) + 1e-12)
    o *= rms(voice[:, a:b]) / rms(o[:, a:b]) * db(cfg['octaveDb'])
    src = (voice + o) * env   # what is doubled and sent to the hall
    # the wide double: 13 ms left, 19 ms right, each drifting by 2.5 ms
    t = np.arange(N) / SR
    dbl = np.zeros((2, N))
    for ch, (d0, rate) in enumerate(((0.013, 0.31), (0.019, 0.23))):
        d = (d0 + 0.0025 * np.sin(2 * np.pi * rate * t + ch)) * SR
        idx = np.arange(N) - d
        i = np.clip(np.floor(idx).astype(int), 0, N - 2)
        fr = idx - np.floor(idx)
        dbl[ch] = (src[1 - ch, i] * (1 - fr) + src[1 - ch, i + 1] * fr) * (idx >= 0)
    # the hall
    r = np.random.default_rng(1108)
    nh = int((cfg['hallSeconds'] + 0.3) * SR)
    th = np.arange(nh) / SR
    pre = cfg['preDelayMs'] / 1000
    ir = np.stack([r.standard_normal(nh) * np.exp(-np.maximum(0, th - pre) * 6.91 / cfg['hallSeconds']) * (th >= pre) for _ in range(2)])
    ir = sosfilt(butter(2, [140, 6000], 'bandpass', fs=SR, output='sos'), ir, axis=-1)
    k0, k1 = max(0, int((tA - 0.2) * SR)), min(N, int((tE + 0.2) * SR))
    wet = np.zeros((2, N))
    for ch in range(2):
        y = fftconvolve(src[ch, k0:k1], ir[ch])
        m = min(len(y), N - k0)
        wet[ch, k0:k0 + m] = y[:m]
    wet *= rms(voice[:, a:b]) / rms(wet[:, a:int((tE + 0.5) * SR)]) * db(-7.0)
    out = voice + o * env + dbl * db(-9.0)
    return out, wet, {'quoted_words_from_s': round(tB, 2), 'to_s': round(tE, 2), 'light_share_from_s': round(tA, 2), 'octave_below_db': cfg['octaveDb'], 'octave_below_light_db': cfg['lightDb'], 'double_db': -9.0,
                      'hall': f"{cfg['hallSeconds']} s tail, {cfg['preDelayMs']} ms pre-delay, 7 dB under the words", 'hall_still_over_-50_dbfs_until_s': round(float(np.nonzero(np.abs(wet).max(0) > db(-50))[0][-1] / SR), 2)}


def win_levels(x, win=0.1, hop=0.05):
    """RMS (dBFS, both channels) of every 100 ms window, hop 50 ms → (start times, levels)."""
    m = (x ** 2).mean(axis=0)
    c = np.concatenate([[0.0], np.cumsum(m)])
    w, h = int(win * SR), int(hop * SR)
    i = np.arange(0, len(m) - w + 1, h)
    return i / SR, 10 * np.log10((c[i + w] - c[i]) / w + 1e-12)


def floor_report(x, stops, cfg, D):
    """The gate's measure (tools/gate.mjs reads this from mix.json): outside the stops, no 100 ms window under the floor and
    none more than dropDb below the loudest window of the 300 ms before it."""
    t, lv = win_levels(x)
    ok = np.ones(len(t), bool)
    for a, b in stops:
        ok &= ~((t + 0.1 > a - 0.005) & (t < b + 0.1))   # a window touching a stop, or the first 100 ms after one
    ok &= t + 0.1 <= D - cfg.get('endExemptS', 0.06)   # the trailer leaves its last 60 ms out; a "rules": 2 episode is measured to 100 ms before its end (the bed goes out over the last 80 ms, as a film ends)
    k = int(round(cfg['dropWindowS'] / 0.05))
    prev = np.array([lv[max(0, i - k):i + 1].max() for i in range(len(lv))])
    okd = ok.copy()
    for a, b in stops:
        okd &= ~((t >= a) & (t < b + cfg['dropWindowS'] + 0.1))
    under = ok & (lv < cfg['floorDb'])
    drop = okd & (prev - lv > cfg['dropDb'])
    iw = int(np.argmin(np.where(ok, lv, 99)))
    idp = int(np.argmax(np.where(okd, prev - lv, -99)))
    return {'floor_db': cfg['floorDb'], 'windows': int(ok.sum()), 'worst_window_db': round(float(lv[iw]), 1), 'worst_window_at_s': round(float(t[iw]), 2), 'windows_under_floor': int(under.sum()),
            'under_floor_at_s': [round(float(q), 2) for q in t[under][:40]], 'worst_drop_db': round(float((prev - lv)[idp]), 1), 'worst_drop_at_s': round(float(t[idp]), 2), 'drops_over_limit': int(drop.sum()),
            'drops_at_s': [round(float(q), 2) for q in t[drop][:40]], 'drop_limit_db': cfg['dropDb'], 'drop_window_s': cfg['dropWindowS']}, (t, lv, prev, ok, okd)


def bed_floor(mix, pre, stems, voice, tl, SL, N, ceil, cfg, sheet, mult=1.0):
    """The trailer's third cut: the mix must never fall into a hole. Where a 100 ms window of the mastered mix is under the floor,
    or more than dropDb under the loudest of the 300 ms before it, the bed (music and ambience stems, already ducked) is raised
    there, smoothly, by what is missing (never more than 14 dB), and the whole is mastered again. Three passes."""
    stops = json.load(open(sheet)).get('stops', []) if os.path.exists(sheet) else []
    D = N / SR
    bedg = np.zeros(N)   # dB added to the bed
    lg = line_gains(tl, SL, N, mult)
    rep0 = None
    for it in range(6):
        rep, (t, lv, prev, ok, okd) = floor_report(mix, stops, cfg, D)
        if rep0 is None:
            rep0 = rep
        if rep['windows_under_floor'] == 0 and rep['drops_over_limit'] == 0:
            break
        need = np.zeros(len(t))
        need = np.where(ok, np.maximum(need, cfg['floorDb'] + 1.5 - lv), need)
        need = np.where(okd, np.maximum(need, (prev - lv) - (cfg['dropDb'] - 1.5)), need)
        need = np.clip(need, 0, 6)
        add_db = np.zeros(N)
        for i in np.nonzero(need > 0)[0]:
            a, b = int(t[i] * SR), int((t[i] + 0.1) * SR)
            add_db[a:b] = np.maximum(add_db[a:b], need[i])
        add_db = uniform_filter1d(maximum_filter1d(add_db, int(0.04 * SR)), int(0.05 * SR))
        bedg = np.minimum(bedg + add_db, 14.0)
        for a, b in stops:
            bedg[int(a * SR):int(b * SR)] = 0
        g = db(bedg)
        x = voice + stems['foley'] + stems.get('fx', 0) + (stems['mus'] + stems['amb']) * g
        n0 = int(0.003 * SR)
        x[:, :n0] *= np.linspace(0, 1, n0)
        mix = master(x * lg, ceil)
    rep, _ = floor_report(mix, stops, cfg, D)
    rep['before_lifting_the_bed'] = {k_: rep0[k_] for k_ in ('worst_window_db', 'worst_window_at_s', 'windows_under_floor', 'worst_drop_db', 'worst_drop_at_s', 'drops_over_limit')}
    rep['bed_lift_db_max'] = round(float(bedg.max()), 1)
    rep['bed_lifted_seconds'] = round(float((bedg > 0.5).sum() / SR), 2)
    return mix, rep


def lra(x):
    """EBU R128 loudness range: K-weighted 3 s short-term loudness every 0.1 s, abs gate −70, rel gate −20 LU, P95 − P10."""
    from score import _K1, _K2
    y = sps.lfilter(*_K2, sps.lfilter(*_K1, x, axis=-1), axis=-1)
    p = (y ** 2).sum(0)
    w, h = int(3 * SR), int(0.1 * SR)
    cs = np.concatenate([[0], np.cumsum(p)])
    st = np.arange(0, len(p) - w + 1, h)
    lv = -0.691 + 10 * np.log10((cs[st + w] - cs[st]) / w + 1e-20)
    lv = lv[lv > -70]
    if not len(lv):
        return 0.0
    rel = -0.691 + 10 * np.log10(np.mean(10 ** ((lv + 0.691) / 10))) - 20
    lv = lv[lv > rel]
    return float(np.percentile(lv, 95) - np.percentile(lv, 10))


def line_gains(tl, SL, N, mult=1.0):
    g = np.zeros(N)
    for l in tl['lines']:
        d = SL.get(l['id'], {}).get('mixDb')
        if d:
            i0, i1 = int(l['start'] * SR), min(N, int(l['end'] * SR))
            g[i0:i1] += d * mult
    return db(uniform_filter1d(g, int(0.3 * SR)))


# ─── "rules": 2 (episodes scripted after the trailer; README "Standing rules learned from the trailer") ──────────────────────────
RULES2 = {'duck': {'mus': 8.0, 'amb': 3.0, 'foley': 2.0}, 'release_s': 0.09, 'rest_dip_db': 3.5, 'next_under_db': 6.0, 'floor': {'floorDb': -26, 'dropDb': 10, 'dropWindowS': 0.3, 'endExemptS': 0.06},   # as the trailer; the check on the finished file leaves out 0.1 s (its decoded sound is a few ms longer)
          'ceil_db': -2.5}   # the limiter's ceiling 1 dB under an older episode's: AAC overshoots voice onsets and drum hits; the mp4 must stay ≤ −1.5 dBTP


def main_rules2(ep, tag, lang, tl, sc):
    """The mix of an episode whose script says "rules": 2. What differs from the older episodes (which are mixed exactly as before):
      · SOUND FROM FRAME 0 (a 3 ms ramp, no fade-in) and NO SILENCE ANYWHERE: a rest (the gap before the TURN line and before every
        line marked "rest": true) is a DIP: the duck lets go as in any pause and the bed runs on 3.5 dB under its own level; it does not stop;
      · the music ducks 8 dB (ambience 3, foley 2) and comes back within 90 ms;
      · after mastering, wherever a 100 ms window is under −26 dBFS or more than 10 dB under the loudest of the 300 ms before it,
        the bed (music + ambience) is raised there and the whole mastered again, until neither happens (reported as "bed_floor");
      · the Next band sits 6 dB under the body, reached over 0.5 s (10 dB at once would itself be a fall of over 10 dB in 0.3 s);
      · the narrator's chain is the approved trailer's (chest kept, +1.5 dB presence, a short room), since it is the trailer's voice;
      · about −14 LUFS, limiter ceiling −2.5 dBTP so the encoded file stays under −1.5.
    Writes mix.<lang>.wav, mix.<lang>.json and voice-stem.<lang>.wav."""
    C = RULES2
    N = int(round(tl['duration'] * SR)); D = N / SR
    SL = {l['id']: l for l in sc['lines']}; L = tl['lines']
    side = os.path.join(ROOT, 'audio', tag, 'music.json')
    stamp = json.load(open(side))['stamp'] if os.path.exists(side) else {}
    if stamp.get('timeline') != tl['signature']:
        sys.exit(f'audio/{tag} was scored for timeline {stamp.get("timeline")}, not {tl["signature"]} ({lang}): run `python3 tools/score.py --ep {ep} --lang {lang}`')
    voice = np.zeros((2, N)); placed = []
    for l in L:
        if not l.get('voice'):
            continue
        v = read_wav(os.path.join(ROOT, l['voice'])); i0 = int(round(l['speechStart'] * SR)); n = min(v.shape[1], N - i0)
        if n > 0:
            voice[:, i0:i0 + n] += v[:, :n]; placed.append(l['id'])
    if not placed:
        sys.exit(f'{tag}: "rules": 2 needs the voice (tools/voice2.py) before the mix')
    voice = voice_room(voice_eq(voice_eq(voice, VOICE_EQ_TRAILER), VOICE_EQ_TRAILER3_ADD))
    voice *= db(VOICE_LUFS - lufs(voice))
    e = maximum_filter1d(np.abs(voice).max(0), int(0.03 * SR))
    key = np.clip((20 * np.log10(e + 1e-9) + 45) / 15, 0, 1)
    sm = uniform_filter1d(maximum_filter1d(key, int(C['release_s'] * SR)), int(0.06 * SR))
    # the rests: the bed runs on, 3.5 dB under its own level (as the approved trailer's two rests)
    ti = next((i for i, l in enumerate(L) if 'TURN' in SL.get(l['id'], {}).get('note', '')), None)
    rest_ix = [i for i, l in enumerate(L) if i and (i == ti or SL.get(l['id'], {}).get('rest'))]
    dip = np.zeros(N); rests = []
    for i in rest_ix:
        prev = next((l for l in reversed(L[:i]) if l.get('voice')), None)
        a, b = (prev['speechEnd'] if prev else L[i]['start']) - 0.05, L[i]['speechStart'] + 0.05
        dip[int((a + 0.1) * SR):int((b - 0.1) * SR)] = C['rest_dip_db']
        rests.append({'before': L[i]['id'], 'from_s': round(a + 0.05, 2), 'seconds': round(max(0, b - a - 0.1), 2), 'bed_dip_db': C['rest_dip_db']})
    dip = uniform_filter1d(dip, int(0.12 * SR))
    stems = {}
    rmsdb = lambda z: 10 * np.log10(np.mean(z ** 2) + 1e-12)
    for n_, d_ in C['duck'].items():
        pth = os.path.join(ROOT, 'audio', tag, f'{n_}.wav')
        if not os.path.exists(pth):
            sys.exit(f'audio/{tag}/{n_}.wav missing: run tools/score.py')
        st_ = read_wav(pth)[:, :N]; st_ = np.pad(st_, ((0, 0), (0, N - st_.shape[1])))
        stems[n_] = st_ * db(-d_ * sm - (dip if n_ != 'foley' else 0))
        if n_ == 'mus':
            on, off = sm > 0.9, sm < 0.1
            report['music_under_voice_db'] = round(float(rmsdb(stems[n_][:, on]) - rmsdb(st_[:, off])), 1) if on.any() and off.any() else None
    nx = next((l for l in L if l['id'] == 'next' and not l.get('voice')), None)
    lgs = {}

    def compose(bedg, mult, next_db):
        x = voice + stems['foley'] + (stems['mus'] + stems['amb']) * db(bedg)
        if nx:
            i0 = int(nx['start'] * SR); r = min(int(0.5 * SR), N - i0); g = np.ones(N)
            g[i0:i0 + r] = db(np.linspace(0, -next_db, r)); g[i0 + r:] = db(-next_db); x = x * g
        n0 = int(0.003 * SR); x[:, :n0] *= np.linspace(0, 1, n0)
        if mult not in lgs:
            lgs[mult] = line_gains(tl, SL, N, mult)
        return master(x * lgs[mult], C['ceil_db'])

    bedg = np.zeros(N); next_db = C['next_under_db'] + 0.5
    for mult in (1.0, 1.5, 2.0, 2.6):
        mix = compose(bedg, mult, next_db)
        if lra(mix) >= LRA_MIN:
            break
    rep0 = None
    for it in range(12):
        rep, (t, lv, prev, ok, okd) = floor_report(mix, [], C['floor'], D)
        if rep0 is None:
            rep0 = rep
        under_next = (lufs(mix[:, :int(nx['start'] * SR)]) - lufs(mix[:, int(nx['start'] * SR):])) if nx else 99
        if rep['windows_under_floor'] == 0 and rep['drops_over_limit'] == 0 and under_next >= C['next_under_db'] - 0.5:
            break
        need = np.where(ok, np.maximum(0, C['floor']['floorDb'] + 1.5 - lv), 0)
        need = np.clip(np.where(okd, np.maximum(need, (prev - lv) - (C['floor']['dropDb'] - 1.5)), need), 0, 8)
        add_db = np.zeros(N)
        for i in np.nonzero(need > 0)[0]:
            a, b = int(t[i] * SR), int((t[i] + 0.1) * SR); add_db[a:b] = np.maximum(add_db[a:b], need[i])
        bedg = np.minimum(bedg + uniform_filter1d(maximum_filter1d(add_db, int(0.04 * SR)), int(0.05 * SR)), 26.0)   # an episode's bed is quieter than the trailer's: up to 26 dB in a hole (the trailer's limit was 14)
        if under_next < C['next_under_db'] - 0.5:
            next_db += min(3.0, C['next_under_db'] - under_next)
        mix = compose(bedg, mult, next_db)
    rep, (t, lv, prev, ok, okd) = floor_report(mix, [], C['floor'], D)
    rep['before_lifting_the_bed'] = {k_: rep0[k_] for k_ in ('worst_window_db', 'worst_window_at_s', 'windows_under_floor', 'worst_drop_db', 'worst_drop_at_s', 'drops_over_limit')}
    rep['bed_lift_db_max'] = round(float(bedg.max()), 1); rep['bed_lifted_seconds'] = round(float((bedg > 0.5).sum() / SR), 2)
    for r_ in rests:   # what the rest is in the finished mix: its quietest 100 ms window, and how far that is under the second before it
        w = (t >= r_['from_s']) & (t + 0.1 <= r_['from_s'] + r_['seconds']); b4 = (t >= r_['from_s'] - 1.0) & (t < r_['from_s'])
        r_['quietest_window_db'] = round(float(lv[w].min()), 1) if w.any() else None
        r_['under_the_second_before_db'] = round(float(np.median(lv[b4]) - np.median(lv[w])), 1) if w.any() and b4.any() else None
    out = os.path.join(ROOT, 'audio', tag, f'mix.{lang}.wav')
    write_wav(out, mix)
    write_wav(os.path.join(ROOT, 'audio', tag, f'voice-stem.{lang}.wav'), voice * db(-8.0))
    # word-to-cut margins: every line's last word against the end of its picture, its first against the start
    margins = []
    for l in L:
        if l.get('voice') and l.get('words'):
            margins.append({'line': l['id'], 'last_word_ends_before_cut_s': round(l['end'] - l['words'][-1]['t1'], 3), 'first_word_after_cut_s': round(l['words'][0]['t0'] - l['start'], 3)})
    report.update({'rules': 2, 'stems': list(C['duck']), 'duck_db': C['duck'], 'duck_release_ms': int(C['release_s'] * 1000), 'rests': rests, 'bed_floor': rep, 'line_gain_multiplier': mult,
                   'next_under_body_db': round(float(lufs(mix[:, :int(nx['start'] * SR)]) - lufs(mix[:, int(nx['start'] * SR):])), 1) if nx else None,
                   'first_100ms_db': round(float(rmsdb(mix[:, :int(0.1 * SR)])), 1), 'first_frame_33ms_db': round(float(rmsdb(mix[:, :int(SR / 30)])), 1),
                   'word_to_cut': margins, 'least_word_to_cut_s': min((m_['last_word_ends_before_cut_s'] for m_ in margins), default=None),
                   'voice_eq': 'as the trailer: high-pass 58 Hz, +1 dB under 160 Hz, −1 dB over 7.5 kHz, +1.5 dB at 3.2 kHz, −1.5 dB at 320 Hz, a short room 15 dB under',
                   'lufs': round(float(lufs(mix)), 2), 'true_peak_dbtp': round(float(true_peak_db(mix)), 2), 'lra': round(lra(mix), 1), 'timeline': tl['signature'], 'voiced': len(placed)})
    json.dump(report, open(os.path.join(ROOT, 'audio', tag, f'mix.{lang}.json'), 'w'), indent=1)
    print(f'wrote audio/{tag}/mix.{lang}.wav  {tl["duration"]:.2f} s  {lufs(mix):.1f} LUFS  {true_peak_db(mix):.2f} dBTP  LRA {lra(mix):.1f}  ("rules": 2) · floor: worst window {rep["worst_window_db"]} dBFS at {rep["worst_window_at_s"]} s, {rep["windows_under_floor"]} under · worst fall {rep["worst_drop_db"]} dB, {rep["drops_over_limit"]} over · '
          f'bed lifted up to {rep["bed_lift_db_max"]} dB over {rep["bed_lifted_seconds"]} s · Next {report["next_under_body_db"]} dB under · first 100 ms {report["first_100ms_db"]} dBFS · least word-to-cut {report["least_word_to_cut_s"]} s · rests {[(r_["before"], r_["seconds"], r_["quietest_window_db"]) for r_ in rests]}')


def main():
    args = sys.argv[1:]
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'
    ep, tag = ep_tag(args)
    tl = json.load(open(os.path.join(ROOT, 'build', f'timeline.{tag}.{lang}.json')))
    _scp0 = os.path.join(ROOT, 'script', f'{tag}.{lang}.json')
    _sc0 = json.load(open(_scp0)) if os.path.exists(_scp0) else {}
    if _sc0.get('rules', 1) >= 2 and _sc0.get('kind') != 'trailer':   # episodes scripted after the trailer: their own path; every other script is mixed below exactly as before
        return main_rules2(ep, tag, lang, tl, _sc0)
    N = int(round(tl['duration'] * SR))
    music_path = os.path.join(ROOT, 'audio', tag, 'music.wav')
    side = os.path.join(ROOT, 'audio', tag, 'music.json')
    if not os.path.exists(music_path):
        sys.exit(f'audio/{tag}/music.wav missing: run `python3 tools/score.py --ep {ep} --lang {lang}`')
    stamp = json.load(open(side))['stamp'] if os.path.exists(side) else {}
    if stamp.get('timeline') != tl['signature']:
        sys.exit(f'audio/{tag}/music.wav was scored for timeline {stamp.get("timeline")}, not {tl["signature"]} ({lang}): run `python3 tools/score.py --ep {ep} --lang {lang}`')
    music = read_wav(music_path)[:, :N]
    music = np.pad(music, ((0, 0), (0, N - music.shape[1])))

    voice = np.zeros((2, N))
    placed = []
    for l in tl['lines']:
        if not l.get('voice'):
            continue
        v = read_wav(os.path.join(ROOT, l['voice']))
        i0 = int(round(l['speechStart'] * SR))
        n = min(v.shape[1], N - i0)
        if n > 0:
            voice[:, i0:i0 + n] += v[:, :n]
            placed.append(l['id'])

    if placed:
        _scp = os.path.join(ROOT, 'script', f'{tag}.{lang}.json')
        _tr = os.path.exists(_scp) and json.load(open(_scp)).get('scoreStops')
        voice = voice_eq(voice, VOICE_EQ_TRAILER if _tr else None)
        if _tr:
            report['voice_eq'] = 'trailer: high-pass 58 Hz, +1 dB shelf under 160 Hz, −1 dB over 7.5 kHz'
        _t3 = _tr and json.load(open(_scp)).get('cut', 2) >= 3 and json.load(open(_scp)).get('bedFloor')
        if _t3:
            voice = voice_room(voice_eq(voice, VOICE_EQ_TRAILER3_ADD))
            report['voice_eq'] += '; third cut: +1.5 dB presence at 3.2 kHz, −1.5 dB at 320 Hz (boxiness), and a short room (70 ms, 15 dB under)'
        voice *= db(VOICE_LUFS - lufs(voice))
        _fx3 = np.zeros((2, N))
        _dv = _t3 and json.load(open(_scp)).get('divine')
        if _dv:
            voice, _fx3, report['divine'] = divine_voice(voice, tl, _dv, N, os.path.join(ROOT, 'audio', tag, 'vish.octave.wav'))
        # duck the music under the voice
        e = np.abs(voice).max(0)
        e = maximum_filter1d(e, int(0.03 * SR))
        key = np.clip((20 * np.log10(e + 1e-9) + 45) / 15, 0, 1)        # 0 below −45 dBFS, 1 above −30
        hold = maximum_filter1d(key, int((0.09 if _t3 else 0.4) * SR))   # bridge the gaps between words (third cut of the trailer: 90 ms only, so a pause fills at once)
        g_db = -DUCK_DB * uniform_filter1d(hold, int(0.06 * SR))
        mix = music * db(g_db) + voice
        # FROM EPISODE 41: three stems, each ducked by its own amount under the voice (music hardest, the place a little,
        # the foley hardly at all: an action you see must still be heard under a line)
        stem_paths = {n_: os.path.join(ROOT, 'audio', tag, f'{n_}.wav') for n_ in ('amb', 'foley', 'mus')}
        if ep >= 41 and all(os.path.exists(q) for q in stem_paths.values()):
            sm = uniform_filter1d(hold, int(0.06 * SR))
            mix = voice.copy()
            _duck = STEM_DUCK_TRAILER3 if _t3 else STEM_DUCK
            _stems3 = {'fx': _fx3}
            mix += _fx3
            for n_, d_ in _duck.items():
                st_ = read_wav(stem_paths[n_])[:, :N]
                st_ = np.pad(st_, ((0, 0), (0, N - st_.shape[1])))
                mix += st_ * db(-d_ * sm)
                _stems3[n_] = st_ * db(-d_ * sm)
                if n_ == 'mus':
                    on, offm = sm > 0.9, sm < 0.1
                    rms = lambda z: 10 * np.log10(np.mean(z ** 2) + 1e-12)
                    report['music_under_voice_db'] = round(float(rms((st_ * db(-d_ * sm))[:, on]) - rms(st_[:, offm])), 1) if on.any() and offm.any() else None
            report['stems'] = list(STEM_DUCK)
            report['duck_db'] = _duck
            if _t3:
                report['duck_release_ms'] = 150
                report['voice_stem_peak_dbfs'] = round(float(20 * np.log10(np.abs(voice).max() + 1e-9)), 2)
    else:
        mix = music.copy()
    # the silent Next card(s) at the end: 9 dB down, faded in over 0.25 s
    for l in tl['lines']:
        if l['id'] == 'next' and not l.get('voice'):
            i0, i1 = int(l['start'] * SR), N
            g = np.ones(N)
            ramp = min(int(0.25 * SR), i1 - i0)
            g[i0:i0 + ramp] = np.linspace(1, db(-9.0), ramp)
            g[i0 + ramp:i1] = db(-9.0)
            mix = mix * g
    # a 350 ms fade-in: a hard onset in the first AAC frames overshoots by up to +2 dB after encoding
    n0 = int(0.35 * SR)
    _sc3 = json.load(open(os.path.join(ROOT, 'script', f'{tag}.{lang}.json'))) if os.path.exists(os.path.join(ROOT, 'script', f'{tag}.{lang}.json')) else {}
    _bed3 = _sc3.get('kind') == 'trailer' and _sc3.get('cut', 2) >= 3 and _sc3.get('bedFloor')
    if _bed3:
        n0 = int(0.003 * SR)   # the trailer's third cut sounds from its first frame (3 ms: no click); the lower ceiling below is its AAC headroom
        mix[:, :n0] *= np.linspace(0, 1, n0)
    else:
        mix[:, :n0] *= np.linspace(0, 1, n0) ** 1.5
    scp = os.path.join(ROOT, 'script', f'{tag}.{lang}.json')
    SL = {l['id']: l for l in json.load(open(scp))['lines']} if os.path.exists(scp) else {}
    new_rules = ep >= 31
    pre = mix
    ceil = CEIL_41 if ep >= 41 else CEIL
    if os.path.exists(scp) and json.load(open(scp)).get('scoreStops'):
        # the trailer's second cut: its drum hits overshoot by up to 1.3 dB once encoded to AAC (measured on the mp4: −1.1 dBTP from a −2.4 dBTP
        # mix), so the mix is held 1 dB lower than an episode's and the mp4 stays under −1.5 dBTP
        ceil = CEIL_41 - 1.0
        report['ceiling'] = 'trailer: −2.5 dBTP in the limiter (−3.5 on the mix) so that the encoded mp4 stays under −1.5 dBTP'
    for mult in ((1.0, 1.5, 2.0, 2.6) if new_rules else (1.0,)):
        mix = master(pre * line_gains(tl, SL, N, mult), ceil) if new_rules else master(pre)
        if not new_rules or lra(mix) >= LRA_MIN:
            break
    if new_rules:
        L = tl['lines']
        nx = next((l for l in L if l['id'] == 'next' and not l.get('voice')), None)
        if nx:
            i0 = int(nx['start'] * SR)
            for _ in range(4):   # the cliffhanger's last word and the Next sting sit at the boundary: iterate
                under = lufs(mix[:, :i0]) - lufs(mix[:, i0:])
                if under >= NEXT_UNDER - 0.2:
                    break
                g = np.ones(N)
                ramp = int(0.04 * SR)
                k = db(-(NEXT_UNDER + 0.3 - under))
                g[i0 - ramp:i0] = np.linspace(1, k, ramp)
                g[i0:] = k
                mix = mix * g
        ti = next((i for i, l in enumerate(L) if 'TURN' in SL.get(l['id'], {}).get('note', '')), None)
        # episode 41 on: every line marked "rest": true gets the same real silence before it (two per episode where the story allows)
        rests = [i for i, l in enumerate(L) if i and (i == ti or (ep >= 41 and SL.get(l['id'], {}).get('rest')))]
        # The trailer's second cut ("scoreStops": true) cuts its stems to silence on a frame itself (tools/score_trailer.py);
        # muting again here would eat the conch that leads the turn. Nothing else sets the flag.
        score_stops = os.path.exists(scp) and json.load(open(scp)).get('scoreStops')
        if score_stops:
            report['rests_in_score'] = [L[i]['id'] for i in rests]
            rests = []
            b = a = 0
        report['rests'] = []
        for ti in rests:
            prev = next((l for l in reversed(L[:ti]) if l.get('voice')), None)
            a, b = (prev['speechEnd'] if prev else L[ti]['start']) + 0.06, L[ti]['speechStart'] - 0.03
            report['rests'].append({'before': L[ti]['id'], 'seconds': round(max(0, b - a), 2)})
            if b - a >= 0.3:
                g = np.ones(N)
                i0, i1, r = int(a * SR), int(b * SR), int(0.05 * SR)
                g[i0:i1] = 1e-3
                g[i0:i0 + r] = np.linspace(1, 1e-3, r)
                g[i1 - r:i1] = np.linspace(1e-3, 1, r)
                mix = mix * g
        print(f'  ep{ep}: LRA {lra(mix):.1f} LU · Next {lufs(mix[:, :int(nx["start"] * SR)]) - lufs(mix[:, int(nx["start"] * SR):]) if nx else 0:.1f} dB under the body · silence before the turn {max(0, b - a) if ti else 0:.2f} s')
    if _bed3 and placed:
        mix, report['bed_floor'] = bed_floor(mix, pre, _stems3, voice, tl, SL, N, ceil, _bed3, os.path.join(ROOT, 'audio', tag, 'score-trailer.json'), mult)
        report['line_gain_multiplier'] = mult
        write_wav(os.path.join(ROOT, 'audio', tag, f'voice-stem.{lang}.wav'), voice * db(-8.0))   # the voice alone as laid, EQ and room on, 8 dB down so that the file cannot clip (for the click checks)
    out = os.path.join(ROOT, 'audio', tag, f'mix.{lang}.wav')
    write_wav(out, mix)
    if ep >= 41:
        report.update({'lufs': round(float(lufs(mix)), 2), 'true_peak_dbtp': round(float(true_peak_db(mix)), 2), 'lra': round(lra(mix), 1), 'timeline': tl['signature'], 'voiced': len(placed)})
        json.dump(report, open(os.path.join(ROOT, 'audio', tag, f'mix.{lang}.json'), 'w'), indent=1)
    print(f'wrote audio/{tag}/mix.{lang}.wav  {tl["duration"]:.2f} s  {lufs(mix):.1f} LUFS  {true_peak_db(mix):.2f} dBTP  '
          f'voice lines: {", ".join(placed) if placed else "none (music only)"}')


if __name__ == '__main__':
    main()
