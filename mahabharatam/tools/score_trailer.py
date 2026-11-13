#!/usr/bin/env python3
"""
The trailer's own score (second cut; script "kind": "trailer" with "scoreStops": true). Called by tools/score.py, which
writes what build() returns as the three stems (amb.wav, foley.wav, mus.wav) and their sum. Same synth as every episode
(tools/score.py's instruments: no samples, nothing copied from any film or recording); a cue sheet of its own:

  THE CLOCK      a tick/tock with a soft drum under it, from 0.4 s to the second stop, never missing a beat while sound is on:
                 60 a minute through the opening and the first beats, 72 from the cousins, 90 from the dice, 120 from the turn.
                 It lives in the foley stem (ducked 2 dB under the voice), so it does not pump.
  THE RISE       an endlessly rising tone under it (six octaves of sines, fading in at the bottom and out at the top), in the
                 ambience stem, slowly louder to the second stop.
  THE MOTIF      four notes, Sa Pa komal-Dha Pa (D A B-flat A): the horn in the opening; a veena under the vow; a flute over
                 the river; low and unfinished (D A B-flat, held) through the dice hall; the horn again at full weight from the
                 turn through the war and the universal form; plucked once more under the promise; and ONE STRUCK D on the last
                 word (a bell and a drum that ring out by themselves: no pad is faded under them).
  SOUND LEADS    the dice rattle 6 frames before the hall, the conch 10 frames before the armies (it swells: heard about 6 before), the arrows
                 9 frames before the bed; place ambiences 6 frames before their pictures where the script says "ambLead".
  TWO STOPS      every stem is cut to digital silence on a frame: after "a needle-point of earth." until 6 frames before the
                 armies (the conch), and after "I am Time." until the word shot. tools/mix.py leaves these alone
                 ("scoreStops": the stops are in the stems; its own mute-before-the-turn would eat the conch).
The cue sheet as laid is logged to audio/ep97/foley-cues.json (tools/soundcheck.py reads it).
"""
import numpy as np
from scipy import signal as sps

import score as S
from score import SR, SA, smp, tvec, rng, db, lpf, hpf, bpf, pan, add, fade, env_curve, make_ir, reverb, lufs, true_peak_db

FR = 1 / 30
MOTIF = (1.0, 1.5, 1.6, 1.5)   # Sa Pa komal-Dha Pa


def horn(f0s, durs, key, vel=1.0, bright=1.0):
    """A war horn: one breath through several notes (the pitch slides between them), brassy, swelling on each."""
    n = smp(sum(durs) + 0.5)
    t = tvec(n)
    r = rng('horn', key)
    f = np.zeros(n)
    e = np.zeros(n)
    t0 = 0.0
    for k, (f0, d) in enumerate(zip(f0s, durs)):
        i0, i1 = smp(t0), min(n, smp(t0 + d))
        f[i0:i1] = f0
        tt = tvec(i1 - i0)
        e[i0:i1] = 0.72 + 0.28 * np.minimum(1, tt / 0.12) * np.exp(-tt / (d * 1.6))
        t0 += d
    f[smp(t0):] = f0s[-1]
    e[smp(t0):] = np.exp(-tvec(n - smp(t0)) / 0.18) * e[smp(t0) - 1]
    f = lpf(np.concatenate([np.full(2000, f0s[0] * 0.94), f]), 14.0, 1)[2000:]   # the slide into and between notes
    f = np.maximum(f, f0s[0] * 0.5)
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(1, t / 0.7)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(ph * h + r.uniform(0, 6)) / h ** (1.15 / bright) for h in range(1, 16))
    x = bpf(x, 90, 2400) + 0.5 * bpf(x, 700, 1500) + bpf(r.standard_normal(n), 500, 2500) * 0.05
    e *= np.minimum(1, t / 0.14)
    return fade(x * lpf(e, 30, 1) * vel * 0.2, 0.01, 0.1)


def clock_tick(k, vel=1.0):
    """tick (k even) / tock (k odd): a dry wooden click over a very short low knock."""
    n = smp(0.09)
    t = tvec(n)
    r = rng('clock', k % 2)
    f = 1500.0 if k % 2 == 0 else 1050.0
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + bpf(r.standard_normal(n), 1800, 6000) * np.exp(-t / 0.003) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.02) * 0.5
    return x * np.minimum(1, t / 0.0006) * vel


def boom(vel=1.0, dur=2.0, f=40.0):
    n = smp(dur)
    t = tvec(n)
    return np.sin(2 * np.pi * (f + 26 * np.exp(-t / 0.08)) * t) * np.exp(-t / (dur * 0.33)) * vel


def riser(dur, key, vel=1.0):
    """A swell of air rising in pitch (a breath drawn in before a cut)."""
    n = smp(dur)
    t = tvec(n)
    r = rng('riser', key)
    x = r.standard_normal(n)
    out = np.zeros(n)
    seg = smp(0.05)
    for i in range(0, n, seg):   # a band that climbs
        u = i / n
        lo = 200 * 2 ** (3.2 * u)
        j = min(n, i + seg * 2)
        w = np.hanning(j - i)
        out[i:j] += bpf(x[i:j], lo, lo * 2.2) * w
    return out * (t / dur) ** 2.2 * vel * 0.25


def shepard(n, t_off=0.0, octave_s=14.0):
    """The endlessly rising tone: 7 partials an octave apart, each climbing an octave every `octave_s` seconds and wrapping,
    weighted by a bell over log-frequency so none is heard to enter or leave."""
    t = tvec(n) + t_off
    out = np.zeros(n)
    K, f_lo = 7, 36.0
    for k in range(K):
        pos = (t / octave_s + k) % K                    # octaves above f_lo
        f = f_lo * 2 ** pos
        w = np.exp(-0.5 * ((pos - K / 2) / (K / 5.2)) ** 2)
        # the phase is the integral of f for an unwrapped partial; at a wrap the weight is ~0, so the jump is silent
        ph = 2 * np.pi * np.cumsum(f) / SR
        out += np.sin(ph + k) * w
    return lpf(out, 3200, 2) / K


def build(tl, sc):
    D = tl['duration']
    N = smp(D)
    key = 'trailer2'
    SL = {l['id']: l for l in sc['lines']}
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']
    en = lambda i: L[i]['end']
    wt = lambda i, k: L[i]['words'][min(k, len(L[i]['words']) - 1)]
    fceil = lambda x: np.ceil(x * 30 - 1e-6) / 30
    amb, fol, mus_d, mus_w = np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N))
    log = []

    def cue(line, name, at, x, bus=None, p=0.0, asked=None):
        """Lay a sound and log it: where it was asked for, where it starts, its audible onset and its peak."""
        x2 = x if x.ndim == 2 else pan(x, p)
        m = np.abs(x2).max(axis=0)
        w = max(1, smp(0.008))
        e = np.convolve(m, np.ones(w) / w, mode='same')
        log.append({'line': line, 'cue': name, 'asked_s': round(at if asked is None else asked, 3), 'start_s': round(at, 3), 'onset_s': round(at + float(np.argmax(e > 0.25 * e.max())) / SR, 3), 'peak_s': round(at + float(np.argmax(e)) / SR, 3), 'peak_db': round(20 * np.log10(max(e.max(), 1e-9)), 1)})
        add(fol if bus is None else bus, x2, at)

    def drum(at, vel=0.8, bm=0.0, line='', name='drum', bus=None):
        x = S.mridangam('thom', (key, name, round(at, 2)), vel)
        if bm:
            b = boom(bm)
            x = np.concatenate([x, np.zeros(max(0, len(b) - len(x)))])
            x[:len(b)] += b
        cue(line, name, at, x, bus=bus)

    # ── the two stops (frame-exact) ──
    s1a, s1b = fceil(L['needle2']['speechEnd'] + 0.04), st('armies') - 10 * FR   # the conch swells slowly: begun 10 frames early it is heard about 6 before the cut
    s2a, s2b = fceil(L['vish']['speechEnd'] + 0.05), st('word')
    stops = [(s1a, s1b), (s2a, s2b)]
    in_stop = lambda t: any(a <= t < b for a, b in stops)

    # ── THE CLOCK ──
    seg = [(0.4, 60), (st('cousins'), 72), (st('dice1'), 90), (st('armies'), 120)]
    quiet = (st('dog'), en('dog'))
    t, k, ticks = 0.4, 0, []
    while t < s2a - 0.02:
        bpm = [b for a, b in seg if t >= a - 1e-6][-1]
        nxt = [a for a, b in seg if a > t + 1e-6]
        if not in_stop(t):
            v = 0.5 if bpm < 120 else 0.62
            add(fol, pan(clock_tick(k, v), -0.12 if k % 2 == 0 else 0.12), t)
            if not (quiet[0] <= t < quiet[1]):
                add(fol, pan(lpf(S.mridangam('thom', (key, 'hb', k), 0.16 + 0.1 * (bpm >= 90) + 0.12 * (bpm >= 120)), 300), 0.0), t)
            ticks.append((round(t, 3), bpm))
        step = 60.0 / bpm
        if nxt and t + step > nxt[0] + 1e-6 and nxt[0] - t > 0.3 * step:
            t = nxt[0]          # a new tempo starts on its cut
        else:
            t += step
        k += 1

    # ── THE RISE ── (to the second stop)
    n2 = smp(s2a)
    sh = shepard(n2)
    sh_env = env_curve([(0, 0), (1.0, 0.25), (st('dice1'), 0.45), (st('armies'), 0.7), (st('curse'), 0.5), (st('vish'), 0.6), (s2a, 1.0)], n2)
    add(amb, np.stack([sh * sh_env, np.roll(sh * sh_env, 601)]) * 0.5, 0)

    # ── the drone: low Sa and Pa reeds to the second stop; thinner under the quiet shots ──
    dr = S.reed_drone(n2, (SA / 2, SA * 0.75), (key, 'dr'))
    dr_env = env_curve([(0, 0), (0.8, 0.7), (st('field'), 0.55), (st('vow'), 0.3), (st('cousins'), 0.45), (st('dice1'), 0.6), (st('exile'), 0.5), (st('needle1'), 0.75), (st('armies'), 0.9), (st('curse'), 0.5), (st('dog'), 0.22), (st('vish'), 0.3), (wt('vish', 6)['t0'], 1.0), (s2a, 1.0)], n2)
    add(mus_w, np.stack([dr, np.roll(dr, 700)]) * dr_env * 0.11, 0)

    # ── place ambiences (light), each from its line; "ambLead" brings one in before its picture ──
    segs = []
    cur = None
    for l in tl['lines']:
        a_ = SL[l['id']].get('amb', cur)
        if segs and a_ == segs[-1][0]:
            segs[-1][2] = l['end']
        else:
            segs.append([a_, l['start'] - SL[l['id']].get('ambLead', 0) / 1000, l['end'], l['id']])
        cur = a_
    for i, (kind, a, b, lid) in enumerate(segs):
        a, b = max(0, a), min(D, b + 0.05)
        n = smp(b - a)
        if n < smp(0.3) or kind is None:
            continue
        x = S.amb_bed(kind, n, (key, 'amb', i)) * env_curve([(0, 0), (0.12, 1), (max(0.12, n / SR - 0.1), 1), (n / SR, 0)], n)
        lv = {'river': 0.9, 'hearth': 0.7, 'forest-night': 0.8, 'forest-day': 0.7, 'night-fire': 0.8, 'court': 0.9, 'storm': 0.6, 'sky': 0.6, 'void': 0.7, 'heaven': 0.6}.get(kind, 0.7)
        add(amb, x * lv * 0.3, a)

    # ── 0 · THE OPENING: drums, the drone, the horn states the motif, the swell ──
    for i, tt in enumerate((0.36, 1.4, 2.4, 3.4)):
        drum(tt, 1.0, 0.9 if i in (0, 2) else 0.5, 'title', 'war drum')
        if i:
            for g_, dv in ((-0.26, 0.4), (-0.13, 0.5)):
                add(fol, pan(S.mridangam('ta' if dv > 0.45 else 'ki', (key, 'gr', i, g_), dv), 0.2), tt + g_)
    for i, tt in enumerate(np.cumsum([0.0] + [0.2 * 0.86 ** q for q in range(8)]) + 3.55):   # the roll into the cut
        if tt < st('field') - 0.05:
            add(fol, pan(S.mridangam('thom', (key, 'roll', i), 0.35 + 0.07 * i), -0.2 + 0.05 * i), tt)
    hn = horn([SA * r_ for r_ in MOTIF], [0.62, 0.62, 0.7, 1.0], (key, 'm0'), 1.0)
    add(mus_w, pan(hn, 0.0), 1.05)
    add(mus_d, pan(horn([SA / 2 * r_ for r_ in MOTIF], [0.62, 0.62, 0.7, 1.0], (key, 'm0b'), 0.7), 0.0), 1.05)
    cq = S.conch((key, 'c0'), 233.08, 2.2, 0.7)
    add(mus_w, pan(cq, -0.15), 0.5)
    rs = riser(1.9, (key, 'r0'), 1.0)
    add(amb, np.stack([rs, np.roll(rs, 333)]), st('field') - 1.9)

    # ── 1 · NOW: the cut lands on a drum; THE SPINE CUE (one low horn note) the first time ──
    def spine(at, vel, line):
        cue(line, 'spine horn', at, horn([SA * 0.75], [0.5], (key, 'sp', line), vel), bus=mus_w)
        add(fol, pan(lpf(S.mridangam('thom', (key, 'spd', line), 0.5 * vel), 260), 0.0), at)
    drum(st('field'), 1.0, 1.0, 'field', 'cut drum')
    spine(st('field') + 0.02, 0.8, 'field')
    cue('field', 'hooves', st('field') + 0.5, S.foley_hit('hooves', (key, 'hv'), 1.6) * 0.35, p=-0.4)

    # ── 2–8 · THE PAST: a drum on each cut (lighter), the motif on veena and flute, things heard as they are seen ──
    add(mus_w, pan(S.veena([SA * 2 * r_ for r_ in MOTIF], [0.42, 0.42, 0.46, 0.8], (key, 'm1'), 0.55), 0.15), st('vow') + 0.5)
    cue('vow', 'cloth', st('vow') + 0.08, S.foley_hit('cloth', (key, 'cl1'), 1) * 1.5)
    add(mus_w, pan(S.bansuri([SA * 3, SA * 3.2, SA * 3, SA * 2], [0.55, 0.5, 0.55, 1.1], (key, 'm2'), 0.6) * 0.7, -0.15), st('river') + 0.35)
    cue('river', 'splash', st('river') + 0.1, S.foley_hit('splash', (key, 'sp'), 1) * 0.6)
    for ins, v in (('insA', 0.8), ('insB', 0.9), ('insC', 1.0)):
        spine(st(ins), v, ins)
    drum(st('cousins'), 0.7, 0.4, 'cousins', 'cut drum')
    for j, bi in enumerate((0, 1)):
        if j < len(L['cousins']['beats']):
            cue('cousins', 'staff', L['cousins']['beats'][j], S.mridangam('ta', (key, 'st', j), 0.6), p=0.2, asked=L['cousins']['beats'][j])
    drum(st('lac'), 0.7, 0.3, 'lac', 'cut drum')
    cue('lac', 'flame', st('lac') + 0.03, S.foley_hit('flame', (key, 'fl'), 2.0) * 1.4)
    drum(st('demon'), 0.6, 0.0, 'demon', 'cut drum')
    cue('demon', 'growl', st('demon') + 0.25, S.foley_hit('growl', (key, 'gr'), 1) * 1.2, p=0.3)
    hitT = en('demon') - 0.1
    drum(hitT, 1.0, 1.0, 'demon', 'the blow')
    cue('demon', 'whoosh', hitT - 0.36, S.foley_hit('whoosh', (key, 'wh1'), 1) * 1.2)
    cue('altar', 'flame', st('altar') - 0.2, S.foley_hit('flame', (key, 'fl2'), 2.0) * 1.3, asked=st('altar'))
    cue('altar', 'anklet', st('altar') + 1.0, S.foley_hit('anklet', (key, 'an'), 1) * 1.0, p=0.2)
    add(mus_w, pan(S.ghanta(SA * 3, 3.0, (key, 'b7'), 0.12), 0.1), st('altar') + 0.3)
    th = min(L['wheel']['speechEnd'] - 0.25, en('wheel') - 1.5)
    drum(st('wheel'), 0.7, 0.3, 'wheel', 'cut drum')
    cue('wheel', 'whoosh', th - 0.1, S.foley_hit('whoosh', (key, 'wh2'), 1) * 1.6, p=0.4, asked=th + 0.2)
    cue('wheel', 'thunder', th + 0.42, S.foley_hit('thunder', (key, 'thn'), 3.0) * 0.7)

    # ── 9–12 · FROM THE DICE: the rattle before the hall; the motif low and unfinished; the drums come up ──
    lead = 6 * FR
    rat = np.zeros(smp(0.75))
    rr = rng(key, 'rattle')
    for i in range(16):
        q = S.mridangam('ki' if i % 2 else 'ta', (key, 'rt', i), 0.3 + 0.3 * rr.random())
        i0 = smp(0.045 * i + 0.012 * rr.random())
        m = min(len(q), len(rat) - i0)
        rat[i0:i0 + m] += hpf(q[:m], 700)
    cue('dice1', 'dice rattle', st('dice1') - lead, rat * 0.9, p=0.3, asked=st('dice1'))
    drum(st('dice1'), 0.8, 0.5, 'dice1', 'cut drum')
    add(mus_w, pan(horn([SA / 2, SA * 0.75, SA * 0.8], [en('dice1') - st('dice1'), en('dice2') - st('dice2'), en('cloth2') - st('dice3')], (key, 'm3'), 0.8, 0.8), 0.0), st('dice1') + 0.05)
    land = en('dice2') - 0.1
    drum(land, 1.0, 0.9, 'dice2', 'dice strike')
    cue('dice2', 'dice clack', land - 0.012, hpf(S.mridangam('ta', (key, 'dk'), 1.0), 500) * 1.2, asked=land)
    drum(st('dice3'), 0.5, 0.0, 'dice3', 'cut drum')
    if L['dice3']['beats']:
        cue('dice3', 'sweep', L['dice3']['beats'][0] - 0.1, S.foley_hit('cloth', (key, 'sw'), 1) * 1.6, asked=L['dice3']['beats'][0])
    drum(st('cloth1'), 0.8, 0.5, 'cloth1', 'cut drum')
    cue('cloth1', 'cloth', st('cloth1') + 0.2, S.foley_hit('cloth', (key, 'c1'), 1) * 2.2, p=0.3)
    cue('cloth1', 'cloth', st('cloth1') + 0.8, S.foley_hit('cloth', (key, 'c2'), 1) * 2.2, p=0.4)
    drum(st('cloth2'), 0.7, 0.4, 'cloth2', 'cut drum')
    cue('cloth2', 'cloth', st('cloth2') + 0.5, S.foley_hit('cloth', (key, 'c3'), 1) * 2.0, p=0.3)
    drum(st('exile'), 0.7, 0.3, 'exile', 'cut drum')
    cue('exile', 'steps', st('exile') + 0.05, S.foley_hit('steps', (key, 'stp'), en('exile') - st('exile')) * 1.2, p=-0.2)
    drum(st('needle1'), 0.9, 0.6, 'needle1', 'cut drum')
    cue('needle1', 'staff', st('needle1') + 0.3, S.mridangam('ta', (key, 'st9'), 0.7), p=0.3)
    drum(st('needle2'), 1.0, 0.9, 'needle2', 'cut drum')
    add(mus_w, pan(horn([SA * 0.5, SA * 0.5 * 16 / 15], [0.5, max(0.3, s1a - st('needle2') - 0.5)], (key, 'm3b'), 0.9, 0.9), 0.0), st('needle2'))

    # ── 13–18 · THE TURN AND WHAT WILL COME: the conch before the armies; the motif at full weight; a hit on every cut ──
    cue('armies', 'conch', s1b, S.conch((key, 'c13'), 233.08, 2.4, 1.6), bus=mus_w, asked=st('armies'))
    add(mus_w, pan(S.conch((key, 'c13b'), 174.6, 2.4, 1.0), 0.2), s1b + 0.03)
    drum(st('armies'), 1.0, 1.2, 'armies', 'cut drum')
    beat_s = 0.5
    t0 = st('bow')
    war_end = en('raid')
    reps = int(np.ceil((war_end - t0) / (4 * beat_s)))
    for r_ in range(reps):
        tt = t0 + r_ * 4 * beat_s
        durs = [beat_s] * 3 + [beat_s * 1.0]
        v = 0.75 if tt < st('arrows1') else 1.0
        add(mus_w, pan(horn([SA * q for q in MOTIF], durs, (key, 'm4', r_), v), 0.0), tt)
        add(mus_d, pan(horn([SA / 2 * q for q in MOTIF], durs, (key, 'm4b', r_), v * 0.8), 0.0), tt)
        if tt >= st('arrows1') - 0.01:
            add(mus_w, pan(horn([SA * 2 * q for q in MOTIF], durs, (key, 'm4c', r_), 0.45, 1.3), 0.1), tt)
    cue('bow', 'bow falls', st('bow') + 0.62 * (en('bow') - st('bow')), S.mridangam('thom', (key, 'bf'), 0.7), p=0.2)
    cue('arrows1', 'arrows', st('arrows1') - 9 * FR, S.foley_hit('whoosh', (key, 'ar'), 1) * 2.2 + 0, p=-0.4, asked=st('arrows1'))
    aw = np.zeros(smp(0.9))
    for i in range(7):
        q = S.glide((key, 'ag', i), 2600 - 150 * i, 900, 0.22, 3.0)
        i0 = smp(0.09 * i)
        aw[i0:i0 + len(q)] += q[:len(aw) - i0]
    cue('arrows1', 'arrow flights', st('arrows1') - lead, aw, p=-0.3, asked=st('arrows1'))
    for i_ in ('arrows1', 'arrows2', 'boy1', 'boy2', 'mud1', 'mud2', 'raid'):
        drum(st(i_), 1.0 if i_[-1] != '2' else 0.8, 1.0 if i_[-1] != '2' else 0.5, i_, 'cut hit')
    cue('boy1', 'hooves', st('boy1') + 0.05, S.foley_hit('hooves', (key, 'hv2'), en('boy2') - st('boy1')) * 0.8, p=0.3)
    drop = en('mud2') - 0.1
    cue('mud2', 'creak', drop - 0.5, S.foley_hit('creak', (key, 'ck'), 1) * 3.0, p=0.2, asked=drop - 0.22)
    drum(drop, 1.0, 1.2, 'mud2', 'the wheel drops')
    cue('raid', 'steps', st('raid') + 0.05, S.foley_hit('steps', (key, 'stp2'), en('raid') - st('raid')) * 1.4, p=-0.2)
    cue('raid', 'blade', st('raid') + 0.5, S.glide((key, 'bl'), 4200, 2600, 0.3, 2.0), p=0.3)

    # ── 19–20 · the drums fall away: the curse on one low drum to a bar; the dog on the clock and the wind alone ──
    drum(st('curse'), 1.0, 1.3, 'curse', 'cut hit')
    add(mus_w, pan(horn([SA / 2, SA / 2 * 16 / 15, SA / 2], [1.0, 1.0, max(0.4, en('curse') - st('curse') - 2.0)], (key, 'm5'), 0.7, 0.8), 0.0), st('curse') + 0.05)
    b0 = L['curse']['speechStart'] + 0.6 * (L['curse']['speechEnd'] - L['curse']['speechStart'])
    cue('curse', 'cloth', b0 - 0.5, S.foley_hit('cloth', (key, 'c9'), 1) * 1.8, p=-0.3, asked=b0 - 0.4)
    cue('dog', 'steps', st('dog') + 0.05, S.foley_hit('steps', (key, 'stp3'), 0.42 * (en('dog') - st('dog'))) * 0.9, p=0.1)
    add(mus_w, pan(S.bansuri([SA * 3], [max(1.2, en('dog') - st('dog') - 1.0)], (key, 'm6'), 0.35) * 0.6, -0.1), st('dog') + 0.4)

    # ── 21 · THE UNIVERSAL FORM: breath; the light comes up on a swell; the motif with everything; dead on a frame ──
    v0 = st('vish')
    sp2 = wt('vish', 6)['t0']
    drum(v0, 0.5, 0.6, 'vish', 'cut drum')
    cue('vish', 'breath', v0 + 0.15, S.foley_hit('breath', (key, 'br'), 1) * 2.0)
    rev = max(v0 + 0.9, sp2 - 1.0)   # the light floods here (scenes.js: the flash at sp2 − 1.0)
    rs2 = riser(max(0.6, rev - 0.1 - v0), (key, 'r1'), 1.5)
    add(amb, np.stack([rs2, np.roll(rs2, 333)]), v0 + 0.1)
    drum(rev, 1.0, 1.4, 'vish', 'the light')
    cue('vish', 'thunder', rev, S.foley_hit('thunder', (key, 'th2'), 3.0) * 1.0)
    tt, r_ = rev, 0
    while tt < s2a - 0.1:
        left = s2a - tt
        durs = [beat_s * 2] * 4 if left > 4 * beat_s * 2 else [left / 4] * 4
        for mult, vel_, br_, bus in ((1, 1.0, 1.0, mus_w), (0.5, 0.9, 1.0, mus_d), (2, 0.6, 1.3, mus_w), (1.5, 0.35, 1.0, mus_w)):
            add(bus, pan(horn([SA * mult * q for q in MOTIF], durs, (key, 'm7', r_, mult), vel_, br_), 0.0), tt)
        tt += sum(durs)
        r_ += 1
    for i, tb in enumerate(np.arange(rev + beat_s, s2a - 0.05, beat_s)):
        drum(tb, 0.9 if i % 2 else 0.7, 0.9 if i % 2 else 0.3, 'vish', 'drum')
    ch = S.conch((key, 'c21'), 233.08, 2.6, 1.2)
    add(mus_w, pan(ch, -0.2), rev + 0.05)

    # ── 22 · THE WORD: out of silence. Air and embers; a wooden tap on each of the three parts; one soft bell on "was" ──
    wl = L['word']
    bt = wl['beats']
    for j in (1, 2, 3):
        if j < len(bt):
            cue('word', 'staff', bt[j], S.mridangam('ta', (key, 'w', j), 0.5 + 0.1 * j), p=-0.3 + 0.3 * (j - 1), asked=bt[j])
    wn = smp(en('word') - st('word'))
    wb_ = S.tanpura_bed(wn, wn / SR, (key, 'wtb')) * 0.55 + np.stack([S.crackle(wn, (key, 'wcr'), 9.0)] * 2) * 0.5
    add(mus_d, wb_ * env_curve([(0, 0), (0.5, 1), (wn / SR - 0.05, 1), (wn / SR, 0.6)], wn), st('word'))   # a low string and embers: quiet, never silent
    was = wl['words'][-1]['t0']
    cue('word', 'bell', was, S.ghanta(SA * 3, 3.2, (key, 'wb'), 0.5), bus=mus_w, asked=was)
    add(mus_w, pan(S.ghanta(SA * 1.5, 3.0, (key, 'wb2'), 0.35), 0.0), was + 0.01)

    # ── 23–25 · THE PROMISE: three drums on three cuts; the motif plucked, then sung; a roll into the last word ──
    tb = S.tanpura_bed(smp(en('follow') - st('p1') + 0.3), en('follow') - st('p1') + 0.3, (key, 'tb')) * 0.5
    add(mus_d, tb * env_curve([(0, 0), (0.3, 1), (en('follow') - st('p1') - 0.05, 1), (en('follow') - st('p1') + 0.3, 0)], tb.shape[1]), st('p1'))
    for j, i_ in enumerate(('p1', 'p2', 'p3')):
        drum(st(i_), 0.8 + 0.1 * j, 0.6 + 0.2 * j, i_, 'cut drum')
        cue(i_, 'staff', st(i_) + 0.02, S.mridangam('din', (key, 'pd', j), 0.5), p=0.2)
    drum(st('first'), 0.8, 0.6, 'first', 'cut drum')
    add(mus_w, pan(S.veena([SA * 2 * q for q in MOTIF], [0.36, 0.36, 0.4, 0.9], (key, 'm8'), 0.8), 0.1), st('first') + 0.1)
    add(mus_w, pan(S.bansuri([SA * 3, SA * 3.2, SA * 3, SA * 2.25], [0.5, 0.45, 0.5, 1.2], (key, 'm9'), 0.7) * 0.8, -0.15), st('first') + 0.9)
    drum(st('follow'), 0.7, 0.4, 'follow', 'cut drum')
    fw = wt('follow', 4)['t0']
    cue('follow', 'drum', fw, S.mridangam('thom', (key, 'fw'), 0.9), asked=fw)
    e0 = st('endcard')
    for i, q in enumerate(np.cumsum([0.0] + [0.17 * 0.88 ** j for j in range(5)])):
        tt = e0 - 0.72 + q
        if tt < e0 - 0.04:
            add(fol, pan(S.mridangam('thom', (key, 'er', i), 0.3 + 0.1 * i), -0.15 + 0.06 * i), tt)
    # ── 26 · ONE STRUCK NOTE on the last word: a low D bell, its octave, a drum. They ring out by themselves. ──
    def struck(f, vel, dur, tau):
        n = smp(dur)
        t_ = tvec(n)
        r = rng(key, 'struck', f)
        x = np.zeros(n)
        for ratio, a_, tk in ((1.0, 1.0, 1.0), (2.0, 0.5, 0.7), (2.76, 0.3, 0.45), (4.07, 0.22, 0.3), (5.2, 0.12, 0.2)):
            for d_ in (-1, 1):
                x += 0.5 * a_ * np.sin(2 * np.pi * (f * ratio + d_ * 0.5) * t_ + r.uniform(0, 6)) * np.exp(-t_ / (tau * tk))
        x += hpf(r.standard_normal(n), 2500) * np.exp(-t_ / 0.004) * 0.3
        return x * np.minimum(1, t_ / 0.001) * vel
    ring = max(1.2, D - e0 - 0.05)
    cue('endcard', 'the struck note (D)', e0, struck(SA, 0.9, ring, 0.5) + struck(SA / 2, 0.8, ring, 0.55), asked=e0)
    drum(e0 + 0.002, 1.0, 0.8, 'endcard', 'drum')
    add(amb, S.amb_bed('hearth', smp(D - e0), (key, 'ec')) * 0.2 * env_curve([(0, 0), (0.2, 1), (D - e0 - 0.3, 1), (D - e0, 0.6)], smp(D - e0)), e0)

    # ── the buses → three stems ──
    mus = mus_d + reverb(mus_w, make_ir(3.0, 3.6, 'hall')) * 0.5 + mus_w * 0.35
    b_, a_ = sps.iirpeak(2600, 1.2, fs=SR)
    mus = mus - 0.25 * sps.lfilter(b_, a_, mus, axis=-1)
    fol = fol + reverb(fol, make_ir(1.1, 1.5, 'room2')) * 0.16
    mus, amb, fol = hpf(mus, 30), hpf(amb, 35), hpf(fol, 32)
    # THE STOPS: every stem to digital silence between two frames (2 ms ramps: no click, nothing left of a reverb tail)
    gate = np.ones(N)
    rp = smp(0.002)
    for a, b in stops:
        i0, i1 = smp(a), smp(b)
        gate[i0:i1] = 0
        gate[max(0, i0 - rp):i0] = np.linspace(1, 0, min(rp, i0))
        gate[i1:i1 + rp] = np.linspace(0, 1, rp)[:max(0, min(rp, N - i1))]
    # the word shot comes up out of the stop gently (the voice is near a whisper there)
    i1 = smp(s2b)
    up = smp(0.5)
    gate[i1:i1 + up] *= np.linspace(0, 1, up) ** 1.5
    edge = env_curve([(0, 0), (0.03, 1), (D - 0.06, 1), (D, 0)], N)   # the last 60 ms only: the struck note has rung out by then
    mus, amb, fol = mus * gate * edge, amb * gate * edge, fol * gate * edge
    # balance (louder than an episode's bed: this is a trailer): music −18.5, ambience −28 LUFS, the foley by its peaks (−7 dBFS)
    mus *= db(-18.5 - lufs(mus))
    amb *= db(-28.0 - lufs(amb))
    fol *= db(-7.0) / np.abs(fol).max()
    tot = mus + amb + fol
    tp = true_peak_db(tot)
    k = db(-2.3 - tp) if tp > -2.0 else 1.0
    stems = {'amb': amb * k, 'foley': fol * k, 'mus': mus * k}
    meta = {'stops': [[round(a, 4), round(b, 4)] for a, b in stops], 'clock': {'ticks': len(ticks), 'tempo_steps': [[round(a, 3), b] for a, b in seg], 'first': ticks[0][0], 'last': ticks[-1][0]},
            'motif': 'Sa Pa komal-Dha Pa (D A B-flat A); the last note of the film is Sa (D), struck', 'leads_frames': 6}
    return stems, log, meta
