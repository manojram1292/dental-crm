#!/usr/bin/env python3
"""
Mix whatever stems exist into audio/epNN/mix.<lang>.wav (what tools/render.mjs muxes).

  music  audio/epNN/music.wav            (tools/score.py; must match the current timeline)
  voice  voice/epNN/<lang>/<line id>.wav (optional, any sample rate / channels / PCM16/24/32/float32)

Each voice line is placed at its line's speechStart from build/timeline.<lang>.json,
the narration stem is lightened (VOICE_EQ: a gentle 90 Hz high-pass, a −4 dB low shelf
at 170 Hz and a −1.5 dB air shelf at 7.5 kHz: less boom, softer edges; no compressor),
then normalised to −16 LUFS, and the music is ducked under
it (−8 dB, 60 ms attack / 400 ms release, keyed by the voice's own envelope).
A silent Next card (a line with "voice": false at the end) sits 9 dB under the rest: the card is quiet.
MASTER (from the November remaster; independent review item 3): the mix is brought to −14 LUFS
integrated with a look-ahead true-peak limiter at −1 dBTP (4× oversampled peaks, a 10 ms min-hold
and an 8 ms smoothing window, so the gain is never above what any peak allows). Before this the
whole mix was only peak-normalised and released at −19 to −21 LUFS.

    python3 tools/mix.py [--ep 1] [--lang en]
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal as sps
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

sys.path.insert(0, os.path.dirname(__file__))
from score import SR, ROOT, lufs, true_peak_db, write_wav, db, ep_tag  # noqa: E402

VOICE_LUFS = -16.0
DUCK_DB = 8.0
# Voice-stem EQ ("lighter, less heavy and boomy, softer"): (kind, freq Hz, gain dB, Q or slope)
VOICE_EQ = [('hp', 90.0, 0.0, 0.707), ('lowshelf', 170.0, -4.0, 0.8), ('highshelf', 7500.0, -1.5, 0.7)]


def biquad(kind, f0, gain_db, q):
    """RBJ audio-EQ-cookbook biquad → (b, a). Shelves take q as the slope S."""
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    c, s = np.cos(w), np.sin(w)
    if kind == 'hp':
        al = s / (2 * q)
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
        a = [1 + al, -2 * c, 1 - al]
    else:
        al = s / 2 * np.sqrt((A + 1 / A) * (1 / q - 1) + 2)
        sq = 2 * np.sqrt(A) * al
        if kind == 'lowshelf':
            b = [A * ((A + 1) - (A - 1) * c + sq), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - sq)]
            a = [(A + 1) + (A - 1) * c + sq, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - sq]
        else:
            b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
            a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    b, a = np.array(b), np.array(a)
    return b / a[0], a / a[0]


def voice_eq(x):
    for kind, f0, g, q in VOICE_EQ:
        x = sps.lfilter(*biquad(kind, f0, g, q), x, axis=-1)
    return x


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


TARGET_LUFS_MASTER = -14.0
CEIL = -1.0


def limit(x, ceil_db=CEIL):
    """Look-ahead true-peak limiter: per-sample gain from 4×-oversampled peaks, min-held over 10 ms and
    averaged over 8 ms (an average of a wider min-hold never exceeds the gain any peak needs)."""
    c = db(ceil_db - 1.0)   # 1 dB of headroom for the AAC encode (sharp voice onsets overshoot by up to +1.9 dB on the mp4)
    up = sps.resample_poly(np.abs(x).max(0), 4, 1)
    pk = up.reshape(-1, 4).max(1) if len(up) % 4 == 0 else np.pad(up, (0, (-len(up)) % 4)).reshape(-1, 4).max(1)
    pk = np.maximum(pk[:x.shape[1]], np.abs(x).max(0))
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    g = minimum_filter1d(g, int(0.010 * SR))
    g = uniform_filter1d(g, int(0.008 * SR))
    return x * g


def master(x):
    for _ in range(4):
        x = x * db(TARGET_LUFS_MASTER - lufs(x))
        x = limit(x)
        if abs(lufs(x) - TARGET_LUFS_MASTER) < 0.2 and true_peak_db(x) <= CEIL:
            break
    if true_peak_db(x) > CEIL:
        x = x * db(CEIL - 0.05 - true_peak_db(x))
    return x


def main():
    args = sys.argv[1:]
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'
    ep, tag = ep_tag(args)
    tl = json.load(open(os.path.join(ROOT, 'build', f'timeline.{tag}.{lang}.json')))
    N = int(round(tl['duration'] * SR))
    music_path = os.path.join(ROOT, 'audio', tag, 'music.wav')
    side = os.path.join(ROOT, 'audio', tag, 'music.json')
    if not os.path.exists(music_path):
        sys.exit(f'audio/{tag}/music.wav missing: run `python3 tools/score.py --ep {ep} --lang {lang}`')
    stamp = json.load(open(side))['stamp'] if os.path.exists(side) else {}
    if stamp.get('timeline') != tl['signature']:
        sys.exit(f'audio/{tag}/music.wav was scored for timeline {stamp.get("timeline")}, not {tl["signature"]} ({lang}): run `python3 tools/score.py --ep {ep} --lang {lang}`')
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
        voice = voice_eq(voice)
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
    # the silent Next card(s) at the end: 9 dB down, faded in over 0.25 s
    for l in tl['lines']:
        if l['id'] == 'next' and not l.get('voice'):
            i0, i1 = int(l['start'] * SR), N
            g = np.ones(N)
            ramp = min(int(0.25 * SR), i1 - i0)
            g[i0:i0 + ramp] = np.linspace(1, db(-9.0), ramp)
            g[i0 + ramp:i1] = db(-9.0)
            mix = mix * g
    # a 350 ms fade-in: a hard onset in the first AAC frames overshoots by up to +2 dB after encoding
    n0 = int(0.35 * SR)
    mix[:, :n0] *= np.linspace(0, 1, n0) ** 1.5
    mix = master(mix)
    out = os.path.join(ROOT, 'audio', tag, f'mix.{lang}.wav')
    write_wav(out, mix)
    print(f'wrote audio/{tag}/mix.{lang}.wav  {tl["duration"]:.2f} s  {lufs(mix):.1f} LUFS  {true_peak_db(mix):.2f} dBTP  '
          f'voice lines: {", ".join(placed) if placed else "none (music only)"}')


if __name__ == '__main__':
    main()
