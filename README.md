# DBGN评分徽章

蛋白猫头形状的可复用评分图片。外轮廓从额头中央顺时针填充，长度等于分数除以10。

- 0–6分：亮红色（包含0分、6分）。
- 高于6分且低于10分：玫瑰粉（常用半分制中对应6.5–9.5分）。
- 10分：淡彩虹与闪光。

支持0到10之间最多一位小数，例如6.1和9.9；颜色按档位离散切换。非法输入直接报错，不会静默四舍五入。

## 作为模块使用

```js
import { renderBadge } from './src/index.js';
const svg = renderBadge(8.5); // 返回独立SVG字符串
```

React中可使用`<img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderBadge(8.5))}`} alt="DBGN评分8.5分" />`。

命令行生成：

```sh
node scripts/render.js 8.5 > badge.svg
```

## 通过图片链接使用

GitHub Pages为每个十分位预生成独立SVG，例如：

```text
https://llugaes.github.io/dbgn-score-badge/score/8.5.svg
```

整数不带小数，例如`score/6.svg`、`score/10.svg`；其他数字使用一位小数，例如`score/6.5.svg`。这是静态文件地址，不是接受任意参数的服务器接口；需要其他精度时使用模块，并按需扩展规则。

## 开发

Node.js 20以上。评分徽章模块无运行时依赖；评测图批量导出使用sharp。`npm test`验证分数、边界、渲染、批量出图和覆盖保护；`npm run build`生成101个静态SVG到`dist/`。

图形使用SVG本地绘制，无需加载外部字体或图片。该仓库包含蛋白的角色形象，使用前请取得形象所有者许可。

## 批量生成评测图

安装依赖：`npm ci`。复制`examples/review.example.json`，修改`cards`数组中的游戏名称、评分、总评、优缺点和封面路径。封面路径相对于JSON文件；支持JPEG、PNG和WebP。每张图的`id`需唯一，使用小写字母、数字、连字符或下划线。优缺点各支持1–3项。

```sh
# 默认生成impact（黑红冲击）和clean（浅色简洁）两张WebP
node scripts/cards.js review.json --out output

# 只生成一种模板，选择WebP、PNG或SVG
node scripts/cards.js review.json --out output --template impact --format webp
node scripts/cards.js review.json --out output --template clean --format svg
```

`focus`可设为`left`、`center`或`right`，用于控制封面裁剪位置；默认居中。结果统一为1600×900，封面嵌入前最长边不超过1600像素，WebP质量为88。SVG包含压缩过的封面，无需引用外部图片。输出文件若已存在，命令会停止，避免覆盖已有作品。

生成图片时需要系统提供中文字体。Windows可使用Microsoft YaHei；Linux建议安装Noto Sans CJK SC。不同系统字体可能造成少量排版差异。

评分图使用同一份`renderBadge()`组件，并以轮廓实际长度设置进度；SVG在浏览器中及经sharp导出为WebP时都保持正确比例。可通过`dbgn-score-badge/card`导入`renderReviewCard(input, {template})`生成独立SVG；`coverDataUrl`需提供JPEG或PNG。

GitHub Pages目前只提供预生成的评分徽章图片，整张评测图在本地批量生成；更换封面不需要上传到公开仓库。
