import { mkdir, writeFile } from 'node:fs/promises';
import { renderBadge } from '../src/index.js';
await mkdir('dist/score', { recursive: true });
for (let n = 0; n <= 100; n++) {
  const value = n / 10;
  const name = Number.isInteger(value) ? String(value) : value.toFixed(1);
  await writeFile(`dist/score/${name}.svg`, renderBadge(value));
}
await writeFile('dist/index.html', '<!doctype html><meta charset="utf-8"><title>DBGN评分</title><p>评分图片：<a href="score/8.5.svg">score/8.5.svg</a></p>');
