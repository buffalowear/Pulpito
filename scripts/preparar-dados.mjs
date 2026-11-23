// Prepara os dados bíblicos do app a partir de fontes livres:
//   - versões: King James (inglês), hebraico (Códice de Leningrado) e grego (Textus Receptus),
//     do repositório midvash/bible-data
//   - referências cruzadas: openbible.info (CC BY), via scrollmapper/bible_databases
//   - títulos de seção: escritos para o Púlpito (dados-fonte/titulos/*.json)
// Uso:  npm run dados            (baixa da internet)
//       npm run dados -- pasta   (usa arquivos já baixados: kjv.json, wlc.json, tr.json, cross_references.txt)
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = path.join(RAIZ, 'public', 'dados');
const MIDVASH = 'https://raw.githubusercontent.com/midvash/bible-data/main/versions';
const REFS = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/extras/cross_references.txt';
const OSIS = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal','Matt','Mark','Luke','John','Acts','Rom','1Cor','2Cor','Gal','Eph','Phil','Col','1Thess','2Thess','1Tim','2Tim','Titus','Phlm','Heb','Jas','1Pet','2Pet','1John','2John','3John','Jude','Rev'];
const INDICE = new Map(OSIS.map((o, i) => [o, i]));
const VERSOES = [
  { id: 'kjv', caminho: 'en/kjv', nome: 'King James Version (inglês)', credito: 'King James Version (1769). Domínio público. Dados: midvash/bible-data.' },
  { id: 'wlc', caminho: 'he/wlc', nome: 'Hebraico — Códice de Leningrado', credito: 'Westminster Leningrad Codex. Texto de uso livre (licença WLC). Dados: midvash/bible-data.' },
  { id: 'tr', caminho: 'gr/tr', nome: 'Grego — Textus Receptus', credito: 'Textus Receptus (Stephanus, 1550). Domínio público. Dados: midvash/bible-data.' },
];

const pasta = process.argv[2];
async function obter(nome, url, json = true) {
  if (pasta) { const t = await readFile(path.join(pasta, nome), 'utf8'); return json ? JSON.parse(t) : t; }
  console.log('Baixando ' + nome + '…');
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar ${nome}: ${r.status}`);
  return json ? r.json() : r.text();
}

await mkdir(path.join(SAIDA, 'refs'), { recursive: true });
const livre = JSON.parse(await readFile(path.join(RAIZ, 'public', 'biblia.json'), 'utf8'));
const tamanhos = livre.b.map((l) => l[2].map((c) => c.length));

// ---------- versões ----------
for (const v of VERSOES) {
  const bruto = await obter(v.id + '.json', `${MIDVASH}/${v.caminho}/${v.id}.json`);
  const b = OSIS.map((_, i) => [livre.b[i][0], livre.b[i][1], []]);
  let total = 0;
  for (const livro of bruto.books) {
    const i = INDICE.get(livro.book);
    if (i === undefined) continue;
    b[i][2] = livro.chapters.map((c) => {
      const vs = [];
      for (const x of c.verses) vs[x.number - 1] = String(x.text).replace(/\s+/g, ' ').replace(/\s+׃/g, '׃').trim();
      for (let k = 0; k < vs.length; k++) vs[k] ??= '';
      total += vs.length;
      return vs;
    });
  }
  await writeFile(path.join(SAIDA, v.id + '.json'), JSON.stringify({ v: 1, id: v.id, nome: v.nome, credito: v.credito, b }));
  console.log(`${v.id}: ${total} versículos`);
}

// ---------- referências cruzadas ----------
// Linha: "Gen.1.1 <tab> John.1.1-John.1.3 <tab> votos". Guardamos as 12 mais votadas de cada versículo.
const texto = await obter('cross_references.txt', REFS, false);
const ponto = (s) => { const [o, c, v] = s.split('.'); const l = INDICE.get(o); return l === undefined ? null : { l, c: Number(c), v: Number(v) }; };
const existe = (p) => p && tamanhos[p.l][p.c - 1] >= p.v && p.v >= 1;
const porLivro = OSIS.map(() => ({}));
let lidas = 0;
for (const linha of texto.split('\n')) {
  const [de, para, votos] = linha.split('\t');
  const origem = de && ponto(de);
  if (!existe(origem) || !para) continue;
  const [ini, fim] = para.split('-');
  const a = ponto(ini), z = fim ? ponto(fim) : null;
  if (!existe(a)) continue;
  const n = Number(votos) || 0;
  if (n < 1) continue;
  const v2 = z && z.l === a.l && z.c === a.c && z.v > a.v && existe(z) ? z.v : 0;
  (porLivro[origem.l][`${origem.c}.${origem.v}`] ??= []).push([n, a.l, a.c, a.v, v2]);
  lidas++;
}
let gravadas = 0;
for (let l = 0; l < 66; l++) {
  const saida = {};
  for (const [chave, lista] of Object.entries(porLivro[l])) {
    lista.sort((x, y) => y[0] - x[0]);
    saida[chave] = lista.slice(0, 12).map(([, a, c, v, v2]) => (v2 ? [a, c, v, v2] : [a, c, v]));
    gravadas += saida[chave].length;
  }
  await writeFile(path.join(SAIDA, 'refs', l + '.json'), JSON.stringify(saida));
}
console.log(`referências cruzadas: ${lidas} lidas, ${gravadas} gravadas`);

// ---------- títulos de seção ----------
const dirTitulos = path.join(RAIZ, 'dados-fonte', 'titulos');
const titulos = {};
let nTitulos = 0, problemas = 0;
for (const arq of (await readdir(dirTitulos).catch(() => [])).filter((a) => /^g\d+\.json$/.test(a)).sort()) {
  const grupo = JSON.parse(await readFile(path.join(dirTitulos, arq), 'utf8'));
  for (const [l, caps] of Object.entries(grupo)) {
    for (const [c, lista] of Object.entries(caps)) {
      const max = tamanhos[Number(l)]?.[Number(c) - 1];
      if (!max) { problemas++; continue; }
      const boas = lista.filter(([v, t]) => Number.isInteger(v) && v >= 1 && v <= max && typeof t === 'string' && t.trim()).map(([v, t]) => [v, t.trim().replace(/\.$/, '')]).sort((a, b) => a[0] - b[0]);
      problemas += lista.length - boas.length;
      if (boas.length) { (titulos[l] ??= {})[c] = boas; nTitulos += boas.length; }
    }
  }
}
let semTitulo = 0;
tamanhos.forEach((caps, l) => caps.forEach((_, c) => { if (!titulos[l]?.[c + 1]) semTitulo++; }));
await writeFile(path.join(SAIDA, 'titulos.json'), JSON.stringify(titulos));
console.log(`títulos: ${nTitulos} gravados, ${problemas} descartados, ${semTitulo} capítulos ainda sem título`);
