// A realistic katana, drawn in millimetres. Origin: end of the pommel (kashira); +x runs toward the tip, +y toward the cutting edge.
// Proportions follow real swords: nagasa ~720, tsuka ~277 incl. pommel, motohaba 31 -> sakihaba 22, sori ~16, tsuba 78 across.
// Parts: blade (mune, shinogi-ji, shinogi, hira with ji-hada, hamon with nioi and ashi, bo-hi, kissaki with yokote and boshi),
// habaki, seppa, tsuba (with sukashi), fuchi, tsuka (same-gawa under a hishimaki wrap that alternates over/under), menuki, kashira.
import { f, lerp } from './lib.mjs';

const SW = {
  light: {
    outline: '#1f2328', mune: '#3b434b', shi: '#59636e', hira: '#8893a0', hira2: '#c2cad2', hamon: '#eef2f6', edge: '#ffffff',
    gold: ['#7d4e00', '#bf8700', '#f5d567'], iron: ['#3a4148', '#0f1317'], ironRim: '#6e7781',
    ito: '#1f2328', itoEdge: '#6e7781', sg: '#e6eaee', sgDot: '#a2adb8', menuki: ['#7d4e00', '#eac54f'],
  },
  dark: {
    outline: '#0d1117', mune: '#6e7681', shi: '#8b949e', hira: '#b3bdc8', hira2: '#dbe2e9', hamon: '#f6f8fa', edge: '#ffffff',
    gold: ['#9a6700', '#d29922', '#f8e3a1'], iron: ['#4a525c', '#171b21'], ironRim: '#9198a1',
    ito: '#2d333b', itoEdge: '#8b949e', sg: '#e6edf3', sgDot: '#8b949e', menuki: ['#9a6700', '#f0c14b'],
  },
};

export const KATANA = { pivotX: 297 };

/** Adds the sword definition (a <g id>) and its gradients to the context. Instantiate it with useKatana(). */
export function katanaDef(c, id, { nagasa = 720, sori = 16 } = {}) {
  const S = SW[c.theme], L = nagasa, X0 = 333, XT = X0 + L, w0 = 31, wy = 22, ty = 1 - 45 / L;
  const sm = (v) => v * v * (3 - 2 * v);
  const u = (s) => `${id}-${s}`;
  const cen = (t) => -sori * 4 * t * (1 - t);
  /** top (mune side) and bottom (edge side) of the blade at t in [0,1]. */
  const tb = (t) => {
    const ctr = cen(t);
    if (t <= ty) { const w = lerp(w0, wy, Math.pow(t / ty, 0.9)); return { top: ctr - w / 2, bot: ctr + w / 2 }; }
    const k = (t - ty) / (1 - ty), tip = ctr - 0.08 * wy;
    return { top: lerp(ctr - wy / 2, tip, Math.pow(k, 1.5)), bot: lerp(ctr + wy / 2, tip, Math.pow(k, 2.3)) };
  };
  const pt = (fr, t) => { const { top, bot } = tb(t); return [X0 + L * t, top + (typeof fr === 'function' ? fr(t) : fr) * (bot - top)]; };
  // The blade is a parabola with a gentle taper, so a handful of quadratic segments reproduce it closely.
  const BP = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, ty, ty + (1 - ty) * 0.35, ty + (1 - ty) * 0.7, 1];
  const q = (fr, a = 0, b = 1, rev = false, cont = false) => {
    let ts = [a, ...BP.filter((t) => t > a + 1e-9 && t < b - 1e-9), b];
    if (rev) ts = ts.reverse();
    const s0 = pt(fr, ts[0]);
    let d = `${cont ? 'L' : 'M'}${f(s0[0])} ${f(s0[1])}`;
    for (let i = 1; i < ts.length; i++) {
      const p0 = pt(fr, ts[i - 1]), p1 = pt(fr, ts[i]), m = pt(fr, (ts[i - 1] + ts[i]) / 2);
      d += `Q${f(2 * m[0] - (p0[0] + p1[0]) / 2)} ${f(2 * m[1] - (p0[1] + p1[1]) / 2)} ${f(p1[0])} ${f(p1[1])}`;
    }
    return d;
  };
  const qband = (f0, f1, a = 0, b = 1) => `${q(f0, a, b)}${q(f1, a, b, true, true)}Z`;
  const poly = (fr, a, b, n) => 'M' + Array.from({ length: n + 1 }, (_, i) => pt(fr, lerp(a, b, i / n)).map(f).join(' ')).join('L');

  // hamon (gunome-like) boundary, as a fraction across the blade
  const wave = (x) => 0.052 * Math.sin((2 * Math.PI * x) / 31 + 0.7) + 0.03 * Math.sin((2 * Math.PI * x) / 17.3 + 2.1) + 0.014 * Math.sin((2 * Math.PI * x) / 7.7);
  const fh = (t) => {
    if (t > ty) return lerp(0.72, 0.34, Math.pow((t - ty) / (1 - ty), 1.1)); // boshi: the temper line returns up the kissaki
    const x = X0 + L * t;
    return lerp(0.98, 0.72, sm(Math.min(1, t / 0.035))) + wave(x) * sm(Math.min(1, t / 0.05));
  };

  const defs = [];
  const g = (name, stops, extra = '') => defs.push(`<linearGradient id="${u(name)}" ${extra}>${stops.map(([o, col, op]) => `<stop offset="${o}" stop-color="${col}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`);
  const [g0, g1, g2] = S.gold;
  g('gold', [[0, g0], [0.35, g2], [0.55, g1], [1, g0]], 'x1="0" y1="-20" x2="0" y2="20" gradientUnits="userSpaceOnUse"');
  g('goldh', [[0, g0], [0.4, g1], [0.7, g2], [1, g1]], 'x1="0" y1="-18" x2="0" y2="18" gradientUnits="userSpaceOnUse"');
  g('streak', [[0, '#fff', 0], [0.12, '#fff', 0.5], [0.6, '#fff', 0.3], [1, '#fff', 0]], `x1="${X0}" y1="0" x2="${XT}" y2="0" gradientUnits="userSpaceOnUse"`);
  g('cyl', [[0, '#000', 0.55], [0.28, '#000', 0.04], [0.5, '#fff', 0.16], [0.74, '#000', 0.06], [1, '#000', 0.6]], 'x1="0" y1="-17" x2="0" y2="17" gradientUnits="userSpaceOnUse"');
  g('shade', [[0, '#000', 0.34], [0.36, '#000', 0.02], [0.52, '#fff', 0.14], [0.85, '#fff', 0.02], [1, '#fff', 0]], 'x1="0" y1="-22" x2="0" y2="22" gradientUnits="userSpaceOnUse"');
  defs.push(`<radialGradient id="${u('iron')}" cx="0" cy="0" r="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${S.iron[0]}"/><stop offset="1" stop-color="${S.iron[1]}"/></radialGradient>`);
  defs.push(`<pattern id="${u('dots')}" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><circle cx="1.7" cy="1.7" r=".72" fill="${S.sgDot}"/></pattern>`);

  // shapes stored once and reused
  defs.push(`<path id="${u('sil')}" d="${qband(0, 1)}"/>`);
  defs.push(`<clipPath id="${u('blade')}"><use href="#${u('sil')}"/></clipPath>`);
  defs.push(`<path id="${u('hm')}" d="${poly(fh, 0, 1, 112)}${q(1, 0, 1, true, true)}Z"/>`);
  defs.push(`<clipPath id="${u('hmc')}"><use href="#${u('hm')}"/></clipPath>`);

  /* ---------------- blade ---------------- */
  let blade = `<use href="#${u('sil')}" fill="${S.hira}"/><g clip-path="url(#${u('blade')})">`;
  for (let k = 0; k < 5; k++) { // ji-hada: itame grain
    const f0 = 0.46 + k * 0.045, ph = k * 1.9;
    blade += `<path d="${q((t) => f0 + 0.016 * Math.sin((X0 + L * t) / (19 + k * 3) + ph), 0.02, ty)}" fill="none" stroke="${k % 2 ? S.hira2 : S.mune}" stroke-width=".8" opacity="${k % 2 ? 0.55 : 0.32}"/>`;
  }
  blade += `<path d="${qband(0, 0.4, 0, ty)}" fill="${S.shi}"/>`;                                            // shinogi-ji
  blade += `<path d="${q(0.4, 0, ty)}" fill="none" stroke="${S.edge}" stroke-width="1" opacity=".55"/>`;      // shinogi ridge
  blade += `<use href="#${u('hm')}" fill="${S.hamon}" opacity=".94"/>`;                                      // hamon
  blade += `<g clip-path="url(#${u('hmc')})"><path d="${q(1)}" fill="none" stroke="#fff" stroke-width="7" opacity=".55"/></g>`; // brighter nioi toward the edge
  blade += `<use href="#${u('hm')}" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/>`;              // nioi-guchi
  for (let k = 0; k < 24; k++) { const t = 0.03 + k * 0.038; if (t < ty - 0.01) { const [x, y] = pt(fh, t); blade += `<path d="M${f(x)} ${f(y)}l-1.5 ${-4 - (k % 3)}" stroke="${S.hira2}" stroke-width=".7" opacity=".65"/>`; } } // ashi
  blade += `<rect x="${X0}" y="-24" width="${L}" height="48" fill="url(#${u('shade')})"/>`;                   // depth across the width
  blade += `<path d="${q(0.2, 0.03, 0.74)}" fill="none" stroke="${S.mune}" stroke-width="2.2" stroke-linecap="round"/>`;   // bo-hi
  blade += `<path d="${q(0.26, 0.04, 0.72)}" fill="none" stroke="#fff" stroke-width=".9" opacity=".4" stroke-linecap="round"/>`;
  blade += `<path d="${qband(0.455, 0.53, 0.02, 0.97)}" fill="url(#${u('streak')})"/>`;                       // mirror-polish reflection
  blade += `<polygon class="kgl" style="--d:${f(L + 140)}px" points="${f(X0 - 60)},-30 ${f(X0 - 38)},-30 ${f(X0 - 72)},34 ${f(X0 - 94)},34" fill="#fff"/>`; // animated glint
  blade += `</g>`;
  blade += `<path d="${q(1)}" fill="none" stroke="${S.edge}" stroke-width="1.3" opacity=".95"/>`;             // cutting edge
  blade += `<path d="${q(0)}" fill="none" stroke="${S.mune}" stroke-width="2.1"/><path d="${q(0.05)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".22"/>`; // mune
  const [yx, yt] = pt(0, ty), [, yb] = pt(1, ty);
  blade += `<path d="M${f(yx)} ${f(yt)}L${f(yx + 5)} ${f(yb)}" stroke="#fff" stroke-width="1.2" opacity=".65"/>`; // yokote
  blade += `<use href="#${u('sil')}" fill="none" stroke="${S.outline}" stroke-width="2.4" stroke-linejoin="round" opacity=".92"/>`;

  /* ---------------- fittings ---------------- */
  const habaki = `<path d="M303-19.6L331-17.2 333-15.6V15.6L331 17.2 303 19.6 301 17V-17Z" fill="url(#${u('gold')})" stroke="${S.outline}" stroke-width="1.2" stroke-linejoin="round"/><path d="M307-14V14M311-14V14M315-14V14" stroke="${g0}" stroke-width=".8" opacity=".5"/><path d="M304-18.4L330-16.2" stroke="#fff" stroke-width="1" opacity=".5"/>`;
  const seppa = `<rect x="300" y="-21.5" width="3.2" height="43" rx="1" fill="url(#${u('gold')})" stroke="${S.outline}" stroke-width=".9"/>`;
  const holeAt = [0.785, 2.356, 3.927, 5.498].map((a) => [22 * Math.cos(a), 22 * Math.sin(a)]);
  const holesD = holeAt.map(([cx, cy]) => `M${f(cx - 8.4)} ${f(cy)}A8.4 8.4 0 1 1 ${f(cx + 8.4)} ${f(cy)}A8.4 8.4 0 1 1 ${f(cx - 8.4)} ${f(cy)}Z`).join('');
  const tsuba = `<rect x="294.5" y="-39" width="6" height="78" fill="${S.iron[1]}" stroke="${S.outline}" stroke-width="1"/><ellipse cx="294.5" cy="0" rx="12.4" ry="39" fill="${S.iron[1]}" stroke="${S.outline}" stroke-width="1"/>
    <g transform="translate(300.5 0) scale(.32 1)"><path fill-rule="evenodd" d="M-39 0A39 39 0 1 0 39 0A39 39 0 1 0-39 0Z${holesD}" fill="url(#${u('iron')})"/><circle r="38" fill="none" stroke="${g1}" stroke-width="3"/><circle r="33" fill="none" stroke="${S.ironRim}" stroke-width="1.2" opacity=".7"/>${holeAt.map(([cx, cy]) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="8.4" fill="none" stroke="${S.ironRim}" stroke-width="1.3" opacity=".85"/>`).join('')}<circle r="11" fill="none" stroke="${S.ironRim}" stroke-width="1.1" opacity=".55"/><path d="M-31-22A38 38 0 0 1-8-37" fill="none" stroke="#fff" stroke-width="2.2" opacity=".35"/></g>`;
  const fuchi = `<rect x="277" y="-17.6" width="18" height="35.2" rx="3" fill="url(#${u('goldh')})" stroke="${S.outline}" stroke-width="1.1"/><path d="M283-16V16M289-16V16" stroke="${g0}" stroke-width=".9" opacity=".55"/><path d="M278.5-15.6L293-15.6" stroke="#fff" stroke-width="1" opacity=".45"/>`;

  /* ---------------- handle ---------------- */
  const T0 = 22, T1 = 277, hw = (x) => 15 + 2.6 * Math.sin((Math.PI * (x - T0)) / (T1 - T0));
  const xs = [T0, T0 + 51, T0 + 102, T0 + 153, T0 + 204, T1];
  const tuk = `M${xs.map((x) => `${f(x)} ${f(-hw(x))}`).join('L')}L${[...xs].reverse().map((x) => `${f(x)} ${f(hw(x))}`).join('L')}Z`;
  defs.push(`<path id="${u('tk')}" d="${tuk}"/><clipPath id="${u('tsuka')}"><use href="#${u('tk')}"/></clipPath>`);
  const p = 26, bw = 12, W = 2 * 17.6, ks = Array.from({ length: Math.ceil((T1 - T0) / p) + 2 }, (_, k) => T0 - p + k * p);
  const bandA = (x) => `M${f(x)} ${-W / 2}h${bw}l${p} ${W}h${-bw}Z`;
  const bandB = (x) => `M${f(x + p)} ${-W / 2}h${bw}l${-p} ${W}h${-bw}Z`;
  const edgeA = (x) => `M${f(x)} ${-W / 2}l${p} ${W}m${-p + bw} ${-W}l${p} ${W}`;
  const edgeB = (x) => `M${f(x + p)} ${-W / 2}l${-p} ${W}m${p + bw} ${-W}l${-p} ${W}`;
  const rh = (x) => { const r = bw / p, s0 = (1 - r) / 2, s1 = (1 + r) / 2; return `M${f(x + p / 2)} 0L${f(x + p / 2 + bw / 2)} ${f(-W / 2 + W * s0)}L${f(x + p / 2 + bw)} 0L${f(x + p / 2 + bw / 2)} ${f(-W / 2 + W * s1)}Z`; };
  let tsuka = `<use href="#${u('tk')}" fill="${S.sg}"/><use href="#${u('tk')}" fill="url(#${u('dots')})"/><g clip-path="url(#${u('tsuka')})">`;
  tsuka += `<path d="${ks.map(bandA).join('')}" fill="${S.ito}"/><path d="${ks.map(edgeA).join('')}" stroke="${S.itoEdge}" stroke-width=".9" opacity=".8"/>`;
  tsuka += `<path d="${ks.map(bandB).join('')}" fill="${S.ito}"/><path d="${ks.map(edgeB).join('')}" stroke="${S.itoEdge}" stroke-width=".9" opacity=".8"/>`;
  // at every other crossing the first band passes over the second, as in a real hishimaki
  const over = ks.filter((_, k) => k % 2 === 0);
  tsuka += `<path d="${over.map(rh).join('')}" fill="${S.ito}"/>`;
  over.forEach((x, k) => { defs.push(`<clipPath id="${u('r' + k)}"><path d="${rh(x)}"/></clipPath>`); tsuka += `<path d="${edgeA(x)}" stroke="${S.itoEdge}" stroke-width=".9" opacity=".8" clip-path="url(#${u('r' + k)})"/>`; });
  const mk = (x) => `<g transform="translate(${f(x)} -1) rotate(-24)"><path d="M-8 0Q0-6.4 8 0Q0 6.4-8 0Z" fill="${S.menuki[0]}"/><path d="M-6.4 0Q0-4.6 6.4 0Q0 2.4-6.4 0Z" fill="${S.menuki[1]}"/><circle r="1.6" fill="${S.menuki[0]}"/></g>`;
  const wc = (k) => ks[k] + p / 2 + bw / 2 + p / 2; // centre of the window between crossing k and k+1
  tsuka += mk(wc(4)) + mk(wc(7));
  tsuka += `<rect x="${T0}" y="-18" width="${T1 - T0}" height="36" fill="url(#${u('cyl')})"/></g>`;
  tsuka += `<use href="#${u('tk')}" fill="none" stroke="${S.outline}" stroke-width="1.6" stroke-linejoin="round"/>`;
  const kashira = `<path d="M22-16.8L9-16.8Q0-16 0 0Q0 16 9 16.8L22 16.8Z" fill="url(#${u('goldh')})" stroke="${S.outline}" stroke-width="1.4" stroke-linejoin="round"/><path d="M10-14.6Q3-13 2.6-2" fill="none" stroke="#fff" stroke-width="1.1" opacity=".5"/><circle cx="10.5" cy="0" r="3" fill="${S.ito}" stroke="${g0}" stroke-width="1"/><path d="M19-16V16" stroke="${g0}" stroke-width="1" opacity=".6"/>`;

  c.once('kgl', () => c.css('.kgl{opacity:0;animation:kgl 5.5s ease-in-out infinite}@keyframes kgl{0%{transform:translateX(0);opacity:.75}55%,100%{transform:translateX(var(--d));opacity:.75}}'));
  defs.forEach((d) => c.def(d));
  c.def(`<g id="${id}">${blade}${habaki}${seppa}${tsuba}${fuchi}${tsuka}${kashira}</g>`);
  return id;
}

/** Instance of the sword. (px, py) is where the tsuba centre lands; `angle` points the tip; `s` is px per mm; flip mirrors the edge side. */
export function useKatana(id, px, py, angle, s, { flip = false } = {}) {
  return `<use href="#${id}" transform="translate(${f(px)} ${f(py)}) rotate(${angle}) scale(${s} ${flip ? -s : s}) translate(${-KATANA.pivotX} 0)"/>`;
}
