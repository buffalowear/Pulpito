// Importa a Bíblia Livre (Almeida 1819, rev. 2018 — CC BY 4.0) do repositório
// midvash/bible-data e grava public/biblia.json no formato compacto do app:
//   { v, nome, credito, b: [[abreviatura, nome, [[versículos do cap. 1], ...]], ...] }
// Uso:  npm run biblia            (baixa da internet)
//       npm run biblia -- arquivo.json   (usa um arquivo já baixado)
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_FONTE = 'https://raw.githubusercontent.com/midvash/bible-data/main/versions/pt/almeida-livre/almeida-livre.json';
const NOMES = ['Gênesis','Êxodo','Levítico','Números','Deuteronômio','Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis','1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó','Salmos','Provérbios','Eclesiastes','Cânticos','Isaías','Jeremias','Lamentações','Ezequiel','Daniel','Oseias','Joel','Amós','Obadias','Jonas','Miqueias','Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias','Mateus','Marcos','Lucas','João','Atos','Romanos','1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses','Colossenses','1 Tessalonicenses','2 Tessalonicenses','1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus','Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João','Judas','Apocalipse'];
const ABREV = ['Gn','Êx','Lv','Nm','Dt','Js','Jz','Rt','1Sm','2Sm','1Rs','2Rs','1Cr','2Cr','Ed','Ne','Et','Jó','Sl','Pv','Ec','Ct','Is','Jr','Lm','Ez','Dn','Os','Jl','Am','Ob','Jn','Mq','Na','Hc','Sf','Ag','Zc','Ml','Mt','Mc','Lc','Jo','At','Rm','1Co','2Co','Gl','Ef','Fp','Cl','1Ts','2Ts','1Tm','2Tm','Tt','Fm','Hb','Tg','1Pe','2Pe','1Jo','2Jo','3Jo','Jd','Ap'];

const arquivo = process.argv[2];
let bruto;
if (arquivo) bruto = JSON.parse(await readFile(arquivo, 'utf8'));
else {
  console.log('Baixando a Bíblia Livre…');
  const r = await fetch(URL_FONTE);
  if (!r.ok) throw new Error('Falha ao baixar: ' + r.status);
  bruto = await r.json();
}
if (!Array.isArray(bruto.books) || bruto.books.length !== 66) throw new Error('Arquivo inesperado: precisa ter 66 livros.');

let total = 0;
const b = bruto.books.map((livro, i) => {
  const caps = livro.chapters.map((c) => {
    const vs = [];
    for (const v of c.verses) vs[v.number - 1] = String(v.text).replace(/\s+/g, ' ').trim();
    for (let k = 0; k < vs.length; k++) if (vs[k] == null) vs[k] = '';
    total += vs.length;
    return vs;
  });
  return [ABREV[i], NOMES[i], caps];
});
const saida = {
  v: 1,
  nome: 'Bíblia Livre',
  credito: 'Bíblia Livre (BLIVRE), Copyright © 2018 Diego Santos, Mario Sérgio e Marco Teles. Licença Creative Commons Atribuição 4.0 Brasil. Dados: midvash/bible-data.',
  b,
};
const destino = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'biblia.json');
await writeFile(destino, JSON.stringify(saida));
console.log(`Pronto: ${b.length} livros, ${total} versículos → public/biblia.json`);
