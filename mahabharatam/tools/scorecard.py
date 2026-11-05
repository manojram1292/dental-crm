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
  · loudness (ebur128 integrated LUFS, true peak dBTP) · the Next card's loudness relative to the rest
  · share size (MB)
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
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', os.path.join(ROOT, f'episode{ep:02d}.mp4') if os.path.exists(os.path.join(ROOT, f'episode{ep:02d}.mp4')) else v, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = r[r.rfind('Summary'):]
    for ln in summ.splitlines():
        ln = ln.strip()
        if ln.startswith('I:'):
            out['lufs'] = float(ln.split()[1])
        if ln.startswith('Peak:'):
            out['true_peak'] = float(ln.split()[1])
    nx = next((l for l in L if l['id'] == 'next'), None)
    if nx:
        r2 = subprocess.run([FF, '-hide_banner', '-nostats', '-ss', str(nx['start'] + 0.3), '-i', v, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        r3 = subprocess.run([FF, '-hide_banner', '-nostats', '-t', str(nx['start']), '-i', v, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        mv = lambda s: float(s.split('mean_volume:')[1].split('dB')[0]) if 'mean_volume:' in s else None  # noqa: E731
        a, b = mv(r2), mv(r3)
        out['next_vs_body_db'] = round(a - b, 1) if a is not None and b is not None else None
    out['share_mb'] = round(os.path.getsize(os.path.join(ROOT, f'episode{ep:02d}-share.mp4')) / 1e6, 1) if os.path.exists(os.path.join(ROOT, f'episode{ep:02d}-share.mp4')) else None
print(json.dumps(out, ensure_ascii=False) if '--json' in args else '\n'.join(f'{k}: {v}' for k, v in out.items()))
