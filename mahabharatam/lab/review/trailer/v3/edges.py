"""Trailer · the edges of every voice file in a folder: is the first / last sample at zero, how much sound is in the first and last
3 ms (a clipped onset or tail is loud there), how much air after the last sound, and the median pitch.
    lab/voicelab/venv/bin/python lab/review/trailer/v3/edges.py voice/ep97/en [--out file.json] [--only id,id]"""
import glob, json, os, sys
import numpy as np, soundfile as sf, parselmouth
d = sys.argv[1]; only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None; out = {}
for f in sorted(glob.glob(f'{d}/*.wav')):
    k = os.path.basename(f)[:-4]
    if only and k not in only: continue
    x, sr = sf.read(f, dtype='float64'); pk = np.abs(x).max() + 1e-9; n3 = int(0.003 * sr); w = int(0.02 * sr)
    e = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, 'same')); act = np.nonzero(e > 0.035 * e.max())[0]
    f0 = parselmouth.Sound(x, sr).to_pitch(0.01, 55, 350).selected_array['frequency']; v = f0[f0 > 0]
    db = lambda a: round(float(20 * np.log10(a / pk + 1e-6)), 1)
    out[k] = {'dur_s': round(len(x) / sr, 2), 'first_3ms_db': db(np.abs(x[:n3]).max()), 'last_3ms_db': db(np.abs(x[-n3:]).max()), 'air_before_ms': round(1000 * act[0] / sr), 'air_after_ms': round(1000 * (len(x) - act[-1]) / sr),
              'f0_hz': round(float(np.median(v)), 1) if len(v) > 5 else 0.0, 'words': None}
med = float(np.median([o['f0_hz'] for o in out.values() if o['f0_hz']]))
for o in out.values(): o['semitones_from_median'] = round(float(12 * np.log2(o['f0_hz'] / med)), 2) if o['f0_hz'] else None
f0s = [o['f0_hz'] for o in out.values() if o['f0_hz']]
summ = {'files': len(out), 'median_hz': round(med, 1), 'lowest_hz': min(f0s), 'highest_hz': max(f0s), 'spread_semitones': round(float(12 * np.log2(max(f0s) / min(f0s))), 2), 'files_more_than_2_semitones_from_median': sorted(k for k, o in out.items() if o['semitones_from_median'] is not None and abs(o['semitones_from_median']) > 2),
        'files_under_0.7_s': sorted(k for k, o in out.items() if o['dur_s'] < 0.7), 'files_with_under_60_ms_of_air_after': sorted(k for k, o in out.items() if o['air_after_ms'] < 60), 'files_loud_in_last_3_ms_(over_-30_dB)': sorted(k for k, o in out.items() if o['last_3ms_db'] > -30),
        'files_loud_in_first_3_ms_(over_-30_dB)': sorted(k for k, o in out.items() if o['first_3ms_db'] > -30)}
print(json.dumps(summ, indent=1))
if '--out' in sys.argv: json.dump({'summary': summ, 'files': out}, open(sys.argv[sys.argv.index('--out') + 1], 'w'), indent=1)
