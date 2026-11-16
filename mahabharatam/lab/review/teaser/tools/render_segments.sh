#!/bin/bash
# The teaser render in segments (the disk holds about 8.6 GB free, under the 11 GB a single 65 s render wants for its frames):
# each segment is rendered by tools/render.mjs --video-only (its own disk and memory check, frames deleted after encoding),
# the segments are joined by stream copy (each starts on a keyframe), and the gate-passed mix is muxed once.
# Run only after `node tools/gate.mjs --ep 96 --frames --audio` has passed (render.mjs --video-only skips the gate).
set -e
cd "$(dirname "$0")/../../../.."
SEG=lab/review/teaser/seg; mkdir -p $SEG
DUR=$(python3 -c "import json;print(json.load(open('build/timeline.ep96.en.json'))['duration'])")
STEP=13
python3 - "$DUR" "$STEP" > $SEG/plan.txt <<'PY'
import sys
d, s = float(sys.argv[1]), float(sys.argv[2]); a = 0.0; k = 0
while a < d - 1e-6:
    b = min(d, a + s); print(f"{k:02d} {a:.4f} {b:.4f}"); a = b; k += 1
PY
while read k a b; do
  [ -f $SEG/s$k.mp4 ] && { echo "segment $k exists"; continue; }
  node tools/render.mjs --ep 96 --workers ${WORKERS:-2} --video-only --from $a --to $b --out $SEG/s$k.part.mp4 < /dev/null && mv $SEG/s$k.part.mp4 $SEG/s$k.mp4
done < $SEG/plan.txt
( while read k a b; do echo "file 's$k.mp4'"; done < $SEG/plan.txt ) > $SEG/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $SEG/list.txt -c copy $SEG/video.mp4
ffmpeg -y -loglevel error -i $SEG/video.mp4 -i audio/ep96/mix.en.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest teaser.mp4
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames,duration -of csv=p=0 teaser.mp4
echo "wrote teaser.mp4"
