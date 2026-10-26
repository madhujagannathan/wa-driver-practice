import { TOPICS, QUESTIONS, GUIDE_EDITION } from './questions.js?v=6';
import { SIGNS } from './signs.js?v=6';
import { store } from './store.js?v=6';

const PASS_RATE = 0.8;      // Real WA test: 32 of 40 correct
const TEST_LENGTH = 40;
const ROUND_SIZE = 15;       // questions per practice or review round
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const app = document.getElementById('app');
const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
const topicName = (id) => TOPICS.find((t) => t.id === id)?.name ?? id;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const thumb = (q) => (q.sign && SIGNS[q.sign] ? `<span class="thumb-sign" aria-hidden="false">${SIGNS[q.sign]}</span>` : '');
const when = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

let session = null;
let run = null; // the active quiz

// ───────────────────────── Stats ─────────────────────────
function mastery(progress, topic) {
  const qs = topic ? QUESTIONS.filter((q) => q.topic === topic) : QUESTIONS;
  const right = qs.filter((q) => progress.answers[q.id]?.last === 'right').length;
  return { right, total: qs.length, pct: pct(right, qs.length) };
}

// ───────────────────────── Shell ─────────────────────────
const icons = {
  test: '<svg class="glyph" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="22" height="26" rx="4" stroke="var(--guide)"/><path d="M11 12h12M11 17h12M11 22h7" stroke="var(--ink-3)"/><path d="m20 22 2.5 2.5L27 19" stroke="var(--guide)"/></svg>',
  review: '<svg class="glyph" viewBox="0 0 34 34" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 4 31 28H3Z" stroke="var(--amber)" fill="color-mix(in srgb, var(--amber) 18%, transparent)"/><path d="M17 13v7M17 24v.5" stroke="var(--ink)"/></svg>',
  cards: '<svg class="glyph" viewBox="0 0 34 34" fill="none" stroke-width="2.2" stroke-linejoin="round"><rect x="9" y="5" width="20" height="16" rx="3" stroke="var(--ink-3)" transform="rotate(8 19 13)"/><rect x="5" y="11" width="20" height="16" rx="3" stroke="var(--guide)" fill="var(--paper)"/></svg>',
};

function shell(active, inner) {
  const s = session;
  const p = s.role === 'student' ? store.progress(s.username) : null;
  const missed = p ? p.missed.filter((id) => byId[id]).length : 0;
  const nav = s.role === 'student'
    ? [
        ['#/', 'Home', 'home'],
        ['#/practice', 'Practice by topic|Practice', 'practice'],
        ['#/test', 'Mock test', 'test'],
        ['#/review', 'Review mistakes|Review', 'review', missed],
        ['#/cards', 'Flashcards', 'cards'],
      ]
    : [['#/', `${s.watches}’s progress`, 'home']];
  return `
  <div class="shell">
    <aside class="rail">
      <a class="brand" href="#/"><b>Road Ready</b><span>WA knowledge test practice</span></a>
      <nav class="nav" aria-label="Main">
        ${nav.map(([href, label, key, count]) => `<a href="${href}" ${active === key ? 'aria-current="page"' : ''}>${label.includes('|') ? `<span class="long">${label.split('|')[0]}</span><span class="short">${label.split('|')[1]}</span>` : label}${count ? `<span class="count num">${count}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="rail-foot">
        <div class="who-line">Signed in as <span class="who">${esc(s.username)}</span>${s.role === 'parent' ? ' (parent)' : ''}</div>
        <button class="linkish" data-action="signout">Sign out</button>
        <p class="preview-note" data-sync>${store.mode === 'synced' ? 'Progress is saved to this account and follows you to any device.' : 'Progress is saved in this browser only.'}</p>
      </div>
    </aside>
    <main class="main" id="main"><div class="page enter">${inner}</div></main>
  </div>`;
}

// ───────────────────────── Sign in ─────────────────────────
function renderGate() {
  let role = 'student';
  let mode = 'signin';
  app.innerHTML = `
  <div class="gate">
    <section class="gate-art">
      <div>
        <h1>Get road ready.</h1>
        <p>Practice for the Washington knowledge test with questions drawn straight from the official Driver Guide.</p>
      </div>
      <div class="facts">
        <div><b class="num">40</b>questions on the test</div>
        <div><b class="num">80%</b>needed to pass</div>
        <div><b class="num">${QUESTIONS.length}</b>practice questions here</div>
      </div>
      <svg class="road" viewBox="0 0 300 300" aria-hidden="true">
        <path d="M60 300 C 120 200, 200 160, 300 120" stroke="rgba(0,0,0,.25)" stroke-width="90" fill="none"/>
        <path class="dash" d="M60 300 C 120 200, 200 160, 300 120" stroke="#f2c230" stroke-width="5" fill="none" stroke-dasharray="26 34"/>
      </svg>
    </section>
    <section class="gate-form">
      <form class="form" novalidate>
        <div class="seg" role="group" aria-label="I am a">
          <button type="button" data-role="student" aria-pressed="true">Student</button>
          <button type="button" data-role="parent" aria-pressed="false">Parent</button>
          <span class="thumb" aria-hidden="true"></span>
        </div>
        <h2 class="form-title">Sign in to keep practicing</h2>
        <div class="field"><label for="e" data-email-label>Email</label><input id="e" name="e" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" required><span class="help" data-email-help></span></div>
        <div class="reveal" data-show="signup-student"><div>
          <div class="field"><label for="u">Username</label><input id="u" name="u" autocomplete="username" autocapitalize="none" spellcheck="false"><span class="help">A short name like maya_k. It’s shown in the app, and a parent uses it to link to your progress.</span></div>
        </div></div>
        <div class="reveal open" data-show="password"><div>
          <div class="field"><label for="p">Password</label><input id="p" name="p" type="password" autocomplete="current-password"></div>
        </div></div>
        <div class="reveal" data-show="signup-parent"><div>
          <div class="field"><label for="s">Your student’s username</label><input id="s" name="s" autocapitalize="none" spellcheck="false"><span class="help">The parent view follows this student’s progress.</span></div>
        </div></div>
        <p class="error" role="alert"></p>
        <p class="notice" role="status"></p>
        <button class="btn" type="submit">Sign in</button>
        <p class="switch forgot-line" data-show="signin"><button type="button" class="linkish" data-forgot>Forgot password?</button></p>
        <p class="switch"><span class="switch-text">New here?</span> <button type="button" class="linkish" data-toggle>Create an account</button></p>
      </form>
    </section>
  </div>`;

  const form = app.querySelector('form');
  const seg = form.querySelector('.seg');
  const err = form.querySelector('.error');
  const submit = form.querySelector('[type=submit]');
  const notice = form.querySelector('.notice');
  const show = (key, on) => form.querySelectorAll(`[data-show="${key}"]`).forEach((el) => {
    if (el.classList.contains('reveal')) el.classList.toggle('open', on); else el.hidden = !on;
  });
  const sync = () => {
    seg.classList.toggle('right', role === 'parent');
    seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === role)));
    const creating = mode === 'signup';
    const resetting = mode === 'reset';
    seg.hidden = resetting;
    form.querySelector('.form-title').textContent = resetting ? 'Reset your password'
      : creating ? (role === 'student' ? 'Create your student account' : 'Create a parent account')
      : (role === 'student' ? 'Sign in to keep practicing' : 'Sign in to see progress');
    form.querySelector('[data-email-help]').textContent = resetting
      ? 'We’ll email a link to choose a new password. Your progress stays saved.'
      : creating
        ? 'Password-reset links go here. A student can use a parent’s Gmail with a +name, like you+maya@gmail.com.'
        : 'Made your account with just a username? Type the username here instead.';
    form.querySelector('[data-email-label]').textContent = creating || resetting ? 'Email' : 'Email (or username)';
    form.querySelector('#e').type = creating || resetting ? 'email' : 'text';
    submit.textContent = resetting ? 'Email me a reset link' : creating ? 'Create account' : 'Sign in';
    form.querySelector('.switch-text').textContent = creating ? 'Already have an account?' : resetting ? 'Remembered it?' : 'New here?';
    form.querySelector('[data-toggle]').textContent = creating || resetting ? 'Sign in' : 'Create an account';
    form.querySelector('#p').autocomplete = creating ? 'new-password' : 'current-password';
    show('password', !resetting);
    show('signup-student', creating && role === 'student');
    show('signup-parent', creating && role === 'parent');
    show('signin', mode === 'signin');
    err.textContent = '';
    notice.textContent = '';
  };
  seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { role = b.dataset.role; sync(); } });
  form.querySelector('[data-toggle]').addEventListener('click', () => { mode = mode === 'signin' ? 'signup' : 'signin'; sync(); });
  form.querySelector('[data-forgot]').addEventListener('click', () => { mode = 'reset'; sync(); form.querySelector('#e').focus(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    err.textContent = ''; notice.textContent = '';
    try {
      submit.disabled = true;
      if (mode === 'reset') {
        await store.resetPassword(f.get('e'));
        notice.textContent = `If ${String(f.get('e')).trim()} has an account, a reset link is on its way. Check the spam folder if it doesn’t arrive in a few minutes.`;
        return;
      }
      session = mode === 'signup'
        ? await store.signUp({ role, email: f.get('e'), username: f.get('u'), password: f.get('p'), student: f.get('s') })
        : await store.signIn({ username: f.get('e'), password: f.get('p') });
      location.hash = '#/';
      route();
    } catch (ex) {
      err.textContent = ex.message;
    } finally { submit.disabled = false; }
  });
  sync();
}

// ───────────────────────── Student home ─────────────────────────
function guideSign(progress, { clickable, who = 'you' }) {
  const all = mastery(progress);
  return `
  <section class="sign" aria-label="Readiness by topic">
    <div class="sign-head">
      <div><h2>Knowledge test</h2><div class="sign-sub">Share of questions ${who === 'you' ? 'you' : esc(who)} answered right on the latest try</div></div>
      <div class="big">${all.pct}<small>%</small></div>
    </div>
    <ul class="sign-rows">
      ${TOPICS.map((t, i) => {
        const m = mastery(progress, t.id);
        const tag = clickable && m.total ? 'button' : 'div';
        return `<li><${tag} class="sign-row" style="--d:${i}" ${tag === 'button' ? `data-go="#/practice/${t.id}"` : ''} aria-label="${esc(t.name)}: ${m.pct}% mastered">
          <span class="name">${esc(t.name)}<span class="ch">Ch. ${t.chapter}</span></span>
          <span class="pct">${m.pct}<small>%</small></span>
          <span class="bar"><i style="--w:${m.pct}%;--d:${i}"></i></span>
        </${tag}></li>`;
      }).join('')}
    </ul>
    <div class="sign-foot">${QUESTIONS.length} questions, all from the ${GUIDE_EDITION}.</div>
  </section>`;
}

function renderHome() {
  const p = store.progress(session.username);
  const last = p.tests[0];
  const testLen = Math.min(TEST_LENGTH, QUESTIONS.length);
  app.innerHTML = shell('home', `
    <h1>Hi, ${esc(session.username)}.</h1>
    <p class="lede">${p.tests.length || Object.keys(p.answers).length ? 'Pick up where you left off. Tap a topic to practice it.' : 'Start with any topic below. Every answer comes with the rule behind it.'}</p>
    ${guideSign(p, { clickable: true })}
    <div class="modes">
      <a class="mode" href="#/test">${icons.test}<b>Take a mock test</b><span>${testLen} questions, like the real thing. ${Math.ceil(testLen * PASS_RATE)} correct to pass.</span></a>
      <a class="mode" href="#/review" ${mistakeLog(p).length ? '' : 'aria-disabled="true"'}>${icons.review}<b>Review mistakes</b><span>${mistakeLog(p).length ? `${toFix(p).length} to fix, ${mistakeLog(p).length} in your mistake log` : 'Nothing to review yet'}</span></a>
      <a class="mode" href="#/cards">${icons.cards}<b>Flashcards</b><span>Key numbers and rules, one at a time</span></a>
    </div>
    ${last ? `<p class="last-test">Last mock test: <b class="num">${last.score}/${last.total}</b> — ${last.passed ? 'passed' : 'not yet a pass'}, ${when(last.at)}.</p>` : ''}
  `);
}

// ───────────────────────── Topic picker ─────────────────────────
function renderTopics() {
  const p = store.progress(session.username);
  app.innerHTML = shell('practice', `
    <h1>Practice by topic</h1>
    <p class="lede">Questions you haven’t mastered come first. You’ll see the answer and the rule after each one.</p>
    <div class="topics">
      ${TOPICS.map((t) => {
        const m = mastery(p, t.id);
        return `<button class="topic" data-go="#/practice/${t.id}" ${m.total ? '' : 'disabled'}>
          <span class="shield">${t.chapter.split('–')[0].replace(/\.\d+$/, '')}</span>
          <span><b>${esc(t.name)}</b><span>${m.total} question${m.total === 1 ? '' : 's'}</span></span>
          <span class="pct">${m.pct}%</span>
        </button>`;
      }).join('')}
    </div>
    <div class="all-topics"><button class="btn secondary" data-go="#/practice/all">Mix all topics</button></div>
  `);
}

// ───────────────────────── Quiz engine ─────────────────────────
function startRun(kind, ids, label) {
  run = {
    kind, label, i: 0,
    items: ids.map((id) => {
      const q = byId[id];
      const order = shuffle(q.choices.map((_, k) => k));
      return { id, order, picked: null };
    }),
  };
  renderQuiz(true);
}

function practiceOrder(topic) {
  const p = store.progress(session.username);
  const pool = QUESTIONS.filter((q) => topic === 'all' || q.topic === topic);
  const rank = (q) => { const a = p.answers[q.id]; return !a ? 1 : a.last === 'wrong' ? 0 : 2; };
  return shuffle(pool).sort((a, b) => rank(a) - rank(b)).slice(0, ROUND_SIZE).map((q) => q.id);
}

function choiceHTML(item, q, k, pos) {
  const isAnswer = k === q.answer;
  const answered = item.picked !== null;
  let cls = '';
  if (answered) {
    if (run.kind === 'test') cls = item.picked === k ? 'is-picked' : 'is-dim';
    else if (item.picked === k) cls = isAnswer ? 'is-right' : 'is-wrong';
    else if (isAnswer) cls = 'is-answer';
    else cls = 'is-dim';
  }
  const mark = cls === 'is-right' ? '<svg class="mark" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>'
    : cls === 'is-wrong' ? '<svg class="mark" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>' : '<span></span>';
  return `<li><button class="choice ${cls}" data-pick="${k}" ${answered ? 'disabled' : ''}>
    <span class="key" aria-hidden="true">${LETTERS[pos]}</span><span>${esc(q.choices[k])}</span>${mark}
  </button></li>`;
}

function renderQuiz(first = false) {
  const item = run.items[run.i];
  const q = byId[item.id];
  const answered = item.picked !== null;
  const right = answered && item.picked === q.answer;
  const lane = run.items.map((it, idx) => {
    let c = idx === run.i ? 'now' : '';
    if (it.picked !== null) c = run.kind === 'test' ? 'done' : (it.picked === byId[it.id].answer ? 'done' : 'miss');
    return `<i class="${c}"></i>`;
  }).join('');
  const isLast = run.i === run.items.length - 1;
  const activeNav = run.kind === 'test' ? 'test' : run.kind === 'review' ? 'review' : 'practice';

  const body = `
    <div class="quiz-top">
      <span class="where"><b class="num">${run.i + 1} of ${run.items.length}</b>${esc(run.label)}</span>
      <button class="exit" data-action="exit">${run.kind === 'test' ? 'End test' : 'Done'}</button>
    </div>
    <div class="lane" role="progressbar" aria-valuemin="0" aria-valuemax="${run.items.length}" aria-valuenow="${run.items.filter((x) => x.picked !== null).length}">${lane}</div>
    <div class="qcard ${first ? '' : 'slide-in'}">
      <div class="qwrap">
        <div>
          <p class="qtext" id="qtext">${esc(q.q)}</p>
        </div>
        ${q.sign && SIGNS[q.sign] ? `<div class="qsign">${SIGNS[q.sign]}</div>` : ''}
      </div>
      <ol class="choices" aria-labelledby="qtext">${item.order.map((k, pos) => choiceHTML(item, q, k, pos)).join('')}</ol>
      ${run.kind !== 'test' ? `
      <div class="feedback ${answered ? (right ? 'right' : 'wrong') : ''}" aria-live="polite">
        <div>${answered ? `<div class="feedback-inner">
          <div class="verdict">${right ? 'Correct' : 'Not quite'}</div>
          <p class="why">${esc(q.why)}</p>
          <div class="cite">Driver Guide section ${q.ref}, page ${q.page}</div>
        </div>` : ''}</div>
      </div>` : ''}
      <div class="actions">
        ${answered || run.kind === 'test'
          ? `<button class="btn" data-action="next" ${run.kind === 'test' && !answered ? 'disabled' : ''}>${isLast ? (run.kind === 'test' ? 'See my score' : 'Finish') : 'Next question'} <kbd>Enter</kbd></button>`
          : ''}
        <span class="hint">Keys: A–${LETTERS[q.choices.length - 1]} to answer${answered ? ', Enter for next' : ''}</span>
      </div>
    </div>`;

  if (!document.getElementById('main') || first) {
    app.innerHTML = shell(activeNav, body);
  } else {
    document.querySelector('#main .page').innerHTML = body;
    document.querySelector('#main .page').classList.remove('enter');
  }
  if (answered && run.kind !== 'test') requestAnimationFrame(() => document.querySelector('.feedback')?.classList.add('open'));
}

function pick(k) {
  const item = run.items[run.i];
  if (item.picked !== null) return;
  item.picked = k;
  const q = byId[item.id];
  const correct = k === q.answer;
  store.recordAnswer(session.username, q.id, correct, { fromReview: run.kind === 'review' });
  if (run.kind === 'test') {
    renderQuiz();
    setTimeout(() => { if (run && run.items[run.i] === item) next(); }, 420);
  } else {
    // Keep the question in place; only the choices and feedback change.
    const page = document.querySelector('#main .page');
    const card = page.querySelector('.qcard');
    renderQuiz();
    page.querySelector('.qcard').classList.remove('slide-in');
    page.querySelector('[data-action="next"]')?.focus({ preventScroll: true });
    void card;
  }
}

function next() {
  if (!run) return;
  const item = run.items[run.i];
  if (item.picked === null) return;
  if (run.i === run.items.length - 1) return finish();
  const card = document.querySelector('.qcard');
  const go = () => { run.i++; renderQuiz(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (card && !matchMedia('(prefers-reduced-motion: reduce)').matches) { card.classList.add('slide-out'); setTimeout(go, 200); } else go();
}

function finish() {
  const r = run; run = null;
  const done = r.items.filter((x) => x.picked !== null);
  const correct = done.filter((x) => x.picked === byId[x.id].answer).length;
  const wrong = done.filter((x) => x.picked !== byId[x.id].answer);
  const total = r.items.length;

  if (r.kind === 'test') {
    const need = Math.ceil(total * PASS_RATE);
    const passed = correct >= need;
    store.recordTest(session.username, { score: correct, total, passed });
    app.innerHTML = shell('test', `
      <div class="result">
        <section class="sign drop ${passed ? '' : 'fail'}" aria-live="polite">
          <div><div class="verdict-big">${passed ? 'You passed' : 'Not a pass yet'}</div>
            <div class="sign-sub">${passed ? `You needed ${need}. Nice driving.` : `You needed ${need} correct to pass. Review the misses below, then try again.`}</div></div>
          <div class="score num">${correct}<small>/ ${total}</small></div>
        </section>
        ${wrong.length ? `<div class="section"><h2>What you missed</h2><ul class="review-list">
          ${wrong.map((x) => { const q = byId[x.id]; return `<li>${thumb(q)}<div><div class="q">${esc(q.q)}</div><div class="a">You chose “${esc(q.choices[x.picked])}”. Answer: <b>${esc(q.choices[q.answer])}</b>. ${esc(q.why)} <span class="muted">(Section ${q.ref}, p. ${q.page})</span></div></div></li>`; }).join('')}
        </ul></div>` : ''}
        <div class="actions">
          <button class="btn" data-go="#/test/run">Take another test</button>
          ${wrong.length ? '<button class="btn secondary" data-go="#/review">Review mistakes</button>' : ''}
          <button class="btn secondary" data-go="#/">Home</button>
        </div>
      </div>`);
    return;
  }

  const left = store.progress(session.username).missed.length;
  app.innerHTML = shell(r.kind === 'review' ? 'review' : 'practice', `
    <div class="result">
      <section class="sign drop">
        <div><div class="verdict-big">${r.kind === 'review' ? 'Review done' : 'Round done'}</div>
          <div class="sign-sub">${r.label}${r.kind === 'review' ? `. ${left ? `${left} still to fix.` : 'Every mistake is fixed.'}` : ''}</div></div>
        <div class="score num">${correct}<small>/ ${done.length}</small></div>
      </section>
      <div class="actions">
        ${r.kind === 'review' ? `<button class="btn" data-go="#/review/${r.which}" ${r.which === 'fix' && !left ? 'disabled' : ''}>Another review round</button>` : ''}
        ${r.kind === 'practice' ? `<button class="btn" data-again>Practice again</button>` : ''}
        <button class="btn secondary" data-go="#/">Home</button>
      </div>
    </div>`);
  app.querySelector('[data-again]')?.addEventListener('click', () => { location.hash = '#/practice/' + (r.topic || 'all'); route(); });
}

// ───────────────────────── Test intro, review ─────────────────────────
function renderTestIntro() {
  const n = Math.min(TEST_LENGTH, QUESTIONS.length);
  app.innerHTML = shell('test', `
    <h1>Mock test</h1>
    <p class="lede">The real test has 40 questions and you need 32 right. This one works the same way: no hints along the way, your score and every miss at the end.</p>
    <p class="muted">Each test draws ${n} questions at random from all ${QUESTIONS.length}, spread across every topic.</p>
    <div class="actions"><button class="btn" data-go="#/test/run">Start the test</button></div>
  `);
}

function startTest() {
  const ids = shuffle(QUESTIONS.map((q) => q.id)).slice(0, TEST_LENGTH);
  startRun('test', ids, 'Mock test');
}

// Every question ever answered wrong, most-missed first. This log never clears.
function mistakeLog(p) {
  return Object.entries(p.answers)
    .filter(([id, a]) => byId[id] && a.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong || (b[1].at || 0) - (a[1].at || 0))
    .map(([id, a]) => ({ id, ...a }));
}
const toFix = (p) => p.missed.filter((id) => byId[id]);

function renderReview() {
  const p = store.progress(session.username);
  const fix = toFix(p);
  const log = mistakeLog(p);
  if (!log.length) {
    app.innerHTML = shell('review', `
      <h1>Review mistakes</h1>
      <p class="lede">Anything you get wrong lands here, so you can come back to it.</p>
      <p class="empty">No mistakes yet. Try a topic or a mock test, and missed questions will show up here.</p>
      <div class="actions"><button class="btn" data-go="#/practice">Practice a topic</button></div>`);
    return;
  }
  app.innerHTML = shell('review', `
    <h1>Review mistakes</h1>
    <p class="lede">Two ways to go back over what you missed.</p>
    <div class="topics review-choices">
      <button class="topic" data-go="#/review/fix" ${fix.length ? '' : 'disabled'}>
        <span class="shield shield-amber num">${fix.length}</span>
        <span><b>Still to fix</b><span>${fix.length ? 'Missed and not yet answered right. Each one leaves this list when you get it right.' : 'All caught up. Every mistake has been answered right since.'}</span></span>
        <span></span>
      </button>
      <button class="topic" data-go="#/review/all">
        <span class="shield num">${log.length}</span>
        <span><b>Everything you’ve missed</b><span>Every question you’ve ever gotten wrong, including ones you’ve since fixed.</span></span>
        <span></span>
      </button>
    </div>
    <div class="section"><h2>Your mistake log</h2>
      <p class="muted" style="margin-top:-6px">Most-missed first. This list keeps everything, even after you get a question right.</p>
      <ul class="review-list log">
        ${log.map((a) => { const q = byId[a.id]; const open = p.missed.includes(a.id); return `<li class="${open ? '' : 'fixed'}">${thumb(q)}<div>
          <div class="q">${esc(q.q)}</div>
          <div class="a">Missed ${a.wrong} time${a.wrong === 1 ? '' : 's'}${a.right ? `, right ${a.right}` : ''}. ${open ? '<span class="pill fail">Still to fix</span>' : '<span class="pill pass">Fixed</span>'}<br>Answer: <b>${esc(q.choices[q.answer])}</b> <span class="muted">(Section ${q.ref}, p. ${q.page})</span></div>
        </div></li>`; }).join('')}
      </ul>
    </div>`);
}

function startReview(which) {
  const p = store.progress(session.username);
  const ids = which === 'all' ? mistakeLog(p).map((a) => a.id) : toFix(p);
  if (!ids.length) { location.hash = '#/review'; return; }
  startRun('review', shuffle(ids).slice(0, ROUND_SIZE), which === 'all' ? 'Everything you’ve missed' : 'Still to fix');
  run.which = which;
}

// ───────────────────────── Flashcards ─────────────────────────
function renderCards() {
  let filter = 'all';
  let deck = [];
  let i = 0;
  const build = () => { deck = shuffle(QUESTIONS.filter((q) => filter === 'all' || q.topic === filter)); i = 0; };
  build();
  app.innerHTML = shell('cards', `
    <h1>Flashcards</h1>
    <p class="lede">Read the question, say your answer, then flip. Space flips, arrow keys move.</p>
    <div class="filters" role="group" aria-label="Topic">
      <button class="chip" data-filter="all" aria-pressed="true">All topics</button>
      ${TOPICS.filter((t) => QUESTIONS.some((q) => q.topic === t.id)).map((t) => `<button class="chip" data-filter="${t.id}" aria-pressed="false">${esc(t.name)}</button>`).join('')}
    </div>
    <div class="deck"><button class="card" aria-live="polite"></button></div>
    <div class="deck-bar">
      <button class="btn secondary" data-card="prev">Previous</button>
      <span class="muted num" data-pos></span>
      <button class="btn" data-card="next">Next card</button>
    </div>`);
  const card = app.querySelector('.card');
  const show = (dir = 0) => {
    const q = deck[i];
    const paint = () => {
      card.classList.remove('flipped');
      card.innerHTML = `
        <div class="face front">${q.sign && SIGNS[q.sign] ? `<div class="card-sign">${SIGNS[q.sign]}</div>` : ''}<span class="tag">${esc(topicName(q.topic))}</span><div class="q">${esc(q.q)}</div><span class="flip-hint">Tap or press space to flip</span></div>
        <div class="face back"><span class="tag">Answer: ${esc(q.choices[q.answer])}</span><div class="fact">${esc(q.fact)}</div><span class="tag">Section ${q.ref}, page ${q.page}</span></div>`;
      card.setAttribute('aria-label', 'Flashcard. Press to flip.');
      app.querySelector('[data-pos]').textContent = `${i + 1} of ${deck.length}`;
      if (dir) { card.animate([{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.16,1,.3,1)' }); }
    };
    if (card.classList.contains('flipped') && dir) { card.classList.remove('flipped'); setTimeout(paint, 220); } else paint();
  };
  card.addEventListener('click', () => card.classList.toggle('flipped'));
  app.querySelector('[data-card=prev]').addEventListener('click', () => { i = (i - 1 + deck.length) % deck.length; show(-1); });
  app.querySelector('[data-card=next]').addEventListener('click', () => { i = (i + 1) % deck.length; show(1); });
  app.querySelector('.filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]'); if (!b) return;
    filter = b.dataset.filter;
    app.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    build(); show(1);
  });
  cardKeys = (e) => {
    if (e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
    if (e.key === 'ArrowRight') app.querySelector('[data-card=next]').click();
    if (e.key === 'ArrowLeft') app.querySelector('[data-card=prev]').click();
  };
  show();
}
let cardKeys = null;

// ───────────────────────── Parent view ─────────────────────────
async function renderParent() {
  app.innerHTML = shell('home', '<p class="muted">Loading progress…</p>');
  try { await store.loadWatched(); } catch { app.innerHTML = shell('home', '<h1>Couldn’t load progress</h1><p class="lede">Check your internet connection, then refresh the page.</p>'); return; }
  const kid = session.watches;
  const p = store.progress(kid);
  const answered = Object.keys(p.answers).length;
  const best = p.tests.reduce((b, t) => Math.max(b, pct(t.score, t.total)), 0);
  const lastAt = Math.max(0, ...Object.values(p.answers).map((a) => a.at || 0), ...p.tests.map((t) => t.at));
  const weak = Object.entries(p.answers)
    .filter(([id, a]) => byId[id] && a.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong || (a[1].last === 'wrong' ? -1 : 1))
    .slice(0, 6);
  app.innerHTML = shell('home', `
    <h1>${esc(kid)}’s progress</h1>
    <p class="lede">${lastAt ? `Last practiced ${when(lastAt)}.` : `${esc(kid)} hasn’t practiced yet. Progress shows up here as soon as they answer a question.`}</p>
    ${guideSign(p, { clickable: false, who: kid })}
    <div class="stats">
      <div class="stat"><b>${answered}<span class="muted" style="font-size:.6em"> / ${QUESTIONS.length}</span></b><span>Questions tried</span></div>
      <div class="stat"><b>${p.tests.length}</b><span>Mock tests taken</span></div>
      <div class="stat"><b>${p.tests.length ? best + '%' : '—'}</b><span>Best mock test</span></div>
      <div class="stat"><b>${p.missed.length}</b><span>Mistakes still to fix</span></div>
    </div>
    <div class="section"><h2>Mock tests</h2>
      ${p.tests.length ? `<table class="table"><thead><tr><th>When</th><th>Score</th><th>Result</th></tr></thead><tbody>
        ${p.tests.slice(0, 10).map((t) => `<tr><td>${when(t.at)}</td><td class="num">${t.score} / ${t.total} (${pct(t.score, t.total)}%)</td><td><span class="pill ${t.passed ? 'pass' : 'fail'}">${t.passed ? 'Pass' : 'Not yet'}</span></td></tr>`).join('')}
      </tbody></table>` : '<p class="empty">No mock tests yet.</p>'}
    </div>
    <div class="section"><h2>Trickiest questions</h2>
      ${weak.length ? `<ul class="review-list">${weak.map(([id, a]) => { const q = byId[id]; return `<li>${thumb(q)}<div><div class="q">${esc(q.q)}</div><div class="a">Missed ${a.wrong} time${a.wrong === 1 ? '' : 's'}, right ${a.right}. ${a.last === 'right' ? 'Got it right most recently.' : 'Still missing it.'} Answer: <b>${esc(q.choices[q.answer])}</b></div></div></li>`; }).join('')}</ul>`
        : '<p class="empty">No missed questions so far.</p>'}
    </div>`);
}

// ───────────────────────── Router ─────────────────────────
function route() {
  cardKeys = null;
  session = store.session();
  if (!session) { run = null; return renderGate(); }
  const [, a, b] = (location.hash || '#/').split('/');
  if (session.role === 'parent') { run = null; return renderParent(); }
  if (a === 'practice' && b) {
    const t = b === 'all' ? 'all' : TOPICS.find((x) => x.id === b)?.id;
    if (!t) { location.hash = '#/practice'; return; }
    startRun('practice', practiceOrder(t), t === 'all' ? 'All topics' : topicName(t));
    run.topic = t;
    return;
  }
  run = null;
  if (a === 'practice') return renderTopics();
  if (a === 'test' && b === 'run') return startTest();
  if (a === 'test') return renderTestIntro();
  if (a === 'review' && (b === 'fix' || b === 'all')) return startReview(b);
  if (a === 'review') return renderReview();
  if (a === 'cards') return renderCards();
  renderHome();
}

// Clicks: navigation, answers, actions
app.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) { const h = go.dataset.go; if (location.hash === h) route(); else location.hash = h; return; }
  const p = e.target.closest('[data-pick]');
  if (p && run) return pick(Number(p.dataset.pick));
  const act = e.target.closest('[data-action]')?.dataset.action;
  if (act === 'next') return next();
  if (act === 'exit') {
    if (run?.kind === 'test' && run.items.some((x) => x.picked !== null)) {
      run.items = run.items.filter((x) => x.picked !== null); run.i = run.items.length - 1; return finish();
    }
    if (run && run.kind !== 'test' && run.items.some((x) => x.picked !== null)) { run.items = run.items.filter((x) => x.picked !== null); return finish(); }
    run = null; location.hash = '#/'; return;
  }
  if (act === 'signout') { store.signOut().then(() => { location.hash = '#/'; route(); }); }
});

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  if (cardKeys) return cardKeys(e);
  if (!run) return;
  const item = run.items[run.i];
  const key = e.key.toUpperCase();
  const pos = LETTERS.indexOf(key) >= 0 ? LETTERS.indexOf(key) : /^[1-5]$/.test(key) ? Number(key) - 1 : -1;
  if (pos >= 0 && pos < item.order.length && item.picked === null) { e.preventDefault(); pick(item.order[pos]); }
  else if ((e.key === 'Enter' || e.key === 'ArrowRight') && item.picked !== null) { e.preventDefault(); next(); }
});

window.addEventListener('hashchange', route);
store.onStatus((st) => {
  const el = document.querySelector('[data-sync]');
  if (!el) return;
  el.textContent = st === 'error' ? 'Couldn’t save the last answer. Check your connection; it will retry with your next answer.' : st === 'saving' ? 'Saving…' : 'All progress saved to this account.';
  el.classList.toggle('sync-error', st === 'error');
});
// If a newer version has been published, load it. GitHub Pages lets browsers reuse a cached
// page for up to 10 minutes, so without this someone could keep using an older build.
const APP_VERSION = '6';
fetch('version.json', { cache: 'no-store' }).then((r) => r.json()).then(({ v }) => {
  const url = new URL(location.href);
  if (v && v !== APP_VERSION && url.searchParams.get('v') !== v) {
    url.searchParams.set('v', v);
    location.replace(url.toString());
  }
}).catch(() => {});

await store.ready;
route();
