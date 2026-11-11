/*
 * KIT.stage · the EPISODE-41 STEP-UP (colour scripting, depth, atmosphere, camera grammar, transitions born from the
 * medium). New functions only: episodes 0–40 never call them and draw exactly as before (tools/regress.mjs).
 *
 * ── COLOUR SCRIPT ────────────────────────────────────────────────────────────────────────────────────────────────
 *   KIT.stage.PAL            named PALETTES: each scene section takes ONE and no two neighbours share a hue.
 *       { hue (deg: the ground's dominant hue), sky: [top, mid, low], far, mid, near (land tones, far → near),
 *         haze (the air's colour: far layers are mixed toward it), key (the light's colour), shade (multiply grade),
 *         accent, fig: 'light' | 'dark' (what a figure must be to stand off this ground), rim [colour, amount],
 *         bounce [colour, amount] }
 *   KIT.stage.pal(id)        → the palette (throws on an unknown id: a typo must not pass silently)
 *   KIT.stage.light(pal, o)  → a rig light for a figure standing in that palette: { dir, intensity, front, fill, tint,
 *                              bounce, minLum }; o = { from: [x, y] (the light's place), at: [x, y] (the figure),
 *                              k, front, fill }
 *   KIT.stage.backlight(pal, o)  THE FIRE / BACK-LIGHT RULE: a figure with a fire or a sun BEHIND it gets a rim on both
 *                              sides in the light's colour, a cool bounce fill and a luminance floor, so it never goes
 *                              to a black cut-out. o = { from, at, k (the flicker), cool (bounce colour) }
 *   The gate (tools/gate.mjs --frames, ep ≥ 41) measures the colour script on the rendered frames: the dominant hue of
 *   every shot (run length ≤ 2) and every figure's contrast with the ground in its own box.
 *
 * ── DEPTH AND ATMOSPHERE ─────────────────────────────────────────────────────────────────────────────────────────
 *   KIT.stage.shot(ctx, T, { pal, cam, layers: [{ z, draw(g, pal, cam), haze?, soft? }], grade, finish })
 *       REAL multi-layer parallax: every layer has a depth z (0 = the sky, 1 = the figures' plane, > 1 = foreground);
 *       the camera's pan moves a layer by pan × z and its zoom scales it by 1 + (zoom − 1) × zf(z), so near things slide
 *       past far ones. Far layers are mixed toward pal.haze (depth haze); a rack focus (cam.focus = a z) softens the
 *       layers away from it.
 *   KIT.stage.sky / hills / treeline / trunks / ground / water / hut / pillars / cloudBank / grass    layer painters
 *   KIT.stage.shafts(g, T, o)     slanting light shafts (additive, slow shimmer)
 *   KIT.stage.particles(g, T, o)  drifting motes with their own depth: kind 'ember' | 'dust' | 'pollen' | 'ash' |
 *                                 'petal' | 'rain' | 'firefly' | 'spray' | 'snow'
 *   KIT.stage.mist(g, T, o)       drifting bands of ground mist
 *   KIT.stage.vignette(g, o)      a soft, coloured vignette (on top of the engine's)
 *   KIT.stage.finish(g, T, o)     mural finish: brush-edge grain (bristle streaks) and a worn painted border
 *
 * ── CAMERA GRAMMAR ───────────────────────────────────────────────────────────────────────────────────────────────
 *   KIT.cam.push / pull / tilt / slide / orbit / rack / crane / still (p, o) → a camera state { zoom, px, py, rot,
 *       focus, type }; KIT.cam.mix(a, b) adds two moves; KIT.cam.drift(cam, T, amt) adds a breath of hand-held life.
 *   KIT.stage.within(ctx, T, { shape: 'arch' | 'door' | 'leaves' | 'window' | 'cave', draw(g), pal, open })
 *       FRAME-WITHIN-FRAME: the picture seen through a dark painted aperture in the foreground.
 *   Every move and transition reports itself to the gate's probe (REEL.probe), which counts the distinct types.
 *
 * ── TRANSITIONS BORN FROM THE MEDIUM (a scene's `transition: { type, dur, … }`; the engine calls run) ───────────────
 *   'ink'    an ink bleed: blots spread from a point (at: [x, y]) with a dark wet edge
 *   'brush'  a brushstroke wipe: broad bristle strokes sweep the new picture on (angle, color)
 *   'lamp'   a lamp-glow match cut: a glow at `from` in the old shot swells to fill the frame and settles into a glow
 *            at `to` in the new one
 *   'smoke'  a smoke carry: smoke rolls across the frame (dir) and thins out on the new picture
 *   'dissolve' the old cross-dissolve (for a quiet passage of time)
 */
(function () {
  'use strict';
  const R = window.REEL, KIT = window.KIT;
  const { TAU, clamp, lerp, hash, noise, E } = R;
  const W = R.W, H = R.H;
  const ST = (KIT.stage = {});
  const note = (bag, k) => { if (R.probe) { R.probe[bag] = R.probe[bag] || {}; R.probe[bag][k] = (R.probe[bag][k] || 0) + 1; } };

  // ─── Palettes ─────────────────────────────────────────────────────────────────────────────────────────────────
  const P = (hue, sky, far, mid, near, haze, key, shade, accent, fig, rim, bounce) => ({ hue, sky, far, mid, near, haze, key, shade, accent, fig, rim, bounce });
  ST.PAL = {
    // the frame story
    'naimisha-bluehour': P(222, ['#0c1230', '#243a6a', '#6a86a8'], '#31476e', '#1c2a4a', '#0e1630', '#7f9cc0', '#ffb060', '#c8d4f0', '#ffb547', 'light', ['#ffb060', 0.45], ['#5a78b0', 0.3]),
    'naimisha-firstlight': P(28, ['#3a4a7a', '#c88a7a', '#ffd9a0'], '#8a6a6a', '#5a3a34', '#2a1814', '#f0c8a0', '#fff0c8', '#ffe8d0', '#e7b54a', 'dark', ['#fff0c8', 0.4], ['#c88a7a', 0.25]),
    // ep 41: the hermitage and the abduction
    'hermitage-green': P(96, ['#16402a', '#4f8a44', '#e8e6a0'], '#5f9a58', '#2f6a38', '#123a20', '#b8d498', '#fff0b0', '#eef8d8', '#e86a3a', 'dark', ['#fff0b0', 0.35], ['#8fd080', 0.22]),
    'hearth-amber': P(32, ['#2a1408', '#5a2c10', '#a05a1c'], '#6a3a14', '#48240c', '#221006', '#c07a30', '#ffc060', '#ffe0b0', '#7ad8d8', 'light', ['#ffc060', 0.5], ['#6a7ab0', 0.25]),
    'boar-dusk': P(306, ['#12061c', '#4a1650', '#b04a8a'], '#5a1c5a', '#38103c', '#16061a', '#a05a98', '#ffd8f0', '#f0c8e8', '#7affd8', 'light', ['#ffd0f0', 0.35], ['#ff8a6a', 0.18]),
    // ep 42: the child, the ash, the river
    'sun-white': P(48, ['#101a48', '#3a4a8a', '#ffe8a0'], '#5a5a8a', '#2a2a5a', '#10102e', '#ffe8b0', '#ffffff', '#fff4d8', '#ffd040', 'light', ['#ffffff', 0.5], ['#8a9ad8', 0.2]),
    'ash-grey': P(-1, ['#3a3836', '#8a8680', '#d8d4cc'], '#7a766e', '#4e4a44', '#26221e', '#b8b4ac', '#fffbf0', '#e0dcd4', '#ff5a20', 'dark', ['#fffbf0', 0.3], ['#a09a90', 0.2]),
    'river-jade': P(162, ['#0e4a44', '#3a9a88', '#d8f0d0'], '#4aa890', '#1e7262', '#0a3c36', '#a8dcc8', '#fffbe0', '#dcf4ec', '#ff9a7a', 'dark', ['#fffbe0', 0.35], ['#7ad0c0', 0.25]),
    // ep 43: the curse, the world without fire, Brahma
    'wrath-crimson': P(356, ['#1c0408', '#5a0c18', '#b02a2a'], '#7a1420', '#4a0a14', '#20040a', '#c04a40', '#ffd0a0', '#ffc8c0', '#ffe060', 'light', ['#ffb090', 0.45], ['#6a2a8a', 0.2]),
    'cold-slate': P(226, ['#10141c', '#2a3240', '#586474'], '#3a4452', '#262e3a', '#12161e', '#6a7686', '#c8d8f0', '#c0c8d8', '#f08a24', 'light', ['#c8d8f0', 0.4], ['#586474', 0.3]),
    'brahma-rose': P(338, ['#6a1a44', '#d86a88', '#ffe0c0'], '#c85a80', '#8a2a58', '#4a1232', '#f0b8c0', '#fff4d0', '#ffe0e4', '#e7b54a', 'dark', ['#fff4d0', 0.35], ['#ffb0c0', 0.25]),
    'pure-flame': P(236, ['#060a30', '#14208a', '#3a50c0'], '#1a2a8a', '#0e1860', '#060a34', '#5a70d0', '#fff0b0', '#d0d8ff', '#ffd060', 'light', ['#fff0b0', 0.5], ['#5a70d0', 0.25]),
    // ep 44: the foundling, the meadow, the bite
    'riverbank-pearl': P(204, ['#1e3a5a', '#6a94b8', '#eef0e4'], '#6a90b0', '#3a6488', '#16304c', '#c4d8e8', '#ffffff', '#e4eef8', '#ff8ab0', 'dark', ['#ffffff', 0.3], ['#b0c4d8', 0.25]),
    'meadow-spring': P(74, ['#2a6a8a', '#a8d078', '#fbf4a0'], '#8ab848', '#4f8a26', '#234a10', '#d8e898', '#fff8c0', '#f4fbd0', '#ff5a8a', 'dark', ['#fff8c0', 0.35], ['#b8d86a', 0.25]),
    'venom-violet': P(284, ['#08040e', '#24103a', '#4a2a6a'], '#34184e', '#1e0c30', '#0c0414', '#5a3a7a', '#b0ffa0', '#d8c8f0', '#7aff5a', 'light', ['#b0ffa0', 0.4], ['#6a4a9a', 0.25]),
    // ep 45: the lament, the messenger, Dharma, the wedding
    'grief-blue': P(214, ['#04081a', '#0c1c44', '#1e3a70'], '#12285a', '#0a1838', '#040a1c', '#2a4a80', '#a8c8ff', '#b8c8e8', '#ffb547', 'light', ['#a8c8ff', 0.45], ['#2a4a80', 0.3]),
    'messenger-dawn': P(56, ['#2a2408', '#b89a3a', '#fff6c8'], '#c8a84a', '#8a7020', '#3a2e0a', '#fff0b0', '#ffffff', '#fff8d8', '#7ac8ff', 'dark', ['#ffffff', 0.5], ['#b89a3a', 0.2]),
    'dharma-copper': P(18, ['#0a0604', '#2a140c', '#6a3018'], '#4a2414', '#2c140a', '#120804', '#8a4a2a', '#ffb070', '#f0c8b0', '#5ad8c8', 'light', ['#ffb070', 0.45], ['#2a6a6a', 0.25]),
    'wedding-turmeric': P(50, ['#8a4a0a', '#e8a820', '#fff0b0'], '#d89a18', '#a86a10', '#5a300a', '#f8dc90', '#fffbe8', '#fff0c0', '#d8202a', 'dark', ['#fffbe8', 0.3], ['#f8d040', 0.25]),
    // ep 46: the hunter of snakes, the old snake, the memory, the release
    'noon-ochre': P(36, ['#8a5a1a', '#d8a850', '#f8e8c0'], '#c0903e', '#8a5e22', '#4a2e0e', '#e8d0a0', '#fffbe8', '#fbecd0', '#3a8a5a', 'dark', ['#fffbe8', 0.3], ['#d0a868', 0.25]),
    'thicket-shade': P(166, ['#04140e', '#0c3a2a', '#1e6a4a'], '#124a34', '#0a3020', '#04160e', '#2a7a5a', '#f0ffb0', '#c0e8d0', '#ff7a4a', 'light', ['#f0ffb0', 0.4], ['#1e6a4a', 0.25]),
    'memory-indigo': P(236, ['#1a2060', '#5a66b0', '#d8dcf0'], '#6a76b8', '#3a4488', '#161c50', '#b8c0e4', '#ffffff', '#dce0f4', '#b0522d', 'dark', ['#ffffff', 0.25], ['#98a2d0', 0.2]),
    'release-gold': P(52, ['#3a2a08', '#c89a20', '#fff4b0'], '#c8a030', '#8a6a14', '#3a2a08', '#ffe890', '#ffffff', '#fff8d0', '#3ab0a8', 'dark', ['#ffffff', 0.5], ['#c89a20', 0.2]),
    // ep 47–48: the sacrifice at rest (never the old orange), Vyasa's arrival, the panels of the summary
    'satra-teal-night': P(192, ['#04121a', '#0c3040', '#1c5a68'], '#124250', '#0a2a36', '#04141a', '#2a6a78', '#ffc878', '#b8e0e8', '#ff8a3a', 'light', ['#ffc878', 0.45], ['#2a6a78', 0.3]),
    'arrival-umber-gold': P(40, ['#140c04', '#3a2408', '#8a5a10'], '#5a3a0c', '#3a2408', '#180e04', '#a87820', '#ffe090', '#f8e0b0', '#7a9aff', 'light', ['#ffe090', 0.5], ['#5a6aa8', 0.22]),
    'seat-ivory': P(52, ['#6a5020', '#d0b068', '#fbf0d0'], '#c8a860', '#8a6c30', '#4a3812', '#f0e0b8', '#fffbf0', '#fbf0d8', '#b0522d', 'dark', ['#fffbf0', 0.3], ['#e0d0a8', 0.2]),
    'dice-vermilion': P(8, ['#3a0806', '#8a1c10', '#d84a20'], '#a02a14', '#6a1408', '#2a0604', '#d86a40', '#ffe0a0', '#ffd0c0', '#f7dc9c', 'light', ['#ffe0a0', 0.45], ['#6a2a6a', 0.2]),
    'exile-forest': P(140, ['#061a10', '#104a2a', '#3a8a50'], '#1a5a34', '#0c3a20', '#041a0e', '#4a9a6a', '#e0ffc0', '#c8f0d0', '#ffb547', 'light', ['#e0ffc0', 0.4], ['#104a2a', 0.3]),
    'war-iron': P(250, ['#0a0a14', '#22223a', '#4a4a6a'], '#2e2e4a', '#1c1c30', '#0a0a16', '#5a5a7a', '#ffd0a0', '#c8c8e0', '#ff4a2a', 'light', ['#ffd0a0', 0.4], ['#4a4a6a', 0.3]),
    // ep 49–50: Chedi's sky, the hunt, the Yamuna, the fishers, the mist, the island
    'crystal-sky': P(196, ['#0e4a80', '#4aa8d8', '#e0f8ff'], '#5ab0d8', '#2a7aa8', '#103e62', '#c0e8f8', '#ffffff', '#e0f4ff', '#e7b54a', 'dark', ['#ffffff', 0.35], ['#8ad0f0', 0.25]),
    'hunt-emerald': P(128, ['#0a2a14', '#1c6a30', '#6ac060'], '#2a7a3a', '#145024', '#06260e', '#6ab070', '#fff8b0', '#d0f4c8', '#ff6a8a', 'light', ['#fff8b0', 0.4], ['#1c6a30', 0.3]),
    'yamuna-deep': P(208, ['#062a4a', '#0c5a8a', '#3a9ac8'], '#0e5a88', '#083e62', '#041e34', '#4a9ac0', '#d8f8ff', '#c0e4f8', '#f0f0f8', 'light', ['#d8f8ff', 0.4], ['#0c5a8a', 0.3]),
    'fishers-coral': P(14, ['#2a1a4a', '#c8584a', '#ffc890'], '#a84a4c', '#6a2c38', '#32121c', '#e89a7a', '#fff0d0', '#ffdccc', '#5ad8e8', 'dark', ['#fff0d0', 0.4], ['#d86a5a', 0.25]),
    'mist-lavender': P(262, ['#3a2e70', '#9a8ed0', '#ece8fb'], '#8a7ec0', '#5a4e98', '#2a2058', '#d0c8ec', '#ffffff', '#e8e4f8', '#ffd060', 'dark', ['#ffffff', 0.3], ['#b8b0dc', 0.3]),
    'island-gold': P(44, ['#3a2468', '#e08a40', '#ffe8a0'], '#c87a30', '#8a4e18', '#40220a', '#fcd090', '#fffbe0', '#fff0c8', '#3a9ac8', 'dark', ['#fffbe0', 0.45], ['#f09a50', 0.25]),
  };
  ST.pal = (id) => { const p = typeof id === 'string' ? ST.PAL[id] : id; if (!p) throw new Error(`KIT.stage: unknown palette "${id}"`); if (typeof id === 'string') note('palettes', id); return p; };

  /** A rig light for a figure in this palette (rim tinted by the palette's light, fill by its bounce). */
  ST.light = (pal, o = {}) => {
    pal = ST.pal(pal);
    const [fx, fy] = o.from || [W * 0.2, 200], [x, y] = o.at || [540, 1200];
    // SILHOUETTE FIRST (visual review of kit 41): by default the figure is a dark, rich shape with a thin rim in the scene's
    // light; on a dark ground it is lifted a little so it stands off. Pass front ≈ 0.7 for a close-up or a front-lit scene.
    return { dir: Math.atan2(fy - (y - 550), fx - x), intensity: o.k ?? 1.05, front: o.front ?? (pal.fig === 'light' ? 0.34 : 0.16), fill: o.fill ?? (pal.fig === 'light' ? 0.2 : 0.06),
      tint: [pal.rim[0], Math.min(0.5, pal.rim[1])], bounce: [pal.bounce[0], pal.bounce[1] * 0.35], minLum: o.minLum ?? 0 };
  };
  /** THE BACK-LIGHT RULE: a fire or a sun behind the figure. The figure stays a dark shape (its own hues at about a third of
   *  their value, never a black hole and never a washed mid-tone), with a thin rim in the fire's colour on BOTH edges and its
   *  ornaments catching the light. o = { from, at, k (the flicker), warm } */
  ST.backlight = (pal, o = {}) => {
    pal = ST.pal(pal);
    const [fx, fy] = o.from || [540, 1100], [x, y] = o.at || [540, 1400];
    return { dir: Math.atan2(fy - (y - 550), fx - x), intensity: (o.k ?? 1) * 1.2, front: o.front ?? 0.1, fill: o.fill ?? 0.1, wrap: o.wrap ?? 0.6,
      tint: [o.warm || '#ffb050', 0.75], bounce: [o.cool || '#3a4a80', 0.2], minLum: 0 };
  };

  // ─── Camera grammar ───────────────────────────────────────────────────────────────────────────────────────────
  const C0 = () => ({ zoom: 1, px: 0, py: 0, rot: 0, focus: null, soft: 0, types: [] });
  const cam = (type, f) => (p, o = {}) => { const c = C0(); const e = (o.ease || E.inOutSine)(clamp(p)); f(c, e, o); c.types = [type]; note('moves', type); return c; };
  KIT.cam = {
    /** push in: zoom from → to toward a focus point (the point stays put on screen) */
    push: cam('push', (c, e, o) => { const z = lerp(o.from ?? 1, o.to ?? 1.3, e), [fx, fy] = o.focus || [540, 900]; c.zoom = z; c.px = (fx - W / 2) * (1 - 1 / z); c.py = (fy - H / 2) * (1 - 1 / z); }),
    /** pull out: the reverse (a reveal) */
    pull: cam('pull', (c, e, o) => { const z = lerp(o.from ?? 1.5, o.to ?? 1, e), [fx, fy] = o.focus || [540, 900]; c.zoom = z; c.px = (fx - W / 2) * (1 - 1 / z); c.py = (fy - H / 2) * (1 - 1 / z); }),
    /** tilt: the camera travels vertically (from/to in px; up is negative) */
    tilt: cam('tilt', (c, e, o) => { c.zoom = o.zoom ?? 1.15; c.py = lerp(o.from ?? -200, o.to ?? 200, e); c.px = o.x ?? 0; }),
    /** slide: a lateral track; near layers pass far ones (parallax) */
    slide: cam('slide', (c, e, o) => { c.zoom = o.zoom ?? 1.15; c.px = lerp(o.from ?? -160, o.to ?? 160, e); c.py = o.y ?? 0; }),
    /** orbit: a slide with a counter-turn, as if circling the subject */
    orbit: cam('orbit', (c, e, o) => { c.zoom = o.zoom ?? 1.2; const a = lerp(o.from ?? -1, o.to ?? 1, e); c.px = a * (o.amp ?? 150); c.rot = -a * (o.turn ?? 0.012); c.py = (o.y ?? 0) - Math.abs(a) * 12; }),
    /** rack: the focus travels between depths (from/to are layer z values) */
    rack: cam('rack', (c, e, o) => { c.zoom = o.zoom ?? 1.1; c.focus = lerp(o.from ?? 1.6, o.to ?? 1, e); c.soft = o.soft ?? 1; c.px = o.x ?? 0; c.py = o.y ?? 0; }),
    /** crane: rise (or sink) while pushing: a signature move */
    crane: cam('crane', (c, e, o) => { const z = lerp(o.from ?? 1.5, o.to ?? 1.05, e); c.zoom = z; c.py = lerp(o.y0 ?? 300, o.y1 ?? -100, e); c.px = lerp(o.x0 ?? 0, o.x1 ?? 0, e); }),
    still: (o = {}) => ({ ...C0(), zoom: o.zoom ?? 1, px: o.x ?? 0, py: o.y ?? 0 }),
    /** add two moves (zoom multiplies, the rest adds) */
    mix: (a, b) => ({ zoom: a.zoom * b.zoom, px: a.px + b.px, py: a.py + b.py, rot: a.rot + b.rot, focus: b.focus ?? a.focus, soft: Math.max(a.soft, b.soft), types: [...a.types, ...b.types] }),
    /** a breath of hand-held life (a few px), pure in T */
    drift: (c, T, amt = 1, seed = 0) => ({ ...c, px: c.px + noise.n2(T * 0.35, seed) * 9 * amt, py: c.py + noise.n2(T * 0.31, seed + 40) * 7 * amt, rot: c.rot + noise.n2(T * 0.27, seed + 80) * 0.004 * amt }),
  };
  /** The transform of a layer at depth z under camera c. zf: how much of the zoom a layer takes. */
  ST.layerTransform = (g, c, z) => {
    const zf = z <= 1 ? lerp(0.3, 1, clamp(z)) : 1 + (z - 1) * 0.55;
    const s = 1 + (c.zoom - 1) * zf, par = z <= 1 ? lerp(0.08, 1, clamp(z)) : 1 + (z - 1) * 0.9;
    g.translate(W / 2, H / 2);
    if (c.rot) g.rotate(c.rot * par);
    g.scale(s, s);
    g.translate(-W / 2 - c.px * par, -H / 2 - c.py * par);
  };

  /**
   * One shot: layers in depth under a camera, with depth haze and rack focus.
   *   o = { pal, cam, layers: [{ z, draw(g, pal, cam), haze (false = none), soft (extra blur 0..1), key }], grade (0..1) }
   */
  ST.shot = (ctx, T, o) => {
    const pal = ST.pal(o.pal), c = o.cam || KIT.cam.still();
    const layers = [...o.layers].sort((a, b) => a.z - b.z).filter((L) => !ST.debugOnly || (L.z >= ST.debugOnly[0] && L.z <= ST.debugOnly[1]));   // tools/opacity.mjs draws chosen planes only
    const hazeK = o.haze ?? 0.55;
    layers.forEach((L, i) => {
      const depth = clamp(1 - L.z);
      const hz = L.haze === false || L.z < 0.02 ? 0 : hazeK * depth * 0.85;
      const blur = L.z < 0.02 ? 0 : clamp((L.soft || 0) + (c.focus != null ? Math.min(1, Math.abs(L.z - c.focus)) * 0.75 * (c.soft || 1) : 0));
      if (hz < 0.02 && blur < 0.06) {
        ctx.save(); ST.layerTransform(ctx, c, L.z); L.draw(ctx, pal, c, T); ctx.restore();
        return;
      }
      const b = R.buffer(`st-layer-${L.key || i}`, W, H);
      b.clear();
      const g = b.ctx;
      g.save(); ST.layerTransform(g, c, L.z); L.draw(g, pal, c, T); g.restore();
      R.resetCtx(g);
      if (hz >= 0.02) { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = hz; g.fillStyle = pal.haze; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      if (blur >= 0.06) {
        // a real lens blur, radius by the layer's distance from the focus; the layer stays opaque (one blit)
        ctx.save(); ctx.filter = R.blur(2 + 20 * blur); ctx.drawImage(b.canvas, 0, 0, W, H); ctx.restore();
      } else ctx.drawImage(b.canvas, 0, 0, W, H);
    });
    if (o.grade ?? 0.5) ST.grade(ctx, pal, o.grade ?? 0.5);
  };
  /** Pull the whole frame toward the palette: a light multiply by its shade and a soft key-coloured lift. */
  ST.grade = (ctx, pal, k = 0.5) => {
    pal = ST.pal(pal);
    ctx.save(); ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5 * k; ctx.fillStyle = pal.shade; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.22 * k; ctx.fillStyle = pal.key; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  // ─── Layer painters (all take the palette; all are pure in T) ───────────────────────────────────────────────────
  const BIG = [-700, -900, W + 1400, H + 1800];
  ST.sky = (g, pal, o = {}) => {
    pal = ST.pal(pal); const hz = o.hz ?? 1150;
    KIT.vgrad(g, BIG[1], hz, [[0, pal.sky[0]], [0.62, pal.sky[1]], [1, pal.sky[2]]], BIG[0], BIG[0] + BIG[2]);
    g.fillStyle = pal.far; g.fillRect(BIG[0], hz - 2, BIG[2], H + 900 - hz);
    if (o.sun) { const [x, y, r] = o.sun; KIT.glow(g, x, y, r * 4.5, pal.key, 0.5); KIT.glow(g, x, y, r * 2, '#ffffff', 0.5); g.fillStyle = o.sunColor || '#fffbe8'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    if (o.stars) for (let i = 0; i < 90; i++) { const x = BIG[0] + hash(i, 11) * BIG[2], y = BIG[1] + hash(i, 12) * (hz - BIG[1]) * 0.9; g.globalAlpha = o.stars * (0.35 + 0.65 * Math.abs(Math.sin((o.T || 0) * (0.8 + hash(i, 13)) + i))); g.fillStyle = '#f4f6ff'; g.beginPath(); g.arc(x, y, 1.6 + 2.2 * hash(i, 14), 0, TAU); g.fill(); }
    g.globalAlpha = 1;
  };
  ST.cloudBank = (g, pal, T, o = {}) => {
    pal = ST.pal(pal); const y = o.y ?? 500, n = o.count ?? 6;
    for (let i = 0; i < n; i++) {
      const x = ((hash(i, 21 + (o.seed || 0)) * (W + 900) + T * (o.speed ?? 6) * (0.5 + hash(i, 22))) % (W + 900)) - 450, yy = y + (hash(i, 23) - 0.5) * (o.spread ?? 320), s = (o.size ?? 1) * (0.7 + 0.8 * hash(i, 24));
      g.fillStyle = o.color || KIT.hex(pal.sky[2], '#ffffff', 0.45); g.globalAlpha = o.alpha ?? 0.8;
      g.beginPath(); KIT.scallopPath(g, x, yy, 230 * s, 70 * s, 9, i * 7 + 3, 0.3); g.fill();
      g.fillStyle = KIT.hex(pal.sky[1], pal.shade, 0.3); g.globalAlpha = (o.alpha ?? 0.8) * 0.35;
      g.beginPath(); KIT.scallopPath(g, x + 10 * s, yy + 26 * s, 200 * s, 44 * s, 8, i * 7 + 5, 0.25); g.fill();
    }
    g.globalAlpha = 1;
  };
  /** A range of hills or mountains: o = { y (base), h, color, seed, peaks (jagged 0..1), snow } */
  ST.hills = (g, pal, o = {}) => {
    pal = ST.pal(pal); const y = o.y ?? 1150, h = o.h ?? 260, seed = o.seed ?? 1, jag = o.peaks ?? 0;
    g.fillStyle = o.color || pal.far; g.beginPath(); g.moveTo(BIG[0], y + 900);
    const pts = [];
    for (let x = BIG[0]; x <= BIG[0] + BIG[2]; x += 60) { const n = noise.n2(x * 0.0016 + seed * 9, seed) * 0.6 + noise.n2(x * 0.006 + seed * 3, seed + 5) * 0.25 + (jag ? Math.abs(noise.n2(x * 0.004, seed + 9)) * jag : 0); pts.push([x, y - h * (0.45 + n)]); }
    for (const p of pts) g.lineTo(p[0], p[1]);
    g.lineTo(BIG[0] + BIG[2], y + 900); g.closePath(); g.fill();
    if (o.snow) { g.fillStyle = 'rgba(244,248,255,0.9)'; for (let i = 2; i < pts.length - 2; i++) if (pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1] && pts[i][1] < y - h * 0.62) { g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i][0] - 70, pts[i][1] + 80); g.lineTo(pts[i][0] - 20, pts[i][1] + 56); g.lineTo(pts[i][0] + 24, pts[i][1] + 90); g.lineTo(pts[i][0] + 76, pts[i][1] + 70); g.closePath(); g.fill(); } }
  };
  /** A line of mural trees (round scalloped crowns on trunks): o = { y, h, color, seed, gap, sway, T, kind: 'round' | 'palm' | 'sal' } */
  ST.treeline = (g, pal, o = {}) => {
    pal = ST.pal(pal); const y = o.y ?? 1200, h = o.h ?? 420, gap = o.gap ?? 210, seed = o.seed ?? 3, T = o.T || 0;
    const col = o.color || pal.mid, hi = o.hi || KIT.hex(col, pal.key, 0.28);
    for (let i = -4; i < (W + 1400) / gap; i++) {
      const x = i * gap + (hash(i, seed) - 0.5) * gap * 0.7, hh = h * (0.7 + 0.6 * hash(i, seed + 1)), sw = Math.sin(T * 0.7 + i * 1.7) * (o.sway ?? 6);
      g.fillStyle = col;
      if ((o.kind || 'round') === 'palm') {
        g.beginPath(); g.moveTo(x - 9, y); g.quadraticCurveTo(x + 14, y - hh * 0.5, x + sw, y - hh); g.lineTo(x + 16 + sw, y - hh); g.quadraticCurveTo(x + 30, y - hh * 0.5, x + 11, y); g.fill();
        for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.5; g.beginPath(); g.moveTo(x + sw + 8, y - hh); g.quadraticCurveTo(x + sw + Math.cos(a) * 90, y - hh + Math.sin(a) * 90 - 20, x + sw + Math.cos(a) * 170, y - hh + Math.sin(a) * 110 + 60); g.quadraticCurveTo(x + sw + Math.cos(a) * 80, y - hh + Math.sin(a) * 60 + 10, x + sw + 8, y - hh + 14); g.fill(); }
        continue;
      }
      const kind = o.kind === 'mixed' ? ['round', 'banyan', 'flame', 'sal'][Math.floor(hash(i, seed + 9) * 4)] : (o.kind || 'round'), tw = hh * 0.05 + 8;
      g.beginPath(); g.moveTo(x - tw * 1.8, y); g.quadraticCurveTo(x - tw * 0.5, y - hh * 0.3, x - tw * 0.5 + sw * 0.4, y - hh * 0.66); g.lineTo(x + tw * 0.5 + sw * 0.4, y - hh * 0.66); g.quadraticCurveTo(x + tw * 0.5, y - hh * 0.3, x + tw * 1.9, y); g.fill();
      g.beginPath(); g.moveTo(x - tw * 0.3, y - hh * 0.5); g.quadraticCurveTo(x - hh * 0.12, y - hh * 0.6, x - hh * 0.2 + sw, y - hh * 0.74); g.lineTo(x - hh * 0.17 + sw, y - hh * 0.76); g.quadraticCurveTo(x - hh * 0.08, y - hh * 0.56, x + tw * 0.3, y - hh * 0.46); g.fill();   // a branch
      if (kind === 'banyan') { g.strokeStyle = col; g.lineWidth = 4; for (let k = 0; k < 6; k++) { const ax = x + (k - 2.5) * hh * 0.11; g.beginPath(); g.moveTo(ax + sw, y - hh * 0.62); g.quadraticCurveTo(ax + sw * 0.3 + 6, y - hh * 0.3, ax, y - hh * (0.04 + 0.2 * hash(k, i))); g.stroke(); } }
      if (kind === 'banyan' || kind === 'flame') {
        const fc = kind === 'flame' ? KIT.hex(col, pal.accent, 0.55) : col;
        for (let k = 0; k < 5; k++) { const cx = x + sw + (k - 2) * hh * 0.17, cy = y - hh * (0.74 + 0.1 * Math.sin(k * 1.9)), rx = hh * 0.2, ry = hh * 0.15; g.fillStyle = k % 2 ? fc : col; g.beginPath(); KIT.scallopPath(g, cx, cy, rx, ry, 10, i * 5 + k, 0.26); g.fill(); g.fillStyle = hi; g.globalAlpha = 0.4; g.beginPath(); KIT.scallopPath(g, cx - rx * 0.2, cy - ry * 0.3, rx * 0.5, ry * 0.45, 7, i * 5 + k + 2, 0.24); g.fill(); g.globalAlpha = 1; }
        g.fillStyle = col; continue;
      }
      const n = kind === 'sal' ? 2 : 3;
      for (let k = 0; k < n; k++) { const cx = x + sw + (k - (n - 1) / 2) * hh * 0.2, cy = y - hh * (0.72 + 0.12 * (k % 2)), rx = hh * (kind === 'sal' ? 0.16 : 0.24), ry = hh * (kind === 'sal' ? 0.3 : 0.2);
        g.fillStyle = col; g.beginPath(); KIT.scallopPath(g, cx, cy, rx, ry, 9, i * 5 + k, 0.24); g.fill();
        g.fillStyle = hi; g.globalAlpha = 0.5; g.beginPath(); KIT.scallopPath(g, cx - rx * 0.22, cy - ry * 0.3, rx * 0.55, ry * 0.5, 7, i * 5 + k + 2, 0.24); g.fill(); g.globalAlpha = 0.35; for (let q = 0; q < 7; q++) { g.beginPath(); g.ellipse(cx + (hash(q, i + k) - 0.5) * rx * 1.4, cy + (hash(q, i + k + 3) - 0.5) * ry * 1.3, rx * 0.12, ry * 0.07, hash(q, k) * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; }
    }
  };
  /** Tall foreground trunks (z > 1): dark verticals that the camera slides past. o = { xs: [...], color, w } */
  ST.trunks = (g, pal, o = {}) => {
    pal = ST.pal(pal); g.fillStyle = o.color || pal.near;
    for (const [i, x] of (o.xs || [-60, 1040]).entries()) { const w = (o.w ?? 150) * (0.8 + 0.5 * hash(i, 31)); g.beginPath(); g.moveTo(x - w / 2, -900); g.bezierCurveTo(x - w * 0.4, 600, x - w * 0.65, 1500, x - w * 0.9, H + 900); g.lineTo(x + w * 0.9, H + 900); g.bezierCurveTo(x + w * 0.6, 1500, x + w * 0.42, 600, x + w / 2, -900); g.fill();
      g.fillStyle = KIT.hex(o.color || pal.near, pal.key, 0.18); g.fillRect(x + (o.lit ?? -1) * w * 0.3, -900, w * 0.1, H + 1800); g.fillStyle = o.color || pal.near; }
  };
  /** The ground plane from y down: a gradient with a few painted bands. o = { y, color, color2, bands } */
  ST.ground = (g, pal, o = {}) => {
    pal = ST.pal(pal); const y = o.y ?? 1500;
    KIT.vgrad(g, y, H + 900, [[0, o.color || pal.mid], [1, o.color2 || pal.near]], BIG[0], BIG[0] + BIG[2]);
    g.fillStyle = o.color || pal.mid; g.beginPath(); g.moveTo(BIG[0], y + 6);
    for (let x = BIG[0]; x <= BIG[0] + BIG[2]; x += 80) g.lineTo(x, y - 14 * noise.n2(x * 0.004, (o.seed || 0) + 2) - 8); g.lineTo(BIG[0] + BIG[2], y + 40); g.lineTo(BIG[0], y + 40); g.fill();
    for (let i = 0; i < (o.tufts ?? 16); i++) {   // the ground is painted: tufts and small stones, larger toward us
      const v = hash(i, (o.seed || 0) + 41), x = BIG[0] + 300 + hash(i, 42) * (W + 500), yy = y + 30 + v * v * 520, sc = 0.5 + v * 1.4;
      g.fillStyle = KIT.hex(o.color2 || pal.near, i % 3 ? '#000000' : pal.key, i % 3 ? 0.25 : 0.2); g.globalAlpha = 0.8;
      if (i % 4 === 0) { g.beginPath(); g.ellipse(x, yy, 26 * sc, 10 * sc, 0, Math.PI, 0); g.fill(); }
      else for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * 7 * sc - 4 * sc, yy); g.quadraticCurveTo(x + k * 12 * sc, yy - 30 * sc, x + k * 16 * sc, yy - (34 + 10 * hash(i + k, 7)) * sc); g.quadraticCurveTo(x + k * 10 * sc, yy - 18 * sc, x + k * 7 * sc + 4 * sc, yy); g.fill(); }
    }
    g.globalAlpha = 1;
  };
  /** Water (a river or a lake) between y0 and y1 with moving glints. o = { y0, y1, color, glint, T, flow } */
  ST.water = (g, pal, o = {}) => {
    pal = ST.pal(pal); const y0 = o.y0 ?? 1250, y1 = o.y1 ?? 1700, T = o.T || 0;
    KIT.vgrad(g, y0, y1, [[0, o.color || KIT.hex(pal.sky[2], pal.mid, 0.4)], [1, o.color2 || pal.mid]], BIG[0], BIG[0] + BIG[2]);
    for (let i = 0; i < (o.count ?? 60); i++) {
      const v = hash(i, 51), yy = lerp(y0 + 8, y1 - 6, v * v), sp = (o.flow ?? 40) * (0.4 + v), len = (40 + 160 * hash(i, 52)) * (0.4 + v);
      const x = ((hash(i, 53) * (W + 800) + T * sp) % (W + 800)) - 400;
      g.globalAlpha = (0.2 + 0.5 * Math.abs(Math.sin(T * (1 + hash(i, 54)) + i))) * (o.alpha ?? 1); g.fillStyle = o.glint || '#ffffff';
      g.beginPath(); g.ellipse(x, yy, len, 2 + 4 * v, 0, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  };
  /** A thatched hermitage hut (parnashala). o = { x, y, s, color, lit (0..1: the doorway glows) } */
  ST.hut = (g, pal, o = {}) => {
    pal = ST.pal(pal); const x = o.x ?? 760, y = o.y ?? 1500, s = o.s ?? 1, col = o.color || pal.near, hi = KIT.hex(col, pal.key, 0.3);
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = KIT.hex(col, pal.mid, 0.4); g.fillRect(-200, -260, 400, 260);
    g.strokeStyle = KIT.hex(col, '#000000', 0.3); g.lineWidth = 3; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * 46, -260); g.lineTo(i * 46, 0); g.stroke(); } for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(-200, -k * 66); g.lineTo(200, -k * 66); g.stroke(); }   // wattle
    for (let k = 0; k < 4; k++) {   // four layers of thatch, each with a ragged eave
      const u0 = k / 4, u1 = (k + 1) / 4, w0 = lerp(40, 290, u0), w1 = lerp(40, 290, u1) + 14, y0 = lerp(-560, -250, u0), y1 = lerp(-560, -250, u1) + 16;
      g.fillStyle = k % 2 ? col : KIT.hex(col, pal.key, 0.1); g.beginPath(); g.moveTo(-w0, y0); g.lineTo(w0, y0); g.lineTo(w1, y1);
      for (let q = 12; q >= 0; q--) g.lineTo(lerp(-w1, w1, q / 12), y1 + (q % 2 ? 12 : 0)); g.closePath(); g.fill();
      g.strokeStyle = hi; g.globalAlpha = 0.5; g.lineWidth = 2.5; for (let q = 0; q < 9; q++) { const u = (q + 0.5) / 9; g.beginPath(); g.moveTo(lerp(-w0, w0, u), y0 + 4); g.lineTo(lerp(-w1, w1, u), y1 - 2); g.stroke(); } g.globalAlpha = 1;
    }
    g.fillStyle = col; g.beginPath(); g.arc(0, -566, 22, 0, TAU); g.fill();
    g.fillStyle = KIT.hex('#140a04', pal.key, 0.8 * (o.lit ?? 0)); g.beginPath(); g.moveTo(-60, 0); g.lineTo(-60, -160); g.quadraticCurveTo(0, -214, 60, -160); g.lineTo(60, 0); g.fill();
    g.strokeStyle = hi; g.lineWidth = 9; g.beginPath(); g.moveTo(-66, 0); g.lineTo(-66, -162); g.quadraticCurveTo(0, -222, 66, -162); g.lineTo(66, 0); g.stroke();   // the door frame
    if (o.lit) KIT.glow(g, 0, -90, 240, pal.key, 0.5 * o.lit);
    g.restore();
  };
  /** A hall of pillars in one-point perspective (a court, a sacrificial hall). o = { y (floor), n, color, cap } */
  ST.pillars = (g, pal, o = {}) => {
    pal = ST.pal(pal); const y = o.y ?? 1500, n = o.n ?? 5, col = o.color || pal.mid;
    for (let i = 0; i < n; i++) for (const sgn of [-1, 1]) {
      const u = i / (n - 1), x = 540 + sgn * lerp(o.x0 ?? 760, o.x1 ?? 240, u) * (o.spread ?? 1), w = lerp(150, 56, u), top = lerp(-700, 520, u), base = lerp(y + 260, y - 60, u);
      g.fillStyle = KIT.hex(col, pal.haze, u * 0.55); g.fillRect(x - w / 2, top, w, base - top);
      g.fillStyle = KIT.hex(col, pal.key, 0.22 + 0.2 * u); g.fillRect(x - w / 2 + (sgn > 0 ? 0 : w * 0.82), top, w * 0.18, base - top);
      g.fillStyle = KIT.hex(pal.accent, col, 0.5); g.fillRect(x - w * 0.7, base - w * 0.3, w * 1.4, w * 0.3); g.fillRect(x - w * 0.7, top + (o.cap ?? 0), w * 1.4, w * 0.26);
      g.fillStyle = KIT.hex(R.PAL.gold, col, 0.35 + 0.4 * u);   // painted bands: lotus-petal rings up the shaft (the old episodes' ornament)
      for (let q = 1; q < 6; q++) { const yy = lerp(base - w * 0.3, Math.max(top, -200), q / 6); g.fillRect(x - w / 2, yy, w, Math.max(3, w * 0.05)); for (let d = 0; d < 4; d++) { g.beginPath(); g.arc(x - w / 2 + (d + 0.5) * w / 4, yy - w * 0.1, w * 0.07, 0, TAU); g.fill(); } }
    }
  };
  /** Grass or reed blades along a line (foreground: they sway). o = { y, h, color, count, T, seed, x0, x1 } */
  ST.grass = (g, pal, o = {}) => {
    pal = ST.pal(pal); const y = o.y ?? 1750, h = o.h ?? 150, n = o.count ?? 70, T = o.T || 0, x0 = o.x0 ?? -300, x1 = o.x1 ?? W + 300;
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, hash(i, (o.seed || 0) + 61)), hh = h * (0.5 + hash(i, 62)), sw = Math.sin(T * 1.3 + i * 0.9) * hh * 0.12 + (o.wind || 0) * hh * 0.3, w = 7 + 9 * hash(i, 63);
      g.fillStyle = i % 4 === 0 ? KIT.hex(o.color || pal.near, pal.key, 0.25) : (o.color || pal.near);
      g.beginPath(); g.moveTo(x - w, y + 20); g.quadraticCurveTo(x - w * 0.3 + sw * 0.4, y - hh * 0.6, x + sw, y - hh); g.quadraticCurveTo(x + w * 0.6 + sw * 0.4, y - hh * 0.5, x + w, y + 20); g.fill();
    }
  };

  // ─── Atmosphere ───────────────────────────────────────────────────────────────────────────────────────────────
  /** Slanting light shafts. o = { x (where they enter, top), y, angle (rad from vertical), count, len, width, color, alpha } */
  ST.shafts = (g, T, o = {}) => {
    const n = o.count ?? 5, x0 = o.x ?? 200, y0 = o.y ?? -200, len = o.len ?? 2200, a = o.angle ?? 0.35;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const u = n > 1 ? i / (n - 1) : 0.5, x = x0 + (u - 0.5) * (o.spread ?? 620), w = (o.width ?? 90) * (0.6 + 0.9 * hash(i, 71 + (o.seed || 0)));
      const sh = 0.55 + 0.45 * noise.n2(T * 0.35 + i * 3.7, 2 + (o.seed || 0));
      const dx = Math.sin(a) * len, dy = Math.cos(a) * len;
      const gr = g.createLinearGradient(x, y0, x + dx, y0 + dy);
      const [r, gg, b] = R.hexToRgb(o.color || '#fff4c8');
      gr.addColorStop(0, `rgba(${r},${gg},${b},${(o.alpha ?? 0.22) * sh})`); gr.addColorStop(0.7, `rgba(${r},${gg},${b},${(o.alpha ?? 0.22) * sh * 0.45})`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 0.3, y0); g.lineTo(x + w * 0.3, y0); g.lineTo(x + dx + w * 1.5, y0 + dy); g.lineTo(x + dx - w * 1.5, y0 + dy); g.closePath(); g.fill();
    }
    g.restore();
  };
  /**
   * Drifting particles, each with its own depth (size, speed and parallax follow it).
   * o = { kind, count, box: [x, y, w, h], color, alpha, cam (for parallax), seed, wind, size }
   */
  const KINDS = {
    ember: { vy: -90, vx: 14, size: 3.2, glow: 6, tw: 9, col: '#ffb547', add: true },
    dust: { vy: -6, vx: 10, size: 2.4, glow: 5, tw: 0.9, col: '#fff0c8', add: true },
    pollen: { vy: -14, vx: 22, size: 3.4, glow: 5, tw: 1.6, col: '#fff6a0', add: true },
    ash: { vy: 46, vx: 18, size: 3.6, glow: 0, tw: 0.6, col: '#d8d4cc', add: false },
    petal: { vy: 70, vx: 40, size: 9, glow: 0, tw: 2.2, col: '#ff9ab8', add: false, petal: true },
    rain: { vy: 1500, vx: -160, size: 2, glow: 0, tw: 0, col: '#c8dcff', add: false, streak: 60 },
    firefly: { vy: 0, vx: 0, size: 3, glow: 9, tw: 1.4, col: '#e8ff8a', add: true, wander: 60 },
    spray: { vy: -40, vx: 60, size: 2.6, glow: 3, tw: 4, col: '#ffffff', add: true },
    snow: { vy: 60, vx: 12, size: 4, glow: 2, tw: 0.4, col: '#ffffff', add: false },
  };
  ST.particles = (g, T, o = {}) => {
    const K = KINDS[o.kind || 'dust'], n = o.count ?? 60, [bx, by, bw, bh] = o.box || [-100, 0, W + 200, H], seed = o.seed ?? 7, c = o.cam;
    const col = o.color || K.col;
    g.save(); if (K.add) g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const z = 0.35 + 1.5 * hash(i, seed), sp = 0.5 + z * 0.6;
      let x = bx + ((hash(i, seed + 1) * bw + (K.vx + (o.wind || 0)) * sp * T + noise.n2(i * 1.7, T * 0.4) * 40) % bw + bw) % bw;
      let y = by + ((hash(i, seed + 2) * bh + K.vy * sp * T) % bh + bh) % bh;
      if (K.wander) { x += Math.sin(T * (0.5 + hash(i, seed + 5)) + i) * K.wander; y += Math.cos(T * (0.4 + hash(i, seed + 6)) + i * 2) * K.wander * 0.6; }
      if (c) { x -= c.px * (z - 1) * 0.6; y -= c.py * (z - 1) * 0.6; }
      const tw = K.tw ? 0.55 + 0.45 * Math.sin(T * K.tw * (0.6 + hash(i, seed + 3)) + i * 2.1) : 1;
      const edge = Math.min(1, Math.min(y - by, by + bh - y) / (bh * 0.12));
      const band = R.script && R.script.captionBand && o.band !== false ? R.script.captionBand.y : null;   // never over the captions (research §5.8)
      const off = band ? clamp(Math.max(band - 210 - y, y - (band + 70)) / 60 + 1) : 1;
      const a = clamp((o.alpha ?? 0.8) * tw * clamp(edge) * (z > 1.4 ? 0.55 : 1) * off);
      if (a < 0.02) continue;
      const s = (o.size ?? K.size) * z * (z > 1.4 ? 2.2 : 1);   // the nearest motes are big and soft (out of focus)
      g.globalAlpha = a; g.fillStyle = col;
      if (K.streak) { const ln = K.streak * z * (0.5 + 1.2 * hash(i, seed + 8)), sl = (K.vx + (o.wind || 0) * 6) / K.vy; g.globalAlpha = a * (0.35 + 0.65 * hash(i, seed + 9)); g.strokeStyle = col; g.lineWidth = s * (0.6 + 0.6 * hash(i, seed + 7)); g.beginPath(); g.moveTo(x, y); g.lineTo(x + sl * ln, y + ln); g.stroke(); }
      else if (K.petal) { g.save(); g.translate(x, y); g.rotate(T * (1 + hash(i, seed + 4)) + i); g.beginPath(); g.ellipse(0, 0, s, s * 0.45, 0, 0, TAU); g.fill(); g.restore(); }
      else { g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
      if (K.glow) KIT.glow(g, x, y, s * K.glow, col, a * 0.5);
    }
    g.restore();
  };
  /** Bands of ground mist drifting sideways. o = { y, h, color, alpha, count, speed } */
  ST.mist = (g, T, o = {}) => {
    const y = o.y ?? 1400, h = o.h ?? 300, n = o.count ?? 7;
    g.save();
    for (let i = 0; i < n; i++) {
      const x = ((hash(i, 81 + (o.seed || 0)) * (W + 1200) + T * (o.speed ?? 22) * (0.5 + hash(i, 82))) % (W + 1200)) - 600, yy = y + (hash(i, 83) - 0.5) * h;
      KIT.glow(g, x, yy, 520 + 300 * hash(i, 84), o.color || '#e8f0f8', (o.alpha ?? 0.3) * (0.6 + 0.4 * Math.sin(T * 0.3 + i)), 'source-over', 0.22);
    }
    g.restore();
  };
  /** A soft coloured vignette. o = { color, alpha, cx, cy, r0, r1 } */
  ST.vignette = (g, o = {}) => {
    g.save(); g.setTransform(R.scale, 0, 0, R.scale, 0, 0);
    const gr = g.createRadialGradient(o.cx ?? W / 2, o.cy ?? H * 0.45, (o.r0 ?? 0.3) * H, o.cx ?? W / 2, o.cy ?? H * 0.45, (o.r1 ?? 0.8) * H);
    const [r, gg, b] = R.hexToRgb(o.color || '#0a0604');
    gr.addColorStop(0, `rgba(${r},${gg},${b},0)`); gr.addColorStop(1, `rgba(${r},${gg},${b},${o.alpha ?? 0.55})`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  };
  /** Mural finish: brush-edge grain (long bristle streaks, a fixed texture) and a worn painted border. */
  let bristle = null;
  function buildBristle() {
    const c = document.createElement('canvas'); c.width = 540; c.height = 960;
    const g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 540, 960);
    const r = R.rng(7711);
    for (let i = 0; i < 2600; i++) { const x = r() * 540, y = r() * 960, l = 30 + r() * 150, a = -0.5 + (r() - 0.5) * 0.5; g.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.03 + r() * 0.07})` : `rgba(0,0,0,${0.03 + r() * 0.08})`; g.lineWidth = 0.6 + r() * 2.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 8, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    bristle = c;
  }
  let plaster = null;
  function buildPlaster() {
    const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'), img = g.createImageData(540, 960), d = img.data, r = R.rng(9191);
    for (let y = 0; y < 960; y++) for (let x = 0; x < 540; x++) { const m = noise.fbm2(x / 70, y / 70, 4) * 0.5 + noise.fbm2(x / 9 + 30, y / 9, 2) * 0.3, v = 214 + m * 60 + r.gauss() * 7, i = (y * 540 + x) * 4; d[i] = v + 4; d[i + 1] = v; d[i + 2] = v - 8; d[i + 3] = 255; }
    g.putImageData(img, 0, 0); g.lineCap = 'round';
    for (let k = 0; k < 22; k++) { let x = r() * 540, y = r() * 960, a = r() * TAU; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 30 + r() * 50; q++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 4; y += Math.sin(a) * 4; g.lineTo(x, y); } g.strokeStyle = `rgba(90,70,50,${0.18 + r() * 0.25})`; g.lineWidth = 0.5 + r() * 0.7; g.stroke(); }
    plaster = c;
  }
  /** Mural finish: lime plaster under the paint (a multiply pass, strong enough to read on bright palettes), brush-edge grain,
   *  and (o.frieze) the painted border of a mural panel: two gold lines and a running row of lotus buds, top and bottom. */
  ST.finish = (g, T, o = {}) => {
    if (!bristle) buildBristle();
    if (!plaster) buildPlaster();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = o.plaster ?? 0.55; g.drawImage(plaster, 0, 0, g.canvas.width, g.canvas.height);
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = o.grain ?? 0.35; g.drawImage(bristle, 0, 0, g.canvas.width, g.canvas.height);
    g.restore();
    if (o.frieze ?? 0) {
      g.save(); g.setTransform(R.scale, 0, 0, R.scale, 0, 0); g.globalAlpha = o.frieze; const gold = R.PAL.gold;
      for (const y of [150, H - 330]) {
        g.fillStyle = 'rgba(14,8,6,0.55)'; g.fillRect(0, y - 26, W, 52); g.fillStyle = gold; g.fillRect(0, y - 26, W, 3); g.fillRect(0, y + 23, W, 3);
        for (let x = 30; x < W; x += 60) { g.beginPath(); g.moveTo(x, y - 14); g.bezierCurveTo(x + 12, y - 4, x + 12, y + 8, x, y + 14); g.bezierCurveTo(x - 12, y + 8, x - 12, y - 4, x, y - 14); g.fill(); g.beginPath(); g.arc(x + 30, y, 3.5, 0, TAU); g.fill(); }
      }
      g.restore();
    }
  };

  /** FRAME-WITHIN-FRAME: the picture through a dark painted aperture. o = { shape, draw(g), pal, box: [x, y, w, h], open (0..1), color } */
  ST.within = (ctx, T, o) => {
    note('moves', 'frame');
    const pal = ST.pal(o.pal), [x, y, w, h] = o.box || [150, 330, 780, 1150], open = E.outCubic(clamp(o.open ?? 1));
    const path = (g) => {
      g.beginPath();
      if (o.shape === 'door') g.rect(x + w * 0.5 * (1 - open), y, w * open, h);
      else if (o.shape === 'window') g.roundRect(x, y + h * 0.5 * (1 - open), w, h * open, 30);
      else if (o.shape === 'cave') { KIT.scallopPath(g, x + w / 2, y + h / 2, w / 2 * open, h / 2 * open, 13, 5, 0.12); }
      else if (o.shape === 'leaves') { KIT.scallopPath(g, x + w / 2, y + h / 2, w * 0.52 * open, h * 0.5 * open, 17, 9, 0.3, T * 0.02); }
      else KIT.series.archPath(g, x + w / 2 - (w / 2) * open, y, w * open, h, 0.3);
    };
    ctx.save(); path(ctx); ctx.clip(); o.draw(ctx); ctx.restore();
    // the dark surround, with the aperture cut out, and a lit inner edge
    ctx.save(); ctx.fillStyle = o.color || KIT.hex(pal.near, '#000000', 0.55); ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20);
    const b = R.buffer('st-within', W, H); b.clear(); const g = b.ctx; g.fillStyle = o.color || KIT.hex(pal.near, '#000000', 0.55); g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out'; path(g); g.fill(); g.globalCompositeOperation = 'source-over';
    if (o.shape === 'leaves') { g.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 60; i++) { g.fillStyle = KIT.hex(pal.near, pal.mid, hash(i, 5)); g.globalAlpha = 0.5; g.beginPath(); g.ellipse(hash(i, 1) * W, hash(i, 2) * H, 60 + 80 * hash(i, 3), 22, hash(i, 4) * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    ctx.restore();
    ctx.drawImage(b.canvas, 0, 0, W, H);
    ctx.save(); ctx.strokeStyle = o.shape === 'leaves' || o.shape === 'cave' ? KIT.hex(pal.key, pal.accent, 0.3) : R.PAL.gold; ctx.globalAlpha = 0.7; ctx.lineWidth = 6; path(ctx); ctx.stroke();
    if (o.shape !== 'leaves' && o.shape !== 'cave') {   // a carved frame: an outer line and a row of buds round the opening (the old recap niche)
      ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.translate(x + w / 2, y + h / 2); ctx.scale(1.045, 1.03); ctx.translate(-(x + w / 2), -(y + h / 2)); path(ctx); ctx.stroke();
      ctx.setTransform(R.scale, 0, 0, R.scale, 0, 0); ctx.fillStyle = R.PAL.gold; ctx.globalAlpha = 0.7;
      for (let i = 0; i <= 12; i++) for (const xx of [x - 34, x + w + 34]) { const yy = y + h * 0.3 + (h * 0.68 * i) / 12; ctx.beginPath(); ctx.ellipse(xx, yy, 7, 12, 0, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  };

  // ─── Transitions born from the medium ─────────────────────────────────────────────────────────────────────────
  const TR = (KIT.transitions = {});
  const full = (ctx, c) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.restore(); };
  function blot(g, x, y, r, seed) { g.beginPath(); KIT.scallopPath(g, x, y, r, r * (0.8 + 0.3 * hash(seed, 3)), 11, seed, 0.16, hash(seed, 4) * 6); g.fill(); }
  TR.masks = {
    ink(g, k, T, o) {
      const [ax, ay] = o.at || [540, 900], n = 46, e = E.inOutSine(k);
      g.fillStyle = '#000';
      for (let i = 0; i < n; i++) {
        const d = i === 0 ? 0 : Math.pow(hash(i, 91), 0.7) * 1500, a = hash(i, 92) * TAU, st = (d / 1500) * 0.62;
        const kk = clamp((e - st) / 0.42); if (kk <= 0) continue;
        blot(g, ax + Math.cos(a) * d * 0.62, ay + Math.sin(a) * d, (160 + 420 * hash(i, 93)) * E.outCubic(kk) * (i === 0 ? 2.2 : 1), i);
        for (let q = 0; q < 3; q++) { const aa = a + q * 2.1, rr = (200 + 300 * hash(i, 94 + q)) * kk; g.beginPath(); g.arc(ax + Math.cos(a) * d * 0.62 + Math.cos(aa) * rr, ay + Math.sin(a) * d + Math.sin(aa) * rr, 14 * kk + 10 * hash(i, 97 + q), 0, TAU); g.fill(); }
      }
      if (k > 0.93) { g.globalAlpha = (k - 0.93) / 0.07; g.fillRect(-10, -10, W + 20, H + 20); g.globalAlpha = 1; }
    },
    brush(g, k, T, o) {
      // 4 broad strokes, each a bundle of bristles of unequal reach (a dry-brush edge: ragged, with gaps), laid one after another
      const n = o.strokes ?? 4, ang = o.angle ?? -0.2, B = 46;
      g.save(); g.translate(W / 2, H / 2); g.rotate(ang); g.fillStyle = '#000';
      const span = H * 1.3, sw = span / n;
      for (let i = 0; i < n; i++) {
        const st = (i / n) * 0.5, kk = E.inOutSine(clamp((k - st) / 0.5)); if (kk <= 0) continue;
        const dir = i % 2 ? -1 : 1, y0 = -span / 2 + i * sw - sw * 0.12, len = W * 1.9 * kk, x0 = -dir * W * 0.95;
        for (let q = 0; q < B; q++) {
          const h1 = hash(i * 97 + q, 5), h2 = hash(i * 97 + q, 6), reach = len * (0.82 + 0.18 * h1) - 120 * h2 * (1 - kk), bh = (sw * 1.24) / B;
          if (reach <= 0) continue;
          g.globalAlpha = kk > 0.97 ? 1 : (h2 > 0.9 ? 0.55 : 1);   // a few thin, half-loaded bristles
          const yy = y0 + q * bh; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + dir * (reach - 40), yy); g.quadraticCurveTo(x0 + dir * reach, yy + bh * 0.5, x0 + dir * (reach - 40), yy + bh + 1); g.lineTo(x0, yy + bh + 1); g.closePath(); g.fill();
        }
      }
      g.restore(); g.globalAlpha = 1;
      if (k > 0.95) { g.globalAlpha = (k - 0.95) / 0.05; g.fillRect(-10, -10, W + 20, H + 20); g.globalAlpha = 1; }
    },
    lamp(g, k, T, o) {
      const [bx, by] = o.to || [540, 900], kk = E.inOutSine(clamp((k - 0.35) / 0.65)), r = 60 + 2400 * kk * kk;
      const gr = g.createRadialGradient(bx, by, r * 0.55, bx, by, r);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(-10, -10, W + 20, H + 20);
    },
  };
  /** Run a transition: the engine calls this while 0 ≤ k < 1. drawOld / drawNew paint a full frame into a context. */
  TR.run = (ctx, tr, k, T, drawOld, drawNew) => {
    const type = tr.type || 'dissolve';
    note('transitions', type);
    const A = R.buffer('tr-a', W, H), B = R.buffer('tr-b', W, H);
    A.clear('#0b0806'); drawOld(A.ctx); R.resetCtx(A.ctx);
    B.clear('#0b0806'); drawNew(B.ctx); R.resetCtx(B.ctx);
    if (type === 'dissolve') { full(ctx, A.canvas); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = E.inOutSine(k); ctx.drawImage(B.canvas, 0, 0); ctx.restore(); return; }
    if (type === 'smoke' || type === 'lamp') {
      // NEVER A BLANK FRAME: the two pictures cross-dissolve underneath (k 0.3 → 0.7) while the smoke or the glow passes over;
      // the veil never hides more than about 70 %, and the lamp is a warm cream, never white.
      full(ctx, A.canvas);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = E.inOutSine(clamp((k - 0.3) / 0.4)); ctx.drawImage(B.canvas, 0, 0); ctx.restore();
      const dens = Math.sin(Math.PI * clamp(k));
      ctx.save(); R.resetCtx(ctx);
      if (type === 'smoke') {
        const dir = tr.dir ?? -Math.PI / 2, col = tr.color || '#b8b0a8';
        for (let i = 0; i < 30; i++) {
          const u = hash(i, 101), v = hash(i, 102), travel = (k - 0.5) * 1500 + (hash(i, 103) - 0.5) * 500;
          const x = u * W + Math.cos(dir) * travel + Math.sin(T * 0.8 + i) * 30, y = v * H + Math.sin(dir) * travel;
          KIT.glow(ctx, x, y, 380 + 360 * hash(i, 104), i % 3 ? col : KIT.hex(col, '#ffffff', 0.35), clamp(dens * 0.7 * (0.4 + 0.6 * hash(i, 105))), 'source-over', 0.8);
        }
      } else {
        const [ax, ay] = tr.from || [540, 900], [bx, by] = tr.to || [540, 900], px = lerp(ax, bx, E.inOutSine(k)), py = lerp(ay, by, E.inOutSine(k)), col = tr.color || '#f4dca8';
        KIT.glow(ctx, px, py, 260 + 1500 * dens, col, clamp(dens * 0.78), 'source-over');
        KIT.glow(ctx, px, py, 120 + 500 * dens, '#fff2d0', clamp(dens * 0.6), 'source-over');
      }
      ctx.restore();
      return;
    }
    const M = R.buffer('tr-m', W, H); M.clear();
    TR.masks[type](M.ctx, k, T, tr); R.resetCtx(M.ctx);
    full(ctx, A.canvas);
    if (type === 'lamp') {
      // the glow in the old shot swells first
      const [ax, ay] = tr.from || [540, 900], sw = E.inOutSine(clamp(k / 0.5));
      ctx.save(); R.resetCtx(ctx); KIT.glow(ctx, ax, ay, 200 + 2600 * sw, tr.color || '#ffe0a0', clamp(sw * 1.3)); KIT.glow(ctx, ax, ay, 100 + 1700 * sw, '#ffffff', clamp(sw * 1.1)); ctx.restore();
    } else {
      // the wet edge: the mask a little larger, in ink (or paint) colour, under the new picture
      const Ed = R.buffer('tr-e', W, H); Ed.clear();
      Ed.ctx.setTransform(1, 0, 0, 1, 0, 0); Ed.ctx.drawImage(M.canvas, 0, 0);
      Ed.ctx.globalCompositeOperation = 'source-in'; Ed.ctx.fillStyle = tr.color || (type === 'ink' ? '#120a08' : '#e8d4a8'); Ed.ctx.fillRect(0, 0, Ed.canvas.width, Ed.canvas.height);
      R.resetCtx(Ed.ctx);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const cw = ctx.canvas.width, ch = ctx.canvas.height, gr = type === 'ink' ? 1.035 : 1.02;
      ctx.globalAlpha = 0.9; ctx.drawImage(Ed.canvas, -cw * (gr - 1) / 2, -ch * (gr - 1) / 2, cw * gr, ch * gr); ctx.restore();
    }
    B.ctx.save(); B.ctx.setTransform(1, 0, 0, 1, 0, 0); B.ctx.globalCompositeOperation = 'destination-in'; B.ctx.drawImage(M.canvas, 0, 0); B.ctx.restore();
    full(ctx, B.canvas);
    if (type === 'lamp') { const [bx, by] = tr.to || [540, 900], dn = 1 - E.inOutSine(clamp((k - 0.45) / 0.55)); if (k > 0.45) { ctx.save(); R.resetCtx(ctx); KIT.glow(ctx, bx, by, 300 + 2400 * dn, '#ffffff', clamp(dn * 1.2)); ctx.restore(); } }
  };
})();
