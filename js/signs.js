// SVG illustrations of standard traffic signs, signals, hand signals and markings.
// Drawn from scratch to the public MUTCD shapes and colors; no images are copied.

const C = {
  yellow: '#f6c200', black: '#1b1b1b', red: '#c8102e', white: '#ffffff', green: '#00704a',
  orange: '#f47b20', fyg: '#c4dc1c', blue: '#0b5ea8', brown: '#6b4226', road: '#3a4448',
};
const FONT = 'font-family="Overpass, Arial, sans-serif" font-weight="800"';
const svg = (vb, label, body) => `<svg viewBox="${vb}" role="img" aria-label="${label}">${body}</svg>`;
const text = (x, y, size, s, fill = C.black, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${size}" fill="${fill}" ${extra}>${s}</text>`;
const arrowHead = (x, y, dir, s = 9, fill = C.black) => {
  const pts = {
    up: [[x, y - s], [x - s, y + s * 0.4], [x + s, y + s * 0.4]],
    down: [[x, y + s], [x - s, y - s * 0.4], [x + s, y - s * 0.4]],
    right: [[x + s, y], [x - s * 0.4, y - s], [x - s * 0.4, y + s]],
    left: [[x - s, y], [x + s * 0.4, y - s], [x + s * 0.4, y + s]],
  }[dir];
  return `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}"/>`;
};
const stroke = (d, w = 8, color = C.black) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Yellow (or other) warning diamond with inner border
const diamond = (label, inner, fill = C.yellow, line = C.black) => svg('0 0 120 120', label, `
  <polygon points="60,3 117,60 60,117 3,60" fill="${fill}" stroke="${line}" stroke-width="1"/>
  <polygon points="60,9 111,60 60,111 9,60" fill="none" stroke="${line}" stroke-width="3"/>
  ${inner}`);

const walker = (x, y, s = 1, color = C.black) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="2" cy="-22" r="5" stroke="none"/>
  <path d="M0 -15 L-2 2" stroke-width="6" fill="none"/>
  <path d="M-2 2 L-9 18 M-2 2 L6 17" stroke-width="5" fill="none"/>
  <path d="M0 -12 L-9 -3 M0 -12 L9 -5" stroke-width="4.5" fill="none"/>
</g>`;

const signal = (lit, { flashing = false, arrow = null } = {}) => {
  const colors = { red: '#e5483c', yellow: '#f5b82e', green: '#2fbf71' };
  const lamp = (cy, name) => {
    const on = lit === name;
    const fl = on && flashing ? 'class="lamp-flash"' : '';
    if (on && arrow) {
      const a = { left: 'M52 0 H28 M36 -8 L28 0 L36 8', right: 'M28 0 H52 M44 -8 L52 0 L44 8' }[arrow];
      return `<circle cx="40" cy="${cy}" r="15" fill="#2c3438"/><g transform="translate(0 ${cy})" ${fl}><path d="${a}" stroke="${colors[name]}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
    return `<circle cx="40" cy="${cy}" r="15" fill="${on ? colors[name] : '#2c3438'}" ${fl}/>` +
      (on ? `<circle cx="40" cy="${cy}" r="22" fill="${colors[name]}" opacity=".18" ${fl}/>` : '');
  };
  return svg('0 0 80 150', `Traffic signal: ${flashing ? 'flashing ' : ''}${lit}${arrow ? ` ${arrow} arrow` : ''}`, `
    <rect x="12" y="4" width="56" height="142" rx="12" fill="#1b2326"/>
    <rect x="12" y="4" width="56" height="142" rx="12" fill="none" stroke="#f2c230" stroke-width="3"/>
    ${lamp(32, 'red')}${lamp(75, 'yellow')}${lamp(118, 'green')}`);
};

// Hand signals: driver's left arm out of the window, seen from behind the car
const hand = (pose, label) => {
  const arm = {
    left: 'M44 46 H8',
    right: 'M44 46 H18 V16',
    stop: 'M44 46 H18 V76',
  }[pose];
  return svg('0 0 140 110', label, `
    <rect x="40" y="30" width="92" height="60" rx="14" fill="#5a6b72"/>
    <rect x="50" y="36" width="72" height="26" rx="6" fill="#b9c8cd"/>
    <circle cx="70" cy="49" r="8" fill="#1d2a2f"/>
    <rect x="40" y="70" width="92" height="12" fill="#46555b"/>
    <rect x="46" y="90" width="18" height="12" rx="3" fill="#1d2a2f"/><rect x="108" y="90" width="18" height="12" rx="3" fill="#1d2a2f"/>
    ${stroke(arm, 9, '#c58b5c')}
    <circle cx="${pose === 'left' ? 8 : 18}" cy="${pose === 'left' ? 46 : pose === 'right' ? 14 : 78}" r="6" fill="#c58b5c"/>`);
};

export const SIGNS = {
  // ── Regulatory ──
  stop: svg('0 0 120 120', 'Stop sign', `
    <polygon points="35,2 85,2 118,35 118,85 85,118 35,118 2,85 2,35" fill="${C.red}"/>
    <polygon points="37,7 83,7 113,37 113,83 83,113 37,113 7,83 7,37" fill="none" stroke="#fff" stroke-width="3.5"/>
    ${text(60, 71, 31, 'STOP', '#fff', 'letter-spacing="1"')}`),
  yield: svg('0 0 120 108', 'Yield sign', `
    <polygon points="4,4 116,4 60,104" fill="${C.red}" stroke-linejoin="round"/>
    <polygon points="22,15 98,15 60,82" fill="#fff"/>
    ${text(60, 36, 16, 'YIELD', C.red)}`),
  'do-not-enter': svg('0 0 120 120', 'Do Not Enter sign', `
    <rect x="2" y="2" width="116" height="116" rx="8" fill="#fff" stroke="${C.black}" stroke-width="2"/>
    <circle cx="60" cy="60" r="52" fill="${C.red}"/>
    <rect x="18" y="51" width="84" height="18" fill="#fff"/>
    ${text(60, 40, 15, 'DO NOT', '#fff')}${text(60, 92, 15, 'ENTER', '#fff')}`),
  'wrong-way': svg('0 0 150 100', 'Wrong Way sign', `
    <rect x="2" y="2" width="146" height="96" rx="6" fill="${C.red}"/>
    <rect x="8" y="8" width="134" height="84" rx="4" fill="none" stroke="#fff" stroke-width="3"/>
    ${text(75, 47, 26, 'WRONG', '#fff')}${text(75, 79, 26, 'WAY', '#fff')}`),
  'one-way': svg('0 0 170 70', 'One Way sign', `
    <rect x="2" y="2" width="166" height="66" rx="5" fill="${C.black}"/>
    <polygon points="14,27 122,27 122,16 156,35 122,54 122,43 14,43" fill="#fff"/>
    ${text(66, 41, 16, 'ONE WAY', C.black)}`),
  'no-left-turn': svg('0 0 120 120', 'No Left Turn sign', `
    <rect x="2" y="2" width="116" height="116" rx="8" fill="#fff" stroke="${C.black}" stroke-width="3"/>
    ${stroke('M70 96 V58 Q70 46 58 46 H40', 10)}${arrowHead(32, 46, 'left', 13)}
    <circle cx="60" cy="60" r="46" fill="none" stroke="${C.red}" stroke-width="9"/>
    <line x1="27" y1="27" x2="93" y2="93" stroke="${C.red}" stroke-width="9"/>`),
  'no-u-turn': svg('0 0 120 120', 'No U-Turn sign', `
    <rect x="2" y="2" width="116" height="116" rx="8" fill="#fff" stroke="${C.black}" stroke-width="3"/>
    ${stroke('M72 96 V54 Q72 36 56 36 Q42 36 42 54 V74', 10)}${arrowHead(42, 82, 'down', 13)}
    <circle cx="60" cy="60" r="46" fill="none" stroke="${C.red}" stroke-width="9"/>
    <line x1="27" y1="27" x2="93" y2="93" stroke="${C.red}" stroke-width="9"/>`),
  'no-turn-on-red': svg('0 0 100 130', 'No Turn On Red sign', `
    <rect x="2" y="2" width="96" height="126" rx="6" fill="#fff" stroke="${C.black}" stroke-width="3"/>
    ${text(50, 36, 20, 'NO')}${text(50, 62, 20, 'TURN')}${text(50, 88, 20, 'ON')}
    <circle cx="50" cy="106" r="14" fill="${C.red}"/>${text(50, 111, 11, 'RED', '#fff')}`),
  'speed-limit': svg('0 0 100 126', 'Speed Limit 35 sign', `
    <rect x="2" y="2" width="96" height="122" rx="7" fill="#fff" stroke="${C.black}" stroke-width="3"/>
    <rect x="7" y="7" width="86" height="112" rx="5" fill="none" stroke="${C.black}" stroke-width="2"/>
    ${text(50, 36, 17, 'SPEED')}${text(50, 56, 17, 'LIMIT')}${text(50, 104, 44, '35')}`),
  'keep-right': svg('0 0 100 126', 'Keep Right sign', `
    <rect x="2" y="2" width="96" height="122" rx="7" fill="#fff" stroke="${C.black}" stroke-width="3"/>
    <ellipse cx="36" cy="66" rx="13" ry="30" fill="${C.black}"/>
    ${stroke('M54 24 Q74 46 72 92', 7)}${arrowHead(72, 100, 'down', 10)}`),
  'center-turn-lane': svg('0 0 110 130', 'Center lane left turn only sign', `
    <rect x="2" y="2" width="106" height="126" rx="7" fill="#fff" stroke="${C.black}" stroke-width="3"/>
    ${stroke('M38 98 V52 Q38 40 26 40', 7)}${arrowHead(20, 40, 'left', 9)}
    ${stroke('M72 32 V78 Q72 90 84 90', 7)}${arrowHead(90, 90, 'right', 9)}
    ${text(55, 120, 15, 'ONLY')}`),
  'no-passing-zone': svg('0 0 150 100', 'No Passing Zone sign', `
    <polygon points="3,4 147,50 3,96" fill="${C.yellow}" stroke="${C.black}" stroke-width="2"/>
    <polygon points="10,14 124,50 10,86" fill="none" stroke="${C.black}" stroke-width="2.5"/>
    ${text(42, 44, 12, 'NO')}${text(42, 58, 12, 'PASSING')}${text(42, 72, 12, 'ZONE')}`),

  // ── Warning (yellow diamonds) ──
  'signal-ahead': diamond('Signal ahead warning sign', `
    <rect x="49" y="32" width="22" height="56" rx="5" fill="${C.black}"/>
    <circle cx="60" cy="44" r="6.5" fill="${C.red}"/><circle cx="60" cy="60" r="6.5" fill="${C.yellow}"/><circle cx="60" cy="76" r="6.5" fill="${C.green}"/>`),
  'stop-ahead': diamond('Stop ahead warning sign', `
    <polygon points="53,30 67,30 76,39 76,53 67,62 53,62 44,53 44,39" fill="${C.red}"/>
    ${stroke('M60 90 V72', 7)}${arrowHead(60, 70, 'up', 8)}`),
  'yield-ahead': diamond('Yield ahead warning sign', `
    <polygon points="42,32 78,32 60,62" fill="${C.red}"/><polygon points="50,37 70,37 60,54" fill="#fff"/>
    ${stroke('M60 92 V74', 7)}${arrowHead(60, 72, 'up', 8)}`),
  merge: diamond('Merge warning sign', `
    ${stroke('M64 92 V40', 8)}${arrowHead(64, 34, 'up', 10)}
    ${stroke('M40 90 Q40 72 64 60', 7)}`),
  'lane-ends': diamond('Right lane ends warning sign', `
    ${stroke('M46 92 V32', 7)}${stroke('M74 92 V66 Q74 54 60 46 V32', 7)}`),
  'two-way': diamond('Two-way traffic warning sign', `
    ${stroke('M48 38 V90', 7)}${arrowHead(48, 94, 'down', 9)}
    ${stroke('M72 82 V30', 7)}${arrowHead(72, 26, 'up', 9)}`),
  'divided-begins': diamond('Divided highway begins warning sign', `
    ${stroke('M54 92 V72 Q54 62 44 54 V32', 6)}${stroke('M66 92 V72 Q66 62 76 54 V32', 6)}`),
  'divided-ends': diamond('Divided highway ends warning sign', `
    ${stroke('M44 92 V68 Q44 58 54 50 V30', 6)}${stroke('M76 92 V68 Q76 58 66 50 V30', 6)}`),
  'curve-right': diamond('Curve to the right warning sign', `
    ${stroke('M48 92 V68 Q48 44 70 38', 8)}${arrowHead(76, 36, 'right', 10)}`),
  'sharp-turn-right': diamond('Sharp turn to the right warning sign', `
    ${stroke('M50 92 V46 H70', 8)}${arrowHead(78, 46, 'right', 11)}`),
  'reverse-curve': diamond('Reverse curve warning sign', `
    ${stroke('M48 94 V80 Q48 66 60 60 Q72 54 72 40 V36', 7)}${arrowHead(72, 30, 'up', 9)}`),
  'winding-road': diamond('Winding road warning sign', `
    ${stroke('M52 94 Q42 84 52 74 Q62 64 52 54 Q42 44 56 34', 7)}${arrowHead(60, 29, 'up', 8)}`),
  'cross-road': diamond('Cross road warning sign', `${stroke('M60 30 V90', 9)}${stroke('M30 60 H90', 9)}`),
  'side-road': diamond('Side road warning sign', `${stroke('M54 30 V90', 9)}${stroke('M54 60 H82', 8)}`),
  't-intersection': diamond('T-intersection warning sign', `${stroke('M30 44 H90', 9)}${stroke('M60 44 V90', 9)}`),
  roundabout: diamond('Roundabout ahead warning sign', `
    ${stroke('M60 38 A22 22 0 1 1 38 60', 7)}${arrowHead(38, 66, 'down', 8)}
    <circle cx="60" cy="60" r="7" fill="${C.black}"/>`),
  slippery: diamond('Slippery when wet warning sign', `
    <rect x="47" y="30" width="26" height="30" rx="6" fill="${C.black}"/>
    <rect x="44" y="52" width="6" height="10" rx="2" fill="${C.black}"/><rect x="70" y="52" width="6" height="10" rx="2" fill="${C.black}"/>
    <rect x="51" y="35" width="18" height="9" rx="2" fill="${C.yellow}"/>
    ${stroke('M50 68 Q44 76 50 82 Q56 88 48 94', 4)}${stroke('M70 68 Q76 76 70 82 Q64 88 72 94', 4)}`),
  hill: diamond('Hill warning sign', `
    <polygon points="26,78 94,78 94,58" fill="${C.black}"/>
    <rect x="44" y="50" width="22" height="14" rx="2" fill="${C.black}" transform="rotate(-16 55 57)"/>
    <circle cx="46" cy="68" r="4" fill="${C.black}"/><circle cx="62" cy="64" r="4" fill="${C.black}"/>`),
  'low-clearance': diamond('Low clearance warning sign', `
    ${arrowHead(60, 30, 'up', 8)}${text(60, 70, 20, '12′6″')}${arrowHead(60, 90, 'down', 8)}`),
  'narrow-bridge': diamond('Narrow bridge warning sign', `
    ${stroke('M44 92 V78 Q44 72 50 68 V52 Q44 48 44 42 V28', 6)}${stroke('M76 92 V78 Q76 72 70 68 V52 Q76 48 76 42 V28', 6)}`),
  'added-lane': diamond('Added lane warning sign', `
    ${stroke('M50 92 V34', 7)}${arrowHead(50, 30, 'up', 8)}
    ${stroke('M78 92 Q72 76 72 64 V36', 7)}${arrowHead(72, 30, 'up', 8)}`),
  'railroad-advance': svg('0 0 120 120', 'Railroad crossing advance warning sign', `
    <circle cx="60" cy="60" r="56" fill="${C.yellow}" stroke="${C.black}" stroke-width="2"/>
    <circle cx="60" cy="60" r="50" fill="none" stroke="${C.black}" stroke-width="3"/>
    <line x1="27" y1="27" x2="93" y2="93" stroke="${C.black}" stroke-width="8"/><line x1="93" y1="27" x2="27" y2="93" stroke="${C.black}" stroke-width="8"/>
    ${text(34, 69, 22, 'R')}${text(86, 69, 22, 'R')}`),
  pedestrian: diamond('Pedestrian crossing warning sign', walker(60, 72, 1.5), C.fyg),
  'school-crossing': svg('0 0 110 130', 'School crossing sign', `
    <polygon points="55,3 107,46 107,127 3,127 3,46" fill="${C.fyg}" stroke="${C.black}" stroke-width="2"/>
    <polygon points="55,10 101,48 101,121 9,121 9,48" fill="none" stroke="${C.black}" stroke-width="3"/>
    ${walker(42, 96, 1.2)}${walker(70, 102, 1.0)}`),
  'work-zone': diamond('Road work ahead sign', `${text(60, 50, 13, 'ROAD')}${text(60, 66, 13, 'WORK')}${text(60, 82, 13, 'AHEAD')}`, C.orange),
  'end-road-work': svg('0 0 150 70', 'End Road Work sign', `
    <rect x="2" y="2" width="146" height="66" rx="6" fill="${C.orange}"/><rect x="7" y="7" width="136" height="56" rx="4" fill="none" stroke="${C.black}" stroke-width="2.5"/>
    ${text(75, 34, 15, 'END')}${text(75, 54, 15, 'ROAD WORK')}`),
  'curve-advisory': svg('0 0 120 170', 'Curve warning sign with 35 mph advisory speed', `
    <polygon points="60,3 117,60 60,117 3,60" fill="${C.yellow}"/>
    <polygon points="60,9 111,60 60,111 9,60" fill="none" stroke="${C.black}" stroke-width="3"/>
    ${stroke('M48 92 V68 Q48 44 70 38', 8)}${arrowHead(76, 36, 'right', 10)}
    <rect x="28" y="124" width="64" height="44" rx="5" fill="${C.yellow}"/><rect x="32" y="128" width="56" height="36" rx="3" fill="none" stroke="${C.black}" stroke-width="2"/>
    ${text(60, 147, 17, '35')}${text(60, 160, 10, 'MPH')}`),
  smv: svg('0 0 120 108', 'Slow-moving vehicle emblem', `
    <polygon points="60,4 116,104 4,104" fill="${C.red}"/>
    <polygon points="60,26 98,94 22,94" fill="${C.orange}"/>`),
  hospital: svg('0 0 100 100', 'Hospital service sign', `
    <rect x="2" y="2" width="96" height="96" rx="7" fill="${C.blue}"/><rect x="7" y="7" width="86" height="86" rx="5" fill="none" stroke="#fff" stroke-width="2.5"/>
    ${text(50, 70, 56, 'H', '#fff')}`),
  crossbuck: svg('0 0 140 120', 'Railroad crossing crossbuck sign', `
    <g transform="translate(70 60)">
      <g transform="rotate(35)"><rect x="-66" y="-11" width="132" height="22" fill="#fff" stroke="${C.black}" stroke-width="2.5"/>${text(0, 6.5, 15, 'RAILROAD')}</g>
      <g transform="rotate(-35)"><rect x="-66" y="-11" width="132" height="22" fill="#fff" stroke="${C.black}" stroke-width="2.5"/>${text(0, 6.5, 15, 'CROSSING')}</g>
    </g>`),

  // ── Signals ──
  'signal-red': signal('red'),
  'signal-flashing-red': signal('red', { flashing: true }),
  'signal-yellow': signal('yellow'),
  'signal-flashing-yellow': signal('yellow', { flashing: true }),
  'signal-green': signal('green'),
  'signal-red-arrow': signal('red', { arrow: 'left' }),
  'signal-yellow-arrow': signal('yellow', { arrow: 'left' }),
  'signal-flashing-yellow-arrow': signal('yellow', { arrow: 'left', flashing: true }),
  'signal-green-arrow': signal('green', { arrow: 'left' }),

  // ── Hand signals ──
  'hand-left': hand('left', 'Hand signal: left arm straight out'),
  'hand-right': hand('right', 'Hand signal: left arm bent upward'),
  'hand-stop': hand('stop', 'Hand signal: left arm bent downward'),

  // ── Pavement markings (top-down view, traffic moving up) ──
  'lines-double-yellow': markings([['solid', '#f2c230', -4], ['solid', '#f2c230', 4]], 'Double solid yellow center lines'),
  'lines-dashed-yellow': markings([['dashed', '#f2c230', 0]], 'Single dashed yellow center line'),
  'lines-solid-dashed-yellow': markings([['dashed', '#f2c230', -4], ['solid', '#f2c230', 4]], 'Solid and dashed yellow lines; solid line on your side (right)'),
  'lines-double-white': markings([['solid', '#fff', -4], ['solid', '#fff', 4]], 'Double solid white lines'),
  'lines-dashed-white': markings([['dashed', '#fff', 0]], 'Dashed white lane line'),
};

function markings(lines, label) {
  const body = lines.map(([kind, color, dx]) => `<line x1="${70 + dx}" y1="0" x2="${70 + dx}" y2="120" stroke="${color}" stroke-width="4" ${kind === 'dashed' ? 'stroke-dasharray="16 14"' : ''}/>`).join('');
  return svg('0 0 140 120', label, `
    <rect x="0" y="0" width="140" height="120" rx="10" fill="${C.road}"/>
    <line x1="8" y1="0" x2="8" y2="120" stroke="#fff" stroke-width="3"/><line x1="132" y1="0" x2="132" y2="120" stroke="#fff" stroke-width="3"/>
    ${body}
    <g transform="translate(103 70)"><rect x="-10" y="-17" width="20" height="34" rx="5" fill="#2f8f6a"/><rect x="-7" y="-12" width="14" height="8" rx="2" fill="#b9e3d2"/></g>
    <g transform="translate(37 40) rotate(180)"><rect x="-10" y="-17" width="20" height="34" rx="5" fill="#9aa7ab"/><rect x="-7" y="-12" width="14" height="8" rx="2" fill="#e3e9eb"/></g>`);
}
