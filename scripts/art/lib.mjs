// Shared toolkit for the five Vagabond README options.
// Rules: SVG + CSS only (no JS, no external fonts), text is converted to outlines, and the BASE state of every
// element is the final picture: animations only decorate (they start from a "hidden" keyframe, with fill-mode backwards).
import opentype from 'opentype.js';
import { getStroke } from 'perfect-freehand';
import { readFileSync } from 'node:fs';

const buf = readFileSync(new URL('./fonts/YujiSyuku-subset.ttf', import.meta.url));
export const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

export const THEMES = {
  light: { paper: '#f2eee3', paper2: '#e7e1d0', ink: '#14130f', ink2: '#57544b', ink3: '#a6a193', mist: '#d6d1c1', accent: '#c4471b', accent2: '#e2894f', white: '#fbf9f3' },
  dark: { paper: '#12110f', paper2: '#1c1b18', ink: '#ede8da', ink2: '#aaa595', ink3: '#605c51', mist: '#2a2823', accent: '#ff6a35', accent2: '#ffa56b', white: '#fff8ee' },
};

// GitHub Primer colors. Role keys (canvas, card, line, mass, panelBg...) plus legacy aliases used by the shared helpers.
// GitHub Primer colors, from the official @primer/primitives light/dark theme tokens (bgColor-default, fgColor-*, borderColor-default,
// fgColor-severe/success/accent, bgColor-inset). Mountain/tree tones are mixes of canvas and fg so every grey belongs to the page.
const rgb = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
export const mix = (a, b, t) => '#' + rgb(a).map((v, k) => Math.round(v + (rgb(b)[k] - v) * t).toString(16).padStart(2, '0')).join('');
const BASE = {
  light: { canvas: '#ffffff', fg: '#1f2328', muted: '#59636e', subtle: '#818b98', border: '#d1d9e0', soft: '#f6f8fa', inset: '#1f2328' },
  dark: { canvas: '#0d1117', fg: '#f0f6fc', muted: '#9198a1', subtle: '#6e7681', border: '#3d444d', soft: '#151b23', inset: '#010409' },
};
export const TONE = {
  light: { ridge: ['#eaeef2', '#d1d9e0', '#818b98', '#59636e', '#1f2328'], tree: [mix('#d1d9e0', '#818b98', 0.5), '#818b98', '#59636e', mix('#59636e', '#1f2328', 0.5), '#0d1117'], cun: ['', '', '#1f2328', '#ffffff', '#ffffff'], cunOp: [0, 0, 0.2, 0.26, 0.3] },
  dark: { ridge: [0.22, 0.35, 0.5, 0.72, 1].map((k) => mix('#0d1117', '#3d444d', k)), tree: [0.35, 0.4, 0.45, 0.5, 0.85].map((k) => mix('#0d1117', '#010409', k)), cun: ['', '', '#f0f6fc', '#f0f6fc', '#f0f6fc'], cunOp: [0, 0, 0.1, 0.13, 0.15] },
};
const gh = (t, x) => ({
  canvas: t.canvas, card: t.canvas, card2: t.soft, border: t.border, far: x.far,
  line: t.fg, line2: t.muted, line3: t.subtle, mass: x.mass, onMass: x.onMass,
  panelBg: t.canvas, panelDark: t.inset, onDark: x.onDark,
  accent: x.accent, accent2: x.accent2, green: x.green, green2: x.green2, blue: x.blue, blue2: x.blue2,
  paper: t.canvas, paper2: t.soft, ink: t.fg, ink2: t.muted, ink3: t.subtle, mist: t.border, white: x.onMass,
});
export const GH = {
  light: gh(BASE.light, { far: '#d1d9e0', mass: '#1f2328', onMass: '#ffffff', onDark: '#f6f8fa', accent: '#bc4c00', accent2: '#fb8f44', green: '#1a7f37', green2: '#1f883d', blue: '#0969da', blue2: '#54aeff' }),
  dark: gh(BASE.dark, { far: mix('#0d1117', '#3d444d', 0.35), mass: '#3d444d', onMass: '#f0f6fc', onDark: '#f0f6fc', accent: '#db6d28', accent2: '#ffa657', green: '#3fb950', green2: '#238636', blue: '#4493f8', blue2: '#79c0ff' }),
};

export const f = (n) => +Number(n).toFixed(1);
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function vnoise(seed = 1) {
  const r = rng(seed), g = Array.from({ length: 256 }, () => r());
  return (x) => { const i = Math.floor(x), t = x - i, s = t * t * (3 - 2 * t); return g[((i % 256) + 256) % 256] * (1 - s) + g[(((i + 1) % 256) + 256) % 256] * s; };
}

/* ---------- geometry ---------- */
export function smoothD(p, closed = false) {
  if (p.length < 2) return '';
  const q = closed ? [p[p.length - 1], ...p, p[0], p[1]] : [p[0], ...p, p[p.length - 1]];
  let d = `M${f(q[1][0])} ${f(q[1][1])}`;
  for (let i = 1; i < q.length - 2; i++) {
    const a = q[i - 1], b = q[i], c = q[i + 1], e = q[i + 2];
    d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
export const quad = (a, c, b, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
export const line = (a, b, n = 12) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);

const avg = (a, b) => (a + b) / 2;
function strokeD(points) {
  const len = points.length;
  if (len < 4) return '';
  let a = points[0], b = points[1];
  const c = points[2];
  let r = `M${f(a[0])},${f(a[1])}Q${f(b[0])},${f(b[1])} ${f(avg(b[0], c[0]))},${f(avg(b[1], c[1]))}T`;
  for (let i = 2, max = len - 1; i < max; i++) { a = points[i]; b = points[i + 1]; r += `${f(avg(a[0], b[0]))},${f(avg(a[1], b[1]))} `; }
  return r + 'Z';
}
/** A tapered ink stroke (filled outline) along the given points. */
export function brush(points, o = {}) {
  const { size = 8, thin = 0.6, taper = true, smooth = 0.5, stream = 0.4, sim = true } = o;
  const s = getStroke(points, { size, thinning: thin, smoothing: smooth, streamline: stream, simulatePressure: sim, start: { taper }, end: { taper }, last: true });
  return strokeD(s);
}

/* ---------- text as outlines ---------- */
export function text(str, x, y, size, { anchor = 'start', sp = 0 } = {}) {
  const chars = [...str];
  const adv = (c) => (font.charToGlyph(c).advanceWidth * size) / font.unitsPerEm;
  const widths = chars.map(adv);
  const total = widths.reduce((s, w) => s + w, 0) + sp * (chars.length - 1);
  let cx = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x;
  let d = '';
  const dec = size < 44 ? 0 : 1; // small text needs no decimals
  // own serializer: opentype's toPathData emitted NaN for some glyph/position pairs
  const r = (v) => +v.toFixed(dec);
  const ser = (cmds) => {
    let out = '', px = NaN, py = NaN;
    for (const c of cmds) {
      if (c.type === 'Z') { out += 'Z'; continue; }
      const x = r(c.x), y = r(c.y);
      if (c.type === 'M') out += `M${x} ${y}`;
      else if (x === px && y === py && (c.type === 'L' || (r(c.x1) === px && r(c.y1) === py))) continue; // zero-length segment
      else if (c.type === 'L') out += `L${x} ${y}`;
      else if (c.type === 'Q') out += `Q${r(c.x1)} ${r(c.y1)} ${x} ${y}`;
      else out += `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${x} ${y}`;
      px = x; py = y;
    }
    return out;
  };
  chars.forEach((c, i) => { if (c !== ' ') d += ser(font.charToGlyph(c).getPath(cx, y, size).commands); cx += widths[i] + sp; });
  if (/NaN/.test(d)) throw new Error(`NaN in text outline for "${str}"`);
  return { d, width: total };
}

/* ---------- drawing context: one per SVG file ---------- */
export class Ctx {
  constructor(theme, w, h, label, { palette = 'warm', rx = 10, frame = false } = {}) {
    this.theme = theme; this.P = (palette === 'gh' ? GH : THEMES)[theme]; this.w = w; this.h = h; this.label = label; this.rx = rx; this.frame = frame;
    this.cssParts = []; this.defParts = []; this.body = []; this.n = 0; this.once_ = new Set();
  }
  id(p = 'i') { return `${p}${++this.n}`; }
  css(s) { this.cssParts.push(s); }
  once(key, fn) { if (!this.once_.has(key)) { this.once_.add(key); fn(); } }
  def(s) { this.defParts.push(s); }
  add(s) { this.body.push(s); }
  /** Reveal mask: a thick stroke along `d` that draws itself (use to animate filled brush shapes). Returns the mask id. */
  reveal(d, width, { dur = 1.4, delay = 0, ease = 'ease-out' } = {}) {
    const id = this.id('rv');
    this.once('dr', () => this.css('.dr{stroke-dasharray:100}@keyframes dr{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}'));
    this.def(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${this.w}" height="${this.h}"><path class="dr" pathLength="100" d="${d}" fill="none" stroke="#fff" stroke-width="${width}" style="animation:dr ${dur}s ${ease} ${delay}s backwards"/></mask>`);
    return id;
  }
  /** Fade/slide-in helper: returns a style attribute value. */
  enter(delay = 0, dur = 0.9, from = 'translateY(14px)') {
    this.once('enter-' + from, () => {});
    const name = 'en' + [...from].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36);
    this.once(name, () => this.css(`@keyframes ${name}{from{opacity:0;transform:${from}}}`));
    return `animation:${name} ${dur}s ease-out ${delay}s backwards`;
  }
  out() {
    const css = this.cssParts.join('') + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" role="img" aria-label="${esc(this.label)}"><title>${esc(this.label)}</title><style>${css}</style><defs><clipPath id="all"><rect width="${this.w}" height="${this.h}" rx="${this.rx}"/></clipPath>${this.defParts.join('')}</defs><g clip-path="url(#all)">${this.body.join('')}</g>${this.frame ? `<rect x=".5" y=".5" width="${this.w - 1}" height="${this.h - 1}" rx="${this.rx}" fill="none" stroke="${this.P.border}"/>` : ''}</svg>\n`;
  }
}

/* ---------- patterns ---------- */
export function dots(ctx, { gap = 6, r = 1.4, color, angle = 45 } = {}) {
  const id = ctx.id('dots');
  ctx.def(`<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><circle cx="${gap / 2}" cy="${gap / 2}" r="${r}" fill="${color ?? ctx.P.ink}"/></pattern>`);
  return id;
}
export function hatch(ctx, { gap = 5, w = 0.9, color, angle = 45 } = {}) {
  const id = ctx.id('hat');
  ctx.def(`<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${color ?? ctx.P.ink}" stroke-width="${w}"/></pattern>`);
  return id;
}

/* ---------- repo emblems (drawn in a ±50 box; each one has its own small animation) ---------- */
export const REPO_NAMES = { 'caderno-de-estudos': 'caderno', trevo: 'trevo', polar: 'polar', farol: 'farol', encaixe: 'encaixe' };

export function emblem(ctx, name, x, y, s = 1, { delay = 0 } = {}) {
  const P = ctx.P, ink = P.ink, ac = P.accent;
  const k = name;
  let inner = '';
  if (k === 'polar') {
    ctx.once('em-polar', () => ctx.css('.emp{transform-box:fill-box;transform-origin:center;animation:emp 3.2s ease-in-out infinite alternate}@keyframes emp{from{transform:scale(.88);opacity:.75}to{transform:scale(1.08);opacity:1}}'));
    inner = `<g class="emp" style="animation-delay:${delay}s"><path d="M0-46 7-7 46 0 7 7 0 46-7 7-46 0-7-7Z" fill="${ink}"/><path d="M0-17 5-5 17 0 5 5 0 17-5 5-17 0-5-5Z" fill="${P.paper}"/><circle r="3.4" fill="${ac}"/></g><g stroke="${P.ink2}" stroke-width="1.4"><path d="M-27-27-12-12M27-27 12-12M-27 27-12 12M27 27 12 12"/></g>`;
  } else if (k === 'caderno') {
    ctx.once('em-caderno', () => ctx.css('.emc{stroke-dasharray:100;animation:emc 4.2s ease-in-out infinite}@keyframes emc{0%{stroke-dashoffset:100}45%,100%{stroke-dashoffset:0}}'));
    inner = `<rect x="-30" y="-40" width="60" height="80" rx="4" fill="${P.paper}" stroke="${ink}" stroke-width="3"/><rect x="-30" y="-40" width="11" height="80" rx="3" fill="${ink}"/><g stroke="${P.ink2}" stroke-width="2.2" stroke-linecap="round"><path d="M-8-22H20M-8-10H20M-8 2H14"/></g><path class="emc" style="animation-delay:${delay}s" pathLength="100" d="M-8 18Q2 10 8 20T22 16" fill="none" stroke="${ac}" stroke-width="3.4" stroke-linecap="round"/><path d="M14-40V-22l5-4 5 4V-40Z" fill="${ac}"/>`;
  } else if (k === 'trevo') {
    ctx.once('em-trevo', () => ctx.css('.emt{transform-origin:0px 46px;animation:emt 4s ease-in-out infinite alternate}@keyframes emt{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}'));
    const leaf = (r) => `<path transform="rotate(${r})" d="M0 0C-16-10-22-30-8-34-3-35 0-30 0-26 0-30 3-35 8-34 22-30 16-10 0 0Z" fill="${ink}"/>`;
    inner = `<g class="emt" style="animation-delay:${delay}s">${[0, 90, 180, 270].map(leaf).join('')}<path d="M0 0C2 16-2 30 6 46" fill="none" stroke="${P.ink2}" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="${ac}"/></g>`;
  } else if (k === 'gastos') {
    ctx.once('em-gastos', () => ctx.css('.emg{transform-box:fill-box;transform-origin:center;animation:emg 3.6s ease-in-out infinite}@keyframes emg{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.06)}}.emg2{animation:emg2 3.6s ease-in-out infinite}@keyframes emg2{0%,30%{transform:translateY(-14px);opacity:0}55%{opacity:1}75%,100%{transform:translateY(0);opacity:1}}'));
    const dl = text('$', 0, 17, 54, { anchor: 'middle' }).d;
    inner = `<path d="M-30 44H30" stroke="${P.ink2}" stroke-width="3" stroke-linecap="round"/><g class="emg" style="animation-delay:${delay}s"><circle r="34" fill="${P.paper}" stroke="${ink}" stroke-width="3.4"/><circle r="26" fill="none" stroke="${ac}" stroke-width="2"/><path d="${dl}" fill="${ink}"/></g><circle class="emg2" cx="30" cy="-36" r="6" fill="${ac}"/>`;
  } else if (k === 'farol') {
    ctx.once('em-farol', () => ctx.css('.fbl,.fbr{animation:fb 4s ease-in-out infinite}.fbr{animation-delay:-2s}@keyframes fb{0%,100%{opacity:.08}50%{opacity:.8}}.flamp{animation:fl 2s ease-in-out infinite alternate}@keyframes fl{from{opacity:.7}to{opacity:1}}'));
    inner = `<path d="M0-46V-36" stroke="${ink}" stroke-width="2.4"/><rect x="-14" y="-36" width="28" height="7" rx="1.5" fill="${ink}"/><path d="M-14-29Q-36 0-14 29H14Q36 0 14-29Z" fill="${P.paper}" stroke="${ink}" stroke-width="3.2"/><path class="flamp" d="M-9-22Q-20 0-9 22H9Q20 0 9-22Z" fill="${P.accent2}"/><path d="M-25-14Q0-8 25-14M-28 0Q0 6 28 0M-25 14Q0 20 25 14" stroke="${ink}" stroke-width="1.8" fill="none"/><rect x="-14" y="29" width="28" height="7" rx="1.5" fill="${ink}"/><path d="M0 36V47" stroke="${ink}" stroke-width="2.4"/>`;
  } else if (k === 'encaixe') {
    ctx.once('em-encaixe', () => ctx.css('.enr{animation:enr 3.6s ease-in-out infinite}@keyframes enr{0%,15%{transform:translateX(16px)}40%,100%{transform:translateX(0)}}.ens{transform-box:fill-box;transform-origin:center;opacity:0;animation:ens 3.6s ease-out infinite}@keyframes ens{0%,38%{opacity:0;transform:scale(.4)}42%{opacity:.9}70%,100%{opacity:0;transform:scale(2.4)}}'));
    inner = `<path d="M-44-22H-8V-9H4V9H-8V22H-44Z" fill="${ink}"/><g class="enr" style="animation-delay:${delay}s"><path d="M-6-22H44V22H-6V9H6V-9H-6Z" transform="translate(1 0)" fill="${P.ink2}"/></g><circle class="ens" cx="0" cy="0" r="12" fill="none" stroke="${ac}" stroke-width="2.4"/>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${inner}</g>`;
}

/* ---------- motifs ---------- */
/** Crow gliding to the right, centered at the origin (size ~ 90 wide). */
export function crow(ctx, x, y, s = 1, { flip = false, delay = 0, fill } = {}) {
  ctx.once('crow', () => ctx.css('.cw{transform-origin:0px -4px;animation:cw 1.1s ease-in-out infinite}@keyframes cw{0%,100%{transform:rotate(0)}50%{transform:rotate(-85deg)}}.cb{animation:cb .7s ease-in-out infinite alternate}@keyframes cb{from{transform:translateY(1.6px)}to{transform:translateY(-1.6px)}}'));
  const c = fill ?? ctx.P.ink, eye = ctx.P.canvas, dl = `animation-delay:${delay}s`;
  // swallow in profile, facing right: forked tail, round head with beak, pale belly, long swept-back wing with split primaries
  const wing = 'M-1 -4Q6-24 30-34Q40-37 50-35Q44-29 45-26Q38-24 39-20Q31-18 31-14Q22-12 21-8Q13-6 7-3Z';
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${flip ? -s : s} ${s})" fill="${c}"><g class="cb" style="${dl}">` +
    `<g class="cw" style="${dl};animation-delay:${delay + 0.08}s;opacity:.55"><path d="${wing}" transform="translate(-3 1) scale(.86) rotate(12 0 -4) scale(-1 1)"/></g>` +
    `<path d="M-14 0L-37-6-29 0-37 7-14 3Z"/><path d="M-20 2C-14-9 6-12 17-7C24-4 25 3 19 7C9 12-10 11-20 2Z"/><circle cx="19" cy="-4" r="5.8"/><path d="M23.5-5L32-2 23.5 0Z"/>` +
    `<path d="M-6 4C2 9 12 8 17 4C10 10-2 11-6 4Z" fill="${eye}" opacity=".5"/><circle cx="21" cy="-5" r="1.3" fill="${eye}"/>` +
    `<g class="cw" style="${dl}"><path d="${wing}" transform="rotate(12 0 -4) scale(-1 1)"/></g></g></g>`;
}

/** Pine tree with its base at (x, y). */
export function pine(ctx, x, y, h, seed = 1, { delay = 0, fill, sway = true } = {}) {
  const r = rng(seed), c = fill ?? ctx.P.ink;
  ctx.once('pine', () => ctx.css('.pn{animation:pn 5s ease-in-out infinite alternate}@keyframes pn{from{transform:rotate(-1.4deg)}to{transform:rotate(1.4deg)}}'));
  const layers = 5, w0 = h * 0.34;
  let d = '';
  for (let i = 0; i < layers; i++) {
    const t = i / layers, yy = -h * (0.18 + t * 0.7), w = w0 * (1 - t * 0.78) * (0.85 + r() * 0.3), hh = h * 0.26;
    d += `M${f(-w)} ${f(yy)}L${f((r() - 0.5) * w * 0.3)} ${f(yy - hh)}L${f(w)} ${f(yy)}L${f(w * 0.4)} ${f(yy + 3)}L${f(-w * 0.4)} ${f(yy - 2)}Z`;
  }
  return `<g transform="translate(${f(x)} ${f(y)})"><g class="${sway ? 'pn' : ''}" style="transform-origin:0px 0px;animation-delay:${delay}s"><path d="M-1.4 0L0-${f(h * 0.95)}L1.4 0Z" fill="${c}"/><path d="${d}" fill="${c}"/></g></g>`;
}

/** Curved blade polygon from (x, y) to the tip, length len, curving up by `sori`. Returns { d, spine }. */
export function blade(x, y, len, thick, sori = 10) {
  const a = [x, y], c = [x + len * 0.5, y - sori * 0.15], b = [x + len, y - sori];
  const spine = quad(a, c, b, 40);
  const top = [], bot = [];
  spine.forEach((p, i) => {
    const t = i / (spine.length - 1);
    const nx = spine[Math.min(i + 1, spine.length - 1)][0] - spine[Math.max(i - 1, 0)][0], ny = spine[Math.min(i + 1, spine.length - 1)][1] - spine[Math.max(i - 1, 0)][1];
    const m = Math.hypot(nx, ny) || 1, ox = -ny / m, oy = nx / m, th = thick * (1 - Math.pow(t, 3) * 0.92) * (t > 0.96 ? (1 - t) / 0.04 : 1);
    top.push([p[0] - ox * th * 0.35, p[1] - oy * th * 0.35]);
    bot.push([p[0] + ox * th * 0.65, p[1] + oy * th * 0.65]);
  });
  const d = 'M' + top.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'L' + bot.reverse().map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
  return { d, spine };
}
