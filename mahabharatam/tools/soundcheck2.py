"""(From the trailer; used for every "rules": 2 episode, tools/episode_loop.md step 6.) the sound, measured on a finished mix (nobody listens).
    lab/voicelab/venv/bin/python tools/soundcheck2.py MIX.wav|FILE.mp4 --stops "a,b;c,d" [--script script/trailer.en.json] [--voice-stem audio/ep97/voice-stem.en.wav --timeline build/timeline.ep97.en.json] [--out file.json]
  1 holes       100 ms RMS windows (hop 50 ms) of the mix outside the stops: the worst and where, how many under −26 dBFS, how many
                fall more than 10 dB under the loudest window of the 300 ms before (tools/mix.py's own measure, the gate's rule)
  2 start       the level of the first 100 ms, and of the first 33 ms (one frame)
  3 clipping    samples at or over 0.999 in the mix; the peak
  4 recogniser  faster-whisper base.en on the mix itself, with word times: what it wrote; with --script, the words of the script it
                did not write (and what it wrote instead); every gap over 0.35 s between two words that no full stop separates
  5 with --voice-stem and --timeline: at every clip boundary (the start and end of each voice file as laid) the largest step between
                two neighbouring samples within 3 ms of it, against the stem's peak (a click is a step with nothing round it), and the
                stem's peak (clipping)"""
import difflib, json, os, re, subprocess, sys
import numpy as np, soundfile as sf
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); sys.path.insert(0, f'{ROOT}/tools')
import mix as MX
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
f = sys.argv[1]; SR = 48000
if f.endswith('.wav'): x = sf.read(f, always_2d=True, dtype='float64')[0].T
else:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vn', '-ac', '2', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout; x = np.frombuffer(raw, np.float32).reshape(-1, 2).T.astype(np.float64)
stops = [[float(q) for q in p.split(',')] for p in arg('--stops', '').split(';') if p]
cfg = {'floorDb': -26, 'dropDb': 10, 'dropWindowS': 0.3, 'endExemptS': 0.1}   # to 100 ms before the end (the bed goes out over the last 80 ms; a decoded mp4 is a few ms longer than the mix)
rep, _ = MX.floor_report(x, stops, cfg, x.shape[1] / SR)
out = {'file': os.path.basename(f), 'seconds': round(x.shape[1] / SR, 2), 'stops': stops, 'holes': rep}
r = lambda z: round(float(10 * np.log10(np.mean(z ** 2) + 1e-12)), 1)
out['start'] = {'first_100ms_db': r(x[:, :4800]), 'first_frame_33ms_db': r(x[:, :1600]), 'first_10ms_db': r(x[:, :480])}
out['clipping'] = {'samples_at_0.999': int((np.abs(x) >= 0.999).sum()), 'peak_dbfs': round(float(20 * np.log10(np.abs(x).max())), 2)}
if '--no-asr' not in sys.argv:
    import parselmouth
    from faster_whisper import WhisperModel
    asr = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=3, download_root=f'{ROOT}/lab/voicelab/venv/models/whisper')
    m16 = parselmouth.Sound(x.mean(0), SR).resample(16000).values[0].astype(np.float32)
    # In one pass over 90 s the recogniser can skip several seconds (it did: the dice hall, which it writes word for word when given
    # that stretch alone). So: in stretches of 12 s or more that begin and end where a shot begins (--timeline), or of 15 s.
    D_ = len(m16) / 16000
    if arg('--timeline'):
        tl_ = json.load(open(arg('--timeline'))); cuts_ = [0.0]
        for l in tl_['lines']:
            if l.get('voice') and l['start'] - cuts_[-1] >= 12 and D_ - l['start'] > 6: cuts_.append(l['start'])
        cuts_.append(D_)
    else: cuts_ = list(np.arange(0, D_, 15.0)) + [D_]
    W = []
    for a_, b_ in zip(cuts_, cuts_[1:]):
        segs, _ = asr.transcribe(m16[int(a_ * 16000):int(b_ * 16000)], beam_size=5, condition_on_previous_text=False, word_timestamps=True)
        W += [[w.word.strip(), round(w.start + a_, 2), round(w.end + a_, 2)] for s in segs for w in (s.words or [])]
    out_windows = [round(float(c), 2) for c in cuts_]
    out['recogniser'] = {'heard': ' '.join(w[0] for w in W), 'transcribed_in_stretches_starting_at_s': out_windows, 'words': W}
    out['recogniser']['gaps_over_0.35s_inside_a_sentence'] = [{'after': a[0], 'before': b[0], 'at_s': a[2], 'gap_s': round(b[1] - a[2], 2)} for a, b in zip(W, W[1:]) if b[1] - a[2] > 0.35 and not re.search(r'[.!?]["”]?$', a[0])]
    if arg('--script'):
        sc = json.load(open(arg('--script'))); nm = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ').replace('’', "'")).split()
        ref = nm(' '.join(l['text'] for l in sc['lines'])); hyp = nm(' '.join(w[0] for w in W)); sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
        out['recogniser']['script_words'] = len(ref); out['recogniser']['misheard'] = [{'script': ' '.join(ref[i1:i2]), 'heard': ' '.join(hyp[j1:j2])} for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != 'equal']
if arg('--voice-stem'):
    v = sf.read(arg('--voice-stem'), always_2d=True, dtype='float64')[0].T.mean(0); tl = json.load(open(arg('--timeline'))); pk = np.abs(v).max(); d = np.abs(np.diff(v)); rows = []
    typ = float(np.percentile(d[np.abs(v[1:]) > 0.05 * pk], 99))   # the largest steps ordinary speech makes
    for l in tl['lines']:
        if not l.get('voice'): continue
        n = sf.info(f"{ROOT}/{l['voice']}"); L_ = n.frames / n.samplerate
        side = f"{ROOT}/{l['voice'][:-4]}.json"; inner = []
        for edge, t in [('start', l['speechStart']), ('end', l['speechStart'] + L_)]:
            i = int(round(t * SR)); a, b = max(0, i - 144), min(len(d), i + 144); rows.append({'clip': l['id'], 'edge': edge, 'at_s': round(t, 3), 'largest_step_db': round(float(20 * np.log10(d[a:b].max() / pk + 1e-9)), 1), 'level_db': round(float(20 * np.log10(np.abs(v[a:b]).max() / pk + 1e-9)), 1)})
    out['voice_stem'] = {'peak_dbfs': round(float(20 * np.log10(pk)), 2), 'samples_at_0.999': int((np.abs(v) >= 0.999).sum()), 'boundaries': len(rows), 'ordinary_speech_step_99pct_db': round(float(20 * np.log10(typ / pk)), 1),
                         'loudest_step_at_a_boundary_db': max(q['largest_step_db'] for q in rows), 'boundaries_with_a_step_over_-40_db': [q for q in rows if q['largest_step_db'] > -40], 'boundaries_with_level_over_-30_db': [q for q in rows if q['level_db'] > -30]}
if arg('--voice-stem'):
    # the real pauses: for each voice file, each run quieter than −29 dB under its own peak (20 ms RMS) that lies between two words no full stop separates
    rows = []
    for l in tl['lines']:
        if not l.get('voice'): continue
        xv, srv = sf.read(f"{ROOT}/{l['voice']}", dtype='float64'); w_ = int(0.02 * srv); e_ = np.sqrt(np.convolve(xv ** 2, np.ones(w_) / w_, 'same')); q_ = 20 * np.log10(e_ / e_.max() + 1e-6) < -29
        for k_ in range(len(l['words']) - 1):
            if re.search(r'[.!?]["”’)]?$', l['words'][k_]['w']): continue
            a_, b_ = int((l['words'][k_]['t0'] - l['speechStart']) * srv), int((l['words'][k_ + 1]['t1'] - l['speechStart']) * srv); run = best = 0
            for v_ in q_[max(0, a_):b_]: run = run + 1 if v_ else 0; best = max(best, run)
            if best / srv > 0.2: rows.append({'shot': l['id'], 'after': l['words'][k_]['w'], 'before': l['words'][k_ + 1]['w'], 'silence_s': round(best / srv, 2)})
    out['pauses_inside_sentences_in_the_voice_files'] = {'over_0.35_s': [r_ for r_ in rows if r_['silence_s'] > 0.35], 'longest': sorted(rows, key=lambda r_: -r_['silence_s'])[:8]}
print(json.dumps({k: v for k, v in out.items() if k != 'recogniser'} | ({'recogniser': {k: v for k, v in out['recogniser'].items() if k != 'words'}} if 'recogniser' in out else {}), indent=1))
if arg('--out'): json.dump(out, open(arg('--out'), 'w'), indent=1)
