// Small SVG illustrations of standard traffic devices (shapes follow the public MUTCD standard).

const signal = (lit, flashing) => {
  const lamp = (cy, color, on) =>
    `<circle cx="40" cy="${cy}" r="15" fill="${on ? color : '#2c3438'}" ${on && flashing ? 'class="lamp-flash"' : ''}/>` +
    (on ? `<circle cx="40" cy="${cy}" r="22" fill="${color}" opacity=".18" ${flashing ? 'class="lamp-flash"' : ''}/>` : '');
  return `<svg viewBox="0 0 80 150" role="img" aria-label="Traffic signal with ${flashing ? 'flashing ' : ''}${lit} light">
    <rect x="12" y="4" width="56" height="142" rx="12" fill="#1b2326"/>
    <rect x="12" y="4" width="56" height="142" rx="12" fill="none" stroke="#f2c230" stroke-width="3"/>
    ${lamp(32, '#e5483c', lit === 'red')}
    ${lamp(75, '#f5b82e', lit === 'yellow')}
    ${lamp(118, '#2fbf71', lit === 'green')}
  </svg>`;
};

export const SIGNS = {
  stop: `<svg viewBox="0 0 120 120" role="img" aria-label="Stop sign">
    <polygon points="35,2 85,2 118,35 118,85 85,118 35,118 2,85 2,35" fill="#c8352b"/>
    <polygon points="37,7 83,7 113,37 113,83 83,113 37,113 7,83 7,37" fill="none" stroke="#fff" stroke-width="3.5"/>
    <text x="60" y="71" text-anchor="middle" font-family="Overpass, sans-serif" font-weight="800" font-size="31" fill="#fff" letter-spacing="1">STOP</text>
  </svg>`,
  crossbuck: `<svg viewBox="0 0 140 120" role="img" aria-label="Railroad crossing crossbuck sign">
    <g transform="translate(70 60)">
      <g transform="rotate(35)"><rect x="-66" y="-11" width="132" height="22" fill="#fff" stroke="#1b2326" stroke-width="2.5"/>
        <text x="0" y="6.5" text-anchor="middle" font-family="Overpass, sans-serif" font-weight="800" font-size="15" fill="#1b2326">RAILROAD</text></g>
      <g transform="rotate(-35)"><rect x="-66" y="-11" width="132" height="22" fill="#fff" stroke="#1b2326" stroke-width="2.5"/>
        <text x="0" y="6.5" text-anchor="middle" font-family="Overpass, sans-serif" font-weight="800" font-size="15" fill="#1b2326">CROSSING</text></g>
    </g>
  </svg>`,
  'signal-flashing-red': signal('red', true),
  'signal-flashing-yellow': signal('yellow', true),
  'signal-yellow': signal('yellow', false),
};
