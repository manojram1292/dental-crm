#!/usr/bin/env python3
"""
RIBHU LABS — "ONE CUP, MADE FOUR" · score & sound-design synthesiser
====================================================================

Deterministically synthesises ``audio/film.wav``: 48 kHz, stereo, 16-bit PCM,
exactly 1 440 000 frames (30.000 s), 96 BPM (beat 0.625 s, bar 2.5 s), D minor
with a D-dorian colour. No samples and no network: every sound is numpy/scipy
maths driven by seeded RNGs, so two runs give bit-identical files.

The cue sheet is STORYBOARD.md §4. CUES in section 4 mirrors it line by line,
and every timing constant is taken from it: the picture is timed to the same
numbers.

    python3 tools/synth.py               render, print metrics, write previews
    python3 tools/synth.py --no-preview  skip the PNG previews

Layout
  1. constants & beat helpers
  2. DSP utilities: envelopes, band-limited oscillators, noise, filters (scipy
     biquads plus a TPT state-variable filter for sweeps), convolution reverb
     with generated impulse responses, stereo tools, dynamics, BS.1770 loudness
  3. instruments
       3a the copper cup's voice (modal singing bowl)
       3b keys: felt piano, FM mallet, bells, glass
       3c pads, bass and sub
       3d workshop percussion: felt kick, shaker, anvil, hand-hammer
       3e sound design: servo, sparks, scan, paper, soil, pencil, air …
  4. cue list (§4) & arrangement
  5. mix bus & master chain
  6. verification: format, level, LUFS, DC, onset timing, clicks, spectral
     balance, stereo/mono, the cup voice's own analysis, PNG previews
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
N = 1_440_000                 # 30.000 s, exactly
DUR = N / SR
BPM = 96
BEAT = 60.0 / BPM             # 0.625 s
BAR = 4 * BEAT                # 2.5 s: scene boundaries sit on bars
S8, S16, S32 = BEAT / 2, BEAT / 4, BEAT / 8
SEED = 1729
TARGET_LUFS = -14.0
CEILING_DBTP = -1.0           # hard spec
LIMIT_DBTP = -1.3             # limiter target: margin for dither and rounding
SILENT_FROM = 29.9            # the last 0.1 s is digital zero
TAIL_FADE = (28.4, SILENT_FROM)
TALE_DB = -2.0                # mystery: the tale and Understand sit well under the groove
RENEW_DB = -1.5               # intimacy
BUILD_DB = -2.0               # the build rises into the lock but never past it
GROOVE_DB = -3.5              # one trim for the whole groove (kick, bass, shaker, metal, pad, mallet)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_WAV = os.path.join(ROOT, 'audio', 'film.wav')
PREVIEW = os.path.join(ROOT, '.preview')
TAU = 2.0 * np.pi


def at(bar, beat=1, step=0.0):
    """Musical time → seconds. Bar 1 beat 1 = 0.0; `step` counts 16ths."""
    return (bar - 1) * BAR + (beat - 1) * BEAT + step * S16


def smp(t):
    """Seconds → sample index (rounded)."""
    return int(round(t * SR))


def tvec(n):
    return np.arange(n) / SR


def db2lin(d):
    return 10.0 ** (np.asarray(d, float) / 20.0)


def lin2db(x):
    return 20.0 * np.log10(np.maximum(np.abs(x), 1e-12))


def mtof(m):
    return 440.0 * 2.0 ** ((np.asarray(m, float) - 69.0) / 12.0)


_PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def nm(name):
    """Note name → MIDI number: 'A4' → 69, 'F#3' → 54, 'Bb1' → 34."""
    pc, rest = _PC[name[0]], name[1:]
    if rest[:1] in ('#', 'b'):
        pc += 1 if rest[0] == '#' else -1
        rest = rest[1:]
    return 12 * (int(rest) + 1) + pc


def notes(s):
    return [nm(x) for x in s.split()]


def hz(name):
    return float(mtof(nm(name)))


def rng(*key):
    """Seeded generator per named use, so an edit in one place never reshuffles another."""
    return np.random.default_rng([SEED, zlib.crc32(repr(key).encode())])


def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def ease_out(x, p=3.0):
    return 1.0 - (1.0 - np.clip(x, 0.0, 1.0)) ** p


# ════════════════════════════════════════════════════════════════════════════
# 2. DSP utilities
# ════════════════════════════════════════════════════════════════════════════
# ── envelopes ───────────────────────────────────────────────────────────────
def decay(t, tau):
    """exp(−t/τ), with the argument bounded (keeps numpy off its denormal slow path)."""
    return np.exp(-np.minimum(np.maximum(t, 0.0) / tau, 80.0))


def fade(x, a=0.002, r=0.004):
    """Raised-cosine fade-in/out (seconds) on the last axis; the first and last samples are 0.
    Every generator ends with one of these, ≥ 1 ms each way: no sound starts or stops on a step."""
    x = np.array(x, dtype=float, copy=True)
    n = x.shape[-1]
    na, nr = min(n, max(48, smp(a))), min(n, max(48, smp(r)))
    x[..., :na] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(na) / na)
    x[..., n - nr:] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(nr) + 1) / nr)
    return x


def burst_env(t, t0, attack, dec):
    """Raised-cosine attack (≥ 1 ms) at t0 followed by an exponential decay."""
    attack = max(attack, 0.001)
    tt = t - t0
    a = 0.5 - 0.5 * np.cos(np.pi * np.clip(tt / attack, 0.0, 1.0))
    return np.where(tt >= 0.0, a * decay(tt - attack, dec), 0.0)


def exp_curve(u, k):
    """0→1 exponential-ish curve; k > 0 eases in."""
    u = np.clip(u, 0.0, 1.0)
    return (np.exp(k * u) - 1.0) / (np.exp(k) - 1.0)


def automation(points, n, t0=0.0):
    """Linear gain from breakpoints [(absolute time s, dB)], interpolated in dB,
    for a signal of n samples that starts at absolute time t0."""
    pt = np.array([p[0] for p in points], float)
    pv = np.array([p[1] for p in points], float)
    return db2lin(np.interp(t0 + tvec(n), pt, pv))


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


def _wrap(c):
    return c - np.floor(c)


def osc_sine(f, n, phase0=0.0):
    """Sine (phase reduced to one cycle first: exact and on numpy's fast path)."""
    return np.sin(TAU * _wrap(cycles(f, n, phase0)))


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
    t = _wrap(cycles(f, n, phase0))
    return 2.0 * t - 1.0 - _blep(t, _dt(f, n))


def osc_square(f, n, phase0=0.0, pw=0.5):
    """PolyBLEP pulse, alias-suppressed."""
    t = _wrap(cycles(f, n, phase0))
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
    """RBJ cookbook biquad → one sos row."""
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
    """Zavalishin/Simper TPT state-variable filter with a per-sample cutoff.

    Used for every filter *sweep* (whooshes, risers, scans): unlike a biquad
    with swapped coefficients it stays click-free under fast modulation.
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


def saturate(x, drive=1.5, oversample=2):
    """tanh soft clip, oversampled so the added harmonics do not alias."""
    if oversample > 1:
        up = sps.resample_poly(x, oversample, 1, axis=-1)
        up = np.tanh(drive * up) / np.tanh(drive)
        return sps.resample_poly(up, 1, oversample, axis=-1)[..., :x.shape[-1]]
    return np.tanh(drive * x) / np.tanh(drive)


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
    """Mid/side width: 0 mono, 1 unchanged, > 1 wider."""
    m, s = 0.5 * (st[0] + st[1]), 0.5 * (st[0] - st[1]) * w
    return np.stack([m + s, m - s])


def chorus(st, key, rate=0.17, depth=0.0022, base=0.012, mix=0.33):
    """Two slowly modulated fractional delays (one per side) for width and life."""
    n = st.shape[1]
    t, idx = tvec(n), np.arange(n, dtype=float)
    r = rng('chorus', key)
    out = np.empty_like(st)
    for c in range(2):
        d = (base + depth * np.sin(TAU * rate * (1.0 + 0.21 * c) * t + r.uniform(0, TAU))) * SR
        wet = np.interp(idx - d, idx, st[c], left=0.0)
        out[c] = st[c] * (1.0 - mix) + wet * mix
    return out


def echoes(sig, delay, reps, fb_db, pans, lp=3000.0):
    """Explicit feedback-delay taps → [(offset s, stereo)], each repeat a little darker."""
    mono = sig if sig.ndim == 1 else sig.mean(0)
    out = []
    for k in range(1, reps + 1):
        mono = lpf(mono, lp, 1)
        out.append((delay * k, pan_mono(mono * db2lin(fb_db * k), pans[(k - 1) % len(pans)])))
    return out


# ── convolution reverb ──────────────────────────────────────────────────────
def make_ir(rt60, length, predelay=0.015, key='hall', lo_x=1.15, hi_x=0.5, damp=6500.0,
            diffusion=0.012, early=12):
    """Generated stereo impulse response: decorrelated noise per side split into
    three bands with their own RT60 (air absorption: highs die first), a soft
    diffusion build-up, early reflections, pre-delay and a tail fade. Unit
    energy per channel so send levels are predictable."""
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
        chans.append(fade(ir, 0.0005, min(0.5, length * 0.25)))
    ir = np.stack(chans)
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def reverb(x, ir):
    """Stereo convolution with a little cross-feed so panned sources bloom in both sides."""
    n = x.shape[1]
    ins = (0.75 * x[0] + 0.25 * x[1], 0.25 * x[0] + 0.75 * x[1])
    return np.stack([sps.oaconvolve(ins[c], ir[c])[:n] for c in range(2)])


# ── dynamics ────────────────────────────────────────────────────────────────
def _smooth_gr(target, attack, release, step):
    """One-pole attack/release smoothing of a gain-reduction curve (dB, ≥ 0)."""
    aa = np.exp(-step / (attack * SR))
    ar = np.exp(-step / (release * SR))
    out, s = [], 0.0
    for v in target.tolist():
        c = aa if v > s else ar
        s = c * s + (1.0 - c) * v
        out.append(s)
    return np.asarray(out)


def compressor(x, thresh_db, ratio=2.0, attack=0.02, release=0.25, knee_db=8.0, sc_hpf=None, block=64):
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
                  np.where(over >= knee_db / 2, slope * over, slope * (over + knee_db / 2) ** 2 / (2 * knee_db)))
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


def limiter(x, ceiling_db=LIMIT_DBTP, lookahead=0.0015, release=0.18):
    """Look-ahead true-peak limiter: required gain from the oversampled peak
    envelope → sliding minimum over ±lookahead → program-dependent release →
    centred moving average of the same width (never above the requirement at
    a peak, so the ceiling holds while the gain moves smoothly)."""
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


def duck_env(times, depth_db, release, n=N, pre=0.002, attack=0.004):
    """Sidechain gain curve: dips `depth_db` at each time with an S-curve recovery."""
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
    p = y ** 2
    cs = np.concatenate([np.zeros(p.shape[:-1] + (1,)), np.cumsum(p, axis=-1)], axis=-1)
    w, h = smp(win), smp(hop)
    starts = np.arange(0, p.shape[-1] - w + 1, h)
    z = (cs[..., starts + w] - cs[..., starts]) / w
    return starts, (z.sum(0) if z.ndim == 2 else z)


def lufs(x):
    """Integrated loudness with absolute (−70 LUFS) and relative (−10 LU) gating."""
    _, z = _block_power(x, 0.4, 0.1)
    lv = -0.691 + 10 * np.log10(z + 1e-20)
    m = lv > -70.0
    if not m.any():
        return -np.inf
    rel = -0.691 + 10 * np.log10(z[m].mean()) - 10.0
    m &= lv > rel
    return float(-0.691 + 10 * np.log10(z[m].mean()))


def loudness_curve(x, win=0.4, hop=0.05):
    """Momentary (0.4 s) or short-term (3 s) loudness, block-centred times."""
    starts, z = _block_power(x, win, hop)
    return (starts + smp(win) / 2) / SR, -0.691 + 10 * np.log10(z + 1e-20)


# ════════════════════════════════════════════════════════════════════════════
# 3. Instruments (all return float arrays, mono (n,) or stereo (2, n))
# ════════════════════════════════════════════════════════════════════════════
# ── 3a. The copper cup's voice ──────────────────────────────────────────────
# A struck singing bowl is a thin shell ringing in its (n, 0) bending modes,
# n = 2…7. Measured bowls sit a little under the ideal ring's
# n(n²−1)/√(n²+1) law; these ratios are typical of hand-raised bowls. Every
# mode is a *doublet*: the bowl's slight asymmetry splits it into two members
# a fraction of a hertz to a few hertz apart, and their beating is the slow
# "wah-wah" shimmer of a real bowl. Higher modes lose energy faster.
BOWL_RATIOS = (1.000, 2.745, 5.210, 8.370, 12.20, 16.60)
BOWL_AMPS = (1.000, 0.660, 0.420, 0.270, 0.160, 0.090)
BOWL_SPLIT = (0.68, 1.52, 2.40, 3.25, 4.30, 5.40)      # doublet split (Hz) at D4; scales with √f0


def bowl(f0, dur, ring=5.0, hardness=1.0, key=0, width=0.45, clang=1.0, thump=1.0, split=1.0,
         attack=0.0018, beat_depth=1.0):
    """The copper cup's voice: modal synthesis of a struck singing bowl.

    * six (n, 0) modes at bowl ratios 1 : 2.745 : 5.21 : 8.37 : 12.2 : 16.6;
    * each mode a doublet, the two members `split` × BOWL_SPLIT Hz apart with
      unequal strength and slightly different decay, so they beat slowly
      (≈ 0.7 Hz on the fundamental) and never cancel. The members radiate to
      opposite sides, so the beating also turns slowly in the stereo field
      while the mono sum keeps it. `beat_depth` scales the weaker member
      (the finale's chord beats more gently: the story has settled);
    * decay τ_k = ring · ratio_k^−0.72: a long fundamental, shimmering upper
      partials that fade first;
    * a soft felt mallet: mode excitation weighted exp(−(f/fc)^1.5) with
      fc = 3 kHz × hardness (a soft mallet cannot excite the top modes), a
      1.8 ms raised-cosine contact, a low-passed felt thump, and a dozen
      short inharmonic "clang" modes (the strike's metallic complexity, gone
      within ~80 ms).
    Returns stereo, peak-normalised."""
    n = smp(dur)
    t = tvec(n)
    r = rng('bowl', key, round(float(f0), 3))
    st = np.zeros((2, n))
    fc = 3000.0 * hardness
    sc = (f0 / 293.66) ** 0.5
    for k, (ratio, amp, dsp) in enumerate(zip(BOWL_RATIOS, BOWL_AMPS, BOWL_SPLIT)):
        fk = f0 * ratio
        if fk > 7000.0:
            break
        w = np.exp(-(fk / fc) ** 1.3)
        tau = ring * ratio ** -0.72
        d = dsp * split * sc
        rho = r.uniform(0.6, 0.88) * beat_depth
        p = width * (1.0 if k % 2 == 0 else -1.0) * r.uniform(0.75, 1.0)
        for df, g, pp, tt in ((-d / 2, 1.0, -p, tau * 1.06), (d / 2, rho, p, tau * 0.94)):
            s = osc_sine(fk + df, n, r.random()) * decay(t, tt)
            st += pan_mono(s * (amp * w * g), pp)
    # the strike: short inharmonic clang modes (first 0.4 s only)
    m = min(n, smp(0.4))
    tm = t[:m]
    top = max(1.5 * f0, min(9.0 * f0, 5600.0))
    for _j in range(12):
        fj = float(np.exp(r.uniform(np.log(1.35 * f0), np.log(top))))
        wj = np.exp(-(fj / fc) ** 1.3)
        s = osc_sine(fj, m, r.random()) * decay(tm, r.uniform(0.012, 0.07)) * r.uniform(0.25, 0.6) * wj
        st[:, :m] += pan_mono(s * 0.33 * clang, r.uniform(-0.5, 0.5))
    # felt mallet thump
    mt = min(n, smp(0.06))
    th = lpf(r.standard_normal(mt), 900.0 * hardness, 2) * burst_env(tvec(mt), 0.0, 0.0015, 0.006)
    st[:, :mt] += th / (np.max(np.abs(th)) + 1e-12) * 0.12 * thump
    st = fade(st, attack, min(0.3, dur * 0.1))
    return st / (np.max(np.abs(st)) + 1e-12)


def cup(name, dur, **kw):
    return bowl(hz(name), dur, **kw)


# ── 3b. Keys ────────────────────────────────────────────────────────────────
def felt_piano(midi, vel=0.4, dur=4.0, key=0, damp=None):
    """Felt piano (a felt strip between hammer and strings: dark, intimate).

    Additive: stretched partials f_k = k·f0·√(1 + B·k²) (B grows up the
    keyboard), a dark felt-hammer spectrum k^−1.05·exp(−(f/fc)^1.35) with fc
    following velocity and a strike-position comb, two or three unison strings
    per note starting in phase and detuned by ~1 cent. Their drift out of phase
    gives the piano's two-stage decay (a quick 'prompt' sound, then the long
    'aftersound'), modelled per partial as a beating prompt term plus a slow
    one. A low-passed felt-hammer and key-bed noise, a 3 ms attack, and damper
    release at `damp` (seconds from the strike) when the pedal changes."""
    f0 = float(mtof(midi))
    n = smp(dur)
    t = tvec(n)
    r = rng('piano', key, midi)
    B = 0.00011 * 2.0 ** ((midi - 48) / 14.0)
    fc = 650.0 + 2300.0 * vel
    tau1 = float(np.clip(5.5 * (196.0 / f0) ** 0.55, 1.2, 9.0))
    dc = 0.9 if midi >= 46 else 0.6                     # unison detune (cents)
    dec_step = 32                                       # envelopes at 1.5 kHz, interpolated
    td = t[::dec_step]
    x = np.zeros(n)
    norm = 0.0
    for k in range(1, 30):
        fk = k * f0 * np.sqrt(1.0 + B * k * k)
        if fk > 4500.0:
            break
        a = k ** -1.05 * np.exp(-(fk / fc) ** 1.35) * (0.3 + 0.7 * abs(np.sin(np.pi * k / 8.3)))
        tau = tau1 / (1.0 + 0.32 * (k - 1)) ** 0.85
        beat = fk * (2.0 ** (dc * r.uniform(0.7, 1.3) / 1200.0) - 1.0)
        env = 0.62 * np.cos(np.pi * beat * td) * decay(td, 0.22 * tau) + 0.38 * decay(td, tau)
        x += a * osc_sine(fk, n, r.random()) * np.interp(t, td, env)
        norm += a * a
    x /= np.sqrt(norm) * 1.6
    nh = min(n, smp(0.08))
    th = tvec(nh)
    ham = lpf(hpf(r.standard_normal(nh), 180.0), 700.0 + 1500.0 * vel) * burst_env(th, 0.0, 0.002, 0.012)
    x[:nh] += 0.05 * ham / (np.std(ham) * 4 + 1e-12)
    knock = osc_sine(95.0, nh) * burst_env(th, 0.0, 0.002, 0.018)
    x[:nh] += 0.03 * knock
    if damp is not None and damp < dur:
        x *= np.where(t < damp, 1.0, decay(t - damp, 0.11))
    return fade(x * vel ** 1.1, 0.003, 0.05)


def mallet(freq, dur=0.9, vel=0.8, key=0, decay_s=None, trem=0.1):
    """Warm FM mallet (vibraphone-like bar with a felt mallet): 1:1 FM whose
    index falls in ~20 ms (the strike's bloom), the bar's tuned 4th partial
    dying fast, a hint of motor tremolo, and a low-passed felt thump."""
    n = smp(dur)
    t = tvec(n)
    r = rng('mallet', key)
    tau = decay_s or float(0.85 * (440.0 / freq) ** 0.35)
    ph = TAU * cycles(freq * (1.0 + 0.004 * decay(t, 0.01)), n, r.random())
    idx = (0.2 + 0.7 * vel) * decay(t, 0.02) + 0.06
    x = np.sin(ph + idx * np.sin(ph)) * decay(t, tau)
    if 4.0 * freq < 6000.0:
        x += 0.20 * vel * np.sin(4.0 * ph) * decay(t, min(tau, 0.08))
    if 10.0 * freq < 6500.0:
        x += 0.05 * vel * np.sin(10.0 * ph) * decay(t, 0.015)
    x *= 1.0 - trem * (0.5 - 0.5 * np.cos(TAU * 4.7 * t)) * smoothstep(t / 0.2)
    x += 0.10 * vel * lpf(r.standard_normal(n), 2200.0) * burst_env(t, 0.0, 0.001, 0.004)
    return fade(hpf(x, 110.0), 0.0012, 0.04) * vel


def fm_bell(freq, dur=1.5, ratio=3.5, index=1.8, dec=0.6):
    """FM bell/glass. The index is capped so sidebands stay under ~6.5 kHz."""
    n = smp(dur)
    t = tvec(n)
    i_max = max(0.0, (6500.0 - freq) / (freq * ratio) - 1.0)
    idx = min(index, i_max) * decay(t, dec * 0.35)
    x = np.sin(TAU * _wrap(freq * t) + idx * np.sin(TAU * _wrap(freq * ratio * t))) * decay(t, dec)
    return fade(lpf(x, 7000.0), 0.0015, 0.02)


def glass(freq, dur=0.6, dec=0.25, index=0.5, ratio=1.4142):
    """Glassy ping: sine with a little inharmonic FM that dies quickly."""
    n = smp(dur)
    t = tvec(n)
    idx = index * decay(t, dec * 0.3)
    x = np.sin(TAU * _wrap(freq * t) + idx * np.sin(TAU * _wrap(freq * ratio * t))) * decay(t, dec)
    return fade(lpf(x, 7000.0), 0.0012, 0.02)


def warm_bell(f0, dur=4.0, key=0):
    """The hand-off bell: a 1:1 FM 'tine' (warm, harmonic) fused with the cup's
    own bowl voice an octave up, so the ember still sounds like the cup."""
    n = smp(dur)
    t = tvec(n)
    idx = 1.1 * decay(t, 0.3) + 0.12
    ph = TAU * _wrap(f0 * t)
    tine = np.sin(ph + idx * np.sin(ph)) * decay(t, 1.8)
    st = pan_mono(tine * 0.8, 0.0) + 0.6 * bowl(f0, dur, ring=3.2, hardness=0.75, key=('warm', key), width=0.35)
    return fade(lpf(st, 6500.0), 0.0015, 0.2)


# ── 3c. Pads, bass & sub ────────────────────────────────────────────────────
def warm_pad(midis, dur, key, cut_lo=480.0, cut_hi=1500.0, lfo=0.09, detune=8.0, voices=3, hp=110.0,
             spread=0.7, attack=0.4, release=0.4, body=0.35):
    """Warm low pad: per note `voices` PolyBLEP saws detuned ±`detune` cents with
    slow independent drift, plus a sine body; spread across the field. The slow
    movement is a crossfade between a dark and a brighter 24 dB/oct low-pass
    of the same voices (an LTI 'filter sweep' that can never click), then a
    high-pass, a 300 Hz dip against mud and a light chorus. RMS-normalised."""
    n = smp(dur)
    t = tvec(n)
    r = rng('pad', key)
    out = np.zeros((2, n))
    count = 0
    for j, m in enumerate(midis):
        f = float(mtof(m))
        for v in range(voices):
            u = 0.0 if voices == 1 else v / (voices - 1) * 2.0 - 1.0
            drift = 1.0 + 0.0010 * np.sin(TAU * r.uniform(0.05, 0.16) * t + r.uniform(0, TAU))
            s = osc_saw(f * 2 ** (u * detune / 1200) * drift, n, r.random())
            out += pan_mono(s, float(np.clip(u * spread + 0.2 * (-1) ** j, -1, 1)))
            count += 1
        out += pan_mono(osc_sine(f, n, r.random()) * body * voices, 0.25 * (-1) ** j)
    out /= np.sqrt(count)
    dark, bright = lpf(out, cut_lo, 4), lpf(out, cut_hi, 4)
    w = 0.5 - 0.5 * np.cos(TAU * lfo * t + r.uniform(0, TAU))
    out = dark * (1.0 - w) + bright * w
    out = eq(hpf(out, hp, 2), 'peak', 300.0, -3.5, 0.9)
    out = chorus(out, ('pad', key))
    out /= np.sqrt(np.mean(out ** 2)) * 4.0 + 1e-12          # RMS 0.25
    return fade(out, attack, release)


def sub_drone(f, dur, h2=0.35, breathe=0.06):
    """Deep, clean sub: a sine on the root with a soft octave (for small
    speakers) and a slow breath."""
    n = smp(dur)
    t = tvec(n)
    x = osc_sine(f, n) + h2 * osc_sine(2 * f, n, 0.25) + 0.05 * osc_sine(3 * f, n, 0.1)
    return x * (1.0 + breathe * np.sin(TAU * 0.21 * t))


def bass_pulse(f, length=0.26, vel=1.0):
    """Off-beat bass pulse: clean sine body with a pinch of 2nd/3rd harmonic,
    a 6 ms attack, gentle decay and a 30 ms release, low-passed."""
    n = smp(length + 0.04)
    t = tvec(n)
    x = osc_sine(f * (1.0 + 0.015 * decay(t, 0.012)), n) + 0.30 * osc_sine(2 * f, n) + 0.10 * osc_sine(3 * f, n)
    x = saturate(0.8 * x, 1.3) * decay(t, 0.32)
    i1, rl = smp(length), smp(0.03)
    x[i1 - rl:i1] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(rl) + 1) / rl)
    x[i1:] = 0.0
    return fade(lpf(x, 600.0), 0.006, 0.002) * vel


def boom(f_start, f_end, dur, pitch_tau=0.08, dec=0.6, drive=1.6):
    """Sub boom: sine with an exponential pitch fall, gently saturated so its
    octave carries on small speakers, low-passed."""
    n = smp(dur)
    t = tvec(n)
    f = f_end + (f_start - f_end) * decay(t, pitch_tau)
    x = saturate(osc_sine(f, n) * decay(t, dec), drive)
    return fade(lpf(x, 500.0), 0.002, min(0.3, dur * 0.3))


# ── 3d. Workshop percussion ─────────────────────────────────────────────────
KICK_STYLES = {
    #          top Hz, end Hz, pitch τ, amp τ, length, felt
    'groove': (112.0, 56.0, 0.028, 0.160, 0.45, 0.30),
    'accent': (122.0, 55.0, 0.032, 0.220, 0.60, 0.28),
    'heart': (100.0, 52.0, 0.030, 0.200, 0.50, 0.12),
    'impact': (132.0, 46.0, 0.050, 0.180, 0.80, 0.25),
}


def felt_kick(style='groove'):
    """Soft felt kick: a sine whose pitch settles from ~115 to 56 Hz, a warm
    oversampled tanh (weight on small speakers, a lower crest factor) and a
    felt beater (400 Hz–2.6 kHz noise, 1.2 ms raised-cosine attack, 4 ms decay):
    a rounded thud with just enough definition, never a click. A 30 Hz
    high-pass keeps the sub clean and a 300 Hz dip keeps it out of the mud."""
    f_top, f_end, p_tau, a_tau, dur, felt = KICK_STYLES[style]
    n = smp(dur)
    t = tvec(n)
    f = f_end + (f_top - f_end) * decay(t, p_tau)
    body = saturate(osc_sine(f, n) * decay(t, a_tau), 2.2)
    beater = lpf(hpf(rng('kick', style).standard_normal(n), 400.0), 2600.0, 2) * burst_env(t, 0.0, 0.0012, 0.004)
    x = body + felt * beater / (np.max(np.abs(beater)) + 1e-12)
    x = fade(eq(hpf(x, 30.0), 'peak', 300.0, -4.0, 1.0), 0.0015, 0.04)      # no boxiness from the saturation
    return x / np.max(np.abs(x))


def shaker(key=0):
    """Soft shaker: band-passed noise, a 5 ms 'swing' of the beads, 25 ms decay."""
    n = smp(0.11)
    t = tvec(n)
    r = rng('shaker', key)
    x = bpf(r.standard_normal(n), 2800.0, 7800.0, 2) * burst_env(t, 0.0, 0.005, 0.025)
    x = lpf(x, 8500.0)
    x = fade(x, 0.001, 0.01)
    return x / np.max(np.abs(x))


def anvil(f0=880.0, key=0, bright=1.0):
    """Anvil tap with a small hammer: a few inharmonic bar-like modes
    (1 : 1.52 : 2.756 : 5.40) ringing briefly, with a band-passed tap."""
    n = smp(0.9)
    t = tvec(n)
    r = rng('anvil', key)
    x = np.zeros(n)
    for ratio, a, tau in ((1.0, 1.0, 0.40), (1.52, 0.14, 0.08), (2.756, 0.45 * bright, 0.13), (5.40, 0.18 * bright, 0.05)):
        f = f0 * ratio * (1.0 + r.uniform(-0.002, 0.002))
        if f < 6200.0:
            x += a * osc_sine(f, n, r.random()) * decay(t, tau)
    x += 0.35 * bpf(r.standard_normal(n), 1500.0, 5000.0) * burst_env(t, 0.0, 0.0015, 0.0025)
    x = fade(x, 0.0015, 0.05)
    return x / np.max(np.abs(x))


def hammer_tick(key=0):
    """Hand-hammer tick: a tiny metal ping over a wooden knock."""
    n = smp(0.08)
    t = tvec(n)
    r = rng('hammer', key)
    x = osc_sine(2350.0 * (1 + r.uniform(-0.02, 0.02)), n) * decay(t, 0.010) \
        + 0.5 * osc_sine(3900.0 * (1 + r.uniform(-0.02, 0.02)), n) * decay(t, 0.005) \
        + 0.35 * osc_sine(620.0, n) * decay(t, 0.012) \
        + 0.4 * bpf(r.standard_normal(n), 1800.0, 5500.0) * decay(t, 0.002)
    x = fade(x, 0.001, 0.01)
    return x / np.max(np.abs(x))


# ── 3e. Sound design ────────────────────────────────────────────────────────
def room_tone(dur, key='room'):
    """Workshop room tone: decorrelated pink noise (70 Hz–1.8 kHz) with a
    faint air band, breathing very slowly. RMS-normalised."""
    n = smp(dur)
    t = tvec(n)
    out = []
    for c in range(2):
        r = rng(key, c)
        out.append(lpf(hpf(pink(n, r), 70.0), 1800.0) + 0.25 * bpf(pink(n, r), 2500.0, 6000.0))
    st = np.stack(out) * (1.0 + 0.18 * np.sin(TAU * 0.13 * t + 1.0))
    return st / np.sqrt(np.mean(st ** 2))


def dust(dur, key, notes_, rate=2.5, spread_db=8.0):
    """Airy dust in the light shaft: sparse, very soft glass glints on scale
    tones at random places in the field, over a faint moving air band."""
    n = smp(dur)
    out = np.zeros((2, n))
    r = rng('dust', key)
    tt = 0.05
    while True:
        tt += r.exponential(1.0 / rate)
        if tt > dur - 0.45:
            break
        g = glass(float(mtof(r.choice(notes_))), 0.4, r.uniform(0.05, 0.14), index=r.uniform(0.1, 0.4))
        i = smp(tt)
        L = min(n - i, g.size)
        out[:, i:i + L] += pan_mono(g[:L] * db2lin(-r.uniform(0, spread_db)), r.uniform(-0.8, 0.8))
    air = np.stack([bpf(pink(n, rng('dust air', key, c)), 3000.0, 6000.0) for c in range(2)]) * 0.06
    return fade(out + air, 0.3, 0.3)


def rim_shimmer(dur=1.0, key=0, notes_=('A6', 'D7', 'E7', 'A7'), pan0=-0.7, pan1=0.7, peak=0.35):
    """The light tracing the rim: a delicate cluster of high glassy partials
    with a fast shimmer, and a narrow band of air that climbs as the glint
    travels, panned across the lip from left to right."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('rim', key)
    env = smoothstep(u / peak) * (1.0 - smoothstep((u - peak) / (1.0 - peak))) ** 1.5
    x = np.zeros(n)
    for i, m in enumerate(notes_):
        trem = 0.55 + 0.45 * np.sin(TAU * _wrap(cycles(r.uniform(9, 15), n, r.random()))) ** 2
        x += 0.8 ** i * osc_sine(hz(m) * (1 + 0.0015 * np.sin(TAU * r.uniform(3, 6) * t)), n, r.random()) * trem
    glint = svf(pink(n, r), 2500.0 + 2500.0 * u, 3.0, 'bp') * 0.5
    x = lpf((x / len(notes_) + glint) * env, 6000.0)
    return fade(pan_mono(x, pan0 + (pan1 - pan0) * smoothstep(u)), 0.01, 0.02)


def crackle(dur, key=0, rate=110.0, dec=0.22, lo=900.0, hi=5200.0, ignite=1.0):
    """Ember crackle: Poisson grains (2.5 ms Hann bumps) gating band-passed
    noise, thinning out, over a soft band-passed ignition 'pff'."""
    n = smp(dur)
    t = tvec(n)
    r = rng('crackle', key)
    lam = rate * decay(t, dec)
    imp = (r.random(n) < lam / SR) * r.lognormal(0.0, 0.6, n)
    g = smp(0.0025)
    bumps = np.convolve(imp, np.hanning(g + 2)[1:-1], mode='full')[:n]
    x = bpf(r.standard_normal(n), lo, hi, 2) * bumps
    x += ignite * 0.6 * bpf(r.standard_normal(n), 400.0, 2500.0) * burst_env(t, 0.0, 0.0015, 0.03)
    x = lpf(x, 6000.0)
    return fade(x / (np.max(np.abs(x)) + 1e-12), 0.0015, 0.03)


def spark_trail(dur, key=0, phase=0.0, rate=0.42):
    """A spark orbiting the cup: a thin crackle trail whose pan circles the
    field (and is a touch louder on the near side)."""
    n = smp(dur)
    t = tvec(n)
    x = crackle(dur, ('trail', key), rate=26.0, dec=100.0, lo=1500.0, hi=5000.0, ignite=0.0)
    ang = TAU * rate * t + phase
    x = x * (0.65 + 0.35 * np.cos(ang)) * smoothstep(t / 0.25)
    return fade(pan_mono(x, 0.75 * np.sin(ang)), 0.05, 0.12)


def scan_shimmer(dur=0.9, key=0, sweep=0.6, up=False):
    """The glassy scan line: a narrow resonant band of air sweeping down the
    cup (5.2 kHz → 900 Hz) over two glass partials that flicker at 16 Hz like
    a scan line. `up` reverses the sweep and swells into the end instead."""
    n = smp(dur)
    t = tvec(n)
    r = rng('scan', key, up)
    s = np.clip(t / sweep, 0.0, 1.0)
    if up:
        s = 1.0 - np.clip((t - (dur - sweep)) / sweep, 0.0, 1.0)
    fc = 5200.0 * (900.0 / 5200.0) ** smoothstep(s)
    band = svf(pink(n, r), fc, 5.0, 'bp')
    tones = 0.5 * osc_sine(hz('A6'), n, r.random()) + 0.35 * osc_sine(hz('E7'), n, r.random())
    flick = 0.6 + 0.4 * (0.5 + 0.5 * np.sin(TAU * 16.0 * t))
    x = band + 0.6 * tones * flick
    if up:
        env = exp_curve(t / dur, 3.0)
    else:
        env = burst_env(t, 0.0, 0.004, 10.0) * np.where(t < sweep, 1.0, decay(t - sweep, 0.12))
    return fade(pan_mono(lpf(x * env, 6000.0), 0.0), 0.004, 0.03)


def data_tick(freq, key=0, tau=0.003, noise=0.15):
    """A tiny soft data tick: a decaying sine and a breath of band-passed noise."""
    n = smp(0.04)
    t = tvec(n)
    nz = bpf(rng('tick', key).standard_normal(n), 2000.0, 6000.0)
    x = osc_sine(freq, n) * decay(t, tau) + noise * nz * decay(t, tau * 0.5)
    return fade(x, 0.001, 0.008)


def servo(dur, f0, f1, key=0, accel=0.25, decel=0.3):
    """Robotic-hand servo whir: a PolyBLEP saw motor whose pitch follows the
    move's speed profile (accelerate → cruise → settle), band-passed, with a
    gear-mesh whine at 6.5× and a tooth ripple at f/4, plus a little air."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('servo', key)
    sp = smoothstep(u / accel) * (1.0 - smoothstep((u - (1.0 - decel)) / decel))
    f = f0 + (f1 - f0) * sp
    body = bpf(osc_saw(f, n, r.random()), 250.0, 2400.0, 2)
    whine = 0.3 * osc_sine(np.minimum(f * 6.5, 5000.0), n, r.random())
    ripple = 1.0 + 0.25 * np.sin(TAU * _wrap(cycles(f / 4.0, n)))
    air = 0.15 * bpf(r.standard_normal(n), 800.0, 4000.0)
    x = (body * ripple + whine + air) * (0.25 + 0.75 * sp)
    return fade(x / (np.max(np.abs(x)) + 1e-12), 0.03, 0.05)


def grip_clack(key=0):
    """The fingers closing on the cup: two soft mechanical contacts 16 ms
    apart, small metal resonances, and the cup answering with a damped tink."""
    n = smp(0.3)
    t = tvec(n)
    r = rng('grip', key)
    x = np.zeros(n)
    nz = r.standard_normal(n)
    for off, g in ((0.0, 1.0), (0.016, 0.6)):
        x += g * bpf(nz, 700.0, 4200.0) * burst_env(t, off, 0.001, 0.004)
        x += g * 0.5 * osc_sine(1320.0, n) * burst_env(t, off, 0.001, 0.012)
        x += g * 0.3 * osc_sine(2870.0, n) * burst_env(t, off, 0.001, 0.007)
    x += 0.25 * osc_sine(hz('D6'), n) * burst_env(t, 0.0, 0.0015, 0.08)
    x += 0.10 * osc_sine(hz('D6') * 2.745, n) * burst_env(t, 0.0, 0.0015, 0.04)
    x += 0.30 * osc_sine(160.0, n) * burst_env(t, 0.0, 0.002, 0.02)
    x = fade(lpf(x, 6000.0), 0.001, 0.03)
    return x / np.max(np.abs(x))


def slide(dur=0.35, key=0, pan0=0.0, pan1=0.6):
    """A cup sliding out of another 'like a reflection separating': a smooth
    band of air gliding up with a faint metallic sheen, panned outward."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('slide', key)
    band = svf(pink(n, r), 900.0 * (2600.0 / 900.0) ** smoothstep(u), 2.2, 'bp')
    sheen = 0.25 * osc_sine(hz('A6') * (1.0 + 0.03 * u), n, r.random())
    env = smoothstep(u / 0.2) * (1.0 - smoothstep((u - 0.45) / 0.55))
    return fade(pan_mono(lpf((band + sheen) * env, 6000.0), pan0 + (pan1 - pan0) * smoothstep(u)), 0.01, 0.02)


def paper_flick(dur, key=0):
    """A paper slip: band-passed noise with a fast flutter (the slip fluttering
    as it falls), a 6 ms swell and a quick fade."""
    n = smp(dur)
    t = tvec(n)
    r = rng('paper', key)
    nz = bpf(r.standard_normal(n), 900.0, 5500.0)
    fl = (0.5 + 0.5 * np.sin(TAU * _wrap(cycles(r.uniform(28, 55) * (1.0 - 0.4 * t / dur), n)))) ** 2
    x = nz * (0.35 + 0.65 * fl) * burst_env(t, 0.0, 0.006, dur * 0.35)
    return fade(lpf(x, 6000.0), 0.002, 0.01)


def sort_tick(key=0):
    """Card-sorting tick: a small wooden tick with a paper tap."""
    n = smp(0.06)
    t = tvec(n)
    r = rng('sort', key)
    x = osc_sine(1650.0 * (1 + r.uniform(-0.03, 0.03)), n) * decay(t, 0.006) \
        + 0.4 * bpf(r.standard_normal(n), 2000.0, 5000.0) * decay(t, 0.0015) \
        + 0.3 * osc_sine(430.0, n) * decay(t, 0.01)
    return fade(x, 0.001, 0.01)


def focus_beep(freq=1760.0, dur=0.05):
    """Camera focus-confirm beep: a soft sine with a whisper of its octave."""
    n = smp(dur)
    x = osc_sine(freq, n) + 0.08 * osc_sine(2 * freq, n)
    return fade(x, 0.002, 0.012)


def shutter(key=0):
    """A soft mechanical shutter: first curtain, second curtain 45 ms later,
    each a band-passed snap exciting two small resonances; a faint spring."""
    n = smp(0.25)
    t = tvec(n)
    r = rng('shutter', key)
    nz = r.standard_normal(n)
    x = np.zeros(n)
    for off, g, f1, f2 in ((0.0, 1.0, 2200.0, 760.0), (0.045, 0.7, 2500.0, 820.0)):
        x += g * bpf(nz, 1200.0, 5500.0) * burst_env(t, off, 0.001, 0.003)
        x += g * 0.35 * osc_sine(f1, n) * burst_env(t, off, 0.001, 0.010)
        x += g * 0.45 * osc_sine(f2, n) * burst_env(t, off, 0.001, 0.015)
    x += 0.06 * osc_sine(3100.0, n) * burst_env(t, 0.045, 0.002, 0.025)
    x = fade(x, 0.001, 0.02)
    return x / np.max(np.abs(x))


def soil_crunch(dur=0.55, key=0):
    """Dark soil pouring into the cup: granular crumbs (2–10 ms grains of noise
    in random bands, thinning out) over a soft low 'pour'."""
    n = smp(dur)
    t = tvec(n)
    r = rng('soil', key)
    x = np.zeros(n)
    tt = 0.0
    while True:
        tt += r.exponential(1.0 / (320.0 * float(np.exp(-tt / 0.3)) + 20.0))
        if tt > dur - 0.02:
            break
        L = smp(r.uniform(0.002, 0.010))
        lo = r.uniform(300.0, 1800.0)
        gr = bpf(r.standard_normal(L + 64), lo, lo * r.uniform(1.8, 3.5))[64:] * np.hanning(L)
        i = smp(tt)
        L = min(L, n - i)
        x[i:i + L] += gr[:L] * r.lognormal(0.0, 0.5)
    pour = lpf(hpf(r.standard_normal(n), 220.0), 900.0) * burst_env(t, 0.0, 0.03, dur * 0.4) * 0.4
    x = lpf(x + pour, 5500.0)
    return fade(x / (np.max(np.abs(x)) + 1e-12), 0.002, 0.03)


def sprout(dur=0.6, key=0):
    """The seedling unfurling: a soft tone gliding up D4 → A5 (ease-out, like
    a stem reaching) that blooms into a D-minor cluster swelling in."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('sprout', key)
    f = hz('D4') * (hz('A5') / hz('D4')) ** ease_out(u / 0.8, 2.5)
    ph = TAU * _wrap(cycles(f, n))
    stem = (np.sin(ph + 0.3 * np.sin(2 * ph)) + 0.2 * np.sin(2 * ph)) * (0.3 + 0.7 * smoothstep(u / 0.3))
    cl = sum(osc_sine(hz(m), n, r.random()) * a for m, a in (('D5', 0.5), ('F5', 0.4), ('A5', 0.35), ('C6', 0.25)))
    x = 0.55 * stem + 0.6 * cl * exp_curve(u, 3.0)
    x *= 1.0 - smoothstep((u - 0.9) / 0.1)
    return fade(lpf(x, 6000.0), 0.02, 0.02)


def pencil(dur, key=0):
    """Pencil on paper, one continuous line: band-passed noise gated by the
    paper's tooth (a rectified 260 Hz noise), shaped by a wandering stroke
    speed, with a graphite rasp peak at 2.6 kHz."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('pencil', key)
    body = bpf(r.standard_normal(n), 1300.0, 5200.0, 2)
    tooth = lpf(r.standard_normal(n), 260.0)
    tooth = np.clip(np.abs(tooth) / (np.std(tooth) + 1e-12), 0.0, 3.0) ** 1.5
    stroke = lpf(r.standard_normal(n), 5.0, 2)
    stroke = 0.55 + 0.45 * np.tanh(2.0 * stroke / (np.std(stroke) + 1e-12))
    x = body * (0.35 + 0.65 * tooth / tooth.mean()) * stroke
    x = lpf(eq(x, 'peak', 2600.0, 3.0, 1.2), 6000.0, 2)
    x *= smoothstep(u / 0.06) * (1.0 - smoothstep((u - 0.9) / 0.1))
    return fade(pan_mono(x / (np.max(np.abs(x)) + 1e-12), -0.55 + 0.4 * u), 0.01, 0.02)


def whoosh(dur, f_lo=500.0, f_hi=3500.0, pan0=-0.8, pan1=0.8, peak=0.6, q=1.5, shape=1.6, key=0, width=0.25):
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
    return fade(lpf(st + np.stack([side, -side]), 6500.0), 0.004, 0.01)


def swirl(dur, key=0, f_lo=500.0, f_hi=3000.0, rate0=0.6, rate1=2.4, peak=0.7, depth=0.75):
    """Swirling air: a band of pink noise circling the field faster and faster."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('swirl', key)
    prog = smoothstep(np.where(u < peak, u / peak, (1.0 - u) / (1.0 - peak)))
    x = svf(pink(n, r), f_lo * (f_hi / f_lo) ** prog, 1.4, 'bp') * prog ** 1.5
    ph = TAU * _wrap(cycles(rate0 + (rate1 - rate0) * u, n, r.random()))
    x = x * (0.75 + 0.25 * np.cos(ph))
    return fade(lpf(pan_mono(x, depth * np.sin(ph)), 6500.0), 0.01, 0.02)


def soft_riser(dur, key=0, f0=350.0, f1=5000.0, tone=(74, 81), tone_amt=0.35, curve=1.8):
    """A gentle riser (no supersaw): a band of air sweeping up, a glass tone
    gliding up with an accelerating shimmer, loudness easing in."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('riser', key)
    fc = f0 * (f1 / f0) ** (u ** 1.2)
    st = pan_mono(svf(pink(n, r), fc, 1.1, 'bp'), 0.0)
    side = svf(pink(n, r), fc * 1.25, 1.1, 'bp') * 0.35
    st = st + np.stack([side, -side])
    f = mtof(tone[0] + (tone[1] - tone[0]) * u ** 1.3)
    tn = osc_sine(f * (1 + 0.004 * np.sin(TAU * 5.5 * t)), n) + 0.3 * osc_sine(2 * f, n)
    tn *= 0.7 + 0.3 * np.sin(TAU * _wrap(cycles(4.0 + 10.0 * u, n))) ** 2
    st = (st + tone_amt * pan_mono(tn, 0.0)) * u ** curve
    return fade(hpf(lpf(st, 6500.0), 200.0), 0.01, 0.03)


def rising_tone(midi, dur=1.4, glide=0.28, from_st=-7.0, key=0):
    """One of the three embers: an ignition breath, then a tone gliding up a
    fifth into its note (ease-out), a little FM sparkle, gentle vibrato."""
    n = smp(dur)
    t = tvec(n)
    f1 = float(mtof(midi))
    g = ease_out(t / glide)
    f = f1 * 2.0 ** (from_st * (1.0 - g) / 12.0)
    f = f * (1.0 + 0.0035 * np.sin(TAU * 5.2 * t) * smoothstep((t - glide) / 0.3))
    ph = TAU * _wrap(cycles(f, n))
    idx = 0.8 * decay(t, 0.08) + 0.15
    x = (np.sin(ph + idx * np.sin(2 * ph)) + 0.2 * np.sin(2 * ph)) * burst_env(t, 0.0, 0.004, 0.9)
    ign = hpf(rng('ember', key).standard_normal(n), 1200.0) * burst_env(t, 0.0, 0.002, 0.02) * 0.25
    return fade(lpf(x + ign, 6500.0), 0.003, 0.05)


def reverse_swell(dur, key=0, freqs=(), rt=1.8, noise_amt=0.6, tone_amt=1.0, gap=0.035):
    """Reverse-reverb swell: render a strike's reverb wash forward, reverse it so
    it swells up into the cue, and stop `gap` s early (a 25 ms release), so
    the hit lands on a breath. Returns (dur − gap) s, to be placed at cue − dur."""
    L = dur + 0.2
    n = smp(L)
    t = tvec(n)
    r = rng('rev', key)
    src = pan_mono(hpf(r.standard_normal(n), 600.0) * burst_env(t, 0.0, 0.001, 0.08), 0.0) * noise_amt
    for i, f in enumerate(freqs):
        src += bowl(f, L, ring=1.4, hardness=1.1, key=('rev', key, i), width=0.5) * tone_amt / len(freqs)
    wet = reverb(src, make_ir(rt, rt * 1.1, 0.0, key=('rev', key), diffusion=0.004, early=0))
    wet = wet[:, :smp(dur)][:, ::-1][:, :smp(dur - gap)]
    wet = fade(hpf(wet, 250.0), 0.03, 0.025)
    return wet / (np.max(np.abs(wet)) + 1e-12)


def bloom(dur, key=0, attack=0.25, dec=1.2, lp=2400.0, hp=220.0):
    """A warm bloom of air: decorrelated pink noise, band-limited, swelling in
    and decaying slowly (light filling the drawing, the logo's glow)."""
    n = smp(dur)
    t = tvec(n)
    st = np.stack([lpf(hpf(pink(n, rng('bloom', key, c)), hp), lp) for c in range(2)])
    env = smoothstep(t / attack) * decay(t - attack, dec)
    return fade(st * env / 3.0, 0.005, 0.1)


def hairline(f0, f1, dur=0.22, key=0):
    """A copper hairline drawing between two lights: a thin sine glissando."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    f = f0 * (f1 / f0) ** smoothstep(u)
    x = osc_sine(f, n, rng('hair', key).random()) * np.sin(np.pi * u) ** 1.5
    return fade(x, 0.003, 0.01)


# ════════════════════════════════════════════════════════════════════════════
# 4. Cue list (STORYBOARD §4) & arrangement
# ════════════════════════════════════════════════════════════════════════════
CUP_1 = 1.0                                                  # cup strike #1 (D)
RIM_LIGHT = 0.35                                             # the glint crosses the lip
SPARKS = [(2.5, 'A5', -0.6), (3.125, 'D6', 0.6), (3.75, 'F6', 0.0)]    # one per beat: A, D, F · L, R, C
DIVE = (4.375, 5.0)
CUP_2 = 5.0                                                  # cup strike #2 (A) + scan
ANNOTATIONS = [(5.6, 'E6', 0.30), (5.9, 'G6', 0.45), (6.2, 'A6', 0.20)]
RESOLIDIFY = (7.0, 7.5)
GROOVE = (7.5, 16.875)                                       # felt kick on every beat …
GROOVE_KICKS = [7.5 + i * BEAT for i in range(15)]           # … 7.5 → 16.25; the groove drops away at 16.875
SERVO_DESCEND = (7.5, 8.1)
GRIP = 8.125
MULTIPLY = [(8.75, 'D4 A4'), (9.375, 'D4 A4 C5 F5'), (10.0, 'D4 A4 C5 F5')]   # 1→2, 2→4, four as one
ADD9 = 'E5'                                                  # Dm7 add9 on 10.0
WORLDS = [(10.0, 'AUTOMATION'), (11.25, 'OPERATIONS'), (12.5, 'ROBOTICS & VISION'), (13.75, 'AGRONOMY')]
FOUR_CHIME = 15.0
LIFT = 15.625
ACCENT = 15.65
SINK = (16.875, 17.5)
RENEW = (17.5, 22.5)
SERVO_RISE = (17.5, 18.4)
SKETCH = (18.4, 19.4)
HANDOFF = 20.0
EMBER_RISE = (21.25, 22.5)
SPLIT_TONES = [(22.9, 'D5', -0.5), (23.2, 'F5', 0.5), (23.5, 'A5', 0.0)]
LOGO = 25.0
LINE_TICKS = [(26.25, 'A6'), (27.5, 'D7')]

# Chords (pad voicings; bass notes separate). D dorian's B♮ appears in the
# final lift, where D minor becomes D major as the film turns to light.
CHORDS = [
    # start, end, name, pad voicing
    (0.35, 5.02, 'Dm9', 'D3 A3 C5 E5 F5'),
    (4.95, 7.47, 'D9sus', 'D3 A3 E4 G4 C5'),
    (7.50, 12.55, 'Dm9', 'F3 C4 E4 A4'),
    (12.45, 15.05, 'Bbmaj9', 'F3 C4 D4 A4'),
    (14.95, 16.30, 'Gm9', 'F3 Bb3 D4 A4'),
    (16.25, 17.25, 'C9sus4', 'F3 Bb3 D4 G4'),
    (17.45, 18.80, 'Fmaj9', 'A3 C4 E4 G4'),
    (18.70, 20.05, 'C/E', 'G3 C4 E4'),
    (19.95, 22.55, 'Dm(add9)', 'F3 A3 D4 E4'),
    (22.45, 23.80, 'Bbmaj7', 'F3 A3 D4'),
    (23.70, 24.965, 'Cadd9', 'G3 C4 D4 E4'),
]
FINAL_MINOR = 'D3 A3 C4 E4 F4'          # 25.0: Dm9 …
FINAL_LIFT = 'D3 A3 E4 F#4 B4'          # … lifts to D6/9 as the room fills with light (25.4 → 26.1)
BASS_ROOTS = [(7.5, 'D2'), (12.5, 'Bb1'), (15.0, 'G1'), (16.25, 'C2')]
# Mallet line over bars 5–6 (Dm9 → B♭maj9): (16th step from 10.0, note, velocity, length in 16ths)
MELODY = [(2, 'A4', .70, 2), (4, 'D5', .85, 2), (6, 'E5', .72, 1), (7, 'F5', .90, 3), (10, 'E5', .70, 2),
          (12, 'D5', .78, 2), (14, 'C5', .68, 2),
          (18, 'D5', .75, 2), (20, 'F5', .85, 2), (22, 'G5', .72, 1), (23, 'A5', .92, 3), (26, 'G5', .70, 2),
          (28, 'F5', .76, 2), (30, 'E5', .70, 2), (32, 'D5', .80, 4)]
# Renew: felt piano (time, note, velocity). Pedal changes at 18.75 and 20.0.
PIANO = [(17.5, 'F2', .50), (17.5, 'C3', .40), (17.5, 'E5', .46), (17.8125, 'A3', .28), (18.125, 'E4', .30),
         (18.4375, 'G4', .30), (18.4375, 'D5', .38),
         (18.75, 'E2', .46), (18.75, 'C3', .36), (18.75, 'C5', .42), (19.0625, 'G3', .27), (19.375, 'E4', .30),
         (19.6875, 'G4', .28),
         (20.0, 'D2', .52), (20.0, 'A2', .40), (20.0, 'D4', .40), (20.078125, 'A4', .40), (20.15625, 'C5', .42),
         (20.234375, 'F5', .46), (20.625, 'A3', .26), (20.9375, 'E4', .28), (21.25, 'E5', .42), (21.25, 'A3', .26),
         (21.5625, 'D4', .26), (21.875, 'D5', .40), (21.875, 'F4', .25), (22.1875, 'A4', .26)]
PEDAL = [17.5, 18.75, 20.0, 23.0]

CUES = [  # STORYBOARD §4 as implemented: (start, end, what) — printed on every run
    (0.00, 1.00, 'Room tone and air; deep sub drone (D1 + D2) fades in'),
    (0.35, 1.30, 'Delicate high shimmer as the light traces the rim (glass partials, L → R)'),
    (1.00, None, 'CUP STRIKE #1: singing bowl on D4, soft felt mallet, long shimmering tail'),
    (0.35, 2.40, 'Warm pad Dm9 swells in under the first line (then settles under the tale)'),
    (2.50, 3.75, 'Three spark ignitions on the beats: crackle + bell pings A5 L · D6 R · F6 C; orbit trails'),
    (4.375, 5.00, 'Sparks dive: spiralling dive + reverse swell of A-D-F into 5.0'),
    (5.00, None, 'CUP STRIKE #2 on A4 + glassy scan shimmer sweeping down (5.0–5.6)'),
    (5.00, 7.00, 'Soft data-tick texture; annotation ticks 5.6 / 5.9 / 6.2; D9sus pad'),
    (7.00, 7.50, 'Reverse swell (bowls D-A) + upward scan into the downbeat'),
    (7.50, 16.875, 'GROOVE: felt kick every beat, shaker 16ths, off-beat bass pulse (D → B♭ → G → C)'),
    (7.50, 8.10, 'Servo whir as the hand descends'),
    (8.125, None, 'Grip clack (two finger contacts + a damped copper tink)'),
    (8.75, None, 'Multiplication 1→2: bowls D4 + A4, slide'),
    (9.375, None, 'Multiplication 2→4: bowls D4 A4 C5 F5, slides'),
    (10.00, None, 'Four as one: D A C F bowls + E5 (Dm7 add9) + kick accent + sub'),
    (10.00, 15.00, 'Worlds: paper flicks & sorting ticks · pings arpeggio · focus beep & shutter · soil & sprout'),
    (10.00, 15.00, 'Mallet motif carries the melody; anvil backbeats + hammer ticks; Dm9 → B♭maj9'),
    (15.00, None, 'The four bowls chime together (Gm9 underneath); hairlines draw between the lights'),
    (15.625, 16.90, 'Lights lift: ascending glass shimmer + rising swell; accent at 15.65'),
    (16.875, 17.50, 'Groove drops away; descending airy sweep'),
    (17.50, 22.50, 'RENEW: felt piano Fmaj9 → C/E → Dm, soft pad, no drums'),
    (17.50, 18.40, 'Quiet servo (the hand rises under the ember)'),
    (18.40, 19.40, 'Pencil-on-paper sketch texture'),
    (20.00, None, 'THE HAND-OFF: warm bell (the cup\'s voice) + soft bloom swell; the four-cup chord on piano'),
    (21.25, 22.50, 'Soft riser as the ember lifts'),
    (22.90, 23.50, 'Three rising tones as the ember splits (22.9 / 23.2 / 23.5): D5 L · F5 R · A5 C'),
    (22.50, 25.00, 'Build: swirling whooshes, heartbeat felt kicks, bowl roll, B♭maj7 → Cadd9, reverse swell'),
    (25.00, None, 'THE LOGO LOCKS: impact kick + sub boom + low-D bowl + Dm9 bell chord, lush long reverb'),
    (25.40, 26.10, 'The D-major lift: pad Dm9 → D6/9, high bells F#5 A5 D6 as the room turns ivory'),
    (26.25, 27.50, 'Two gentle ticks for the lines (A6, D7)'),
    (25.00, 30.00, 'The tail blooms and decays to near-silence by 29.9; 29.9–30.0 digital zero'),
]


class Mix:
    """Stereo stems plus reverb sends for the whole film."""
    STEMS = ('sub', 'kick', 'perc', 'cup', 'keys', 'pad', 'fx', 'air')
    SENDS = ('room', 'hall', 'big')

    def __init__(self):
        self.stems = {k: np.zeros((2, N)) for k in self.STEMS}
        self.sends = {k: np.zeros((2, N)) for k in self.SENDS}
        self.events = []

    def add(self, stem, sig, t, gain_db=0.0, pan=0.0, room=0.0, hall=0.0, big=0.0, label=None):
        assert 0.0 <= t < DUR, (stem, t, label)
        sig = np.asarray(sig, float)
        st = (pan_mono(sig, pan) if sig.ndim == 1 else balance(sig, pan)) * db2lin(gain_db)
        i0 = smp(t)
        i1 = min(N, i0 + st.shape[1])
        if i1 <= i0:
            return
        seg = st[:, :i1 - i0]
        self.stems[stem][:, i0:i1] += seg
        for name, amt in (('room', room), ('hall', hall), ('big', big)):
            if amt:
                self.sends[name][:, i0:i1] += seg * amt
        self.events.append((t, stem, label or stem))

    def times(self, *labels):
        return sorted({t for t, _s, lab in self.events if lab in labels})


def chord_pad(M, start, end, name, voicing, gain_db, hall=0.25, attack=0.08, release=0.1, env=None, **kw):
    sig = warm_pad(notes(voicing), end - start, (name, start), attack=attack, release=release, **kw)
    if env is not None:
        sig = sig * automation(env, sig.shape[1], start)
    M.add('pad', sig, start, gain_db, hall=hall, label='pad')


def arrange():
    M = Mix()
    r = rng('arrange')

    # ── Bed: room tone & air, the whole film ────────────────────────────────
    room = room_tone(DUR)
    room *= automation([(0.0, -90), (0.8, 0), (7.0, 0), (7.6, -6), (16.9, -6), (17.6, -1), (22.5, -1),
                        (23.5, -6), (25.0, -8), (29.0, -14), (29.9, -90)], N)
    M.add('air', room, 0.0, -50.0, label='room tone')

    # ── S1 · THE TALE (0–5): mystery ────────────────────────────────────────
    drone = sub_drone(hz('D1'), 7.5)
    drone *= automation([(0.0, -90), (0.15, -30), (1.0, 0), (4.8, 0), (5.0, 1.5), (7.0, 1.5), (7.47, -40)],
                        drone.size)
    M.add('sub', fade(drone, 0.05, 0.03), 0.0, TALE_DB - 26.0, label='sub drone')
    M.add('fx', rim_shimmer(1.0, 'rim'), RIM_LIGHT, TALE_DB - 23.0, hall=0.45, label='rim shimmer')
    M.add('air', dust(4.7, 'tale', notes('A6 D7 E7 F7 C7'), rate=2.2), 0.3, TALE_DB - 32.0, hall=0.5, label='dust')
    c0, c1, name, v = CHORDS[0]
    chord_pad(M, c0, c1, name, v, TALE_DB - 17.0, hall=0.35, attack=0.3, release=0.05, cut_lo=420.0, cut_hi=1300.0,
              lfo=0.12, env=[(0.35, -40), (1.9, 0), (2.8, -5), (4.3, -6), (4.9, -14), (5.02, -30)])
    M.add('cup', cup('D4', 11.0, ring=4.0, key='strike1'), CUP_1, TALE_DB - 15.0, hall=0.35, label='cup strike')
    for i, (tk, note, p) in enumerate(SPARKS):
        M.add('fx', crackle(0.5, ('spark', i)), tk, TALE_DB - 29.0, pan=p, room=0.3, label='spark crackle')
        ping = pan_mono(fm_bell(hz(note), 2.5, ratio=3.5, index=1.2, dec=0.5), p) * 0.7 \
            + balance(bowl(hz(note), 2.5, ring=1.3, hardness=1.2, key=('spark', i), width=0.2), p) * 0.5
        M.add('keys', ping, tk, TALE_DB - 22.0, hall=0.4, label='spark ping')
        M.add('fx', spark_trail(4.375 - tk + 0.1, i, phase=TAU * i / 3), tk + 0.1, TALE_DB - 33.0, hall=0.3, label='trail')
    M.add('fx', swirl(0.585, 'dive', 700.0, 3200.0, 1.0, 5.0, peak=0.8, depth=0.6), DIVE[0], TALE_DB - 25.0,
          hall=0.2, label='dive')
    rs = reverse_swell(DIVE[1] - DIVE[0], 'dive', [hz('A4'), hz('D5'), hz('F5')], rt=1.6)
    M.add('fx', rs, DIVE[0], TALE_DB - 21.0, label='reverse swell')

    # ── S2 · 01 UNDERSTAND (5–7.5): curiosity ───────────────────────────────
    M.add('cup', cup('A4', 9.0, ring=4.5, key='strike2'), CUP_2, TALE_DB - 16.0, hall=0.35, label='cup strike')
    M.add('fx', scan_shimmer(0.9, 'down'), CUP_2, TALE_DB - 24.0, hall=0.3, label='scan')
    c0, c1, name, v = CHORDS[1]
    chord_pad(M, c0, c1, name, v, TALE_DB - 19.5, hall=0.3, attack=0.25, release=0.04, cut_lo=450.0, cut_hi=1700.0,
              lfo=0.3, env=[(4.95, -30), (5.4, 0), (6.9, 0), (7.4, -8)])
    rt = rng('data ticks')
    tk = CUP_2 + 0.05
    while tk < 7.0:
        tk = round((tk + rt.exponential(1.0 / 11.0)) / (S32 / 4)) * (S32 / 4)   # on a 1/128-note grid
        if tk >= 7.0:
            break
        f = float(rt.choice([2093.0, 2349.3, 2637.0, 3136.0]))
        M.add('fx', data_tick(f, ('data', tk)), tk, TALE_DB - 38.0 + rt.uniform(-3, 2), pan=rt.uniform(-0.6, 0.6),
              room=0.2, label='data tick')
    for tk, note, p in ANNOTATIONS:
        M.add('fx', glass(hz(note), 0.5, 0.12, 0.6), tk, TALE_DB - 27.0, pan=p, hall=0.25, label='annotation tick')
        M.add('fx', data_tick(3520.0, ('anno', tk), tau=0.002), tk, TALE_DB - 31.0, pan=p, label='annotation tick')
    for i, (st_, note) in enumerate(((4, 'E5'), (6, 'G5'), (8, 'A5'))):           # a question, left open
        M.add('keys', mallet(hz(note), 1.2, 0.45, key=('q', i)), 6.25 + (st_ - 4) * S16, TALE_DB - 24.0,
              pan=0.3 - 0.2 * i, hall=0.35, label='curious mallet')
    rs = reverse_swell(RESOLIDIFY[1] - RESOLIDIFY[0], 'solid', [hz('D4'), hz('A4')], rt=1.4)
    M.add('fx', rs, RESOLIDIFY[0], TALE_DB - 20.0, label='reverse swell')
    M.add('fx', scan_shimmer(0.465, 'up', sweep=0.4, up=True), RESOLIDIFY[0], TALE_DB - 27.0, hall=0.2, label='scan up')

    # ── Groove 7.5–16.875 ───────────────────────────────────────────────────
    for i, tk in enumerate(GROOVE_KICKS):
        style = 'accent' if tk in (10.0, 15.0) else 'groove'
        M.add('kick', felt_kick(style), tk, GROOVE_DB - 11.5, label='kick')
    sh = [shaker(k) for k in range(8)]
    rs_ = rng('shaker groove')
    SH_VEL = (0.55, 0.30, 0.85, 0.36)
    for step in range(int(round((GROOVE[1] - GROOVE[0]) / S16))):
        tk = GROOVE[0] + step * S16 + (0.008 if step % 2 else 0.0) + rs_.uniform(-0.002, 0.002)   # a little swing
        vel = SH_VEL[step % 4] * rs_.uniform(0.85, 1.1)
        M.add('perc', sh[step % 8], max(tk, GROOVE[0]), GROOVE_DB - 23.5 + lin2db(vel), pan=0.28, room=0.08, label='shaker')
    for k in range(15):
        tk = GROOVE[0] + S8 + k * BEAT
        root = [nm_ for t0, nm_ in BASS_ROOTS if t0 <= tk][-1]
        M.add('sub', bass_pulse(hz(root), 0.25, 1.0 if k % 2 == 0 else 0.85), tk, GROOVE_DB - 16.0, label='bass')
    anv = [anvil(hz('A5'), k) for k in range(3)]
    for i, tk in enumerate([10.9375, 12.1875, 13.4375, 14.6875, 15.9375]):       # the '&' of 2 and 4
        M.add('perc', anv[i % 3], tk, GROOVE_DB - 27.5, pan=-0.25, room=0.35, label='anvil')
    ticks = [hammer_tick(k) for k in range(6)]
    HT = {3: -3.0, 7: -8.0, 10: -5.0, 13: -7.0, 15: -10.0}
    for b0 in np.arange(8.75, 16.875 - 1e-9, BAR / 4):          # from bar 4 beat 3, beat by beat
        for step, g in HT.items():
            tk = float(7.5 + np.floor((b0 - 7.5) / BAR) * BAR + step * S16)
            if b0 <= tk < b0 + BEAT and tk < 16.8:
                M.add('perc', ticks[int(tk * 16) % 6], tk, GROOVE_DB - 28.0 + g, pan=0.4, room=0.2, label='hammer tick')
    # groove pads (sidechained under the kick in the mix)
    for c0, c1, name, v in CHORDS[2:6]:
        env = None
        if name == 'C9sus4':
            env = [(16.25, 0), (16.875, 0), (17.25, -30)]
        chord_pad(M, c0, c1, name, v, GROOVE_DB - 16.5, hall=0.2, attack=0.03 if c0 == 7.5 else 0.1, release=0.1,
                  cut_lo=500.0, cut_hi=1700.0, env=env)

    # ── S3 · 02 MAKE (7.5–10): the hand, one becomes four ───────────────────
    M.add('fx', servo(0.6, 170.0, 310.0, 'descend'), SERVO_DESCEND[0], -30.0, pan=0.45, room=0.25, label='servo')
    M.add('fx', grip_clack(), GRIP, -22.0, pan=0.15, room=0.3, label='grip clack')
    M.add('fx', servo(0.5, 200.0, 280.0, 'inspect'), 8.2, -36.0, pan=0.2, room=0.25, label='servo')
    for i, (tk, chord) in enumerate(MULTIPLY):
        names = chord.split()
        g = GROOVE_DB + 1.5 + {2: -20.0, 4: -23.0}[len(names)] - (4.0 if tk == 10.0 else 0.0)
        last = tk == 10.0
        for j, nme in enumerate(names):
            p = (-0.55 + 1.1 * j / (len(names) - 1)) * (0.8 if len(names) == 2 else 1.0)
            M.add('cup', cup(nme, 5.0, ring=2.2 if last else 1.6, key=('mult', i, j), hardness=1.4 if last else 1.05),
                  tk, g, pan=p * 0.6, hall=0.3, label='bowl')
    M.add('fx', slide(0.4, 'one-two', 0.0, 0.6), 8.75, -29.0, hall=0.2, label='slide')
    M.add('fx', slide(0.4, 'two-four-L', -0.2, -0.8), 9.375, -31.0, hall=0.2, label='slide')
    M.add('fx', slide(0.4, 'two-four-R', 0.2, 0.8), 9.375, -31.0, hall=0.2, label='slide')
    M.add('fx', servo(0.45, 210.0, 360.0, 'exit'), 9.38, -34.0, pan=0.5, room=0.25, label='servo')
    M.add('cup', pan_mono(glass(hz(ADD9), 3.0, 1.3, 0.35, ratio=2.0), 0.1), 10.0, -26.0, hall=0.4, label='add9')
    M.add('sub', boom(hz('D2') * 1.6, hz('D1'), 1.2, 0.05, 0.35), 10.0, -23.0, label='landing sub')

    # ── S4 · FOUR KINDS OF WORK (10–15) ─────────────────────────────────────
    for i, (st_, note, vel, ln) in enumerate(MELODY):
        tk = 10.0 + st_ * S16
        s = mallet(hz(note), ln * S16 + 0.5, vel, key=('mel', i))
        s = s * np.where(tvec(s.size) < ln * S16 + 0.06, 1.0, decay(tvec(s.size) - ln * S16 - 0.06, 0.08))
        p = 0.15 * np.sin(i * 1.3)
        M.add('keys', fade(s, 0.0012, 0.02), tk, GROOVE_DB - 16.0, pan=p, room=0.2, hall=0.2, label='mallet')
        for off, e in echoes(s, 3 * S16, 2, -11.0, (-0.6, 0.6), lp=2600.0):
            if tk + off < 16.8:
                M.add('keys', e, tk + off, GROOVE_DB - 16.0, hall=0.15, label='mallet echo')
    # 10.0 AUTOMATION: paper slips fall in, sorted stacks rise out
    for i, dt in enumerate([0.0, 0.07, 0.16, 0.27, 0.41]):
        M.add('fx', paper_flick(r.uniform(0.09, 0.16), ('flick', i)), 10.0 + dt, -32.5 - 1.2 * i,
              pan=r.uniform(-0.5, 0.5), room=0.3, label='paper flick')
    for i in range(10):
        tk = 10.625 + i * S32 + (0.0 if i < 8 else (i - 7) * S32)
        M.add('fx', sort_tick(('sort', i)), tk, -34.0 + (4.0 if i in (3, 7, 9) else 0.0),
              pan=-0.2 + 0.05 * i, room=0.25, label='sort tick')
    # 11.25 OPERATIONS: points of light around the rim connect into one ring
    ring = notes('D5 F5 A5 C6 E6 F6 A6')
    for i, m in enumerate(ring):
        tk = 11.25 + i * S16
        ang = TAU * i / len(ring)
        M.add('fx', glass(float(mtof(m)), 0.8, 0.3, 0.7, ratio=2.0), tk, -28.0 + 0.3 * i, pan=0.7 * np.sin(ang),
              hall=0.35, label='ping')
    M.add('fx', pan_mono(glass(hz('D6'), 1.5, 0.6, 0.3, 2.0) + 0.7 * glass(hz('A6'), 1.5, 0.5, 0.3, 2.0), 0.0),
          11.25 + 7 * S16, -29.0, hall=0.5, label='ring closes')
    # 12.5 ROBOTICS & VISION: reticle locks (focus beep), focus pull, shutter
    M.add('fx', focus_beep(hz('A6')), 12.5, -30.0, pan=0.1, room=0.2, label='focus beep')
    M.add('fx', focus_beep(hz('A6')), 12.575, -30.0, pan=0.1, room=0.2, label='focus beep')
    M.add('fx', servo(0.32, 900.0, 1400.0, 'lens'), 12.65, -38.0, pan=0.1, label='lens')
    M.add('fx', shutter(), 13.125, -26.0, pan=0.05, room=0.25, label='shutter')
    # 13.75 AGRONOMY: soil fills the cup, a seedling unfurls
    M.add('fx', soil_crunch(0.55), 13.75, -26.0, pan=-0.1, room=0.2, label='soil')
    M.add('fx', sprout(0.6), 14.375, -26.0, hall=0.35, label='sprout')

    # ── S5 · ONE SYSTEM (15–17.5): wonder ───────────────────────────────────
    for j, nme in enumerate('D4 A4 C5 F5'.split()):
        M.add('cup', cup(nme, 6.0, ring=3.2, key=('chime', j), hardness=0.95), FOUR_CHIME, GROOVE_DB - 20.0,
              pan=(-0.6 + 0.4 * j) * 0.7, hall=0.4, label='bowl')
    for j, (a, b) in enumerate((('D6', 'A6'), ('A6', 'C7'), ('C7', 'F7'))):
        M.add('fx', hairline(hz(a), hz(b), 0.2), 15.08 + 0.16 * j, -34.0, pan=-0.45 + 0.45 * j, hall=0.4,
              label='hairline')
    for i, m in enumerate(notes('D6 F6 G6 A6 C7 D7 F7 G7')):
        M.add('fx', glass(float(mtof(m)), 0.9, 0.35, 0.5, 2.0), LIFT + i * S32, -29.0 + 0.4 * i,
              pan=-0.6 + 1.2 * i / 7, hall=0.45, label='ascending shimmer')
    swell = warm_pad(notes('Bb3 D4 F4 A4 D5'), 1.3, 'lift swell', cut_lo=600.0, cut_hi=2600.0, lfo=0.5,
                     attack=0.05, release=0.25)
    swell *= exp_curve(tvec(swell.shape[1]) / 1.25, 2.5)
    M.add('pad', swell, LIFT, -19.0, hall=0.35, label='rising swell')
    acc = sum(mallet(hz(m), 1.5, 0.55, key=('acc', m)) for m in ('G4', 'Bb4', 'D5'))
    M.add('keys', pan_mono(acc / 3.0, 0.0), ACCENT, -17.0, hall=0.35, label='accent')
    M.add('keys', pan_mono(fm_bell(hz('D6'), 2.0, ratio=3.5, index=0.8, dec=0.8), 0.0), ACCENT, -27.0,
          hall=0.4, label='accent')
    M.add('fx', whoosh(0.62, 280.0, 4800.0, 0.5, -0.5, peak=0.12, q=1.2, shape=1.3, key='sink'), SINK[0],
          -24.0, hall=0.3, label='airy sweep')

    # ── S6 · 03 RENEW (17.5–22.5): intimate ─────────────────────────────────
    for i, (tk, nme, vel) in enumerate(PIANO):
        nxt = [p for p in PEDAL if p > tk + 0.01][0]
        damp = nxt + 0.03 - tk
        M.add('keys', felt_piano(nm(nme), vel, min(damp + 0.6, 6.0), key=('pno', i), damp=damp), tk, RENEW_DB - 14.5,
              pan=float(np.clip((nm(nme) - 60) / 40.0, -0.4, 0.4)), room=0.35, hall=0.2, label='piano')
    for c0, c1, name, v in CHORDS[6:9]:
        chord_pad(M, c0, c1, name, v, RENEW_DB - 27.0, hall=0.3, attack=0.35 if c0 < 17.6 else 0.12, release=0.12,
                  cut_lo=380.0, cut_hi=1100.0, lfo=0.07, voices=2)
    M.add('fx', servo(0.9, 140.0, 240.0, 'rise'), SERVO_RISE[0], RENEW_DB - 37.0, pan=0.0, room=0.3, label='servo')
    M.add('fx', pencil(SKETCH[1] - SKETCH[0]), SKETCH[0], RENEW_DB - 28.0, room=0.3, label='pencil')
    for i in range(5):                                            # the ember rolls off the metal palm
        M.add('fx', glass(hz(['A6', 'F6', 'E6', 'D6', 'A5'][i]), 0.4, 0.08, 0.3), 19.5 + i * 0.09,
              -36.0 - i, pan=0.25 - 0.08 * i, hall=0.3, label='roll')
    M.add('cup', warm_bell(hz('D5'), 5.0, 'handoff'), HANDOFF, RENEW_DB - 18.5, hall=0.45, label='hand-off bell')
    M.add('fx', bloom(2.5, 'handoff', attack=0.35, dec=0.9), HANDOFF, RENEW_DB - 25.0, hall=0.3, label='bloom')
    M.add('fx', servo(1.0, 240.0, 150.0, 'withdraw'), 20.4, -40.0, pan=0.35, room=0.3, label='servo')
    M.add('fx', soft_riser(1.35, 'ember', 380.0, 4800.0, (nm('D5'), nm('A5')), 0.3), EMBER_RISE[0], RENEW_DB - 25.0,
          hall=0.25, label='riser')

    # ── S7 · THE MARK (22.5–30): release & resolve ──────────────────────────
    for c0, c1, name, v in CHORDS[9:11]:
        env = [(22.45, -16), (23.8, -8)] if name == 'Bbmaj7' else [(23.7, -8), (24.9, -3.5), (24.965, -8)]
        chord_pad(M, c0, c1, name, v, BUILD_DB - 19.0, hall=0.3, attack=0.15, release=0.03, cut_lo=500.0,
                  cut_hi=2200.0, lfo=0.4, env=env)
    for t0, t1, note in ((22.5, 23.8, 'Bb1'), (23.75, 24.965, 'C2')):
        s = sub_drone(hz(note), t1 - t0, h2=0.4)
        s *= automation([(t0, -12), (t1, 0)], s.size, t0)
        M.add('sub', fade(s, 0.04, 0.03), t0, BUILD_DB - 21.0, label='build sub')
    for tk, g in ((22.5, -17.0), (23.75, -14.5), (24.375, -12.0), (24.6875, -12.5)):
        M.add('kick', felt_kick('heart'), tk, BUILD_DB + g, label='kick')
    for i, (tk, note, p) in enumerate(SPLIT_TONES):
        M.add('keys', rising_tone(nm(note), 1.5, key=i), tk, BUILD_DB - 21.0, pan=p, hall=0.4, label='rising tone')
    for i, (t0, d) in enumerate(((23.0, 1.0), (23.6, 1.0), (24.1, 0.855))):
        M.add('fx', swirl(d, ('build', i), 500.0 + 150 * i, 2800.0 + 500 * i, 0.8 + 0.6 * i, 2.5 + i),
              t0, BUILD_DB - 28.5 + 1.5 * i, hall=0.25, label='swirl')
    roll_t = [23.75 + k * S16 for k in range(4)] + [24.375 + k * S32 for k in range(7)]
    for k, tk in enumerate(roll_t):
        u = k / (len(roll_t) - 1)
        M.add('cup', cup(['A4', 'D5'][k % 2], min(1.6, LOGO - tk - 0.03), ring=1.2, key=('roll', k),
                         hardness=0.6 + 0.3 * u, clang=0.5), tk, BUILD_DB - 35.0 + 10.0 * u, pan=0.3 * (-1) ** k,
              hall=0.3, label='bowl roll')
    rs = reverse_swell(0.7, 'logo', [hz(n_) for n_ in 'D4 A4 C5 E5'.split()], rt=2.2)
    M.add('fx', rs, LOGO - 0.7, BUILD_DB - 23.5, label='reverse swell')
    M.add('fx', soft_riser(0.915, 'logo', 500.0, 5200.0, (nm('A4'), nm('D5')), 0.2, curve=2.2),
          LOGO - 0.95, BUILD_DB - 27.0, label='riser')

    # 25.0 THE LOGO LOCKS
    M.add('kick', felt_kick('impact'), LOGO, -14.0, label='impact kick')
    M.add('sub', boom(95.0, hz('D1'), 3.0, 0.12, 0.6, drive=1.8), LOGO, -18.0, label='impact')
    low = sub_drone(hz('D2'), 4.9, h2=0.2)
    low *= automation([(25.0, -90), (25.25, -6), (26.0, 0), (29.8, -30)], low.size, LOGO)
    M.add('sub', fade(low, 0.05, 0.05), LOGO, -20.0, label='tail sub')
    M.add('cup', cup('D3', 4.9, ring=3.2, key='logo', hardness=0.95, width=0.55, beat_depth=0.7), LOGO, -12.5, hall=0.25, big=0.45,
          label='logo bowl')
    for j, (nme, ring_, g) in enumerate((('D4', 2.6, -17.5), ('F4', 0.7, -22.5), ('A4', 2.4, -18.5),
                                          ('C5', 1.2, -20.5), ('E5', 2.2, -19.5))):
        M.add('cup', cup(nme, 4.85, ring=ring_, key=('logo chord', j), hardness=1.0, beat_depth=0.7),
              LOGO + 0.012 * j, g,
              pan=-0.5 + 0.25 * j, hall=0.2, big=0.5, label='bell chord')
    M.add('fx', bloom(4.0, 'logo', attack=0.05, dec=1.0, lp=4200.0, hp=200.0), LOGO, -18.5, big=0.4,
          label='impact bloom')
    M.add('fx', rim_shimmer(1.0, 'sweep', ('D7', 'F#7', 'A7', 'E7'), -0.6, 0.7, peak=0.3), 25.05, -25.0,
          big=0.5, label='light sweep')
    minor = warm_pad(notes(FINAL_MINOR), 1.3, 'final minor', cut_lo=600.0, cut_hi=2000.0, attack=0.03,
                     release=0.6)
    M.add('pad', minor * automation([(25.0, 0), (25.4, 0), (26.1, -30)], minor.shape[1], LOGO), LOGO, -15.0,
          hall=0.2, big=0.35, label='final pad')
    lift = warm_pad(notes(FINAL_LIFT), 4.5, 'final lift', cut_lo=600.0, cut_hi=2300.0, attack=0.6, release=1.0,
                    lfo=0.15)
    lift *= automation([(25.4, -30), (26.1, 0), (27.3, 0), (29.4, -22)], lift.shape[1], 25.4)
    M.add('pad', lift, 25.4, -15.0, hall=0.2, big=0.35, label='final pad')
    for j, nme in enumerate(('F#5', 'A5', 'D6')):
        M.add('keys', pan_mono(fm_bell(hz(nme), 3.5, ratio=3.5, index=0.6, dec=1.4), -0.4 + 0.4 * j), 25.625 + 0.04 * j,
              -25.0, big=0.5, label='lift bell')
    for tk, note in LINE_TICKS:
        M.add('fx', glass(hz(note), 1.0, 0.25, 0.5), tk, -22.5, pan=0.15, hall=0.4, label='line tick')
        M.add('fx', data_tick(3520.0, ('line', tk), tau=0.0025, noise=0.3), tk, -27.0, pan=0.15, room=0.3,
              label='line tick transient')
    M.add('air', dust(2.5, 'mark', notes('A6 B6 D7 E7 F#7'), rate=2.0, spread_db=10.0), 27.0, -33.0, big=0.4,
          label='dust')
    return M


# ════════════════════════════════════════════════════════════════════════════
# 5. Mix bus & master chain
# ════════════════════════════════════════════════════════════════════════════
STEM_EQ = {  # (hpf Hz, lpf Hz): everything but the sub and the kick is high-passed
    'perc': (150.0, 9000.0), 'cup': (90.0, 9000.0), 'keys': (45.0, 9000.0), 'pad': (100.0, 7000.0),
    'fx': (120.0, 9000.0), 'air': (180.0, 9000.0), 'sub': (None, 300.0), 'kick': (None, None),
}
DUCKS = {  # stem → [(trigger labels, depth dB, release s)]
    'pad': [(('kick',), 5.0, 0.30), (('impact kick',), 6.0, 0.9)],
    'sub': [(('kick',), 8.0, 0.14)],
    'returns': [(('kick',), 2.0, 0.2)],
}
IRS = {}


def irs():
    if not IRS:
        IRS['room'] = make_ir(0.7, 1.0, 0.008, 'room', damp=7000.0)
        IRS['hall'] = make_ir(2.6, 3.2, 0.022, 'hall', damp=6000.0)
        IRS['big'] = make_ir(3.4, 4.2, 0.035, 'big', damp=5500.0, lo_x=1.1)
    return IRS


def mix_bus(M):
    """Stem EQ, sidechain ducking and reverb returns → one stereo bus."""
    out, stems = np.zeros((2, N)), {}

    def duck_gain(specs):
        g = np.ones(N)
        for labels, depth, rel in specs:
            ts = M.times(*labels)
            if ts:
                g = np.minimum(g, duck_env(ts, depth, rel))
        return g

    for name, buf in M.stems.items():
        hp_, lp_ = STEM_EQ.get(name, (None, None))
        x = hpf(buf, hp_) if hp_ else buf
        x = lpf(x, lp_) if lp_ else x
        if name in ('pad', 'keys'):
            x = eq(x, 'peak', 280.0, -1.5, 0.9)
        if name in DUCKS:
            x = x * duck_gain(DUCKS[name])
        stems[name] = x
        out += x
    ir = irs()
    ret = reverb(M.sends['room'], ir['room']) * db2lin(-6.0) + reverb(M.sends['hall'], ir['hall']) * db2lin(-3.0) \
        + reverb(M.sends['big'], ir['big']) * db2lin(-5.5)
    ret = lpf(hpf(ret, 250.0, 2), 8500.0) * duck_gain(DUCKS['returns'])
    stems['returns'] = ret
    return out + ret, stems


def tail_mask():
    """1 until TAIL_FADE[0]; then the gain falls along a curve in dB (−54·u² dB,
    the bend of a natural decay rather than a fader's cosine) to 29.9, the last
    20 ms eased to exact zero; digital zero from 29.9 to 30.0. The music has
    already let go (every source decays on its own), so this only trims."""
    g = np.ones(N)
    a, b = smp(TAIL_FADE[0]), smp(TAIL_FADE[1])
    u = (np.arange(b - a) + 1) / (b - a)
    g[a:b] = db2lin(-54.0 * u ** 2)
    z = smp(0.02)
    g[b - z:b] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(z) + 1) / z)
    g[b:] = 0.0
    return g


def master(bus):
    """DC block → mono lows → a touch of top polish → glue compression →
    loudness trim → look-ahead true-peak limiter (iterated to −14 LUFS) → DC
    blocker → tail."""
    info = {}
    x = hpf(bus, 20.0, 4)                                  # DC / infrasonic (24 dB/oct)
    m, s = 0.5 * (x[0] + x[1]), hpf(0.5 * (x[0] - x[1]), 110.0)
    x = np.stack([m + s, m - s])                           # mono below ~110 Hz
    x = eq(x, 'highshelf', 9000.0, -1.0, 0.7)              # warm top, no fizz
    pre_db = -18.0 - lufs(x)
    x *= db2lin(pre_db)
    x, g_glue = compressor(x, thresh_db=-13.0, ratio=2.0, attack=0.02, release=0.25, knee_db=8.0, sc_hpf=90.0)
    info['glue_gain'] = g_glue
    info['glue_max_gr_db'] = float(-lin2db(g_glue.min()))
    info['glue_mean_gr_db'] = float(-np.mean(lin2db(g_glue[smp(GROOVE[0]):smp(GROOVE[1])])))
    gain = TARGET_LUFS - lufs(x)
    mask = tail_mask()
    for _ in range(8):
        y, g_lim = limiter(x * db2lin(gain), LIMIT_DBTP)
        y = hpf(y, 10.0, 4)                                # DC blocker after the gain riding
        tp = true_peak_db(y)
        if tp > LIMIT_DBTP:
            y *= db2lin(LIMIT_DBTP - tp)
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


def gr_regions(g, thresh_db=0.5, merge=0.05):
    """Where a gain curve reduces by more than `thresh_db`: [(t0, t1, max dB)]."""
    idx = np.nonzero(g < db2lin(-thresh_db))[0]
    out = []
    for i in idx:
        if out and i - out[-1][1] <= smp(merge):
            out[-1][1] = i
        else:
            out.append([i, i])
    return [(a / SR, b / SR, float(-lin2db(g[a:b + 1].min()))) for a, b in out]


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
ONSET_BANDS = ((40.0, 200.0), (200.0, 1200.0), (1200.0, 5000.0), (5000.0, 16000.0))


def _band_env_db(x, lo, hi):
    """Causal band envelope: 8th-order Butterworth band-pass → 0.5 ms trailing RMS, in dB."""
    b = bpf(x, lo, hi, 4)
    w = smp(0.0005)
    return 10.0 * np.log10(np.maximum(uniform_filter1d(b * b, w, origin=w // 2 - 1), 1e-20))


@lru_cache(maxsize=64)
def _band_latency(lo, hi):
    """What onset() reports for a clean 1 ms-attack tone at the band centre over a
    noise floor ~20 dB down: the detector's own latency in a narrow band."""
    y = 0.02 * rng('onset calibration').standard_normal((2, smp(1.2)))
    n = smp(0.2)
    t = tvec(n)
    y[:, smp(1.0):smp(1.0) + n] += np.sin(TAU * np.sqrt(lo * hi) * t) * np.minimum(t / 0.001, 1.0) * np.exp(-t / 0.08)
    r = onset(y, 1.0, band=(lo, hi), need=6.0, calibrated=False)
    return r[0] - 1.0 if r else 0.0


def onset(y, c, band=None, need=10.0, pre=0.045, search=(-0.012, 0.02), calibrated=True):
    """Leading edge of the event at cue c in `y`, or None when it is masked.

    Per band (the four broad ones, or one narrow `band` around a tonal cue's
    carrier): causal envelope; floor = 80th percentile of [c − 45 ms, c − 6 ms];
    the onset is the first crossing of floor + 6 dB in the search window from
    which the envelope climbs to floor + `need` within 12 ms without sagging
    under floor + 4.5 dB. Every step is causal, so a band can only report
    late (conservative); a narrow tonal band is corrected by the detector's own
    latency, measured on a clean 1 ms-attack tone at its centre. The earliest
    band wins. Returns (t, rise dB, band)."""
    n = y.shape[-1]
    i0, i1 = max(0, smp(c - 0.1)), min(n, smp(c + 0.08))
    seg = y[:, i0:i1].mean(0)
    best = None
    for lo, hi in ([band] if band else ONSET_BANDS):
        e = _band_env_db(seg, lo, hi)
        floor = float(np.percentile(e[smp(c - pre) - i0:smp(c - 0.006) - i0], 80))
        s0 = smp(c + search[0]) - i0
        win = e[s0:smp(c + search[1] + 0.025) - i0]
        rise = float(win.max() - floor)
        if rise < need:
            continue
        loud = np.nonzero(win >= floor + need)[0]
        ups = np.nonzero((win[1:] > floor + 6.0) & (win[:-1] <= floor + 6.0))[0] + 1
        for j in ups:
            k = loud[loud >= j]
            if k.size and k[0] - j <= smp(0.012) and win[j:k[0] + 1].min() >= floor + 4.5:
                t_on = (i0 + s0 + j) / SR - (_band_latency(lo, hi) if band and calibrated else 0.0)
                if t_on <= c + search[1] and (best is None or t_on < best[0]):
                    best = (t_on, rise, (lo, hi))
                break
    return best


def tonal_band(name):
    """±1/4-octave band around a note's fundamental, for tonal cues."""
    f = hz(name)
    return (f / 1.19, f * 1.19)


def verify_cues():
    """Every cue that must be *heard* in sync: (time, label, narrow band or None,
    stem that carries the designed element)."""
    cues = [(CUP_1, 'cup #1 D4', None, 'cup')]    # ACCENT (15.65) is 25 ms after the 15.625 beat: stem-only
    cues += [(tk, f'spark {note}', None, 'keys') for tk, note, _p in SPARKS]
    cues += [(CUP_2, 'cup #2 A4', None, 'cup')]
    cues += [(k, 'kick', None, 'kick') for k in GROOVE_KICKS]
    cues += [(GRIP, 'grip clack', None, 'fx')]
    cues += [(MULTIPLY[0][0], 'bowls 1→2', None, 'cup'), (MULTIPLY[1][0], 'bowls 2→4', None, 'cup'),
             (MULTIPLY[2][0], 'four as one', None, 'cup')]
    cues += [(FOUR_CHIME, 'four chime', None, 'cup'), (ACCENT, 'accent*', 'stem', 'keys'),
             (HANDOFF, 'hand-off', None, 'cup')]
    cues += [(tk, f'ember {note}', None, 'keys') for tk, note, _p in SPLIT_TONES]
    cues += [(LOGO, 'LOGO', None, 'kick')]
    cues += [(tk, f'tick {note}', None, 'fx') for tk, note in LINE_TICKS]
    return sorted(cues)


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


SECTIONS = [(0.0, 5.0, 'S1 tale'), (5.0, 7.5, 'S2 underst'), (7.5, 10.0, 'S3 make'), (10.0, 15.0, 'S4 worlds'),
            (15.0, 17.5, 'S5 system'), (17.5, 22.5, 'S6 renew'), (22.5, 25.0, 'S7 build'), (25.0, 29.9, 'S7 mark')]
BANDS = [(20, 60, 'sub'), (60, 200, 'low'), (200, 400, 'mud'), (400, 2000, 'mid'), (2000, 6000, 'hmid'),
         (6000, 12000, 'high'), (12000, 24000, 'air')]


def spectral_report(y):
    """Per section: band energy vs total; % of power above 6 kHz; centroid; the
    loudest 1/3-octave above 6 kHz relative to the 2–5 kHz presence average
    (a smooth, non-piercing top sits below it); the worst narrow spike above
    6 kHz (bins within 35 dB of the section's loudest only); and mud = the
    200–400 Hz octave's level against the mean of its neighbour octaves."""
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
        ref = third[(centres >= 2000) & (centres <= 5100)].mean()
        hf_third = float(10 * np.log10(third[centres > 6000].max() / ref + 1e-20))
        centroid = float((f * P).sum() / P.sum())
        pct_hf = float(P[f > 6000].sum() / tot * 100)

        def octave(Q, lo):
            return 10 * np.log10(Q[(f >= lo) & (f < 2 * lo)].sum() + 1e-30)
        mud = float(octave(P, 200.0) - 0.5 * (octave(P, 100.0) + octave(P, 400.0)))
        bed = P.copy()                         # running median over ±⅙ octave: sustained tonal lines removed,
        for i in np.nonzero((f >= 90.0) & (f <= 850.0))[0]:        # what is left is the dense bed that reads as mud
            bed[i] = np.median(P[(f >= f[i] * 2 ** (-1 / 6)) & (f <= f[i] * 2 ** (1 / 6))])
        mud_bed = float(octave(bed, 200.0) - 0.5 * (octave(bed, 100.0) + octave(bed, 400.0)))
        rows.append((name, bands, pct_hf, centroid, hf_third, spike, spike_f, mud, mud_bed))
    return rows


def section_loudness(y):
    """Per section: mean and max momentary loudness (0.4 s), time of the max,
    and max short-term loudness (3 s windows centred in the section)."""
    t, lv = loudness_curve(y, 0.4, 0.05)
    ts, ls = loudness_curve(y, 3.0, 0.05)
    out = []
    for a, b, name in SECTIONS:
        m = (t >= a) & (t < b)
        ms = (ts >= a) & (ts < b)
        p = 10 ** ((lv[m] + 0.691) / 10)
        out.append((name, float(-0.691 + 10 * np.log10(p.mean() + 1e-20)), float(lv[m].max()),
                    float(t[m][np.argmax(lv[m])]), float(ls[ms].max()) if ms.any() else -99.0))
    return out


def analyse_cup():
    """The cup's voice on its own (strike #1's exact settings): partial ratios
    from the spectrum, the fundamental's beat rate, per-partial T60, the
    attack time, clicks. Returns (report lines, stereo solo signal)."""
    solo = cup('D4', 6.0, ring=4.0, key='strike1')
    mono = solo.mean(0)
    lines = []
    seg = mono[smp(0.1):smp(3.1)]
    F = np.abs(np.fft.rfft(seg * np.hanning(seg.size)))
    fr = np.fft.rfftfreq(seg.size, 1.0 / SR)
    f0 = hz('D4')
    found = []
    for ratio in BOWL_RATIOS:
        fe = f0 * ratio
        m = (fr > fe * 0.97) & (fr < fe * 1.03)
        if not m.any() or fe > 7000:
            continue
        fp = float(fr[m][np.argmax(F[m])])
        found.append((ratio, fp / f0, float(20 * np.log10(F[m].max() / F.max()))))
    lines.append('partials (design ratio → measured ratio, level): ' +
                 ', '.join(f'{a:.3f}→{b:.3f} ({c:+.0f} dB)' for a, b, c in found))
    env_rows = []
    for ratio in BOWL_RATIOS[:4]:
        fe = f0 * ratio
        bp = sps.sosfiltfilt(sps.butter(4, (fe * 0.985, fe * 1.015), btype='bandpass', fs=SR, output='sos'), mono)
        env = np.abs(sps.hilbert(bp))
        de = env[::480]                                         # 100 Hz envelope
        td = np.arange(de.size) * 0.01
        m = (td > 0.3) & (td < 5.5)
        slope = np.polyfit(td[m], 20 * np.log10(de[m] + 1e-12), 1)[0]
        ld = np.log(de[m] + 1e-12)
        ld = ld - np.polyval(np.polyfit(td[m], ld, 1), td[m])
        spec = np.abs(np.fft.rfft(ld * np.hanning(ld.size), 8192))
        bf = np.fft.rfftfreq(8192, 0.01)
        k = (bf > 0.2) & (bf < 8.0)
        env_rows.append((ratio, -60.0 / slope if slope < 0 else np.inf, float(bf[k][np.argmax(spec[k])])))
    lines.append('decay & beating: ' + ', '.join(f'×{a:.3f}: T60 {b:.1f} s, beats {c:.2f} Hz' for a, b, c in env_rows))
    e = np.abs(sps.hilbert(mono[:smp(0.05)]))
    e = uniform_filter1d(e, 24)
    pk = e.max()
    t10, t90 = np.argmax(e > 0.1 * pk) / SR, np.argmax(e > 0.9 * pk) / SR
    lines.append(f'attack 10→90 % {1000 * (t90 - t10):.1f} ms (first sample {mono[0]:.1e}) · '
                 f'clicks {len(detect_clicks(solo, floor=1e-4))} · '
                 f'L/R corr {np.corrcoef(solo[0], solo[1])[0, 1]:.2f} · '
                 f'mono fold {lufs(np.repeat(solo.mean(0, keepdims=True), 2, 0)) - lufs(solo):+.1f} dB')
    return lines, solo


_WARM = {'ink': (17, 19, 17), 'umber': (68, 55, 46), 'copper': (180, 111, 67), 'hot': (209, 109, 62),
         'ember': (255, 180, 142), 'ivory': (238, 234, 213), 'mute': (151, 158, 145), 'line': (80, 86, 74)}


def _cmap(v):
    stops = np.array([0.0, 0.25, 0.5, 0.7, 0.87, 1.0])
    cols = np.array([_WARM['ink'], _WARM['umber'], _WARM['copper'], _WARM['hot'], _WARM['ember'], _WARM['ivory']],
                    float)
    return np.stack([np.interp(v, stops, cols[:, c]) for c in range(3)], -1).astype(np.uint8)


def render_png(y, path, t0, t1, title='', marks=(), gr=None, width=1800, fmax=22000.0):
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
    img[:] = _WARM['ink']
    i0, i1 = smp(t0), min(y.shape[1], smp(t1))
    seg = y[:, i0:i1]
    n = seg.shape[1]
    cols = np.linspace(0, n, PW + 1).astype(int)
    half = H_WAV // 2
    for ch in (0, 1):
        top = H_T + ch * half
        mid = top + half / 2
        mx = np.maximum.reduceat(seg[ch], cols[:-1])
        mn = np.minimum.reduceat(seg[ch], cols[:-1])
        rms = np.sqrt(np.add.reduceat(seg[ch] ** 2, cols[:-1]) / np.maximum(np.diff(cols), 1))
        amp = half / 2 - 3
        rr = np.arange(top, top + half)[:, None]
        m1 = (rr >= (mid - mx * amp)[None, :]) & (rr <= (mid - mn * amp)[None, :])
        m2 = (rr >= (mid - rms * amp)[None, :]) & (rr <= (mid + rms * amp)[None, :])
        blk = img[top:top + half, LM:LM + PW]
        blk[m1] = _WARM['copper']
        blk[m2] = _WARM['ivory']
        for lvl in (db2lin(-1.0), -db2lin(-1.0)):
            img[int(mid - lvl * amp), LM:LM + PW:4] = _WARM['hot']
    ld_top = H_T + H_WAV + 8
    ld_h = H_LD - 16
    tm, lm = loudness_curve(y, 0.4, 0.01)
    ts_, ls_ = loudness_curve(y, 3.0, 0.05) if y.shape[1] > smp(3.2) else (tm, lm)
    px_t = t0 + (np.arange(PW) + 0.5) / PW * (t1 - t0)

    def ly(v):
        return (ld_top + ld_h * (1 - np.clip((v + 40.0) / 36.0, 0, 1))).astype(int)
    img[ly(np.array([-14.0]))[0], LM:LM + PW:3] = _WARM['mute']
    for arr_t, arr_v, col in ((tm, lm, _WARM['ember']), (ts_, ls_, _WARM['ivory'])):
        img[ly(np.interp(px_t, arr_t, arr_v)), LM + np.arange(PW)] = col
    if gr is not None:
        g = gr[i0:i1]
        gmin = np.minimum.reduceat(g, cols[:-1])
        d = np.clip(-lin2db(gmin) / 6.0, 0, 1) * ld_h
        for x_ in np.nonzero(d > 0.5)[0]:
            img[ld_top:ld_top + int(d[x_]), LM + x_] = _WARM['hot']
    sp_top = H_T + H_WAV + H_LD
    mono = seg.mean(0)
    nper = 4096 if (t1 - t0) > 5 else 2048 if (t1 - t0) > 1 else 1024
    hop = max(8, n // (PW * 2))
    pad_ = np.pad(mono, (nper // 2, nper // 2))
    frames = np.lib.stride_tricks.sliding_window_view(pad_, nper)[::hop]
    S = np.abs(np.fft.rfft(frames * np.hanning(nper), axis=1)) / (nper / 4)
    Sdb = 20 * np.log10(S + 1e-9)
    fcols = np.minimum((cols[:-1] / hop).astype(int), len(Sdb) - 1)
    Sc = np.maximum.reduceat(Sdb, fcols, axis=0) if len(set(fcols)) == len(fcols) else Sdb[fcols]
    f_rows = np.geomspace(fmax, 25.0, H_SP)
    b = np.clip(np.round(f_rows * nper / SR).astype(int), 1, nper // 2)
    img[sp_top:sp_top + H_SP, LM:LM + PW] = _cmap(np.clip((Sc[:, b].T + 110.0) / 100.0, 0, 1))
    grid = [fl for fl in (100, 200, 400, 1000, 6000, 10000) if fl < fmax]
    for fl in grid:
        yy = sp_top + int(np.argmin(np.abs(f_rows - fl)))
        img[yy, LM:LM + PW:(3 if fl in (200, 400, 6000) else 6)] = _WARM['ivory'] if fl == 6000 else _WARM['line']
    im = Image.fromarray(img)
    dr = ImageDraw.Draw(im, 'RGBA')

    def tx(t):
        return LM + (t - t0) / (t1 - t0) * PW
    lane = 0
    for t, lab in marks:
        if not (t0 <= t <= t1):
            continue
        x_ = tx(t)
        dr.line([(x_, H_T - 2), (x_, H - H_AX)], fill=(255, 180, 142, 110), width=1)
        dr.text((x_ + 3, H_T - 16 - 13 * (lane % 3)), lab, font=font, fill=(255, 180, 142, 255))
        lane += 1
    dr.text((LM, 4), title, font=font_b, fill=_WARM['ivory'])
    span = t1 - t0
    step = 1.0 if span > 12 else 0.5 if span > 3 else 0.1 if span > 0.8 else 0.02
    t = np.ceil(t0 / step) * step
    while t <= t1 + 1e-9:
        x_ = tx(t)
        dr.line([(x_, H - H_AX), (x_, H - H_AX + 6)], fill=_WARM['mute'])
        dr.text((x_ - 14, H - H_AX + 9), f'{t:.2f}', font=font, fill=_WARM['mute'])
        t += step
    for fl in grid:
        yy = sp_top + int(np.argmin(np.abs(f_rows - fl)))
        dr.text((8, yy - 7), f'{fl // 1000}k' if fl >= 1000 else str(fl), font=font, fill=_WARM['mute'])
    dr.text((8, H_T + 4), 'L', font=font, fill=_WARM['mute'])
    dr.text((8, H_T + half + 4), 'R', font=font, fill=_WARM['mute'])
    dr.text((8, ld_top), 'LUFS', font=font, fill=_WARM['mute'])
    dr.text((8, ld_top + 14), '-14', font=font, fill=_WARM['mute'])
    im.save(path)


def verify(path, M, stems, info, preview=True):
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
    check(tp <= CEILING_DBTP, f'true peak   {tp:.2f} dBTP (4× oversampled)')
    check(abs(L - TARGET_LUFS) <= 0.5, f'integrated  {L:.2f} LUFS (BS.1770-4, gated)')
    tm, lm = loudness_curve(y, 3.0, 0.1)
    tmm, lmm = loudness_curve(y, 0.4, 0.01)
    print(f'  short-term max {lm.max():.1f} LUFS @ {tm[np.argmax(lm)]:.1f} s · momentary max {lmm.max():.1f} LUFS '
          f'@ {tmm[np.argmax(lmm)]:.2f} s · PLR {tp - L:.1f} dB')
    print(f"  glue comp GR max {info['glue_max_gr_db']:.1f} dB (mean {info['glue_mean_gr_db']:.2f} dB in the groove) · "
          f"limiter GR max {info['limiter_max_gr_db']:.1f} dB, >1 dB on {info['limiter_pct_over_1db']:.2f}% of samples")
    for name, key in (('limiter', 'limiter_gain'), ('glue', 'glue_gain')):
        regs = gr_regions(info[key], 1.0)
        print(f'  {name} >1 dB: ' + (', '.join(f'{a:.2f}–{b:.2f} ({m:.1f})' for a, b, m in regs[:10]) or 'nowhere'))
    dc = y.mean(axis=1)
    infra = sps.sosfiltfilt(sps.butter(4, 8.0, fs=SR, output='sos'), y, axis=-1)
    check(np.all(np.abs(dc) < 1e-4) and np.abs(infra).max() < 1e-3,
          f'DC offset L {dc[0]:+.1e} R {dc[1]:+.1e} · worst infrasonic (< 8 Hz) excursion {np.abs(infra).max():.1e} '
          f'@ {np.argmax(np.abs(infra).max(0)) / SR:.2f} s')
    print('\n── stereo & mono')
    corr = np.corrcoef(y[0, :smp(SILENT_FROM)], y[1, :smp(SILENT_FROM)])[0, 1]
    hi = hpf(y, 300.0, 4)
    widths, folds = [], []
    for a_, b_, name in SECTIONS:
        seg = y[:, smp(a_):smp(b_)]
        mono = np.repeat(seg.mean(0, keepdims=True), 2, axis=0)
        folds.append(lufs(mono) - lufs(seg))
        widths.append(f'{name.split()[1]} {np.corrcoef(*hi[:, smp(a_):smp(b_)])[0, 1]:.2f}/{folds[-1]:+.1f}')
    print(f'  L/R correlation {corr:.2f} full band · per section (>300 Hz corr / mono fold-down dB):')
    print('  ' + ', '.join(widths))
    lo_side = lpf(0.5 * (y[0] - y[1]), 100.0, 4)
    lo_mid = lpf(0.5 * (y[0] + y[1]), 100.0, 4)
    print(f'  side/mid energy below 100 Hz {10 * np.log10(np.sum(lo_side ** 2) / np.sum(lo_mid ** 2) + 1e-20):.1f} dB')
    check(min(folds) > -1.5 and corr > 0.3, f'mono-compatible: fold-down loses at most {-min(folds):.1f} dB in any section')
    print('\n── onset timing (causal leading edge vs cue) — in the mix, and the designed element in its stem')
    errs, lines, masked, stem_errs = [], [], [], []
    for c, lab, band, stem in verify_cues():
        stem_only = band == 'stem'
        r_ = None if stem_only else onset(y, c, band, need=6.0 if band else 10.0)
        rs = onset(stems[stem], c, None, need=10.0) if stem else None
        se = f'{(rs[0] - c) * 1000:+5.2f}' if rs else ' n/a '
        if rs:
            stem_errs.append(abs(rs[0] - c) * 1000)
        else:
            masked.append(f'{lab} {c:.3f} (stem)')
        if r_ is None:
            if not stem_only:
                masked.append(f'{lab} {c:.3f}')
            lines.append(f'{c:6.3f} {lab:<12} {"(stem only)" if stem_only else "MASKED"}  | {stem} {se}')
            continue
        e = (r_[0] - c) * 1000
        errs.append(abs(e))
        lines.append(f'{c:6.3f} {lab:<12} {e:+5.2f} ms ({r_[1]:4.1f} dB {r_[2][0]:.0f}-{r_[2][1] / 1000:.2g}k) | {stem} {se}')
    for i in range(0, len(lines), 2):
        print('  ' + '   '.join(f'{s:<66}' for s in lines[i:i + 2]))
    check(not masked and max(errs) <= 5.0 and max(stem_errs) <= 5.0,
          f'mix: max |error| {max(errs):.2f} ms, mean {np.mean(errs):.2f} ms over {len(errs)} cues · '
          f'stems: max {max(stem_errs):.2f} ms' + (f' · masked: {", ".join(masked)}' if masked else ' · none masked'))
    placed = {lab: M.times(lab) for lab in ('kick', 'cup strike', 'bowl', 'spark ping', 'annotation tick', 'line tick')}
    want = {'kick': sorted(GROOVE_KICKS + [22.5, 23.75, 24.375, 24.6875]), 'cup strike': [CUP_1, CUP_2],
            'bowl': sorted({tk for tk, _ in MULTIPLY} | {FOUR_CHIME}), 'spark ping': [s[0] for s in SPARKS],
            'annotation tick': [a[0] for a in ANNOTATIONS], 'line tick': [a[0] for a in LINE_TICKS]}
    check(all(np.allclose(placed[k], want[k], atol=0.5 / SR) for k in want),
          'placement: every cue element starts on its exact sample (kicks, strikes, bowls, sparks, ticks)')
    print('\n── click detection')
    clicks = detect_clicks(y)
    check(len(clicks) == 0, f'{len(clicks)} abnormal discontinuities in the master' +
          (': ' + ', '.join(f'{c:.4f}' for c in clicks[:12]) if clicks else ''))
    for name, st in stems.items():
        c = detect_clicks(st, floor=0.002)
        if c:
            print(f'    stem {name}: {len(c)} → ' + ', '.join(f'{v:.4f}' for v in c[:8]))
    print(f'  largest sample-to-sample step {np.abs(np.diff(y, axis=1)).max():.3f} FS')
    print('\n── spectral balance (dB rel. total, per section)')
    print('  section     ' + ' '.join(f'{b[2]:>6}' for b in BANDS) +
          '   >6k%  centroid  HF⅓oct-vs-2-5k  HF spike      mud: tonal/bed')
    spec_ok = True
    for name, bands, pct, cen, hf3, spike, sf, mud, mud_bed in spectral_report(y):
        bad = hf3 >= 0.0 or spike >= 12.0 or pct > 3.0 or mud_bed > 2.0
        spec_ok &= not bad
        print(f'  {name:<11} ' + ' '.join(f'{v:6.1f}' for v in bands) +
              f'  {pct:5.2f}  {cen:7.0f}  {hf3:+10.1f} dB  {spike:4.1f} dB @{sf / 1000:.1f}k  {mud:+5.1f}/{mud_bed:+5.1f}'
              + ('  <-- check' if bad else ''))
    check(spec_ok, 'nothing piercing above 6 kHz (⅓-oct < presence, spikes < 12 dB, < 3 % power) and no '
                   '200–400 Hz build-up (bed ≤ +2 dB vs neighbour octaves; "tonal" includes sustained notes)')
    print('\n── loudness arc (per section: mean / max momentary LUFS @ time · max short-term)')
    arc = section_loudness(y)
    for i in range(0, len(arc), 4):
        print('  ' + ' · '.join(f'{n.split()[1]} {m:.1f}/{x:.1f}@{tx_:.2f} st {s_:.1f}' for n, m, x, tx_, s_ in arc[i:i + 4]))
    ts3, ls3 = loudness_curve(y, 3.0, 0.05)
    fin_st = float(ls3[ts3 - 1.5 >= LOGO - 0.05].max())            # 3 s windows from the lock on
    oth_st = float(ls3[ts3 + 1.5 <= LOGO].max())                   # 3 s windows wholly before it
    fin_m, oth_m = arc[-1][2], max(a[2] for a in arc[:-1])
    check(fin_st >= oth_st + 0.5 and fin_m >= oth_m and LOGO <= arc[-1][3] <= LOGO + 1.0,
          f'the logo lock is the climax: short-term {fin_st:.1f} vs {oth_st:.1f} LUFS before it; '
          f'momentary {fin_m:.1f} @ {arc[-1][3]:.2f} vs {oth_m:.1f}')
    tail = y[:, smp(SILENT_FROM):]
    pre = y[:, smp(29.8):smp(SILENT_FROM)]
    pre_db = lin2db(np.sqrt(np.mean(pre ** 2)) + 1e-12)
    check(not tail.any() and pre_db < -45.0,
          f'tail: 29.8–29.9 at {pre_db:.0f} dBFS RMS (near-silence), 29.9–30.0 digital zero ({tail.shape[1]} frames)')
    print(f'  first sample {np.abs(y[:, 0]).max():.5f} · 0–0.1 s peak {lin2db(np.abs(y[:, :smp(0.1)]).max()):.0f} dBFS')
    print('\n── the cup\'s voice (solo)')
    cup_lines, solo = analyse_cup()
    for s in cup_lines:
        print('  ' + s)
    print('\n── stems (integrated LUFS / peak dBFS, pre-master gain)')
    for name, st in stems.items():
        if np.abs(st).max() > 0:
            print(f'  {name:<8} {lufs(st):6.1f} LUFS   peak {lin2db(np.abs(st).max()):6.1f}')
    if preview:
        os.makedirs(PREVIEW, exist_ok=True)
        marks = [(RIM_LIGHT, 'rim'), (CUP_1, 'CUP 1'), (2.5, 'A'), (3.125, 'D'), (3.75, 'F'), (DIVE[0], 'dive'),
                 (CUP_2, 'CUP 2'), (5.6, 'a1'), (5.9, 'a2'), (6.2, 'a3'), (7.0, 'swell'), (7.5, 'GROOVE'),
                 (GRIP, 'grip'), (8.75, '1→2'), (9.375, '2→4'), (10.0, 'FOUR'), (11.25, 'pings'), (12.5, 'focus'),
                 (13.125, 'shutter'), (13.75, 'soil'), (14.375, 'sprout'), (15.0, 'CHIME'), (15.625, 'lift'),
                 (16.875, 'sink'), (17.5, 'RENEW'), (18.4, 'pencil'), (20.0, 'HAND-OFF'), (21.25, 'riser'),
                 (22.9, 'e1'), (23.2, 'e2'), (23.5, 'e3'), (23.75, 'roll'), (25.0, 'LOGO'), (25.625, 'lift'),
                 (26.25, 'tick'), (27.5, 'tick'), (29.9, 'zero')]
        gr = info.get('limiter_gain')
        render_png(y, os.path.join(PREVIEW, 'audio-overview.png'), 0, DUR,
                   f'film.wav · {L:.1f} LUFS · TP {tp:.2f} dBTP · 96 BPM D minor/dorian', marks, gr)
        for fname, a_, b_, ttl in (('audio-1-tale.png', 0.0, 5.3, 'S1 the tale · 0–5 · mystery'),
                                   ('audio-2-understand-make.png', 4.8, 10.3, 'S2 understand → S3 make'),
                                   ('audio-3-worlds-system.png', 9.8, 17.6, 'S4 four worlds → S5 one system'),
                                   ('audio-4-renew.png', 17.3, 22.7, 'S6 renew · intimate'),
                                   ('audio-5-mark.png', 22.3, 30.0, 'S7 build → logo → tail')):
            render_png(y, os.path.join(PREVIEW, fname), a_, b_, ttl, marks, gr)
        render_png(y, os.path.join(PREVIEW, 'audio-6-impact-zoom.png'), 24.8, 25.3, 'breath → logo impact',
                   [(25.0, '25.00')], gr)
        render_png(y, os.path.join(PREVIEW, 'audio-7-strike-zoom.png'), 0.95, 1.2, 'cup strike #1 transient',
                   [(1.0, '1.00')], gr)
        render_png(solo, os.path.join(PREVIEW, 'audio-8-cup-voice.png'), 0.0, 6.0,
                   'the cup\'s voice, solo: struck bowl D4 (partials 1 · 2.745 · 5.21 · 8.37 · 12.2)',
                   [(0.0, 'strike')], None, fmax=8000.0)
        print(f'\n  previews → {os.path.relpath(PREVIEW, ROOT)}/audio-*.png')
    return ok


# ════════════════════════════════════════════════════════════════════════════
def main():
    t_start = time.time()
    preview = '--no-preview' not in sys.argv
    print('RIBHU LABS — "One Cup, Made Four" · score & sound design')
    M = arrange()
    print(f'  arranged {len(M.events)} events in {time.time() - t_start:.1f} s')
    print('\n── cue sheet (§4, as rendered)')
    for a, b, what in CUES:
        print(f"  {a:6.3f}{'–' + format(b, '6.3f') if b is not None else '       '}  {what}")
    bus, stems = mix_bus(M)
    y, mask, info = master(bus)
    scale = db2lin(info['trim_db'])
    stems = {k: v * scale for k, v in stems.items()}
    pcm = to_int16(y, mask)
    write_wav(OUT_WAV, pcm)
    print(f'\n  wrote {os.path.relpath(OUT_WAV, ROOT)} in {time.time() - t_start:.1f} s (master trim {info["trim_db"]:+.1f} dB)')
    ok = verify(OUT_WAV, M, stems, info, preview)
    print(f"\n{'ALL CHECKS PASSED' if ok else 'SOME CHECKS FAILED'} · {time.time() - t_start:.1f} s")
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
