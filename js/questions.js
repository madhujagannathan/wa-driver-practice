// Question bank — every question is grounded in the Washington Driver Guide (DOL, 2025 edition).
// `ref` is the guide section, `page` the PDF page, `fact` a one-line takeaway used by flashcards.
// `sign` (optional) names an illustration from signs.js.

export const GUIDE_EDITION = 'Washington Driver Guide, 2025 edition';

export const TOPICS = [
  { id: 'licenses', name: 'Licenses & the law', chapter: '1' },
  { id: 'vehicles', name: 'Your vehicle', chapter: '2' },
  { id: 'drivers', name: 'You behind the wheel', chapter: '3' },
  { id: 'sharing', name: 'Sharing the road', chapter: '4.0–4.9' },
  { id: 'rules', name: 'Signals, signs & parking', chapter: '4.10–4.20' },
  { id: 'risks', name: 'Speed, space & risks', chapter: '5' },
];

export const QUESTIONS = [
  // ── Licenses & the law ─────────────────────────────────────────
  {
    id: 'lic-bac-minor', topic: 'licenses', ref: '1.15', page: 37,
    q: 'A driver under 21 can be charged with DUI at what blood alcohol concentration (BAC)?',
    choices: ['0.00%', '0.02% or more', '0.05% or more', '0.08% or more'],
    answer: 1,
    why: 'Drivers 21 and older face DUI at 0.08%. Drivers under 21 face the same consequences at just 0.02%.',
    fact: 'Under 21: DUI at 0.02% BAC. 21 and over: 0.08%.',
  },
  {
    id: 'lic-refuse-test', topic: 'licenses', ref: '1.15', page: 37,
    q: 'Under the Implied Consent Law, what can happen if you refuse a breath or blood test when an officer suspects impairment?',
    choices: [
      'Nothing — testing is optional',
      'A warning is added to your record',
      'You can lose your driving privilege for 90 to 730 days, or until age 21 if that is longer',
      'You must retake the knowledge test',
    ],
    answer: 2,
    why: 'Everyone who drives in Washington agrees in advance to be tested. Refusing can suspend your privilege for 90–730 days, or until you turn 21, whichever is longer.',
    fact: 'Refusing a test: 90–730 day loss of privilege, or until 21 if longer.',
  },
  {
    id: 'lic-thc-adult', topic: 'licenses', ref: '1.15', page: 37,
    q: 'For a driver 21 or older, how much active THC in the blood is considered DUI?',
    choices: ['Any amount above 0 ng/mL', 'More than 5 ng/mL', 'More than 10 ng/mL', 'THC is not covered by DUI law'],
    answer: 1,
    why: 'At 21+, more than 5 nanograms of active THC per milliliter of blood is DUI. Under 21, any amount above zero counts.',
    fact: 'THC: over 5 ng/mL is DUI at 21+; anything above 0 under 21.',
  },
  {
    id: 'lic-open-container', topic: 'licenses', ref: '1.15', page: 39,
    q: 'Where may an opened container of alcohol or cannabis be carried in a vehicle?',
    choices: ['In the glove box', 'Under the passenger seat', 'In the trunk or truck bed', 'Anywhere, if a passenger holds it'],
    answer: 2,
    why: 'Open alcohol and cannabis products may only travel in the trunk or truck bed — never in a compartment the driver can reach.',
    fact: 'Open containers ride in the trunk or truck bed only.',
  },
  {
    id: 'lic-address', topic: 'licenses', ref: '1.16', page: 39,
    q: 'After you move, how soon must you update your address with the Department of Licensing?',
    choices: ['Within 10 days', 'Within 30 days', 'Within 60 days', 'At your next renewal'],
    answer: 0,
    why: 'Address changes go into License Express within 10 days. Name changes must be done in person at a licensing office.',
    fact: 'Moved? Update your address within 10 days.',
  },

  // ── Your vehicle ──────────────────────────────────────────────
  {
    id: 'veh-high-beams', topic: 'vehicles', ref: '2.5', page: 50,
    q: 'When using high beams on an open road, switch back to regular headlights when an oncoming vehicle is within…',
    choices: ['100 feet', '300 feet', '500 feet', '1,000 feet'],
    answer: 2,
    why: 'Dim your lights within 500 feet of an oncoming vehicle, and within 300 feet when you are following another vehicle.',
    fact: 'Dim high beams: 500 ft from oncoming traffic, 300 ft when following.',
  },
  {
    id: 'veh-signal-distance', topic: 'vehicles', ref: '2.5', page: 50,
    q: 'How far ahead should you turn on your signal before turning or changing lanes?',
    choices: ['25 feet', '50 feet', '100 feet', 'Only when other cars are nearby'],
    answer: 2,
    why: 'Signal 100 feet before you move — and build the habit of signaling even when nobody seems to be around.',
    fact: 'Signal at least 100 feet before you turn or change lanes.',
  },
  {
    id: 'veh-front-seat', topic: 'vehicles', ref: '2.6', page: 54,
    q: 'Because of airbags, children under what age should never ride in the front seat?',
    choices: ['8', '10', '13', '16'],
    answer: 2,
    why: 'A deploying airbag can seriously injure or kill a child. Children under 13 belong in the back seat.',
    fact: 'Children under 13 ride in the back seat.',
  },

  // ── You behind the wheel ─────────────────────────────────────
  {
    id: 'drv-distracted-fines', topic: 'drivers', ref: '3.4', page: 86,
    q: 'What happens to fines for a second or later distracted-driving violation?',
    choices: ['They stay the same', 'They can be doubled', 'They are replaced by a warning', 'They are reduced if you take a class'],
    answer: 1,
    why: 'A distracted-driving ticket can carry heavy fines, and fines after your first violation can be doubled.',
    fact: 'Distracted driving: fines can double after the first violation.',
  },

  // ── Sharing the road ─────────────────────────────────────────
  {
    id: 'shr-bus-median', topic: 'sharing', ref: '4.2', page: 97,
    q: 'You are approaching a stopped school bus with flashing red lights from the opposite direction. The lanes are separated by a median. What should you do?',
    choices: [
      'Stop until the red lights stop flashing',
      'You do not need to stop, but watch for children',
      'Stop, then proceed after 10 seconds',
      'Use the center turn lane to pass',
    ],
    answer: 1,
    why: 'Oncoming traffic does not have to stop on a road with three or more lanes, or when lanes are separated by a median or barrier. Traffic behind the bus always stops.',
    fact: 'Opposite direction, 3+ lanes or a median: no need to stop for a school bus.',
  },
  {
    id: 'shr-bus-two-lane', topic: 'sharing', ref: '4.2', page: 96,
    q: 'On a two-lane road, a school bus ahead of you (coming toward you) stops with red lights flashing and its stop sign out. You must:',
    choices: [
      'Stop — every vehicle in both directions stops',
      'Slow to 20 mph and pass carefully',
      'Stop only if children are in the road',
      'Honk to let the driver know you are passing',
    ],
    answer: 0,
    why: 'On a two-lane road, all traffic in both directions stops. You may go once the lights stop, the sign folds in, and the arm returns to the bumper.',
    fact: 'Two-lane road: everyone stops for a school bus’s red lights.',
  },
  {
    id: 'shr-train-distance', topic: 'sharing', ref: '4.7', page: 105,
    q: 'When a railroad crossing signal is flashing, where should you stop?',
    choices: [
      'Right at the crossing gate',
      'Between 15 and 50 feet from the nearest rail',
      'At least 100 feet from the tracks',
      'On the tracks if traffic is backed up',
    ],
    answer: 1,
    sign: 'crossbuck',
    why: 'Stop 15 to 50 feet from the nearest rail, whether or not the gate is down. A train can need up to a mile to stop.',
    fact: 'At railroad crossings, stop 15–50 feet from the nearest rail.',
  },
  {
    id: 'shr-emergency', topic: 'sharing', ref: '4.9', page: 107,
    q: 'An ambulance with its siren on is coming up behind you. What should you do?',
    choices: [
      'Speed up to stay out of its way',
      'Stop right where you are',
      'Pull to the right side of the road and stop',
      'Move to the left lane',
    ],
    answer: 2,
    why: 'As soon as you see or hear an emergency vehicle, pull to the right and stop. Wait until it passes, then signal and rejoin traffic.',
    fact: 'Siren or lights behind you: pull right and stop.',
  },

  // ── Signals, signs & parking ─────────────────────────────────
  {
    id: 'rul-flashing-red', topic: 'rules', ref: '4.11', page: 110,
    q: 'What does a flashing red traffic light mean?',
    choices: [
      'Slow down and proceed with caution',
      'Treat it exactly like a stop sign',
      'The light is broken — go if clear',
      'Stop only if cross traffic is present',
    ],
    answer: 1,
    sign: 'signal-flashing-red',
    why: 'A flashing red light works like a stop sign: come to a full stop, then go when it is your turn.',
    fact: 'Flashing red = stop sign.',
  },
  {
    id: 'rul-flashing-yellow', topic: 'rules', ref: '4.11', page: 111,
    q: 'A flashing yellow light has the same meaning as which sign?',
    choices: ['Stop', 'Yield', 'Do not enter', 'Railroad crossing'],
    answer: 1,
    sign: 'signal-flashing-yellow',
    why: 'Flashing yellow means slow down and treat the intersection as uncontrolled — proceed when you have the right-of-way, as with a yield sign.',
    fact: 'Flashing yellow = yield.',
  },
  {
    id: 'rul-red-left-oneway', topic: 'rules', ref: '4.11', page: 110,
    q: 'After a complete stop at a red light, when may you turn left?',
    choices: [
      'Never',
      'Onto a one-way street, if no sign prohibits it and there is room',
      'Onto any street, if no cars are coming',
      'Only with a green arrow',
    ],
    answer: 1,
    why: 'Like a right on red, a left on red is allowed onto a one-way street after a full stop, unless a “no turn on red” sign is posted.',
    fact: 'Left on red is allowed only onto a one-way street (after a full stop).',
  },
  {
    id: 'rul-yellow-in-intersection', topic: 'rules', ref: '4.11', page: 111,
    q: 'The light turns yellow while you are already in the intersection. What should you do?',
    choices: [
      'Stop immediately',
      'Speed up to clear it quickly',
      'Continue through at the posted speed',
      'Back up out of the intersection',
    ],
    answer: 2,
    sign: 'signal-yellow',
    why: 'If you are already in the intersection, continue through at the posted speed. You may not speed up past the limit to beat a yellow.',
    fact: 'Yellow while in the intersection: keep going at the posted speed.',
  },
  {
    id: 'rul-hydrant', topic: 'rules', ref: '4.18', page: 144,
    q: 'How close to a fire hydrant may you park?',
    choices: ['5 feet', '10 feet', '15 feet', '30 feet'],
    answer: 2,
    why: 'Do not park within 15 feet of a fire hydrant.',
    fact: 'Fire hydrant: no parking within 15 feet.',
  },
  {
    id: 'rul-stop-sign-parking', topic: 'rules', ref: '4.18', page: 143,
    q: 'You may not park within how many feet of a stop sign, yield sign, or traffic signal?',
    choices: ['15 feet', '20 feet', '30 feet', '50 feet'],
    answer: 2,
    sign: 'stop',
    why: 'Keep 30 feet clear of traffic signals, stop signs, and yield signs. (Railroad crossings need 50 feet; hydrants 15.)',
    fact: 'Stop sign, yield sign or signal: no parking within 30 feet.',
  },
  {
    id: 'rul-downhill', topic: 'rules', ref: '4.18', page: 149,
    q: 'You park facing downhill next to a curb. Which way should you turn your front wheels?',
    choices: ['Toward the curb', 'Away from the curb', 'Straight ahead', 'It does not matter if the parking brake is set'],
    answer: 0,
    why: 'Facing downhill, turn the wheels toward the curb so the car rolls into the curb if it moves. Always set the parking brake too.',
    fact: 'Downhill: wheels toward the curb.',
  },
  {
    id: 'rul-school-zone', topic: 'rules', ref: '4.17', page: 140,
    q: 'What is the speed limit in a school zone?',
    choices: ['15 mph', '20 mph', '25 mph', '30 mph'],
    answer: 1,
    why: 'School zone limit is 20 mph — higher speeds sharply raise the risk of fatal crashes. Signs may show when it applies.',
    fact: 'School zone: 20 mph.',
  },
  {
    id: 'rul-emergency-zone', topic: 'rules', ref: '4.17', page: 143,
    q: 'You see a tow truck with flashing lights on the shoulder. If you cannot move over a lane, you must:',
    choices: [
      'Keep the posted speed',
      'Slow to at least 10 mph below the posted limit, and never above 50 mph',
      'Stop completely until it leaves',
      'Honk to warn the workers',
    ],
    answer: 1,
    why: 'In an emergency zone, either move to a farther lane or slow to at least 10 mph under the limit — and never faster than 50 mph.',
    fact: 'Emergency zone: move over, or slow 10 mph below the limit (max 50).',
  },

  // ── Speed, space & risks ─────────────────────────────────────
  {
    id: 'rsk-following', topic: 'risks', ref: '5.2', page: 159,
    q: 'How much space should you leave between you and the vehicle ahead?',
    choices: [
      'At least one car length',
      'At least twice the length of your vehicle',
      'Exactly 10 feet',
      'Enough to read their license plate',
    ],
    answer: 1,
    why: 'Leave at least twice your vehicle’s length between you and the vehicle ahead — and more in bad conditions.',
    fact: 'Following distance: at least twice your vehicle’s length.',
  },
  {
    id: 'rsk-too-fast', topic: 'risks', ref: '5.1', page: 158,
    q: 'Can you get a ticket for speeding while driving under the posted limit?',
    choices: [
      'No, the posted limit is always legal',
      'Yes, if you are going too fast for road conditions',
      'Only on freeways',
      'Only in school zones',
    ],
    answer: 1,
    why: 'Speed limits are the maximum for ideal conditions. Washington law requires a speed safe for current conditions, such as rain, fog or ice.',
    fact: 'Speed limits are for ideal conditions — slow down when conditions are poor.',
  },
];
