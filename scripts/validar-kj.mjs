// Confere a tradução da King James em dados-fonte/kj/<livro>/<capítulo>.json.
// Uso: node scripts/validar-kj.mjs [livro inicial] [livro final]   (sem argumentos: tudo)
//      node scripts/validar-kj.mjs 42 42 3 10   (só os capítulos 3 a 10 do livro 42)
import { existsSync, readFileSync } from 'node:fs';
const raiz = new URL('../', import.meta.url);
const kjv = JSON.parse(readFileSync(new URL('public/dados/kjv.json', raiz), 'utf8')).b;
const [li = 0, lf = 65, ci = 1, cf = 999] = process.argv.slice(2).map(Number);
const INGLES = /\b(the|and|unto|shall|thou|thee|which|with|that|from|were|have)\b/i;
let ok = 0; const problemas = [];
for (let l = li; l <= lf; l++) {
  for (let c = Math.max(1, ci); c <= Math.min(cf, kjv[l][2].length); c++) {
    const arq = new URL(`dados-fonte/kj/${l}/${c}.json`, raiz), nome = `${kjv[l][1]} ${c}`;
    if (!existsSync(arq)) { problemas.push(`${nome}: FALTA o arquivo dados-fonte/kj/${l}/${c}.json`); continue; }
    let d;
    try { d = JSON.parse(readFileSync(arq, 'utf8')); } catch { problemas.push(`${nome}: JSON inválido`); continue; }
    const n = kjv[l][2][c - 1].length;
    let bom = true;
    for (const k of ['c', 'a']) {
      if (!Array.isArray(d[k]) || d[k].length !== n) { problemas.push(`${nome}: "${k}" tem ${d[k]?.length ?? 0} versículos, deveria ter ${n}`); bom = false; continue; }
      d[k].forEach((t, i) => {
        if (typeof t !== 'string' || t.trim().length < 2) { problemas.push(`${nome}:${i + 1} "${k}" vazio`); bom = false; }
        else if (/^\d+[\s.)]/.test(t)) { problemas.push(`${nome}:${i + 1} "${k}" começa com número`); bom = false; }
        else if ((t.match(new RegExp(INGLES, 'gi')) || []).length >= 3) { problemas.push(`${nome}:${i + 1} "${k}" parece estar em inglês`); bom = false; }
      });
    }
    if (bom) ok++;
  }
}
console.log(`${ok} capítulos corretos, ${problemas.length} problemas`);
problemas.slice(0, 60).forEach((p) => console.log(' - ' + p));
process.exit(problemas.length ? 1 : 0);
