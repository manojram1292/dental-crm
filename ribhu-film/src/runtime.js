/*
 * Runtime: live player (default) or headless render target (?render=1).
 *
 * Render mode exposes window.__reel for tools/render.mjs and tools/preview.mjs:
 *   await __reel.ready
 *   __reel.frame(f, {mb, shutter})   → PNG data URL of output frame f
 *   __reel.at(T)                     → PNG data URL at absolute time T (no motion blur)
 *   __reel.sheet(times, {cols, cellW}) → PNG data URL contact sheet with time labels
 *   __reel.bench(times)              → ms per render
 */
(function () {
  'use strict';
  const R = window.REEL;
  const q = new URLSearchParams(location.search);
  const renderMode = q.get('render') === '1';
  R.scale = +(q.get('scale') || (renderMode ? 1 : Math.min(1, (window.devicePixelRatio || 1) * 0.75)));
  if (q.get('hud') === '0') R.showHud = false;
  R.live = !renderMode;
  if (q.get('grain') != null) R.grain = +q.get('grain');
  const doPost = q.get('post') !== '0';

  const canvas = document.getElementById('reel');
  canvas.width = Math.round(R.W * R.scale);
  canvas.height = Math.round(R.H * R.scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: renderMode, alpha: false });
  window.__reelCanvas = canvas;

  function drawFrameAt(T, frame) {
    R.renderContent(ctx, T);
    if (doPost) R.post(ctx, T, frame);
  }

  // Motion blur: average `mb` sub-frames across the shutter interval. Each
  // sub-frame also gets a sub-pixel camera jitter (Halton 2,3), so the average
  // doubles as supersampled anti-aliasing for the 3D layer.
  const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
  let acc = null;
  function drawFrameMB(f, mb = 1, shutter = 0.5) {
    const T0 = f / R.FPS;
    R.jitter = [0, 0];
    if (mb <= 1) return drawFrameAt(T0, f);
    const w = canvas.width, h = canvas.height, n = w * h * 4;
    if (!acc || acc.length !== n) acc = new Uint32Array(n);
    else acc.fill(0);
    for (let i = 0; i < mb; i++) {
      R.jitter = [halton(i + 1, 2) - 0.5, halton(i + 1, 3) - 0.5];
      R.renderContent(ctx, T0 + (i / mb) * (shutter / R.FPS));
      const d = ctx.getImageData(0, 0, w, h).data;
      for (let k = 0; k < n; k++) acc[k] += d[k];
    }
    const out = ctx.createImageData(w, h), o = out.data;
    for (let k = 0; k < n; k++) o[k] = acc[k] / mb; // Uint8ClampedArray rounds to nearest
    ctx.putImageData(out, 0, 0);
    R.jitter = [0, 0];
    if (doPost) R.post(ctx, T0, f);
  }

  const ready = (async () => { await R.init(); })();

  if (renderMode) {
    document.body.classList.add('render');
    window.__reel = {
      ready,
      info: () => ({ W: R.W, H: R.H, FPS: R.FPS, DURATION: R.DURATION, FRAMES: R.FRAMES, scale: R.scale, scenes: R.scenes.map((s) => ({ id: s.id, index: s.index, label: s.label, start: s.start, end: s.end })) }),
      errors: () => R.errors.splice(0),
      frame(f, { mb = 1, shutter = 0.5, type = 'image/png', quality } = {}) {
        drawFrameMB(f, mb, shutter);
        return canvas.toDataURL(type, quality);
      },
      at(T) { drawFrameAt(T, Math.floor(T * R.FPS)); return canvas.toDataURL('image/png'); },
      sheet(times, { cols = 4, cellW = 480, label = true } = {}) {
        const cellH = Math.round(cellW * R.H / R.W), pad = 8, lab = label ? 26 : 0;
        const rows = Math.ceil(times.length / cols);
        const c = document.createElement('canvas');
        c.width = cols * cellW + (cols + 1) * pad;
        c.height = rows * (cellH + lab) + (rows + 1) * pad;
        const g = c.getContext('2d');
        g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height);
        times.forEach((T, i) => {
          drawFrameAt(T, Math.floor(T * R.FPS));
          const x = pad + (i % cols) * (cellW + pad), y = pad + Math.floor(i / cols) * (cellH + lab + pad);
          g.drawImage(canvas, x, y + lab, cellW, cellH);
          if (label) {
            const s = R.sceneAt(T);
            g.fillStyle = '#ddd'; g.font = "600 15px 'JetBrains Mono'"; g.textBaseline = 'middle';
            g.fillText(`${T.toFixed(3)}s  f${Math.floor(T * R.FPS + 1e-6)}  ${s ? s.id + ' t=' + (T - s.start).toFixed(3) : ''}`, x + 2, y + lab / 2);
          }
        });
        return c.toDataURL('image/png');
      },
      /** Pixel hash of the content at T (no post) — for purity checks. */
      hashAt(T) {
        R.renderContent(ctx, T);
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let h = 2166136261;
        for (let i = 0; i < d.length; i += 3) h = Math.imul(h ^ d[i], 16777619);
        return h >>> 0;
      },
      bench(times) {
        return times.map((T) => { const t0 = performance.now(); R.renderContent(ctx, T); ctx.getImageData(0, 0, 1, 1); return { T, ms: +(performance.now() - t0).toFixed(1) }; });
      },
    };
    return;
  }

  // ─── Live player ───────────────────────────────────────────────────────────
  // Sound plays through Web Audio: sample-accurate, and seeking works on any
  // static host (an <audio> element can't seek without HTTP range support).
  // While sound runs, the audio clock is the master clock.
  const ui = {
    play: document.getElementById('play'),
    scrub: document.getElementById('scrub'),
    time: document.getElementById('time'),
    marks: document.getElementById('marks'),
    overlay: document.getElementById('overlay'),
    mute: document.getElementById('mute'),
    loop: document.getElementById('loop'),
  };
  let playing = false, looping = true, muted = false, lastNow = null;
  let T = R.clamp(+(q.get('t') || 0) || 0, 0, R.DURATION - 1e-4);

  const sound = { ctx: null, gain: null, buffer: null, loading: null, src: null, startedAt: 0 };
  function loadSound() {
    if (sound.loading) return sound.loading;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return (sound.loading = Promise.resolve(null));
    sound.ctx = new AC();
    sound.gain = sound.ctx.createGain();
    sound.gain.gain.value = muted ? 0 : 1;
    sound.gain.connect(sound.ctx.destination);
    sound.loading = fetch('audio/film.wav')
      .then((r) => { if (!r.ok) throw new Error(`audio ${r.status}`); return r.arrayBuffer(); })
      .then((b) => new Promise((res, rej) => sound.ctx.decodeAudioData(b, res, rej)))
      .then((buf) => { sound.buffer = buf; if (playing) startSound(T); return buf; })
      .catch(() => null); // no sound: the reel still plays on the wall clock
    return sound.loading;
  }
  function stopSound() {
    if (sound.src) { try { sound.src.stop(); } catch {} sound.src.disconnect(); sound.src = null; }
  }
  function startSound(from) {
    stopSound();
    if (!sound.buffer) return;
    if (sound.ctx.state === 'suspended') sound.ctx.resume();
    const src = sound.ctx.createBufferSource();
    src.buffer = sound.buffer;
    src.connect(sound.gain);
    src.start(0, R.clamp(from, 0, sound.buffer.duration - 1e-3));
    sound.src = src;
    sound.startedAt = sound.ctx.currentTime - from;
  }
  const soundClock = () => (sound.src && sound.ctx.state === 'running' ? sound.ctx.currentTime - sound.startedAt : null);

  function fit() {
    const bar = 64, vw = window.innerWidth, vh = window.innerHeight - bar;
    const s = Math.min(vw / R.W, vh / R.H);
    canvas.style.width = `${R.W * s}px`;
    canvas.style.height = `${R.H * s}px`;
  }
  window.addEventListener('resize', fit); fit();

  function setPlaying(p) {
    playing = p;
    ui.play.textContent = p ? '❚❚' : '▶';
    ui.overlay.classList.toggle('hidden', p || T > 0);
    if (p) {
      if (T >= R.DURATION - 1e-3) T = 0;
      lastNow = null;
      loadSound();
      startSound(T);
    } else stopSound();
  }
  function seek(t) {
    T = R.clamp(t, 0, R.DURATION - 1e-4);
    lastNow = null;
    if (playing) startSound(T);
  }

  function tick(now) {
    try {
      if (playing) {
        const clock = soundClock();
        // rAF timestamps can precede the moment play was pressed, so never step backwards.
        T = clock != null ? clock : T + (lastNow == null ? 0 : Math.max(0, now - lastNow) / 1000);
        if (T >= R.DURATION) {
          if (looping) seek(0);
          else { T = R.DURATION - 1e-4; setPlaying(false); }
        }
      }
      lastNow = now;
      T = R.clamp(T, 0, R.DURATION - 1e-4);
      const f = Math.floor(T * R.FPS);
      drawFrameAt(T, f);
      ui.scrub.value = String(T / R.DURATION * 1000);
      ui.time.textContent = `${R.timecode(T)}  ·  ${String(f).padStart(3, '0')}/${R.FRAMES}`;
    } finally {
      requestAnimationFrame(tick);
    }
  }

  ready.then(() => {
    for (const s of R.scenes) {
      const m = document.createElement('button');
      m.className = 'mark';
      m.style.left = `${(s.start / R.DURATION) * 100}%`;
      m.title = `${String(s.index).padStart(2, '0')} — ${s.label}`;
      m.textContent = String(s.index).padStart(2, '0');
      m.addEventListener('click', () => seek(s.start));
      ui.marks.appendChild(m);
    }
    document.body.classList.add('ready');
    requestAnimationFrame(tick);
  });

  ui.play.addEventListener('click', () => setPlaying(!playing));
  ui.overlay.addEventListener('click', () => setPlaying(true));
  ui.scrub.addEventListener('input', () => seek((+ui.scrub.value / 1000) * R.DURATION));
  ui.mute.addEventListener('click', () => {
    muted = !muted;
    if (sound.gain) sound.gain.gain.value = muted ? 0 : 1;
    ui.mute.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
  });
  ui.loop.addEventListener('click', () => { looping = !looping; ui.loop.textContent = looping ? 'LOOP ON' : 'LOOP OFF'; });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
    else if (e.code === 'ArrowRight') { seek(T + (e.shiftKey ? 1 : 1 / R.FPS)); }
    else if (e.code === 'ArrowLeft') { seek(T - (e.shiftKey ? 1 : 1 / R.FPS)); }
    else if (/^Digit[1-9]$/.test(e.code)) { const s = R.scenes[+e.code.slice(5) - 1]; if (s) seek(s.start); }
    else if (e.code === 'KeyM') ui.mute.click();
    else if (e.code === 'KeyH') R.showHud = !R.showHud;
  });
})();
