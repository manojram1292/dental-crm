"""Trailer v3 · review sheets from the finished mp4 (what was rendered, not a preview).
    python3 -I lab/review/trailer/v3/sheets.py trailer.mp4 [--timeline build/timeline.ep97.en.json] [--out lab/review/trailer]
Writes: v2-contact.jpg (three frames of every shot: 12 %, 50 %, 92 %), v2-open-0-6s.jpg, v2-vishvarupa.jpg and v2-dog-to-end.jpg
(a frame every 0.25 s), v2-cuts-1.jpg … (for EVERY shot change: the last frame out and the first frame in, side by side)."""
import json, os, subprocess, sys
import numpy as np
import imageio_ffmpeg
from PIL import Image, ImageDraw
FF = imageio_ffmpeg.get_ffmpeg_exe()
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
mp4 = sys.argv[1]; ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
tl = json.load(open(arg('--timeline', f'{ROOT}/build/timeline.ep97.en.json'))); out = arg('--out', f'{ROOT}/lab/review/trailer'); L = tl['lines']; NF = int(round(tl['duration'] * 30))


def grab(frames, w=270):
    """Decode the film once at width w and keep the wanted frames (exact frame numbers)."""
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
        if f not in res and last is not None: res[f] = Image.fromarray(np.frombuffer(last, np.uint8).reshape(h, w, 3))   # a file one frame short of the timeline
    return res


def sheet(items, name, cols, w=270):
    """items: [(frame, label)]"""
    ims = grab([f for f, _ in items], w); h = (w * 16 // 9) // 2 * 2; rows = (len(items) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (w + 4), rows * (h + 18)), '#181818'); d = ImageDraw.Draw(sh)
    for k, (f, lab) in enumerate(items):
        f = min(NF - 1, max(0, int(f))); x, y = (k % cols) * (w + 4), (k // cols) * (h + 18); sh.paste(ims[f], (x, y + 16)); d.text((x + 3, y + 2), lab, fill='#e8e8e8')
    sh.save(f'{out}/{name}', quality=88); print(name, sh.size, len(items))


fr = lambda t: int(np.ceil(t * 30 - 1e-6))   # the first frame at or after t
sheet([(fr(l['start'] + q * (l['end'] - l['start'])), f"{l['id']} {l['start'] + q * (l['end'] - l['start']):.2f}s") for l in L for q in (0.12, 0.5, 0.92)], 'v3-contact.jpg', 12, 200)
dense = lambda a, b: [(fr(t), f'{t:.2f}s') for t in np.arange(a, b + 1e-6, 0.25)]
sheet(dense(0, 6), 'v3-open-0-6s.jpg', 9, 240)
v = next(l for l in L if l['id'] == 'vish'); sheet(dense(v['start'] - 0.25, v['end'] + 0.25), 'v3-vishvarupa.jpg', 9, 240)
dg = next(l for l in L if l['id'] == 'dog'); sheet(dense(dg['start'], tl['duration'] - 0.04), 'v3-dog-to-end.jpg', 12, 200)
cuts = []
for a, b in zip(L, L[1:]):
    c = fr(b['start']); cuts += [(c - 1, f"OUT {a['id']} f{c - 1}"), (c, f"IN {b['id']} f{c} {b['start']:.2f}s")]
SCL = {l['id']: l for l in json.load(open(f'{ROOT}/script/trailer.en.json'))['lines']}
for l in L:   # the cuts inside sentences
    for k in SCL[l['id']].get('cutAt', []):
        c = int(round((l['words'][k]['t0'] - 0.07) * 30)); cuts += [(c - 1, f"OUT {l['id']}[1] f{c - 1}"), (c, f"IN {l['id']}[2] f{c} {c / 30:.2f}s")]
# THE WHOLE FILM at 0.25 s steps (the first-time-viewer pass): v3-pass-1.jpg …
allf = dense(0, tl['duration'] - 0.04)
for i in range(0, len(allf), 60):
    sheet(allf[i:i + 60], f'v3-pass-{i // 60 + 1}.jpg', 12, 216)
for i in range(0, len(cuts), 24):
    sheet(cuts[i:i + 24], f'v3-cuts-{i // 24 + 1}.jpg', 8, 240)
