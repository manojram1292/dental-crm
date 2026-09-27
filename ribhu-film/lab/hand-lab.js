/*
 * Hand lab — turntables and pose tests for RB.hand (src/kit/hand.js).
 * Not part of the film: open lab/hand-lab.html, or
 *   node tools/preview.mjs sheet --page lab/hand-lab.html --from 0 --to 30 --count 24
 *
 *   0.0– 6.0  turntable, relaxed pose
 *   6.0–13.0  preset parade (right hand from the back, left hand from the palm side)
 *  13.0–16.0  close-up: sensor module, knuckles, wrist
 *  16.0–21.5  cup grip: hold in shots.cupMake, a two-handed hold, then approach / lift / release
 *  21.5–26.0  palm up with an ember, then offer (pour to the left)
 *  26.0–30.0  stress: closed fist, wrist extremes
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { E, seg, lerp, PAL } = R;
  let S, hA, hB, cup, shadow, lamp;

  const P = () => RB.hand.poses;
  const cyc = (list, t, hold, fade) => {
    // cycle through poses: each holds `hold`, blends over `fade`
    const per = hold + fade, i = Math.min(list.length - 1, Math.floor(t / per)), u = t - i * per;
    const next = list[Math.min(list.length - 1, i + 1)];
    return { pose: RB.hand.blend(P()[list[i]], P()[next], E.inOutSine(seg(u, hold, per))), name: list[i] };
  };

  function label(ctx, text, sub) {
    ctx.save();
    ctx.font = R.font(15, 'mono', 700); ctx.letterSpacing = '3px'; ctx.fillStyle = PAL.ember;
    ctx.fillText(text, 120, 120);
    if (sub) { ctx.font = R.font(13, 'mono', 400); ctx.fillStyle = R.rgba(PAL.ivory, 0.6); ctx.fillText(sub, 120, 146); }
    ctx.restore();
  }

  R.scene({
    id: 'hand-lab', index: 1, label: 'Hand lab', start: 0, end: 30,
    init() {
      S = RB.stage();
      hA = RB.hand.create({ side: 'right' });
      hB = RB.hand.create({ side: 'left' });
      S.scene.add(hA.group, hB.group);
      cup = RB.cup();
      shadow = RB.contactShadow(0.95, 0.6);
      S.scene.add(cup.group, shadow);
      lamp = new THREE.PointLight('#ffb48e', 0, 2.2, 2);
      S.scene.add(lamp);
      window.__handLab = { hA, hB, cup, S };
    },
    draw(ctx, t, env) {
      const T = env.T;
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 1000 });
      hA.group.visible = true; hB.group.visible = false;
      cup.group.visible = false; shadow.visible = false; lamp.intensity = 0;
      hA.group.scale.setScalar(1); hB.group.scale.setScalar(1);
      cup.group.position.set(0, 0, 0); cup.group.rotation.set(0, 0, 0);
      let cam, title = '', sub = '', ember = null;

      if (T < 6) {
        // ── turntable
        hA.setPose(P().relaxed);
        hA.group.position.set(0, 0.62, 0);
        hA.group.rotation.set(0, -0.6 + (T / 6) * Math.PI * 2, 0);
        cam = { pos: [0, 0.25, 3.7], look: [0, 0.02, 0], fov: 30 };
        title = 'TURNTABLE · RELAXED'; sub = `${hA.triangles} triangles`;
      } else if (T < 13) {
        // ── preset parade: back view (left) and palm view (right)
        const { pose, name } = cyc(['open', 'relaxed', 'cupGrip', 'palmUp', 'offer'], T - 6, 1.05, 0.35);
        hB.group.visible = true;
        hA.setPose(P().relaxed).place({ palm: [0, -0.55, -0.83], forearm: [0.35, 1, 0.25], at: [-0.72, 0.62, 0] });
        hB.setPose(P().relaxed).place({ palm: [0.1, 0.1, 1], forearm: [0.35, 1, -0.1], at: [0.72, 0.62, 0] });
        hA.setPose(pose); hB.setPose(pose);
        cam = { pos: [0, 0.1, 4.6], look: [0, -0.02, 0], fov: 30 };
        title = `PRESET · ${name.toUpperCase()}`; sub = 'right hand, back / left hand, palm';
      } else if (T < 16) {
        // ── close-up
        const u = (T - 13) / 3;
        hA.setPose(P().relaxed);
        hA.group.position.set(0, 0.5, 0);
        hA.group.rotation.set(0.25, 0.35, 0);
        cam = { pos: [lerp(0.75, -0.35, E.inOutSine(u)), 0.55, 1.45], look: [0, 0.1, 0.05], fov: 30 };
        title = 'CLOSE-UP · MODULE / KNUCKLES';
      } else if (T < 21.5) {
        // ── cup grip test
        cup.group.visible = true; shadow.visible = true;
        const around = 0.55, tilt = RB.hand.grip.tilt;
        if (T < 16.75) {
          hA.setPose(P().cupGrip).graspCup(cup.group, { around, tilt });
          cam = RB.shots.cupMake;
          title = 'CUP GRIP · HOLD'; sub = `graspCup(cup, { around: ${around}, tilt: ${tilt} }) · shots.cupMake`;
        } else if (T < 17.5) {
          hB.group.visible = true;
          hA.setPose(P().cupGrip).graspCup(cup.group, { around: 1.6, tilt });
          hB.setPose(P().cupGrip).graspCup(cup.group, { around: -1.6, tilt });
          cam = { pos: [0, 1.25, 3.6], look: [0, 0.62, 0], fov: 34 };
          title = 'CUP GRIP · TWO HANDS'; sub = 'left hand = mirrored grip, same `around` convention';
        } else {
          const u = T - 17.5;
          // arrive: descend while far out (0–0.6), glide in along the contact normal (0.3–1.0),
          // close (0.55–1.05) → contact ≈1.05; lift & turn 1.3–2.2; set down 2.5–3.2;
          // open (3.25–3.65) *before* backing off along the normal (3.55–4.0)
          const close = E.inOutCubic(seg(u, 0.55, 1.05)) * (1 - E.inOutCubic(seg(u, 3.25, 3.65)));
          hA.setPose(RB.hand.blend(P().open, P().cupGrip, close));
          const lift = E.inOutCubic(seg(u, 1.3, 2.2)) * (1 - E.inOutCubic(seg(u, 2.5, 3.2)));
          cup.group.position.set(0, 0.24 * lift, 0);
          cup.group.rotation.set(0, 0.45 * lift, -0.14 * lift);
          const away = 0.55 * (1 - E.outCubic(seg(u, 0.3, 1.05))) + 0.55 * E.inCubic(seg(u, 3.55, 4.0));
          hA.graspCup(cup.group, { around, tilt, away });
          const rise = 1 - E.outCubic(seg(u, 0, 0.6));
          hA.group.position.y += 0.9 * rise;
          cam = RB.shots.cupMake;
          title = 'CUP GRIP · APPROACH / LIFT / RELEASE'; sub = `close ${close.toFixed(2)}  lift ${lift.toFixed(2)}`;
        }
        shadow.position.set(cup.group.position.x, 0.002, cup.group.position.z);
      } else if (T < 26) {
        // ── palm up with ember → offer
        const u = T - 21.5;
        hA.setPose(P().palmUp).place({ palm: [0, 1, 0], forearm: [0.85, -0.5, 0.35], palmAt: [0, 0.3, 0] });
        // the group stays where palmUp put it; blending toward offer tips the palm to the fingertips
        const k = E.inOutSine(seg(u, 2.2, 3.2));
        hA.setPose(RB.hand.blend(P().palmUp, P().offer, k));
        const pp = hA.palmPoint(), pn = hA.palmNormal(), tips = hA.fingertips();
        const lip = tips[1].clone().add(tips[2]).multiplyScalar(0.5).addScaledVector(pn, 0.03);
        const roll = E.inQuad(seg(u, 2.9, 3.9));
        const ep = pp.clone().addScaledVector(pn, 0.018).lerp(lip, roll);
        ep.y -= 0.6 * Math.max(0, u - 3.9) ** 2; // … and off the fingertips
        lamp.position.copy(ep).addScaledVector(pn, 0.05); lamp.intensity = 2.2 * (1 - seg(u, 4.0, 4.4));
        cam = { pos: [0.1, 1.05, 2.7], look: [0, 0.22, 0], fov: 30 };
        ember = ep;
        title = k < 0.5 ? 'PALM UP · EMBER CRADLE' : 'OFFER · POUR LEFT';
        sub = 'place() from palmUp, then blend toward offer';
      } else {
        // ── stress tests
        const u = T - 26;
        if (u < 2) {
          hA.setPose({ curl: 1, spread: 0, thumbOpp: 0.65, wrist: [0, 0, 0] });
          hA.group.position.set(0, 0.55, 0);
          hA.group.rotation.set(0, u < 1 ? 0.5 : Math.PI + 0.6, 0);
          cam = { pos: [0, 0.2, 2.6], look: [0, -0.05, 0], fov: 30 };
          title = 'STRESS · CLOSED FIST'; sub = u < 1 ? 'back' : 'palm';
        } else {
          const w = u < 3 ? [1.1, 0.4 * Math.sin((u - 2) * Math.PI * 2), 0] : [-1.1, -0.4, 0.9];
          hA.setPose({ curl: [0.3, 0.2, 0.25, 0.3, 0.35], spread: 0.5, thumbOpp: 0.4, wrist: w });
          hA.group.position.set(0, 0.35, 0);
          hA.group.rotation.set(0, 1.1, 0);
          cam = { pos: [0, 0.3, 3.1], look: [0, 0.05, 0], fov: 30 };
          title = 'STRESS · WRIST EXTREMES'; sub = `pitch ${w[0].toFixed(2)} yaw ${w[1].toFixed(2)} roll ${w[2].toFixed(2)}`;
        }
      }

      RB.setCam(S.camera, cam);
      RB.draw3D(ctx, S.scene, S.camera);
      if (ember) {
        const [x, y] = RB.toScreen(S.camera, ember.x, ember.y, ember.z);
        RB.fx.ember(ctx, x, y, 13, { intensity: 1 });
      }
      label(ctx, title, sub);
    },
  });
})();
