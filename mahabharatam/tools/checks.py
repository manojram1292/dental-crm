"""(From the trailer; used for every "rules": 2 episode, tools/episode_loop.md step 6.) the "stuck" checks, on a finished mp4.   python3 -I tools/checks.py FILE.mp4 [--timeline build/timeline.ep97.en.json] [--against MASTER.mp4]

  1 freezes      ffmpeg freezedetect, n=0.003, d=0.3 (and d=0.4)
  2 low motion   mean |frame − previous frame| at 135×240 grey under 0.35 levels for longer than 0.8 s; and exact repeats (a
                 difference of 0: a stutter)
  3 dead air     in the mp4's sound: stretches under −45 dBFS (50 ms RMS) longer than 0.3 s. With --timeline: per voice file,
                 the longest pause inside it (> 0.45 s is listed), a silent head (> 0.10 s) or tail (> 0.15 s); and gaps
                 between one shot's last word and the next shot's first word over 0.6 s.
  4 with --against MASTER: SSIM of every frame against the master (blocking in a share encode): the mean, the worst frame,
                 and every run of frames under 0.90.
Prints one JSON object (--out FILE also writes it)."""
import json, os, re, subprocess, sys
import numpy as np
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
f = sys.argv[1]
arg = lambda k: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else None
out = {'file': os.path.basename(f)}
for d in (0.3, 0.4):
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', f, '-vf', f'freezedetect=n=0.003:d={d}', '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
    out[f'freezes_d{d}'] = [[round(float(a), 2), round(float(b), 2)] for a, b in zip(re.findall(r'freeze_start: ([\d.]+)', r), re.findall(r'freeze_duration: ([\d.]+)', r))]
W, H = 135, 240
raw = subprocess.run([FF, '-v', 'error', '-i', f, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32); dif = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2))


def runs(mask, min_s, fps=30):
    o = []; i = 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j < len(mask) and mask[j]: j += 1
            if (j - i) / fps > min_s: o.append([round(i / fps, 2), round((j - i) / fps, 2)])
            i = j
        else: i += 1
    return o


out['frames'] = int(len(F)); out['seconds'] = round(len(F) / 30, 2)
out['low_motion'] = runs(dif < 0.35, 0.8); out['exact_repeats'] = int((dif == 0).sum()); out['median_frame_difference'] = round(float(np.median(dif)), 2); out['least_moving_second'] = [round(float(np.argmin(np.convolve(dif, np.ones(30) / 30, 'valid'))) / 30, 2), round(float(np.convolve(dif, np.ones(30) / 30, 'valid').min()), 2)]
# sound
pcm = subprocess.run([FF, '-v', 'error', '-i', f, '-vn', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
a = np.frombuffer(pcm, np.float32)
if len(a):
    w = 2400; e = np.sqrt(np.convolve(a.astype(np.float64) ** 2, np.ones(w) / w, 'same')); q = 20 * np.log10(e + 1e-9) < -45
    out['dead_air_under_-45dB_over_0.3s'] = runs(q[::160], 0.3, 300)
tlp = arg('--timeline')
if tlp:
    import soundfile as sf
    tl = json.load(open(tlp)); root = os.path.dirname(os.path.dirname(os.path.abspath(tlp))); L = [l for l in tl['lines'] if l.get('voice')]
    out['speech_gaps_over_0.6s'] = [[L[i]['id'], L[i + 1]['id'], round(L[i + 1]['speechStart'] - L[i]['speechEnd'], 2)] for i in range(len(L) - 1) if L[i + 1]['speechStart'] - L[i]['speechEnd'] > 0.6]
    inner = []
    for l in L:
        x, sr = sf.read(os.path.join(root, l['voice']), dtype='float32'); w = int(0.02 * sr); e = np.sqrt(np.convolve(x.astype(np.float64) ** 2, np.ones(w) / w, 'same')); act = e > 0.035 * e.max(); nz = np.nonzero(act)[0]
        head, tail = nz[0] / sr, (len(x) - nz[-1]) / sr; worst = run = 0
        for b in ~act[nz[0]:nz[-1]]: run = run + 1 if b else 0; worst = max(worst, run)
        if worst / sr > 0.45 or tail > 0.15 or head > 0.1: inner.append({'line': l['id'], 'longest_pause': round(worst / sr, 2), 'head': round(head, 2), 'tail': round(tail, 2)})
    out['voice_files_with_pause_over_0.45_or_head_over_0.10_or_tail_over_0.15'] = inner
ag = arg('--against')
if ag:
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', f, '-i', ag, '-lavfi', '[0:v][1:v]ssim=stats_file=-', '-an', '-f', 'null', '-'], capture_output=True, text=True)
    al = [float(m) for m in re.findall(r'All:([\d.]+)', r.stdout)]
    if al:
        al = np.array(al); out['ssim_vs_master'] = {'mean': round(float(al.mean()), 4), 'worst': round(float(al.min()), 4), 'worst_at_s': round(float(al.argmin()) / 30, 2), 'runs_under_0.90': runs(al < 0.90, 0.0)[:20], 'frames_under_0.90': int((al < 0.90).sum())}
print(json.dumps(out, indent=1))
if arg('--out'): json.dump(out, open(arg('--out'), 'w'), indent=1)
