"""Extract chosen impulse responses (MIT IR Survey, Traer & McDermott 2016, CC-BY 4.0; HF mirror benjamin-paine/mit-impulse-response-survey)
from the downloaded parquet into lab/review/teaser/ir/*.wav (48 kHz mono float)."""
import sys, io, json, os
import pyarrow.parquet as pq, soundfile as sf, numpy as np
from scipy.signal import resample_poly
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
t = pq.read_table(src).to_pylist()
meta = pq.read_schema(src).metadata
names = None
try:
    feat = json.loads(meta[b'huggingface'])['info']['features']['location']['names']; names = feat
except Exception as e: print('no names', e)
want = ('Auditorium', 'Atrium', 'Stairwell', 'BostonPublicLibrary', 'SubwayStation', 'Outdoor', 'Outside', 'ParkingLot', 'Campground', 'StreetsOfBoston', 'TrainStation', 'MovieTheater')
rows = []
for r in t:
    loc = names[r['location']] if names else str(r['location'])
    if loc not in want: continue
    a = r['audio']; x, sr = sf.read(io.BytesIO(a['bytes']), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != 48000: x = resample_poly(x, 48000, sr).astype('float32')
    e = np.cumsum(x[::-1] ** 2)[::-1]; edb = 10 * np.log10(e / e[0] + 1e-12)
    i60 = np.argmax(edb < -30) * 2 / 48000 if (edb < -30).any() else len(x) / 48000
    fn = f"{r['id']:03d}_{loc}{'_' + r['detail'] if r.get('detail') else ''}.wav".replace(' ', '')
    sf.write(os.path.join(out, fn), x, 48000, subtype='FLOAT')
    rows.append({'file': fn, 'location': loc, 'detail': r.get('detail'), 'rt60_est_s': round(float(i60), 2), 'seconds': round(len(x) / 48000, 2)})
json.dump({'source': 'MIT IR Survey (Traer & McDermott, PNAS 2016, doi:10.1073/pnas.1612524113), via huggingface.co/datasets/benjamin-paine/mit-impulse-response-survey', 'license': 'CC-BY 4.0', 'irs': rows}, open(os.path.join(out, 'irs.json'), 'w'), indent=1)
for r in sorted(rows, key=lambda r: -r['rt60_est_s']): print(r)
