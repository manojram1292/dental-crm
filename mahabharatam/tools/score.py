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

    python3 tools/score.py [--ep 1] [--lang en] [--force]

Each episode has its own cue sheet: build() is episode 1, build_ep2() episode 2, build_ep3() episode 3
(chosen by the timeline's `episode`). Instruments and the mix stage are shared.
Writes audio/epNN/music.wav (+ music.json, its stamp).
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
    # (the hook's ghost flashes: 'hook' beats + 'notwar' beat 0; older cuts had one 'before' line)
    first = g('before') or ({'beats': list(g('hook')['beats']) + list(g('notwar')['beats'][:1])} if g('hook') and g('notwar') else None)
    hook_end = g('fire')['start'] if g('fire') else (g('forest')['start'] if g('forest') else 4.0)
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
        if l['id'] in ('notwar', 'next'):
            continue    # the hook is one shot; the Next card has its own sting
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
    walk = g('arrived') or g('forest')
    if walk:
        bell(walk['start'] + 0.25, 1174.7, 0.22, 0.4, 'f')          # D6, distant: dawn
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
    if g('fire') and g('arrived'):
        # the clearing (fire) → the forest walk (no fire) → the name → the clearing again (asked)
        fire_aut += [(g('fire')['start'] - 0.2, 0.18), (g('fire')['start'] + 0.5, 0.7), (g('arrived')['start'] - 0.1, 0.7), (g('arrived')['start'] + 0.5, 0.0),
                     (g('asked')['start'] - 0.1, 0.0), (g('asked')['start'] + 0.4, 0.6)]
    else:
        if g('forest'):
            fire_aut += [(g('forest')['start'] - 0.2, 0.18), (g('forest')['start'] + 0.6, 0.0)]
        if g('fire'):
            fire_aut += [(g('fire')['start'] - 0.1, 0.0), (g('fire')['start'] + 0.4, 0.7)]
    if g('vyasa'):
        fire_aut += [(g('vyasa')['start'], 0.7), (g('vyasa')['start'] + 0.6, 0.45)]
    if g('tease'):
        fire_aut += [(g('tease')['start'] + 0.3, 0.8)]
    if g('episode'):
        fire_aut += [(g('episode')['start'] + 0.5, 0.5)]
    if g('next'):
        fire_aut += [(g('next')['start'] + 0.5, 0.35)]
    fire_aut += [(D - 0.6, 0.45), (D, 0.0)]
    fa = env_curve(fire_aut, N)
    add(bus_dry, np.stack([fire * fa * 0.09, np.roll(fire, 911) * fa * 0.09]), 0)

    # ── dawn birds in the forest (and faintly under the name) ──
    if walk:
        f0t = walk['start']
        f1t = g('asked')['start'] if g('arrived') and g('asked') else (g('fire')['start'] if g('fire') else D)
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

    # ── the tease: "with a field of blood" — a low omen under the red, a distant thunder ──
    if g('tease'):
        tz = g('tease')
        b1 = tz['beats'][1] if len(tz['beats']) > 1 else tz['start'] + 2.5
        b0 = tz['beats'][0] if tz['beats'] else tz['start'] + 0.6
        add(bus_dry, pan(mridangam('thom', 'tz0', 0.5), -0.05), b0)
        dr = reed_drone(smp(tz['end'] - b1 + 1.5), (SA / 2, SA / 2 * 16 / 15), 'omen1')
        dr = lpf(dr, 600) * env_curve([(0, 0), (0.6, 0.3), (tz['end'] - b1, 0.3), (tz['end'] - b1 + 1.4, 0)], len(dr))
        add(bed, np.stack([dr, np.roll(dr, 900)]) * 0.9, b1 - 0.4)
        th = thunder('tz', 3.5, 0.6)
        add(bus_wet, pan(th * 0.5, -0.3), b1)
        add(bus_dry, pan(mridangam('thom', 'tz1', 0.9), 0.0), b1)
    if g('next'):
        series_next_sting(bus_dry, bus_wet, g('next'))

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


# ─── episode 2: The Field of Five Lakes ──────────────────────────────────────
def conch(key, f0=233.08, dur=2.2, vel=1.0):
    """A shankha: a breathy, brassy tone that swells, glides up into pitch and wavers."""
    n = smp(dur)
    t = tvec(n)
    r = rng('conch', key)
    glide = f0 * (0.93 + 0.07 * (1 - np.exp(-t / 0.18)))
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.6)
    ph = 2 * np.pi * np.cumsum(glide * vib) / SR
    x = sum(np.sin(ph * h + r.uniform(0, 6)) / h ** 0.9 for h in range(1, 14))
    x = bpf(x, 300, 2600) + 0.6 * bpf(x, 900, 1300)
    x += bpf(r.standard_normal(n), 600, 3000) * 0.08            # breath
    env = np.minimum(1, t / 0.35) ** 1.5 * np.exp(-np.maximum(0, t - dur * 0.6) / 0.35)
    return fade(x * env * vel * 0.25, 0.01, 0.2)


def thunder(key, dur=4.0, vel=1.0):
    n = smp(dur)
    t = tvec(n)
    r = rng('thunder', key)
    crack = hpf(r.standard_normal(n), 900) * np.exp(-t / 0.05) * 0.5
    roll = lpf(r.standard_normal(n), 160, 2) * (np.exp(-t / 1.4) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.3 * t + 1))))
    return fade((crack + roll * 3.0) * vel, 0.002, 0.6)


def water(n, key):
    """Clear water: a soft bed of trickle and small bubbles."""
    r = rng('water', key)
    bed = bpf(r.standard_normal(n), 400, 2500) * 0.05
    out = bed.copy()
    for _ in range(int(14 * n / SR)):
        i = r.integers(0, n)
        L = smp(r.uniform(0.02, 0.06))
        if i + L >= n:
            continue
        tt = tvec(L)
        f = r.uniform(700, 1800) * (1 + 1.2 * tt / tt[-1])
        out[i:i + L] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / tt[-1]) * r.uniform(0.05, 0.15)
    return out


def tanpura_bed(N, D, key, notes=None):
    bed = np.zeros((2, N))
    cyc, notes = 1.84, notes or (SA * 1.5, SA * 2, SA * 2, SA)
    t, k = 0.0, 0
    while t < D:
        for j, f in enumerate(notes):
            tt = t + j * cyc / 4
            if tt >= D:
                break
            x = tanpura_pluck(f * (1 + 0.0007 * (j - 1.5)), 4.2, (key, k, j), bright=0.9 + 0.2 * (j == 3))
            add(bed, pan(x, [-0.35, 0.15, 0.3, -0.1][j]), tt)
        t += cyc
        k += 1
    return bed


def build_ep2(tl):
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    g = lambda i: L.get(i)   # noqa: E731
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry = np.zeros((2, N))
    bus_wet = np.zeros((2, N))
    bed = np.zeros((2, N))

    def bell(t0, f, vel, p, key):
        x = ghanta(f, 5.0, key, vel)
        add(bus_dry, pan(x * 0.4, p), t0)
        add(bus_wet, pan(x * 0.8, p), t0)

    def hit(t0, key, vel, din=True, boom=0.0):
        add(bus_dry, pan(mridangam('thom', key, vel), -0.05), t0)
        if din:
            add(bus_dry, pan(mridangam('din', key, vel * 0.55), 0.1), t0 + 0.004)
        add(bus_wet, pan(mridangam('thom', key, vel * 0.5), 0.0), t0)
        if boom:
            n = smp(1.8)
            tt = tvec(n)
            b = np.sin(2 * np.pi * (42 + 22 * np.exp(-tt / 0.09)) * tt) * np.exp(-tt / 0.7) * boom
            add(bus_dry, pan(b, 0.0), t0)
            add(bus_wet, pan(b * 0.4, 0.0), t0)

    # ── calm frame story: tanpura at the fire (ask, answer), back for the holy water, the dawn, the card
    tan = tanpura_bed(N, D, 'ep2')
    calm = env_curve([(0, 0.5), (1.5, 1.0), (st('parashurama') - 0.3, 1.0), (st('parashurama') + 0.6, 0.0),
                      (beat('pitrs', 2) - 0.3, 0.0), (beat('pitrs', 3), 0.85), (D, 1.0)], N)
    bed += tan * calm
    # ── fire crackle under the fire circle and the answer, again faint under the end card
    fire = crackle(N, 'fire2')
    endl = 'next' if 'next' in L else 'episode'
    fa = env_curve([(0, 0.0), (0.4, 0.6), (st('answer'), 0.7), (beat('answer', 0), 1.0), (st('parashurama') + 0.3, 0.0),
                    (st(endl), 0.0), (st(endl) + 0.6, 0.35), (D - 0.5, 0.35), (D, 0)], N)
    add(bus_dry, np.stack([fire * fa * 0.09, np.roll(fire, 777) * fa * 0.09]), 0)
    # ── line starts: soft tham at the fire; the answer's flare: a rising whoosh + shimmer of the map
    for i, lid in enumerate(('answer',)):
        add(bus_dry, pan(mridangam('ki', 200 + i, 0.3), -0.15), st(lid) - 0.14)
        hit(st(lid), 200 + i, 0.5)
    bell(st('ask') + 0.2, 587.33, 0.18, 0.2, 'e2a')
    b0 = beat('answer', 0)
    n = smp(1.3)
    tt = tvec(n)
    whoosh = bpf(rng('flare').standard_normal(n), 200, 3000) * (tt / tt[-1]) ** 2 * np.exp(-np.maximum(0, tt - 1.0) / 0.1) * 0.12
    add(bus_wet, pan(whoosh, 0.3), b0 - 1.0)
    add(bus_dry, pan(lpf(rng('roar').standard_normal(smp(1.6)), 300) * np.exp(-tvec(smp(1.6)) / 0.5) * 0.35, 0.3), b0)
    n = smp(en('answer') - b0 + 0.6)
    tt = tvec(n)
    shim = sum(np.sin(2 * np.pi * f * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.4 + 0.13 * i) * tt)) for i, f in enumerate((SA * 4, SA * 6, SA * 8, SA * 10)))
    add(bus_wet, fade(np.stack([shim, np.roll(shim, 411)]) * np.minimum(1, tt / 0.8) * 0.02, 0.2, 0.6), b0)
    bell(beat('answer', 1), 880.0, 0.28, -0.2, 'land')

    # ── ominous: a low dissonant drone (Sa + komal Re, an octave down) from Parashurama to the lakes
    ps, le = st('parashurama'), en('lakes')
    dr = reed_drone(N, (SA / 2, SA / 2 * 16 / 15, SA / 2 * 1.5), 'omen')
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * 3.1 * tvec(N))
    da = env_curve([(0, 0), (ps - 0.4, 0), (ps + 1.0, 0.32), (st('kings'), 0.36), (st('lakes'), 0.42), (le - 0.3, 0.3), (le + 0.8, 0.0), (D, 0)], N)
    bed += pan(lpf(dr, 700) * trem * da * 0.8, -0.15) + pan(lpf(np.roll(dr, 2000), 700) * trem * da * 0.8, 0.15)
    # thunder with the lightning (the scene's strikes: 0.15 s in, the name, the axe)
    for j, t0 in enumerate((ps + 0.15, beat('parashurama', 0), beat('parashurama', 1))):
        th = thunder(('t', j), 4.0, (0.55, 0.8, 1.0)[j])
        add(bus_dry, pan(th * 0.5, (-0.4, 0.4, -0.1)[j]), t0 + 0.05)
        add(bus_wet, pan(th * 0.6, 0.0), t0 + 0.05)
    # rain hiss under the storm
    n = smp(en('parashurama') - ps + 0.8)
    rain = hpf(lpf(rng('rain').standard_normal((2, n)), 6000), 1200) * 0.018
    add(bus_dry, fade(rain, 0.4, 0.8), ps)
    # the drum build: pulses accelerating through Parashurama's line…
    t0, gap, k = ps + 0.3, 0.95, 0
    while t0 < st('kings') - 0.25:
        hit(t0, 300 + k, 0.45 + 0.35 * (t0 - ps) / (st('kings') - ps), din=False, boom=0.15)
        t0 += gap
        gap = max(0.32, gap * 0.82)
        k += 1
    hit(beat('parashurama', 1), 399, 1.0, boom=0.5)          # the axe at the top
    # …then one hit for each of the 21 kings (the timeline's ticks), heavier as they go
    ticks = L['kings'].get('ticks', [])
    for i, t0 in enumerate(ticks):
        v = 0.4 + 0.35 * i / max(1, len(ticks) - 1)
        hit(t0, 400 + i, v, din=(i % 5 == 4), boom=0.1 + 0.35 * (i == len(ticks) - 1))
        add(bus_dry, pan(mridangam('ta', 400 + i, 0.25), 0.25 if i % 2 else -0.25), t0 + 0.002)
    tw = beat('kings', 0)
    hit(tw, 499, 1.1, boom=0.6)
    m = manjira('k21', 0.45)
    add(bus_dry, pan(m * 0.4, -0.2), tw)
    add(bus_wet, pan(m * 0.6, -0.2), tw)
    # the lakes: a slow heartbeat and a deep bloom as each beat lands
    hb = st('lakes') + 0.2
    while hb < en('lakes') - 0.2:
        hit(hb, int(hb * 100), 0.42, din=False)
        hit(hb + 0.22, int(hb * 100) + 1, 0.28, din=False)
        hb += 0.95
    for j in range(3):
        n = smp(2.4)
        tt = tvec(n)
        bl = np.sin(2 * np.pi * SA / 4 * tt) * np.exp(-tt / 1.0) * np.minimum(1, tt / 0.05) * 0.4
        add(bus_dry, pan(bl, 0), beat('lakes', j))
        add(bus_wet, pan(bl * 0.5, 0), beat('lakes', j))

    # ── release: the Pitrs. Drums stop; a high silver pad; bells; water; a calm reed in Sa–Pa
    p0 = st('pitrs')
    n = smp(en('pitrs') - p0 + 1.0)
    tt = tvec(n)
    pad = sum(np.sin(2 * np.pi * f * tt + i * 1.3) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.21 + 0.07 * i) * tt)) / (1 + 0.4 * i) for i, f in enumerate((SA * 2, SA * 3, SA * 4, SA * 6)))
    pad = lpf(pad, 3000) * env_curve([(0, 0), (beat('pitrs', 0) - p0, 0.6), (beat('pitrs', 3) - p0, 1.0), (n / SR - 0.8, 0.8), (n / SR, 0)], n) * 0.035
    add(bus_wet, np.stack([pad, np.roll(pad, 600)]), p0)
    bell(beat('pitrs', 0), 1174.7, 0.2, 0.35, 'pa')
    bell(beat('pitrs', 2) + 0.05, 587.33, 0.22, -0.2, 'pd')
    for i, (f, pp) in enumerate(((587.33, -0.4), (880.0, 0.3), (1174.7, -0.1))):
        bell(beat('pitrs', 3) + i * 0.07, f, 0.26 - i * 0.04, pp, ('holy', i))
    w = water(smp(D - beat('pitrs', 2)), 'w')
    wa = env_curve([(0, 0), (1.2, 1.0), (en('pitrs') - beat('pitrs', 2), 1.0), (en('pitrs') - beat('pitrs', 2) + 1.5, 0.3), (D - beat('pitrs', 2), 0)], len(w))
    add(bus_dry, np.stack([w * wa, np.roll(w, 999) * wa]) * 0.5, beat('pitrs', 2))
    reeds = reed_drone(N, (SA, SA * 1.5), 'calm2')
    ra = env_curve([(0, 0), (beat('pitrs', 2), 0), (beat('pitrs', 3), 0.18), (st('dawn'), 0.2), (beat('dawn', 1), 0.4), (en('dawn'), 0.3), (D - 1.2, 0.25), (D, 0)], N)
    bed += pan(reeds * ra * 0.6, -0.2) + pan(np.roll(reeds, 1500) * ra * 0.6, 0.2)

    # ── dawn: the swell, birds, and two conches from either side on "meet"
    d0 = st('dawn')
    r = rng('birds2')
    tt0 = d0 + 0.4
    while tt0 < beat('dawn', 1) - 0.4:
        k = r.integers(0, 3)
        x = koel(int(tt0 * 100)) if k == 0 else twitter(int(tt0 * 100))
        vol = 0.05 if k == 0 else 0.035
        pp = r.uniform(-0.8, 0.8)
        add(bus_dry, pan(x * vol * 0.4, pp), tt0)
        add(bus_wet, pan(x * vol, pp), tt0)
        tt0 += r.uniform(0.4, 1.0)
    n = smp(beat('dawn', 1) - d0 + 0.2)
    tt = tvec(n)
    rise = (tt / tt[-1]) ** 2.0
    tone = sum(np.sin(2 * np.pi * f * tt) / (i + 1) for i, f in enumerate((SA, SA * 1.5, SA * 2, SA * 3))) * rise * 0.1
    air = bpf(rng('swell2').standard_normal(n), 300, 5000) * rise * 0.06
    add(bus_wet, np.stack([tone + air, tone + air * 0.9]), d0)
    mb = beat('dawn', 1)
    for j, (pp, f, dt) in enumerate(((-0.75, 233.08, 0.0), (0.75, 220.0, 0.45))):
        c = conch(('c', j), f, 2.4, 0.9)
        add(bus_dry, pan(c * 0.5, pp), mb + dt)
        add(bus_wet, pan(c * 0.9, pp), mb + dt)
    hit(mb, 600, 0.7, boom=0.35)

    # ── the series stings: the recap at the top, the "Next" card at the end
    if 'recap' in L:
        series_recap_sting(bus_dry, bus_wet, L['recap'])
        add(bus_dry, pan(mridangam('ki', 690, 0.3), -0.15), st('ask') - 0.14)
        hit(st('ask'), 690, 0.45)
    if 'next' in L:
        series_next_sting(bus_dry, bus_wet, L['next'])
    else:
        e0 = st('episode')
        add(bus_dry, pan(mridangam('ki', 700, 0.3), -0.15), e0 - 0.14)
        hit(e0, 700, 0.5)
        bell(e0 + 0.15, 587.33, 0.3, 0.0, 'e21')
        bell(e0 + 0.95, 880.0, 0.2, 0.3, 'e22')

    # ── mix (as episode 1)
    hall = make_ir(3.2, 4.0, 'hall')
    room = make_ir(1.4, 2.0, 'room')
    out = bus_dry + reverb(bus_wet, hall) * 0.55 + bus_wet * 0.25 + bed * 0.6 + reverb(bed, room) * 0.25
    b, a = sps.iirpeak(2600, 1.2, fs=SR)
    out = out - 0.25 * sps.lfilter(b, a, out, axis=-1)
    out = hpf(out, 30)
    out *= env_curve([(0, 0), (0.05, 1), (D - 0.7, 1), (D - 0.02, 0), (D, 0)], N)
    L0 = lufs(out)
    out *= db(TARGET_LUFS - L0)
    tp = true_peak_db(out)
    if tp > CEIL_DBTP:
        k = db(CEIL_DBTP - 0.3)
        out = np.tanh(out / k) * k
    return out



# ─── episode 3: Eighteen Armies ──────────────────────────────────────────────
def ep3_steps(L):
    """The grid's step times, as src/scenes/ep03/_common.js schedules them: the seven ×3 steps on
    the "multiply" line's ticks, the ×10 on the "chariots" line's first beat ("ten")."""
    m, c = L['multiply'], L['chariots']
    tk = list(m.get('ticks', []))[:7]
    if len(tk) < 7:
        s0, s1 = m['beats'][0] + 0.3, m['end'] - 0.4
        tk = [s0 + (s1 - s0) * i / 6 for i in range(7)]
    return tk + [c['beats'][0] - 0.1]


def build_ep3(tl):
    """Marching drums that build from the patti to the eighteen armies, conchs on the
    armies, the eighteen days counted on the drum, then a solemn close."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry = np.zeros((2, N))
    bus_wet = np.zeros((2, N))
    bed = np.zeros((2, N))

    def bell(t0, f, vel, p, key):
        x = ghanta(f, 5.0, key, vel)
        add(bus_dry, pan(x * 0.4, p), t0)
        add(bus_wet, pan(x * 0.8, p), t0)

    def hit(t0, key, vel, din=True, boom=0.0, p=-0.05):
        add(bus_dry, pan(mridangam('thom', key, vel), p), t0)
        if din:
            add(bus_dry, pan(mridangam('din', key, vel * 0.55), p + 0.15), t0 + 0.004)
        add(bus_wet, pan(mridangam('thom', key, vel * 0.5), 0.0), t0)
        if boom:
            n = smp(1.8)
            tt = tvec(n)
            b = np.sin(2 * np.pi * (42 + 22 * np.exp(-tt / 0.09)) * tt) * np.exp(-tt / 0.7) * boom
            add(bus_dry, pan(b, 0.0), t0)
            add(bus_wet, pan(b * 0.4, 0.0), t0)

    # ── the frame: tanpura at the fire (ask, patti), returning for the close
    tan = tanpura_bed(N, D, 'ep3')
    calm = env_curve([(0, 0.5), (1.5, 1.0), (st('multiply'), 0.9), (st('chariots'), 0.45), (st('units'), 0.25),
                      (st('armies'), 0.1), (beat('days', 1), 0.1), (en('days') - 1.0, 0.8), (D, 1.0)], N)
    bed += tan * calm
    endl = 'next' if 'next' in L else 'episode'
    fire = crackle(N, 'fire3')
    fa = env_curve([(0, 0.0), (0.4, 0.6), (st('patti'), 0.8), (st('multiply') + 0.5, 0.25), (st('units'), 0.15), (st('armies'), 0.0),
                    (st(endl), 0.0), (st(endl) + 0.6, 0.35), (D - 0.5, 0.35), (D, 0)], N)
    add(bus_dry, np.stack([fire * fa * 0.09, np.roll(fire, 777) * fa * 0.09]), 0)
    bell(st('ask') + 0.2, 587.33, 0.18, 0.2, 'e3a')
    # ── the patti: a soft tham as each unit steps into the frieze, a bell on "patti"
    add(bus_dry, pan(mridangam('ki', 800, 0.3), -0.15), st('patti') - 0.14)
    hit(st('patti'), 800, 0.45)
    for j in range(4):
        hit(beat('patti', j), 810 + j, 0.35 + 0.05 * j, din=(j % 2 == 0), p=0.2)
        add(bus_dry, pan(mridangam('ta', 820 + j, 0.2), 0.3), beat('patti', j) + 0.12)
    bell(beat('patti', 4), 880.0, 0.26, -0.2, 'patti')
    # ── the grid: a hit on every step, heavier as it grows; a low drone rising under it
    steps = ep3_steps(L)
    for i, t0 in enumerate(steps[:7]):
        hit(t0, 900 + i, 0.4 + 0.06 * i, din=(i % 2 == 1), boom=0.05 * i)
        add(bus_dry, pan(mridangam('ki', 910 + i, 0.25), 0.25), t0 + 0.12)
    tx = steps[7]
    hit(tx, 999, 1.05, boom=0.6)
    m = manjira('x10', 0.45)
    add(bus_dry, pan(m * 0.4, -0.2), tx + 0.05)
    add(bus_wet, pan(m * 0.6, -0.2), tx + 0.05)
    bell(beat('chariots', 1), 587.33, 0.22, 0.3, 'c21870')
    dr = reed_drone(N, (SA / 2, SA / 2 * 1.5, SA), 'march')
    da = env_curve([(0, 0), (st('multiply'), 0), (tx, 0.25), (st('units'), 0.3), (st('armies'), 0.42), (beat('days', 1), 0.45),
                    (beat('days', 1) + 1.5, 0.15), (en('days'), 0.0), (D, 0)], N)
    bed += pan(lpf(dr, 900) * da * 0.8, -0.15) + pan(lpf(np.roll(dr, 2000), 900) * da * 0.8, 0.15)
    # ── the march: from the akshauhini to the field, a steady mridangam march that builds
    bpm = 104.0
    t0, k = tx + 0.9, 0
    m_end = beat('days', 0) - 0.2
    while t0 < m_end:
        grow = clamp01((t0 - tx) / (m_end - tx))
        strong = k % 4 == 0
        hit(t0, 1000 + k, (0.28 + 0.35 * grow) * (1.0 if strong else 0.7), din=strong, boom=0.1 * grow * strong)
        if k % 2 == 1:
            add(bus_dry, pan(mridangam('ta', 1100 + k, 0.18 + 0.12 * grow), 0.3), t0 + 30 / bpm)
        t0 += 60 / bpm
        k += 1
    for j in range(3):
        hit(beat('units', j), 1200 + j, 0.7, boom=0.25)
    # ── the armies: a light hit for each block, conchs from both sides on "Eighteen" and on "field"
    for i, t0 in enumerate(L['armies'].get('ticks', [])):
        add(bus_dry, pan(mridangam('ta', 1300 + i, 0.3), -0.5 if i < 11 else 0.5), t0)
    for j, (pp, f, b) in enumerate(((-0.7, 233.08, 0), (0.7, 220.0, 0), (-0.4, 233.08, 1), (0.4, 220.0, 1))):
        c = conch(('c3', j), f, 2.6, 0.95)
        dt = beat('armies', b) + (0.0 if j % 2 == 0 else 0.35)
        add(bus_dry, pan(c * 0.5, pp), dt)
        add(bus_wet, pan(c * 0.9, pp), dt)
    hit(beat('armies', 1), 1399, 0.9, boom=0.45)
    # ── the eighteen days: a drum for each day, dust rising (filtered noise), a great hit on "fought"
    for i, t0 in enumerate(L['days'].get('ticks', [])):
        hit(t0, 1400 + i, 0.32 + 0.3 * i / 17, din=(i % 5 == 4), p=0.2 if i % 2 else -0.2)
    d0 = st('days')
    n = smp(en('days') - d0)
    dust = bpf(rng('dust3').standard_normal((2, n)), 200, 1800) * env_curve([(0, 0), (1.0, 0.01), (beat('days', 1) - d0, 0.03), (beat('days', 1) - d0 + 0.3, 0.05), (n / SR, 0)], n)
    add(bus_dry, dust, d0)
    hit(beat('days', 1), 1499, 1.1, boom=0.7)
    # ── the solemn close: low bells as the dust settles, then the end card
    for i, (f, pp) in enumerate(((293.66, -0.3), (220.0, 0.3))):
        bell(en('days') - 1.6 + i * 0.7, f, 0.22, pp, ('close', i))
    # ── the tease: leaves rise out of the dust (a soft shimmer and air), a bell on "Who"
    if 'tease' in L:
        tz = L['tease']
        n = smp(tz['end'] - beat('tease', 0) + 0.8)
        tt = tvec(n)
        shim = sum(np.sin(2 * np.pi * f * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.3 + 0.2 * i) * tt)) for i, f in enumerate((SA * 4, SA * 6, SA * 8)))
        add(bus_wet, fade(np.stack([shim, np.roll(shim, 500)]) * np.minimum(1, tt / 1.0) * 0.02, 0.3, 0.6), beat('tease', 0))
        air = bpf(rng('tease3').standard_normal(n), 400, 4000) * np.minimum(1, tt / 1.5) * 0.03
        add(bus_wet, fade(np.stack([air, air[::-1]]), 0.5, 0.6), beat('tease', 0))
        bell(beat('tease', 1), 440.0, 0.24, -0.1, 'who')
    if 'recap' in L:
        series_recap_sting(bus_dry, bus_wet, L['recap'])
        add(bus_dry, pan(mridangam('ki', 1690, 0.3), -0.15), st('ask') - 0.14)
        hit(st('ask'), 1690, 0.45)
    if 'next' in L:
        series_next_sting(bus_dry, bus_wet, L['next'])
    else:
        e0 = st('episode')
        add(bus_dry, pan(mridangam('ki', 1700, 0.3), -0.15), e0 - 0.14)
        hit(e0, 1700, 0.5)
        bell(e0 + 0.15, 587.33, 0.3, 0.0, 'e31')
        bell(e0 + 0.95, 880.0, 0.2, 0.3, 'e32')

    # ── mix (as episodes 1 and 2)
    hall = make_ir(3.2, 4.0, 'hall')
    room = make_ir(1.4, 2.0, 'room')
    out = bus_dry + reverb(bus_wet, hall) * 0.55 + bus_wet * 0.25 + bed * 0.6 + reverb(bed, room) * 0.25
    b, a = sps.iirpeak(2600, 1.2, fs=SR)
    out = out - 0.25 * sps.lfilter(b, a, out, axis=-1)
    out = hpf(out, 30)
    out *= env_curve([(0, 0), (0.05, 1), (D - 0.7, 1), (D - 0.02, 0), (D, 0)], N)
    out *= db(TARGET_LUFS - lufs(out))
    tp = true_peak_db(out)
    if tp > CEIL_DBTP:
        k = db(CEIL_DBTP - 0.3)
        out = np.tanh(out / k) * k
    return out


# ─── episode 4: The Story Is Born (Team A) ───────────────────────────────────
def bansuri(f0s, durs, key, vel=1.0):
    """A bamboo flute phrase: a breathy sine with a slow vibrato that blooms on each held note,
    small glides between notes (meend)."""
    r = rng('bansuri', key)
    total = sum(durs)
    n = smp(total)
    t = tvec(n)
    f = np.zeros(n)
    i0 = 0
    for k, (fr, d) in enumerate(zip(f0s, durs)):
        i1 = min(n, i0 + smp(d))
        f[i0:i1] = fr
        i0 = i1
    # meend: smooth the steps (a ~70 ms glide)
    f = sps.sosfiltfilt(sps.butter(1, 6, 'low', fs=SR, output='sos'), f)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(1, t / 0.8)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + 0.22 * np.sin(2 * ph + 0.3) + 0.06 * np.sin(3 * ph)
    breath = bpf(r.standard_normal(n), 900, 5000) * 0.05
    env = np.minimum(1, t / 0.25) * np.minimum(1, (total - t) / 0.6)
    return fade((x + breath) * env * vel * 0.12, 0.02, 0.3)


def build_ep4(tl):
    """Recap sting; the Naimisha fire (hook); then a new place: a morning raga in the
    Himalayan hermitage (bansuri over the tanpura, stream, birds); the scribe's writing
    rhythm that stops when he pauses and when the pen breaks; the tusk; then night and the
    king's fire, serpent hiss in the smoke; the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry = np.zeros((2, N))
    bus_wet = np.zeros((2, N))
    bed = np.zeros((2, N))

    def bell(t0, f, vel, p, key):
        x = ghanta(f, 5.0, key, vel)
        add(bus_dry, pan(x * 0.4, p), t0)
        add(bus_wet, pan(x * 0.8, p), t0)

    def hit(t0, key, vel, din=True, boom=0.0, p=-0.05):
        add(bus_dry, pan(mridangam('thom', key, vel), p), t0)
        if din:
            add(bus_dry, pan(mridangam('din', key, vel * 0.55), p + 0.15), t0 + 0.004)
        add(bus_wet, pan(mridangam('thom', key, vel * 0.5), 0.0), t0)
        if boom:
            n = smp(1.8)
            tt = tvec(n)
            b = np.sin(2 * np.pi * (42 + 22 * np.exp(-tt / 0.09)) * tt) * np.exp(-tt / 0.7) * boom
            add(bus_dry, pan(b, 0.0), t0)
            add(bus_wet, pan(b * 0.4, 0.0), t0)

    h0, v0, d0 = st('hook'), st('vyasa'), st('disciple')
    king = beat('disciple', 1)
    # ── the tanpura throughout; the hermitage gets a brighter Sa–Pa tuning and a soft reed
    tan = tanpura_bed(N, D, 'ep4')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (v0 - 0.2, 0.9), (v0 + 1.0, 1.0), (king, 1.0), (king + 1.0, 0.7), (D, 0.9)], N)
    reeds = reed_drone(N, (SA, SA * 1.5), 'morning')
    ra = env_curve([(0, 0), (v0, 0), (v0 + 1.5, 0.18), (king - 0.3, 0.18), (king + 0.5, 0.0), (D, 0)], N)
    bed += pan(reeds * ra * 0.6, -0.2) + pan(np.roll(reeds, 1500) * ra * 0.6, 0.2)
    # ── fire: the Naimisha fire under the hook; the king's fire from "King" on
    fire = crackle(N, 'fire4')
    fa = env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (v0 - 0.2, 0.6), (v0 + 0.5, 0.0), (king - 0.3, 0.0), (king + 0.6, 0.8), (st('next'), 0.8), (st('next') + 0.6, 0.3), (D - 0.5, 0.3), (D, 0)], N)
    add(bus_dry, np.stack([fire * fa * 0.09, np.roll(fire, 777) * fa * 0.09]), 0)
    # ── recap, hook
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    add(bus_dry, pan(mridangam('ki', 2000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 2000, 0.5)
    bell(beat('hook', 1), 880.0, 0.22, 0.25, 'words')
    # ── the hermitage: stream, birds, a morning bansuri phrase (Bhairav colours: komal re, komal dha)
    w = water(smp(king - v0 + 1.0), 'w4')
    wa = env_curve([(0, 0), (1.0, 1.0), (king - v0 - 0.5, 1.0), (king - v0 + 0.8, 0)], len(w))
    add(bus_dry, np.stack([w * wa, np.roll(w, 999) * wa]) * 0.35, v0)
    r = rng('birds4')
    tb = v0 + 0.4
    while tb < king - 0.6:
        k = r.integers(0, 3)
        x = koel(int(tb * 100)) if k == 0 else twitter(int(tb * 100))
        vol = (0.045 if k == 0 else 0.03) * (0.5 if st('scribe') < tb < st('tusk') else 1.0)
        pp = r.uniform(-0.8, 0.8)
        add(bus_dry, pan(x * vol * 0.4, pp), tb)
        add(bus_wet, pan(x * vol, pp), tb)
        tb += r.uniform(0.7, 1.6)
    Sa, re_, Ga, Ma, Pa, dha, Ni = SA * 2, SA * 2 * 16 / 15, SA * 2 * 5 / 4, SA * 2 * 4 / 3, SA * 3, SA * 2 * 8 / 5, SA * 2 * 15 / 8
    ph1 = bansuri([Sa, re_, Ga, Ma, Pa, dha, Pa], [0.9, 0.35, 0.5, 0.35, 0.9, 0.45, 1.3], 'p1', 1.0)
    add(bus_wet, pan(ph1 * 0.8, 0.25), v0 + 0.3)
    add(bus_dry, pan(ph1 * 0.35, 0.25), v0 + 0.3)
    ph2 = bansuri([Pa, Ma, Ga, re_, Sa], [0.6, 0.35, 0.5, 0.45, 1.6], 'p2', 0.8)
    add(bus_wet, pan(ph2 * 0.8, -0.2), st('disciple') + 0.2)
    # verses kindling around Vyasa: a shimmer
    n = smp(en('vyasa') - beat('vyasa', 1) + 0.8)
    tt = tvec(n)
    shim = sum(np.sin(2 * np.pi * f * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.4 + 0.13 * i) * tt)) for i, f in enumerate((SA * 4, SA * 6, SA * 8, SA * 10)))
    add(bus_wet, fade(np.stack([shim, np.roll(shim, 411)]) * np.minimum(1, tt / 1.0) * 0.018, 0.3, 0.6), beat('vyasa', 1))
    bell(beat('vyasa', 0), 587.33, 0.24, -0.2, 'vy')
    # ── Ganesha appears: a bell peal, manjira, a low bloom; "one": a single din
    g0 = beat('scribe', 0)
    for i, (f, pp) in enumerate(((880.0, -0.3), (1174.66, 0.3), (1318.5, 0.0))):
        bell(g0 + i * 0.06, f, 0.26 - 0.04 * i, pp, ('gan', i))
    m = manjira('gan', 0.4)
    add(bus_dry, pan(m * 0.4, 0.2), g0)
    add(bus_wet, pan(m * 0.6, 0.2), g0)
    hit(g0, 2100, 0.6, boom=0.4)
    add(bus_dry, pan(mridangam('din', 2101, 0.5), 0.1), beat('scribe', 1))
    hit(st('condition'), 2110, 0.35, din=False)
    bell(st('reply') + 0.1, 293.66, 0.22, -0.2, 'reply')
    # ── the writing rhythm: ki-ta taps while he writes; silent while he pauses; on through the tusk
    def writing(t0, t1, key, vel=0.22):
        tt0, k = t0, 0
        while tt0 < t1:
            add(bus_dry, pan(mridangam('ki' if k % 2 == 0 else 'ta', (key, k), vel * (1.0 if k % 4 == 0 else 0.7)), 0.3 if k % 2 else 0.15), tt0)
            if k % 8 == 0:
                hit(tt0, (key, 'h', k), 0.25, din=False, p=0.2)
            tt0 += 0.25
            k += 1
    pz0, pz1 = beat('pause', 0), beat('pause', 1)
    writing(st('pause') + 0.1, pz0 - 0.15, 'w1')
    n = smp(1.6)
    tt = tvec(n)
    shim = sum(np.sin(2 * np.pi * f * tt + i) for i, f in enumerate((SA * 6, SA * 8, SA * 9))) * np.exp(-tt / 0.9) * 0.02
    add(bus_wet, np.stack([shim, shim]), pz1)
    bell(pz1, 1174.66, 0.18, -0.3, 'more')
    writing(pz1 + 1.3, st('tusk') + 0.05, 'w2')
    tk0, tk1, tk2 = beat('tusk', 0), beat('tusk', 1), beat('tusk', 2)
    writing(st('tusk') + 0.05, tk0 - 0.1, 'w3')
    # the stylus snaps: a dry crack
    n = smp(0.25)
    crack = hpf(rng('snap').standard_normal(n), 2500) * np.exp(-tvec(n) / 0.012) * 0.5
    add(bus_dry, pan(crack, -0.2), tk0)
    add(bus_dry, pan(mridangam('ta', 'snap', 0.6), -0.2), tk0)
    # the tusk: a great hit, a bell, a bloom
    hit(tk1, 2200, 1.0, boom=0.6)
    bell(tk1 + 0.02, 587.33, 0.3, 0.0, 'tusk1')
    bell(tk1 + 0.08, 880.0, 0.24, 0.3, 'tusk2')
    m = manjira('tusk', 0.5)
    add(bus_wet, pan(m * 0.6, 0.1), tk1)
    writing(tk2, en('tusk') - 0.2, 'w4', 0.26)
    # ── the king's sacrifice: a low reed omen; serpent hiss in the smoke; the flare on "held"
    dr = reed_drone(N, (SA / 2, SA / 2 * 16 / 15, SA / 2 * 1.5), 'omen4')
    da = env_curve([(0, 0), (king - 0.2, 0), (king + 1.0, 0.25), (st('why'), 0.35), (en('why'), 0.4), (en('why') + 0.6, 0.0), (D, 0)], N)
    bed += pan(lpf(dr, 700) * da * 0.8, -0.15) + pan(lpf(np.roll(dr, 2000), 700) * da * 0.8, 0.15)
    hit(king, 2300, 0.55, boom=0.25)
    y0 = beat('why', 0)
    n = smp(en('why') - y0 + 0.5)
    tt = tvec(n)
    hiss = bpf(rng('hiss').standard_normal(n), 3500, 9000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 0.9 * tt))) * np.minimum(1, tt / 0.8) * 0.02
    add(bus_wet, fade(np.stack([hiss, np.roll(hiss, 2000)]), 0.3, 0.4), y0)
    hit(beat('why', 1), 2310, 0.95, boom=0.6)
    series_next_sting(bus_dry, bus_wet, L['next'])

    hall = make_ir(3.2, 4.0, 'hall')
    room = make_ir(1.4, 2.0, 'room')
    out = bus_dry + reverb(bus_wet, hall) * 0.55 + bus_wet * 0.25 + bed * 0.6 + reverb(bed, room) * 0.25
    b, a = sps.iirpeak(2600, 1.2, fs=SR)
    out = out - 0.25 * sps.lfilter(b, a, out, axis=-1)
    out = hpf(out, 30)
    out *= env_curve([(0, 0), (0.05, 1), (D - 0.7, 1), (D - 0.02, 0), (D, 0)], N)
    out *= db(TARGET_LUFS - lufs(out))
    tp = true_peak_db(out)
    if tp > CEIL_DBTP:
        k = db(CEIL_DBTP - 0.3)
        out = np.tanh(out / k) * k
    return out


def clamp01(x):
    return min(1.0, max(0.0, x))


# ─── series stings (shared by every episode: the recap and the "Next" card) ─────
def series_recap_sting(bus_dry, bus_wet, line):
    """'Previously…': a reversed bell swelling into a soft low bell and a din, as the memory
    niche fades up (KIT.series.recapStrip). Call with the timeline's recap line."""
    t0 = line['start']
    land = t0 + 0.85
    b = ghanta(587.33, 1.6, 'recap-rev', 0.5)[::-1].copy()
    b *= np.linspace(0, 1, len(b)) ** 2
    add(bus_wet, pan(b * 0.55, -0.2), land - len(b) / SR)
    n = smp(0.9)
    tt = tvec(n)
    air = bpf(rng('recap-air').standard_normal(n), 500, 6000) * (tt / tt[-1]) ** 2.5 * 0.05
    add(bus_wet, np.stack([air, air[::-1] * 0.4 + air * 0.6]), land - 0.9)
    x = ghanta(293.66, 5.0, 'recap-low', 0.3)
    add(bus_dry, pan(x * 0.4, 0.1), land)
    add(bus_wet, pan(x * 0.8, 0.1), land)
    add(bus_dry, pan(mridangam('din', 'recap', 0.3), 0.05), land)
    m = manjira('recap', 0.22)
    add(bus_wet, pan(m * 0.5, 0.3), land + 0.02)


def series_next_sting(bus_dry, bus_wet, line):
    """'Next': a ki-ta-tham, then a rising bell figure Sa–Pa–Sa' as the teaser niche opens,
    a shimmer over the glimpse, and a low bloom under the next episode's title."""
    t0 = line['start']
    add(bus_dry, pan(mridangam('ki', 'next', 0.32), -0.15), t0 - 0.16)
    add(bus_dry, pan(mridangam('ta', 'next', 0.36), 0.15), t0 - 0.08)
    add(bus_dry, pan(mridangam('thom', 'next', 0.62), -0.05), t0)
    add(bus_dry, pan(mridangam('din', 'next', 0.4), 0.1), t0 + 0.004)
    add(bus_wet, pan(mridangam('thom', 'next', 0.3), 0.0), t0)
    for i, (f, p) in enumerate(((587.33, -0.35), (880.0, 0.3), (1174.66, 0.0))):
        x = ghanta(f, 5.0, ('next', i), 0.26 - 0.04 * i)
        add(bus_dry, pan(x * 0.4, p), t0 + 0.3 + 0.32 * i)
        add(bus_wet, pan(x * 0.8, p), t0 + 0.3 + 0.32 * i)
    dur = max(1.5, line['end'] - t0)
    n = smp(dur)
    tt = tvec(n)
    shim = sum(np.sin(2 * np.pi * f * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.35 + 0.15 * i) * tt)) for i, f in enumerate((SA * 4, SA * 6, SA * 8)))
    shim = shim * np.minimum(1, tt / 0.9) * 0.018
    add(bus_wet, fade(np.stack([shim, np.roll(shim, 377)]), 0.3, 0.8), t0 + 0.3)
    n = smp(3.0)
    tt = tvec(n)
    bloom = np.sin(2 * np.pi * SA / 2 * tt) * np.exp(-tt / 1.3) * np.minimum(1, tt / 0.03) * 0.4
    add(bus_dry, pan(bloom, 0), t0 + 1.0)
    add(bus_wet, pan(bloom * 0.5, 0), t0 + 1.0)


# ─── episodes 5–6 (Team B): the curse of Sarama; the stolen earrings ─────────
def howl(key, dur=1.8, f0=520.0, vel=1.0):
    """A distant dog's cry: a voiced glide up and down with a vibrato, band-limited."""
    n = smp(dur)
    t = tvec(n)
    r = rng('howl', key)
    f = f0 * (1 + 0.32 * np.sin(np.pi * np.minimum(1, t / (dur * 0.8)))) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph + 0.4) + 0.12 * np.sin(3 * ph + 1.1)
    x = bpf(x + 0.04 * r.standard_normal(n), 350, 2600)
    env = np.minimum(1, t / 0.25) ** 1.5 * np.minimum(1, (dur - t) / 0.5)
    return fade(x * env * vel * 0.18, 0.02, 0.2)


def yelp(key, vel=1.0):
    """A pup's short cry of pain: a fast upward glide that breaks off."""
    n = smp(0.32)
    t = tvec(n)
    f = 820 + 700 * (t / 0.32) ** 0.6
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.3 * np.sin(2 * ph)
    x = bpf(x + 0.05 * rng('yelp', key).standard_normal(n), 500, 4000)
    return fade(x * np.exp(-t / 0.12) * np.minimum(1, t / 0.01) * vel * 0.2, 0.002, 0.05)


def naga_shimmer(n, key, vel=1.0):
    """The serpent world's colour: glassy high partials that waver and beat (slow tremolo,
    small pitch wobble), over a hiss that breathes in and out."""
    t = tvec(n)
    r = rng('naga', key)
    x = np.zeros(n)
    for i, f in enumerate((SA * 4 * 16 / 15, SA * 6, SA * 8 * 16 / 15, SA * 9, SA * 12)):
        wob = 1 + 0.004 * np.sin(2 * np.pi * r.uniform(0.15, 0.4) * t + r.uniform(0, 6))
        trem = 0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(0.2, 0.7) * t + r.uniform(0, 6))
        x += np.sin(2 * np.pi * np.cumsum(f * wob) / SR + i) * trem ** 2 / (1 + i * 0.3)
    hiss = bpf(r.standard_normal(n), 4000, 10000) * (0.3 + 0.7 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * t)) ** 3) * 0.6
    return (x * 0.02 + hiss * 0.02) * vel


def wind(n, key, vel=1.0):
    """Rising wind: noise through a slowly wandering band."""
    r = rng('wind', key)
    x = r.standard_normal(n)
    lo = lpf(x, 500, 2)
    hi = bpf(x, 700, 2200)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * tvec(n) + r.uniform(0, 6))
    return (lo * 0.6 + hi * 0.25 * lfo) * vel


def roar(n, key, vel=1.0):
    """A great fire roaring up: low rumble + crackle."""
    r = rng('roar', key)
    return (lpf(r.standard_normal(n), 180, 2) * 1.4 + crackle(n, ('roar', key), 14.0) * 0.6) * vel


def _tb_buses(N):
    bus_dry, bus_wet, bed = np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N))

    def bell(t0, f, vel, p, key):
        x = ghanta(f, 5.0, key, vel)
        add(bus_dry, pan(x * 0.4, p), t0)
        add(bus_wet, pan(x * 0.8, p), t0)

    def hit(t0, key, vel, din=True, boom=0.0, p=-0.05):
        add(bus_dry, pan(mridangam('thom', key, vel), p), t0)
        if din:
            add(bus_dry, pan(mridangam('din', key, vel * 0.55), p + 0.15), t0 + 0.004)
        add(bus_wet, pan(mridangam('thom', key, vel * 0.5), 0.0), t0)
        if boom:
            n = smp(2.2)
            tt = tvec(n)
            b = np.sin(2 * np.pi * (38 + 22 * np.exp(-tt / 0.09)) * tt) * np.exp(-tt / 0.8) * boom
            add(bus_dry, pan(b, 0.0), t0)
            add(bus_wet, pan(b * 0.4, 0.0), t0)

    def stereo(x, t0, vel=1.0, bus=None, roll=1777):
        add(bus if bus is not None else bus_dry, np.stack([x * vel, np.roll(x, roll) * vel]), t0)

    return bus_dry, bus_wet, bed, bell, hit, stereo


def _tb_master(bus_dry, bus_wet, bed, D, N):
    hall = make_ir(3.2, 4.0, 'hall')
    room = make_ir(1.4, 2.0, 'room')
    out = bus_dry + reverb(bus_wet, hall) * 0.55 + bus_wet * 0.25 + bed * 0.6 + reverb(bed, room) * 0.25
    b, a = sps.iirpeak(2600, 1.2, fs=SR)
    out = out - 0.25 * sps.lfilter(b, a, out, axis=-1)
    out = hpf(out, 30)
    out *= env_curve([(0, 0), (0.05, 1), (D - 0.7, 1), (D - 0.02, 0), (D, 0)], N)
    out *= db(TARGET_LUFS - lufs(out))
    tp = true_peak_db(out)
    if tp > CEIL_DBTP:
        k = db(CEIL_DBTP - 0.3)
        out = np.tanh(out / k) * k
    return out


def build_ep5(tl):
    """Recap sting; the Naimisha fire (hook: a low drum on "cursed", a distant howl on "dog");
    a bright day raga at Kurukshetra (tanpura, reeds, birds, temple bells at the rite); the
    pup's trot; three dull blows and his yelps; a whimper and a shimmer at his mother's; then
    the curse: ominous low drums, a dark drone and rising wind, great hits on "unseen" and
    "you"; a nervous heartbeat in the night palace; the serpent shimmer rising under the
    tease; the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    h0, r0, c0, a0, t0 = st('hook'), st('rite'), st('curse'), st('afraid'), st('tease')
    # ── tanpura through the frame and the day; it thins under the curse and the night
    tan = tanpura_bed(N, D, 'ep5')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (r0, 0.9), (r0 + 0.8, 1.0), (st('mother'), 0.9), (c0, 0.35), (en('curse'), 0.2), (a0 + 0.5, 0.45), (t0, 0.35), (D, 0.5)], N)
    reeds = reed_drone(N, (SA, SA * 1.5, SA * 2), 'day5')
    ra = env_curve([(0, 0), (r0, 0), (r0 + 1.2, 0.2), (st('beaten'), 0.16), (st('beaten') + 0.3, 0.05), (st('mother'), 0.0), (D, 0)], N)
    bed += pan(reeds * ra * 0.6, -0.2) + pan(np.roll(reeds, 1500) * ra * 0.6, 0.2)
    # ── fire: the Naimisha fire under the hook; the day fire, quieter, at Kurukshetra
    fire = crackle(N, 'fire5')
    fa = env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (r0 - 0.2, 0.6), (r0 + 0.4, 0.25), (st('mother'), 0.2), (c0, 0.3), (en('curse'), 0.05), (a0 + 0.5, 0.0), (D, 0)], N)
    stereo(fire * fa * 0.09, 0, roll=777)
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    # ── the hook: "cursed" — a low, dull drum; "dog" — a far howl and a dark bell
    add(bus_dry, pan(mridangam('ki', 5000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 5000, 0.45)
    hit(beat('hook', 0), 5001, 0.8, din=False, boom=0.7)
    hw = howl('hook', 1.9, 470.0, 0.9)
    add(bus_wet, pan(hw * 0.9, 0.35), beat('hook', 1) + 0.15)
    add(bus_dry, pan(hw * 0.25, 0.35), beat('hook', 1) + 0.15)
    bell(beat('hook', 1) + 0.1, 220.0, 0.22, -0.2, 'dog5')
    # ── Kurukshetra by day: birds, bells at the rite, a soft ritual pulse
    r = rng('birds5')
    tb = r0 + 0.3
    while tb < c0 - 0.5:
        x = koel(int(tb * 100)) if r.integers(0, 3) == 0 else twitter(int(tb * 100))
        pp = r.uniform(-0.8, 0.8)
        add(bus_wet, pan(x * 0.035, pp), tb)
        add(bus_dry, pan(x * 0.012, pp), tb)
        tb += r.uniform(0.9, 1.8)
    for j, (f, pp) in enumerate(((587.33, -0.3), (880.0, 0.25), (440.0, 0.0))):
        bell(beat('rite', j), f, 0.22, pp, ('rite', j))
    k, tp = 0, r0 + 0.5
    while tp < st('beaten') - 0.2:
        hit(tp, (5100, k), 0.18 if k % 4 else 0.26, din=(k % 4 == 0), p=0.15)
        tp += 0.75
        k += 1
    # ── the pup: light trotting taps; a high shimmer and bell on "Sarama"
    p0 = st('pup')
    for i in range(8):
        add(bus_dry, pan(mridangam('ta' if i % 2 else 'ki', (5200, i), 0.12), 0.4 - i * 0.05), p0 + 0.15 + i * 0.26)
    bell(beat('pup', 1), 1174.66, 0.16, 0.3, 'sarama1')
    n = smp(2.2)
    tt = tvec(n)
    shim = sum(np.sin(2 * np.pi * f * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.5 + 0.2 * i) * tt)) for i, f in enumerate((SA * 4, SA * 6, SA * 8))) * np.minimum(1, tt / 0.5) * np.exp(-tt / 1.4) * 0.03
    add(bus_wet, np.stack([shim, np.roll(shim, 333)]), beat('pup', 1) - 0.1)
    # ── the beating: the brothers rise (a tense ta-ta), three dull blows, three yelps
    for i in range(4):
        add(bus_dry, pan(mridangam('ta', (5300, i), 0.2 + 0.05 * i), 0.2), st('beaten') + 0.1 + i * 0.18)
    for i, tk in enumerate(L['beaten'].get('ticks', [])):
        hit(tk, (5310, i), 0.85, din=False, boom=0.35, p=0.2 - 0.15 * i)
        add(bus_dry, pan(yelp((5320, i), 0.9 - 0.15 * i), -0.25), tk + 0.06)
    bell(beat('beaten', 1), 293.66, 0.18, -0.25, 'innocent')
    # ── his mother's ridge: a whimper, a soft rising shimmer; then her stride into the enclosure
    m0 = st('mother')
    add(bus_wet, pan(howl('whimper', 0.9, 760.0, 0.5), -0.3), m0 + 0.6)
    add(bus_wet, pan(howl('whimper2', 0.7, 820.0, 0.4), -0.2), m0 + 1.7)
    n = smp(beat('mother', 1) - m0)
    tt = tvec(n)
    shim = sum(np.sin(2 * np.pi * f * tt + i) for i, f in enumerate((SA * 3, SA * 4, SA * 5))) * np.minimum(1, tt / 0.6) * 0.015
    add(bus_wet, fade(np.stack([shim, np.roll(shim, 222)]), 0.3, 0.4), m0)
    for i in range(3):
        hit(beat('mother', 1) + i * 0.62, (5400, i), 0.42 + 0.12 * i, din=False, boom=0.15 * i, p=0.3)
    # ── the curse: a dark drone (Sa, komal re, Pa low), rising wind, slow heavy drums, great hits
    dr = reed_drone(N, (SA / 4, SA / 2, SA / 2 * 16 / 15, SA / 2 * 1.5), 'curse5')
    da = env_curve([(0, 0), (beat('mother', 1), 0), (c0, 0.3), (beat('curse', 1), 0.55), (en('curse'), 0.5), (a0 + 0.8, 0.12), (en('afraid'), 0.08), (t0, 0.0), (D, 0)], N)
    bed += pan(lpf(dr, 600) * da, -0.15) + pan(lpf(np.roll(dr, 2000), 600) * da, 0.15)
    wn = wind(N, 'curse5')
    wa = env_curve([(0, 0), (beat('mother', 1), 0), (c0 + 0.5, 0.04), (beat('curse', 1), 0.12), (en('curse'), 0.1), (a0 + 0.6, 0.0), (D, 0)], N)
    stereo(wn * wa, 0, roll=2400)
    bpm = 64.0
    tc, k = c0 + 0.1, 0
    while tc < en('curse') - 0.3:
        heavy = k % 2 == 0
        hit(tc, (5500, k), 0.55 if heavy else 0.35, din=False, boom=0.45 if heavy else 0.15, p=-0.1 if heavy else 0.1)
        tc += 60 / bpm
        k += 1
    hit(beat('curse', 1), 5600, 1.1, din=False, boom=0.9)
    bell(beat('curse', 1) + 0.02, 155.56, 0.3, 0.0, 'unseen')
    hit(beat('curse', 2), 5601, 1.2, din=False, boom=1.0)
    bell(beat('curse', 2) + 0.05, 146.83, 0.3, -0.1, 'you')
    # ── the palace at night: a nervous heartbeat; a warmer bell on "priest"
    tc, k = a0 + 0.3, 0
    while tc < en('afraid') - 0.2:
        hit(tc, (5700, k), 0.24, din=False, boom=0.08, p=0.0)
        hit(tc + 0.24, (5710, k), 0.16, din=False, p=0.0)
        tc += 0.92
        k += 1
    bell(beat('afraid', 1), 587.33, 0.2, 0.25, 'priest')
    # ── the tease: the serpent world's shimmer rises; a deep hit when the hood flares on "king"
    n = smp(en('tease') - t0 + 0.4)
    sh = naga_shimmer(n, 'tease5', 1.0) * np.minimum(1, tvec(n) / 2.0)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 999)]), 0.4, 0.6), t0)
    hit(beat('tease', 1), 5800, 0.95, din=False, boom=0.7)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep6(tl):
    """Recap sting; the Naimisha fire (hook); a morning raga at the hermitage (bansuri, birds);
    gold chimes in Paushya's palace and the serpent shimmer behind the lattice; the stream
    and the theft (a running ki-ta, a falling boom into the earth); the eerie, glassy Naga
    world, flooded by fire on "won"; a low heartbeat of anger; a conch at the court, the
    vow's roaring fire and drums; the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    h0, a0, g0, w0, s0, n0, an0, c0, v0 = (st(i) for i in ('hook', 'ask', 'gave', 'warn', 'stolen', 'naga', 'anger', 'court', 'vow'))
    tan = tanpura_bed(N, D, 'ep6')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (a0, 0.9), (a0 + 0.8, 1.0), (s0, 0.8), (n0, 0.25), (an0, 0.3), (c0, 0.7), (v0, 0.5), (en('vow'), 0.3), (D, 0.5)], N)
    fire = crackle(N, 'fire6')
    fa = env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (a0 - 0.2, 0.6), (a0 + 0.5, 0.0), (c0, 0.0), (c0 + 0.5, 0.35), (v0, 0.35), (D, 0.2)], N)
    stereo(fire * fa * 0.09, 0, roll=777)
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    add(bus_dry, pan(mridangam('ki', 6000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 6000, 0.45)
    bell(beat('hook', 0), 880.0, 0.22, 0.25, 'uttanka')
    # ── the hermitage at morning: birds and a bansuri phrase; the earrings' chime
    r = rng('birds6')
    tb = a0 + 0.3
    while tb < g0 - 0.3:
        x = koel(int(tb * 100)) if r.integers(0, 3) == 0 else twitter(int(tb * 100))
        pp = r.uniform(-0.8, 0.8)
        add(bus_wet, pan(x * 0.035, pp), tb)
        tb += r.uniform(0.8, 1.6)
    Sa, re_, Ga, Ma, Pa, dha = SA * 2, SA * 2 * 16 / 15, SA * 2 * 5 / 4, SA * 2 * 4 / 3, SA * 3, SA * 2 * 8 / 5
    ph1 = bansuri([Pa, Ma, Ga, re_, Ga, Sa], [0.6, 0.35, 0.5, 0.35, 0.6, 1.4], 'u1', 0.9)
    add(bus_wet, pan(ph1 * 0.8, 0.25), a0 + 0.3)
    add(bus_dry, pan(ph1 * 0.3, 0.25), a0 + 0.3)
    for i, (f, pp) in enumerate(((1174.66, -0.2), (1318.5, 0.25))):
        bell(beat('ask', 1) + i * 0.12, f, 0.16, pp, ('earrings', i))
    # ── Paushya's palace: gold chimes, a soft court rhythm
    for i, (f, pp) in enumerate(((880.0, -0.3), (1174.66, 0.3), (1318.5, 0.0))):
        bell(beat('gave', 0) + i * 0.08, f, 0.2 - 0.03 * i, pp, ('gave', i))
    m = manjira('gave6', 0.35)
    add(bus_wet, pan(m * 0.5, 0.2), beat('gave', 0))
    k, tp = 0, g0 + 0.2
    while tp < w0:
        add(bus_dry, pan(mridangam('ki' if k % 2 else 'ta', (6100, k), 0.14), 0.25), tp)
        tp += 0.36
        k += 1
    # ── the warning: the serpent shimmer behind the lattice; a dark low bell on "Takshaka"
    n = smp(en('warn') - w0 + 0.3)
    sh = naga_shimmer(n, 'warn6', 0.8) * np.minimum(1, tvec(n) / 0.8)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 811)]), 0.2, 0.5), w0)
    bell(beat('warn', 0), 155.56, 0.26, 0.0, 'takshaka6')
    bell(beat('warn', 1), 1318.5, 0.2, 0.3, 'these')
    # ── the road at dusk: the stream; the theft; the run; the plunge into the earth
    w = water(smp(en('stolen') - s0 + 0.5), 'w6')
    stereo(w * env_curve([(0, 0), (0.5, 0.35), (beat('stolen', 1) - s0, 0.35), (beat('stolen', 1) - s0 + 1.2, 0.1), (en('stolen') - s0 + 0.5, 0)], len(w)), s0, roll=999)
    n = smp(beat('stolen', 1) - beat('stolen', 0) + 0.6)
    sh = naga_shimmer(n, 'guise6', 0.9)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 555)]), 0.2, 0.3), beat('stolen', 0))
    hit(beat('stolen', 1), 6200, 0.8, din=False, boom=0.3)
    tr, k = beat('stolen', 1) + 0.2, 0
    while tr < beat('stolen', 2) - 0.1:
        add(bus_dry, pan(mridangam('ki' if k % 2 else 'ta', (6210, k), 0.22 + 0.02 * k), 0.2 if k % 2 else -0.2), tr)
        tr += 0.14
        k += 1
    n = smp(1.6)
    tt = tvec(n)
    fall = np.sin(2 * np.pi * np.cumsum(220 * np.exp(-tt / 0.5) + 40) / SR) * np.exp(-tt / 0.9) * 0.3
    add(bus_wet, pan(fall, -0.3), beat('stolen', 2))
    hit(beat('stolen', 2) + 0.3, 6220, 1.0, din=False, boom=0.9)
    # ── the Naga world: eerie and shimmering, a sub drone, glassy bells; flooded by fire on "won"
    n = smp(en('naga') - n0 + 0.4)
    sh = naga_shimmer(n, 'naga6', 1.6)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 1234)]), 0.6, 0.6), n0)
    add(bus_dry, fade(np.stack([sh, np.roll(sh, 321)]) * 0.5, 0.6, 0.6), n0)
    dr = reed_drone(N, (SA / 4, SA / 4 * 16 / 15, SA / 2 * 8 / 5), 'naga6')
    da = env_curve([(0, 0), (n0, 0), (n0 + 1.0, 0.35), (beat('naga', 2), 0.35), (en('naga'), 0.2), (an0 + 0.5, 0.15), (c0, 0.0), (D, 0)], N)
    bed += pan(lpf(dr, 500) * da, -0.2) + pan(lpf(np.roll(dr, 3000), 500) * da, 0.2)
    rb = rng('glass6')
    for i in range(9):
        tg = n0 + 0.4 + i * 0.45 + rb.uniform(0, 0.2)
        if tg > beat('naga', 2) - 0.2:
            break
        f = SA * 4 * [1, 16 / 15, 5 / 4, 3 / 2, 8 / 5][rb.integers(0, 5)]
        bell(tg, f, 0.08, rb.uniform(-0.8, 0.8), ('glass6', i))
    n = smp(en('naga') - beat('naga', 2) + 0.6)
    ro = roar(n, 'won6') * env_curve([(0, 0), (0.4, 0.25), (n / SR - 0.5, 0.2), (n / SR, 0)], n)
    stereo(ro, beat('naga', 2) - 0.2, roll=1500)
    hit(beat('naga', 2), 6300, 1.0, din=False, boom=0.7)
    for i, (f, pp) in enumerate(((587.33, -0.3), (880.0, 0.3), (1174.66, 0.0))):
        bell(beat('naga', 2) + 0.6 + i * 0.12, f, 0.24, pp, ('won6', i))
    # ── anger: a slow heartbeat
    tc, k = an0 + 0.2, 0
    while tc < c0:
        hit(tc, (6400, k), 0.4, din=False, boom=0.25)
        hit(tc + 0.26, (6410, k), 0.25, din=False)
        tc += 0.95
        k += 1
    # ── the court: a conch, the court drum; the hiss on "killed"; "Avenge"
    c = conch('court6', 233.08, 2.4, 0.8)
    add(bus_dry, pan(c * 0.4, -0.4), c0 + 0.1)
    add(bus_wet, pan(c * 0.8, -0.4), c0 + 0.1)
    hit(c0 + 0.1, 6500, 0.6, boom=0.2)
    n = smp(1.6)
    hs = bpf(rng('hiss6').standard_normal(n), 3500, 9000) * np.minimum(1, tvec(n) / 0.15) * np.exp(-tvec(n) / 0.8) * 0.05
    add(bus_wet, fade(np.stack([hs, np.roll(hs, 900)]), 0.05, 0.3), beat('avenge', 0))
    sh = naga_shimmer(smp(1.8), 'avenge6', 0.8)
    add(bus_wet, fade(np.stack([sh, sh]), 0.2, 0.5), beat('avenge', 0))
    hit(beat('avenge', 2), 6510, 0.95, boom=0.5)
    # ── the vow: the fire roars up, drums build, conchs on "vowed", booms on "burn" and "serpent"
    n = smp(en('vow') - v0 + 0.5)
    ro = roar(n, 'vow6') * env_curve([(0, 0.02), (beat('vow', 1) - v0 - 0.8, 0.12), (beat('vow', 1) - v0 + 0.2, 0.3), (n / SR - 0.4, 0.25), (n / SR, 0)], n)
    stereo(ro, v0, roll=1800)
    for j, (pp, f) in enumerate(((-0.6, 233.08), (0.6, 220.0))):
        c = conch(('vow6', j), f, 2.4, 0.9)
        add(bus_dry, pan(c * 0.45, pp), beat('vow', 0) + 0.25 * j)
        add(bus_wet, pan(c * 0.85, pp), beat('vow', 0) + 0.25 * j)
    tv, k = v0 + 0.2, 0
    while tv < en('vow') - 0.2:
        g = clamp01((tv - v0) / (en('vow') - v0))
        hit(tv, (6600, k), 0.3 + 0.4 * g, din=(k % 2 == 0), boom=0.15 * g)
        tv += 0.42 - 0.1 * g
        k += 1
    hit(beat('vow', 1), 6700, 1.1, din=False, boom=0.9)
    hit(beat('vow', 2), 6701, 1.0, din=False, boom=0.8)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)



# ─── episodes 7–10 (Astika parva) ────────────────────────────────────────────
def cicadas(n, key, vel=1.0):
    """Noon heat: a high, pulsing insect buzz (band noise, fast AM, slow swells)."""
    r = rng('cicada', key)
    t = tvec(n)
    x = bpf(r.standard_normal(n), 3800, 6500)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * 42 * t)) ** 2
    sw = 0.4 + 0.6 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * t + r.uniform(0, 6))) ** 2
    return x * am * sw * 0.05 * vel


def crickets(n, key, vel=1.0):
    """Night: crickets, short chirp trains at a steady rate."""
    r = rng('crick', key)
    t = tvec(n)
    x = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.2)
    gate = ((t * 1.6 + r.uniform(0, 1)) % 1) < 0.35
    return lpf(x * gate, 7000) * 0.012 * vel


def tick(key, f=3200.0, vel=1.0):
    """A tiny dry click (an insect's step)."""
    n = smp(0.03)
    t = tvec(n)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) * 0.25 * vel


def build_ep7(tl):
    """Recap sting; the Naimisha fire (hook: a cold shimmer on "Takshaka", a low bell on
    "Parikshit"); noon heat (cicadas, a running ki-ta for the hunt); the cow-pen at
    afternoon (a cow bell, birds) that drops to near-silence on "silence"; a drum of anger
    on "Angry"; the red river, seven rising bells for the seven days and a boom on "burn";
    a grieving bansuri; the pillar by night (crickets, a chant drone, bells for the
    mantras); a quickening heartbeat on the seventh day; a tiny tick for the insect; the
    venom's roar and booms; a conch for the son; the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    h0, hu0, a0, si0, sn0, he0, cu0, w0, to0, se0, in0, sk0, cl0 = (st(i) for i in ('hook', 'hunt', 'ask', 'silent', 'snake', 'heard', 'curse', 'warn', 'tower', 'seventh', 'insect', 'strike', 'cliff'))
    tan = tanpura_bed(N, D, 'ep7')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (hu0, 0.7), (si0, 0.8), (beat('silent', 1), 0.35), (sn0, 0.7), (he0, 0.5), (w0, 0.8), (to0, 0.6), (sk0, 0.4), (cl0, 0.6), (D, 0.5)], N)
    fire = crackle(N, 'fire7')
    stereo(fire * env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (hu0 - 0.2, 0.6), (hu0 + 0.4, 0), (cl0, 0), (beat('cliff', 1) - 0.3, 0.5), (D, 0.2)], N) * 0.09, 0, roll=777)
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    # ── hook
    add(bus_dry, pan(mridangam('ki', 7000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 7000, 0.45)
    sh = naga_shimmer(smp(2.0), 'hook7', 0.9)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 700)]), 0.2, 0.6), beat('hook', 0) - 0.1)
    bell(beat('hook', 0), 155.56, 0.22, 0.0, 'tk7')
    bell(beat('hook', 1), 293.66, 0.24, -0.2, 'pk7')
    # ── noon: cicadas; the chase (a running ki-ta that slows with the king)
    n = smp(en('hunt') - hu0 + 0.4)
    c = cicadas(n, 'noon7') * env_curve([(0, 0), (0.5, 1), (n / SR - 0.6, 1), (n / SR, 0)], n)
    stereo(c, hu0, roll=2400)
    tr, k = hu0 + 0.15, 0
    while tr < beat('hunt', 2):
        g = clamp01((tr - beat('hunt', 1)) / 1.5)
        add(bus_dry, pan(mridangam('ki' if k % 2 else 'ta', (7100, k), 0.2 * (1 - 0.6 * g)), 0.2 if k % 2 else -0.2), tr)
        tr += 0.16 + 0.22 * g
        k += 1
    bell(beat('hunt', 2), 1174.66, 0.1, -0.5, 'deer7')
    # ── the cow-pen: a cow bell, birds; near-silence on "silence"
    for i, tb in enumerate((a0 + 0.3, a0 + 1.6, sn0 + 0.6)):
        add(bus_wet, pan(ghanta(659.25, 1.2, ('cow7', i), 0.12), 0.5), tb)
    r = rng('birds7')
    tb = a0 + 0.2
    while tb < beat('silent', 1) - 0.4:
        add(bus_wet, pan(twitter(int(tb * 100)) * 0.03, r.uniform(-0.8, 0.8)), tb)
        tb += r.uniform(0.9, 1.7)
    bell(beat('silent', 1), 880.0, 0.12, 0.0, 'mauna7')
    # ── the snake: a drum of anger; a dull thud as it is laid on him
    hit(beat('snake', 0), 7200, 0.75, din=False, boom=0.35)
    n = smp(1.0)
    hs = bpf(rng('lift7').standard_normal(n), 2500, 7000) * np.exp(-tvec(n) / 0.25) * 0.03
    add(bus_wet, pan(hs, -0.2), beat('snake', 1))
    hit(beat('snake', 2) + 0.2, 7210, 0.6, din=False, boom=0.2)
    # ── the river: water, a dark drone; the curse: seven bells rising, a boom on "burn"
    w = water(smp(en('curse') - he0 + 0.5), 'w7')
    stereo(w * 0.25, he0, roll=999)
    dr = reed_drone(N, (SA / 4, SA / 2, SA / 2 * 3 / 2), 'curse7')
    da = env_curve([(0, 0), (he0, 0), (he0 + 0.8, 0.3), (en('curse'), 0.35), (w0 + 0.6, 0.0), (D, 0)], N)
    bed += pan(lpf(dr, 600) * da, -0.2) + pan(lpf(np.roll(dr, 3000), 600) * da, 0.2)
    hit(beat('heard', 1), 7300, 0.6, din=False, boom=0.3)
    scale = (1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8)
    for i in range(6):
        bell(beat('curse', 0) + i * 0.15, SA * 4 * scale[i], 0.13, -0.6 + i * 0.2, ('days7', i))
    bell(beat('curse', 2), SA * 2, 0.3, 0.6, ('days7', 6))
    hit(beat('curse', 2), 7310, 1.0, din=False, boom=0.8)
    sh = naga_shimmer(smp(1.8), 'curse7', 0.9)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 500)]), 0.2, 0.5), beat('curse', 1) - 0.2)
    # ── grief: a slow bansuri phrase
    Sa, re_, ga, Ma, Pa, dha = SA * 2, SA * 2 * 16 / 15, SA * 2 * 6 / 5, SA * 2 * 4 / 3, SA * 3, SA * 2 * 8 / 5
    ph = bansuri([Pa, dha, Pa, Ma, ga, re_, Sa], [0.35, 0.4, 0.3, 0.3, 0.45, 0.35, 0.9], 'grief7', 0.8)
    add(bus_wet, pan(ph * 0.75, 0.25), w0 + 0.1)
    add(bus_dry, pan(ph * 0.3, 0.25), w0 + 0.1)
    # ── the pillar by night: crickets, a chant drone, bells for the mantras
    n = smp(en('tower') - to0 + 0.4)
    stereo(crickets(n, 'tw7') * env_curve([(0, 0), (0.6, 1), (n / SR - 0.5, 1), (n / SR, 0)], n), to0, roll=1300)
    ch = reed_drone(N, (SA / 2, SA, SA * 3 / 2), 'chant7')
    ca = env_curve([(0, 0), (to0, 0), (to0 + 1.0, 0.18), (beat('tower', 2), 0.35), (en('tower'), 0.3), (se0 + 0.6, 0), (D, 0)], N)
    bed += pan(lpf(ch, 900) * ca, 0.1)
    for i in range(4):
        bell(beat('tower', 2) - 0.2 + i * 0.3, [587.33, 880.0, 698.46, 1174.66][i], 0.1, -0.4 + 0.27 * i, ('mantra7', i))
    # ── the seventh day: the last bell, a quickening heartbeat
    bell(beat('seventh', 0), SA * 2, 0.26, 0.4, 'day7')
    tc, k = se0 + 0.3, 0
    while tc < sk0:
        g = clamp01((tc - se0) / (sk0 - se0))
        hit(tc, (7400, k), 0.3 + 0.25 * g, din=False, boom=0.2)
        hit(tc + 0.22, (7410, k), 0.18 + 0.15 * g, din=False)
        tc += 0.9 - 0.4 * g
        k += 1
    sh = naga_shimmer(smp(1.6), 'serp7', 0.7)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 400)]), 0.2, 0.4), beat('seventh', 1))
    # ── the insect: tiny ticks, a glint
    for i in range(10):
        add(bus_dry, pan(tick((7500, i), 3000 + 300 * (i % 3), 0.5), -0.1), beat('insect', 1) - 0.4 + i * 0.12)
    bell(beat('insect', 2), 1760.0, 0.1, -0.2, 'glint7')
    # ── the strike: the shimmer swells, the venom's roar, booms
    n = smp(beat('strike', 1) - sk0 + 0.2)
    sh = naga_shimmer(n, 'grow7', 1.4) * np.linspace(0.2, 1.2, n)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 900)]), 0.1, 0.2), sk0)
    hit(beat('strike', 0), 7600, 0.8, din=False, boom=0.5)
    n = smp(en('strike') - beat('strike', 1) + 0.6)
    ro = roar(n, 'venom7') * env_curve([(0, 0), (0.3, 0.3), (n / SR - 0.6, 0.25), (n / SR, 0)], n)
    stereo(ro, beat('strike', 1) - 0.1, roll=1500)
    hit(beat('strike', 1), 7610, 1.1, din=False, boom=0.9)
    hit(beat('strike', 2), 7620, 0.9, din=False, boom=0.7)
    # ── the son: a conch; the fire
    c = conch('son7', 233.08, 2.2, 0.8)
    add(bus_dry, pan(c * 0.4, -0.3), beat('cliff', 0))
    add(bus_wet, pan(c * 0.8, -0.3), beat('cliff', 0))
    hit(beat('cliff', 1), 7700, 0.9, din=False, boom=0.6)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def glide(key, f0, f1, dur, vel=1.0):
    """A falling (or rising) whistle: a serpent drawn through the air."""
    n = smp(dur)
    t = tvec(n)
    f = f0 * (f1 / f0) ** (t / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * bpf(rng('glide', key).standard_normal(n), 1500, 6000)
    return fade(x * np.sin(np.pi * t / dur) ** 2 * 0.05 * vel, 0.01, 0.05)


def build_ep8(tl):
    """Recap sting; the Naimisha fire (hook: a bell on "Janamejaya", the fire's roar on
    "revenge"); the court (a low court drum, the memory's shimmer on "died"); the vow
    (conchs, booms); the empty ground at dawn (wind, one high bell on "brahmin"); the
    sacrifice (a chant drone, a steady drum, the fire's roar); the serpents' fall (falling
    glides and spark bursts); the binding (bells, a boom on "escape"); Indra's heaven
    (bright bells, a bansuri in a major mode); the cliffhanger (the roar returns, a low
    boom on "cursed"); the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    h0, le0, v0, b0, p0, f0, pu0, fl0, sa0, c0 = (st(i) for i in ('hook', 'learn', 'vow', 'builder', 'priests', 'fall', 'pull', 'flee', 'safe', 'cliff'))
    tan = tanpura_bed(N, D, 'ep8')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (le0, 0.8), (b0, 0.6), (p0, 0.5), (fl0, 0.8), (c0, 0.5), (D, 0.5)], N)
    fire = crackle(N, 'fire8')
    stereo(fire * env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (le0, 0.3), (b0, 0.3), (b0 + 0.5, 0), (p0 - 0.3, 0), (p0 + 0.5, 0.9), (fl0, 0.9), (fl0 + 0.5, 0), (c0, 0), (c0 + 0.4, 0.8), (D, 0.3)], N) * 0.1, 0, roll=777)
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    add(bus_dry, pan(mridangam('ki', 8000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 8000, 0.45)
    bell(beat('hook', 0), 293.66, 0.22, -0.2, 'jj8')
    n = smp(1.8)
    stereo(roar(n, 'rev8') * env_curve([(0, 0), (0.3, 0.25), (1.8, 0)], n), beat('hook', 1) - 0.2, roll=900)
    hit(beat('hook', 1), 8010, 0.7, din=False, boom=0.4)
    # ── the court
    tc, k = le0 + 0.3, 0
    while tc < v0 - 0.3:
        add(bus_dry, pan(mridangam('thom' if k % 4 == 0 else 'ta', (8100, k), 0.16 if k % 4 else 0.24), -0.1), tc)
        tc += 0.5
        k += 1
    sh = naga_shimmer(smp(1.8), 'mem8', 0.8)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 600)]), 0.2, 0.5), beat('learn', 2) - 0.3)
    bell(beat('learn', 2), 155.56, 0.2, 0.0, 'died8')
    # ── the vow
    for j, (pp, f) in enumerate(((-0.6, 233.08), (0.6, 220.0))):
        c = conch(('vow8', j), f, 2.2, 0.8)
        add(bus_dry, pan(c * 0.4, pp), beat('vow', 0) + 0.2 * j)
        add(bus_wet, pan(c * 0.8, pp), beat('vow', 0) + 0.2 * j)
    hit(beat('vow', 0), 8200, 0.8, din=False, boom=0.5)
    hit(beat('vow', 2), 8210, 1.0, din=False, boom=0.8)
    # ── the ground at dawn
    n = smp(en('builder') - b0 + 0.4)
    stereo(wind(n, 'dawn8') * env_curve([(0, 0), (0.6, 0.12), (n / SR - 0.5, 0.12), (n / SR, 0)], n), b0, roll=2100)
    bell(beat('builder', 1), 587.33, 0.14, 0.3, 'warn8')
    bell(beat('builder', 2), 1174.66, 0.16, -0.3, 'brahmin8')
    ph = bansuri([SA * 3, SA * 2 * 5 / 3, SA * 3, SA * 4], [0.3, 0.3, 0.4, 1.0], 'boy8', 0.6)
    add(bus_wet, pan(ph * 0.6, 0.4), beat('builder', 2) + 0.1)
    # ── the sacrifice: chant drone, drum, roar
    ch = reed_drone(N, (SA / 4, SA / 2, SA / 2 * 3 / 2), 'chant8')
    ca = env_curve([(0, 0), (p0, 0), (p0 + 0.8, 0.35), (pu0, 0.45), (fl0, 0.3), (fl0 + 0.6, 0), (c0, 0), (c0 + 0.6, 0.35), (D - 3, 0.2), (D, 0)], N)
    bed += pan(lpf(ch, 700) * ca, -0.15) + pan(lpf(np.roll(ch, 2000), 700) * ca, 0.15)
    tp, k = p0 + 0.2, 0
    while tp < fl0 - 0.2:
        g = clamp01((tp - p0) / (fl0 - p0))
        hit(tp, (8300, k), 0.25 + 0.3 * g, din=(k % 2 == 0), boom=0.1 * g)
        tp += 0.55 - 0.15 * g
        k += 1
    n = smp(fl0 - p0 + 0.4)
    stereo(roar(n, 'satra8') * env_curve([(0, 0), (0.6, 0.12), (f0 - p0, 0.18), (pu0 - p0, 0.25), (n / SR - 0.4, 0.2), (n / SR, 0)], n), p0, roll=1500)
    for i in range(4):
        bell(beat('priests', 2) + i * 0.18, SA * 2 * (1, 9 / 8, 5 / 4, 3 / 2)[i], 0.08, -0.5 + 0.33 * i, ('name8', i))
    # ── the fall: glides and spark bursts
    r = rng('fall8')
    tf = f0 + 0.2
    i = 0
    while tf < pu0 + 0.5:
        d = r.uniform(0.6, 1.2)
        add(bus_wet, pan(glide(('g8', i), r.uniform(1400, 2400), r.uniform(300, 500), d, 0.7), r.uniform(-0.8, 0.8)), tf)
        add(bus_dry, pan(crackle(smp(0.4), ('sp8', i), 30.0) * 0.12, r.uniform(-0.5, 0.5)), tf + d)
        tf += r.uniform(0.2, 0.45)
        i += 1
    hit(beat('fall', 2), 8400, 0.9, din=False, boom=0.6)
    # ── the binding
    for i in range(3):
        bell(beat('pull', 0) + i * 0.14, (880.0, 1174.66, 1318.5)[i], 0.14, -0.3 + 0.3 * i, ('bind8', i))
    n = smp(1.2)
    hs = bpf(rng('hiss8').standard_normal(n), 3000, 9000) * np.exp(-tvec(n) / 0.6) * 0.05
    add(bus_wet, fade(np.stack([hs, np.roll(hs, 500)]), 0.05, 0.3), beat('pull', 1) - 0.3)
    hit(beat('pull', 2) + 0.4, 8500, 1.0, din=False, boom=0.8)
    # ── Indra's heaven
    for i, (f, pp) in enumerate(((587.33, -0.3), (880.0, 0.3), (1174.66, 0.0), (1479.98, -0.2))):
        bell(fl0 + 0.2 + i * 0.22, f, 0.16, pp, ('svarga8', i))
    Sa, Re, Ga, Pa, Dha = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3, SA * 2 * 5 / 3
    ph = bansuri([Pa, Dha, Pa, Ga, Re, Ga, Sa], [0.4, 0.3, 0.4, 0.35, 0.3, 0.45, 1.2], 'svarga8', 0.8)
    add(bus_wet, pan(ph * 0.7, 0.2), fl0 + 0.6)
    add(bus_dry, pan(ph * 0.3, 0.2), fl0 + 0.6)
    sh = naga_shimmer(smp(2.0), 'tk8', 0.6)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 300)]), 0.2, 0.5), beat('flee', 0))
    bell(beat('safe', 0), 293.66, 0.2, 0.2, 'stay8')
    for i, f in enumerate((587.33, 739.99, 880.0)):
        bell(beat('safe', 2) + i * 0.05, f, 0.14, -0.3 + 0.3 * i, ('safe8', i))
    # ── the cliffhanger
    n = smp(en('cliff') - c0 + 0.3)
    stereo(roar(n, 'cliff8') * env_curve([(0, 0), (0.4, 0.2), (n / SR - 0.4, 0.15), (n / SR, 0)], n), c0, roll=1200)
    bell(beat('cliff', 1), 207.65, 0.24, 0.0, 'mother8')
    sh = naga_shimmer(smp(1.6), 'curse8', 0.9)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 400)]), 0.2, 0.4), beat('cliff', 2) - 0.2)
    hit(beat('cliff', 2), 8600, 1.0, din=False, boom=0.8)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep9(tl):
    """Recap sting; the Naimisha fire (hook: a low bell on "mother", a faint shimmer on
    "sons"); Kashyapa's hermitage before sunrise (birds waking, a bansuri phrase, bells for
    the three names); the boon (a bell chord); Kadru's wish (the serpent shimmer and a
    rain of tiny ticks as the hoods multiply); Vinata's (two bird-calls rising, bright
    bells); Kashyapa's "So be it" (a soft chord); the eggs (a patter of a thousand tiny
    notes, then two deep bells); five hundred years (an accelerating pulse, wind, the sun's
    and moon's bells); the hatching (cracks, the shimmer) and the silence of Vinata's jars
    (one low note on "wait"); the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    h0, w0, b0, k0, v0, g0, e0, j0, c0 = (st(i) for i in ('hook', 'wives', 'boon', 'kadru', 'vinata', 'granted', 'eggs', 'jars', 'cliff'))
    tan = tanpura_bed(N, D, 'ep9')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (w0, 0.9), (j0, 0.7), (c0, 0.6), (beat('cliff', 2), 0.3), (D, 0.5)], N)
    fire = crackle(N, 'fire9')
    stereo(fire * env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (w0 - 0.2, 0.6), (w0 + 0.5, 0), (D, 0)], N) * 0.09, 0, roll=777)
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    add(bus_dry, pan(mridangam('ki', 9000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 9000, 0.45)
    bell(beat('hook', 0), 207.65, 0.22, -0.1, 'mother9')
    sh = naga_shimmer(smp(1.6), 'sons9', 0.6)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 500)]), 0.2, 0.5), beat('hook', 1) - 0.1)
    # ── the hermitage before sunrise: birds waking, a bansuri phrase, the names
    r = rng('birds9')
    tb = w0 + 0.5
    while tb < g0 + 2.0:
        x = koel(int(tb * 100)) if r.integers(0, 4) == 0 else twitter(int(tb * 100))
        add(bus_wet, pan(x * 0.03, r.uniform(-0.8, 0.8)), tb)
        tb += r.uniform(1.0, 1.9)
    Sa, Re, Ga, Ma, Pa, Dha, Ni = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 2 * 4 / 3, SA * 3, SA * 2 * 5 / 3, SA * 2 * 15 / 8
    ph = bansuri([Sa, Re, Ga, Pa, Ga, Re, Sa], [0.5, 0.35, 0.45, 0.7, 0.4, 0.4, 1.4], 'dawn9', 0.8)
    add(bus_wet, pan(ph * 0.7, 0.25), w0 + 0.4)
    add(bus_dry, pan(ph * 0.3, 0.25), w0 + 0.4)
    bell(beat('wives', 0), 293.66, 0.18, 0.0, 'kash9')
    bell(beat('wives', 1), 440.0, 0.15, -0.4, 'kadru9')
    bell(beat('wives', 2), 587.33, 0.15, 0.4, 'vinata9')
    # ── the boon
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(beat('boon', 0) + i * 0.08, f, 0.14, -0.3 + 0.3 * i, ('boon9', i))
    bell(beat('boon', 1), 880.0, 0.12, -0.4, 'boonA9')
    bell(beat('boon', 1) + 0.1, 1174.66, 0.12, 0.4, 'boonB9')
    # ── Kadru's wish: the serpent shimmer and a rain of ticks
    n = smp(en('kadru') - k0)
    sh = naga_shimmer(n, 'kadru9', 1.1) * np.minimum(1, tvec(n) / 1.5)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 900)]), 0.3, 0.5), k0)
    rk = rng('ticks9')
    for i in range(70):
        tt = beat('kadru', 0) - 0.2 + rk.uniform(0, 3.2) * (i / 70) ** 0.7
        add(bus_wet, pan(tick(('k9', i), rk.uniform(2500, 4500), 0.35), rk.uniform(-0.9, 0.9)), tt)
    bell(beat('kadru', 2), 1318.5, 0.12, -0.2, 'splendour9')
    # ── Vinata's wish: two rising bird-calls, bright bells
    for j, (pp, f0) in enumerate(((-0.4, 900), (0.4, 1200))):
        add(bus_wet, pan(glide(('bird9', j), f0, f0 * 1.8, 0.7, 0.9), pp), beat('vinata', 0) + 0.2 * j)
    for i, f in enumerate((880.0, 1108.73, 1318.5)):
        bell(beat('vinata', 1) + i * 0.12, f, 0.14, -0.3 + 0.3 * i, ('greater9', i))
    # ── "So be it"
    for i, f in enumerate((293.66, 369.99, 440.0)):
        bell(beat('granted', 0) + i * 0.05, f, 0.15, -0.2 + 0.2 * i, ('sobeit9', i))
    # ── the eggs: a patter of a thousand, then two deep bells
    re_ = rng('patter9')
    for i in range(90):
        tt = beat('eggs', 0) - 0.3 + (i / 90) * 1.4 + re_.uniform(0, 0.03)
        add(bus_wet, pan(ghanta(re_.choice((1760.0, 1975.5, 2349.3, 2637.0)), 0.4, ('p9', i), 0.025), re_.uniform(-0.9, 0.9)), tt)
    bell(beat('eggs', 2), 220.0, 0.24, 0.3, 'twoA9')
    bell(beat('eggs', 2) + 0.25, 293.66, 0.22, 0.45, 'twoB9')
    # ── five hundred years: wind, an accelerating pulse, sun and moon bells
    n = smp(en('jars') - j0 + 0.3)
    stereo(wind(n, 'years9') * env_curve([(0, 0), (0.6, 0.1), (n / SR - 0.4, 0.16), (n / SR, 0)], n), j0, roll=1700)
    u0, u1 = beat('jars', 0) - 0.6, beat('jars', 2)
    tp, k = u0, 0
    while tp < u1 + 0.3:
        g = clamp01((tp - u0) / (u1 - u0))
        add(bus_dry, pan(mridangam('ta' if k % 2 else 'ki', (9100, k), 0.12 + 0.12 * g), 0.2 if k % 2 else -0.2), tp)
        tp += 0.42 - 0.34 * g
        k += 1
    hit(u1 + 0.3, 9110, 0.6, din=False, boom=0.3)
    # ── the hatching: cracks, the shimmer; Vinata's silence
    for i in range(6):
        add(bus_dry, pan(crackle(smp(0.25), ('crack9', i), 40.0) * 0.25, -0.6 + 0.2 * i), beat('cliff', 0) - 0.4 + i * 0.09)
    sh = naga_shimmer(smp(2.4), 'hatch9', 1.0)
    add(bus_wet, fade(np.stack([sh, np.roll(sh, 700)]), 0.2, 0.8), beat('cliff', 0))
    bell(beat('cliff', 2), 146.83, 0.24, 0.3, 'wait9')
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep10(tl):
    """Recap sting; the Naimisha fire (hook: a high bell on "mother", a crackle on "wait");
    the hermitage before dawn (near-silence, a cold drone); the egg breaking (cracks, a red
    bloom); Aruna rising (a swelling chord); his name (bells); his curse (a low drum, a boom
    on "slave", a deep bell on "hundred"); his promise (a heartbeat of the gold egg on
    "free"); the rise into the sky (a rising bansuri, the seven horses' gallop, bells on
    "Sun"); dawn (a bright swell); the ocean (waves, a horse's call, a hit on "wager");
    the Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    h0, s0, i0, n0, c0, f0, r0, d0, x0 = (st(i) for i in ('hook', 'shame', 'inside', 'name', 'curse', 'free', 'rise', 'dawn', 'cliff'))
    tan = tanpura_bed(N, D, 'ep10')
    bed += tan * env_curve([(0, 0.5), (1.5, 0.9), (s0, 0.5), (i0, 0.8), (c0, 0.6), (r0, 0.9), (d0, 1.0), (x0, 0.7), (D, 0.5)], N)
    fire = crackle(N, 'fire10')
    stereo(fire * env_curve([(0, 0), (h0, 0), (h0 + 0.4, 0.6), (s0 - 0.2, 0.6), (s0 + 0.5, 0), (D, 0)], N) * 0.09, 0, roll=777)
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    add(bus_dry, pan(mridangam('ki', 10000, 0.3), -0.15), h0 - 0.14)
    hit(h0, 10000, 0.45)
    bell(beat('hook', 0), 1174.66, 0.12, 0.2, 'mother10')
    add(bus_dry, pan(crackle(smp(0.3), 'wait10', 40.0) * 0.2, 0.1), beat('hook', 1))
    # ── before dawn: a cold drone; the egg breaks
    dr = reed_drone(N, (SA / 2, SA / 2 * 3 / 2, SA), 'cold10')
    da = env_curve([(0, 0), (s0, 0), (s0 + 1.0, 0.25), (i0, 0.3), (r0, 0.15), (d0, 0), (D, 0)], N)
    bed += pan(lpf(dr, 800) * da, -0.15) + pan(lpf(np.roll(dr, 2500), 800) * da, 0.15)
    for k in range(5):
        add(bus_dry, pan(crackle(smp(0.2), ('egg10', k), 50.0) * 0.3, -0.2 + 0.1 * k), beat('shame', 2) - 0.2 + k * 0.06)
    hit(beat('shame', 2), 10100, 0.8, din=False, boom=0.5)
    # ── Aruna rises: a swelling chord
    n = smp(en('inside') - i0)
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA, SA * 3 / 2, SA * 2, SA * 5 / 2))) * (t / t[-1]) ** 1.5 * 0.03
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 600)]), 0.5, 0.6), i0)
    for i, f in enumerate((587.33, 739.99, 880.0)):
        bell(n0 + 0.05 + i * 0.1, f, 0.18, -0.3 + 0.3 * i, ('aruna10', i))
    # ── the curse
    hit(beat('curse', 0), 10200, 0.6, din=False, boom=0.3)
    hit(beat('curse', 2), 10210, 1.0, din=False, boom=0.8)
    bell(beat('curse', 3), 146.83, 0.26, 0.0, 'years10')
    # ── the promise: the gold egg's heartbeat
    tb, k = beat('free', 2) - 0.2, 0
    while tb < en('free'):
        hit(tb, (10300, k), 0.35, din=False, boom=0.2)
        hit(tb + 0.22, (10310, k), 0.22, din=False)
        tb += 0.8
        k += 1
    bell(beat('free', 0), 1318.5, 0.12, 0.3, 'brother10')
    # ── the rise: a rising bansuri, the seven horses' gallop, bells on "Sun"
    Sa, Re, Ga, Pa, Dha = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3, SA * 2 * 5 / 3
    ph = bansuri([Sa, Re, Ga, Pa, Dha, Sa * 2], [0.3, 0.3, 0.35, 0.4, 0.4, 1.4], 'rise10', 0.9)
    add(bus_wet, pan(ph * 0.7, 0.2), beat('rise', 1))
    add(bus_dry, pan(ph * 0.3, 0.2), beat('rise', 1))
    tg, k = r0 + 1.4, 0
    while tg < en('rise'):
        add(bus_dry, pan(mridangam('ki' if k % 3 else 'ta', (10400, k), 0.14 + 0.1 * clamp01((tg - r0) / 3)), 0.3 if k % 2 else -0.3), tg)
        tg += 0.13
        k += 1
    for i, f in enumerate((880.0, 1108.73, 1318.5, 1760.0)):
        bell(beat('rise', 2) + i * 0.1, f, 0.16, -0.4 + 0.27 * i, ('sun10', i))
    # ── dawn: a bright swell
    n = smp(en('dawn') - d0 + 0.6)
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA * 2, SA * 5 / 2, SA * 3, SA * 4))) * np.sin(np.pi * t / t[-1]) * 0.035
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 800)]), 0.4, 0.6), d0)
    # ── the ocean: waves, a horse's call, the wager
    w = water(smp(D - x0), 'sea10')
    stereo(w * env_curve([(0, 0), (0.6, 0.35), ((D - x0) - 1.0, 0.2), (D - x0, 0)], len(w)), x0, roll=1600)
    add(bus_wet, pan(glide('neigh10', 700, 1500, 0.5, 0.8) + np.concatenate([np.zeros(smp(0.25)), glide('neigh10b', 1400, 600, 0.5, 0.6)])[:smp(0.5)], -0.1), beat('cliff', 0) + 0.3)
    hit(beat('cliff', 2), 10500, 0.9, din=False, boom=0.5)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep11(tl):
    """Episode 11 (the cold-open grammar): the fire's crackle under frame 1 and again under the
    last frame (a loop); the horse breaking the surf (surf, a neigh, a drum on "horse"); a bell
    bloom under the title; the recap sting; the shore at sunrise (waves); a bell on the horse's
    name, high bells for the flowers of the gods; Sauti's fire (crackle, a bell as the vision
    opens, a whirl on "churned"); Meru (a bright swell, bells); the amrita (a shimmer, a bloom
    on "death"); Narayana (a rest, then the CONCH on "Churn"); the hosts (soft hit for the gods,
    a low drum and boom for the asuras); the ocean (deep water, a glide for the makara); the
    mountain (a boom) and the serpent (a hiss and a low bell); the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    s0, n0, f0, m0, a0, v0, x0, o0, c0, z0 = (st(i) for i in ('sisters', 'name', 'frame', 'meru', 'amrita', 'narayana', 'asuras', 'ocean', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep11')
    bed += tan * env_curve([(0, 0.35), (1.0, 0.6), (s0, 0.7), (f0, 0.55), (m0, 0.95), (v0, 0.5), (v0 + 0.8, 0.9), (o0, 0.6), (c0, 0.75), (D, 0.5)], N)
    # the fire: under frame 1 and under the last frame (the loop), and Sauti's scene
    fire = crackle(N, 'fire11')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (f0, 0), (f0 + 0.3, 0.6), (m0 - 0.2, 0.6), (m0 + 0.4, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    # ── cold open: surf, a drum, a neigh as he breaks the water
    w = water(N, 'sea11')
    stereo(w * env_curve([(0, 0.45), (st('recap'), 0.2), (st('recap') + 0.4, 0), (s0, 0), (s0 + 0.5, 0.3), (f0 - 0.3, 0.25), (f0, 0), (x0, 0), (x0 + 0.4, 0.2), (o0, 0.35), (z0, 0.3), (z0 + 0.4, 0), (D, 0)], N), 0, roll=1600)
    hit(0.02, 11000, 0.5, din=False, boom=0.35)
    hb = beat('hook', 0)
    add(bus_wet, pan(glide('neigh11', 700, 1500, 0.5, 0.8) + np.concatenate([np.zeros(smp(0.25)), glide('neigh11b', 1400, 600, 0.5, 0.6)])[:smp(0.5)], -0.1), hb)
    hit(hb, 11001, 0.55, din=True)
    tt0 = L['hook']['speechEnd'] + 0.05
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title11', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    # ── the shore, the name, the flowers
    bell(beat('name', 0), 880.0, 0.2, 0.0, 'name11')
    for i in range(7):
        bell(beat('name', 2) - 0.3 + i * 0.16, (1318.5, 1760.0, 1174.66, 1567.98, 1975.53, 1318.5, 1760.0)[i], 0.06, -0.6 + 0.2 * i, ('petal11', i))
    # ── Sauti's vision
    bell(beat('frame', 0), 587.33, 0.18, 0.1, 'vision11')
    n = smp(1.6)
    t = tvec(n)
    wh = bpf(rng('whirl11').standard_normal(n), 300, 2400) * np.sin(np.pi * t / t[-1]) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * (2 + 4 * t) * t)) * 0.06
    stereo(wh, beat('frame', 1) - 0.3, roll=400)
    # ── Meru: a bright swell and bells
    n = smp(en('meru') - m0 + 0.4)
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA * 2, SA * 3, SA * 4, SA * 5))) * np.sin(np.pi * t / t[-1]) * 0.03
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 700)]), 0.4, 0.6), m0)
    for i, f in enumerate((587.33, 880.0, 1174.66)):
        bell(beat('meru', 0) + 0.1 * i, f, 0.14, -0.3 + 0.3 * i, ('meru11', i))
    # ── the amrita
    shim = sum(np.sin(2 * np.pi * f * tvec(smp(2.5))) for f in (SA * 8, SA * 10, SA * 12)) * np.exp(-tvec(smp(2.5)) / 1.0) * 0.02
    add(bus_wet, pan(shim, 0.2), beat('amrita', 0))
    bell(beat('amrita', 1), 1174.66, 0.16, 0.0, 'death11')
    # ── Narayana: the conch on "Churn"
    cn = conch('conch11', 233.08, 2.4, 0.9)
    add(bus_wet, pan(cn * 0.6, 0.0), beat('narayana', 0) - 0.05)
    add(bus_dry, pan(cn * 0.3, 0.0), beat('narayana', 0) - 0.05)
    bell(beat('narayana', 2), 1174.66, 0.18, 0.2, 'rise11')
    # ── the hosts
    hit(beat('asuras', 0), 11100, 0.4, din=True)
    hit(beat('asuras', 1), 11110, 0.85, din=False, boom=0.6)
    hit(beat('asuras', 2), 11120, 0.5, din=True)
    # ── the ocean: a deep drone and the makara
    dr = reed_drone(N, (SA / 2, SA / 2 * 3 / 2), 'deep11')
    da = env_curve([(0, 0), (o0, 0), (o0 + 0.8, 0.3), (c0, 0.3), (z0, 0.2), (z0 + 0.4, 0), (D, 0)], N)
    bed += pan(lpf(dr, 600) * da, -0.15) + pan(lpf(np.roll(dr, 3000), 600) * da, 0.15)
    add(bus_wet, pan(glide('makara11', 180, 90, 1.2, 0.8), 0.3), beat('ocean', 2) - 0.2)
    # ── the mountain and the serpent
    hit(beat('cliff', 1), 11200, 0.9, din=False, boom=0.9)
    n = smp(1.4)
    t = tvec(n)
    hiss = bpf(rng('hiss11').standard_normal(n), 3000, 9000) * np.minimum(1, t / 0.2) * np.exp(-t / 0.6) * 0.08
    stereo(hiss, beat('cliff', 3) - 0.1, roll=300)
    bell(beat('cliff', 3), 146.83, 0.26, 0.0, 'rope11')
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep12(tl):
    """Episode 12: the fire under the first and last frames (loop); the mountain tearing from the
    earth (a rumble from frame 1, cracks, a boom on "mountain"); a bell bloom under the title;
    the recap sting; Shaunaka's question at the fire (crackle); Mandara (birdsong and water in
    clear daylight; a low bell sinking with the roots); Ananta (a rest, then a deep drum and a
    long boom with rock-fall on "tore"); the procession (a slow two-beat walking drum); the
    Ocean (a rest, a conch-like swell, waves; a bell on "share"); Akupara rising from the deep
    (a low glide; a drum as the mountain settles); Vasuki winding (a rising hiss-and-shimmer);
    the hosts taking hold (two hits); the churn (a turning drone, a heavy alternating beat) and
    the fire (a roar on "burn"); the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    k0, m0, a0, c0, o0, t0, r0, h0, x0, z0 = (st(i) for i in ('ask', 'mandara', 'ananta', 'carry', 'ocean', 'tortoise', 'rope', 'hold', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep12')
    bed += tan * env_curve([(0, 0.3), (1.0, 0.55), (m0, 0.8), (a0, 0.5), (c0, 0.8), (o0, 0.5), (t0, 0.7), (x0, 0.8), (D, 0.5)], N)
    fire = crackle(N, 'fire12')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (k0, 0), (k0 + 0.3, 0.6), (m0 - 0.2, 0.6), (m0 + 0.4, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    # ── cold open: the earth tearing
    n = smp(3.6)
    t = tvec(n)
    rum = lpf(rng('rum12').standard_normal(n), 120, 2) * np.minimum(1, t / 0.05) * np.exp(-t / 2.5) * 1.2
    stereo(rum, 0.0, roll=900)
    for k in range(6):
        add(bus_dry, pan(crackle(smp(0.25), ('crack12', k), 40.0) * 0.35, -0.3 + 0.12 * k), 0.15 + 0.35 * k)
    hit(0.02, 12000, 0.5, din=False, boom=0.5)
    hit(beat('hook', 1), 12001, 0.6, din=False, boom=0.6)
    tt0 = L['hook']['speechEnd'] + 0.05
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title12', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    # ── Mandara in daylight: birds and water; a low bell as the camera sinks to the roots
    for k in range(5):
        add(bus_wet, pan(bird_chirp(('b12', k), 2400 + 300 * k, 3200 + 200 * k, 0.12) * 0.5, -0.6 + 0.3 * k), m0 + 0.3 + 0.7 * k)
    w = water(smp(en('mandara') - m0), 'falls12')
    stereo(w * 0.25, m0, roll=500)
    bell(beat('mandara', 1), 146.83, 0.24, 0.0, 'roots12')
    # ── Ananta: a rest, then the tearing
    bell(beat('ananta', 0), 587.33, 0.14, -0.2, 'word12')
    hit(beat('ananta', 3), 12100, 1.0, din=False, boom=1.0)
    n = smp(2.5)
    t = tvec(n)
    fall = bpf(rng('fall12').standard_normal(n), 150, 1500) * np.exp(-t / 0.9) * 0.25
    stereo(fall, beat('ananta', 3) + 0.05, roll=700)
    # ── the procession: a two-beat walking drum
    tb, k = c0 + 0.2, 0
    while tb < en('carry') - 0.2:
        hit(tb, (12200, k), 0.32 if k % 2 == 0 else 0.2, din=k % 2 == 1)
        tb += 0.55
        k += 1
    # ── the Ocean speaks
    cn = conch('ocean12', 196.0, 2.6, 0.7)
    add(bus_wet, pan(cn * 0.5, 0.0), beat('ocean', 0) - 0.05)
    w = water(smp(en('ocean') - o0 + 0.3), 'sea12')
    stereo(w * 0.35, o0, roll=1600)
    bell(beat('ocean', 1), 880.0, 0.16, 0.2, 'share12')
    # ── Akupara rises; the mountain settles
    add(bus_wet, pan(glide('tort12', 110, 70, 1.8, 0.8), 0.0), beat('tortoise', 0))
    bell(beat('tortoise', 0) + 0.05, 440.0, 0.14, -0.2, 'akupara12')
    hit(beat('tortoise', 2), 12300, 0.8, din=False, boom=0.7)
    # ── Vasuki winds: a rising hiss and shimmer
    n = smp(en('rope') - beat('rope', 0))
    t = tvec(n)
    hs = bpf(rng('wind12').standard_normal(n), 3000, 8000) * (t / t[-1]) * 0.05
    sh = sum(np.sin(2 * np.pi * f * (1 + 0.3 * t / t[-1]) * t) for f in (SA * 4, SA * 6)) * (t / t[-1]) * 0.02
    stereo(hs + sh, beat('rope', 0), roll=500)
    bell(beat('rope', 0), 1174.66, 0.14, 0.3, 'vasuki12')
    # ── the hosts take hold
    hit(beat('hold', 0), 12400, 0.55, din=True, p=-0.4)
    hit(beat('hold', 1), 12410, 0.7, din=True, p=0.4)
    # ── the churn: a turning drone, an alternating heavy beat, the roar of fire
    dr = reed_drone(N, (SA / 2, SA / 2 * 3 / 2), 'churn12')
    da = env_curve([(0, 0), (x0, 0), (x0 + 1.0, 0.4), (z0, 0.4), (z0 + 0.4, 0), (D, 0)], N)
    bed += pan(lpf(dr, 700) * da, -0.15) + pan(lpf(np.roll(dr, 2500), 700) * da, 0.15)
    tb, k = beat('cliff', 0), 0
    while tb < en('cliff') - 0.2:
        hit(tb, (12500, k), 0.55, din=False, boom=0.25, p=-0.4 if k % 2 else 0.4)
        tb += 0.7
        k += 1
    r = roar(smp(en('cliff') - beat('cliff', 1) + 0.3), 'burn12')
    stereo(r * np.minimum(1, tvec(len(r)) / 0.4) * 0.12, beat('cliff', 1) - 0.2, roll=900)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep13(tl):
    """Episode 13: the fire under the first and last frames; the whirlpool (a turning shimmer from
    frame 1, a bell on "rose"); the title bloom; the recap sting; the churn on fire (the turning
    drone, alternating hauls, a roar); Indra (thunder on the flash, rain); the sea turning to
    milk (a rising major swell; a gold shimmer on "ghee"); Sauti (crackle, sparks); then the
    wonders, each with its own bell: the Moon (after a rest: a low bell and high shimmer), Shri
    (a bright three-bell figure), Sura and the horse (a bell and a neigh), the Kaustubha (a glassy
    glide), Dhanvantari (a rest, then the fullest chord); the poison (the music drops out to a
    low dark drone and a deep drum); the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    f0, r0, m0, s0, mo0, x0, z0 = (st(i) for i in ('fire', 'rain', 'milk', 'frame', 'moon', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep13')
    bed += tan * env_curve([(0, 0.4), (1.0, 0.6), (f0, 0.5), (m0, 0.8), (mo0, 1.0), (x0, 0.9), (x0 + 1.0, 0.15), (z0, 0.2), (D, 0.4)], N)
    fire = crackle(N, 'fire13')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (s0, 0), (s0 + 0.3, 0.6), (mo0 - 0.2, 0.6), (mo0 + 0.3, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    n = smp(3.4)
    t = tvec(n)
    sh = sum(np.sin(2 * np.pi * f * t + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.7 + 0.3 * i) * t)) for i, f in enumerate((SA * 4, SA * 5, SA * 6))) * np.minimum(1, t / 0.05) * np.exp(-t / 2.5) * 0.025
    stereo(sh, 0.0, roll=500)
    hit(0.02, 13000, 0.45, din=False, boom=0.3)
    bell(beat('hook', 0), 880.0, 0.16, 0.0, 'rose13')
    tt0 = L['hook']['speechEnd'] + 0.4
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title13', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    # ── the churn on fire
    dr = reed_drone(N, (SA / 2, SA / 2 * 3 / 2), 'churn13')
    da = env_curve([(0, 0), (f0, 0), (f0 + 0.6, 0.4), (m0 + 2, 0.3), (s0, 0), (D, 0)], N)
    bed += pan(lpf(dr, 700) * da, -0.15) + pan(lpf(np.roll(dr, 2500), 700) * da, 0.15)
    tb, k = f0 + 0.2, 0
    while tb < r0 - 0.2:
        hit(tb, (13100, k), 0.45, din=False, boom=0.2, p=-0.4 if k % 2 else 0.4)
        tb += 0.7
        k += 1
    rr = roar(smp(r0 - beat('fire', 1) + 1.2), 'roar13')
    stereo(rr * env_curve([(0, 0), (0.4, 1), (len(rr) / SR - 1.0, 1), (len(rr) / SR, 0)], len(rr)) * 0.12, beat('fire', 1), roll=900)
    # ── Indra: thunder, rain
    th = thunder('th13', 3.0, 0.9)
    stereo(th * 0.6, beat('rain', 0) + 0.35, roll=1200)
    rn = bpf(rng('rain13').standard_normal(smp(en('rain') - beat('rain', 1) + 2.5)), 1500, 9000) * 0.05
    stereo(rn * env_curve([(0, 0), (0.4, 1), (len(rn) / SR - 1.2, 1), (len(rn) / SR, 0)], len(rn)), beat('rain', 1) - 0.4, roll=300)
    # ── milk, then ghee
    n = smp(en('milk') - beat('milk', 1))
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA, SA * 5 / 4, SA * 3 / 2, SA * 2))) * (t / t[-1]) ** 1.2 * 0.03
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 600)]), 0.5, 0.6), beat('milk', 1))
    for i, f in enumerate((1174.66, 1479.98, 1760.0)):
        bell(beat('milk', 3) + 0.08 * i, f, 0.08, -0.3 + 0.3 * i, ('ghee13', i))
    # ── the wonders
    bell(beat('moon', 1), 293.66, 0.24, 0.0, 'moon13')
    shim = sum(np.sin(2 * np.pi * f * tvec(smp(2.6))) for f in (SA * 8, SA * 12)) * np.exp(-tvec(smp(2.6)) / 1.0) * 0.02
    add(bus_wet, pan(shim, 0.2), beat('moon', 1))
    for i, f in enumerate((880.0, 1108.73, 1318.5)):
        bell(beat('shri', 0) + 0.11 * i, f, 0.14, -0.3 + 0.3 * i, ('shri13', i))
    bell(beat('sura', 0), 659.25, 0.16, -0.3, 'sura13')
    add(bus_wet, pan(glide('neigh13', 700, 1500, 0.5, 0.7), 0.3), beat('sura', 1))
    add(bus_wet, pan(glide('jewel13', 1200, 2400, 1.2, 0.5), 0.0), beat('kaustubha', 1) - 0.3)
    bell(beat('kaustubha', 2), 1760.0, 0.12, 0.3, 'kaus13')
    for i, f in enumerate((293.66, 440.0, 587.33, 739.99, 880.0)):
        bell(beat('dhanvantari', 1) + 0.09 * i, f, 0.16, -0.4 + 0.2 * i, ('dhan13', i))
    n = smp(en('dhanvantari') - beat('dhanvantari', 3) + 0.4)
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA * 2, SA * 5 / 2, SA * 3, SA * 4))) * np.sin(np.pi * t / t[-1]) * 0.035
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 800)]), 0.3, 0.5), beat('dhanvantari', 3))
    # ── the poison: a dark drone and a deep drum
    pd = reed_drone(N, (SA / 4 * 16 / 15, SA / 2), 'poison13')
    pa = env_curve([(0, 0), (x0, 0), (beat('cliff', 1), 0.5), (z0, 0.4), (z0 + 0.4, 0), (D, 0)], N)
    bed += pan(lpf(pd, 400) * pa, -0.1) + pan(lpf(np.roll(pd, 1800), 400) * pa, 0.1)
    hit(beat('cliff', 1), 13200, 0.9, din=False, boom=0.9)
    hit(beat('cliff', 2), 13210, 0.6, din=False, boom=0.5)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep14(tl):
    """Episode 14 (as tradition tells it): the fire under the first and last frames; the cold open
    (a dark low drone from frame 1, a deep bell on "poison"); the title bloom; the recap sting;
    Sauti close (crackle, a single soft bell under the source note); the poison (the churning
    drone stalls; a deep drum and a sub-boom as the smoke boils up); the fumes (wind, the hosts'
    running steps); Brahma (a rest, his low bell, a held ivory chord); Shiva drinks (the dark
    drone drains away, an inhaled whoosh); the throat (silence and one deep bell, held); his name
    (the brightest chord of the arc); the asuras (a low, gathering drum); the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    f0, p0, s0, b0, d0, h0, n0, c0, z0 = (st(i) for i in ('frame', 'poison', 'spread', 'brahma', 'drink', 'hold', 'name', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep14')
    bed += tan * env_curve([(0, 0.3), (f0, 0.4), (p0, 0.3), (s0, 0.2), (b0, 0.5), (d0, 0.4), (h0, 0.15), (h0 + 2.5, 0.3), (n0, 0.9), (c0, 0.6), (D, 0.4)], N)
    fire = crackle(N, 'fire14')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (f0, 0), (f0 + 0.3, 0.6), (p0 - 0.2, 0.6), (p0 + 0.4, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    pd = reed_drone(N, (SA / 4 * 16 / 15, SA / 2), 'dark14')
    pa = env_curve([(0, 0.45), (f0 - 0.3, 0.3), (f0, 0), (p0, 0), (beat('poison', 1), 0.5), (b0, 0.6), (d0, 0.5), (beat('drink', 2) + 0.5, 0), (D, 0)], N)
    bed += pan(lpf(pd, 400) * pa, -0.1) + pan(lpf(np.roll(pd, 1800), 400) * pa, 0.1)
    hit(0.02, 14000, 0.4, din=False, boom=0.4)
    bell(beat('hook', 1), 146.83, 0.24, 0.0, 'poison14')
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title14', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    bell(f0 + 1.0, 587.33, 0.08, 0.2, 'source14')
    # ── the poison rises
    hit(beat('poison', 1), 14100, 0.9, din=False, boom=1.0)
    hit(beat('poison', 2), 14110, 0.5, din=False, boom=0.3)
    w = wind(smp(en('spread') - s0 + 0.5), 'fumes14')
    stereo(lpf(w, 900) * env_curve([(0, 0), (0.6, 1), (len(w) / SR - 0.6, 1), (len(w) / SR, 0)], len(w)) * 0.25, s0, roll=900)
    tb, k = beat('spread', 2) - 0.6, 0
    while tb < en('spread'):
        add(bus_dry, pan(mridangam('ki', (14200, k), 0.18), -0.5 if k % 2 else 0.5), tb)
        tb += 0.16
        k += 1
    # ── Brahma
    bell(beat('brahma', 0), 220.0, 0.2, -0.2, 'brahma14')
    n = smp(en('brahma') - b0)
    t = tvec(n)
    ch = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA, SA * 3 / 2, SA * 2))) * np.sin(np.pi * t / t[-1]) * 0.025
    add(bus_wet, fade(np.stack([ch, np.roll(ch, 600)]), 0.4, 0.5), b0)
    # ── Shiva drinks
    n = smp(1.6)
    t = tvec(n)
    wh = bpf(rng('inhale14').standard_normal(n), 300, 3000) * (t / t[-1]) ** 2 * 0.08
    stereo(wh, beat('drink', 2) - 1.3, roll=200)
    # ── the throat: one deep bell, held
    bell(beat('hold', 2), 110.0, 0.32, 0.0, 'throat14')
    bell(beat('hold', 2) + 0.02, 220.0, 0.14, 0.0, 'throat14b')
    # ── Nilakantha
    for i, f in enumerate((293.66, 369.99, 440.0, 587.33, 739.99)):
        bell(beat('name', 1) + 0.1 * i, f, 0.15, -0.4 + 0.2 * i, ('nila14', i))
    n = smp(en('name') - beat('name', 1))
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA * 2, SA * 5 / 2, SA * 3, SA * 4))) * np.sin(np.pi * t / t[-1]) * 0.035
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 800)]), 0.4, 0.6), beat('name', 1))
    # ── the asuras gather
    tb, k = c0 + 0.2, 0
    while tb < en('cliff') - 0.3:
        hit(tb, (14300, k), 0.25 + 0.06 * k, din=False, boom=0.15)
        tb += 0.55 - 0.03 * k
        k += 1
    hit(beat('cliff', 2), 14400, 0.8, din=False, boom=0.5)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep15(tl):
    """Episode 15: the fire under the first and last frames; the cold open (a roar and wind across
    the sky from frame 1); the title bloom; the recap sting; the asuras' clamour (drums, a shout
    of noise); Sauti (crackle; a shimmer as the smoke becomes a veil); the enchantress (a glassy
    bell-tremolo that stays under her scenes, the dusk shore's waves); the pot (a soft bell for
    each); Rahu among the gods (a rest; a low eclipse tone under his name); the Sun's cry (a bright
    bell); the discus (a rising whirr, then a white-noise flash and a deep boom: no impact sound
    of flesh); the head (a roar); the eclipse (a falling dark tone); the war (drums gathering);
    the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    c0, f0, e0, p0, r0, s0, d0, h0, x0, k0, z0 = (st(i) for i in ('clamour', 'frame', 'enchantress', 'pot', 'rahu', 'sun', 'discus', 'head', 'eclipse', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep15')
    bed += tan * env_curve([(0, 0.3), (c0, 0.5), (e0, 0.9), (r0, 0.6), (d0, 0.5), (h0, 0.4), (k0, 0.7), (D, 0.4)], N)
    fire = crackle(N, 'fire15')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (f0, 0), (f0 + 0.3, 0.6), (e0 - 0.2, 0.6), (e0 + 0.4, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    w = wind(N, 'sky15')
    stereo(lpf(w, 1200) * env_curve([(0, 0.5), (3.0, 0.3), (st('recap'), 0), (h0, 0), (h0 + 0.6, 0.4), (k0, 0.2), (k0 + 0.4, 0), (D, 0)], N) * 0.2, 0, roll=900)
    r = roar(smp(2.2), 'hook15')
    stereo(r * np.exp(-tvec(len(r)) / 1.0) * 0.12, 0.05, roll=600)
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title15', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    hit(beat('clamour', 0), 15000, 0.7, din=True, boom=0.3)
    hit(beat('clamour', 0) + 0.2, 15001, 0.5, din=True)
    hit(beat('clamour', 1), 15002, 0.6, din=True)
    # the illusion: a glassy tremolo under the enchantress
    n = smp(r0 - beat('frame', 1) + 0.5)
    t = tvec(n)
    gl = sum(np.sin(2 * np.pi * f * t + j) * (0.5 + 0.5 * np.sin(2 * np.pi * (5 + j) * t)) for j, f in enumerate((SA * 4, SA * 5, SA * 6 * 16 / 15))) * 0.012
    stereo(gl * env_curve([(0, 0), (0.6, 1), (len(gl) / SR - 0.6, 1), (len(gl) / SR, 0)], len(gl)), beat('frame', 1) - 0.4, roll=700)
    wv = water(smp(r0 - e0), 'dusk15')
    stereo(wv * 0.22, e0, roll=1600)
    bell(beat('enchantress', 0), 739.99, 0.12, 0.3, 'ench15')
    bell(beat('pot', 0), 587.33, 0.12, -0.2, 'pot15a')
    bell(beat('pot', 2), 880.0, 0.12, 0.2, 'pot15b')
    bell(beat('rahu', 1), 116.54, 0.26, 0.0, 'rahu15')
    hit(beat('rahu', 3), 15100, 0.45, din=False, boom=0.3)
    bell(beat('sun', 0), 1318.5, 0.16, -0.3, 'sun15')
    bell(beat('sun', 1), 1174.66, 0.14, 0.3, 'moon15')
    # the discus: a rising whirr, then a white flash and a deep boom
    n = smp(beat('discus', 2) - beat('discus', 0) + 0.1)
    t = tvec(n)
    f = 300 + 900 * (t / t[-1]) ** 1.5
    whirr = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)) * (t / t[-1]) * 0.05
    stereo(whirr, beat('discus', 0), roll=300)
    n = smp(1.0)
    fl = bpf(rng('flash15').standard_normal(n), 2000, 12000) * np.exp(-tvec(n) / 0.15) * 0.15
    stereo(fl, beat('discus', 2), roll=200)
    hit(beat('discus', 2), 15200, 1.0, din=False, boom=1.0)
    rr = roar(smp(2.4), 'head15')
    stereo(rr * env_curve([(0, 0), (0.2, 1), (2.0, 0.5), (2.4, 0)], len(rr)) * 0.18, beat('head', 1) - 0.1, roll=800)
    add(bus_wet, pan(glide('ecl15', 220, 110, 2.0, 0.7), 0.0), beat('eclipse', 1))
    tb, k = k0 + 0.3, 0
    while tb < en('cliff') - 0.2:
        hit(tb, (15300, k), 0.3 + 0.05 * k, din=k % 2 == 1, boom=0.15)
        tb += 0.45
        k += 1
    hit(beat('cliff', 1), 15400, 0.9, din=False, boom=0.7)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep16(tl):
    """Episode 16 (the arc's end): the fire under the first and last frames; the battle (a war-drum
    pattern from frame 1, roar of fires, weapon whistles); the title bloom; the recap sting; the
    clash (hits on "clashed"); hurled peaks (deep thuds, rock rumble); the discus (a rest, the
    conch, a rising whirr and bell on "Sudarshana"); Nara (a bowstring twang, an arrow's whistle,
    a bright burst on "split"); the flight (falling glides, a splash); dawn (the war-drums stop; a
    clear tanpura and birds); Sauti closes the tale (crackle, a bell as the horse returns); the
    sisters at sunrise (waves); Kadru's question (a single low pluck, then silence); the short
    Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    r0, c0, k0, d0, n0, f0, o0, s0, x0, t0, z0 = (st(i) for i in ('recap', 'clash', 'rocks', 'discus', 'nara', 'flee', 'restore', 'sauti', 'cliff', 'tail', 'next'))
    tan = tanpura_bed(N, D, 'ep16')
    bed += tan * env_curve([(0, 0.25), (c0, 0.3), (o0, 0.3), (o0 + 1.0, 0.9), (s0, 0.6), (x0, 0.8), (t0 + 0.5, 0.3), (D, 0.4)], N)
    fire = crackle(N, 'fire16')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (s0, 0), (s0 + 0.3, 0.6), (x0 - 0.2, 0.6), (x0 + 0.3, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    rr = roar(N, 'battle16')
    stereo(rr * env_curve([(0, 0.6), (r0, 0.3), (r0 + 0.3, 0), (c0, 0), (c0 + 0.5, 0.5), (f0 + 2.0, 0.4), (o0, 0), (D, 0)], N) * 0.08, 0, roll=900)
    # war drums: from frame 1 through the battle (not under the recap or after the flight)
    for seg0, seg1, key in ((0.0, r0 - 0.2, 0), (c0 + 0.2, o0 - 0.3, 1)):
        tb, k = seg0, 0
        while tb < seg1:
            hit(tb, (16000, key, k), 0.42 if k % 4 == 0 else 0.25, din=k % 2 == 1, boom=0.2 if k % 4 == 0 else 0, p=-0.3 if k % 2 else 0.3)
            tb += 0.36
            k += 1
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title16', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    hit(beat('clash', 1), 16100, 1.0, din=True, boom=0.7)
    hit(beat('rocks', 2), 16200, 0.9, din=False, boom=0.9)
    cn = conch('conch16', 233.08, 2.4, 0.9)
    add(bus_wet, pan(cn * 0.6, 0.0), beat('discus', 0) - 0.05)
    add(bus_dry, pan(cn * 0.3, 0.0), beat('discus', 0) - 0.05)
    bell(beat('discus', 2), 1174.66, 0.18, 0.0, 'sud16')
    n = smp(1.2)
    t = tvec(n)
    tw = np.sin(2 * np.pi * (180 + 40 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.18) * 0.25
    add(bus_dry, pan(tw, 0.2), beat('nara', 2) + 0.6)
    add(bus_wet, pan(glide('arrow16', 2400, 1200, 0.5, 0.5), -0.2), beat('nara', 3) - 0.4)
    for i, f in enumerate((1318.5, 1760.0, 2093.0)):
        bell(beat('nara', 3) + 0.05 * i, f, 0.12, -0.3 + 0.3 * i, ('split16', i))
    hit(beat('nara', 3), 16300, 0.7, din=False, boom=0.5)
    add(bus_wet, pan(glide('sink16', 400, 120, 1.0, 0.6), -0.3), beat('flee', 1) - 0.2)
    w = water(smp(1.5), 'splash16')
    stereo(w * env_curve([(0, 0), (0.05, 1), (1.5, 0)], len(w)) * 0.5, beat('flee', 2) - 0.1, roll=500)
    for k in range(5):
        add(bus_wet, pan(bird_chirp(('b16', k), 2400 + 300 * k, 3200 + 200 * k, 0.12) * 0.5, -0.6 + 0.3 * k), o0 + 0.6 + 0.6 * k)
    bell(beat('restore', 2), 587.33, 0.14, 0.0, 'safe16')
    bell(beat('sauti', 0), 880.0, 0.14, 0.2, 'horse16')
    wv = water(smp(z0 - x0 + 0.5), 'shore16')
    stereo(wv * 0.3, x0, roll=1600)
    x = tanpura_pluck(SA / 2, 3.0, 'tail16', 0.8)
    add(bus_dry, pan(x * 0.5, 0.0), beat('tail', 1))
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep17(tl):
    """Episode 17 (the Garuda arc opens): the fire under the first and last frames; the cold open
    (wind in the horse's tail, a low pluck as the dark strands creep in); the title bloom; the
    recap sting; the wager at sunset (waves; a soft bell for Vinata, a low reed note for Kadru; a
    drum on "slave"; night falling: crickets); Sauti (crackle); the serpents' grove (a hissing
    shimmer, glassy and green; a held drone); a rest and one bell as the sons turn away; the curse
    (a deep drum and boom on "burn"; the sacrifice's roar under the medallion); Brahma (a grave
    low chord); Kashyapa (a single clear bell as the light settles); the flight at dawn (a rising
    bansuri); the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    r0, w0, s0, f0, o0, c0, b0, k0, x0, z0 = (st(i) for i in ('recap', 'white', 'stakes', 'frame', 'order', 'curse', 'brahma', 'kashyapa', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep17')
    bed += tan * env_curve([(0, 0.3), (w0, 0.6), (f0, 0.4), (o0, 0.3), (b0, 0.6), (x0, 0.9), (D, 0.4)], N)
    fire = crackle(N, 'fire17')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (f0, 0), (f0 + 0.3, 0.6), (o0 - 0.2, 0.6), (o0 + 0.3, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    wd = wind(N, 'tail17')
    stereo(lpf(wd, 1500) * env_curve([(0, 0.5), (r0, 0.2), (r0 + 0.3, 0), (w0, 0), (w0 + 0.4, 0.15), (f0, 0), (D, 0)], N) * 0.2, 0, roll=900)
    add(bus_dry, pan(tanpura_pluck(SA / 2, 3.0, 'hook17', 0.8) * 0.5, 0.0), beat('hook', 0))
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title17', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    wv = water(smp(f0 - w0), 'sunset17')
    stereo(wv * 0.25, w0, roll=1600)
    bell(beat('white', 1), 880.0, 0.12, 0.3, 'white17')
    n = smp(1.6)
    t = tvec(n)
    reed = (np.sin(2 * np.pi * SA / 2 * 16 / 15 * t) + 0.4 * np.sin(2 * np.pi * SA * 16 / 15 * t)) * np.sin(np.pi * t / t[-1]) * 0.05
    add(bus_wet, pan(reed, -0.3), beat('black', 1))
    hit(beat('stakes', 1), 17000, 0.7, din=False, boom=0.5)
    cr = crickets(smp(f0 - beat('stakes', 2) + 0.3), 'night17')
    stereo(cr * 0.5, beat('stakes', 2), roll=400)
    # the grove: a green glassy shimmer and hiss
    sh = naga_shimmer(smp(b0 - o0), 'grove17', 1.0)
    stereo(sh * env_curve([(0, 0), (0.5, 1), (len(sh) / SR - 0.5, 1), (len(sh) / SR, 0)], len(sh)), o0, roll=600)
    bell(beat('refuse', 0), 659.25, 0.16, 0.0, 'refuse17')
    hit(beat('curse', 0), 17100, 1.0, din=False, boom=1.0)
    rr = roar(smp(en('curse') - beat('curse', 1) + 0.3), 'satra17')
    stereo(rr * 0.08, beat('curse', 1), roll=800)
    n = smp(en('brahma') - b0)
    t = tvec(n)
    ch = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA / 2, SA * 3 / 4, SA))) * np.sin(np.pi * t / t[-1]) * 0.03
    add(bus_wet, fade(np.stack([ch, np.roll(ch, 600)]), 0.4, 0.5), b0)
    bell(beat('kashyapa', 1), 1174.66, 0.16, 0.0, 'cure17')
    Sa, Re, Ga, Pa, Dha = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3, SA * 2 * 5 / 3
    ph = bansuri([Sa, Re, Ga, Pa, Dha, Sa * 2], [0.3, 0.3, 0.35, 0.4, 0.4, 1.4], 'fly17', 0.8)
    add(bus_wet, pan(ph * 0.7, 0.2), beat('cliff', 0))
    w2 = water(smp(z0 - x0 + 0.5), 'ocean17')
    stereo(w2 * 0.25, x0, roll=1600)
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep18(tl):
    """Episode 18: the fire under the first and last frames; the flight (wind and sea from frame 1, a
    rising bansuri phrase); the title bloom; the recap sting (the grove's shimmer under it); the
    deep (a submerged drone, bubbles; a low roar for the fire under the sea); Sauti (crackle, two
    soft bells: hope up, knowing down); the night flashback (crickets, a cold hiss); the arrival
    (waves); a 400 ms rest, then a deep drum on the black tail and silence; Vinata's loss (a
    falling reed); the slave (a single low bell); Aruna (the dawn chord of episode 10, briefly);
    the egg cracking (crackles, a swelling roar into a blaze of bells); the short Next sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']   # noqa: E731
    en = lambda i: L[i]['end']     # noqa: E731
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    r0, f0, d0, s0, n0, a0, t0, l0, v0, u0, c0, z0 = (st(i) for i in ('recap', 'fly', 'deep', 'frame', 'sons', 'arrive', 'tail', 'lost', 'slave', 'aruna', 'cliff', 'next'))
    tan = tanpura_bed(N, D, 'ep18')
    bed += tan * env_curve([(0, 0.4), (d0, 0.3), (s0, 0.5), (n0, 0.3), (t0, 0.1), (l0 + 0.5, 0.4), (u0, 0.8), (c0, 0.6), (D, 0.4)], N)
    fire = crackle(N, 'fire18')
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (s0, 0), (s0 + 0.3, 0.6), (n0 - 0.2, 0.6), (n0 + 0.3, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    w = water(N, 'sea18')
    stereo(w * env_curve([(0, 0.4), (r0, 0.1), (f0, 0.35), (d0, 0.1), (s0, 0), (a0, 0), (a0 + 0.3, 0.3), (u0, 0.2), (c0, 0), (D, 0)], N) * 0.8, 0, roll=1600)
    wd = wind(N, 'fly18')
    stereo(lpf(wd, 1500) * env_curve([(0, 0.5), (r0, 0.2), (f0, 0.4), (d0, 0), (D, 0)], N) * 0.2, 0, roll=900)
    Sa, Re, Ga, Pa, Dha = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3, SA * 2 * 5 / 3
    ph = bansuri([Sa, Re, Ga, Pa, Dha, Sa * 2], [0.3, 0.3, 0.35, 0.4, 0.4, 1.4], 'fly18', 0.8)
    add(bus_wet, pan(ph * 0.6, 0.2), 0.2)
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title18', i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    sh = naga_shimmer(smp(f0 - r0), 'grove18', 0.6)
    stereo(sh, r0, roll=600)
    dr = reed_drone(N, (SA / 2, SA / 2 * 3 / 2), 'deep18')
    da = env_curve([(0, 0), (d0, 0), (d0 + 0.6, 0.4), (s0, 0), (D, 0)], N)
    bed += pan(lpf(dr, 500) * da, -0.15) + pan(lpf(np.roll(dr, 2500), 500) * da, 0.15)
    rr = roar(smp(en('deep') - beat('deep', 2) + 0.3), 'seafire18')
    stereo(rr * 0.08, beat('deep', 2) - 0.3, roll=900)
    bell(beat('frame', 0), 880.0, 0.12, -0.3, 'hope18')
    bell(beat('frame', 1), 220.0, 0.18, 0.3, 'knew18')
    cr = crickets(smp(a0 - n0), 'night18')
    stereo(cr * 0.5, n0, roll=400)
    sh2 = naga_shimmer(smp(a0 - n0), 'sons18', 0.8)
    stereo(sh2, n0, roll=500)
    hit(beat('tail', 1), 18000, 1.0, din=False, boom=0.9)
    add(bus_wet, pan(glide('lost18', 330, 220, 1.4, 0.6), 0.0), beat('lost', 1))
    bell(beat('slave', 1), 146.83, 0.24, 0.0, 'slave18')
    n = smp(en('aruna') - u0)
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA * 2, SA * 5 / 2, SA * 3))) * np.sin(np.pi * t / t[-1]) * 0.03
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 800)]), 0.3, 0.5), u0)
    for k in range(6):
        add(bus_dry, pan(crackle(smp(0.2), ('egg18', k), 50.0) * 0.3, -0.25 + 0.1 * k), beat('cliff', 1) - 0.3 + k * 0.08)
    r2 = roar(smp(z0 - beat('cliff', 2) + 0.8), 'blaze18')
    stereo(r2 * env_curve([(0, 0), (0.3, 1), (len(r2) / SR, 0.5)], len(r2)) * 0.15, beat('cliff', 2) - 0.2, roll=700)
    for i, f in enumerate((587.33, 739.99, 880.0, 1174.66)):
        bell(beat('cliff', 2) + 0.08 * i, f, 0.16, -0.4 + 0.25 * i, ('blaze18', i))
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def _cue_common(tl, key, beds, fire_at):
    """Shared opening of the episode 19–20 cues: buses, a tanpura bed shaped by `beds`, the
    Naimisha fire under the first and last frames and under Sauti's line (`fire_at`), the title
    bloom and the recap sting."""
    D = tl['duration']
    N = smp(D)
    L = {l['id']: l for l in tl['lines']}
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    bed += tanpura_bed(N, D, key) * env_curve(beds, N)
    f0, f1 = L[fire_at]['start'], L[fire_at]['end']
    fire = crackle(N, 'fire' + key)
    stereo(fire * env_curve([(0, 0.7), (1.4, 0.25), (2.4, 0), (f0, 0), (f0 + 0.3, 0.6), (f1 - 0.2, 0.6), (f1 + 0.3, 0), (D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)], N) * 0.1, 0, roll=777)
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title' + key, i))
    series_recap_sting(bus_dry, bus_wet, L['recap'])
    beat = lambda i, k, d=0.5: (L[i]['beats'][k] if len(L[i]['beats']) > k else L[i]['start'] + d * (L[i]['end'] - L[i]['start']))  # noqa: E731
    return D, N, L, bus_dry, bus_wet, bed, bell, hit, stereo, beat


def build_ep19(tl):
    """Episode 19: a roar of fire under the cold open; the title; the recap; the egg's cracks and
    burst; Garuda rising (a great swell, bells, wing-beats); the gods' alarm (hurried drums);
    Agni (a rest; a crackling low tone under his voice); the praise (a calm chord); the fire drawn
    in (the roar falls away into a soft bell); Sauti (crackle; a wing-whoosh over the clearing);
    the reunion (a gentle bansuri); the serpents (a hiss and a low bell); the short Next sting."""
    D, N, L, bus_dry, bus_wet, bed, bell, hit, stereo, beat = _cue_common(tl, 'ep19', [(0, 0.3), (tl['lines'][3]['start'], 0.5), (tl['lines'][6]['start'], 0.8), (tl['lines'][9]['start'], 0.9), (tl['duration'], 0.4)], 'frame')
    st = lambda i: L[i]['start']   # noqa: E731
    rr = roar(N, 'blaze19')
    stereo(rr * env_curve([(0, 0.6), (st('recap'), 0.2), (st('recap') + 0.3, 0), (st('hatch'), 0), (beat('hatch', 1), 0.6), (st('dim'), 0.6), (beat('dim', 1) + 0.6, 0), (D, 0)], N) * 0.1, 0, roll=900)
    hit(0.02, 19000, 0.5, din=False, boom=0.6)
    for k in range(5):
        add(bus_dry, pan(crackle(smp(0.2), ('egg19', k), 50.0) * 0.3, -0.25 + 0.1 * k), beat('hatch', 1) - 0.3 + k * 0.07)
    hit(beat('hatch', 1), 19100, 0.9, din=False, boom=0.9)
    for i, f in enumerate((293.66, 440.0, 587.33, 880.0)):
        bell(beat('rise', 0) + 0.1 * i, f, 0.18, -0.4 + 0.25 * i, ('garuda19', i))
    n = smp(L['rise']['end'] - beat('rise', 0))
    t = tvec(n)
    sw = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA, SA * 3 / 2, SA * 2, SA * 3))) * (t / t[-1]) * 0.03
    add(bus_wet, fade(np.stack([sw, np.roll(sw, 600)]), 0.4, 0.5), beat('rise', 0))
    tb, k = st('gods') + 0.1, 0
    while tb < L['gods']['end'] - 0.2:
        add(bus_dry, pan(mridangam('ki' if k % 2 else 'ta', (19200, k), 0.2), -0.3 if k % 2 else 0.3), tb)
        tb += 0.18
        k += 1
    add(bus_wet, pan(glide('agni19', 160, 120, 2.5, 0.5), 0.0), beat('agni', 0))
    bell(beat('agni', 1), 659.25, 0.16, 0.0, 'name19')
    n = smp(L['praise']['end'] - st('praise'))
    t = tvec(n)
    ch = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA, SA * 5 / 4, SA * 3 / 2))) * np.sin(np.pi * t / t[-1]) * 0.03
    add(bus_wet, fade(np.stack([ch, np.roll(ch, 500)]), 0.3, 0.5), st('praise'))
    bell(beat('dim', 1), 880.0, 0.14, 0.0, 'dim19')
    n = smp(1.2)
    t = tvec(n)
    wh = bpf(rng('wing19').standard_normal(n), 200, 1500) * np.sin(np.pi * t / t[-1]) ** 2 * 0.12
    stereo(wh, st('frame') + 1.0, roll=300)
    Sa, Re, Ga, Pa = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3
    ph = bansuri([Pa, Ga, Re, Sa], [0.4, 0.4, 0.5, 1.4], 'mother19', 0.7)
    add(bus_wet, pan(ph * 0.6, 0.2), st('mother') + 0.2)
    sh = naga_shimmer(smp(L['cliff']['end'] - st('cliff')), 'cliff19', 0.8)
    stereo(sh, st('cliff'), roll=500)
    bell(beat('cliff', 2), 146.83, 0.24, 0.0, 'task19')
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


def build_ep20(tl):
    """Episode 20: wing-beats and wind under the cold open; the title; the recap; Kadru's order (a
    low reed note); the flight (wind, waves, a bansuri); the climb to the Sun (a rising high drone
    that whitens); the serpents fainting (the drone thins, one falling glide each); Kadru's prayer (a
    rest, a held chord); Indra's storm (thunder, rain, a bell as the serpents revive); Sauti (crackle,
    a bell as the island opens); the island (surf, birds); the serpents' command (a hiss); the
    question (silence, then one bell on "freedom"); the short Next sting."""
    D, N, L, bus_dry, bus_wet, bed, bell, hit, stereo, beat = _cue_common(tl, 'ep20', [(0, 0.3), (tl['lines'][3]['start'], 0.5), (tl['lines'][5]['start'], 0.2), (tl['lines'][8]['start'], 0.8), (tl['lines'][10]['start'], 0.3), (tl['duration'], 0.4)], 'frame')
    st = lambda i: L[i]['start']   # noqa: E731
    wd = wind(N, 'fly20')
    stereo(lpf(wd, 1500) * env_curve([(0, 0.5), (st('recap'), 0.2), (st('recap') + 0.3, 0), (st('fly'), 0), (st('fly') + 0.3, 0.4), (st('pray'), 0.3), (st('rain'), 0), (D, 0)], N) * 0.22, 0, roll=900)
    tb, k = 0.05, 0
    while tb < st('recap') - 0.2:
        n = smp(0.35)
        x = bpf(rng('beat20', k).standard_normal(n), 120, 900) * np.sin(np.pi * tvec(n) / 0.35) ** 2 * 0.15
        stereo(x, tb, roll=200)
        tb += 0.5
        k += 1
    n = smp(1.6)
    t = tvec(n)
    reed = (np.sin(2 * np.pi * SA / 2 * 16 / 15 * t) + 0.4 * np.sin(2 * np.pi * SA * 16 / 15 * t)) * np.sin(np.pi * t / t[-1]) * 0.05
    add(bus_wet, pan(reed, -0.3), beat('order', 1))
    w = water(smp(st('sun') - st('fly')), 'sea20')
    stereo(w * 0.3, st('fly'), roll=1600)
    Sa, Re, Ga, Pa, Dha = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3, SA * 2 * 5 / 3
    ph = bansuri([Sa, Re, Ga, Pa, Dha], [0.3, 0.3, 0.35, 0.4, 1.2], 'fly20', 0.7)
    add(bus_wet, pan(ph * 0.6, 0.2), st('fly') + 0.3)
    n = smp(L['faint']['end'] - st('sun'))
    t = tvec(n)
    hd = sum(np.sin(2 * np.pi * f * (1 + 0.1 * t / t[-1]) * t + j) for j, f in enumerate((SA * 6, SA * 8, SA * 9))) * np.minimum(1, t / 0.5) * (1 - 0.7 * np.clip((t - (st('faint') - st('sun'))) / 1.5, 0, 1)) * 0.012
    stereo(hd, st('sun'), roll=400)
    for i in range(4):
        add(bus_wet, pan(glide(('faint20', i), 700 - 60 * i, 300, 0.6, 0.35), -0.4 + 0.25 * i), beat('faint', 1) - 0.4 + i * 0.25)
    n = smp(L['pray']['end'] - st('pray'))
    t = tvec(n)
    ch = sum(np.sin(2 * np.pi * f * t + j) for j, f in enumerate((SA / 2, SA * 3 / 4, SA))) * np.sin(np.pi * t / t[-1]) * 0.03
    add(bus_wet, fade(np.stack([ch, np.roll(ch, 500)]), 0.3, 0.5), st('pray'))
    th = thunder('th20', 3.0, 0.9)
    stereo(th * 0.6, beat('rain', 1), roll=1200)
    rn = bpf(rng('rain20').standard_normal(smp(L['rain']['end'] - beat('rain', 2) + 1.5)), 1500, 9000) * 0.05
    stereo(rn * env_curve([(0, 0), (0.4, 1), (len(rn) / SR - 1.0, 1), (len(rn) / SR, 0)], len(rn)), beat('rain', 2) - 0.4, roll=300)
    bell(beat('rain', 2) + 0.6, 880.0, 0.12, 0.2, 'revive20')
    bell(beat('frame', 0), 659.25, 0.14, 0.0, 'isle20')
    w2 = water(smp(st('ask') - st('command')), 'surf20')
    stereo(w2 * 0.3, st('command'), roll=1600)
    for k in range(4):
        add(bus_wet, pan(bird_chirp(('b20', k), 2600 + 300 * k, 3400, 0.12) * 0.5, -0.5 + 0.3 * k), st('command') + 0.3 + 0.6 * k)
    sh = naga_shimmer(smp(L['command']['end'] - st('command')), 'cmd20', 0.8)
    stereo(sh, st('command'), roll=500)
    bell(beat('ask', 1), 587.33, 0.2, 0.0, 'freedom20')
    series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


# ─── episode 0 and episodes 21+: a data-driven cue sheet ─────────────────────
def build_auto(tl):
    """A cue sheet read from the script: each line may carry "sfx": ["kind@beat", …] (beat = the
    line's beat index; without @ the sound starts with the line and lasts the whole line). Kinds:
      bell (high) · bell-low · drum (a thom with a boom) · ki (quick drums through the line) ·
      wind · surf · rain · thunder · roar (fire) · hiss (serpents) · wings (a whoosh) · glide
      (a falling tone) · chord (a held calm chord) · bansuri (a rising phrase) · conch · crack
      (a dry snap) · silence (the bed dips under the line).
    The bed (tanpura), the Naimisha crackle under the first/last frames and every "speaker":
    "sauti" line, the title bells, the recap sting and the Next sting are always there."""
    D = tl['duration']
    N = smp(D)
    ep = tl['episode']
    key = f'auto{ep:02d}'
    sc = json.load(open(os.path.join(ROOT, 'script', f'ep{ep:02d}.{tl["lang"]}.json')))
    SL = {l['id']: l for l in sc['lines']}
    L = {l['id']: l for l in tl['lines']}
    bus_dry, bus_wet, bed, bell, hit, stereo = _tb_buses(N)
    pts = [(0, 0.35)]
    for l in tl['lines']:
        lvl = 0.0 if 'silence' in SL[l['id']].get('sfx', []) else (0.85 if SL[l['id']].get('speaker') == 'sauti' else 0.5)
        pts += [(l['start'] + 0.01, lvl), (max(l['start'] + 0.02, l['end'] - 0.01), lvl)]
    pts.append((D, 0.4))
    bed += tanpura_bed(N, D, key) * env_curve(pts, N)
    fpts = [(0, 0.7), (1.4, 0.25), (2.4, 0)]
    for l in tl['lines'][1:]:
        if SL[l['id']].get('speaker') == 'sauti' and l['start'] > 2.5:
            fpts += [(l['start'], 0), (l['start'] + 0.3, 0.6), (l['end'] - 0.2, 0.6), (l['end'] + 0.2, 0)]
    fpts += [(D - 1.0, 0), (D - 0.35, 0.7), (D, 0.7)]
    fpts.sort()
    stereo(crackle(N, 'fire' + key) * env_curve(fpts, N) * 0.1, 0, roll=777)
    tt0 = L['hook']['speechEnd'] + 0.3
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.2 - 0.04 * i, -0.2 + 0.2 * i, ('title' + key, i))
    if 'recap' in L:
        series_recap_sting(bus_dry, bus_wet, L['recap'])
    for li, l in enumerate(tl['lines']):
        t0, t1 = l['start'], l['end']
        for j, cue in enumerate(SL[l['id']].get('sfx', [])):
            kind, _, b = cue.partition('@')
            at = (l['beats'][int(b)] if b and int(b) < len(l['beats']) else t0 + 0.1) if b else t0 + 0.05
            k = (key, li, j)
            span = max(0.5, t1 - at)
            if kind == 'bell':
                bell(at, 880.0, 0.14, 0.1, k)
            elif kind == 'bell-low':
                bell(at, 146.83, 0.24, 0.0, k)
            elif kind == 'drum':
                hit(at, k, 0.8, din=False, boom=0.7)
            elif kind == 'ki':
                tb, n = at, 0
                while tb < t1 - 0.2:
                    add(bus_dry, pan(mridangam('ki' if n % 2 else 'ta', (k, n), 0.2), -0.3 if n % 2 else 0.3), tb)
                    tb += 0.18
                    n += 1
            elif kind == 'wind':
                w = wind(smp(span), k)
                stereo(lpf(w, 1500) * env_curve([(0, 0), (0.4, 1), (len(w) / SR - 0.5, 1), (len(w) / SR, 0)], len(w)) * 0.2, at, roll=900)
            elif kind == 'surf':
                stereo(water(smp(span), k) * 0.3, at, roll=1600)
            elif kind == 'rain':
                rn = bpf(rng(k).standard_normal(smp(span)), 1500, 9000) * 0.05
                stereo(rn * env_curve([(0, 0), (0.4, 1), (len(rn) / SR - 0.5, 1), (len(rn) / SR, 0)], len(rn)), at, roll=300)
            elif kind == 'thunder':
                stereo(thunder(k, 3.0, 0.9) * 0.6, at, roll=1200)
            elif kind == 'roar':
                rr = roar(smp(span), k)
                stereo(rr * env_curve([(0, 0), (0.3, 1), (len(rr) / SR - 0.4, 1), (len(rr) / SR, 0)], len(rr)) * 0.1, at, roll=900)
            elif kind == 'hiss':
                stereo(naga_shimmer(smp(span), k, 0.8), at, roll=500)
            elif kind == 'wings':
                n = smp(1.0)
                tt = tvec(n)
                stereo(bpf(rng(k).standard_normal(n), 200, 1500) * np.sin(np.pi * tt / tt[-1]) ** 2 * 0.12, at, roll=300)
            elif kind == 'glide':
                add(bus_wet, pan(glide(k, 600, 260, 0.8, 0.4), 0.0), at)
            elif kind == 'chord':
                n = smp(span)
                tt = tvec(n)
                ch = sum(np.sin(2 * np.pi * f * tt + q) for q, f in enumerate((SA / 2, SA * 3 / 4, SA))) * np.sin(np.pi * tt / tt[-1]) * 0.03
                add(bus_wet, fade(np.stack([ch, np.roll(ch, 500)]), 0.3, 0.5), at)
            elif kind == 'bansuri':
                Sa, Re, Ga, Pa = SA * 2, SA * 2 * 9 / 8, SA * 2 * 5 / 4, SA * 3
                add(bus_wet, pan(bansuri([Sa, Re, Ga, Pa], [0.35, 0.35, 0.4, 1.3], k, 0.7) * 0.6, 0.2), at)
            elif kind == 'conch':
                add(bus_wet, pan(conch(k, 233.08, 2.0, 0.6), 0.0), at)
            elif kind == 'crack':
                for q in range(4):
                    add(bus_dry, pan(crackle(smp(0.2), (k, q), 50.0) * 0.3, -0.2 + 0.12 * q), at + q * 0.06)
    if 'next' in L:
        series_next_sting(bus_dry, bus_wet, L['next'])
    return _tb_master(bus_dry, bus_wet, bed, D, N)


# ─── FROM EPISODE 41: THREE LAYERS (ambience bed per location · foley for every visible action · music by scene) ─────────
# Script fields per line:  "amb": kind (holds until the next line that sets one), "ambLead": ms (the next place is HEARD
# before it is seen: a J-cut), "ambLag": ms (the last place lingers under the new picture: an L-cut),
# "foley": ["kind@beat", …] (no @ = from the line's start, through the line for the continuous kinds),
# "music": mood (holds until changed), plus the old "sfx" list. Three stems are written (amb.wav, foley.wav, mus.wav) so
# tools/mix.py can duck the MUSIC hardest under the voice, the ambience a little, the foley hardly at all.
AMB_KINDS = ('hearth', 'night-fire', 'forest-day', 'forest-night', 'meadow', 'storm', 'river', 'thicket', 'satra', 'heaven', 'void', 'underworld', 'sky', 'court', 'shore')
FOLEY_KINDS = ('step', 'steps', 'cloth', 'thud', 'splash', 'water', 'rustle', 'staff', 'flame', 'sizzle', 'hooves', 'breath', 'snap', 'wings', 'hiss', 'oar', 'pot', 'anklet', 'birds', 'thunder', 'growl', 'drip', 'whoosh', 'ash', 'leaf', 'chant', 'pour', 'creak')
MUSIC_KINDS = ('still', 'calm', 'tender', 'dread', 'chase', 'grief', 'wonder', 'awe', 'wrath', 'joy', 'none')


def _loop_env(n, a=0.5, r=0.5):
    return env_curve([(0, 0), (a, 1), (max(a, n / SR - r), 1), (n / SR, 0)], n)


def amb_bed(kind, n, key):
    """A location's ambience, (2, n), about unit level (the layer gain is set in build_layers)."""
    r = rng('amb', kind, key)
    st = lambda x, roll=1777: np.stack([x, np.roll(x, roll)])
    if kind in ('hearth', 'night-fire'):
        x = st(crackle(n, ('h', key), 7.0) * 0.8)
        if kind == 'night-fire':
            x += st(crickets(n, ('c', key), 0.5), 900) * 0.5
        return x
    if kind in ('forest-day', 'meadow'):
        x = st(lpf(wind(n, ('w', key), 0.5), 900) * 0.5, 2100)
        t = 0.4
        while t < n / SR - 1.5:
            b = koel((key, t)) if r.random() < 0.25 else twitter((key, t))
            add(x, pan(b * (0.5 if kind == 'meadow' else 0.35), r.uniform(-0.8, 0.8)), t)
            t += r.uniform(0.7, 1.9) * (0.7 if kind == 'meadow' else 1.0)
        return x
    if kind == 'forest-night':
        return st(crickets(n, ('c', key), 0.9), 900) + st(lpf(wind(n, ('w', key), 0.4), 600) * 0.4, 2100)
    if kind == 'thicket':
        return st(cicadas(n, ('ci', key), 0.6), 700) + st(lpf(wind(n, ('w', key), 0.3), 700) * 0.3, 2100)
    if kind == 'storm':
        rn = bpf(r.standard_normal(n), 1200, 8000) * 0.06
        return st(lpf(wind(n, ('w', key), 1.0), 1600) * 0.9, 2100) + st(rn, 311)
    if kind in ('river', 'shore'):
        return st(water(n, ('wa', key)) * (1.0 if kind == 'river' else 1.3), 1600)
    if kind in ('satra', 'court'):
        mur = bpf(r.standard_normal(n), 180, 700) * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tvec(n)))
        return st(roar(n, ('r', key), 0.5) * (0.5 if kind == 'satra' else 0.12), 900) + st(mur, 1300)
    if kind == 'heaven':
        tt = tvec(n)
        pad = sum(np.sin(2 * np.pi * f * tt + q) for q, f in enumerate((SA * 2, SA * 3, SA * 4))) * 0.02 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * tt))
        return st(pad, 500) + st(naga_shimmer(n, ('s', key), 0.25), 700)
    if kind == 'void':
        return st(lpf(wind(n, ('w', key), 0.5), 300) * 0.5, 2100)
    if kind == 'underworld':
        tt = tvec(n)
        return st(np.sin(2 * np.pi * 55 * tt) * 0.06 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * tt)), 300) + st(lpf(wind(n, ('w', key), 0.3), 250) * 0.4, 2100)
    if kind == 'sky':
        return st(hpf(lpf(wind(n, ('w', key), 0.8), 2600), 300) * 0.7, 2100)
    raise SystemExit(f'score: unknown amb "{kind}" (one of {", ".join(AMB_KINDS)})')


def foley_hit(kind, key, span):
    """One foley sound: mono or (2, n). `span` = seconds left in the line (the continuous kinds fill it)."""
    r = rng('foley', kind, key)
    burst = lambda dur, lo, hi, sh=2.0: bpf(r.standard_normal(smp(dur)), lo, hi) * np.sin(np.pi * tvec(smp(dur)) / dur) ** sh
    if kind == 'step':
        return lpf(mridangam('thom', key, 0.3), 400)
    if kind == 'steps':
        out, t, k = np.zeros(smp(span)), 0.0, 0
        while t < span - 0.3:
            x = lpf(mridangam('thom', (key, k), 0.22 + 0.05 * (k % 2)), 380)
            i0 = smp(t)
            m = min(len(x), len(out) - i0)
            out[i0:i0 + m] += x[:m]
            t += 0.46 + 0.04 * r.random()
            k += 1
        return out
    if kind == 'hooves':
        out, t, k = np.zeros(smp(span)), 0.0, 0
        while t < span - 0.2:
            x = lpf(mridangam('thom', (key, k), 0.5), 320)
            i0 = smp(t)
            m = min(len(x), len(out) - i0)
            out[i0:i0 + m] += x[:m]
            t += (0.11, 0.11, 0.2)[k % 3]
            k += 1
        return out
    if kind in ('cloth', 'leaf', 'ash'):
        return burst(0.38 if kind == 'cloth' else 0.6, 700 if kind != 'ash' else 2000, 5200 if kind != 'ash' else 9000) * (0.1 if kind == 'cloth' else 0.06)
    if kind == 'whoosh':
        return burst(0.7, 250, 2200, 1.4) * 0.16
    if kind == 'wings':
        return np.concatenate([burst(0.28, 200, 1500) * 0.14 for _ in range(max(2, int(span / 0.3)))])[:smp(max(0.6, span))]
    if kind == 'thud':
        return mridangam('thom', key, 0.9)
    if kind == 'staff':
        return mridangam('ta', key, 0.6)
    if kind == 'snap':
        return crackle(smp(0.25), key, 60.0) * 0.5
    if kind in ('splash', 'pour', 'water', 'drip'):
        if kind == 'drip':
            return glide(key, 1800, 900, 0.09, 0.25)
        d = {'splash': 0.7, 'pour': 1.2, 'water': max(1.0, span)}[kind]
        return water(smp(d), key) * _loop_env(smp(d), 0.05 if kind == 'splash' else 0.3, 0.4) * (0.9 if kind == 'splash' else 0.5)
    if kind == 'oar':
        return np.concatenate([np.concatenate([water(smp(0.5), (key, i)) * np.sin(np.pi * tvec(smp(0.5)) / 0.5) ** 2 * 0.5, np.zeros(smp(0.8))]) for i in range(max(1, int(span / 1.3)))])
    if kind == 'rustle':
        d = max(0.6, min(span, 2.5))
        return crackle(smp(d), key, 26.0) * 0.12 * _loop_env(smp(d), 0.1, 0.3) + bpf(r.standard_normal(smp(d)), 1500, 7000) * 0.02 * _loop_env(smp(d), 0.1, 0.3)
    if kind == 'flame':
        d = min(max(span, 0.8), 2.0)
        return roar(smp(d), key, 1.0) * _loop_env(smp(d), 0.12, 0.6) * 0.35
    if kind == 'sizzle':
        return bpf(r.standard_normal(smp(0.9)), 3000, 11000) * np.exp(-tvec(smp(0.9)) / 0.25) * 0.12
    if kind == 'breath':
        return burst(0.5, 500, 2600, 1.0) * 0.07
    if kind == 'hiss':
        d = min(max(span, 0.7), 1.6)
        return bpf(r.standard_normal(smp(d)), 4000, 12000) * _loop_env(smp(d), 0.08, 0.5) * 0.08
    if kind == 'pot':
        return ghanta(520.0, 0.5, key, 0.12)
    if kind == 'anklet':
        return np.concatenate([np.pad(manjira((key, i), 0.12), (0, smp(0.12))) for i in range(3)])
    if kind == 'birds':
        return np.concatenate([twitter((key, i)) for i in range(2)]) * 0.5
    if kind == 'thunder':
        return thunder(key, 3.0, 0.9) * 0.6
    if kind == 'growl':
        d = 1.1
        tt = tvec(smp(d))
        return lpf(np.sign(np.sin(2 * np.pi * (62 + 14 * np.sin(2 * np.pi * 3 * tt)) * tt)) * (1 + 0.5 * r.standard_normal(smp(d))), 420) * np.sin(np.pi * tt / d) ** 1.5 * 0.2
    if kind == 'chant':
        d = max(1.2, span)
        tt = tvec(smp(d))
        v = sum(np.sin(2 * np.pi * f * tt * (1 + 0.002 * np.sin(2 * np.pi * 4.5 * tt + q))) for q, f in enumerate((SA, SA * 1.5, SA * 2))) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 2.2 * tt)))
        return bpf(v, 150, 1200) * 0.03 * _loop_env(smp(d), 0.3, 0.5)
    if kind == 'creak':
        tt = tvec(smp(0.5))
        return np.sin(2 * np.pi * (260 + 120 * tt) * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * tt))) * np.sin(np.pi * tt / 0.5) * 0.06
    raise SystemExit(f'score: unknown foley "{kind}" (one of {", ".join(FOLEY_KINDS)})')


def veena(f0s, durs, key, vel=1.0):
    """A plucked veena phrase: bright plucks with a little glide into each note."""
    out = np.zeros(smp(sum(durs) + 2.5))
    t = 0.0
    for k, (f, d) in enumerate(zip(f0s, durs)):
        x = tanpura_pluck(f, min(2.6, d + 1.6), (key, k), bright=1.6) * 2.2
        i0 = smp(t)
        out[i0:i0 + len(x)] += x[:len(out) - i0]
        t += d
    return out * vel


def music_bed(kind, n, key):
    """The music for one stretch of one mood: (dry (2, n), wet (2, n)). Instruments by scene: tanpura under everything,
    veena for calm and wonder, bansuri for tenderness and grief, reeds and a slow drum for dread, mridangam and manjira
    for a chase, the conch for awe, low bells and heavy drums for wrath."""
    D = n / SR
    dry, wet = np.zeros((2, n)), np.zeros((2, n))
    if kind == 'none':
        return dry, wet
    S2 = SA * 2
    lvl = {'still': 0.5, 'calm': 0.6, 'tender': 0.5, 'dread': 0.25, 'chase': 0.35, 'grief': 0.45, 'wonder': 0.6, 'awe': 0.6, 'wrath': 0.3, 'joy': 0.6}[kind]
    dry += tanpura_bed(n, D, ('tb', key), notes=(SA * 1.5, S2, S2, SA) if kind not in ('dread', 'grief', 'wrath') else (SA * 4 / 3, S2, S2, SA)) * lvl
    r = rng('music', kind, key)
    if kind in ('calm', 'joy', 'wonder'):
        scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2]
        t = 0.3
        while t < D - 2.0:
            m = 4 if kind != 'calm' else 3
            idx = sorted(r.choice(len(scale), m, replace=False)) if kind == 'wonder' else list(r.choice(len(scale), m))
            add(wet, pan(veena([S2 * scale[i] for i in idx], [0.3 if kind == 'joy' else 0.5] * m, (key, t), 0.5), r.uniform(-0.3, 0.3)), t)
            if kind == 'joy':
                add(dry, pan(manjira((key, t), 0.25), 0.4), t + 0.6)
            t += r.uniform(2.6, 3.8) * (0.7 if kind == 'joy' else 1.0)
        if kind == 'wonder':
            for i, f in enumerate((880.0, 1174.7, 1318.5)):
                x = ghanta(f, 4.0, (key, 'b', i), 0.08)
                add(wet, pan(x, -0.3 + 0.3 * i), 0.15 + 0.22 * i)
    if kind in ('tender', 'grief'):
        t = 0.4
        while t < D - 2.2:
            ph = [S2 * 3 / 2, S2 * 5 / 4, S2 * 9 / 8, S2] if kind == 'tender' else [S2 * 3 / 2, S2 * 6 / 5, S2 * 16 / 15, S2 * 15 / 16]
            add(wet, pan(bansuri(ph, [0.7, 0.6, 0.6, 1.5], (key, t), 0.6) * 0.7, 0.15), t)
            t += r.uniform(4.2, 5.4)
    if kind in ('dread', 'wrath'):
        dr = reed_drone(n, (SA / 2, SA * 0.5 * 16 / 15), ('rd', key))
        wet += np.stack([dr, np.roll(dr, 700)]) * 0.05 * _loop_env(n, 0.6, 0.6)
        t = 0.2
        while t < D - 0.6:
            add(dry, pan(mridangam('thom', (key, t), 0.5 if kind == 'dread' else 0.85), 0.0), t)
            if kind == 'wrath':
                add(dry, pan(mridangam('din', (key, t, 1), 0.3), 0.2), t + 0.33)
            t += 1.5 if kind == 'dread' else 0.66
        if kind == 'wrath':
            add(wet, pan(ghanta(73.4, 5.0, (key, 'low'), 0.3), 0.0), 0.05)
    if kind == 'chase':
        t, k = 0.1, 0
        while t < D - 0.3:
            add(dry, pan(mridangam(('thom', 'ki', 'ta', 'ki', 'din', 'ki', 'ta', 'ki')[k % 8], (key, k), 0.35 if k % 8 else 0.6), -0.25 + 0.5 * (k % 2)), t)
            if k % 4 == 2:
                add(dry, pan(manjira((key, k), 0.14), 0.5), t)
            t += 0.16
            k += 1
    if kind == 'awe':
        add(wet, pan(conch((key, 'c'), 233.08, min(2.6, D), 0.5), 0.0), 0.1)
        tt = tvec(n)
        pad = (np.sin(2 * np.pi * SA * tt) + np.sin(2 * np.pi * SA * 1.5 * tt + 0.4)) * 0.02 * _loop_env(n, 0.8, 0.8)
        wet += np.stack([pad, np.roll(pad, 500)])
    return dry, wet


def _segments(tl, SL, field, default):
    """Runs of consecutive lines with the same value of a holding field → [(value, t0, t1, first line)]."""
    out, cur = [], default
    for l in tl['lines']:
        v = SL[l['id']].get(field, cur)
        if out and v == out[-1][0]:
            out[-1][2] = l['end']
        else:
            out.append([v, l['start'], l['end'], l])
        cur = v
    return out


FOLEY_LOG = []


def build_layers(tl):
    """Episode 41 on: three stems. Returns {'amb', 'foley', 'mus'} (each (2, N)); their sum is the music.wav bed."""
    D = tl['duration']
    N = smp(D)
    ep = tl['episode']
    key = f'v2-{ep:02d}'
    sc = json.load(open(os.path.join(ROOT, 'script', f'ep{ep:02d}.{tl["lang"]}.json')))
    SL = {l['id']: l for l in sc['lines']}
    L = {l['id']: l for l in tl['lines']}
    amb, fol = np.zeros((2, N)), np.zeros((2, N))
    bus_dry, bus_wet, _bed, bell, hit, stereo = _tb_buses(N)
    # 1 · ambience: one bed per location, cross-faded 0.5 s; ambLead / ambLag move the audio cut off the picture cut
    segs = _segments(tl, SL, 'amb', 'night-fire')
    for i, (kind, t0, t1, first) in enumerate(segs):
        lead = SL[first['id']].get('ambLead', 0) / 1000 if i else 0
        lag = (SL[segs[i + 1][3]['id']].get('ambLag', 0) / 1000) if i + 1 < len(segs) else 0
        a, b = max(0, t0 - lead - 0.25), min(D, t1 + lag + 0.25)
        n = smp(b - a)
        x = amb_bed(kind, n, (key, i)) * _loop_env(n, 0.5, 0.5)
        add(amb, x, a)
    # 2 · music by mood
    for i, (kind, t0, t1, _f) in enumerate(_segments(tl, SL, 'music', 'still')):
        a, b = max(0, t0 - 0.3), min(D, t1 + 0.6)
        n = smp(b - a)
        dry, wet = music_bed(kind, n, (key, i))
        e = _loop_env(n, 0.6, 0.9)
        add(bus_dry, dry * e, a)
        add(bus_wet, wet * e, a)
    # 3 · foley and the older sfx cues
    tt0 = L['hook']['speechEnd'] + 0.3 if 'hook' in L else 0.5
    for i, f in enumerate((293.66, 440.0, 587.33)):
        bell(tt0 + 0.12 * i, f, 0.16 - 0.03 * i, -0.2 + 0.2 * i, ('title' + key, i))
    for li, l in enumerate(tl['lines']):
        t0, t1 = l['start'], l['end']
        for j, cue in enumerate(SL[l['id']].get('foley', [])):
            kind, _, b = cue.partition('@')
            at = (l['beats'][int(b)] if int(b) < len(l['beats']) else t0 + 0.1) if b else t0 + 0.08
            x = foley_hit(kind, (key, li, j), max(0.5, t1 - at))
            x = x if x.ndim == 2 else pan(x, rng('fp', key, li, j).uniform(-0.35, 0.35))
            if b and kind in ('whoosh', 'cloth', 'growl', 'rustle', 'breath', 'leaf', 'wings', 'ash', 'hiss', 'creak'):
                # a SWELL is placed by its peak, not its start: the loudest 10 ms lands on the beat (tools/soundcheck.py measures it)
                m = np.abs(x).max(axis=0) if x.ndim == 2 else np.abs(x); w = max(1, smp(0.01)); e = np.convolve(m, np.ones(w) / w, mode='same')
                at = max(0.0, at - min(0.35, float(np.argmax(e)) / SR))
            # the cue sheet as laid (tools/soundcheck.py reads it): where the sound starts, where it first reaches a quarter of
            # its peak (its audible onset) and where it peaks, measured on the sound alone before it is summed into the stem
            m_ = np.abs(x).max(axis=0) if x.ndim == 2 else np.abs(x); w_ = max(1, smp(0.008)); e_ = np.convolve(m_, np.ones(w_) / w_, mode='same'); asked = (l['beats'][int(b)] if int(b) < len(l['beats']) else t0 + 0.1) if b else t0 + 0.08
            FOLEY_LOG.append({'line': l['id'], 'cue': cue, 'asked_s': round(asked, 3), 'start_s': round(at, 3), 'onset_s': round(at + float(np.argmax(e_ > 0.25 * e_.max())) / SR, 3), 'peak_s': round(at + float(np.argmax(e_)) / SR, 3), 'peak_db': round(20 * np.log10(max(e_.max(), 1e-9)), 1)})
            add(fol, fade(x, 0.004, 0.08), at)
        for j, cue in enumerate(SL[l['id']].get('sfx', [])):
            kind, _, b = cue.partition('@')
            at = (l['beats'][int(b)] if int(b) < len(l['beats']) else t0 + 0.1) if b else t0 + 0.05
            k = (key, 's', li, j)
            if kind == 'bell':
                bell(at, 880.0, 0.14, 0.1, k)
            elif kind == 'bell-low':
                bell(at, 146.83, 0.24, 0.0, k)
            elif kind == 'drum':
                hit(at, k, 0.8, din=False, boom=0.7)
            elif kind == 'conch':
                add(bus_wet, pan(conch(k, 233.08, 2.0, 0.6), 0.0), at)
            elif kind == 'bansuri':
                add(bus_wet, pan(bansuri([SA * 2, SA * 2.25, SA * 2.5, SA * 3], [0.35, 0.35, 0.4, 1.3], k, 0.7) * 0.6, 0.2), at)
            elif kind == 'chord':
                n = smp(max(0.5, t1 - at))
                tt = tvec(n)
                ch = sum(np.sin(2 * np.pi * f * tt + q) for q, f in enumerate((SA / 2, SA * 3 / 4, SA))) * np.sin(np.pi * tt / tt[-1]) * 0.03
                add(bus_wet, fade(np.stack([ch, np.roll(ch, 500)]), 0.3, 0.5), at)
            elif kind == 'silence':
                pass   # tools/mix.py mutes the rest before a line marked TURN or "rest": true
            elif kind in FOLEY_KINDS:
                x = foley_hit(kind, k, max(0.5, t1 - at))
                add(fol, fade(x if x.ndim == 2 else pan(x, 0.0), 0.004, 0.08), at)
            else:
                raise SystemExit(f'score: sfx "{kind}" is not available in the three-layer score (line {l["id"]})')
    if 'next' in L:
        series_next_sting(bus_dry, bus_wet, L['next'])
    mus = bus_dry + reverb(bus_wet, make_ir(3.2, 4.0, 'hall')) * 0.55 + bus_wet * 0.25
    b_, a_ = sps.iirpeak(2600, 1.2, fs=SR)
    mus = mus - 0.25 * sps.lfilter(b_, a_, mus, axis=-1)
    fol = fol + reverb(fol, make_ir(1.2, 1.6, 'room2')) * 0.18
    edge = env_curve([(0, 0), (0.05, 1), (D - 0.7, 1), (D - 0.02, 0), (D, 0)], N)
    # balance: music −24, ambience −29 LUFS; the foley is set by its peaks (−15 dBFS: sparse sounds have no meaningful LUFS)
    mus = hpf(mus, 30) * edge
    amb = hpf(amb, 40) * edge
    fol = hpf(fol, 40) * edge
    mus *= db(-24.0 - lufs(mus)) if np.abs(mus).max() > 1e-6 else 1
    amb *= db(-29.0 - lufs(amb)) if np.abs(amb).max() > 1e-6 else 1
    pk = np.abs(fol).max()
    fol *= db(-15.0) / pk if pk > 1e-6 else 1
    tot = mus + amb + fol
    k = db(TARGET_LUFS - lufs(tot))
    stems = {'amb': amb * k, 'foley': fol * k, 'mus': mus * k}
    tp = true_peak_db(tot * k)
    if tp > CEIL_DBTP:
        q = db(CEIL_DBTP - 0.3 - tp)
        stems = {n_: v * q for n_, v in stems.items()}
    return stems


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


def ep_tag(args):
    ep = int(args[args.index('--ep') + 1]) if '--ep' in args else 1
    return ep, f'ep{ep:02d}'


def main():
    args = sys.argv[1:]
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'
    ep, tag = ep_tag(args)
    tl_path = os.path.join(ROOT, 'build', f'timeline.{tag}.{lang}.json')
    if not os.path.exists(tl_path):
        sys.exit(f'{tl_path} missing: run `node tools/timeline.mjs --ep {ep} --lang {lang}` first')
    tl = json.load(open(tl_path))
    src_hash = hashlib.sha1(open(__file__, 'rb').read()).hexdigest()[:12]
    # The trailer's second cut has a cue sheet of its own (tools/score_trailer.py; script "kind": "trailer" + "scoreStops"). Nothing else takes this path.
    _scp = os.path.join(ROOT, 'script', f'{tag}.{lang}.json')
    _sc = json.load(open(_scp)) if os.path.exists(_scp) else {}
    trailer2 = _sc.get('kind') == 'trailer' and _sc.get('scoreStops')
    if trailer2:
        src_hash += '+' + hashlib.sha1(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'score_trailer.py'), 'rb').read()).hexdigest()[:12]
        if _sc.get('cut', 2) >= 3:   # the third cut: its own cue sheet (tools/score_trailer3.py)
            src_hash += '+' + hashlib.sha1(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'score_trailer3.py'), 'rb').read()).hexdigest()[:12]
    stamp = {'episode': ep, 'lang': lang, 'timeline': tl['signature'], 'duration': tl['duration'], 'score': src_hash}
    out_wav = os.path.join(ROOT, 'audio', tag, 'music.wav')
    side = os.path.join(ROOT, 'audio', tag, 'music.json')
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    if '--force' not in args and os.path.exists(out_wav) and os.path.exists(side):
        try:
            if json.load(open(side)).get('stamp') == stamp:
                print(f'audio/{tag}/music.wav is up to date for timeline {tl["signature"]} ({lang})')
                return
        except Exception:
            pass
    if ep >= 41:
        if trailer2:
            sys.modules.setdefault('score', sys.modules[__name__])   # score_trailer imports this module's instruments by name
            import score_trailer
            if _sc.get('cut', 2) >= 3:
                import score_trailer3
                stems, tlog, tmeta = score_trailer3.build(tl, _sc)
            else:
                stems, tlog, tmeta = score_trailer.build(tl, _sc)
            FOLEY_LOG.extend(tlog)
            json.dump(tmeta, open(os.path.join(ROOT, 'audio', tag, 'score-trailer.json'), 'w'), indent=1)
        else:
            stems = build_layers(tl)
        json.dump(FOLEY_LOG, open(os.path.join(ROOT, 'audio', tag, 'foley-cues.json'), 'w'), indent=1)
        for name, v in stems.items():
            write_wav(os.path.join(ROOT, 'audio', tag, f'{name}.wav'), v)
        x = sum(stems.values())
        write_wav(out_wav, x)
        meta = {'stamp': stamp, 'lufs': round(lufs(x), 2), 'true_peak_dbtp': round(true_peak_db(x), 2), 'seconds': tl['duration'], 'stems': {n_: round(lufs(v), 1) for n_, v in stems.items()},
                'note': 'three stems (amb.wav, foley.wav, mus.wav) and their sum (music.wav); tools/mix.py ducks each stem by its own amount under the voice'}
        json.dump(meta, open(side, 'w'), indent=1)
        print(f'wrote audio/{tag}/music.wav + amb/foley/mus stems  {tl["duration"]:.2f} s  {meta["lufs"]} LUFS  stems {meta["stems"]}')
        return
    x = {1: build, 2: build_ep2, 3: build_ep3, 4: build_ep4, 5: build_ep5, 6: build_ep6, 7: build_ep7, 8: build_ep8, 9: build_ep9, 10: build_ep10, 11: build_ep11, 12: build_ep12, 13: build_ep13, 14: build_ep14, 15: build_ep15, 16: build_ep16, 17: build_ep17, 18: build_ep18, 19: build_ep19, 20: build_ep20}.get(ep, build_auto)(tl)
    write_wav(out_wav, x)
    meta = {'stamp': stamp, 'lufs': round(lufs(x), 2), 'true_peak_dbtp': round(true_peak_db(x), 2), 'seconds': tl['duration'],
            'note': 'music/ambience stem, a bed for narration (tools/mix.py adds voice/<lang>/*.wav and ducks this)'}
    json.dump(meta, open(side, 'w'), indent=1)
    print(f'wrote audio/{tag}/music.wav  {tl["duration"]:.2f} s  {meta["lufs"]} LUFS  {meta["true_peak_dbtp"]} dBTP  (timeline {tl["signature"]}, {lang})')


if __name__ == '__main__':
    main()
