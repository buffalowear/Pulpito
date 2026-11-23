// Apostilas da ICM: extrair o texto no próprio navegador, dividir em trechos e
// anotar as referências bíblicas citadas em cada trecho.
import { refsCitadas } from './biblia';

export type TrechoNovo = { titulo: string; texto: string; refs: string[] };

/** Extrai o texto de um PDF, DOCX ou TXT (roda no navegador do administrador). */
export async function extrairTexto(arquivo: File): Promise<string> {
  const ext = arquivo.name.toLowerCase().split('.').pop();
  if (ext === 'pdf') {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise;
    const paginas: string[] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const conteudo = await (await pdf.getPage(n)).getTextContent();
      let texto = '';
      for (const item of conteudo.items) if ('str' in item) texto += item.str + (item.hasEOL ? '\n' : ' ');
      paginas.push(texto);
    }
    return paginas.join('\n\n');
  }
  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    return (await mammoth.extractRawText({ arrayBuffer: await arquivo.arrayBuffer() })).value;
  }
  if (ext === 'txt' || ext === 'md') return arquivo.text();
  throw new Error('Formato não aceito. Envie PDF, DOCX ou TXT. (Arquivos .doc antigos: abra no Word e salve como .docx.)');
}

const pareceTitulo = (linha: string) =>
  linha.length >= 3 && linha.length <= 90 && !/[.;,:]$/.test(linha) &&
  (linha === linha.toUpperCase() || /^(\d+[.)-]|[IVX]+[.)-]|cap[ií]tulo|li[cç][aã]o|mensagem|estudo|tema)\s/i.test(linha));

/** Divide o texto em trechos de cerca de 1.200 letras, respeitando parágrafos e títulos. */
export function dividirTrechos(textoBruto: string, alvo = 1200): TrechoNovo[] {
  const paragrafos = textoBruto.replace(/\r/g, '').split(/\n\s*\n|\n(?=[A-ZÀ-Ý0-9])/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  // parágrafos muito longos (comuns em PDF) são quebrados em frases
  const partes: string[] = [];
  for (const p of paragrafos) {
    if (p.length <= alvo * 1.4) { partes.push(p); continue; }
    let pedaco = '';
    for (const frase of p.split(/(?<=[.!?…])\s+/)) {
      if (pedaco && pedaco.length + frase.length > alvo) { partes.push(pedaco); pedaco = ''; }
      pedaco += (pedaco ? ' ' : '') + frase;
    }
    if (pedaco) partes.push(pedaco);
  }
  const trechos: TrechoNovo[] = [];
  let titulo = '', atual = '', tituloAtual = '';
  const fechar = () => {
    const t = atual.trim();
    if (t.length >= 80) trechos.push({ titulo: tituloAtual, texto: t, refs: refsCitadas(tituloAtual + ' ' + t) });
    atual = '';
  };
  for (const p of partes) {
    if (pareceTitulo(p)) { fechar(); titulo = p; continue; }
    if (!atual) tituloAtual = titulo;
    if (atual.length + p.length > alvo * 1.4 && atual.length >= alvo * 0.5) { fechar(); tituloAtual = titulo; }
    atual += (atual ? '\n' : '') + p;
    if (atual.length >= alvo) fechar();
  }
  fechar();
  return trechos;
}
