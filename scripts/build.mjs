// Gera as imagens do README (9 partes x claro/escuro) em assets/.
import { mkdir, writeFile } from 'node:fs/promises';
import { collect } from './data.mjs';
import { render } from './art/scenes.mjs';

const D = await collect();
await mkdir('assets', { recursive: true });
for (const theme of ['light', 'dark']) {
  for (const [part, svg] of Object.entries(render(theme, D))) {
    if (/NaN|undefined/.test(svg)) throw new Error(`${part}-${theme}: valor inválido no SVG`);
    await writeFile(`assets/${part}-${theme}.svg`, svg);
  }
}
console.log(`${D.repos.length} repositórios, ${D.allTotal} contribuições, sequência ${D.streaks.current}/${D.streaks.best}`);
