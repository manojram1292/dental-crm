#!/usr/bin/env python3
"""
THE WAR TEASER'S SCORE AND SOUND DESIGN (script "teaser": 1, pipeline 96). Called by tools/score.py; nothing else takes this path.
Research and decisions: lab/review/teaser/SOUND-RESEARCH.md. Everything is synthesised here (numpy/scipy physical-modelling recipes)
and processed with Spotify's pedalboard (GPL-3.0; used as a tool, nothing of it ships in the film) and real impulse responses from the
MIT IR Survey (Traer & McDermott 2016, CC-BY 4.0; lab/review/teaser/ir/). No sample, no melody from any film or serial: the motif is
the series' own (Sa Pa komal-Dha Pa, the trailer's), on instruments built here.

THE SHAPE (a build):
  0 s        SOUND ON FRAME 0: a sub hit, a taiko-dhol stroke and the conch, then the tanpura drone (D) that never stops.
  the cause  a heartbeat drum (60), a low string swell under "One throne", a dark braam under the refusal.
  the field  the hosts' murmur and wind (ambience), the first big drum and the motif on a low horn.
  the seven  ONE IDEA EACH: on every introduction's cut a soft low hit, a temple bell as the plaque lands, the motif in a new colour
             (bansuri, veena, horn), the pulse rising 66 → 72 → 80; air between the lines.
  the rest   before the conch: the bed dips 3.5 dB, a reverse swell and a Shepard riser climb into it (no silence).
  the run    THE CONCH (Bhishma's, then both sides, 6.23.12–19), the war-drum engine at 120 → 132 (taiko + dhol + damaru-like
             rolls, a new layer every bar), braams on the cuts, arrows whooshing past in stereo, chariot wheels and hooves.
  the dip    a short dip under the last words before the peak, a breath, then
  the peak   A SUB DROP into the form, a struck braam, a choir chord on D, the motif in octaves, bells; a hall (the MIT
             train-station IR, about 3 s) around everything; drums on every beat.
  after      the drone, a bansuri, a veena; and on the end card ONE STRUCK RESOLVE (D: taiko, bell, low strings, conch) ringing out.
Stems: mus (score: drones, motifs, drums, braams, risers, choir), amb (field air, the hosts' murmur, wind), foley (conches, arrows,
wheels, hooves, the bow, bells on plaques). tools/mix.py (main_rules2) ducks each under the voice so the voice stands 15 dB clear.
"""
import os
import numpy as np
from scipy import signal as sps

import score as S
from score import SR, smp, db, lpf, hpf, bpf, pan, add, lufs

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IR_DIR = os.path.join(ROOT, 'lab', 'review', 'teaser', 'ir')
D2, A2, D3 = 73.42, 110.0, 146.83
MOTIF = (1.0, 1.5, 1.6, 1.5)   # Sa Pa komal-Dha Pa (the series' own)

try:
    import pedalboard as PB
except Exception:   # the score can still be made without it (reverb by the score's own synthetic IR); recorded in the meta
    PB = None


def R_(*k):
    return S.rng('teaser', *k)


def tv(dur):
    return np.arange(smp(dur)) / SR


def env_ad(n, a, d, curve=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4) * curve)
    return e


def norm(x, peak=1.0):
    m = np.abs(x).max()
    return x * (peak / m) if m > 0 else x


# ───────────────────────────── instruments (physical-modelling recipes) ─────────────────────────────
def membrane(f0, dur, key, vel=1.0, drop=0.25, slap=0.3, ratios=(1.0, 1.59, 2.14, 2.30, 2.65, 2.92, 3.16), decays=None):
    """A struck drum head: modal partials of a circular membrane (Bessel ratios) with a pitch drop, plus a noise slap."""
    r = R_('mem', key); t = tv(dur); n = len(t)
    pitch = f0 * (1 + drop * np.exp(-t / 0.04))
    ph = 2 * np.pi * np.cumsum(pitch) / SR
    x = np.zeros(n)
    decays = decays or [dur * 0.45 / (1 + 0.9 * i) for i in range(len(ratios))]
    for i, (q, dk) in enumerate(zip(ratios, decays)):
        x += (0.9 ** i) * np.sin(ph * q + r.uniform(0, 6)) * np.exp(-t / dk)
    nz = r.standard_normal(n) * np.exp(-t / 0.012)
    x += slap * bpf(nz, 300, 4000)
    return x * vel * 0.5


def taiko(key, vel=1.0, f0=52.0, dur=2.2):
    x = membrane(f0, dur, ('tk', key), vel, drop=0.35, slap=0.5)
    x += 0.6 * vel * np.sin(2 * np.pi * np.cumsum(f0 * 0.5 * (1 + 0.6 * np.exp(-tv(dur) / 0.05))) / SR) * np.exp(-tv(dur) / 0.5)   # the body's boom
    return x


def dhol(kind, key, vel=1.0):
    """The dhol: 'dagga' (the bass head, struck with the bent stick) or 'tilli' (the thin stick on the treble head: a crack)."""
    if kind == 'dagga':
        return membrane(70.0, 0.9, ('dg', key), vel, drop=0.5, slap=0.25)
    r = R_('ti', key); t = tv(0.25)
    x = membrane(330.0, 0.25, ('tl', key), vel * 0.7, drop=0.1, slap=0.0, ratios=(1.0, 1.59, 2.14, 2.65)) + 0.6 * vel * hpf(r.standard_normal(len(t)), 1800) * np.exp(-t / 0.018)
    return x


def roll(dur, key, vel=1.0, rate=18.0):
    """A damaru-like roll (a rattling double-headed drum): fast strokes rising."""
    out = np.zeros(smp(dur) + smp(0.3)); r = R_('roll', key); k = 0
    for tt in np.arange(0, dur, 1 / rate):
        s = dhol('tilli', (key, k), vel * (0.35 + 0.65 * (tt / dur) ** 1.5) * (0.85 + 0.3 * r.random())); i = smp(tt); out[i:i + len(s)] += s[:len(out) - i]; k += 1
    return out


def karplus(f0, dur, key, bright=0.5, buzz=0.0):
    """Karplus–Strong string; `buzz` adds a jawari-like bridge rattle (the tanpura's shimmer)."""
    r = R_('ks', key); n = smp(dur); N = max(2, int(SR / f0))
    buf = r.uniform(-1, 1, N); buf = lpf(buf, 2000 + 6000 * bright, 1)
    out = np.zeros(n); i = 0
    for k in range(n):
        y = buf[i]; j = (i + 1) % N
        buf[i] = 0.996 * 0.5 * (buf[i] + buf[j])
        if buzz and y > 0.25: buf[i] = buf[i] * (1 - buzz) + buzz * 0.25
        out[k] = y; i = j
    return out


def tanpura_cycle(dur, key):
    """Four strings Pa Sa' Sa' Sa (A2 D3 D3 D2), plucked in turn, each ringing with the jawari buzz; looped across the film."""
    cyc = 2.4; out = np.zeros(smp(dur) + smp(4)); notes = [A2, D3, D3 * 1.0008, D2]
    seg = {f: karplus(f, 4.0, (key, f), bright=0.35, buzz=0.18) for f in set(notes)}
    k = 0
    for t0 in np.arange(0, dur, cyc / 4):
        s = seg[notes[k % 4]] * (0.8 + 0.2 * R_('tp', key, k).random()); i = smp(t0); out[i:i + len(s)] += s[:len(out) - i]; k += 1
    return out[:smp(dur)]


def saw(f, t, det=0.0):
    ph = (f * (1 + det)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def braam(dur, key, vel=1.0, f=D2 / 2):
    """A low brass blast: detuned saws on D1/D2, a filter opening, saturation; with a sub under it."""
    t = tv(dur); x = np.zeros(len(t))
    for i, (q, det) in enumerate([(1, 0), (1, 0.004), (2, -0.003), (2, 0.006), (3, 0.002), (1.5, 0.001)]):
        x += saw(f * q, t, det) * (0.6 if q == 1 else 0.35)
    e = np.minimum(1, t / 0.06) * np.exp(-t / (dur * 0.5))
    cut = 200 + 1600 * np.minimum(1, t / 0.25) * np.exp(-t / (dur * 0.6))
    y = np.zeros_like(x); zi = None
    for a in range(0, len(x), 2400):   # time-varying low-pass in blocks
        b, aa = sps.butter(2, min(0.45, cut[a] / (SR / 2)))
        seg, zi = sps.lfilter(b, aa, x[a:a + 2400], zi=zi if zi is not None else sps.lfilter_zi(b, aa) * 0)
        y[a:a + 2400] = seg
    y = np.tanh(2.2 * y) * e
    y += 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t / (dur * 0.6)) * np.minimum(1, t / 0.02)
    return y * vel * 0.55


def sub_drop(dur=2.2, f0=90.0, f1=28.0, vel=1.0):
    t = tv(dur); f = f1 + (f0 - f1) * np.exp(-t / (dur * 0.25)); x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * np.exp(-t / (dur * 0.55)) * np.minimum(1, t / 0.005) * vel


def conch(f0, dur, key, vel=1.0):
    """The shankha: a breathy horn. A band-limited pulse through a conch-shell resonance (a bright formant near 900 Hz and one near
    2.4 kHz), a pitch that swells up a few cents and wavers, breath noise; a long, straight call."""
    r = R_('cn', key); t = tv(dur); n = len(t)
    bend = 1 + 0.012 * (1 - np.exp(-t / 0.25)) - 0.01 * np.exp(-t / 0.08) + 0.003 * np.sin(2 * np.pi * 4.8 * t + r.uniform(0, 6)) * np.minimum(1, t / 0.6)
    ph = np.cumsum(f0 * bend) / SR
    x = sum((1 / k ** 0.9) * np.sin(2 * np.pi * k * ph + r.uniform(0, 6)) for k in range(1, 14))
    x = 0.5 * bpf(x, 700, 1200) + 0.6 * bpf(x, 2000, 2900) + 0.7 * lpf(x, 600)
    x += 0.12 * bpf(r.standard_normal(n), 800, 3000)
    e = np.minimum(1, t / 0.18) ** 1.5 * np.minimum(1, (dur - t) / 0.6)
    return np.tanh(1.6 * x) * e * vel * 0.5


def bansuri(freqs, durs, key, vel=1.0):
    """A bamboo flute: sine plus a soft second harmonic, breath noise in the band, vibrato that grows into each note."""
    out = []
    for i, (f, d) in enumerate(zip(freqs, durs)):
        r = R_('bn', key, i); t = tv(d)
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
        ph = np.cumsum(f * vib) / SR
        x = np.sin(2 * np.pi * ph) + 0.18 * np.sin(4 * np.pi * ph) + 0.05 * np.sin(6 * np.pi * ph)
        x += 0.08 * bpf(r.standard_normal(len(t)), f * 0.8, f * 3)
        e = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.25)
        out.append(x * e)
    return np.concatenate(out) * vel * 0.35


def horn(freqs, durs, key, vel=1.0):
    """A low brass voice for the motif (saws, a soft filter, slow swell)."""
    out = []
    for i, (f, d) in enumerate(zip(freqs, durs)):
        t = tv(d); x = saw(f, t) + 0.6 * saw(f, t, 0.004) + 0.4 * saw(2 * f, t, -0.002)
        x = lpf(x, 900 + 300 * vel, 2); e = np.minimum(1, t / 0.12) * np.minimum(1, (d - t) / 0.2)
        out.append(x * e)
    return np.concatenate(out) * vel * 0.3


def bell(f, dur, key, vel=1.0):
    """A temple bell: modal partials (hum, prime, tierce, quint, nominal and above), each with its own long decay."""
    r = R_('bl', key); t = tv(dur)
    parts = [(0.5, 1.0, dur * 0.9), (1.0, 0.8, dur * 0.6), (1.19, 0.5, dur * 0.45), (1.5, 0.35, dur * 0.35), (2.0, 0.45, dur * 0.3), (2.51, 0.25, dur * 0.2), (3.01, 0.18, dur * 0.12), (4.07, 0.1, dur * 0.08)]
    x = sum(a * np.sin(2 * np.pi * f * q * t * (1 + 0.0004 * r.standard_normal()) + r.uniform(0, 6)) * np.exp(-t / dk) for q, a, dk in parts)
    return x * np.minimum(1, t / 0.002) * vel * 0.25


def choir(freqs, dur, key, vel=1.0, vowel='aa'):
    """A choir chord by formant synthesis: glottal-like pulses (saws with vibrato and jitter) through three vowel formants; four voices a note."""
    F = {'aa': [(800, 80), (1150, 90), (2900, 120)], 'oo': [(350, 60), (600, 80), (2400, 120)]}[vowel]
    t = tv(dur); x = np.zeros(len(t))
    for i, f in enumerate(freqs):
        for v in range(4):
            r = R_('ch', key, i, v); vib = 1 + 0.005 * np.sin(2 * np.pi * (5 + r.random()) * t + r.uniform(0, 6)) + 0.002 * r.standard_normal()
            x += saw(f * vib * (1 + 0.003 * (v - 1.5)), t)
    y = sum(sps.lfilter(*sps.iirpeak(fc / (SR / 2), fc / bw), x) * (1.0 / (k + 1)) for k, (fc, bw) in enumerate(F))
    e = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 1.2)
    return y * e * vel * 0.12


def noise_whoosh(dur, key, f0=400, f1=3000, vel=1.0):
    r = R_('wh', key); n = smp(dur); x = r.standard_normal(n); out = np.zeros(n)
    for a in range(0, n, 1200):
        u = a / n; fc = f0 * (f1 / f0) ** u
        b, aa = sps.butter(2, [max(30, fc * 0.6) / (SR / 2), min(0.45 * SR, fc * 1.6) / (SR / 2)], 'band'); out[a:a + 1200] = sps.lfilter(b, aa, x[a:a + 1200])
    t = np.arange(n) / n; e = np.sin(np.pi * np.minimum(1, t * 1.15)) ** 2
    return out * e * vel


def arrow_pass(key, vel=1.0, dur=0.55):
    """One arrow passing close: a narrow, high whistle with a Doppler fall and a breathy rush; returned in stereo, panned across."""
    r = R_('ar', key); t = tv(dur); n = len(t); u = t / dur
    f = (1900 + 900 * r.random()) * (1 + 0.12 * np.tanh((0.5 - u) * 6))
    whistle = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + bpf(r.standard_normal(n), 1500, 5000) * 0.7
    e = np.exp(-((u - 0.5) / 0.18) ** 2)
    x = whistle * e * vel
    p = np.tanh((u - 0.5) * 5) * (1 if r.random() > 0.5 else -1)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def hooves(dur, key, rate=2.6, vel=1.0):
    """A gallop: the three-beat fall of the hooves and a gap, low thuds on dusty ground, four horses slightly apart."""
    out = np.zeros(smp(dur) + smp(0.3))
    for horse in range(4):
        off = 0.06 * horse + 0.02 * R_('hv', key, horse).random()
        for c, t0 in enumerate(np.arange(off, dur, 1 / rate)):
            for j, dt in enumerate((0, 0.075, 0.15)):
                r = R_('hf', key, horse, c, j); n = smp(0.12); tt = np.arange(n) / SR
                s = (np.sin(2 * np.pi * (90 + 30 * r.random()) * tt) * np.exp(-tt / 0.03) + 0.5 * lpf(r.standard_normal(n), 900) * np.exp(-tt / 0.02)) * vel * (0.6 + 0.4 * r.random())
                i = smp(t0 + dt); out[i:i + n] += s[:max(0, len(out) - i)]
    return out[:smp(dur)] * 0.4


def wheels(dur, key, vel=1.0):
    """Chariot wheels on hard earth: a rolling rumble (brown noise, low-passed, modulated by the turning) with wooden creaks."""
    r = R_('wl', key); n = smp(dur); t = np.arange(n) / SR
    br = np.cumsum(r.standard_normal(n)); br = hpf(br - np.convolve(br, np.ones(4800) / 4800, 'same'), 30)
    rum = lpf(br, 220) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t)); rum = norm(rum, 0.6)
    cr = np.zeros(n)
    for k, t0 in enumerate(np.arange(0.2, dur, 0.62)):
        m = smp(0.18); tt = np.arange(m) / SR; c = np.sin(2 * np.pi * (520 + 80 * np.sin(tt * 40)) * tt) * np.exp(-tt / 0.06) * 0.25
        i = smp(t0 + 0.05 * r.random()); cr[i:i + m] += c[:max(0, n - i)]
    return (rum + cr) * vel


def murmur(dur, key, vel=1.0):
    """The hosts at a distance: many low voices (band noises with slow syllabic swells), metal clinks, a horse."""
    r = R_('mu', key); n = smp(dur); t = np.arange(n) / SR; x = np.zeros(n)
    for v in range(14):
        fc = 180 + 500 * r.random(); sw = 0.5 + 0.5 * np.sin(2 * np.pi * (0.3 + 1.6 * r.random()) * t + r.uniform(0, 6))
        x += bpf(r.standard_normal(n), fc * 0.7, fc * 1.5) * sw ** 2
    for k in range(int(dur * 2)):
        m = smp(0.08); tt = np.arange(m) / SR; c = np.sin(2 * np.pi * (2400 + 1200 * r.random()) * tt) * np.exp(-tt / 0.015) * 0.15
        i = smp(r.uniform(0, dur)); x[i:i + m] += c[:max(0, n - i)]
    return norm(x, 0.5) * vel


def wind(dur, key, vel=1.0):
    r = R_('wd', key); n = smp(dur); t = np.arange(n) / SR
    x = bpf(r.standard_normal(n), 150, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + 1) * np.sin(2 * np.pi * 0.07 * t))
    return norm(x, 0.4) * vel


def shepard_rise(dur, key, base=55.0, octs=6, period=6.0):
    """A Shepard–Risset rising tone: octave-spaced sines climbing, each faded by a bell curve on log-frequency, so it seems to rise for ever."""
    t = tv(dur); x = np.zeros(len(t))
    for k in range(octs):
        pos = (k + t / period) % octs; f = base * 2 ** pos; a = np.exp(-((pos - octs / 2) / (octs / 4)) ** 2)
        x += a * np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * 0.25 * np.minimum(1, t / 0.5)


def reverse_swell(dur, key):
    x = noise_whoosh(dur, key, 300, 6000, 1.0) * np.linspace(0, 1, smp(dur)) ** 3
    return x


# ───────────────────────────── space: real rooms (MIT IR Survey, CC-BY 4.0) and pedalboard ─────────────────────────────
_IR = {}


def load_ir(name):
    if name in _IR:
        return _IR[name]
    import soundfile as sf
    p = os.path.join(IR_DIR, name)
    if not os.path.exists(p):
        _IR[name] = None; return None
    x, sr = sf.read(p, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = x[np.argmax(np.abs(x) > 0.02 * np.abs(x).max()):]   # trim the pre-delay to the direct sound
    _IR[name] = x / (np.sqrt(np.sum(x ** 2)) + 1e-9)
    return _IR[name]


def room(x2, name, wet=0.3, extend=1.0, hp=120):
    """Convolve a stereo signal with a measured IR (decorrelated per side, its tail stretched by `extend` with a smooth envelope)."""
    ir = load_ir(name)
    if ir is None:
        ir = S.make_ir(2.5, 3.0, ('tz-ir', name))
        ir = ir if ir.ndim == 1 else ir[0]
    if extend > 1:
        n2 = int(len(ir) * extend); idx = np.arange(n2) / extend
        ir = np.interp(idx, np.arange(len(ir)), ir) * np.exp(-np.arange(n2) / n2 * 0.5)
    out = np.zeros_like(x2)
    for ch in range(2):
        irc = ir if ch == 0 else np.concatenate([np.zeros(smp(0.011)), ir])[:len(ir)]
        out[ch] = sps.fftconvolve(hpf(x2[ch], hp), irc)[:x2.shape[1]]
    out *= np.sqrt(np.mean(x2 ** 2) + 1e-12) / (np.sqrt(np.mean(out ** 2)) + 1e-12)
    return x2 + wet * out


def pb(x2, chain):
    if PB is None:
        return x2
    return PB.Pedalboard(chain)(x2.astype(np.float32), SR).astype(np.float64)


# ───────────────────────────── the cue sheet ─────────────────────────────
def build(tl, sc):
    Dur = tl['duration']; N = smp(Dur)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']; en = lambda i: L[i]['end']
    wt = lambda i, k: L[i]['words'][min(k, len(L[i]['words']) - 1)]['t0']
    mus, amb, fol = np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N))
    drums = np.zeros((2, N)); hall = np.zeros((2, N))   # buses that get their own rooms
    log = []

    def cue(bus, line, name, at, x, p=0.0, g=0.0):
        x2 = x if x.ndim == 2 else pan(x, p)
        x2 = x2 * db(g)
        log.append({'line': line, 'cue': name, 'start_s': round(at, 3), 'peak_db': round(float(20 * np.log10(np.abs(x2).max() + 1e-9)), 1)})
        add(bus, x2, at)

    # ── THE BED: the tanpura from frame 0 to the end, a low string drone (D2 + A2) under it, never stopping ──
    tp = tanpura_cycle(Dur, 'tp') ; tp = lpf(tp, 3500)
    t = np.arange(N) / SR
    drone = (saw(D2, t) * 0.5 + saw(D2, t, 0.003) * 0.5 + saw(A2, t, -0.002) * 0.35)
    drone = lpf(drone, 320, 2) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.09 * t))
    bed = pan(norm(tp, 1) * 0.5, -0.15) + pan(norm(tp[::-1] * 0 + tp, 1) * 0.0, 0.15) + np.stack([drone, np.roll(drone, smp(0.013))]) * 0.18
    # the bed grows with the film: thin in the cause, fuller in the introductions, full in the war, lifted at the peak, settled after
    curve = S.env_curve([(0, 0.85), (st('cousins'), 1.3), (st('needle'), 0.9), (st('gather'), 0.8), (st('bhishma'), 0.75), (st('conch') - 1.0, 0.8), (st('conch'), 1.15), (st('time'), 1.3), (st('promise'), 1.6), (st('endcard'), 1.2), (Dur, 1.2)], N)   # the cause and the promise have pauses inside their lines: the drone carries them
    mus += bed * curve * db(-15)

    # ── FRAME 0: sub hit, taiko + dhol, the conch ──
    T0 = 0.04   # inside the first frame, after the encoder's priming: a hit on sample 0 overshot by 4 dB in the AAC share copy (measured)
    cue(mus, 'title', 'sub hit', T0, sub_drop(2.4, 70, 30, 1.0), g=-5)
    cue(mus, 'title', 'taiko', T0, taiko('t0', 1.0), g=-4)
    cue(mus, 'title', 'dhol', T0, dhol('dagga', 't0', 1.0), p=0.2, g=-7)
    cue(fol, 'title', 'conch (opening)', T0, conch(D3, 3.2, 'c0', 1.0), p=-0.1, g=-4)
    cue(mus, 'title', 'second drum', 1.0, taiko('t1', 0.8), g=-6)
    cue(mus, 'title', 'braam under the name', 0.25, braam(3.0, 'b0', 0.8), g=-8)

    # ── the cause: heartbeat drum at 60, a swell under "One throne", the refusal's braam ──
    for k, tt in enumerate(np.arange(st('cousins') + 0.1, st('gather'), 1.0)):
        cue(mus, 'cousins', 'heartbeat', tt, taiko(('hb', k), 0.45, f0=46, dur=1.0), g=-10)
    cue(mus, 'cousins', 'string swell', wt('cousins', 5) - 0.8, choir([D3, A2 * 2], 2.6, 'sw1', 0.7, 'oo'), g=-6)
    cue(mus, 'needle', 'braam (the refusal)', st('needle') + 0.02, braam(3.6, 'b1', 0.8), g=-8)
    cue(fol, 'needle', 'bell (plaque)', st('needle') + 0.35, bell(587.3, 3.0, 'bn', 0.6), p=0.3, g=-10)

    # ── the field: the hosts' murmur, wind, a great drum on the cut, the motif on the horn ──
    cue(mus, 'gather', 'taiko (the field)', st('gather'), taiko('tg', 1.0), g=-3)
    cue(mus, 'gather', 'motif (horn)', st('gather') + 0.6, horn([D2 * 2 * m for m in MOTIF], [0.55, 0.55, 0.7, 1.2], 'hg', 0.9), g=-4)

    # ── the seven introductions: one idea each ──
    colours = {k: v for k, v in {'bhishma': ('horn', 0.8), 'drona': ('veena', 0.8), 'karna': ('bansuri', 0.9), 'arjuna': ('veena', 0.9), 'krishna': ('bansuri', 1.0), 'bhima': ('horn', 1.0)}.items() if k in L}
    bpm = {'bhishma': 66, 'drona': 66, 'karna': 72, 'arjuna': 72, 'krishna': 80, 'bhima': 80}
    for idx, (lid, (inst, v)) in enumerate(colours.items()):
        a, b = st(lid), en(lid)
        cue(mus, lid, 'low hit (cut)', a, taiko(('in', lid), 0.75, f0=48), g=-6)
        cue(mus, lid, 'braam (soft)', a, braam(2.4, ('bi', lid), 0.55), g=-12)
        cue(fol, lid, 'bell (plaque)', a + 0.3, bell(587.3 * (1.0 if idx % 2 else 0.75), 2.6, ('bp', lid), 0.6), p=0.25 if idx % 2 else -0.25, g=-11)
        if lid == 'krishna':
            cue(fol, lid, 'hooves', a, hooves(b - a, 'hk', 2.3, 0.8), g=-10); cue(fol, lid, 'wheels', a, wheels(b - a, 'wk', 0.7), g=-12)
        if lid == 'drona':
            cue(fol, lid, 'creak', a + 0.6, wheels(1.5, 'wd', 0.3), g=-14)
        notes = [D3 * m for m in MOTIF] if idx % 2 == 0 else [D3 * 2 * m for m in MOTIF]
        durs = [0.32, 0.32, 0.42, 0.9]
        tail = b - 1.15   # the motif answers in the air after the line, before the next cut
        if inst == 'horn': x = horn([f / 2 for f in notes], durs, ('ih', lid), v)
        elif inst == 'bansuri': x = bansuri(notes, durs, ('ib', lid), v)
        else: x = np.concatenate([karplus(f, d + 0.6, ('iv', lid, k), bright=0.7)[:smp(d)] for k, (f, d) in enumerate(zip(notes, durs))]) * 0.5
        cue(mus, lid, f'motif ({inst})', tail, x, p=0.1, g=-5)
        beat = 60.0 / bpm[lid]
        for k, tt in enumerate(np.arange(a + beat, b, beat)):
            cue(mus, lid, 'pulse', tt, taiko(('pp', lid, k), 0.35 + 0.1 * (k % 2 == 0), f0=44, dur=0.8), g=-11)
    if 'bhima' in L:
        cue(mus, 'bhima', 'dhol (Bhima)', st('bhima') + 0.05, dhol('dagga', 'bh', 1.0), g=-6)

    # ── the rest before the conch: a reverse swell and a Shepard riser climb; the bed dips (tools/mix.py) but never stops ──
    prev = [l for l in tl['lines'] if l['end'] <= st('conch') + 1e-6 and l.get('voice')][-1]
    r0 = prev['speechEnd'] + 0.05; r1 = st('conch') + 0.2
    cue(mus, 'conch', 'Shepard riser', r0 - 1.5, shepard_rise(r1 - r0 + 1.5, 'sh1', base=55, period=4.0), g=-12)
    cue(mus, 'conch', 'reverse swell', r1 - 1.2, reverse_swell(1.2, 'rs1'), g=-10)

    # ── THE RUN: the conches, the drum engine, the braams on the cuts, arrows, wheels, hooves ──
    a, peak = st('conch'), st('time')
    cue(fol, 'conch', "conch (Bhishma's)", a - 0.1, conch(D3, 2.6, 'cb', 1.0), p=-0.35, g=-2)
    cue(fol, 'conch', 'conches (both sides)', a + 0.55, conch(A2 * 2, 2.2, 'cp1', 0.9), p=0.4, g=-4)
    cue(fol, 'conch', 'conches (both sides)', a + 0.85, conch(D3 * 0.99, 2.0, 'cp2', 0.8), p=0.1, g=-6)
    cue(mus, 'conch', 'braam (the turn)', a, braam(3.0, 'bt', 1.0), g=-4)
    cue(mus, 'conch', 'sub hit', a, sub_drop(1.8, 80, 32, 0.9), g=-6)
    # the war-drum engine: 120 → 132 bpm; taiko on 1 and 3, dhol dagga on the off-beats, tilli cracks in eighths from bar 2, rolls into the cuts
    t0 = a + 0.05; tempo0, tempo1 = 120.0, 132.0
    tt, k = t0, 0
    dip_end = peak - 0.05
    while tt < dip_end - 0.05:
        u = (tt - t0) / max(1, dip_end - t0); bpm_ = tempo0 + (tempo1 - tempo0) * u; beat = 60 / bpm_; bar = k // 4
        if k % 4 in (0, 2): cue(drums, 'run', 'taiko', tt, taiko(('rt', k), 0.85 if k % 4 == 0 else 0.65, f0=50 + 4 * (k % 2)), g=-2)
        if k % 2 == 1: cue(drums, 'run', 'dhol dagga', tt, dhol('dagga', ('rd', k), 0.7), p=0.25, g=-4)
        if bar >= 1: cue(drums, 'run', 'tilli', tt + beat / 2, dhol('tilli', ('rti', k), 0.5), p=-0.3, g=-8)
        if bar >= 2: cue(drums, 'run', 'tilli', tt, dhol('tilli', ('rtj', k), 0.4), p=0.3, g=-10)
        tt += beat; k += 1
    for lid in ('between', 'lowers'):
        cue(drums, lid, 'roll into the cut', st(lid) - 0.6, roll(0.6, ('ro', lid), 0.8), g=-6)
        cue(mus, lid, 'braam (cut)', st(lid), braam(2.2, ('bc', lid), 0.8), g=-8)
        cue(mus, lid, 'taiko (cut)', st(lid), taiko(('tc', lid), 1.0), g=-4)
    # the arrows: whooshes past the camera in stereo on "the first arrows fly", and over the chariot
    fly = wt('conch', 4)
    for k in range(10):
        r = R_('arr', k).random()
        cue(fol, 'conch', 'arrow past', fly - 0.05 + k * 0.17 + 0.08 * r, arrow_pass(('ap', k), 0.9), g=-8)
    cue(fol, 'conch', 'volley rush', fly - 0.3, pan(noise_whoosh(1.6, 'vr', 500, 2500, 1.0), 0.0), g=-10)
    for k in range(6):
        cue(fol, 'between', 'arrow overhead', st('between') + 0.3 + k * 0.38, arrow_pass(('ao', k), 0.6), g=-12)
    cue(fol, 'between', 'hooves (gallop)', st('between'), hooves(en('between') - st('between') + 0.2, 'hb', 2.9, 1.0), g=-4)
    cue(fol, 'between', 'wheels', st('between'), wheels(en('between') - st('between') + 0.2, 'wb', 1.0), g=-5)
    cue(fol, 'between', 'whoosh (chariot passes)', st('between') + 0.2, pan(noise_whoosh(1.4, 'wcp', 200, 1500, 1.0), 0.0), g=-12)
    # the bow strikes the chariot floor
    tb = st('lowers') + (wt('lowers', 5) - st('lowers')) + 0.75
    cue(fol, 'lowers', 'the bow falls', tb, membrane(140, 0.6, 'bowfall', 0.8, drop=0.1, slap=0.8), p=0.15, g=-8)
    cue(mus, 'lowers', 'motif (low, unfinished)', st('lowers') + 0.4, horn([D2 * m for m in MOTIF[:3]], [0.6, 0.6, 1.4], 'hl', 0.7), g=-8)

    # ── THE PEAK: a dip under the last words before it, then the SUB DROP, the struck braam, the choir on D, the motif in octaves, bells ──
    cue(mus, 'time', 'reverse swell', peak - 0.9, reverse_swell(0.9, 'rs2'), g=-8)
    cue(mus, 'time', 'SUB DROP', peak, sub_drop(2.4, 110, 26, 1.0), g=0)
    cue(mus, 'time', 'braam (the peak)', peak, braam(4.5, 'bpk', 1.0), g=-2)
    cue(drums, 'time', 'taiko (the peak)', peak, taiko('tpk', 1.0, f0=46, dur=3.0), g=0)
    cue(hall, 'time', 'choir on D (aa)', peak + 0.15, choir([D2 * 2, A2 * 2, D3 * 2, A2 * 4], en('time') - peak + 0.8, 'chp', 1.0, 'aa'), g=-2)
    mot = horn([D2 * m for m in MOTIF], [0.7, 0.7, 0.9, 1.6], 'hp1', 1.0) + 0.0
    cue(hall, 'time', 'motif (low horn)', peak + 0.5, mot, g=-3)
    cue(hall, 'time', 'motif (bansuri, two octaves up)', peak + 0.5, bansuri([D3 * 2 * m for m in MOTIF], [0.7, 0.7, 0.9, 1.6], 'bp1', 1.0), p=0.15, g=-4)
    for k, tt in enumerate(np.arange(peak + 0.5, en('time') - 0.4, 60 / 76)):
        cue(drums, 'time', 'drum on the beat', tt, taiko(('tb', k), 0.55, f0=48), g=-6)
    tq = wt('time', 5)   # "Time"
    cue(hall, 'time', 'bell on "Time"', tq, bell(293.7, 5.0, 'bt1', 1.0), g=-4)
    cue(hall, 'time', 'bell (high)', tq + 0.02, bell(587.3, 4.0, 'bt2', 0.7), p=0.3, g=-8)
    cue(fol, 'time', 'conch (the form)', peak + 0.2, conch(A2, 3.0, 'cf', 0.8), p=-0.2, g=-8)

    # ── after: the drone, a veena and the bansuri, quietly; the ambience of the fire ──
    pa = st('promise')
    cue(mus, 'promise', 'veena (motif)', pa + 0.3, np.concatenate([karplus(D3 * m, 1.4, ('pv', k), bright=0.6)[:smp(d)] for k, (m, d) in enumerate(zip(MOTIF, [0.5, 0.5, 0.6, 1.4]))]) * 0.5, p=-0.1, g=-8)
    cue(hall, 'promise', 'pad under the promise (oo)', pa - 0.2, choir([D2 * 2, A2 * 2, D3 * 2], st('endcard') - pa + 0.6, 'ppad', 0.8, 'oo'), g=-6)   # no hole between its two sentences
    cue(mus, 'promise', 'bansuri (held Pa)', wt('promise', 8) - 0.2, bansuri([A2 * 2, A2 * 2 * 1.0], [1.2, 1.0], 'pn', 0.7), p=0.1, g=-9)

    # ── THE END: one struck resolve on D (taiko, bell, low strings, conch), ringing under the card ──
    ec = st('endcard')
    cue(drums, 'endcard', 'taiko (resolve)', ec, taiko('tend', 1.0, f0=44, dur=3.5), g=-1)
    cue(hall, 'endcard', 'bell (resolve)', ec, bell(293.7, 6.0, 'bend', 1.0), g=-3)
    cue(hall, 'endcard', 'low strings on D', ec, choir([D2, D2 * 2, A2], Dur - ec + 0.5, 'cend', 0.9, 'oo'), g=-3)
    cue(fol, 'endcard', 'conch (resolve)', ec + 0.05, conch(D3, min(3.0, Dur - ec), 'cend', 0.7), g=-9)
    cue(mus, 'endcard', 'sub (resolve)', ec, sub_drop(2.5, 60, 36, 0.7), g=-6)

    # ── AMBIENCE: wind over the plain everywhere outside the hall; the hosts' murmur from the field on; the hall's air for the cause; fire after ──
    w_ = wind(Dur, 'w'); m_ = murmur(Dur, 'm')
    a_curve = S.env_curve([(0, 1.0), (st('cousins'), 0.25), (st('gather') - 0.3, 0.25), (st('gather'), 1.0), (st('promise'), 1.0), (st('promise') + 0.4, 0.3), (Dur, 0.3)], N)
    m_curve = S.env_curve([(0, 0.6), (st('cousins'), 0.0), (st('gather') - 0.2, 0.0), (st('gather') + 0.4, 1.0), (st('conch'), 1.0), (st('conch') + 0.5, 1.4), (st('time'), 0.8), (st('promise'), 0.0), (Dur, 0.0)], N)
    amb += pan(w_ * a_curve, 0) * db(-14) + np.stack([m_, np.roll(m_, smp(0.21))]) * m_curve * db(-16)
    court = lpf(R_('court').standard_normal(N), 500) * S.env_curve([(0, 0), (st('cousins'), 1.0), (st('gather') - 0.2, 1.0), (st('gather'), 0), (Dur, 0)], N)
    amb += pan(norm(court, 0.3), 0) * db(-18)
    fire = bpf(R_('fire').standard_normal(N), 800, 5000) * (0.5 + 0.5 * (R_('fz').random(N) > 0.996)) * S.env_curve([(0, 0), (st('promise') - 0.2, 0), (st('promise') + 0.3, 1), (Dur, 1)], N)
    amb += pan(norm(fire, 0.25), 0.1) * db(-18)

    # ── room for the voice: in the run, at the peak and on the card the hits fall BETWEEN the words. Under each spoken line the drum
    #    engine, the hall and the foley step back a further 6–8 dB (on top of tools/mix.py's duck), so the voice keeps 15 dB clear ──
    sp = np.zeros(N)
    for l in tl['lines']:
        if l.get('voice') and l.get('words') and l['start'] >= st('conch') - 0.01:
            sp[max(0, smp(l['words'][0]['t0'] - 0.06)):smp(l['words'][-1]['t1'] + 0.05)] = 1
    sp = np.convolve(sp, np.ones(smp(0.08)) / smp(0.08), 'same')
    drums *= db(-7 * sp); hall *= db(-7 * sp); fol *= db(-8 * sp); mus *= db(-4 * sp)
    lowcut = lambda x: np.stack([hpf(x[0], 160, 4), hpf(x[1], 160, 4)])   # and the sub and the braams' low end make way under the words (they hit in the gaps)
    mus = mus * (1 - sp) + lowcut(mus) * sp; drums = drums * (1 - sp) + lowcut(drums) * sp; hall = hall * (1 - sp) + lowcut(hall) * sp
    # ── rooms: the drums in a stairwell-sized room, the peak and the resolve in a big hall, the field's foley with an outdoor slap ──
    drums = room(drums, '256_Stairwell.wav', wet=0.35)
    drums = pb(drums, [PB.Compressor(threshold_db=-18, ratio=3, attack_ms=8, release_ms=120)]) if PB else drums
    hall = room(hall, '041_TrainStation_SouthStationBoston.wav', wet=0.55, extend=1.0)
    mus = mus + drums + hall
    mus = room(mus, '133_SubwayStation_ParkStreetBoston.wav', wet=0.12)
    fol = room(fol, '235_Outside_Field.wav', wet=0.25)
    if PB:
        mus = norm(mus, 0.9); mus = pb(mus, [PB.HighpassFilter(28), PB.Compressor(threshold_db=-20, ratio=4, attack_ms=6, release_ms=160), PB.Gain(6), PB.Limiter(threshold_db=-4, release_ms=120)])
        fol = pb(fol, [PB.HighpassFilter(40)])
    # gain staging (mix.py re-levels the whole; this sets the balance between the stems)
    def lv(x, target):
        return x * db(target - lufs(x))
    stems = {'mus': lv(mus, -19.0), 'amb': lv(amb, -33.0), 'foley': lv(fol, -25.0)}
    for k in stems:   # no stem may start from nothing: a 3 ms ramp only
        stems[k][:, :smp(0.003)] *= np.linspace(0, 1, smp(0.003))
        stems[k] = np.clip(stems[k], -1, 1)
    meta = {'pedalboard': getattr(PB, '__version__', None) if PB else None, 'irs': sorted(_IR.keys()), 'motif': 'Sa Pa komal-Dha Pa (D A B-flat A)',
            'drum_engine_bpm': [tempo0, tempo1], 'cues': len(log)}
    return stems, log, meta
