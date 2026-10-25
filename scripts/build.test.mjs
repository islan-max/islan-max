import test from 'node:test';
import assert from 'node:assert/strict';
import { streaks, langShares } from './build.mjs';

const d = (...c) => c.map((n, i) => [`2026-01-${String(i + 1).padStart(2, '0')}`, n]);

test('streaks: longest and current, empty today keeps the streak alive', () => {
  const s = streaks(d(1, 1, 0, 2, 3, 4, 0));
  assert.equal(s.best, 3);
  assert.deepEqual(s.bestRange, ['2026-01-04', '2026-01-06']);
  assert.equal(s.current, 3);
});

test('streaks: a zero yesterday and today ends the current streak', () => {
  assert.equal(streaks(d(1, 1, 0, 0)).current, 0);
  assert.equal(streaks([]).best, 0);
});

test('langShares: weights each repo by its commits and sums to 100', () => {
  const r = langShares([
    { commits: 3, langs: [{ name: 'A', color: '#111', size: 1 }] },
    { commits: 1, langs: [{ name: 'A', color: '#111', size: 1 }, { name: 'B', color: '#222', size: 1 }] },
  ]);
  assert.equal(r[0].name, 'A');
  assert.equal(Math.round(r[0].pct), 88);
  assert.equal(Math.round(r.reduce((s, x) => s + x.pct, 0)), 100);
});
