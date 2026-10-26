// Accounts and progress.
// With a Firebase config present, accounts live in Firebase Auth and progress in Firestore, so a
// student's progress follows them to any device and a linked parent account can read it.
// Without one, everything falls back to this browser's localStorage.
import { firebaseConfig } from './firebase-config.js?v=3';

const EMPTY = () => ({ answers: {}, missed: [], tests: [] });
const clean = (u) => (u || '').trim().toLowerCase();

function validate({ username, password }) {
  if (!/^[a-z0-9._-]{3,24}$/.test(username)) throw new Error('Usernames are 3–24 letters, numbers, dots or dashes.');
  if ((password || '').length < 6) throw new Error('Passwords need at least 6 characters.');
}

// ───────────────────────── Firebase backend ─────────────────────────
async function firebaseBackend() {
  const fb = await import('./vendor/firebase.js?v=3');
  const app = fb.initializeApp(firebaseConfig);
  const auth = fb.getAuth(app);
  const db = fb.getFirestore(app);
  const emailFor = (u) => `${u}@${firebaseConfig.authDomain}`;

  let session = null;
  const cache = new Map(); // username -> progress
  const uidOf = new Map(); // username -> uid
  const listeners = new Set();
  const status = (s) => listeners.forEach((fn) => fn(s));

  const friendly = (e) => {
    const code = e?.code || '';
    if (code.includes('email-already-in-use')) return new Error('That username is taken. Sign in instead, or pick another.');
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email'))
      return new Error('Username or password doesn’t match. Check both and try again.');
    if (code.includes('too-many-requests')) return new Error('Too many tries. Wait a minute, then try again.');
    if (code.includes('network')) return new Error('Can’t reach the server. Check your internet connection and try again.');
    if (code.includes('weak-password')) return new Error('Passwords need at least 6 characters.');
    if (code.includes('permission-denied')) return new Error('The server refused that request. Check that the Firestore rules are published.');
    return e instanceof Error && !code ? e : new Error('Something went wrong (' + (code || 'unknown') + '). Try again.');
  };

  async function loadProfile(user) {
    const snap = await fb.getDoc(fb.doc(db, 'users', user.uid));
    if (!snap.exists()) return null;
    const p = snap.data();
    session = { username: p.username, role: p.role, watches: p.watchesName || null, uid: user.uid, watchesUid: p.watches || null };
    uidOf.set(p.username, user.uid);
    if (p.role === 'student') await loadProgress(p.username, user.uid);
    return session;
  }

  async function loadProgress(username, uid) {
    const snap = await fb.getDoc(fb.doc(db, 'progress', uid));
    const data = snap.exists() ? { ...EMPTY(), ...snap.data() } : EMPTY();
    cache.set(username, data);
    uidOf.set(username, uid);
    return data;
  }

  // Saves are queued so rapid answers don't race each other.
  let chain = Promise.resolve();
  function persist(username) {
    const uid = uidOf.get(username);
    const data = cache.get(username);
    if (!uid || !data) return;
    status('saving');
    chain = chain
      .then(() => fb.setDoc(fb.doc(db, 'progress', uid), JSON.parse(JSON.stringify(data))))
      .then(() => status('saved'))
      .catch(() => status('error'));
  }

  const ready = new Promise((resolve) => {
    const off = fb.onAuthStateChanged(auth, async (user) => {
      off();
      try { if (user) await loadProfile(user); } catch { session = null; }
      resolve();
    });
  });

  return {
    mode: 'synced',
    ready,
    onStatus(fn) { listeners.add(fn); },
    session: () => session,

    async signUp({ role, username, password, student }) {
      username = clean(username);
      validate({ username, password });
      const studentName = clean(student);
      if (role === 'parent' && !studentName) throw new Error('Enter your student’s username to link their progress.');
      let cred;
      try { cred = await fb.createUserWithEmailAndPassword(auth, emailFor(username), password); } catch (e) { throw friendly(e); }
      const uid = cred.user.uid;
      try {
        let watches = null;
        if (role === 'parent') {
          const s = await fb.getDoc(fb.doc(db, 'usernames', studentName));
          if (!s.exists() || s.data().role !== 'student') {
            await fb.deleteUser(cred.user).catch(() => {});
            throw new Error('No student account with that username yet. Create the student account first.');
          }
          watches = s.data().uid;
        }
        await fb.setDoc(fb.doc(db, 'usernames', username), { uid, role });
        await fb.setDoc(fb.doc(db, 'users', uid), { username, role, watches, watchesName: role === 'parent' ? studentName : null, created: Date.now() });
        if (role === 'student') await fb.setDoc(fb.doc(db, 'progress', uid), EMPTY());
        session = { username, role, watches: role === 'parent' ? studentName : null, uid, watchesUid: watches };
        uidOf.set(username, uid);
        if (role === 'student') cache.set(username, EMPTY());
        return session;
      } catch (e) {
        if (e.message?.startsWith('No student')) throw e;
        throw friendly(e);
      }
    },

    async signIn({ username, password }) {
      username = clean(username);
      try {
        const cred = await fb.signInWithEmailAndPassword(auth, emailFor(username), password);
        const s = await loadProfile(cred.user);
        if (!s) throw new Error('This account isn’t set up completely. Create it again with a new username.');
        return s;
      } catch (e) { throw e.code ? friendly(e) : e; }
    },

    async signOut() { session = null; cache.clear(); await fb.signOut(auth).catch(() => {}); },

    async loadWatched() {
      if (!session?.watchesUid) return EMPTY();
      return loadProgress(session.watches, session.watchesUid);
    },

    progress(username) { return cache.get(username) || EMPTY(); },

    recordAnswer(username, qid, correct, opts) {
      const p = applyAnswer(this.progress(username), qid, correct, opts);
      cache.set(username, p); persist(username); return p;
    },

    recordTest(username, result) {
      const p = applyTest(this.progress(username), result);
      cache.set(username, p); persist(username);
    },
  };
}

// ───────────────────────── Local (this browser only) backend ─────────────────────────
function localBackend() {
  const K = { users: 'wadp.users', session: 'wadp.session', progress: (u) => `wadp.progress.${u}` };
  const read = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } };
  const hash = async (text) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    mode: 'device',
    ready: Promise.resolve(),
    onStatus() {},
    session: () => read(K.session, null),
    async signUp({ role, username, password, student }) {
      username = clean(username);
      validate({ username, password });
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
    async signOut() { try { localStorage.removeItem(K.session); } catch { /* ignore */ } },
    async loadWatched() { return this.progress(this.session()?.watches); },
    progress(username) { return { ...EMPTY(), ...read(K.progress(username), {}) }; },
    recordAnswer(username, qid, correct, opts) {
      const p = applyAnswer(this.progress(username), qid, correct, opts);
      write(K.progress(username), p); return p;
    },
    recordTest(username, result) { write(K.progress(username), applyTest(this.progress(username), result)); },
  };
}

// ───────────────────────── Shared progress rules ─────────────────────────
// `answers[qid]` keeps right/wrong counts forever (that is the permanent mistake log).
// `missed` is the "still to fix" list: added on a wrong answer, removed on the next right one.
function applyAnswer(p, qid, correct) {
  const a = { right: 0, wrong: 0, ...(p.answers[qid] || {}) };
  correct ? a.right++ : a.wrong++;
  a.last = correct ? 'right' : 'wrong';
  a.at = Date.now();
  p.answers[qid] = a;
  const missed = new Set(p.missed);
  correct ? missed.delete(qid) : missed.add(qid);
  p.missed = [...missed];
  return p;
}

function applyTest(p, result) {
  p.tests = [{ ...result, at: Date.now() }, ...p.tests].slice(0, 50);
  return p;
}

export const store = firebaseConfig?.apiKey ? await firebaseBackend().catch((e) => { console.error('Firebase failed to load; using this device only.', e); return localBackend(); }) : localBackend();
