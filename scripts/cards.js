import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import sharp from 'sharp';
import { renderReviewCard } from '../src/card.js';

const usage = '用法：node scripts/cards.js 评测数据.json --out 输出目录 [--template impact|clean|both] [--format webp|png|svg]';
async function main() {
  const [manifestPath, ...rest] = process.argv.slice(2);
  if (!manifestPath || rest.length % 2 !== 0) throw new Error(usage);
  const opts = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!['--out','--template','--format'].includes(rest[i]) || Object.hasOwn(opts, rest[i])) throw new Error(usage);
    opts[rest[i]] = rest[i+1];
  }
  if (!opts['--out']) throw new Error(usage);
  const choice = opts['--template'] ?? 'both', format = opts['--format'] ?? 'webp';
  if (!['impact','clean','both'].includes(choice) || !['webp','png','svg'].includes(format)) throw new Error(usage);
  const templates = choice === 'both' ? ['impact','clean'] : [choice];
  const source = resolve(manifestPath), out = resolve(opts['--out']);
  const config = JSON.parse(await readFile(source,'utf8'));
  if (!Array.isArray(config.cards) || !config.cards.length) throw new Error('cards必须是非空数组');
  const pending = [], seen = new Set();
  for (const card of config.cards) {
    if (!card || typeof card.id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(card.id) || seen.has(card.id)) throw new Error('每个id须唯一且只包含小写字母、数字、连字符和下划线');
    seen.add(card.id);
    if (typeof card.cover !== 'string' || !card.cover.trim()) throw new Error(`${card.id}缺少封面路径`);
    const coverPath = resolve(dirname(source), card.cover);
    const cover = await readFile(coverPath);
    const metadata = await sharp(cover).metadata();
    if (!['jpeg','png','webp'].includes(metadata.format)) throw new Error(`${card.id}封面只支持JPEG、PNG、WebP`);
    // Remove metadata and cap embedded artwork before creating a standalone SVG.
    const small = await sharp(cover).rotate().resize({width:1600,height:900,fit:'inside',withoutEnlargement:true}).jpeg({quality:88,mozjpeg:true}).toBuffer();
    const coverDataUrl = `data:image/jpeg;base64,${small.toString('base64')}`;
    for (const template of templates) {
      const svg = renderReviewCard({...card, coverDataUrl}, {template});
      const bytes = format === 'svg' ? Buffer.from(svg) : await sharp(Buffer.from(svg)).toFormat(format, format === 'webp' ? {quality:88} : {}).toBuffer();
      pending.push({path:join(out,`${card.id}-${template}.${format}`),bytes});
    }
  }
  await mkdir(out,{recursive:true});
  for (const item of pending) {
    try { await access(item.path); throw new Error(`输出已存在，请移走文件或选择其他目录：${item.path}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const item of pending) { await writeFile(item.path,item.bytes,{flag:'wx'}); console.log(`${item.path} (${item.bytes.length} bytes)`); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
