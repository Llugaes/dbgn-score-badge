import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {renderBadge} from '../src/index.js';
import {renderReviewCard} from '../src/card.js';

const base = {title:'示例游戏', score:8.5, summary:'完整的游玩体验', pros:['战斗有趣','画面优秀'], cons:['后期重复','剧情遗憾'], coverDataUrl:'data:image/jpeg;base64,YQ=='};
test('两种模板使用评分组件并转义文本', () => {
  for (const template of ['impact','clean']) {
    const svg = renderReviewCard({...base,title:'游戏 <测试>'},{template});
    assert.match(svg, /游戏 &lt;测试&gt;/);
    assert.ok(svg.includes(renderBadge(8.5).match(/stroke-dasharray="[^"]+"/)[0]));
    assert.match(svg, /data:image\/jpeg;base64,YQ==/);
  }
  assert.throws(() => renderReviewCard({...base, coverDataUrl:'https://example.com/x.jpg'}));
  assert.throws(() => renderReviewCard({...base, score:11}));
});

test('栅格化时轮廓填充保持连续且比例随分数变化', async () => {
  async function countRed(score) {
    const {data,info}=await sharp(Buffer.from(renderBadge(score))).resize(640,560).removeAlpha().raw().toBuffer({resolveWithObject:true});
    let count=0;
    for(let i=0;i<data.length;i+=info.channels) if(data[i]>215 && data[i+1]>=55 && data[i+1]<115 && data[i+2]>=65 && data[i+2]<130) count++;
    return count;
  }
  const four=await countRed(4), six=await countRed(6);
  assert.ok(four > 5000 && six > four);
  assert.ok(Math.abs(four/six - 4/6) < .06, `${four}/${six}`);
});

test('批量生成两个模板，支持WebP与SVG并拒绝覆盖', async () => {
  const dir=await mkdtemp(join(tmpdir(),'dbgn-cards-'));
  try {
    await sharp({create:{width:64,height:64,channels:3,background:'#199bcd'}}).png().toFile(join(dir,'cover.png'));
    const card={id:'sample',title:'示例游戏',score:6.5,summary:'完整的游玩体验',pros:['有趣'],cons:['重复'],cover:'cover.png'};
    const manifest=join(dir,'review.json'); await writeFile(manifest,JSON.stringify({cards:[card,{...card,id:'second',score:4}]}));
    const output=join(dir,'out');
    const invoke=(...args)=>spawnSync(process.execPath,['scripts/cards.js',manifest,'--out',output,...args],{encoding:'utf8'});
    const first=invoke(); assert.equal(first.status,0,first.stderr);
    for(const name of ['sample-impact.webp','sample-clean.webp','second-impact.webp','second-clean.webp']) {
      const image=await readFile(join(output,name));const meta=await sharp(image).metadata();
      assert.equal(meta.format,'webp');assert.equal(meta.width,1600);assert.equal(meta.height,900);
      const pixel=await sharp(image).extract({left:name.includes('clean')?1100:800,top:450,width:1,height:1}).raw().toBuffer();
      assert.ok(pixel[2]>pixel[0], '封面图应实际嵌入图片，而非空白');
    }
    const blocked=invoke(); assert.notEqual(blocked.status,0); assert.match(blocked.stderr,/输出已存在/);
    const vector=invoke('--format','svg');assert.equal(vector.status,0,vector.stderr);
    assert.match(await readFile(join(output,'sample-impact.svg'),'utf8'),/data:image\/jpeg;base64,/);
  } finally { await rm(dir,{recursive:true}); }
});
