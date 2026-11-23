// Mostra o texto de capítulos da Bíblia Livre (apoio para escrever os títulos de seção).
// Uso: node scripts/ver-capitulos.mjs <livro 0-65> [capítulo inicial] [capítulo final]
import { readFileSync } from 'node:fs';
const b = JSON.parse(readFileSync(new URL('../public/biblia.json', import.meta.url), 'utf8')).b;
const l = Number(process.argv[2]);
const ini = Number(process.argv[3] || 1);
const fim = Number(process.argv[4] || b[l][2].length);
console.log(`# ${b[l][1]} (livro ${l}) — ${b[l][2].length} capítulos`);
for (let c = ini; c <= Math.min(fim, b[l][2].length); c++) {
  console.log(`\n## ${b[l][1]} ${c}`);
  b[l][2][c - 1].forEach((t, i) => console.log(`${i + 1} ${t}`));
}
