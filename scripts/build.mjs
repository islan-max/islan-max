// Generates every SVG used by README.md.
//   node scripts/build.mjs          banner, cards and dashboard
//   node scripts/build.mjs static   banner and cards (no network)
//   node scripts/build.mjs dash     dashboard from the GitHub API (needs GITHUB_TOKEN)
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const LOGIN = 'islan-max';
const MIN_COMMITS = 3; // repos with fewer commits are left out of the language charts
const FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

// GitHub Primer colors, one set per theme
const T = {
  light: { bg: '#ffffff', card: '#f6f8fa', border: '#d1d9e0', fg: '#1f2328', muted: '#59636e', green: '#1a7f37', blue: '#0969da', purple: '#8250df', orange: '#bc4c00' },
  dark: { bg: '#0d1117', card: '#151b23', border: '#3d444d', fg: '#e6edf3', muted: '#9198a1', green: '#3fb950', blue: '#4493f8', purple: '#ab7df8', orange: '#db6d28' },
};
// the canonical Python blue is too close to TypeScript's in a donut
const COLOR_FIX = { Python: '#79c0ff' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const svg = (w, h, label, body, css = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><style>text{font-family:${FONT}}${css}</style>${body}</svg>\n`;
const panel = (w, h, t, body, title) =>
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="8" fill="${t.card}" stroke="${t.border}"/>` +
  (title ? `<text x="16" y="30" font-size="15" font-weight="600" fill="${t.green}">${esc(title)}</text>` : '') + body;
const fmtDay = (d, withYear) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(withYear && { year: 'numeric' }), timeZone: 'UTC' }).format(new Date(d + 'T00:00:00Z'));

/* ------------------------------ pure logic ------------------------------ */

// days: [[YYYY-MM-DD, count], ...] sorted ascending. An empty today does not break the current streak.
export function streaks(days) {
  let best = 0, bestAt = [0, 0], run = 0, start = 0;
  days.forEach(([, n], i) => {
    if (n > 0) { if (!run) start = i; run++; if (run > best) { best = run; bestAt = [start, i]; } } else run = 0;
  });
  let i = days.length - 1;
  if (i >= 0 && days[i][1] === 0) i--;
  let current = 0;
  const end = i;
  while (i >= 0 && days[i][1] > 0) { current++; i--; }
  const range = (a, b) => [days[a][0], days[b][0]];
  return { best, bestRange: best ? range(...bestAt) : null, current, currentRange: current ? range(end - current + 1, end) : null };
}

// repos: [{ commits, langs: [{ name, color, size }] }] -> [{ name, color, pct }] by share of commits
export function langShares(repos) {
  const w = new Map();
  for (const r of repos) {
    const total = r.langs.reduce((s, l) => s + l.size, 0);
    if (!total) continue;
    for (const l of r.langs) {
      const cur = w.get(l.name) ?? { name: l.name, color: l.color, v: 0 };
      cur.v += (r.commits * l.size) / total;
      w.set(l.name, cur);
    }
  }
  const all = [...w.values()];
  const sum = all.reduce((s, l) => s + l.v, 0) || 1;
  return all.sort((a, b) => b.v - a.v).map((l) => ({ name: l.name, color: COLOR_FIX[l.name] ?? l.color ?? '#8b949e', pct: (l.v / sum) * 100 }));
}

/* ------------------------------ static art ------------------------------ */

function banner(t) {
  const css = `.s{fill:none;stroke:${t.muted};stroke-width:3;stroke-linecap:round;stroke-dasharray:60;opacity:0;animation:s 3.2s ease-in-out infinite}.d1{animation-delay:.9s}.d2{animation-delay:1.8s}@keyframes s{0%{stroke-dashoffset:60;opacity:0}30%{opacity:.8}100%{stroke-dashoffset:-30;opacity:0}}@media(prefers-reduced-motion:reduce){.s{animation:none;opacity:.6}}`;
  const body =
    `<rect x=".5" y=".5" width="799" height="199" rx="10" fill="${t.card}" stroke="${t.border}"/>` +
    `<text x="44" y="58" font-family="${SERIF}" font-size="13" letter-spacing="4" fill="${t.orange}">SOFTWARE BISTRO · BRAZIL</text>` +
    `<text x="44" y="108" font-family="${SERIF}" font-size="44" font-weight="700" fill="${t.fg}">Islan's Kitchen</text>` +
    `<text x="44" y="146" font-family="${SERIF}" font-size="22" font-style="italic" fill="${t.green}">I'm cooking.</text>` +
    `<path class="s" d="M620 118c-10-12 10-20 0-32"/><path class="s d1" d="M650 118c-10-12 10-20 0-32"/><path class="s d2" d="M680 118c-10-12 10-20 0-32"/>` +
    `<g fill="${t.fg}"><rect x="590" y="126" width="120" height="8" rx="4"/><path d="M600 136h100v26a16 16 0 0 1-16 16h-68a16 16 0 0 1-16-16z"/><rect x="574" y="142" width="26" height="7" rx="3"/><rect x="700" y="142" width="26" height="7" rx="3"/></g>`;
  return svg(800, 200, "Islan's Kitchen. I'm cooking.", body, css);
}

const CARDS = [
  { id: 'islan', name: 'ISLAN', cost: '2025', c1: '#3fb950', c2: '#4493f8', type: 'SYSTEMS DEV STUDENT', stack: 'TS · Python · SQL', ab: ['Hands on', 'Turns study into', 'software people use.'], foot: 'Brazil · on GitHub since 2025',
    art: '<circle cx="95" cy="88" r="30" fill="rgba(255,255,255,.25)"/><text x="95" y="100" text-anchor="middle" font-size="32" font-weight="700" fill="#fff">IM</text>' },
  { id: 'polar', name: 'POLAR', cost: '◆◆◆', c1: '#db6d28', c2: '#f85149', type: 'TEAM · SYSTEM', stack: 'TS · React · Postgres', ab: ['Immutable history', 'No action can be erased,', 'only appended to.'], foot: 'Origenes System Develop',
    art: '<g fill="rgba(255,255,255,.85)"><rect x="40" y="56" width="110" height="9" rx="3"/><rect x="40" y="72" width="90" height="9" rx="3"/><rect x="40" y="88" width="100" height="9" rx="3"/><rect x="40" y="104" width="70" height="9" rx="3"/></g>' },
  { id: 'caderno', name: 'CADERNO', cost: '◆◆', c1: '#ab7df8', c2: '#4493f8', type: 'WEB · STATIC', stack: 'Astro · MDX · Tailwind', ab: ['Meaning-based grading', 'Runs on your device;', 'answers never leave it.'], foot: 'WCAG 2.2 AA',
    art: '<g stroke="rgba(255,255,255,.8)" stroke-width="2"><line x1="38" x2="152" y1="62" y2="62"/><line x1="38" x2="152" y1="80" y2="80"/><line x1="38" x2="152" y1="98" y2="98"/><line x1="38" x2="152" y1="116" y2="116"/></g><line x1="56" x2="56" y1="46" y2="130" stroke="#ffb3b0" stroke-width="2"/>' },
  { id: 'trevo', name: 'TREVO', cost: '◆◆', c1: '#3fb950', c2: '#1a7f37', type: 'WEB · MOBILE FIRST', stack: 'FastAPI · Next.js · Postgres', ab: ['Luck and method', 'How much can I spend', 'today? Answered.'], foot: 'personal finance',
    art: [[0, -14], [14, 0], [0, 14], [-14, 0]].map(([x, y]) => `<circle cx="${95 + x}" cy="${88 + y}" r="13" fill="rgba(255,255,255,.85)"/>`).join('') },
];

function card(c, t) {
  const [abn, ...lines] = c.ab;
  const tspans = lines.map((l, i) => `<tspan x="14" dy="${i ? 13 : 0}">${esc(l)}</tspan>`).join('');
  const css = `@keyframes f{to{filter:hue-rotate(35deg)}}.f{animation:f 6s linear infinite}@media(prefers-reduced-motion:reduce){.f{animation:none}}`;
  const body =
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient></defs>` +
    `<rect class="f" x="2" y="2" width="186" height="266" rx="14" fill="${t.bg}" stroke="url(#g)" stroke-width="3"/>` +
    `<text x="14" y="28" font-size="15" font-weight="700" fill="${t.fg}">${c.name}</text>` +
    `<text x="176" y="28" text-anchor="end" font-size="11" font-weight="700" fill="${c.c1}">${c.cost}</text>` +
    `<rect x="14" y="38" width="162" height="100" rx="8" fill="url(#g)" opacity=".9"/>${c.art}` +
    `<text x="14" y="157" font-size="9.5" letter-spacing="1.2" fill="${t.muted}">${esc(c.type)}</text>` +
    `<text x="14" y="174" font-size="10.5" fill="${t.fg}">${esc(c.stack)}</text>` +
    `<line x1="14" x2="176" y1="184" y2="184" stroke="${t.border}"/>` +
    `<text x="14" y="200" font-size="11" font-weight="700" fill="${c.c1}">${esc(abn)}</text>` +
    `<text x="14" y="215" font-size="10" fill="${t.muted}">${tspans}</text>` +
    `<text x="14" y="258" font-size="9" fill="${t.muted}">${esc(c.foot)}</text>`;
  return svg(190, 270, `${c.name} card: ${c.ab.join(' ')}`, body, css);
}

function faceDown(t) {
  const body =
    `<defs><pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 7h14M7 0v14" stroke="${t.border}"/></pattern></defs>` +
    `<rect x="2" y="2" width="186" height="266" rx="14" fill="url(#p)" stroke="${t.border}" stroke-width="3" stroke-dasharray="6 5"/>` +
    `<circle cx="95" cy="125" r="34" fill="${t.bg}" stroke="${t.border}"/><text x="95" y="139" text-anchor="middle" font-size="40" fill="${t.muted}">?</text>` +
    `<text x="95" y="200" text-anchor="middle" font-size="12" fill="${t.muted}">coming soon</text>`;
  return svg(190, 270, 'Face-down card: coming soon', body);
}

/* ------------------------------- dashboard ------------------------------ */

async function gql(query, variables = {}) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(JSON.stringify(j.errors ?? j));
  return j.data;
}

const flatDays = (cal) => cal.weeks.flatMap((w) => w.contributionDays.map((d) => [d.date, d.contributionCount]));

function icon(kind, x, y, t) {
  const s = `fill="none" stroke="${t.muted}" stroke-width="1.5"`;
  const shapes = {
    dot: `<circle cx="${x + 7}" cy="${y + 7}" r="5" ${s}/>`,
    repo: `<rect x="${x + 2}" y="${y + 1}" width="10" height="12" rx="2" ${s}/>`,
    clock: `<circle cx="${x + 7}" cy="${y + 7}" r="6" ${s}/><path d="M${x + 7} ${y + 4}v3l2 2" ${s}/>`,
    org: `<rect x="${x + 2}" y="${y + 1}" width="10" height="12" rx="1" ${s}/><path d="M${x + 5} ${y + 4}h1M${x + 8} ${y + 4}h1M${x + 5} ${y + 7}h1M${x + 8} ${y + 7}h1" ${s}/>`,
  };
  return shapes[kind];
}

function profileCard(t, d) {
  const rows = [
    ['dot', `${d.lastYear} contributions in the last year`],
    ['repo', `${d.repos} public repositories`],
    ['clock', `Joined GitHub ${new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(d.created))}`],
    ...(d.org ? [['org', d.org]] : []),
  ];
  const body = `<text x="16" y="38" font-size="20" font-weight="600" fill="${t.green}">${esc(d.name)} <tspan font-size="14" font-weight="400" fill="${t.muted}">@${esc(LOGIN)}</tspan></text>` +
    rows.map(([k, s], i) => `${icon(k, 16, 62 + i * 28, t)}<text x="40" y="${74 + i * 28}" font-size="14" fill="${t.fg}">${esc(s)}</text>`).join('');
  return svg(420, 190, `${d.name}, ${d.lastYear} contributions in the last year`, panel(420, 190, t, body));
}

function smooth(p) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i], b = p[i], c = p[i + 1], e = p[i + 2] ?? c;
    d += ` C${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6} ${c[0]} ${c[1]}`;
  }
  return d;
}

function activityCard(t, days) {
  const m = new Map();
  for (const [date, n] of days) m.set(date.slice(0, 7), (m.get(date.slice(0, 7)) ?? 0) + n);
  const M = [...m];
  const W = 420, H = 190, l = 16, r = 44, top = 44, base = 158;
  const max = Math.max(3, Math.ceil(Math.max(...M.map((x) => x[1])) / 3 / 10) * 30);
  const x = (i) => l + (i * (W - l - r)) / (M.length - 1);
  const y = (v) => base - ((base - top) * v) / max;
  const pts = M.map((e, i) => [x(i), y(e[1])]);
  const line = smooth(pts);
  const mon = (k) => new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(new Date(k + '-01T00:00:00Z'));
  const body =
    `<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.green}" stop-opacity=".55"/><stop offset="1" stop-color="${t.green}" stop-opacity=".02"/></linearGradient></defs>` +
    `<text x="${W - 16}" y="30" text-anchor="end" font-size="12" fill="${t.muted}">contributions per month</text>` +
    `<path d="${line} L${x(M.length - 1)} ${base} L${x(0)} ${base}Z" fill="url(#a)"/><path d="${line}" fill="none" stroke="${t.green}" stroke-width="2"/>` +
    `<line x1="${l}" x2="${W - r}" y1="${base}" y2="${base}" stroke="${t.border}"/>` +
    [0, 1, 2, 3].map((k) => `<text x="${W - r + 8}" y="${y((max * k) / 3) + 4}" font-size="11" fill="${t.muted}">${Math.round((max * k) / 3)}</text>`).join('') +
    M.map((e, i) => (i % 3 === 0 ? `<text x="${x(i)}" y="${H - 14}" text-anchor="${i === 0 ? 'start' : 'middle'}" font-size="11" fill="${t.muted}">${mon(e[0])}</text>` : '')).join('');
  return svg(W, H, 'Contributions per month over the last year', panel(W, H, t, body));
}

function statsCard(t, s) {
  const rows = [['Stars', s.stars], ['Commits', s.commits], ['Pull requests', s.prs], ['Reviews', s.reviews], ['Issues', s.issues], ['Contributed to', s.contributedTo]];
  const body = rows.map(([k, v], i) => `<text x="16" y="${62 + i * 25}" font-size="13.5" fill="${t.muted}">${k}</text><text x="264" y="${62 + i * 25}" text-anchor="end" font-size="13.5" font-weight="600" fill="${t.fg}">${v}</text>`).join('');
  return svg(280, 200, 'Stats for the last year', panel(280, 200, t, body, 'Stats'));
}

function donutCard(t, title, items) {
  const shown = items.slice(0, 5);
  const rest = 100 - shown.reduce((s, i) => s + i.pct, 0);
  const segs = rest >= 1 ? [...shown, { name: 'Other', color: t.border, pct: rest }] : shown;
  const R = 38, C = 2 * Math.PI * R;
  let off = 0;
  const arcs = segs.map((i) => {
    const len = (C * i.pct) / 100;
    const s = `<circle cx="0" cy="0" r="${R}" fill="none" stroke="${i.color}" stroke-width="15" stroke-dasharray="${Math.max(len - 1.5, 0)} ${C}" stroke-dashoffset="${-off}"/>`;
    off += len;
    return s;
  }).join('');
  const legend = segs.map((i, k) => `<rect x="140" y="${57 + k * 22}" width="10" height="10" rx="2" fill="${i.color}"/><text x="156" y="${66 + k * 22}" font-size="12.5" fill="${t.fg}">${esc(i.name)} <tspan fill="${t.muted}">${Math.round(i.pct)}%</tspan></text>`).join('');
  const body = `<g transform="translate(70 118) rotate(-90)">${arcs}</g>${legend}`;
  return svg(280, 200, `${title}: ${segs.map((i) => `${i.name} ${Math.round(i.pct)}%`).join(', ')}`, panel(280, 200, t, body, title));
}

function streakCard(t, kind, big, label, caption, ratio) {
  let body;
  if (kind === 'ring') {
    const R = 40, C = 2 * Math.PI * R;
    body = `<circle cx="140" cy="56" r="${R}" fill="none" stroke="${t.border}" stroke-width="6"/>` +
      `<circle cx="140" cy="56" r="${R}" fill="none" stroke="${t.orange}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C * ratio} ${C}" transform="rotate(-90 140 56)"/>` +
      `<text x="140" y="68" text-anchor="middle" font-size="32" font-weight="700" fill="${t.fg}">${big}</text>` +
      `<text x="140" y="124" text-anchor="middle" font-size="14" font-weight="600" fill="${t.orange}">${esc(label)}</text>`;
  } else {
    body = `<text x="140" y="68" text-anchor="middle" font-size="40" font-weight="700" fill="${t.fg}">${big}</text>` +
      `<text x="140" y="100" text-anchor="middle" font-size="14" fill="${t.muted}">${esc(label)}</text>`;
  }
  body += `<text x="140" y="${kind === 'ring' ? 142 : 124}" text-anchor="middle" font-size="12" fill="${t.muted}">${esc(caption)}</text>`;
  return svg(280, 150, `${label}: ${big}. ${caption}`, panel(280, 150, t, body));
}

async function dash() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required');
  const { user: u } = await gql(`query($l:String!){user(login:$l){name createdAt
    contributionsCollection{contributionYears}
    repositories(ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false,first:100){totalCount nodes{stargazerCount}}
    repositoriesContributedTo(first:1,contributionTypes:[COMMIT,PULL_REQUEST,ISSUE,REPOSITORY]){totalCount}
    organizations(first:1){nodes{name login}}}}`, { l: LOGIN });
  const { user: y } = await gql(`query($l:String!){user(login:$l){contributionsCollection{
    totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions totalIssueContributions
    contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}
    commitContributionsByRepository(maxRepositories:25){contributions{totalCount}
      repository{languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}} primaryLanguage{name color}}}}}}`, { l: LOGIN });
  const years = u.contributionsCollection.contributionYears;
  const all = await gql(`query($l:String!){user(login:$l){${years.map((yr) => `y${yr}:contributionsCollection(from:"${yr}-01-01T00:00:00Z",to:"${yr}-12-31T23:59:59Z"){contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}`).join('')}}}`, { l: LOGIN });

  const c = y.contributionsCollection;
  const lastDays = flatDays(c.contributionCalendar);
  const today = new Date().toISOString().slice(0, 10); // the current year's calendar runs to Dec 31
  const allDays = Object.values(all.user).flatMap((v) => flatDays(v.contributionCalendar)).filter(([date]) => date <= today).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const allTotal = Object.values(all.user).reduce((s, v) => s + v.contributionCalendar.totalContributions, 0);
  const sk = streaks(allDays);
  const repos = c.commitContributionsByRepository.filter((r) => r.contributions.totalCount >= MIN_COMMITS);
  const byCommit = langShares(repos.map((r) => ({ commits: r.contributions.totalCount, langs: r.repository.languages.edges.map((e) => ({ name: e.node.name, color: e.node.color, size: e.size })) })));
  const primary = new Map();
  for (const r of repos) { const p = r.repository.primaryLanguage; if (p) primary.set(p.name, { name: p.name, color: COLOR_FIX[p.name] ?? p.color, n: (primary.get(p.name)?.n ?? 0) + 1 }); }
  const byRepo = [...primary.values()].sort((a, b) => b.n - a.n).map((l) => ({ name: l.name, color: l.color, pct: (l.n / repos.length) * 100 }));
  const org = u.organizations.nodes[0];
  const d = {
    name: u.name || LOGIN, created: u.createdAt, lastYear: c.contributionCalendar.totalContributions, repos: u.repositories.totalCount, org: org && org.login.replace(/-/g, ' '), // the display name of the org can expose more than intended
  };
  const stats = {
    stars: u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0), commits: c.totalCommitContributions, prs: c.totalPullRequestContributions,
    reviews: c.totalPullRequestReviewContributions, issues: c.totalIssueContributions, contributedTo: u.repositoriesContributedTo.totalCount,
  };
  const range = (r) => (r ? `${fmtDay(r[0], r[0].slice(0, 4) !== r[1].slice(0, 4))} – ${fmtDay(r[1], true)}` : 'no contributions yet');
  const out = (name, theme, s) => writeFile(`assets/dash/${name}-${theme}.svg`, s);
  await mkdir('assets/dash', { recursive: true });
  for (const [theme, t] of Object.entries(T)) {
    await Promise.all([
      out('profile', theme, profileCard(t, d)),
      out('activity', theme, activityCard(t, lastDays)),
      out('stats', theme, statsCard(t, stats)),
      out('langs-commit', theme, donutCard(t, 'Languages by commit', byCommit)),
      out('langs-repo', theme, donutCard(t, 'Languages by repo', byRepo)),
      out('streak-total', theme, streakCard(t, 'plain', allTotal, 'Total contributions', `${fmtDay(u.createdAt.slice(0, 10), true)} – Present`)),
      out('streak-current', theme, streakCard(t, 'ring', sk.current, 'Current streak', range(sk.currentRange), sk.best ? Math.min(sk.current / sk.best, 1) : 0)),
      out('streak-longest', theme, streakCard(t, 'plain', sk.best, 'Longest streak', range(sk.bestRange))),
    ]);
  }
  console.log(`dashboard: ${lastDays.length} days, ${repos.length} repos, longest streak ${sk.best}, current ${sk.current}`);
}

async function stat() {
  await mkdir('assets', { recursive: true });
  for (const [theme, t] of Object.entries(T)) {
    await writeFile(`assets/banner-${theme}.svg`, banner(t));
    for (const c of CARDS) await writeFile(`assets/card-${c.id}-${theme}.svg`, card(c, t));
    await writeFile(`assets/card-soon-${theme}.svg`, faceDown(t));
  }
  console.log('static: banner + 5 cards x 2 themes');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2] ?? 'all';
  if (mode === 'all' || mode === 'static') await stat();
  if (mode === 'all' || mode === 'dash') await dash();
}
