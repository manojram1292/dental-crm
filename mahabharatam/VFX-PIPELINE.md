# VFX pipeline for the Mahabharata series (installed 2026-11-16)

The owner's VFX handoff, kept with the project. The full technique file is the Claude Code skill `photoreal-cg`, committed at
`.claude/skills/photoreal-cg/SKILL.md` in this repository, so it loads in every session on this repository.

## What is installed here, and how to reinstall it in a fresh container

| Piece | Version | Where | Reinstall |
|---|---|---|---|
| Skill `photoreal-cg` | 2026-11-16 | `.claude/skills/photoreal-cg/SKILL.md` (repository root) | committed; nothing to do |
| Three.js | 0.187.0 (exact) | `mahabharatam/node_modules`, in `package.json` devDependencies | `npm install` in `mahabharatam/` |
| HyperFrames (HTML → MP4, open source) | 0.9.55 (exact) | same | same |
| Blender as a Python module (`bpy`) | 4.5.16 LTS, Cycles on CPU | `mahabharatam/lab/vfx/venv` (gitignored, about 950 MB) | `python3 -m venv lab/vfx/venv && lab/vfx/venv/bin/pip install bpy==4.5.16` |

Checked on install: `import three` reports revision 187; `npx hyperframes --version` prints 0.9.55; a Cycles CPU test render of
108×192 at 8 samples took 0.34 s. The machine has no GPU, so Cycles at full resolution is slow (minutes per frame for a lit scene).

## What cannot run in this cloud container

- **ChatGPT image generation, Google Flow (Omni 1.2 Flash), Muse, ChatGPT Deep Research.** These are browser services on the owner's
  own accounts. The container has no logins to them and must not try to get around login walls. The owner runs these steps, or a
  Claude session on the owner's Mac with the browser extension does (the download and upload tricks in the skill are for that setup).
- **The reference project** `~/Ceat/experiments/dragon_hero/` is on the owner's Mac, not here.

The split that works: this container builds the exact code layers (greybox, camera, choreography, timing, depth passes, divine
weapons and fire, motion blur, grain), renders the greybox stills and the hero-camera clips, and composites. The owner paints the
plates in ChatGPT and runs the Flow passes, then drops the files into `lab/vfx/in/`. This side then projects, composites, checks
and cuts them into episodes.

## How it fits this series (decisions the owner should make)

1. **Style.** The series so far is drawn in code in a flat temple-mural style (Canvas2D). This pipeline is for a photoreal look.
   Mixing the two inside one episode will look inconsistent. Options:
   - keep the mural style for the episodes and use photoreal VFX only for special pieces (the trailer, arc openers, the
     Vishvarupa, the astras);
   - move the whole series to photoreal from a chosen episode on (a large change in cost and time per episode);
   - a middle path: mural-style characters over painted, projected backgrounds with code effects.
2. **The faithfulness rules still apply to every AI pass.** AI video invents things (the Flow test added lightning). Anything a pass
   adds that the text does not have is cut, whatever it looks like. Period dress and weapons are written into every prompt, with no
   Western fantasy defaults and no recreation of any TV or film version.
3. **Gates still apply.** Every AI-passed clip goes back through `tools/gate.mjs` frame checks, the freeze and caption rules, and the
   viewer pass, and is compared side by side with its source (360p first, then 720p, then the free 1080p upscale).
4. **Money.** Flow is inside the owner's Gemini AI Pro plan (credits per second). Wan and Runway cost money and need the owner's
   go-ahead each time. Higgsfield has no credits.

## The owner's handoff (as given, 2026-11-16)

The key lesson from the 15 Nov 2026 dragon test: code alone gets geometry and motion right but looks like a game. Real-looking
results come from a multi-tool pipeline where code owns the motion and AI owns the look.

1. **Code (Three.js rendered by HyperFrames, or Blender Python)** owns layout, camera, choreography, timing and depth. Rendering is
   frame by frame and repeatable.
2. **ChatGPT image generation** repaints a greybox screenshot photoreal ("repaint this 3D layout photoreal, keep every element
   exactly in place"). It stays almost pixel-aligned.
3. **Camera projection:** project the painting from the hero camera onto the rough geometry, unlit. Use push-ins, zooms and small
   pans only (sideways drift of 1–3% of the distance to the nearest object), no orbits, and cover seams with drifting mist.
4. **Hero characters and creatures** stay as code: lofted sculpted shapes and baked physics.
5. **Camera feel:** 10-sub-frame motion blur across 1/60 s, depth of field, grain, slight edge fringing. Integrate with the plate:
   lift the blacks and mix in about 7% of its haze colour.
6. **Google Flow (Omni 1.2 Flash, video-to-video)** gives the "real footage" look. Upload a 3–5 s clip and keep camera, framing,
   timing, poses and background; change only the subject's look. Costs 1 credit/s at 360p and 3 credits/s at 720p; the 1080p
   upscale is free. Always compare with the source; watch colour shifts, softening, lost rain and added elements.
7. **Muse** handles long clips (up to about 10 minutes) and editing. Judge its output with the same checks.
8. **ChatGPT Deep Research** is for research. Always ask it to argue the opposite case, and check its prices yourself.

**Go/no-go for every AI pass:**
- Reject at 360p if identity, limbs, number of figures, overlaps or the camera change.
- Ban added objects in the prompt ("no new objects, no lightning, no text").
- If the look is right but the motion drifts, cut the AI subject out with segmentation and use the code depth only to decide what
  hides it.
- Fallbacks need paid approval: Wan 2.1 VACE (introductory free quota), Wan 2.7 VideoEdit (about $3 per 10 s), Runway Aleph (about
  $2.80).

**Mahabharata specifics:**
- One reference pack per character (front, side and three-quarter views), attached to every generation. Process each character
  separately when they overlap.
- Astras, lightning, fire and divine glow are built in code. Only characters and setting go through AI.
- Armies and crowds are painted into the projected plate. Only the foreground warriors are code geometry.
- Period-accurate dress, weapons and chariots. No wings unless the text says so. Recreate no existing TV or film version.

**Technical gotchas** (also in the skill §9):
- NaN black frames: clamp rim `pow` terms, and use no multisampled HalfFloat render targets.
- ShaderPass drops render-target textures: assign `tColor` and `tDepth` after construction.
