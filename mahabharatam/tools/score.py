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
    x = {1: build, 2: build_ep2, 3: build_ep3, 4: build_ep4, 5: build_ep5, 6: build_ep6}[ep](tl)
    write_wav(out_wav, x)
    meta = {'stamp': stamp, 'lufs': round(lufs(x), 2), 'true_peak_dbtp': round(true_peak_db(x), 2), 'seconds': tl['duration'],
            'note': 'music/ambience stem, a bed for narration (tools/mix.py adds voice/<lang>/*.wav and ducks this)'}
    json.dump(meta, open(side, 'w'), indent=1)
    print(f'wrote audio/{tag}/music.wav  {tl["duration"]:.2f} s  {meta["lufs"]} LUFS  {meta["true_peak_dbtp"]} dBTP  (timeline {tl["signature"]}, {lang})')


if __name__ == '__main__':
    main()
