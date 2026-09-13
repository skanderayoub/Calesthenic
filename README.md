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
| `equipment` | `"gym"` adds a badge and surfaces the no-gym swap from `HOME_ALTS` |
| `byWeek` | Per-week override, merged over the base |

Three things worth knowing before you edit:

**Resolution order is `byWeek` → `gate` → `rel` → consolidation.** See `resolveExercise` in `program.js`.

**The consolidation rule only fires when no `byWeek` entry exists** for that week. Weeks 4, 8 and 12 auto-drop one set — but if you add a `byWeek` entry for one of those weeks, you must bake the dropped set into it yourself.

**Never pair two unilateral exercises.** A unilateral exercise already alternates between sides; pairing two of them produces a block that takes 25 minutes. Leave them unpaired.

## No-gym alternatives

Every exercise marked `equipment: "gym"` has an entry in `HOME_ALTS` in `program.js`, keyed by exercise id — the substitution is a property of the movement, not of the week. The session view renders it as a collapsed disclosure on the card.

If you add a gym-dependent exercise, add its alternative too. `npm test` would be overkill for a four-file site, so this is the check:

```sh
node --input-type=module -e "
import * as m from './assets/program.js';
const ids = new Set();
for (let w = 0; w <= 12; w++)
  for (const d of (w ? ['strength','volume','density','power'] : ['calibration'])) {
    const s = m.getSession(w, d); if (!s) continue;
    s.exercises.forEach(e => { if (m.resolveExercise(e, w, {}).equipment === 'gym') ids.add(e.id); });
  }
const missing = [...ids].filter(i => !m.HOME_ALTS[i]);
console.log(missing.length ? 'MISSING: ' + missing.join(', ') : 'every gym movement has an alternative');
"
```

## Test sessions

Week 0 is the full calibration battery. Fridays of weeks 4, 8 and 12 replace the power session with a retest. Finishing a test session writes one entry into `state.maxes` and one into `state.asymmetry`, which is what drives the balance gauge, the pull-up chart, the asymmetry verdict, and every `rel` and `gate` in the program.

Test cards are exempt from the weaker-side cap — a calibration session is measuring the asymmetry, so clamping it would destroy the number being recorded.

## Your data

Everything logged is stored in this browser's `localStorage` under `bridge.v2`. It never leaves the device, and there is no sync. Clearing browser data erases it — use **Log → Export JSON** regularly.

## Deploying

Pushing to `main` publishes automatically once Pages is enabled (Settings → Pages → Deploy from branch → `main` / root). `.nojekyll` stops GitHub running Jekyll over the files.

All asset paths are relative, so the site works from a repository subpath.

## Sources

What v3 was built from, grouped by the decision each one informed.

### Session structure — mixing pull and push

- Steven Low, [The Fundamentals of Bodyweight Strength Training](https://stevenlow.org/the-fundamentals-of-bodyweight-strength-training/). The full-body template (2–3 push, 2–3 pull, 2 legs), paired push/pull with 1.5–3.5 min between pairs, and the case for external load on legs specifically.
- Steven Low, *Overcoming Gravity*, 2nd edition ([preview: contents and chapters 1–3](https://stevenlow.org/wp-content/uploads/2018/09/OG2-preview-TOC-Intro-Ch1-3.pdf)). The broader programming framework behind the article above.
- [Superset versus traditional resistance training prescriptions: a systematic review and meta-analysis](https://pubmed.ncbi.nlm.nih.gov/39903375/), *Sports Medicine*, 2025. Equal strength and hypertrophy at matched volume, with shorter sessions. The time saving in that research comes from shorter total rest than this program uses — with the rests prescribed here, pairing saves 0–10 minutes a session, not half.

### Pull-up frequency

- [The Fighter Pullup Program Revisited](https://www.strongfirst.com/the-fighter-pullup-program-revisited/), StrongFirst. The frequent, submaximal, never-to-failure principle.
- [Armstrong Pull-Up Program](https://liftvault.com/programs/bodyweight/armstrong-pull-up-program-spreadsheet/), Lift Vault. Considered and not adopted: a five-day pull-up specialisation program leaves no room for legs or the physique goal.
- [r/bodyweightfitness Recommended Routine](https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/). Same full-body, paired shape at three days a week. Referenced from prior knowledge; the page could not be fetched during research.

### Explosive pull-ups

- [Pull-Up Performance Is Affected Differently by the Muscle Contraction Regimens Practiced during Training among Climbers](https://www.mdpi.com/2306-5354/11/1/85), *Bioengineering*, 2024. Eccentric, isometric and plyometric groups all gained max strength (+2.2% to +5.0%); only the plyometric group increased muscle work (+21.9%).
- [Best Pull-Up Variations for Explosive Power](https://bullbarfit.com/blogs/q-as/what-are-the-best-pull-up-variations-for-building-explosive-power), BULLBAR. The 5–8 strict-rep prerequisite and the 3–5 × 3–5 prescription. A practitioner blog, not research — a performance statistic it attributes to a 2018 study could not be traced to that study and was not used.

### EMOM and cluster sets

- [Effectiveness of long-term cluster training and traditional resistance training in enhancing maximum strength: a systematic review and meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC11996837/), 2025.
- [Cluster sets and traditional sets elicit similar muscular hypertrophy](https://pmc.ncbi.nlm.nih.gov/articles/PMC12174233/), *European Journal of Applied Physiology*, 2025.

### Not from a source

These are judgement calls, and worth knowing as such if you want to change them:

- The percentages every prescription resolves against (45–65% of a measured max)
- The gate thresholds: 6 strict for hands-off, 8 for clap, 10 for weighted pull-ups — the sources agree on 5–8 before plyometrics; the exact split across stages is mine
- The test battery, its order, and the retest schedule
- Every no-gym alternative, including the 12–15 kg backpack ceiling
- The asymmetry protocol and its 10% / 20% thresholds, carried over from the v2 document

---

Not medical advice. The program's own warning stands: pain that is sharp, localised, or lasts beyond a few days deserves a physio, not a forum.
