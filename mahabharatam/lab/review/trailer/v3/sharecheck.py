"""Trailer v3 · is the share file what a phone wants?   python3 -I sharecheck.py trailer-share.mp4 "kf,kf,…"
Profile, level, pixel format, frame rate constant, moov before mdat, audio 48 kHz AAC, both streams start at 0, the first 60
frames present once each with rising timestamps, a keyframe at each asked time, the longest gap between keyframes, the size."""
import json, os, subprocess, sys
f = sys.argv[1]; want = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else []
pr = lambda *a: json.loads(subprocess.run(['ffprobe', '-v', 'error', '-of', 'json', *a, f], capture_output=True, text=True).stdout)
st = pr('-show_streams', '-show_format'); v = next(s for s in st['streams'] if s['codec_type'] == 'video'); a = next(s for s in st['streams'] if s['codec_type'] == 'audio')
fr = pr('-select_streams', 'v:0', '-show_entries', 'frame=pts_time,key_frame,pict_type')['frames']
pts = [float(q['pts_time']) for q in fr]; keys = [p for p, q in zip(pts, fr) if q['key_frame']]
head = open(f, 'rb').read(4096); d = [pts[i + 1] - pts[i] for i in range(len(pts) - 1)]
ap = pr('-select_streams', 'a:0', '-show_entries', 'packet=pts_time', '-read_intervals', '%+1')['packets']
out = {'file': os.path.basename(f), 'bytes': os.path.getsize(f), 'megabytes_decimal': round(os.path.getsize(f) / 1e6, 2), 'profile': v['profile'], 'level': v['level'] / 10, 'pix_fmt': v['pix_fmt'], 'size': f"{v['width']}x{v['height']}", 'r_frame_rate': v['r_frame_rate'], 'avg_frame_rate': v['avg_frame_rate'],
       'frames': len(pts), 'frame_step_min_max_s': [round(min(d), 5), round(max(d), 5)], 'video_start_s': float(v['start_time']), 'audio_start_s': float(a['start_time']), 'first_audio_packet_s': float(ap[0]['pts_time']), 'audio': f"{a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch",
       'moov_before_mdat': head.find(b'moov') != -1 and (head.find(b'mdat') == -1 or head.find(b'moov') < head.find(b'mdat')), 'first_frame_is_key': bool(fr[0]['key_frame']), 'first_60_frames_one_each': len(pts[:60]) == 60 and all(abs(pts[i] - i / 30) < 0.002 for i in range(60)),
       'keyframes': len(keys), 'longest_gap_between_keyframes_s': round(max(b - a_ for a_, b in zip(keys, keys[1:])), 2), 'keyframes_in_first_5_s': [round(k, 2) for k in keys if k <= 5.01],
       'asked_keyframes_missing': [w for w in want if not any(abs(k - w) < 0.006 for k in keys)]}
print(json.dumps(out, indent=1))
