// The Bridge Program v2 — program data.
// Everything the UI renders comes from this file. app.js holds no program content.
// Source of truth: 12-week-calisthenics-program.md

export const ATHLETE = {
  age: 29,
  weightKg: 67,
  trainingAge: "~1 month",
  baseline: { pullups: 4, dips: 13.5, pushups: 20 },
  baselineLabel: { pullups: "4", dips: "12–15", pushups: "18–22" },
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
  { day: "Mon", short: "MON", session: "pullA", label: "PULL A", side: "pull", subtitle: "quality / strength" },
  { day: "Tue", short: "TUE", session: "pushA", label: "PUSH A", side: "push", subtitle: "dips + legs" },
  { day: "Wed", short: "WED", session: null, label: "REST", side: "rest", subtitle: "optional: 10 min handstand + mobility" },
  { day: "Thu", short: "THU", session: "pullB", label: "PULL B", side: "pull", subtitle: "volume / density" },
  { day: "Fri", short: "FRI", session: "pushB", label: "PUSH B", side: "push", subtitle: "press + legs" },
  { day: "Sat", short: "SAT", session: null, label: "REST", side: "rest", subtitle: "" },
  { day: "Sun", short: "SUN", session: null, label: "REST", side: "rest", subtitle: "" },
];

export const BLOCKS = [
  {
    id: 1, weeks: [1, 2, 3, 4], title: "Close the gap",
    expect: "Baseline: 4 strict pull-ups.",
    intro: "Nearly all new volume goes to pull. Push work stays where it is. Every set sits at 50–75% of your max — that is not undertraining, it is the mechanism.",
  },
  {
    id: 2, weeks: [5, 6, 7, 8], title: "Build volume",
    expect: "Expect at week 5: 6–7 strict pull-ups.",
    intro: "Pull volume goes up through EMOM density work. This is where you add load — to the push side only. Your dips are ready for it even though your pull-ups aren't.",
  },
  {
    id: 3, weeks: [9, 10, 11, 12], title: "Load the pull",
    expect: "Expect at week 9: 9–10 strict pull-ups.",
    intro: "The pull side is finally ready for weight. The gate: 5 × 5 strict bodyweight with two reps still in reserve on the last set. Not before.",
  },
];

export const CONSOLIDATION_WEEKS = [4, 8, 12];

export const TIMELINE = [
  { milestone: "7 strict pull-ups", original: "Week 4", real: "Week 5–6" },
  { milestone: "10 strict pull-ups", original: "Week 8", real: "Week 9–10" },
  { milestone: "12–13 strict pull-ups", original: "Week 12", real: "Week 13–15" },
  { milestone: "First weighted pull-up", original: "Week 6", real: "Week 10+ — gated at 10 strict" },
  { milestone: "Muscle-up", original: "Week 12", real: "Month 6–8 — dips ready, pull isn't" },
];

export const ASYMMETRY_TESTS = [
  { id: "hang", name: "Single-arm dead hang", unit: "seconds" },
  { id: "bandRow", name: "Single-arm band row", unit: "reps, same band" },
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
  "Rising resting heart rate, worsening sleep, dropping motivation — that's accumulated fatigue; take a light week",
];

export const RULES = [
  { title: "Stay short of failure", body: "Almost every set here sits at 50–75% of your max. That's not undertraining — it's the mechanism. Test true maxes every 4 weeks, never weekly." },
  { title: "Log everything", body: "At your stage progress is 1–2 reps a month. Invisible without a written record, and it feels like standing still. It isn't." },
  { title: "Weaker side first, stronger side matches", body: "The whole asymmetry fix is that one habit, applied for months." },
];

// ─── Sessions ────────────────────────────────────────────────────────────────
// log: "reps" | "sec" | "load" (load shows kg + reps)
// kind: "sets" (default) | "ladder" | "emom"
// byWeek: per-week override, merged over the base

const b1 = {
  pullA: {
    day: "Mon", label: "PULL A", side: "pull", subtitle: "quality / strength",
    exercises: [
      { id: "flever", name: "Tuck front lever hold", sets: 4, reps: "10–15s", rest: 60, log: "sec",
        notes: "Hollow holds instead if your hollow is under 30s" },
      { id: "pullup", name: "Pull-ups — cluster sets", sets: 6, reps: "2", rest: 90, log: "reps", emphasis: true,
        notes: "Every rep crisp. This should feel easy. It's meant to.",
        byWeek: {
          1: { sets: 6, reps: "2" },
          2: { sets: 6, reps: "2", notes: "Every rep crisp — plus a 3 second negative on every rep." },
          3: { sets: 5, reps: "3" },
          4: { sets: 5, reps: "3", notes: "Consolidation week. Test your true max on Friday." },
        } },
      { id: "bandpull", name: "Band-assisted pull-ups", sets: 3, reps: "6", rest: 90, log: "reps",
        notes: "Light band. Full range, controlled" },
      { id: "ausrow", name: "Australian rows, feet elevated", sets: 4, reps: "10–12", rest: 90, log: "reps",
        notes: "1s pause at the top, chest to bar" },
      { id: "sabandrow", name: "Single-arm band row", sets: 3, reps: "10", rest: 60, log: "reps",
        emphasis: true, unilateral: true },
      { id: "facepull", name: "Band face pulls", sets: 3, reps: "15", rest: 60, log: "reps",
        notes: "Antidote to your dip volume" },
      { id: "chinneg", name: "Chin-up negatives", sets: 3, reps: "3", rest: 90, log: "reps",
        notes: "5 seconds down, every rep" },
      { id: "kneeraise", name: "Hanging knee raises", sets: 3, reps: "10", rest: 60, log: "reps" },
    ],
  },
  pushA: {
    day: "Tue", label: "PUSH A", side: "push", subtitle: "dips + legs",
    note: "Dip volume here is lower than your current 5×8. That's deliberate — you're adding a lot of pull work and something has to give a little. Your dips will not go backwards on this.",
    exercises: [
      { id: "hswall", name: "Chest-to-wall handstand", sets: 5, reps: "20–30s", rest: 60, log: "sec",
        notes: "Belly to wall, ribs down" },
      { id: "dips", name: "Dips", sets: 4, reps: "8", rest: 120, log: "reps",
        notes: "Stay upright-ish, don't sink past 90°" },
      { id: "bulgarian", name: "Bulgarian split squats", sets: 3, reps: "10", rest: 90, log: "reps",
        unilateral: true, unilateralLabel: "leg", derived: true,
        notes: "Bodyweight this block. Add reps before you add load.",
        byWeek: {
          1: { reps: "10" },
          2: { reps: "12" },
          3: { reps: "15" },
          4: { sets: 2, reps: "15", notes: "Consolidation week — one set fewer." },
        } },
      { id: "slrdl", name: "Single-leg Romanian deadlift", sets: 3, reps: "8", rest: 90, log: "reps",
        unilateral: true, unilateralLabel: "leg", derived: true,
        notes: "Replaces the band RDL. Bands give almost no tension at the stretched position, which is exactly where hamstrings grow.",
        byWeek: {
          1: { reps: "8", notes: "Balance is the limiter this week, not the hamstring. Touch a wall if you need to." },
          2: { reps: "10" },
          3: { reps: "12" },
          4: { sets: 2, reps: "12" },
        } },
      { id: "archer", name: "Archer push-ups", sets: 3, reps: "6", rest: 90, log: "reps",
        emphasis: true, unilateral: true },
      { id: "lsit", name: "L-sit progression", sets: 4, reps: "max hold", rest: 60, log: "sec",
        notes: "Foot-supported → tuck → one leg" },
    ],
  },
  pullB: {
    day: "Thu", label: "PULL B", side: "pull", subtitle: "volume / density",
    note: "Volume day. Chin-ups (supinated) because they're 2–3 reps stronger for you — more quality reps banked.",
    exercises: [
      { id: "scappull", name: "Scapular pulls + arch hangs", sets: 3, reps: "8", rest: 45, log: "reps" },
      { id: "ladder", name: "Chin-up ladders", kind: "ladder", rungs: [3, 2, 1], rounds: 4, rest: 120, rungRest: 45,
        emphasis: true, notes: "None near failure. Rest 45s between rungs, 2 min between ladders.",
        byWeek: {
          1: { rungs: [3, 2, 1], rounds: 4 },
          2: { rungs: [3, 3, 2], rounds: 4 },
          3: { rungs: [4, 3, 2], rounds: 4 },
          4: { rungs: [4, 3, 2], rounds: 3, notes: "Consolidation week — one ladder fewer." },
        } },
      { id: "widerow", name: "Wide-grip Australian rows", sets: 4, reps: "12", rest: 90, log: "reps" },
      { id: "saausrow", name: "Single-arm Australian row", sets: 3, reps: "8", rest: 60, log: "reps",
        emphasis: true, unilateral: true, extraWeakSet: true },
      { id: "pullapart", name: "Band pull-aparts", sets: 3, reps: "20", rest: 45, log: "reps" },
      { id: "deadhang", name: "Dead hang", sets: 3, reps: "max", rest: 60, log: "sec",
        notes: "Also your grip and asymmetry check" },
    ],
  },
  pushB: {
    day: "Fri", label: "PUSH B", side: "push", subtitle: "press + legs",
    exercises: [
      { id: "hstaps", name: "Wall handstand + shoulder taps", sets: 4, reps: "20s / 6 taps", rest: 60, log: "sec" },
      { id: "pike", name: "Pike push-ups, feet elevated", sets: 4, reps: "8", rest: 120, log: "reps" },
      { id: "squat", name: "Squat, tempo then loaded", sets: 3, reps: "12", rest: 90, log: "load", derived: true,
        notes: "3 seconds down on every rep. Backpack for load once 15 bodyweight reps are easy.",
        byWeek: {
          1: { reps: "12", notes: "Bodyweight, 3 seconds down. Knees track over toes." },
          2: { reps: "15", notes: "Bodyweight, 3 seconds down." },
          3: { reps: "12", load: 5 },
          4: { sets: 2, reps: "12", load: 5 },
        } },
      { id: "nordic", name: "Nordic curl negatives", sets: 3, reps: "3", rest: 120, log: "reps", derived: true,
        notes: "Anchor your heels under something solid. Lower as slowly as you can, catch yourself with your hands, push back up.",
        byWeek: {
          1: { reps: "3", notes: "Short range only. Hands ready to catch from the start." },
          2: { reps: "4" },
          3: { reps: "5" },
          4: { sets: 2, reps: "5" },
        } },
      { id: "calf", name: "Single-leg calf raise", sets: 3, reps: "15", rest: 60, log: "reps",
        unilateral: true, unilateralLabel: "leg", derived: true,
        notes: "Off a step for full range. Pause one second at the bottom.",
        byWeek: { 1: { reps: "15" }, 2: { reps: "18" }, 3: { reps: "20" }, 4: { sets: 2, reps: "20" } } },
      { id: "diamond", name: "Diamond push-ups", sets: 3, reps: "10", rest: 90, log: "reps" },
      { id: "dipseasy", name: "Dips, easy volume", sets: 3, reps: "6", rest: 90, log: "reps" },
      { id: "plank", name: "Plank + side plank", sets: 3, reps: "45s / 30s each", rest: 45, log: "sec" },
    ],
  },
};

const b2 = {
  pullA: {
    day: "Mon", label: "PULL A", side: "pull", subtitle: "quality / strength", derived: true,
    exercises: [
      { id: "flever", name: "Advanced tuck front lever", sets: 4, reps: "8–12s", rest: 60, log: "sec" },
      { id: "pullup", name: "Pull-ups", sets: 5, reps: "3", rest: 120, log: "reps", emphasis: true,
        notes: "Still short of failure. Two reps in reserve on every set.",
        byWeek: { 5: { reps: "3" }, 6: { reps: "3" }, 7: { reps: "4" }, 8: { reps: "4", notes: "Consolidation week. Retest all maxes Friday." } } },
      { id: "bandpull", name: "Band-assisted pull-ups", sets: 3, reps: "6", rest: 90, log: "reps",
        notes: "Lighter band than block 1. Drop the band entirely when 6 feels easy." },
      { id: "ausrow", name: "Australian rows — weighted or archer", sets: 4, reps: "8–10", rest: 90, log: "load",
        notes: "Backpack for weight, or switch to the archer variation" },
      { id: "sabandrow", name: "Single-arm band row", sets: 3, reps: "10", rest: 60, log: "reps",
        emphasis: true, unilateral: true },
      { id: "facepull", name: "Band face pulls", sets: 3, reps: "15", rest: 60, log: "reps" },
      { id: "chinneg", name: "Chin-up negatives", sets: 3, reps: "3", rest: 90, log: "reps", notes: "5 seconds down" },
      { id: "kneeraise", name: "Hanging leg raises", sets: 3, reps: "10", rest: 60, log: "reps" },
    ],
  },
  pushA: {
    day: "Tue", label: "PUSH A", side: "push", subtitle: "dips + legs", derived: true,
    note: "This is where load enters the program — on the push side only.",
    exercises: [
      { id: "hswall", name: "Freestanding handstand attempts", sets: 5, reps: "30s", rest: 60, log: "sec",
        notes: "Bail sideways — turn and step out, never fold backwards" },
      { id: "dips", name: "Weighted dips", sets: 4, reps: "6", rest: 120, log: "load", emphasis: true,
        notes: "Add 2.5 kg every two weeks.",
        byWeek: { 5: { load: 2.5 }, 6: { load: 2.5 }, 7: { load: 5 }, 8: { load: 5, notes: "Consolidation week. Retest Friday." } } },
      { id: "bulgarian", name: "Bulgarian split squats, loaded", sets: 3, reps: "10", rest: 90, log: "load",
        unilateral: true, unilateralLabel: "leg",
        notes: "Backpack. Same rule as the dips — add 2.5–5 kg every two weeks, not every week.",
        byWeek: {
          5: { reps: "10", load: 5 },
          6: { reps: "12", load: 5 },
          7: { reps: "10", load: 10 },
          8: { sets: 2, reps: "10", load: 10, notes: "Consolidation week." },
        } },
      { id: "slrdl", name: "Single-leg Romanian deadlift, loaded", sets: 3, reps: "10", rest: 90, log: "load",
        unilateral: true, unilateralLabel: "leg",
        byWeek: {
          5: { reps: "10", load: 5 },
          6: { reps: "12", load: 5 },
          7: { reps: "10", load: 10 },
          8: { sets: 2, reps: "10", load: 10 },
        } },
      { id: "archer", name: "Archer push-ups", sets: 3, reps: "8", rest: 90, log: "reps",
        emphasis: true, unilateral: true },
      { id: "lsit", name: "L-sit progression", sets: 4, reps: "max hold", rest: 60, log: "sec", notes: "Tuck → one leg" },
    ],
  },
  pullB: {
    day: "Thu", label: "PULL B", side: "pull", subtitle: "EMOM density", derived: true,
    note: "Density day. At the top of each minute, do the reps, then rest the remainder of the minute. If you can't finish the final minute at the prescribed reps, you started too high — drop one and rebuild.",
    exercises: [
      { id: "scappull", name: "Scapular pulls + arch hangs", sets: 3, reps: "8", rest: 45, log: "reps" },
      { id: "emom", name: "Pull-up EMOM", kind: "emom", minutes: 10, repsPerMinute: 2, rest: 0, emphasis: true,
        byWeek: {
          5: { minutes: 10, repsPerMinute: 2 },
          6: { minutes: 12, repsPerMinute: 2 },
          7: { minutes: 10, repsPerMinute: 3 },
          8: { minutes: 12, repsPerMinute: 3 },
        } },
      { id: "widerow", name: "Wide-grip Australian rows", sets: 4, reps: "12", rest: 90, log: "reps" },
      { id: "saausrow", name: "Single-arm Australian row", sets: 3, reps: "8", rest: 60, log: "reps",
        emphasis: true, unilateral: true, extraWeakSet: true },
      { id: "pullapart", name: "Band pull-aparts", sets: 3, reps: "20", rest: 45, log: "reps" },
      { id: "deadhang", name: "Dead hang", sets: 3, reps: "max", rest: 60, log: "sec" },
    ],
  },
  pushB: {
    day: "Fri", label: "PUSH B", side: "push", subtitle: "press + legs", derived: true,
    exercises: [
      { id: "hstaps", name: "Freestanding handstand + wall taps", sets: 4, reps: "30s", rest: 60, log: "sec" },
      { id: "pike", name: "Pike push-ups, feet elevated", sets: 4, reps: "10", rest: 120, log: "reps" },
      { id: "squat", name: "Squat, loaded", sets: 3, reps: "12", rest: 90, log: "load",
        notes: "Keep the 3-second descent as the load goes up.",
        byWeek: {
          5: { reps: "12", load: 10 },
          6: { reps: "15", load: 10 },
          7: { reps: "12", load: 15 },
          8: { sets: 2, reps: "12", load: 15 },
        } },
      { id: "nordic", name: "Nordic curl negatives", sets: 3, reps: "5", rest: 120, log: "reps",
        notes: "Full range by the end of this block — lower all the way before your hands take over.",
        byWeek: {
          5: { reps: "5" },
          6: { reps: "6" },
          7: { sets: 4, reps: "5", notes: "Full range now. Quality over reps." },
          8: { sets: 3, reps: "5" },
        } },
      { id: "calf", name: "Single-leg calf raise, off a step", sets: 3, reps: "15", rest: 60, log: "reps",
        unilateral: true, unilateralLabel: "leg", notes: "Full stretch at the bottom, one-second pause.",
        byWeek: { 5: { reps: "15" }, 6: { reps: "18" }, 7: { reps: "20" }, 8: { sets: 2, reps: "20" } } },
      { id: "pseudo", name: "Decline or pseudo-planche push-ups", sets: 3, reps: "8", rest: 90, log: "reps" },
      { id: "dipseasy", name: "Dips, easy volume", sets: 3, reps: "8", rest: 90, log: "reps", notes: "Bodyweight" },
      { id: "plank", name: "Plank + side plank", sets: 3, reps: "60s / 40s each", rest: 45, log: "sec" },
    ],
  },
};

const b3 = {
  pullA: {
    day: "Mon", label: "PULL A", side: "pull", subtitle: "quality / strength",
    note: "The weighted pull-up gate: 5 × 5 strict bodyweight with two reps still in reserve on the last set. Not before. When you clear it, start at +2.5 kg and add 2.5 kg at a time.",
    exercises: [
      { id: "flever", name: "Advanced tuck front lever", sets: 5, reps: "10–15s", rest: 60, log: "sec" },
      { id: "pullup", name: "Pull-ups — weighted if the gate is cleared", sets: 5, reps: "5", rest: 150,
        log: "load", emphasis: true, gate: true },
      { id: "backoff", name: "Back-off set, bodyweight", sets: 1, reps: "AMRAP minus 2", rest: 120, log: "reps" },
      { id: "ausrow", name: "Archer or weighted rows", sets: 4, reps: "8", rest: 90, log: "load" },
      { id: "sabandrow", name: "Single-arm row", sets: 3, reps: "10", rest: 60, log: "reps",
        emphasis: true, unilateral: true, extraWeakSet: true },
      { id: "facepull", name: "Face pulls", sets: 3, reps: "15", rest: 60, log: "reps" },
      { id: "curls", name: "Curls", sets: 3, reps: "12", rest: 60, log: "load" },
      { id: "t2b", name: "Toes-to-bar", sets: 3, reps: "8", rest: 60, log: "reps" },
    ],
  },
  pushA: {
    day: "Tue", label: "PUSH A", side: "push", subtitle: "dips + legs", derived: true,
    exercises: [
      { id: "hswall", name: "Freestanding handstand", sets: 5, reps: "30s", rest: 60, log: "sec" },
      { id: "dips", name: "Weighted dips", sets: 5, reps: "5", rest: 150, log: "load", emphasis: true,
        notes: "Continue adding 2.5 kg every two weeks" },
      { id: "bulgarian", name: "Deficit Bulgarian split squats, loaded", sets: 3, reps: "10", rest: 90, log: "load",
        unilateral: true, unilateralLabel: "leg", emphasis: true,
        notes: "Front foot on a low step. The deficit buys you range once the backpack stops getting heavier.",
        byWeek: {
          9: { reps: "10", load: 10 },
          10: { reps: "12", load: 10 },
          11: { reps: "10", load: 15 },
          12: { sets: 2, reps: "10", load: 15, notes: "Consolidation week. Retest Friday." },
        } },
      { id: "slrdl", name: "Deficit single-leg Romanian deadlift", sets: 3, reps: "10", rest: 90, log: "load",
        unilateral: true, unilateralLabel: "leg",
        notes: "Stand on the step so the weight travels below your foot.",
        byWeek: {
          9: { reps: "10", load: 10 },
          10: { reps: "12", load: 10 },
          11: { reps: "10", load: 15 },
          12: { sets: 2, reps: "10", load: 15 },
        } },
      { id: "pseudo", name: "Pseudo-planche push-ups", sets: 3, reps: "8", rest: 90, log: "reps", emphasis: true },
      { id: "lsit", name: "Full L-sit", sets: 4, reps: "max hold", rest: 60, log: "sec" },
    ],
  },
  pullB: {
    day: "Thu", label: "PULL B", side: "pull", subtitle: "density + power", derived: true,
    exercises: [
      { id: "scappull", name: "Scapular pulls + arch hangs", sets: 3, reps: "8", rest: 45, log: "reps" },
      { id: "explosive", name: "Explosive chest-to-bar pull-ups", sets: 5, reps: "3", rest: 180, log: "reps",
        emphasis: true, notes: "Power work — fully rested between sets. Speed is the point, not fatigue." },
      { id: "emom", name: "Pull-up EMOM", kind: "emom", minutes: 12, repsPerMinute: 3, rest: 0, emphasis: true,
        byWeek: { 9: { repsPerMinute: 3 }, 10: { repsPerMinute: 3 }, 11: { repsPerMinute: 4 }, 12: { repsPerMinute: 4 } } },
      { id: "widerow", name: "Wide-grip rows, weighted", sets: 4, reps: "10", rest: 90, log: "load" },
      { id: "saausrow", name: "Single-arm Australian row", sets: 3, reps: "8", rest: 60, log: "reps",
        emphasis: true, unilateral: true, extraWeakSet: true },
      { id: "deadhang", name: "Dead hang", sets: 3, reps: "max", rest: 60, log: "sec" },
    ],
  },
  pushB: {
    day: "Fri", label: "PUSH B", side: "push", subtitle: "press + legs", derived: true,
    exercises: [
      { id: "hstaps", name: "Freestanding handstand + shoulder taps", sets: 4, reps: "30s", rest: 60, log: "sec" },
      { id: "pike", name: "Pike push-ups, feet elevated", sets: 4, reps: "10", rest: 120, log: "reps" },
      { id: "pistol", name: "Assisted pistol squat", sets: 3, reps: "6", rest: 120, log: "reps",
        unilateral: true, unilateralLabel: "leg", emphasis: true,
        notes: "Hold a post or a band for as much help as you need. Sit to a box first if the full depth isn't there — this is a skill as much as a strength lift.",
        byWeek: {
          9: { reps: "6", notes: "Box pistol, or hold a support with both hands. Depth before independence." },
          10: { reps: "8" },
          11: { reps: "10", notes: "Try one unassisted rep per set before the assisted work." },
          12: { sets: 2, reps: "10" },
        } },
      { id: "nordic", name: "Nordic curl negatives", sets: 4, reps: "5", rest: 120, log: "reps",
        byWeek: {
          9: { sets: 4, reps: "5" },
          10: { sets: 4, reps: "6" },
          11: { sets: 4, reps: "6", notes: "Five seconds down on every rep." },
          12: { sets: 3, reps: "6" },
        } },
      { id: "calf", name: "Single-leg calf raise, loaded", sets: 3, reps: "15", rest: 60, log: "load",
        unilateral: true, unilateralLabel: "leg",
        byWeek: { 9: { reps: "15", load: 10 }, 10: { reps: "18", load: 10 }, 11: { reps: "20", load: 10 }, 12: { sets: 2, reps: "20", load: 10 } } },
      { id: "pseudo", name: "Pseudo-planche push-ups", sets: 3, reps: "10", rest: 90, log: "reps" },
      { id: "dipseasy", name: "Dips, easy volume", sets: 3, reps: "8", rest: 90, log: "reps" },
      { id: "plank", name: "Plank + side plank", sets: 3, reps: "60s / 45s each", rest: 45, log: "sec" },
    ],
  },
};

export const SESSIONS = { 1: b1, 2: b2, 3: b3 };

export const GTG = "If — and only if — you have a bar at home: do 2 pull-ups (half your max, never more) several times a day, on non-training days too. Never hard, never to failure. This is the single fastest method for adding reps at your level. Skip it entirely if the only bar you have is at a park.";

export const NUTRITION = "At 67 kg, roughly 110–145 g of protein a day. Skills and size both want a modest calorie surplus — you're light, and gaining a couple of kilos of muscle will help your physique far more than it hurts your pull-ups. Sleep seven to nine hours; it does more for your numbers than any extra set.";

// ─── Duration estimate ───────────────────────────────────────────────────────
// Rough, and deliberately so: the prescribed rests taken in full, a controlled
// tempo on every rep, and time to walk between the bar and the floor. Most
// people run faster than this by cutting rests — which on this program defeats
// the point, since every set is meant to sit at 50–75% of max.

const SEC_PER_REP = 3;
const TRANSITION_SEC = 45;   // setup, walking, chalk, between exercises
const WARMUP_SEC = 8 * 60;
const SWITCH_REST = 0.6;     // switching sides needs less rest than a full set

function repRange(reps) {
  const m = String(reps || "").match(/(\d+)\s*[–-]?\s*(\d+)?/);
  if (!m) return null;
  return m[2] ? (Number(m[1]) + Number(m[2])) / 2 : Number(m[1]);
}

function workSeconds(ex) {
  const reps = String(ex.reps || "");
  if (ex.log === "sec") {
    if (/max/i.test(reps)) return 30;
    return (repRange(reps) ?? 20) * (/each/i.test(reps) ? 2 : 1);
  }
  if (/max|amrap/i.test(reps)) return 8 * SEC_PER_REP;
  return (repRange(reps) ?? 8) * SEC_PER_REP;
}

function exerciseSeconds(ex) {
  if (ex.kind === "emom") return ex.minutes * 60;
  if (ex.kind === "ladder") {
    const round = ex.rungs.reduce((s, n) => s + n * SEC_PER_REP, 0)
      + ex.rungRest * (ex.rungs.length - 1);
    return ex.rounds * round + ex.rest * (ex.rounds - 1);
  }
  const sets = ex.sets * (ex.unilateral ? 2 : 1) + (ex.extraWeakSet ? 1 : 0);
  const rest = ex.unilateral ? ex.rest * SWITCH_REST : ex.rest;
  return sets * workSeconds(ex) + rest * Math.max(0, sets - 1);
}

// Minutes for a whole session, warm-up included. Rounded to the nearest 5 —
// the estimate isn't precise enough to justify a sharper number.
export function estimateSessionMinutes(session, week) {
  if (!session) return null;
  const total = session.exercises.reduce(
    (sum, raw) => sum + exerciseSeconds(resolveExercise(raw, week)) + TRANSITION_SEC,
    WARMUP_SEC,
  );
  return Math.round(total / 60 / 5) * 5;
}

export function blockForWeek(week) {
  return week <= 4 ? 1 : week <= 8 ? 2 : 3;
}

export function getSession(week, sessionKey) {
  const block = SESSIONS[blockForWeek(week)];
  return (block && block[sessionKey]) || null;
}

// Merge base exercise with its per-week override, then apply the consolidation
// rule from the program: "Week 4 = consolidation. Drop one set everywhere."
export function resolveExercise(ex, week) {
  const override = ex.byWeek && ex.byWeek[week];
  const out = { ...ex, ...(override || {}) };
  delete out.byWeek;
  if (CONSOLIDATION_WEEKS.includes(week) && !override) {
    if (out.kind === "ladder") out.rounds = Math.max(1, out.rounds - 1);
    else if (out.kind !== "emom") out.sets = Math.max(1, out.sets - 1);
  }
  return out;
}
