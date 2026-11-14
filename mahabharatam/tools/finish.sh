#!/bin/bash
# After `node tools/render.mjs --ep N` (tools/episode_loop.md, steps 5–6): the share copy and every check on the finished files.
#   tools/finish.sh 50
# Share copy: -crf 23 -maxrate 2500k -bufsize 5000k, a keyframe on every cut, moov first (+faststart), AAC 160k.
# Then, into lab/review/epNN/: verify.json (freezes d=0.3 on master and share, low motion, repeats, dead air, SSIM share↔master),
# share.json (what a phone wants), sound.json (the floor and fall rules, the start, clipping, the recogniser on the FINAL MIX of the
# share file, clicks at clip boundaries), post-pass-*.jpg / post-cuts-*.jpg / post-contact.jpg (open them and look).
set -e
cd "$(dirname "$0")/.."
N=$(printf %02d "$1"); TAG=ep$N; OUT=lab/review/$TAG; mkdir -p $OUT
PYV=lab/voicelab/venv/bin/python
KF=$(python3 -I -c "
import json
tl = json.load(open('build/timeline.$TAG.en.json'))
print(','.join(f'{max(0.0, round(l[\"start\"] * 30) / 30 - 0.004):.4f}' for l in tl['lines']))")
if [ -z "$CHECK_ONLY" ]; then
ffmpeg -y -loglevel error -i episode$N.mp4 -c:v libx264 -preset slow -crf 23 -maxrate 2500k -bufsize 5000k -profile:v high -pix_fmt yuv420p -r 30 -g 60 -bf 2 -force_key_frames "$KF" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a aac -ar 48000 -b:a 160k -movflags +faststart episode$N-share.mp4
fi
ls -la episode$N.mp4 episode$N-share.mp4
python3 -I tools/sharecheck.py episode$N-share.mp4 "$KF" > $OUT/share.json
python3 -I tools/checks.py episode$N.mp4 --timeline build/timeline.$TAG.en.json --out $OUT/verify-master.json > /dev/null
python3 -I tools/checks.py episode$N-share.mp4 --against episode$N.mp4 --out $OUT/verify-share.json > /dev/null
$PYV tools/soundcheck2.py episode$N-share.mp4 --stops "" --script script/$TAG.en.json --voice-stem audio/$TAG/voice-stem.en.wav --timeline build/timeline.$TAG.en.json --out $OUT/sound.json > /dev/null
python3 -I tools/sheets.py --ep $1
for f in episode$N.mp4 episode$N-share.mp4; do ffmpeg -hide_banner -nostats -i $f -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|LRA:|Peak:" | tail -3 | tr '\n' ' ' > $OUT/loud-$f.txt; done
python3 -I - <<PY
import json
o = 'lab/review/$TAG/'; m = json.load(open(o + 'verify-master.json')); s = json.load(open(o + 'verify-share.json')); sh = json.load(open(o + 'share.json')); so = json.load(open(o + 'sound.json'))
h = so['holes']; r = so.get('recogniser', {})
print('VERIFY $TAG')
print(' frames', m['frames'], '· freezes over 0.3 s: master', len(m['freezes_d0.3']), m['freezes_d0.3'][:4], 'share', len(s['freezes_d0.3']), '· low-motion runs', len(m['low_motion']), '· exact repeats', m['exact_repeats'], '· dead air', m.get('dead_air_under_-45dB_over_0.3s'))
print(' share', sh['megabytes_decimal'], 'MB', sh['profile'], sh['pix_fmt'], 'moov first', sh['moov_before_mdat'], '· asked keyframes missing', sh['asked_keyframes_missing'], '· SSIM vs master mean', s['ssim_vs_master']['mean'], 'worst', s['ssim_vs_master']['worst'])
print(' sound (share file): worst 100 ms window', h['worst_window_db'], 'dBFS at', h['worst_window_at_s'], 's ·', h['windows_under_floor'], 'under', h['floor_db'], '· worst fall', h['worst_drop_db'], 'dB ·', h['drops_over_limit'], 'over', h['drop_limit_db'], '· voice over bed', so.get('voice_over_bed'), '· first 100 ms', so['start']['first_100ms_db'], 'dBFS · samples at full scale', so['clipping']['samples_at_0.999'])
print(' loudness master:', open(o + 'loud-episode$N.mp4.txt').read().strip(), '| share:', open(o + 'loud-episode$N-share.mp4.txt').read().strip())
print(' recogniser on the final mix: misheard', r.get('misheard'), '· gaps over 0.35 s inside a sentence', r.get('gaps_over_0.35s_inside_a_sentence'))
vs = so.get('voice_stem', {}); print(' voice stem: loudest step at a clip boundary', vs.get('loudest_step_at_a_boundary_db'), 'dB (ordinary speech', vs.get('ordinary_speech_step_99pct_db'), ') · boundaries over −40 dB:', len(vs.get('boundaries_with_a_step_over_-40_db', [])))
bad = len(m['freezes_d0.3']) + len(s['freezes_d0.3']) + h['windows_under_floor'] + h['drops_over_limit'] + len(sh['asked_keyframes_missing']) + (abs(m['frames'] - round(json.load(open('build/timeline.$TAG.en.json'))['duration'] * 30)) > 1)   # the encoder may end one frame short of the timeline (-shortest against the sound)
print('VERIFY $TAG:', 'clean (now open the sheets and look)' if not bad else f'{bad} MEASURED FAULT(S): fix the shot and splice (episode_loop.md step 7)')
PY
