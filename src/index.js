/** Generate a standalone, transparent DBGN score badge. */
const CAT = 'M160 51 Q187 48 205 56 L241 19 Q253 10 261 20 Q270 33 270 67 L269 100 C295 132 302 164 292 190 C277 234 221 256 160 256 C99 256 43 234 28 190 C18 164 25 132 51 100 L50 67 Q50 33 59 20 Q67 10 79 19 L115 56 Q133 48 160 51 Z';

/** Scores are expressed in tenths to avoid silently rounding the user's score. */
export function parseScore(value) {
  if (typeof value !== 'number' && typeof value !== 'string') throw new TypeError('评分必须是数字');
  if (typeof value === 'string' && !/^(?:10(?:\.0)?|[0-9](?:\.[0-9])?)$/.test(value.trim())) throw new RangeError('评分必须是0到10之间的一位小数');
  const number = typeof value === 'string' ? Number(value.trim()) : value;
  if (!Number.isFinite(number) || number < 0 || number > 10 || Math.abs(number * 10 - Math.round(number * 10)) > 1e-8) throw new RangeError('评分必须是0到10之间的一位小数');
  return Math.round(number * 10) / 10;
}

export function scoreStyle(value) {
  const score = parseScore(value);
  return { score, progress: score * 10, tone: score === 10 ? 'perfect' : score <= 6 ? 'red' : 'pink' };
}

/** Returned SVG is self-contained and can be used in an img or written to disk. */
export function renderBadge(value) {
  const { score, progress, tone } = scoreStyle(value);
  const label = score === 10 ? '10' : score.toFixed(1);
  const stroke = tone === 'perfect' ? 'url(#rainbow)' : tone === 'red' ? '#F05160' : '#F57596';
  const sparkles = tone === 'perfect' ? `<path d="M268 19 Q270 28 278 30 Q270 32 268 41 Q266 32 258 30 Q266 28 268 19 Z M277 190 Q278 196 284 197 Q278 198 277 204 Q276 198 270 197 Q276 196 277 190 Z" fill="#fffdfa" stroke="#eac889" stroke-width="1"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280" role="img" aria-labelledby="badge-title badge-description">
<title id="badge-title">DBGN评分 ${label}/10</title><desc id="badge-description">蛋白猫头轮廓填充${progress}%，${tone === 'perfect' ? '满分彩虹' : tone === 'red' ? '亮红色' : '玫瑰粉色'}。</desc>
<defs>
 <radialGradient id="face" cx="45%" cy="38%" r="75%"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#f9f1e5"/></radialGradient>
 <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f58fb1"/><stop offset=".28" stop-color="#dba6ef"/><stop offset=".5" stop-color="#95dce1"/><stop offset=".72" stop-color="#f7db9f"/><stop offset="1" stop-color="#f58fb1"/></linearGradient>
 <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ddb87a"/><stop offset=".45" stop-color="#b9813e"/><stop offset=".75" stop-color="#f2d49c"/><stop offset="1" stop-color="#b67c37"/></linearGradient>
</defs>
<path d="${CAT}" fill="url(#face)" stroke="url(#gold)" stroke-width="23" stroke-linejoin="round"/>
<path d="${CAT}" fill="none" stroke="#c6d4df" stroke-width="17" stroke-linejoin="round"/>
<path d="${CAT}" fill="none" stroke="${stroke}" stroke-width="17" stroke-linejoin="round" stroke-linecap="butt" pathLength="100" stroke-dasharray="${progress} ${100 - progress}"/>
<path d="M62 41 Q62 29 70 31 L98 63 Q78 68 64 86Z M258 41 Q258 29 250 31 L222 63 Q242 68 256 86Z" fill="#f7c2c1"/>
<path d="M67 77 Q76 66 91 65 M68 70 Q78 61 86 60 M253 77 Q244 66 229 65 M252 70 Q242 61 234 60" fill="none" stroke="#fff8f1" stroke-width="2" stroke-linecap="round"/>
<path d="M130 61 L143 63 L140 89 Q133 82 130 61 M151 62 L169 62 L165 93 Q157 92 151 62 M177 63 L190 61 Q187 82 180 89Z" fill="#9d9c9a"/>
<path d="M66 151 l-23 -6 M66 162 l-25 2 M67 173 l-21 9 M254 151 l23 -6 M254 162 l25 2 M253 173 l21 9" stroke="#b68b60" stroke-width="3" fill="none" stroke-linecap="round"/>
<text x="160" y="175" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="72" fill="#102b44">${label}</text><text x="160" y="215" text-anchor="middle" font-family="Arial,sans-serif" font-weight="600" font-size="30" fill="#b38f6e">/10</text>${sparkles}</svg>`;
}
