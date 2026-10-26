# Road Ready

Practice app for the Washington State driver knowledge test. Every question is written from the official
[Washington Driver Guide](https://dol.wa.gov/media/pdf/4745/driver-guidepdf/download?inline) (2025 edition) and cites the section and page it comes from.

**Modes:** practice by topic (instant feedback and the rule behind each answer), a mock test that works like the real one (40 questions, 80% to pass), review of missed questions, and flashcards. Students and parents have separate sign-ins; the parent view shows the student's progress.

This is a static site (plain HTML, CSS and JavaScript, no build step) served by GitHub Pages.

- `index.html` — page shell
- `css/app.css` — styles
- `js/questions.js` — the question bank
- `js/app.js` — screens and quiz logic
- `js/store.js` — sign-in and progress storage
- `js/signs.js` — traffic sign and signal drawings
- `fonts/` — Overpass, under the SIL Open Font License

Not affiliated with the Washington State Department of Licensing.
