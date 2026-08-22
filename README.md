# The Bridge Program

A 12-week calisthenics program built around one finding — a push side roughly three times ahead of the pull side — plus the training log the program depends on.

Static site, no build step, no dependencies. Hosted on GitHub Pages.

## Running it locally

ES modules will not load over `file://`, so serve the directory:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Page shell and the four view containers |
| `assets/program.js` | The program as data — every session, exercise and per-week progression |
| `assets/app.js` | Rendering, state, persistence, rest timer |
| `assets/style.css` | All styling |
| `12-week-calisthenics-program.md` | The source document the site is built from |

Program content lives entirely in `assets/program.js`. To change a prescription, edit that file — `app.js` contains no exercise data.

### Editing a session

Each exercise is one object. `byWeek` overrides the base prescription for a given week:

```js
{ id: "pullup", name: "Pull-ups — cluster sets", sets: 6, reps: "2", rest: 90, log: "reps",
  byWeek: {
    1: { sets: 6, reps: "2" },
    3: { sets: 5, reps: "3" },
  } }
```

`log` selects the inputs shown per set: `"reps"`, `"sec"`, or `"load"` (kg + reps).
`kind` handles the three non-standard structures: `"ladder"`, `"emom"`, and the default sets-and-reps.
`unilateral: true` renders the weaker side first and caps the stronger side at the weaker side's reps.

Weeks 5–12 are partly **derived** from block-level prose in the source document rather than tabulated there. Those sessions carry `derived: true` and show a badge in the UI. Adjust them freely.

## Your data

Everything logged is stored in this browser's `localStorage` under `bridge.v2`. It never leaves the device, and there is no sync. Clearing browser data erases it — use **Log → Export JSON** regularly.

## Deploying

Pushing to `main` publishes automatically once Pages is enabled (Settings → Pages → Deploy from branch → `main` / root). `.nojekyll` stops GitHub running Jekyll over the files.

All asset paths are relative, so the site works from a repository subpath.

---

Not medical advice. The program's own warning stands: pain that is sharp, localised, or lasts beyond a few days deserves a physio, not a forum.
