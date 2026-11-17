#!/usr/bin/env python3
"""
THE RED PAPER-CUT SAMPLE'S SCORE AND SOUND DESIGN (script "papercut": 1, pipeline 95). Called by tools/score.py; nothing else takes
this path. The style's palette (.claude/skills/lemo-styles/references/papercut-red.md §7) moved from China to India, under the series'
rules (no silence anywhere: the rests are dips made by tools/mix.py; the voice 15 dB clear; −14 LUFS; true peak ≤ −2.5 dBTP).

Everything is synthesised here (numpy/scipy), with the war teaser's instruments reused (tools/score_teaser.py: the tanpura, the
bansuri, the temple bell, the choir, the membrane drums, the measured rooms) and new ones built for this film:
  santoor    a hammered dulcimer: modal partials on a detuned pair of strings and a felt-hammer click (the cuts, the runs)
  sitar      a plucked string with a jawari buzz (Karplus–Strong with the bridge rattle) for single cuts
  ghanta     the big temple bell / gong: ONE stroke in the film, on the omens
  dholak     the frame-drum heartbeat (two heads: a bass "dha" with a pitch drop and a treble slap)
  paper      scissor shear (a 2.5–9 kHz noise sweep, a short metal ring, a fibre crack), fold swish and crease tap, unfold snap,
             sheet peel, cardboard thud, a paper tick per cut letter
  world      water drips, clay-pot clinks, jackals (formant glides), crickets, the court's air, birds by day
THE SHAPE: the tanpura (D) from frame 0 to the end; a heartbeat under the lump; the gold of Vyasa in a choir and a bell; the rest
before the turn as a dip; THE SIGNATURE (fold, cut, unfold) scored note for note: a swish and a crease tap per fold, a shear and a
sitar pluck per cut, three unfold snaps and a santoor glissando into a bloom; the one ghanta on "Jackals"; a santoor run, one note
for every ring of the hundred, into the daughter; one resolve on the end card.
Stems: mus (tanpura, drone, santoor, bansuri, choir, dholak, bells), amb (night, court, day), foley (paper and the world).
"""
import os
import numpy as np
from scipy import signal as sps

import score as S
from score import SR, smp, db, lpf, hpf, bpf, pan, add, lufs
import score_teaser as TZ
from score_teaser import tv, norm, membrane, tanpura_cycle, bansuri, bell, choir, karplus, sub_drop, reverse_swell, room, D2, A2, D3

MOTIF = (1.0, 1.5, 1.6, 1.5)   # Sa Pa komal-Dha Pa: the series' own
RAGA = [1.0, 16 / 15, 5 / 4, 4 / 3, 3 / 2, 8 / 5, 15 / 8, 2.0]   # D with komal Re and komal Dha (a Bhairav-like colour)


def R_(*k):
    return S.rng('papercut', *k)


# ───────────────────────────── instruments ─────────────────────────────
def santoor(f, key, vel=1.0, dur=1.8):
    """Hammered dulcimer: each course two strings a few cents apart; modal partials (slightly stretched), the higher ones dying
    sooner; a felt-hammer click on top."""
    r = R_('sn', key); t = tv(dur); x = np.zeros(len(t))
    for det in (-0.0012, 0.0013):
        for k in range(1, 9):
            fk = f * k * (1 + 0.0007 * k * k) * (1 + det)
            if fk > 15000: break
            x += (1.0 / k ** 0.9) * np.sin(2 * np.pi * fk * t + r.uniform(0, 6)) * np.exp(-t / (dur * 0.42 / (1 + 0.35 * k)))
    click = bpf(r.standard_normal(smp(0.012)), 1800, 7000) * np.exp(-np.arange(smp(0.012)) / smp(0.003))
    x[:len(click)] += 0.6 * click
    return x * np.minimum(1, t / 0.0015) * vel * 0.12


def sitar(f, key, vel=1.0, dur=1.6):
    return lpf(karplus(f, dur, ('sit', key), bright=0.8, buzz=0.3), 7000) * vel * 0.5


def ghanta(key, vel=1.0, f=98.0, dur=7.0):
    """The big temple bell / gong: the bell's partials an octave down, a slow beating pair, a low hum that swells after the strike."""
    t = tv(dur); r = R_('gh', key)
    x = bell(f * 2, dur, ('ghb', key), 1.0) * 2.4
    for q, a, dk in [(1.0, 0.8, dur * 0.8), (1.004, 0.6, dur * 0.8), (2.76, 0.35, dur * 0.4), (5.4, 0.2, dur * 0.2)]:
        x += a * np.sin(2 * np.pi * f * q * t + r.uniform(0, 6)) * np.exp(-t / dk) * 0.25
    hum = np.sin(2 * np.pi * f * 0.5 * t) * (1 - np.exp(-t / 0.4)) * np.exp(-t / (dur * 0.6)) * 0.25
    strike = lpf(r.standard_normal(smp(0.05)), 2500) * np.exp(-np.arange(smp(0.05)) / smp(0.012))
    x[:len(strike)] += 0.5 * strike
    return (x + hum) * vel


def dholak(kind, key, vel=1.0):
    if kind == 'dha':
        return membrane(92.0, 0.7, ('dk', key), vel, drop=0.45, slap=0.2)
    return membrane(410.0, 0.22, ('dkt', key), vel * 0.6, drop=0.06, slap=0.5, ratios=(1.0, 1.59, 2.14, 2.65))


def heartbeat(key, vel=1.0):
    a = dholak('dha', (key, 1), vel); b = dholak('dha', (key, 2), vel * 0.7)
    out = np.zeros(len(a) + smp(0.2)); out[:len(a)] += a; out[smp(0.2):smp(0.2) + len(b)] += b
    return lpf(out, 900)


# ── paper ──
def shear(key, vel=1.0, dur=0.16):
    """Scissors: a rising band of noise 2.5–9 kHz as the blades close, a short metallic ring, a fibre crack at the end."""
    r = R_('sh', key); n = smp(dur); t = np.arange(n) / SR
    nz = r.standard_normal(n); out = np.zeros(n)
    for i, (lo, hi) in enumerate([(2500, 4500), (4000, 6500), (6000, 9000)]):
        seg = bpf(nz, lo, hi) * np.exp(-((t / dur - (0.25 + 0.3 * i)) ** 2) / 0.03)
        out += seg
    ring = (np.sin(2 * np.pi * 4300 * t) + 0.6 * np.sin(2 * np.pi * 6750 * t)) * np.exp(-t / 0.05) * 0.08
    crack = np.zeros(n); i0 = int(n * 0.85); crack[i0:i0 + smp(0.004)] = r.standard_normal(smp(0.004)) * 0.8
    return (out * np.minimum(1, t / 0.01) + ring + hpf(crack, 1500)) * vel * 0.5


def swish(key, vel=1.0, dur=0.38):
    r = R_('sw', key); t = tv(dur); nz = r.standard_normal(len(t))
    return bpf(nz, 500, 3200) * np.sin(np.pi * np.minimum(1, t / dur)) ** 1.5 * vel * 0.35


def crease(key, vel=1.0):
    r = R_('cr', key); t = tv(0.12)
    return padd(membrane(210, 0.12, ('crm', key), vel * 0.6, drop=0.05, slap=0.3), hpf(r.standard_normal(len(t)), 2000) * np.exp(-t / 0.006) * 0.4) * vel


def snap(key, vel=1.0):
    """Unfold: the sheet goes flat with a sharp crack ("pa!")."""
    r = R_('sp', key); t = tv(0.09); nz = r.standard_normal(len(t))
    return (hpf(nz, 1200) * np.exp(-t / 0.004) * 1.0 + bpf(nz, 250, 1600) * np.exp(-t / 0.025) * 0.6) * vel * 0.6


def peel(key, vel=1.0, dur=0.55):
    """A sheet peeled off: a crackle of fibres parting, swelling and passing."""
    r = R_('pl', key); n = smp(dur); t = np.arange(n) / SR
    cr = np.zeros(n)
    for k in range(int(dur * 110)):
        i = r.integers(0, n - 200); cr[i:i + 60] += r.standard_normal(60) * np.exp(-np.arange(60) / 12) * r.uniform(0.2, 1)
    body = bpf(r.standard_normal(n), 800, 5000) * 0.25
    return (bpf(cr, 900, 7000) + body) * np.sin(np.pi * t / dur) * vel * 0.6


def thud(key, vel=1.0):
    """Cardboard, not flesh: a dull low knock and a paper slap."""
    r = R_('th', key); t = tv(0.5)
    return padd(membrane(78, 0.5, ('thm', key), vel, drop=0.3, slap=0.15), lpf(r.standard_normal(len(t)), 1200) * np.exp(-t / 0.02) * 0.5) * vel


def tick(key, vel=1.0):
    r = R_('tk', key); t = tv(0.03)
    return bpf(r.standard_normal(len(t)), 1800, 5000) * np.exp(-t / 0.004) * vel * 0.5


# ── the world ──
def drip(key, vel=1.0):
    t = tv(0.25); r = R_('dr', key); f0 = 700 + 500 * r.random()
    f = f0 * (1 + 1.2 * np.minimum(1, t / 0.035))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05) * vel * 0.35


def clink(key, vel=1.0):
    """A clay pot touched: a hollow 'tok' and a short ring."""
    return padd(membrane(380, 0.25, ('ck', key), vel, drop=0.04, slap=0.4, ratios=(1.0, 2.3, 3.9)), bell(1250, 0.4, ('ckb', key), 0.3)) * 0.7


def howl(key, dur=1.8, vel=1.0, f0=480.0):
    """A jackal: a voiced glide up and down through the 'oo'→'aa'→'oo' formants, with a wavering vibrato."""
    r = R_('hw', key); t = tv(dur)
    curve = f0 * (1 + 0.55 * np.sin(np.pi * np.minimum(1, t / dur)) ** 0.7) * (1 + 0.015 * np.sin(2 * np.pi * 6.5 * t + r.uniform(0, 6)))
    ph = np.cumsum(curve) / SR; x = 2 * (ph - np.floor(ph + 0.5))
    y = sum(sps.lfilter(*sps.iirpeak(fc / (SR / 2), fc / bw), x) * a for fc, bw, a in [(700, 90, 1.0), (1200, 110, 0.6), (2600, 160, 0.25)])
    e = np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.5)
    return y * e * vel * 0.25


def crickets(dur, key):
    r = R_('ckt', key); n = smp(dur); out = np.zeros(n); t = np.arange(smp(0.03)) / SR
    chirp = np.sin(2 * np.pi * 4600 * t) * np.sin(np.pi * t / 0.03)
    for tt in np.arange(0, dur, 0.21):
        for k in range(3):
            i = smp(tt + k * 0.045 + 0.01 * r.random())
            if i + len(chirp) < n: out[i:i + len(chirp)] += chirp * (0.5 + 0.5 * r.random())
    return out * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * np.arange(n) / SR))


def birds(dur, key):
    r = R_('bd', key); n = smp(dur); out = np.zeros(n)
    for k in range(int(dur * 1.3)):
        t0 = r.uniform(0, dur - 0.4); d = 0.08 + 0.1 * r.random(); t = tv(d); f = 2600 + 1800 * r.random()
        s = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.4 * np.sin(np.pi * t / d))) / SR) * np.sin(np.pi * t / d)
        for j in range(1 + r.integers(0, 3)): add_m(out, s * (0.4 + 0.6 * r.random()), t0 + j * (d + 0.03))
    return out


def padd(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)


def add_m(buf, x, t0):
    i = smp(t0); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[:j - i]


# ───────────────────────────── the cue sheet ─────────────────────────────
def build(tl, sc):
    Dur = tl['duration']; N = smp(Dur)
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']; en = lambda i: L[i]['end']
    wt = lambda i, k: L[i]['words'][min(k, len(L[i]['words']) - 1)]['t0']
    bt = lambda i, k: L[i]['beats'][min(k, len(L[i]['beats']) - 1)] if L[i].get('beats') else st(i)
    mus, amb, fol = np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N))
    hall = np.zeros((2, N))
    log = []

    def cue(bus, line, name, at, x, p=0.0, g=0.0):
        x2 = x if x.ndim == 2 else pan(x, p)
        x2 = x2 * db(g)
        log.append({'line': line, 'cue': name, 'start_s': round(at, 3), 'peak_db': round(float(20 * np.log10(np.abs(x2).max() + 1e-9)), 1)})
        add(bus, x2, at)

    # ── THE BED: the tanpura from frame 0 to the end on D, a soft drone under it; it swells and settles with the story ──
    tp = lpf(tanpura_cycle(Dur, 'pc-tp'), 3800)
    t = np.arange(N) / SR
    drone = (np.sin(2 * np.pi * D2 * t) + 0.5 * np.sin(2 * np.pi * A2 * t + 1) + 0.25 * np.sin(2 * np.pi * D3 * t + 2)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t))
    curve = S.env_curve([(0, 1.0), (st('boon'), 0.8), (st('carry'), 0.6), (st('forced'), 0.55), (st('mass'), 1.1), (st('vyasa'), 0.9), (st('split'), 1.3), (st('pots'), 0.9),
                         (st('omens'), 1.35), (st('refuse'), 0.55), (st('daughter'), 1.1), (st('endcard'), 1.4), (Dur, 1.4)], N)
    mus += (pan(norm(tp, 1) * 0.55, -0.12) + pan(norm(tp, 1) * 0.0, 0) + np.stack([drone, np.roll(drone, smp(0.011))]) * 0.12) * curve * db(-13)

    # ── FRAME 0: the lump's heartbeat, a santoor stroke and the cut letters ──
    T0 = 0.04   # inside the first frame (a hit on sample 0 overshoots in the AAC share copy: the teaser's lesson)
    cue(mus, 'hook', 'santoor (D, frame 0)', T0, santoor(D3, 'h0', 1.0, 2.4) + santoor(D3 * 1.5, 'h0b', 0.7, 2.4), g=-11)
    cue(mus, 'hook', 'sub under the lump', T0, sub_drop(1.2, 70, 34, 0.8), g=-12)
    for k, tt in enumerate(np.arange(st('hook'), en('hook') - 0.1, 0.75)):
        cue(mus, 'hook', 'heartbeat (the lump)', max(T0, tt - 0.03), heartbeat(('hb', k), 0.95 if k == 0 else 0.8), g=-8 if k == 0 else -14)
    for k in range(9):
        cue(fol, 'hook', 'cut letter tick', T0 + k / 12, tick(('lt', k), 0.9), p=-0.3 + 0.07 * k, g=-6 if k < 2 else -14)
    t2 = wt('hook', 4) - 0.05
    for k in range(7):
        cue(fol, 'hook', 'cut letter tick (A HUNDRED SONS)', t2 + k / 12, tick(('lt2', k), 1.0), p=-0.3 + 0.1 * k, g=-14)
    cue(mus, 'hook', 'santoor motif', t2, np.concatenate([santoor(D3 * 2 * m, ('hm', k), 0.8, 0.9)[:smp(d)] for k, (m, d) in enumerate(zip(MOTIF, [0.22, 0.22, 0.3, 0.9]))]), p=0.15, g=-12)

    # ── the boon: a peel in, the court's air, the flower of a hundred buds on "hundred" (a snap, a bell, a santoor rise) ──
    cue(fol, 'boon', 'peel (transition)', st('boon') - 0.06, peel('pb'), g=-2)
    for k, m in enumerate(RAGA[:5]):
        cue(mus, 'boon', 'santoor (court)', st('boon') + 0.3 + k * 0.32, santoor(D3 * m, ('bo', k), 0.6), p=0.2 - 0.1 * k, g=-8)
    tf = bt('boon', 2) - 0.15
    cue(fol, 'boon', 'unfold snap (the flower)', tf, snap('bf'), g=-3)
    cue(mus, 'boon', 'bell (the flower)', tf, bell(587.3, 3.0, 'bfb', 0.7), p=0.2, g=-9)
    cue(fol, 'boon', 'cloth (she offers the bowl)', st('boon') + 0.4, TZ.noise_whoosh(0.6, 'bcl', 300, 1500, 0.5) if hasattr(TZ, 'noise_whoosh') else swish('bcl'), g=-14)

    # ── two years: the bansuri, slow; one soft pluck a month (a moon phase every 12 fps step would be too busy: every third) ──
    cue(mus, 'carry', 'bansuri (long notes)', st('carry') + 0.15, bansuri([A2 * 2, D3 * 1.6 / 1.0, A2 * 2], [1.2, 1.0, en('carry') - st('carry') - 2.0], 'bc', 0.9), p=0.1, g=-10)
    for k, tt in enumerate(np.arange(st('carry') + 0.2, en('carry') - 0.2, 0.5)):
        cue(mus, 'carry', 'sitar pluck (a month)', tt, sitar(D3 * 2 if k % 2 else A2 * 2, ('cm', k), 0.4, 1.0), p=-0.2, g=-19)

    # ── Kunti's son: the sun rises (a santoor shimmer climbing), small bells, birds by day ──
    cue(fol, 'kunti', 'page turn (transition)', st('kunti') - 0.04, padd(swish('kt', 1.0, 0.5), np.pad(crease('ktc', 0.6), (smp(0.42), 0))), g=-3)
    for k in range(10):
        m = RAGA[k % 8] * (2 if k >= 8 else 1)
        cue(mus, 'kunti', 'santoor (sunrise)', st('kunti') + 0.25 + k * 0.28, santoor(D3 * m, ('ks', k), 0.55 + 0.04 * k, 1.4), p=-0.4 + 0.08 * k, g=-9)
    cue(mus, 'kunti', 'bell (the child)', bt('kunti', 1), bell(880, 2.4, 'kb', 0.5), p=0.3, g=-12)

    # ── the forced birth: the drone darkens, a low sitar, the heartbeat stumbles; a cardboard shudder on "birth" ──
    cue(mus, 'forced', 'low sitar (grief)', st('forced') + 0.15, sitar(D2 * 2, 'fs', 0.8, 2.6), p=-0.1, g=-12)
    cue(mus, 'forced', 'choir (low, oo)', st('forced'), choir([D2 * 2, A2], en('forced') - st('forced') + 0.4, 'fc', 0.7, 'oo'), g=-12)
    for k, tt in enumerate([0.4, 1.1, 1.6, 2.6, 3.0]):
        cue(mus, 'forced', 'heartbeat (stumbling)', st('forced') + tt, heartbeat(('fh', k), 0.6), g=-15)
    cue(fol, 'forced', 'shudder (thud)', bt('forced', 2) - 0.1, thud('ft', 0.7), g=-6)

    # ── the mass: it falls on three steps and lands with a cardboard thud; a low boom ──
    land = st('mass') + 0.30
    for k in range(3):
        cue(fol, 'mass', 'falling step (tick)', st('mass') + k * 0.15, tick(('mf', k), 0.6), g=-10)
    cue(fol, 'mass', 'THUD (it lands)', land - 0.02, thud('ml', 1.0), g=0)
    cue(mus, 'mass', 'boom', land - 0.02, sub_drop(0.9, 80, 32, 0.9), g=-11)
    cue(mus, 'mass', 'dholak (dha)', land, dholak('dha', 'md', 0.9), g=-6)

    # ── VYASA: the one gold: a choir bloom and a bell as he stands in his halo; clinks as the pots pop; drips of cold water ──
    va = st('vyasa')
    cue(fol, 'vyasa', 'peel (transition)', va - 0.06, peel('pv'), g=-2)
    cue(hall, 'vyasa', 'choir bloom (aa)', va + 0.05, choir([D3, A2 * 2, D3 * 2], en('vyasa') - va + 0.3, 'vc', 0.9, 'aa'), g=-10)
    cue(hall, 'vyasa', 'bell (the gold)', va + 0.05, bell(293.7, 5.0, 'vb', 0.9), g=-9)
    cue(mus, 'vyasa', 'bansuri (motif)', va + 0.4, bansuri([D3 * 2 * m for m in MOTIF], [0.4, 0.4, 0.5, 1.4], 'vbn', 0.8), p=0.15, g=-7)
    tp_ = bt('vyasa', 1) - 0.1
    for k in range(7):
        cue(fol, 'vyasa', 'pot clink', tp_ + k * 0.08, clink(('vp', k), 0.7), p=-0.6 + 0.2 * k, g=-8)
    tw = bt('vyasa', 2) - 0.3
    for k, tt in enumerate(np.arange(tw + 0.35, en('vyasa') - 0.1, 0.23)):
        cue(fol, 'vyasa', 'water drip', tt + 0.05 * R_('dj', k).random(), drip(('vd', k), 0.8), p=0.3, g=-8)

    # ── THE REST, then THE SIGNATURE: fold, cut, unfold ──
    sa = st('split')
    sp = L['split']
    # the same clock as the picture (PC.splitSchedule in src/scenes/papercut/paper.js): the unfold on "hundred" (word 4)
    T_UN = max(2.3, (sp['words'][4]['t0'] - sa if len(sp['words']) > 4 else 2.4) - 0.06); cut1 = T_UN - 0.1; cut0 = cut1 - 0.7; FD = 0.3
    T_F = [cut0 - 0.96, cut0 - 0.64, cut0 - 0.32]; T_CUT = [cut0, cut1]; T_FLAT = T_F[0] - 0.3
    cue(mus, 'split', 'reverse swell into the sheet', sa + T_FLAT - 0.6, reverse_swell(0.6, 'rs'), g=-12)
    cue(fol, 'split', 'the lump goes flat (snap)', sa + T_FLAT - 0.02, snap('sflat', 0.6), g=-6)
    for k in range(3):
        cue(fol, 'split', 'cold water drip (the rest)', sa + 0.04 + k * 0.1, drip(('sd', k), 0.6), p=-0.3 + 0.15 * k, g=-10)
    for k, tf_ in enumerate(T_F):
        cue(fol, 'split', f'fold {k + 1} (swish)', sa + tf_ - 0.02, swish(('sf', k), 1.0, FD + 0.04), p=0.1 * (k - 1), g=-2)
        cue(fol, 'split', f'fold {k + 1} (crease tap)', sa + tf_ + FD - 0.02, crease(('sc', k), 1.0), g=-2)
        cue(mus, 'split', f'fold {k + 1} (santoor)', sa + tf_ + FD - 0.02, santoor(D3 * [1.0, 4 / 3, 3 / 2][k], ('sfs', k), 0.6, 1.2), g=-8)
    for k, tt in enumerate(np.arange(T_CUT[0], T_CUT[1], 1 / 6)):
        cue(fol, 'split', 'scissor shear', sa + tt, shear(('ss', k), 1.0), p=-0.2 + 0.1 * k, g=-7)
        cue(mus, 'split', 'sitar pluck (a cut)', sa + tt + 0.12, sitar(D3 * 2 * RAGA[k % 8], ('ssp', k), 0.6, 0.9), p=0.2, g=-13)
    for k in range(3):
        cue(fol, 'split', f'unfold snap {k + 1}', sa + T_UN + k * 0.1 - 0.02, snap(('su', k), 1.0), p=(-0.3, 0.3, 0.0)[k], g=-2 if k == 2 else -4)
    glis = np.zeros(smp(1.6))
    for k in range(14):
        x = santoor(D3 * RAGA[k % 8] * (2 if k >= 8 else 1), ('sg', k), 0.6 + 0.03 * k, 1.4); add_m(glis, x[:len(glis) - smp(k * 0.035)], k * 0.035)
    cue(mus, 'split', 'santoor glissando (the unfold)', sa + T_UN - 0.45, glis, p=0.1, g=-6)
    cue(hall, 'split', 'bloom (choir on D, aa)', sa + T_UN, choir([D3, A2 * 2, D3 * 2, A2 * 4], en('split') - sa - T_UN + 0.6, 'sb', 1.0, 'aa'), g=-9)
    cue(hall, 'split', 'bell (the hundred and one)', sa + T_UN + 0.02, bell(293.7, 5.0, 'sbl', 1.0), g=-8)
    cue(mus, 'split', 'dholak (dha) on the unfold', sa + T_UN, dholak('dha', 'sud', 1.0), g=-7)

    # ── the pots: the backlit rows hum; a crack and a dholak as the near pot opens on "Duryodhana" ──
    pa = st('pots')
    cue(fol, 'pots', 'page turn (transition)', pa - 0.04, swish('pt', 1.0, 0.5), g=-3)
    cue(mus, 'pots', 'low drone (the rows)', pa, choir([D2 * 2, D2 * 3], en('pots') - pa + 0.3, 'pdr', 0.6, 'oo'), g=-9)
    tb = bt('pots', 1) - 0.15
    cue(fol, 'pots', 'the pot cracks open', tb - 0.02, padd(snap('pcr', 1.0), clink('pcl', 0.8)), g=-2)
    cue(mus, 'pots', 'dholak (dha, the child)', tb, dholak('dha', 'pd', 1.0), g=-4)
    for k in range(4):
        cue(fol, 'pots', 'rising (tick)', tb + 0.1 + k / 12, tick(('pr', k), 0.5), g=-12)
    cue(mus, 'pots', 'santoor (low, unresolved)', tb + 0.2, np.concatenate([santoor(D3 * m, ('pm', k), 0.7, 1.0)[:smp(d)] for k, (m, d) in enumerate(zip((1.0, 16 / 15, 1.0), (0.3, 0.3, 1.2)))]), p=-0.15, g=-7)

    # ── THE OMENS: the ONE ghanta, on "Jackals" (sound leads the picture by three frames); the jackals howl ──
    oa = st('omens')
    cue(hall, 'omens', 'GHANTA (the one stroke)', oa - 0.1, ghanta('og', 1.0), g=-16)
    cue(mus, 'omens', 'sub (the stroke)', oa - 0.1, sub_drop(2.4, 90, 30, 0.9), g=-9)
    for k, (tt, f0, p) in enumerate([(0.25, 470, -0.5), (0.7, 520, 0.4), (1.2, 440, -0.1), (2.3, 500, 0.6), (3.1, 460, -0.6)]):
        cue(fol, 'omens', 'jackal howl', oa + tt, howl(('oh', k), 1.6, 0.9, f0), p=p, g=-13)
    cue(mus, 'omens', 'dholak (the brahmins)', bt('omens', 1) - 0.1, dholak('dha', 'ob', 0.8), g=-12)
    cue(mus, 'omens', 'choir (dark, aa)', oa + 0.2, choir([D2 * 2, D2 * 2 * 16 / 15], en('omens') - oa, 'oc', 0.8, 'aa'), g=-14)

    # ── the refusal: a peel in; cloth as he turns away; the bansuri low; a slow heartbeat ──
    ra = st('refuse')
    cue(fol, 'refuse', 'peel (transition)', ra - 0.06, peel('pr'), g=-2)
    cue(fol, 'refuse', 'cloth (he turns)', bt('refuse', 0) - 0.1, swish('rc', 0.7, 0.35), g=-12)
    cue(mus, 'refuse', 'bansuri (low)', ra + 0.4, bansuri([A2 * 2, D3 * 16 / 15, D3], [0.8, 0.7, en('refuse') - ra - 1.6], 'rb', 0.8), p=-0.1, g=-11)
    for k, tt in enumerate(np.arange(ra + 0.2, en('refuse'), 1.1)):
        cue(mus, 'refuse', 'heartbeat (slow)', tt, heartbeat(('rh', k), 0.5), g=-16)

    # ── THE PAYOFF: a santoor run, one note for every ring of the hundred, a dholak groove, the daughter's bell ──
    da = st('daughter')
    t0d, t1d = bt('daughter', 0) - 0.3, bt('daughter', 1) + 0.2
    for k in range(13):
        tt = t0d + k * (t1d - t0d) / 12
        cue(mus, 'daughter', 'santoor run (a ring of sons)', tt, santoor(D3 * RAGA[k % 8] * (2 if k >= 8 else 1), ('dr', k), 0.6 + 0.02 * k, 1.2), p=-0.5 + 0.08 * k, g=-6)
        cue(fol, 'daughter', 'paper tick (a ring)', tt, tick(('dt', k), 0.6), g=-12)
    beat = 60 / 96
    for k, tt in enumerate(np.arange(da + 0.1, en('daughter') - 0.1, beat / 2)):
        cue(mus, 'daughter', 'dholak groove', tt, dholak('dha' if k % 4 == 0 else 'ta', ('dg', k), 0.5 if k % 4 else 0.7), p=0.15 if k % 2 else -0.15, g=-12)
    td = bt('daughter', 2) - 0.15
    cue(fol, 'daughter', 'snap (the daughter)', td - 0.02, snap('ds', 0.9), g=-4)
    cue(hall, 'daughter', 'bell (the daughter)', td, bell(587.3, 3.5, 'db', 0.9), p=0.1, g=-6)
    cue(mus, 'daughter', 'bansuri (high, motif)', td + 0.1, bansuri([D3 * 2 * m for m in MOTIF], [0.3, 0.3, 0.4, 1.0], 'dbn', 0.9), p=0.2, g=-6)

    # ── THE END: one resolve on D: santoor chord, bell, tanpura; paper ticks for the letters; a snap for FOLLOW ──
    ea = st('endcard')
    for k in range(6):
        cue(fol, 'endcard', 'cut letter tick', ea + k / 12, tick(('et', k), 0.8), p=-0.3 + 0.12 * k, g=-8)
    for k, m in enumerate((1.0, 1.5, 2.0, 3.0)):
        cue(mus, 'endcard', 'santoor (resolve)', ea + 0.02 + k * 0.04, santoor(D3 * m, ('er', k), 0.9, 3.0), p=-0.2 + 0.13 * k, g=-3)
    cue(hall, 'endcard', 'bell (resolve)', ea + 0.02, bell(293.7, 6.0, 'eb', 1.0), g=-5)
    cue(mus, 'endcard', 'dholak (resolve)', ea + 0.02, dholak('dha', 'ed', 0.9), g=-5)
    cue(fol, 'endcard', 'snap (FOLLOW)', ea + 0.88, snap('ef', 0.7), g=-6)

    # ── AMBIENCE: night (crickets, air) for the indigo and violet scenes, the court's air for the rice paper, birds by day ──
    night = crickets(Dur, 'cr') * 0.5 + lpf(R_('nair').standard_normal(N), 600) * 0.6
    court = lpf(R_('cair').standard_normal(N), 450) * 0.8 + bpf(R_('cair2').standard_normal(N), 900, 2400) * 0.08
    day = birds(Dur, 'bd') * 0.5 + lpf(R_('dair').standard_normal(N), 700) * 0.5
    kinds = []
    cur = None
    for l in sc['lines']:
        if l.get('amb'): cur = l['amb']
        kinds.append((L[l['id']]['start'], cur))
    # each bed holds until 0.25 s after the next line starts (a short crossfade, never a gap)
    def curve_of(k):
        pts = []
        for i, (t0, kk) in enumerate(kinds):
            v = 1.0 if kk == k else 0.0
            pts.append((t0 + (0.0 if i == 0 else 0.25), v))
            nx = kinds[i + 1][0] if i + 1 < len(kinds) else Dur
            pts.append((nx, v))
        return S.env_curve(pts, N)
    a_ = night * curve_of('forest-night') + court * curve_of('court') + day * curve_of('forest-day')
    amb += np.stack([a_, np.roll(a_, smp(0.017))])

    hall = room(hall, '041_TrainStation_SouthStationBoston.wav', wet=0.35, extend=1.2)
    mus = room(mus + hall, '256_Stairwell.wav', wet=0.12)
    fol = room(fol, '256_Stairwell.wav', wet=0.08, hp=200)

    def lv(x, target):
        return x * db(target - lufs(x))
    stems = {'mus': lv(mus, -19.0), 'amb': lv(amb, -33.0), 'foley': lv(fol, -25.0)}
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    def soft_limit(x, ceil=db(-1.5)):   # never a clipped flat top (a clipped stem left inter-sample peaks the master then paid for in loudness)
        pk = np.abs(x).max(0); g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
        g = uniform_filter1d(minimum_filter1d(g, smp(0.012)), smp(0.006)); return x * g
    for k in stems:
        stems[k][:, :smp(0.003)] *= np.linspace(0, 1, smp(0.003))
        stems[k] = np.clip(soft_limit(stems[k]), -1, 1)
    meta = {'motif': 'Sa Pa komal-Dha Pa (D A B-flat A)', 'raga': 'D with komal Re and komal Dha', 'ghanta_at_s': round(oa - 0.1, 3),
            'unfold_at_s': round(sa + T_UN, 3), 'cues': len(log), 'irs': sorted(TZ._IR.keys())}
    return stems, log, meta
