// Accounts + progress. This preview keeps everything in the browser (localStorage).
// The full version swaps this file for a synced backend with the same functions,
// so progress follows the student across devices.

const K = { users: 'wadp.users', session: 'wadp.session', progress: (u) => `wadp.progress.${u}` };

const read = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } };

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const clean = (u) => (u || '').trim().toLowerCase();

export const store = {
  mode: 'device', // 'device' in the preview; 'synced' once the backend is connected

  session() { return read(K.session, null); },

  async signUp({ role, username, password, student }) {
    username = clean(username);
    if (!/^[a-z0-9._-]{3,24}$/.test(username)) throw new Error('Usernames are 3–24 letters, numbers, dots or dashes.');
    if ((password || '').length < 6) throw new Error('Passwords need at least 6 characters.');
    const users = read(K.users, {});
    if (users[username]) throw new Error('That username is taken. Sign in instead, or pick another.');
    let watches = null;
    if (role === 'parent') {
      watches = clean(student);
      if (!users[watches] || users[watches].role !== 'student') throw new Error('No student account with that username yet. Create the student account first.');
    }
    users[username] = { role, pw: await hash(username + ':' + password), watches };
    write(K.users, users);
    const s = { username, role, watches };
    write(K.session, s);
    return s;
  },

  async signIn({ username, password }) {
    username = clean(username);
    const u = read(K.users, {})[username];
    if (!u || u.pw !== (await hash(username + ':' + password))) throw new Error('Username or password doesn’t match. Check both and try again.');
    const s = { username, role: u.role, watches: u.watches };
    write(K.session, s);
    return s;
  },

  signOut() { try { localStorage.removeItem(K.session); } catch { /* ignore */ } },

  progress(username) {
    return read(K.progress(username), { answers: {}, missed: [], tests: [] });
  },

  recordAnswer(username, qid, correct, { fromReview = false } = {}) {
    const p = this.progress(username);
    const a = p.answers[qid] || { right: 0, wrong: 0 };
    correct ? a.right++ : a.wrong++;
    a.last = correct ? 'right' : 'wrong';
    a.at = Date.now();
    p.answers[qid] = a;
    const missed = new Set(p.missed);
    if (!correct) missed.add(qid);
    else if (fromReview || missed.has(qid)) missed.delete(qid);
    p.missed = [...missed];
    write(K.progress(username), p);
    return p;
  },

  recordTest(username, result) {
    const p = this.progress(username);
    p.tests.unshift({ ...result, at: Date.now() });
    p.tests = p.tests.slice(0, 50);
    write(K.progress(username), p);
  },
};
