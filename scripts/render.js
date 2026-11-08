import { renderBadge } from '../src/index.js';
try { process.stdout.write(renderBadge(process.argv[2])); } catch (e) { console.error(e.message); process.exitCode = 1; }
