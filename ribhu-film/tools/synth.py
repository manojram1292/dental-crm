#!/usr/bin/env python3
"""
RIBHU LABS — "ONE CUP, MADE FOUR" · score & sound-design synthesiser (REVISION 2)
================================================================================

Deterministically synthesises ``audio/film.wav``: 48 kHz, stereo, 16-bit PCM,
exactly 1 872 000 frames (39.000 s), 80 BPM (beat 0.75 s, bar 3.0 s), D minor
with a D-dorian colour. No samples and no network: every sound is numpy/scipy
maths driven by seeded RNGs, so two runs give bit-identical files.

Revision 2 (STORYBOARD.md, the REVISION 2 block): the picture is still authored
on the 30 s STORY timeline, and the film plays it through REEL.TIMEMAP
[[0, 0], [21, 17.5], [30, 22.5], [39, 30]] (film s, story s). Every cue outside
Renew keeps its story time from STORYBOARD §4 and the scene files and is placed
at film_time(story) (ft() below): film = 1.2 × story up to story 17.5 and
film = 30 + 1.2 × (story − 22.5) from story 22.5. The score is RE-SYNTHESISED
at those times, never time-stretched or resampled: pitch and timbre (decays,
attacks, partials) are unchanged, while the grooves, arpeggios, rolls, echoes
and 16th grids count in the film's own 80 BPM BEAT/S16/S32 (96 → 80 BPM is the
same 1.2×, so every story beat lands on a film beat). Renew (film 21.0–30.0,
bars 8–10) is recomposed in film time for the new slow-motion hand-off.

Other departures from §4, on purpose: no kick on the lift (the lights rise
weightless and the accent lands clean instead of flamming after a kick); the
groove's last kick lands with the merge flare; the "four as one" bowls ripple
5 ms apart along the row, and the logo chord is rolled over 48 ms.

    python3 tools/synth.py               render, print metrics, write previews
    python3 tools/synth.py --no-preview  skip the PNG previews

Layout
  1. constants, the time map (film_time) & beat helpers
  2. DSP utilities: envelopes, band-limited oscillators, noise, filters (scipy
     biquads plus a TPT state-variable filter for sweeps), convolution reverb
     with generated impulse responses, stereo tools, dynamics, BS.1770 loudness
  3. instruments
       3a the copper cup's voice (modal singing bowl)
       3b keys: felt piano, FM mallet, bells, glass
       3c pads, bass and sub
       3d workshop percussion: felt kick, shaker, anvil, hand-hammer
       3e sound design: servo, sparks, scan, paper, soil, pencil, air …
       3f Renew (rev 2): the sung bowl, the slender servo, breath pad, held glass, seed trail
  4. cue list (film seconds) & arrangement
  5. mix bus & master chain (low-bus peak control, glue, true-peak limiter)
  6. verification: format, level, LUFS, DC, clicks, stereo/mono, spectral
     balance, the loudness arc, the cup voice's own analysis, PNG previews,
     and every picture cue isolated from the rest of the mix (its own share
     of the master against everything else) to prove it is heard, in sync
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
from scipy.ndimage import minimum_filter1d, uniform_filter1d

# ════════════════════════════════════════════════════════════════════════════
# 1. Constants, the time map & beat helpers
# ════════════════════════════════════════════════════════════════════════════
SR = 48_000
N = 1_872_000                 # 39.000 s, exactly
DUR = N / SR
BPM = 80                      # REEL.FILM_BPM: uniform in film time
BEAT = 60.0 / BPM             # 0.75 s
BAR = 4 * BEAT                # 3.0 s: film scene boundaries sit on bars
S8, S16, S32 = BEAT / 2, BEAT / 4, BEAT / 8
STORY_BPM = 96                # the story timeline the scenes are authored on
STRETCH = STORY_BPM / BPM     # 1.2: one story second outside Renew lasts 1.2 film seconds
# REEL.TIMEMAP as (film s, story s) breakpoints, piecewise-linear (src/engine.js)
TIMEMAP = ((0.0, 0.0), (21.0, 17.5), (30.0, 22.5), (39.0, 30.0))


def film_time(T):
    """Story seconds → film seconds (REEL.filmTime): piecewise-linear through TIMEMAP.
    Multiplies before it divides, so story beats land exactly (2.5 → 3.0, 3.125 → 3.75)."""
    for (f0, s0), (f1, s1) in zip(TIMEMAP, TIMEMAP[1:]):
        if T <= s1 or s1 == TIMEMAP[-1][1]:
            return round(f0 + (T - s0) * (f1 - f0) / (s1 - s0), 9)


ft = film_time


def sd(d):
    """A picture-tied story duration outside Renew (a servo move, a sweep, a slide) → film
    seconds. Decays, attacks and other timbre stay in absolute seconds and never scale."""
    return d * STRETCH


def ftp(points):
    """Automation breakpoints [(story s, dB)] → [(film s, dB)]."""
    return [(ft(t), v) for t, v in points]


SEED = 1729
TARGET_LUFS = -14.0
CEILING_DBTP = -1.0           # hard spec
LIMIT_DBTP = -1.3             # limiter target: margin for dither and rounding
LOW_HEADROOM = 4.5            # the band under 140 Hz peaks at most this far under the ceiling
SILENT_FROM = DUR - 0.1       # 38.9: the last 0.1 s is digital zero
TAIL_FADE = (ft(29.1), SILENT_FROM)
TALE_DB = -5.0                # mystery: the tale sits well under the groove …
UNDER_DB = -4.0               # … and Understand a little closer to it (curiosity)
RENEW_DB = -5.0               # intimacy
BUILD_DB = -3.0               # the build rises into the lock but never past it
LOGO_DB = 1.0                 # the lock and its tail
GROOVE_DB = -5.25             # one trim for the whole groove (kick, bass, shaker, metal, pad, mallet)
TOP = 11_000.0                # the palette's ceiling for tones (bells, glass, shimmer): air, never fizz
TOP_NOISE = 9_000.0           # … and for noise-based sound design (paper, pencil, whooshes, crackle)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_WAV = os.path.join(ROOT, 'audio', 'film.wav')
PREVIEW = os.path.join(ROOT, '.preview')
TAU = 2.0 * np.pi


def at(bar, beat=1, step=0.0):
    """Musical (film) time → seconds at 80 BPM. Bar 1 beat 1 = 0.0; `step` counts 16ths.
    Renew is bars 8–10 (21.0 / 24.0 / 27.0); the logo locks on bar 12 (33.0)."""
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
        if fk > TOP:
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
    top = max(1.5 * f0, min(9.0 * f0, 7500.0))
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
    i_max = max(0.0, (8000.0 - freq) / (freq * ratio) - 1.0)
    idx = min(index, i_max) * decay(t, dec * 0.35)
    x = np.sin(TAU * _wrap(freq * t) + idx * np.sin(TAU * _wrap(freq * ratio * t))) * decay(t, dec)
    return fade(lpf(x, TOP), 0.0015, 0.02)


def glass(freq, dur=0.6, dec=0.25, index=0.5, ratio=1.4142):
    """Glassy ping: sine with a little inharmonic FM that dies quickly."""
    n = smp(dur)
    t = tvec(n)
    idx = index * decay(t, dec * 0.3)
    x = np.sin(TAU * _wrap(freq * t) + idx * np.sin(TAU * _wrap(freq * ratio * t))) * decay(t, dec)
    return fade(lpf(x, TOP), 0.0012, 0.02)


def warm_bell(f0, dur=4.0, key=0):
    """The hand-off bell: a 1:1 FM 'tine' (warm, harmonic) fused with the cup's
    own bowl voice an octave up, so the ember still sounds like the cup."""
    n = smp(dur)
    t = tvec(n)
    idx = 1.1 * decay(t, 0.3) + 0.12
    ph = TAU * _wrap(f0 * t)
    tine = np.sin(ph + idx * np.sin(ph)) * decay(t, 1.8)
    st = pan_mono(tine * 0.8, 0.0) + 0.6 * bowl(f0, dur, ring=3.2, hardness=0.75, key=('warm', key), width=0.35)
    return fade(lpf(st, 9000.0), 0.0015, 0.2)


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


def sub_drone(f, dur, h2=0.35, breathe=0.06, h3=0.05):
    """Deep, clean sub: a sine on the root with a soft octave (for small
    speakers) and a slow breath."""
    n = smp(dur)
    t = tvec(n)
    x = osc_sine(f, n) + h2 * osc_sine(2 * f, n, 0.25) + h3 * osc_sine(3 * f, n, 0.1)
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
    'heart': (100.0, 52.0, 0.030, 0.200, 0.50, 0.22),
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
    x = bpf(r.standard_normal(n), 3000.0, 9500.0, 2) * burst_env(t, 0.0, 0.005, 0.025)
    x = lpf(x, TOP)
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
        if f < 9000.0:
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
        out.append(lpf(hpf(pink(n, r), 70.0), 1800.0) + 0.25 * bpf(pink(n, r), 2500.0, 9000.0))
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
    air = np.stack([bpf(pink(n, rng('dust air', key, c)), 3500.0, 10000.0) for c in range(2)]) * 0.06
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
    x = lpf((x / len(notes_) + glint) * env, TOP)
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
    x = lpf(x, TOP_NOISE)
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
    return fade(pan_mono(lpf(x * env, TOP_NOISE), 0.0), 0.004, 0.03)


def data_tick(freq, key=0, tau=0.003, noise=0.15):
    """A tiny soft data tick: a decaying sine and a breath of band-passed noise."""
    n = smp(0.04)
    t = tvec(n)
    nz = bpf(rng('tick', key).standard_normal(n), 2000.0, 6000.0)
    x = osc_sine(freq, n) * decay(t, tau) + noise * nz * decay(t, tau * 0.5)
    return fade(x, 0.001, 0.008)


def servo(dur, f0, f1, key=0, accel=0.25, decel=0.3, whine_x=6.5, whine_amt=0.3):
    """Robotic-hand servo whir: a PolyBLEP saw motor whose pitch follows the
    move's speed profile (accelerate → cruise → settle), band-passed, with a
    gear-mesh whine at `whine_x` × and a tooth ripple at f/4, plus a little air."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('servo', key)
    sp = smoothstep(u / accel) * (1.0 - smoothstep((u - (1.0 - decel)) / decel))
    f = f0 + (f1 - f0) * sp
    body = bpf(osc_saw(f, n, r.random()), 250.0, 2400.0, 2)
    whine = whine_amt * osc_sine(np.minimum(f * whine_x, 5000.0), n, r.random())
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
    x = fade(lpf(x, TOP_NOISE), 0.001, 0.03)
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
    return fade(pan_mono(lpf((band + sheen) * env, TOP_NOISE), pan0 + (pan1 - pan0) * smoothstep(u)), 0.01, 0.02)


def paper_flick(dur, key=0):
    """A paper slip: band-passed noise with a fast flutter (the slip fluttering
    as it falls), a 6 ms swell and a quick fade."""
    n = smp(dur)
    t = tvec(n)
    r = rng('paper', key)
    nz = bpf(r.standard_normal(n), 900.0, 8000.0)
    fl = (0.5 + 0.5 * np.sin(TAU * _wrap(cycles(r.uniform(28, 55) * (1.0 - 0.4 * t / dur), n)))) ** 2
    x = nz * (0.35 + 0.65 * fl) * burst_env(t, 0.0, 0.006, dur * 0.35)
    return fade(lpf(x, TOP_NOISE), 0.002, 0.01)


def sort_tick(key=0, tab=None):
    """Card-sorting tick: a small wooden tick with a paper tap. With `tab` (Hz) the
    card's copper index tab answers: a bright two-partial tink (bar ratio 2.76)
    that rings ~40 ms, so the accented ticks read through the groove."""
    n = smp(0.09 if tab else 0.06)
    t = tvec(n)
    r = rng('sort', key)
    x = osc_sine(1650.0 * (1 + r.uniform(-0.03, 0.03)), n) * decay(t, 0.006) \
        + 0.4 * bpf(r.standard_normal(n), 2000.0, 7000.0) * decay(t, 0.0015) \
        + 0.3 * osc_sine(430.0, n) * decay(t, 0.01)
    if tab:
        x += 0.9 * osc_sine(tab, n, r.random()) * burst_env(t, 0.0, 0.0012, 0.035) \
            + 0.3 * osc_sine(tab * 2.76, n, r.random()) * burst_env(t, 0.0, 0.0012, 0.012)
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
    tt = -1.0
    while True:                                  # the first crumbs land on the cue itself
        tt = 0.0 if tt < 0.0 else tt + r.exponential(1.0 / (320.0 * float(np.exp(-tt / 0.3)) + 20.0))
        if tt > dur - 0.02:
            break
        L = smp(r.uniform(0.002, 0.010))
        lo = r.uniform(300.0, 1800.0)
        gr = bpf(r.standard_normal(L + 64), lo, lo * r.uniform(1.8, 3.5))[64:] * np.hanning(L)
        i = smp(tt)
        L = min(L, n - i)
        x[i:i + L] += gr[:L] * r.lognormal(0.0, 0.5)
    pour = lpf(hpf(r.standard_normal(n), 220.0), 900.0) * burst_env(t, 0.0, 0.03, dur * 0.4) * 0.4
    x = lpf(x + pour, 8000.0)
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
    return fade(lpf(x, TOP), 0.02, 0.02)


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
    x = lpf(eq(x, 'peak', 2600.0, 3.0, 1.2), 8000.0, 2)
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
    return fade(lpf(st + np.stack([side, -side]), TOP_NOISE), 0.004, 0.01)


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
    return fade(lpf(pan_mono(x, depth * np.sin(ph)), TOP_NOISE), 0.01, 0.02)


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
    return fade(hpf(lpf(st, TOP_NOISE), 200.0), 0.01, 0.03)


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
    return fade(lpf(x + ign, TOP), 0.003, 0.05)


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
    """A copper hairline drawing between two lights. It starts as a ping (the
    picture's link time is the attack, 2.5 ms): a fine copper tink at the first
    light, then the wire sings as it glides to the next light (a thin sine
    glissando with a touch of its octave) and lets go as it arrives."""
    n = smp(dur + 0.3)
    t = tvec(n)
    u = np.clip(t / dur, 0.0, 1.0)
    r = rng('hair', key)
    f = f0 * (f1 / f0) ** smoothstep(u)
    ph = TAU * _wrap(cycles(f, n, r.random()))
    wire = (np.sin(ph) + 0.18 * np.sin(2.0 * ph)) * burst_env(t, 0.0, 0.0025, 0.5 * dur) \
        * (1.0 - 0.6 * smoothstep((u - 0.6) / 0.4))
    tink = osc_sine(f0 * 2.0, n, r.random()) * burst_env(t, 0.0, 0.0015, 0.05) \
        + 0.35 * osc_sine(f0 * 2.0 * 2.76, n, r.random()) * burst_env(t, 0.0, 0.0015, 0.015)
    return fade(lpf(wire + 0.45 * tink, TOP), 0.0015, 0.05)


def lock_click(key=0):
    """The flames seating into the mark: two small copper contacts 9 ms apart
    (a band-passed snap and a bright tink each), a damped seat resonance."""
    n = smp(0.16)
    t = tvec(n)
    r = rng('lock', key)
    nz = r.standard_normal(n)
    x = np.zeros(n)
    for off, g, f in ((0.0, 1.0, hz('D7')), (0.009, 0.55, hz('A7'))):
        x += g * bpf(nz, 1800.0, 8000.0) * burst_env(t, off, 0.0008, 0.0025)
        x += g * 0.5 * osc_sine(f, n, r.random()) * burst_env(t, off, 0.001, 0.03)
        x += g * 0.2 * osc_sine(f * 2.76, n, r.random()) * burst_env(t, off, 0.001, 0.01)
    x += 0.25 * osc_sine(hz('D5'), n) * burst_env(t, 0.0, 0.0015, 0.04)
    x = fade(lpf(x, TOP), 0.0008, 0.03)
    return x / np.max(np.abs(x))


# ── 3f. Renew (REVISION 2): the slow-motion hand-off ───────────────────────
def sung_bowl(f0, dur, level, release, key=0, width=0.45, ring=4.0, bloom_k=0.6, rub=0.012):
    """The copper cup's voice *held*: bowl()'s six doublet modes, sustained the way
    a singing bowl is sung (a leather mallet circling the rim) instead of struck.

    The rubbing feeds the modes continuously, so there is no strike: the tone
    swells out of silence along `level` [(local s, dB ≤ 0)], and mode k follows
    that level raised to the power 1 + bloom_k·k, so the upper partials open one
    after another as it grows (the bloom). The doublets beat as in the struck
    voice (the same splits, scaled with √f0; members on opposite sides). A sung
    bowl favours its low modes (×0.85^k). At `release` s the mallet lifts off and
    every mode rings down with the struck voice's own decay τ_k = ring·ratio^−0.72
    (continuous, so there is no step). A breath of rim friction pulses with the
    mallet's circling (≈1.1 rev/s). Returns stereo, peak-normalised."""
    n = smp(dur)
    t = tvec(n)
    r = rng('sung bowl', key, round(float(f0), 3))
    lv_db = np.interp(t, [p_[0] for p_ in level], [p_[1] for p_ in level])
    for _ in range(2):                                   # rounded corners: no cusp where the level turns
        lv_db = uniform_filter1d(lv_db, smp(0.12), mode='nearest')
    lv = np.minimum(db2lin(lv_db), 1.0)
    i_rel = smp(release)
    st = np.zeros((2, n))
    sc = (f0 / 293.66) ** 0.5
    for k, (ratio, amp, dsp) in enumerate(zip(BOWL_RATIOS, BOWL_AMPS, BOWL_SPLIT)):
        fk = f0 * ratio
        if fk > TOP:
            break
        env = lv ** (1.0 + bloom_k * k)
        env[i_rel:] = env[i_rel - 1] * decay(t[i_rel:] - t[i_rel - 1], ring * ratio ** -0.72)
        d = dsp * sc
        rho = r.uniform(0.6, 0.88)
        p = width * (1.0 if k % 2 == 0 else -1.0) * r.uniform(0.75, 1.0)
        for df, g, pp in ((-d / 2, 1.0, -p), (d / 2, rho, p)):
            st += pan_mono(osc_sine(fk + df, n, r.random()) * env * (amp * 0.85 ** k * g), pp)
    circ = 0.5 + 0.5 * np.sin(TAU * 1.1 * t + r.uniform(0, TAU))
    fr = bpf(r.standard_normal(n), 1200.0, 4200.0) * lv ** 1.5 * (0.4 + 0.6 * circ) * (1.0 - smoothstep((t - release) / 0.2))
    st += pan_mono(fr * rub, 0.0)
    st = fade(st, 0.01, min(0.5, dur * 0.1))
    return st / (np.max(np.abs(st)) + 1e-12)


def servo_shimmer(dur, key=0, f0=420.0, f1=560.0, peak=0.35, shimmer=1.0, glints=('A6', 'D7', 'E7')):
    """The slender arm (REVISION 2): a small, precise servo, thinner and quieter
    than S3's hand. A narrow band of motor buzz following the move's speed
    profile, a pure high gear line (6×) instead of a whine, and a glassy
    shimmer on top (light running along polished metal) that blooms just after
    the move peaks. Mono."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('servo shimmer', key)
    sp = smoothstep(u / peak) * (1.0 - smoothstep((u - peak) / (1.0 - peak)))
    f = f0 + (f1 - f0) * sp
    motor = bpf(osc_saw(f, n, r.random()), 700.0, 3000.0, 2)
    motor = motor / (np.max(np.abs(motor)) + 1e-12) * (0.15 + 0.85 * sp)
    line = osc_sine(np.minimum(6.0 * f, 5000.0), n, r.random()) * sp
    gl = np.zeros(n)
    for i, m in enumerate(glints):
        tr = 0.55 + 0.45 * np.sin(TAU * _wrap(cycles(r.uniform(8.0, 13.0), n, r.random()))) ** 2
        gl += 0.75 ** i * osc_sine(hz(m) * (1.0 + 0.0015 * np.sin(TAU * r.uniform(3, 6) * t)), n, r.random()) * tr
    ge = smoothstep((u - 0.1) / 0.35) * (1.0 - smoothstep((u - 0.5) / 0.5)) ** 1.5
    x = 0.3 * motor + 0.2 * line + shimmer * 0.55 * gl / len(glints) * ge
    return fade(lpf(x, TOP), 0.03, 0.08)


def breath_pad(midis, dur, key, breaths, depth_db=6.0, air=0.12, cut=(360.0, 1250.0), **kw):
    """The human's pad: warm_pad's voices, breathing. `breaths` [(start, peak, end)]
    in local seconds: an inhale (smoothstep up), then a longer exhale. The breath
    opens the filter (a crossfade between a dark and a bright low-pass of the same
    voices, which is LTI and cannot click), lifts the level by `depth_db`, and
    carries the breath itself: soft band-passed air with a gentle 'hh' formant."""
    n = smp(dur)
    t = tvec(n)
    b = np.zeros(n)
    for a, p, e in breaths:
        b = np.maximum(b, np.where(t < p, smoothstep((t - a) / (p - a)), 1.0 - smoothstep((t - p) / (e - p))))
    dark = warm_pad(midis, dur, key, cut_lo=cut[0], cut_hi=cut[0] * 1.25, **kw)
    bright = warm_pad(midis, dur, key, cut_lo=cut[1], cut_hi=cut[1] * 1.25, **kw)
    x = (dark * (1.0 - b) + bright * b) * db2lin(-depth_db * (1.0 - b))
    br = np.stack([bpf(pink(n, rng('breath', key, c)), 500.0, 3200.0) for c in range(2)])
    br = eq(br, 'peak', 1500.0, 4.0, 1.2)
    br = br / (np.sqrt(np.mean(br ** 2)) + 1e-12) * 0.25 * air * b ** 1.6
    return x + fade(br, 0.05, 0.1)


def glass_hold(dur, key=0, notes_=('A6', 'D7', 'E7'), pan0=0.4, pan1=-0.3, trem=(6.5, 1.1), attack=0.9,
               release=0.7):
    """Time held still: a sustained cluster of high glass partials (the seed's
    light) whose shimmer *slows down* as it goes, tremolo `trem[0]` → `trem[1]` Hz
    (time stretching), over a thin band of air that settles lower; it drifts
    across the field with the seed, `pan0` → `pan1`."""
    n = smp(dur)
    t = tvec(n)
    u = t / dur
    r = rng('glass hold', key)
    rate = trem[0] * (trem[1] / trem[0]) ** smoothstep(u)
    x = np.zeros(n)
    for i, m in enumerate(notes_):
        tr = 0.5 + 0.5 * np.sin(TAU * _wrap(cycles(rate * r.uniform(0.85, 1.15), n, r.random()))) ** 2
        vib = 1.0 + 0.0012 * np.sin(TAU * r.uniform(0.3, 0.7) * t + r.uniform(0, TAU))
        x += 0.8 ** i * osc_sine(hz(m) * vib, n, r.random()) * tr
    x /= len(notes_)
    air = svf(pink(n, r), 5200.0 - 1800.0 * u, 2.5, 'bp') * 0.35
    env = smoothstep(t / attack) * (1.0 - smoothstep((t - (dur - release)) / release))
    return fade(pan_mono(lpf((x + air) * env, TOP), pan0 + (pan1 - pan0) * smoothstep(u)), 0.01, 0.02)


def seed_trail(dur, key=0, pan0=0.4, pan1=-0.3, rate=5.0, notes_=('A6', 'C7', 'D7', 'E7', 'F7', 'A7')):
    """The seed's fine sparks, in slow motion: sparse tiny glass glints and a faint
    crackle following the seed across the gap (pan `pan0` → `pan1`), thinning at
    both ends of the flight."""
    n = smp(dur)
    t = tvec(n)
    r = rng('seed trail', key)
    mids = notes(' '.join(notes_))
    out = np.zeros((2, n))
    tt = 0.1
    while True:
        tt += r.exponential(1.0 / rate)
        if tt > dur - 0.3:
            break
        u = tt / dur
        g = glass(float(mtof(mids[int(r.integers(len(mids)))])), 0.35, r.uniform(0.04, 0.1), index=r.uniform(0.1, 0.3))
        i = smp(tt)
        L = min(n - i, g.size)
        p = float(np.clip(pan0 + (pan1 - pan0) * smoothstep(u) + r.uniform(-0.12, 0.12), -1, 1))
        out[:, i:i + L] += pan_mono(g[:L] * db2lin(-r.uniform(0, 9)) * np.sin(np.pi * u) ** 0.5, p)
    cr = crackle(dur, ('seed', key), rate=30.0, dec=100.0, lo=2000.0, hi=6500.0, ignite=0.0)
    out += pan_mono(cr * 0.3 * np.sin(np.pi * t / dur), pan0 + (pan1 - pan0) * smoothstep(t / dur))
    return fade(out, 0.05, 0.1)


# ════════════════════════════════════════════════════════════════════════════
# 4. Cue list (film seconds) & arrangement
# ════════════════════════════════════════════════════════════════════════════
# Outside Renew every cue is its STORYBOARD §4 / scene-file story time through ft().
CUP_1 = ft(1.0)                                              # cup strike #1 (D)
RIM_LIGHT = ft(0.35)                                         # the glint crosses the lip
SPARKS = [(ft(2.5), 'A5', -0.6), (ft(3.125), 'D6', 0.6), (ft(3.75), 'F6', 0.0)]   # one per beat: A, D, F · L, R, C
DIVE = (ft(4.375), ft(5.0))
CUP_2 = ft(5.0)                                              # cup strike #2 (A) + scan
SCAN = (CUP_2, ft(5.6))                                      # the scan line sweeps down the cup
ANNOTATIONS = [(ft(5.6), 'E6', 0.30), (ft(5.9), 'G6', 0.45), (ft(6.2), 'A6', 0.20)]
QUESTION = ft(6.25)                                          # a mallet question, left open
RESOLIDIFY = (ft(7.0), ft(7.5))
GROOVE = (ft(7.5), ft(16.875))                               # felt kick on every beat …
LIFT = ft(15.625)                                            # … except the lift: the floor falls away as the lights rise
GROOVE_KICKS = [round(GROOVE[0] + i * BEAT, 6) for i in range(15) if abs(GROOVE[0] + i * BEAT - LIFT) > 1e-6]
ACCENT_KICKS = (ft(10.0), ft(15.0))
KICK_BEAT_DB = (0.0, -2.5, -1.0, -2.0)                       # beat 1 leans, 3 answers, 2 and 4 lighter
SERVO_DESCEND = (ft(7.5), ft(8.1))
SERVO_INSPECT = (ft(8.2), ft(8.7))
SERVO_EXIT = (ft(9.38), ft(9.83))
GRIP = ft(8.125)
# The cups multiply. Each new cup is struck where it appears and the earlier ones keep
# ringing, so the chord *stacks*: D + A (1 → 2), then C and F join (2 → 4: Dm7), then all
# four are struck as one across the row, with E above (Dm7 add9) and D an octave below.
MULTIPLY = [(ft(8.75), (('D4', 0.05), ('A4', 0.45))),
            (ft(9.375), (('C5', -0.45), ('F5', 0.6))),
            (ft(10.0), (('D4', -0.6), ('A4', -0.2), ('C5', 0.2), ('F5', 0.6)))]
FOUR = MULTIPLY[-1][0]
ADD9 = 'E5'                                                  # Dm7 add9 on the four
WORLDS = [(ft(10.0), 'AUTOMATION'), (ft(11.25), 'OPERATIONS'), (ft(12.5), 'ROBOTICS & VISION'), (ft(13.75), 'AGRONOMY')]
PAPER = [ft(10.0 + d) for d in (0.0, 0.07, 0.16, 0.27, 0.41)]   # the slips fall in
SORT = [ft(10.625) + i * S32 for i in range(8)]              # the stacks rise; one tick per 32nd …
SORT_TABS = (3, 5, 7)                                        # … the copper tabs glint (story 10.859 / 11.016 / 11.172)
RING = ft(11.25)                                             # seven pings a 16th apart, then the ring closes
FOCUS = (ft(12.5), ft(12.575))
LENS = (ft(12.65), ft(12.97))
SHUTTER = ft(13.125)
SOIL = ft(13.75)
SPROUT = (ft(14.375), ft(14.975))
ANVILS = [ft(t) for t in (10.9375, 12.1875, 13.4375, 14.6875, 15.9375)]   # the '&' of 2 and 4
FOUR_CHIME = ft(15.0)
HAIRLINES = [ft(15.08), ft(15.24), ft(15.40)]                # the three links, glow to glow, left to right
ARCS = (ft(15.3), LIFT)                                      # the arcs climb to the meeting point
ACCENT = ft(15.65)                                           # "Intelligence. Put to work." lands
SPIN = (ft(15.95), ft(16.25))                                # the ring spins faster and closes …
MERGE = ft(16.25)                                            # … into one ember, with a soft flare
SINK = (ft(16.875), ft(17.5))

# Renew is composed in film time (REVISION 2 S6): bars 8–10, beats every 0.75 s.
RENEW = (at(8), at(11))                                      # 21.0–30.0
ARM_REVEAL = at(8)                                           # 21.0 the slender arm comes into the light under the ember
REACH = (21.5, at(9))                                        # 21.5–24.0 the human hand reaches, palm up
TILT = (at(8, 4, 2), at(9))                                  # 23.625 the robot fingers tilt …
LIFT_OFF = at(9)                                             # 24.0 … and the seed lifts off the metal
DRIFT = (at(9), at(10))                                      # 24.0–27.0 it crosses the gap in slow motion
TOUCH = at(10)                                               # 27.0 THE TOUCH
WITHDRAW = (at(10, 1, 3), at(10, 4, 3))                      # 27.5625–29.8125 the arm withdraws slowly
SEED_RISE = (at(10, 3), at(11))                              # 28.5–30.0 the seed rises into the mark

SPLIT_TONES = [(ft(22.9), 'D5', -0.5), (ft(23.2), 'F5', 0.5), (ft(23.5), 'A5', 0.0)]
HEARTBEATS = [(ft(22.5), -17.0), (ft(23.75), -12.5), (ft(24.375), -13.5), (ft(24.6875), -14.5)]
LOGO = ft(25.0)                                              # 33.0: bar 12's downbeat
BREATH = 0.035                                               # every build element lets go this long before the lock
FINAL_LIFT_T = (ft(25.4), ft(26.1))                          # the room turns ivory: Dm9 → D6/9
LIFT_BELLS = ft(25.625)
LINE_TICKS = [(ft(26.25), 'A6'), (ft(27.5), 'D7')]
SWEEP_2 = (ft(27.65), ft(29.55))                             # the second, slow light sweep in the hold

# Chords (pad voicings; bass notes separate). D dorian's B♮ appears in the
# final lift, where D minor becomes D major as the film turns to light.
CHORDS = [(ft(a), ft(b), name, v) for a, b, name, v in (    # story times, S1–S5
    (0.35, 5.02, 'Dm9', 'D3 A3 C5 E5 F5'),
    (4.95, 7.47, 'D9sus', 'D3 A3 E4 G4 C5'),
    (7.50, 12.55, 'Dm9', 'F3 C4 E4 A4'),
    (12.45, 15.05, 'Bbmaj9', 'F3 C4 D4 A4'),
    (14.95, 16.30, 'Gm9', 'F3 Bb3 D4 A4'),
    (16.25, 17.25, 'C9sus4', 'F3 Bb3 D4 G4'))]
RENEW_CHORDS = [  # film time: Fmaj9 (reach) → C/E under the held D (suspension) → Dm(add9) (the touch)
    (at(8) - 0.06, at(9) + 0.06, 'Fmaj9', 'A3 C4 E4 G4'),
    (at(9) - 0.06, at(10) + 0.06, 'C/E', 'G3 C4 E4'),
    (at(10) - 0.06, at(11) + 0.06, 'Dm(add9)', 'F3 A3 D4 E4')]
BUILD_CHORDS = [(ft(22.5) - 0.06, ft(23.8), 'Bbmaj7', 'F3 A3 D4'), (ft(23.7), LOGO - BREATH, 'Cadd9', 'G3 C4 D4 E4')]
FINAL_MINOR = 'D3 A3 C4 E4 F4'          # the lock: Dm9 …
FINAL_LIFT = 'D3 A3 E4 F#4 B4'          # … lifts to D6/9 as the room fills with light
BASS_ROOTS = [(ft(7.5), 'D2'), (ft(12.5), 'Bb1'), (ft(15.0), 'G1'), (ft(16.25), 'C2')]
BASS_STEPS = {round(ft(t), 4): n_ for t, n_ in ((12.1875, 'C2'), (14.6875, 'A1'), (15.9375, 'Bb1'))}  # the last '&' steps in
# Mallet line over the worlds (Dm9 → B♭maj9): (16th step from the four, note, velocity, length in 16ths)
MELODY = [(2, 'A4', .70, 2), (4, 'D5', .85, 2), (6, 'E5', .72, 1), (7, 'F5', .90, 3), (10, 'E5', .70, 2),
          (12, 'D5', .78, 2), (14, 'C5', .68, 2),
          (18, 'D5', .75, 2), (20, 'F5', .85, 2), (22, 'G5', .72, 1), (23, 'A5', .92, 3), (26, 'G5', .70, 2),
          (28, 'F5', .76, 2), (30, 'E5', .70, 2), (32, 'D5', .80, 4)]
# Renew: felt piano (film time, note, velocity), every note on the 80 BPM grid. The human's
# voice: it enters with the hand (beat 2 of bar 8), reaches, sighs E5 → D5 as the seed lifts,
# holds its breath through the slow motion (one drop at 25.5), resolves low on the touch with
# the four cups' chord D-A-C-F rolled on 32nds, and climbs with the seed into the mark.
PIANO = [(at(8, 2), 'F2', .40), (at(8, 2), 'C3', .30), (at(8, 2, 2), 'A3', .22),          # 21.75 the hand appears
         (at(8, 3), 'C5', .33), (at(8, 3, 2), 'G4', .21), (at(8, 4), 'E5', .35), (at(8, 4, 2), 'A4', .22),
         (at(9), 'E2', .36), (at(9), 'C3', .26), (at(9), 'D5', .31),                         # 24.0 the seed lifts
         (at(9, 3), 'G4', .18),                                                              # 25.5 one drop of time
         (at(10), 'D2', .42), (at(10), 'A2', .30),                                           # 27.0 the low resolve …
         (at(10), 'D4', .28), (at(10, 1, 0.5), 'A4', .30), (at(10, 1, 1), 'C5', .32), (at(10, 1, 1.5), 'F5', .35),
         (at(10, 2), 'A3', .20), (at(10, 2, 2), 'E4', .22),                                  # 27.75 warmth
         (at(10, 3), 'A4', .25), (at(10, 3, 2), 'D5', .27), (at(10, 4), 'E5', .29), (at(10, 4, 2), 'F5', .31)]  # 28.5 rise
PEDAL = [at(8, 2), at(9), at(10), ft(23.0)]             # the last pedal lets go inside the build

CUES = [  # as implemented, in FILM seconds: (start, end, what). Printed on every run.
    (0.0, ft(1.0), 'Room tone and air; deep sub drone (D1 under a stronger D2) fades in'),
    (RIM_LIGHT, RIM_LIGHT + sd(0.95), 'Delicate high shimmer as the light traces the rim (glass partials, L → R)'),
    (CUP_1, None, 'CUP STRIKE #1: singing bowl on D4, soft felt mallet, long shimmering tail'),
    (ft(0.35), ft(2.4), 'Warm pad Dm9 swells in under the first line (then settles under the tale)'),
    (SPARKS[0][0], SPARKS[-1][0], 'Three spark ignitions on the beats (%s): crackle + bell pings A5 L · D6 R · F6 C; '
     'orbit trails' % ' / '.join(f'{s_[0]:.2f}' for s_ in SPARKS)),
    (DIVE[0], DIVE[1], 'Sparks dive: spiralling dive + reverse swell of A-D-F into the next strike'),
    (CUP_2, None, f'CUP STRIKE #2 on A4 + glassy scan shimmer sweeping down ({SCAN[0]:.2f}–{SCAN[1]:.2f})'),
    (CUP_2, RESOLIDIFY[0], 'Soft data-tick texture; annotation ticks %s; D9sus pad; a mallet question at %.2f'
     % (' / '.join(f'{a_[0]:.2f}' for a_ in ANNOTATIONS), QUESTION)),
    (RESOLIDIFY[0], RESOLIDIFY[1], 'Reverse swell (bowls D-A) + upward scan into the downbeat'),
    (GROOVE[0], GROOVE[1], f'GROOVE at 80 BPM: felt kick every beat (beat 1 leans; none on the {LIFT:.2f} lift), shaker '
                           '16ths, off-beat bass D → B♭ → G → C, stepping into each change'),
    (SERVO_DESCEND[0], SERVO_DESCEND[1], 'Servo whir as the hand descends'),
    (GRIP, None, 'Grip clack (two finger contacts + a damped copper tink)'),
    (MULTIPLY[0][0], None, 'Multiplication 1→2: the cup (D4) and its reflection (A4) struck; slide'),
    (MULTIPLY[1][0], None, 'Multiplication 2→4: C5 and F5 join the still-ringing D and A (the chord stacks: Dm7); slides'),
    (FOUR, None, 'Four as one: all four bowls across the row + E5 (Dm7 add9) + D3 below + kick accent + sub'),
    (FOUR, FOUR_CHIME, 'Worlds: paper flicks & sorting ticks (copper tabs %s) · ping arpeggio, ring %.2f · focus beeps, '
     'lens, shutter %.2f · soil & sprout %.2f' % (' / '.join(f'{SORT[i]:.2f}' for i in SORT_TABS), RING + 7 * S16,
                                                  SHUTTER, SPROUT[0])),
    (FOUR, FOUR_CHIME, 'Mallet motif carries the melody (16ths at 80 BPM, dotted-8th echoes); anvil taps + hammer ticks; '
                       'Dm9 → B♭maj9'),
    (FOUR_CHIME, None, 'The four bowls chime together across the row (Gm9 underneath)'),
    (HAIRLINES[0], HAIRLINES[-1], 'Copper hairline pings glow to glow, L → R (%s); the arcs climb %.2f → %.2f'
     % (' / '.join(f'{h_:.2f}' for h_ in HAIRLINES), ARCS[0], ARCS[1])),
    (LIFT, MERGE, f'The lights lift (the kick holds its breath): ascending glass, outer pair on the beat, inner pair a '
                  f'64th later; rising swell; accent {ACCENT:.2f}; the ring spins'),
    (MERGE, None, 'One ember: a soft flare (bowl D5, A6 glint, bloom) on the last kick'),
    (SINK[0], SINK[1], 'Groove drops away; descending airy sweep'),
    (RENEW[0], RENEW[1], 'RENEW (recomposed, 9 s, bars 8–10): intimate, no drums; felt piano on the 80 BPM grid, '
                         'Fmaj9 → C/E (under a held D) → Dm(add9)'),
    (ARM_REVEAL, ARM_REVEAL + 1.6, 'The slender arm is revealed: a quiet servo shimmer (thin motor, pure gear line, '
                                   'glass glint), right'),
    (REACH[0], REACH[1], 'The human hand reaches: felt piano enters on beat 2 (21.75) and reaches C5 → E5; the pad '
                         'breathes (one slow inhale/exhale, filter + air)'),
    (TILT[0], LIFT_OFF, 'The robot fingers tilt (a tiny servo) → 24.00 the seed lifts off the metal: a glass tink; '
                        'the piano sighs E5 → D5 over C/E'),
    (DRIFT[0], DRIFT[1], 'SLOW MOTION: the cup\'s voice SUNG (a held singing bowl on D4 that blooms partial by partial), '
                         'a sustained glass shimmer whose tremolo slows 6.5 → 1.1 Hz, the seed\'s fine sparks and a slow '
                         'pass of air drifting R → L, the big hall; the pad holds its breath; one piano drop at 25.50; '
                         'an inhale from 26.4'),
    (TOUCH, None, 'THE TOUCH: a warm bell from the cup\'s voice (D5) + soft bloom swell + a gentle low resolve '
                  '(piano D2-A2, soft low bowl D3, sub) + the four cups\' chord rolled on piano; tender, not loud'),
    (TOUCH, SEED_RISE[0], 'Warmth: Dm(add9) pad breathing again, piano A3 · E4; the arm withdraws (a descending servo '
                          'shimmer)'),
    (SEED_RISE[0], SEED_RISE[1], 'The seed rises into the mark: soft riser + piano climbing A4 D5 E5 F5, landing on '
                                 'the first heartbeat'),
    (SPLIT_TONES[0][0], SPLIT_TONES[-1][0], 'Three rising tones as the ember splits (%s): D5 L · F5 R · A5 C'
     % ' / '.join(f'{s_[0]:.2f}' for s_ in SPLIT_TONES)),
    (ft(22.5), LOGO, 'Build: swirling whooshes, accelerating heartbeat kicks, bowl roll, B♭maj7 → Cadd9, reverse swell'),
    (LOGO, None, 'THE LOGO LOCKS: lock click + impact kick + sub boom + low-D bowl + Dm9 bell chord, lush long reverb'),
    (FINAL_LIFT_T[0], FINAL_LIFT_T[1], 'The D-major lift: pad Dm9 → D6/9, high bells F#5 A5 D6 as the room turns ivory'),
    (LINE_TICKS[0][0], LINE_TICKS[1][0], 'Two gentle ticks for the lines (A6, D7)'),
    (SWEEP_2[0], SWEEP_2[1], 'The second slow light sweep: a faint high shimmer crossing the mark'),
    (LOGO, DUR, f'The tail blooms and decays to near-silence by {SILENT_FROM:.1f}; the last 0.1 s is digital zero'),
]


class Mix:
    """Stereo stems plus reverb sends for the whole film. Events whose label is in
    `keep` are also kept individually, so verification can isolate a cue's own
    contribution to the master (E) from everything else (R = master − E)."""
    STEMS = ('sub', 'kick', 'perc', 'cup', 'keys', 'pad', 'fx', 'air')
    SENDS = ('room', 'hall', 'big')

    def __init__(self, keep=()):
        self.stems = {k: np.zeros((2, N)) for k in self.STEMS}
        self.sends = {k: np.zeros((2, N)) for k in self.SENDS}
        self.events = []
        self.keep = set(keep)
        self.kept = []

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
        sends = {name: amt for name, amt in (('room', room), ('hall', hall), ('big', big)) if amt}
        for name, amt in sends.items():
            self.sends[name][:, i0:i1] += seg * amt
        self.events.append((t, stem, label or stem))
        if (label or stem) in self.keep:
            self.kept.append((t, stem, label or stem, seg, sends))

    def times(self, *labels):
        return sorted({t for t, _s, lab in self.events if lab in labels})


def chord_pad(M, start, end, name, voicing, gain_db, hall=0.25, attack=0.08, release=0.1, env=None, big=0.0,
              label='pad', dip=0.0, **kw):
    sig = warm_pad(notes(voicing), end - start, (name, start), attack=attack, release=release, **kw)
    if dip:
        sig = eq(sig, 'peak', 300.0, -dip, 0.8)
    if env is not None:
        sig = sig * automation(env, sig.shape[1], start)
    M.add('pad', sig, start, gain_db, hall=hall, big=big, label=label)


def arrange(keep=()):
    M = Mix(keep)
    r = rng('arrange')

    # ── Bed: room tone & air, the whole film ────────────────────────────────
    room = room_tone(DUR)
    room *= automation(ftp([(0.0, -90), (0.8, 0), (7.0, 0), (7.6, -6), (16.9, -6), (17.6, -1), (22.5, -1),
                            (23.5, -6), (25.0, -8), (28.6, -16), (29.6, -90)]), N)
    M.add('air', room, 0.0, -50.0, label='room tone')

    # ── S1 · THE TALE (film 0–6): mystery ───────────────────────────────────
    # The drone's weight sits on D2 (heard on small speakers); D1 underneath is felt, not measured.
    drone = sub_drone(hz('D1'), RESOLIDIFY[1], h2=0.9, h3=0.1)
    drone *= automation(ftp([(0.0, -90), (0.15, -30), (1.0, 0), (4.8, 0), (5.0, 1.5), (7.0, 1.5), (7.47, -40)]),
                        drone.size)
    M.add('sub', fade(drone, 0.05, 0.03), 0.0, TALE_DB - 30.0, label='sub drone')
    M.add('fx', rim_shimmer(sd(1.0), 'rim'), RIM_LIGHT, TALE_DB - 23.0, hall=0.45, label='rim shimmer')
    M.add('air', dust(sd(4.7), 'tale', notes('A6 D7 E7 F7 C7'), rate=2.2 / STRETCH), ft(0.3), TALE_DB - 32.0, hall=0.5,
          label='dust')
    c0, c1, name, v = CHORDS[0]
    chord_pad(M, c0, c1, name, v, TALE_DB - 17.0, hall=0.35, attack=0.3, release=0.05, cut_lo=420.0, cut_hi=1300.0,
              lfo=0.12, env=ftp([(0.35, -40), (1.9, 0), (2.8, -5), (4.3, -6), (4.9, -14), (5.02, -30)]))
    M.add('cup', cup('D4', 11.0, ring=4.0, key='strike1'), CUP_1, TALE_DB - 15.0, hall=0.35, label='cup strike')
    for i, (tk, note, p) in enumerate(SPARKS):
        M.add('fx', crackle(0.5, ('spark', i)), tk, TALE_DB - 29.0, pan=p, room=0.3, label='spark crackle')
        ping = pan_mono(fm_bell(hz(note), 2.5, ratio=3.5, index=1.2, dec=0.5), p) * 0.7 \
            + balance(bowl(hz(note), 2.5, ring=1.3, hardness=1.2, key=('spark', i), width=0.2), p) * 0.5
        M.add('keys', ping, tk, TALE_DB - 22.0, hall=0.4, label='spark ping')
        M.add('fx', spark_trail(DIVE[0] - tk + sd(0.1), i, phase=TAU * i / 3, rate=0.42 / STRETCH), tk + sd(0.1),
              TALE_DB - 33.0, hall=0.3, label='trail')
    M.add('fx', swirl(sd(0.585), 'dive', 700.0, 3200.0, 1.0 / STRETCH, 5.0 / STRETCH, peak=0.8, depth=0.6), DIVE[0],
          TALE_DB - 25.0, hall=0.2, label='dive')
    rs = reverse_swell(DIVE[1] - DIVE[0], 'dive', [hz('A4'), hz('D5'), hz('F5')], rt=1.6)
    M.add('fx', rs, DIVE[0], TALE_DB - 21.0, label='reverse swell')

    # ── S2 · 01 UNDERSTAND (film 6–9): curiosity ────────────────────────────
    M.add('cup', cup('A4', 9.0, ring=4.5, key='strike2'), CUP_2, UNDER_DB - 16.0, hall=0.35, label='cup strike')
    M.add('fx', scan_shimmer(sd(0.9), 'down', sweep=SCAN[1] - SCAN[0]), CUP_2, UNDER_DB - 24.0, hall=0.3, label='scan')
    c0, c1, name, v = CHORDS[1]
    chord_pad(M, c0, c1, name, v, UNDER_DB - 19.5, hall=0.3, attack=0.25, release=0.04, cut_lo=450.0, cut_hi=1700.0,
              lfo=0.3 / STRETCH, env=ftp([(4.95, -30), (5.4, 0), (6.9, 0), (7.4, -8)]))
    rt = rng('data ticks')
    tk = CUP_2 + sd(0.05)
    while tk < RESOLIDIFY[0]:
        tk = round((tk + rt.exponential(STRETCH / 11.0)) / (S32 / 4)) * (S32 / 4)   # on a 1/128-note grid
        if tk >= RESOLIDIFY[0]:
            break
        f = float(rt.choice([2093.0, 2349.3, 2637.0, 3136.0]))
        M.add('fx', data_tick(f, ('data', tk)), tk, UNDER_DB - 38.0 + rt.uniform(-3, 2), pan=rt.uniform(-0.6, 0.6),
              room=0.2, label='data tick')
    for tk, note, p in ANNOTATIONS:
        M.add('fx', glass(hz(note), 0.5, 0.12, 0.6), tk, UNDER_DB - 27.0, pan=p, hall=0.25, label='annotation tick')
        M.add('fx', data_tick(3520.0, ('anno', tk), tau=0.002), tk, UNDER_DB - 31.0, pan=p, label='annotation tick')
    for i, (st_, note) in enumerate(((4, 'E5'), (6, 'G5'), (8, 'A5'))):           # a question, left open
        M.add('keys', mallet(hz(note), 1.2, 0.45, key=('q', i)), QUESTION + (st_ - 4) * S16, UNDER_DB - 24.0,
              pan=0.3 - 0.2 * i, hall=0.35, label='curious mallet')
    rs = reverse_swell(RESOLIDIFY[1] - RESOLIDIFY[0], 'solid', [hz('D4'), hz('A4')], rt=1.4)
    M.add('fx', rs, RESOLIDIFY[0], UNDER_DB - 19.0, label='reverse swell')
    M.add('fx', scan_shimmer(sd(0.465), 'up', sweep=sd(0.4), up=True), RESOLIDIFY[0], UNDER_DB - 26.0, hall=0.2,
          label='scan up')

    # ── Groove (film 9.0–20.25), 80 BPM ─────────────────────────────────────
    for tk in GROOVE_KICKS:
        beat = int(round((tk - GROOVE[0]) / BEAT)) % 4
        style = 'accent' if any(abs(tk - a_) < 1e-6 for a_ in ACCENT_KICKS) else 'groove'
        g = KICK_BEAT_DB[beat] + (0.5 if tk == GROOVE[0] else 0.0)
        M.add('kick', felt_kick(style), tk, GROOVE_DB - 10.5 + g, label='kick')
    sh = [shaker(k) for k in range(8)]
    rs_ = rng('shaker groove')
    SH_VEL = (0.55, 0.30, 0.85, 0.36)
    for step in range(int(round((GROOVE[1] - GROOVE[0]) / S16))):
        swing = 0.008 * STRETCH if step % 2 else 0.0                                 # a little swing
        tk = GROOVE[0] + step * S16 + swing + rs_.uniform(-0.002, 0.002)
        vel = SH_VEL[step % 4] * rs_.uniform(0.85, 1.1)
        M.add('perc', sh[step % 8], max(tk, GROOVE[0]), GROOVE_DB - 22.5 + lin2db(vel), pan=0.28, room=0.08,
              label='shaker')
    for k in range(15):
        tk = GROOVE[0] + S8 + k * BEAT
        root = BASS_STEPS.get(round(tk, 4)) or [nm_ for t0, nm_ in BASS_ROOTS if t0 <= tk][-1]
        M.add('sub', bass_pulse(hz(root), 0.8 * S8, 1.0 if k % 2 == 0 else 0.85), tk, GROOVE_DB - 16.0, label='bass')
    anv = [anvil(hz('A5'), k) for k in range(3)]
    for i, tk in enumerate(ANVILS):
        M.add('perc', anv[i % 3], tk, GROOVE_DB - 27.5, pan=-0.25, room=0.35, label='anvil')
    ticks = [hammer_tick(k) for k in range(6)]
    HT = {3: -3.0, 7: -8.0, 10: -5.0, 13: -7.0, 15: -10.0}          # 16th steps within the bar
    for b0 in np.arange(MULTIPLY[0][0], GROOVE[1] - 1e-9, BEAT):     # from the first multiplication, beat by beat
        for step, g in HT.items():
            tk = float(GROOVE[0] + np.floor((b0 - GROOVE[0]) / BAR + 1e-9) * BAR + step * S16)
            if b0 <= tk < b0 + BEAT and tk < ft(16.8):
                M.add('perc', ticks[int(round(tk / S16)) % 6], tk, GROOVE_DB - 28.0 + g, pan=0.4, room=0.2,
                      label='hammer tick')
    # groove pads (sidechained under the kick in the mix, gently)
    for c0, c1, name, v in CHORDS[2:6]:
        env = ftp([(16.25, 0), (16.875, 0), (17.25, -30)]) if name == 'C9sus4' else None
        chord_pad(M, c0, c1, name, v, GROOVE_DB - 17.5, hall=0.2, attack=0.03 if c0 == GROOVE[0] else 0.1, release=0.1,
                  cut_lo=500.0, cut_hi=1700.0, env=env, dip=2.5)   # at 80 BPM the kicks thin out: keep the low mids clear

    # ── S3 · 02 MAKE (film 9–12): the hand, one becomes four ────────────────
    M.add('fx', servo(SERVO_DESCEND[1] - SERVO_DESCEND[0], 170.0, 310.0, 'descend'), SERVO_DESCEND[0], -30.0, pan=0.45,
          room=0.25, label='servo')
    M.add('fx', grip_clack(), GRIP, -22.0, pan=0.15, room=0.3, label='grip clack')
    M.add('fx', servo(SERVO_INSPECT[1] - SERVO_INSPECT[0], 200.0, 280.0, 'inspect'), SERVO_INSPECT[0], -36.0, pan=0.2,
          room=0.25, label='servo')
    for i, (tk, cups_) in enumerate(MULTIPLY):
        last = tk == FOUR                                         # four as one: a 5 ms ripple along the row, L → R
        for j, (nme, p) in enumerate(cups_):
            M.add('cup', cup(nme, 6.0, ring=2.0 if last else 2.6, key=('mult', i, j), hardness=1.25 if last else 1.0,
                             width=0.5), tk + (0.005 * j if last else 0.0), GROOVE_DB - (21.5 if last else 18.5), pan=p,
                  hall=0.3, label='bowl')
    M.add('fx', slide(sd(0.4), 'one-two', 0.05, 0.45), MULTIPLY[0][0], -29.0, hall=0.2, label='slide')
    M.add('fx', slide(sd(0.4), 'two-four-L', -0.1, -0.5), MULTIPLY[1][0], -31.0, hall=0.2, label='slide')
    M.add('fx', slide(sd(0.4), 'two-four-R', 0.2, 0.65), MULTIPLY[1][0], -31.0, hall=0.2, label='slide')
    M.add('fx', servo(SERVO_EXIT[1] - SERVO_EXIT[0], 210.0, 360.0, 'exit'), SERVO_EXIT[0], -34.0, pan=0.5, room=0.25,
          label='servo')
    M.add('cup', cup('D3', 6.0, ring=3.2, key='one', hardness=0.9, width=0.3), FOUR, GROOVE_DB - 18.0, hall=0.3,
          label='bowl')                                           # the four sound as one: D an octave below
    M.add('cup', pan_mono(glass(hz(ADD9), 3.0, 1.3, 0.35, ratio=2.0), 0.1), FOUR, -26.0, hall=0.4, label='add9')
    M.add('sub', boom(hz('D2') * 1.6, hz('D1'), 1.2, 0.05, 0.35), FOUR, -23.0, label='landing sub')

    # ── S4 · FOUR KINDS OF WORK (film 12–18) ────────────────────────────────
    for i, (st_, note, vel, ln) in enumerate(MELODY):
        tk = FOUR + st_ * S16
        s = mallet(hz(note), ln * S16 + 0.5, vel, key=('mel', i))
        s = s * np.where(tvec(s.size) < ln * S16 + 0.06, 1.0, decay(tvec(s.size) - ln * S16 - 0.06, 0.08))
        p = 0.15 * np.sin(i * 1.3)
        M.add('keys', fade(s, 0.0012, 0.02), tk, GROOVE_DB - 17.0, pan=p, room=0.2, hall=0.2, label='mallet')
        for off, e in echoes(s, 3 * S16, 2, -11.0, (-0.6, 0.6), lp=2600.0):
            if tk + off < ft(16.8):
                M.add('keys', e, tk + off, GROOVE_DB - 17.0, hall=0.15, label='mallet echo')
    # AUTOMATION: paper slips fall in, sorted stacks rise out (copper tabs glint on the accents)
    for i, tk in enumerate(PAPER):
        M.add('fx', paper_flick(r.uniform(0.09, 0.16), ('flick', i)), tk, -28.0 - 1.2 * i,
              pan=r.uniform(-0.6, 0.6), room=0.3, label='paper flick')
    tabs = dict(zip(SORT_TABS, notes('A6 C7 D7')))
    for i, tk in enumerate(SORT):
        tab = float(mtof(tabs[i])) if i in tabs else None
        M.add('fx', sort_tick(('sort', i), tab), tk, -25.0 if tab else -31.0, pan=-0.35 + 0.08 * i, room=0.25,
              label='sort tab' if tab else 'sort tick')
    # OPERATIONS: points of light around the rim connect into one ring
    ring = notes('D5 F5 A5 C6 E6 F6 A6')
    for i, m in enumerate(ring):
        ang = TAU * i / len(ring)
        M.add('fx', glass(float(mtof(m)), 0.8, 0.3, 0.7, ratio=2.0), RING + i * S16, -28.8 + 0.2 * i,
              pan=0.7 * np.sin(ang), hall=0.35, label='ping')
    M.add('fx', pan_mono(glass(hz('D6'), 1.5, 0.6, 0.3, 2.0) + 0.7 * glass(hz('A6'), 1.5, 0.5, 0.3, 2.0), 0.0),
          RING + 7 * S16, -30.0, hall=0.5, label='ring closes')
    # ROBOTICS & VISION: reticle blinks (focus beeps), lens hunts, shutter on the lock
    for tk in FOCUS:
        M.add('fx', focus_beep(hz('A6')), tk, -30.0, pan=0.1, room=0.2, label='focus beep')
    M.add('fx', servo(LENS[1] - LENS[0], 900.0, 1400.0, 'lens'), LENS[0], -33.0, pan=0.1, label='lens')
    M.add('fx', shutter(), SHUTTER, -24.0, pan=0.05, room=0.25, label='shutter')
    # AGRONOMY: soil fills the cup, a seedling unfurls
    M.add('fx', soil_crunch(sd(0.55)), SOIL, -26.0, pan=-0.1, room=0.2, label='soil')
    M.add('fx', sprout(SPROUT[1] - SPROUT[0]), SPROUT[0], -26.0, hall=0.35, label='sprout')

    # ── S5 · ONE SYSTEM (film 18–21): wonder ────────────────────────────────
    for j, nme in enumerate('D4 A4 C5 F5'.split()):
        M.add('cup', cup(nme, 6.0, ring=3.2, key=('chime', j), hardness=0.95), FOUR_CHIME + 0.006 * j,
              GROOVE_DB - 19.5, pan=(-0.6 + 0.4 * j) * 0.7, hall=0.4, label='bowl')
    for j, (tk, (a, b)) in enumerate(zip(HAIRLINES, (('D6', 'A6'), ('A6', 'C7'), ('C7', 'F7')))):
        M.add('fx', hairline(hz(a), hz(b), sd(0.2), key=j), tk, -27.0, pan=-0.3 + 0.3 * j, hall=0.4, label='hairline')
    M.add('fx', soft_riser(ARCS[1] - ARCS[0], 'arcs', 700.0, 4200.0, (nm('A5'), nm('D6')), 0.45, curve=1.4),
          ARCS[0], -29.0, hall=0.3, label='arcs')
    lift = [(0.0, 'D6', -0.6), (0.0, 'A6', 0.6), (BEAT / 16, 'F6', -0.25), (BEAT / 16, 'C7', 0.25),
            (2 * S32, 'D7', -0.45), (3 * S32, 'F7', 0.45), (4 * S32, 'G7', -0.2), (5 * S32, 'A7', 0.2)]
    for i, (dt, m, p) in enumerate(lift):
        M.add('fx', glass(hz(m), 0.9, 0.35, 0.5, 2.0), LIFT + dt, -32.0 - (0.0 if i < 4 else 1.5 * (i - 3)),
              pan=p, hall=0.45, label='ascending shimmer')
    swell = warm_pad(notes('Bb3 D4 F4 A4 D5'), MERGE - LIFT + sd(0.08), 'lift swell', cut_lo=600.0, cut_hi=2600.0,
                     lfo=0.5 / STRETCH, attack=0.03, release=0.06)
    swell *= 0.3 + 0.7 * exp_curve(tvec(swell.shape[1]) / (MERGE - LIFT), 2.0)
    M.add('pad', swell, LIFT, -25.0, hall=0.35, label='rising swell')
    acc = sum(mallet(hz(m), 1.5, 0.55, key=('acc', m)) for m in ('G4', 'Bb4', 'D5'))
    M.add('keys', pan_mono(acc / 3.0, 0.0), ACCENT, -20.5, hall=0.35, label='accent')
    M.add('keys', pan_mono(fm_bell(hz('D6'), 2.0, ratio=3.5, index=0.8, dec=0.8), 0.0), ACCENT, -28.5,
          hall=0.4, label='accent')
    M.add('fx', swirl(SPIN[1] - SPIN[0] - sd(0.02), 'spin', 900.0, 4200.0, 2.0 / STRETCH, 9.0 / STRETCH, peak=0.9,
                      depth=0.5), SPIN[0], -28.0, hall=0.3, label='spin')
    flare = bowl(hz('D5'), 3.0, ring=2.0, hardness=0.9, key='merge', width=0.5) \
        + 0.45 * pan_mono(glass(hz('A6'), 3.0, 0.5, 0.4, 2.0), 0.0)
    M.add('cup', flare, MERGE, -23.0, hall=0.45, label='merge flare')
    M.add('fx', bloom(1.4, 'merge', attack=0.03, dec=0.5, lp=3500.0), MERGE, -24.0, hall=0.3, label='merge flare')
    M.add('fx', whoosh(SINK[1] - SINK[0] - 0.005, 280.0, 4800.0, 0.5, -0.5, peak=0.12, q=1.2, shape=1.3, key='sink'),
          SINK[0], -24.0, hall=0.3, label='airy sweep')

    # ── S6 · 03 RENEW (film 21–30, recomposed): slow, tender, one breath ────
    # bar 8 the arm and the reaching hand · bar 9 the seed crosses in slow motion, time
    # held · bar 10 the touch, warmth, the rise. No drums; everything on the 80 BPM grid.
    M.add('fx', servo_shimmer(1.6, 'reveal'), ARM_REVEAL, RENEW_DB - 26.0, pan=0.45, room=0.25, hall=0.35,
          label='servo shimmer')
    for i, (tk, nme, vel) in enumerate(PIANO):
        nxt = [p for p in PEDAL if p > tk + 0.03][0]
        damp = nxt + 0.03 - tk
        slow = DRIFT[0] <= tk < DRIFT[1]                          # the slow motion rings into the big hall
        M.add('keys', felt_piano(nm(nme), vel, min(damp + 0.6, 6.0), key=('pno', i), damp=damp), tk, RENEW_DB - 12.5,
              pan=float(np.clip((nm(nme) - 60) / 40.0, -0.4, 0.4)), room=0.35, hall=0.2 if slow else 0.25,
              big=0.35 if slow else 0.0, label='piano')
    # pads: the human's breath (bar 8), a held breath through the slow motion (bar 9), breathing again (bar 10)
    (a0, a1, n0, v0), (b0, b1, n1, v1), (c0, c1, n2, v2) = RENEW_CHORDS
    reach = breath_pad(notes(v0), a1 - a0, (n0, a0), [(REACH[0] - a0, 22.9 - a0, 24.2 - a0)], depth_db=5.0, air=0.22,
                       attack=0.5, release=0.12, voices=2, lfo=0.05)
    reach *= automation([(a0, -30), (a0 + 0.5, -9), (REACH[0], -8), (22.9, 0), (a1 - 0.1, -1), (a1, -12)],
                        reach.shape[1], a0)
    M.add('pad', reach, a0, RENEW_DB - 21.0, hall=0.3, label='breath pad')
    chord_pad(M, b0, b1, n1, v1, RENEW_DB - 26.0, hall=0.3, big=0.3, attack=0.35, release=0.12, cut_lo=380.0,
              cut_hi=900.0, lfo=0.03, voices=2,
              env=[(b0, -20), (b0 + 0.6, 0), (26.4, 0), (b1 - 0.1, -4), (b1, -12)])
    warm = breath_pad(notes(v2), c1 - c0, (n2, c0), [(TOUCH + 0.05 - c0, 28.0 - c0, 29.7 - c0)], depth_db=4.0,
                      air=0.16, cut=(420.0, 1500.0), attack=0.12, release=0.12, voices=2, lfo=0.05)
    warm *= automation([(c0, -12), (TOUCH + 0.4, 0), (29.4, -1), (c1 - 0.2, -8), (c1, -20)], warm.shape[1], c0)
    M.add('pad', warm, c0, RENEW_DB - 21.5, hall=0.3, label='breath pad')
    # 23.625 the fingers tilt · 24.0 the seed lifts off the metal
    M.add('fx', servo_shimmer(TILT[1] - TILT[0] + 0.1, 'tilt', f0=480.0, f1=620.0, peak=0.45, shimmer=0.3), TILT[0],
          RENEW_DB - 31.0, pan=0.4, room=0.3, hall=0.2, label='tilt')
    tink = pan_mono(glass(hz('D7'), 1.4, 0.5, 0.5, 2.0) + 0.55 * glass(hz('A6'), 1.4, 0.6, 0.3, 2.0), 0.35)
    M.add('fx', tink, LIFT_OFF, RENEW_DB - 30.0, hall=0.3, big=0.4, label='lift-off')
    M.add('fx', data_tick(3520.0, 'lift-off', tau=0.0015, noise=0.2), LIFT_OFF, RENEW_DB - 37.0, pan=0.35,
          label='lift-off')
    # 24–27 SLOW MOTION: the cup's voice sung and blooming, glass held, time stretching
    held = sung_bowl(hz('D4'), 7.0, [(0.0, -60), (0.5, -28), (1.5, -10), (2.4, 0), (2.85, -2.5), (3.0, -3)],
                     release=DRIFT[1] - DRIFT[0], key='drift')
    M.add('cup', held, DRIFT[0], RENEW_DB - 17.0, hall=0.3, big=0.45, label='sung bowl')
    M.add('fx', glass_hold(DRIFT[1] - DRIFT[0], 'drift', notes_=('D6', 'A6', 'E7')), DRIFT[0], RENEW_DB - 27.0, hall=0.3,
          big=0.5,
          label='glass hold')
    M.add('fx', seed_trail(DRIFT[1] - DRIFT[0] - 0.1, 'drift'), DRIFT[0] + 0.05, RENEW_DB - 32.0, hall=0.25, big=0.3,
          label='seed trail')
    M.add('air', whoosh(DRIFT[1] - DRIFT[0], 220.0, 1500.0, 0.45, -0.35, peak=0.55, q=0.9, shape=1.2, key='slow air',
                        width=0.35), DRIFT[0], RENEW_DB - 31.0, big=0.4, label='slow air')
    # 27.0 THE TOUCH: a held breath, then the cup's warm bell, a bloom, the low resolve
    rs = reverse_swell(0.6, 'touch', [hz('D5'), hz('A5')], rt=1.8, noise_amt=0.2)
    M.add('fx', rs, TOUCH - 0.6, RENEW_DB - 29.0, label='reverse swell')
    M.add('cup', warm_bell(hz('D5'), 5.0, 'touch'), TOUCH, RENEW_DB - 20.5, hall=0.45, big=0.25, label='touch bell')
    M.add('fx', bloom(3.0, 'touch', attack=0.45, dec=1.1, lp=2200.0, hp=180.0), TOUCH, RENEW_DB - 24.0, hall=0.3,
          label='touch bloom')
    M.add('cup', cup('D3', 5.0, ring=3.0, key='touch low', hardness=0.55, width=0.3, clang=0.4, thump=0.5), TOUCH,
          RENEW_DB - 24.5, hall=0.3, label='low resolve')
    low = sub_drone(hz('D2'), SEED_RISE[1] + 0.3 - TOUCH, h2=0.3, breathe=0.04)
    low *= automation([(TOUCH, -40), (TOUCH + 0.35, 0), (SEED_RISE[0], -2), (SEED_RISE[1] + 0.3, -30)], low.size, TOUCH)
    M.add('sub', fade(low, 0.02, 0.05), TOUCH, RENEW_DB - 30.0, label='low resolve')
    M.add('fx', servo_shimmer(WITHDRAW[1] - WITHDRAW[0], 'withdraw', f0=460.0, f1=330.0, peak=0.4, shimmer=0.5),
          WITHDRAW[0], RENEW_DB - 32.0, pan=0.5, room=0.3, hall=0.3, label='withdraw')
    # 28.5–30 the seed rises into the mark
    M.add('fx', soft_riser(SEED_RISE[1] - SEED_RISE[0] + 0.1, 'ember', 380.0, 4800.0, (nm('D5'), nm('A5')), 0.3),
          SEED_RISE[0], RENEW_DB - 22.0, hall=0.25, label='riser')

    # ── S7 · THE MARK (film 30–39): release & resolve ───────────────────────
    for (c0, c1, name, v), env in zip(BUILD_CHORDS, ([(BUILD_CHORDS[0][0], -16), (ft(23.8), -8)],
                                                      ftp([(23.7, -8), (24.6, -3.5)]) + [(LOGO - BREATH, -14)])):
        # the build swells, then draws back (an inhale) so the lock lands on contrast
        chord_pad(M, c0, c1, name, v, BUILD_DB - 19.0, hall=0.3, attack=0.15, release=0.03, cut_lo=500.0,
                  cut_hi=2200.0, lfo=0.4 / STRETCH, env=env)
    peak_t = ft(24.6)
    for t0, t1, note in ((ft(22.5), ft(23.8), 'Bb1'), (ft(23.75), LOGO - BREATH, 'C2')):
        s = sub_drone(hz(note), t1 - t0, h2=0.6)
        s *= automation([(t0, -12), (min(t1, peak_t), 0), (t1, -10 if t1 > peak_t else 0)], s.size, t0)
        M.add('sub', fade(s, 0.04, 0.03), t0, BUILD_DB - 27.0, label='build sub')
    for tk, g in HEARTBEATS:                                      # every heartbeat has let go before the breath
        k = felt_kick('heart')
        k = fade(k[:min(k.size, smp(LOGO - BREATH - tk))], 0.0015, 0.04)
        M.add('kick', k, tk, BUILD_DB + g, label='kick')
    for i, (tk, note, p) in enumerate(SPLIT_TONES):
        M.add('keys', rising_tone(nm(note), 1.5, key=i), tk, BUILD_DB - 22.5, pan=p, hall=0.4, label='rising tone')
    for i, (t0, d) in enumerate(((23.0, 1.0), (23.6, 1.0), (24.1, 0.855))):
        M.add('fx', swirl(sd(d), ('build', i), 500.0 + 150 * i, 2800.0 + 500 * i, (0.8 + 0.6 * i) / STRETCH,
                          (2.5 + i) / STRETCH), ft(t0), BUILD_DB - 28.5 + 1.5 * i, hall=0.25, label='swirl')
    roll_t = [ft(23.75) + k * S16 for k in range(4)] + [ft(24.375) + k * S32 for k in range(7)]
    for k, tk in enumerate(roll_t):
        u = k / (len(roll_t) - 1)
        M.add('cup', cup(['A4', 'D5'][k % 2], min(1.6, LOGO - tk - 0.03), ring=1.2, key=('roll', k),
                         hardness=0.6 + 0.3 * u, clang=0.5), tk, BUILD_DB - 35.0 + 10.0 * u, pan=0.3 * (-1) ** k,
              hall=0.3, label='bowl roll')
    rs = reverse_swell(sd(0.7), 'logo', [hz(n_) for n_ in 'D4 A4 C5 E5'.split()], rt=2.2)
    M.add('fx', rs, LOGO - sd(0.7), BUILD_DB - 23.5, label='reverse swell')
    M.add('fx', soft_riser(sd(0.95) - BREATH, 'logo', 500.0, 5200.0, (nm('A4'), nm('D5')), 0.2, curve=2.2),
          LOGO - sd(0.95), BUILD_DB - 27.0, label='riser')

    # THE LOGO LOCKS (film 33.0)
    tail = SILENT_FROM - LOGO                                     # 5.9 s to the silence
    M.add('fx', lock_click(), LOGO, LOGO_DB - 24.0, room=0.3, big=0.2, label='logo click')
    M.add('kick', felt_kick('impact'), LOGO, LOGO_DB - 19.5, label='impact kick')
    M.add('sub', boom(95.0, hz('D1'), 3.0, 0.12, 0.6, drive=1.8), LOGO, LOGO_DB - 23.5, label='impact')
    low = sub_drone(hz('D2'), tail, h2=0.2)
    low *= automation(ftp([(25.0, -90), (25.25, -6), (26.0, 0), (29.0, -34)]), low.size, LOGO)
    M.add('sub', fade(low, 0.05, 0.05), LOGO, LOGO_DB - 23.0, label='tail sub')
    M.add('cup', cup('D3', tail, ring=3.2, key='logo', hardness=0.95, width=0.55, beat_depth=0.7), LOGO,
          LOGO_DB - 21.0, hall=0.25, big=0.65, label='logo bowl')
    for j, (nme, ring_, g) in enumerate((('D4', 2.2, -24.0), ('F4', 0.6, -28.0), ('A4', 2.0, -24.0),
                                          ('C5', 1.0, -26.0), ('E5', 1.8, -24.5))):
        M.add('cup', cup(nme, tail - 0.012 * j, ring=ring_, key=('logo chord', j), hardness=1.0, beat_depth=0.7),
              LOGO + 0.012 * j, LOGO_DB + g, pan=-0.5 + 0.25 * j, hall=0.2, big=0.6, label='bell chord')
    M.add('fx', bloom(sd(4.0), 'logo', attack=0.18, dec=1.0, lp=4200.0, hp=300.0), LOGO, LOGO_DB - 13.5, big=0.4,
          label='impact bloom')
    M.add('fx', rim_shimmer(sd(1.0), 'sweep', ('D7', 'F#7', 'A7', 'E7'), -0.6, 0.7, peak=0.3), ft(25.05),
          LOGO_DB - 21.5, big=0.5, label='light sweep')
    minor = warm_pad(notes(FINAL_MINOR), sd(1.3), 'final minor', cut_lo=600.0, cut_hi=2000.0, attack=0.1,
                     release=0.6)
    M.add('pad', minor * automation(ftp([(25.0, 0), (25.4, 0), (26.1, -30)]), minor.shape[1], LOGO), LOGO,
          LOGO_DB - 15.0, hall=0.2, big=0.35, label='final pad')
    lift = warm_pad(notes(FINAL_LIFT), sd(4.5), 'final lift', cut_lo=600.0, cut_hi=2300.0, attack=0.6, release=1.0,
                    lfo=0.15 / STRETCH)
    lift = eq(lift, 'peak', 300.0, -3.0, 0.8)                     # the long hold stays clear in the low mids
    lift *= automation(ftp([(25.4, -30), (26.1, 0), (27.5, -1), (29.2, -30)]), lift.shape[1], FINAL_LIFT_T[0])
    M.add('pad', lift, FINAL_LIFT_T[0], LOGO_DB - 19.0, hall=0.2, big=0.35, label='final pad')
    for j, nme in enumerate(('F#5', 'A5', 'D6')):
        M.add('keys', pan_mono(fm_bell(hz(nme), 3.5, ratio=3.5, index=0.6, dec=1.4), -0.4 + 0.4 * j),
              LIFT_BELLS + sd(0.05) * j, LOGO_DB - 25.5, big=0.5, label='lift bell')
    for tk, note in LINE_TICKS:
        M.add('fx', glass(hz(note), 1.0, 0.25, 0.5), tk, LOGO_DB - 27.5, pan=0.15, hall=0.4, label='line tick')
        M.add('fx', data_tick(3520.0, ('line', tk), tau=0.0025, noise=0.3), tk, LOGO_DB - 32.0, pan=0.15, room=0.3,
              label='line tick transient')
    M.add('fx', rim_shimmer(SWEEP_2[1] - SWEEP_2[0], 'sweep 2', ('A6', 'D7', 'F#7', 'A7'), -0.5, 0.55, peak=0.45),
          SWEEP_2[0], LOGO_DB - 31.0, big=0.5, label='light sweep 2')
    M.add('air', dust(sd(2.5), 'mark', notes('A6 B6 D7 E7 F#7'), rate=2.0 / STRETCH, spread_db=10.0), ft(27.0), -33.0,
          big=0.4, label='dust')
    return M


# ════════════════════════════════════════════════════════════════════════════
# 5. Mix bus & master chain
# ════════════════════════════════════════════════════════════════════════════
STEM_EQ = {  # (hpf Hz, lpf Hz): everything but the sub and the kick is high-passed; the top stays open
    'perc': (150.0, 16000.0), 'cup': (90.0, 16000.0), 'keys': (45.0, 16000.0), 'pad': (100.0, 9000.0),
    'fx': (120.0, 16000.0), 'air': (180.0, 16000.0), 'sub': (28.0, 300.0), 'kick': (None, None),
}
DUCKS = {  # stem → [(trigger labels, depth dB, release s)]: the pad breathes with the kick, it does not pump
    'pad': [(('kick',), 2.5, 0.25), (('impact kick',), 5.0, 0.8)],
    'sub': [(('kick',), 8.0, 0.14)],
    'returns': [(('kick',), 1.0, 0.2)],
}
RETURNS_DB = {'room': -6.0, 'hall': -3.0, 'big': -5.5}
IRS = {}


def irs():
    if not IRS:
        IRS['room'] = make_ir(0.7, 1.0, 0.008, 'room', damp=9000.0)
        IRS['hall'] = make_ir(2.6, 3.2, 0.022, 'hall', damp=8000.0)
        IRS['big'] = make_ir(3.4, 4.2, 0.035, 'big', damp=7000.0, lo_x=1.1)
    return IRS


def duck_curves(M):
    """Sidechain gain per ducked stem, keyed from the whole film's trigger times."""
    out = {}
    for stem, specs in DUCKS.items():
        g = np.ones(N)
        for labels, depth, rel in specs:
            ts = M.times(*labels)
            if ts:
                g = np.minimum(g, duck_env(ts, depth, rel))
        out[stem] = g
    return out


def stem_chain(name, x, duck=None):
    """One stem's EQ (and sidechain gain). Causal and linear."""
    hp_, lp_ = STEM_EQ.get(name, (None, None))
    x = hpf(x, hp_) if hp_ else x
    x = lpf(x, lp_) if lp_ else x
    if name in ('pad', 'keys'):
        x = eq(x, 'peak', 280.0, -1.5, 0.9)
    if name == 'pad':                                   # make room for the bowls' fundamentals
        x = eq(x, 'peak', 520.0, -2.0, 1.0)
    return x if duck is None else x * duck


def returns_chain(sends, duck=None):
    """The three reverbs, summed, band-limited (and gently ducked). Linear."""
    ir = irs()
    ret = sum(reverb(sends[k], ir[k]) * db2lin(v) for k, v in RETURNS_DB.items())
    ret = lpf(hpf(ret, 250.0, 2), 11000.0)
    return ret if duck is None else ret * duck


def mix_bus(M):
    """Stem EQ, sidechain ducking and reverb returns → one stereo bus."""
    ducks = duck_curves(M)
    out, stems = np.zeros((2, N)), {}
    for name, buf in M.stems.items():
        stems[name] = stem_chain(name, buf, ducks.get(name))
        out += stems[name]
    stems['returns'] = returns_chain(M.sends, ducks['returns'])
    return out + stems['returns'], stems, ducks


def tail_mask():
    """1 until TAIL_FADE[0]; then the gain falls along a curve in dB (−54·u² dB,
    the bend of a natural decay rather than a fader's cosine) to SILENT_FROM (38.9),
    the last 20 ms eased to exact zero; digital zero from 38.9 to 39.0. The music has
    already let go (every source decays on its own), so this only trims."""
    g = np.ones(N)
    a, b = smp(TAIL_FADE[0]), smp(TAIL_FADE[1])
    u = (np.arange(b - a) + 1) / (b - a)
    g[a:b] = db2lin(-54.0 * u ** 2)
    z = smp(0.02)
    g[b - z:b] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(z) + 1) / z)
    g[b:] = 0.0
    return g


def _front(b):
    """Master front end: DC/infrasonic high-pass, then mono below ~100 Hz (24 dB/oct on the side)."""
    x = hpf(b, 20.0, 4)
    m, s = 0.5 * (x[0] + x[1]), hpf(0.5 * (x[0] - x[1]), 100.0, 4)
    return np.stack([m + s, m - s])


LOW_STEMS = ('kick', 'sub')        # the low bus: its own peak control in the master


def master(bus, low):
    """DC block → mono lows → low-bus peak control → glue compression (slow
    attack: transients pass) → loudness trim → look-ahead true-peak limiter
    (iterated to −14 LUFS) → DC blocker → tail.

    `bus` is the whole mix and `low` its kick + sub stems. Those are peak-heavy
    (the big hits' kick and sub boom) but add little loudness; left alone they
    would make the full-band limiter duck the bells and the air of the logo. So
    the low bus gets its own look-ahead limiter first, holding its peaks
    LOW_HEADROOM dB under the final ceiling. Every stage is a gain curve on a
    linear signal path, so info['apply'](b, i0, low) runs any partial mix
    through exactly the same chain (to isolate a cue's share of the master)."""
    info = {}
    xh, xl = _front(bus - low), _front(low)
    pre_db = -18.0 - lufs(xh + xl)
    xh, xl = xh * db2lin(pre_db), xl * db2lin(pre_db)
    gain = TARGET_LUFS - lufs(xh + xl)
    mask = tail_mask()
    for _ in range(8):
        _, g_lo = limiter(xl * db2lin(gain), LIMIT_DBTP - LOW_HEADROOM, release=0.08)
        xg, g_glue = compressor(xh + xl * g_lo, thresh_db=-12.0, ratio=1.6, attack=0.03, release=0.3, knee_db=8.0,
                                sc_hpf=90.0)
        y, g_lim = limiter(xg * db2lin(gain), LIMIT_DBTP)
        y = hpf(y, 10.0, 4)                                # DC blocker after the gain riding
        tp = true_peak_db(y)
        corr = db2lin(LIMIT_DBTP - tp) if tp > LIMIT_DBTP else 1.0
        y = y * corr * mask
        err = TARGET_LUFS - lufs(y)
        if abs(err) < 0.03:
            break
        gain += err
    info['trim_db'] = float(gain + pre_db)
    info['glue_gain'] = g_glue
    info['glue_max_gr_db'] = float(-lin2db(g_glue.min()))
    info['glue_mean_gr_db'] = float(-np.mean(lin2db(g_glue[smp(GROOVE[0]):smp(GROOVE[1])])))
    info['low_gain'] = g_lo
    info['low_max_gr_db'] = float(-lin2db(g_lo.min()))
    info['limiter_gain'] = g_lim
    info['limiter_max_gr_db'] = float(-lin2db(g_lim.min()))
    info['limiter_pct_over_1db'] = float(np.mean(g_lim < db2lin(-1.0)) * 100)
    g_all = g_glue * g_lim * db2lin(pre_db + gain)

    def apply(b, i0=0, low=None):
        n = b.shape[1]
        z = _front(b) if low is None else _front(b) + _front(low) * g_lo[i0:i0 + n]
        return hpf(z * g_all[i0:i0 + n], 10.0, 4) * (mask[i0:i0 + n] * corr)
    info['apply'] = apply
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
LOGO_LABELS = ('logo click', 'impact kick', 'impact', 'tail sub', 'logo bowl', 'bell chord', 'impact bloom',
               'light sweep', 'final pad')
SLOWMO_LABELS = ('sung bowl', 'glass hold', 'seed trail', 'slow air')
TOUCH_LABELS = ('touch bell', 'touch bloom', 'low resolve', 'piano')


def heard_cues():
    """Every picture cue that must be *heard*, in sync: (name, cue time, event labels,
    (first, last) event time, analysis window or None for a hit's first 80 ms). Film seconds."""
    def h(name, t, labels, ev=None, win=None):
        return name, t, labels, ev or (t, t), win
    c = [h('rim light', RIM_LIGHT, ('rim shimmer',), win=(RIM_LIGHT, ft(1.0))), h('CUP #1', CUP_1, ('cup strike',))]
    c += [h(f'spark {n}', t, ('spark crackle', 'spark ping')) for t, n, _p in SPARKS]
    c += [h('dive', DIVE[0], ('dive', 'reverse swell'), win=(ft(4.4), ft(4.965))), h('CUP #2', CUP_2, ('cup strike',)),
          h('scan', CUP_2, ('scan',), win=SCAN)]
    c += [h('annotation', t, ('annotation tick',)) for t, _n, _p in ANNOTATIONS]
    c += [h('re-solidify', RESOLIDIFY[0], ('reverse swell', 'scan up'), win=(ft(7.07), ft(7.46)))]
    c += [h('kick', t, ('kick',)) for t in GROOVE_KICKS]
    c += [h('servo down', SERVO_DESCEND[0], ('servo',), win=(ft(7.55), ft(8.08))), h('grip', GRIP, ('grip clack',))]
    c += [h('1→2', MULTIPLY[0][0], ('bowl', 'slide')), h('2→4', MULTIPLY[1][0], ('bowl', 'slide')),
          h('four as one', FOUR, ('bowl', 'add9', 'landing sub'), (FOUR, FOUR + 0.02))]
    c += [h('paper', PAPER[0], ('paper flick',), (PAPER[0], PAPER[-1]), (PAPER[0], ft(10.5)))]
    c += [h('copper tab', SORT[i], ('sort tab',)) for i in SORT_TABS]
    c += [h('ring closes', RING + 7 * S16, ('ring closes',)), h('focus', FOCUS[0], ('focus beep',)),
          h('lens', LENS[0], ('lens',), win=LENS), h('shutter', SHUTTER, ('shutter',)),
          h('soil', SOIL, ('soil',)), h('sprout', SPROUT[0], ('sprout',), win=(SPROUT[0], ft(14.95)))]
    c += [h('four chime', FOUR_CHIME, ('bowl',), (FOUR_CHIME, FOUR_CHIME + 0.02))]
    c += [h('hairline', t, ('hairline',)) for t in HAIRLINES]
    c += [h('lift', LIFT, ('ascending shimmer', 'rising swell'), (LIFT, LIFT + sd(0.2))), h('accent', ACCENT, ('accent',)),
          h('merge flare', MERGE, ('merge flare',)), h('airy sweep', SINK[0], ('airy sweep',), win=(ft(16.9), ft(17.45)))]
    # Renew (recomposed, film time)
    c += [h('arm reveal', ARM_REVEAL, ('servo shimmer',), win=(ARM_REVEAL + 0.05, ARM_REVEAL + 1.4)),
          h('hand reaches', PIANO[0][0], ('piano',)),
          h('breath', REACH[0], ('breath pad',), (RENEW_CHORDS[0][0], RENEW_CHORDS[0][0]), (22.4, 23.7)),
          h('fingers tilt', TILT[0], ('tilt',), win=(TILT[0] + 0.05, TILT[1])),
          h('lift-off', LIFT_OFF, ('lift-off',)),
          h('slow motion', DRIFT[0], SLOWMO_LABELS, (DRIFT[0], DRIFT[0] + 0.1), (DRIFT[0] + 0.6, TOUCH - 0.1)),
          h('THE TOUCH', TOUCH, TOUCH_LABELS, (TOUCH, TOUCH + 0.3)),
          h('arm withdraws', WITHDRAW[0], ('withdraw',), win=(WITHDRAW[0] + 0.3, WITHDRAW[1] - 0.4)),
          h('seed rises', SEED_RISE[0], ('riser',), win=(SEED_RISE[0] + 0.5, SEED_RISE[1]))]
    c += [h(f'ember {n}', t, ('rising tone',)) for t, n, _p in SPLIT_TONES]
    c += [h('heartbeat', t, ('kick',)) for t, _g in HEARTBEATS]
    c += [h('LOGO', LOGO, LOGO_LABELS, (LOGO, LOGO + 0.1)),
          h('lift bells', LIFT_BELLS, ('lift bell',), (LIFT_BELLS - 0.03, LIFT_BELLS + 0.15))]
    c += [h('line tick', t, ('line tick', 'line tick transient')) for t, _n in LINE_TICKS]
    return c


HEARD_LABELS = {lab for cue in heard_cues() for lab in cue[2]}
THIRDS = 1000.0 * 2.0 ** (np.arange(-14, 14) / 3.0)          # 1/3-octave centres, 40 Hz … 20 kHz


def element(M, info, ducks, labels, ev, w1):
    """A cue's own share of the master: the kept events with these labels placed in
    [ev0, ev1], through the same stem EQ, ducking, reverb sends and master gain
    curves as the whole film (all linear, so element + rest = master). Returns
    (first sample, stereo share up to time w1)."""
    sel = [e for e in M.kept if e[2] in labels and ev[0] - 1e-9 <= e[0] <= ev[1] + 1e-9]
    i0 = smp(min(e[0] for e in sel))
    L = smp(w1) - i0
    stems, sends = {}, {k: np.zeros((2, L)) for k in RETURNS_DB}
    for t, stem, _lab, seg, snd in sel:
        j0 = smp(t) - i0
        j1 = min(L, j0 + seg.shape[1])
        if j1 <= j0:
            continue
        stems.setdefault(stem, np.zeros((2, L)))[:, j0:j1] += seg[:, :j1 - j0]
        for k, amt in snd.items():
            sends[k][:, j0:j1] += seg[:, :j1 - j0] * amt
    bus, low = returns_chain(sends, ducks['returns'][i0:i0 + L]), np.zeros((2, L))
    for name, x in stems.items():
        x = stem_chain(name, x, ducks[name][i0:i0 + L] if name in ducks else None)
        if name in LOW_STEMS:
            low = low + x
        else:
            bus = bus + x
    return i0, info['apply'](bus, i0, low)


def _thirds(seg):
    n = seg.shape[-1]
    nfft = max(4096, 1 << int(np.ceil(np.log2(n))))
    X = np.abs(np.fft.rfft(seg * np.hanning(n), nfft)) ** 2
    f = np.fft.rfftfreq(nfft, 1.0 / SR)
    return np.stack([X[..., (f >= c * 2 ** (-1 / 6)) & (f < c * 2 ** (1 / 6))].sum(-1) for c in THIRDS], -1)


def audibility(y, M, info, ducks, cue):
    """How clearly one cue reads in the mix, and when it emerges.

    E = the cue's isolated share of the master, R = master − E. Over the hit's first
    80 ms (or the swell's window): the best 1/3-octave E/R ratio (either channel,
    bands within 30 dB of E's loudest) and the K-weighted loudness the cue adds.
    Timing (hits): E's own onset (−12 dB of its early peak, 1 ms RMS), and the
    moment it *emerges* from the mix: the first sample where E's envelope passes
    R's in E's best octave band ≥ 250 Hz (zero-phase band-pass, 1 ms RMS)."""
    name, c, labels, ev, win = cue
    a, b = win or (c, c + 0.08)
    i0, E = element(M, info, ducks, labels, ev, max(b, c + 0.2) + 0.01)
    T = y[:, i0:i0 + E.shape[1]]
    R = T - E
    j0, j1 = smp(a) - i0, smp(b) - i0
    Eb, Rb = _thirds(E[:, j0:j1]), _thirds(R[:, j0:j1])
    ratio = 10 * np.log10((Eb + 1e-30) / (Rb + 1e-30))
    ok = (10 * np.log10(Eb + 1e-30) > 10 * np.log10(Eb.max() + 1e-30) - 30.0) & (THIRDS >= 50.0)
    best = float(ratio[ok].max())
    k = np.unravel_index(np.argmax(np.where(ok, ratio, -np.inf)), ratio.shape)
    kT, kR = k_weight(T[:, j0:j1]), k_weight(R[:, j0:j1])
    add_db = float(10 * np.log10(np.sum(kT ** 2) / (np.sum(kR ** 2) + 1e-30) + 1e-30))
    res = dict(best=best, band=float(THIRDS[k[1]]), add=add_db, on=None, emerge=None)
    if win is None:
        jc = smp(c) - i0
        e1 = uniform_filter1d(np.mean(E[:, :jc + smp(0.15)] ** 2, 0), 48)
        res['on'] = (np.argmax(e1 > e1[jc:].max() * 10 ** -1.2) - jc) / SR * 1000.0
        octs = (250.0, 500.0, 1000.0, 2000.0, 4000.0, 8000.0)
        eo = [np.sum(_thirds(E[:, jc:jc + smp(0.06)])[:, (THIRDS >= f / 1.42) & (THIRDS < f * 1.42)]) /
              (np.sum(_thirds(R[:, jc:jc + smp(0.06)])[:, (THIRDS >= f / 1.42) & (THIRDS < f * 1.42)]) + 1e-30) for f in octs]
        fb = octs[int(np.argmax(eo))]
        sos = sps.butter(2, (fb / 1.42, min(fb * 1.42, 20000.0)), btype='bandpass', fs=SR, output='sos')
        env = lambda x: uniform_filter1d(sps.sosfiltfilt(sos, x.mean(0)) ** 2, 48)
        ee, er = env(E), env(R)
        s0 = max(0, jc - smp(0.01))
        hit = np.nonzero(ee[s0:jc + smp(0.03)] > er[s0:jc + smp(0.03)])[0]
        res['emerge'] = (s0 + hit[0] - jc) / SR * 1000.0 if hit.size else None
    return res


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


SECTIONS = [(0.0, ft(5.0), 'S1 tale'), (ft(5.0), ft(7.5), 'S2 underst'), (ft(7.5), ft(10.0), 'S3 make'),
            (ft(10.0), ft(15.0), 'S4 worlds'), (ft(15.0), ft(17.5), 'S5 system'), (RENEW[0], RENEW[1], 'S6 renew'),
            (RENEW[1], LOGO, 'S7 build'), (LOGO, SILENT_FROM, 'S7 mark')]
BANDS = [(20, 60, 'sub'), (60, 200, 'low'), (200, 400, 'mud'), (400, 2000, 'mid'), (2000, 6000, 'hmid'),
         (6000, 12000, 'high'), (12000, 24000, 'air')]


def spectral_report(y):
    """Per section: band energy vs total; % of power above 6 kHz; centroid; the
    loudest 1/3-octave above 6 kHz relative to the 2–5 kHz presence average
    (a smooth, non-piercing top sits below it); the strongest narrow line
    above 6 kHz relative to the strongest line in 1–5 kHz (a bell's high
    partial is fine; one that rivals the presence tones pierces); and mud = the
    200–400 Hz octave's level against the mean of its neighbour octaves."""
    rows = []
    for a, b, name in SECTIONS:
        seg = y[:, smp(a):smp(b)].mean(0)
        f, P = sps.welch(seg, SR, nperseg=8192)
        tot = P[(f >= 20)].sum()
        bands = [10 * np.log10(P[(f >= lo) & (f < hi)].sum() / tot + 1e-20) for lo, hi, _ in BANDS]
        Pdb = 10 * np.log10(P + 1e-20)
        hf, pres = f > 6000, (f >= 1000) & (f < 5000)
        spike, spike_f = float(Pdb[hf].max() - Pdb[pres].max()), float(f[hf][np.argmax(Pdb[hf])])
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


def verify(path, M, stems, ducks, info, preview=True):
    fmt, pcm = read_wav(path)
    y = pcm.astype(float) / 32768.0
    ok = True

    def check(cond, msg):
        nonlocal ok
        ok &= bool(cond)
        print(f"  [{'ok' if cond else 'FAIL'}] {msg}")
    print('\n── format & time map')
    check(fmt[:4] == (2, 2, SR, N) and fmt[4] == 'NONE',
          f'{fmt[0]} ch · {fmt[1] * 8}-bit PCM · {fmt[2]} Hz · {fmt[3]} frames ({fmt[3] / SR:.3f} s)')
    tm_ok = [(T, F) for T, F in ((0.0, 0.0), (2.5, 3.0), (17.5, 21.0), (22.5, 30.0), (22.9, 30.48), (23.2, 30.84),
                                 (23.5, 31.2), (25.0, 33.0), (30.0, 39.0)) if abs(ft(T) - F) > 1e-9]
    check(not tm_ok and abs(BEAT - 0.75) < 1e-12 and abs(sd(60.0 / STORY_BPM) - BEAT) < 1e-12,
          f'time map {[list(p_) for p_ in TIMEMAP]} (film, story): story 22.9 / 23.2 / 23.5 → '
          f'{ft(22.9):.2f} / {ft(23.2):.2f} / {ft(23.5):.2f}, lock 25.0 → {LOGO:.2f}; beat {BEAT} s, bar {BAR} s'
          + (f' · wrong: {tm_ok}' if tm_ok else ''))
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
    print(f"  low-band GR max {info['low_max_gr_db']:.1f} dB · glue comp GR max {info['glue_max_gr_db']:.1f} dB "
          f"(mean {info['glue_mean_gr_db']:.2f} dB in the groove) · limiter GR max {info['limiter_max_gr_db']:.1f} dB, "
          f">1 dB on {info['limiter_pct_over_1db']:.2f}% of samples")
    for name, key in (('low band', 'low_gain'), ('limiter', 'limiter_gain'), ('glue', 'glue_gain')):
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
    print('\n── cues in the mix: each cue isolated (E) against everything else (R = master − E)')
    print('   E/R = best 1/3-oct ratio over the hit\'s first 80 ms (or the swell); +L = loudness it adds;')
    print('   onset = the cue\'s own attack; emerges = when it passes the rest of the mix in its best octave')
    rows, weak, late = [], [], []
    AUD = {}
    for cue in heard_cues():
        name, c = cue[0], cue[1]
        r_ = audibility(y, M, info, ducks, cue)
        AUD[(name, c)] = r_
        if r_['best'] < 3.0:
            weak.append(f'{name} {c:.3f} ({r_["best"]:+.1f} dB)')
        tm = ''
        if r_['on'] is not None:
            em = r_['emerge']
            tm = f"onset {r_['on']:+5.1f} ms · emerges " + (f'{em:+5.1f} ms' if em is not None else '  n/a  ')
            if not (-1.0 <= r_['on'] <= 5.0) or em is None or abs(em) > 5.0:
                late.append(f'{name} {c:.3f}')
        rows.append(f"{c:7.3f} {name:<13} E/R {r_['best']:+5.1f} dB @{r_['band'] / 1000:4.1f}k +L {r_['add']:4.1f}  {tm}")
    for i in range(0, len(rows), 2):
        print('  ' + '  '.join(f'{s_:<80}' for s_ in rows[i:i + 2]))
    hits = [v for (n_, c_), v in AUD.items() if v['on'] is not None]
    check(not weak, f'every picture cue reads in the mix: E/R ≥ +3 dB in its best band for all {len(AUD)} cues '
                    f'(lowest {min(v["best"] for v in AUD.values()):+.1f} dB)' + (f' · weak: {", ".join(weak)}' if weak else ''))
    check(not late, f'sync: every hit\'s own onset within 0…+5 ms (max {max(v["on"] for v in hits):+.1f}) and it '
                    f'emerges from the mix within ±5 ms (max |{max(abs(v["emerge"]) for v in hits if v["emerge"] is not None):.1f}| ms)'
                    + (f' · off: {", ".join(late)}' if late else ''))
    placed = {lab: M.times(lab) for lab in ('kick', 'cup strike', 'bowl', 'spark ping', 'annotation tick', 'line tick',
                                            'hairline', 'sort tab', 'merge flare', 'piano', 'lift-off', 'touch bell',
                                            'rising tone', 'logo click')}
    want = {'kick': sorted(GROOVE_KICKS + [t for t, _g in HEARTBEATS]), 'cup strike': [CUP_1, CUP_2],
            'bowl': sorted({tk for tk, _ in MULTIPLY} | {FOUR_CHIME}), 'spark ping': [s_[0] for s_ in SPARKS],
            'annotation tick': [a_[0] for a_ in ANNOTATIONS], 'line tick': [a_[0] for a_ in LINE_TICKS],
            'hairline': HAIRLINES, 'sort tab': [SORT[i] for i in SORT_TABS], 'merge flare': [MERGE],
            'piano': [p_[0] for p_ in PIANO], 'lift-off': [LIFT_OFF], 'touch bell': [TOUCH],
            'rising tone': [s_[0] for s_ in SPLIT_TONES], 'logo click': [LOGO]}
    check(all(any(abs(p_ - w_) < 0.5 / SR for p_ in placed[k]) for k in want for w_ in want[k]),
          'placement: every cue element starts on its exact sample (kicks, strikes, bowls, sparks, ticks, links, tabs, '
          'Renew piano, lift-off, touch, ember tones, lock)')
    grid = [t_ for t_ in placed['kick'] + [p_[0] for p_ in PIANO] + [m_[0] for m_ in MULTIPLY] + [FOUR_CHIME, LOGO]]
    off = [t_ for t_ in grid if abs(t_ / S32 - round(t_ / S32)) * S32 > 0.5 / SR]
    check(not off, f'80 BPM grid: {len(grid)} kicks, bowls, Renew piano notes and the lock sit on the film grid '
                   f'(32nds of {BEAT:.2f} s beats)' + (f' · off: {off[:6]}' if off else ''))
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
          '   >6k%  centroid  HF⅓oct-vs-2-5k  HF line vs 1-5k  mud: tonal/bed')
    spec_ok = True
    for name, bands, pct, cen, hf3, spike, sf, mud, mud_bed in spectral_report(y):
        bad = hf3 >= 0.0 or spike >= -10.0 or pct > 3.0 or mud_bed > 2.0
        spec_ok &= not bad
        print(f'  {name:<11} ' + ' '.join(f'{v:6.1f}' for v in bands) +
              f'  {pct:5.2f}  {cen:7.0f}  {hf3:+10.1f} dB  {spike:+6.1f} dB @{sf / 1000:4.1f}k  {mud:+5.1f}/{mud_bed:+5.1f}'
              + ('  <-- check' if bad else ''))
    check(spec_ok, 'nothing piercing above 6 kHz (⅓-oct < presence, no line within 10 dB of the presence tones, '
                   '< 3 % power) and no '
                   '200–400 Hz build-up (bed ≤ +2 dB vs neighbour octaves; "tonal" includes sustained notes)')
    print('\n── loudness arc (per section: mean / max momentary LUFS @ time · max short-term)')
    arc = section_loudness(y)
    for i in range(0, len(arc), 4):
        print('  ' + ' · '.join(f'{n.split()[1]} {m:.1f}/{x:.1f}@{tx_:.2f} st {s_:.1f}' for n, m, x, tx_, s_ in arc[i:i + 4]))
    mean = {n.split()[1]: m for n, m, _x, _t, _s in arc}
    groove = max(mean['make'], mean['worlds'], mean['system'])
    check(mean['tale'] <= groove - 5.0 and mean['tale'] < mean['underst'] < mean['make'] and
          mean['renew'] <= min(mean['system'], mean['build']) - 3.0,
          f"the arc: mystery {mean['tale']:.1f} → curiosity {mean['underst']:.1f} → momentum {groove:.1f} → "
          f"intimacy {mean['renew']:.1f} → build {mean['build']:.1f} → release {mean['mark']:.1f} LUFS")
    ts3, ls3 = loudness_curve(y, 3.0, 0.05)
    fin_st = float(ls3[ts3 - 1.5 >= LOGO - 0.05].max())            # 3 s windows from the lock on
    oth_st = float(ls3[ts3 + 1.5 <= LOGO].max())                   # 3 s windows wholly before it
    fin_m, oth_m = arc[-1][2], max(a[2] for a in arc[:-1])
    check(fin_st >= oth_st + 0.5 and fin_m >= oth_m and LOGO <= arc[-1][3] <= LOGO + sd(1.0),
          f'the logo lock is the climax: short-term {fin_st:.1f} vs {oth_st:.1f} LUFS before it; '
          f'momentary {fin_m:.1f} @ {arc[-1][3]:.2f} vs {oth_m:.1f}')
    tail = y[:, smp(SILENT_FROM):]
    pre = y[:, smp(SILENT_FROM - 0.1):smp(SILENT_FROM)]
    pre_db = lin2db(np.sqrt(np.mean(pre ** 2)) + 1e-12)
    check(not tail.any() and pre_db < -45.0,
          f'tail: {SILENT_FROM - 0.1:.1f}–{SILENT_FROM:.1f} at {pre_db:.0f} dBFS RMS (near-silence), '
          f'{SILENT_FROM:.1f}–{DUR:.1f} digital zero ({tail.shape[1]} frames)')
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
        marks = [(RIM_LIGHT, 'rim'), (CUP_1, 'CUP 1')] + [(t_, n_[0]) for t_, n_, _p in SPARKS] + [
            (DIVE[0], 'dive'), (CUP_2, 'CUP 2')] + [(t_, f'a{i + 1}') for i, (t_, _n, _p) in enumerate(ANNOTATIONS)] + [
            (RESOLIDIFY[0], 'swell'), (GROOVE[0], 'GROOVE'), (GRIP, 'grip'), (MULTIPLY[0][0], '1→2'),
            (MULTIPLY[1][0], '2→4'), (FOUR, 'FOUR'), (SORT[3], 'tabs'), (RING, 'pings'), (FOCUS[0], 'focus'),
            (SHUTTER, 'shutter'), (SOIL, 'soil'), (SPROUT[0], 'sprout'), (FOUR_CHIME, 'CHIME'), (HAIRLINES[0], 'links'),
            (LIFT, 'lift'), (ACCENT, 'accent'), (MERGE, 'one'), (SINK[0], 'sink'),
            (ARM_REVEAL, 'RENEW·arm'), (REACH[0], 'reach'), (PIANO[0][0], 'piano'), (TILT[0], 'tilt'),
            (LIFT_OFF, 'LIFT-OFF'), (25.5, 'slow motion'), (TOUCH, 'THE TOUCH'), (WITHDRAW[0], 'withdraw'),
            (SEED_RISE[0], 'rise')] + [(t_, f'e{i + 1}') for i, (t_, _n, _p) in enumerate(SPLIT_TONES)] + [
            (ft(23.75), 'roll'), (LOGO, 'LOGO'), (LIFT_BELLS, 'lift'), (LINE_TICKS[0][0], 'tick'),
            (LINE_TICKS[1][0], 'tick'), (SWEEP_2[0], 'sweep'), (SILENT_FROM, 'zero')]
        gr = info.get('limiter_gain')
        render_png(y, os.path.join(PREVIEW, 'audio-rev2-overview.png'), 0, DUR,
                   f'film.wav rev 2 · 39 s · {L:.1f} LUFS · TP {tp:.2f} dBTP · 80 BPM D minor/dorian', marks, gr)
        for fname, a_, b_, ttl in (('audio-rev2-1-tale.png', 0.0, 6.4, 'S1 the tale · film 0–6 · mystery'),
                                   ('audio-rev2-2-understand-make.png', 5.8, 12.4, 'S2 understand → S3 make · 6–12'),
                                   ('audio-rev2-3-worlds-system.png', 11.8, 21.2, 'S4 four worlds → S5 one system · 12–21'),
                                   ('audio-rev2-4-renew.png', 20.6, 30.4, 'S6 renew (recomposed) · 21–30 · slow motion'),
                                   ('audio-rev2-5-mark.png', 29.8, DUR, 'S7 build → logo 33.0 → tail · 30–39')):
            render_png(y, os.path.join(PREVIEW, fname), a_, b_, ttl, marks, gr)
        render_png(y, os.path.join(PREVIEW, 'audio-rev2-6-touch-zoom.png'), TOUCH - 0.8, TOUCH + 0.7,
                   'the held breath → THE TOUCH (27.00)', [(TOUCH - 0.6, 'swell'), (TOUCH, '27.00')], gr)
        render_png(y, os.path.join(PREVIEW, 'audio-rev2-7-impact-zoom.png'), LOGO - 0.2, LOGO + 0.3,
                   'breath → logo impact (33.00)', [(LOGO, f'{LOGO:.2f}')], gr)
        render_png(y, os.path.join(PREVIEW, 'audio-rev2-8-strike-zoom.png'), CUP_1 - 0.05, CUP_1 + 0.2,
                   'cup strike #1 transient', [(CUP_1, f'{CUP_1:.2f}')], gr)
        sung = sung_bowl(hz('D4'), 7.0, [(0.0, -60), (0.5, -28), (1.5, -10), (2.4, 0), (2.85, -2.5), (3.0, -3)],
                         release=3.0, key='drift')
        render_png(np.concatenate([solo, np.zeros((2, smp(0.5))), sung], 1), os.path.join(PREVIEW, 'audio-rev2-9-cup-voice.png'),
                   0.0, 13.5, 'the cup\'s voice, solo: struck bowl D4 (0–6 s) · the same voice SUNG and held (6.5–13.5 s)',
                   [(0.0, 'strike'), (6.5, 'sung'), (9.5, 'release')], None, fmax=8000.0)
        print(f'\n  previews → {os.path.relpath(PREVIEW, ROOT)}/audio-rev2-*.png')
    return ok


# ════════════════════════════════════════════════════════════════════════════
def main():
    t_start = time.time()
    preview = '--no-preview' not in sys.argv
    print('RIBHU LABS — "One Cup, Made Four" · score & sound design · revision 2 (39 s, 80 BPM)')
    M = arrange(keep=HEARD_LABELS)
    print(f'  arranged {len(M.events)} events in {time.time() - t_start:.1f} s')
    print('\n── cue sheet (film seconds, as rendered; story cues placed with film_time)')
    for a, b, what in CUES:
        print(f"  {a:6.3f}{'–' + format(b, '6.3f') if b is not None else '       '}  {what}")
    bus, stems, ducks = mix_bus(M)
    y, mask, info = master(bus, sum(stems[k] for k in LOW_STEMS))
    scale = db2lin(info['trim_db'])
    stems = {k: v * scale for k, v in stems.items()}
    pcm = to_int16(y, mask)
    write_wav(OUT_WAV, pcm)
    print(f'\n  wrote {os.path.relpath(OUT_WAV, ROOT)} in {time.time() - t_start:.1f} s (master trim {info["trim_db"]:+.1f} dB)')
    ok = verify(OUT_WAV, M, stems, ducks, info, preview)
    print(f"\n{'ALL CHECKS PASSED' if ok else 'SOME CHECKS FAILED'} · {time.time() - t_start:.1f} s")
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
