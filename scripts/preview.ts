import { writeFileSync } from 'node:fs';
import { buildGeometry, piecePath } from '../src/engine/jigsawGeometry';
const g = buildGeometry(6, 4, 1000, 667, 12345);
const sheet = Array.from({ length: 24 }, (_, i) => `<path d="${piecePath(g, i % 6, Math.floor(i / 6))}" fill="hsl(${i * 15} 70% 82%)" stroke="#a8434f" stroke-width="1.5"/>`).join('');
// pieces pulled apart slightly so each outline is visible
const apart = Array.from({ length: 24 }, (_, i) => { const c = i % 6, r = Math.floor(i / 6);
  return `<g transform="translate(${c * 22} ${r * 22})"><path d="${piecePath(g, c, r)}" fill="hsl(${i * 15} 70% 82%)" stroke="#a8434f" stroke-width="1.5"/></g>`; }).join('');
writeFileSync('/tmp/assembled.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 1080 747" width="1080" height="747"><rect x="-40" y="-40" width="1080" height="747" fill="#fff"/>${sheet}</svg>`);
writeFileSync('/tmp/apart.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 1180 840" width="1180" height="840"><rect x="-40" y="-40" width="1180" height="840" fill="#fff"/>${apart}</svg>`);
