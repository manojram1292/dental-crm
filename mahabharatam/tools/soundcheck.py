#!/usr/bin/env python3
"""Sound check by measurement (episodes 41 on: nobody listens before release, so the mix is measured).

    python3 -I tools/soundcheck.py --ep 41 [--mp4 episode41.mp4] [--out audio/ep41/soundcheck]

Writes <out>.json and <out>-spectrogram.png and prints a summary:
  * per-stem level (RMS dBFS over the whole episode and where each stem is loudest)
  * every foley cue: when it was asked for (the line's start, or the beat it names), when the foley stem actually rises
    there (onset), and, with --mp4, when the picture changes most near it (the frame with the largest difference from
    the one before, within ± 0.3 s); offsets in frames at 30 fps
  * ambience: the stem's level and spectral centroid on each line, grouped by the ambience named in the script
    (two places must not measure the same)
  * clipping (samples at full scale) and the peak
  * the spectrogram of the mix, with the share of energy above 6 kHz (harshness) and the seconds under -50 dBFS (emptiness)
"""
import argparse, json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--ep', type=int, required=True); ap.add_argument('--lang', default='en'); ap.add_argument('--mp4'); ap.add_argument('--out')
a = ap.parse_args()
tag = f'ep{a.ep:02d}'; AD = os.path.join(ROOT, 'audio', tag)
out = a.out or os.path.join(AD, 'soundcheck')
TL = json.load(open(os.path.join(ROOT, 'build', f'timeline.{tag}.{a.lang}.json')))
SC = json.load(open(os.path.join(ROOT, 'script', f'{tag}.{a.lang}.json'))); SL = {l['id']: l for l in SC['lines']}
db = lambda x: 20 * np.log10(max(float(x), 1e-9))
def load(name):
    x, sr = sf.read(os.path.join(AD, name), always_2d=True); return x.mean(axis=1), sr
stems = {k: load(k + '.wav') for k in ('amb', 'foley', 'mus')}
mix, sr = load(f'mix.{a.lang}.wav'); D = len(mix) / sr
rep = {'episode': a.ep, 'duration': round(D, 2), 'stems': {}, 'foley': [], 'ambience': [], 'mix': {}}

def env(x, win=0.01):
    n = max(1, int(sr * win)); c = np.concatenate([[0.0], np.cumsum(x * x)]); h = n // 2; i = np.arange(len(x)); lo = np.clip(i - h, 0, len(x)); hi = np.clip(i - h + n, 0, len(x)); return np.sqrt(np.maximum(c[hi] - c[lo], 0) / n)

# 1 · stems
for k, (x, _) in stems.items():
    e = env(x, 0.4); i = int(np.argmax(e)); rep['stems'][k] = {'rms_db': round(db(np.sqrt(np.mean(x * x))), 1), 'peak_db': round(db(np.max(np.abs(x))), 1), 'loudest_at_s': round(i / sr, 2), 'loudest_rms_db': round(db(e[i]), 1)}

# 2 · foley cues against the stem, and against the picture
frames = None
if a.mp4:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe(); W, H = 90, 160
    raw = subprocess.run([FF, '-v', 'error', '-i', a.mp4 if os.path.isabs(a.mp4) else os.path.join(ROOT, a.mp4), '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W)[:, :118, :].astype(np.float32)   # the picture above the caption band
    fd = np.concatenate([[0], np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))])
fx, _ = stems['foley']; fe = env(fx, 0.008)
for l in TL['lines']:
    s = SL[l['id']]
    for cue in s.get('foley', []):
        kind, _, b = cue.partition('@')
        at = (l['beats'][int(b)] if int(b) < len(l['beats']) else l['start'] + 0.1) if b else l['start'] + 0.08
        i0, i1 = int(max(0, at - 0.12) * sr), int(min(D, at + 0.6) * sr); seg = fe[i0:i1]
        row = {'line': l['id'], 'cue': cue, 'asked_s': round(at, 3)}
        if len(seg) and seg.max() > 1e-5:
            base = np.median(fe[int(max(0, at - 0.5) * sr):i0 + 1]) if i0 > 0 else 0
            thr = base + 0.25 * (seg.max() - base); on = i0 + int(np.argmax(seg > thr))
            j0, j1 = int(max(0, at - 0.15) * sr), int(min(D, at + 0.3) * sr); pk = j0 + int(np.argmax(fe[j0:j1]))   # a swelling sound (whoosh, growl, cloth) is placed by its peak
            row.update(onset_s=round(on / sr, 3), audio_offset_frames=round((on / sr - at) * 30, 1), peak_offset_frames=round((pk / sr - at) * 30, 1), peak_db=round(db(seg.max()), 1))
        else: row.update(onset_s=None, audio_offset_frames=None, peak_db=None)
        if frames is not None:
            f0, f1 = max(1, int(round((at - 0.3) * 30))), min(len(fd) - 1, int(round((at + 0.3) * 30)))
            if f1 > f0:
                j = f0 + int(np.argmax(fd[f0:f1 + 1])); near = fd[max(1, int(round(at * 30)) - 2):int(round(at * 30)) + 3]
                row.update(picture_peak_s=round(j / 30, 3), picture_offset_frames=int(j - round(at * 30)), picture_change_at_cue=round(float(near.max()), 2), picture_change_median=round(float(np.median(fd[1:])), 2))
        rep['foley'].append(row)

# 3 · ambience by place
ax, _ = stems['amb']; cur = None
for l in TL['lines']:
    cur = SL[l['id']].get('amb', cur); seg = ax[int(l['start'] * sr):int(l['end'] * sr)]
    if len(seg) < sr // 4: continue
    f, p = signal.welch(seg, sr, nperseg=4096); cen = float((f * p).sum() / max(p.sum(), 1e-20))
    rep['ambience'].append({'line': l['id'], 'amb': cur, 'rms_db': round(db(np.sqrt(np.mean(seg * seg))), 1), 'centroid_hz': round(cen)})
by = {}
for r in rep['ambience']: by.setdefault(r['amb'], []).append(r['centroid_hz'])
rep['ambience_places'] = {k: {'lines': len(v), 'centroid_hz': round(float(np.mean(v)))} for k, v in by.items()}

# 4 · the mix: clipping, emptiness, harshness, spectrogram
full, _ = sf.read(os.path.join(AD, f'mix.{a.lang}.wav'), always_2d=True)
e = env(mix, 0.1); quiet = float((e < 10 ** (-50 / 20)).sum() / sr)
f, t, S = signal.spectrogram(mix, sr, nperseg=2048, noverlap=1536); P = S.sum(axis=1); tot = P.sum()
band = lambda lo, hi: round(100 * float(P[(f >= lo) & (f < hi)].sum() / tot), 2)
rep['mix'] = {'peak_db': round(db(np.max(np.abs(full))), 2), 'samples_at_full_scale': int((np.abs(full) >= 0.999).sum()), 'seconds_under_-50dB': round(quiet, 2),
              'energy_pct': {'under_120': band(0, 120), '120_500': band(120, 500), '500_2k': band(500, 2000), '2k_6k': band(2000, 6000), 'over_6k': band(6000, sr / 2)}}
# picture: log-frequency rows 40 Hz … 16 kHz, 1 px = 1/20 s
rows = 360; fr = np.geomspace(40, 16000, rows); idx = np.searchsorted(f, fr).clip(0, len(f) - 1)
cols = int(D * 20); ti = np.linspace(0, S.shape[1] - 1, cols).astype(int)
M = 10 * np.log10(S[idx][:, ti] + 1e-12); M = np.clip((M - (M.max() - 80)) / 80, 0, 1)[::-1]
rgb = np.stack([np.clip(M * 2.2, 0, 1), np.clip(M * 1.6 - 0.3, 0, 1), np.clip(0.35 + 0.4 * M - M * M, 0, 1) * (M > 0.02)], axis=-1)
im = Image.fromarray((rgb * 255).astype(np.uint8)).resize((cols, rows)); canvas = Image.new('RGB', (cols + 60, rows + 40), '#111'); canvas.paste(im, (60, 0)); d = ImageDraw.Draw(canvas)
for hz in (50, 100, 200, 500, 1000, 2000, 5000, 10000): y = rows - 1 - int(np.searchsorted(fr, hz)); d.text((4, y - 5), f'{hz}', fill='#ccc'); d.line([(56, y), (60, y)], fill='#ccc')
for l in TL['lines']: x = 60 + int(l['start'] * 20); d.line([(x, 0), (x, rows)], fill='#ffffff'); d.text((x + 2, rows + 4), l['id'], fill='#ddd')
canvas.save(out + '-spectrogram.png')
json.dump(rep, open(out + '.json', 'w'), indent=1)

print(f"soundcheck {tag}: {D:.2f} s")
print('  stems  ' + ' · '.join(f"{k} {v['rms_db']} dB rms (peak {v['peak_db']}; loudest {v['loudest_rms_db']} dB at {v['loudest_at_s']} s)" for k, v in rep['stems'].items()))
laid_p = os.path.join(AD, 'foley-cues.json')
if os.path.exists(laid_p):
    laid = json.load(open(laid_p)); rep['foley_as_laid'] = laid
    for c in laid: c['onset_frames'] = round((c['onset_s'] - c['asked_s']) * 30, 1); c['peak_frames'] = round((c['peak_s'] - c['asked_s']) * 30, 1); c['in_stem_db'] = round(db(fe[int(max(0, c['peak_s'] - 0.02) * sr):int((c['peak_s'] + 0.02) * sr) + 1].max()), 1)
    off = [c for c in laid if min(abs(c['onset_frames']), abs(c['peak_frames'])) > 2]
    print(f"  foley as laid (each sound measured alone): {len(laid)} cues · onset or peak within 2 frames of its beat: {len(laid) - len(off)} · outside: {[(c['line'], c['cue'], c['onset_frames'], c['peak_frames']) for c in off]} · quietest in the stem {min(c['in_stem_db'] for c in laid)} dB")
bad = [r for r in rep['foley'] if r['audio_offset_frames'] is None or (abs(r['audio_offset_frames']) > 2 and abs(r.get('peak_offset_frames', 99)) > 2)]
print(f"  foley in the summed stem (overlapping cues confuse this one): {len(rep['foley'])} cues · audio onset (or, for a swell, its peak) within 2 frames of the asked time: {len(rep['foley']) - len(bad)} · late/early/missing: {[(r['line'], r['cue'], r['audio_offset_frames'], r.get('peak_offset_frames')) for r in bad]}")
if frames is not None:
    still = [r for r in rep['foley'] if r.get('picture_change_at_cue', 0) < 1.5 * r.get('picture_change_median', 0)]
    off = [r for r in rep['foley'] if abs(r.get('picture_offset_frames', 99)) > 2]
    print(f"  picture  largest change within ± 2 frames of the cue: {len(rep['foley']) - len(off)} of {len(rep['foley'])} · elsewhere in ± 0.3 s: {[(r['line'], r['cue'], r['picture_offset_frames']) for r in off]}")
    print(f"           cues with no more picture change than the episode's median frame: {[(r['line'], r['cue']) for r in still]}")
print('  ambience  ' + ' · '.join(f"{k}: {v['centroid_hz']} Hz ({v['lines']} lines)" for k, v in rep['ambience_places'].items()))
print(f"  mix  peak {rep['mix']['peak_db']} dBFS · samples at full scale {rep['mix']['samples_at_full_scale']} · under -50 dB {rep['mix']['seconds_under_-50dB']} s · energy % {rep['mix']['energy_pct']}")
print(f"  wrote {os.path.relpath(out + '.json', ROOT)} and {os.path.relpath(out + '-spectrogram.png', ROOT)}")
