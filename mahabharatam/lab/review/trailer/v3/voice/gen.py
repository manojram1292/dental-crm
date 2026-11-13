"""Chatterbox takes with per-job ref / exag / temp / seeds.  venv/bin/python gen.py jobs.json OUTDIR
jobs: [{"id","text","ref"(path|default),"exag","temp","seeds":[..]}]  -> OUTDIR/<id>.s<seed>.wav ; skips existing."""
import json, os, sys, time
sys.path.insert(0, '/home/user/dental-crm/mahabharatam/lab/voicelab')
import soundfile as sf
from cb import CB, M, SR
jobs = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
todo = [(j, s) for j in jobs for s in j.get('seeds', [0, 1]) if not os.path.exists(f"{out}/{j['id']}.s{s}.wav")]
if not todo: sys.exit(0)
t0 = time.time(); cb = CB(int(os.environ.get('CB_THREADS', 3))); print('loaded', round(time.time() - t0, 1), flush=True)
cur = None
for j, s in sorted(todo, key=lambda q: q[0].get('ref', 'default')):
    ref = j.get('ref', 'default'); ref = os.path.join(M, 'default_voice.wav') if ref == 'default' else ref
    if ref != cur: cb.set_ref(ref); cur = ref
    t = time.time(); wav, complete, ntok = cb.say(j['text'], seed=s, exag=j.get('exag', 0.5), temp=j.get('temp', 0.8))
    sf.write(f"{out}/{j['id']}.s{s}.wav", wav, SR)
    print(j['id'], s, round(len(wav) / SR, 2), 's', 'complete' if complete else 'INCOMPLETE', round(time.time() - t, 1), flush=True)
