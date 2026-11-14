"""Trailer v3.1 · the octave-below double for Krishna's words (and, lighter, the sentence before them).
    lab/voicelab/venv/bin/python lab/review/trailer/v3/divine.py
Writes audio/ep97/vish.octave.wav: voice/ep97/en/vish.wav from "Krishna" to the end, an octave down with the formants kept
(Praat "Change gender": pitch median x0.5, formant ratio 1), silence before it, the same length as vish.wav. tools/mix.py lays it
under the original (script "divine")."""
import json, os
import numpy as np, soundfile as sf, parselmouth
from parselmouth.praat import call
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
x, sr = sf.read(f'{ROOT}/voice/ep97/en/vish.wav', dtype='float64'); T = json.load(open(f'{ROOT}/voice/ep97/en/vish.json'))['wordTimes']
a = int((T[4][0] - 0.05) * sr); seg = x[a:]
snd = parselmouth.Sound(seg, sr); f0 = snd.to_pitch(0.01, 55, 350).selected_array['frequency']; med = float(np.median(f0[f0 > 0]))
low = call(snd, 'Change gender', 55, 350, 1.0, med * 0.5, 1.0, 1.0).values[0]
low = low[:len(seg)] if len(low) >= len(seg) else np.pad(low, (0, len(seg) - len(low)))
f1 = parselmouth.Sound(low, sr).to_pitch(0.01, 40, 350).selected_array['frequency']
out = np.zeros(len(x)); out[a:] = low; f = int(0.02 * sr); out[a:a + f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
sf.write(f'{ROOT}/audio/ep97/vish.octave.wav', out.astype(np.float32), sr)
print('original median', round(med, 1), 'Hz; octave copy median', round(float(np.median(f1[f1 > 0])), 1), 'Hz; from', round(a / sr, 2), 's of the clip')
