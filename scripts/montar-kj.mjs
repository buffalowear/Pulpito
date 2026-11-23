// Junta os capítulos traduzidos da King James (dados-fonte/kj/<livro>/<capítulo>.json)
// nos dois arquivos que o app lê: public/dados/kjc.json (clássica) e kja.json (atual).
// Capítulos ainda não traduzidos ficam vazios e o app avisa.
// Uso: npm run kj
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const raiz = new URL('../', import.meta.url);
const kjv = JSON.parse(readFileSync(new URL('public/dados/kjv.json', raiz), 'utf8')).b;
const VERSOES = {
  c: { id: 'kjc', nome: 'King James em português — clássica', arquivo: 'kjc.json' },
  a: { id: 'kja', nome: 'King James em português — atual', arquivo: 'kja.json' },
};
const credito = 'Tradução própria do Púlpito a partir da King James Version (1769, domínio público). Tradução automática, ainda sem revisão: confira com a sua Bíblia.';
let feitos = 0, faltam = 0;
for (const [chave, v] of Object.entries(VERSOES)) {
  const b = kjv.map((livro, l) => [livro[0], livro[1], livro[2].map((cap, c) => {
    const arq = new URL(`dados-fonte/kj/${l}/${c + 1}.json`, raiz);
    if (existsSync(arq)) {
      try {
        const d = JSON.parse(readFileSync(arq, 'utf8'))[chave];
        if (Array.isArray(d) && d.length === cap.length && d.every((t) => typeof t === 'string' && t.trim())) {
          if (chave === 'c') feitos++;
          return d.map((t) => t.replace(/\s+/g, ' ').trim());
        }
      } catch { /* cai no vazio abaixo */ }
    }
    if (chave === 'c') faltam++;
    return [];
  })]);
  writeFileSync(new URL('public/dados/' + v.arquivo, raiz), JSON.stringify({ v: 1, id: v.id, nome: v.nome, credito, b }));
}
console.log(`King James em português: ${feitos} capítulos prontos, ${faltam} faltando`);
