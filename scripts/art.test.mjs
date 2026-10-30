import test from 'node:test';
import assert from 'node:assert/strict';
import { render } from './art/scenes.mjs';

const D = {
  allTotal: 120,
  streaks: { best: 8, bestRange: ['2026-01-01', '2026-01-08'], current: 2, currentRange: ['2026-01-09', '2026-01-10'] },
  langs: [{ name: 'MDX', pct: 50 }, { name: 'TypeScript', pct: 30 }, { name: 'Python', pct: 20 }],
  monthly: { 2025: [null, null, null, 4, 10, 8, 12, 30, 20, 9, 15, 6], 2026: [10, 22, 18, 40, 25, 31, 12, 60, 90, 20, null, null] },
  repos: [{ name: 'caderno-de-estudos', commits: 40, prs: 4 }, { name: 'trevo', commits: 20, prs: 2 }, { name: 'polar', commits: 15, prs: 1 }, { name: 'farol', commits: 9, prs: 0 }, { name: 'encaixe', commits: 5, prs: 0 }],
};

test('render: 9 SVGs por tema, válidos, sem NaN e leves', () => {
  for (const theme of ['light', 'dark']) {
    const r = render(theme, D);
    assert.deepEqual(Object.keys(r), ['hero', 'projetos', 'caderno', 'gastos', 'polar', 'farol', 'encaixe', 'grafico', 'numeros']);
    for (const [part, svg] of Object.entries(r)) {
      assert.match(svg, /^<svg[\s>]/, part);
      assert.doesNotMatch(svg, /NaN|undefined/, part);
      assert.ok(svg.length < 200_000, `${part} tem ${svg.length} bytes`);
    }
  }
});
