import { f, rng, hatch, dots } from './lib.mjs';

/** Four-point sparkle (concave diamond) centred on (x, y). */
const sparkle = (x, y, R, k = 0.14) => {
  const a = R * k;
  return `M${f(x)} ${f(y - R)}Q${f(x + a)} ${f(y - a)} ${f(x + R)} ${f(y)}Q${f(x + a)} ${f(y + a)} ${f(x)} ${f(y + R)}Q${f(x - a)} ${f(y + a)} ${f(x - R)} ${f(y)}Q${f(x - a)} ${f(y - a)} ${f(x)} ${f(y - R)}Z`;
};

/** Ursa Minor night panel: milky-way tone, layered stars, real-proportion constellation, Polaris with burst. Returns SVG for the panel body (no label/sfx). */
export function polarBody(c) {
  const P = c.P, PX = 56, PY = 334, K = 15;

  // real RA (h) / Dec (deg) / magnitude, projected around the pole and rotated to run top-left -> bottom-right
  const raw = { al: [2.53, 89.26, 2.0], de: [17.54, 86.59, 4.35], ep: [16.77, 82.04, 4.2], ze: [15.73, 77.79, 4.3], et: [16.29, 75.76, 4.95], ga: [15.34, 71.83, 3.05], be: [14.85, 74.16, 2.08] };
  const pr = Object.fromEntries(Object.entries(raw).map(([k, [h, d]]) => { const r = 90 - d, t = (h * 15 * Math.PI) / 180; return [k, [-r * Math.sin(t), -r * Math.cos(t)]]; }));
  const mx = (pr.ga[0] + pr.be[0] + pr.ze[0]) / 3, my = (pr.ga[1] + pr.be[1] + pr.ze[1]) / 3, rot = (46 * Math.PI) / 180 - Math.atan2(my, mx);
  const S = {}, rad = {};
  for (const [k, [x, y]] of Object.entries(pr)) {
    S[k] = [PX + K * (x * Math.cos(rot) - y * Math.sin(rot) - (pr.al[0] * Math.cos(rot) - pr.al[1] * Math.sin(rot))), PY + K * (x * Math.sin(rot) + y * Math.cos(rot) - (pr.al[0] * Math.sin(rot) + pr.al[1] * Math.cos(rot)))];
    rad[k] = 1.6 + (5.2 - raw[k][2]) * 1.05;
  }

  c.css('.tw{animation:tw 2.4s ease-in-out infinite alternate}@keyframes tw{from{opacity:.35}to{opacity:1}}');
  c.css('.zm{transform-origin:' + PX + 'px ' + PY + 'px;animation:zm 9s ease-in-out infinite}@keyframes zm{0%,14%{transform:translate(0,0) scale(1)}34%,62%{transform:translate(' + (140 - PX) + 'px,' + (440 - PY) + 'px) scale(3.2)}84%,100%{transform:translate(0,0) scale(1)}}');
  c.css('.zo{animation:zo 9s ease-in-out infinite}@keyframes zo{0%,14%{opacity:1}34%,62%{opacity:.1}84%,100%{opacity:1}}');
  c.css('.zr{transform-origin:' + PX + 'px ' + PY + 'px;animation:zr 9s ease-in-out infinite}@keyframes zr{0%,26%{transform:scale(.4);opacity:0}40%{opacity:.9}62%{transform:scale(1.9);opacity:0}100%{transform:scale(.4);opacity:0}}');
  c.css('.pl{transform-origin:' + PX + 'px ' + PY + 'px;animation:pl 2.2s ease-in-out infinite alternate}@keyframes pl{from{transform:scale(.88) rotate(-6deg)}to{transform:scale(1.12) rotate(6deg)}}');
  c.css('.pr{transform-origin:' + PX + 'px ' + PY + 'px;animation:pr 3.2s ease-in-out infinite alternate}@keyframes pr{from{transform:scale(.93)}to{transform:scale(1.07)}}');
  c.css('.rt{transform-origin:' + PX + 'px ' + PY + 'px;animation:rt 24s linear infinite}@keyframes rt{to{transform:rotate(360deg)}}');
  c.css('.ln{stroke-dasharray:100;animation:ln 1.2s ease-out backwards}@keyframes ln{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}');
  c.css('.sk{transform-box:fill-box;transform-origin:center;animation:sk 3s ease-in-out infinite alternate}@keyframes sk{from{transform:scale(.7);opacity:.55}to{transform:scale(1.12);opacity:1}}');
  c.css('.mt{animation:mt 7s ease-in infinite}@keyframes mt{0%,62%{transform:translate(-30px,-15px);opacity:0}66%{opacity:1}86%{transform:translate(150px,75px);opacity:0}100%{transform:translate(150px,75px);opacity:0}}');

  // ---- background: milky-way band of dots + hatched ground
  const dotP = dots(c, { gap: 4, r: 0.85, color: P.onDark, angle: 30 }), hatP = hatch(c, { gap: 5, w: 0.8, color: P.onDark, angle: 35 });
  const gb = c.id('mwg'), mb = c.id('mwm'), gh = c.id('hvg'), mh = c.id('hvm'), gp = c.id('pgl');
  c.def(
    `<linearGradient id="${gb}" gradientUnits="userSpaceOnUse" x1="30" y1="300" x2="270" y2="540"><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".46" stop-color="#fff"/><stop offset=".74" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${mb}"><rect x="0" y="274" width="290" height="330" fill="url(#${gb})"/></mask>` +
      `<linearGradient id="${gh}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${mh}"><rect x="0" y="480" width="290" height="124" fill="url(#${gh})"/></mask>` +
      `<radialGradient id="${gp}"><stop offset="0" stop-color="${P.accent2}" stop-opacity=".6"/><stop offset=".45" stop-color="${P.accent2}" stop-opacity=".16"/><stop offset="1" stop-color="${P.accent2}" stop-opacity="0"/></radialGradient>`,
  );
  const bg = `<g mask="url(#${mb})" opacity=".42"><rect x="0" y="274" width="290" height="330" fill="url(#${dotP})"/></g><g mask="url(#${mh})" opacity=".3"><rect x="0" y="480" width="290" height="124" fill="url(#${hatP})"/></g>`;

  // ---- star field in three tiers; keep clear of the constellation, the label and the sound effect
  const r = rng(11), pts = Object.values(S);
  const free = (x, y) => x > 10 && x < 280 - ((y - 274) * 28) / 330 && y > 282 && y < 596 && pts.every(([sx, sy]) => Math.hypot(x - sx, y - sy) > 20) && Math.hypot(x - PX, y - PY) > 52 && !(x < 118 && y < 308) && Math.hypot(x - 214, y - 330) > 42 && !(x < 130 && y > 560);
  const pick = () => { for (let i = 0; i < 60; i++) { const x = 8 + r() * 274, y = 280 + r() * 318; if (free(x, y)) return [x, y]; } return null; };
  let tiny = '', mid = '', spark = '';
  for (let i = 0; i < 55; i++) { const p = pick(); if (p) tiny += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(0.5 + r() * 0.8)}" fill="${P.onDark}" opacity="${(0.28 + r() * 0.5).toFixed(2)}"/>`; }
  for (let i = 0; i < 18; i++) { const p = pick(); if (p) { const rr = 1.5 + r() * 1.1; mid += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(rr * 3)}" fill="none" stroke="${P.onDark}" stroke-width=".6" opacity=".22"/><circle class="tw" style="animation-delay:-${(r() * 2.4).toFixed(1)}s" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(rr)}" fill="${P.onDark}"/>`; } }
  for (let i = 0; i < 7; i++) { const p = pick(); if (p) { const R = 6 + r() * 6; spark += `<path class="sk" style="animation-delay:-${(r() * 3).toFixed(1)}s" d="${sparkle(p[0], p[1], R)}" fill="${P.onDark}"/>`; } }
  const meteor = `<g transform="translate(70 560)"><g class="mt"><path d="M0 0L-52 -22 -52 -19.6Z" fill="${P.onDark}" opacity=".85"/><circle r="1.8" fill="${P.onDark}"/></g></g>`;

  // ---- constellation: bowl screentone, gapped lines that draw in, stars sized by magnitude
  const bowl = ['ze', 'et', 'ga', 'be'].map((k) => S[k].map(f).join(' ')).join('L');
  const segs = [['al', 'de'], ['de', 'ep'], ['ep', 'ze'], ['ze', 'et'], ['et', 'ga'], ['ga', 'be'], ['be', 'ze']];
  const gap = (k) => (k === 'al' ? 17 : rad[k] + 5);
  const lines = segs.map(([a, b], i) => {
    const [x1, y1] = S[a], [x2, y2] = S[b], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, g1 = gap(a), g2 = gap(b);
    return `<path class="ln" pathLength="100" style="animation-delay:${(0.5 + i * 0.28).toFixed(2)}s" d="M${f(x1 + ux * g1)} ${f(y1 + uy * g1)}L${f(x2 - ux * g2)} ${f(y2 - uy * g2)}" fill="none" stroke="${P.onDark}" stroke-width="1.15" stroke-linecap="round" opacity=".8"/>`;
  }).join('');
  const stars = Object.keys(S).filter((k) => k !== 'al').map((k, i) => {
    const [x, y] = S[k], rr = rad[k], warm = k === 'be', col = warm ? P.accent2 : P.onDark;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr * 2.7)}" fill="none" stroke="${col}" stroke-width=".8" opacity=".4"/>` +
      (rr > 3.3 ? `<path class="sk" style="animation-delay:-${i * 0.7}s" d="${sparkle(x, y, rr * 4.6, 0.1)}" fill="${col}" opacity=".9"/>` : '') +
      `<circle class="tw" style="animation-delay:-${(i * 0.6).toFixed(1)}s" cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${P.onDark}"/>`;
  }).join('');

  // ---- Polaris: glow, long cross spikes, short diagonal spikes, orbit rings, burst rays, hot core
  let rays = '';
  const rr2 = rng(7);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.1, a0 = 17, a1 = 22 + (i % 2 ? 4 : 13) + rr2() * 5; rays += `M${f(PX + Math.cos(a) * a0)} ${f(PY + Math.sin(a) * a0)}L${f(PX + Math.cos(a) * a1)} ${f(PY + Math.sin(a) * a1)}`; }
  const polaris =
    `<circle cx="${PX}" cy="${PY}" r="46" fill="url(#${gp})"/>` +
    `<circle class="zr" cx="${PX}" cy="${PY}" r="20" fill="none" stroke="${P.accent2}" stroke-width="1.4"/>` +
    `<g class="pl"><path d="${rays}" stroke="${P.accent2}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".85"/></g>` +
    `<g class="rt"><circle cx="${PX}" cy="${PY}" r="13.5" fill="none" stroke="${P.onDark}" stroke-width=".9" stroke-dasharray="1.5 4.5" opacity=".7"/></g>` +
    `<circle cx="${PX}" cy="${PY}" r="9" fill="none" stroke="${P.accent2}" stroke-width=".9" opacity=".8"/>` +
    `<g class="pr"><path d="${sparkle(PX, PY, 30, 0.05)}" fill="${P.onDark}"/><path d="${sparkle(PX, PY, 16, 0.07)}" transform="rotate(45 ${PX} ${PY})" fill="${P.accent2}"/></g>` +
    `<circle cx="${PX}" cy="${PY}" r="4.6" fill="${P.onDark}"/><circle cx="${PX}" cy="${PY}" r="2.1" fill="${P.accent2}"/>`;

  const body =
    `<g class="zo">${bg}${tiny}${mid}${spark}${meteor}</g>` +
    `<g class="zm"><g class="zo"><path d="M${bowl}Z" fill="url(#${hatP})" opacity=".32"/><path d="M${bowl}Z" fill="${P.accent2}" opacity=".05"/>${lines}${stars}</g>${polaris}</g>`;
  return { body, S };
}
