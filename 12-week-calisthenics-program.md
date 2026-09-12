# The Bridge Program v3 — 12 Weeks, Gym-Adapted

**Athlete:** 29 yrs · 67 kg
**Current max:** unknown — measured in the week 0 calibration session
**Available:** full gym — barbell + rack, dumbbells, cables and lat pulldown, machines, dip/pull-up belt · 4 days/week
**Goals:** physique + skills, calisthenics-first

---

## What changed from v2, and why

Three things: a gym membership, a request to stop separating pull days from push days, and a request for explosive pull-up work and EMOMs where they help.

**v2 is superseded.** Its structure — PULL A / PUSH A / PULL B / PUSH B — is gone. So is its central weakness, which was that every prescription was a fixed number written off an *assumed* 4-rep max.

### Prescriptions are no longer fixed numbers

This is the important change and the reason this document no longer contains week-by-week tables.

Every working set now resolves as a percentage of a **measured** max. "Pull-ups, cluster sets" is not `6 × 2`; it is `6 sets at 45% of your measured pull-up max, floor 2, ceiling 8`. At a max of 4 that renders as 6 × 2. At 7 it renders as 6 × 3. At 10, 6 × 5.

A static table cannot express that, so the tables now live in `assets/program.js` and are rendered per week, per session, against whatever your last test said. This document holds the reasoning; the app holds the numbers.

---

## The evidence behind the structure

Four findings, because they are also the reasons not to "improve" this by adding sets.

**1. Mixing pull and push is the better structure, not a compromise.** Steven Low's programming framework builds full-body sessions of 2–3 pushes, 2–3 pulls and 2 leg movements, with push and pull *paired* and 1.5–3.5 min between pairs rather than 3–7 min between straight sets. A 2025 *Sports Medicine* meta-analysis on supersets found agonist–antagonist pairing roughly halves session duration at equal volume, equal hypertrophy and equal strength adaptation — while completing slightly *more* total reps. The preference and the better design happen to coincide.

**2. Frequency is what moves a low pull-up max.** The Fighter Pull-up Program and greasing the groove share one principle: frequent, submaximal, never to failure. Full-body ×4 takes pull-up frequency from 2×/week to 4×/week without a single set to failure.

**3. Explosive pull-ups work, and they are gated.** A 2024 trial on advanced climbers compared eccentric, isometric and plyometric pull-up training over 5 weeks, 2×/week. Max strength rose in all three groups (+2.2% to +5.0%), but only the plyometric group increased muscle work (+21.9%) and velocity. Every source agrees on the prerequisite: 5–8 strict full-range reps before plyometric pull-ups, then 3–5 sets of 3–5 reps, fully rested.

**4. EMOM earns one day, not four.** EMOM is a cluster-set method. The cluster-set literature shows equal hypertrophy, equal-or-slightly-better strength at matched volume, and better maintenance of rep quality because you never approach failure. Right tool for banking pull-up volume; wrong tool on the power day, where residual fatigue destroys the velocity being trained.

### Sources

- Steven Low, *The Fundamentals of Bodyweight Strength Training* and *Overcoming Gravity 2*
- Superset vs traditional resistance training: systematic review and meta-analysis, *Sports Medicine*, 2025
- Pull-Up Performance Is Affected Differently by the Muscle Contraction Regimens Practiced during Training among Climbers, *Bioengineering*, 2024
- Long-term cluster training vs traditional resistance training: systematic review and meta-analysis, 2025
- The Fighter Pullup Program — StrongFirst

---

## The weekly split

| Day | Session | Opens with | Legs |
|---|---|---|---|
| **Monday** | STRENGTH | heavy pull-up ↔ dip | back squat |
| **Tuesday** | VOLUME | lat pulldown ↔ pike push-up | barbell RDL, split squat |
| **Wednesday** | Rest | optional 10 min handstand + mobility | |
| **Thursday** | DENSITY | alternating pull/push EMOM | leg press, hamstring curl |
| **Friday** | POWER | explosive pull-up, unpaired | nordic, pistol |
| **Sat/Sun** | Rest | | |

Every session is mixed. Each is built as **non-competing pairs**: one set of the first movement, 75 seconds, one set of the second, 75 seconds, repeat.

Two structural rules the app enforces:

- **Skill work goes first**, after the warm-up, while the nervous system is clean. Never as a tired finisher.
- **Power work is never paired.** A fast rep done tired is just a slow rep. Full rest, and stop the exercise when speed drops rather than grinding the last set out.

Sessions run roughly 50–65 minutes including the warm-up. Monday is the long one; that is the cost of 150-second rests on the heavy work.

---

## Test sessions

### Week 0 — calibration, ~40 min

Fully rested, not the day after training. The order is deliberate: nothing fatiguing happens before the thing it would contaminate.

| # | Test | Protocol | Rest after |
|---|---|---|---|
| 1 | Warm-up | The full 8 min, plus 2 easy pull-ups and 3 easy dips | 3 min |
| 2 | **Max strict pull-ups** | Pronated, dead hang, chin over bar, no kip. Stop at the first rep you cannot complete cleanly | 5 min |
| 3 | **Max dips** | To technical failure — when depth or torso angle breaks | 5 min |
| 4 | **Max push-ups** | Chest to fist height, no sagging | 3 min |
| 5 | **Single-arm dead hang** L/R | Seconds. Weaker side first | 2 min |
| 6 | **Single-arm cable row** L/R | Reps at a weight you pick once and keep forever | 2 min |
| 7 | **Bodyweight squats in 60s** | Full depth | 2 min |
| 8 | **Single-leg calf raise** L/R | Off a step, full range | |

### Retests — Friday of weeks 4, 8, 12

They replace the power session. You are in a consolidation week, so you arrive fresh, and testing does not belong on the same day as speed work. Weeks 4 and 8 run a shorter battery; week 12 repeats the whole thing for the comparison the program exists to produce.

**Standing rules:** same bar, same time of day, same cable weight, and film the pull-up set from the front. Change any of those and you are measuring the change, not your progress.

---

## The explosive progression

| Block | Gate | Work |
|---|---|---|
| 1 (w1–4) | none | **Intent to move fast.** Ordinary pull-up, maximum concentric speed, chest to bar. No release, no landing. |
| 2 (w5–8) | 6 strict | **Hands-off pull-ups.** 4 × 3, 3 min rest. Tap the bar, re-grip, land into a bent elbow. |
| 3 (w9–12) | 8 strict | **Clap pull-ups.** 5 × 3, 3 min rest. Any rep that lands soft ends the exercise for the day. |

Weighted pull-ups have a separate, higher gate: **10 strict reps**. Below that, loading the movement buys elbow tendinopathy rather than strength.

Gates are enforced in the app, not annotated. A locked exercise shows what it is waiting for, why, and the fallback you do instead — it is never a dead card.

---

## What the gym adds

Added, because bodyweight genuinely cannot do it:

- **Barbell squat and Romanian deadlift** — legs are strong enough to need external load. The one place a barbell is not optional.
- **Dip and pull-up belt** — replaces the backpack; makes block 3 loading workable.
- **Lat pulldown and seated cable row** — pull volume that does not spend the pull-up reps you do not have yet.
- **Cable face pulls** — the same objection that killed v2's band RDL: a band gives least tension exactly where you need most.
- **Hamstring curl machine** — assistance so Nordics can stay at full range.

Deliberately **not** added: barbell bench, machine chest press, barbell row, leg extension. Anything that would displace a calisthenics movement already doing the same job. Vertical pressing stays pike push-up → HSPU. Horizontal pressing stays push-up variations and dips.

---

## The right/left asymmetry

Unchanged from v2, and still the habit that matters most:

- Every unilateral set starts with the **weaker** side
- The stronger side **matches** the weaker side's reps — never more, even when it could
- One extra set for the weaker side only, on row variations
- Film yourself from the front on pull-ups once a month

The app enforces the second rule rather than annotating it: the stronger side's input is capped at the weaker side's lowest logged set. The one exception is a test session, which is *measuring* the gap and must not clamp it.

Thresholds: under 10%, ignore it. 10–20%, the protocol handles it. Over 20%, or any pain, see a physio.

---

## Warm-up — 8 min, every session, no exceptions

1. 2 min easy cardio
2. Band pull-aparts — 15
3. Band dislocates — 10
4. Wrist prep — 10 each direction
5. Scapular pulls — 2 × 8
6. Dead hang — 30s
7. Support hold on dip bars — 20s
8. Bodyweight squats + hip circles — 10 each

Golfer's elbow (ache on the *inside* of the elbow) is the injury that ends this stage of training. The warm-up is the cheap insurance.

---

## Optional accelerator: greasing the groove

If — and only if — you have a bar at home: do **2 pull-ups** (half your max, never more) several times a day, on non-training days too. Never hard, never to failure. The single fastest method for adding reps at your level, at almost no recovery cost. Skip it entirely if the only bar you have is at the gym.

---

## Nutrition

At 67 kg, roughly **110–145 g of protein** a day. Skills and size both want a modest calorie surplus — you are light, and a couple of kilos of muscle will help your physique far more than it hurts your pull-ups. Sleep seven to nine hours; it does more for your numbers than any extra set.

---

## Stop and back off if

- Ache on the **inside of the elbow** — the classic overuse injury at your stage, and the one your dip volume plus new pull volume most invites
- Sharp or pinching shoulder pain on dips or pull-ups
- Painful clicking in the shoulder
- The left/right gap visibly widening rather than closing
- **Any explosive rep you land soft or catch off balance** — stop that exercise for the session, no exceptions
- Rising resting heart rate, worsening sleep, dropping motivation — accumulated fatigue; take a light week

---

## Three rules that decide whether this works

1. **Stay short of failure.** Almost every set sits at 45–60% of your measured max. That is not undertraining, it is the mechanism. Find true maxes in test sessions, never mid-week.
2. **Log everything.** At your stage progress is 1–2 reps a month. Invisible without a written record, and it feels like standing still. It is not.
3. **Weaker side first, stronger side matches.** The whole asymmetry fix is that one habit, applied for months.

---

*Not medical advice. Pain that is sharp, localised, or lasts beyond a few days deserves a physio, not a forum.*
