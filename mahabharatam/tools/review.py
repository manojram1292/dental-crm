#!/usr/bin/env python3
"""The look-at-it-yourself sheets for a rendered episode (episodes 41 on), all cut from the mp4.

    python3 -I tools/review.py --ep 41 [--actions 0.8,28.5] [--out lab/review/ep41]

Writes into <out>/:
  contact-24.jpg        24 frames, evenly spread, each 360 px wide (a phone)
  first-half-second.jpg frames 0–15
  closeup.jpg           12 frames across the close-up line(s)
  loop.jpg              the last 8 frames and the first 4 (the Next dissolving into frame 1)
  transition-<id>.jpg   the first 0.9 s of every line that has a `tr` (every frame, 30 fps)
  action-<t>.jpg        0.4 s before to 0.8 s after each --actions time (every frame)
"""
import argparse, json, os, subprocess
import numpy as np
from PIL import Image, ImageDraw
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--ep', type=int, required=True); ap.add_argument('--actions', default=''); ap.add_argument('--out'); ap.add_argument('--mp4')
a = ap.parse_args(); tag = f'ep{a.ep:02d}'
out = os.path.join(ROOT, a.out or f'lab/review/{tag}'); os.makedirs(out, exist_ok=True)
mp4 = os.path.join(ROOT, a.mp4 or f'episode{a.ep:02d}.mp4')
TL = json.load(open(os.path.join(ROOT, 'build', f'timeline.{tag}.en.json'))); SC = json.load(open(os.path.join(ROOT, 'script', f'{tag}.en.json'))); SL = {l['id']: l for l in SC['lines']}
W, H = 360, 640
raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', mp4, '-vf', f'scale={W}:{H}', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3); N = len(F)

def sheet(name, idx, cols, w=W):
    idx = [min(N - 1, max(0, int(i))) for i in idx]; h = int(H * w / W); rows = (len(idx) + cols - 1) // cols
    im = Image.new('RGB', (cols * w, rows * (h + 16)), '#181818'); d = ImageDraw.Draw(im)
    for k, i in enumerate(idx):
        x, y = (k % cols) * w, (k // cols) * (h + 16); f = Image.fromarray(F[i]); im.paste(f if w == W else f.resize((w, h)), (x, y + 16)); d.text((x + 3, y + 2), f'f{i}  {i / 30:.2f}s', fill='#ddd')
    im.save(os.path.join(out, name), quality=88); print('wrote', os.path.relpath(os.path.join(out, name), ROOT), len(idx), 'frames')

sheet('contact-24.jpg', [(k + 0.5) / 24 * N for k in range(24)], 6)
sheet('first-half-second.jpg', range(0, 16), 8, 240)
cu = [l for l in TL['lines'] if SL[l['id']].get('closeup')]
if cu: sheet('closeup.jpg', [f for l in cu for f in np.linspace(l['start'] * 30 + 2, l['end'] * 30 - 2, 12 // len(cu) if len(cu) > 1 else 12)], 6, 300)
sheet('loop.jpg', list(range(N - 8, N)) + list(range(0, 4)), 12, 180)
for l in TL['lines']:
    if SL[l['id']].get('tr'): sheet(f"transition-{l['id']}.jpg", range(int(l['start'] * 30) - 2, int(l['start'] * 30) + 27), 10, 180)
for t in [float(x) for x in a.actions.split(',') if x]: sheet(f'action-{t:.2f}.jpg', range(int((t - 0.4) * 30), int((t + 0.8) * 30)), 12, 180)
# blank / near-white frames anywhere (a transition must never flash)
lum = F.reshape(N, -1, 3).mean(axis=(1, 2)); sd = F.reshape(N, -1).std(axis=1)
flat = [int(i) for i in np.where(sd < 6)[0]]; white = [int(i) for i in np.where(lum > 215)[0]]
print(f'frames {N} · flat frames (sd < 6): {flat[:12]} · near-white frames (mean > 215): {white[:12]} · brightest frame mean {lum.max():.0f} at f{int(lum.argmax())}')
