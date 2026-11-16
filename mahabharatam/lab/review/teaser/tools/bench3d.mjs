// node lab/review/teaser/tools/bench3d.mjs T1,T2,... out-prefix [mb]   (times frame render cost on ep 96 and writes PNGs)
import fs from 'node:fs';
import { openReel, dataUrlToBuffer } from '../../../../tools/lib.mjs';
const times = (process.argv[2] || '1,2').split(',').map(Number), pre = process.argv[3] || 'lab/review/teaser/bench', mb = +(process.argv[4] || 1);
const reel = await openReel({ ep: 96, pages: 1 });
const p = reel.pages[0];
for (const T of times) { const f = Math.round(T * 30); const t0 = Date.now(); const url = await p.evaluate(([f, mb]) => window.__reel.frame(f, { mb }), [f, mb]); const ms = Date.now() - t0; fs.writeFileSync(`${pre}-${T}.png`, dataUrlToBuffer(url)); console.log(`T=${T} f=${f} mb=${mb} ${ms} ms`); }
console.log(await reel.drainErrors());
await reel.close();
