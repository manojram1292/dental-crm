#!/usr/bin/env python3
"""Candidate C: Chatterbox (ResembleAI/chatterbox, MIT) through its ONNX export (onnx-community/chatterbox-ONNX, MIT),
onnxruntime on CPU, no torch. Language model: the 4-bit file (language_model_q4, 354 MB); the other three parts fp32.

    venv/bin/python cb.py --jobs jobs.json --out DIR [--ref default|PATH.wav] [--seeds 2] [--exag 0.5] [--temp 0.8]

jobs.json: [{"id": "family", "text": "Ruru was a young sage of Bhrigu's line."}, ...]
Writes DIR/<id>.s<seed>.wav (24 kHz mono) and DIR/log.json (seconds of compute per take).
The reference voice is the model's own default_voice.wav unless --ref names a clip (here: one made by Kokoro; no real person).
Sampling (the published ONNX example is greedy, which is flat): temperature, min-p 0.05, repetition penalty 1.2, as the
torch package's defaults. Classifier-free guidance is not in the ONNX export.
"""
import argparse, json, os, time
import numpy as np
import onnxruntime as ort
import soundfile as sf
from scipy import signal as sps
from tokenizers import Tokenizer

HERE = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(HERE, 'venv', 'models', 'cb')
SR = 24000
START_SPEECH, STOP_SPEECH = 6561, 6562


class CB:
    def __init__(self, threads=3):
        so = ort.SessionOptions()
        so.intra_op_num_threads = threads
        s = lambda n: ort.InferenceSession(os.path.join(M, 'onnx', n + '.onnx'), so, providers=['CPUExecutionProvider'])
        self.enc, self.emb, self.lm, self.dec = s('speech_encoder'), s('embed_tokens'), s('language_model_q4'), s('conditional_decoder')
        self.tok = Tokenizer.from_file(os.path.join(M, 'tokenizer.json'))
        self.ref = None

    def set_ref(self, path):
        x, sr = sf.read(path, dtype='float32', always_2d=True)
        x = x.mean(1)
        if sr != SR:
            g = np.gcd(sr, SR)
            x = sps.resample_poly(x, SR // g, sr // g).astype(np.float32)
        self.ref = self.enc.run(None, {'audio_values': x[None, :]})   # cond_emb, prompt_token, ref_x_vector, prompt_feat

    def say(self, text, seed=0, exag=0.5, temp=0.8, min_p=0.05, rep=1.2, max_new=400):
        rng = np.random.default_rng(seed)
        cond_emb, prompt_token, xvec, feat = self.ref
        ids = np.array([self.tok.encode(text).ids], dtype=np.int64)
        pos = np.where(ids >= START_SPEECH, 0, np.arange(ids.shape[1])[None, :] - 1)
        ex = np.array([exag], dtype=np.float32)
        x = self.emb.run(None, {'input_ids': ids, 'position_ids': pos, 'exaggeration': ex})[0]
        x = np.concatenate((cond_emb, x), axis=1)
        past = {f'past_key_values.{l}.{kv}': np.zeros([1, 16, 0, 64], np.float32) for l in range(30) for kv in ('key', 'value')}
        mask = np.ones((1, x.shape[1]), np.int64)
        gen = [START_SPEECH]
        for i in range(max_new):
            logits, *present = self.lm.run(None, dict(inputs_embeds=x, attention_mask=mask, **past))
            lg = logits[0, -1, :].astype(np.float64)
            g = np.array(gen)
            sc = lg[g]
            lg[g] = np.where(sc < 0, sc * rep, sc / rep)
            if temp <= 0:
                nxt = int(np.argmax(lg))
            else:
                p = np.exp((lg - lg.max()) / temp)
                p /= p.sum()
                p[p < min_p * p.max()] = 0
                p /= p.sum()
                nxt = int(rng.choice(len(p), p=p))
            gen.append(nxt)
            if nxt == STOP_SPEECH:
                break
            x = self.emb.run(None, {'input_ids': np.array([[nxt]], np.int64), 'position_ids': np.array([[i + 1]], np.int64), 'exaggeration': ex})[0]
            mask = np.concatenate([mask, np.ones((1, 1), np.int64)], axis=1)
            for j, key in enumerate(past):
                past[key] = present[j]
        complete = gen[-1] == STOP_SPEECH
        st = np.array([gen[1:-1] if complete else gen[1:]], np.int64)
        st = np.concatenate([prompt_token, st], axis=1)
        wav = self.dec.run(None, {'speech_tokens': st, 'speaker_embeddings': xvec, 'speaker_features': feat})[0]
        return np.squeeze(wav).astype(np.float32), complete, len(gen) - 2


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--jobs', required=True); ap.add_argument('--out', required=True); ap.add_argument('--ref', default='default')
    ap.add_argument('--seeds', default='0,1'); ap.add_argument('--exag', type=float, default=0.5); ap.add_argument('--temp', type=float, default=0.8)
    ap.add_argument('--threads', type=int, default=3)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    t0 = time.time()
    cb = CB(a.threads)
    cb.set_ref(os.path.join(M, 'default_voice.wav') if a.ref == 'default' else a.ref)
    log = {'load_s': round(time.time() - t0, 1), 'ref': a.ref, 'exag': a.exag, 'temp': a.temp, 'takes': []}
    print('loaded in', log['load_s'], 's', flush=True)
    for job in json.load(open(a.jobs)):
        for seed in map(int, a.seeds.split(',')):
            fn = os.path.join(a.out, f"{job['id']}.s{seed}.wav")
            if os.path.exists(fn):
                continue
            t = time.time()
            wav, complete, ntok = cb.say(job['text'], seed=seed, exag=job.get('exag', a.exag), temp=a.temp)
            sf.write(fn, wav, SR)
            row = {'id': job['id'], 'seed': seed, 'text': job['text'], 'audio_s': round(len(wav) / SR, 2), 'compute_s': round(time.time() - t, 1), 'tokens': ntok, 'complete': complete}
            log['takes'].append(row)
            print(row, flush=True)
            json.dump(log, open(os.path.join(a.out, 'log.json'), 'w'), indent=1)
    log['total_s'] = round(time.time() - t0, 1)
    json.dump(log, open(os.path.join(a.out, 'log.json'), 'w'), indent=1)
