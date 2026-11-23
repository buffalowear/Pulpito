// Apoio aos "textos usados" de uma mensagem. Chave: "livro.capitulo.versiculo" ou
// "livro.capitulo.versiculo-versiculoFinal" (livro 0-65, capítulo a partir de 0).
import { formatarRef, limparVerso, type BibliaDados, type RefBiblica } from './biblia';

export function lerChave(chave: string): RefBiblica | null {
  const m = chave.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  return { l: Number(m[1]), c: Number(m[2]), v: Number(m[3]), v2: m[4] ? Number(m[4]) : undefined };
}
export const chaveDe = (r: RefBiblica) => `${r.l}.${r.c}.${r.v ?? 1}${r.v2 && r.v2 > (r.v ?? 1) ? '-' + r.v2 : ''}`;
export function rotuloChave(chave: string): string {
  const r = lerChave(chave);
  return r ? formatarRef(r) : chave;
}
/** Texto dos versículos de uma chave, com o número na frente quando há mais de um. */
export function textoChave(chave: string, biblia: BibliaDados | null): string {
  const r = lerChave(chave);
  const cap = r && biblia ? biblia[r.l]?.[2]?.[r.c] : null;
  if (!r || !cap) return '';
  const ini = r.v as number, fim = Math.min(r.v2 || ini, cap.length);
  const out: string[] = [];
  for (let v = ini; v <= fim; v++) if (cap[v - 1]) out.push((fim > ini ? v + ' ' : '') + limparVerso(cap[v - 1]));
  return out.join(' ');
}
