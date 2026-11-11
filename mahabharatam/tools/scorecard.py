#!/usr/bin/env python3
"""Measure an episode for QUALITY_SCORECARD.md (what can be measured, is; the rest is marked "eye").

    python3 -I tools/scorecard.py --ep 21 [--prev 3] [--json]

From the timeline (build/timeline.epNN.en.json) and the script:
  hook words / hook speech end (s) · story start (s: the first line after hook/recap) · turn position (%:
  the line whose note says "TURN") · words per second over the voiced lines · gaps between voiced lines
  (mean, sd, max: the "rest") · duration
From the rendered video (episodeNN-share.mp4, decoded at 10 fps, 135×240 grey):
  motion by 0.5 s (mean |frame(0.5 s) − frame(0)|, 0–255) · longest static hold (s: the longest run of
  frames whose 1 s change stays under the threshold) · repeated compositions: line-midpoint stills compared
  by a 16×16 difference hash against the previous --prev episodes (pairs at Hamming distance ≤ 30 of 240)
  · share size (MB)
Every AUDIO number is measured on the final mp4 (episodeNN.mp4), never on the timeline (correction of Nov 7, after the
independent review of eps 21–30): ebur128 integrated LUFS, true peak, LRA · silencedetect at −45 dB for ≥ 0.6 s (count,
longest) · the Next window's integrated loudness (ebur128 on [next.start, end]) against the body's ([0, next.start]).
REPEATS also compare the 0.5 s, 3 s and last frames of the episode with those of the previous --prev episodes by a 64-bit
perceptual hash (DCT pHash; a pair at Hamming ≤ 10 of 64 is a repeat), besides the line-midpoint dHash.
"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
ep = int(args[args.index('--ep') + 1])
prev = int(args[args.index('--prev') + 1]) if '--prev' in args else 3
tag = f'ep{ep:02d}'
import imageio_ffmpeg  # noqa: E402
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 135, 240, 10


def frames(path):
    p = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', f'fps={FPS},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W).astype(np.float32)


def dhash(img):
    # 16×16 difference hash on a 17×16 block mean
    h, w = img.shape
    ys, xs = np.linspace(0, h, 17).astype(int), np.linspace(0, w, 18).astype(int)
    m = np.array([[img[ys[i]:ys[i + 1], xs[j]:xs[j + 1]].mean() for j in range(17)] for i in range(16)])
    return (m[:, 1:] > m[:, :-1]).flatten()


def phash(img):
    # 64-bit DCT perceptual hash on a 32×32 block mean
    from scipy.fft import dctn
    h, w = img.shape
    ys, xs = np.linspace(0, h, 33).astype(int), np.linspace(0, w, 33).astype(int)
    m = np.array([[img[ys[i]:ys[i + 1], xs[j]:xs[j + 1]].mean() for j in range(32)] for i in range(32)])
    d = dctn(m, norm='ortho')[:8, :8].flatten()
    return d[1:] > np.median(d[1:])


def keyframes(F):
    return {'0.5s': F[min(len(F) - 1, 5)], '3s': F[min(len(F) - 1, 30)], 'last': F[-1]}


def ebur(path, ss=None, to=None):
    a = [FF, '-hide_banner', '-nostats']
    if ss is not None:
        a += ['-ss', str(ss)]
    if to is not None:
        a += ['-to', str(to)]
    r = subprocess.run(a + ['-i', path, '-vn', '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ, o = r[r.rfind('Summary'):], {}
    for ln in summ.splitlines():
        ln = ln.strip()
        if ln.startswith('I:'):
            o['I'] = float(ln.split()[1])
        elif ln.startswith('LRA:'):
            o['LRA'] = float(ln.split()[1])
        elif ln.startswith('Peak:'):
            o['TP'] = float(ln.split()[1])
    return o


def video_for(e):
    for f in (f'episode{e:02d}-share.mp4', f'episode{e:02d}.mp4'):
        if os.path.exists(os.path.join(ROOT, f)):
            return os.path.join(ROOT, f)
    return None


def mids(e):
    tl = json.load(open(os.path.join(ROOT, 'build', f'timeline.ep{e:02d}.en.json')))
    return [(l['id'], (l['start'] + l['end']) / 2) for l in tl['lines'] if l['id'] not in ('next', 'recap')]


tl = json.load(open(os.path.join(ROOT, 'build', f'timeline.{tag}.en.json')))
sc = json.load(open(os.path.join(ROOT, 'script', f'{tag}.en.json')))
SL = {l['id']: l for l in sc['lines']}
L = tl['lines']
out = {'ep': ep, 'duration': tl['duration']}
hook = L[0]
out['hook_words'] = len(SL[hook['id']]['text'].split())
out['hook_speech_end'] = round(hook['speechEnd'], 2)
story = next((l for l in L[1:] if l['id'] != 'recap'), L[1])
out['story_start'] = round(story['start'], 2)
turn = [l for l in L if 'TURN' in SL[l['id']].get('note', '')]
out['turn_pct'] = round(100 * turn[0]['start'] / tl['duration']) if turn else None
voiced = [l for l in L if l.get('voice')]
words = sum(len(SL[l['id']]['text'].split()) for l in voiced)
speech = sum(l['speechEnd'] - l['speechStart'] for l in voiced)
out['words_per_s'] = round(words / speech, 2)
gaps = [b['speechStart'] - a['speechEnd'] for a, b in zip(voiced, voiced[1:])]
out['gap_mean'], out['gap_sd'], out['gap_max'] = round(float(np.mean(gaps)), 2), round(float(np.std(gaps)), 2), round(max(gaps), 2)

v = video_for(ep)
if v:
    F = frames(v)
    out['motion_0_5'] = round(float(np.abs(F[5] - F[0]).mean()), 1)
    # static hold: frames whose change over 1 s (10 frames) is under 2.0 grey levels
    ch = np.array([np.abs(F[i] - F[max(0, i - FPS)]).mean() for i in range(len(F))])
    run, best, best_at = 0, 0, 0
    for i, c in enumerate(ch[FPS:], FPS):
        run = run + 1 if c < 2.0 else 0
        if run > best:
            best, best_at = run, i
    out['longest_static_s'] = round((best + FPS) / FPS, 1) if best else 0.0
    out['longest_static_at'] = round((best_at - best) / FPS, 1) if best else None
    # repeated compositions
    mine = [(i, dhash(F[min(len(F) - 1, int(t * FPS))])) for i, t in mids(ep)]
    reps = []
    for e in range(max(1, ep - prev), ep):
        pv = video_for(e)
        if not pv or not os.path.exists(os.path.join(ROOT, 'build', f'timeline.ep{e:02d}.en.json')):
            continue
        G = frames(pv)
        for j, t in mids(e):
            hj = dhash(G[min(len(G) - 1, int(t * FPS))])
            for i, hi in mine:
                d = int((hi != hj).sum())
                if d <= 30:
                    reps.append(f'{i}~ep{e}.{j}({d})')
    out['repeats'] = reps
    mp4 = os.path.join(ROOT, f'episode{ep:02d}.mp4') if os.path.exists(os.path.join(ROOT, f'episode{ep:02d}.mp4')) else v
    a = ebur(mp4)
    out['lufs'], out['true_peak'], out['lra'] = a.get('I'), a.get('TP'), a.get('LRA')
    sd = subprocess.run([FF, '-hide_banner', '-nostats', '-i', mp4, '-vn', '-af', 'silencedetect=noise=-45dB:d=0.6', '-f', 'null', '-'], capture_output=True, text=True).stderr
    sil = [float(x.split('silence_duration:')[1].split()[0]) for x in sd.splitlines() if 'silence_duration:' in x]
    out['silences_45db'] = len(sil)
    out['longest_silence'] = round(max(sil), 2) if sil else 0.0
    nx = next((l for l in L if l['id'] == 'next'), None)
    if nx:
        body, nxt = ebur(mp4, to=nx['start']), ebur(mp4, ss=nx['start'])
        out['next_vs_body_db'] = round(nxt['I'] - body['I'], 1) if 'I' in nxt and 'I' in body else None
    # repeats on the key frames (0.5 s, 3 s, last) by pHash
    kr, mk, dmin = [], {k: phash(f) for k, f in keyframes(F).items()}, 64
    same = []
    for e in range(max(1, ep - prev), ep):
        pv = video_for(e)
        if not pv:
            continue
        G = frames(pv)
        for k2, f2 in keyframes(G).items():
            h2 = phash(f2)
            for k1, h1 in mk.items():
                d = int((h1 != h2).sum())
                if k1 == k2:
                    dmin = min(dmin, d)
                    same.append(d)
                if d <= 10:
                    kr.append(f'{k1}~ep{e}.{k2}({d})')
    out['key_repeats'] = kr
    # FROM EPISODE 41: the colour script measured on the mp4: the dominant hue of every shot's midpoint frame (chroma-weighted
    # mean hue on a 54×96 RGB decode; a shot under 16 mean chroma is neutral) and the longest run of consecutive shots within
    # 30° (target ≤ 2); and the MEAN same-slot key-frame distance (target ≥ 32, with min ≥ 28: a 64-bit pHash of unrelated
    # frames averages 32, so the old 'min' alone sat at chance level, 22–28, however varied the episodes were).
    if ep >= 41:
        pr = subprocess.run([FF, '-v', 'error', '-i', v, '-vf', 'fps=10,scale=54:96', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True)
        C = np.frombuffer(pr.stdout, np.uint8).reshape(-1, 96, 54, 3).astype(np.float32)
        hues = []
        for _i, t in mids(ep):
            f = C[min(len(C) - 1, int(t * 10))].reshape(-1, 3)
            mx, mn = f.max(1), f.min(1)
            ch = mx - mn
            r, g, b = f[:, 0], f[:, 1], f[:, 2]
            h = np.where(mx == r, ((g - b) / np.maximum(ch, 1e-6)) % 6, np.where(mx == g, (b - r) / np.maximum(ch, 1e-6) + 2, (r - g) / np.maximum(ch, 1e-6) + 4)) * np.pi / 3
            w = np.where(ch < 8, 0, ch)
            sx, sy = float((np.cos(h) * w).sum()), float((np.sin(h) * w).sum())
            hues.append(None if ch.mean() < 16 or np.hypot(sx, sy) / max(w.sum(), 1e-6) < 0.25 else (np.degrees(np.arctan2(sy, sx)) + 360) % 360)
        run = best = 0
        first = None
        for hh in hues:
            gap = None if hh is None or first is None else min(abs(hh - first) % 360, 360 - abs(hh - first) % 360)
            if hh is not None and gap is not None and gap < 30:
                run += 1
            else:
                run, first = (1, hh) if hh is not None else (0, None)
            best = max(best, run)
        out['shot_hues'] = [None if x is None else int(round(x)) for x in hues]
        out['hue_run'] = best
    out['key_mean_dist'] = round(float(np.mean(same)), 1) if same else None
    out['key_min_dist'] = dmin   # the smallest pHash distance between same-slot key frames (0.5 s / 3 s / last) and the previous episodes: higher = more varied
    out['share_mb'] = round(os.path.getsize(os.path.join(ROOT, f'episode{ep:02d}-share.mp4')) / 1e6, 1) if os.path.exists(os.path.join(ROOT, f'episode{ep:02d}-share.mp4')) else None
print(json.dumps(out, ensure_ascii=False) if '--json' in args else '\n'.join(f'{k}: {v}' for k, v in out.items()))
