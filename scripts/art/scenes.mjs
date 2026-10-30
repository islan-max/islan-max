// v1: the merge. Hero = Emakimono with manga touches; repositories = manga page (clashing swords, Ursa Minor, coin diary);
// contributions = the two mountain ridges without landmarks; numbers = the traveler's road strip. GitHub Primer palette.
import { Ctx, esc, text, brush, smoothD, quad, blade, crow, pine, emblem, dots, hatch, rng, vnoise, font, f, lerp } from './lib.mjs';
import { katanaDef, useKatana } from './sword.mjs';
import { polarBody } from './polar.mjs';
import { landscape, kit, grove, cun, lonePine, leaves, dataRidge, TONES } from './peaks.mjs';
import { gastosBody, farolBody, encaixeBody, chochin } from './panels.mjs';

const O = { palette: 'gh', rx: 8, frame: true };
const NAME = { 'caderno-de-estudos': 'caderno', trevo: 'diário de gastos', 'diario-de-gastos': 'diário de gastos', polar: 'polar', farol: 'farol', encaixe: 'encaixe' };
const EMB = { caderno: 'caderno', 'diário de gastos': 'gastos', polar: 'polar', farol: 'farol', encaixe: 'encaixe' };
const MESES = [...'JFMAMJJASOND'];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const polyD = (p) => 'M' + p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';

function common(c) {
  c.css('.sp{animation:spf .8s steps(2) infinite}@keyframes spf{0%{opacity:1}50%{opacity:.45}}');
  c.css('.pw{animation:pw .8s cubic-bezier(.2,.8,.2,1) backwards}@keyframes pw{from{opacity:0;transform:translateX(var(--dx,-40px))}}');
  c.css('.jt{animation:jt .5s steps(2) infinite}@keyframes jt{0%{transform:translate(0,0)}50%{transform:translate(2px,-2px)}}');
  c.css('.ms{animation:ms 20s ease-in-out infinite alternate}@keyframes ms{from{transform:translateX(-80px)}to{transform:translateX(80px)}}');
  c.css('.hk{animation:hk 28s linear infinite}@keyframes hk{0%{transform:translate(-90px,var(--y))}50%{transform:translate(420px,calc(var(--y) - 26px))}100%{transform:translate(900px,var(--y))}}');
  c.css('.sun{transform-box:fill-box;transform-origin:center;animation:sun 6s ease-in-out infinite alternate}@keyframes sun{from{transform:scale(.96)}to{transform:scale(1.05)}}');
  c.css('.gs{transform-box:fill-box;transform-origin:50% 100%;animation:gs var(--p,4s) ease-in-out infinite alternate}@keyframes gs{from{transform:skewX(var(--a,-3deg))}to{transform:skewX(var(--b,3deg))}}');
  c.css('.cf{animation:cf var(--t,16s) linear infinite}@keyframes cf{0%{transform:translate(var(--x0),var(--y0))}50%{transform:translate(var(--x1),var(--y1))}100%{transform:translate(var(--x2),var(--y2))}}');
}

/* ------------------------------ shared drawing pieces ------------------------------ */

function ridge({ values, base, maxH, vmax, seed = 1, jag = 10, step = 8, x0 = -10, x1 = 810 }) {
  const n = vnoise(seed), v = values.map((x) => Math.sqrt(Math.max(0, x ?? 0) / vmax));
  const pts = [];
  for (let x = x0; x <= x1; x += step) {
    const u = (x / 800) * 11, i = Math.floor(clamp01(u / 11) * 11), t = clamp01(u - i), s = (1 - Math.cos(Math.PI * t)) / 2;
    const h = lerp(v[Math.min(i, 11)] ?? 0, v[Math.min(i + 1, 11)] ?? 0, s) * maxH + (n(x / 26) - 0.5) * jag + (n(x / 9) - 0.5) * jag * 0.5;
    pts.push([x, base - Math.max(2, h)]);
  }
  const yAt = (x) => { const k = Math.max(0, Math.min(pts.length - 1, (x - x0) / step)), i = Math.floor(k); return lerp(pts[i][1], pts[Math.min(i + 1, pts.length - 1)][1], k - i); };
  return { pts, yAt, line: smoothD(pts) };
}

function mist(c, y, h, { dur = 20, delay = 0, op = 0.85, w = 1000 } = {}) {
  const P = c.P, g = c.id('mg'), v = c.id('mv'), m = c.id('mm');
  c.def(`<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.card}" stop-opacity="0"/><stop offset=".3" stop-color="${P.card}" stop-opacity="${op}"/><stop offset=".7" stop-color="${P.card}" stop-opacity="${op}"/><stop offset="1" stop-color="${P.card}" stop-opacity="0"/></linearGradient><linearGradient id="${v}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}"><rect x="-100" y="${y}" width="${w + 200}" height="${h}" fill="url(#${v})"/></mask>`);
  return `<g mask="url(#${m})"><rect class="ms" style="animation-duration:${dur}s;animation-delay:-${delay}s" x="${-(w - 800) / 2}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/></g>`;
}

function hawk(c, y, s = 1.2, delay = 0, x = 560) {
  return `<g class="hk" style="--y:${y}px;transform:translate(${x}px,${y}px);animation-delay:-${delay}s">${crow(c, 0, 0, s, { fill: c.P.line })}</g>`;
}

function toneFade(c, x, y, w, h, dir = 'down', { gap = 5, r = 1.3, color, op = 1 } = {}) {
  const P = c.P, pat = dots(c, { gap, r, color: color ?? P.line, angle: 45 }), g = c.id('tg'), m = c.id('tm');
  const [x1, y1, x2, y2] = dir === 'down' ? [0, 0, 0, 1] : dir === 'up' ? [0, 1, 0, 0] : dir === 'right' ? [0, 0, 1, 0] : [1, 0, 0, 0];
  c.def(`<linearGradient id="${g}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/></mask>`);
  return `<g opacity="${op}" mask="url(#${m})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pat})"/></g>`;
}

function speed(c, cx, cy, r0, r1, n, seed, { color, w = 1.2, op = 0.7 } = {}) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.08, a0 = r0 * (0.9 + r() * 0.3), a1 = r1 * (0.7 + r() * 0.5);
    d += `M${f(cx + Math.cos(a) * a0)} ${f(cy + Math.sin(a) * a0)}L${f(cx + Math.cos(a) * a1)} ${f(cy + Math.sin(a) * a1)}`;
  }
  return `<path class="sp" d="${d}" stroke="${color ?? c.P.line}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" fill="none"/>`;
}

/** Sound effect: outlined glyphs with a halo, jittering. */
function sfx(c, str, x, y, size, { rot = 0, fill, halo, delay = 0 } = {}) {
  const P = c.P, t = text(str, 0, 0, size, { anchor: 'middle' });
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})"><g class="jt" style="animation-delay:-${delay}s"><path d="${t.d}" fill="${fill ?? P.accent}" stroke="${halo ?? P.canvas}" stroke-width="${f(size * 0.13)}" stroke-linejoin="round" paint-order="stroke"/></g></g>`;
}

/** y of a quadratic-bezier chain at x (points p0, then [control, end] pairs), by sampling. */
function chainY(p0, segs) {
  const pts = [];
  let a = p0;
  for (const [q, b] of segs) { for (let i = 0; i <= 40; i++) { const t = i / 40, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * q[0] + t * t * b[0], u * u * a[1] + 2 * u * t * q[1] + t * t * b[1]]); } a = b; }
  return (x) => { for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) return lerp(pts[i - 1][1], pts[i][1], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1)); return pts[pts.length - 1][1]; };
}

/** One depth layer of grass along a ground line: blades in short chunks that sway with a travelling phase. */
function grass(base, { x0 = -6, x1 = 540, gap, h, w, tone, seed, dur, amp, op = 1 }) {
  const r = rng(seed), r1 = (v) => Math.round(v * 10) / 10, chunk = 46;
  let out = '';
  for (let cx = x0; cx < x1; cx += chunk) {
    let d = '', px = 0, py = 0; // relative commands keep the path short; z returns to the blade's start point
    for (let x = cx; x < Math.min(cx + chunk, x1); x += gap * (0.7 + r() * 0.6)) {
      const k = r(), hh = k < 0.34 ? h[0] + r() * 3 : k < 0.75 ? (h[0] + h[1]) / 2 + r() * 3 : h[1] - r() * 3, ww = w * (0.8 + r() * 0.5), lean = (r() - 0.5) * hh * 0.5, y = base(x) + 2;
      const sx = r1(x - ww), sy = r1(y), tx = r1(x + lean), ty = r1(y - hh);
      d += `${px === 0 && py === 0 ? 'M' : 'm'}${r1(sx - px)} ${r1(sy - py)}q${r1(ww * 0.7 + lean * 0.4)} ${r1(-hh * 0.55)} ${r1(tx - sx)} ${r1(ty - sy)}q${r1(ww * 0.3 - lean * 0.5)} ${r1(hh * 0.5)} ${r1(x + ww - tx)} ${r1(sy - ty)}z`;
      px = sx; py = sy;
    }
    out += `<path class="gs" style="--p:${dur}s;--a:${-amp}deg;--b:${amp}deg;animation-delay:-${((cx - x0) * 0.012 + 0.0).toFixed(2)}s" d="${d}"/>`;
  }
  return `<g fill="${tone}" opacity="${op}">${out}</g>`;
}

function panel(c, poly, bg, body, delay = 0, dx = -40) {
  const id = c.id('pn');
  c.def(`<clipPath id="${id}"><path d="${polyD(poly)}"/></clipPath>`);
  return `<g class="pw" style="--dx:${dx}px;animation-delay:${delay}s"><g clip-path="url(#${id})"><path d="${polyD(poly)}" fill="${bg}"/>${body}</g><path d="${polyD(poly)}" fill="none" stroke="${c.P.line}" stroke-width="3.2" stroke-linejoin="miter"/></g>`;
}

function caption(c, nm, num, x, y, delay) {
  const P = c.P, t = text(nm, x + 34, y + 6, 16), n = text(String(num), x + 34 + t.width + 8, y + 6, 13), w = 34 + t.width + n.width + 22;
  return `<g class="pw" style="--dx:-20px;animation-delay:${delay}s"><rect x="${x - 8}" y="${y - 19}" width="${f(w)}" height="34" fill="${P.canvas}" stroke="${P.line}" stroke-width="2"/>${emblem(c, EMB[nm], x + 10, y - 2, 0.28, { delay })}<path d="${t.d}" fill="${P.line}"/><path d="${n.d}" fill="${P.line3}"/></g>`;
}

/* ------------------------------------ 1. hero ------------------------------------ */

function hero(theme, D) {
  const c = new Ctx(theme, 800, 360, 'bazhish. Montanhas em névoa, um sol laranja com linhas de velocidade e aves cruzando o céu.', O);
  const P = c.P;
  common(c);
  c.add(toneFade(c, 0, 0, 800, 240, 'down', { gap: 6, r: 1.5, op: 0.16 }));
  c.add(speed(c, 610, 120, 72, 138, 28, 3, { color: P.line2, w: 1, op: 0.2 }));
  c.add(`<circle class="sun" cx="610" cy="120" r="50" fill="${P.accent}"/><circle class="sun" cx="610" cy="120" r="66" fill="none" stroke="${P.accent}" stroke-width="1.2" opacity=".45"/>`);
  c.add(landscape(c, { mist, dark: theme === 'dark' }));
  c.add(hawk(c, 80, 1.15, 6));
  c.add(`<g class="cf" style="--x0:-40px;--y0:150px;--x1:360px;--y1:120px;--x2:840px;--y2:150px;--t:30s;transform:translate(300px,126px)">${crow(c, 0, 0, 0.6, { fill: P.line2 })}</g>`);
  // the name: letters with a slight brush irregularity, dry-brush gaps and a red seal
  const NX = 40, NY = 150, NS = 104, rn = rng(17);
  let nx = NX, nd = '';
  for (const ch of 'bazhish') {
    const g = text(ch, nx, NY + (rn() - 0.5) * 5, NS), rot = (rn() - 0.5) * 3.2;
    nd += `<path transform="rotate(${rot.toFixed(1)} ${f(nx + g.width / 2)} ${NY})" d="${g.d}"/>`;
    nx += g.width + 1;
  }
  const nameClip = c.id('nm');
  c.def(`<clipPath id="${nameClip}">${nd}</clipPath>`);
  let dry = '';
  for (let i = 0; i < 9; i++) { const y = 70 + rn() * 78, x = NX + rn() * (nx - NX - 40), l = 26 + rn() * 90; dry += `M${f(x)} ${f(y)}l${f(l)} ${f((rn() - 0.5) * 3)}`; }
  c.add(`<g style="${c.enter(0.4, 1)}"><g fill="${P.line}">${nd}</g><path clip-path="url(#${nameClip})" d="${dry}" stroke="${P.card}" stroke-width="1" stroke-linecap="round" opacity=".45" fill="none"/></g>`);
  const seal = text('刃', 0, 0, 24, { anchor: 'middle' });
  c.add(`<g transform="translate(${f(nx + 22)} 126) rotate(5)" style="${c.enter(1.6, 0.6)}"><rect x="-17" y="-17" width="34" height="34" rx="3" fill="${P.accent}"/><path d="${seal.d}" transform="translate(0 9)" fill="${P.canvas}"/></g>`);
  const u = brush(quad([NX + 4, 176], [200, 168], [nx - 8, 177], 20), { size: 7, thin: 0.5 }), mu = c.reveal(`M${NX + 4} 176Q200 168 ${f(nx - 8)} 177`, 12, { dur: 1.2, delay: 1.2 });
  c.add(`<g mask="url(#${mu})"><path d="${u}" fill="${P.accent}"/></g>`);
  [0, 1, 2].forEach((i) => c.add(sfx(c, 'ゴ', 766, 78 + i * 44, 34, { rot: 6, halo: P.card, delay: i * 0.15 })));
  c.add(`<rect x="1.5" y="1.5" width="797" height="357" rx="7" fill="none" stroke="${P.line}" stroke-width="3"/>`);
  return c.out();
}

const HDR = 56;
/** Section title: a red seal with a kanji, the Portuguese title, a one-line legend and a hairline to the edge. */
function header(c, glyph, title, sub) {
  const P = c.P, t = text(title, 58, 29, 24), g = text(glyph, 17, 26, 24, { anchor: 'middle' });
  return `<g style="${c.enter(0.1, 0.8)}"><g transform="translate(8 6) rotate(-3 17 17)"><rect width="34" height="34" rx="3" fill="${P.accent}"/><path d="${g.d}" fill="${P.canvas}"/></g><path d="${t.d}" fill="${P.line}"/><text x="58" y="48" font-size="12.5" fill="${P.line2}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif">${esc(sub)}</text><path d="M${f(58 + t.width + 14)} 22H792" stroke="${P.border}" stroke-width="1.2"/></g><g transform="translate(0 ${HDR})">`;
}

/* ------------------------------ 2. projects (manga page, one image per panel) ------------------------------ */

// The five panels tile an 800x604 page, so each one can be its own clickable image in the README.
// Neighbouring panels are separated by a slanted gutter whose width equals the slant, which is what lets the bounding boxes butt together.
const PAGE = {
  caderno: { box: [0, 0, 530, 262], poly: [[0, 0], [530, 0], [516, 262], [0, 262]] },
  gastos: { box: [530, 0, 800, 262], poly: [[544, 0], [800, 0], [800, 262], [530, 262]] },
  polar: { box: [0, 274, 290, 604], poly: [[0, 274], [290, 274], [276, 604], [0, 604]] },
  farol: { box: [290, 274, 566, 604], poly: [[304, 274], [566, 274], [552, 604], [290, 604]] },
  encaixe: { box: [566, 274, 800, 604], poly: [[580, 274], [800, 274], [800, 604], [566, 604]] },
};
const ROW_GAP = 8; // transparent strip under the first row, in addition to the line gap between rows
const LABEL = { caderno: 'caderno', gastos: 'diário de gastos', polar: 'polar', farol: 'farol', encaixe: 'encaixe' };
const ABOUT = {
  caderno: 'uma katana cravada na colina, entre capim ao vento e aves.',
  gastos: 'moedas e uma balança do tempo de Vagabond: ryō, bu, shu, mon e monme.',
  polar: 'a constelação da Ursa Menor, com zoom na estrela polar.',
  farol: 'lanternas de mão, chōchin e gandō, na noite.',
  encaixe: 'um quadro de horários de dojo, onde uma etiqueta encaixa no horário livre.',
};

const PANEL_BODY = {
  caderno(c, theme, caption) {
    const P = c.P, hatchHill = hatch(c, { gap: 4, w: 0.8, color: P.onMass, angle: -35 });
    katanaDef(c, 'kat');
    // three depths of ground, each with its own grass
    const yBack = chainY([0, 178], [[[130, 150], [270, 188]], [[410, 226], [530, 170]]]), yMid = chainY([0, 196], [[[110, 168], [240, 204]], [[370, 240], [530, 186]]]), yFront = chainY([0, 240], [[[90, 226], [200, 240]], [[310, 254], [400, 236]], [[490, 218], [540, 232]]]);
    const T = theme === 'dark' ? { back: TONES.dark.ridge[4], mid: TONES.dark.ridge[2], front: '#010409' } : { back: TONES.light.tree[0], mid: '#59636e', front: '#1f2328' };
    const gBack = 'M0 262V178Q130 150 270 188T530 170V262Z', gMid = 'M0 262V196Q110 168 240 204T530 186V262Z', gFront = 'M0 262V240Q90 226 200 240T400 236T540 232V262Z';
    return panel(c, PAGE.caderno.poly, P.panelBg, [
      toneFade(c, 0, 0, 530, 150, 'down', { gap: 6, r: 1.8, op: 0.7 }),
      `<path d="${gBack}" fill="${T.back}"/>`,
      grass(yBack, { gap: 5, h: [8, 15], w: 1.5, tone: T.back, seed: 21, dur: 5.6, amp: 2 }),
      useKatana('kat', 300, 98, 104, 0.64),
      `<path d="${gMid}" fill="${T.mid}"/><path d="${gMid}" fill="url(#${hatchHill})" opacity=".35"/>`,
      grass(yMid, { gap: 6, h: [13, 26], w: 2, tone: T.mid, seed: 22, dur: 4.4, amp: 3.5 }),
      `<path d="${gFront}" fill="${T.front}"/>`,
      grass(yFront, { gap: 7, h: [22, 40], w: 2.7, tone: T.front, seed: 23, dur: 3.5, amp: 5 }),
      `<g class="cf" style="--x0:40px;--y0:56px;--x1:150px;--y1:36px;--x2:240px;--y2:70px;--t:13s;transform:translate(150px,36px)">${crow(c, 0, 0, 1, { fill: P.line })}</g>`,
      `<g class="cf" style="--x0:330px;--y0:90px;--x1:420px;--y1:60px;--x2:500px;--y2:96px;--t:17s;transform:translate(420px,60px)">${crow(c, 0, 0, 0.7, { flip: true, delay: 0.3, fill: P.line })}</g>`,
      sfx(c, 'ドン', 430, 200, 66, { rot: -6, halo: P.panelBg }),
    ].join(''), 0.1, -50) + caption(20, 236, 0.9);
  },
  gastos(c, theme, caption) {
    const P = c.P;
    return panel(c, PAGE.gastos.poly, P.panelBg, [
      toneFade(c, 512, 0, 288, 200, 'down', { gap: 5, r: 1.9, op: 0.7 }),
      gastosBody(c),
      sfx(c, 'チャリン', 668, 40, 28, { rot: -6, halo: P.panelBg }),
    ].join(''), 0.25, 50) + caption(572, 238, 1.0);
  },
  polar(c, theme, caption) {
    const P = c.P, names = text('estrela polar', 20, 298, 13);
    return panel(c, PAGE.polar.poly, P.panelDark, [
      polarBody(c).body,
      `<path d="${names.d}" fill="${P.onDark}" opacity=".85"/>`,
      sfx(c, 'ピカッ', 214, 330, 32, { rot: 8, halo: P.panelDark }),
    ].join(''), 0.4, -50) + caption(20, 580, 1.1);
  },
  farol(c, theme, caption) {
    const P = c.P;
    return panel(c, PAGE.farol.poly, P.panelDark, [farolBody(c), sfx(c, 'キラ', 506, 338, 34, { rot: 10, halo: P.panelDark })].join(''), 0.55, 50) + caption(302, 580, 1.2);
  },
  encaixe(c, theme, caption) {
    const P = c.P;
    return panel(c, PAGE.encaixe.poly, P.panelBg, [toneFade(c, 560, 274, 240, 120, 'down', { gap: 6, r: 1.5, op: 0.5 }), encaixeBody(c), sfx(c, 'カチッ', 690, 306, 30, { rot: -6, halo: P.panelBg })].join(''), 0.7, 50) + caption(636, 580, 1.3);
  },
};

/** One panel of the page as its own image, drawn in page coordinates and cropped to its bounding box. */
function panelImage(theme, D, key) {
  const [x0, y0, x1, y1] = PAGE[key].box, label = LABEL[key];
  const by = Object.fromEntries(D.repos.map((r) => [NAME[r.name] ?? r.name, r]));
  const commits = by[label]?.commits ?? '';
  const c = new Ctx(theme, x1 - x0, y1 - y0 + (y0 === 0 ? ROW_GAP : 0), `${label}${commits === '' ? '' : `, ${commits} commits`}: ${ABOUT[key]}`, { ...O, rx: 0, frame: false });
  common(c);
  c.add(`<g transform="translate(${-x0} ${-y0})">`);
  c.add(PANEL_BODY[key](c, theme, (x, y, delay) => caption(c, label, commits, x, y, delay)));
  c.add('</g>');
  return c.out();
}

/** Title strip above the panels. */
function projetos(theme) {
  const c = new Ctx(theme, 800, HDR, 'Projetos: um painel por repositório', { ...O, rx: 0, frame: false });
  common(c);
  c.add(header(c, '作', 'Projetos', 'um painel por repositório, clique para abrir'));
  c.add('</g>');
  return c.out();
}

/* ------------------------ 3. contributions: two mountain ridges ------------------------ */

function grafico(theme, D) {
  const H = 560, G = 36, base = H - G, dark = theme === 'dark';
  const m26 = D.monthly[2026], m25 = D.monthly[2025];
  const vmax = Math.max(...m26.filter((v) => v != null), ...m25.filter((v) => v != null));
  const pk = m26.indexOf(Math.max(...m26.filter((v) => v != null))), px = (pk / 11) * 800;
  const c = new Ctx(theme, 800, H + HDR, `Contribuições por mês como duas montanhas: 2025 ao fundo e 2026 em destaque, com o pico de ${m26[pk]} em um mês.`, O);
  const P = c.P, ids = kit(c), T = TONES[dark ? 'dark' : 'light'];
  common(c);
  c.add(header(c, '山', 'Contribuições', '2025 ao fundo · 2026 à frente'));
  c.add(toneFade(c, 0, 0, 800, 260, 'down', { gap: 6, r: 1.5, op: 0.13 }));
  c.add(`<circle class="sun" cx="150" cy="116" r="36" fill="${P.accent}"/><circle class="sun" cx="150" cy="116" r="52" fill="none" stroke="${P.accent}" stroke-width="1.2" opacity=".4"/>`);
  const tone = dark ? { t25: T.tree[1], t26: T.tree[2], foot: T.tree[4] } : { t25: T.tree[1], t26: '#1f2328', foot: '#0d1117' };
  // decorative haze range (not data) behind everything, then the two data ridges, then a low foreground hill (not data)
  const haze = dataRidge([0.5, 0.8, 0.6, 1, 0.7, 0.9, 0.55, 0.85, 1, 0.6, 0.7, 0.5], { base: base - 110, maxH: 150, vmax: 1, seed: 2, jag: 8, w: 110 });
  const far = dataRidge(m25, { base: base - 70, maxH: 230, vmax, seed: 5, jag: 12, w: 80 });
  const near = dataRidge(m26, { base, maxH: 380, vmax, seed: 11, jag: 16, w: 90 });
  const foot = dataRidge([0.12, 0.2, 0.1, 0.25, 0.14, 0.2, 0.1, 0.22, 0.15, 0.1, 0.2, 0.12], { base: base + 4, maxH: 30, vmax: 1, seed: 21, jag: 8, w: 100 });
  const dt = dots(c, { gap: 5, r: 1.1, color: P.line, angle: 30 });
  const solid = (r) => `${r.d}L810 ${base + 8}L-10 ${base + 8}Z`;
  const ly = (i, s) => `<g class="ly" style="animation-delay:${(0.2 + i * 0.3).toFixed(2)}s">${s}</g>`;
  c.add(ly(0, `<path d="${solid(haze)}" fill="${T.ridge[0]}"/><path d="${solid(haze)}" fill="url(#${dt})" opacity=".25"/>`));
  c.add(ly(1, `<path d="${solid(far)}" fill="${T.ridge[1]}"/><path d="${solid(far)}" fill="url(#${dt})" opacity=".35"/><path d="${far.d}" fill="none" stroke="${P.line2}" stroke-width="1.6" stroke-dasharray="5 6"/>${grove(ids, far.at, { n: 14, th: [12, 22], tone: tone.t25, seed: 41, period: 4.6, maxRise: 180, base: base - 70, centres: 4 })}`));
  c.add(mist(c, base - 250, 110, { dur: 24, delay: 4, op: 0.85 }));
  c.add(ly(2, `<path d="${solid(near)}" fill="${P.mass}"/>${cun(near.at, base, { seed: 7, tone: dark ? '#f0f6fc' : '#ffffff', op: dark ? 0.13 : 0.26, len: 24 })}<path d="${near.d}" fill="none" stroke="${dark ? '#f0f6fc' : '#0d1117'}" stroke-width="1" opacity=".45"/>${grove(ids, near.at, { n: 26, th: [24, 46], tone: tone.t26, seed: 43, period: 4, maxRise: 250, base, centres: 4 })}`));
  c.add(mist(c, base - 200, 70, { dur: 30, delay: 12, op: 0.5 }));
  c.add(ly(3, `<path d="${solid(foot)}" fill="${tone.foot}"/>${grove(ids, foot.at, { n: 7, th: [48, 72], tone: tone.foot, seed: 45, period: 3.4, base, centres: 3 })}`));
  c.add(lonePine(735, foot.at(735) + 2, tone.foot, 1.3));
  c.add(leaves(P.accent, 8, { x: 20, y: 120, w: 420, h: 160, seed: 3 }));
  // peak and "today"
  const py = near.at(px);
  const a26 = text(`2026 · ${m26[pk]}`, px + 66, py + 18, 22), a25 = text('2025', 40, far.at(70) - 14, 22);
  const oct = (D.monthly[2026].map((v) => v != null).lastIndexOf(true) / 11) * 800;
  c.css('.td{animation:td 2.4s ease-in-out infinite alternate}@keyframes td{from{opacity:.4}to{opacity:1}}');
  c.add(`<circle cx="${f(px)}" cy="${f(py)}" r="5" fill="${P.accent}"/><path d="${a26.d}" fill="${P.accent}" style="${c.enter(2.6, 0.8)}"/><path d="${a25.d}" fill="${P.line2}" style="${c.enter(2.4, 0.8)}"/>`);
  const hj = text('hoje', oct + 8, 64, 15);
  c.add(`<g class="td"><path d="M${f(oct)} 60V${base}" stroke="${P.line2}" stroke-width="1.2" stroke-dasharray="3 5"/><path d="M${f(oct)} 60l14 6-14 6z" fill="${P.accent}"/><path d="${hj.d}" fill="${P.line2}" transform="translate(8 -2)"/></g>`);
  c.add(hawk(c, 150, 1.1, 2, 250));
  // month strip
  c.add(`<rect y="${base}" width="800" height="${G}" fill="${P.card}"/><path d="M0 ${base}H800" stroke="${P.border}"/>`);
  MESES.forEach((m, i) => { const t = text(m, Math.max(12, Math.min(788, (i / 11) * 800)), base + 23, 13, { anchor: 'middle' }); c.add(`<path d="${t.d}" fill="${P.line2}"/>`); });
  c.add('</g>');
  return c.out();
}

/* ---------------------------- 4. numbers: the traveler's strip ---------------------------- */

function numeros(theme, D) {
  const c = new Ctx(theme, 800, 310 + HDR, `${D.allTotal} contribuições; sequência atual ${D.streaks.current} de ${D.streaks.best}; linguagens ${D.langs.slice(0, 5).map((l) => `${l.name} ${Math.round(l.pct)}%`).join(', ')}.`, O);
  const P = c.P, s = D.streaks, dark = theme === 'dark', ids = kit(c);
  common(c);
  c.add(header(c, '数', 'Em números', 'total · sequência · linguagens'));
  c.css('.pn2{animation:pn 5s ease-in-out infinite alternate}@keyframes pn{from{transform:skewX(-3deg)}to{transform:skewX(3deg)}}');
  c.add(toneFade(c, 0, 0, 800, 150, 'down', { gap: 6, r: 1.4, op: 0.12 }));
  // soft decorative ranges behind the flags, with little groves and mist
  const Tn = TONES[dark ? 'dark' : 'light'], [t0, t1, tt] = [Tn.ridge[dark ? 1 : 0], Tn.ridge[dark ? 2 : 1], Tn.tree[0]];
  const bg0 = dataRidge([0.5, 0.9, 0.6, 1, 0.7, 0.8, 0.5, 0.9, 0.7, 1, 0.6, 0.7], { base: 270, maxH: 120, vmax: 1, seed: 31, jag: 7, w: 90 });
  const bg1 = dataRidge([0.3, 0.6, 0.4, 0.8, 0.5, 0.35, 0.7, 0.45, 0.6, 0.4, 0.7, 0.3], { base: 276, maxH: 80, vmax: 1, seed: 33, jag: 6, w: 100 });
  const sol = (r, b) => `${r.d}L810 ${b + 8}L-10 ${b + 8}Z`;
  c.add(`<g class="ly" style="animation-delay:.1s"><path d="${sol(bg0, 270)}" fill="${t0}"/></g>`);
  c.add(mist(c, 190, 60, { dur: 24, delay: 5, op: 0.7 }));
  c.add(`<g class="ly" style="animation-delay:.35s"><path d="${sol(bg1, 276)}" fill="${t1}"/>${grove(ids, bg1.at, { n: 12, th: [16, 28], tone: tt, seed: 51, period: 4.2, base: 276, maxRise: 60, x0: 260, x1: 790, centres: 3 })}</g>`);
  // milestone stone with the total, standing in grass
  const n1 = text(String(D.allTotal), 110, 118, 48, { anchor: 'middle' }), n2 = text('contribuições', 110, 146, 14, { anchor: 'middle' });
  c.add(`<path d="M40 232V74Q40 48 76 42L144 42Q180 48 180 74V232Z" fill="${P.mass}" style="${c.enter(0.2, 1, 'translateY(20px)')}"/><path d="${n1.d}" fill="${P.onMass}"/><path d="${n2.d}" fill="${P.onMass}" opacity=".8"/>`);
  c.add(grass(() => 238, { x0: 0, x1: 230, gap: 5, h: [14, 30], w: 2.6, tone: dark ? '#6e7681' : P.line2, seed: 61, dur: 4, amp: 4, op: 0.9 }));
  c.add(grass(() => 242, { x0: 0, x1: 230, gap: 7, h: [22, 40], w: 3.2, tone: P.mass, seed: 62, dur: 3.4, amp: 5 }));
  // streak: chōchin on a cord (lit = contribution green)
  const n = Math.max(s.best, 8);
  c.add(`<path d="M250 30Q500 18 760 30" fill="none" stroke="${P.line}" stroke-width="1.6"/>`);
  let ln = '';
  for (let i = 0; i < n; i++) {
    const x = 270 + i * 62, t = (x - 250) / 510, cy = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 18 + t * t * 30, lit = i < s.current;
    ln += chochin(c, x, f(cy + 17), 0.55, lit ? { paper: P.green2, light: dark ? '#56d364' : '#aceebb', ink: P.line, glow: P.green2, delay: i * 0.6 } : { paper: P.card, ink: P.line3, delay: i * 0.6 });
  }
  const a1 = text(String(s.current), 270, 140, 36), a2 = text(`/ ${s.best}`, 270 + a1.width + 8, 140, 20), a3 = text('sequência 灯', 270 + a1.width + a2.width + 26, 140, 15);
  c.add(`${ln}<path d="${a1.d}" fill="${P.green}"/><path d="${a2.d}" fill="${P.line3}"/><path d="${a3.d}" fill="${P.line2}"/>`);
  // languages: nobori banners in the GitHub language colors, height = share
  const LC = { MDX: '#fcb32c', TypeScript: '#3178c6', Python: dark ? '#79c0ff' : '#3572a5', Astro: '#ff5a03', CSS: dark ? '#a371f7' : '#663399', JavaScript: '#f1e05a' };
  const langs = D.langs.slice(0, 5), mx = langs[0].pct;
  let fl = '';
  langs.forEach((l, i) => {
    const x = 280 + i * 100, h = 24 + 56 * (l.pct / mx), top = 268 - h, nm = text(l.name, x + 8, 300, 13);
    fl += `<g><path d="M${x} 290V${top - 6}" stroke="${P.line}" stroke-width="2.4"/><g class="pn2" style="transform-origin:${x}px ${top}px;animation-delay:-${(i * 0.7).toFixed(1)}s"><path d="M${x + 2} ${top}H${x + 40}V${f(top + h)}H${x + 2}Z" fill="${LC[l.name] ?? P.line3}" stroke="${P.line}" stroke-width="1.4"/></g><path d="${nm.d}" fill="${P.line}"/></g>`;
  });
  c.add(fl);
  const lg = text('旗', 784, 210, 26, { anchor: 'end' });
  c.add(`<path d="${lg.d}" fill="${P.line2}"/>`);
  c.add(leaves(P.accent, 4, { x: 200, y: 40, w: 200, h: 90, seed: 8 }));
  c.add('</g>');
  return c.out();
}

export function render(theme, D) {
  const need = [...'diário de gastosestrela polarゴピカッチャリンカチキラドン'].filter((ch) => font.charToGlyphIndex(ch) === 0);
  if (need.length) throw new Error('glyphs missing: ' + need.join(''));
  const panels = Object.fromEntries(Object.keys(PAGE).map((k) => [k, panelImage(theme, D, k)]));
  return { hero: hero(theme, D), projetos: projetos(theme), ...panels, grafico: grafico(theme, D), numeros: numeros(theme, D) };
}
