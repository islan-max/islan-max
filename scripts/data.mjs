// Busca os números do perfil na API GraphQL do GitHub. Precisa de GITHUB_TOKEN.
const LOGIN = 'islan-max';

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

const flat = (cal) => cal.weeks.flatMap((w) => w.contributionDays.map((d) => [d.date, d.contributionCount]));

export function streaks(days) {
  let best = 0, bestAt = [0, 0], run = 0, start = 0;
  days.forEach(([, n], i) => {
    if (n > 0) { if (!run) start = i; run++; if (run > best) { best = run; bestAt = [start, i]; } } else run = 0;
  });
  let i = days.length - 1;
  if (i >= 0 && days[i][1] === 0) i--; // um dia de hoje ainda vazio não quebra a sequência
  let current = 0;
  const end = i;
  while (i >= 0 && days[i][1] > 0) { current++; i--; }
  const range = (a, b) => [days[a][0], days[b][0]];
  return { best, bestRange: best ? range(...bestAt) : null, current, currentRange: current ? range(end - current + 1, end) : null };
}

/** Fatia de cada linguagem, ponderando cada repositório pelos seus commits. */
export function langShares(repos) {
  const w = new Map();
  for (const r of repos) {
    const total = r.langs.reduce((s, l) => s + l.size, 0);
    if (!total) continue;
    for (const l of r.langs) {
      const cur = w.get(l.name) ?? { name: l.name, v: 0 };
      cur.v += (r.commits * l.size) / total;
      w.set(l.name, cur);
    }
  }
  const all = [...w.values()];
  const sum = all.reduce((s, l) => s + l.v, 0) || 1;
  return all.sort((a, b) => b.v - a.v).map((l) => ({ name: l.name, pct: (l.v / sum) * 100 }));
}

export async function collect() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN é obrigatório');
  const { user: u } = await gql(`query($l:String!){user(login:$l){createdAt
    contributionsCollection{contributionYears}}}`, { l: LOGIN });
  const { user: y } = await gql(`query($l:String!){user(login:$l){contributionsCollection{
    commitContributionsByRepository(maxRepositories:25){contributions{totalCount}
      repository{name nameWithOwner isPrivate primaryLanguage{name} languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}
    pullRequestContributionsByRepository(maxRepositories:25){contributions{totalCount} repository{nameWithOwner}}}}}`, { l: LOGIN });
  const years = u.contributionsCollection.contributionYears;
  const all = await gql(`query($l:String!){user(login:$l){${years.map((yr) => `y${yr}:contributionsCollection(from:"${yr}-01-01T00:00:00Z",to:"${yr}-12-31T23:59:59Z"){contributionCalendar{weeks{contributionDays{date contributionCount}}}}`).join('')}}}`, { l: LOGIN });

  const today = new Date().toISOString().slice(0, 10); // o calendário do ano corrente vai até 31/12
  const allDays = Object.values(all.user).flatMap((v) => flat(v.contributionCalendar)).filter(([d]) => d <= today).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const created = u.createdAt.slice(0, 7);
  const monthly = {};
  for (const yr of [2025, 2026]) {
    monthly[yr] = Array.from({ length: 12 }, (_, m) => {
      const key = `${yr}-${String(m + 1).padStart(2, '0')}`;
      if (key < created || key > today.slice(0, 7)) return null;
      return allDays.filter(([d]) => d.startsWith(key)).reduce((s, [, n]) => s + n, 0);
    });
  }
  const c = y.contributionsCollection;
  const prs = new Map(c.pullRequestContributionsByRepository.map((p) => [p.repository.nameWithOwner, p.contributions.totalCount]));
  const repos = c.commitContributionsByRepository
    .filter((r) => r.contributions.totalCount >= 3 && !r.repository.isPrivate) // nunca expor nome de repositório privado
    .map((r) => ({
      name: r.repository.name, commits: r.contributions.totalCount, prs: prs.get(r.repository.nameWithOwner) ?? 0,
      langs: r.repository.languages.edges.map((e) => ({ name: e.node.name, size: e.size })),
    }))
    .sort((a, b) => b.commits - a.commits);
  return {
    allTotal: allDays.reduce((s, [, n]) => s + n, 0),
    streaks: streaks(allDays),
    langs: langShares(repos).slice(0, 6),
    monthly, repos,
  };
}
