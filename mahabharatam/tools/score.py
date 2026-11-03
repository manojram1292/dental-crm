#!/usr/bin/env python3
"""
Mahabharatam · Episode score & sound design  →  audio/music.wav  (music/ambience stem)

Deterministic (seeded numpy/scipy synthesis, no samples, no network). Every cue
is placed from build/timeline.<lang>.json (tools/timeline.mjs), so the score
follows any language's timing and any recorded voice:

  · a tanpura drone (Pa–Sa–Sa–Sa, D), plucked with the jawari's travelling buzz
  · a shruti-box reed drone that swells under the clearing
  · a mridangam "tham" (thom + din) on every line start, with a ki-ta grace
    before it; heavier hits on the hook's three "Before"s (line beats)
  · soft temple bells (ghanta) at the dawn, the name and the end card;
    a bell peal + manjira + low bloom at the title (the swell)
  · fire crackle and its low roar wherever the fire is on screen
  · dawn forest birds (koel and small birds) in the forest
  · a whirling "time passing" air under the twelve years of days and nights
  · a soft shimmer as the vision forms in the smoke

Mixed as a bed for narration: about −22 LUFS integrated, ≤ −2 dBTP, with the
voice band (1–4 kHz) kept gentle. tools/mix.py adds the voice and ducks this.

    python3 tools/score.py [--lang en] [--force]
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import wave

import numpy as np
from scipy import signal as sps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SR = 48_000
TARGET_LUFS = -22.0
CEIL_DBTP = -2.0
SA = 146.83            # D3: the tonic (Sa)


# ─── helpers ──────────────────────────────────────────────────────────────────
def smp(t):
    return int(round(t * SR))


def tvec(n):
    return np.arange(n) / SR


def rng(*key):
    h = hashlib.sha256(repr(key).encode()).digest()
    return np.random.default_rng(int.from_bytes(h[:8], 'little'))


def db(x):
    return 10 ** (x / 20)


def lpf(x, f, order=2):
    return sps.sosfilt(sps.butter(order, min(f, SR * 0.45), 'low', fs=SR, output='sos'), x, axis=-1)


def hpf(x, f, order=2):
    return sps.sosfilt(sps.butter(order, f, 'high', fs=SR, output='sos'), x, axis=-1)


def bpf(x, lo, hi, order=2):
    return sps.sosfilt(sps.butter(order, (lo, min(hi, SR * 0.45)), 'band', fs=SR, output='sos'), x, axis=-1)


def pan(x, p):
    """mono → stereo, equal-power pan p ∈ [-1, 1]."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def add(bus, x, t0):
    """Add a (2, n) or (n,) signal into bus at time t0 (s), clipped to the bus."""
    if x.ndim == 1:
        x = pan(x, 0.0)
    i0 = smp(t0)
    j0, j1 = max(0, i0), min(bus.shape[1], i0 + x.shape[1])
    if j1 > j0:
        bus[:, j0:j1] += x[:, j0 - i0:j1 - i0]


def fade(x, a=0.005, r=0.05):
    n = x.shape[-1]
    e = np.ones(n)
    na, nr = min(n, smp(a)), min(n, smp(r))
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[n - nr:] *= np.linspace(1, 0, nr)
    return x * e


def env_curve(points, n):
    """Piecewise-linear automation [(t, v), …] sampled over n samples."""
    pts = sorted(points)
    return np.interp(tvec(n), [p[0] for p in pts], [p[1] for p in pts])


def make_ir(rt60, length, key, predelay=0.02, damp=7000.0):
    n = smp(length)
    t = tvec(n)
    r = rng('ir', key)
    chans = []
    for _ in range(2):
        nz = r.standard_normal(n)
        lo, hi = lpf(nz, 400.0), hpf(nz, 3500.0)
        mid = nz - lo - hi
        ir = lo * 10 ** (-3 * t / (rt60 * 1.2)) + mid * 10 ** (-3 * t / rt60) + hi * 10 ** (-3 * t / (rt60 * 0.5))
        ir *= 1 - np.exp(-t / 0.015)
        ir = lpf(ir, damp)
        ir = np.concatenate([np.zeros(smp(predelay)), ir])
        chans.append(ir)
    ir = np.stack(chans)
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


def reverb(x, ir):
    n = x.shape[1]
    ins = (0.7 * x[0] + 0.3 * x[1], 0.3 * x[0] + 0.7 * x[1])
    return np.stack([sps.oaconvolve(ins[c], ir[c])[:n] for c in range(2)])


# BS.1770 loudness
_K1 = (np.array([1.53512485958697, -2.69169618940638, 1.19839281085285]), np.array([1.0, -1.69065929318241, 0.73248077421585]))
_K2 = (np.array([1.0, -2.0, 1.0]), np.array([1.0, -1.99004745483398, 0.99007225036621]))


def lufs(x):
    y = sps.lfilter(*_K2, sps.lfilter(*_K1, x, axis=-1), axis=-1)
    p = y ** 2
    w, h = smp(0.4), smp(0.1)
    cs = np.concatenate([np.zeros((p.shape[0], 1)), np.cumsum(p, axis=-1)], axis=-1)
    st = np.arange(0, p.shape[1] - w + 1, h)
    z = ((cs[:, st + w] - cs[:, st]) / w).sum(0)
    lv = -0.691 + 10 * np.log10(z + 1e-20)
    m = lv > -70
    if not m.any():
        return -np.inf
    rel = -0.691 + 10 * np.log10(z[m].mean()) - 10
    m &= lv > rel
    return float(-0.691 + 10 * np.log10(z[m].mean()))


def true_peak_db(x):
    up = sps.resample_poly(x, 4, 1, axis=-1)
    return float(20 * np.log10(np.max(np.abs(up)) + 1e-12))


# ─── instruments ──────────────────────────────────────────────────────────────
def tanpura_pluck(f0, dur, key, bright=1.0):
    """A tanpura string: rich harmonics whose bright band (the jawari's buzz) sweeps
    down through the partials as the note rings."""
    n = smp(dur)
    t = tvec(n)
    r = rng('tanpura', key)
    out = np.zeros(n)
    H = 26
    centre = 18 - 12 * (1 - np.exp(-t / 1.1))           # the buzz band travels down
    for h in range(1, H + 1):
        f = f0 * h * (1 + 0.0004 * h * h * 0.02)
        if f > 9000:
            break
        band = np.exp(-((h - centre) / 3.2) ** 2) * 1.8 * bright
        amp = (1.0 / h ** 0.85) * (0.55 + band) * np.exp(-t / (3.2 / (1 + 0.04 * h)))
        ph = r.uniform(0, 2 * np.pi)
        vib = 1 + 0.0009 * np.sin(2 * np.pi * (4.2 + r.uniform(-0.4, 0.4)) * t + ph)
        out += amp * np.sin(2 * np.pi * f * t * vib + ph)
    att = np.minimum(1, t / 0.006)
    return fade(out * att * 0.12, 0.0, 0.4)


def reed_drone(n, f0s, key):
    """Shruti-box reeds: band-limited saw-ish tones with slow beating."""
    t = tvec(n)
    r = rng('reed', key)
    out = np.zeros(n)
    for f0 in f0s:
        for det in (-0.9, 0.7):
            f = f0 + det * 0.35
            ph = r.uniform(0, 2 * np.pi)
            s = np.zeros(n)
            for h in range(1, 14):
                s += np.sin(2 * np.pi * f * h * t + ph * h) / h ** 1.25
            out += s
    out = lpf(out, 1800, 2)
    return out / (np.max(np.abs(out)) + 1e-9)


def mridangam(kind, key, vel=1.0):
    """'thom' = the bass head (pitch-dropping thud); 'din' = the tuned right head
    (ringing harmonic partials, tuned to Sa); 'ki'/'ta' = dry finger taps."""
    r = rng('mri', kind, key)
    if kind == 'thom':
        n = smp(0.9)
        t = tvec(n)
        f = 62 + 70 * np.exp(-t / 0.045)
        ph = 2 * np.pi * np.cumsum(f) / SR
        body = np.sin(ph) * np.exp(-t / 0.26)
        slap = lpf(r.standard_normal(n), 900) * np.exp(-t / 0.012) * 0.5
        x = body + slap + 0.4 * np.sin(ph * 2.02) * np.exp(-t / 0.08)
    elif kind == 'din':
        n = smp(1.4)
        t = tvec(n)
        f0 = SA * 2
        x = np.zeros(n)
        for h, a, tau in ((1, 1.0, 0.55), (2, 0.6, 0.42), (3, 0.42, 0.3), (4, 0.25, 0.22), (5, 0.16, 0.16)):
            x += a * np.sin(2 * np.pi * f0 * h * (1 + 0.004 * np.exp(-t / 0.05)) * t + r.uniform(0, 6)) * np.exp(-t / tau)
        x += hpf(r.standard_normal(n), 1500) * np.exp(-t / 0.006) * 0.35
    else:  # ki / ta
        n = smp(0.18)
        t = tvec(n)
        f = 420 if kind == 'ki' else 560
        x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) * 0.6 + bpf(r.standard_normal(n), 1500, 6000) * np.exp(-t / 0.01) * 0.4
    x = x * np.minimum(1, tvec(len(x)) / 0.0015)
    return fade(x * vel, 0, 0.05)


def ghanta(f0, dur, key, vel=1.0):
    """A small temple bell: inharmonic partials, each a slowly beating doublet."""
    n = smp(dur)
    t = tvec(n)
    r = rng('bell', key)
    x = np.zeros(n)
    for ratio, a, tau in ((1.0, 1.0, 3.2), (2.31, 0.55, 2.2), (2.98, 0.3, 1.6), (4.21, 0.35, 1.2), (5.43, 0.18, 0.8), (6.8, 0.12, 0.5)):
        for d in (-1, 1):
            f = f0 * ratio + d * (0.6 + ratio * 0.4)
            x += 0.5 * a * np.sin(2 * np.pi * f * t + r.uniform(0, 6)) * np.exp(-t / tau)
    x += hpf(r.standard_normal(n), 3000) * np.exp(-t / 0.004) * 0.3
    return fade(x * vel * np.minimum(1, t / 0.001), 0, 0.3)


def manjira(key, vel=1.0):
    """Small hand cymbals: a bright, shimmering 'ting'."""
    n = smp(2.4)
    t = tvec(n)
    r = rng('manjira', key)
    x = np.zeros(n)
    for _ in range(14):
        f = r.uniform(3200, 9000)
        x += np.sin(2 * np.pi * f * t + r.uniform(0, 6)) * np.exp(-t / r.uniform(0.4, 1.4)) * r.uniform(0.3, 1)
    x = x / 8 + hpf(r.standard_normal(n), 5000) * np.exp(-t / 0.02) * 0.4
    return fade(x * vel * np.minimum(1, t / 0.0008), 0, 0.3)


def crackle(n, key, rate=7.0):
    """Wood fire: sparse pops and snaps over a low, breathing roar."""
    r = rng('crackle', key)
    out = np.zeros(n)
    k = int(rate * n / SR)
    for _ in range(k):
        i = r.integers(0, n)
        L = smp(r.uniform(0.004, 0.03))
        if i + L >= n:
            continue
        burst = r.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)) * r.uniform(0.2, 1) ** 2
        out[i:i + L] += burst
    out = bpf(out, 900, 7000)
    roar = lpf(r.standard_normal(n), 240, 2)
    breath = 0.6 + 0.4 * lpf(r.standard_normal(n), 1.5, 1) * 8
    return out * 0.5 + roar * 0.6 * np.clip(breath, 0.2, 1.5)


def bird_chirp(key, f0, f1, dur):
    n = smp(dur)
    t = tvec(n)
    f = f0 + (f1 - f0) * (t / dur) ** 0.7
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 2
    return x


def koel(key):
    """The koel's rising 'ku-oo', twice."""
    out = []
    for k in range(2):
        a = bird_chirp(key, 720 + k * 90, 1150 + k * 120, 0.42)
        out.append(np.concatenate([a, np.zeros(smp(0.16))]))
    return np.concatenate(out) * 0.5


def twitter(key):
    r = rng('twitter', key)
    parts = []
    for _ in range(r.integers(4, 9)):
        f0 = r.uniform(3200, 5200)
        parts.append(bird_chirp(key, f0, f0 * r.uniform(0.7, 1.4), r.uniform(0.03, 0.07)))
        parts.append(np.zeros(smp(r.uniform(0.02, 0.06))))
    return np.concatenate(parts) * 0.35


# ─── the score ────────────────────────────────────────────────────────────────
def build(tl):
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    starts = [l['start'] for l in tl['lines']]
    g = lambda i: L[i] if i in L else None   # noqa: E731

    bus_dry = np.zeros((2, N))     # close sounds
    bus_wet = np.zeros((2, N))     # sent to the hall reverb
    bed = np.zeros((2, N))         # drones (own gentle reverb)

    # ── tanpura: Pa Sa Sa Sa(low), one cycle ≈ 1.8 s, the whole episode ──
    cyc, notes = 1.84, (SA * 1.5 / 2 * 2, SA * 2, SA * 2, SA)    # Pa(A3) Sa'(D4) Sa'(D4) Sa(D3)
    t = 0.0
    k = 0
    while t < D:
        for j, f in enumerate(notes):
            tt = t + j * cyc / 4
            if tt >= D:
                break
            x = tanpura_pluck(f * (1 + 0.0007 * (j - 1.5)), 4.2, (k, j), bright=0.9 + 0.2 * (j == 3))
            add(bed, pan(x, [-0.35, 0.15, 0.3, -0.1][j]), tt)
        t += cyc
        k += 1
    # the drone breathes in under the hook rather than starting full
    first = g('before')
    hook_end = g('forest')['start'] if g('forest') else 4.0
    bed *= env_curve([(0, 0.35), (hook_end * 0.6, 0.55), (hook_end, 1.0), (D, 1.0)], N)

    # ── shruti-box reeds: swell under the clearing (fire → end) ──
    if g('fire'):
        reeds = reed_drone(N, (SA, SA * 1.5), 'r')
        f0t = g('fire')['start']
        aut = env_curve([(0, 0), (f0t - 0.3, 0), (f0t + 2.0, 0.22), (g('asked')['start'] if g('asked') else f0t + 4, 0.26), (D - 1.5, 0.3), (D, 0.0)], N)
        bed += pan(reeds * aut * 0.6, -0.2) + pan(reeds * aut * 0.6, 0.2) * 0.9

    # ── mridangam on every line start (ki-ta grace before it), heavy hits on the hook beats ──
    for i, l in enumerate(tl['lines']):
        t0 = l['start']
        if i == 0:
            continue    # the hook's own beats carry line 1
        vel = 0.62 if l['id'] != 'episode' else 0.55
        add(bus_dry, pan(mridangam('ki', i, 0.35), -0.15), t0 - 0.16)
        add(bus_dry, pan(mridangam('ta', i, 0.4), 0.15), t0 - 0.08)
        add(bus_dry, pan(mridangam('thom', i, vel), -0.05), t0)
        add(bus_dry, pan(mridangam('din', i, vel * 0.6), 0.1), t0 + 0.004)
        add(bus_wet, pan(mridangam('thom', i, vel * 0.5), 0.0), t0)
    for j, b in enumerate(first['beats'] if first else []):
        v = 1.0 + 0.1 * j
        add(bus_dry, pan(mridangam('thom', 100 + j, v * 1.15), 0.0), b)
        add(bus_dry, pan(mridangam('din', 100 + j, v * 0.7), 0.0), b + 0.003)
        add(bus_wet, pan(mridangam('thom', 100 + j, v * 0.9), 0.0), b)
        # a low bloom under each ghost flash
        n = smp(1.6)
        tt = tvec(n)
        boom = np.sin(2 * np.pi * (44 + 20 * np.exp(-tt / 0.1)) * tt) * np.exp(-tt / 0.6) * 0.5
        add(bus_dry, pan(boom * v, 0.0), b)
        add(bus_wet, pan(hpf(rng('air', j).standard_normal(n), 2000) * np.exp(-tt / 0.25) * 0.05, 0), b)

    # ── temple bells ──
    def bell(t0, f, vel, p, key):
        x = ghanta(f, 5.0, key, vel)
        add(bus_dry, pan(x * 0.4, p), t0)
        add(bus_wet, pan(x * 0.8, p), t0)
    if g('forest'):
        bell(g('forest')['start'] + 0.25, 1174.7, 0.22, 0.4, 'f')          # D6, distant: dawn
    if g('name'):
        bell(g('name')['beats'][0] if g('name')['beats'] else g('name')['start'] + 1, 880.0, 0.3, -0.25, 'n')   # A5 on the name
    if g('fire'):
        bell(g('fire')['start'] + 0.1, 587.33, 0.22, 0.2, 'fi')             # D5 at the clearing
    if g('episode'):
        bell(g('episode')['start'] + 0.15, 587.33, 0.3, 0.0, 'e1')
        bell(g('episode')['start'] + 0.95, 880.0, 0.2, 0.3, 'e2')

    # ── the swell at the title: rising air + reed crescendo, then a peal + manjira + bloom ──
    if g('vyasa'):
        v = g('vyasa')
        tb = v['beats'][0] if v['beats'] else v['start'] + 0.6 * (v['end'] - v['start'])
        n = smp(tb - v['start'] + 0.2)
        tt = tvec(n)
        rise = (tt / tt[-1]) ** 2.2
        air = bpf(rng('swell').standard_normal(n), 300, 5000) * rise * 0.12
        tone = sum(np.sin(2 * np.pi * f * tt) / (i + 1) for i, f in enumerate((SA, SA * 1.5, SA * 2, SA * 3))) * rise * 0.12
        add(bus_wet, np.stack([air + tone, air * 0.9 + tone]), v['start'])
        for i, (f, p) in enumerate(((587.33, -0.4), (880.0, 0.35), (1174.7, -0.1), (1318.5, 0.25))):
            bell(tb + i * 0.055, f, 0.32 - i * 0.04, p, ('peal', i))
        m = manjira('t', 0.5)
        add(bus_dry, pan(m * 0.5, 0.25), tb)
        add(bus_wet, pan(m * 0.6, 0.25), tb)
        n = smp(3.0)
        tt = tvec(n)
        bloom = np.sin(2 * np.pi * SA / 2 * tt) * np.exp(-tt / 1.2) * np.minimum(1, tt / 0.02) * 0.55
        add(bus_dry, pan(bloom, 0), tb)
        add(bus_wet, pan(bloom * 0.6, 0), tb)

    # ── fire: under the hook (unseen), the clearing, the title and the card ──
    fire = crackle(N, 'fire')
    fire_aut = [(0, 0.18)]
    if g('forest'):
        fire_aut += [(g('forest')['start'] - 0.2, 0.18), (g('forest')['start'] + 0.6, 0.0)]
    if g('fire'):
        fire_aut += [(g('fire')['start'] - 0.1, 0.0), (g('fire')['start'] + 0.4, 0.7)]
    if g('vyasa'):
        fire_aut += [(g('vyasa')['start'], 0.7), (g('vyasa')['start'] + 0.6, 0.45)]
    if g('episode'):
        fire_aut += [(g('episode')['start'] + 0.5, 0.5)]
    fire_aut += [(D - 0.6, 0.45), (D, 0.0)]
    fa = env_curve(fire_aut, N)
    add(bus_dry, np.stack([fire * fa * 0.09, np.roll(fire, 911) * fa * 0.09]), 0)

    # ── dawn birds in the forest (and faintly under the name) ──
    if g('forest'):
        f0t, f1t = g('forest')['start'], (g('fire')['start'] if g('fire') else D)
        r = rng('birds')
        tt = f0t + 0.3
        while tt < f1t - 0.3:
            k = r.integers(0, 3)
            x = koel(int(tt * 100)) if k == 0 else twitter(int(tt * 100))
            vol = (0.07 if k == 0 else 0.05) * (0.5 if g('name') and tt > g('name')['start'] else 1.0)
            p = r.uniform(-0.8, 0.8)
            add(bus_dry, pan(x * vol * 0.4, p), tt)
            add(bus_wet, pan(x * vol, p), tt)
            tt += r.uniform(0.35, 0.9)
        # forest air
        n = smp(f1t - f0t + 1.0)
        air = lpf(hpf(rng('fair').standard_normal((2, n)), 250), 2500) * 0.012
        add(bus_dry, fade(air, 0.6, 0.8), f0t - 0.2)

    # ── time passing: a whirl of air following the days racing by ──
    if g('fire'):
        l4 = g('fire')
        dur = l4['end'] - l4['start']
        n = smp(dur)
        tt = tvec(n)
        a, b = 0.08 * dur, 0.94 * dur
        u = np.clip((tt - a) / (b - a), 0, 1)
        sp = np.where(u < 0.5, 12 * u * u, 12 * (1 - u) ** 2) * (u > 0) * (u < 1)   # ∝ d(inOutCubic)/du
        sp = sp / (sp.max() + 1e-9)
        nz = rng('whirl').standard_normal(n)
        whirl = np.zeros(n)
        hop = smp(0.05)
        for i0 in range(0, n, hop):
            seg = nz[i0:i0 + hop * 2]
            fc = 400 + 2600 * sp[min(i0, n - 1)]
            y = bpf(seg, fc * 0.7, fc * 1.4, 1)
            w = np.hanning(len(y))
            whirl[i0:i0 + len(y)] += y * w
        whirl *= sp ** 1.2 * 0.09
        stereo = np.stack([whirl * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt)), whirl * (0.6 - 0.4 * np.sin(2 * np.pi * 0.7 * tt))])
        add(bus_wet, stereo, l4['start'])

    # ── the vision forming in the smoke: a soft shimmer ──
    if g('asked'):
        l5 = g('asked')
        tb = l5['beats'][0] if l5['beats'] else l5['start'] + 2.5
        n = smp(l5['end'] - tb + 1.0)
        tt = tvec(n)
        shim = sum(np.sin(2 * np.pi * f * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.3 + 0.17 * i) * tt)) for i, f in enumerate((SA * 4, SA * 6, SA * 8, SA * 12)))
        shim *= np.minimum(1, tt / 1.2) * 0.02
        add(bus_wet, fade(np.stack([shim, np.roll(shim, 333)]), 0.2, 0.8), tb - 0.2)

    # ── mix ──
    hall = make_ir(3.2, 4.0, 'hall')
    room = make_ir(1.4, 2.0, 'room')
    out = bus_dry + reverb(bus_wet, hall) * 0.55 + bus_wet * 0.25 + bed * 0.6 + reverb(bed, room) * 0.25
    # leave room for the voice: a gentle dip in the 1.5–4 kHz band
    b, a = sps.iirpeak(2600, 1.2, fs=SR)
    out = out - 0.25 * sps.lfilter(b, a, out, axis=-1)
    out = hpf(out, 30)
    # ends: no click at the start, a clean tail
    out *= env_curve([(0, 1), (D - 0.7, 1), (D - 0.02, 0), (D, 0)], N)
    # level: −22 LUFS integrated, ceiling −2 dBTP
    L0 = lufs(out)
    out *= db(TARGET_LUFS - L0)
    tp = true_peak_db(out)
    if tp > CEIL_DBTP:
        # soft-clip just the rare peaks rather than lowering the whole bed
        k = db(CEIL_DBTP - 0.3)
        out = np.tanh(out / k) * k
    return out


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    r = rng('dither')
    d = (r.random(x.shape) - r.random(x.shape)) / 32768
    pcm = np.round((x + d) * 32767).astype('<i2').T.copy()
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    args = sys.argv[1:]
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'
    tl_path = os.path.join(ROOT, 'build', f'timeline.{lang}.json')
    if not os.path.exists(tl_path):
        sys.exit(f'{tl_path} missing: run `node tools/timeline.mjs --lang {lang}` first')
    tl = json.load(open(tl_path))
    src_hash = hashlib.sha1(open(__file__, 'rb').read()).hexdigest()[:12]
    stamp = {'lang': lang, 'timeline': tl['signature'], 'duration': tl['duration'], 'score': src_hash}
    out_wav = os.path.join(ROOT, 'audio', 'music.wav')
    side = os.path.join(ROOT, 'audio', 'music.json')
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    if '--force' not in args and os.path.exists(out_wav) and os.path.exists(side):
        try:
            if json.load(open(side)).get('stamp') == stamp:
                print(f'audio/music.wav is up to date for timeline {tl["signature"]} ({lang})')
                return
        except Exception:
            pass
    x = build(tl)
    write_wav(out_wav, x)
    meta = {'stamp': stamp, 'lufs': round(lufs(x), 2), 'true_peak_dbtp': round(true_peak_db(x), 2), 'seconds': tl['duration'],
            'note': 'music/ambience stem, a bed for narration (tools/mix.py adds voice/<lang>/*.wav and ducks this)'}
    json.dump(meta, open(side, 'w'), indent=1)
    print(f'wrote audio/music.wav  {tl["duration"]:.2f} s  {meta["lufs"]} LUFS  {meta["true_peak_dbtp"]} dBTP  (timeline {tl["signature"]}, {lang})')


if __name__ == '__main__':
    main()
