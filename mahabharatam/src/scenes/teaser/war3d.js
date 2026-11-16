/* THE WAR TEASER'S 3D LAYER (pipeline 96; loaded only by src/episodes.js entry 96, before teaser/scenes).
 *
 * A stylised, code-rendered 3D world drawn with Three.js 0.187.0 (node_modules, loaded by dynamic import at init) into its OWN
 * canvas, as a pure function of time, then laid into the 2D frame by the scenes (src/scenes/teaser/scenes.js), which draw the
 * series' Canvas2D figures over it. Nothing here is photoreal: mural colours, flat toon light, dark outlines, drawn sprites on 3D
 * cards for the massed ranks and the horses, real geometry for the chariots, wheels, arrows, flags, rings and tubes of light.
 *
 *   await W3D.load()                       once (scene init)
 *   W3D.render(T, o) → canvas              o = { cam: {pos, look, fov, roll}, sky, sun, haze, fog: [near, far], show: {...}, ... }
 *   W3D.project([x, y, z]) → [sx, sy, scale] screen position (1080×1920 space) of a world point under the LAST render's camera
 *
 * Determinism: every random number comes from a seeded hash (R.hash / mulberry32); every moving thing is computed from T alone
 * (instance matrices are rebuilt from T on every call), so any frame can be drawn in any order (the render's workers do that).
 * WebGL runs in software here (SwiftShader): no multisampling, no HalfFloat targets, one pass, small textures. Skill §9: rim terms
 * are clamped (the toon shader has none), no NaN-producing pow.
 */
(function () {
  'use strict';
  const R = window.REEL;
  const W3D = (window.W3D = { ready: null, size: [720, 1280] });
  let THREE, renderer, scene, camera, G = {};

  // ── seeded randomness ──
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const h1 = (i, k = 0) => { let x = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((k | 0) + 0x632be5ab, 0xc2b2ae35); x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; x = Math.imul(x, 0x297a2d39); x ^= x >>> 15; return (x >>> 0) / 4294967296; };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  // value noise for the ground
  const vnoise = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h1(xi * 7919 + yi, s), b = h1((xi + 1) * 7919 + yi, s), c = h1(xi * 7919 + yi + 1, s), d = h1((xi + 1) * 7919 + yi + 1, s); return lerp(lerp(a, b, u), lerp(c, d, u), v); };
  const fbm = (x, y) => vnoise(x, y, 1) * 0.55 + vnoise(x * 2.1, y * 2.1, 2) * 0.28 + vnoise(x * 4.3, y * 4.3, 3) * 0.17;
  const groundY = (x, z) => { const far = clamp((-z - 300) / 1400); return (fbm(x / 260, z / 260) - 0.5) * 14 + far * far * (fbm(x / 500 + 9, z / 500) * 160 - 20) * (Math.abs(x) > 200 || -z > 1200 ? 1 : 0.2); };
  W3D.groundY = groundY;

  // ── textures drawn with Canvas2D (the same hand as the figures) ──
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const ink = '#1a0e0a';
  // a foot soldier, seen from the side-front: 4 kinds × 2 sides. Cell 128×256.
  function soldierAtlas() {
    const c = cv(1024, 512), g = c.getContext('2d');
    const SIDES = [   // [cloth, sash, skin, metal]
      ['#3a1c5a', '#d8a020', '#8a5a36', '#9aa0b8'],   // the Kaurava host: night purple, gold
      ['#e8e0c8', '#2a7a3a', '#7a4a2a', '#c8b070'],   // the Pandava host: white, leaf green
    ];
    for (let side = 0; side < 2; side++) for (let k = 0; k < 4; k++) {
      const [cl, sa, sk, me] = SIDES[side], ox = (side * 4 + k) * 128, oy = 0;
      g.save(); g.translate(ox + 64, oy + 250); g.lineJoin = 'round'; g.lineCap = 'round';
      const stroke = (w) => { g.lineWidth = w; g.strokeStyle = ink; g.stroke(); };
      // spear or bow behind
      if (k === 0 || k === 3) { g.beginPath(); g.moveTo(26, -10); g.lineTo(34, -240); stroke(7); g.strokeStyle = '#6a4424'; g.lineWidth = 3.5; g.stroke(); g.fillStyle = me; g.beginPath(); g.moveTo(34, -252); g.lineTo(28, -226); g.lineTo(40, -226); g.closePath(); g.fill(); stroke(2); }
      if (k === 1) { g.beginPath(); g.moveTo(30, -200); g.quadraticCurveTo(-4, -130, 30, -60); stroke(7); g.strokeStyle = '#c89040'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#f0e8d0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(30, -200); g.lineTo(30, -60); g.stroke(); }
      // legs and dhoti
      g.fillStyle = sk; g.beginPath(); g.roundRect(-16, -70, 12, 68, 5); g.roundRect(4, -70, 12, 68, 5); g.fill(); stroke(3);
      g.fillStyle = cl; g.beginPath(); g.moveTo(-26, -122); g.lineTo(26, -122); g.lineTo(30, -58); g.lineTo(0, -48); g.lineTo(-30, -58); g.closePath(); g.fill(); stroke(3.5);
      // torso
      g.fillStyle = k === 2 ? me : sk; g.beginPath(); g.moveTo(-22, -176); g.quadraticCurveTo(0, -186, 22, -176); g.lineTo(18, -120); g.lineTo(-18, -120); g.closePath(); g.fill(); stroke(3.5);
      g.fillStyle = sa; g.beginPath(); g.moveTo(-22, -170); g.lineTo(22, -132); g.lineTo(18, -124); g.lineTo(-22, -160); g.closePath(); g.fill();
      // arms
      g.strokeStyle = ink; g.lineWidth = 12; g.beginPath(); g.moveTo(18, -170); g.lineTo(30, -120); g.lineTo(28, -100); g.stroke(); g.strokeStyle = sk; g.lineWidth = 7; g.stroke();
      // shield (round, the period's), on the near arm
      if (k !== 1) { g.fillStyle = side ? '#a8743a' : '#5a2a1a'; g.beginPath(); g.arc(-22, -140, 30, 0, Math.PI * 2); g.fill(); stroke(3.5); g.strokeStyle = me; g.lineWidth = 3; g.beginPath(); g.arc(-22, -140, 20, 0, Math.PI * 2); g.stroke(); g.fillStyle = me; g.beginPath(); g.arc(-22, -140, 6, 0, Math.PI * 2); g.fill(); }
      // head: a turban or a helmet with a crest
      g.fillStyle = sk; g.beginPath(); g.arc(0, -196, 16, 0, Math.PI * 2); g.fill(); stroke(3);
      g.fillStyle = k === 3 ? me : (side ? '#f4ecd8' : '#5a2a7a'); g.beginPath(); g.ellipse(0, -208, 19, 12, 0, Math.PI, Math.PI * 2); g.lineTo(19, -204); g.lineTo(-19, -204); g.fill(); stroke(3);
      if (k === 3) { g.fillStyle = sa; g.beginPath(); g.moveTo(0, -222); g.quadraticCurveTo(18, -240, 10, -214); g.fill(); }
      g.restore();
    }
    // row 2: banner-bearers' flags are separate; row 2 of the atlas is a horse-and-rider far card (two sides)
    for (let side = 0; side < 2; side++) { const ox = side * 256, oy = 256; g.save(); g.translate(ox + 128, oy + 250); g.lineJoin = 'round';
      g.fillStyle = side ? '#d8d0c0' : '#4a3020'; g.beginPath(); g.ellipse(0, -110, 70, 34, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.strokeStyle = ink; g.stroke();
      g.beginPath(); g.moveTo(56, -126); g.lineTo(96, -176); g.lineTo(110, -164); g.lineTo(76, -104); g.closePath(); g.fill(); g.stroke();
      for (const lx of [-50, -30, 34, 54]) { g.beginPath(); g.moveTo(lx, -90); g.lineTo(lx + 4, -4); g.lineWidth = 9; g.strokeStyle = ink; g.stroke(); }
      g.fillStyle = side ? '#e8e0c8' : '#3a1c5a'; g.beginPath(); g.roundRect(-16, -200, 30, 70, 8); g.fill(); g.lineWidth = 3; g.strokeStyle = ink; g.stroke();
      g.fillStyle = '#8a5a36'; g.beginPath(); g.arc(0, -214, 14, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); }
    return c;
  }
  // a horse at the gallop, white (6.23.14 śvetair hayair yukte), 8 frames of 256×192, facing +x
  function horseAtlas() {
    const c = cv(2048, 192), g = c.getContext('2d');
    for (let f = 0; f < 8; f++) {
      const ph = (f / 8) * Math.PI * 2; g.save(); g.translate(f * 256 + 128, 150); g.lineJoin = 'round'; g.lineCap = 'round';
      const bob = 6 * Math.sin(ph * 2);
      const leg = (x, y, a1, a2, near) => { const l1 = 38, l2 = 40; const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1, fx = kx + Math.sin(a1 + a2) * l2, fy = ky + Math.cos(a1 + a2) * l2;
        g.strokeStyle = ink; g.lineWidth = near ? 17 : 15; g.beginPath(); g.moveTo(x, y); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke(); g.strokeStyle = near ? '#f4f0e6' : '#cfc8bc'; g.lineWidth = near ? 10 : 8; g.stroke(); g.fillStyle = ink; g.beginPath(); g.ellipse(fx, fy + 2, 8, 5, 0, 0, Math.PI * 2); g.fill(); };
      // far legs, then body, then near legs
      leg(-46, -58 + bob, 0.7 * Math.sin(ph + 0.6), 0.6 + 0.5 * Math.cos(ph + 0.6), false); leg(44, -60 + bob, 0.8 * Math.sin(ph + 2.4), -0.7 - 0.5 * Math.cos(ph + 2.4), false);
      g.fillStyle = '#f4f0e6'; g.strokeStyle = ink; g.lineWidth = 5;
      g.beginPath(); g.ellipse(0, -78 + bob, 70, 30, -0.05, 0, Math.PI * 2); g.fill(); g.stroke();
      // neck and head, reaching
      const nk = 0.12 * Math.sin(ph * 2);
      g.beginPath(); g.moveTo(44, -96 + bob); g.quadraticCurveTo(78, -140 + bob, 96 + 4 * nk, -150 + bob); g.lineTo(130, -122 + bob + 8 * nk); g.quadraticCurveTo(122, -110 + bob, 106, -118 + bob); g.quadraticCurveTo(90, -100 + bob, 66, -66 + bob); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = ink; g.beginPath(); g.arc(108, -138 + bob, 3.5, 0, Math.PI * 2); g.fill();
      // mane and tail, gold-tinted, streaming
      g.strokeStyle = '#c8a050'; g.lineWidth = 7; g.beginPath(); g.moveTo(50, -104 + bob); g.quadraticCurveTo(70, -150 + bob, 92, -152 + bob); g.stroke();
      g.strokeStyle = '#d8c8a0'; g.lineWidth = 9; g.beginPath(); g.moveTo(-68, -88 + bob); g.quadraticCurveTo(-104, -96 + bob + 8 * Math.sin(ph), -126, -72 + bob + 10 * Math.sin(ph + 1)); g.stroke();
      // harness: a red breast-band and a gold plume
      g.strokeStyle = '#a8241a'; g.lineWidth = 7; g.beginPath(); g.moveTo(40, -104 + bob); g.lineTo(60, -54 + bob); g.stroke(); g.strokeStyle = '#e7b54a'; g.lineWidth = 4; g.beginPath(); g.moveTo(-10, -106 + bob); g.lineTo(-10, -52 + bob); g.stroke();
      g.fillStyle = '#e8401c'; g.beginPath(); g.ellipse(94, -168 + bob, 6, 14, 0.3, 0, Math.PI * 2); g.fill();
      leg(-40, -60 + bob, 0.7 * Math.sin(ph), 0.6 + 0.5 * Math.cos(ph), true); leg(50, -62 + bob, 0.8 * Math.sin(ph + 1.8), -0.7 - 0.5 * Math.cos(ph + 1.8), true);
      g.restore();
    }
    return c;
  }
  const softDot = (inner, outer, a = 1) => { const c = cv(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, inner); gr.addColorStop(0.45, inner.replace(/[\d.]+\)$/, `${0.5 * a})`)); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; };
  // the monkey banner (6.23.20 kapidhvajaḥ): a gold cloth with a dark monkey figure; and plain banners in the hosts' colours
  function bannerTex(kind) { const c = cv(128, 96), g = c.getContext('2d');
    const col = { monkey: ['#f0c020', '#8a1a10'], kaurava: ['#4a1a78', '#e7b54a'], pandava: ['#f0ece0', '#2a7a3a'], silver: ['#c8d0e0', '#5a6478'], red: ['#b8341c', '#f0c020'] }[kind];
    if (kind !== 'monkey') {   // a long tapering pennant (patākā) with a swallow-tail, a border and two bands: no disc, no emblem we cannot cite
      g.beginPath(); g.moveTo(0, 4); g.lineTo(128, 30); g.lineTo(104, 48); g.lineTo(128, 66); g.lineTo(0, 92); g.closePath(); g.fillStyle = col[0]; g.fill();
      g.lineWidth = 6; g.strokeStyle = col[1]; g.stroke(); g.fillStyle = col[1]; g.fillRect(22, 10, 8, 76); g.fillRect(44, 15, 5, 66); return c; }
    g.fillStyle = col[0]; g.fillRect(0, 0, 128, 96); g.fillStyle = col[1]; g.fillRect(0, 0, 128, 8); g.fillRect(0, 88, 128, 8);
    if (kind === 'monkey') { g.fillStyle = '#5a2010'; g.beginPath(); g.arc(70, 34, 13, 0, 7); g.fill(); g.beginPath(); g.ellipse(64, 60, 16, 20, -0.3, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#5a2010'; g.lineCap = 'round'; g.beginPath(); g.moveTo(52, 70); g.quadraticCurveTo(30, 80, 34, 52); g.stroke(); g.beginPath(); g.moveTo(74, 52); g.lineTo(92, 30); g.stroke(); g.fillStyle = '#f0d890'; g.beginPath(); g.arc(74, 34, 5, 0, 7); g.fill(); }
    else { g.fillStyle = col[1]; g.beginPath(); g.arc(64, 48, 18, 0, 7); g.fill(); }
    return c; }
  // distant hills, drawn: a flat band of ridges for the horizon
  function hillsTex() { const c = cv(2048, 256), g = c.getContext('2d'); const rnd = mulberry(77);
    for (const [y0, col, amp] of [[150, 'rgba(90,70,90,1)', 70], [190, 'rgba(70,52,70,1)', 46]]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, 256); let y = y0; for (let x = 0; x <= 2048; x += 32) { y = clamp(y + (rnd() - 0.5) * amp * 0.6, y0 - amp, y0 + amp * 0.3); g.lineTo(x, y); } g.lineTo(2048, 256); g.fill(); }
    return c; }

  // ── materials ──
  const toonGrad = () => { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 235, 235, 235, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
  const outlineMat = (w) => { const m = new THREE.MeshBasicMaterial({ color: 0x1a0e0a, side: THREE.BackSide, fog: true });
    m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${w.toFixed(3)};`); }; return m; };
  // haze/fog uniforms shared by the custom shaders
  const U = { uTime: { value: 0 }, uHaze: { value: null }, uFogNear: { value: 200 }, uFogFar: { value: 2600 }, uSunDir: { value: null }, uSunCol: { value: null }, uLight: { value: 1 } };
  const FOG_GLSL = `uniform vec3 uHaze; uniform float uFogNear; uniform float uFogFar; float fogK(float d){ return clamp((d - uFogNear) / max(1.0, uFogFar - uFogNear), 0.0, 1.0); }`;

  function cardsMaterial(tex, cols, rows) {
    return new THREE.ShaderMaterial({
      uniforms: { ...U, uTex: { value: tex }, uCells: { value: new THREE.Vector2(cols, rows) } }, transparent: false, side: THREE.DoubleSide,
      vertexShader: `attribute vec4 aInfo; attribute vec3 aTint; uniform float uTime; uniform vec2 uCells; varying vec2 vUv; varying float vD; varying vec3 vTint; varying float vShade;
        void main(){ vec4 c = instanceMatrix * vec4(0.0,0.0,0.0,1.0); float sx = length(instanceMatrix[0].xyz), sy = length(instanceMatrix[1].xyz);
          vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); camR = normalize(vec3(camR.x, 0.0, camR.z));
          float bob = sin(uTime * (3.0 + aInfo.z) + aInfo.w * 6.283) * 0.02 * aInfo.y;   // a march: the card bobs
          vec3 p = c.xyz + camR * position.x * sx * aInfo.x + vec3(0.0, (position.y + 0.5) * sy + bob * sy, 0.0);
          vec4 mv = viewMatrix * vec4(p, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv;
          float cell = aInfo.z; float cx = mod(cell, uCells.x), cy = floor(cell / uCells.x); vUv = vec2((cx + uv.x) / uCells.x, 1.0 - (cy + 1.0 - uv.y) / uCells.y);
          vTint = aTint; vShade = 0.8 + 0.2 * fract(aInfo.w * 7.0); }`,
      fragmentShader: `${FOG_GLSL} uniform sampler2D uTex; uniform float uLight; varying vec2 vUv; varying float vD; varying vec3 vTint; varying float vShade;
        void main(){ vec4 t = texture2D(uTex, vUv); if (t.a < 0.5) discard; vec3 col = t.rgb * vTint * vShade * uLight; col = mix(col, uHaze, fogK(vD)); gl_FragColor = vec4(col, 1.0); }`,
    });
  }

  // ── the world, built once ──
  function build() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 9 / 16, 1, 9000);
    U.uHaze.value = new THREE.Color(0.62, 0.52, 0.46); U.uSunDir.value = new THREE.Vector3(0, 0.1, -1).normalize(); U.uSunCol.value = new THREE.Color(1, 0.6, 0.35);
    scene.fog = new THREE.Fog(0x9e8476, 200, 2600);
    const grad = toonGrad();
    G.hemi = new THREE.HemisphereLight(0xc8b8d8, 0x5a3a28, 0.9); scene.add(G.hemi);
    G.sunL = new THREE.DirectionalLight(0xffd0a0, 1.6); G.sunL.position.set(-300, 400, -800); scene.add(G.sunL);
    G.toon = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });

    // SKY: a big sphere, a gradient with the sun's disc and its glow
    G.sky = new THREE.Mesh(new THREE.SphereGeometry(8000, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uLow: { value: new THREE.Color() }, uSunDir: U.uSunDir, uSunCol: U.uSunCol, uSunSize: { value: 0.03 }, uGlow: { value: 1 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 uTop, uHor, uLow, uSunCol; uniform vec3 uSunDir; uniform float uSunSize, uGlow; varying vec3 vDir;
        void main(){ float y = vDir.y; vec3 c = y > 0.0 ? mix(uHor, uTop, pow(clamp(y * 2.2, 0.0, 1.0), 0.7)) : mix(uHor, uLow, clamp(-y * 6.0, 0.0, 1.0));
          float d = clamp(dot(normalize(vDir), normalize(uSunDir)), -1.0, 1.0); float disc = smoothstep(1.0 - uSunSize, 1.0 - uSunSize * 0.85, d);
          float glow = clamp(pow(clamp(d, 0.0, 1.0), 90.0), 0.0, 1.0) * 0.75 + clamp(pow(clamp(d, 0.0, 1.0), 8.0), 0.0, 1.0) * 0.25;
          c = mix(c, uSunCol, clamp(glow * uGlow, 0.0, 1.0)); c = mix(c, vec3(1.0, 0.94, 0.8), disc); gl_FragColor = vec4(c, 1.0); }` }));
    G.sky.renderOrder = -10; scene.add(G.sky);

    // HILLS on the horizon (a drawn band on a cylinder)
    { const t = new THREE.CanvasTexture(hillsTex()); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); t.colorSpace = THREE.SRGBColorSpace;
      G.hills = new THREE.Mesh(new THREE.CylinderGeometry(4200, 4200, 700, 64, 1, true), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.BackSide, fog: true, depthWrite: false }));
      G.hills.position.y = 120; scene.add(G.hills); }

    // GROUND: the plain of Kurukshetra, low swells, ochre dust and darker trampled earth (vertex colours, toon light)
    { const geo = new THREE.PlaneGeometry(9000, 9000, 220, 220); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
      const c0 = new THREE.Color('#b08a5a'), c1 = new THREE.Color('#7a5a3c'), c2 = new THREE.Color('#9a8a5a');
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, groundY(x, z)); const n = fbm(x / 90 + 3, z / 90), m = fbm(x / 400, z / 400 + 5);
        const c = c0.clone().lerp(c1, clamp(n * 1.4 - 0.3)).lerp(c2, clamp(m - 0.45) * 0.8); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
      G.ground = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); scene.add(G.ground); }

    // THE HOSTS: drawn soldier cards, instanced. Kaurava host on the far side (z < -260), Pandava host near (z > 260); an open field between.
    { const tex = new THREE.CanvasTexture(soldierAtlas()); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 1;
      const mat = cardsMaterial(tex, 8, 2); G.cardMat = mat;
      const N = 15000, geo = new THREE.PlaneGeometry(1, 1), mesh = new THREE.InstancedMesh(geo, mat, N);
      const info = new Float32Array(N * 4), tint = new Float32Array(N * 3), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(); let n = 0;
      G.hostSlots = [];
      for (const side of [0, 1]) for (let i = 0; i < N / 2; i++) {
        const rnd = (k) => h1(i * 2 + side, k), row = Math.floor(i / 300), col = i % 300;
        const x = (col - 150) * 12.5 + (rnd(1) - 0.5) * 7, depth = 300 + row * 17 + rnd(2) * 8;   // ranks across the plain
        const z = side === 0 ? -depth - 60 : depth, horse = false;
        const y = groundY(x, z), s = horse ? 60 : 42 + rnd(4) * 6;
        p.set(x, y, z); sc.set(s * (horse ? 1.1 : 0.5), s, 1); m4.compose(p, q, sc); mesh.setMatrixAt(n, m4);
        const facing = side === 0 ? 1 : -1;   // hosts face each other: mirrored cards
        info[n * 4] = facing; info[n * 4 + 1] = 1; info[n * 4 + 2] = horse ? 8 + side : side * 4 + Math.floor(rnd(5) * 4); info[n * 4 + 3] = rnd(6);
        const sh = 0.85 + 0.3 * rnd(7); tint[n * 3] = sh; tint[n * 3 + 1] = sh; tint[n * 3 + 2] = sh;
        G.hostSlots.push([x, z, side]); n++; }
      geo.setAttribute('aInfo', new THREE.InstancedBufferAttribute(info, 4)); geo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 3));
      // horses use the two-wide cells of row 2: map them as cells 8,9 → atlas columns (0..1 of 4 wide); a second material for simplicity
      mesh.frustumCulled = false; G.hosts = mesh; scene.add(mesh); }

    // BANNERS over the hosts: poles and cloth that ripples (vertex shader), in each host's colours
    { const N = 260, pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.6, 1, 5), G.toon('#3a2414'), N);
      const cloth = new THREE.PlaneGeometry(1.6, 0.6, 12, 4); cloth.translate(0.8, 0, 0);
      const mk = (kind) => { const t = new THREE.CanvasTexture(bannerTex(kind)); t.colorSpace = THREE.SRGBColorSpace; return new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { ...U, uMap: { value: t } },
        vertexShader: `uniform float uTime; varying vec2 vUv; varying float vD; varying float vSh; void main(){ vUv = uv; vec3 p = position; float ph = instanceMatrix[3][0] * 0.05 + instanceMatrix[3][2] * 0.031;
          float w = sin(p.x * 5.0 - uTime * 7.0 + ph) * 0.12 * p.x + sin(p.x * 9.0 - uTime * 11.0 + ph * 2.0) * 0.04 * p.x; p.z += w; p.y += 0.05 * sin(p.x * 3.0 - uTime * 5.0 + ph) * p.x; vSh = 0.75 + 2.0 * w;
          vec4 mv = viewMatrix * instanceMatrix * vec4(p, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `${FOG_GLSL} uniform sampler2D uMap; uniform float uLight; varying vec2 vUv; varying float vD; varying float vSh; void main(){ vec4 tx = texture2D(uMap, vUv); if (tx.a < 0.5) discard; vec3 c = tx.rgb * clamp(vSh, 0.55, 1.15) * uLight; gl_FragColor = vec4(mix(c, uHaze, fogK(vD)), 1.0); }` }); };
      const fK = new THREE.InstancedMesh(cloth, mk('kaurava'), N / 2), fP = new THREE.InstancedMesh(cloth, mk('pandava'), N / 2);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
      let a = 0, b = 0;
      for (let i = 0; i < N; i++) { const side = i % 2, x = (h1(i, 11) - 0.5) * 3600, depth = side === 0 ? 320 + h1(i, 12) * 380 : 310 + h1(i, 12) * 110, z = side === 0 ? -depth - 60 : depth, y = groundY(x, z), H = 120 + 50 * h1(i, 13);
        p.set(x, y + H / 2, z); s.set(1.6, H, 1.6); m4.compose(p, q, s); pole.setMatrixAt(i, m4);
        p.set(x, y + H - 16, z); s.set(40, 40, 40); m4.compose(p, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), side === 0 ? 0.2 : Math.PI - 0.2), s);
        (side === 0 ? fK : fP).setMatrixAt(side === 0 ? a++ : b++, m4); }
      for (const m of [pole, fK, fP]) { m.frustumCulled = false; scene.add(m); }
      G.banners = [pole, fK, fP]; }

    // CHARIOTS: real geometry (the box, the rail, the pole, two eight-spoked wheels that turn, a flag-staff with a banner), outlined; horses as drawn cards with a gallop
    G.horseTex = new THREE.CanvasTexture(horseAtlas()); G.horseTex.colorSpace = THREE.SRGBColorSpace;
    G.makeChariot = (o = {}) => {
      const grp = new THREE.Group(), body = G.toon(o.body || '#6a3418'), trim = G.toon(o.trim || '#e7b54a'), dark = G.toon('#2a1408');
      const add = (geo, mat, x, y, z, ol = 0.6) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); grp.add(m); if (ol) { const e = new THREE.Mesh(geo, outlineMat(ol)); e.position.copy(m.position); e.rotation.copy(m.rotation); grp.add(e); m.userData.ol = e; } return m; };
      add(new THREE.BoxGeometry(26, 12, 22), body, 0, 26, 0);   // the box
      add(new THREE.BoxGeometry(27, 2, 23), trim, 0, 32.5, 0, 0);
      const rail = add(new THREE.TorusGeometry(11, 1.2, 6, 16, Math.PI), trim, 3, 32, 0, 0.4); rail.rotation.y = Math.PI / 2;
      const front = add(new THREE.BoxGeometry(3, 18, 22), body, 13, 38, 0); void front;
      const pole = add(new THREE.CylinderGeometry(1, 1, 70, 6), dark, 46, 22, 0, 0.4); pole.rotation.z = Math.PI / 2 - 0.12;
      const axle = add(new THREE.CylinderGeometry(1.2, 1.2, 34, 6), dark, 0, 20, 0, 0); axle.rotation.x = Math.PI / 2;
      const wheels = [];
      for (const sz of [-15, 15]) { const w = new THREE.Group(); w.position.set(0, 20, sz);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(19, 2.2, 6, 24), trim), rimO = new THREE.Mesh(rim.geometry, outlineMat(0.6)); w.add(rim, rimO);
        const tyre = new THREE.Mesh(new THREE.TorusGeometry(20.4, 1.4, 5, 24), dark); w.add(tyre);
        for (let k = 0; k < 8; k++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 36, 5), dark); sp.rotation.z = (k / 8) * Math.PI; w.add(sp); }
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 5, 10), trim); hub.rotation.x = Math.PI / 2; w.add(hub);
        grp.add(w); wheels.push(w); }
      // the flag-staff at the back and its banner
      const staff = add(new THREE.CylinderGeometry(0.8, 0.8, 120, 5), dark, -12, 90, 0, 0.3); void staff;
      const ft = new THREE.CanvasTexture(bannerTex(o.flag || 'monkey')); ft.colorSpace = THREE.SRGBColorSpace;
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(36, 26, 10, 4), new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { ...U, uMap: { value: ft }, uPh: { value: h1(o.seed || 1, 3) * 6 } },
        vertexShader: `uniform float uTime, uPh; varying vec2 vUv; varying float vD; varying float vSh; void main(){ vUv = uv; vec3 p = position; float u = (p.x + 18.0) / 36.0; float w = sin(u * 6.0 - uTime * 9.0 + uPh) * 3.5 * u; p.z += w; vSh = 0.8 + 0.06 * w; vec4 mv = modelViewMatrix * vec4(p, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `${FOG_GLSL} uniform sampler2D uMap; uniform float uLight; varying vec2 vUv; varying float vD; varying float vSh; void main(){ vec3 c = texture2D(uMap, vUv).rgb * clamp(vSh, 0.5, 1.2) * uLight; gl_FragColor = vec4(mix(c, uHaze, fogK(vD)), 1.0); }` }));
      fl.position.set(6, 132, 0); grp.add(fl);
      // the horses: four drawn cards side by side ahead of the box (they turn to face the camera along their own axis only)
      const horses = [];
      const hm = new THREE.ShaderMaterial({ transparent: false, side: THREE.DoubleSide, uniforms: { ...U, uMap: { value: G.horseTex }, uFrame: { value: 0 } },
        vertexShader: 'uniform float uFrame; varying vec2 vUv; varying float vD; void main(){ vUv = vec2((uFrame + uv.x) / 8.0, uv.y); vec4 mv = modelViewMatrix * vec4(position, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: `${FOG_GLSL} uniform sampler2D uMap; uniform float uLight; varying vec2 vUv; varying float vD; void main(){ vec4 t = texture2D(uMap, vUv); if (t.a < 0.5) discard; gl_FragColor = vec4(mix(t.rgb * uLight, uHaze, fogK(vD)), 1.0); }` });
      for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(64, 48), hm.clone()); m.position.set(62 + (k % 2) * 3, 26, -16 + k * 10.5); grp.add(m); horses.push(m); }
      grp.userData = { wheels, horses, flag: fl, seed: o.seed || 1 };
      return grp; };
    G.chariots = [];
    for (let i = 0; i < 9; i++) { const c = G.makeChariot({ seed: i + 2, flag: i === 0 ? 'monkey' : ['kaurava', 'silver', 'red', 'kaurava'][i % 4], body: i === 0 ? '#7a2c14' : undefined, trim: i === 0 ? '#e7b54a' : undefined }); c.visible = false; scene.add(c); G.chariots.push(c); }

    // ARROWS: instanced shafts with a head and fletching, and a streak of light behind each (additive)
    { const shaft = new THREE.CylinderGeometry(0.25, 0.25, 14, 4); shaft.rotateZ(Math.PI / 2);
      const head = new THREE.ConeGeometry(0.8, 2.6, 4); head.rotateZ(-Math.PI / 2); head.translate(8, 0, 0);
      const merged = mergeGeos([shaft, head]);
      G.arrowN = 900; G.arrows = new THREE.InstancedMesh(merged, new THREE.MeshBasicMaterial({ color: 0x24140c, fog: true }), G.arrowN); G.arrows.frustumCulled = false; scene.add(G.arrows);
      const trail = new THREE.PlaneGeometry(1, 1); trail.translate(-0.5, 0, 0);
      G.trails = new THREE.InstancedMesh(trail, new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), G.arrowN);
      G.trails.frustumCulled = false; scene.add(G.trails); }

    // DUST and SMOKE: soft cards, normal blending; EMBERS and FIRE: additive
    { const dustT = new THREE.CanvasTexture(softDot('rgba(214,180,140,0.9)', 'rgba(214,180,140,0)'));
      G.dustN = 520; G.dust = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: dustT, transparent: true, opacity: 0.32, depthWrite: false, fog: false }), G.dustN); G.dust.frustumCulled = false; scene.add(G.dust);
      const emT = new THREE.CanvasTexture(softDot('rgba(255,200,110,1)', 'rgba(255,90,20,0)'));
      G.emN = 400; G.embers = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: emT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), G.emN); G.embers.frustumCulled = false; scene.add(G.embers); }

    // SHOCKWAVES (the conches, the form's light): a flat ring on the ground and a glowing wall rising from it, additive
    { const ringMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uK: { value: 0 }, uCol: { value: new THREE.Color(1, 0.85, 0.55) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uK; uniform vec3 uCol; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 2.0; float band = exp(-pow((r - 0.96) * 18.0, 2.0)) + 0.25 * exp(-pow((r - 0.9) * 6.0, 2.0)); gl_FragColor = vec4(uCol * band * (1.0 - uK), 1.0); }' });
      const wallMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uK: { value: 0 }, uCol: { value: new THREE.Color(1, 0.8, 0.5) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uK; uniform vec3 uCol; varying vec2 vUv; void main(){ float a = pow(clamp(1.0 - vUv.y, 0.0, 1.0), 2.5) * (1.0 - uK) * 0.6; gl_FragColor = vec4(uCol * a, 1.0); }' });
      G.rings = []; for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ringMat.clone()); r.rotation.x = -Math.PI / 2; const w = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64, 1, true), wallMat.clone()); r.visible = w.visible = false; scene.add(r, w); G.rings.push([r, w]); } }

    // DIVINE LIGHT (6.33.12, 17): a white core, tubes of light rising and curling from it, streams of motes drawn into it (26–29), rays
    { G.divine = new THREE.Group(); scene.add(G.divine); G.divine.visible = false;
      const core = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 1 } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); float a = clamp(pow(f, 1.5), 0.0, 1.0); gl_FragColor = vec4(mix(vec3(1.0,0.55,0.15), vec3(1.0,0.98,0.9), a) * a * uK, 1.0); }' }));
      G.divine.add(core); G.core = core;
      const tubeMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uTime: U.uTime, uK: { value: 1 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uTime, uK; varying vec2 vUv; void main(){ float flow = 0.5 + 0.5 * sin(vUv.x * 40.0 - uTime * 6.0); float edge = 1.0 - abs(vUv.y - 0.5) * 2.0; float a = clamp(edge, 0.0, 1.0) * (0.35 + 0.65 * flow) * clamp(vUv.x * 3.0, 0.0, 1.0) * (1.0 - vUv.x) * uK; gl_FragColor = vec4(vec3(1.0, 0.78, 0.4) * a, 1.0); }' });
      G.tubes = [];
      for (let i = 0; i < 18; i++) { const rnd = mulberry(300 + i), a0 = rnd() * Math.PI * 2, pts = [];
        for (let k = 0; k <= 12; k++) { const u = k / 12, r = 20 + u * (500 + rnd() * 500), a = a0 + u * (1.5 + rnd() * 2) * (i % 2 ? 1 : -1); pts.push(new THREE.Vector3(Math.cos(a) * r, u * (300 + rnd() * 900) - 60 * u * u, Math.sin(a) * r * 0.5)); }
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 3 + rnd() * 5, 6, false), tubeMat); G.divine.add(tube); G.tubes.push(tube); }
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      G.rays = new THREE.Group(); for (let i = 0; i < 24; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(4000, 60 + 100 * h1(i, 40)), rayMat); r.position.x = 2000; const piv = new THREE.Group(); piv.rotation.z = (i / 24) * Math.PI * 2; piv.add(r); G.rays.add(piv); } G.divine.add(G.rays);
      // the streams: motes rising from both hosts into the light, like moths into a flame (6.33.29)
      const moteT = new THREE.CanvasTexture(softDot('rgba(255,236,190,1)', 'rgba(255,160,60,0)'));
      G.moteN = 1400; G.motes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: moteT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), G.moteN); G.motes.frustumCulled = false; scene.add(G.motes); }
  }
  function mergeGeos(geos) { const pos = [], idx = []; let off = 0; for (const g of geos) { const gg = g.index ? g : g; const p = gg.attributes.position; for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i)); const ix = gg.index.array; for (let i = 0; i < ix.length; i++) idx.push(ix[i] + off); off += p.count; }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setIndex(idx); out.computeVertexNormals(); return out; }

  W3D.load = function () {
    if (!W3D.ready) W3D.ready = (async () => {
      THREE = await import('/node_modules/three/build/three.module.js');
      W3D.THREE = THREE;
      const c = cv(W3D.size[0], W3D.size[1]);
      renderer = new THREE.WebGLRenderer({ canvas: c, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(1); renderer.setSize(W3D.size[0], W3D.size[1], false);
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
      build();
      W3D.canvas = c;
    })();
    return W3D.ready;
  };

  // ── per-frame state: everything from T ──
  const _m = () => new THREE.Matrix4(), _v = () => new THREE.Vector3(), _q = () => new THREE.Quaternion();
  let M4, P, S, Q, UP, ZERO;
  function zeroAll(mesh, n) { for (let i = 0; i < n; i++) mesh.setMatrixAt(i, ZERO); mesh.instanceMatrix.needsUpdate = true; mesh.count = n; }

  // arrows: o.volleys = [{ t0, from: [x,y,z], to: [x,y,z], n, spread, height, dur, seed }]
  function placeArrows(T, volleys, cam) {
    let k = 0; const camPos = cam.position, tmpD = _v();
    for (const v of volleys || []) for (let i = 0; i < v.n && k < G.arrowN; i++) {
      const r = (q) => h1(i + 1000 * (v.seed || 1), q), t0 = v.t0 + r(1) * (v.stagger ?? 0.5), dur = v.dur * (0.9 + 0.2 * r(2)), u = (T - t0) / dur;
      if (u < 0 || u > 1.05) continue;
      const a = [v.from[0] + (r(3) - 0.5) * v.spread, v.from[1], v.from[2] + (r(4) - 0.5) * v.spread * 0.4], b = [v.to[0] + (r(5) - 0.5) * v.spread * 1.2, v.to[1], v.to[2] + (r(6) - 0.5) * v.spread * 0.5];
      const H = v.height * (0.8 + 0.4 * r(7)), pos = (w) => [lerp(a[0], b[0], w), lerp(a[1], b[1], w) + 4 * H * w * (1 - w), lerp(a[2], b[2], w)];
      const uu = Math.min(u, 1), p = pos(uu), p2 = pos(Math.min(1, uu + 0.01)), pb = pos(Math.max(0, uu - Math.min(uu, 0.09)));
      P.set(p[0], p[1], p[2]); const dir = tmpD.set(p2[0] - p[0], p2[1] - p[1], p2[2] - p[2]).normalize();
      Q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir); S.set(v.size || 1.6, v.size || 1.6, v.size || 1.6); M4.compose(P, Q, S); G.arrows.setMatrixAt(k, M4);
      // the streak: from pb to p, facing the camera around its own axis
      const len = Math.hypot(p[0] - pb[0], p[1] - pb[1], p[2] - pb[2]) + 0.001; const ax = tmpD.set(p[0] - pb[0], p[1] - pb[1], p[2] - pb[2]).normalize();
      const toCam = new THREE.Vector3(camPos.x - p[0], camPos.y - p[1], camPos.z - p[2]).normalize(); const side = new THREE.Vector3().crossVectors(ax, toCam).normalize(); const nrm = new THREE.Vector3().crossVectors(side, ax);
      const basis = new THREE.Matrix4().makeBasis(ax, side, nrm); Q.setFromRotationMatrix(basis); S.set(len, (v.trailW || 1.2) * (1 - 0.4 * uu), 1); M4.compose(P, Q, S); G.trails.setMatrixAt(k, M4);
      k++;
    }
    for (let i = k; i < G.arrowN; i++) { G.arrows.setMatrixAt(i, ZERO); G.trails.setMatrixAt(i, ZERO); }
    G.arrows.instanceMatrix.needsUpdate = G.trails.instanceMatrix.needsUpdate = true;
    G.trails.material.opacity = 0.55 * (cam.userData.trail ?? 1);
    return k;
  }

  // soft particles facing the camera: o = { n, box: [x0,x1,y0,y1,z0,z1], size, drift: [vx,vy,vz], seed }
  function placeSprites(mesh, N, T, o, cam) {
    let k = 0; if (o) { const [x0, x1, y0, y1, z0, z1] = o.box; const wrap = (v, a, b) => a + ((((v - a) % (b - a)) + (b - a)) % (b - a));
      for (let i = 0; i < Math.min(N, o.n); i++) { const r = (q) => h1(i + 77 * (o.seed || 1), q), d = o.drift || [0, 0, 0];
        const x = wrap(lerp(x0, x1, r(1)) + d[0] * T * (0.6 + 0.8 * r(4)) + 20 * Math.sin(T * 0.3 + r(7) * 6), x0, x1), y = wrap(lerp(y0, y1, r(2)) + d[1] * T * (0.6 + 0.8 * r(5)), y0, y1), z = wrap(lerp(z0, z1, r(3)) + d[2] * T * (0.6 + 0.8 * r(6)), z0, z1);
        const s = o.size * (0.5 + r(8)) * (o.flicker ? 0.6 + 0.4 * Math.sin(T * 9 + r(9) * 20) : 1);
        P.set(x, y, z); Q.copy(cam.quaternion); if (o.spin) Q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), r(10) * 6 + T * 0.2 * (r(11) - 0.5))); S.set(s, s, s); M4.compose(P, Q, S); mesh.setMatrixAt(k++, M4); } }
    for (let i = k; i < N; i++) mesh.setMatrixAt(i, ZERO); mesh.instanceMatrix.needsUpdate = true; return k;
  }

  let lastCam = null;
  W3D.render = function (T, o = {}) {
    if (!M4) { M4 = _m(); P = _v(); S = _v(); Q = _q(); UP = new THREE.Vector3(0, 1, 0); ZERO = new THREE.Matrix4().makeScale(0, 0, 0); }
    U.uTime.value = T;
    // light and air
    const sky = o.sky || ['#3a3060', '#e89a6a', '#7a5a4a'];
    G.sky.material.uniforms.uTop.value.set(sky[0]); G.sky.material.uniforms.uHor.value.set(sky[1]); G.sky.material.uniforms.uLow.value.set(sky[2]);
    const sun = o.sun || { dir: [0.0, 0.06, -1], col: '#ffb070', size: 0.0012, glow: 1 };
    U.uSunDir.value.set(...sun.dir).normalize(); U.uSunCol.value.set(sun.col); G.sky.material.uniforms.uSunSize.value = sun.size ?? 0.0012; G.sky.material.uniforms.uGlow.value = sun.glow ?? 1;
    const haze = new THREE.Color(o.haze || '#a8846e'); U.uHaze.value.copy(haze); scene.fog.color.copy(haze); const fog = o.fog || [250, 2600]; scene.fog.near = U.uFogNear.value = fog[0]; scene.fog.far = U.uFogFar.value = fog[1];
    U.uLight.value = o.light ?? 1;
    G.hemi.intensity = (o.hemi ?? 0.9) * (o.light ?? 1); G.sunL.intensity = (o.key ?? 1.6) * (o.light ?? 1); G.sunL.color.set(o.keyCol || '#ffd0a0'); G.sunL.position.set(sun.dir[0] * 1000, Math.max(200, sun.dir[1] * 3000 + 300), sun.dir[2] * 1000);
    G.hemi.color.set(o.skyLight || '#c8b8d8'); G.hemi.groundColor.set(o.groundLight || '#5a3a28');
    // camera
    const c = o.cam || { pos: [0, 40, 600], look: [0, 30, 0], fov: 40 };
    camera.fov = c.fov || 40; camera.aspect = 9 / 16; camera.near = c.near || 1; camera.far = 12000; camera.updateProjectionMatrix();
    camera.position.set(...c.pos); camera.up.set(Math.sin(c.roll || 0), Math.cos(c.roll || 0), 0); camera.lookAt(...c.look); camera.updateMatrixWorld();
    camera.userData.trail = o.trail ?? 1;
    const show = o.show || {};
    G.ground.visible = show.ground !== false; G.hills.visible = show.hills !== false; G.sky.visible = show.sky !== false;
    G.ground.material.color.set(o.groundTint || '#ffffff'); G.hills.material.color.set(o.hillTint || '#ffffff');
    G.hosts.visible = !!show.hosts; for (const b of G.banners) b.visible = !!show.banners; G.banners[2].visible = !!show.banners && show.bannersP !== false;   // the near (Pandava) pennants can be left out where the camera passes over them
    // the hosts may advance: o.advance = metres each host has moved toward the middle
    if (show.hosts) { G.hosts.position.set(0, 0, 0); }
    // chariots: o.chariots = [{ i, pos: [x,z], heading (rad), speed (wheel turns from distance), dist, gallop }]
    for (const ch of G.chariots) ch.visible = false;
    for (const cd of o.chariots || []) { const ch = G.chariots[cd.i]; ch.visible = true; const y = groundY(cd.pos[0], cd.pos[1]); ch.position.set(cd.pos[0], y + (cd.lift || 0), cd.pos[1]); ch.rotation.set(0, cd.heading || 0, cd.tilt || 0); ch.scale.setScalar(cd.scale || 1);
      for (const w of ch.userData.wheels) w.rotation.z = -(cd.dist || 0) / 20;   // a wheel of radius 20 turns once in 2π·20 of road
      const fr = cd.gallop ? Math.floor(((cd.dist || 0) / 38 + ch.userData.seed * 0.37) * 8) % 8 : 0;
      ch.userData.horses.forEach((hm, k) => { hm.material.uniforms.uFrame.value = cd.gallop ? (fr + k * 3) % 8 : 0; hm.position.y = 26 + (cd.gallop ? 1.5 * Math.sin(((cd.dist || 0) / 38 + k) * Math.PI * 2) : 0); hm.visible = cd.horses !== false; }); }
    // arrows, dust, embers
    placeArrows(T, show.arrows ? o.volleys : [], camera);
    placeSprites(G.dust, G.dustN, T, show.dust ? o.dust : null, camera);
    placeSprites(G.embers, G.emN, T, show.embers ? o.embers : null, camera);
    G.dust.material.opacity = o.dustOpacity ?? 0.32; if (o.dustCol) G.dust.material.color.set(o.dustCol); else G.dust.material.color.set('#ffffff');
    // shockwaves: o.rings = [{ at: [x,z], t0, dur, r1, col }]
    G.rings.forEach(([r, w], i) => { const d = (o.rings || [])[i]; r.visible = w.visible = false; if (!d || !show.rings) return; const u = (T - d.t0) / d.dur; if (u < 0 || u > 1) return; const rr = lerp(10, d.r1, 1 - Math.pow(1 - u, 2.2));
      r.visible = w.visible = true; const y = groundY(d.at[0], d.at[1]) + 2; r.position.set(d.at[0], y, d.at[1]); r.scale.set(rr, rr, 1); w.position.set(d.at[0], y + (d.h || 60) / 2, d.at[1]); w.scale.set(rr, d.h || 60, rr);
      r.material.uniforms.uK.value = w.material.uniforms.uK.value = u; if (d.col) { r.material.uniforms.uCol.value.set(d.col); w.material.uniforms.uCol.value.set(d.col); } });
    // divine light
    G.divine.visible = !!show.divine; zeroAll(G.motes, G.moteN);
    if (show.divine) { const dv = o.divine; G.divine.position.set(...dv.at); const k = dv.k ?? 1; G.core.scale.setScalar(dv.coreR * (0.92 + 0.08 * Math.sin(T * 5))); G.core.material.uniforms.uK.value = k;
      G.tubes.forEach((tb, i) => { tb.rotation.y = T * 0.12 * (i % 2 ? 1 : -1) + i; tb.scale.setScalar(dv.tubeS * (0.6 + 0.4 * k)); tb.material.uniforms.uK.value = k; });
      G.rays.rotation.z = T * 0.05; G.rays.quaternion.copy(camera.quaternion); G.rays.rotateZ(T * 0.05); G.rays.visible = k > 0.05;
      // the motes stream in from the two hosts toward the core
      let n = 0; for (let i = 0; i < G.moteN; i++) { const r = (q) => h1(i + 9000, q), u = ((T * (0.12 + 0.1 * r(1)) + r(2)) % 1); const side = i % 2 ? 1 : -1;
        const x0 = (r(3) - 0.5) * 2400, z0 = side > 0 ? 300 + r(4) * 400 : -360 - r(4) * 400, y0 = groundY(x0, z0) + 12;
        const tx = dv.at[0], ty = dv.at[1], tz = dv.at[2], q = u * u, cx = lerp(x0, tx, 0.3), cy = ty * 0.4 + 200 * r(5), cz = lerp(z0, tz, 0.5);
        const x = (1 - q) * (1 - q) * x0 + 2 * q * (1 - q) * cx + q * q * tx, y = (1 - q) * (1 - q) * y0 + 2 * q * (1 - q) * cy + q * q * ty, z = (1 - q) * (1 - q) * z0 + 2 * q * (1 - q) * cz + q * q * tz;
        const s = lerp(9, 3, q) * k * (u > 0.92 ? (1 - u) / 0.08 : 1); P.set(x, y, z); Q.copy(camera.quaternion); S.set(s, s, s); M4.compose(P, Q, S); G.motes.setMatrixAt(n++, M4); }
      G.motes.instanceMatrix.needsUpdate = true; }
    renderer.setClearColor(0x000000, 1);
    renderer.render(scene, camera);
    lastCam = camera;
    return W3D.canvas;
  };
  W3D.project = function (p) { const v = new THREE.Vector3(...p).project(lastCam); const d = lastCam.position.distanceTo(new THREE.Vector3(...p)); const f = (1920 / 2) / Math.tan((lastCam.fov * Math.PI) / 360); return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920, f / d]; };
})();
