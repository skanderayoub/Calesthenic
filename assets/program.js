// The Bridge Program v3 — program data.
// Everything the UI renders comes from this file. app.js holds no program content.
// Source of truth: 12-week-calisthenics-program.md
//
// v3: gym equipment, mixed push/pull sessions built as non-competing pairs,
// gated explosive work, and prescriptions that resolve against a *measured*
// max rather than a hardcoded one.

export const ATHLETE = {
  age: 29,
  weightKg: 67,
  trainingAge: "~1 month when this was written",
  // Assumed starting point only. The week 0 calibration session replaces every
  // one of these with a measured number and the whole program recalculates.
  baseline: { pullups: 4, dips: 13, pushups: 20, squat60: 30, calf: 15 },
  proteinG: "110–145",
};

// The program's own standard: "Someone who can grind 40 quality dips should be
// doing 8–10 strict pull-ups, not 4." 9 / 13.5 = 0.667 pull-ups per dip.
export const BALANCE_TARGET_RATIO = 0.667;

export const WARMUP = [
  { name: "Easy cardio", spec: "2 min" },
  { name: "Band pull-aparts", spec: "15" },
  { name: "Band dislocates", spec: "10" },
  { name: "Wrist prep", spec: "10 each direction" },
  { name: "Scapular pulls", spec: "2 × 8" },
  { name: "Dead hang", spec: "30s" },
  { name: "Support hold on dip bars", spec: "20s" },
  { name: "Bodyweight squats + hip circles", spec: "10 each" },
];

export const WARMUP_WARNING =
  "Golfer's elbow (ache on the inside of the elbow) is the injury that ends this stage of training. The warm-up is the cheap insurance.";

export const SPLIT = [
  { day: "Mon", short: "MON", session: "strength", label: "STRENGTH", side: "mixed", subtitle: "heavy pull + press · squat" },
  { day: "Tue", short: "TUE", session: "volume", label: "VOLUME", side: "mixed", subtitle: "hypertrophy · hinge" },
  { day: "Wed", short: "WED", session: null, label: "REST", side: "rest", subtitle: "optional: 10 min handstand + mobility" },
  { day: "Thu", short: "THU", session: "density", label: "DENSITY", side: "mixed", subtitle: "EMOM · unilateral legs" },
  { day: "Fri", short: "FRI", session: "power", label: "POWER", side: "mixed", subtitle: "explosive · skill" },
  { day: "Sat", short: "SAT", session: null, label: "REST", side: "rest", subtitle: "" },
  { day: "Sun", short: "SUN", session: null, label: "REST", side: "rest", subtitle: "" },
];

export const BLOCKS = [
  {
    id: 1, weeks: [1, 2, 3, 4], title: "Close the gap",
    expect: "Nothing near failure. Explosive work is intent only.",
    intro: "Nearly all new volume goes to pull, and every working set sits at 45–60% of your measured max. That is not undertraining, it is the mechanism. The explosive day trains speed of intent on ordinary pull-ups — no impact, no landing, no gate to clear.",
  },
  {
    id: 2, weeks: [5, 6, 7, 8], title: "Build volume",
    expect: "Gate: 6 strict pull-ups unlocks hands-off work.",
    intro: "Density enters through the Thursday EMOM, and external load enters on the push side and the barbell. Your dips are ready for weight even though your pull-ups aren't.",
  },
  {
    id: 3, weeks: [9, 10, 11, 12], title: "Load the pull",
    expect: "Gates: 8 strict for clap pull-ups, 10 strict for weighted.",
    intro: "The pull side is finally ready for weight and for real plyometrics. Both are gated on a measured number rather than on the calendar — if the number isn't there, the app gives you the fallback instead.",
  },
];

export const CONSOLIDATION_WEEKS = [4, 8, 12];

export const TIMELINE = [
  { milestone: "7 strict pull-ups", original: "Week 4", real: "Week 5–6" },
  { milestone: "10 strict pull-ups", original: "Week 8", real: "Week 9–10" },
  { milestone: "12–13 strict pull-ups", original: "Week 12", real: "Week 13–15" },
  { milestone: "First weighted pull-up", original: "Week 6", real: "Week 10+ — gated at 10 strict" },
  { milestone: "First clap pull-up", original: "—", real: "Week 9+ — gated at 8 strict" },
  { milestone: "Muscle-up", original: "Week 12", real: "Month 6–8 — dips ready, pull isn't" },
];

export const ASYMMETRY_TESTS = [
  { id: "hang", name: "Single-arm dead hang", unit: "seconds" },
  { id: "bandRow", name: "Single-arm cable row", unit: "reps, same weight every time" },
  { id: "ausRow", name: "Single-arm Australian row", unit: "reps" },
];

export const ASYMMETRY_PROTOCOL = [
  "Every unilateral set starts with the weaker side",
  "The stronger side matches the weaker side's reps — never more, even when it could",
  "One extra set for the weaker side only, on row variations",
  "Film yourself from the front on pull-ups once a month — check if one shoulder rises first",
];

export const BACK_OFF = [
  "Ache on the inside of the elbow — the classic overuse injury at your stage, and the one your dip volume plus new pull volume most invites",
  "Sharp or pinching shoulder pain on dips or pull-ups",
  "Painful clicking in the shoulder",
  "The left/right gap visibly widening rather than closing",
  "Any explosive rep you land soft or catch off balance — stop that exercise for the session, no exceptions",
  "Rising resting heart rate, worsening sleep, dropping motivation — that's accumulated fatigue; take a light week",
];

export const RULES = [
  { title: "Stay short of failure", body: "Almost every set here sits at 45–60% of your measured max. That's not undertraining — it's the mechanism. Find your true maxes in the test sessions, never mid-week." },
  { title: "Log everything", body: "At your stage progress is 1–2 reps a month. Invisible without a written record, and it feels like standing still. It isn't." },
  { title: "Weaker side first, stronger side matches", body: "The whole asymmetry fix is that one habit, applied for months." },
];

export const PAIRING_NOTE =
  "Alternate the two movements: one set of the first, 75 seconds, one set of the second, 75 seconds, and repeat. Pairing movements that don't compete cuts session time roughly in half at the same volume — and you tend to complete slightly more total reps than you would in straight sets.";

export const POWER_NOTE =
  "The explosive work is deliberately not paired. Power is the one quality that residual fatigue destroys outright: a fast rep done tired is just a slow rep. Take the full rest, and stop the exercise the moment speed drops rather than grinding out the last set.";

// ─── Prescriptions relative to a measured max ────────────────────────────────
// rel: { of, pct, min, max, field } — resolved by resolveExercise against the
// latest logged max test, falling back to ATHLETE.baseline before calibration.

const rel = (of, pct, min, max, field) => ({ of, pct, min, max, ...(field ? { field } : {}) });

const REL_LABELS = {
  pullups: "pull-up max", dips: "dip max", pushups: "push-up max",
  squat60: "60-second squat test", calf: "calf raise max",
};

// ─── No-gym alternatives ─────────────────────────────────────────────────────
// Keyed by exercise id, because the substitution is a property of the movement
// rather than of the week. Every exercise marked equipment: "gym" has one.
// A backpack is the workhorse: one litre of water is one kilogram.

export const HOME_ALTS = {
  pullup: {
    name: "Backpack pull-ups",
    how: "Load a backpack with water bottles &mdash; 1 litre is 1 kg. It caps out around 12&ndash;15 kg before the swing becomes the limiting factor. Past that, switch to 5-second negatives and stop chasing load at home.",
  },
  dips: {
    name: "Backpack dips",
    how: "Same backpack. Dips tolerate it better than pull-ups do because the load sits still against your back rather than swinging under you.",
  },
  pulldown: {
    name: "Australian rows, feet elevated",
    how: "Under a table edge, or a bar at hip height. The pulldown is here to give you pull volume that is not a pull-up, so a horizontal bodyweight row is the honest swap &mdash; not more pull-ups.",
  },
  cablerow: {
    name: "Australian rows, feet elevated",
    how: "Feet on a chair, chest to the bar, one second squeeze at the top. Raise the feet to make it harder.",
  },
  sacablerow: {
    name: "Single-arm Australian row",
    how: "Same protocol: weaker side first, stronger side matches. Walk your feet forward to add difficulty rather than adding reps.",
  },
  widerow: {
    name: "Wide-grip Australian rows",
    how: "Feet elevated, backpack on, hands wider than shoulders.",
  },
  facepull: {
    name: "Band face pulls",
    how: "Anchored at head height. A band is the weaker version of this &mdash; it gives least tension exactly at the stretch. Compensate with the slowest tempo you can hold and a one-second pause at your face.",
  },
  squat: {
    name: "Backpack Bulgarian split squats",
    how: "Two-legged bodyweight squats stop being a stimulus quickly, so go unilateral rather than adding reps. Rear foot on a chair, three seconds down, backpack on. Roughly 12 reps a leg for a set of 8 on the bar.",
  },
  rdl: {
    name: "Single-leg Romanian deadlift",
    how: "Backpack worn or a weight held in the opposite hand. Balance will be the limiter for the first week, not the hamstring &mdash; touch a wall with one finger if you need to.",
  },
  legpress: {
    name: "Walking or reverse lunges",
    how: "Backpack on. Long steps, front knee tracking over the toes.",
  },
  hamcurl: {
    name: "Nordic curl negatives",
    how: "Heels wedged under a sofa or a door frame. This is the harder version of the same job, so cut the range rather than the reps &mdash; lower only as far as you can control, catch with your hands, push back up.",
  },
  calf: {
    name: "Single-leg calf raise off a step",
    how: "Backpack on. Full stretch at the bottom, one second pause.",
  },
  curls: {
    name: "Chin-up negatives",
    how: "Five seconds down, every rep. Bodyweight biceps work is mostly supinated pulling &mdash; band curls also work if your elbows are already irritated.",
  },
  bulgarian: {
    name: "Backpack Bulgarian split squats",
    how: "Backpack instead of dumbbells. For the deficit version in block 3, put your front foot on a stack of books.",
  },
  bandRow: {
    name: "Single-arm band row, marked",
    how: "A band with a fixed anchor and a marked foot position, or a single-arm Australian row with your feet at a marked distance. Whatever you pick becomes the permanent reference: same band, same anchor, same marks, every single test. Change it and the number stops meaning anything.",
  },
};

// ─── Test sessions ───────────────────────────────────────────────────────────
// kind: "test" items write straight into the max and asymmetry logs.
// measures: which field of a max entry the result fills.

const T = (o) => ({ kind: "test", log: "reps", sets: 1, ...o });

const TEST_WARMUP = T({
  id: "warmup2", name: "Extended warm-up", measures: null, rest: 180, side: "rest",
  reps: "8 min + 2 easy pull-ups + 3 easy dips",
  notes: "Then three full minutes of nothing. You are measuring a maximum, not warming into one.",
});

const TEST_PULLUPS = T({
  id: "pullups", name: "Max strict pull-ups", measures: "pullups", rest: 300, side: "pull", emphasis: true,
  reps: "one set, to clean failure",
  notes: "Pronated, dead hang, chin over the bar, no kip. Stop at the first rep you cannot complete cleanly — not the first rep you fail. Film this set from the front: it doubles as your asymmetry check.",
});

const TEST_DIPS = T({
  id: "dips", name: "Max dips", measures: "dips", rest: 300, side: "push",
  reps: "one set, to technical failure",
  notes: "Stop when depth or torso angle breaks, not when you physically cannot move.",
});

const TEST_PUSHUPS = T({
  id: "pushups", name: "Max push-ups", measures: "pushups", rest: 180, side: "push",
  reps: "one set",
  notes: "Chest to fist height, no sagging at the hips.",
});

const TEST_HANG = T({
  id: "hang", name: "Single-arm dead hang", measures: "hang", rest: 120, side: "pull",
  unilateral: true, log: "sec", reps: "seconds, each side",
  notes: "Weaker side first, as always.",
});

const TEST_ROW = T({
  id: "bandRow", name: "Single-arm cable row", measures: "bandRow", rest: 120, side: "pull",
  unilateral: true, equipment: "gym", reps: "reps, each side",
  notes: "Pick a weight once and write it in the session notes. Every future test uses that same weight, or the number means nothing.",
});

const TEST_SQUAT = T({
  id: "squat60", name: "Bodyweight squats in 60 seconds", measures: "squat60", rest: 120, side: "legs",
  reps: "reps in one minute",
  notes: "Full depth, thighs below parallel. This calibrates the leg work.",
});

const TEST_CALF = T({
  id: "calf", name: "Single-leg calf raise", measures: "calf", side: "legs",
  unilateral: true, reps: "max reps, each side",
  notes: "Off a step, full range, one second pause at the bottom.",
});

export const CALIBRATION = {
  day: "Any", label: "CALIBRATION", side: "test", subtitle: "measure everything · ~40 min",
  test: true,
  note: "Do this fully rested — not the day after training. The order is deliberate: nothing fatiguing happens before the thing it would contaminate. Every number recorded here rewrites the twelve weeks that follow.",
  exercises: [TEST_WARMUP, TEST_PULLUPS, TEST_DIPS, TEST_PUSHUPS, TEST_HANG, TEST_ROW, TEST_SQUAT, TEST_CALF],
};

const RETEST_SHORT = {
  day: "Fri", label: "RETEST", side: "test", subtitle: "recalibrate · ~25 min",
  test: true,
  note: "Consolidation week, so you arrive fresh. This replaces Friday's power session — testing is neurally expensive and the two do not belong on the same day. Same bar, same time of day, same cable weight as every other test.",
  exercises: [TEST_WARMUP, TEST_PULLUPS, TEST_DIPS, TEST_HANG, TEST_ROW, TEST_SQUAT],
};

const RETEST_FULL = {
  ...CALIBRATION,
  day: "Fri", label: "FINAL TEST", subtitle: "the whole battery · ~40 min",
  note: "Week 12. The full battery again, exactly as you ran it at week 0 — same bar, same weight, same time of day. This comparison is what the entire program was built to produce.",
};

// ─── Sessions ────────────────────────────────────────────────────────────────
// log:  "reps" | "sec" | "load" (load shows kg + reps)
// kind: "sets" (default) | "emom" | "ladder" | "test"
// side: "pull" | "push" | "legs" | "core" — colours the card, within a session
// pair: exercises sharing a letter are alternated as a non-competing pair
// byWeek: per-week override, merged over the base

const b1 = {
  strength: {
    day: "Mon", label: "STRENGTH", side: "mixed", subtitle: "heavy pull + press · squat",
    note: "The heaviest session of the week, placed when you are freshest. Skill work comes first, while the nervous system is clean.",
    exercises: [
      { id: "flever", name: "Tuck front lever hold", sets: 4, reps: "10–15s", rest: 60, log: "sec",
        side: "pull", skill: true,
        notes: "Hollow holds instead if your hollow is under 30s." },

      { id: "pullup", name: "Pull-ups — cluster sets", sets: 6, rest: 90, log: "reps",
        side: "pull", pair: "A", emphasis: true, rel: rel("pullups", 0.45, 2, 8),
        notes: "Every rep crisp. This should feel easy — it is meant to.",
        byWeek: {
          1: { sets: 6, rel: rel("pullups", 0.45, 2, 8) },
          2: { sets: 6, rel: rel("pullups", 0.45, 2, 8), notes: "Every rep crisp, plus a 3 second negative on each one." },
          3: { sets: 5, rel: rel("pullups", 0.6, 3, 10) },
          4: { sets: 4, rel: rel("pullups", 0.6, 3, 10), notes: "Consolidation week — one set fewer. Retest on Friday." },
        } },
      { id: "dips", name: "Dips", sets: 4, rest: 90, log: "reps",
        side: "push", pair: "A", rel: rel("dips", 0.5, 4, 12),
        notes: "Stay upright-ish, don't sink past 90°.",
        byWeek: { 4: { sets: 3, rel: rel("dips", 0.5, 4, 12) } } },

      { id: "squat", name: "Barbell back squat", sets: 3, reps: "10", rest: 120, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        notes: "Three seconds down on every rep. Knees track over toes.",
        byWeek: {
          1: { reps: "10", notes: "Empty bar or light. Learn the groove before you load it — this is a new movement." },
          2: { reps: "10" },
          3: { reps: "8" },
          4: { sets: 2, reps: "8" },
        } },
      { id: "kneeraise", name: "Hanging knee raises", sets: 3, reps: "10", rest: 60, log: "reps",
        side: "core", pair: "B" },

      { id: "cablerow", name: "Seated cable row", sets: 3, reps: "10–12", rest: 90, log: "load",
        side: "pull", equipment: "gym",
        notes: "Pull volume that doesn't spend the pull-up reps you don't have yet. One second squeeze at the back." },

      { id: "facepull", name: "Cable face pulls", sets: 3, reps: "15", rest: 60, log: "load",
        side: "pull", pair: "D", equipment: "gym",
        notes: "The antidote to your dip volume. The cable replaces the band because a band gives least tension exactly where you need most." },
      { id: "calf", name: "Standing calf raise", sets: 3, rest: 60, log: "reps",
        side: "legs", pair: "D", rel: rel("calf", 0.8, 10, 30),
        notes: "Full stretch at the bottom, one second pause." },
    ],
  },

  volume: {
    day: "Tue", label: "VOLUME", side: "mixed", subtitle: "hypertrophy · hinge",
    note: "Higher reps, shorter rests, nothing heavy. This is the session that builds the back width your physique goal actually depends on.",
    exercises: [
      { id: "hswall", name: "Chest-to-wall handstand", sets: 4, reps: "20–30s", rest: 60, log: "sec",
        side: "push", skill: true,
        notes: "Belly to wall, ribs down." },

      { id: "pulldown", name: "Lat pulldown", sets: 3, reps: "10–12", rest: 90, log: "load",
        side: "pull", pair: "A", equipment: "gym", emphasis: true,
        notes: "Leave two reps in reserve. This is where most of your weekly pull volume now lives." },
      { id: "pike", name: "Pike push-ups, feet elevated", sets: 3, reps: "8", rest: 90, log: "reps",
        side: "push", pair: "A" },

      { id: "rdl", name: "Barbell Romanian deadlift", sets: 3, reps: "10", rest: 120, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        notes: "Push the hips back, soft knees, bar close. Stop when the hamstring stretch runs out, not when the bar hits the floor.",
        byWeek: { 1: { reps: "10", notes: "Light. Learn the hinge — this is the movement most likely to be done badly." }, 4: { sets: 2, reps: "10" } } },
      { id: "dipseasy", name: "Dips, easy volume", sets: 3, rest: 90, log: "reps",
        side: "push", pair: "B", rel: rel("dips", 0.4, 4, 10) },

      { id: "bulgarian", name: "Bulgarian split squats", sets: 3, reps: "10", rest: 90, log: "reps",
        side: "legs", unilateral: true, unilateralLabel: "leg",
        notes: "Bodyweight this block. Add reps before you add load.",
        byWeek: { 1: { reps: "10" }, 2: { reps: "12" }, 3: { reps: "15" }, 4: { sets: 2, reps: "15" } } },
      { id: "sacablerow", name: "Single-arm cable row", sets: 3, reps: "10", rest: 60, log: "reps",
        side: "pull", emphasis: true, unilateral: true, extraWeakSet: true, equipment: "gym" },

      { id: "curls", name: "Dumbbell curls", sets: 3, reps: "12", rest: 60, log: "load",
        side: "pull", equipment: "gym",
        notes: "Here for the physique goal, and because biceps are part of what a pull deficit starves." },
    ],
  },

  density: {
    day: "Thu", label: "DENSITY", side: "mixed", subtitle: "EMOM · unilateral legs",
    note: "The EMOM is the whole point of this day. At the top of each minute do the reps, then rest what's left of the minute. If you cannot finish the last minute at the prescribed reps, you started too high — drop one and rebuild.",
    exercises: [
      { id: "lsit", name: "L-sit progression", sets: 4, reps: "max hold", rest: 60, log: "sec",
        side: "core", skill: true,
        notes: "Foot-supported → tuck → one leg." },

      { id: "emom", name: "Alternating EMOM — pull / push", kind: "emom", minutes: 10, rest: 0,
        side: "pull", emphasis: true, altName: "Push-ups",
        rel: rel("pullups", 0.4, 2, 6, "repsPerMinute"),
        altRel: rel("pushups", 0.35, 4, 15, "altReps"),
        notes: "Odd minutes pull-ups, even minutes push-ups. Never to failure — that is what makes this method work rather than just tire you out.",
        byWeek: {
          1: { minutes: 10 },
          2: { minutes: 12 },
          3: { minutes: 12, rel: rel("pullups", 0.45, 2, 7, "repsPerMinute") },
          4: { minutes: 10, rel: rel("pullups", 0.4, 2, 6, "repsPerMinute") },
        } },

      { id: "legpress", name: "Leg press", sets: 3, reps: "12", rest: 90, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        notes: "Walking lunges if the press is taken. Full range, no locking out hard at the top." },
      { id: "widerow", name: "Wide-grip Australian rows", sets: 3, reps: "12", rest: 90, log: "reps",
        side: "pull", pair: "B",
        notes: "Feet elevated, one second pause with the chest at the bar." },

      { id: "hamcurl", name: "Seated hamstring curl", sets: 3, reps: "12", rest: 60, log: "load",
        side: "legs", pair: "C", equipment: "gym",
        notes: "Builds toward the Nordics on Friday, which are the harder version of the same job." },
      { id: "diamond", name: "Diamond push-ups", sets: 3, rest: 90, log: "reps",
        side: "push", pair: "C", rel: rel("pushups", 0.4, 5, 20) },

      { id: "deadhang", name: "Dead hang", sets: 3, reps: "max", rest: 60, log: "sec",
        side: "pull",
        notes: "Also your grip work and your informal asymmetry check." },
    ],
  },

  power: {
    day: "Fri", label: "POWER", side: "mixed", subtitle: "explosive · skill",
    note: "Speed day. Everything explosive happens first, fresh, and unpaired.",
    exercises: [
      { id: "hstaps", name: "Wall handstand + shoulder taps", sets: 4, reps: "20s / 6 taps", rest: 60, log: "sec",
        side: "push", skill: true },

      { id: "explosive", name: "Explosive pull-ups — intent", sets: 5, rest: 180, log: "reps",
        side: "pull", emphasis: true, power: true, rel: rel("pullups", 0.4, 2, 5),
        notes: "An ordinary pull-up moved as fast as you physically can. Chest to the bar is the range target. No release, no clap, no landing — with your current max the impact version would cost you more than it gives, and the intent alone buys most of the speed adaptation.",
        byWeek: {
          1: { rel: rel("pullups", 0.4, 2, 4), notes: "Four sets this week while you learn what maximum intent actually feels like." , sets: 4 },
          2: { sets: 5 },
          3: { sets: 5, rel: rel("pullups", 0.45, 2, 5), notes: "Chest to bar on every rep now. If you cannot reach it, the rep was not fast enough." },
          4: { sets: 3, rel: rel("pullups", 0.4, 2, 4) },
        } },
      { id: "plyopush", name: "Explosive push-ups", sets: 4, reps: "5", rest: 120, log: "reps",
        side: "push", power: true,
        notes: "Hands leave the floor. Land soft, elbows bent, and reset between reps.",
        byWeek: { 1: { reps: "4", notes: "Hands leave the floor even slightly counts. Land soft." }, 4: { sets: 3, reps: "5" } } },

      { id: "pistol", name: "Assisted pistol squat", sets: 3, reps: "6", rest: 90, log: "reps",
        side: "legs", unilateral: true, unilateralLabel: "leg",
        notes: "Hold a post or sit to a box. Depth before independence — this is a skill as much as a strength lift.",
        byWeek: { 1: { reps: "5" }, 2: { reps: "6" }, 3: { reps: "8" }, 4: { sets: 2, reps: "8" } } },
      { id: "archer", name: "Archer push-ups", sets: 3, reps: "6", rest: 90, log: "reps",
        side: "push", emphasis: true, unilateral: true },

      { id: "nordic", name: "Nordic curl negatives", sets: 3, reps: "3", rest: 120, log: "reps",
        side: "legs", pair: "D",
        notes: "Anchor your heels. Lower as slowly as you can, catch yourself with your hands, push back up.",
        byWeek: { 1: { reps: "3", notes: "Short range only. Hands ready to catch from the very start." }, 2: { reps: "4" }, 3: { reps: "5" }, 4: { sets: 2, reps: "5" } } },
      { id: "t2b", name: "Toes-to-bar", sets: 3, reps: "8", rest: 60, log: "reps",
        side: "core", pair: "D",
        notes: "Knees to chest if the straight-leg version pulls you into an arch." },
    ],
  },
};

const b2 = {
  strength: {
    day: "Mon", label: "STRENGTH", side: "mixed", subtitle: "heavy pull + loaded press",
    note: "Load enters this block — on the push side and on the bar. The pull side still isn't ready for it.",
    exercises: [
      { id: "flever", name: "Advanced tuck front lever", sets: 4, reps: "8–12s", rest: 60, log: "sec",
        side: "pull", skill: true },

      { id: "pullup", name: "Pull-ups — cluster sets", sets: 5, rest: 120, log: "reps",
        side: "pull", pair: "A", emphasis: true, rel: rel("pullups", 0.55, 3, 10),
        notes: "Still two reps in reserve on every set.",
        byWeek: {
          5: { sets: 5, rel: rel("pullups", 0.55, 3, 10) },
          6: { sets: 5, rel: rel("pullups", 0.55, 3, 10) },
          7: { sets: 5, rel: rel("pullups", 0.65, 4, 12) },
          8: { sets: 4, rel: rel("pullups", 0.6, 3, 10), notes: "Consolidation week. Retest on Friday." },
        } },
      { id: "dips", name: "Weighted dips", sets: 4, reps: "6", rest: 120, log: "load",
        side: "push", pair: "A", emphasis: true, equipment: "gym",
        notes: "Belt, not backpack. Add 2.5 kg every two weeks — not every week.",
        byWeek: { 5: { load: 2.5 }, 6: { load: 2.5 }, 7: { load: 5 }, 8: { sets: 3, load: 5 } } },

      { id: "squat", name: "Barbell back squat", sets: 4, reps: "8", rest: 150, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        notes: "Keep the three second descent as the weight climbs.",
        byWeek: { 5: { reps: "8" }, 6: { reps: "8" }, 7: { reps: "6" }, 8: { sets: 2, reps: "6" } } },
      { id: "t2b", name: "Toes-to-bar", sets: 3, reps: "10", rest: 60, log: "reps",
        side: "core", pair: "B" },

      { id: "cablerow", name: "Seated cable row", sets: 4, reps: "8–10", rest: 90, log: "load",
        side: "pull", pair: "C", equipment: "gym" },
      { id: "pseudo", name: "Pseudo-planche push-ups", sets: 3, reps: "8", rest: 90, log: "reps",
        side: "push", pair: "C" },

      { id: "facepull", name: "Cable face pulls", sets: 3, reps: "15", rest: 60, log: "load",
        side: "pull", pair: "D", equipment: "gym" },
      { id: "calf", name: "Standing calf raise, loaded", sets: 3, rest: 60, log: "load",
        side: "legs", pair: "D", equipment: "gym", rel: rel("calf", 0.7, 10, 25) },
    ],
  },

  volume: {
    day: "Tue", label: "VOLUME", side: "mixed", subtitle: "hypertrophy · hinge",
    exercises: [
      { id: "hswall", name: "Freestanding handstand attempts", sets: 4, reps: "30s", rest: 60, log: "sec",
        side: "push", skill: true,
        notes: "Bail sideways — turn and step out, never fold backwards." },

      { id: "pulldown", name: "Lat pulldown", sets: 4, reps: "8–10", rest: 90, log: "load",
        side: "pull", pair: "A", equipment: "gym", emphasis: true,
        notes: "Heavier than block 1. Still two in reserve." },
      { id: "pike", name: "Pike push-ups, feet elevated", sets: 4, reps: "10", rest: 90, log: "reps",
        side: "push", pair: "A" },

      { id: "rdl", name: "Barbell Romanian deadlift", sets: 4, reps: "8", rest: 120, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        byWeek: { 8: { sets: 2, reps: "8" } } },
      { id: "dipseasy", name: "Dips, easy volume", sets: 3, rest: 90, log: "reps",
        side: "push", pair: "B", rel: rel("dips", 0.45, 5, 12) },

      { id: "bulgarian", name: "Bulgarian split squats, loaded", sets: 3, reps: "10", rest: 90, log: "load",
        side: "legs", unilateral: true, unilateralLabel: "leg", equipment: "gym",
        notes: "Dumbbells. Same cadence as the dips — add weight every two weeks, not every week.",
        byWeek: { 5: { reps: "10", load: 8 }, 6: { reps: "12", load: 8 }, 7: { reps: "10", load: 12 }, 8: { sets: 2, reps: "10", load: 12 } } },
      { id: "sacablerow", name: "Single-arm cable row", sets: 3, reps: "10", rest: 60, log: "load",
        side: "pull", emphasis: true, unilateral: true, extraWeakSet: true, equipment: "gym" },

      { id: "curls", name: "Dumbbell curls", sets: 3, reps: "10", rest: 60, log: "load",
        side: "pull", equipment: "gym" },
    ],
  },

  density: {
    day: "Thu", label: "DENSITY", side: "mixed", subtitle: "EMOM · unilateral legs",
    note: "The EMOM is where your pull volume compounds this block. Quality every minute — the method only works because you never approach failure.",
    exercises: [
      { id: "lsit", name: "L-sit progression", sets: 4, reps: "max hold", rest: 60, log: "sec",
        side: "core", skill: true, notes: "Tuck → one leg." },

      { id: "emom", name: "Alternating EMOM — pull / push", kind: "emom", minutes: 12, rest: 0,
        side: "pull", emphasis: true, altName: "Dips",
        rel: rel("pullups", 0.45, 2, 7, "repsPerMinute"),
        altRel: rel("dips", 0.3, 3, 10, "altReps"),
        notes: "Odd minutes pull-ups, even minutes dips. The push side steps up from push-ups now.",
        byWeek: {
          5: { minutes: 10 },
          6: { minutes: 12 },
          7: { minutes: 12, rel: rel("pullups", 0.5, 3, 8, "repsPerMinute") },
          8: { minutes: 10, rel: rel("pullups", 0.45, 2, 7, "repsPerMinute") },
        } },

      { id: "legpress", name: "Leg press", sets: 4, reps: "10", rest: 90, log: "load",
        side: "legs", pair: "B", equipment: "gym" },
      { id: "widerow", name: "Wide-grip rows, weighted", sets: 4, reps: "10", rest: 90, log: "load",
        side: "pull", pair: "B", equipment: "gym" },

      { id: "hamcurl", name: "Seated hamstring curl", sets: 3, reps: "10", rest: 60, log: "load",
        side: "legs", pair: "C", equipment: "gym" },
      { id: "diamond", name: "Diamond push-ups", sets: 3, rest: 90, log: "reps",
        side: "push", pair: "C", rel: rel("pushups", 0.45, 6, 22) },

      { id: "deadhang", name: "Dead hang", sets: 3, reps: "max", rest: 60, log: "sec",
        side: "pull" },
    ],
  },

  power: {
    day: "Fri", label: "POWER", side: "mixed", subtitle: "explosive · skill",
    note: "The first gated session. If the number isn't there, the app gives you the fallback rather than letting you attempt something your tendons aren't ready for.",
    exercises: [
      { id: "hstaps", name: "Freestanding handstand + wall taps", sets: 4, reps: "30s", rest: 60, log: "sec",
        side: "push", skill: true },

      { id: "explosive", name: "Hands-off pull-ups", sets: 4, reps: "3", rest: 180, log: "reps",
        side: "pull", emphasis: true, power: true,
        gate: { of: "pullups", min: 6,
          why: "Six strict reps is the point where the catch stops being the hardest part of the rep. Below it, the eccentric shock outruns what your elbows can absorb.",
          fallback: { name: "Explosive pull-ups — intent", reps: "3", sets: 5,
            notes: "Same pull-up, maximum concentric speed, chest to bar. No release. This is what you do until the gate opens." } },
        notes: "Pull hard enough that your hands can leave the bar for an instant at the top. Tap the bar, then re-grip. Land into a bent elbow, never a straight one.",
        byWeek: { 5: { reps: "2", notes: "Two reps a set while you learn the catch." }, 6: { reps: "3" }, 7: { sets: 5, reps: "3" }, 8: { sets: 3, reps: "3" } } },
      { id: "plyopush", name: "Clap push-ups", sets: 4, reps: "5", rest: 120, log: "reps",
        side: "push", power: true,
        notes: "Your push side is well ahead of your pull side — this is the one place you can be ambitious.",
        byWeek: { 8: { sets: 3, reps: "5" } } },

      { id: "pistol", name: "Assisted pistol squat", sets: 3, reps: "8", rest: 90, log: "reps",
        side: "legs", unilateral: true, unilateralLabel: "leg",
        byWeek: { 5: { reps: "8" }, 6: { reps: "10" }, 7: { reps: "10", notes: "Try one unassisted rep per set before the assisted work." }, 8: { sets: 2, reps: "10" } } },
      { id: "archer", name: "Archer push-ups", sets: 3, reps: "8", rest: 90, log: "reps",
        side: "push", emphasis: true, unilateral: true },

      { id: "nordic", name: "Nordic curl negatives", sets: 3, reps: "5", rest: 120, log: "reps",
        side: "legs", pair: "D",
        notes: "Full range by the end of this block — lower all the way before your hands take over.",
        byWeek: { 5: { reps: "5" }, 6: { reps: "6" }, 7: { sets: 4, reps: "5", notes: "Full range now. Quality over reps." }, 8: { sets: 3, reps: "5" } } },
      { id: "t2b", name: "Toes-to-bar", sets: 3, reps: "10", rest: 60, log: "reps",
        side: "core", pair: "D" },
    ],
  },
};

const b3 = {
  strength: {
    day: "Mon", label: "STRENGTH", side: "mixed", subtitle: "weighted pull · squat",
    note: "The weighted pull-up gate is ten strict reps. Not eight, not \"nearly ten\" — the whole reason the first version of this program was dangerous is that it loaded a pull-up max that wasn't there yet.",
    exercises: [
      { id: "flever", name: "Advanced tuck front lever", sets: 5, reps: "10–15s", rest: 60, log: "sec",
        side: "pull", skill: true },

      { id: "pullup", name: "Weighted pull-ups", sets: 5, reps: "5", rest: 150, log: "load",
        side: "pull", pair: "A", emphasis: true, equipment: "gym",
        gate: { of: "pullups", min: 10,
          why: "Ten strict bodyweight reps with two still in reserve. Adding weight below that buys you elbow tendinopathy, not strength.",
          fallback: { name: "Pull-ups — cluster sets, bodyweight", sets: 5, log: "reps",
            rel: rel("pullups", 0.65, 4, 12),
            notes: "Keep building the base. The gate opens on your next test, not on a date." } },
        notes: "Start at +2.5 kg and add 2.5 kg at a time. Belt, not backpack.",
        byWeek: { 9: { load: 2.5 }, 10: { load: 2.5 }, 11: { load: 5 }, 12: { sets: 4, load: 5 } } },
      { id: "dips", name: "Weighted dips", sets: 5, reps: "5", rest: 150, log: "load",
        side: "push", pair: "A", emphasis: true, equipment: "gym",
        notes: "Continue adding 2.5 kg every two weeks.",
        byWeek: { 9: { load: 7.5 }, 10: { load: 7.5 }, 11: { load: 10 }, 12: { sets: 4, load: 10 } } },

      { id: "backoff", name: "Back-off set, bodyweight", sets: 1, reps: "AMRAP minus 2", rest: 120, log: "reps",
        side: "pull",
        notes: "One set, stopping two reps short of failure. This is your informal week-to-week progress read." },

      { id: "squat", name: "Barbell back squat", sets: 4, reps: "6", rest: 150, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        byWeek: { 12: { sets: 2, reps: "6" } } },
      { id: "t2b", name: "Weighted toes-to-bar", sets: 3, reps: "8", rest: 60, log: "load",
        side: "core", pair: "B" },

      { id: "cablerow", name: "Seated cable row", sets: 4, reps: "8", rest: 90, log: "load",
        side: "pull", pair: "C", equipment: "gym" },
      { id: "pseudo", name: "Pseudo-planche push-ups", sets: 3, reps: "10", rest: 90, log: "reps",
        side: "push", pair: "C" },

      { id: "facepull", name: "Cable face pulls", sets: 3, reps: "15", rest: 60, log: "load",
        side: "pull", pair: "D", equipment: "gym" },
      { id: "calf", name: "Standing calf raise, loaded", sets: 3, rest: 60, log: "load",
        side: "legs", pair: "D", equipment: "gym", rel: rel("calf", 0.7, 10, 25) },
    ],
  },

  volume: {
    day: "Tue", label: "VOLUME", side: "mixed", subtitle: "hypertrophy · hinge",
    exercises: [
      { id: "hswall", name: "Freestanding handstand", sets: 4, reps: "30s", rest: 60, log: "sec",
        side: "push", skill: true },

      { id: "pulldown", name: "Lat pulldown, heavy", sets: 4, reps: "8", rest: 90, log: "load",
        side: "pull", pair: "A", equipment: "gym", emphasis: true },
      { id: "pike", name: "Pike push-ups or wall HSPU", sets: 4, reps: "8", rest: 120, log: "reps",
        side: "push", pair: "A",
        notes: "Switch to wall handstand push-ups if the pike version is comfortable at 10." },

      { id: "rdl", name: "Barbell Romanian deadlift", sets: 4, reps: "8", rest: 120, log: "load",
        side: "legs", pair: "B", equipment: "gym",
        byWeek: { 12: { sets: 2, reps: "8" } } },
      { id: "dipseasy", name: "Dips, easy volume", sets: 3, rest: 90, log: "reps",
        side: "push", pair: "B", rel: rel("dips", 0.45, 6, 14) },

      { id: "bulgarian", name: "Deficit Bulgarian split squats", sets: 3, reps: "10", rest: 90, log: "load",
        side: "legs", unilateral: true, unilateralLabel: "leg", equipment: "gym", emphasis: true,
        notes: "Front foot on a low step. The deficit buys range once the dumbbells stop getting heavier.",
        byWeek: { 9: { reps: "10", load: 12 }, 10: { reps: "12", load: 12 }, 11: { reps: "10", load: 16 }, 12: { sets: 2, reps: "10", load: 16 } } },
      { id: "sacablerow", name: "Single-arm cable row", sets: 3, reps: "10", rest: 60, log: "load",
        side: "pull", emphasis: true, unilateral: true, extraWeakSet: true, equipment: "gym" },

      { id: "curls", name: "Dumbbell curls", sets: 3, reps: "10", rest: 60, log: "load",
        side: "pull", equipment: "gym" },
    ],
  },

  density: {
    day: "Thu", label: "DENSITY", side: "mixed", subtitle: "EMOM · unilateral legs",
    exercises: [
      { id: "lsit", name: "Full L-sit", sets: 4, reps: "max hold", rest: 60, log: "sec",
        side: "core", skill: true },


      { id: "emom", name: "Alternating EMOM — pull / push", kind: "emom", minutes: 12, rest: 0,
        side: "pull", emphasis: true, altName: "Dips",
        rel: rel("pullups", 0.5, 3, 9, "repsPerMinute"),
        altRel: rel("dips", 0.35, 4, 12, "altReps"),
        byWeek: {
          9: { minutes: 12 },
          10: { minutes: 12 },
          11: { minutes: 14, rel: rel("pullups", 0.55, 4, 10, "repsPerMinute") },
          12: { minutes: 10, rel: rel("pullups", 0.5, 3, 9, "repsPerMinute") },
        } },

      { id: "legpress", name: "Leg press", sets: 4, reps: "10", rest: 90, log: "load",
        side: "legs", pair: "B", equipment: "gym" },
      { id: "widerow", name: "Wide-grip rows, weighted", sets: 4, reps: "10", rest: 90, log: "load",
        side: "pull", pair: "B", equipment: "gym" },

      { id: "hamcurl", name: "Seated hamstring curl", sets: 3, reps: "10", rest: 60, log: "load",
        side: "legs", pair: "C", equipment: "gym" },
      { id: "diamond", name: "Diamond push-ups", sets: 3, rest: 90, log: "reps",
        side: "push", pair: "C", rel: rel("pushups", 0.45, 6, 25) },

      { id: "deadhang", name: "Dead hang", sets: 3, reps: "max", rest: 60, log: "sec",
        side: "pull" },
    ],
  },

  power: {
    day: "Fri", label: "POWER", side: "mixed", subtitle: "explosive · skill",
    note: "The clap pull-up is the block 3 target, gated at eight strict reps. It is the one exercise in this program where a bad rep has a landing attached to it, so the standard is higher than usual: if any rep in a set lands soft or off balance, that exercise is finished for the day.",
    exercises: [
      { id: "hstaps", name: "Freestanding handstand + shoulder taps", sets: 4, reps: "30s", rest: 60, log: "sec",
        side: "push", skill: true },

      { id: "explosive", name: "Clap pull-ups", sets: 5, reps: "3", rest: 180, log: "reps",
        side: "pull", emphasis: true, power: true,
        gate: { of: "pullups", min: 8,
          why: "Eight strict reps. The clap adds a genuine drop onto a straight-ish arm; below eight you don't have the reserve to decelerate it.",
          fallback: { name: "Hands-off pull-ups", sets: 4, reps: "3",
            notes: "Tap the bar and re-grip without the clap. Keep this until a test session says otherwise." } },
        notes: "Pull to sternum height, release, clap, re-grip. Land into a bent elbow. Stop the exercise the moment a rep lands soft.",
        byWeek: { 9: { sets: 4, reps: "2", notes: "Two reps a set. Learn the catch before you chase volume." }, 10: { sets: 5, reps: "3" }, 11: { sets: 5, reps: "3" }, 12: { sets: 3, reps: "3" } } },
      { id: "plyopush", name: "Clap push-ups, elevated feet", sets: 4, reps: "6", rest: 120, log: "reps",
        side: "push", power: true,
        byWeek: { 12: { sets: 3, reps: "6" } } },

      { id: "pistol", name: "Pistol squat", sets: 3, reps: "6", rest: 120, log: "reps",
        side: "legs", unilateral: true, unilateralLabel: "leg", emphasis: true,
        notes: "Unassisted if you have it. Assisted reps after, to finish the set.",
        byWeek: { 9: { reps: "4" }, 10: { reps: "5" }, 11: { reps: "6" }, 12: { sets: 2, reps: "6" } } },
      { id: "archer", name: "Archer push-ups", sets: 3, reps: "10", rest: 90, log: "reps",
        side: "push", emphasis: true, unilateral: true },

      { id: "nordic", name: "Nordic curl negatives", sets: 4, reps: "5", rest: 120, log: "reps",
        side: "legs", pair: "D",
        byWeek: { 9: { sets: 4, reps: "5" }, 10: { sets: 4, reps: "6" }, 11: { sets: 4, reps: "6", notes: "Five seconds down on every rep." }, 12: { sets: 3, reps: "6" } } },
      { id: "t2b", name: "Toes-to-bar", sets: 3, reps: "12", rest: 60, log: "reps",
        side: "core", pair: "D" },
    ],
  },
};

export const SESSIONS = { 1: b1, 2: b2, 3: b3 };

export const GTG = "If — and only if — you have a bar at home: do 2 pull-ups (half your max, never more) several times a day, on non-training days too. Never hard, never to failure. This is the single fastest method for adding reps at your level. Skip it entirely if the only bar you have is at the gym.";

export const NUTRITION = "At 67 kg, roughly 110–145 g of protein a day. Skills and size both want a modest calorie surplus — you're light, and gaining a couple of kilos of muscle will help your physique far more than it hurts your pull-ups. Sleep seven to nine hours; it does more for your numbers than any extra set.";

export function blockForWeek(week) {
  return week <= 4 ? 1 : week <= 8 ? 2 : 3;
}

export function isTestWeek(week) {
  return week === 0 || CONSOLIDATION_WEEKS.includes(week);
}

// Week 0 is the calibration battery. Weeks 4, 8 and 12 replace Friday's power
// session with a retest — consolidation week, so you arrive fresh.
export function getSession(week, sessionKey) {
  if (week === 0) return CALIBRATION;
  if (CONSOLIDATION_WEEKS.includes(week) && sessionKey === "power") {
    return week === 12 ? RETEST_FULL : RETEST_SHORT;
  }
  const block = SESSIONS[blockForWeek(week)];
  return (block && block[sessionKey]) || null;
}

// Resolution order, and it matters: byWeek override → gate → rel → consolidation.
export function resolveExercise(ex, week, maxes) {
  const m = { ...ATHLETE.baseline, ...(maxes || {}) };
  const override = ex.byWeek && ex.byWeek[week];
  const out = { ...ex, ...(override || {}) };
  delete out.byWeek;

  if (out.gate) {
    const have = Number(m[out.gate.of]) || 0;
    out.gateHave = have;
    if (have < out.gate.min) {
      out.locked = true;
      out.lockedName = out.name;
      Object.assign(out, out.gate.fallback);
    }
  }

  if (out.rel) {
    out[out.rel.field || "reps"] = applyRel(out.rel, m);
    out.relResolved = { pct: out.rel.pct, label: REL_LABELS[out.rel.of] || out.rel.of };
  }
  if (out.altRel) out[out.altRel.field || "altReps"] = applyRel(out.altRel, m);

  if (CONSOLIDATION_WEEKS.includes(week) && !override) {
    if (out.kind === "ladder") out.rounds = Math.max(1, out.rounds - 1);
    else if (out.kind !== "emom" && out.kind !== "test") out.sets = Math.max(1, out.sets - 1);
  }
  return out;
}

function applyRel(r, maxes) {
  const base = Number(maxes[r.of]) || 0;
  let v = r.round === "floor" ? Math.floor(base * r.pct) : Math.round(base * r.pct);
  if (r.min != null) v = Math.max(r.min, v);
  if (r.max != null) v = Math.min(r.max, v);
  return (r.field || "reps") === "reps" ? String(v) : v;
}

// ─── Duration estimate ───────────────────────────────────────────────────────
// Rough, and deliberately so: the prescribed rests taken in full, a controlled
// tempo on every rep, and time to walk between stations. Paired exercises
// share their rest, which is most of why v3 sessions are shorter than v2's.

const SEC_PER_REP = 3;
const TRANSITION_SEC = 45;
const WARMUP_SEC = 8 * 60;
const SWITCH_REST = 0.6;   // switching sides needs less rest than a full set
const PAIR_REST = 75;

function repRange(reps) {
  const m = String(reps || "").match(/(\d+)\s*[–-]?\s*(\d+)?/);
  if (!m) return null;
  return m[2] ? (Number(m[1]) + Number(m[2])) / 2 : Number(m[1]);
}

function workSeconds(ex) {
  const reps = String(ex.reps || "");
  if (ex.kind === "test") return 60;
  if (ex.log === "sec") {
    if (/max/i.test(reps)) return 30;
    return (repRange(reps) ?? 20) * (/each/i.test(reps) ? 2 : 1);
  }
  if (/max|amrap/i.test(reps)) return 8 * SEC_PER_REP;
  return (repRange(reps) ?? 8) * SEC_PER_REP;
}

function setCount(ex) {
  return (ex.sets || 1) * (ex.unilateral ? 2 : 1) + (ex.extraWeakSet ? 1 : 0);
}

function soloSeconds(ex) {
  if (ex.kind === "emom") return ex.minutes * 60;
  if (ex.kind === "ladder") {
    const round = ex.rungs.reduce((s, n) => s + n * SEC_PER_REP, 0) + ex.rungRest * (ex.rungs.length - 1);
    return ex.rounds * round + ex.rest * (ex.rounds - 1);
  }
  const sets = setCount(ex);
  const rest = ex.unilateral ? ex.rest * SWITCH_REST : ex.rest;
  return sets * workSeconds(ex) + (rest || 0) * Math.max(0, sets - 1);
}

// A pair is walked as one unit: alternate, PAIR_REST after each movement.
function pairSeconds(list) {
  const rounds = Math.max(...list.map(setCount));
  const perRound = list.reduce((s, ex) => s + workSeconds(ex) + PAIR_REST, 0);
  return rounds * perRound - PAIR_REST;
}

export function estimateSessionMinutes(session, week, maxes) {
  if (!session) return null;
  const resolved = session.exercises.map((raw) => resolveExercise(raw, week, maxes));
  const pairs = new Map();
  let total = session.test ? 0 : WARMUP_SEC;

  resolved.forEach((ex) => {
    if (ex.pair) {
      if (!pairs.has(ex.pair)) pairs.set(ex.pair, []);
      pairs.get(ex.pair).push(ex);
    } else if (ex.kind === "test") {
      total += workSeconds(ex) + (ex.unilateral ? workSeconds(ex) : 0) + (ex.rest || 0);
    } else {
      total += soloSeconds(ex) + TRANSITION_SEC;
    }
  });
  pairs.forEach((list) => {
    total += (list.length > 1 ? pairSeconds(list) : soloSeconds(list[0])) + TRANSITION_SEC;
  });

  return Math.round(total / 60 / 5) * 5;
}
