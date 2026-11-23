// Versões da Bíblia disponíveis no app. Todas têm licença livre ou são de domínio público.
// Para acrescentar uma versão licenciada (ex.: Almeida Revista e Corrigida), gere o arquivo
// no mesmo formato em public/dados/<id>.json e adicione uma linha aqui.

export type Versao = {
  id: string;
  sigla: string;
  nome: string;
  idioma: 'pt' | 'en' | 'he' | 'el';
  arquivo: string;
  credito: string;
  livros?: [number, number];   // faixa de livros que a versão contém (padrão: todos)
};

export const VERSOES: Versao[] = [
  { id: 'blivre', sigla: 'BLIVRE', nome: 'Bíblia Livre (base Almeida)', idioma: 'pt', arquivo: 'biblia.json',
    credito: 'Bíblia Livre (BLIVRE) © 2018 Diego Santos, Mario Sérgio e Marco Teles — licença Creative Commons Atribuição 4.0 Brasil.' },
  { id: 'kjc', sigla: 'KJ-C', nome: 'King James em português — clássica', idioma: 'pt', arquivo: 'dados/kjc.json',
    credito: 'Tradução própria do Púlpito a partir da King James Version (1769, domínio público). Tradução automática, ainda sem revisão: confira com a sua Bíblia.' },
  { id: 'kja', sigla: 'KJ-A', nome: 'King James em português — atual', idioma: 'pt', arquivo: 'dados/kja.json',
    credito: 'Tradução própria do Púlpito a partir da King James Version (1769, domínio público), em linguagem atual. Tradução automática, ainda sem revisão: confira com a sua Bíblia.' },
  { id: 'kjv', sigla: 'KJV', nome: 'King James (inglês)', idioma: 'en', arquivo: 'dados/kjv.json',
    credito: 'King James Version (1769) — domínio público.' },
  { id: 'wlc', sigla: 'HEB', nome: 'Hebraico (Antigo Testamento)', idioma: 'he', arquivo: 'dados/wlc.json', livros: [0, 38],
    credito: 'Westminster Leningrad Codex — texto hebraico de uso livre.' },
  { id: 'tr', sigla: 'GRE', nome: 'Grego (Novo Testamento)', idioma: 'el', arquivo: 'dados/tr.json', livros: [39, 65],
    credito: 'Textus Receptus (Stephanus, 1550) — domínio público.' },
];

export const versaoPorId = (id: string): Versao => VERSOES.find((v) => v.id === id) || VERSOES[0];
export const temLivro = (v: Versao, livro: number) => !v.livros || (livro >= v.livros[0] && livro <= v.livros[1]);

// ---------------------------------------------------------------------
// Transliteração aproximada do hebraico (para quem não lê o alfabeto).
// É automática e simplificada: serve de apoio à leitura, não é estudo de pronúncia.
// ---------------------------------------------------------------------
const CONS: Record<string, string> = {
  'א': 'ʾ', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
  'כ': 'kh', 'ך': 'kh', 'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'ʿ', 'פ': 'f', 'ף': 'f',
  'צ': 'ts', 'ץ': 'ts', 'ק': 'q', 'ר': 'r', 'ש': 'sh', 'ת': 't',
};
const DURAS: Record<string, string> = { 'ב': 'b', 'כ': 'k', 'ך': 'k', 'פ': 'p', 'ף': 'p' };
const VOGAIS: Record<string, string> = {
  'ְ': 'e', 'ֱ': 'e', 'ֲ': 'a', 'ֳ': 'o', 'ִ': 'i', 'ֵ': 'e', 'ֶ': 'e',
  'ַ': 'a', 'ָ': 'a', 'ֹ': 'o', 'ֺ': 'o', 'ֻ': 'u',
};

export function transliterar(hebraico: string): string {
  const palavras = hebraico.replace(/[֑-ֽֿ֯׀׃-ׇ]/g, '').replace(/־/g, ' ').split(/\s+/).filter(Boolean);
  return palavras.map((palavra) => {
    let out = '';
    const letras = [...palavra];
    for (let i = 0; i < letras.length; i++) {
      const letra = letras[i];
      if (!CONS[letra]) continue;
      // sinais que acompanham a letra
      let sinais = '';
      while (i + 1 < letras.length && !CONS[letras[i + 1]]) sinais += letras[++i];
      const dagesh = sinais.includes('ּ');
      const vogal = [...sinais].map((s) => VOGAIS[s]).find(Boolean) || '';
      let som = CONS[letra];
      if (letra === 'ש') som = sinais.includes('ׂ') ? 's' : 'sh';
      else if (dagesh && DURAS[letra]) som = DURAS[letra];
      else if (letra === 'ו' && dagesh && !vogal) { out += 'u'; continue; }            // shuruq
      else if (letra === 'ו' && sinais.includes('ֹ') && out) { out += 'o'; continue; } // holam male
      else if (letra === 'י' && !vogal && /[ie]$/.test(out)) continue;                  // yod mudo depois de i/e
      else if (letra === 'ה' && !vogal && i === letras.length - 1 && !dagesh) continue;   // he final mudo
      else if ((letra === 'א' || letra === 'ע') && !vogal) continue;
      out += som + vogal;
    }
    return out.replace(/^[ʾʿ]/, '').replace(/[ʾʿ]/g, "'");
  }).filter(Boolean).join(' ');
}
