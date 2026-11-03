# The catalog · `catalog/series.json`

The machine-readable plan for every episode of *Mahabharatam — As Vyasa Told It*. The human-readable bible is [`../SERIES.md`](../SERIES.md); this file says how to read, update and use the catalog. Validate after every edit:

```bash
node tools/catalog.mjs                 # validate + summary (totals per season, layers, statuses, playlist sizes)
node tools/catalog.mjs --quiet         # validate only
node tools/catalog.mjs --sync          # recompute every episode's playlists[] from its tags, rewrite the file, validate
node tools/catalog.mjs --csv pl.csv              # playlists as CSV: playlist × episode, in story order
node tools/catalog.mjs --csv pl.csv --released   # only released episodes (what can go on YouTube today)
```

The tool exits 1 on any error, so it can run in CI or before a render.

## Shape

```
series        title, subtitle, fidelity rule, format, plan targets, languages {code: {name, status}}
totals        episodes, layers {main, side, wisdom}, seasons, arcs
vocab         characters {id: {name, aliases[], major, bible}}   (bible = module id in src/kit/characters, or null)
              themes {id: {label, description}} · locations {id: {label}} · layers · statuses
playlists[]   {id, kind, title, description, order: "story", …}
seasons[]     {id "S01", number, parva, title, summary, ce_adhyayas, upaparvas[], introduces[], detail,
               episode_count, global_range [first, last], playlist, arcs[]}
  arcs[]      {id "S01A04", title, layer, layers? {main, side, wisdom}, upaparvas[], synopsis, episode_count,
               global_range, season_range, refs[], characters[], themes[], tales[], tradition_note, reorder_note,
               playlist, compilation {id "S01A04-LF", title, runtime_target, status}, episodes[]}
    episodes[] (see below; empty for arcs not yet planned at episode level)
```

An **episode**:

| Field | Meaning |
|---|---|
| `id` | `S01E007`: season and episode within the season (3 digits) |
| `n` | global number, 1…N, contiguous across the whole series; the on-screen "Episode n" |
| `season`, `ep`, `arc` | position (must agree with `id` and with where it is listed) |
| `title` | the episode title (on the title card, the NEXT card of the episode before, and the upload title) |
| `layer` | `main` · `side` · `wisdom` |
| `refs[]` | `{parva, adhyaya_from, adhyaya_to, approx, label}` in the BORI Critical Edition. `approx: true` = check before printing on screen |
| `synopsis` | one paragraph: what happens (the source for the description) |
| `cliffhanger` | the line before "Next: …" (and the question the next hook answers) |
| `characters[]`, `themes[]`, `locations[]` | ids from `vocab` (unknown ids are errors) |
| `playlists[]` | **derived** from the tags (never edit by hand; run `--sync`) |
| `status` | `released` · `in_production` · `planned` |
| `languages` | `{code: status}`, e.g. `{"en": "released", "ta": "in_production"}` |
| `tradition_note` | `true` when the episode shows material from later tradition, marked on screen "As tradition tells it" (also add the theme `tradition-tales`) |
| `reorder_note` | why and how the episode departs from the CE's order, or `null` |
| `notes` | production or fidelity notes; anything uncertain starts with `UNCERTAIN:` |

Arcs in Seasons 2–18 are planned at arc level only: `episodes` is empty and `episode_count`, `global_range` and `layers` carry the plan.

## Status updates

1. When a script is started: set the episode's `status` to `in_production` and `languages.en` to `in_production`.
2. When the English render is published: `status: "released"`, `languages.en: "released"`. Run `node tools/catalog.mjs --sync` so the episode joins `lang-en`.
3. A dub: set `languages.<code>` the same way; the episode joins `lang-<code>` only once that language is `released`.
4. When every episode of an arc is released and the compilation is published, set the arc's `compilation.status` to `released`.
5. Commit the catalog together with the episode's script, so the two never disagree.

## Expanding an arc to episodes

When an arc's scripts are about to be written:

1. Write its `episodes[]` (same fields as Season 1). The number of episodes may differ from the estimate.
2. Update the arc's `episode_count`, `global_range`, `season_range`, then **shift the ranges of every later arc and season** (and their episodes' `n`) so numbering stays contiguous; update the season's `episode_count`, `global_range` and `totals`. The validator reports the first gap or overlap and the arc it is in.
3. Drop the arc's `layers` split (each episode now has its own `layer`).
4. Run `--sync`, then validate.

**Renumbering rule:** planned episodes may be renumbered freely; **released episodes never change `id`, `n` or `title`** (they are printed on screen and in uploads). If a released arc must grow, add episodes at its end or use a new arc.

## Generating playlists

Playlists are fixed rules over the tags (`derivePlaylists` in `tools/catalog.mjs`), always in story order (`n`):

| Playlist | Rule |
|---|---|
| `all` | every episode |
| `season-s01` … `season-s18` | `season` |
| `arc-s01a01` … | `arc` (the long-form compilation follows the same order) |
| `layer-main` · `layer-side` · `layer-wisdom` | `layer` |
| `char-<id>` | the character is in `characters[]` and `vocab.characters[id].major` is true |
| `theme-<id>` | each of `themes[]` |
| `tradition` | `tradition_note: true` |
| `lang-<code>` | `languages[code] === "released"` |
| `longform` | arc compilations with `compilation.status: "released"` (not episodes) |

To add a character playlist, set `major: true` on the character in `vocab.characters` and run `--sync`. To add a theme, add it to `vocab.themes`, tag the episodes, run `--sync`. Each playlist entry in `playlists[]` holds the title and description to use on YouTube.

`--csv` writes `playlist_id, playlist_title, kind, position, episode_id, global_number, episode_title, status`, one row per membership in story order, ready for a bulk playlist tool or a spreadsheet. Use `--released` for what exists now.

## Generating titles and descriptions

Every field in the templates of SERIES.md §11 comes straight from the catalog:

```js
import { load, episodes } from './tools/catalog.mjs';
const cat = load();
const all = [...episodes(cat)];
const ep = all.find((e) => e.id === 'S01E006');
const season = cat.seasons.find((s) => s.number === ep.season);
const arc = season.arcs.find((a) => a.id === ep.arc);
const prev = all.find((e) => e.n === ep.n - 1), next = all.find((e) => e.n === ep.n + 1);
const title = `${ep.title} · Mahabharatam Ep ${ep.n}`;
const source = ep.refs.map((r) => r.label).join(', ');            // "Adi 1.3"
const k = ep.n - arc.global_range[0] + 1, K = arc.episode_count;  // "(2 of 6)"
```

- **Title**: `{title} · Mahabharatam Ep {n}`.
- **Description**: hook (the script's `hook` line), `synopsis`, the series line with `season.parva`, `arc.title` and `k of K`, the source line from `refs` (add "approximate range" if any `approx`), the tradition line if `tradition_note`, the reorder line if `reorder_note`, previous/next titles, the arc playlist, and the credit line ("Every frame and sound is generated from code. Narration: Kokoro-82M text-to-speech.").
- **Hashtags**: `#Mahabharata`, the parva (`#AdiParva`), and one major character or theme from the episode's tags. Three to five in total.
- **NEXT card**: the next episode's `title` (the script's `strings.nextTitle` must match the catalog).

Never put a claim in a title or description that the catalog does not support (no "untold", "real", "secret", dates or historicity); see SERIES.md §11.
