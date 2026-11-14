"""Voice-over-bed: in each 100 ms window where the voice speaks, fit the voice's gain locally (the limiter and per-line gains move it)
and measure what is left (everything that is not the voice) against it. Usage: vob.py mix.wav voice-stem.wav"""
import sys, numpy as np, soundfile as sf
m,sr=sf.read(sys.argv[1]); v,_=sf.read(sys.argv[2])
m=m.mean(1) if m.ndim>1 else m; v=v.mean(1) if v.ndim>1 else v; n=min(len(m),len(v)); m=m[:n]; v=v[:n]
w=int(sr*.1); out=[]
for i in range(0,n-w,w):
    vv=v[i:i+w]; e=np.mean(vv**2)
    if 10*np.log10(e+1e-12)<-45: continue
    mm=m[i:i+w]; a=np.dot(mm,vv)/np.dot(vv,vv); r=mm-a*vv
    out.append(10*np.log10(np.mean((a*vv)**2)/(np.mean(r**2)+1e-12)))
o=np.array(out); print('voice over bed: median %.1f dB, 10th pct %.1f, share under 10 dB %.0f%% (%d windows)'%(np.median(o),np.percentile(o,10),100*(o<10).mean(),len(o)))
