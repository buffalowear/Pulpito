// Mostra capítulos da King James em inglês (apoio à tradução).
// Uso: node scripts/ver-kjv.mjs <livro 0-65> <capítulo inicial> [capítulo final]
import { readFileSync } from 'node:fs';
const b = JSON.parse(readFileSync(new URL('../public/dados/kjv.json', import.meta.url), 'utf8')).b;
const l = Number(process.argv[2]), ini = Number(process.argv[3] || 1), fim = Number(process.argv[4] || ini);
for (let c = ini; c <= Math.min(fim, b[l][2].length); c++) {
  console.log(`\n## ${b[l][1]} ${c} (livro ${l}, ${b[l][2][c - 1].length} versículos)`);
  b[l][2][c - 1].forEach((t, i) => console.log(`${i + 1} ${t}`));
}
