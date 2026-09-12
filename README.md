# The Bridge Program

A 12-week calisthenics program built around one finding — a push side roughly three times ahead of the pull side — plus the training log the program depends on.

**v3** adapts it to a gym: sessions mix pull and push instead of separating them, prescriptions resolve against a *measured* max instead of a hardcoded one, and explosive pull-up work is gated on that number rather than on the calendar.

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
| `12-week-calisthenics-program.md` | The design document: the reasoning, the split, the test protocol, the evidence |

Program content lives entirely in `assets/program.js`. To change a prescription, edit that file — `app.js` contains no exercise data.

## Start here

Run the **week 0 calibration session** (the `T` cell at the left of the week ruler) before week 1. Until you do, every number in the app comes from an assumed starting max and says so.

## Editing a session

Each exercise is one object:

```js
{ id: "pullup", name: "Pull-ups — cluster sets", sets: 6, rest: 90, log: "reps",
  side: "pull", pair: "A", emphasis: true,
  rel: rel("pullups", 0.45, 2, 8),
  byWeek: {
    1: { sets: 6, rel: rel("pullups", 0.45, 2, 8) },
    3: { sets: 5, rel: rel("pullups", 0.60, 3, 10) },
  } }
```

| Field | What it does |
|---|---|
| `log` | Which inputs a set shows: `"reps"`, `"sec"`, or `"load"` (kg + reps) |
| `side` | `"pull"`, `"push"`, `"legs"` or `"core"` — colours the card inside a mixed session |
| `pair` | Exercises sharing a letter are alternated as a non-competing pair |
| `rel` | Resolves the prescription against a measured max: `rel(of, pct, min, max, field)` |
| `gate` | Locks the movement below a measured number and substitutes `gate.fallback` |
| `kind` | `"emom"`, `"ladder"`, `"test"`, or omitted for ordinary sets |
| `unilateral` | Renders the weaker side first and caps the stronger side at its reps |
| `power` | Never paired; grouped under one "full rest" heading |
| `equipment` | `"gym"` adds a badge |
| `byWeek` | Per-week override, merged over the base |

Three things worth knowing before you edit:

**Resolution order is `byWeek` → `gate` → `rel` → consolidation.** See `resolveExercise` in `program.js`.

**The consolidation rule only fires when no `byWeek` entry exists** for that week. Weeks 4, 8 and 12 auto-drop one set — but if you add a `byWeek` entry for one of those weeks, you must bake the dropped set into it yourself.

**Never pair two unilateral exercises.** A unilateral exercise already alternates between sides; pairing two of them produces a block that takes 25 minutes. Leave them unpaired.

## Test sessions

Week 0 is the full calibration battery. Fridays of weeks 4, 8 and 12 replace the power session with a retest. Finishing a test session writes one entry into `state.maxes` and one into `state.asymmetry`, which is what drives the balance gauge, the pull-up chart, the asymmetry verdict, and every `rel` and `gate` in the program.

Test cards are exempt from the weaker-side cap — a calibration session is measuring the asymmetry, so clamping it would destroy the number being recorded.

## Your data

Everything logged is stored in this browser's `localStorage` under `bridge.v2`. It never leaves the device, and there is no sync. Clearing browser data erases it — use **Log → Export JSON** regularly.

## Deploying

Pushing to `main` publishes automatically once Pages is enabled (Settings → Pages → Deploy from branch → `main` / root). `.nojekyll` stops GitHub running Jekyll over the files.

All asset paths are relative, so the site works from a repository subpath.

---

Not medical advice. The program's own warning stands: pain that is sharp, localised, or lasts beyond a few days deserves a physio, not a forum.
