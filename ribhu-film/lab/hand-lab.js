/*
 * Hand lab — turntables and pose tests for RB.hand (src/kit/hand.js), the slender arm.
 * Not part of the film: open lab/hand-lab.html, or
 *   node tools/preview.mjs sheet --page lab/hand-lab.html --from 0 --to 38.9 --count 24
 * Timed in FILM seconds (env.F; the preview tools take film seconds):
 *
 *   0.0– 6.0  turntable, relaxed pose
 *   6.0–13.0  preset parade (right hand from the back, left hand from the palm side)
 *  13.0–16.0  close-up: sensor module, knuckles, wrist
 *  16.0–22.0  cup grip (rim pinch): hold in shots.cupMake, a two-handed hold, then
 *              approach / lift / release (penetration-free at every frame)
 *  22.0–27.0  palm up with an ember (setGlow), then offer (pour to the left)
 *  27.0–32.0  Renew study: the arm reaches in from the upper right, palm up, the ember at the
 *              fingers; a slow low three-quarter push-in (a flattering angle for the slim arm)
 *  32.0–36.0  stress: closed fist, wrist extremes
 *  36.0–39.0  the whole arm in profile: the taper of the forearm and its copper rings
 */
(function () {
  'use strict';
  const R = window.REEL, RB = window.RB, THREE = window.THREE;
  const { E, seg, lerp, PAL } = R;
  let S, hA, hB, cup, shadow;

  const P = () => RB.hand.poses;
  const cyc = (list, t, hold, fade) => {
    // cycle through poses: each holds `hold`, blends over `fade`
    const per = hold + fade, i = Math.min(list.length - 1, Math.floor(t / per)), u = t - i * per;
    const next = list[Math.min(list.length - 1, i + 1)];
    return { pose: RB.hand.blend(P()[list[i]], P()[next], E.inOutSine(seg(u, hold, per))), name: list[i] };
  };

  function label(ctx, text, sub) {
    ctx.save();
    ctx.font = R.font(20, 'mono', 700); ctx.letterSpacing = '3px'; ctx.fillStyle = PAL.ember;
    ctx.fillText(text, 120, 120);
    if (sub) { ctx.font = R.font(20, 'mono', 400); ctx.letterSpacing = '1px'; ctx.fillStyle = R.rgba(PAL.ivory, 0.6); ctx.fillText(sub, 120, 152); }
    ctx.restore();
  }

  R.scene({
    id: 'hand-lab', index: 1, label: 'Hand lab', start: 0, end: 30,
    init() {
      S = RB.stage();
      hA = RB.hand.create({ side: 'right', forearm: 4 });   // long enough to leave frame in the wide Renew study
      hB = RB.hand.create({ side: 'left' });
      S.scene.add(hA.group, hB.group);
      cup = RB.cup();
      shadow = RB.contactShadow(0.95, 0.6);
      S.scene.add(cup.group, shadow);
      window.__handLab = { hA, hB, cup, S };
    },
    draw(ctx, t, env) {
      const T = env.F;   // film seconds
      RB.atmos.backdrop(ctx, { gx: 960, gy: 540, gr: 1000 });
      hA.group.visible = true; hB.group.visible = false;
      cup.group.visible = false; shadow.visible = false; shadow.material.opacity = 0.6;
      hA.setGlow(null); hB.setGlow(null);
      hA.group.scale.setScalar(1); hB.group.scale.setScalar(1);
      hA.group.position.set(0, 0, 0); hA.group.rotation.set(0, 0, 0);
      hB.group.position.set(0, 0, 0); hB.group.rotation.set(0, 0, 0);
      cup.group.position.set(0, 0, 0); cup.group.rotation.set(0, 0, 0);
      let cam, title = '', sub = '', ember = null, emberR = 13;

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
        cam = { pos: [lerp(0.7, -0.3, E.inOutSine(u)), 0.5, 1.3], look: [0, 0.12, 0.05], fov: 30 };
        title = 'CLOSE-UP · MODULE / KNUCKLES / WRIST';
      } else if (T < 22) {
        // ── cup grip test: the rim pinch — fingers down the outside, thumb over the rim inside
        cup.group.visible = true; shadow.visible = true;
        const around = 0.8;
        if (T < 17) {
          hA.setPose(P().cupGrip).graspCup(cup.group, { around });
          cam = RB.shots.cupMake;
          title = 'CUP GRIP · HOLD'; sub = `graspCup(cup, { around: ${around} }) · shots.cupMake`;
        } else if (T < 18) {
          hB.group.visible = true;
          hA.setPose(P().cupGrip).graspCup(cup.group, { around: 1.45 });
          hB.setPose(P().cupGrip).graspCup(cup.group, { around: -1.45 });
          cam = { pos: [0, 1.7, 3.5], look: [0, 0.7, 0], fov: 34 };
          title = 'CUP GRIP · TWO HANDS'; sub = 'left hand = mirrored grip';
        } else {
          const u = T - 18;
          // open → cupReady while high (0–0.4); descend along the approach (0.15–0.85); close
          // (0.85–1.25) → contact at 1.25; lift & turn 1.35–2.0; set down 2.2–2.75; open (2.85–3.2)
          // *before* rising (3.2–3.75); back to open 3.6–4.0
          const shape = E.inOutSine(seg(u, 0, 0.4)) * (1 - E.inOutSine(seg(u, 3.6, 4.0)));
          const close = E.inOutCubic(seg(u, 0.85, 1.25)) * (1 - E.inOutCubic(seg(u, 2.85, 3.2)));
          hA.setPose(RB.hand.blend(RB.hand.blend(P().open, P().cupReady, shape), P().cupGrip, close));
          const lift = E.inOutCubic(seg(u, 1.35, 2.0)) * (1 - E.inOutCubic(seg(u, 2.2, 2.75)));
          cup.group.position.set(0, 0.22 * lift, 0);
          cup.group.rotation.set(0, 0.35 * lift, -0.1 * lift);
          const away = 0.8 * (1 - E.outCubic(seg(u, 0.15, 0.85))) + 0.8 * E.inCubic(seg(u, 3.2, 3.75));
          hA.graspCup(cup.group, { around, away });
          cam = RB.shots.cupMake;
          title = 'CUP GRIP · APPROACH / LIFT / RELEASE'; sub = `close ${close.toFixed(2)}  lift ${lift.toFixed(2)}  away ${away.toFixed(2)}`;
        }
        shadow.position.set(cup.group.position.x, 0.002, cup.group.position.z);
        shadow.material.opacity = 0.6 * (1 - Math.min(1, cup.group.position.y / 0.25) * 0.6);
      } else if (T < 27) {
        // ── palm up with ember → offer
        const u = T - 22;
        hA.setPose(P().palmUp).place({ palm: [0, 1, 0], forearm: [0.85, -0.5, 0.35], palmAt: [0, 0.3, 0] });
        // the group stays where palmUp put it; blending toward offer tips the palm to the fingertips
        const k = E.inOutSine(seg(u, 2.2, 3.2));
        hA.setPose(RB.hand.blend(P().palmUp, P().offer, k));
        const pp = hA.palmPoint(), pn = hA.palmNormal(), tips = hA.fingertips();
        const lip = tips[1].clone().add(tips[2]).multiplyScalar(0.5).addScaledVector(pn, 0.03);
        const roll = E.inQuad(seg(u, 2.9, 3.9));
        const ep = pp.clone().addScaledVector(pn, 0.018).lerp(lip, roll);
        ep.y -= 0.6 * Math.max(0, u - 3.9) ** 2; // … and off the fingertips
        // the ember's light: palm-side only, so nothing leaks through onto the module or the arm
        hA.setGlow({ at: ep.clone().addScaledVector(pn, 0.05), intensity: 2.2 * (1 - seg(u, 4.0, 4.4)), range: 2.2 });
        cam = { pos: [0.1, 1.05, 2.7], look: [0, 0.22, 0], fov: 30 };
        ember = ep;
        title = k < 0.5 ? 'PALM UP · EMBER CRADLE' : 'OFFER · POUR LEFT';
        sub = 'place() from palmUp, blend toward offer · setGlow() at the ember';
      } else if (T < 32) {
        // ── Renew study: reaching in from the upper right, palm up, the ember at the fingers
        const u = T - 27;
        const reach = E.outCubic(seg(u, 0, 1.6));
        const tipk = E.inOutSine(seg(u, 2.4, 3.6));
        hA.setPose(P().palmUp).place({ palm: [-0.12, 1, 0.2], forearm: [0.78, 0.5, -0.38], palmAt: [0.25 + 0.5 * (1 - reach), 0.08 + 0.3 * (1 - reach), 0] });
        hA.setPose(RB.hand.blend(P().palmUp, P().offer, 0.55 * tipk));
        const pp = hA.palmPoint(), pn = hA.palmNormal(), tips = hA.fingertips();
        // the ember rests in the cradle of the fingers, just off the pads
        const cradle = tips[1].clone().add(tips[2]).add(tips[3]).multiplyScalar(1 / 3).lerp(pp, 0.45).addScaledVector(pn, 0.045);
        const lift = E.inOutSine(seg(u, 3.4, 5));
        const ep = cradle.clone().add(new THREE.Vector3(-0.35 * lift, 0.12 * lift, 0.05 * lift));
        hA.setGlow({ at: ep.clone().addScaledVector(pn, 0.03), intensity: 1.8 * (1 - 0.5 * lift), range: 1.6 });
        const push = E.inOutSine(seg(u, 0, 5));
        // a three-quarter view from the front left (the human's side), a little above the palm:
        // the ember sits visibly in the cradle and the forearm recedes to the upper right,
        // foreshortened, so its taper and copper rings read
        cam = { pos: [lerp(-1.0, -0.75, push), lerp(0.62, 0.48, push), lerp(3.3, 2.8, push)], look: [0.1, 0.1, 0], fov: 30 };
        ember = ep; emberR = 12;
        title = 'RENEW STUDY · PALM UP → OFFER'; sub = '3/4 from the front left, a little above the palm · forearm to the upper right';
      } else if (T < 36) {
        // ── stress tests
        const u = T - 32;
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
      } else {
        // ── the whole arm in profile
        const u = (T - 36) / 3;
        hA.setPose(P().relaxed);
        hA.group.position.set(-1.1, 0, 0);
        hA.group.rotation.set(0, lerp(-0.5, 0.5, u), 1.35);
        cam = { pos: [0.1, 0.6, 5.2], look: [0.15, 0.05, 0], fov: 30 };
        title = 'THE ARM · PROFILE'; sub = `forearm Ø ${RB.hand.DIMS.forearmDiameter.join(' → ')} · palm ${RB.hand.DIMS.palmWidth}`;
      }

      RB.setCam(S.camera, cam);
      RB.draw3D(ctx, S.scene, S.camera);
      if (ember) {
        const [x, y] = RB.toScreen(S.camera, ember.x, ember.y, ember.z);
        RB.fx.ember(ctx, x, y, emberR, { intensity: 1 });
      }
      label(ctx, title, sub);
    },
  });
})();
