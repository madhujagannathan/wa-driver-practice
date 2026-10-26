// Question bank — every question is written from the Washington Driver Guide (DOL, 2025 edition).
// Each question cites the guide section (`ref`) and PDF page (`page`). `fact` is the flashcard takeaway.
import ch1 from './data/ch1-licenses.js?v=5';
import ch2 from './data/ch2-vehicles.js?v=5';
import ch3 from './data/ch3-drivers.js?v=5';
import ch4a from './data/ch4a-sharing.js?v=5';
import ch4b from './data/ch4b-rules.js?v=5';
import ch5 from './data/ch5-risks.js?v=5';

export const GUIDE_EDITION = 'Washington Driver Guide, 2025 edition';

export const TOPICS = [
  { id: 'licenses', name: 'Licenses & the law', chapter: '1' },
  { id: 'vehicles', name: 'Your vehicle', chapter: '2' },
  { id: 'drivers', name: 'You behind the wheel', chapter: '3' },
  { id: 'sharing', name: 'Sharing the road', chapter: '4.0–4.9' },
  { id: 'signals', name: 'Traffic laws & signals', chapter: '4.10–4.11' },
  { id: 'signs', name: 'Signs', chapter: '4.12' },
  { id: 'intersections', name: 'Intersections & lanes', chapter: '4.13–4.16' },
  { id: 'zones', name: 'Zones & parking', chapter: '4.17–4.20' },
  { id: 'risks', name: 'Speed, space & emergencies', chapter: '5' },
];

// Chapter 4.10–4.20 questions are grouped by section; sign-identification questions all go to Signs.
function rulesTopic(q) {
  if (q.id.startsWith('sgn-') || q.ref === '4.12') return 'signs';
  const minor = Number(q.ref.split('.')[1]);
  if (minor <= 11) return 'signals';
  if (minor <= 16) return 'intersections';
  return 'zones';
}

export const QUESTIONS = [
  ...ch1.map((q) => ({ ...q, topic: 'licenses' })),
  ...ch2.map((q) => ({ ...q, topic: 'vehicles' })),
  ...ch3.map((q) => ({ ...q, topic: 'drivers' })),
  ...ch4a.map((q) => ({ ...q, topic: 'sharing' })),
  ...ch4b.map((q) => ({ ...q, topic: rulesTopic(q) })),
  ...ch5.map((q) => ({ ...q, topic: 'risks' })),
];
