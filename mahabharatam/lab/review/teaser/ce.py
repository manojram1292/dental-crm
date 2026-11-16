#!/usr/bin/env python3
"""Read the BORI CE (GRETIL, lab/ce/) for the teaser's verse check.
   python3 -I lab/review/teaser/ce.py ref BOOK CH V0 [V1]     prints verses (constituted text and star/appendix lines marked)
   python3 -I lab/review/teaser/ce.py grep BOOK REGEX [max]   lines matching (IAST)"""
import re, html, sys, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
def load(b):
    t = open(f'{ROOT}/lab/ce/mbh_{int(b):02d}_u.htm', encoding='utf8').read()
    t = html.unescape(re.sub(r'<[^>]+>', '\n', t))
    return [l.strip() for l in t.split('\n') if l.strip()]
cmd = sys.argv[1]
if cmd == 'ref':
    b, c, v0 = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]); v1 = int(sys.argv[5]) if len(sys.argv) > 5 else v0
    for l in load(b):
        m = re.match(r'^(\d\d),(\d\d\d)\.(\d\d\d)', l)
        if m and int(m.group(2)) == c and v0 <= int(m.group(3)) <= v1: print(l)
        elif re.match(rf'^{b:02d},{c:03d}\.', l) is None and m is None and False: pass
elif cmd == 'grep':
    b, rx = int(sys.argv[2]), sys.argv[3]; mx = int(sys.argv[4]) if len(sys.argv) > 4 else 40
    n = 0
    for l in load(b):
        if re.search(rx, l):
            print(l); n += 1
            if n >= mx: break
