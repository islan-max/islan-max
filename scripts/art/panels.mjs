// New repo panels: diário de gastos (Edo money: ryō/bu/shu gold, mon strings, monme silver on a scale),
// farol (hand lanterns: chōchin and gandō), encaixe (a dojo booking board where a name tag slides into a free slot).
import { f, rng, text } from './lib.mjs';

const sparkle = (x, y, R, k = 0.14) => { const a = R * k; return `M${f(x)} ${f(y - R)}Q${f(x + a)} ${f(y - a)} ${f(x + R)} ${f(y)}Q${f(x + a)} ${f(y + a)} ${f(x)} ${f(y + R)}Q${f(x - a)} ${f(y + a)} ${f(x - R)} ${f(y)}Q${f(x - a)} ${f(y - a)} ${f(x)} ${f(y - R)}Z`; };
const kanji = (s, x, y, size, fill, o = {}) => `<path d="${text(s, x, y, size, o).d}" fill="${fill}"/>`;

/* ------------------------------------- diário de gastos ------------------------------------- */

export function gastosBody(c) {
  const P = c.P;
  c.css('.sw{transform-origin:572px 0px;animation:sw 3.6s ease-in-out infinite alternate}@keyframes sw{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}');
  c.css('.bm{transform-origin:664px 88px;animation:bm 3.6s ease-in-out infinite alternate}@keyframes bm{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}.bq{animation:bq 3.6s ease-in-out infinite alternate}@keyframes bq{from{transform:rotate(4deg)}to{transform:rotate(-4deg)}}');
  c.css('.bb{animation:bb 2.6s ease-in-out infinite alternate}@keyframes bb{from{transform:translateY(-3px)}to{transform:translateY(3px)}}');
  c.css('.gk{transform-box:fill-box;transform-origin:center;animation:gk 2.2s ease-in-out infinite alternate}@keyframes gk{from{transform:scale(.4);opacity:.3}to{transform:scale(1.1);opacity:1}}');
  const L = P.line, coin = (x, y, i) => `<g transform="translate(${x + (i % 2 ? 0.6 : -0.6)} ${y})"><circle r="8.5" fill="${P.accent}" stroke="${L}" stroke-width="1.4"/><rect x="-2.6" y="-2.6" width="5.2" height="5.2" fill="${P.panelBg}" stroke="${L}" stroke-width=".9"/></g>`;
  const string = `<g class="sw"><path d="M572-2V182" stroke="${P.line2}" stroke-width="1.6"/>${Array.from({ length: 10 }, (_, i) => coin(572, 16 + i * 16.5, i)).join('')}<path d="M572 182l-4 12M572 182l4 12" stroke="${P.line2}" stroke-width="1.6" stroke-linecap="round"/></g>`;
  // silver: chōgin bars on the left pan, monme weights on the right
  const bar = (x, y, rot, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-11 0Q-11-5 0-5Q11-5 11 0Q11 4 0 4Q-11 4-11 0Z" fill="${P.panelBg}" stroke="${L}" stroke-width="1.4"/><circle cx="-4" cy="-.5" r=".9" fill="${P.line3}"/><circle cx="3" cy="-.5" r=".9" fill="${P.line3}"/></g>`;
  const weight = (x, y, s, glyph) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 0L-6-10H6L9 0Z" fill="${L}"/><circle cy="-13" r="3" fill="${L}"/>${glyph ? kanji('匁', 0, -2.2, 10, P.panelBg, { anchor: 'middle' }) : ''}</g>`;
  const hang = (x) => `<path d="M${x} 88L${x - 20} 130M${x} 88L${x + 20} 130" stroke="${P.line2}" stroke-width="1.2"/><path d="M${x - 22} 130Q${x} 148 ${x + 22} 130Z" fill="${L}"/>`;
  const scale =
    `<path d="M664 88V228" stroke="${L}" stroke-width="5"/><path d="M642 232H686L680 222H648Z" fill="${L}"/>` +
    `<g class="bm"><path d="M612 88H716" stroke="${L}" stroke-width="4" stroke-linecap="round"/>` +
    `<g class="bq" style="transform-origin:612px 88px">${hang(612)}${bar(602, 126, -8)}${bar(622, 126, 6)}${bar(612, 120, 0, 0.9)}</g>` +
    `<g class="bq" style="transform-origin:716px 88px">${hang(716)}${weight(710, 128, 1.3, true)}${weight(730, 128, 0.8)}</g>` +
    `<circle cx="664" cy="88" r="4.5" fill="${P.accent}"/></g>`;
  // gold column: ryō → bu → shu, each ×4 smaller
  const gold = (cx, cy, shape, glyph, size, dl) => `<g class="bb" style="animation-delay:-${dl}s">${shape}${kanji(glyph, cx, cy + size * 0.34, size, L, { anchor: 'middle' })}</g>`;
  const column =
    gold(768, 60, `<ellipse cx="768" cy="60" rx="24" ry="15" fill="${P.accent2}" stroke="${L}" stroke-width="2.2"/><ellipse cx="768" cy="60" rx="19" ry="10.5" fill="none" stroke="${L}" stroke-width=".9" opacity=".6"/>`, '両', 17, 0) +
    `<path d="M768 77V104" stroke="${P.line2}" stroke-width="1.2" stroke-dasharray="2 3"/>${kanji('×4', 776, 94, 10, P.line2)}` +
    gold(768, 118, `<rect x="755" y="109" width="26" height="18" rx="3" fill="${P.accent2}" stroke="${L}" stroke-width="2"/>`, '分', 12, 0.9) +
    `<path d="M768 128V150" stroke="${P.line2}" stroke-width="1.2" stroke-dasharray="2 3"/>${kanji('×4', 776, 143, 10, P.line2)}` +
    gold(768, 160, `<rect x="761" y="154" width="14" height="11" rx="2" fill="${P.accent2}" stroke="${L}" stroke-width="1.8"/>`, '朱', 8, 1.7) +
    `<path class="gk" d="${sparkle(790, 40, 6)}" fill="${P.accent2}"/><path class="gk" style="animation-delay:-1s" d="${sparkle(746, 52, 4.5)}" fill="${L}"/>`;
  return [
    `<path d="M512 262V226Q620 214 720 230T800 224V262Z" fill="${P.mass}"/>`,
    string, scale, column,
    kanji('文', 590, 196, 26, L), kanji('匁', 704, 204, 26, L),
  ].join('');
}


/** Hanging chōchin: ribbed paper lantern that swings; `light` makes it glow and flicker. Origin is the top of the cord. */
export function chochin(c, x, y, s, { paper, light, ink, glow, glyph, glyphInk, delay = 0, rib = ink }) {
  c.once('chochin', () => {
    c.css('.sg{animation:sg 3.4s ease-in-out infinite alternate}@keyframes sg{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}');
    c.css('.fk{animation:fk .9s steps(2) infinite}@keyframes fk{0%{opacity:.82}50%{opacity:1}}');
  });
  const g = glow && c.id('lg');
  if (g) c.def(`<radialGradient id="${g}"><stop offset="0" stop-color="${glow}" stop-opacity=".55"/><stop offset=".5" stop-color="${glow}" stop-opacity=".14"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>`);
  const fk = light ? ' class="fk"' : '';
  return `<g transform="translate(${x} ${y}) scale(${s})">${g ? `<circle cy="46" r="84" fill="url(#${g})"/>` : ''}<g class="sg" style="transform-origin:0px -4px;animation-delay:-${delay}s">` +
    `<path d="M0-30V0" stroke="${ink}" stroke-width="1.6"/><rect x="-14" y="0" width="28" height="7" rx="1.5" fill="${ink}"/>` +
    `<path${fk} d="M-14 7Q-36 40-14 74H14Q36 40 14 7Z" fill="${paper}" stroke="${ink}" stroke-width="2.2"/>${light ? `<path${fk} d="M-9 14Q-24 40-9 66H9Q24 40 9 14Z" fill="${light}" opacity=".55"/>` : ''}` +
    `<path d="M-26 20Q0 26 26 20M-30 34Q0 41 30 34M-30 48Q0 55 30 48M-26 62Q0 68 26 62" stroke="${rib}" stroke-width="1.3" fill="none" opacity=".75"/>` +
    `<rect x="-14" y="74" width="28" height="7" rx="1.5" fill="${ink}"/><path d="M-5 81V96M0 81V100M5 81V96" stroke="${ink}" stroke-width="1.4"/>${glyph ? kanji(glyph, 0, 54, 27, glyphInk, { anchor: 'middle' }) : ''}</g></g>`;
}

/* -------------------------------------------- farol -------------------------------------------- */

export function farolBody(c) {
  const P = c.P, r = rng(4), OD = P.onDark;
  c.css('.bs{transform-origin:446px 506px;animation:bs 6s ease-in-out infinite alternate}@keyframes bs{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}');
  c.css('.em{animation:em var(--t,4s) ease-out var(--d,0s) infinite}@keyframes em{0%{transform:translate(0,0);opacity:0}15%{opacity:1}100%{transform:translate(var(--x,8px),-70px);opacity:0}}');
  const gb = c.id('lb');
  c.def(`<linearGradient id="${gb}" gradientUnits="userSpaceOnUse" x1="446" y1="506" x2="270" y2="410"><stop offset="0" stop-color="${P.accent2}" stop-opacity=".8"/><stop offset="1" stop-color="${P.accent2}" stop-opacity="0"/></linearGradient>`);
  let stars = '';
  for (let i = 0; i < 24; i++) stars += `<circle cx="${f(310 + r() * 250)}" cy="${f(280 + r() * 190)}" r="${f(0.7 + r() * 1.3)}" fill="${OD}" opacity="${(0.35 + r() * 0.55).toFixed(2)}"/>`;
  // gandō: focused hand lantern, a reflector throwing a beam that sweeps
  const beam = `<g class="bs"><path d="M446 496L250 392V472Z" fill="url(#${gb})"/><path d="M446 506L250 430M446 506L250 452M446 506L250 410" stroke="${P.accent2}" stroke-width="1" opacity=".5"/></g>`;
  const gando =
    `<path d="M446 478Q472 498 520 496V524Q472 522 446 534Z" fill="${P.panelDark}" stroke="${OD}" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="446" cy="506" rx="8" ry="28" fill="${P.accent2}" stroke="${OD}" stroke-width="2.2"/>` +
    `<path d="M458 494V524M470 494V526M482 494V526" stroke="${OD}" stroke-width="1" opacity=".5"/><rect x="520" y="490" width="10" height="46" rx="2" fill="${OD}"/><path d="M470 490Q490 462 512 490" fill="none" stroke="${OD}" stroke-width="3" stroke-linecap="round"/><path d="M486 534V548M510 534V548" stroke="${OD}" stroke-width="3" stroke-linecap="round"/>`;
  const LIT = { paper: P.accent, light: P.accent2, ink: OD, glow: P.accent2, glyphInk: P.panelDark };
  let embers = '';
  for (let i = 0; i < 6; i++) embers += `<circle class="em" style="--t:${(3 + r() * 2).toFixed(1)}s;--d:-${(r() * 4).toFixed(1)}s;--x:${Math.round((r() - 0.5) * 30)}px" cx="${f(366 + (r() - 0.5) * 20)}" cy="${f(344 + r() * 8)}" r="1.5" fill="${P.accent2}"/>`;
  return [
    `<g class="tw">${stars}</g>`,
    `<path d="M274 604V556Q340 540 420 556T570 546V604Z" fill="${OD}" opacity=".1"/><path d="M274 556Q340 540 420 556T570 546" fill="none" stroke="${OD}" stroke-width="1.4" opacity=".5"/>`,
    beam,
    chochin(c, 374, 292, 1, { ...LIT, delay: 0, glyph: '灯' }), chochin(c, 484, 300, 0.62, { ...LIT, delay: 1.7 }), chochin(c, 310, 318, 0.5, { ...LIT, delay: 0.9 }),
    embers, gando,
  ].join('');
}

/* ------------------------------------------- encaixe ------------------------------------------- */

export function encaixeBody(c) {
  const P = c.P, L = P.line, r = rng(9);
  const T = 7;
  c.css(`.nt{animation:nt ${T}s cubic-bezier(.3,.7,.3,1) infinite}@keyframes nt{0%{transform:translateX(110px);opacity:0}8%{opacity:1}22%{transform:translateX(-5px)}25%,92%{transform:translateX(0);opacity:1}100%{transform:translateX(0);opacity:0}}`);
  c.css(`.st{transform-box:fill-box;transform-origin:center;animation:st ${T}s ease-out infinite}@keyframes st{0%,26%{transform:scale(2);opacity:0}30%{transform:scale(.92);opacity:1}34%,92%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:0}}`);
  c.css(`.ck{animation:ck ${T}s ease-out infinite}@keyframes ck{0%,22%{opacity:0;transform:scale(.6)}25%{opacity:1;transform:scale(1)}36%,100%{opacity:0;transform:scale(1.3)}}`);
  c.css(`.hl{animation:hl ${T}s ease-in-out infinite}@keyframes hl{0%{opacity:.35}10%{opacity:1}20%{opacity:.35}24%,100%{opacity:0}}`);
  const BX = 596, BY = 322, W = 190, cols = [622, 706], sw = 78, sh = 32, row = (i) => 334 + i * 40;
  const filled = new Set(['0,0', '0,1', '1,0', '2,1', '3,0', '3,1', '4,0']), target = '1,1';
  const tag = (x, y, mark) => {
    const a = 26 + r() * 30, b = 18 + r() * 38;
    return `<rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx="2" fill="${P.panelBg}" stroke="${L}" stroke-width="2"/><rect x="${x}" y="${y}" width="10" height="${sh}" fill="${L}"/><circle cx="${x + 5}" cy="${y + 7}" r="1.8" fill="${P.panelBg}"/><path d="M${x + 18} ${y + 11}h${f(a)}M${x + 18} ${y + 21}h${f(b)}" stroke="${P.line2}" stroke-width="2.2" stroke-linecap="round"/>${mark ? `<rect x="${x + sw - 14}" y="${y + 4}" width="8" height="8" fill="${P.accent}"/>` : ''}`;
  };
  let slots = '', labels = '';
  for (let i = 0; i < 5; i++) {
    labels += `<path d="${text(String(9 + i), 600, row(i) + 21, 12).d}" fill="${P.line2}"/><path d="M${BX + 4} ${row(i) + sh + 3}H${BX + W - 4}" stroke="${P.border}" stroke-width="1"/>`;
    cols.forEach((x, ci) => {
      const k = `${i},${ci}`, y = row(i);
      if (filled.has(k)) slots += tag(x, y, (i + ci) % 3 === 0);
      else if (k === target) slots += `<rect class="hl" x="${x - 2}" y="${y - 2}" width="${sw + 4}" height="${sh + 4}" rx="3" fill="none" stroke="${P.accent}" stroke-width="2" stroke-dasharray="5 4"/>`;
      else slots += `<rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx="2" fill="none" stroke="${P.line3}" stroke-width="1.4" stroke-dasharray="4 4"/>`;
    });
  }
  const [tx, ty] = [cols[1], row(1)];
  const hanko = `<g class="st" transform="rotate(-6 ${tx + sw - 18} ${ty + 16})"><rect x="${tx + sw - 32}" y="${ty + 2}" width="28" height="28" rx="2" fill="${P.accent}"/>${kanji('約', tx + sw - 18, ty + 25, 22, P.canvas, { anchor: 'middle' })}</g>`;
  const sparks = `<g class="ck" style="transform-origin:${tx}px ${ty + 16}px">${[-60, -30, 0, 30, 60].map((a) => { const rad = (a * Math.PI) / 180 + Math.PI; return `<path d="M${f(tx + Math.cos(rad) * 10)} ${f(ty + 16 + Math.sin(rad) * 10)}L${f(tx + Math.cos(rad) * 24)} ${f(ty + 16 + Math.sin(rad) * 24)}" stroke="${P.accent2}" stroke-width="2.2" stroke-linecap="round"/>`; }).join('')}</g>`;
  return [
    `<rect x="${BX}" y="${BY}" width="${W}" height="222" rx="3" fill="${P.card}" stroke="${L}" stroke-width="3"/>`,
    `<rect x="${BX - 6}" y="${BY - 10}" width="${W + 12}" height="14" rx="2" fill="${L}"/><circle cx="${BX + 20}" cy="${BY - 3}" r="2.6" fill="${P.panelBg}"/><circle cx="${BX + W - 14}" cy="${BY - 3}" r="2.6" fill="${P.panelBg}"/>`,
    labels, slots,
    `<g class="nt">${tag(tx, ty, false)}${hanko}</g>`, sparks,
  ].join('');
}
