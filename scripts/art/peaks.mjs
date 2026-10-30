// Hero landscape: five depths of craggy sumi-e peaks (tall and sharp on the right, low on the left where the name sits),
// groves of swaying pines that grow on each ridge, a gnarled lone pine and drifting leaves.
import { f, rng, vnoise, dots, TONE } from './lib.mjs';

export const TONES = TONE;

// [base y, jaggedness, peaks as [x, height, half-width], mist-free tree count, tree height range]
const LAYERS = [
  { base: 250, jag: 5, peaks: [[130, 40, 80], [300, 56, 90], [520, 172, 105], [705, 150, 95], [790, 95, 60]], trees: 18, th: [13, 20] },
  { base: 272, jag: 7, peaks: [[40, 28, 60], [190, 46, 80], [390, 70, 100], [575, 138, 95], [765, 128, 85]], trees: 17, th: [20, 30] },
  { base: 296, jag: 9, peaks: [[70, 32, 70], [270, 54, 90], [470, 78, 100], [675, 118, 90]], trees: 15, th: [28, 40] },
  { base: 322, jag: 10, peaks: [[130, 30, 90], [340, 42, 90], [535, 76, 100], [755, 98, 85]], trees: 13, th: [38, 56] },
  { base: 346, jag: 11, peaks: [[40, 20, 70], [240, 28, 90], [440, 30, 90], [640, 48, 90], [790, 70, 70]], trees: 9, th: [50, 72] },
];

function profile(L, seed) {
  const n = vnoise(seed), pts = [];
  for (let x = -10; x <= 810; x += 4) {
    let h = 0;
    for (const [px, ph, w] of L.peaks) { const t = 1 - Math.abs(x - px) / w; if (t > 0) h = Math.max(h, ph * Math.pow(t, 1.25)); }
    h += (n(x / 8) - 0.5) * L.jag + (n(x / 23) - 0.5) * L.jag * 1.4;
    if (h > 8) h += (n(x / 5) - 0.5) * L.jag * 0.6;
    pts.push([x, L.base - Math.max(3, h)]);
  }
  const at = (x) => { const k = Math.max(0, Math.min(pts.length - 1.001, (x + 10) / 4)), i = Math.floor(k); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * (k - i); };
  return { pts, at };
}

/** Four pine silhouettes at unit height 100 (reused with <use>); crown group sways against the trunk. */
function treeDefs(c) {
  const defs = [];
  for (let v = 0; v < 4; v++) {
    const r = rng(40 + v * 7), tiers = 5 + (v % 2);
    let d = '';
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers, yy = -(18 + t * 70), w = 34 * (1 - t * 0.8) * (0.85 + r() * 0.3), hh = 26;
      d += `M${f(-w)} ${f(yy)}L${f((r() - 0.5) * w * 0.4)} ${f(yy - hh)}L${f(w)} ${f(yy)}L${f(w * 0.4)} ${f(yy + 3)}L${f(-w * 0.4)} ${f(yy - 2)}Z`;
    }
    defs.push(`<g id="${c.id('tv')}"><path d="M-2 0L0-96 2 0Z"/><g class="tc"><path d="${d}"/></g></g>`);
  }
  c.def(defs.join(''));
  return defs.map((s) => s.match(/id="([^"]+)"/)[1]);
}

/** Registers the shared css and the tree shapes on a Ctx; returns the tree ids. */
export function kit(c) {
  c.css('.ly{animation:ly 1.3s cubic-bezier(.2,.8,.2,1) backwards}@keyframes ly{from{opacity:0;transform:translateY(36px)}}');
  c.css('.tr{transform-origin:0px 0px;animation:tr var(--p,4.5s) ease-in-out var(--d,0s) infinite alternate}@keyframes tr{from{transform:rotate(-1.3deg)}to{transform:rotate(1.3deg)}}');
  c.css('.tc{transform-origin:0px -30px;animation:tc var(--p,4.5s) ease-in-out var(--d,0s) infinite alternate}@keyframes tc{from{transform:rotate(1.8deg)}to{transform:rotate(-1.8deg)}}');
  c.css('.pd{transform-box:fill-box;transform-origin:50% 100%;animation:pd 4.2s ease-in-out infinite alternate}@keyframes pd{from{transform:rotate(-2.4deg)}to{transform:rotate(2.4deg)}}');
  c.css('.lf{animation:lf var(--t,9s) linear var(--d,0s) infinite}@keyframes lf{0%{transform:translate(0,0) rotate(0);opacity:0}10%{opacity:.9}90%{opacity:.9}100%{transform:translate(340px,120px) rotate(540deg);opacity:0}}');
  return treeDefs(c);
}

/** Rock strokes down the faces of a ridge (`at` gives the ridge y), drawn as one path. */
export function cun(at, base, { seed, tone, op, len = 10 }) {
  const r = rng(seed);
  let s = '';
  for (let x = 4; x < 800; x += 5 + r() * 3) {
    const y = at(x), sl = (at(x + 4) - at(x - 4)) / 8, l = (8 + r() * len) * (base - y > 14 ? 1 : 0.6);
    s += `M${Math.round(x)} ${Math.round(y + 4)}l${f(sl * l * 0.3)} ${Math.round(l)}`;
  }
  return `<path d="${s}" stroke="${tone}" stroke-width=".9" stroke-linecap="round" opacity="${op}" fill="none"/>`;
}

/** Pines in groves that stand on a ridge; they sway with a wind wave that travels along x. `maxRise` keeps them off the highest crags. */
export function grove(ids, at, { n, th, tone, seed, period = 4, maxRise = Infinity, base = 0, x0 = 8, x1 = 792, centres = 3 }) {
  const r = rng(seed), cs = Array.from({ length: centres }, () => x0 + r() * (x1 - x0));
  let out = '';
  for (let i = 0, tries = 0; i < n && tries < n * 6; tries++) {
    const x = Math.max(x0, Math.min(x1, cs[tries % cs.length] + (r() + r() + r() - 1.5) * 70)), h = th[0] + r() * (th[1] - th[0]);
    if (base - at(x) > maxRise) continue;
    out += `<g transform="translate(${Math.round(x)} ${Math.round(at(x) + 3)}) scale(${(h / 100).toFixed(3)})" fill="${tone}"><g class="tr" style="--d:-${(x * 0.011 + r() * 0.7).toFixed(2)}s;--p:${period.toFixed(1)}s"><use href="#${ids[(i + tries) % 4]}"/></g></g>`;
    i++;
  }
  return out;
}

/** Gnarled pine with cloud-pad crowns that sway separately. */
export function lonePine(x, y, tone, s = 1.5) {
  const pad = (px, py, k, dl) => `<g transform="translate(${px} ${py}) scale(${k})"><path class="pd" style="animation-delay:-${dl}s" d="M-28 0Q-28-10-14-11Q-6-20 6-14Q22-18 28-4Q30 4 20 5Q8 9-6 5Q-22 8-28 0Z"/></g>`;
  return `<g transform="translate(${Math.round(x)} ${Math.round(y)}) scale(${s})" fill="${tone}"><path d="M0 0C-6-22 8-34 0-58M0-30C-12-38-18-46-22-54M2-42C16-50 24-52 32-60M0-58C-4-66 4-76 0-86" stroke="${tone}" stroke-width="4" stroke-linecap="round" fill="none"/>${pad(-22, -56, 0.8, 0.3)}${pad(30, -60, 0.75, 1.1)}${pad(0, -88, 0.95, 1.9)}${pad(-10, -42, 0.5, 2.6)}</g>`;
}

/** Leaves carried by the wind (left to right) inside the box. */
export function leaves(color, n, { x = 20, y = 150, w = 360, h = 70, seed = 5 } = {}) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) out += `<g transform="translate(${Math.round(x + r() * w)} ${Math.round(y + r() * h)})"><path class="lf" style="--t:${(8 + r() * 5).toFixed(1)}s;--d:-${(r() * 9).toFixed(1)}s" d="M0 0Q3-3 7 0Q3 3 0 0Z" fill="${color}"/></g>`;
  return out;
}

/** Craggy ridge from monthly values: one sharp peak per month (height ~ sqrt of the value), valleys between. */
export function dataRidge(values, { base, maxH, vmax, seed, jag = 10, w = 86 }) {
  const n = vnoise(seed), hs = values.map((v) => Math.sqrt(Math.max(0, v ?? 0) / vmax) * maxH), pts = [];
  for (let x = -10; x <= 810; x += 4) {
    let h = 0;
    hs.forEach((ph, i) => { const t = 1 - Math.abs(x - (i / 11) * 800) / w; if (t > 0) h = Math.max(h, ph * Math.pow(t, 1.2)); });
    h += (n(x / 8) - 0.5) * jag + (n(x / 23) - 0.5) * jag * 1.4;
    pts.push([x, base - Math.max(3, h)]);
  }
  const at = (x) => { const k = Math.max(0, Math.min(pts.length - 1.001, (x + 10) / 4)), i = Math.floor(k); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * (k - i); };
  return { pts, at, d: 'M' + pts.map(([x, y]) => `${x} ${Math.round(y)}`).join('L') };
}

export function landscape(c, { mist, dark }) {
  const T = TONES[dark ? 'dark' : 'light'], P = c.P, ids = kit(c);
  const dt = dots(c, { gap: 5, r: 1.1, color: P.line, angle: 30 });
  const misted = [[214, 70, 22, 3, 0.75], [250, 62, 26, 7, 0.7], [288, 58, 30, 11, 0.6]];
  let out = '', lone;
  LAYERS.forEach((L, li) => {
    const { pts, at } = profile(L, 20 + li * 9), d = 'M' + pts.map(([x, y]) => `${x} ${Math.round(y)}`).join('L') + 'L810 372L-10 372Z', id = c.id('mt');
    c.def(`<path id="${id}" d="${d}"/>`);
    let body = `<use href="#${id}" fill="${T.ridge[li]}"/>`;
    if (li === 0) body += `<use href="#${id}" fill="url(#${dt})" opacity=".3"/>`;
    if (li >= 2) {
      body += cun(at, L.base, { seed: 100 + li * 13, tone: T.cun[li], op: T.cunOp[li], len: 10 + li * 5 });
      body += `<use href="#${id}" fill="none" stroke="${T.cun[li] === '#ffffff' ? '#0d1117' : T.cun[li]}" stroke-width="1" opacity="${li >= 3 ? 0.5 : 0.35}"/>`;
    }
    const trees = grove(ids, at, { n: L.trees, th: L.th, tone: T.tree[li], seed: 300 + li * 17, period: 3.8 + li * 0.4, centres: 3 + (li % 2) });
    out += `<g class="ly" style="animation-delay:${(0.2 + li * 0.25).toFixed(2)}s">${body}${trees}</g>`;
    const m = misted[li];
    if (m) out += mist(c, m[0], m[1], { dur: m[2], delay: m[3], op: m[4] });
    if (li === 4) lone = { x: 640, y: at(640) + 2, tone: T.tree[4] };
  });
  return out + lonePine(lone.x, lone.y, lone.tone) + leaves(P.accent, 7);
}
