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

Node.js 20以上，无运行时依赖。`npm test`验证分数、边界、填充比例和满分样式；`npm run build`生成101个静态SVG到`dist/`。

图形使用SVG本地绘制，无需加载外部字体或图片。该仓库包含蛋白的角色形象，使用前请取得形象所有者许可。
