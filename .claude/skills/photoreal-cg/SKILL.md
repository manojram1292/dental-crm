---
name: photoreal-cg
description: Proven, ranked techniques for making code-built 3D (Three.js, WebGL, Blender Python, procedural geometry) look photoreal instead of "game cinematic", learned on the dragon hero shot (Nov 2026). Covers the realism ladder (what to fix first), matte-painting camera projection with an AI-painted plate, sculpted loft geometry, baked secondary physics, true motion blur, compositing integration (haze, black level, grain), hair and skin shading, black-frame debugging, and when to hand off to an AI video model (Google Flow, Wan, Runway) with go/no-go gates. Use whenever Manoj asks to make a 3D scene, render, animation, product shot or model look more real, in code or in Blender, or asks why something "still looks CG".
---

# Photoreal from code

Judge every step on a frame from the final file, not in the preview. The reference project is `~/Ceat/experiments/dragon_hero/` (index.html, renders v1–v3, `reference/` notes).

## 1. Where realism comes from (fix in this order)
1. **Background and set.** Real-looking environments are the cheapest big win, and you rarely need to model them. See §2.
2. **Silhouette and shape.** One continuous sculpted surface beats parts glued together (spheres and capsules read as toys). See §3.
3. **Motion with mass.** Lag, overshoot and settle toward the extremities. A body that follows a spline exactly reads as CG at once. See §4.
4. **Camera artefacts.** Motion blur, depth of field, grain, slight lens fringing. See §5.
5. **Integration.** Lift the object's black level and saturation to match the plate's air, light it from the plate, and soften edges. See §6.
6. **Materials.** Cavity darkening (AO from the height map), broken-up highlights, less clearcoat. Regular repeated patterns (scales, tiles) are a giveaway: jitter them. See §7.
7. **Light transport** (light through skin, soft self-shadowing, light through hair, wet micro-highlights). Code and texture can't fully add this in real-time WebGL. This is the remaining gap after 1–6, and it's where an AI video pass or a path tracer (Blender Cycles) earns its cost. See §8.

## 2. Matte-painting camera projection (biggest jump, $0)
- Render a **greybox** from the hero camera with the hero objects hidden. Ask ChatGPT image generation: "repaint this 3D layout photoreal, keep every element exactly in place". It stays almost pixel-aligned (1672×941).
- **Getting the image out of ChatGPT:** downloads from ChatGPT fail. Run a localhost receiver (`recv.py` on 127.0.0.1), inject a button into the ChatGPT page, open a popup to the receiver on a real click, postMessage the image blob to it, and let the popup POST it to disk. ChatGPT's CSP blocks fetching localhost directly. Ask the user before each download.
- **Projection:** a ShaderMaterial with `uProj = projector.projectionMatrix × projector.matrixWorldInverse`. In the vertex shader, `vP = uProj * modelMatrix * position` (multiply by `instanceMatrix` when instanced). In the fragment shader, uv = vP.xy/vP.w × 0.5 + 0.5. Unlit, no tone mapping.
- **Renderer:** use `NoToneMapping` for the plate, and inject ACES only into the hero materials (replace `#include <tonemapping_fragment>`). Build a PMREM environment from a sphere carrying the same projection, so the hero objects reflect the painting.
- **Camera rule:** push-ins, zooms and small pans only (sideways drift of 1–3% of the distance to the nearest object). No orbits.
- Cover seams with drifting mist sprites at about 0.14 opacity.

## 3. Geometry: sculpt with lofts, not primitives
- **Loft:** superellipse cross-sections along z, with width, top and bottom profiles from a monotone spline. Add Gaussian "sculpt bumps" {position, radius, amplitude, normal direction} for brows, sockets, cheeks and nostrils, plus about 0.05 fbm noise, then `computeVertexNormals`. The dragon skull and jaw (`sculpt()` in dragon_hero) went from a blob to a skull in one step.
- Sink eyes under a brow ridge, and give eyes a slit pupil and low emissive (≤0.35). Glowing eyes read as cartoon.
- The same profile-plus-bumps method exports to Blender (bmesh) and to watertight STL for 3D printing. Cap the ends, keep the mesh manifold, and check wall thickness.

## 4. Motion: bake secondary physics, keep it seekable
- Bake once at load at 1/120 s. Each spine point is a damped spring on its choreographed target, **driven only by the target's acceleration**: `e'' = -ω²e - 2ζωe' - a_target`. Steady flight keeps its shape, and turns or stops cause lag, overshoot and settle.
- Ranges: ω runs from 2π·1.8 at the head to 2π·0.55 at the tail. ζ runs from 1.0 to 0.55. Ramp the weight from 0 at the head (the choreography owns the head). Clamp the offset to about 1.4 × radius and the acceleration to ±400.
- Store offsets per step and interpolate at render time, so any frame can be seeked deterministically.

## 5. Camera: true motion blur and lens
- Render N=10 sub-frames across a 180° shutter (1/60 s at 30 fps), trailing behind the frame time. Add them with AdditiveBlending into a HalfFloat render target, weight 1/N, render the frame's own instant last (it supplies the depth), then run DOF, bloom, SMAA and grade. Render time went from 16 s to 20 s for 10 s of video.
- DOF: a golden-angle gather of 72 taps, circle of confusion from a thin-lens model, focus on the hero.
- Grain at two scales (full resolution plus half resolution), stronger in the shadows. Add slight chromatic fringing toward the frame edges.

## 6. Integration with the plate
- After ACES in the hero shader, mix 7–13% toward the plate's haze colour, about (0.6, 0.64, 0.7). Watch the saturation: going too far turned the red dragon grey, and 7% with saturation at 1.0 was right.
- Light from the plate: one warm key light matching the painted sun, hemisphere sky and ground colours sampled from the plate, environment intensity about 1.3.
- Put heavy rain and mist in front of the hero, in compositing.

## 7. Skin, scales, hair
- **Scales:** jitter centres by ±35% of the cell size, keep outline alpha ≤0.22, and keep belly plates narrow (18% of the circumference, plate seams at 8% alpha). Strong regular rings read as a "hose".
- **AO:** reuse the bump/height map as `aoMap` (intensity 0.6–0.9) to darken the cavities.
- **Hair:** use flat ribbon cones (radius 0.07, scaled 1.9 × 0.5), not needles. Give the material `alphaHash` with alpha `1 - smoothstep(0.2, 1, h)` toward the tip and darker roots (`mix(0.45, 1.1, …)`). Motion-blur sub-frames smooth out the hash noise.
- Don't let clearcoat plus iridescence on pale materials read as plastic (clearcoat ≤0.6, iridescence ≤0.2).

## 8. When code tops out: AI video pass (decision gates)
Full research: `~/Ceat/experiments/dragon_hero/reference/ai_video_research.md`.
1. **Google Flow, Omni Flash 1.2, video-to-video** (included in Manoj's AI Pro plan: 50 credits a day plus 1,000 a month; 1 credit/s at 360p, 3 credits/s at 720p, free 1080p upscale). Upload a hard 3–5 s excerpt. At 360p, reject if identity, limbs, overlaps or the camera change; if it passes, run 720p.
2. If it looks real but drifts: cut out the AI result with segmentation (its own matte, not your CG masks), and use your Z-buffer only to decide which objects hide it.
3. If Flow fails: Wan 2.1 VACE (depth and mask guided; introductory free quota if the account qualifies), then Wan 2.7 VideoEdit (about $3 per 10 s at native 1080p) or Runway Aleph (about $2.80). Spend money only with the user's go-ahead.
4. Code-only alternative: pin ChatGPT-painted keyframes onto the mesh UVs using exact 3D correspondence. It keeps the motion perfect, but baked lighting reads as "CG with a nice texture" (ChatGPT's estimate: 10–20% chance it reads as real).
- Sora is gone (2026). Higgsfield is pay-per-credit (the trial is over).

## 9. Debugging black or NaN frames
- Clamp every `pow(1 - abs(dot(...)))` rim term to [0, 1]. NaNs spread through bloom and turn whole frames black.
- Multisampled HalfFloat render targets produced black frames. Use single-sample targets plus SMAA.
- ShaderPass clones its uniforms and drops render-target textures, so assign `tColor` and `tDepth` after construction.
- Check renders by sampling frame brightness twice per second (ffmpeg scaled to 64×36, mean grey value).

## 10. Working with ChatGPT as a research buddy
Deep research gives a cited report in about 9 minutes. It **flips to agree** when you push back, so always follow with "steelman the opposite", and fact-check its prices and quotas yourself.

## 11. Result log
- 2026-11-15, Flow Omni 1.2 Flash video-to-video at 360p on dragon v3 (5 s excerpt, 5 credits): the dragons became believable creatures (real skull, fleshy body, sharp spines). It kept the camera, the background and most of the motion. Problems: the red shifted to maroon, the white dragon went soft, the rain disappeared, and it **invented lightning between the mouths**. Verdict: passes the 360p gate. Next is 720p. Getting files out: Flow's download button doesn't reach ~/Downloads. Find the signed `flow-content.google/video/` URL in `performance.getEntriesByType('resource')`, fetch it in the page, and send it with the localhost receiver (origin `https://flow.google.com`). Uploads: Flow creates its file input on click, so hook `HTMLInputElement.prototype.click` to catch it, then use file_upload.
