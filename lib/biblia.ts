// Funções da Bíblia usadas tanto no navegador quanto no servidor.
// Formato dos dados: [abreviatura, nome, capítulos[][]] para cada um dos 66 livros.

export type LivroDados = [string, string, string[][]];
export type BibliaDados = LivroDados[];
export type RefBiblica = { l: number; c: number; v?: number; v2?: number };

export const LIVROS = ['Gênesis','Êxodo','Levítico','Números','Deuteronômio','Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis','1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó','Salmos','Provérbios','Eclesiastes','Cânticos','Isaías','Jeremias','Lamentações','Ezequiel','Daniel','Oseias','Joel','Amós','Obadias','Jonas','Miqueias','Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias','Mateus','Marcos','Lucas','João','Atos','Romanos','1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses','Colossenses','1 Tessalonicenses','2 Tessalonicenses','1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus','Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João','Judas','Apocalipse'];

export const norm = (s: string) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Apelidos aceitos para cada livro (sem acento, sem espaço)
const APELIDOS: string[][] = [
  ['genesis','gn','gen'],['exodo','ex'],['levitico','lv','lev'],['numeros','nm','num'],['deuteronomio','dt','deut'],
  ['josue','js','jos'],['juizes','jz','jui'],['rute','rt'],['1samuel','1sm','1sam','isamuel'],['2samuel','2sm','2sam','iisamuel'],
  ['1reis','1rs','ireis'],['2reis','2rs','iireis'],['1cronicas','1cr','icronicas'],['2cronicas','2cr','iicronicas'],
  ['esdras','ed','esd'],['neemias','ne','nee'],['ester','et','est'],['jo','job'],['salmos','salmo','sl','sal'],
  ['proverbios','pv','prov'],['eclesiastes','ec','ecl'],['canticos','cantares','cantico','ct','cant','canticodoscanticos','cantaresdesalomao'],
  ['isaias','is','isa'],['jeremias','jr','jer'],['lamentacoes','lm','lam','lamentacoesdejeremias'],['ezequiel','ez','eze'],['daniel','dn','dan'],
  ['oseias','os'],['joel','jl'],['amos','am'],['obadias','ob','oba'],['jonas','jn','jon'],['miqueias','mq','miq'],['naum','na'],
  ['habacuque','hc','hab'],['sofonias','sf','sof'],['ageu','ag'],['zacarias','zc','zac'],['malaquias','ml','mal'],
  ['mateus','mt','mat'],['marcos','mc','mar'],['lucas','lc','luc'],['joao','joa'],['atos','at','atosdosapostolos'],['romanos','rm','rom'],
  ['1corintios','1co','1cor','icorintios'],['2corintios','2co','2cor','iicorintios'],['galatas','gl','gal'],['efesios','ef','efe'],
  ['filipenses','fp','fil','flp'],['colossenses','cl','col'],['1tessalonicenses','1ts','1tes','itessalonicenses'],
  ['2tessalonicenses','2ts','2tes','iitessalonicenses'],['1timoteo','1tm','1tim','itimoteo'],['2timoteo','2tm','2tim','iitimoteo'],
  ['tito','tt'],['filemom','filemon','fm','flm'],['hebreus','hb','heb'],['tiago','tg','tia'],['1pedro','1pe','1pd','ipedro'],
  ['2pedro','2pe','2pd','iipedro'],['1joao','1jo','ijoao'],['2joao','2jo','iijoao'],['3joao','3jo','iiijoao'],['judas','jd','jud'],
  ['apocalipse','ap','apo','apoc'],
];
const MAPA = new Map<string, number>();
APELIDOS.forEach((lista, i) => lista.forEach((a) => MAPA.set(a, i)));

/** Índice do livro (0–65) a partir do nome ou abreviatura; -1 se não reconhecer. */
export function indiceLivro(nome: string): number {
  // "Jó" (com acento) é o livro de Jó; "Jo" (sem acento) é a abreviatura usual de João.
  if (/^\s*j[óô]\.?\s*$/i.test(nome)) return 17;
  const n = norm(nome).replace(/[^a-z0-9]/g, '');
  if (n === 'jo') return 42;
  return MAPA.has(n) ? (MAPA.get(n) as number) : -1;
}

/** Lê "João 3:16-18", "1 Reis 19", "Sl 23.1" etc. Capítulo devolvido com base 0. */
export function lerRef(texto: string): RefBiblica | null {
  const m = String(texto || '').trim().match(/^((?:[1-3]|i{1,3})?\s*[A-Za-zÀ-ÿ.]+(?:\s+(?:d[oae]s?\s+)?[A-Za-zÀ-ÿ]+){0,3}?)\.?\s*(\d{1,3})(?:\s*[:.,]\s*(\d{1,3})(?:\s*[-–—a]\s*(\d{1,3}))?)?/i);
  if (!m) return null;
  const l = indiceLivro(m[1]);
  if (l < 0) return null;
  const ref: RefBiblica = { l, c: Number(m[2]) - 1 };
  if (m[3]) ref.v = Number(m[3]);
  if (m[4]) ref.v2 = Number(m[4]);
  return ref;
}

export function formatarRef(r: RefBiblica): string {
  return `${LIVROS[r.l]} ${r.c + 1}${r.v ? ':' + r.v + (r.v2 && r.v2 > r.v ? '-' + r.v2 : '') : ''}`;
}

/** Remove os colchetes que a Bíblia Livre usa em palavras acrescentadas. */
export const limparVerso = (t: string) => String(t || '').replace(/[\[\]]/g, '');

/** Versículos de uma referência: [[número, texto], ...]. Vazio se não existir. */
export function versiculos(dados: BibliaDados, r: RefBiblica, maximo = 200): [number, string][] {
  const cap = dados[r.l]?.[2]?.[r.c];
  if (!cap) return [];
  const ini = r.v ?? 1;
  const fim = Math.min(r.v ? (r.v2 && r.v2 >= ini ? r.v2 : ini) : cap.length, cap.length, ini + maximo - 1);
  const out: [number, string][] = [];
  for (let n = ini; n <= fim; n++) if (cap[n - 1]) out.push([n, limparVerso(cap[n - 1])]);
  return out;
}

/** Texto de leitura: um versículo por linha, começando pelo número. */
export function textoLeitura(dados: BibliaDados, r: RefBiblica, maximo = 40): string {
  return versiculos(dados, r, maximo).map(([n, t]) => `${n} ${t}`).join('\n');
}

/**
 * Troca as marcações {{João 3:16}} pelo texto da Bíblia do app:
 * "texto do versículo" (João 3:16). Se a referência não existir, fica só a referência.
 */
export function transcreverCitacoes(texto: string, dados: BibliaDados | null): string {
  return String(texto || '').replace(/\{\{([^{}]{2,60})\}\}/g, (_, bruto: string) => {
    const r = lerRef(bruto);
    if (!r || !dados) return `(${bruto.trim()})`;
    if (!r.v) return `(${formatarRef(r)})`;
    const vs = versiculos(dados, r, 6);
    if (!vs.length) return `(${formatarRef(r)})`;
    const fimReal = vs[vs.length - 1][0];
    const ref = formatarRef({ ...r, v2: fimReal > (r.v as number) ? fimReal : undefined });
    return `“${vs.map(([, t]) => t).join(' ')}” (${ref})`;
  });
}

/** Chaves "livro:capitulo" de todas as referências citadas num texto (para o acervo). */
export function refsCitadas(texto: string): string[] {
  const achados = new Set<string>();
  const re = /((?:[1-3]\s?)?[A-ZÀ-Ý][a-zà-ÿ]+\.?)\s+(\d{1,3})(?=\s*[:.,]\s*\d|\b)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(String(texto || '')))) {
    const l = indiceLivro(m[1]);
    const c = Number(m[2]);
    if (l >= 0 && c >= 1 && c <= 150) achados.add(`${l}:${c}`);
  }
  return [...achados];
}
