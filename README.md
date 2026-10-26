# Road Ready

Practice app for the Washington State driver knowledge test. Every question is written from the official
[Washington Driver Guide](https://dol.wa.gov/media/pdf/4745/driver-guidepdf/download?inline) (2025 edition) and cites the section and page it comes from.

**428 questions** across nine topics, covering every chapter of the guide, with drawings of the signs, signals, hand signals and lane markings they ask about.

**Modes:** practice by topic (instant feedback and the rule behind each answer), a mock test that works like the real one (40 random questions, 32 correct to pass), review of mistakes (a "still to fix" list plus a permanent log of every question ever missed), and flashcards.

**Accounts:** students and parents sign in with a username and password. Progress is stored in Firebase (Auth + Firestore), so it follows the student to any device, and a parent account linked to a student can see their progress. Firestore security rules let each account change only its own data, and let a parent read only the student it's linked to.

This is a static site (plain HTML, CSS and JavaScript, no build step) served by GitHub Pages.

- `index.html` — page shell
- `css/app.css` — styles
- `js/questions.js` and `js/data/` — the question bank, one file per chapter
- `js/app.js` — screens and quiz logic
- `js/store.js` — sign-in and progress storage (Firebase, with a this-browser-only fallback)
- `js/firebase-config.js` — Firebase project identifiers (public by design)
- `js/vendor/firebase.js` — the Firebase JS SDK, bundled
- `js/signs.js` — traffic sign and signal drawings
- `fonts/` — Overpass, under the SIL Open Font License

Not affiliated with the Washington State Department of Licensing.
