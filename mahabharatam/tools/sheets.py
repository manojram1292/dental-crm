#!/usr/bin/env python3
"""Review sheets from a FINISHED mp4 (what was rendered, not a preview): tools/episode_loop.md, step 6.

    python3 -I tools/sheets.py --ep 50 [--mp4 episode50.mp4] [--lang en]

Writes into lab/review/epNN/:  post-pass-1.jpg … (the whole film every 0.25 s) · post-cuts-1.jpg … (for EVERY cut the last frame out
and the first frame in) · post-contact.jpg (three frames of every shot: 12 %, 50 %, 92 %). Open them and look.
"""
import json, os, subprocess, sys
import numpy as np
import imageio_ffmpeg
from PIL import Image, ImageDraw
FF = imageio_ffmpeg.get_ffmpeg_exe()
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ep = int(arg('--ep')); tag = f'ep{ep:02d}'; lang = arg('--lang', 'en')
mp4 = arg('--mp4', f'{ROOT}/episode{ep:02d}.mp4'); out = f'{ROOT}/lab/review/{tag}'; os.makedirs(out, exist_ok=True)
tl = json.load(open(f'{ROOT}/build/timeline.{tag}.{lang}.json')); L = tl['lines']; NF = int(round(tl['duration'] * 30))


def grab(frames, w):
    h = (w * 16 // 9) // 2 * 2; want = set(min(NF - 1, max(0, int(f))) for f in frames); res = {}; n = w * h * 3
    p = subprocess.Popen([FF, '-v', 'error', '-i', mp4, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    k = 0; last = None
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        if k in want: res[k] = Image.fromarray(np.frombuffer(b, np.uint8).reshape(h, w, 3))
        last = b; k += 1
    p.wait()
    for f in want:
        if f not in res and last is not None: res[f] = Image.fromarray(np.frombuffer(last, np.uint8).reshape(h, w, 3))
    return res, k


def sheet(items, name, cols, w=216):
    ims, n = grab([f for f, _ in items], w); h = (w * 16 // 9) // 2 * 2; rows = (len(items) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (w + 4), rows * (h + 18)), '#181818'); d = ImageDraw.Draw(sh)
    for k, (f, lab) in enumerate(items):
        f = min(NF - 1, max(0, int(f))); x, y = (k % cols) * (w + 4), (k // cols) * (h + 18); sh.paste(ims[f], (x, y + 16)); d.text((x + 3, y + 2), lab, fill='#e8e8e8')
    sh.save(f'{out}/{name}', quality=86); print(f'lab/review/{tag}/{name}', len(items), 'stills ·', n, 'frames decoded')


fr = lambda t: int(np.ceil(t * 30 - 1e-6))
line_at = lambda t: next((l['id'] for l in L if l['start'] <= t < l['end']), L[-1]['id'])
allf = [(fr(t), f'{t:.2f} {line_at(t)}') for t in np.arange(0, tl['duration'] - 0.04, 0.25)]
for i in range(0, len(allf), 48): sheet(allf[i:i + 48], f'post-pass-{i // 48 + 1}.jpg', 12)
cuts = []
for a, b in zip(L, L[1:]):
    c = int(round(b['start'] * 30)); cuts += [(c - 1, f"OUT {a['id']} f{c - 1}"), (c, f"IN {b['id']} {b['start']:.2f}s")]
for i in range(0, len(cuts), 24): sheet(cuts[i:i + 24], f'post-cuts-{i // 24 + 1}.jpg', 12)
sheet([(fr(l['start'] + q * (l['end'] - l['start'])), f"{l['id']} {l['start'] + q * (l['end'] - l['start']):.1f}s") for l in L for q in (0.12, 0.5, 0.92)], 'post-contact.jpg', 12, 200)
