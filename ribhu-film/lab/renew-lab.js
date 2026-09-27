/*
 * Renew lab: studies of the S6 human hand (film seconds 0–21; S6 itself plays at 21–30).
 *   0–4   relaxed, palm up, slow orbit     4–8   open (reaching)     8–12  hold, with the seed
 *   12–16 close-up of the palm and seed     16–19 debug views   19–21 thumb and nails
 *   21–30 S6 itself, through a close-up camera on the human hand (window.__S6_DEV)
 */
(function () {
  'use strict';
  // At film 21–30 this page plays S6 itself through a close-up camera on the human hand.
  window.__S6_DEV = {
    cam: (tf) => {
      const L = window.__S6.state.LAND;
      return { pos: [L.x - 0.32, L.y + 0.72, L.z + 1.3], look: [L.x + 0.28, L.y + 0.02, L.z], fov: 30 };
    },
  };
  const R = window.REEL, RB = window.RB, THREE = window.THREE, { PAL, E, seg, lerp } = R;
  let S, H, key, rim, rim2;
  function label(ctx, text, sub) {
    ctx.save();
    ctx.font = R.font(20, 'mono', 700); ctx.letterSpacing = '3px'; ctx.fillStyle = PAL.ember;
    ctx.fillText(text, 120, 120);
    if (sub) { ctx.font = R.font(20, 'mono', 400); ctx.letterSpacing = '1px'; ctx.fillStyle = R.rgba(PAL.ivory, 0.6); ctx.fillText(sub, 120, 152); }
    ctx.restore();
  }
  R.scene({
    id: 'renew-lab', index: 1, label: 'Renew lab', start: 0, end: 17.5,
    async init() {
      S = RB.stage();
      S.scene.remove(S.key, S.rim);
      S.scene.environmentIntensity = 0.5;
      key = new THREE.SpotLight('#ffd9b3', 1.8, 0, 0.5, 1, 0); key.position.set(-3, 4.5, 4); key.target.position.set(0, 0, 0);
      rim = new THREE.SpotLight('#ffb98a', 5.5, 0, 0.45, 1, 0); rim.position.set(3.5, 2.2, -4.5); rim.target.position.set(0, 0, 0);
      rim2 = new THREE.SpotLight('#ffcfa6', 1.6, 0, 0.45, 1, 0); rim2.position.set(-4, 1.0, -3.5); rim2.target.position.set(0, 0, 0);
      S.scene.add(key, key.target, rim, rim.target, rim2, rim2.target);
      H = await window.__S6.createHuman('right');
      S.scene.add(H.mesh);
      window.__renewLab = { S, H };
    },
    draw(ctx, t, env) {
      const F = env.F, { HP, blendHP, humanRot } = window.__S6;
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 1000, lift: 0.8 });
      let title = '', sub = '', cam, pose = HP.relaxed, seed = null;
      H.U.uDebug.value = 0;
      H.place({ palm: [-0.15, 1, 0.25], fingers: [1, 0.35, -0.2], wrist: [-0.55, -0.25, 0], scale: 6.2 });
      if (F < 4) {
        const a = lerp(-0.5, 0.3, E.inOutSine(seg(F, 0, 4)));
        cam = { pos: [Math.sin(a) * 2.6, 0.9, Math.cos(a) * 2.6], look: [0, -0.05, 0], fov: 30 };
        title = 'RELAXED · PALM UP'; sub = `${H.n0} cage verts → ${H.n} verts, ${H.triangles} tris`;
      } else if (F < 8) {
        pose = HP.open; title = 'OPEN · REACHING';
        cam = { pos: [-0.5, 0.9, 2.5], look: [0, -0.05, 0], fov: 30 };
      } else if (F < 12) {
        pose = blendHP(HP.open, HP.hold, E.inOutSine(seg(F, 8, 10))); title = 'OPEN → HOLD · SEED';
        seed = 1;
        cam = { pos: [-0.5, 0.9, 2.5], look: [0, -0.05, 0], fov: 30 };
      } else if (F < 16) {
        pose = HP.open; seed = 1; title = 'CLOSE-UP · PALM';
        cam = { pos: [-0.3, 1.0, 1.3], look: [0.05, -0.05, 0], fov: 30 };
      } else if (F < 19) {
        pose = HP.open; const dbg = F < 17 ? 1 : F < 18 ? 2 : 3;
        H.U.uDebug.value = dbg; title = 'DEBUG ' + ['', 'VERTEX COLOUR', 'THIN / PALMAR / CONF', 'CREASE / NAIL / KNUCKLE'][dbg];
        cam = { pos: [-0.3, 1.0, 1.3], look: [0.05, -0.05, 0], fov: 30 };
      } else {
        pose = HP.relaxed; title = 'CLOSE-UP · THUMB AND NAILS';
        cam = { pos: [-0.2, 0.55, 1.25], look: [0.25, 0.05, 0], fov: 30 };
      }
      H.setPose(humanRot(pose));
      let sp = null;
      if (seed) {
        const [pp, pn] = H.palmSurface();
        sp = pp.clone().addScaledVector(pn, 0.05);
        H.setSeed({ at: sp, intensity: 0.4, range: 1.2, glow: 0.7, fall: 0.12 });
      } else H.setSeed(null);
      RB.setCam(S.camera, cam);
      RB.draw3D(ctx, S.scene, S.camera);
      if (sp) { const [x, y] = RB.toScreen(S.camera, sp.x, sp.y, sp.z); RB.fx.ember(ctx, x, y, 12, { intensity: 1 }); }
      label(ctx, title, sub);
    },
  });
})();
