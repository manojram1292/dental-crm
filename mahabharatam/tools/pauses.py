#!/usr/bin/env python3
"""Set the ordinary pauses of an episode's lines (to bring a voiced episode into 54–58 s without touching a word or a take).

    python3 -I tools/pauses.py --ep 52 --pre 250 --post 450

Only lines that still carry the batch's ordinary values (pre 220/250, post 260/300/400/450) are changed: the hook, the rests
(pre ≥ 800) and any pause set by hand for a scene stay as they are.
"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
p = f"{ROOT}/script/ep{int(arg('--ep')):02d}.en.json"; sc = json.load(open(p)); n = 0
for l in sc['lines']:
    if l.get('pre') in (220, 250) and arg('--pre'): l['pre'] = int(arg('--pre')); n += 1
    if l.get('post') in (260, 300, 400, 450) and arg('--post'): l['post'] = int(arg('--post')); n += 1
open(p, 'w').write(json.dumps(sc, indent=2, ensure_ascii=False) + '\n'); print(n, 'pauses set')
