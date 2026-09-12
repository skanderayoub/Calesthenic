import {
  ATHLETE, BALANCE_TARGET_RATIO, WARMUP, WARMUP_WARNING, SPLIT, BLOCKS,
  CONSOLIDATION_WEEKS, TIMELINE, ASYMMETRY_TESTS, ASYMMETRY_PROTOCOL,
  BACK_OFF, RULES, GTG, NUTRITION, PAIRING_NOTE, POWER_NOTE, HOME_ALTS,
  blockForWeek, getSession, resolveExercise, estimateSessionMinutes, isTestWeek,
} from "./program.js";

// ─── State ───────────────────────────────────────────────────────────────────

const KEY = "bridge.v2";
const SCHEMA = 2;

const blank = () => ({
  version: SCHEMA,
  week: 1,
  day: null,
  sessions: {},
  warmup: {},
  maxes: [],
  asymmetry: [],
});

let storageOK = true;
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA) return blank();
    return { ...blank(), ...parsed };
  } catch (err) {
    storageOK = false;
    return blank();
  }
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      if (storageOK) {
        storageOK = false;
        document.getElementById("storage-warning").hidden = false;
      }
    }
  }, 300);
}

// ─── State accessors ─────────────────────────────────────────────────────────

const sessionKey = (week, day) => `w${week}-${day}`;

function sessionRecord(week, day) {
  const k = sessionKey(week, day);
  if (!state.sessions[k]) state.sessions[k] = { ex: {}, note: "", finished: null };
  if (!state.sessions[k].ex) state.sessions[k].ex = {};
  return state.sessions[k];
}

function exRecord(week, day, exId) {
  const rec = sessionRecord(week, day);
  if (!rec.ex[exId]) rec.ex[exId] = {};
  return rec.ex[exId];
}

function warmupRecord(week, day) {
  const k = sessionKey(week, day);
  if (!state.warmup[k]) state.warmup[k] = WARMUP.map(() => false);
  return state.warmup[k];
}

function arr(obj, prop, len, fill) {
  if (!Array.isArray(obj[prop])) obj[prop] = [];
  while (obj[prop].length < len) obj[prop].push(typeof fill === "function" ? fill() : fill);
  return obj[prop];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fmtRest(sec) {
  if (!sec) return "";
  return sec >= 60 ? (sec % 60 === 0 ? `${sec / 60} min` : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`) : `${sec}s`;
}

function fmtClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}

const DAY_KEYS = SPLIT.filter((s) => s.session).map((s) => s.session);

function defaultDay() {
  const idx = (new Date().getDay() + 6) % 7;   // 0 = Mon
  const entry = SPLIT[idx];
  return entry && entry.session ? entry.session : DAY_KEYS[0];
}

// Saved state can hold a day key from an earlier version of the program
// ("pullA"). Without this the app would resolve no session and show a rest day
// for ever, with no way back.
function currentDay(week) {
  if (week === 0) return "calibration";
  const d = state.day;
  return DAY_KEYS.includes(d) ? d : defaultDay();
}

// ─── Rest timer ──────────────────────────────────────────────────────────────

const timer = { endsAt: 0, raf: null, label: "" };
const timerEl = $("#resttimer");
const timerClock = $("#resttimer-clock");
const timerLabel = $("#resttimer-label");

function startRest(seconds, label) {
  if (!seconds) return;
  timer.endsAt = Date.now() + seconds * 1000;
  timer.label = label || "Rest";
  timerEl.hidden = false;
  timerEl.dataset.done = "false";
  timerLabel.textContent = timer.label;
  tickRest();
}

function tickRest() {
  cancelAnimationFrame(timer.raf);
  const remaining = (timer.endsAt - Date.now()) / 1000;
  timerClock.textContent = fmtClock(remaining);
  if (remaining <= 0) {
    timerEl.dataset.done = "true";
    timerLabel.textContent = "Rest complete";
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
    setTimeout(() => { if (timer.endsAt <= Date.now()) stopRest(); }, 5000);
    return;
  }
  // Date.now()-based so the countdown stays correct while the screen is locked.
  timer.raf = requestAnimationFrame(tickRest);
}

function stopRest() {
  cancelAnimationFrame(timer.raf);
  timer.endsAt = 0;
  timerEl.hidden = true;
}

$("#resttimer-skip").addEventListener("click", stopRest);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && timer.endsAt > Date.now()) tickRest();
});

// ─── Session view ────────────────────────────────────────────────────────────

function renderRuler(week) {
  const cells = [`<button class="ruler__week ruler__week--test" type="button" data-week="0"
       data-done="${state.maxes.length > 0}" aria-current="${week === 0}" aria-label="Calibration session">
       <span class="ruler__dot"></span>T</button>`];
  for (let w = 1; w <= 12; w++) {
    const blockStart = w === 1 || w === 5 || w === 9;
    const done = Object.keys(state.sessions).some(
      (k) => k.startsWith(`w${w}-`) && state.sessions[k].finished
    );
    cells.push(
      `<button class="ruler__week" type="button" data-week="${w}" data-blockstart="${blockStart}" data-done="${done}" aria-current="${w === week}" aria-label="Week ${w}">
         <span class="ruler__dot"></span>${w}
       </button>`
    );
  }
  const active = blockForWeek(week);
  const blocks = BLOCKS.map(
    (b) => `<span data-active="${b.id === active}">Block ${b.id}</span>`
  ).join("");
  return `<div class="ruler">
    <div class="ruler__scale" role="group" aria-label="Week">${cells.join("")}</div>
    <div class="ruler__blocks">${blocks}</div>
  </div>`;
}

function renderDays(week, day) {
  if (week === 0) {
    return `<div class="days days--one" role="group" aria-label="Day">
      <button class="day" type="button" data-day="calibration" data-side="test" aria-pressed="true">
        W0<strong>CALIBRATION</strong>
      </button></div>`;
  }
  const todayIdx = (new Date().getDay() + 6) % 7;
  const retest = CONSOLIDATION_WEEKS.includes(week);
  return `<div class="days" role="group" aria-label="Day">${SPLIT.slice(0, 5).map((s, i) => {
    const isRetest = retest && s.session === "power";
    return `<button class="day" type="button" data-day="${s.session || "rest"}"
            data-side="${isRetest ? "test" : s.side}"
            data-today="${i === todayIdx}" aria-pressed="${(s.session || "rest") === day}">
      ${s.short}<strong>${isRetest ? "RETEST" : s.label}</strong>
    </button>`;
  }).join("")}</div>`;
}

function renderWarmup(week, day) {
  const done = warmupRecord(week, day);
  const count = done.filter(Boolean).length;
  const complete = count === WARMUP.length;
  return `<details class="warmup"${complete ? "" : " open"}>
    <summary>
      Warm-up &middot; 8 min
      <span class="warmup__count" data-complete="${complete}">${count}/${WARMUP.length}</span>
    </summary>
    <div class="warmup__list">
      ${WARMUP.map((w, i) => `
        <div class="warmup__item" role="button" tabindex="0" data-warmup="${i}" aria-pressed="${!!done[i]}">
          <span class="tick"></span>
          <span class="label">${esc(w.name)}</span>
          <em>${esc(w.spec)}</em>
        </div>`).join("")}
      <p class="warmup__warn">${esc(WARMUP_WARNING)}</p>
    </div>
  </details>`;
}

function setInputs(ex, rec, path, i, opts) {
  const entry = rec[path][i] || {};
  const cap = opts && opts.cap;
  // The unit is labelled once, above the first set. Repeating it over every
  // input is noise you read past.
  const label = (t) => (i === 0 ? `<span class="setgroup__label">${t}</span>` : "");
  const fields = [];
  if (ex.log === "load") {
    fields.push(`<div class="setgroup">${label("kg")}
      <input class="setinput" type="number" inputmode="decimal" step="0.5" min="0"
        data-input="kg" data-path="${path}" data-i="${i}" value="${entry.kg != null ? esc(entry.kg) : ""}"
        placeholder="${ex.load != null ? esc(ex.load) : "–"}" aria-label="Load in kilograms, set ${i + 1}"></div>`);
  }
  const unit = ex.log === "sec" ? "sec" : "reps";
  fields.push(`<div class="setgroup">${label(unit)}
    <input class="setinput" type="number" inputmode="numeric" step="1" min="0"
      ${cap != null ? `max="${cap}"` : ""}
      data-input="reps" data-path="${path}" data-i="${i}" value="${entry.reps != null ? esc(entry.reps) : ""}"
      aria-label="${unit}, set ${i + 1}"></div>`);
  return fields.join("");
}

function renderSets(ex, rec, path, count, opts) {
  const list = arr(rec, path, count, () => ({}));
  const cap = opts && opts.cap;
  const rows = [];
  for (let i = 0; i < count; i++) {
    const entry = list[i] || {};
    rows.push(`<div class="setrow">
      <button class="setbox" type="button" data-set="${i}" data-path="${path}"
              data-rest="${ex.rest || 0}" aria-pressed="${!!entry.done}"
              aria-label="Set ${i + 1} done">${i + 1}</button>
      ${setInputs(ex, rec, path, i, { cap })}
    </div>`);
  }
  return `<div class="sets">${rows.join("")}</div>`;
}

function renderUnilateral(ex, rec) {
  const noun = ex.unilateralLabel === "leg" ? "leg" : "side";
  const weakCount = ex.sets + (ex.extraWeakSet ? 1 : 0);
  const weak = arr(rec, "weak", weakCount, () => ({}));
  // Rule 3: the stronger side matches the weaker side's reps — never more.
  const capValues = weak.slice(0, ex.sets).map((s) => Number(s.reps)).filter((n) => n > 0);
  const cap = capValues.length ? Math.min(...capValues) : null;

  return `<div class="uni">
    <div class="uni__side" data-role="weak">
      <div class="uni__label">Weaker ${noun} &mdash; first
        ${ex.extraWeakSet ? `<span class="uni__extra">+1 extra set</span>` : ""}</div>
      ${renderSets(ex, rec, "weak", weakCount)}
    </div>
    <div class="uni__side" data-role="strong">
      <div class="uni__label">Stronger ${noun}
        <span class="uni__rule">${cap != null ? `capped at ${cap}` : "matches the weaker side"}</span>
      </div>
      ${renderSets(ex, rec, "strong", ex.sets, { cap })}
    </div>
  </div>`;
}

function renderLadder(ex, rec) {
  const rounds = arr(rec, "rounds", ex.rounds, () => []);
  return `<div class="ladder">${rounds.map((r, ri) => {
    while (r.length < ex.rungs.length) r.push(false);
    return `<div class="ladder__round">
      <span class="ladder__n">Ladder ${ri + 1}</span>
      ${ex.rungs.map((reps, gi) => `
        <button class="setbox" type="button" data-ladder="${ri}" data-rung="${gi}"
                data-rest="${gi === ex.rungs.length - 1 ? ex.rest : ex.rungRest}"
                aria-pressed="${!!r[gi]}" aria-label="Ladder ${ri + 1}, rung ${gi + 1}, ${reps} reps">${reps}</button>`).join("")}
    </div>`;
  }).join("")}</div>`;
}

function renderEmom(ex, rec) {
  const mins = arr(rec, "minutes", ex.minutes, false);
  const done = mins.filter(Boolean).length;
  return `<div class="emom">
    <div class="emom__grid">
      ${mins.map((m, i) => `
        <button class="setbox emom__min" type="button" data-emom="${i}" aria-pressed="${!!m}"
                aria-label="Minute ${i + 1}">${i + 1}</button>`).join("")}
    </div>
    <button class="btn btn--sm emom__start" type="button" data-emom-start="${ex.minutes}">
      ${done ? `${done}/${ex.minutes} minutes done` : `Start ${ex.minutes}-minute EMOM`}
    </button>
  </div>`;
}

function renderExercise(ex, rec, index, side, sessionDerived) {
  let spec, body;

  if (ex.kind === "test") {
    spec = ex.reps;
    body = ex.measures ? renderTestInput(ex, rec) : "";
  } else if (ex.kind === "ladder") {
    spec = `${ex.rounds} × (${ex.rungs.join("-")})`;
    body = renderLadder(ex, rec);
  } else if (ex.kind === "emom") {
    spec = `EMOM ${ex.minutes} × ${ex.repsPerMinute}${ex.altReps ? ` / ${ex.altReps}` : ""}`;
    body = renderEmom(ex, rec);
  } else if (ex.unilateral) {
    spec = `${ex.sets} × ${ex.reps} each`;
    body = renderUnilateral(ex, rec);
  } else {
    spec = `${ex.sets} × ${ex.reps}`;
    body = renderSets(ex, rec, "sets", ex.sets);
  }

  const meta = [];
  if (ex.rest) meta.push(`rest ${fmtRest(ex.rest)}`);
  if (ex.load != null) meta.push(`+${ex.load} kg`);
  if (ex.kind === "emom") {
    meta.push(`odd: pull-ups · even: ${(ex.altName || "push").toLowerCase()}`);
    meta.push(`${Math.round((ex.minutes / 2) * (ex.repsPerMinute + (ex.altReps || 0)))} total reps`);
  }
  if (ex.relResolved) meta.push(`${Math.round(ex.relResolved.pct * 100)}% of your ${ex.relResolved.label}`);

  return `<article class="card" data-emphasis="${!!ex.emphasis}" data-side="${side}"
           data-ex="${esc(ex.id)}"${ex.skill ? ` data-skill="true"` : ""}${ex.locked ? ` data-locked="true"` : ""}${ex.kind === "test" ? ` data-test="true"` : ""}>
    <div class="card__body">
      <div class="ex__top">
        <span class="ex__num">${ex.skill ? "&#9670;" : String(index).padStart(2, "0")}</span>
        <h3 class="ex__name">${esc(ex.name)}</h3>
        <span class="ex__spec">${esc(spec)}</span>
      </div>
      ${meta.length ? `<div class="ex__meta">${esc(meta.join(" · "))}</div>` : ""}
      ${ex.locked ? renderLock(ex) : ""}
      ${ex.notes ? `<p class="ex__notes">${esc(ex.notes)}</p>` : ""}
      ${ex.gate && !ex.locked ? `<p class="ex__notes"><span class="badge badge--gate">Gate cleared &mdash; ${ex.gateHave} strict, needed ${ex.gate.min}</span></p>` : ""}
      ${ex.equipment === "gym" ? renderAlt(ex) : ""}
      ${body}
    </div>
  </article>`;
}

// A gated exercise is never a dead card. It shows what it is waiting for, why,
// and then hands you the fallback you should actually be doing today.
function renderLock(ex) {
  return `<div class="lock">
    <div class="lock__head">
      <span class="badge badge--locked">Locked</span>
      <strong>${esc(ex.lockedName)}</strong>
      needs ${ex.gate.min} strict pull-ups &mdash; your last test says ${ex.gateHave}
    </div>
    <p>${esc(ex.gate.why)}</p>
    <p class="lock__sub">Doing this instead:</p>
  </div>`;
}

// Gym-dependent movements carry their swap with them, collapsed. At the gym it
// stays out of the way; away from it, it is one tap and you are not improvising.
function renderAlt(ex) {
  const alt = HOME_ALTS[ex.id];
  if (!alt) return `<p class="ex__notes"><span class="badge badge--gym">Gym</span></p>`;
  return `<details class="alt">
    <summary><span class="badge badge--gym">Gym</span><span class="alt__cue">No gym? ${esc(alt.name)}</span></summary>
    <p>${alt.how}</p>
  </details>`;
}

function renderTestInput(ex, rec) {
  const noun = ex.log === "sec" ? "seconds" : "reps";
  const field = (path, label) => `<label class="testfield">
    <span>${label}</span>
    <input class="setinput" type="number" inputmode="numeric" step="1" min="0"
      data-input="reps" data-path="${path}" data-i="0"
      value="${rec[path] && rec[path][0] && rec[path][0].reps != null ? esc(rec[path][0].reps) : ""}"
      aria-label="${label}, ${noun}">
  </label>`;
  arr(rec, ex.unilateral ? "weak" : "sets", 1, () => ({}));
  if (ex.unilateral) arr(rec, "strong", 1, () => ({}));
  return `<div class="testresult">
    ${ex.unilateral
      ? field("weak", `Weaker side, ${noun}`) + field("strong", `Stronger side, ${noun}`)
      : field("sets", `Result, ${noun}`)}
  </div>`;
}

function countProgress(session, week, day) {
  const rec = sessionRecord(week, day);
  let total = 0, done = 0;
  session.exercises.forEach((raw) => {
    const ex = resolveExercise(raw, week, measuredMaxes());
    const r = rec.ex[ex.id] || {};
    if (ex.kind === "ladder") {
      total += ex.rounds * ex.rungs.length;
      (r.rounds || []).forEach((round) => { done += (round || []).filter(Boolean).length; });
    } else if (ex.kind === "emom") {
      total += ex.minutes;
      done += (r.minutes || []).filter(Boolean).length;
    } else if (ex.kind === "test") {
      total += 1;
      done += (r.sets || r.weak || []).some((x) => x && x.reps != null) ? 1 : 0;
    } else if (ex.unilateral) {
      total += ex.sets * 2 + (ex.extraWeakSet ? 1 : 0);
      done += (r.weak || []).filter((s) => s && s.done).length + (r.strong || []).filter((s) => s && s.done).length;
    } else {
      total += ex.sets;
      done += (r.sets || []).filter((s) => s && s.done).length;
    }
  });
  return { total, done };
}

// Group consecutive exercises by their pair letter, preserving order. Anything
// without a pair stays a group of one.
function groupPairs(list) {
  const out = [];
  const index = new Map();
  list.forEach((ex) => {
    // Power movements are unpaired but share one heading, so they group too.
    const key = ex.pair || (ex.power ? "__power" : null);
    if (!key) return out.push([ex]);
    if (index.has(key)) return out[index.get(key)].push(ex);
    index.set(key, out.length);
    out.push([ex]);
  });
  return out;
}

function renderSession() {
  const week = state.week;
  const day = currentDay(week);
  const session = getSession(week, day);
  const head = `${renderRuler(week)}${renderDays(week, day)}`;

  if (!session) {
    $("#view-session").innerHTML = `${head}
      <div class="restday">
        <h2>Rest</h2>
        <p>Optional: 10 minutes of handstand work and mobility. Nothing that costs you recovery.</p>
      </div>`;
    return;
  }

  const rec = sessionRecord(week, day);
  const { total, done } = countProgress(session, week, day);
  const consolidation = CONSOLIDATION_WEEKS.includes(week) && !session.test;
  const maxes = measuredMaxes();

  let n = 0;
  const cards = groupPairs(session.exercises.map((raw) => resolveExercise(raw, week, maxes)))
    .map((group) => {
      const inner = group.map((ex) => {
        if (!ex.skill && ex.kind !== "test") n += 1;
        return renderExercise(ex, exRecord(week, day, ex.id), n, ex.side || session.side, session.derived);
      }).join("");
      if (group[0].power) {
        return `<div class="solo" data-power="true">
          <div class="solo__head">Straight sets &mdash; full rest between every set</div>
          ${inner}
        </div>`;
      }
      if (group.length < 2) return inner;
      return `<div class="pair">
        <div class="pair__head">
          <span class="pair__tag">Pair ${esc(group[0].pair)}</span>
          <span>Alternate &mdash; 75s between movements</span>
        </div>
        ${inner}
      </div>`;
    }).join("");

  const hasPairs = session.exercises.some((e) => e.pair);
  const hasPower = session.exercises.some((e) => e.power);

  $("#view-session").innerHTML = `${head}
    <div class="sessionhead" data-side="${session.side}">
      <div class="eyebrow">Week ${week} &middot; Block ${blockForWeek(week)} &middot; ${esc(session.day)}</div>
      <h2>${esc(session.label)}</h2>
      <div class="sessionhead__sub">${esc(session.subtitle)}</div>
      <div class="sessionhead__time" title="Prescribed rests taken in full, warm-up included. An estimate, not a target.">
        &asymp; ${estimateSessionMinutes(session, week, maxes)} min
        <span>${session.test ? "start to finish" : "incl. warm-up"}</span>
      </div>
    </div>
    ${consolidation ? `<p class="sessionnote"><strong>Consolidation week.</strong> One set fewer everywhere. Keep the quality. Friday is a retest.</p>` : ""}
    ${session.note ? `<p class="sessionnote">${esc(session.note)}</p>` : ""}
    ${session.test ? "" : renderWarmup(week, day)}
    ${hasPairs ? `<p class="sessionnote sessionnote--quiet">${esc(PAIRING_NOTE)}</p>` : ""}
    ${hasPower ? `<p class="sessionnote sessionnote--quiet">${esc(POWER_NOTE)}</p>` : ""}
    ${!maxes.fromLog && !session.test ? `<p class="sessionnote sessionnote--warn">These numbers come from an assumed starting max, not a measured one. Run the <a href="#session" data-goto-calibration>week 0 calibration session</a> and every prescription below recalculates.</p>` : ""}
    <div class="progress">${session.test ? "Results logged" : "Sets logged"} <b>${done}</b> / ${total}</div>
    ${cards}
    <div class="sessionfoot">
      <label class="field">
        <span>Session notes</span>
        <textarea data-note placeholder="How did it feel? Anything to change next time?">${esc(rec.note || "")}</textarea>
      </label>
      <div class="btnrow">
        <button class="btn btn--primary" type="button" data-finish>
          ${rec.finished ? `Finished ${fmtDate(rec.finished)}` : (session.test ? "Save results &amp; recalculate" : "Finish session")}
        </button>
        <button class="btn btn--ghost btn--sm" type="button" data-clear-session>Clear this session</button>
      </div>
    </div>`;
}

// ─── Session interactions ────────────────────────────────────────────────────

const sessionView = $("#view-session");

sessionView.addEventListener("click", (e) => {
  const week = state.week;
  const day = state.day || defaultDay();

  const weekBtn = e.target.closest("[data-week]");
  if (weekBtn) { state.week = Number(weekBtn.dataset.week); save(); renderSession(); return; }

  const dayBtn = e.target.closest("[data-day]");
  if (dayBtn) { state.day = dayBtn.dataset.day; save(); renderSession(); return; }

  const warm = e.target.closest("[data-warmup]");
  if (warm) {
    const list = warmupRecord(week, day);
    const i = Number(warm.dataset.warmup);
    list[i] = !list[i];
    save(); renderSession();
    return;
  }

  const setBtn = e.target.closest("[data-set]");
  if (setBtn) {
    const exId = setBtn.closest("[data-ex]").dataset.ex;
    const rec = exRecord(week, day, exId);
    const path = setBtn.dataset.path;
    const i = Number(setBtn.dataset.set);
    const list = arr(rec, path, i + 1, () => ({}));
    list[i].done = !list[i].done;
    if (list[i].done) startRest(Number(setBtn.dataset.rest), "Rest");
    save(); renderSession();
    return;
  }

  const rung = e.target.closest("[data-ladder]");
  if (rung) {
    const exId = rung.closest("[data-ex]").dataset.ex;
    const rec = exRecord(week, day, exId);
    const ri = Number(rung.dataset.ladder), gi = Number(rung.dataset.rung);
    const rounds = arr(rec, "rounds", ri + 1, () => []);
    while (rounds[ri].length <= gi) rounds[ri].push(false);
    rounds[ri][gi] = !rounds[ri][gi];
    if (rounds[ri][gi]) startRest(Number(rung.dataset.rest), gi === 0 ? "Rest between rungs" : "Rest");
    save(); renderSession();
    return;
  }

  const min = e.target.closest("[data-emom]");
  if (min) {
    const exId = min.closest("[data-ex]").dataset.ex;
    const rec = exRecord(week, day, exId);
    const i = Number(min.dataset.emom);
    const mins = arr(rec, "minutes", i + 1, false);
    mins[i] = !mins[i];
    save(); renderSession();
    return;
  }

  const emomStart = e.target.closest("[data-emom-start]");
  if (emomStart) {
    startRest(Number(emomStart.dataset.emomStart) * 60, "EMOM running");
    return;
  }

  if (e.target.closest("[data-goto-calibration]")) {
    e.preventDefault();
    state.week = 0; state.day = "calibration";
    save(); renderSession();
    window.scrollTo({ top: 0 });
    return;
  }

  if (e.target.closest("[data-finish]")) {
    const rec = sessionRecord(week, day);
    const session = getSession(week, day);
    rec.finished = rec.finished ? null : todayISO();
    if (rec.finished && session && session.test) {
      const before = measuredMaxes();
      commitTest(session, rec);
      save();
      renderAll();
      showRecalibration(before, measuredMaxes());
      return;
    }
    save(); renderSession();
    if (rec.finished && CONSOLIDATION_WEEKS.includes(week)) {
      // The program tests maxes every 4 weeks, never weekly.
      location.hash = "#log";
    }
    return;
  }

  if (e.target.closest("[data-clear-session]")) {
    if (!confirm("Clear every set, note and tick logged for this session? This cannot be undone.")) return;
    delete state.sessions[sessionKey(week, day)];
    delete state.warmup[sessionKey(week, day)];
    save(); renderSession();
  }
});

// A test session writes into the same two logs the Log view already owns, so
// the gauge, the chart and the asymmetry verdict all update from one entry.
function commitTest(session, rec) {
  const date = rec.finished || todayISO();
  const maxEntry = { date };
  const asym = { date };
  let anyMax = false, anyAsym = false;

  session.exercises.forEach((ex) => {
    if (ex.kind !== "test" || !ex.measures) return;
    const r = rec.ex[ex.id] || {};
    const read = (path) => {
      const v = r[path] && r[path][0] ? r[path][0].reps : null;
      return v == null || v === "" ? null : Number(v);
    };
    if (ex.unilateral) {
      const w = read("weak"), st = read("strong");
      if (w == null && st == null) return;
      anyAsym = true;
      // Weaker side first is the protocol, so it maps to whichever of L/R is
      // smaller — the asymmetry table only cares about the pair.
      asym[ex.measures + "L"] = w;
      asym[ex.measures + "R"] = st;
      if (MAX_FIELDS.includes(ex.measures)) {
        maxEntry[ex.measures] = Math.min(...[w, st].filter((x) => x != null));
        anyMax = true;
      }
    } else {
      const v = read("sets");
      if (v == null) return;
      maxEntry[ex.measures] = v;
      anyMax = true;
    }
  });

  if (anyMax) state.maxes.push(maxEntry);
  if (anyAsym) state.asymmetry.push(asym);
}

function showRecalibration(before, after) {
  const changes = MAX_FIELDS
    .filter((f) => after[f] !== before[f])
    .map((f) => `${LABELS[f]} ${before[f]} → ${after[f]}`);
  const box = document.createElement("div");
  box.className = "recal";
  box.innerHTML = `<strong>Recalibrated.</strong> ${
    changes.length ? esc(changes.join(" · ")) : "No numbers changed."
  } Every prescription in the twelve weeks has been rewritten off these.`;
  const view = $("#view-session");
  view.insertBefore(box, view.firstChild);
  box.scrollIntoView({ block: "center", behavior: "smooth" });
}

const LABELS = {
  pullups: "Pull-ups", dips: "Dips", pushups: "Push-ups",
  squat60: "Squats in 60s", calf: "Calf raises",
};

sessionView.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-warmup]")) {
    e.preventDefault();
    e.target.closest("[data-warmup]").click();
  }
});

// Number inputs update state without a re-render, so focus is never stolen
// mid-typing. The unilateral cap is applied directly to the DOM instead.
sessionView.addEventListener("input", (e) => {
  const week = state.week, day = state.day || defaultDay();

  if (e.target.matches("[data-note]")) {
    sessionRecord(week, day).note = e.target.value;
    save();
    return;
  }

  const input = e.target.closest("[data-input]");
  if (!input) return;

  const card = input.closest("[data-ex]");
  const rec = exRecord(week, day, card.dataset.ex);
  const path = input.dataset.path;
  const i = Number(input.dataset.i);
  const list = arr(rec, path, i + 1, () => ({}));
  const field = input.dataset.input;
  let val = input.value === "" ? null : Number(input.value);

  // Rule 3 again, on the way in: the stronger side can never record more reps
  // than the weaker side managed, however it was typed.
  // Exempt test cards: a calibration session is *measuring* the asymmetry, so
  // clamping the stronger side there would destroy the number being recorded.
  if (path === "strong" && field === "reps" && val != null && card.dataset.test !== "true") {
    const cap = weakCap(rec);
    if (cap != null && val > cap) { val = cap; input.value = cap; }
  }

  list[i][field] = val;
  save();

  if (path === "weak" && field === "reps") applyCap(card, rec);
});

function weakCap(rec) {
  const weak = (rec.weak || []).map((s) => Number(s && s.reps)).filter((n) => n > 0);
  return weak.length ? Math.min(...weak) : null;
}

// Rule 3, enforced rather than annotated: the stronger side can never be
// logged above the weaker side's lowest set.
function applyCap(card, rec) {
  if (card.dataset.test === "true") return;
  const cap = weakCap(rec);
  if (cap == null) return;
  card.querySelectorAll('[data-path="strong"][data-input="reps"]').forEach((el) => {
    el.max = cap;
    if (Number(el.value) > cap) {
      el.value = cap;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  const label = card.querySelector('[data-role="strong"] .uni__rule');
  if (label) label.textContent = `capped at ${cap}`;
}

sessionView.addEventListener("change", (e) => {
  if (e.target.closest("[data-input]")) renderSession();
});

// ─── Program view ────────────────────────────────────────────────────────────

function renderProgram() {
  const active = blockForWeek(state.week);
  const mx = measuredMaxes();

  $("#view-program").innerHTML = `
    <div class="section">
      <div class="eyebrow">The finding</div>
      <h2>Your push is three times ahead of your pull</h2>
      <p style="margin-top:12px">Someone who can grind 40 quality dips should be doing 8&ndash;10 strict pull-ups, not ${mx.pullups}. That single fact shapes every session in this program.</p>
      <div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>Movement</th><th>${mx.fromLog ? `Measured ${fmtDate(mx.measuredAt)}` : "Assumed &mdash; not yet measured"}</th></tr></thead>
          <tbody>
            <tr><td>Pull-ups (strict, pronated)</td><td class="num real">${mx.pullups}</td></tr>
            <tr><td>Dips</td><td class="num">${mx.dips}</td></tr>
            <tr><td>Push-ups</td><td class="num">${mx.pushups}</td></tr>
            <tr><td>Squats in 60 seconds</td><td class="num">${mx.squat60}</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>Shoulder health.</strong> Push-dominant training pulls the shoulders forward and internally rotates them. Left alone for another six months, this is how people end up with impingement &mdash; and dips are the exercise that punishes it hardest.</p>
      <p><strong>Physique.</strong> Your back and biceps are the lagging half. Back width is most of what makes a physique read as trained from the front, and it is exactly what a pull deficit starves.</p>
      <p><strong>Skills.</strong> Every skill you want is pull-gated. Your dips are already muscle-up ready; your pull-ups are the thing holding the door shut.</p>
    </div>

    <div class="section">
      <h2>The three blocks</h2>
      <div class="blocklist">
        ${BLOCKS.map((b) => `
          <div class="blockcard" data-active="${b.id === active}">
            <div class="weeks">Weeks ${b.weeks[0]}&ndash;${b.weeks[b.weeks.length - 1]}</div>
            <h3>${esc(b.title)}</h3>
            <p>${esc(b.intro)}</p>
            <div class="expect">${esc(b.expect)}</div>
          </div>`).join("")}
      </div>
    </div>

    <div class="section">
      <h2>The weekly split</h2>
      <p style="margin-bottom:14px">Four sessions, every one of them mixed. Splitting pull from push was the v2 structure; it is gone. Each day now pairs movements that don't compete, which is both what you asked for and, as it turns out, the shorter way to train.</p>
      <div class="tablewrap">
        <table>
          <thead><tr><th>Day</th><th>Session</th></tr></thead>
          <tbody>
            ${SPLIT.map((s) => `<tr>
              <td class="num">${esc(s.day)}</td>
              <td><strong>${esc(s.label)}</strong>${s.subtitle ? ` <span style="color:var(--ink-faint)">&mdash; ${esc(s.subtitle)}</span>` : ""}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <h2>Honest timeline</h2>
      <div class="tablewrap">
        <table>
          <thead><tr><th>Milestone</th><th>First estimate</th><th>Realistic</th></tr></thead>
          <tbody>
            ${TIMELINE.map((t) => `<tr>
              <td>${esc(t.milestone)}</td>
              <td class="num was">${esc(t.original)}</td>
              <td class="num real">${esc(t.real)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p>The first version of this program had you at 5&times;4 pull-ups. With a genuine 4-rep max, that is five sets to failure &mdash; which is how you build elbow tendinopathy in about three weeks. Everything here is recalculated off a 4RM and sits deliberately at 50&ndash;75% of it.</p>
    </div>

    <div class="section">
      <h2>Why it&#39;s built this way</h2>
      <p>Four findings shaped v3. They are worth knowing, because they are also the reasons not to &ldquo;improve&rdquo; it by adding sets.</p>

      <h3 class="subhead">1. Mixing pull and push is the better structure, not a compromise</h3>
      <p>You asked for it as a preference. It turns out to be the stronger design anyway. Steven Low&#39;s framework &mdash; the standard reference for bodyweight strength &mdash; builds full-body sessions of two to three pushes, two to three pulls and two leg movements, with the push and pull <em>paired</em>, resting 1.5&ndash;3.5 minutes between pairs rather than 3&ndash;7 between straight sets. A 2025 <em>Sports Medicine</em> meta-analysis on supersets found that agonist&ndash;antagonist pairing roughly halves session duration at equal volume, equal hypertrophy and equal strength &mdash; and that you complete slightly more total reps. That is why v3 sessions run around 55 minutes where v2&#39;s Friday reached 68.</p>

      <h3 class="subhead">2. Frequency is what moves a low pull-up max</h3>
      <p>The Fighter Pull-up Program and greasing the groove work on one principle: frequent, submaximal, never to failure. Going full-body four times a week takes your pull-up frequency from twice a week to four times, without adding a single set to failure.</p>

      <h3 class="subhead">3. Explosive pull-ups work &mdash; and they are gated</h3>
      <p>A 2024 trial on advanced climbers compared eccentric, isometric and plyometric pull-up training over five weeks. Maximum strength rose in all three groups, by 2.2% to 5.0%. But only the plyometric group increased muscle work, by 21.9%, along with movement velocity. The prerequisite is consistent across every source: five to eight strict full-range reps before plyometric pull-ups, then 3&ndash;5 sets of 3&ndash;5 reps, fully rested. So block 1 trains intent only, and the impact versions unlock on a measured number rather than a date.</p>

      <h3 class="subhead">4. EMOM earns exactly one day</h3>
      <p>EMOM is a cluster-set method, and the cluster-set literature is clear: equal hypertrophy, equal or slightly better strength when volume is matched, and noticeably better maintenance of rep quality, because you never approach failure. That is the right tool for banking pull-up volume at a low max &mdash; and the wrong tool on the power day, where leftover fatigue destroys the very velocity you are training. One EMOM day, not four.</p>
    </div>

    <div class="section">
      <h2>The explosive progression</h2>
      <p>Three stages, each gated on a measured pull-up max rather than a date. If the number is not there, the app shows you the fallback instead of the locked movement &mdash; you are never left holding a card you cannot do.</p>
      <div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>Block</th><th>Gate</th><th>Work</th></tr></thead>
          <tbody>
            <tr><td class="num">1&ndash;4</td><td class="num">none</td><td><strong>Intent to move fast.</strong> An ordinary pull-up at maximum concentric speed, chest to bar as the range target. Most of the speed adaptation, none of the impact.</td></tr>
            <tr><td class="num">5&ndash;8</td><td class="num real">6 strict</td><td><strong>Hands-off pull-ups.</strong> 4 &times; 3, three minutes rest. Tap the bar and re-grip. Land into a bent elbow, never a straight one.</td></tr>
            <tr><td class="num">9&ndash;12</td><td class="num real">8 strict</td><td><strong>Clap pull-ups.</strong> 5 &times; 3, three minutes rest. Any rep that lands soft ends the exercise for that day.</td></tr>
          </tbody>
        </table>
      </div>
      <p style="margin-top:14px">Weighted pull-ups have their own, higher gate: <strong>10 strict reps</strong>. Loading a pull-up max that is not there yet is precisely how the first version of this program would have handed you elbow tendinopathy.</p>
    </div>

    <div class="section">
      <h2>Test sessions</h2>
      <p>Nothing here is a fixed number. Every prescription resolves as a percentage of a <em>measured</em> max, so a test session genuinely rewrites the four weeks after it rather than just adding a row to a table.</p>
      <p><strong>Week 0</strong> is the full calibration battery &mdash; eight items, about forty minutes, done fully rested. <strong>Fridays of weeks 4, 8 and 12</strong> are retests that replace the power session: you are already in a consolidation week so you arrive fresh, and testing does not belong on the same day as speed work.</p>
      <p>Standing rules: same bar, same time of day, same cable weight every time, and film the pull-up set from the front. Change any of those and you are measuring the change, not your progress.</p>
      <div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>If your pull-up max is</th><th>Week 1 clusters</th><th>Week 5 EMOM</th><th>Week 9 power</th></tr></thead>
          <tbody>
            <tr><td class="num">4</td><td>6 &times; 2</td><td>10 min &times; 2</td><td>locked &rarr; hands-off</td></tr>
            <tr><td class="num">7</td><td>6 &times; 3</td><td>10 min &times; 3</td><td>locked &rarr; hands-off</td></tr>
            <tr><td class="num real">10</td><td>6 &times; 5</td><td>10 min &times; 5</td><td>clap pull-ups</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <h2>What the gym adds</h2>
      <p>This is still a calisthenics program. The gym fills the gaps bodyweight genuinely cannot, and nothing beyond that.</p>
      <ul class="protocol">
        <li><span>&rarr;</span><div><strong>Barbell squat and Romanian deadlift.</strong> Low&#39;s own carve-out: legs are strong enough that they need external load to progress properly. This is the one place a barbell is not optional.</div></li>
        <li><span>&rarr;</span><div><strong>The dip and pull-up belt.</strong> Replaces the backpack, and makes block 3 loading actually workable.</div></li>
        <li><span>&rarr;</span><div><strong>Lat pulldown and seated cable row.</strong> Pull volume that does not spend the pull-up reps you do not have yet.</div></li>
        <li><span>&rarr;</span><div><strong>Cable face pulls.</strong> The same objection that killed the band Romanian deadlift in v2: a band gives its least tension exactly where you need the most.</div></li>
        <li><span>&rarr;</span><div><strong>Hamstring curl machine.</strong> Assistance work, so the Nordics can stay at full range.</div></li>
      </ul>
      <p style="margin-top:14px"><strong>Every one of these has a no-gym swap.</strong> Each card marked <em>Gym</em> in the session view carries its own alternative, collapsed &mdash; one tap and you have the substitution, so a travel week or a closed gym does not become an improvised session. A backpack does most of the work: one litre of water is one kilogram.</p>
      <p style="margin-top:14px"><strong>Deliberately not added:</strong> barbell bench, machine chest press, barbell row, leg extension &mdash; every lift that would displace a calisthenics movement already doing the same job. Vertical pressing stays pike push-up to handstand push-up. Horizontal pressing stays push-up variations and dips.</p>
    </div>

    <div class="section">
      <h2>Greasing the groove</h2>
      <p>${esc(GTG)}</p>
    </div>`;
}

// ─── Balance gauge — the signature ───────────────────────────────────────────

// Every prescription in the program resolves against this. Each field is read
// independently from the newest entry that actually measured it — the week 4
// and 8 retests deliberately skip push-ups and calves, and those numbers should
// keep their last real value rather than silently reverting to the baseline.
const MAX_FIELDS = ["pullups", "dips", "pushups", "squat60", "calf"];

function measuredMaxes() {
  const byDate = state.maxes.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const out = { fromLog: byDate.length > 0, measuredAt: byDate.length ? byDate[0].date : null };
  MAX_FIELDS.forEach((f) => {
    const hit = byDate.find((m) => m[f] != null && m[f] !== "");
    out[f] = hit ? Number(hit[f]) : ATHLETE.baseline[f];
    out[f + "Measured"] = !!hit;
  });
  return out;
}

function currentMaxes() {
  return measuredMaxes();
}

function renderGauge() {
  const { pullups, dips, fromLog } = currentMaxes();
  // Push expressed in pull-up equivalents: what your pull-up max *should* be
  // for the dip max you already have.
  const pushEquiv = dips * BALANCE_TARGET_RATIO;
  const pct = Math.round((pullups / pushEquiv) * 100);
  const scale = Math.max(pullups, pushEquiv) * 1.12;

  const colour = pct >= 95 ? "var(--done)" : pct >= 70 ? "var(--pull)" : "var(--alert)";
  const verdict = pct >= 95
    ? "Balanced. The gap is closed."
    : pct >= 70
      ? "Closing. Keep the pull volume where it is."
      : "Push-dominant. This is the gap the program exists to close.";

  const pullPct = (pullups / scale) * 100;
  const pushPct = (pushEquiv / scale) * 100;

  return `<div class="gauge">
    <div class="gauge__head">
      <span class="gauge__title">Pull / push balance</span>
      <span class="gauge__pct" style="color:${colour}">${pct}%</span>
    </div>
    <div class="gauge__bars" role="img" aria-label="Pull-up max ${pullups}, against a target of ${pushEquiv.toFixed(1)} from your dip max — ${pct} percent">
      <div class="gauge__row">
        <span class="gauge__key">Pull</span>
        <span class="gauge__track">
          <span class="gauge__fill" data-side="pull" style="width:${pullPct.toFixed(1)}%"></span>
          <span class="gauge__target" style="left:${pushPct.toFixed(1)}%"></span>
        </span>
        <span class="gauge__val">${pullups}</span>
      </div>
      <div class="gauge__row">
        <span class="gauge__key">Push</span>
        <span class="gauge__track">
          <span class="gauge__fill" data-side="push" style="width:${pushPct.toFixed(1)}%"></span>
        </span>
        <span class="gauge__val">${pushEquiv.toFixed(1)}</span>
      </div>
    </div>
    <div class="gauge__legend"><span class="pull">your pull-up max</span><span class="push">target from your dip max</span></div>
    <p class="gauge__caption">${verdict} Both bars are in pull-ups: the push bar is the pull-up max your ${dips} dips say you should already have.${fromLog ? "" : " Based on your starting numbers &mdash; log a max test to update it."}</p>
  </div>`;
}

function renderChart() {
  const pts = state.maxes.filter((m) => m.pullups);
  if (pts.length < 2) return "";
  const W = 320, H = 110, pad = 20;
  const max = Math.max(...pts.map((p) => Number(p.pullups))) * 1.15;
  const step = pts.length > 1 ? (W - pad * 2) / (pts.length - 1) : 0;
  const coords = pts.map((p, i) => [pad + i * step, H - pad - (Number(p.pullups) / max) * (H - pad * 2)]);
  const path = coords.map((c, i) => `${i ? "L" : "M"}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(" ");

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pull-up max over time">
    <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="var(--rule)" stroke-width="1"/>
    <path d="${path}" fill="none" stroke="var(--pull)" stroke-width="2" stroke-linejoin="round"/>
    ${coords.map((c, i) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="3" fill="var(--pull)"/>
      <text x="${c[0].toFixed(1)}" y="${(c[1] - 8).toFixed(1)}" text-anchor="middle" fill="var(--ink-dim)" font-family="IBM Plex Mono, monospace" font-size="9">${esc(pts[i].pullups)}</text>`).join("")}
  </svg>`;
}

function asymmetryVerdict(entry) {
  let worst = 0;
  ASYMMETRY_TESTS.forEach((t) => {
    const l = Number(entry[t.id + "L"]), r = Number(entry[t.id + "R"]);
    if (l > 0 && r > 0) worst = Math.max(worst, Math.abs(l - r) / Math.max(l, r) * 100);
  });
  const pct = Math.round(worst);
  if (pct < 10) return { pct, level: "ok", text: `${pct}% gap — normal. Ignore it.` };
  if (pct <= 20) return { pct, level: "watch", text: `${pct}% gap — the protocol below fixes this over a few months.` };
  return { pct, level: "see", text: `${pct}% gap — worth a physio's assessment before you load it heavily.` };
}

function renderLog() {
  const maxes = state.maxes.slice().reverse();
  const asym = state.asymmetry.slice().reverse();
  const finished = Object.keys(state.sessions)
    .filter((k) => state.sessions[k].finished)
    .map((k) => ({ key: k, ...state.sessions[k] }))
    .sort((a, b) => (a.finished < b.finished ? 1 : -1));

  $("#view-log").innerHTML = `
    ${renderGauge()}

    <div class="section">
      <h2>Max tests</h2>
      <p style="margin-bottom:14px">Test every four weeks, never weekly. Progress at your stage is one to two reps a month.</p>
      ${renderChart()}
      <form class="miniform" data-max-form>
        <label class="field"><span>Date</span><input type="date" name="date" value="${todayISO()}" required></label>
        <label class="field"><span>Pull-ups</span><input type="number" name="pullups" inputmode="numeric" min="0" placeholder="—"></label>
        <label class="field"><span>Dips</span><input type="number" name="dips" inputmode="numeric" min="0" placeholder="—"></label>
        <label class="field"><span>Push-ups</span><input type="number" name="pushups" inputmode="numeric" min="0" placeholder="—"></label>
        <label class="field"><span>Squats / 60s</span><input type="number" name="squat60" inputmode="numeric" min="0" placeholder="—"></label>
        <label class="field"><span>Calf raises</span><input type="number" name="calf" inputmode="numeric" min="0" placeholder="—"></label>
      </form>
      <div class="btnrow"><button class="btn btn--primary btn--sm" type="button" data-add-max>Record test</button></div>
      ${maxes.length ? `<div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>Date</th><th>Pull</th><th>Dips</th><th>Push-ups</th><th>Sq/60s</th><th></th></tr></thead>
          <tbody>${maxes.map((m, i) => `<tr>
            <td class="num">${fmtDate(m.date)}</td>
            <td class="num real">${esc(m.pullups ?? "–")}</td>
            <td class="num">${esc(m.dips ?? "–")}</td>
            <td class="num">${esc(m.pushups ?? "–")}</td>
            <td class="num">${esc(m.squat60 ?? "–")}</td>
            <td><button class="btn btn--sm btn--ghost" type="button" data-del-max="${state.maxes.length - 1 - i}" aria-label="Delete test">&times;</button></td>
          </tr>`).join("")}</tbody>
        </table>
      </div>` : `<p class="empty" style="margin-top:14px">No max tests yet. Record one today so week 4 has something to beat.</p>`}
    </div>

    <div class="section">
      <h2>Left / right</h2>
      <p style="margin-bottom:14px">A visible difference between dominant and non-dominant side is close to universal. What matters is whether it is a <strong>strength</strong> difference, because that one compounds.</p>
      <form class="miniform" data-asym-form>
        ${ASYMMETRY_TESTS.map((t) => `
          <label class="field"><span>${esc(t.name)} L</span><input type="number" name="${t.id}L" inputmode="numeric" min="0" placeholder="—"></label>
          <label class="field"><span>${esc(t.name)} R</span><input type="number" name="${t.id}R" inputmode="numeric" min="0" placeholder="—"></label>`).join("")}
      </form>
      <div class="btnrow"><button class="btn btn--primary btn--sm" type="button" data-add-asym>Record test</button></div>
      ${asym.length ? `<div class="verdict" data-level="${asymmetryVerdict(asym[0]).level}">
          Latest, ${fmtDate(asym[0].date)}: ${esc(asymmetryVerdict(asym[0]).text)}
        </div>` : `<p class="empty" style="margin-top:14px">Test this once, this week.</p>`}
      <h3 style="margin-top:20px;font-size:15px;text-transform:uppercase;letter-spacing:.05em">The protocol</h3>
      <ol class="protocol" style="margin-top:10px">${ASYMMETRY_PROTOCOL.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
    </div>

    <div class="section">
      <h2>Completed sessions</h2>
      ${finished.length ? finished.map((f) => {
        const [w, d] = f.key.slice(1).split("-");
        const s = getSession(Number(w), d);
        return `<div class="histrow">
          <span class="when">${fmtDate(f.finished)}</span>
          <span class="what">Week ${w} &middot; ${s ? esc(s.label) : esc(d)}</span>
          <span class="vol">${totalReps(f)} reps</span>
        </div>`;
      }).join("") : `<p class="empty">Nothing finished yet.</p>`}
    </div>

    <div class="section">
      <h2>Your data</h2>
      <p>Everything here lives in this browser only. Clearing your browser data erases it. Export regularly.</p>
      <div class="btnrow">
        <button class="btn btn--sm" type="button" data-export>Export JSON</button>
        <button class="btn btn--sm" type="button" data-import>Import JSON</button>
        <button class="btn btn--sm btn--danger" type="button" data-reset>Erase everything</button>
      </div>
      <input type="file" accept="application/json,.json" hidden data-import-file>
    </div>`;
}

function totalReps(sessionRec) {
  let n = 0;
  Object.values(sessionRec.ex || {}).forEach((r) => {
    ["sets", "weak", "strong"].forEach((p) => {
      (r[p] || []).forEach((s) => { if (s && s.done && s.reps) n += Number(s.reps); });
    });
  });
  return n;
}

// ─── Log interactions ────────────────────────────────────────────────────────

const logView = $("#view-log");

logView.addEventListener("click", (e) => {
  if (e.target.closest("[data-add-max]")) {
    const f = logView.querySelector("[data-max-form]");
    const get = (n) => { const v = f.elements[n].value; return v === "" ? null : Number(v); };
    if (MAX_FIELDS.every((k) => get(k) == null)) return;
    const entry = { date: f.elements.date.value || todayISO() };
    MAX_FIELDS.forEach((k) => { entry[k] = get(k); });
    state.maxes.push(entry);
    state.maxes.sort((a, b) => (a.date < b.date ? -1 : 1));
    save(); renderLog();
    return;
  }

  const del = e.target.closest("[data-del-max]");
  if (del) { state.maxes.splice(Number(del.dataset.delMax), 1); save(); renderLog(); return; }

  if (e.target.closest("[data-add-asym]")) {
    const f = logView.querySelector("[data-asym-form]");
    const entry = { date: todayISO() };
    let any = false;
    ASYMMETRY_TESTS.forEach((t) => {
      ["L", "R"].forEach((side) => {
        const v = f.elements[t.id + side].value;
        entry[t.id + side] = v === "" ? null : Number(v);
        if (v !== "") any = true;
      });
    });
    if (!any) return;
    state.asymmetry.push(entry);
    save(); renderLog();
    return;
  }

  if (e.target.closest("[data-export]")) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bridge-program-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return;
  }

  if (e.target.closest("[data-import]")) {
    logView.querySelector("[data-import-file]").click();
    return;
  }

  if (e.target.closest("[data-reset]")) {
    if (!confirm("Erase every logged set, note, max test and asymmetry test? This cannot be undone.")) return;
    state = blank();
    save(); renderAll();
  }
});

logView.addEventListener("change", (e) => {
  const file = e.target.closest("[data-import-file]");
  if (!file || !file.files || !file.files[0]) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || parsed.version !== SCHEMA) throw new Error("bad version");
      state = { ...blank(), ...parsed };
      save(); renderAll();
    } catch (err) {
      alert("That file isn't a Bridge Program export, or it came from a different version.");
    }
  };
  reader.readAsText(file.files[0]);
  file.value = "";
});

// ─── Notes view ──────────────────────────────────────────────────────────────

function renderNotes() {
  $("#view-notes").innerHTML = `
    <div class="section">
      <h2>Warm-up &mdash; 8 min, every session</h2>
      <div class="tablewrap">
        <table>
          <tbody>${WARMUP.map((w, i) => `<tr>
            <td class="num" style="color:var(--ink-faint);width:1%">${String(i + 1).padStart(2, "0")}</td>
            <td>${esc(w.name)}</td><td class="num">${esc(w.spec)}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>
      <p style="color:var(--alert)">${esc(WARMUP_WARNING)}</p>
    </div>

    <div class="section">
      <h2>Stop and back off if</h2>
      <ul class="warnlist">${BACK_OFF.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      <p class="warnfoot">Pain that is sharp, localised, or lasts beyond a few days deserves a physio, not a forum.</p>
    </div>

    <div class="section">
      <h2>Three rules that decide whether this works</h2>
      <div class="rules">
        ${RULES.map((r) => `<div class="rule-item"><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p></div>`).join("")}
      </div>
    </div>

    <div class="section">
      <h2>Nutrition</h2>
      <p>${esc(NUTRITION)}</p>
    </div>`;
}

// ─── Router ──────────────────────────────────────────────────────────────────

const VIEWS = ["session", "program", "log", "notes"];

function route() {
  const name = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "session";
  VIEWS.forEach((v) => { $(`#view-${v}`).hidden = v !== name; });
  document.querySelectorAll(".tab").forEach((t) => {
    if (t.dataset.tab === name) t.setAttribute("aria-current", "page");
    else t.removeAttribute("aria-current");
  });
  if (name === "log") renderLog();
  if (name === "program") renderProgram();
  window.scrollTo(0, 0);
}

function renderTopbar() {
  const { pullups } = currentMaxes();
  $("#topbar-meta").textContent = `Week ${state.week}/12 · ${pullups} pull-ups`;
}

function renderAll() {
  renderTopbar();
  renderSession();
  renderNotes();
  route();
}

// ─── Theme ───────────────────────────────────────────────────────────────────
// Stored separately from training data so importing someone else's log — or
// erasing your own — never changes how the page looks.

const THEME_KEY = "bridge.theme";

function currentTheme() {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit) return explicit;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("#theme-toggle");
  btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", theme === "dark" ? "#0B1826" : "#F3F1E9");
  try { localStorage.setItem(THEME_KEY, theme); } catch (err) { /* fine, session-only */ }
}

try {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") applyTheme(stored);
} catch (err) { /* no stored preference; follow the OS */ }

$("#theme-toggle").addEventListener("click", () => {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
});

window.addEventListener("hashchange", route);

if (!storageOK) document.getElementById("storage-warning").hidden = false;
if (!state.day) state.day = defaultDay();
renderAll();

// Keep the topbar and ruler in step with anything the log view changes.
const observed = new MutationObserver(renderTopbar);
observed.observe($("#view-log"), { childList: true });
