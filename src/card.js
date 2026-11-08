import { renderBadge, parseScore } from './index.js';

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const width = (s, size) => [...s].reduce((n, c) => n + (c.codePointAt(0) > 255 ? 1 : .62) * size, 0);
const text = (value, x, y, size, maxWidth, extra = '') => {
  const fit = width(value, size) > maxWidth ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}"${fit} ${extra}>${esc(value)}</text>`;
};
const badge = (score, x, y, w, h) => renderBadge(score).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const requiredText = (o, k, max) => {
  if (typeof o[k] !== 'string' || !o[k].trim() || [...o[k]].length > max || /[\r\n\u0000-\u001f]/u.test(o[k])) throw new TypeError(`${k}必须是1到${max}个字符的单行文字`);
  return o[k].trim();
};
function items(o, k) {
  if (!Array.isArray(o[k]) || o[k].length < 1 || o[k].length > 3) throw new TypeError(`${k}需要1到3项`);
  return o[k].map((v) => requiredText({value:v}, 'value', 24));
}
/** Generate a self-contained SVG. Artwork must be a PNG or JPEG data URL. */
export function renderReviewCard(input, {template = 'impact'} = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('评测数据必须是对象');
  if (!['impact','clean'].includes(template)) throw new RangeError('模板只支持impact或clean');
  const title = requiredText(input, 'title', 32), summary = requiredText(input, 'summary', 48);
  const pros = items(input, 'pros'), cons = items(input, 'cons'), score = parseScore(input.score);
  const cover = input.coverDataUrl;
  if (typeof cover !== 'string' || !/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(cover)) throw new TypeError('coverDataUrl必须是PNG或JPEG的data URL');
  const focus = {left:'xMinYMid', center:'xMidYMid', right:'xMaxYMid'}[input.focus ?? 'center'];
  if (!focus) throw new RangeError('focus只支持left、center或right');
  const font = 'font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-weight="800"';
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img"><title>DBGN ${esc(title)} ${score}/10</title>`;
  if (template === 'clean') {
    const rows = (array, sign, x, y, color) => array.map((v, i) => `<rect x="${x}" y="${y+i*64}" rx="12" width="297" height="54" fill="#f6e9ec"/>${text(sign,x+17,y+37+i*64,31,36,`fill="${color}"`)}${text(v,x+56,y+37+i*64,27,225,'fill="#102448"')}`).join('');
    return `${open}<defs><clipPath id="cover-clip"><rect x="690" y="92" width="875" height="716" rx="38"/></clipPath></defs><rect width="1600" height="900" fill="#f8f2f1"/><rect x="52" y="38" width="10" height="55" rx="5" fill="#ef5c85"/><text x="85" y="82" font-family="Arial,sans-serif" font-weight="900" font-style="italic" font-size="56" fill="#102448">DBGN</text><g ${font}>${badge(score,150,118,300,263)}<rect x="46" y="424" width="9" height="69" rx="4" fill="#ef5c85"/>${text(title,76,481,56,570,'fill="#102448"')}${text(summary,45,557,31,600,'fill="#102448"')}${rows(pros,'+',42,613,'#168f82')}${rows(cons,'−',352,613,'#ed5e84')}</g><image x="690" y="92" width="875" height="716" preserveAspectRatio="${focus} slice" clip-path="url(#cover-clip)" href="${cover}"/></svg>`;
  }
  const rows = (array, sign, y, color) => array.map((v, i) => {
    const yy = y + i*62;
    return `<path d="M1163 ${yy} L1561 ${yy-20} L1548 ${yy+34} L1150 ${yy+54} Z" fill="#13141a" stroke="#909298" stroke-width="1.5"/><path d="M1163 ${yy} L1231 ${yy-3} L1218 ${yy+51} L1150 ${yy+54} Z" fill="${color}"/>${text(sign,1172,yy+35,36,38,'fill="#fff"')}${text(v,1240,yy+33,33,304,'fill="#fff"')}`;
  }).join('');
  return `${open}<defs><clipPath id="hero-clip"><path d="M0 0H1600V900H0Z"/></clipPath><linearGradient id="lower-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101018" stop-opacity="0"/><stop offset="1" stop-color="#101018" stop-opacity=".7"/></linearGradient></defs><rect width="1600" height="900" fill="#eeeae7"/><image x="0" y="0" width="1600" height="900" preserveAspectRatio="${focus} slice" clip-path="url(#hero-clip)" href="${cover}"/><rect y="570" width="1600" height="330" fill="url(#lower-shade)"/><path d="M1050 0H1600V900H1040L1170 658L1075 478L1165 245Z" fill="#101016" fill-opacity=".92"/><path d="M0 69L328 29L305 112L0 150Z" fill="#111015"/><path d="M46 64L63 62L52 135L35 137Z" fill="#f0507d"/><text x="80" y="108" font-family="Arial,sans-serif" font-style="italic" font-weight="900" font-size="58" fill="#fff">DBGN</text><path d="M74 176L1113 40L1085 205L45 342Z" fill="#fffdf9"/><path d="M0 310L41 305L21 367L0 371Z M998 124L1113 96L1094 142L979 171Z" fill="#d91538"/><g ${font}>${text(title,90,265,87,960,'fill="#14141b" transform="rotate(-7 90 265)"')}${badge(score,1222,20,305,267)}${rows(pros,'+',354,'#1ca690')}${rows(cons,'−',565,'#ef607f')}<path d="M0 774L1100 699L1060 816L0 890Z" fill="#b51230"/>${text(summary,57,843,36,985,'fill="#fff" transform="rotate(-4 57 843)"')}</g></svg>`;
}
