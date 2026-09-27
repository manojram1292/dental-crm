#!/usr/bin/env python3
"""
CLAUDE — MOTION REEL 2026 · soundtrack synthesiser
===================================================

Deterministically synthesises ``audio/showreel.wav``: 48 kHz, stereo, 16-bit
PCM, exactly 720 000 frames (15.000 s), 120 BPM, A minor. No samples and no
network: every sound is built from numpy/scipy maths with seeded RNGs, so two
runs produce bit-identical files.

The cue sheet is STORYBOARD.md §4. The explicit cue list in section 4 below
mirrors it, and the visuals are timed against those numbers.

    python3 tools/synth.py               render, print metrics, write previews
    python3 tools/synth.py --no-preview  skip the PNG previews

Layout
  1. constants & beat helpers
  2. DSP utilities: envelopes, band-limited oscillators, filters (scipy.signal
     plus a TPT state-variable filter for sweeps), convolution reverb with
     generated impulse responses, stereo tools, dynamics, BS.1770 loudness
  3. instruments
  4. cue list & arrangement
  5. mix bus & master chain
  6. verification: format, peak/true-peak, LUFS, DC, onset timing, silence,
     click detection, spectral balance, spectrogram/waveform PNGs
"""
from __future__ import annotations

import os
import sys
import time
import wave
import zlib
from functools import lru_cache

import numpy as np
from scipy import signal as sps
from scipy.ndimage import median_filter, minimum_filter1d, uniform_filter1d

# ════════════════════════════════════════════════════════════════════════════
# 1. Constants & beat helpers
# ════════════════════════════════════════════════════════════════════════════
SR = 48_000
N = 720_000                   # 15.000 s, exactly
DUR = N / SR
BPM = 120
BEAT = 60.0 / BPM             # 0.5 s: beats land on every 0.5 s of absolute time
BAR = 4 * BEAT                # 2.0 s
S16 = BEAT / 4                # 16th note = 0.125 s
SEED = 2026
TARGET_LUFS = -14.0
CEILING_DBTP = -1.0           # hard spec
LIMIT_DBTP = -1.25            # limiter target: margin for dither + rounding

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_WAV = os.path.join(ROOT, 'audio', 'showreel.wav')
PREVIEW = os.path.join(ROOT, '.preview')
TAU = 2.0 * np.pi


def smp(t):
    """Seconds → sample index (rounded)."""
    return int(round(t * SR))


def tvec(n):
    return np.arange(n) / SR


def db2lin(d):
    return 10.0 ** (np.asarray(d, float) / 20.0)


def lin2db(x):
    return 20.0 * np.log10(np.maximum(np.abs(x), 1e-12))


def beat_time(i):
    return i * BEAT


def mtof(m):
    return 440.0 * 2.0 ** ((np.asarray(m, float) - 69.0) / 12.0)


_PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def nm(name):
    """Note name → MIDI number: 'A4' → 69, 'G#3' → 56, 'Bb2' → 46."""
    pc, rest = _PC[name[0]], name[1:]
    if rest[:1] in ('#', 'b'):
        pc += 1 if rest[0] == '#' else -1
        rest = rest[1:]
    return 12 * (int(rest) + 1) + pc


def notes(s):
    return [nm(x) for x in s.split()]


def rng(*key):
    """Seeded generator per named use, so edits in one place never reshuffle another."""
    return np.random.default_rng([SEED, zlib.crc32(repr(key).encode())])


def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


# ════════════════════════════════════════════════════════════════════════════
# 2. DSP utilities
# ════════════════════════════════════════════════════════════════════════════
# ── envelopes ───────────────────────────────────────────────────────────────
def fade(x, a=0.002, r=0.004):
    """Raised-cosine fade-in/out (seconds) on the last axis. The last sample is 0."""
    x = np.array(x, dtype=float, copy=True)
    n = x.shape[-1]
    na, nr = min(n, max(1, smp(a))), min(n, max(1, smp(r)))
    x[..., :na] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(na) / na)
    x[..., n - nr:] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(nr) + 1) / nr)
    return x


def perc_env(n, attack=0.0015, decay=0.1, release=0.004, hold=0.0):
    t = tvec(n)
    return fade(np.exp(-np.maximum(t - attack - hold, 0.0) / decay), attack, release)


def burst_env(t, t0, attack, decay):
    """Raised-cosine attack at t0 followed by an exponential decay."""
    tt = t - t0
    a = 0.5 - 0.5 * np.cos(np.pi * np.clip(tt / attack, 0.0, 1.0))
    return np.where(tt >= 0.0, a * np.exp(-np.maximum(tt - attack, 0.0) / decay), 0.0)


def exp_curve(u, k):
    """0→1 exponential-ish curve; k>0 is ease-in (like E.inExpo when k≈7)."""
    u = np.clip(u, 0.0, 1.0)
    return (np.exp(k * u) - 1.0) / (np.exp(k) - 1.0)


def bezier_ease(x1, y1, x2, y2):
    """CSS cubic-bezier easing, vectorised (bisection on x(s))."""
    def bx(s):
        return 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s * s * x2 + s ** 3

    def by(s):
        return 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s * s * y2 + s ** 3

    def ease(u):
        u = np.clip(np.asarray(u, float), 0.0, 1.0)
        lo, hi = np.zeros_like(u), np.ones_like(u)
        for _ in range(42):
            mid = 0.5 * (lo + hi)
            below = bx(mid) < u
            lo, hi = np.where(below, mid, lo), np.where(below, hi, mid)
        return by(0.5 * (lo + hi))
    return ease


EASE_REEL = bezier_ease(0.83, 0.0, 0.17, 1.0)   # REEL.shared.CURVE


# ── band-limited oscillators ────────────────────────────────────────────────
def cycles(f, n, phase0=0.0):
    """Accumulated phase in cycles for a constant or per-sample frequency."""
    if np.ndim(f) == 0:
        return phase0 + float(f) * np.arange(n) / SR
    f = np.asarray(f, float)
    c = np.empty(n)
    c[0] = 0.0
    np.cumsum(f[:-1], out=c[1:])
    return phase0 + c / SR


def osc_sine(f, n, phase0=0.0):
    return np.sin(TAU * cycles(f, n, phase0))


def _blep(t, dt):
    """PolyBLEP residual for a unit step at phase 0 (t, dt in cycles)."""
    out = np.zeros_like(t)
    m = t < dt
    x = t[m] / dt[m]
    out[m] = x + x - x * x - 1.0
    m = t > 1.0 - dt
    x = (t[m] - 1.0) / dt[m]
    out[m] = x * x + x + x + 1.0
    return out


def _dt(f, n):
    return np.minimum(np.broadcast_to(np.abs(np.asarray(f, float)) / SR, (n,)).copy(), 0.5)


def osc_saw(f, n, phase0=0.0):
    """PolyBLEP sawtooth, alias-suppressed."""
    c = cycles(f, n, phase0)
    t = c - np.floor(c)
    return 2.0 * t - 1.0 - _blep(t, _dt(f, n))


def osc_square(f, n, phase0=0.0, pw=0.5):
    """PolyBLEP pulse/square, alias-suppressed."""
    c = cycles(f, n, phase0)
    t = c - np.floor(c)
    dt = _dt(f, n)
    y = np.where(t < pw, 1.0, -1.0)
    return y + _blep(t, dt) - _blep((t + 1.0 - pw) % 1.0, dt)


# ── noise ───────────────────────────────────────────────────────────────────
def pink(n, r):
    """Pink (1/f) noise via spectral shaping, unit RMS."""
    X = np.fft.rfft(r.standard_normal(n))
    f = np.fft.rfftfreq(n, 1.0 / SR)
    f[0] = f[1] if n > 1 else 1.0
    X /= np.sqrt(f / 1000.0)
    X[0] = 0.0
    y = np.fft.irfft(X, n)
    return y / (np.std(y) + 1e-12)


# ── filters (scipy.signal, causal) ──────────────────────────────────────────
@lru_cache(maxsize=1024)
def _butter(kind, f, order):
    wn = [min(v, SR * 0.49) for v in f] if isinstance(f, tuple) else min(f, SR * 0.49)
    return sps.butter(order, wn, btype=kind, fs=SR, output='sos')


def lpf(x, f, order=2):
    return sps.sosfilt(_butter('lowpass', float(f), order), x, axis=-1)


def hpf(x, f, order=2):
    return sps.sosfilt(_butter('highpass', float(f), order), x, axis=-1)


def bpf(x, lo, hi, order=2):
    return sps.sosfilt(_butter('bandpass', (float(lo), float(hi)), order), x, axis=-1)


@lru_cache(maxsize=256)
def _rbj(kind, f, gain_db, q):
    """RBJ cookbook biquad → sos row."""
    A = 10 ** (gain_db / 40.0)
    w0 = TAU * f / SR
    cw, sw = np.cos(w0), np.sin(w0)
    al = sw / (2 * q)
    if kind == 'peak':
        b = [1 + al * A, -2 * cw, 1 - al * A]
        a = [1 + al / A, -2 * cw, 1 - al / A]
    elif kind == 'lowshelf':
        s = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * cw + s), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - s)]
        a = [(A + 1) + (A - 1) * cw + s, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - s]
    elif kind == 'highshelf':
        s = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cw + s), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - s)]
        a = [(A + 1) - (A - 1) * cw + s, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - s]
    else:
        raise ValueError(kind)
    b, a = np.array(b) / a[0], np.array(a) / a[0]
    return np.concatenate([b, a])[None, :]


def eq(x, kind, f, gain_db, q=0.707):
    return sps.sosfilt(_rbj(kind, float(f), float(gain_db), float(q)), x, axis=-1)


def svf(x, fc, q=0.707, mode='lp'):
    """Zavalishin/Simper TPT state-variable filter with per-sample cutoff.

    Used for every filter *sweep* (whooshes, risers, filter envelopes): unlike
    a biquad with swapped coefficients it stays click-free under fast modulation.
    'bp' is normalised to unity gain at the centre frequency.
    """
    x = np.asarray(x, float)
    if x.ndim == 2:
        return np.stack([svf(ch, fc, q, mode) for ch in x])
    n = x.size
    fc = np.clip(np.broadcast_to(np.asarray(fc, float), (n,)), 5.0, SR * 0.42)
    k = 1.0 / float(q)
    g = np.tan(np.pi * fc / SR)
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    xs, A1, A2, A3 = x.tolist(), a1.tolist(), a2.tolist(), a3.tolist()
    lp = [0.0] * n
    bp = [0.0] * n
    ic1 = ic2 = 0.0
    for i in range(n):
        v3 = xs[i] - ic2
        v1 = A1[i] * ic1 + A2[i] * v3
        v2 = ic2 + A2[i] * ic1 + A3[i] * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2
        lp[i] = v2
        bp[i] = v1
    lp, bp = np.asarray(lp), np.asarray(bp)
    if mode == 'lp':
        return lp
    if mode == 'bp':
        return k * bp
    if mode == 'hp':
        return x - k * bp - lp
    raise ValueError(mode)


# ── saturation & lo-fi ──────────────────────────────────────────────────────
def saturate(x, drive=1.5, oversample=2):
    """tanh soft clip, oversampled so the added harmonics do not alias."""
    if oversample > 1:
        up = sps.resample_poly(x, oversample, 1, axis=-1)
        up = np.tanh(drive * up) / np.tanh(drive)
        return sps.resample_poly(up, 1, oversample, axis=-1)[..., :x.shape[-1]]
    return np.tanh(drive * x) / np.tanh(drive)


def bitcrush(x, bits=6, hold=3):
    """Deliberate digital damage for the glitch cues; low-passed afterwards."""
    q = 2.0 ** (bits - 1)
    y = np.round(x * q) / q
    if hold > 1:
        n = y.shape[-1]
        y = np.repeat(y[..., ::hold], hold, axis=-1)[..., :n]
    return lpf(y, 9000, 4)


# ── stereo ──────────────────────────────────────────────────────────────────
def pan_mono(x, p=0.0):
    """Constant-power pan, 0 dB per side at centre. p may be an array (auto-pan)."""
    a = (np.clip(p, -1.0, 1.0) + 1.0) * np.pi / 4.0
    return np.stack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2.0)


def balance(st, p=0.0):
    if np.ndim(p) == 0 and p == 0.0:
        return st
    a = (np.clip(p, -1.0, 1.0) + 1.0) * np.pi / 4.0
    return np.stack([st[0] * np.cos(a), st[1] * np.sin(a)]) * np.sqrt(2.0)


def ms_width(st, w):
    """Mid/side widener: w=0 mono, 1 unchanged, >1 wider."""
    m, s = 0.5 * (st[0] + st[1]), 0.5 * (st[0] - st[1]) * w
    return np.stack([m + s, m - s])


def chorus(st, key, rate=0.23, depth=0.0022, base=0.011, mix=0.4):
    """Two modulated fractional delays (one per side) for width and shimmer."""
    n = st.shape[1]
    t, idx = tvec(n), np.arange(n, dtype=float)
    r = rng('chorus', key)
    out = np.empty_like(st)
    for c in range(2):
        d = (base + depth * np.sin(TAU * rate * (1.0 + 0.19 * c) * t + r.uniform(0, TAU))) * SR
        wet = np.interp(idx - d, idx, st[c], left=0.0)
        out[c] = st[c] * (1.0 - mix) + wet * mix
    return out


def echoes(sig, delay, reps, fb_db, pans, lp=3200.0):
    """Explicit feedback-delay taps → list of (offset seconds, stereo signal).
    Each repeat is a little darker, like a tape/ping-pong delay."""
    mono = sig if sig.ndim == 1 else sig.mean(0)
    out = []
    for k in range(1, reps + 1):
        mono = lpf(mono, lp, 1)
        out.append((delay * k, pan_mono(mono * db2lin(fb_db * k), pans[(k - 1) % len(pans)])))
    return out


# ── convolution reverb ──────────────────────────────────────────────────────
def make_ir(rt60, length, predelay=0.015, key='hall', lo_x=1.2, hi_x=0.45, damp=7000.0,
            diffusion=0.010, early=12):
    """Generated stereo impulse response.

    Decorrelated Gaussian noise per side, split into three bands with their own
    RT60 (lows ring a bit longer, highs die faster = air absorption), a soft
    diffusion build-up, a handful of early reflections, pre-delay and a tail
    fade. Normalised to unit energy per channel so send levels are predictable.
    """
    n = smp(length)
    t = tvec(n)
    r = rng('ir', key)
    chans = []
    for _ in range(2):
        nz = r.standard_normal(n)
        lo, hi = lpf(nz, 350.0), hpf(nz, 4000.0)
        mid = nz - lo - hi

        def dec(rt):
            return 10.0 ** (-3.0 * t / rt)
        ir = lo * dec(rt60 * lo_x) + mid * dec(rt60) + hi * dec(rt60 * hi_x)
        ir *= 1.0 - np.exp(-t / diffusion)
        for _k in range(early):
            d = r.uniform(0.004, 0.065)
            ir[smp(d)] += r.choice([-1.0, 1.0]) * r.uniform(2.0, 6.0) * np.exp(-d / 0.05)
        ir = lpf(ir, damp)
        ir = np.concatenate([np.zeros(smp(predelay)), ir])
        chans.append(fade(ir, 0.0005, min(0.35, length * 0.25)))
    ir = np.stack(chans)
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def reverb(x, ir):
    """Stereo convolution with a little cross-feed so panned sources bloom in both sides."""
    n = x.shape[1]
    ins = (0.75 * x[0] + 0.25 * x[1], 0.25 * x[0] + 0.75 * x[1])
    return np.stack([sps.oaconvolve(ins[c], ir[c])[:n] for c in range(2)])


# ── dynamics ────────────────────────────────────────────────────────────────
def _smooth_gr(target, attack, release, step):
    """One-pole attack/release smoothing of a gain-reduction curve (dB, ≥0)."""
    aa = np.exp(-step / (attack * SR))
    ar = np.exp(-step / (release * SR))
    out, s = [], 0.0
    for v in target.tolist():
        c = aa if v > s else ar
        s = c * s + (1.0 - c) * v
        out.append(s)
    return np.asarray(out)


def compressor(x, thresh_db, ratio=2.0, attack=0.012, release=0.16, knee_db=6.0,
               sc_hpf=None, block=64):
    """Feed-forward RMS compressor, stereo-linked, soft knee. Returns (y, gain)."""
    src = hpf(x, sc_hpf) if sc_hpf else x
    p = np.mean(src ** 2, axis=0) if src.ndim == 2 else src ** 2
    n = p.size
    nb = int(np.ceil(n / block))
    buf = np.zeros(nb * block)
    buf[:n] = p
    lvl = 10.0 * np.log10(buf.reshape(nb, block).mean(1) * 2.0 + 1e-14)   # ×2: sine RMS → peak
    over = lvl - thresh_db
    slope = 1.0 - 1.0 / ratio
    gr = np.where(over <= -knee_db / 2, 0.0,
                  np.where(over >= knee_db / 2, slope * over,
                           slope * (over + knee_db / 2) ** 2 / (2 * knee_db)))
    grs = _smooth_gr(gr, attack, release, block)
    g = db2lin(-np.interp(np.arange(n), (np.arange(nb) + 0.5) * block, grs))
    return x * g, g


def true_peak_env(x, os_=4):
    """Per-sample inter-sample peak estimate (4× polyphase oversampling, BS.1770-style)."""
    up = sps.resample_poly(x, os_, 1, axis=-1)
    a = np.max(np.abs(up), axis=0) if up.ndim == 2 else np.abs(up)
    n = x.shape[-1]
    return a[: n * os_].reshape(n, os_).max(axis=1)


def true_peak_db(x):
    return float(lin2db(true_peak_env(x).max()))


def _release(g, coef):
    out, s = [], 1.0
    for v in g.tolist():
        s = v if v < s else v + (s - v) * coef
        out.append(s)
    return np.asarray(out)


def limiter(x, ceiling_db=LIMIT_DBTP, lookahead=0.0012, release=0.15):
    """Look-ahead true-peak limiter.

    Required gain from the oversampled peak envelope → sliding minimum over
    ±lookahead → program-dependent release → centred moving average of the
    same width. The average never exceeds the requirement at a peak, so the
    ceiling holds while the gain moves smoothly (no clicks, no pumping).
    """
    ceil = db2lin(ceiling_db)
    for _ in range(4):
        need = np.minimum(1.0, ceil / np.maximum(true_peak_env(x), 1e-9))
        L = max(1, smp(lookahead))
        g = minimum_filter1d(need, size=2 * L + 1, mode='nearest')
        g = _release(g, np.exp(-1.0 / (release * SR)))
        g = uniform_filter1d(g, size=2 * L + 1, mode='nearest')
        y = x * g
        over = true_peak_db(y) - ceiling_db
        if over <= 0.0:
            return y, g
        ceil *= db2lin(-(over + 0.02))
    return y, g


def duck_env(times, depth_db, release, n=N, pre=0.002, attack=0.003):
    """Sidechain-style gain curve: dips `depth_db` at each time, S-curve recovery."""
    red = np.zeros(n)
    a = pre + attack
    for tk in times:
        i0 = smp(tk - pre)
        L = smp(a + release)
        tt = tvec(L)
        r = np.where(tt < a, smoothstep(tt / a), 1.0 - smoothstep((tt - a) / release)) * depth_db
        j0, j1 = max(0, i0), min(n, i0 + L)
        if j1 > j0:
            red[j0:j1] = np.maximum(red[j0:j1], r[j0 - i0:j1 - i0])
    return db2lin(-red)


# ── loudness (ITU-R BS.1770-4 / EBU R128) ───────────────────────────────────
_K1 = (np.array([1.53512485958697, -2.69169618940638, 1.19839281085285]),
       np.array([1.0, -1.69065929318241, 0.73248077421585]))
_K2 = (np.array([1.0, -2.0, 1.0]), np.array([1.0, -1.99004745483398, 0.99007225036621]))


def k_weight(x):
    return sps.lfilter(*_K2, sps.lfilter(*_K1, x, axis=-1), axis=-1)


def _block_power(x, win, hop):
    y = k_weight(x)
    p = y ** 2 if y.ndim == 1 else y ** 2
    cs = np.concatenate([np.zeros(p.shape[:-1] + (1,)), np.cumsum(p, axis=-1)], axis=-1)
    w, h = smp(win), smp(hop)
    starts = np.arange(0, p.shape[-1] - w + 1, h)
    z = (cs[..., starts + w] - cs[..., starts]) / w
    return starts, (z.sum(0) if z.ndim == 2 else z)


def lufs(x):
    """Integrated loudness with absolute (−70) and relative (−10 LU) gating."""
    _, z = _block_power(x, 0.4, 0.1)
    l = -0.691 + 10 * np.log10(z + 1e-20)
    m = l > -70.0
    if not m.any():
        return -np.inf
    rel = -0.691 + 10 * np.log10(z[m].mean()) - 10.0
    m &= l > rel
    return float(-0.691 + 10 * np.log10(z[m].mean()))


def loudness_curve(x, win=0.4, hop=0.05):
    """Momentary (0.4 s) or short-term (3 s) loudness, block-centred times."""
    starts, z = _block_power(x, win, hop)
    return (starts + smp(win) / 2) / SR, -0.691 + 10 * np.log10(z + 1e-20)


# ════════════════════════════════════════════════════════════════════════════
# 3. Instruments (all return float arrays, mono (n,) or stereo (2, n))
# ════════════════════════════════════════════════════════════════════════════
KICK_STYLES = {
    #        top Hz, body Hz, tail Hz, pitch τ, body τ, amp τ, length, click, drive
    'main': (235.0, 66.0, 52.0, 0.017, 0.08, 0.125, 0.32, 0.26, 1.8),
    'drop': (270.0, 68.0, 48.0, 0.021, 0.11, 0.20, 0.50, 0.30, 2.1),
}


def kick(style='main'):
    """Sine kick: three-stage exponential pitch drop (click → punch → tail),
    oversampled tanh for weight on small speakers, a 1 ms band-passed noise
    tick for definition, and a 28 Hz high-pass to keep the sub controlled."""
    f_top, f_body, f_end, p_tau, b_tau, a_tau, dur, click_amt, drive = KICK_STYLES[style]
    n = smp(dur)
    t = tvec(n)
    f = f_end + (f_body - f_end) * np.exp(-t / b_tau) + (f_top - f_body) * np.exp(-t / p_tau)
    body = osc_sine(f, n) * np.exp(-t / a_tau)
    body = saturate(body, drive)
    click = bpf(rng('kick', style).standard_normal(n), 1800, 7000) * burst_env(t, 0.0, 0.001, 0.0026)
    x = hpf(body + click_amt * click, 28.0)
    x = fade(x, 0.001, 0.035)
    return x / np.max(np.abs(x))


def clap(key=0):
    """Four staggered band-passed noise bursts (the hand-clap 'flam'),
    the last with a short tail; decorrelated sides for a little width."""
    n = smp(0.42)
    t = tvec(n)
    r = rng('clap', key)
    env = np.zeros(n)
    for i, (o, g) in enumerate(zip((0.0, 0.0095, 0.0185, 0.027), (0.85, 0.75, 0.7, 1.0))):
        env += g * burst_env(t, o, 0.001, 0.0045 if i < 3 else 0.07)
    common = r.standard_normal(n)
    out = []
    for _ in range(2):
        nz = 0.75 * common + 0.66 * r.standard_normal(n)
        x = bpf(nz, 900, 5000) * env
        x = eq(x, 'peak', 1250, 3.0, 1.6)
        out.append(x)
    x = fade(np.stack(out), 0.001, 0.03)
    return x / np.max(np.abs(x))


_HAT_F = np.array([205.3, 304.4, 369.6, 522.7, 540.0, 800.0]) * 1.62


def hat(open_=False, key=0):
    """808-style metal: six band-limited squares at inharmonic ratios plus a
    little noise, band-passed 5.2–10.5 kHz with a soft dip at 9 kHz so it is
    crisp without fizz."""
    dur = 0.30 if open_ else 0.075
    n = smp(dur)
    r = rng('hat', open_, key)
    metal = sum(osc_square(f, n, r.random()) for f in _HAT_F) / 6.0
    src = 0.7 * metal + 0.3 * 0.6 * r.standard_normal(n)
    x = lpf(hpf(src, 5200.0, 4), 10500.0)
    x = eq(x, 'peak', 9000, -3.5, 0.8)
    x = x * perc_env(n, 0.0012, 0.085 if open_ else 0.016, 0.004)
    return x / np.max(np.abs(x))


def snare(pitch=1.0, key=0):
    """Two tuned membrane modes with a pitch blip, band-passed noise wires, a snap."""
    n = smp(0.32)
    t = tvec(n)
    r = rng('snare', key)
    f1 = 188.0 * pitch * (1.0 + 0.5 * np.exp(-t / 0.007))
    body = osc_sine(f1, n) * np.exp(-t / 0.055) + 0.45 * osc_sine(f1 * 1.72, n) * np.exp(-t / 0.03)
    nz = r.standard_normal(n)
    wires = bpf(nz, 1500.0 * pitch ** 0.5, 8500.0) * np.exp(-t / 0.075)
    snap = hpf(nz, 3500.0) * np.exp(-t / 0.012)
    x = fade(0.7 * body + 0.8 * wires + 0.25 * snap, 0.001, 0.03)
    return x / np.max(np.abs(x))


def bass_note(freq, length=0.2, bright=1.0, key=0):
    """Off-beat pumping bass: clean sub sine + two detuned PolyBLEP saws through
    a resonant TPT low-pass with a snappy envelope, gently saturated."""
    n = smp(length + 0.03)
    t = tvec(n)
    r = rng('bass', key)
    sub = osc_sine(freq, n)
    harm = 0.5 * (osc_saw(freq * 2 ** (-5 / 1200), n, r.random()) + osc_saw(freq * 2 ** (5 / 1200), n, r.random()))
    harm = svf(harm, 170.0 + 1250.0 * bright * np.exp(-t / 0.05) + 110.0 * np.exp(-t / 0.3), 0.9, 'lp')
    x = saturate(0.8 * sub + 0.85 * harm, 1.3)
    env = (0.82 + 0.18 * np.exp(-t / 0.06))
    x = fade(x * env, 0.003, 0.001)
    i1, rl = smp(length), smp(0.025)
    x[i1 - rl:i1] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(rl) + 1) / rl)
    x[i1:] = 0.0
    return lpf(x, 3000.0)


def pad(midis, dur, key, cutoff=2200.0, q=0.7, detune=9.0, voices=3, hp=160.0,
        attack=0.05, release=0.08, spread=0.8, drift=0.0012):
    """Warm detuned pad: per note, `voices` PolyBLEP saws detuned ±`detune`
    cents with slow independent pitch drift, spread across the stereo field,
    24 dB/oct low-pass (or a TPT sweep when `cutoff` is callable), high-passed
    so it never muddies the kick and bass, then a light chorus."""
    n = smp(dur)
    t = tvec(n)
    r = rng('pad', key)
    out = np.zeros((2, n))
    count = 0
    for j, m in enumerate(midis):
        f = float(mtof(m))
        for v in range(voices):
            u = 0.0 if voices == 1 else v / (voices - 1) * 2.0 - 1.0
            lfo = 1.0 + drift * np.sin(TAU * r.uniform(0.07, 0.2) * t + r.uniform(0, TAU))
            s = osc_saw(f * 2 ** (u * detune / 1200) * lfo, n, r.random())
            out += pan_mono(s, float(np.clip(u * spread + 0.15 * (-1) ** j, -1, 1)))
            count += 1
    out /= np.sqrt(count)
    if callable(cutoff):
        out = svf(out, cutoff(t), q, 'lp')
    else:
        out = lpf(out, cutoff, 4)
    out = hpf(out, hp)
    out = chorus(out, ('pad', key), mix=0.35)
    return fade(out, attack, release)


def pluck(freq, dur=0.9, bright=1.0, key=0, decay=None, mallet=0.05):
    """FM/marimba hybrid: 1:1 FM with a fast index envelope (the 'pluck'),
    marimba partials at 3.93× and 9.8× that die quickly, a mallet click."""
    n = smp(dur)
    t = tvec(n)
    tau = decay or 0.42 * (440.0 / freq) ** 0.35
    idx = bright * 1.6 * np.exp(-t / 0.03) * (440.0 / freq) ** 0.25
    x = np.sin(TAU * freq * t + idx * np.sin(TAU * freq * t)) * np.exp(-t / tau)
    if 3.93 * freq < 6000:
        x += 0.30 * bright * np.sin(TAU * 3.93 * freq * t) * np.exp(-t / min(tau, 0.06))
    if 9.8 * freq < 6000:
        x += 0.07 * bright * np.sin(TAU * 9.8 * freq * t) * np.exp(-t / 0.015)
    x += mallet * lpf(rng('pluck', key).standard_normal(n), 3000.0) * burst_env(t, 0, 0.001, 0.002)
    return fade(hpf(x, 140.0), 0.0012, 0.03)


def bell(freq, dur=1.5, ratio=3.5, index=1.8, decay=0.6):
    """FM bell/glass. The modulation index is capped so sidebands stay < 15 kHz."""
    n = smp(dur)
    t = tvec(n)
    i_max = max(0.0, (15000.0 - freq) / (freq * ratio) - 1.0)
    idx = min(index, i_max) * np.exp(-t / (decay * 0.35))
    x = np.sin(TAU * freq * t + idx * np.sin(TAU * freq * ratio * t)) * np.exp(-t / decay)
    return fade(lpf(x, 12000.0), 0.0015, 0.02)


def stab(midis, dur=0.35, key=0, c0=4500.0, c1=420.0, tau=0.06, q=1.0, detune=11.0, decay=0.16):
    """Saw chord stab: detuned pairs, resonant TPT low-pass envelope, fast decay."""
    n = smp(dur)
    t = tvec(n)
    r = rng('stab', key)
    out = np.zeros((2, n))
    for m in midis:
        f = float(mtof(m))
        for s, p in ((-1, -0.45), (1, 0.45)):
            out += pan_mono(osc_saw(f * 2 ** (s * detune / 1200), n, r.random()), p)
    out /= np.sqrt(2 * len(midis))
    out = svf(out, c1 + (c0 - c1) * np.exp(-t / tau), q, 'lp')
    out = hpf(out * perc_env(n, 0.0015, decay, 0.02), 140.0)
    return out


def thud(f0=150.0, f1=58.0, dur=0.3, tau=0.07):
    """Pitched low thump that sits under a word slam."""
    n = smp(dur)
    t = tvec(n)
    x = osc_sine(f1 + (f0 - f1) * np.exp(-t / 0.02), n) * np.exp(-t / tau)
    return fade(saturate(x, 1.5), 0.001, 0.03)


def boom(f_start, f_end, dur, pitch_tau=0.05, decay=0.3, drive=1.5, top=None):
    """Sub boom: sine with exponential pitch fall, saturated for audibility, low-passed."""
    n = smp(dur)
    t = tvec(n)
    f = f_end + (f_start - f_end) * np.exp(-t / pitch_tau)
    if top:
        f = f + (top - f_start) * np.exp(-t / 0.006)
    x = saturate(osc_sine(f, n) * np.exp(-t / decay), drive)
    return fade(lpf(x, 700.0), 0.0012, min(0.12, dur * 0.3))


def crash(dur=2.0, key=0, hp=350.0, c0=14000.0, c1=2500.0, ctau=0.8, decay=0.5,
          long_decay=1.5, long_amt=0.25, attack=0.0015):
    """Noise crash/burst: decorrelated stereo noise, a low-pass that darkens
    over time (so the tail stays smooth, never hissy), two-stage decay."""
    n = smp(dur)
    t = tvec(n)
    r = rng('crash', key)
    common = r.standard_normal(n)
    st = np.stack([0.55 * common + 0.83 * r.standard_normal(n) for _ in range(2)])
    st = svf(hpf(st, hp), c1 + (c0 - c1) * np.exp(-t / ctau), 0.6, 'lp')
    env = np.exp(-t / decay) + long_amt * np.exp(-t / long_decay)
    return fade(st * env, attack, min(0.25, dur * 0.25))


def whoosh(dur, f_lo=500.0, f_hi=3500.0, pan0=-0.8, pan1=0.8, peak=0.6, q=1.5,
           shape=1.6, key=0, width=0.25):
    """Air whoosh: pink noise through a TPT band-pass whose centre rises to a
    peak and falls, a matching amplitude bell and a pan sweep."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('whoosh', key)
    prog = smoothstep(np.where(u < peak, u / peak, (1.0 - u) / (1.0 - peak)))
    fc = f_lo * (f_hi / f_lo) ** prog
    amp = prog ** shape
    x = svf(pink(n, r), fc, q, 'bp') * amp
    st = pan_mono(x, pan0 + (pan1 - pan0) * smoothstep(u))
    side = svf(pink(n, r), fc * 1.3, q, 'bp') * amp * width
    st = st + np.stack([side, -side])
    return fade(st, 0.004, 0.01)


def riser(dur, key=0, f0=300.0, f1=8000.0, note0=45, note1=69, curve=2.0, tonal=0.5, end_fade=0.005):
    """Noise + supersaw riser: band-passed pink noise sweeping up, a five-voice
    PolyBLEP supersaw gliding up with its own opening low-pass, loudness ramping."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('riser', key)
    noise = svf(pink(n, r), f0 * (f1 / f0) ** u, 0.9, 'bp')
    st = pan_mono(noise, 0.0)
    side = svf(pink(n, r), f0 * 1.2 * (f1 / f0) ** u, 0.9, 'bp') * 0.35
    st = st + np.stack([side, -side])
    pitch = mtof(note0 + (note1 - note0) * u ** 1.6)
    ss = np.zeros((2, n))
    for v, d in enumerate((-17.0, -7.0, 0.0, 6.0, 16.0)):
        ss += pan_mono(osc_saw(pitch * 2 ** (d / 1200), n, r.random()), (v - 2) * 0.35)
    ss = svf(ss / np.sqrt(5.0), np.minimum(pitch * 3.0 + 600.0 * u, 7000.0), 0.8, 'lp')
    out = (st + tonal * ss) * (u ** curve)
    return fade(hpf(out, 180.0), 0.01, end_fade)


def reverse_swell(dur, key=0, chord=None, rt=1.6, noise_amt=1.0, chord_amt=0.8):
    """Reverse reverb 'suck': render a hit's reverb wash forward, then reverse it
    so it swells up into the downbeat."""
    L = dur + 0.1
    n = smp(L)
    t = tvec(n)
    r = rng('rev', key)
    src = pan_mono(hpf(r.standard_normal(n), 700.0) * burst_env(t, 0, 0.001, 0.12), 0.0) * noise_amt
    if chord:
        for m in chord:
            src += pan_mono(pluck(float(mtof(m)), L, 0.9, key=('rev', m)), r.uniform(-0.6, 0.6)) * chord_amt / len(chord)
    wet = reverb(src, make_ir(rt, rt * 1.1, 0.0, key=('rev', key), diffusion=0.003, early=0))
    wet = wet[:, :smp(dur)][:, ::-1]
    wet = fade(wet, 0.02, 0.004)
    return wet / np.max(np.abs(wet))


def tick(freq=2600.0, tau=0.005, noise=0.3, key=0, dur=0.05):
    """UI tick: a tiny decaying sine plus a breath of band-passed noise."""
    n = smp(dur)
    t = tvec(n)
    nz = bpf(rng('tick', key).standard_normal(n), 2500, 8000)
    x = osc_sine(freq, n) * np.exp(-t / tau) + noise * nz * np.exp(-t / (tau * 0.5))
    return fade(x, 0.001, 0.01)


def key_click(key=0):
    """Very small key click for the typed label."""
    n = smp(0.03)
    t = tvec(n)
    nz = bpf(rng('key', key).standard_normal(n), 1800, 6500)
    x = nz * np.exp(-t / 0.0015) + 0.5 * osc_sine(3900.0, n) * np.exp(-t / 0.003) \
        + 0.3 * osc_sine(950.0, n) * np.exp(-t / 0.004)
    return fade(x, 0.001, 0.008)


def tock(key=0):
    """Wood-block 'tock' with a low thump: the dot's squash landing."""
    n = smp(0.2)
    t = tvec(n)
    x = 0.8 * osc_sine(820.0, n) * np.exp(-t / 0.035) \
        + 0.35 * osc_sine(1830.0, n) * np.exp(-t / 0.012) \
        + 0.6 * osc_sine(170.0 * (1 + 0.6 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.04)
    x += 0.15 * bpf(rng('tock', key).standard_normal(n), 1500, 6000) * np.exp(-t / 0.003)
    return fade(x, 0.001, 0.02)


def blip(f_end=880.0, f_start=560.0, overshoot=0.10, dur=0.18):
    """Soft pop with a pitch overshoot (the dot popping in with outBack)."""
    n = smp(dur)
    t = tvec(n)
    f = f_end * (1.0 - (1.0 - f_start / f_end) * np.exp(-t / 0.006)
                 + overshoot * (np.exp(-t / 0.03) - np.exp(-t / 0.006)))
    x = (osc_sine(f, n) + 0.12 * osc_sine(2 * f, n)) * np.exp(-t / 0.06)
    x += 0.35 * osc_sine(220.0, n) * np.exp(-t / 0.012)
    return fade(x, 0.0015, 0.02)


def glide(dur, f0, f1, ease=EASE_REEL, tail=0.3, attack=0.03, land=0.5, land_from=0.8):
    """Sine glide whose log-pitch follows the easing curve exactly; the level
    eases down by `land` from `land_from` (fraction of dur) as the dot comes to rest."""
    n = smp(dur + tail)
    t = tvec(n)
    f = np.exp(np.log(f0) + (np.log(f1) - np.log(f0)) * ease(t / dur))
    x = osc_sine(f, n) + 0.14 * osc_sine(2 * f, n) + 0.04 * osc_sine(3 * f, n)
    env = np.where(t < dur, 1.0, np.exp(-(t - dur) / (tail * 0.3)))
    env = env * (1.0 - land * smoothstep((t / dur - land_from) / (1.0 - land_from)))
    return fade(x * env, attack, 0.04)


def glitch(dur, key=0, bits=6, hold=3, pitches=(69, 72, 76, 79, 81, 84, 88, 91)):
    """Digital glitch: 1/64–1/16-note slices of square blips, crushed noise,
    chirps and gaps, randomly panned, then bit-crushed and sample-held."""
    n = smp(dur)
    out = np.zeros((2, n))
    r = rng('glitch', key)
    pos = 0
    while pos < n:
        L = min(smp(float(r.choice([S16 / 8, S16 / 8, S16 / 4, S16 / 2]))), n - pos)
        kind = r.choice(4, p=[0.42, 0.22, 0.2, 0.16])
        if kind == 0:
            s = 0.5 * osc_square(float(mtof(r.choice(pitches))), L)
        elif kind == 1:
            s = 0.6 * bpf(r.standard_normal(L), 800, 6000)
        elif kind == 2:
            s = osc_sine(np.geomspace(r.uniform(1500, 3500), r.uniform(150, 400), L), L)
        else:
            s = np.zeros(L)
        out[:, pos:pos + L] += pan_mono(fade(s, 0.0015, 0.0015), r.uniform(-0.7, 0.7))
        pos += L
    out = hpf(bitcrush(out, bits, hold), 150.0)
    return fade(out, 0.002, 0.004)


def slice_swish(dur=0.2, strips=12, key=0):
    """The 12-strip exit: band-passed air accelerating (inExpo) while it
    ping-pongs left/right once per strip."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('swish', key)
    x = svf(pink(n, r), 700.0 * (7000.0 / 700.0) ** (u ** 2), 1.2, 'bp')
    amp = exp_curve(u, 5.0) * 0.9 + 0.1 * u
    p = 0.75 * np.tanh(3.0 * np.sin(np.pi * strips * u ** 1.4))
    return fade(pan_mono(x * amp, p), 0.004, 0.003)


def bloop(f0=260.0, dur=0.12):
    """Liquid bubble: a sine whose pitch rises fast as it decays."""
    n = smp(dur)
    t = tvec(n)
    f = f0 * (1.0 + 5.0 * t / dur) ** 1.2
    x = osc_sine(f, n) * np.exp(-t / (dur * 0.35))
    return fade(x, 0.0015, 0.01)


def moire(dur=0.24):
    """Op-art moiré: pairs of close sines beating against each other,
    with different beat rates per side, so the interference pattern swims."""
    n = smp(dur)
    t = tvec(n)
    out = np.zeros((2, n))
    for f, b in ((1760.0, 7.0), (2637.0, 11.0), (3520.0, 17.0)):
        for c, sgn in ((0, 1.0), (1, -1.0)):
            out[c] += osc_sine(f, n) + osc_sine(f + sgn * b + (c * 2.0), n)
    env = perc_env(n, 0.012, dur * 0.45, 0.03)
    return lpf(out * env / 6.0, 9000.0)


def clack(key=0, bright=1.0):
    """Split-flap clack: short band-passed noise plus a woody resonance."""
    n = smp(0.05)
    t = tvec(n)
    nz = bpf(rng('clack', key).standard_normal(n), 1800, 5200)
    x = nz * np.exp(-t / 0.004) * bright + 0.6 * osc_sine(1150.0, n) * np.exp(-t / 0.009)
    return fade(x, 0.001, 0.01)


def wire_tone(dur=0.25, f=1318.5):
    """Wireframe tone: clean sine + fifth with a slow upward bend and a
    rotating auto-pan (the torus spinning)."""
    n = smp(dur)
    t = tvec(n)
    bend = 2 ** ((smoothstep(t / dur) * 1.0) / 12)
    x = osc_sine(f * bend, n) + 0.35 * osc_sine(1.5 * f * bend, n) + 0.12 * osc_sine(0.5 * f * bend, n)
    x *= perc_env(n, 0.006, dur * 0.6, 0.03)
    return pan_mono(x, 0.6 * np.sin(TAU * 7.0 * t))


def sq_blip(freq, dur=0.07):
    """Band-limited square blip, low-passed: friendly UI 'bip'."""
    n = smp(dur)
    x = lpf(osc_square(freq, n), 3500.0) * perc_env(n, 0.0015, 0.03, 0.01)
    return x


def crt_zip(key=0):
    """CRT power-down, 0.20 s: a saw/sine 'zip' falling 2 kHz → 50 Hz in three
    stages (vertical collapse, horizontal collapse, glowing dot), a degauss
    thump, mains hum at the end, and static crackle from band-limited grains."""
    dur = 0.20
    n = smp(dur)
    t = tvec(n)
    r = rng('crt', key)
    f = np.exp(np.interp(t, [0.0, 0.07, 0.14, 0.20], np.log([2000.0, 420.0, 90.0, 50.0])))
    tone = 0.6 * osc_saw(f, n) + 0.4 * osc_sine(f, n)
    tone = svf(tone, np.minimum(f * 5.0, 11000.0), 0.8, 'lp')
    amp = np.interp(t, [0.0, 0.004, 0.07, 0.14, 0.188, 0.20], [0.0, 1.0, 0.85, 0.6, 0.0, 0.0])
    amp = uniform_filter1d(amp, smp(0.003))
    hum = (osc_sine(50.0, n) + 0.4 * osc_sine(100.0, n)) * np.interp(t, [0.11, 0.15, 0.19], [0.0, 0.45, 0.0])
    thump = osc_sine(90.0 * (1 + np.exp(-t / 0.01)), n) * burst_env(t, 0.0, 0.0015, 0.02)
    # crackle: Poisson-distributed impulses → 1 ms Hann-windowed noise grains
    rate = 900.0 * (1.0 - t / dur) ** 1.5
    imp = (r.random((2, n)) < rate / SR) * r.uniform(0.2, 1.0, (2, n))
    grain = np.hanning(48) * lpf(r.standard_normal(48), 6000.0)
    crack = np.stack([np.convolve(imp[c], grain, mode='same') for c in range(2)])
    crack = lpf(hpf(crack, 1500.0), 8000.0) * np.interp(t, [0.0, 0.02, 0.19, 0.20], [0.3, 1.0, 0.2, 0.0])
    out = pan_mono(tone * amp + 0.5 * hum + 0.7 * thump, 0.0) + 0.35 * crack
    return fade(out, 0.002, 0.008)


# ════════════════════════════════════════════════════════════════════════════
# 4. Cue list & arrangement
# ════════════════════════════════════════════════════════════════════════════
KICKS = [2.0 + i * BEAT for i in range(20)]                  # 2.00 … 11.50 (four on the floor)
CLAPS = [2.5 + i * BEAT * 2 for i in range(8)]               # beats 2 & 4: 2.5, 3.5 … 9.5
BOOMS = [8.0, 8.5, 9.0, 9.5]                                 # 3D ripple pulses
WORD_SLAMS = [2.00, 2.50, 3.00]                              # TIMING / is / EVERYTHING
ECHO_HITS = [3.50 + i * 0.05 for i in range(7)]              # 3.50–3.80 outline copies
TILE_PLUCKS = [4.00 + i * S16 / 4 for i in range(15)]       # 15 × 1/64 note (31.25 ms stagger)
CUTS = [10.00, 10.25, 10.50, 10.75, 11.00, 11.25, 11.50, 11.75]
SNARE_ROLL = [10.0, 10.25, 10.5, 10.75,                      # 8ths
              11.0, 11.125, 11.25, 11.375,                   # 16ths
              11.5, 11.5625, 11.625, 11.6875]                # 32nds
SILENCE = (11.95, 12.00)
FINAL = 12.00
LETTER_TICKS = [12.05 + i * 0.06 for i in range(6)]          # C L A U D E land
ACCENTS = [(13.0, 'A4'), (13.5, 'C5'), (14.0, 'E5'), (14.5, 'A5')]
FADE_OUT = (14.55, 15.0)

CHORDS = [  # (start, end, name, pad voicing)
    (0.00, 2.00, 'Am9', 'A2 E3 G3 B3 E4 C5'),
    (2.00, 4.00, 'Am7', 'A3 C4 E4 G4'),
    (4.00, 6.00, 'Fmaj7', 'F3 A3 C4 E4'),
    (6.00, 8.00, 'Cadd9', 'G3 C4 D4 E4'),
    (8.00, 10.00, 'G6', 'G3 B3 D4 E4'),
    (10.00, 11.00, 'Fmaj7', 'F3 A3 C4 E4'),
    (11.00, 11.50, 'E7sus4', 'E3 A3 B3 D4'),
    (11.50, 11.75, 'E7', 'E3 G#3 B3 D4'),
    (12.00, 15.00, 'Am9', 'A2 E3 G3 B3 E4 C5'),
]
BASS_ROOT = {2.0: 'A1', 4.0: 'F1', 6.0: 'C2', 8.0: 'G1'}

CUE_SHEET = [  # (start, end, what): STORYBOARD §4 as implemented; printed on every run
    (0.00, 2.00, 'Intro: airy filtered Am9 pad swelling in (TPT low-pass 320 Hz → 2.6 kHz)'),
    (0.05, 0.60, '12 grid ticks, rising pitch, fanning out from centre'),
    (0.10, None, 'Blip with pitch overshoot (dot pops)'),
    (0.45, 1.00, '16 tiny key clicks (label types on)'),
    (0.75, 1.50, 'Sine glide E4→A5 following cubic-bezier(.83,0,.17,1), ghost echoes'),
    (1.50, None, 'Tock (squash landing)'),
    (1.30, 2.00, 'Reverse swell + inExpo whip into the drop'),
    (2.00, None, 'DROP 1: kick + sub impact + crash + TIMING stab'),
    (2.00, 10.00, 'Groove: 4otf kick, claps on 2&4, 16th hats + off-beat open hats, off-beat bass'),
    (2.50, None, '"is" glass/FM stab + soft thud'),
    (3.00, None, '"EVERYTHING" stab + weight-wave wah (3.0–3.5)'),
    (3.50, 3.85, 'Echo stutter: 7 stabs @ 50 ms, darker/wider each time'),
    (3.80, 4.00, 'Slice swish (12-strip L/R ping-pong, inExpo)'),
    (4.00, 4.44, '15 FM-marimba plucks, A-minor pentatonic, 1/64-note stagger'),
    (4.50, 5.50, 'Quiet marimba arpeggio (tile loops)'),
    (5.50, 6.00, 'Reverse suck into 6.00'),
    (6.00, None, 'Particle burst: noise burst + glass shimmer + sub drop'),
    (6.10, 7.40, 'Four panning whooshes'),
    (6.60, 7.45, 'Tonal swell peaking at 7.00 (FLOW forms)'),
    (7.40, 7.98, 'Gathering sweep'),
    (8.00, None, 'HIT: kick + boom + crash'),
    (8.50, 9.50, 'Deep boom on every beat'),
    (9.70, 10.00, 'Glitch stutter (buffer repeat of the 9.5 hit + crushed blips)'),
    (10.00, 11.75, 'Build: accelerating snare roll, noise/supersaw riser, kick until 11.5'),
    (10.00, 11.50, 'Cut SFX: bloop, moiré, flap clacks, wire tone, MOVE blips, zoom punch, datamosh'),
    (11.75, 11.95, 'CRT power-down zip 2 kHz→50 Hz + static'),
    (11.95, 12.00, 'TRUE SILENCE (digital zero)'),
    (12.00, None, 'FINAL DROP: sub boom 125→55→30 Hz, noise crash, big hall, Am9'),
    (12.05, 12.35, 'Six soft letter ticks'),
    (12.45, 13.10, 'Underline glide A4→A5 (same easing curve)'),
    (13.00, 14.50, 'Accent plucks A, C, E, A\' with ping-pong echoes'),
    (14.55, 15.00, 'Fade to silence'),
]


class Mix:
    """A set of stereo stems plus reverb sends for one part of the reel."""
    STEMS = ('kick', 'boom', 'clap', 'hats', 'perc', 'bass', 'pad', 'keys', 'fx', 'impact')

    def __init__(self, name, t_min=0.0, t_max=DUR):
        self.name, self.t_min, self.t_max = name, t_min, t_max
        self.stems = {k: np.zeros((2, N)) for k in self.STEMS}
        self.sends = {'room': np.zeros((2, N)), 'hall': np.zeros((2, N))}
        self.events = []

    def add(self, stem, sig, t, gain_db=0.0, pan=0.0, room=0.0, hall=0.0, label=None):
        assert self.t_min - 1e-9 <= t < self.t_max, (self.name, stem, t)
        sig = np.asarray(sig, float)
        st = (pan_mono(sig, pan) if sig.ndim == 1 else balance(sig, pan)) * db2lin(gain_db)
        i0 = smp(t)
        i1 = min(N, i0 + st.shape[1])
        if i1 <= i0:
            return
        seg = st[:, :i1 - i0]
        self.stems[stem][:, i0:i1] += seg
        if room:
            self.sends['room'][:, i0:i1] += seg * room
        if hall:
            self.sends['hall'][:, i0:i1] += seg * hall
        self.events.append((t, stem, label or stem))

    def times(self, *labels):
        return sorted({t for t, _s, lab in self.events if lab in labels})


def stutter(mix, stems, src_t, dst_t0, dst_t1, slices, gain_db=0.0):
    """Buffer-repeat stutter: silence `stems` from dst_t0 on and fill with
    repeated slices from src_t, each slice pitched up a little more, the last
    ones bit-crushed. Called before anything after dst_t1 is added."""
    i0, i1, s0 = smp(dst_t0), smp(dst_t1), smp(src_t)
    fo = smp(0.003)
    for name in stems:
        buf = mix.stems[name]
        src = buf[:, s0:s0 + smp(0.2)].copy()
        new = np.zeros((2, i1 - i0))
        pos = 0
        for k, L_t in enumerate(slices):
            L = smp(L_t)
            ratio = 1.0 + 0.045 * k
            idx = np.arange(L) * ratio
            seg = np.stack([np.interp(idx, np.arange(src.shape[1]), src[c]) for c in range(2)])
            if k >= 5:
                seg = bitcrush(seg, 7, 2)
            seg = fade(seg, 0.0015, 0.0025) * db2lin(gain_db)
            L = min(L, new.shape[1] - pos)
            new[:, pos:pos + L] += seg[:, :L]
            pos += L
        buf[:, i0 - fo:i0] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(fo) + 1) / fo)
        buf[:, i0:] = 0.0
        buf[:, i0:i1] += new


def arrange():
    A = Mix('A', 0.0, SILENCE[0])       # everything before the silence
    B = Mix('B', FINAL, DUR)            # the final drop and tail
    r = rng('arrange')

    # ── S1 · EASING & TIMING (0–2) ──────────────────────────────────────────
    t0, t1, _, v = CHORDS[0]
    A.add('pad', pad(notes(v), 2.06, 'intro', hp=95.0, q=0.9, attack=0.3, release=0.06,
                     cutoff=lambda t: 320.0 * (2600.0 / 320.0) ** (np.clip(t / 2.0, 0, 1) ** 1.3))
          * (np.clip(tvec(smp(2.06)) / 2.0, 0, 1) ** 1.4), 0.0, -9.0, hall=0.35, label='intro pad')
    n_air = smp(2.0)
    air = np.stack([bpf(pink(n_air, rng('air', c)), 2500, 6500) for c in range(2)])
    air *= (np.clip(tvec(n_air) / 2.0, 0, 1) ** 1.6) * (1 + 0.3 * np.sin(TAU * 0.9 * tvec(n_air)))
    A.add('fx', fade(air, 0.2, 0.01), 0.0, -36.0, label='air')
    for i in range(12):                                   # grid lines sweeping out
        A.add('fx', tick(1400.0 * 2 ** (i / 16), 0.004, 0.25, key=i), 0.05 + i * 0.05,
              -31.0 + i * 0.4, pan=(-1) ** i * (0.15 + 0.55 * i / 11), room=0.2, label='grid tick')
    A.add('keys', blip(880.0, 560.0), 0.10, -14.0, room=0.25, hall=0.15, label='blip')
    for i in range(16):                                   # label typing
        tk = 0.45 + i * 0.55 / 16 + (r.uniform(0, 0.006) if i else 0.0)
        A.add('fx', key_click(i), tk, -35.0 + r.uniform(-3, 1), pan=r.uniform(-0.2, 0.2), room=0.1,
              label='key click')
    g = glide(0.75, float(mtof(nm('E4'))), float(mtof(nm('A5'))), tail=0.35)
    A.add('keys', g, 0.75, -15.0, hall=0.3, label='glide')
    for off, e in echoes(g, 3 * S16 / 2, 2, -8.0, (-0.6, 0.6), lp=3000.0):   # onion-skin ghosts
        A.add('keys', e, 0.75 + off, -15.0, hall=0.2, label='glide echo')
    A.add('perc', tock(), 1.50, -7.0, room=0.3, label='tock')
    A.add('fx', reverse_swell(0.70, 'drop1', notes('A3 C4 E4 A4')), 1.30, -15.0, label='reverse swell')
    A.add('fx', whoosh(0.275, 400.0, 5200.0, -0.25, 0.25, peak=0.985, q=1.2, shape=3.0, key='whip'),
          1.72, -17.0, label='whip')

    # ── Groove 2–10 (+ build to 11.5) ───────────────────────────────────────
    closed = [hat(False, k) for k in range(8)]
    opened = [hat(True, k) for k in range(3)]
    hat_rng = rng('hats')

    def groove(t_from, t_to):
        """Kick, clap and hats in [t_from, t_to)."""
        for tk in KICKS:
            if t_from <= tk < t_to:
                A.add('kick', kick('drop' if tk in (2.0, 6.0, 8.0) else 'main'), tk, 0.0, label='kick')
        for i, tk in enumerate(CLAPS):
            if t_from <= tk < t_to:
                A.add('clap', clap(i), tk, -3.0, room=0.35, label='clap')
        for step in range(int(round((t_to - t_from) / S16))):
            tk = t_from + step * S16
            if tk >= 11.5 - 1e-9:
                break
            pos = int(round((tk - 2.0) / S16)) % 4
            build = tk >= 10.0
            jitter = hat_rng.uniform(-1.0, 1.0)
            if pos == 2 and not build and not (5.5 <= tk < 6.0):
                A.add('hats', opened[step % 3], tk, -13.5 + jitter, pan=-0.12, room=0.05, label='open hat')
            elif pos != 2 or build:
                gdb = {0: -17.0, 1: -21.5, 2: -20.0, 3: -19.0}[pos] + jitter
                if 5.5 <= tk < 6.0:
                    gdb -= 3.0
                if build:
                    gdb = -25.0 + 8.0 * (tk - 10.0) / 1.5 + (1.5 if pos == 0 else 0.0)
                A.add('hats', closed[step % 8], tk, gdb, pan=0.18, room=0.04, label='closed hat')

    groove(2.0, 10.0)
    for b0, root in BASS_ROOT.items():                    # off-beat pumping bass
        for k in range(4):
            m = nm(root) + (12 if k == 3 else 0)
            A.add('bass', bass_note(float(mtof(m)), 0.2, key=(b0, k)), b0 + 0.25 + k * 0.5,
                  -11.5 if b0 < 8.0 else -13.5, label='bass')
    for c0, c1, name, v in CHORDS[1:5]:
        A.add('pad', pad(notes(v), c1 - c0 + 0.05, (name, c0), cutoff=3200.0, hp=170.0,
                         attack=0.03, release=0.05), c0, -12.0, hall=0.18, label='pad')

    # ── S2 · KINETIC TYPE: word slams, echo, swish ──────────────────────────
    w_timing, w_is, w_every = WORD_SLAMS
    A.add('impact', boom(110.0, 55.0, 0.8, 0.05, 0.26, 1.6, top=160.0), w_timing, -7.0, label='drop sub')
    A.add('impact', crash(1.2, 'drop1', hp=500.0, decay=0.22, long_amt=0.12, long_decay=0.7), w_timing, -18.0,
          hall=0.25, label='drop crash')
    A.add('keys', stab(notes('A3 C4 E4 A4'), 0.4, 'timing', 5200.0, 500.0, 0.07, decay=0.18), w_timing, -9.0,
          room=0.15, hall=0.15, label='stab TIMING')
    A.add('perc', thud(160.0, 60.0), w_timing, -13.0, label='thud')
    is_chord = sum(bell(float(mtof(m)), 1.0, ratio=1.0, index=1.4, decay=0.35) * 0.6
                   + bell(float(mtof(m)), 1.0, ratio=3.5, index=0.7, decay=0.2) * 0.4
                   for m in notes('C5 E5 G5 A5'))
    A.add('keys', pan_mono(is_chord / 4, 0.0), w_is, -12.0, hall=0.3, label='stab is')
    A.add('perc', thud(130.0, 55.0, 0.25, 0.05), w_is, -17.0, label='thud')
    A.add('keys', stab(notes('E4 A4 C5 E5'), 0.4, 'every', 6000.0, 700.0, 0.09, decay=0.2), w_every, -9.0,
          room=0.15, hall=0.15, label='stab EVERYTHING')
    A.add('perc', thud(170.0, 62.0), w_every, -13.0, label='thud')
    n_w = smp(0.5)
    u_w = tvec(n_w) / 0.5
    wah_src = stab(notes('A3 E4 A4 C5'), 0.5, 'wah', 800.0, 800.0, 1.0, decay=10.0)
    wah = svf(wah_src, 500.0 * 9.0 ** (0.5 - 0.5 * np.cos(TAU * 2.0 * u_w)), 2.5, 'lp')
    A.add('keys', fade(wah * (1 - u_w) ** 1.5, 0.01, 0.02), w_every, -19.0, hall=0.2, label='weight wah')
    for i, tk in enumerate(ECHO_HITS):
        s = stab(notes('E4 A4 C5'), 0.07, ('echo', i), 3800.0 * 0.85 ** i, 500.0, 0.02, decay=0.03)
        A.add('keys', s, tk, -11.0 - 1.6 * i, pan=(-1) ** i * (0.2 + 0.1 * i), room=0.2, label='echo stab')
    A.add('fx', slice_swish(0.2), 3.80, -13.0, label='slice swish')

    # ── S3 · SHAPE & RHYTHM ─────────────────────────────────────────────────
    order = sorted([(r_ + c_, r_, c_) for r_ in range(3) for c_ in range(5)])   # diagonal pop-in
    melody = notes('A4 C5 E5 D5 G5 A5 E5 C6 A5 D6 E6 C6 G6 E6 A6')
    for i, (tk, (_, _, col)) in enumerate(zip(TILE_PLUCKS, order)):
        m = melody[i]
        A.add('keys', pluck(float(mtof(m)), 0.9, key=('tile', i)), tk,
              -15.0 - max(0, m - 81) * 0.3, pan=(col - 2) * 0.32, room=0.25, hall=0.15, label='tile pluck')
    for i, m in enumerate(notes('F4 A4 C5 E5 G5 E5 C5 A4')):
        A.add('keys', pluck(float(mtof(m)), 0.5, 0.7, key=('arp', i)), 4.5 + i * 0.125,
              -22.0, pan=0.45 * (-1) ** i, room=0.3, label='arp')
    A.add('fx', reverse_swell(0.5, 'suck', notes('C4 E4 G4 C5')), 5.50, -10.0, label='reverse suck')

    # ── S4 · PARTICLES & FLOW ───────────────────────────────────────────────
    A.add('impact', crash(1.0, 'burst', hp=900.0, c0=15000.0, c1=4000.0, decay=0.14, long_amt=0.1,
                          long_decay=0.6), 6.0, -15.0, hall=0.3, label='burst noise')
    A.add('impact', boom(98.0, 65.4, 0.6, 0.04, 0.2, 1.4), 6.0, -9.0, label='burst sub')
    sparkle = notes('C6 E6 G6 B6 D7 E7 G6 C7 B6 E6 D7 G7')
    times = np.concatenate([[0.0], np.sort(r.uniform(0.01, 0.38, len(sparkle) - 1))])
    for i, (m, dt) in enumerate(zip(sparkle, times)):
        A.add('fx', bell(float(mtof(m)), 0.6, ratio=3.01, index=1.0, decay=0.22), 6.0 + dt,
              -24.0 + r.uniform(-2, 2), pan=r.uniform(-0.85, 0.85), hall=0.35, label='shimmer')
    for i, (tk, d, lo, hi, p0, p1) in enumerate([(6.10, 0.60, 450, 3200, -0.9, 0.8),
                                                 (6.40, 0.60, 380, 2600, 0.9, -0.7),
                                                 (6.70, 0.55, 520, 3800, -0.7, 0.9),
                                                 (6.95, 0.45, 600, 4200, 0.8, -0.8)]):
        A.add('fx', whoosh(d, lo, hi, p0, p1, key=('flow', i)), tk, -18.0 + 0.5 * i, hall=0.2, label='whoosh')
    n_s = smp(0.85)
    t_s = tvec(n_s)
    sw_env = np.where(t_s < 0.40, exp_curve(t_s / 0.40, 3.0), np.exp(-(t_s - 0.40) / 0.2))
    swell = pad(notes('C4 E4 G4 B4 D5'), 0.85, 'swell', q=0.8, hp=200.0, attack=0.02, release=0.08,
                cutoff=lambda t: np.where(t < 0.4, 600.0 * (4500.0 / 600.0) ** (t / 0.4),
                                          4500.0 * np.exp(-(t - 0.4) / 0.6)))
    A.add('keys', swell * sw_env, 6.60, -10.0, hall=0.35, label='flow swell')
    A.add('fx', riser(0.58, 'gather', 500.0, 8000.0, nm('G3'), nm('G4'), 2.2, 0.5), 7.40, -13.0,
          hall=0.15, label='gather sweep')

    # ── S5 · 3D & DIMENSION ─────────────────────────────────────────────────
    A.add('impact', crash(1.4, 'hit3d', hp=450.0, decay=0.3, long_amt=0.15), 8.0, -17.0, hall=0.3,
          label='hit crash')
    for i, tk in enumerate(BOOMS):
        if i == 0:
            A.add('boom', boom(98.0, 49.0, 0.8, 0.05, 0.26, 1.6, top=150.0), tk, -8.0, label='boom')
        else:
            A.add('boom', boom(92.0, 49.0, 0.5, 0.045, 0.18, 1.5), tk, -9.0, room=0.1, label='boom')
    # pads/bass/drums up to 10.0 are all placed → glitch-stutter 9.70–10.00
    stutter(A, ('kick', 'boom', 'clap', 'hats', 'bass', 'pad'), 9.50, 9.70, 10.0,
            [S16 / 2] * 2 + [S16 / 4] * 3 + [S16 / 8] * 4, gain_db=-5.0)   # ends 9.981: a breath before 10.00
    A.add('fx', glitch(0.28, 'exit'), 9.70, -19.0, label='glitch')

    # ── S6 · RANGE: build 10–11.75 ──────────────────────────────────────────
    groove(10.0, 11.5 + S16)                              # kick until 11.5, hats until 11.375
    for c0, c1, name, v in CHORDS[5:8]:
        dur = c1 - c0 + (0.05 if c1 < 11.75 else 0.03)
        A.add('pad', pad(notes(v), dur, (name, c0), q=0.8, hp=190.0, attack=0.03, release=0.04,
                         cutoff=lambda t, c0=c0: 1400.0 * 3.5 ** ((t + c0 - 10.0) / 1.75)),
              c0, -15.0 + 3.0 * (c0 - 10.0), hall=0.18, label='pad')
    for tk, m in ((10.25, 'F1'), (10.75, 'F1'), (11.25, 'E2')):
        A.add('bass', bass_note(float(mtof(nm(m))), 0.2, key=('build', tk)), tk, -11.0, label='bass')
    for i, tk in enumerate(SNARE_ROLL):
        u = (tk - 10.0) / 1.75
        A.add('perc', snare(1.0 + 0.6 * u, key=i), tk, -17.0 + 13.0 * u ** 1.2, room=0.3, label='snare')
    A.add('fx', riser(1.75, 'build', 300.0, 7000.0, nm('A2'), nm('E4'), 2.0, 0.5), 10.0, -5.5,
          hall=0.1, label='build riser')
    # per-cut SFX
    for tk, f0, p in ((10.00, 260.0, -0.3), (10.07, 390.0, 0.35), (10.14, 300.0, 0.0)):
        A.add('fx', bloop(f0), tk, -12.0, pan=p, room=0.2, label='bloop')
    A.add('fx', glitch(0.05, 'residual', bits=5), 10.0, -22.0, label='residual glitch')
    A.add('fx', moire(0.24), 10.25, -17.0, hall=0.15, label='moire')
    roll = 10.50 + np.cumsum(np.linspace(0.012, 0.022, 6))
    for i, tk in enumerate(np.concatenate([[10.50], roll[:-1]])):
        A.add('fx', clack(('roll', i), 0.8), float(tk), -19.0, pan=r.uniform(-0.3, 0.3), label='flap roll')
    for i, tk in enumerate((10.62, 10.655, 10.69, 10.725)):
        A.add('fx', clack(('land', i), 1.0), tk, -13.0, pan=-0.3 + 0.2 * i, room=0.15, label='flap land')
    A.add('fx', wire_tone(0.25), 10.75, -19.0, hall=0.2, label='wire')
    for i, m in enumerate(notes('A5 C6 E6 A6')):
        A.add('fx', sq_blip(float(mtof(m))), 11.00 + i * 0.0625, -20.0, pan=0.5 * (-1) ** i, room=0.2,
              label='move blip')
    A.add('fx', whoosh(0.22, 800.0, 7000.0, -0.2, 0.2, peak=0.35, q=1.1, shape=1.2, key='zoom', width=0.5),
          11.25, -15.0, label='zoom')
    A.add('perc', thud(120.0, 50.0, 0.25, 0.06), 11.25, -10.0, label='zoom punch')
    snap = bpf(rng('zoom snap').standard_normal(smp(0.06)), 900.0, 5000.0) * perc_env(smp(0.06), 0.001, 0.012, 0.01)
    A.add('perc', snap, 11.25, -14.0, room=0.2, label='zoom snap')
    A.add('fx', glitch(0.24, 'mosh', bits=5, hold=4), 11.50, -15.0, label='datamosh')
    A.add('fx', crt_zip(), 11.75, -5.0, room=0.15, label='crt zip')

    # ── S7 · CONTACT: the final drop (part B) ───────────────────────────────
    n_f = smp(3.0)
    t_f = tvec(n_f)
    f_sub = 30.0 + 25.0 * np.exp(-t_f / 0.9) + 70.0 * np.exp(-t_f / 0.02)    # ~125 → 55 → 30 Hz
    sub = saturate(osc_sine(f_sub, n_f) * np.exp(-t_f / 0.55), 1.3)
    B.add('impact', fade(lpf(sub, 220.0), 0.018, 0.3), FINAL, -4.0, label='final sub')   # kick owns the attack
    B.add('kick', kick('drop'), FINAL, -1.0, label='final kick')
    B.add('impact', crash(3.0, 'final', hp=300.0, c0=14000.0, c1=2200.0, ctau=0.9, decay=0.45,
                          long_decay=1.1, long_amt=0.18), FINAL, -8.0, hall=0.35, label='final crash')
    thwack = bpf(rng('thwack').standard_normal(smp(0.1)), 800.0, 3500.0) * perc_env(smp(0.1), 0.001, 0.02, 0.01)
    B.add('impact', thwack, FINAL, -12.0, hall=0.3, label='flash')
    B.add('fx', whoosh(1.3, 350.0, 6500.0, 0.0, 0.0, peak=0.02, q=1.3, shape=1.3, key='shock', width=0.6),
          FINAL, -21.0, hall=0.3, label='shockwave')
    for i in range(14):
        m = int(r.choice(notes('A6 C7 E7 G6 D7')))
        B.add('fx', bell(float(mtof(m)), 0.3, ratio=5.19, index=1.0, decay=0.07),
              FINAL + (0.0 if i == 0 else r.uniform(0.01, 0.45)), -27.0 + r.uniform(-2, 2),
              pan=r.uniform(-0.9, 0.9), hall=0.4, label='spark')
    v_am9 = notes(CHORDS[-1][3])
    am9 = pad(v_am9, 3.0, 'final', cutoff=3200.0, hp=110.0, attack=0.012, release=0.05, detune=11.0)
    am9 = ms_width(am9, 1.35) * (np.exp(-t_f / 1.9))
    B.add('pad', am9, FINAL, -8.0, hall=0.4, label='final pad')
    ep = sum(bell(float(mtof(m)), 3.0, ratio=1.0, index=1.3, decay=1.2) for m in notes('A3 E4 G4 B4 C5'))
    B.add('keys', pan_mono(ep / 5, 0.0), FINAL, -11.0, hall=0.35, label='final keys')
    for i, tk in enumerate(LETTER_TICKS):
        B.add('perc', tick(float(mtof(notes('A5 C6 D6 E6 G6 A6')[i])), 0.012, 0.15, key=('letter', i)),
              tk, -17.0, pan=-0.5 + 0.2 * i, room=0.3, label='letter tick')
    g = glide(0.65, 440.0, 880.0, tail=0.45, land=0.75, land_from=0.6)
    B.add('keys', g, 12.45, -16.0, hall=0.35, label='underline glide')   # no echoes: the dot comes to rest
    for i, (tk, name) in enumerate(ACCENTS):
        p = (-0.35, 0.35, -0.2, 0.25)[i]
        s = pluck(float(mtof(nm(name))), 1.6, 0.9, key=('accent', i), decay=0.6, mallet=0.14)
        B.add('keys', s, tk, -12.5, pan=p, hall=0.28, label='accent pluck')
        for off, e in echoes(s, 3 * S16, 3, -12.0, (-p, p), lp=2800.0):
            if tk + off < DUR:
                B.add('keys', e, tk + off, -14.0, hall=0.15, label='accent echo')
    return A, B


# ════════════════════════════════════════════════════════════════════════════
# 5. Mix bus & master chain
# ════════════════════════════════════════════════════════════════════════════
STEM_EQ = {  # (hpf Hz, lpf Hz)
    'clap': (220.0, None), 'hats': (5500.0, 14000.0), 'bass': (32.0, None),
    'keys': (120.0, 14000.0), 'fx': (140.0, 14000.0), 'perc': (60.0, None), 'boom': (None, 300.0),
}
DUCKS = {  # stem → [(trigger labels, depth dB, release s)]
    'A': {'pad': [(('kick',), 6.0, 0.22), (('boom',), 4.0, 0.3)],
          'bass': [(('kick',), 12.0, 0.12), (('boom',), 9.0, 0.28)],
          'keys': [(('kick',), 2.0, 0.15)],
          'returns': [(('kick',), 3.0, 0.2)]},
    'B': {'pad': [(('final sub',), 8.0, 0.55)],
          'returns': []},
}
IRS = {}


def irs():
    if not IRS:
        IRS['room'] = make_ir(0.65, 0.9, 0.008, 'room', damp=8000.0)
        IRS['hall'] = make_ir(2.2, 2.8, 0.02, 'hall', damp=6500.0)
        IRS['big'] = make_ir(3.2, 3.0, 0.03, 'big', damp=6000.0)
    return IRS


def mix_part(mix, part):
    """Stem EQ + sidechain ducking + reverb returns → one stereo bus."""
    ducks = DUCKS[part]
    out, stems = np.zeros((2, N)), {}

    def duck_gain(specs):
        g = np.ones(N)
        for labels, depth, rel in specs:
            ts = mix.times(*labels)
            if ts:
                g = np.minimum(g, duck_env(ts, depth, rel))
        return g

    for name, buf in mix.stems.items():
        if not buf.any():
            stems[name] = buf
            continue
        hp_, lp_ = STEM_EQ.get(name, (None, None))
        x = hpf(buf, hp_) if hp_ else buf
        x = lpf(x, lp_) if lp_ else x
        if name in ducks:
            x = x * duck_gain(ducks[name])
        stems[name] = x
        out += x
    ir = irs()
    room = reverb(mix.sends['room'], ir['room'])
    hall = reverb(mix.sends['hall'], ir['hall' if part == 'A' else 'big'])
    ret = lpf(hpf(room * db2lin(-4.0) + hall * db2lin(-2.0), 230.0), 8500.0)
    ret *= duck_gain(ducks['returns'])
    stems['returns'] = ret
    out += ret
    if part == 'A':           # hard contract: nothing from part A survives past 11.95
        g = np.ones(N)
        a, b = smp(SILENCE[0] - 0.015), smp(SILENCE[0])
        g[a:b] = 0.5 + 0.5 * np.cos(np.pi * (np.arange(b - a) + 1) / (b - a))
        g[b:] = 0.0
        out *= g
        for k in stems:
            stems[k] = stems[k] * g
    else:
        out[:, :smp(FINAL)] = 0.0
    return out, stems


def silence_mask():
    """1 everywhere except the 11.95–12.00 hole; final fade to 0 at the last sample."""
    g = np.ones(N)
    g[smp(SILENCE[0]):smp(SILENCE[1])] = 0.0
    a, b = smp(FADE_OUT[0]), N
    u = (np.arange(b - a) + 1) / (b - a)
    g[a:b] *= 0.5 + 0.5 * np.cos(np.pi * u)
    return g


def master(bus):
    """DC block → mono lows → gentle glue compression → loudness trim →
    look-ahead true-peak limiter (iterated to hit −14 LUFS) → silence/fade."""
    info = {}
    x = hpf(bus, 20.0, 2)                                  # DC / infrasonic
    m, s = 0.5 * (x[0] + x[1]), hpf(0.5 * (x[0] - x[1]), 120.0)
    x = np.stack([m + s, m - s])                           # mono below ~120 Hz
    x = eq(x, 'highshelf', 11000.0, -1.0, 0.7)             # a touch of polish, no fizz
    pre_db = -18.0 - lufs(x)
    x *= db2lin(pre_db)                                    # pre-normalise so thresholds mean something
    x, g_glue = compressor(x, thresh_db=-14.0, ratio=2.0, attack=0.015, release=0.18, knee_db=8.0,
                           sc_hpf=100.0)
    info['glue_max_gr_db'] = float(-lin2db(g_glue.min()))
    info['glue_mean_gr_db'] = float(-np.mean(lin2db(g_glue[smp(2.0):smp(11.5)])))
    gain = TARGET_LUFS - lufs(x)
    mask = silence_mask()
    for _ in range(8):
        y, g_lim = limiter(x * db2lin(gain), LIMIT_DBTP)
        y = y * mask
        err = TARGET_LUFS - lufs(y)
        if abs(err) < 0.03:
            break
        gain += err
    info['trim_db'] = float(gain + pre_db)
    info['limiter_gain'] = g_lim
    info['limiter_max_gr_db'] = float(-lin2db(g_lim.min()))
    info['limiter_pct_over_1db'] = float(np.mean(g_lim < db2lin(-1.0)) * 100)
    return y, mask, info


def to_int16(y, mask):
    """TPDF dither (not in digital silence) and 16-bit quantisation."""
    r = rng('dither')
    d = (r.random(y.shape) - r.random(y.shape)) * (mask > 0)
    q = np.round(y * 32767.0 + d)
    return np.clip(q, -32768, 32767).astype(np.int16)


def write_wav(path, pcm):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.ascontiguousarray(pcm.T).astype('<i2').tobytes())


def read_wav(path):
    with wave.open(path, 'rb') as w:
        fmt = (w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes(), w.getcomptype())
        raw = w.readframes(w.getnframes())
    pcm = np.frombuffer(raw, '<i2').reshape(-1, fmt[0]).T
    return fmt, pcm


# ════════════════════════════════════════════════════════════════════════════
# 6. Verification
# ════════════════════════════════════════════════════════════════════════════
ONSET_BANDS = ((30.0, 250.0, 0.003), (250.0, 1000.0, 0.0015), (1000.0, 4000.0, 0.0005),
               (4000.0, 16000.0, 0.0005))   # (lo, hi, trailing envelope smoothing s)


def _trailing_mean(x, w):
    cs = np.concatenate([[0.0], np.cumsum(x)])
    i = np.arange(x.size)
    lo = np.maximum(0, i - w + 1)
    return (cs[i + 1] - cs[lo]) / (i + 1 - lo)


def onset(y, c, search=0.02, frac=0.3, min_rise=10.0):
    """Leading-edge onset near cue c, as a consensus across four bands.

    Per band: causal band-pass + Hilbert envelope + trailing smoothing (every
    step is causal, so a band can only report *late*), dB floor = median of
    45–8 ms before the cue (clamped to peak − 40 dB), peak within ±search,
    then walk back from the peak to the last point under floor + 30 % of the
    rise. Among bands where the event rises ≥ 10 dB, the earliest wins.
    Returns (onset time, rise dB, band)."""
    mono = y.mean(0)
    i0, i1 = max(0, smp(c - 0.2)), min(N, smp(c + 0.08))
    seg = mono[i0:i1]
    ic, w = smp(c) - i0, smp(search)
    res = []
    for lo, hi, sm in ONSET_BANDS:
        env = _trailing_mean(np.abs(sps.hilbert(bpf(seg, lo, hi, 2))), max(1, smp(sm)))
        e = 20 * np.log10(env + 1e-9)
        win = e[ic - w:ic + w]
        ip = int(np.argmax(win))
        base = max(float(np.median(e[ic - smp(0.045):ic - smp(0.008)])), float(win[ip]) - 40.0)
        thr = base + frac * (win[ip] - base)
        j = ip
        while j > 0 and win[j - 1] >= thr:
            j -= 1
        res.append(((i0 + ic - w + j) / SR, float(win[ip] - base), (lo, hi)))
    strong = [r for r in res if r[1] >= min_rise] or [max(res, key=lambda r: r[1])]
    return min(strong, key=lambda r: r[0])


def detect_clicks(x, ratio=10.0, floor=0.004):
    """Flag isolated sample discontinuities: |2nd difference| far above its
    local RMS (10 ms window) and above an absolute floor. Returns times (s)."""
    hits = []
    for ch in np.atleast_2d(x):
        d2 = np.zeros_like(ch)
        d2[1:-1] = ch[2:] - 2 * ch[1:-1] + ch[:-2]
        loc = np.sqrt(np.maximum(uniform_filter1d(d2 * d2, smp(0.010)), 0.0) + 1e-18)
        idx = np.nonzero((np.abs(d2) > ratio * loc) & (np.abs(d2) > floor))[0]
        hits.extend(idx.tolist())
    hits = sorted(set(hits))
    events, last = [], -10 ** 9
    for i in hits:
        if i - last > smp(0.005):
            events.append(i / SR)
        last = i
    return events


SECTIONS = [(0.0, 2.0, 'S1 easing'), (2.0, 4.0, 'S2 type'), (4.0, 6.0, 'S3 shapes'),
            (6.0, 8.0, 'S4 flow'), (8.0, 10.0, 'S5 3D'), (10.0, 11.95, 'S6 build'), (12.0, 15.0, 'S7 final')]
BANDS = [(20, 60, 'sub'), (60, 250, 'low'), (250, 2000, 'mid'), (2000, 6000, 'hmid'), (6000, 12000, 'high'),
         (12000, 24000, 'air')]


def spectral_report(y):
    """Per section: band energy vs total, % of power above 6 kHz, centroid,
    loudest 1/3-octave band above 6 kHz relative to the 2–5 kHz presence
    average (a smooth, non-piercing top end sits below it), and the
    worst narrow spike above 6 kHz (only bins within 35 dB of the section's
    loudest bin count, so the dither floor is ignored)."""
    rows = []
    for a, b, name in SECTIONS:
        seg = y[:, smp(a):smp(b)].mean(0)
        f, P = sps.welch(seg, SR, nperseg=8192)
        tot = P[(f >= 20)].sum()
        bands = [10 * np.log10(P[(f >= lo) & (f < hi)].sum() / tot + 1e-20) for lo, hi, _ in BANDS]
        Pdb = 10 * np.log10(P + 1e-20)
        excess = Pdb - median_filter(Pdb, size=61)
        hf = (f > 6000) & (Pdb > Pdb.max() - 35.0)
        spike, spike_f = (float(excess[hf].max()), float(f[hf][np.argmax(excess[hf])])) if hf.any() else (0.0, 0.0)
        centres = 1000.0 * 2.0 ** (np.arange(-15, 14) / 3.0)
        third = np.array([P[(f >= fc * 2 ** (-1 / 6)) & (f < fc * 2 ** (1 / 6))].sum() for fc in centres])
        ref = third[(centres >= 2000) & (centres <= 5100)].mean()     # presence region
        hf_third = float(10 * np.log10(third[centres > 6000].max() / ref + 1e-20))
        centroid = float((f * P).sum() / P.sum())
        pct_hf = float(P[f > 6000].sum() / tot * 100)
        rows.append((name, bands, pct_hf, centroid, hf_third, spike, spike_f))
    return rows


def section_loudness(y):
    t, l = loudness_curve(y, 0.4, 0.05)
    out = []
    for a, b, name in SECTIONS:
        m = (t >= a) & (t < b)
        p = 10 ** ((l[m] + 0.691) / 10)
        out.append((name, float(-0.691 + 10 * np.log10(p.mean() + 1e-20)), float(l[m].max())))
    return out


_PAL = {'ink': (11, 11, 16), 'ink2': (22, 22, 31), 'paper': (242, 238, 230), 'signal': (255, 75, 31),
        'cobalt': (42, 60, 255), 'acid': (215, 255, 58), 'lilac': (184, 169, 255), 'mute': (110, 108, 120)}


def _cmap(v):
    stops = np.array([0.0, 0.22, 0.45, 0.68, 0.86, 1.0])
    cols = np.array([_PAL['ink'], (30, 32, 110), _PAL['cobalt'], _PAL['lilac'], _PAL['signal'], _PAL['paper']], float)
    return np.stack([np.interp(v, stops, cols[:, c]) for c in range(3)], -1).astype(np.uint8)


def render_png(y, path, t0=0.0, t1=DUR, title='', marks=(), gr=None, width=1800):
    """Waveform + loudness/limiter strip + log-frequency spectrogram, with cue marks."""
    from PIL import Image, ImageDraw, ImageFont
    try:
        font = ImageFont.truetype(os.path.join(ROOT, 'fonts', 'JetBrainsMono.woff2'), 13)
        font_b = ImageFont.truetype(os.path.join(ROOT, 'fonts', 'JetBrainsMono.woff2'), 17)
    except Exception:
        font = font_b = ImageFont.load_default()
    W, LM = width, 64
    PW = W - LM - 16
    H_T, H_WAV, H_LD, H_SP, H_AX = 58, 220, 100, 460, 40
    H = H_T + H_WAV + H_LD + H_SP + H_AX
    img = np.zeros((H, W, 3), np.uint8)
    img[:] = _PAL['ink']
    i0, i1 = smp(t0), smp(t1)
    seg = y[:, i0:i1]
    n = seg.shape[1]
    cols = np.linspace(0, n, PW + 1).astype(int)
    rows_y = {}
    # waveform (L top, R bottom) with RMS core
    half = H_WAV // 2
    for ch in (0, 1):
        top = H_T + ch * half
        mid = top + half / 2
        mx = np.maximum.reduceat(seg[ch], cols[:-1])
        mn = np.minimum.reduceat(seg[ch], cols[:-1])
        rms = np.sqrt(np.add.reduceat(seg[ch] ** 2, cols[:-1]) / np.diff(cols))
        amp = half / 2 - 3
        rr = np.arange(top, top + half)[:, None]
        m1 = (rr >= (mid - mx * amp)[None, :]) & (rr <= (mid - mn * amp)[None, :])
        m2 = (rr >= (mid - rms * amp)[None, :]) & (rr <= (mid + rms * amp)[None, :])
        blk = img[top:top + half, LM:LM + PW]
        blk[m1] = _PAL['lilac']
        blk[m2] = _PAL['paper']
        for lvl in (db2lin(-1.0), -db2lin(-1.0)):
            yy = int(mid - lvl * amp)
            img[yy, LM:LM + PW:4] = _PAL['signal']
        rows_y[ch] = (top, mid)
    # loudness strip (momentary, short-term) + limiter GR
    ld_top = H_T + H_WAV + 8
    ld_h = H_LD - 16
    tm, lm = loudness_curve(y, 0.4, 0.01)
    ts_, ls_ = loudness_curve(y, 3.0, 0.05)
    px_t = t0 + (np.arange(PW) + 0.5) / PW * (t1 - t0)

    def ly(v):
        return (ld_top + ld_h * (1 - np.clip((v + 40.0) / 36.0, 0, 1))).astype(int)
    img[ly(np.array([-14.0]))[0], LM:LM + PW:3] = _PAL['acid']
    for arr_t, arr_v, col in ((tm, lm, _PAL['cobalt']), (ts_, ls_, _PAL['paper'])):
        yy = ly(np.interp(px_t, arr_t, arr_v))
        img[yy, LM + np.arange(PW)] = col
    if gr is not None:
        g = gr[i0:i1]
        gmin = np.minimum.reduceat(g, cols[:-1])
        d = np.clip(-lin2db(gmin) / 6.0, 0, 1) * ld_h
        for x_ in np.nonzero(d > 0.5)[0]:
            img[ld_top:ld_top + int(d[x_]), LM + x_] = _PAL['signal']
    # spectrogram (log frequency 25 Hz – 22 kHz, dBFS colour scale)
    sp_top = H_T + H_WAV + H_LD
    mono = seg.mean(0)
    nper = 2048 if (t1 - t0) > 3 else 1024
    hop = max(8, n // (PW * 2))
    pad_ = np.pad(mono, (nper // 2, nper // 2))
    frames = np.lib.stride_tricks.sliding_window_view(pad_, nper)[::hop]
    S = np.abs(np.fft.rfft(frames * np.hanning(nper), axis=1)) / (nper / 4)
    Sdb = 20 * np.log10(S + 1e-9)
    fcols = np.minimum((cols[:-1] / hop).astype(int), len(Sdb) - 1)
    Sc = np.maximum.reduceat(Sdb, fcols, axis=0) if len(set(fcols)) == len(fcols) else Sdb[fcols]
    f_rows = np.geomspace(22000.0, 25.0, H_SP)
    b = np.clip(np.round(f_rows * nper / SR).astype(int), 1, nper // 2)
    spec = Sc[:, b].T
    img[sp_top:sp_top + H_SP, LM:LM + PW] = _cmap(np.clip((spec + 110.0) / 100.0, 0, 1))
    for fl in (100, 1000, 6000, 10000):
        yy = sp_top + int(np.argmin(np.abs(f_rows - fl)))
        img[yy, LM:LM + PW:(3 if fl == 6000 else 6)] = _PAL['acid'] if fl == 6000 else _PAL['mute']
    im = Image.fromarray(img)
    dr = ImageDraw.Draw(im, 'RGBA')

    def tx(t):
        return LM + (t - t0) / (t1 - t0) * PW
    # cue marks
    lane = 0
    for t, lab in marks:
        if not (t0 <= t <= t1):
            continue
        x_ = tx(t)
        dr.line([(x_, H_T - 2), (x_, H - H_AX)], fill=(215, 255, 58, 110), width=1)
        dr.text((x_ + 3, H_T - 16 - 13 * (lane % 2)), lab, font=font, fill=(215, 255, 58, 255))
        lane += 1
    # axes & labels
    dr.text((LM, 8), title, font=font_b, fill=_PAL['paper'])
    step = 0.5 if (t1 - t0) > 3 else 0.05 if (t1 - t0) <= 0.8 else 0.1
    t = np.ceil(t0 / step) * step
    while t <= t1 + 1e-9:
        x_ = tx(t)
        dr.line([(x_, H - H_AX), (x_, H - H_AX + 6)], fill=_PAL['mute'])
        dr.text((x_ - 14, H - H_AX + 9), f'{t:.2f}', font=font, fill=_PAL['mute'])
        t += step
    for fl, lab in ((100, '100'), (1000, '1k'), (6000, '6k'), (10000, '10k')):
        yy = sp_top + int(np.argmin(np.abs(f_rows - fl)))
        dr.text((8, yy - 7), lab, font=font, fill=_PAL['mute'])
    dr.text((8, H_T + 4), 'L', font=font, fill=_PAL['mute'])
    dr.text((8, H_T + half + 4), 'R', font=font, fill=_PAL['mute'])
    dr.text((8, ld_top), 'LUFS', font=font, fill=_PAL['mute'])
    dr.text((8, ld_top + 14), '-14', font=font, fill=_PAL['acid'])
    im.save(path)


def verify(path, stems, info, preview=True):
    fmt, pcm = read_wav(path)
    y = pcm.astype(float) / 32768.0
    ok = True

    def check(cond, msg):
        nonlocal ok
        ok &= bool(cond)
        print(f"  [{'ok' if cond else 'FAIL'}] {msg}")
    print('\n── format')
    check(fmt[:4] == (2, 2, SR, N) and fmt[4] == 'NONE',
          f'{fmt[0]} ch · {fmt[1] * 8}-bit PCM · {fmt[2]} Hz · {fmt[3]} frames ({fmt[3] / SR:.3f} s)')
    print('\n── level')
    pk = float(lin2db(np.abs(y).max()))
    tp = true_peak_db(y)
    L = lufs(y)
    check(pk <= CEILING_DBTP, f'sample peak {pk:.2f} dBFS')
    check(tp <= CEILING_DBTP, f'true peak   {tp:.2f} dBTP (4x oversampled)')
    check(abs(L - TARGET_LUFS) <= 0.5, f'integrated  {L:.2f} LUFS (BS.1770-4 gated)')
    tm, lm = loudness_curve(y, 3.0, 0.1)
    print(f'  short-term max {lm.max():.1f} LUFS · momentary max {loudness_curve(y, 0.4, 0.01)[1].max():.1f} LUFS')
    print(f"  glue comp GR max {info['glue_max_gr_db']:.1f} dB (mean {info['glue_mean_gr_db']:.2f} dB in groove) · "
          f"limiter GR max {info['limiter_max_gr_db']:.1f} dB, >1 dB on {info['limiter_pct_over_1db']:.1f}% of samples")
    dc = y.mean(axis=1)
    blocks = y[:, :N // SR * SR].reshape(2, -1, SR).mean(axis=2)
    check(np.all(np.abs(dc) < 1e-4) and np.abs(blocks).max() < 1e-3,
          f'DC offset L {dc[0]:+.1e} R {dc[1]:+.1e} · worst 1 s block {np.abs(blocks).max():.1e}')
    corr = np.corrcoef(y[0], y[1])[0, 1]
    hi = hpf(y, 300.0, 4)
    widths = []
    for a, b, name in SECTIONS:
        L_, R_ = hi[:, smp(a):smp(b)]
        widths.append(f'{name.split()[0]} {np.corrcoef(L_, R_)[0, 1]:.2f}')
    print(f'  L/R correlation {corr:.2f} full band (mono lows) · above 300 Hz: ' + ', '.join(widths))
    check(min(np.corrcoef(*hi[:, smp(a):smp(b)])[0, 1] for a, b, _ in SECTIONS) > 0.2,
          'mono-compatible (correlation above 300 Hz stays positive in every section)')
    print('\n── silence 11.95–12.00')
    hole = y[:, smp(SILENCE[0]):smp(SILENCE[1])]
    hole_db = float(lin2db(np.abs(hole).max())) if np.abs(hole).max() > 0 else -np.inf
    check(hole_db < -60, f'peak {hole_db} dBFS ({"digital zero" if hole_db == -np.inf else "non-zero"})')
    pre = y[:, smp(11.90):smp(11.95)]
    print(f'  CRT tail 11.90–11.95 peak {lin2db(np.abs(pre).max()):.1f} dBFS · '
          f'first sample after 12.00: {np.abs(y[:, smp(12.0):smp(12.0) + 48]).max():.3f} (impact attack)')
    print('\n── onset timing (leading edge vs cue)')
    cues = [(0.10, 'blip'), (1.50, 'tock')] + [(k, 'kick') for k in KICKS] + \
           [(10.25, 'moire'), (10.75, 'wire'), (11.25, 'zoom punch'), (FINAL, 'FINAL')] + \
           [(t, 'accent') for t, _ in ACCENTS]
    errs = []
    lines = []
    for c, lab in cues:
        t_on, rise, band = onset(y, c)
        e = (t_on - c) * 1000
        errs.append(abs(e))
        lines.append(f'{c:6.3f} {lab:<11} {e:+5.2f} ms ({rise:4.1f} dB, {band[0]:.0f}-{band[1] / 1000:.2g}k)')
    for i in range(0, len(lines), 3):
        print('  ' + '   '.join(lines[i:i + 3]))
    check(max(errs) <= 5.0, f'max |error| {max(errs):.2f} ms over {len(cues)} cues (mean {np.mean(errs):.2f} ms)')
    print('\n── click detection')
    clicks = detect_clicks(y)
    check(len(clicks) == 0, f'{len(clicks)} abnormal discontinuities in the master' +
          (': ' + ', '.join(f'{c:.4f}' for c in clicks[:12]) if clicks else ''))
    for name, st in stems.items():
        c = detect_clicks(st)
        if c:
            print(f'    stem {name}: {len(c)} → ' + ', '.join(f'{v:.4f}' for v in c[:8]))
    jumps = np.abs(np.diff(y, axis=1)).max()
    print(f'  largest sample-to-sample step {jumps:.3f} FS')
    print('\n── spectral balance (dB rel. total, per section)')
    print('  section     ' + ' '.join(f'{b[2]:>6}' for b in BANDS) +
          '   >6k%  centroid  HF⅓oct-vs-2-5k  HF spike')
    for name, bands, pct, cen, hf3, spike, sf in spectral_report(y):
        flag = '' if (hf3 < 1.5 and spike < 12.0) else '  <-- check'
        print(f'  {name:<11} ' + ' '.join(f'{v:6.1f}' for v in bands) +
              f'  {pct:5.1f}  {cen:7.0f}  {hf3:+10.1f} dB  {spike:4.1f} dB @{sf / 1000:.1f}k{flag}')
    print('\n── loudness arc (mean / max momentary LUFS per section)')
    print('  ' + ' · '.join(f'{n} {m:.1f}/{x:.1f}' for n, m, x in section_loudness(y)))
    print('\n── stems (integrated LUFS / peak dBFS, pre-master scale)')
    for name, st in stems.items():
        if np.abs(st).max() > 0:
            print(f'  {name:<8} {lufs(st):6.1f} LUFS   peak {lin2db(np.abs(st).max()):6.1f}')
    if preview:
        os.makedirs(PREVIEW, exist_ok=True)
        marks = [(0.10, 'blip'), (0.75, 'glide'), (1.50, 'tock'), (2.0, 'DROP'), (2.5, 'is'), (3.0, 'EVERY'),
                 (3.5, 'echo'), (3.8, 'swish'), (4.0, 'tiles'), (5.5, 'suck'), (6.0, 'burst'), (7.0, 'FLOW'),
                 (7.4, 'gather'), (8.0, 'HIT'), (9.7, 'glitch'), (10.0, 'build'), (11.5, 'last kick'),
                 (11.75, 'CRT'), (11.95, 'silence'), (12.0, 'FINAL'), (12.45, 'glide'), (13.0, 'A'),
                 (13.5, 'C'), (14.0, 'E'), (14.5, "A'")]
        gr = info.get('limiter_gain')
        render_png(y, os.path.join(PREVIEW, 'audio-overview.png'), 0, DUR,
                   f'showreel.wav · {L:.1f} LUFS · TP {tp:.2f} dBTP · 120 BPM A minor', marks, gr)
        render_png(y, os.path.join(PREVIEW, 'audio-intro.png'), 0.0, 2.3, 'S1 intro → drop 1', marks, gr)
        render_png(y, os.path.join(PREVIEW, 'audio-build-drop.png'), 9.5, 12.6, 'glitch → build → CRT → silence → final',
                   marks + [(c, f'{c:.2f}') for c in CUTS[1:7]], gr)
        render_png(y, os.path.join(PREVIEW, 'audio-silence.png'), 11.7, 12.15, 'CRT zip · 11.95–12.00 silence · impact',
                   [(11.75, 'CRT'), (11.95, 'silence'), (12.0, 'FINAL'), (12.05, 'tick 1')], gr)
        render_png(y, os.path.join(PREVIEW, 'audio-onset-2s.png'), 1.95, 2.10, 'drop 1 transient', [(2.0, '2.00')], gr)
        render_png(y, os.path.join(PREVIEW, 'audio-final.png'), 11.9, 15.0, 'S7 final drop → end card → fade',
                   marks + [(t, 'tick') for t in LETTER_TICKS[1:]], gr)
        print(f'\n  previews → {os.path.relpath(PREVIEW, ROOT)}/audio-*.png')
    return ok


# ════════════════════════════════════════════════════════════════════════════
def main():
    t_start = time.time()
    preview = '--no-preview' not in sys.argv
    print('CLAUDE — MOTION REEL 2026 · synth')
    A, B = arrange()
    print(f'  arranged {len(A.events) + len(B.events)} events in {time.time() - t_start:.1f} s')
    print('\n── cue sheet (as rendered)')
    for a, b, what in CUE_SHEET:
        print(f"  {a:5.2f}{'–' + format(b, '5.2f') if b is not None else '      '}  {what}")
    bus_a, stems_a = mix_part(A, 'A')
    bus_b, stems_b = mix_part(B, 'B')
    stems = {k: stems_a[k] + stems_b[k] for k in stems_a}
    y, mask, info = master(bus_a + bus_b)
    scale = db2lin(info['trim_db'])
    stems = {k: v * scale for k, v in stems.items()}
    pcm = to_int16(y, mask)
    write_wav(OUT_WAV, pcm)
    print(f'  wrote {os.path.relpath(OUT_WAV, ROOT)} in {time.time() - t_start:.1f} s')
    ok = verify(OUT_WAV, stems, info, preview)
    print(f"\n{'ALL CHECKS PASSED' if ok else 'SOME CHECKS FAILED'} · {time.time() - t_start:.1f} s")
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
