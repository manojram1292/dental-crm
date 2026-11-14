#!/usr/bin/env python3
"""One row for QUALITY_SCORECARD.md ("Rows from episode 41"), from tools/scorecard.py and tools/soundcheck.py on the finished mp4.

    python3 -I tools/row.py --ep 50

For a "rules": 2 episode the Silences column reads "0 · N dips" (no silence is allowed; the rests are dips, audio/epNN/mix.en.json)
and W/s is the gate's measure (the pause after each line, up to 0.4 s, counted with the speech).
"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ep = int(sys.argv[sys.argv.index('--ep') + 1]); tag = f'ep{ep:02d}'
s = json.loads(subprocess.run([sys.executable, '-I', f'{ROOT}/tools/scorecard.py', '--ep', str(ep), '--json'], capture_output=True, text=True).stdout.strip().splitlines()[-1])
so = subprocess.run([sys.executable, '-I', f'{ROOT}/tools/soundcheck.py', '--ep', str(ep), '--mp4', f'episode{ep:02d}.mp4'], capture_output=True, text=True, cwd=ROOT).stdout
import re
fm = re.search(r'foley as laid[^:]*: (\d+) cues · onset or peak within 2 frames of its beat: (\d+)', so)
c = json.load(open(f'{ROOT}/audio/{tag}/soundcheck.json')); sc = json.load(open(f'{ROOT}/script/{tag}.en.json')); tl = json.load(open(f'{ROOT}/build/timeline.{tag}.en.json'))
mx = json.load(open(f'{ROOT}/audio/{tag}/mix.en.json'))
pals = {l['pal'] for l in sc['lines'] if l.get('pal')}; cams = {c_ for l in sc['lines'] if l.get('cam') for c_ in l['cam'].split('+') if c_ != 'still'}; trs = {l['tr'] for l in sc['lines'] if l.get('tr') in ('ink', 'brush', 'lamp', 'smoke')}
n_cues, on = (fm.group(1), fm.group(2)) if fm else ('?', '?')
r2 = sc.get('rules', 1) >= 2
wps = s['words_per_s']
if r2:
    v = [l for l in tl['lines'] if l.get('voice')]; words = sum(len(l['words']) for l in v); sp = sum(l['speechEnd'] - l['speechStart'] for l in v)
    gaps = sum(min(0.4, max(0, b['speechStart'] - a['speechEnd'])) for a, b in zip(v, v[1:])); wps = round(words / (sp + gaps), 2)
sil = f"0 · {len(mx.get('rests', []))} dips" if r2 else f"{s['silences_45db']} ({s['longest_silence']} s)"
st = c['stems']; m = c['mix']
print(f"| {ep} | {s['duration']} | {s['hook_words']} w · {s['hook_speech_end']} s | {s['motion_0_5']} | {s['turn_pct']} % | {wps} | {len(pals)} · {s['hue_run']} | {len(cams)} · {len(trs)} | {s['lufs']} · {s['true_peak']} · {s['lra']} | {sil} | {s['next_vs_body_db']} dB | "
      f"{st['amb']['rms_db']} · {st['foley']['rms_db']} · {st['mus']['rms_db']} | {on} of {n_cues} | {m['peak_db']} dBFS · {m['samples_at_full_scale']} | {s['key_min_dist']} · {s['key_mean_dist']} | {s['share_mb']} |")
