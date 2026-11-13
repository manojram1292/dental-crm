#!/bin/bash
# Trailer v3 · after `node tools/render.mjs --ep 97 --workers 2 --out trailer.mp4`: the share copy for phones, the checks, the sheets.
# Share copy: H.264 High, level 4.2, yuv420p, a keyframe on every cut (and on the cuts inside sentences) and every second for the
# first five, at most 2 s apart anywhere, moov first, AAC 48 kHz; two passes at the bitrate that keeps it under 20 MB.
set -e
cd "$(dirname "$0")/../../../.."
P=$(mktemp -d)
KF=$(python3 -I - <<'PY'
import json
tl = json.load(open('build/timeline.ep97.en.json')); sc = {l['id']: l for l in json.load(open('script/trailer.en.json'))['lines']}
ts = {0.0, 1.0, 2.0, 3.0, 4.0, 5.0}
for l in tl['lines']:
    ts.add(round(l['start'] * 30) / 30)
    for k in sc[l['id']].get('cutAt', []): ts.add(round((l['words'][k]['t0'] - 0.07) * 30) / 30)
print(','.join(f'{t:.4f}' for t in sorted(ts)))
PY
)
D=$(python3 -I -c "import json;print(json.load(open('build/timeline.ep97.en.json'))['duration'])")
BR=$(python3 -I -c "print(int((19.4*8*1024*1024/$D - 164000)/1000))")
echo "keyframes at: $KF"; echo "video bitrate ${BR}k for $D s"
X="-c:v libx264 -preset slow -b:v ${BR}k -maxrate 3200k -bufsize 6400k -profile:v high -level:v 4.2 -pix_fmt yuv420p -r 30 -g 60 -keyint_min 1 -sc_threshold 0 -bf 2 -force_key_frames $KF -x264-params aq-mode=3:aq-strength=1.0:no-fast-pskip=1:deadzone-inter=8:deadzone-intra=6:psy-rd=1.0,0.1 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
ffmpeg -y -loglevel error -i trailer.mp4 $X -pass 1 -passlogfile $P/x -an -f null /dev/null
ffmpeg -y -loglevel error -i trailer.mp4 $X -pass 2 -passlogfile $P/x -c:a aac -ar 48000 -b:a 160k -movflags +faststart trailer-share.mp4
ls -la trailer.mp4 trailer-share.mp4
python3 -I lab/review/trailer/v3/sharecheck.py trailer-share.mp4 "$KF" | tee lab/review/trailer/v3/share.json
python3 -I lab/review/trailer/v2/checks.py trailer.mp4 --timeline build/timeline.ep97.en.json --out lab/review/trailer/v3/after-master.json > /dev/null
python3 -I lab/review/trailer/v2/checks.py trailer-share.mp4 --against trailer.mp4 --out lab/review/trailer/v3/after-share.json > /dev/null
python3 -I lab/review/trailer/v3/sheets.py trailer.mp4
for f in trailer.mp4 trailer-share.mp4; do echo $f; ffmpeg -hide_banner -nostats -i $f -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|LRA:|Peak:" | tail -3 | tr '\n' ' '; echo; done
