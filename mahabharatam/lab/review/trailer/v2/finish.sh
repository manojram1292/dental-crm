#!/bin/bash
# Trailer v2 · after `node tools/render.mjs --ep 97 --workers 2 --out trailer.mp4`: the share copy (two passes, as many bits as 20 MB
# allows for this length), the "stuck" checks on both files, the review sheets, the sound measurements.
set -e
cd "$(dirname "$0")/../../../.."
P=$(mktemp -d)
X="-c:v libx264 -preset slow -b:v 1660k -maxrate 3200k -bufsize 6400k -profile:v high -pix_fmt yuv420p -g 60 -bf 2 -x264-params aq-mode=3:aq-strength=1.0:no-fast-pskip=1:deadzone-inter=8:deadzone-intra=6:psy-rd=1.0,0.1 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
ffmpeg -y -loglevel error -i trailer.mp4 $X -pass 1 -passlogfile $P/x -an -f null /dev/null
ffmpeg -y -loglevel error -i trailer.mp4 $X -pass 2 -passlogfile $P/x -c:a aac -b:a 160k -movflags +faststart trailer-share.mp4
ls -la trailer.mp4 trailer-share.mp4
python3 -I lab/review/trailer/v2/checks.py trailer.mp4 --timeline build/timeline.ep97.en.json --out lab/review/trailer/v2/after-master.json > /dev/null
python3 -I lab/review/trailer/v2/checks.py trailer-share.mp4 --against trailer.mp4 --out lab/review/trailer/v2/after-share.json > /dev/null
python3 -I lab/review/trailer/v2/sheets.py trailer.mp4
python3 -I lab/review/trailer/v2/audiocheck.py --out lab/review/trailer/v2/audio.json > /dev/null
for f in trailer.mp4 trailer-share.mp4; do echo $f; ffmpeg -hide_banner -nostats -i $f -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|LRA:|Peak:" | tail -3 | tr '\n' ' '; echo; done
