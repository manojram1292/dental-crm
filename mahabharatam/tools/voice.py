#!/usr/bin/env python3
"""Narration and dialogue: script/epNN.<lang>.json → voice/epNN/<lang>/<id>.wav with Kokoro
(82M, Apache-2.0), one voice per speaker.

    python3 -I tools/voice.py --model DIR [--ep 2] [--lang en] [--only id,id] [--dry]

DIR holds Kokoro's model.onnx and voice .bin files (onnx-community/Kokoro-82M-v1.0-ONNX).

Who speaks how:
  · each line's `speaker` (default "narrator") picks an entry in script/cast.json:
      { voice, speed, pitch (semitones), g2p }   — the character bible's voice
  · per line: `speed` multiplies the speaker's speed; `pre` / `post` (ms) are the
    silences before / after the voice (tools/timeline.mjs uses them)
  · `say` (default: `text`) is what is spoken, with inline modulation:
      …  or ...      a pause (script voice.pauses.ellipsis, default 350 ms)
      —              a pause (voice.pauses.dash, default 240 ms)
      [p:400]        a 400 ms pause
      {s:0.8}        what follows is spoken at 0.8 × (until the next {s:…}; {s} resets)
    A line is synthesised chunk by chunk (split at pauses and speed changes) and
    joined with exact silences. voice/epNN/<lang>/<id>.json records each chunk's
    time and word count, so the timeline can place caption words inside their chunk.
  · pitch: synthesised at speed/f then resampled by f = 2^(pitch/12): the pitch moves,
    the tempo stays where the cast says.
Sanskrit names are spoken from the hand-written phonemes in NAMES, not English spelling.
--dry prints the chunks and phonemes without synthesising.
"""
import argparse, glob, json, os, re
import numpy as np

NAMES = {  # IPA, as Kokoro's phoneme set spells it
    "Naimisha": "nˈaɪmɪʃə",
    "Ugrashravas": "ˈʊɡɹəʃɹəvəs",
    "Lomaharshana": "lˌoʊməhˈɑːɹʃənə",
    "Janamejaya's": "dʒˌʌnəmˈeɪdʒəjəz",
    "Vyasa": "vjˈɑːsə",
    "Mahabharatam": "məhˌɑːbˈɑːɹətəm",
    # episode 2
    "Samantapanchaka": "sˌʌməntəpˈʌnʧəkə",
    "Parashurama": "pˌʌɹəʃʊɹˈɑːmə",
    "Suta": "sˈuːtə",
    "Kshatriya": "kʃˈʌtɹɪjə",
    "Kshatriyas": "kʃˈʌtɹɪjəz",
}

ap = argparse.ArgumentParser()
ap.add_argument('--model', required=True)
ap.add_argument('--ep', type=int, default=1)
ap.add_argument('--lang', default='en')
ap.add_argument('--only', default='')
ap.add_argument('--dry', action='store_true')
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tag = f'ep{a.ep:02d}'
script = json.load(open(f'{root}/script/{tag}.{a.lang}.json'))
cast = json.load(open(f'{root}/script/cast.json'))
pauses = {'ellipsis': 350, 'dash': 240, **script.get('voice', {}).get('pauses', {})}
out_dir = f'{root}/voice/{tag}/{a.lang}'
only = set(filter(None, a.only.split(',')))

MARK = re.compile(r'\[p:(\d+)\]|\{s(?::([\d.]+))?\}')


def chunks_of(say):
    """→ [{words: [...], mult, pause (ms after)}]. Words are whitespace tokens, like the captions'."""
    s = MARK.sub(lambda m: f' ⟦p{m.group(1)}⟧ ' if m.group(1) else f' ⟦s{m.group(2) or "1"}⟧ ', say)
    out, cur, mult = [], [], 1.0

    def close(pause):
        nonlocal cur
        if cur:
            out.append({'words': cur, 'mult': mult, 'pause': pause})
        elif out:
            out[-1]['pause'] += pause
        cur = []
    for tk in s.split():
        if tk.startswith('⟦p'):
            close(int(tk[2:-1]))
        elif tk.startswith('⟦s'):
            close(0)
            mult = float(tk[2:-1])
        else:
            cur.append(tk)
            if tk in ('—', '–') or tk.endswith('—'):
                close(pauses['dash'])
            elif (tk.endswith('…') or tk.endswith('...')) and tk.strip('….') :
                close(pauses['ellipsis'])
    close(0)
    if out:
        out[-1]['pause'] = 0
    return out


def spoken(words):
    t = ' '.join(w for w in words if w not in ('—', '–'))
    t = t.replace('...', '…').strip('…').replace('…', ',').replace('—', ',').strip()
    return t


if not a.dry:
    import soundfile as sf
    from scipy import signal as sps
    from kokoro_onnx import Kokoro
    from kokoro_onnx.tokenizer import Tokenizer
    vs = {os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob(a.model + '/*.bin')}
    np.savez(a.model + '/voices.npz', **vs)
    k = Kokoro(a.model + '/model.onnx', a.model + '/voices.npz')
    tok = Tokenizer()
else:
    from kokoro_onnx.tokenizer import Tokenizer
    tok = Tokenizer()

pat = re.compile(r'(?<![\w])(' + '|'.join(sorted(map(re.escape, NAMES), key=len, reverse=True)) + r')(?![\w])')


def phonemes(text, g2p):
    def seg(p):
        if p in NAMES:
            return NAMES[p]
        if not p.strip():
            return p
        return (' ' if p[0] == ' ' else '') + tok.phonemize(p.strip(), g2p) + (' ' if p[-1] == ' ' else '')
    return ''.join(seg(p) for p in pat.split(text))


def trim(x, sr, head=0.01, tail=0.04):
    nz = np.nonzero(np.abs(x) > 0.01)[0]
    if not len(nz):
        return x
    return x[max(0, nz[0] - int(head * sr)): nz[-1] + int(tail * sr)]


os.makedirs(out_dir, exist_ok=True)
for line in script['lines']:
    if only and line['id'] not in only:
        continue
    spk = line.get('speaker', 'narrator')
    c = cast[spk]
    f = 2 ** (c.get('pitch', 0) / 12)
    base = c['speed'] * line.get('speed', 1.0)
    chunks = chunks_of(line.get('say', line['text']))
    n_caption = len(line['text'].split())
    n_chunks = sum(len(ch['words']) for ch in chunks)
    pitch_s = ' pitch %+g st' % c['pitch'] if c.get('pitch') else ''
    print(f"{line['id']:12s} {spk:11s} {c['voice']} speed {base:.2f}{pitch_s}"
          f"  pre {line.get('pre', '-')} post {line.get('post', '-')}  words {n_chunks}/{n_caption}")
    pieces, meta, t = [], [], 0.0
    sr = 24000
    for i, ch in enumerate(chunks):
        txt = spoken(ch['words'])
        ph = phonemes(txt, c.get('g2p', 'en-gb' if c['voice'].startswith('b') else 'en-us'))
        sp = base * ch['mult']
        print(f"   · {sp:.2f}×  {txt!r:52s} → {ph}   (+{ch['pause']} ms)")
        if a.dry:
            continue
        audio, sr = k.create(ph, voice=c['voice'], speed=sp / f, is_phonemes=True)
        audio = trim(audio, sr, 0.02 if i else 0.02, 0.1 if i == len(chunks) - 1 else 0.05)
        if abs(f - 1) > 1e-3:
            # resample so that playing at sr shifts the pitch by f (and the tempo back to `sp`)
            up = 1000
            down = int(round(1000 * f))
            g = np.gcd(up, down)
            audio = sps.resample_poly(audio, up // g, down // g).astype(np.float32)
        d = len(audio) / sr
        meta.append({'t0': round(t, 4), 't1': round(t + d, 4), 'words': len(ch['words']), 'speed': round(sp, 3), 'text': txt})
        pieces.append(audio)
        t += d
        if ch['pause']:
            pieces.append(np.zeros(int(sr * ch['pause'] / 1000), np.float32))
            t += ch['pause'] / 1000
    if a.dry:
        continue
    audio = np.concatenate(pieces)
    # even loudness line to line: active RMS −21 dBFS, peaks ≤ −1 dBFS
    act = np.abs(audio) > 0.005
    g = 10 ** ((-21 - 20 * np.log10(np.sqrt(np.mean(audio[act] ** 2)) + 1e-9)) / 20)
    g = min(g, 10 ** (-1 / 20) / (np.abs(audio).max() + 1e-9))
    audio = (audio * g).astype(np.float32)
    sf.write(f"{out_dir}/{line['id']}.wav", audio, sr)
    side = f"{out_dir}/{line['id']}.json"
    json.dump({'speaker': spk, 'voice': c['voice'], 'speed': base, 'pitch': c.get('pitch', 0), 'chunks': meta,
               'note': 'written by tools/voice.py: chunk times in the wav (s) and how many caption words each holds'}, open(side, 'w'), indent=1)
    rms = 20 * np.log10(np.sqrt(np.mean(audio[np.abs(audio) > 0.005] ** 2)) + 1e-9)
    print(f"   = {len(audio) / sr:5.2f}s  active rms {rms:5.1f} dBFS  peak {20 * np.log10(np.abs(audio).max() + 1e-9):5.1f} dBFS")
