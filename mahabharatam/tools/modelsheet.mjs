#!/usr/bin/env node
/*
 * Render the character model sheet (lab/model-sheet.html) to CHARACTERS.png.
 *
 *   node tools/modelsheet.mjs [--out CHARACTERS.png]
 *   node tools/modelsheet.mjs --solo elder --out .preview/elder.png   (one character large, every pose)
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { ROOT, args, serve, dataUrlToBuffer } from './lib.mjs';

const a = args();
const out = path.resolve(ROOT, a.out || 'CHARACTERS.png');
const { srv, port } = await serve();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/lab/model-sheet.html?render=1${a.solo ? `&solo=${a.solo}&scale=${a.scale || 0.85}` : ''}`);
  await page.waitForFunction(() => window.__sheetReady || window.__sheetError, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.__sheetError);
  if (err) throw new Error(err);
  const url = await page.evaluate(() => document.getElementById('sheet').toDataURL('image/png'));
  fs.writeFileSync(out, dataUrlToBuffer(url));
  const size = await page.evaluate(() => [document.getElementById('sheet').width, document.getElementById('sheet').height]);
  console.log(`wrote ${path.relative(ROOT, out)}  ${size[0]}×${size[1]}`);
  if (errors.length) console.log('page errors:\n  ' + errors.join('\n  '));
} finally {
  await browser.close();
  srv.close();
}
