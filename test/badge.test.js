import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScore, renderBadge, scoreStyle } from '../src/index.js';

test('评分档位及切换边界', () => {
  for (const [score, tone] of [[0,'red'],[1,'red'],[6,'red'],[6.1,'pink'],[6.5,'pink'],[9.5,'pink'],[9.9,'pink'],[10,'perfect']]) assert.equal(scoreStyle(score).tone,tone);
});
test('进度沿完整猫头轮廓按分数计算', () => {
  for (const score of [0, 4, 6, 6.5, 8.5, 9.5, 10]) {
    const match = renderBadge(score).match(/stroke-dasharray="([0-9.]+) ([0-9.]+)"/);
    assert.ok(match);
    const [filled, rest] = match.slice(1).map(Number);
    assert.ok(Math.abs(filled / (filled + rest) - score / 10) < 1e-8);
  }
});
test('分数验证与无声四舍五入', () => {
  for (const v of [-1, 10.1, 6.25, NaN, Infinity, '', '<svg>', null, true]) assert.throws(() => parseScore(v));
  assert.equal(parseScore('8.5'), 8.5);
});
test('满分保留彩虹与闪光', () => {
  assert.match(renderBadge(10), /stroke="url\(#rainbow\)"/);
  assert.doesNotMatch(renderBadge(9.9), /stroke="url\(#rainbow\)"/);
});
