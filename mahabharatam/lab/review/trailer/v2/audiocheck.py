"""Trailer v2 · the sound, measured (nobody listens).   python3 -I lab/review/trailer/v2/audiocheck.py [--out lab/review/trailer/v2/audio.json]
From audio/ep97 (three stems, the mix, the score's own sheet) and build/timeline.ep97.en.json:
  · the mix: integrated loudness and true peak (tools/mix.py's report), and every stretch under −45 dBFS for ≥ 0.25 s (must be the two stops)
  · music against voice: the level of the music stem while the voice speaks (after its 11 dB duck) and between lines, against the voice's own level
  · loudness by section (short windows, K-weighted): where the film is loud and where it is quiet
  · the clock: at every tick the sheet lists, is there a rise in the foley stem's 1–6 kHz band (found / listed); tempo steps
  · sound leads: how many frames before its cut each leading sound starts and becomes audible (audio/ep97/foley-cues.json)
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from scipy import signal as sps
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')); sys.path.insert(0, f'{ROOT}/tools')
from score import lufs, bpf
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); AD = f'{ROOT}/audio/ep97'; SR = 48000
tl = json.load(open(f'{ROOT}/build/timeline.ep97.en.json')); L = {l['id']: l for l in tl['lines']}; N = int(round(tl['duration'] * SR))
ld = lambda n: sf.read(f'{AD}/{n}', always_2d=True)[0].T[:, :N]
mus, amb, fol, mix = ld('mus.wav'), ld('amb.wav'), ld('foley.wav'), ld('mix.en.wav')
rep = {'mix': json.load(open(f'{AD}/mix.en.json')), 'score': json.load(open(f'{AD}/score-trailer.json'))}
r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', f'{AD}/mix.en.wav', '-af', 'silencedetect=noise=-45dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
rep['silences_under_-45dB_0.25s'] = [[round(float(a), 3), round(float(b), 3)] for a, b in zip(re.findall(r'silence_start: ([\d.]+)', r), re.findall(r'silence_duration: ([\d.]+)', r))]
# the voice bus as the mix lays it (before its EQ), for a mask and a level
voice = np.zeros(N)
for l in tl['lines']:
    if l.get('voice'):
        x, sr = sf.read(f"{ROOT}/{l['voice']}", dtype='float32'); x = sps.resample_poly(x, 2, 1) if sr == 24000 else x; i0 = int(round(l['speechStart'] * SR)); n = min(len(x), N - i0); voice[i0:i0 + n] += x[:n]
w = int(0.03 * SR); ev = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, 'same')); on = ev > 0.03 * ev.max(); off = ~(np.convolve(on.astype(float), np.ones(int(0.5 * SR)), 'same') > 0)
rms = lambda z: round(float(10 * np.log10(np.mean(z ** 2) + 1e-12)), 1)
k = 10 ** ((-16 - lufs(np.stack([voice, voice]))) / 20)   # tools/mix.py sets the voice bus to −16 LUFS
st = lambda a: [(max(0, int(x * SR)), min(N, int(y * SR))) for x, y in a]
stops = rep['score']['stops']; live = np.ones(N, bool)
for a, b in st(stops): live[a:b] = False
rep['music_vs_voice'] = {'voice_rms_while_speaking_db': rms(voice[on] * k), 'music_stem_rms_while_voice_speaks_before_duck_db': rms(mus[:, on]), 'music_under_voice_after_11dB_duck_db': round(rms(mus[:, on]) - 11, 1),
                         'music_stem_rms_between_lines_db': rms(mus[:, off & live]), 'foley_stem_rms_db': rms(fol[:, live]), 'ambience_stem_rms_db': rms(amb[:, live]),
                         'voice_minus_music_while_speaking_db': round(rms(voice[on] * k) - (rms(mus[:, on]) - 11), 1), 'note': 'RMS dBFS; the mix then masters everything together to about −14 LUFS'}
sec = {'title': ('title', 'title'), 'now': ('field', 'field'), 'past': ('vow', 'wheel'), 'dice to needle': ('dice1', 'needle2'), 'turn': ('armies', 'bow'), 'war': ('arrows1', 'raid'), 'curse': ('curse', 'curse'), 'dog': ('dog', 'dog'), 'universal form': ('vish', 'vish'), 'word': ('word', 'word'), 'promise': ('p1', 'follow'), 'end card': ('endcard', 'endcard')}
rep['loudness_by_section_lufs'] = {}
for name, (a, b) in sec.items():
    i0, i1 = int(L[a]['start'] * SR), int(L[b]['end'] * SR); z = mix[:, i0:i1]
    rep['loudness_by_section_lufs'][name] = round(lufs(z), 1) if i1 - i0 > SR * 0.5 else None
# the clock: at each tick time recomputed from the sheet's tempo steps, is there an onset in the foley stem's click band?
fb = bpf(fol.mean(0), 1000, 6000); e = np.sqrt(np.convolve(fb ** 2, np.ones(240) / 240, 'same'))
seg = rep['score']['clock']['tempo_steps']; t = seg[0][0]; ticks = []; s2a = stops[1][0]
while t < s2a - 0.02:
    bpm = [b for a, b in seg if t >= a - 1e-6][-1]; nxt = [a for a, b in seg if a > t + 1e-6]
    if not any(a <= t < b for a, b in stops): ticks.append((t, bpm))
    step = 60.0 / bpm; t = nxt[0] if nxt and t + step > nxt[0] + 1e-6 and nxt[0] - t > 0.3 * step else t + step
found = 0; gaps = []
for (t, bpm) in ticks:
    i = int(t * SR); pk = e[i:i + int(0.02 * SR)].max(); before = e[max(0, i - int(0.05 * SR)):max(1, i - int(0.008 * SR))].mean() + 1e-7
    found += pk > 2.0 * before
rep['clock'] = {'ticks_listed': len(ticks), 'ticks_with_an_onset_in_the_foley_stem': int(found), 'per_minute_steps': seg, 'longest_gap_between_ticks_outside_the_stops_s': round(max(b[0] - a[0] for a, b in zip(ticks, ticks[1:]) if not any(a[0] < s[1] and b[0] > s[0] for s in stops)), 3), 'last_tick_s': round(ticks[-1][0], 3), 'second_stop_starts_s': s2a}
cues = json.load(open(f'{AD}/foley-cues.json')); rep['leads'] = []
for c in cues:
    if c['cue'] in ('dice rattle', 'conch', 'arrows', 'arrow flights') or (c['line'] == 'altar' and c['cue'] == 'flame'):
        cut = L[c['line']]['start']; rep['leads'].append({'sound': c['cue'], 'cut_to': c['line'], 'cut_s': round(cut, 3), 'starts_frames_before_cut': round((cut - c['start_s']) * 30, 1), 'audible_frames_before_cut': round((cut - c['onset_s']) * 30, 1)})
rep['impacts'] = [{'what': c['cue'], 'line': c['line'], 'sound_peak_s': c['peak_s'], 'cut_s': round(L[c['line']]['end'], 3), 'frames_from_sound_peak_to_cut': round((L[c['line']]['end'] - c['peak_s']) * 30, 1)} for c in cues if c['cue'] in ('the blow', 'dice strike', 'the wheel drops')]
print(json.dumps(rep, indent=1))
if '--out' in sys.argv: json.dump(rep, open(sys.argv[sys.argv.index('--out') + 1], 'w'), indent=1)
