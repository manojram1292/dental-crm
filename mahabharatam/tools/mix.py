#!/usr/bin/env python3
"""
Mix whatever stems exist into audio/mix.<lang>.wav (what tools/render.mjs muxes).

  music  audio/music.wav            (tools/score.py; must match the current timeline)
  voice  voice/<lang>/<line id>.wav (optional, any sample rate / channels / PCM16/24/32/float32)

Each voice line is placed at its line's speechStart from build/timeline.<lang>.json,
the narration stem is normalised to −16 LUFS, and the music is ducked under
it (−8 dB, 60 ms attack / 400 ms release, keyed by the voice's own envelope).
With no voice files the mix is the music stem as-is (≈ −22 LUFS, a bed).
Ceiling −1 dBTP.

    python3 tools/mix.py [--lang en]
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal as sps
from scipy.ndimage import maximum_filter1d, uniform_filter1d

sys.path.insert(0, os.path.dirname(__file__))
from score import SR, ROOT, lufs, true_peak_db, write_wav, db  # noqa: E402

VOICE_LUFS = -16.0
DUCK_DB = 8.0


def read_wav(path):
    """Read a RIFF WAV (PCM 16/24/32 or IEEE float 32) → float (2, n) at SR."""
    with open(path, 'rb') as f:
        b = f.read()
    assert b[:4] == b'RIFF' and b[8:12] == b'WAVE', f'{path}: not a WAV file'
    off, fmt, data = 12, None, None
    while off + 8 <= len(b):
        cid, ln = b[off:off + 4], int.from_bytes(b[off + 4:off + 8], 'little')
        if cid == b'fmt ':
            fmt = b[off + 8:off + 8 + ln]
        elif cid == b'data':
            data = b[off + 8:off + 8 + ln]
            break
        off += 8 + ln + (ln & 1)
    tag, ch, sr = int.from_bytes(fmt[0:2], 'little'), int.from_bytes(fmt[2:4], 'little'), int.from_bytes(fmt[4:8], 'little')
    bits = int.from_bytes(fmt[14:16], 'little')
    if tag == 0xFFFE:
        tag = int.from_bytes(fmt[24:26], 'little')
    if tag == 3 and bits == 32:
        x = np.frombuffer(data, '<f4').astype(np.float64)
    elif bits == 16:
        x = np.frombuffer(data, '<i2') / 32768.0
    elif bits == 24:
        a = np.frombuffer(data, np.uint8).reshape(-1, 3).astype(np.int32)
        v = a[:, 0] | (a[:, 1] << 8) | (a[:, 2] << 16)
        x = np.where(v >= 1 << 23, v - (1 << 24), v) / float(1 << 23)
    elif bits == 32:
        x = np.frombuffer(data, '<i4') / 2147483648.0
    else:
        raise ValueError(f'{path}: unsupported WAV format (tag {tag}, {bits} bit)')
    x = x[: len(x) // ch * ch].reshape(-1, ch).T
    x = np.vstack([x[0], x[0]]) if ch == 1 else x[:2]
    if sr != SR:
        g = np.gcd(sr, SR)
        x = sps.resample_poly(x, SR // g, sr // g, axis=-1)
    return x


def main():
    args = sys.argv[1:]
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'
    tl = json.load(open(os.path.join(ROOT, 'build', f'timeline.{lang}.json')))
    N = int(round(tl['duration'] * SR))
    music_path = os.path.join(ROOT, 'audio', 'music.wav')
    side = os.path.join(ROOT, 'audio', 'music.json')
    if not os.path.exists(music_path):
        sys.exit('audio/music.wav missing: run `python3 tools/score.py --lang %s`' % lang)
    stamp = json.load(open(side))['stamp'] if os.path.exists(side) else {}
    if stamp.get('timeline') != tl['signature']:
        sys.exit(f'audio/music.wav was scored for timeline {stamp.get("timeline")}, not {tl["signature"]} ({lang}): run `python3 tools/score.py --lang {lang}`')
    music = read_wav(music_path)[:, :N]
    music = np.pad(music, ((0, 0), (0, N - music.shape[1])))

    voice = np.zeros((2, N))
    placed = []
    for l in tl['lines']:
        if not l.get('voice'):
            continue
        v = read_wav(os.path.join(ROOT, l['voice']))
        i0 = int(round(l['speechStart'] * SR))
        n = min(v.shape[1], N - i0)
        if n > 0:
            voice[:, i0:i0 + n] += v[:, :n]
            placed.append(l['id'])

    if placed:
        voice *= db(VOICE_LUFS - lufs(voice))
        # duck the music under the voice
        e = np.abs(voice).max(0)
        e = maximum_filter1d(e, int(0.03 * SR))
        key = np.clip((20 * np.log10(e + 1e-9) + 45) / 15, 0, 1)        # 0 below −45 dBFS, 1 above −30
        hold = maximum_filter1d(key, int(0.4 * SR))                      # bridge the gaps between words
        g_db = -DUCK_DB * uniform_filter1d(hold, int(0.06 * SR))
        mix = music * db(g_db) + voice
    else:
        mix = music.copy()
    tp = true_peak_db(mix)
    if tp > -1.0:
        mix *= db(-1.0 - tp)
    out = os.path.join(ROOT, 'audio', f'mix.{lang}.wav')
    write_wav(out, mix)
    print(f'wrote audio/mix.{lang}.wav  {tl["duration"]:.2f} s  {lufs(mix):.1f} LUFS  {true_peak_db(mix):.2f} dBTP  '
          f'voice lines: {", ".join(placed) if placed else "none (music only)"}')


if __name__ == '__main__':
    main()
