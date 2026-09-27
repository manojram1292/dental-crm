# Dental CRM

An interactive **dental practice workflow map** — a self-contained static site visualizing the operational workflows of a dental clinic (overview, inventory, sterilization, scheduling, cross-team handoffs, daily ops, and gap analysis).

## Live site

Once GitHub Pages finishes building, the site is available at:

**https://manojram1292.github.io/dental-crm/**

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The homepage GitHub Pages serves (copy of the workflow map). |
| `cognident-workflow-map.html` | The original named version of the workflow map. |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll processing and serve files as-is. |
| `showreel/` | A 15-second code-generated motion design showreel (`showreel.mp4`, plus a live player at `showreel/index.html`). See [`showreel/README.md`](showreel/README.md). |

## How it works

This is a **100% static** site — a single HTML file with inline CSS and JavaScript. There's no build step and no backend. It loads fonts from Google Fonts but otherwise runs entirely in the browser, which is why it can be hosted for free on GitHub Pages.

## Editing

Edit `index.html` (and/or `cognident-workflow-map.html`), commit, and push to `main`. GitHub Pages redeploys automatically within a minute or two.

```bash
git add -A
git commit -m "Update workflow map"
git push
```
