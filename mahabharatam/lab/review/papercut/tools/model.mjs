#!/usr/bin/env node
// Model sheet of the paper-cut figures (pipeline 95): every character and expression, drawn by src/scenes/papercut/paper.js.
//   node lab/review/papercut/tools/model.mjs [--out lab/review/papercut/model-sheet.jpg]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, args, openReel, dataUrlToBuffer, findFfmpeg } from '../../../../tools/lib.mjs';
const a = args(), out = path.resolve(ROOT, a.out || 'lab/review/papercut/model-sheet.jpg');
const reel = await openReel({ scale: 0.5, ep: 95, grain: 0 });
const url = await reel.pages[0].evaluate(() => {
  const R = window.REEL, PC = window.PC, C = PC.C, c = window.__reelCanvas, g = c.getContext('2d');
  R.resetCtx(g); PC.beginFrame(); PC.ground(g, 'rice');
  const cast = [
    { id: 'gandhari', kind: 'queen', blindfold: true, hair: 'bun', border: true, veil: true, face: 'still', pose: { sh: 0.3, el: 0.5 } },
    { id: 'gandhari', kind: 'queen', blindfold: true, hair: 'bun', border: true, veil: true, face: 'grief', pose: { sit: 1, belly: 1, sh: 0.9, el: 1.6, shF: 0.7, elF: 1.4, head: 0.2 } },
    { id: 'vyasa', kind: 'sage', skin: C.vyasa, col: C.vyasa, colFar: C.vyasaDk, lower: C.bark, top: C.vyasa, hair: 'jata', hairCol: C.tawny, beard: 'long', thread: true, face: 'speak', pose: { sh: 2.0, el: 0.3 } },
    { id: 'king', kind: 'king', crown: true, beard: 'short', face: 'closed', pose: { sh: 1.5, el: 1.7, shF: 1.3, elF: 1.6 }, prop: (q) => window.PC.piece(q, window.PC.ell(0, 40, 40, 50, 16), C.near, { seed: 3 }) },
    { id: 'kunti', kind: 'woman', hair: 'bun', face: 'still', pose: { sh: 1.4, el: 1.5, shF: 1.2, elF: 1.4 }, prop: (q) => window.PC.piece(q, window.PC.ell(0, 40, 40, 50, 16), C.near, { seed: 3 }) },
    { id: 'brahmin', kind: 'priest', topknot: true, thread: true, face: 'speak', col: C.far, pose: { sh: 1.8, el: 0.2 } },
  ];
  PC.layer(g, (q) => cast.forEach((o, i) => PC.person(q, null, { ...o, x: 120 + (i % 3) * 330, y: 880 + Math.floor(i / 3) * 900, s: 0.62, facing: 1, seed: 10 + i * 7 })));
  return c.toDataURL('image/png');
});
const png = out.replace(/\.jpg$/, '.png'); fs.writeFileSync(png, dataUrlToBuffer(url));
spawnSync(findFfmpeg(), ['-y', '-loglevel', 'error', '-i', png, '-q:v', '3', out]); fs.rmSync(png);
const errs = await reel.drainErrors(); await reel.close(); console.log(out); if (errs.length) console.log(errs.slice(0, 4).join('\n'));
