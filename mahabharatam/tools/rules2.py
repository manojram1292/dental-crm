#!/usr/bin/env python3
"""Put an episode script under "rules": 2 (the trailer's lessons; tools/gate.mjs header, tools/episode_loop.md).

    python3 -I tools/rules2.py --ep 56 [--lang en]

Sets "rules": 2, "credits": "source-only", timing.frameSnap, and removes strings.madeLine ("Voices: synthetic · Drawn in code": the
owner asked for the source line only). Nothing else is touched; run once per episode before voicing it with tools/voice2.py.
"""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
p = f"{ROOT}/script/ep{int(arg('--ep')):02d}.{arg('--lang', 'en')}.json"
raw = open(p).read(); sc = json.loads(raw)
same = json.dumps(sc, indent=2, ensure_ascii=False) + '\n' == raw
out = {}
for k, v in sc.items():
    out[k] = v
    if k == 'timing':
        v['frameSnap'] = True
        out['rules'] = 2; out['credits'] = 'source-only'
out['strings'].pop('madeLine', None)
assert out.get('rules') == 2
open(p, 'w').write(json.dumps(out, indent=2, ensure_ascii=False) + '\n')
print(p, 'now under rules 2' + ('' if same else ' (the file was not in the usual layout: it has been re-laid, check the diff)'))
