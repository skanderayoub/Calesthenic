import {
  ATHLETE, BALANCE_TARGET_RATIO, WARMUP, WARMUP_WARNING, SPLIT, BLOCKS,
  CONSOLIDATION_WEEKS, TIMELINE, ASYMMETRY_TESTS, ASYMMETRY_PROTOCOL,
  BACK_OFF, RULES, GTG, NUTRITION,
  blockForWeek, getSession, resolveExercise, estimateSessionMinutes,
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

function defaultDay() {
  const idx = (new Date().getDay() + 6) % 7;   // 0 = Mon
  const entry = SPLIT[idx];
  return entry && entry.session ? entry.session : "pullA";
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
  const cells = [];
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
  const todayIdx = (new Date().getDay() + 6) % 7;
  return `<div class="days" role="group" aria-label="Day">${SPLIT.slice(0, 5).map((s, i) => `
    <button class="day" type="button" data-day="${s.session || "rest"}" data-side="${s.side}"
            data-today="${i === todayIdx}" aria-pressed="${(s.session || "rest") === day}">
      ${s.short}<strong>${s.label}</strong>
    </button>`).join("")}</div>`;
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

  if (ex.kind === "ladder") {
    spec = `${ex.rounds} × (${ex.rungs.join("-")})`;
    body = renderLadder(ex, rec);
  } else if (ex.kind === "emom") {
    spec = `EMOM ${ex.minutes} × ${ex.repsPerMinute}`;
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
  if (ex.kind === "emom") meta.push(`${ex.minutes * ex.repsPerMinute} total reps`);

  return `<article class="card" data-emphasis="${!!ex.emphasis}" data-side="${side}" data-ex="${esc(ex.id)}">
    <div class="card__body">
      <div class="ex__top">
        <span class="ex__num">${String(index + 1).padStart(2, "0")}</span>
        <h3 class="ex__name">${esc(ex.name)}</h3>
        <span class="ex__spec">${esc(spec)}</span>
      </div>
      ${meta.length ? `<div class="ex__meta">${esc(meta.join(" · "))}</div>` : ""}
      ${ex.notes ? `<p class="ex__notes">${esc(ex.notes)}</p>` : ""}
      ${ex.derived && !sessionDerived ? `<p class="ex__notes"><span class="badge badge--derived">Added &mdash; not in the original document</span></p>` : ""}
      ${ex.gate ? `<p class="ex__notes"><span class="badge badge--gate">Gate: 5 × 5 bodyweight, 2 in reserve</span></p>` : ""}
      ${body}
    </div>
  </article>`;
}

function countProgress(session, week, day) {
  const rec = sessionRecord(week, day);
  let total = 0, done = 0;
  session.exercises.forEach((raw) => {
    const ex = resolveExercise(raw, week);
    const r = rec.ex[ex.id] || {};
    if (ex.kind === "ladder") {
      total += ex.rounds * ex.rungs.length;
      (r.rounds || []).forEach((round) => { done += (round || []).filter(Boolean).length; });
    } else if (ex.kind === "emom") {
      total += ex.minutes;
      done += (r.minutes || []).filter(Boolean).length;
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

function renderSession() {
  const week = state.week;
  const day = state.day || defaultDay();
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
  const consolidation = CONSOLIDATION_WEEKS.includes(week);

  const cards = session.exercises.map((raw, i) => {
    const ex = resolveExercise(raw, week);
    return renderExercise(ex, exRecord(week, day, ex.id), i, session.side, session.derived);
  }).join("");

  $("#view-session").innerHTML = `${head}
    <div class="sessionhead" data-side="${session.side}">
      <div class="eyebrow">Week ${week} &middot; Block ${blockForWeek(week)} &middot; ${esc(session.day)}</div>
      <h2>${esc(session.label)}</h2>
      <div class="sessionhead__sub">${esc(session.subtitle)}</div>
      <div class="sessionhead__time" title="Prescribed rests taken in full, warm-up included. An estimate, not a target.">
        &asymp; ${estimateSessionMinutes(session, week)} min
        <span>incl. warm-up</span>
      </div>
      ${session.derived ? `<span class="badge badge--derived">Derived from block prose &mdash; adjust if this isn't what you meant</span>` : ""}
    </div>
    ${consolidation ? `<p class="sessionnote"><strong>Consolidation week.</strong> One set fewer everywhere. Keep the quality. Retest your maxes on Friday.</p>` : ""}
    ${session.note ? `<p class="sessionnote">${esc(session.note)}</p>` : ""}
    ${renderWarmup(week, day)}
    <div class="progress">Sets logged <b>${done}</b> / ${total}</div>
    ${cards}
    <div class="sessionfoot">
      <label class="field">
        <span>Session notes</span>
        <textarea data-note placeholder="How did it feel? Anything to change next time?">${esc(rec.note || "")}</textarea>
      </label>
      <div class="btnrow">
        <button class="btn btn--primary" type="button" data-finish>
          ${rec.finished ? `Finished ${fmtDate(rec.finished)}` : "Finish session"}
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

  if (e.target.closest("[data-finish]")) {
    const rec = sessionRecord(week, day);
    rec.finished = rec.finished ? null : todayISO();
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
  if (path === "strong" && field === "reps" && val != null) {
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

  $("#view-program").innerHTML = `
    <div class="section">
      <div class="eyebrow">The finding</div>
      <h2>Your push is three times ahead of your pull</h2>
      <p style="margin-top:12px">Someone who can grind 40 quality dips should be doing 8&ndash;10 strict pull-ups, not ${ATHLETE.baseline.pullups}. That single fact shapes every session in this program.</p>
      <div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>Movement</th><th>Estimated true max</th></tr></thead>
          <tbody>
            <tr><td>Pull-ups (strict, pronated)</td><td class="num real">${ATHLETE.baselineLabel.pullups}</td></tr>
            <tr><td>Dips</td><td class="num">${ATHLETE.baselineLabel.dips}</td></tr>
            <tr><td>Push-ups</td><td class="num">${ATHLETE.baselineLabel.pushups}</td></tr>
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
      <h2>Legs</h2>
      <p>Legs stay spread across the two push days rather than getting their own — twice-weekly frequency beats one clustered day, and leg work doesn't pre-fatigue the shoulders and elbows the pressing needs. What they were missing was a progression. The original document prescribed an unchanging <span style="color:var(--ink-faint)">3 × 10 squat variation, loaded</span> for twelve straight weeks.</p>
      <p>They now sit <strong>directly after the main push movement</strong> instead of at the end, because trailing exercises are the ones that get skipped when you're forty minutes deep.</p>
      <div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>Block</th><th>Lever</th><th>What changes</th></tr></thead>
          <tbody>
            <tr><td class="num">1&ndash;4</td><td>Reps</td><td>Bodyweight throughout. Split squats 10&nbsp;&rarr;&nbsp;15, single-leg RDL 8&nbsp;&rarr;&nbsp;12, Nordic negatives 3&nbsp;&rarr;&nbsp;5. Squats go loaded only in week 3.</td></tr>
            <tr><td class="num">5&ndash;8</td><td>Load</td><td>Backpack enters, +2.5&ndash;5 kg every two weeks &mdash; the same cadence as your weighted dips. Nordics reach full range.</td></tr>
            <tr><td class="num">9&ndash;12</td><td>Leverage</td><td>A backpack caps out, so range and leverage take over: deficit split squats and RDLs, assisted pistol squats, loaded calf raises.</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>Two swaps.</strong> The band Romanian deadlift is gone &mdash; bands give their least tension at the stretched position, which is exactly where hamstrings respond. Single-leg RDLs replace it, and being unilateral they also feed the weaker-side-first protocol. Nordic curl negatives and calf raises are new; calves had no work at all.</p>
      <p style="color:var(--ink-faint)">This section is an addition. Nothing here came from the original document &mdash; every added exercise is badged in the session view.</p>
    </div>

    <div class="section">
      <h2>Greasing the groove</h2>
      <p>${esc(GTG)}</p>
    </div>`;
}

// ─── Balance gauge — the signature ───────────────────────────────────────────

function currentMaxes() {
  const latest = state.maxes.length ? state.maxes[state.maxes.length - 1] : null;
  return {
    pullups: latest && latest.pullups ? Number(latest.pullups) : ATHLETE.baseline.pullups,
    dips: latest && latest.dips ? Number(latest.dips) : ATHLETE.baseline.dips,
    fromLog: !!latest,
  };
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
      </form>
      <div class="btnrow"><button class="btn btn--primary btn--sm" type="button" data-add-max>Record test</button></div>
      ${maxes.length ? `<div class="tablewrap" style="margin-top:14px">
        <table>
          <thead><tr><th>Date</th><th>Pull</th><th>Dips</th><th>Push-ups</th><th></th></tr></thead>
          <tbody>${maxes.map((m, i) => `<tr>
            <td class="num">${fmtDate(m.date)}</td>
            <td class="num real">${esc(m.pullups ?? "–")}</td>
            <td class="num">${esc(m.dips ?? "–")}</td>
            <td class="num">${esc(m.pushups ?? "–")}</td>
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
    if (get("pullups") == null && get("dips") == null && get("pushups") == null) return;
    state.maxes.push({ date: f.elements.date.value || todayISO(), pullups: get("pullups"), dips: get("dips"), pushups: get("pushups") });
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
