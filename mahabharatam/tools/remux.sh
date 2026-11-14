#!/bin/bash
# sound only: score + mix again, audio gate, then the new mix into the master and the share copy with the VIDEO COPIED (checked by md5 of the video stream)
set -e; cd "$(dirname "$0")/.."; N=$1
python3 -I tools/score.py --ep $N | tail -1 | cut -c1-70; python3 -I tools/mix.py --ep $N | tail -1 | cut -c60-330; node tools/gate.mjs --ep $N --audio | tail -1
A=$(ffmpeg -v error -i episode$N.mp4 -map 0:v -c copy -f md5 -); S=$(ffmpeg -v error -i episode$N-share.mp4 -map 0:v -c copy -f md5 -)
ffmpeg -v error -y -i episode$N.mp4 -i audio/ep$N/mix.en.wav -map 0:v -c:v copy -map 1:a -c:a aac -b:a 256k -ar 48000 -movflags +faststart lab/review/ep$N/m.mp4
ffmpeg -v error -y -i episode$N-share.mp4 -i audio/ep$N/mix.en.wav -map 0:v -c:v copy -map 1:a -c:a aac -b:a 160k -ar 48000 -movflags +faststart lab/review/ep$N/s.mp4
[ "$A" = "$(ffmpeg -v error -i lab/review/ep$N/m.mp4 -map 0:v -c copy -f md5 -)" ] && [ "$S" = "$(ffmpeg -v error -i lab/review/ep$N/s.mp4 -map 0:v -c copy -f md5 -)" ] && echo "video streams unchanged ($A)"
mv lab/review/ep$N/m.mp4 episode$N.mp4; mv lab/review/ep$N/s.mp4 episode$N-share.mp4
CHECK_ONLY=1 tools/finish.sh $N > lab/review/ep$N/finish.log 2>&1; grep -E "sound \(share|VERIFY ep|loudness|recogniser" lab/review/ep$N/finish.log | cut -c1-420
