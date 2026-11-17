#!/usr/bin/env node
// A few frames of the paper-cut sample (pipeline 95) side by side, straight from the canvas (no render):
//   node lab/review/papercut/tools/sheet.mjs --times 1.0,5.2,... --out lab/review/papercut/style-test.jpg [--w 432] [--cols 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, args, openReel, dataUrlToBuffer, findFfmpeg } from '../../../../tools/lib.mjs';
const a = args(), W = +(a.w || 432), cols = +(a.cols || 4), out = path.resolve(ROOT, a.out || 'lab/review/papercut/sheet.jpg');
const reel = await openReel({ scale: W / 1080, ep: 95, grain: 0 });
const L = reel.info.lines, times = String(a.times || '').split(',').filter(Boolean).map((x) => (/^[a-z]/.test(x) ? (() => { const [id, p] = x.split('@'); const l = L.find((q) => q.id === id); return l.start + (l.end - l.start) * +(p || 0.5); })() : +x));
const url = await reel.pages[0].evaluate(([ts, cols]) => {
  const c = window.__reelCanvas, w = c.width, h = c.height, rows = Math.ceil(ts.length / cols);
  const s = document.createElement('canvas'); s.width = cols * (w + 6); s.height = rows * (h + 22); const g = s.getContext('2d');
  g.fillStyle = '#181818'; g.fillRect(0, 0, s.width, s.height); g.font = '14px sans-serif'; g.textBaseline = 'top';
  ts.forEach((t, k) => { window.__reel.frame(Math.round(t * 30)); const x = (k % cols) * (w + 6), y = Math.floor(k / cols) * (h + 22); g.drawImage(c, x, y + 20); g.fillStyle = '#ddd'; const i = window.REEL.lineIndexAt(t); g.fillText(`${t.toFixed(2)}s ${window.REEL.lines[i].id}`, x + 4, y + 3); });
  return s.toDataURL('image/png');
}, [times, cols]);
const png = out.replace(/\.jpg$/, '.png'); fs.writeFileSync(png, dataUrlToBuffer(url));
spawnSync(findFfmpeg(), ['-y', '-loglevel', 'error', '-i', png, '-q:v', '3', out]); fs.rmSync(png);
const errs = await reel.drainErrors(); await reel.close();
console.log(out, times.map((t) => t.toFixed(2)).join(' '));
if (errs.length) { console.log(errs.slice(0, 5).join('\n')); process.exitCode = 1; }
