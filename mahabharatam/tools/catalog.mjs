#!/usr/bin/env node
/*
 * tools/catalog.mjs · validate and summarise catalog/series.json (the series bible's machine-readable catalog).
 *
 *   node tools/catalog.mjs                     validate + print summary stats (exit 1 on any error)
 *   node tools/catalog.mjs --quiet             validate only (errors and warnings)
 *   node tools/catalog.mjs --sync              recompute every episode's playlists[] from the rules below and rewrite the file
 *   node tools/catalog.mjs --csv out.csv       also export playlists as CSV (one row per playlist × episode, story order)
 *   node tools/catalog.mjs --csv out.csv --released   only released episodes in the CSV (what can be uploaded today)
 *   node tools/catalog.mjs --file other.json   use another catalog file
 *
 * The playlist rules (derivePlaylists) are the single source of truth: an episode's playlists[] is a
 * pure function of its season, arc, layer, themes, characters (those marked major), tradition_note and
 * released languages. Edit tags, then run --sync; never hand-edit playlists[].
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_FILE = path.join(HERE, '..', 'catalog', 'series.json');

export const STATUSES = ['released', 'in_production', 'planned'];
export const LAYERS = ['main', 'side', 'wisdom'];
const EP_ID = /^S(\d{2})E(\d{3})$/;
const ARC_ID = /^S(\d{2})A(\d{2})$/;

/** Season playlist id, arc playlist id, etc. */
export const pl = {
  all: () => 'all',
  season: (s) => `season-s${String(s).padStart(2, '0')}`,
  arc: (arcId) => `arc-${arcId.toLowerCase()}`,
  layer: (l) => `layer-${l}`,
  theme: (t) => `theme-${t}`,
  char: (c) => `char-${c}`,
  lang: (code) => `lang-${code}`,
  tradition: () => 'tradition',
};

/** The playlist rules. Returns the ids an episode belongs to, in a stable order. */
export function derivePlaylists(ep, vocab) {
  const out = [pl.all(), pl.season(ep.season), pl.arc(ep.arc), pl.layer(ep.layer)];
  for (const t of ep.themes || []) out.push(pl.theme(t));
  for (const c of ep.characters || []) if (vocab.characters[c] && vocab.characters[c].major) out.push(pl.char(c));
  if (ep.tradition_note) out.push(pl.tradition());
  for (const [code, st] of Object.entries(ep.languages || {})) if (st === 'released') out.push(pl.lang(code));
  return [...new Set(out)];
}

/** Arc-level membership for projections (planned arcs whose episodes are not yet listed). */
function deriveArcPlaylists(season, arc, vocab) {
  const out = [pl.all(), pl.season(season.number), pl.arc(arc.id), pl.layer(arc.layer)];
  for (const t of arc.themes || []) out.push(pl.theme(t));
  for (const c of arc.characters || []) if (vocab.characters[c] && vocab.characters[c].major) out.push(pl.char(c));
  // (no projection for the tradition playlist: an arc's tradition_note may describe material we leave out)
  return [...new Set(out)];
}

export function load(file = DEFAULT_FILE) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Validate. Returns { errors: string[], warnings: string[] }. */
export function validate(cat) {
  const errors = [], warnings = [];
  const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
  const V = cat.vocab || {};
  for (const k of ['characters', 'themes', 'locations']) if (!V[k]) err(`vocab.${k} missing`);
  if (errors.length) return { errors, warnings };

  const plIds = new Set();
  for (const p of cat.playlists || []) {
    if (!p.id || !p.title || !p.kind) err(`playlist ${JSON.stringify(p).slice(0, 60)}: id, title and kind are required`);
    if (plIds.has(p.id)) err(`duplicate playlist id ${p.id}`);
    plIds.add(p.id);
  }

  const seen = new Set();
  const uniq = (id, what) => { if (seen.has(id)) err(`duplicate ${what} id ${id}`); seen.add(id); };
  let expectN = 1, totalShift = 0;
  let prevSeason = 0;
  for (const s of cat.seasons || []) {
    const sid = s.id;
    uniq(sid, 'season');
    if (s.number !== prevSeason + 1) err(`${sid}: season numbers must be contiguous (got ${s.number} after ${prevSeason})`);
    prevSeason = s.number;
    for (const f of ['parva', 'title', 'summary', 'arcs']) if (!s[f]) err(`${sid}: missing ${f}`);
    if (!plIds.has(pl.season(s.number))) err(`${sid}: no season playlist ${pl.season(s.number)}`);
    let expectE = 1;
    for (const a of s.arcs) {
      uniq(a.id, 'arc');
      const m = ARC_ID.exec(a.id);
      if (!m || Number(m[1]) !== s.number) err(`${a.id}: arc id must look like S${String(s.number).padStart(2, '0')}Ann`);
      for (const f of ['title', 'layer', 'synopsis', 'episode_count', 'global_range', 'season_range', 'refs', 'characters', 'themes']) {
        if (a[f] == null || (Array.isArray(a[f]) && f !== 'global_range' && f !== 'season_range' && !a[f].length)) err(`${a.id}: missing ${f}`);
      }
      if (!LAYERS.includes(a.layer)) err(`${a.id}: layer must be one of ${LAYERS}`);
      if (a.layers) {
        for (const l of Object.keys(a.layers)) if (!LAYERS.includes(l)) err(`${a.id}: layers.${l} is not a layer`);
        const sum = Object.values(a.layers).reduce((x, y) => x + y, 0);
        if (sum !== a.episode_count) err(`${a.id}: layers add up to ${sum}, episode_count is ${a.episode_count}`);
        if (a.episodes && a.episodes.length) warn(`${a.id}: layers{} is ignored once episodes are listed (each episode has its own layer)`);
      }
      if (!plIds.has(pl.arc(a.id))) err(`${a.id}: no arc playlist ${pl.arc(a.id)}`);
      if (a.episode_count < 2 || a.episode_count > 30) warn(`${a.id} "${a.title}": ${a.episode_count} episodes (arcs are meant to be 5–20)`);
      else if (a.episode_count < 5 || a.episode_count > 20) warn(`${a.id} "${a.title}": ${a.episode_count} episodes, outside the 5–20 guideline`);
      const [g0, g1] = a.global_range || [];
      const [e0, e1] = a.season_range || [];
      if (g0 !== expectN) err(`${a.id}: global_range starts at ${g0}, expected ${expectN} (numbering must be contiguous)`);
      if (g1 - g0 + 1 !== a.episode_count) err(`${a.id}: global_range ${g0}–${g1} does not match episode_count ${a.episode_count}`);
      if (e0 !== expectE || e1 - e0 + 1 !== a.episode_count) err(`${a.id}: season_range ${e0}–${e1} is not contiguous from ${expectE}`);
      // resynchronise on the arc's own start so one slip is reported once, not for every later arc
      if (Number.isInteger(g0) && g0 !== expectN) { totalShift += g0 - expectN; expectN = g0; }
      if (Number.isInteger(e0) && e0 !== expectE) expectE = e0;
      for (const c of a.characters || []) if (!V.characters[c]) err(`${a.id}: unknown character "${c}"`);
      for (const t of a.themes || []) if (!V.themes[t]) err(`${a.id}: unknown theme "${t}"`);

      if (a.episodes && a.episodes.length) {
        if (a.episodes.length !== a.episode_count) err(`${a.id}: episode_count ${a.episode_count} but ${a.episodes.length} episodes listed`);
        for (const ep of a.episodes) {
          const where = ep.id || `#${expectN}`;
          uniq(ep.id, 'episode');
          const em = EP_ID.exec(ep.id || '');
          if (!em) err(`${where}: id must look like S01E007`);
          else if (Number(em[1]) !== s.number || Number(em[2]) !== expectE) err(`${where}: id does not match season ${s.number} episode ${expectE}`);
          if (ep.n !== expectN) err(`${where}: global number ${ep.n}, expected ${expectN}`);
          if (ep.season !== s.number || ep.ep !== expectE) err(`${where}: season/ep fields (${ep.season}/${ep.ep}) do not match position`);
          if (ep.arc !== a.id) err(`${where}: arc "${ep.arc}" but listed under ${a.id}`);
          for (const f of ['title', 'synopsis', 'cliffhanger']) if (!ep[f] || typeof ep[f] !== 'string') err(`${where}: missing ${f}`);
          if (!LAYERS.includes(ep.layer)) err(`${where}: layer must be one of ${LAYERS}`);
          if (!STATUSES.includes(ep.status)) err(`${where}: status must be one of ${STATUSES}`);
          if (typeof ep.tradition_note !== 'boolean') err(`${where}: tradition_note must be true/false`);
          if (!('reorder_note' in ep)) err(`${where}: reorder_note is required (null when there is none)`);
          if (!Array.isArray(ep.refs) || !ep.refs.length) err(`${where}: refs required`);
          for (const r of ep.refs || []) {
            if (!Number.isInteger(r.parva) || !Number.isInteger(r.adhyaya_from) || !Number.isInteger(r.adhyaya_to) || typeof r.approx !== 'boolean')
              err(`${where}: each ref needs parva, adhyaya_from, adhyaya_to (integers) and approx (bool)`);
            else if (r.adhyaya_to < r.adhyaya_from) err(`${where}: ref ${r.label} runs backwards`);
            else if (r.parva !== s.number) warn(`${where}: ref ${r.label} is outside this season's parva`);
          }
          for (const k of ['characters', 'themes', 'locations', 'playlists']) if (!Array.isArray(ep[k])) err(`${where}: ${k}[] required`);
          if (!(ep.characters || []).length) err(`${where}: at least one character`);
          if (!(ep.themes || []).length) err(`${where}: at least one theme`);
          for (const c of ep.characters || []) if (!V.characters[c]) err(`${where}: unknown character "${c}"`);
          for (const t of ep.themes || []) if (!V.themes[t]) err(`${where}: unknown theme "${t}"`);
          for (const l of ep.locations || []) if (!V.locations[l]) err(`${where}: unknown location "${l}"`);
          for (const p of ep.playlists || []) if (!plIds.has(p)) err(`${where}: unknown playlist "${p}"`);
          const want = derivePlaylists(ep, V);
          if (JSON.stringify(want) !== JSON.stringify(ep.playlists)) err(`${where}: playlists[] out of date with the rules (run: node tools/catalog.mjs --sync)`);
          if (ep.tradition_note && !(ep.themes || []).includes('tradition-tales')) warn(`${where}: tradition_note is true but theme "tradition-tales" is missing`);
          for (const [code, st] of Object.entries(ep.languages || {})) if (!STATUSES.includes(st)) err(`${where}: languages.${code} status "${st}"`);
          if (ep.status === 'released' && (!ep.languages || !Object.values(ep.languages).includes('released'))) warn(`${where}: released but no released language`);
          expectN++; expectE++;
        }
      } else {
        expectN += a.episode_count; expectE += a.episode_count;
      }
    }
    const arcSum = s.arcs.reduce((k, a) => k + (a.episode_count || 0), 0);
    if (s.episode_count !== arcSum) err(`${sid}: episode_count ${s.episode_count} but its arcs add up to ${arcSum}`);
  }
  const total = expectN - 1 - totalShift;
  if (cat.totals && cat.totals.episodes !== total) err(`totals.episodes ${cat.totals.episodes} but the seasons add up to ${total}`);
  if (total < 1000 || total > 2000) warn(`total ${total} is outside the owner's 1,000–2,000 range`);
  // status order: nothing released after something planned
  let sawPlanned = false;
  for (const ep of episodes(cat)) {
    if (ep.status === 'planned') sawPlanned = true;
    else if (sawPlanned && ep.status === 'released') warn(`${ep.id}: released after a planned episode (out-of-order release?)`);
  }
  return { errors, warnings };
}

export function* episodes(cat) {
  for (const s of cat.seasons) for (const a of s.arcs) for (const ep of a.episodes || []) yield ep;
}

/** Stats: totals per season and layer; playlist sizes now (listed episodes) and projected (arc estimates). */
export function stats(cat) {
  const V = cat.vocab;
  const seasons = [], layer = { main: 0, side: 0, wisdom: 0 }, status = { released: 0, in_production: 0, planned: 0 };
  const plNow = new Map(), plProj = new Map();
  const bump = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
  let listed = 0, total = 0;
  for (const s of cat.seasons) {
    const row = { id: s.id, parva: s.parva, arcs: s.arcs.length, episodes: 0, listed: 0, main: 0, side: 0, wisdom: 0 };
    for (const a of s.arcs) {
      row.episodes += a.episode_count;
      if (a.episodes && a.episodes.length) {
        for (const ep of a.episodes) {
          row[ep.layer]++; layer[ep.layer]++; status[ep.status]++; row.listed++; listed++;
          for (const p of ep.playlists) { bump(plNow, p); bump(plProj, p); }
        }
      } else {
        status.planned += a.episode_count;
        const split = a.layers || { [a.layer]: a.episode_count };
        for (const [l, k] of Object.entries(split)) { row[l] += k; layer[l] += k; bump(plProj, pl.layer(l), k); }
        for (const p of deriveArcPlaylists(s, a, V)) if (!p.startsWith('layer-')) bump(plProj, p, a.episode_count);
      }
    }
    total += row.episodes;
    seasons.push(row);
  }
  return { total, listed, seasons, layer, status, plNow, plProj };
}

function printStats(cat) {
  const st = stats(cat);
  const pad = (v, n) => String(v).padStart(n), padE = (v, n) => String(v).padEnd(n);
  console.log(`\n${cat.series.title} — ${cat.series.subtitle}: ${st.total} episodes planned (${st.listed} listed at episode level)\n`);
  console.log(`${padE('Season', 6)} ${padE('Parva', 30)} ${pad('arcs', 4)} ${pad('eps', 5)} ${pad('main', 5)} ${pad('side', 5)} ${pad('wisdom', 6)} ${pad('listed', 6)}`);
  for (const r of st.seasons) console.log(`${padE(r.id, 6)} ${padE(r.parva, 30)} ${pad(r.arcs, 4)} ${pad(r.episodes, 5)} ${pad(r.main, 5)} ${pad(r.side, 5)} ${pad(r.wisdom, 6)} ${pad(r.listed, 6)}`);
  const L = st.layer;
  console.log(`${padE('Total', 37)} ${pad(st.seasons.reduce((n, r) => n + r.arcs, 0), 4)} ${pad(st.total, 5)} ${pad(L.main, 5)} ${pad(L.side, 5)} ${pad(L.wisdom, 6)} ${pad(st.listed, 6)}`);
  console.log(`\nLayers: main ${L.main} · side ${L.side} · wisdom ${L.wisdom}`);
  console.log(`Status: released ${st.status.released} · in production ${st.status.in_production} · planned ${st.status.planned}`);
  const kinds = new Map(cat.playlists.map((p) => [p.id, p]));
  const groups = {};
  for (const p of cat.playlists) (groups[p.kind] ||= []).push(p);
  console.log('\nPlaylist sizes (now = episodes listed in the catalog · projected = including planned arcs):');
  for (const [kind, list] of Object.entries(groups)) {
    const rows = list.map((p) => [p.id, st.plNow.get(p.id) || 0, st.plProj.get(p.id) || 0]);
    if (kind === 'arc' || kind === 'season') {
      console.log(`  ${kind}: ${rows.length} playlists, projected sizes ${Math.min(...rows.map((r) => r[2]))}–${Math.max(...rows.map((r) => r[2]))}`);
      continue;
    }
    rows.sort((x, y) => y[2] - x[2] || y[1] - x[1]);
    console.log(`  ${kind}:`);
    for (const [id, now, proj] of rows) console.log(`    ${padE(id, 30)} ${padE(kinds.get(id).title, 44)} now ${pad(now, 4)} · projected ${pad(proj, 5)}`);
  }
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function playlistCsv(cat, { releasedOnly = false } = {}) {
  const rows = [['playlist_id', 'playlist_title', 'kind', 'position', 'episode_id', 'global_number', 'episode_title', 'status']];
  const byPl = new Map(cat.playlists.map((p) => [p.id, []]));
  for (const ep of episodes(cat)) {
    if (releasedOnly && ep.status !== 'released') continue;
    for (const p of ep.playlists) byPl.get(p)?.push(ep);
  }
  for (const p of cat.playlists) {
    (byPl.get(p.id) || []).forEach((ep, i) => rows.push([p.id, p.title, p.kind, i + 1, ep.id, ep.n, ep.title, ep.status]));
  }
  return rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}

function main(argv) {
  const args = { file: DEFAULT_FILE, quiet: false, sync: false, csv: null, released: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') args.file = argv[++i];
    else if (a === '--quiet') args.quiet = true;
    else if (a === '--sync') args.sync = true;
    else if (a === '--csv') args.csv = argv[++i];
    else if (a === '--released') args.released = true;
    else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); return 0; }
    else { console.error(`unknown argument ${a}`); return 2; }
  }
  const cat = load(args.file);
  if (args.sync) {
    let changed = 0;
    for (const ep of episodes(cat)) {
      const want = derivePlaylists(ep, cat.vocab);
      if (JSON.stringify(want) !== JSON.stringify(ep.playlists)) { ep.playlists = want; changed++; }
    }
    fs.writeFileSync(args.file, JSON.stringify(cat, null, 2) + '\n');
    console.log(`synced playlists[] on ${changed} episode(s)`);
  }
  const { errors, warnings } = validate(cat);
  for (const w of warnings) console.log(`warning: ${w}`);
  for (const e of errors) console.log(`ERROR: ${e}`);
  if (!args.quiet) printStats(cat);
  if (args.csv) {
    fs.writeFileSync(args.csv, playlistCsv(cat, { releasedOnly: args.released }));
    console.log(`\nwrote ${args.csv}`);
  }
  console.log(errors.length ? `\nFAIL: ${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK: catalog valid (${warnings.length} warning(s))`);
  return errors.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
