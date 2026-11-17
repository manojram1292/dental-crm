#!/bin/bash
# The splice after the first render (tools/episode_loop.md step 7): the master showed freezes (freezedetect n=0.003, d=0.3) in "carry"
# (8.6 s), at the start of "split" (29.9 s) and on the end card (55–57 s). Those shots were given motion and are redrawn here at the
# master's keyframes: frames 240–370 (8–12.37 s: carry and the page turn into kunti), 870–1121 (29–37.4 s: split and the page turn
# into pots), 1634–1711 (54.47 s, the end card, to the end). Every other frame stays bit-identical (checked with framemd5 after).
set -e
cd "$(dirname "$0")/../../../.."
S=lab/review/papercut/seg/splice
for r in "a 8 12.366667" "b 29 37.4" "c 54.466667 57.066667"; do set -- $r
  [ -f $S/p$1.mp4 ] || { node tools/render.mjs --ep 95 --workers ${WORKERS:-2} --video-only --from $2 --to $3 --out $S/p$1.part.mp4 < /dev/null && mv $S/p$1.part.mp4 $S/p$1.mp4; }
done
echo patches done
