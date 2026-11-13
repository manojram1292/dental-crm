#!/usr/bin/env python3
"""
The trailer's score, THIRD CUT (script "kind": "trailer", "cut": 3). Called by tools/score.py. Same synth and the same
instruments as the second cut (tools/score_trailer.py: horn, clock, rising tone; nothing sampled, nothing copied).

What is different, and why (the owner heard the second cut "stick"):
  A BED THAT NEVER STOPS   a drone (two reeds and a tanpura), the rising tone and the place's air run from the first sample to the
                           last, at one level, and are cut only by the two deliberate stops. tools/mix.py ducks them 8 dB under
                           the voice with a fast release, so a breath between two words fills at once (the gate measures it).
  SOUND ON THE FIRST FRAME a drum and the conch at level on sample 0: no fade-in from silence.
  ONE ORDER                no spine cue and no inserts: the conch sounds once, before the armies; the universal form follows
                           the lowered bow; the war comes after it; the second stop is after the dog.
  THE CLOCK                60 a minute from the title, 72 from the cousins, 90 from the dice, 120 from the armies to the second
                           stop (through the universal form and the war).
  THE END                  one struck D on the cut to the end card; it rings under the card over the fire and the drone.
The cue sheet as laid is logged to audio/ep97/foley-cues.json.
"""
import numpy as np
from scipy import signal as sps

import score as S
from score import SR, SA, smp, tvec, rng, db, lpf, hpf, bpf, pan, add, fade, env_curve, make_ir, reverb, lufs, true_peak_db
from score_trailer import horn, clock_tick, boom, riser, shepard, MOTIF

FR = 1 / 30
BED_DB = -20.0   # RMS dBFS of the continuous bed in the music stem


def build(tl, sc):
    D = tl['duration']
    N = smp(D)
    key = 'trailer3'
    SL = {l['id']: l for l in sc['lines']}
    L = {l['id']: l for l in tl['lines']}
    st = lambda i: L[i]['start']
    en = lambda i: L[i]['end']
    wt = lambda i, k: L[i]['words'][min(k, len(L[i]['words']) - 1)]
    fceil = lambda x: np.ceil(x * 30 - 1e-6) / 30
    cut_in = lambda i: round((wt(i, SL[i]['cutAt'][0])['t0'] - 0.07) * 30) / 30   # the picture cut inside a sentence (scenes.js `multi`)
    amb, fol, mus_d, mus_w, bed = np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N)), np.zeros((2, N))
    log = []

    def cue(line, name, at, x, bus=None, p=0.0, asked=None):
        x2 = x if x.ndim == 2 else pan(x, p)
        m = np.abs(x2).max(axis=0)
        w = max(1, smp(0.008))
        e = np.convolve(m, np.ones(w) / w, mode='same')
        log.append({'line': line, 'cue': name, 'asked_s': round(at if asked is None else asked, 3), 'start_s': round(at, 3), 'onset_s': round(at + float(np.argmax(e > 0.25 * e.max())) / SR, 3),
                    'peak_s': round(at + float(np.argmax(e)) / SR, 3), 'peak_db': round(float(20 * np.log10(e.max() + 1e-9)), 1)})
        add(fol if bus is None else bus, x2, at)

    def drum(at, vel=0.8, bm=0.0, line='', name='drum', bus=None):
        x = S.mridangam('thom', (key, name, round(at, 2)), vel)
        if bm:
            b = boom(bm)
            x = np.concatenate([x, np.zeros(max(0, len(b) - len(x)))])
            x[:len(b)] += b
        cue(line, name, at, x, bus=bus)

    # ── the two stops (frame-exact) ──
    s1a, s1b = fceil(L['needle']['speechEnd'] + 0.04), st('armies') - 10 * FR   # the conch swells: begun 10 frames early it is heard about 6 before the cut
    s2a, s2b = fceil(L['dog']['speechEnd'] + 0.05), st('word')
    stops = [(s1a, s1b), (s2a, s2b)]
    in_stop = lambda t: any(a <= t < b for a, b in stops)

    # ── THE CLOCK (foley stem) ──
    seg = [(0.5, 60), (st('cousins'), 72), (st('dice1'), 90), (st('armies'), 120)]
    quiet = (st('dog'), en('dog'))
    t, k, ticks = 0.5, 0, []
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
        t = nxt[0] if nxt and t + step > nxt[0] + 1e-6 and nxt[0] - t > 0.3 * step else t + step
        k += 1

    # ── THE BED: never stops ── two reeds (Sa, Pa), a tanpura, the rising tone. One level; a little more from the turn to the second stop.
    dr = S.reed_drone(N, (SA / 2, SA * 0.75), (key, 'dr'))
    tp = S.tanpura_bed(N, D, (key, 'tb'))
    sh = shepard(N)
    lvl = env_curve([(0, 1.0), (st('vow'), 0.9), (st('dice1'), 1.0), (st('armies'), 1.15), (st('curse'), 1.0), (st('dog'), 0.8), (s2a, 0.8), (s2b, 0.85), (st('p1'), 0.95), (D, 1.0)], N)
    sh_env = env_curve([(0, 0.35), (st('dice1'), 0.5), (st('armies'), 0.8), (st('vish'), 1.0), (en('mud'), 1.0), (st('dog'), 0.5), (s2a, 0.5), (s2b, 0.0), (D, 0.0)], N)
    add(bed, np.stack([dr, np.roll(dr, 700)]) * 0.11 * lvl, 0)
    add(bed, tp * 0.5 * lvl, 0)
    add(amb, np.stack([sh * sh_env, np.roll(sh * sh_env, 601)]) * 0.5, 0)

    # ── place ambiences, each from its line; "ambLead" brings one in before its picture; 60 ms cross-fades, never a gap ──
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
        a, b = max(0, a - 0.03), min(D, b + 0.06)
        n = smp(b - a)
        if n < smp(0.3) or kind is None:
            continue
        x = S.amb_bed(kind, n, (key, 'amb', i)) * env_curve([(0, 0 if a > 0 else 1), (0.09, 1), (max(0.1, n / SR - 0.09), 1), (n / SR, 0 if b < D else 1)], n)
        lv = {'river': 0.9, 'hearth': 0.7, 'forest-night': 0.8, 'forest-day': 0.7, 'night-fire': 0.8, 'court': 0.9, 'storm': 0.6, 'sky': 0.6, 'void': 0.7, 'heaven': 0.6}.get(kind, 0.7)
        add(amb, x * lv * 0.3, a)

    # ── 0 · THE OPENING: a drum and the conch ON THE FIRST SAMPLE; the horn states the motif; a roll into the first cut ──
    for i, tt in enumerate((0.0, 1.0, 2.0, 3.0)):
        drum(tt, 1.0, 0.9 if i in (0, 2) else 0.5, 'title', 'war drum')
        if i:
            for g_, dv in ((-0.26, 0.4), (-0.13, 0.5)):
                add(fol, pan(S.mridangam('ta' if dv > 0.45 else 'ki', (key, 'gr', i, g_), dv), 0.2), tt + g_)
    c0 = S.conch((key, 'c0'), 233.08, 2.4, 0.9)
    c0 = c0 * np.maximum(np.minimum(1, tvec(len(c0)) / 0.004), 0)   # at level from the first sample (4 ms: no click)
    i_on = int(np.argmax(np.abs(c0) > 0.5 * np.abs(c0).max()))
    cue('title', 'conch (first frame)', 0.0, c0[max(0, i_on - smp(0.004)):] * 0.9, bus=mus_w, p=-0.15)
    add(mus_w, pan(horn([SA * r_ for r_ in MOTIF], [0.62, 0.62, 0.7, 1.0], (key, 'm0'), 1.0), 0.0), 0.9)
    add(mus_d, pan(horn([SA / 2 * r_ for r_ in MOTIF], [0.62, 0.62, 0.7, 1.0], (key, 'm0b'), 0.7), 0.0), 0.9)
    for i, tt in enumerate(np.cumsum([0.0] + [0.2 * 0.86 ** q for q in range(8)]) + st('vow') - 0.75):
        if tt < st('vow') - 0.05:
            add(fol, pan(S.mridangam('thom', (key, 'roll', i), 0.3 + 0.06 * i), -0.2 + 0.05 * i), tt)

    # ── THE STORY: a drum on each cut, the motif on veena and flute, things heard as they are seen ──
    drum(st('vow'), 0.8, 0.6, 'vow', 'cut drum')
    add(mus_w, pan(S.veena([SA * 2 * r_ for r_ in MOTIF], [0.42, 0.42, 0.46, 0.8], (key, 'm1'), 0.55), 0.15), st('vow') + 0.5)
    cue('vow', 'cloth', st('vow') + 0.08, S.foley_hit('cloth', (key, 'cl1'), 1) * 1.5)
    add(mus_w, pan(S.bansuri([SA * 3, SA * 3.2, SA * 3, SA * 2], [0.55, 0.5, 0.55, 1.1], (key, 'm2'), 0.6) * 0.7, -0.15), st('river') + 0.35)
    cue('river', 'splash', st('river') + 0.1, S.foley_hit('splash', (key, 'sp'), 1) * 0.6)
    drum(st('cousins'), 0.7, 0.4, 'cousins', 'cut drum')
    for j in (0, 1):
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

    # ── FROM THE DICE: the rattle before the hall; the motif low and unfinished; the drums come up ──
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
    sk = cut_in('stakes')
    add(mus_w, pan(horn([SA / 2, SA * 0.75, SA * 0.8], [en('dice1') - st('dice1'), sk - st('stakes'), en('cloth2') - sk], (key, 'm3'), 0.8, 0.8), 0.0), st('dice1') + 0.05)
    land = sk - 0.1
    drum(land, 1.0, 0.9, 'stakes', 'dice strike')
    cue('stakes', 'dice clack', land - 0.012, hpf(S.mridangam('ta', (key, 'dk'), 1.0), 500) * 1.2, asked=land)
    drum(sk, 0.5, 0.0, 'stakes', 'cut drum (inside the sentence)')
    if L['stakes']['beats']:
        cue('stakes', 'sweep', L['stakes']['beats'][0] - 0.1, S.foley_hit('cloth', (key, 'sw'), 1) * 1.6, asked=L['stakes']['beats'][0])
    drum(st('cloth1'), 0.8, 0.5, 'cloth1', 'cut drum')
    cue('cloth1', 'cloth', st('cloth1') + 0.2, S.foley_hit('cloth', (key, 'c1'), 1) * 2.2, p=0.3)
    cue('cloth1', 'cloth', st('cloth1') + 0.9, S.foley_hit('cloth', (key, 'c2'), 1) * 2.2, p=0.4)
    drum(st('cloth2'), 0.7, 0.4, 'cloth2', 'cut drum')
    cue('cloth2', 'cloth', st('cloth2') + 0.5, S.foley_hit('cloth', (key, 'c3'), 1) * 2.0, p=0.3)
    drum(st('exile'), 0.7, 0.3, 'exile', 'cut drum')
    cue('exile', 'steps', st('exile') + 0.05, S.foley_hit('steps', (key, 'stp'), en('exile') - st('exile')) * 1.2, p=-0.2)
    nk = cut_in('needle')
    drum(st('needle'), 0.9, 0.6, 'needle', 'cut drum')
    cue('needle', 'staff', st('needle') + 0.3, S.mridangam('ta', (key, 'st9'), 0.7), p=0.3)
    drum(nk, 1.0, 0.9, 'needle', 'cut drum (the close-up)')
    add(mus_w, pan(horn([SA * 0.5, SA * 0.5 * 16 / 15], [0.5, max(0.3, s1a - nk - 0.5)], (key, 'm3b'), 0.9, 0.9), 0.0), nk)

    # ── THE TURN: the conch before the armies; the bow; the universal form ──
    cue('armies', 'conch', s1b, S.conch((key, 'c13'), 233.08, 2.4, 1.6), bus=mus_w, asked=st('armies'))
    add(mus_w, pan(S.conch((key, 'c13b'), 174.6, 2.4, 1.0), 0.2), s1b + 0.03)
    drum(st('armies'), 1.0, 1.2, 'armies', 'cut drum')
    cue('armies', 'hooves', st('armies') + 0.4, S.foley_hit('hooves', (key, 'hv'), 1.6) * 0.35, p=-0.4)
    beat_s = 0.5
    drum(st('bow'), 0.8, 0.6, 'bow', 'cut drum')
    add(mus_w, pan(horn([SA * q for q in MOTIF], [beat_s] * 4, (key, 'm4', 'bow'), 0.75), 0.0), st('bow'))
    add(mus_d, pan(horn([SA / 2 * q for q in MOTIF], [beat_s] * 4, (key, 'm4b', 'bow'), 0.6), 0.0), st('bow'))
    cue('bow', 'bow falls', st('bow') + 0.62 * (en('bow') - st('bow')), S.mridangam('thom', (key, 'bf'), 0.7), p=0.2)
    v0, v1 = st('vish'), en('vish')
    sp2 = wt('vish', 4)['t0']
    drum(v0, 0.5, 0.6, 'vish', 'cut drum')
    cue('vish', 'breath', v0 + 0.12, S.foley_hit('breath', (key, 'br'), 1) * 2.0)
    rev = max(v0 + 0.7, sp2 - 0.85)   # the light floods here (scenes.js)
    rs2 = riser(max(0.5, rev - 0.05 - v0), (key, 'r1'), 1.5)
    add(amb, np.stack([rs2, np.roll(rs2, 333)]), v0 + 0.05)
    drum(rev, 1.0, 1.4, 'vish', 'the light')
    cue('vish', 'thunder', rev, S.foley_hit('thunder', (key, 'th2'), 3.0) * 1.0)
    tt, r_ = rev, 0
    while tt < v1 - 0.1:
        left = v1 - tt
        durs = [beat_s * 2] * 4 if left > 4 * beat_s * 2 else [left / 4] * 4
        for mult, vel_, br_, bus in ((1, 1.0, 1.0, mus_w), (0.5, 0.9, 1.0, mus_d), (2, 0.6, 1.3, mus_w), (1.5, 0.35, 1.0, mus_w)):
            add(bus, pan(horn([SA * mult * q for q in MOTIF], durs, (key, 'm7', r_, mult), vel_, br_), 0.0), tt)
        tt += sum(durs)
        r_ += 1
    for i, tb_ in enumerate(np.arange(rev + beat_s, v1 - 0.05, beat_s)):
        drum(tb_, 0.9 if i % 2 else 0.7, 0.9 if i % 2 else 0.3, 'vish', 'drum')
    add(mus_w, pan(S.conch((key, 'c21'), 233.08, 2.6, 1.2), -0.2), rev + 0.05)

    # ── THE WAR, in order: the arrows before their picture; the motif at full weight; a hit on every cut ──
    t0 = st('arrows')
    war_end = en('mud')
    for r_ in range(int(np.ceil((war_end - t0) / (4 * beat_s)))):
        tt = t0 + r_ * 4 * beat_s
        durs = [beat_s] * 4
        add(mus_w, pan(horn([SA * q for q in MOTIF], durs, (key, 'm4', r_), 1.0), 0.0), tt)
        add(mus_d, pan(horn([SA / 2 * q for q in MOTIF], durs, (key, 'm4b', r_), 0.8), 0.0), tt)
        add(mus_w, pan(horn([SA * 2 * q for q in MOTIF], durs, (key, 'm4c', r_), 0.45, 1.3), 0.1), tt)
    cue('arrows', 'arrows', st('arrows') - 9 * FR, S.foley_hit('whoosh', (key, 'ar'), 1) * 2.2, p=-0.4, asked=st('arrows'))
    aw = np.zeros(smp(0.9))
    for i in range(7):
        q = S.glide((key, 'ag', i), 2600 - 150 * i, 900, 0.22, 3.0)
        i0 = smp(0.09 * i)
        aw[i0:i0 + len(q)] += q[:len(aw) - i0]
    cue('arrows', 'arrow flights', st('arrows') - lead, aw, p=-0.3, asked=st('arrows'))
    for i_ in ('arrows', 'boy', 'mud'):
        drum(st(i_), 1.0, 1.0, i_, 'cut hit')
    cue('boy', 'hooves', st('boy') + 0.05, S.foley_hit('hooves', (key, 'hv2'), en('boy') - st('boy')) * 0.8, p=0.3)
    drop = en('mud') - 0.1
    cue('mud', 'creak', drop - 0.5, S.foley_hit('creak', (key, 'ck'), 1) * 3.0, p=0.2, asked=drop - 0.22)
    drum(drop, 1.0, 1.2, 'mud', 'the wheel drops')

    # ── the drums fall away: the curse on one low drum and a low horn; the dog on the clock, the wind and a flute ──
    drum(st('curse'), 1.0, 1.3, 'curse', 'cut hit')
    add(mus_w, pan(horn([SA / 2, SA / 2 * 16 / 15, SA / 2], [1.0, 1.0, max(0.4, en('curse') - st('curse') - 2.0)], (key, 'm5'), 0.7, 0.8), 0.0), st('curse') + 0.05)
    b0 = L['curse']['speechStart'] + 0.6 * (L['curse']['speechEnd'] - L['curse']['speechStart'])
    cue('curse', 'cloth', b0 - 0.5, S.foley_hit('cloth', (key, 'c9'), 1) * 1.8, p=-0.3, asked=b0 - 0.4)
    cue('dog', 'steps', st('dog') + 0.05, S.foley_hit('steps', (key, 'stp3'), 0.42 * (s2a - st('dog'))) * 0.9, p=0.1)
    add(mus_w, pan(S.bansuri([SA * 3, SA * 2.25, SA * 2], [1.1, 1.0, max(0.8, s2a - st('dog') - 2.6)], (key, 'm6'), 0.35) * 0.7, -0.1), st('dog') + 0.3)

    # ── THE WORD: out of the stop. The drone and embers; a wooden tap and a low drum on each of the three parts; a bell on "was" ──
    wl = L['word']
    bt = wl['beats']
    for j in (1, 2, 3):
        if j < len(bt):
            cue('word', 'staff', bt[j], S.mridangam('ta', (key, 'w', j), 0.5 + 0.1 * j), p=-0.3 + 0.3 * (j - 1), asked=bt[j])
            add(fol, pan(lpf(S.mridangam('thom', (key, 'wd', j), 0.5 + 0.1 * j), 400), 0.0), bt[j])
    wn = smp(en('word') - st('word'))
    add(amb, np.stack([S.crackle(wn, (key, 'wcr'), 9.0)] * 2) * 0.5, st('word'))
    was = wl['words'][-1]['t0']
    cue('word', 'bell', was, S.ghanta(SA * 3, 3.2, (key, 'wb'), 0.5), bus=mus_w, asked=was)
    add(mus_w, pan(S.ghanta(SA * 1.5, 3.0, (key, 'wb2'), 0.35), 0.0), was + 0.01)

    # ── THE PROMISE: a drum on each "Every"; the motif plucked, then sung ──
    pb = [st('p1') + 0.0] + list(L['p1']['beats'][:2])
    for j, tb_ in enumerate(pb):
        drum(tb_ if j else st('p1'), 0.8 + 0.1 * j, 0.6 + 0.2 * j, 'p1', 'drum on "Every"')
        cue('p1', 'staff', (tb_ if j else st('p1')) + 0.02, S.mridangam('din', (key, 'pd', j), 0.5), p=0.2)
    drum(st('first'), 0.8, 0.6, 'first', 'cut drum')
    add(mus_w, pan(S.veena([SA * 2 * q for q in MOTIF], [0.36, 0.36, 0.4, 0.9], (key, 'm8'), 0.8), 0.1), st('first') + 0.1)
    drum(st('nothing'), 0.7, 0.4, 'nothing', 'cut drum')
    add(mus_w, pan(S.bansuri([SA * 3, SA * 3.2, SA * 3, SA * 2.25], [0.5, 0.45, 0.5, 1.2], (key, 'm9'), 0.7) * 0.8, -0.15), st('nothing') + 0.15)
    # ── WHO MAKES THIS: the motif once more, low, unhurried; a leaf laid down on each beat ──
    drum(st('making'), 0.7, 0.4, 'making', 'cut drum')
    for j in range(7):
        tq = st('making') + 0.05 + j * 0.3
        if tq < en('making') - 0.1:
            cue('making', 'leaf', tq, hpf(S.foley_hit('cloth', (key, 'lf', j), 1), 600) * 0.9, p=-0.2 + 0.07 * j)
    add(mus_w, pan(S.veena([SA * q for q in MOTIF], [0.5, 0.5, 0.55, 1.0], (key, 'm10'), 0.7), -0.1), st('making') + 0.2)
    drum(st('support'), 0.7, 0.5, 'support', 'cut drum')
    add(mus_w, pan(horn([SA * 0.75, SA * 0.8, SA * 0.75], [0.9, 0.9, max(0.5, en('support') - st('support') - 2.0)], (key, 'm11'), 0.6, 0.8), 0.0), st('support') + 0.1)   # Pa, komal Dha, Pa: it wants its Sa
    e0 = st('endcard')
    for i, q in enumerate(np.cumsum([0.0] + [0.17 * 0.88 ** j for j in range(5)])):
        tt = e0 - 0.72 + q
        if tt < e0 - 0.04:
            add(fol, pan(S.mridangam('thom', (key, 'er', i), 0.3 + 0.1 * i), -0.15 + 0.06 * i), tt)

    # ── ONE STRUCK NOTE on the cut to the end card: a low D bell, its octave, a drum. It rings under the card. ──
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
    ring = max(1.2, D - e0 - 0.02)
    cue('endcard', 'the struck note (D)', e0, struck(SA, 0.9, ring, 1.5) + struck(SA / 2, 0.8, ring, 1.8), asked=e0, bus=mus_d)
    drum(e0 + 0.002, 1.0, 0.8, 'endcard', 'drum')
    add(amb, S.amb_bed('hearth', smp(D - e0), (key, 'ec')) * 0.3 * env_curve([(0, 0), (0.2, 1), (D - e0, 1)], smp(D - e0)), e0)

    # ── the buses → three stems (the bed is part of the music stem) ──
    mus = mus_d + reverb(mus_w, make_ir(3.0, 3.6, 'hall')) * 0.5 + mus_w * 0.35
    b_, a_ = sps.iirpeak(2600, 1.2, fs=SR)
    mus = mus - 0.25 * sps.lfilter(b_, a_, mus, axis=-1)
    fol = fol + reverb(fol, make_ir(1.1, 1.5, 'room2')) * 0.16
    mus, amb, fol = hpf(mus, 30), hpf(amb, 35), hpf(fol, 32)
    # THE STOPS: every stem to digital silence between two frames (2 ms ramps)
    gate = np.ones(N)
    rp = smp(0.002)
    for a, b in stops:
        i0, i1 = smp(a), smp(b)
        gate[i0:i1] = 0
        gate[max(0, i0 - rp):i0] = np.linspace(1, 0, min(rp, i0))
        gate[i1:i1 + rp] = np.linspace(0, 1, rp)[:max(0, min(rp, N - i1))]
    i1 = smp(s2b)
    up = smp(0.12)   # the word shot comes up out of the stop within four frames
    gate[i1:i1 + up] *= np.linspace(0, 1, up) ** 1.2
    edge = env_curve([(0, 1), (D - 0.03, 1), (D, 0)], N)   # sound from the first sample; the last 30 ms only are faded
    mus, amb, fol = mus * gate * edge, amb * gate * edge, fol * gate * edge
    mus *= db(-18.5 - lufs(mus))
    # THE BED at its own level (the cues above come and go; the bed must hold the floor by itself between two words): its
    # RMS is set, not its loudness, because the gate's measure is RMS. BED_DB was found by trial: at this level tools/mix.py's
    # lifter has almost nothing left to do.
    bed = hpf(bed, 30) * gate * edge
    live = gate > 0.5
    bed *= db(BED_DB) / np.sqrt(np.mean(bed[:, live] ** 2) + 1e-12)
    mus = mus + bed
    amb *= db(-28.0 - lufs(amb))
    fol *= db(-7.0) / np.abs(fol).max()
    tot = mus + amb + fol
    tpk = true_peak_db(tot)
    k = db(-2.3 - tpk) if tpk > -2.0 else 1.0
    stems = {'amb': amb * k, 'foley': fol * k, 'mus': mus * k}
    meta = {'stops': [[round(a, 4), round(b, 4)] for a, b in stops], 'clock': {'ticks': len(ticks), 'tempo_steps': [[round(a, 3), b] for a, b in seg], 'first': ticks[0][0], 'last': ticks[-1][0]},
            'motif': 'Sa Pa komal-Dha Pa (D A B-flat A); the last note of the film is Sa (D), struck', 'cut': 3,
            'cuts_inside_sentences': {'stakes': round(float(sk), 4), 'needle': round(float(nk), 4)}}
    return stems, log, meta
