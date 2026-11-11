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
      …  or ...      a pause (script voice.pauses.ellipsis, default 420 ms)
      —              a pause (voice.pauses.dash, default 280 ms)
      ,  ;  :        a short pause (voice.pauses.comma, default 80 ms, on top of the chunk's own breath)
      .  ?  !        mid-line, a sentence pause (voice.pauses.stop, default 250 ms)
      [p:400]        a 400 ms pause
      {s:0.8}        what follows is spoken at 0.8 × (until the next {s:…}; {s} resets)
    An explicit [p:N] right after punctuation replaces its automatic pause (the longer wins).
    A line is synthesised chunk by chunk (split at pauses and speed changes) and
    joined with exact silences. voice/epNN/<lang>/<id>.json records each chunk's
    time and word count, so the timeline can place caption words inside their chunk.
  · pitch: synthesised at speed/f then resampled by f = 2^(pitch/12): the pitch moves,
    the tempo stays where the cast says.
Sanskrit names (and a few English words espeak gets wrong) are spoken from the hand-written
phonemes in NAMES, not English spelling. An entry is one IPA string, or {g2p: IPA} when the
American and British voices need different vowels. Conventions (Sanskrit in English): short a →
ʌ (stressed) / ə, long ā → ɑː, aspirated bh → bʰ, r between vowels → the tap ɾ, retroflex ṇ → ɳ
(ṭ ḍ approximated by t d), ś / ṣ → ʃ, c → ʧ, e → eɪ, o → oʊ (GB əʊ), au → aʊ.
--dry prints the chunks and phonemes without synthesising.
"""
import argparse, glob, json, os, re
import numpy as np

NAMES = {  # IPA, as Kokoro's phoneme set spells it (see the conventions above)
    # the epic, its author and its tellers
    "Mahabharatam": "məhˌɑːbʰˈɑːɾətəm",                 # mə-HAA-bhaa-ra-tam
    "Mahabharata": "məhˌɑːbʰˈɑːɾətə",
    "Vyasa": "vjˈɑːsə",                                  # VYAA-sa
    "Vyasa's": "vjˈɑːsəz",
    "Sauti": "sˈaʊti",                                   # SOW-tee
    "Suta": "sˈuːtə",                                    # SOO-ta
    "Ugrashravas": "ˌʊɡɹəʃɹˈʌvəs",                       # oo-gra-SHRA-vas
    "Lomaharshana": {"en-us": "lˌoʊməhˈʌɹʃəɳə", "en-gb": "lˌəʊməhˈʌɹʃəɳə"},   # lo-ma-HAR-sha-na
    "Naimisha": "nˈaɪmɪʃə",                              # NAI-mi-sha
    "Shaunaka": "ʃˈaʊnəkə",                              # SHOW-na-ka
    "Janamejaya": "dʒˌʌnəmˈeɪdʒəjə",                     # ja-na-MAY-ja-ya
    "Janamejaya's": "dʒˌʌnəmˈeɪdʒəjəz",
    "Vaishampayana": "vˌaɪʃəmpˈɑːjənə",
    # episode 2
    "Samantapanchaka": "sˌʌməntəpˈʌnʧəkə",               # sa-man-ta-PAN-cha-ka
    "Parashurama": "pˌʌɾəʃʊɾˈɑːmə",                      # pa-ra-shu-RAA-ma
    "Kshatriya": "kʃˈʌtɹɪjə",
    "Kshatriyas": "kʃˈʌtɹɪjəz",
    "Kurukshetra": "kˌʊɾʊkʃˈeɪtɹə",
    # episode 3
    "akshauhini": {"en-us": "ˈʌkʃoʊhɪɳiː", "en-gb": "ˈʌkʃəʊhɪɳiː"},          # UK-show-hi-nee
    "akshauhinis": {"en-us": "ˈʌkʃoʊhɪɳiːz", "en-gb": "ˈʌkʃəʊhɪɳiːz"},
    "patti": "pˈʌtiː",                                   # PUT-tee
    # episode 4 (Team A)
    "Ganesha": "ɡʌnˈeɪʃə",                               # ga-NAY-sha
    "Ganesha's": "ɡʌnˈeɪʃəz",
    "Dvaipayana": "dvˌaɪpˈɑːjənə",                       # dvai-PAA-ya-na
    "arrived": "əɹˈaɪvd",                                # espeak: "ɚɹˈaɪvd" after "storyteller"
    # episodes 5–6 (Paushya parva)
    "Sarama": "sˈʌɾəmˌɑː",                               # SA-ra-maa
    "Sarama's": "sˈʌɾəmˌɑːz",
    "Shrutasena": "ʃɾˌʊtəsˈeɪnə",                        # shru-ta-SAY-na
    "Ugrasena": "ˌʊɡɹəsˈeɪnə",                           # oo-gra-SAY-na
    "Bhimasena": "bʰˌiːməsˈeɪnə",                        # bhee-ma-SAY-na
    "Hastinapura": "hˌʌstɪnˈɑːpʊɾə",                     # has-ti-NAA-pu-ra
    "Uttanka": "ʊtˈʌŋkə",                                # ut-TUNG-ka
    "Paushya": "pˈaʊʃjə",                                # POW-shya
    "Paushya's": "pˈaʊʃjəz",
    "Takshaka": "tˈʌkʃəkə",                              # TUCK-sha-ka
    "Naga": "nˈɑːɡə",                                    # NAA-ga
    "Nagas": "nˈɑːɡəz",
    "Parikshit": "pˈʌɾɪkʃɪt",                            # PA-rik-shit
    "Parikshit's": "pˈʌɾɪkʃɪts",
    # episodes 7–10 (Astika parva: the curse of Parikshit, the snake sacrifice, Kadru and Vinata, Garuda)
    "Shamika": "ʃˈʌmiːkə",                               # SHA-mee-ka (Śamīka)
    "Shamika's": "ʃˈʌmiːkəz",
    "Shringin": "ʃɹˈɪŋɡɪn",                              # SHRING-gin (Śṛṅgin)
    "Kashyapa": "kˈʌʃjəpə",                              # KUSH-ya-pa
    "Kadru": "kˈʌdɹuː",                                  # KUD-roo
    "Vinata": "vˈɪnətˌɑː",                               # VI-na-taa (Vinatā)
    "Vinata's": "vˈɪnətˌɑːz",
    "Uchchaihshravas": "ˌʊʧʧaɪʃɹˈʌvəs",                  # ooch-chai-SHRA-vas
    "Garuda": "ɡˈʌɾʊdə",                                 # GA-ru-da
    "Aruna": "ˈʌɾʊɳə",                                   # A-ru-na
    "amrita": "ˈʌmɹɪtə",                                 # UM-ri-ta (amṛta)
    "Indra": "ˈɪndɹə",
    "Indra's": "ˈɪndɹəz",
    "Vasuki": "vˈɑːsʊki",
    "Vasuki's": "vˈɑːsʊkiz",                                # VAA-su-ki
    "Astika": "ˈɑːstiːkə",                               # AAS-tee-ka
    "Abhimanyu": "ˌʌbʰɪmˈʌnjuː",
    "sarpa": "sˈʌɹpə",
    "satra": "sˈʌtɹə",
    "mantras": "mˈʌntɹəz",
    "Nagas'": "nˈɑːɡəz",
    # episodes 11–16 (the churning of the ocean)
    "Narayana": "nɑːɾˈɑːjəɳə",                           # naa-RAA-ya-na (Nārāyaṇa)
    "Narayana's": "nɑːɾˈɑːjəɳəz",
    "Meru": "mˈeɪɾuː",                                   # MAY-roo
    "asuras": "ˈʌsʊɾəz",                                 # UH-su-raz
    "asura": "ˈʌsʊɾə",
    "devas": "dˈeɪvəz",                                  # DAY-vaz
    "Brahma": "bɹˈʌhmɑː",                                # BRUH-maa (Brahmā)
    "Brahma's": "bɹˈʌhmɑːz",
    "Mandara": "mˈʌndəɾə",                               # MUN-da-ra
    "Ananta": "ənˈʌntə",                                 # a-NUN-ta
    "Akupara": "ˌɑːkuːpˈɑːɾə",                           # aa-koo-PAA-ra (Akūpāra)
    "Shesha": "ʃˈeɪʃə",                                  # SHAY-sha
    "Shri": "ʃɹˈiː",                                     # SHREE (Śrī)
    "Kaustubha": "kˈaʊstʊbʰə",                           # KOWS-tu-bha
    "Dhanvantari": "dʰˌʌnvˈʌntəɾi",                      # dhun-VUN-ta-ri
    "ghee": "ɡˈiː",
    "kalakuta": "kˌɑːləkˈuːʈə",                          # kaa-la-KOO-ta (kālakūṭa)
    "Mahadeva": "məhˌɑːdˈeɪvə",                          # ma-haa-DAY-va
    "Shiva": "ʃˈɪvə",                                    # SHI-va
    "Nilakantha": "nˌiːləkˈʌɳʈʰə",                       # nee-la-KUN-tha
    "Rahu": "ɾˈɑːhuː",                                   # RAA-hoo
    "Rahu's": "ɾˈɑːhuːz",
    "Sudarshana": "sʊdˈʌɹʃənə",                          # su-DUR-sha-na
    "Nara": "nˈʌɾə",                                     # NUH-ra
    "Agni": "ˈʌɡni",                                     # UG-nee
    "Vibhavasu": "vˌɪbʰɑːvˈʌsuː",
    "Ramaniyaka": "ɾˌʌməɳˈiːjəkə",                       # ra-ma-NEE-ya-ka
    # episodes 21–30 (the Garuda arc: the Nishadas, the brahmin, the elephant and the tortoise, the Valakhilyas, heaven)
    "Nishada": "nɪʃˈɑːdə",                               # ni-SHAA-da
    "Nishadas": "nɪʃˈɑːdəz",
    "Nishadi": "nɪʃˈɑːdiː",                              # ni-SHAA-dee (a Nishada woman)
    "Vibhavasu": "vɪbʰˈɑːvəsʊ",                          # vi-BHAA-va-su
    "Supratika": "sʊpɾətˈiːkə",                          # su-pra-TEE-ka
    "Valakhilya": "vˌɑːləkʰˈɪljə",                       # vaa-la-KHIL-ya
    "Valakhilyas": "vˌɑːləkʰˈɪljəz",
    "Rauhina": "ɾˈaʊhɪɳə",                               # ROW-hi-na (the great tree)
    "Gandhamadana": "ɡˌʌndʰəmˈɑːdənə",                   # gan-dha-MAA-da-na
    "Suparna": "sʊpˈʌɾɳə",                               # su-PAR-na
    "Vishvakarma": "vˌɪʃvəkˈʌɾmə",                       # vish-va-KAR-ma
    "Brihaspati": "bɾɪhˈʌspəti",                         # bri-HAS-pa-ti
    "Vainateya": "vˌaɪnətˈeɪjə",                         # vai-na-TAY-ya
    "kusha": "kˈʊʃə",                                    # KU-sha (the sacred grass)
    "Alamba": "ɐlˈʌmbə",
    "yojana": "jˈoʊdʒənə",
    "Vayu": "vˈɑːjuː",
    "Sadhyas": "sˈɑːdʰjəz",
    "Gandharvas": "ɡəndʰˈʌɾvəz",
    "Vasus": "vˈʌsʊz",
    "Rudras": "ɾˈʊdɾəz",
    "Adityas": "ˈɑːdɪtjəz",
    "Ashvins": "ˈʌʃvɪnz",
    "Dadhichi": "dədʰˈiːʧi",
    "Shatakratu": "ʃˌʌtəkɾˈʌtʊ",
    "yojanas": "jˈoʊdʒənəz",
    # episodes 31–40 (the Astika arc: Shesha, Vasuki's council, Jaratkaru, Astika, the sacrifice stops)
    "dharma": "dˈʌɾmə",                                  # DHUR-ma
    "Elapatra": "ˌeɪləpˈʌtɾə",                           # ay-la-PUT-ra
    "Jaratkaru": "dʒˌʌɾətkˈɑːɾuː",                       # ja-rat-KAA-roo (Jaratkāru)
    "Jaratkaru's": "dʒˌʌɾətkˈɑːɾuːz",
    "Astika's": "ˈɑːstiːkəz",
    "asti": "ˈʌsti",                                     # UH-sti ("there is")
    "Chyavana": "ʧjˈʌvənə",                              # CHYA-va-na
    "Bhrigu": "bʰɾˈɪɡuː",                                # BHRI-goo
    "Badari": "bˈʌdəɾi",                                 # BA-da-ri
    "Gokarna": "ɡoʊkˈʌɾɳə",                              # go-KAR-na
    "Pushkara": "pˈʊʃkəɾə",                              # PUSH-ka-ra
    "Himalaya": "hɪmˈɑːləjə",                            # hi-MAA-la-ya
    "Janamejaya's": "dʒˌʌnəmˈeɪdʒəjəz",
    "Yayavara": "jˌɑːjɑːvˈʌɾə",
    "Yayavaras": "jˌɑːjɑːvˈʌɾəz",
    "Shaunaka's": "ʃˈaʊnəkəz",
    "Hastinapura's": "hˌʌstɪnˈɑːpʊɾəz",
    "Takshaka's": "tˈʌkʃəkəz",
    "Shesha's": "ʃˈeɪʃəz",
    # English words espeak gets wrong for these voices (audited with --dry)
    # episodes 41–50 (the Bhrigu tales; Vyasa begins)
    "Puloma": "pʊlˈoʊmɑː",                               # pu-LO-maa (Pulomā)
    "Bhrigu's": "bʰɾˈɪɡuːz",
    "Vadhusara": "vˌʌdʰuːsˈʌɾɑː",                        # va-dhoo-SA-raa (Vadhūsarā)
    "Ruru": "ɾˈʊɾʊ",                                     # RU-ru
    "Ruru's": "ɾˈʊɾʊz",
    "Pramadvara": "pɾəmˈʌdvəɾɑː",                        # pra-MAD-va-raa (Pramadvarā)
    "Dharma": "dˈʌɾmə",                                  # DHUR-ma (Dharmarāja, lord of the dead)
    "Dharmaraja": "dˌʌɾməɾˈɑːʤə",                        # dhur-ma-RAA-ja (Dharmarāja)
    "Shunaka": "ʃˈʊnəkə",                                # SHU-na-ka (Śunaka; short u, against Shaunaka's SHOW-)
    "Sahasrapat": "səhˈʌsɾəpɑːt",                        # sa-HUS-ra-paat (Sahasrapāt)
    "Uparichara": "ˌʊpəɾɪʧˈʌɾə",                         # u-pa-ri-CHA-ra
    "Yamuna": "jˈʌmʊnɑː",                                # YA-mu-naa (Yamunā)
    "Satyavati": "sˌʌtjəvˈʌtiː",                         # sat-ya-VA-tee (Satyavatī)
    "Parashara": "pəɾˈɑːʃəɾə",                           # pa-RAA-sha-ra (Parāśara)
    "Dvaipayana": "dvaɪpˈɑːjənə",                        # dvai-PAA-ya-na (Dvaipāyana)
    "Duryodhana": "dʊɾjˈoʊdʰənə",                        # dur-YO-dha-na
    "Bhima": "bʰˈiːmə",                                  # BHEE-ma
    "Draupadi": "dɾˈaʊpədiː",                            # DROW-pa-dee (Draupadī)
    "rakshasa": "ɾˈɑːkʃəsə",                             # RAAK-sha-sa (rākṣasa)
    "apsara": "ˈʌpsəɾɑː",                                # UP-sa-raa (apsarā)
    "gandharvas": "ɡəndʰˈʌɾvəz",                         # gan-DHAR-vas
    "arrives": "əɹˈaɪvz",                                # espeak: "ɚɹˈaɪvz" (er-rives), linked to the r before it
    "storyteller": {"en-us": "stˈɔːɹitˌɛlɚ", "en-gb": "stˈɔːɹɪtˌɛlə"},   # keeps espeak's linking r off "arrives"
    "heard": {"en-us": "hˈɜɹd", "en-gb": "hˈɜːd"},       # espeak en-us gives the British "hˈɜːd"
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
pauses = {'ellipsis': 420, 'dash': 280, 'comma': 80, 'stop': 250, **script.get('voice', {}).get('pauses', {})}
out_dir = f'{root}/voice/{tag}/{a.lang}'
only = set(filter(None, a.only.split(',')))

MARK = re.compile(r'\[p:(\d+)\]|\{s(?::([\d.]+))?\}')


def chunks_of(say):
    """→ [{words: [...], mult, pause (ms after)}]. Words are whitespace tokens, like the captions'."""
    s = MARK.sub(lambda m: f' ⟦p{m.group(1)}⟧ ' if m.group(1) else f' ⟦s{m.group(2) or "1"}⟧ ', say)
    out, cur, mult = [], [], 1.0
    auto = [False]   # the last chunk's pause was automatic (punctuation), not written

    def close(pause, explicit=False):
        nonlocal cur
        if cur:
            out.append({'words': cur, 'mult': mult, 'pause': pause})
            auto[0] = not explicit
        elif out:
            if explicit and auto[0]:
                out[-1]['pause'] = max(out[-1]['pause'], pause)   # [p:N] after punctuation: the longer wins
                auto[0] = False
            else:
                out[-1]['pause'] += pause
        cur = []
    for tk in s.split():
        if tk.startswith('⟦p'):
            close(int(tk[2:-1]), explicit=True)
        elif tk.startswith('⟦s'):
            close(0)
            mult = float(tk[2:-1])
        else:
            cur.append(tk)
            core = tk.rstrip('"”’)')
            if tk in ('—', '–') or tk.endswith('—'):
                close(pauses['dash'])
            elif (tk.endswith('…') or tk.endswith('...')) and tk.strip('….'):
                close(pauses['ellipsis'])
            elif core.endswith(('.', '?', '!')):
                close(pauses['stop'])
            elif core.endswith((',', ';', ':')):
                close(pauses['comma'])
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
            v = NAMES[p]
            return v[g2p] if isinstance(v, dict) else v
        if not p.strip():
            return p
        body, tail = p.strip(), ''
        # espeak reads a segment-final article "a" (just before a name) as the letter "A": say it weak
        m = re.search(r'(?:^|\s)([aA])$', body)
        if m and p[-1] == ' ':
            body, tail = body[:m.start(1)].strip(), ('ɐ' if g2p == 'en-us' else 'ə')
        ph = tok.phonemize(body, g2p) if body else ''
        return (' ' if p[0] == ' ' else '') + ' '.join(x for x in (ph, tail) if x) + (' ' if p[-1] == ' ' else '')
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
    if line.get('voice') is False:   # a silent line (e.g. the short Next card): timed by its est
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
