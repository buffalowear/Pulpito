'use client';
import { useEffect, useState } from 'react';
import type { BibliaDados } from '@/lib/biblia';
import { versaoPorId } from '@/lib/versoes';
import { gravar, ler } from './local';

/** Endereço base do app (vazio na raiz do site; "/pulpito" quando publicado numa subpasta). */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const memoria = new Map<string, BibliaDados>();
const carregando = new Map<string, Promise<BibliaDados>>();

/** Carrega uma versão da Bíblia: primeiro do aparelho (offline), senão baixa e guarda. */
export function carregarBiblia(id = 'blivre'): Promise<BibliaDados> {
  const pronta = memoria.get(id);
  if (pronta) return Promise.resolve(pronta);
  let p = carregando.get(id);
  if (!p) {
    p = (async () => {
      const chave = id === 'blivre' ? 'biblia-v1' : `biblia-${id}-v1`;
      let dados = await ler<BibliaDados | null>(chave, null);
      if (!dados) {
        const r = await fetch(`${BASE}/${versaoPorId(id).arquivo}`);
        if (!r.ok) throw new Error('Falha ao baixar a Bíblia');
        dados = (await r.json()).b as BibliaDados;
        void gravar(chave, dados);
      }
      memoria.set(id, dados);
      return dados;
    })().catch((e) => { carregando.delete(id); throw e; });
    carregando.set(id, p);
  }
  return p;
}

/** Gancho: devolve a versão pedida (null enquanto carrega; 'erro' se falhar). */
export function useBiblia(id: string | null): BibliaDados | null | 'erro' {
  const [estado, setEstado] = useState<{ id: string | null; dados: BibliaDados | null | 'erro' }>({ id: null, dados: null });
  useEffect(() => {
    let vivo = true;
    if (!id) return;
    carregarBiblia(id).then((d) => { if (vivo) setEstado({ id, dados: d }); }).catch(() => { if (vivo) setEstado({ id, dados: 'erro' }); });
    return () => { vivo = false; };
  }, [id]);
  return estado.id === id ? estado.dados : (id && memoria.get(id)) || null;
}

// ---------- títulos de seção ----------
export type Titulos = Record<string, Record<string, [number, string][]>>;
let titulos: Promise<Titulos> | null = null;
export function carregarTitulos(): Promise<Titulos> {
  titulos ??= (async () => {
    const local = await ler<Titulos | null>('titulos-v1', null);
    if (local) return local;
    const r = await fetch(`${BASE}/dados/titulos.json`);
    if (!r.ok) throw new Error('sem títulos');
    const dados = (await r.json()) as Titulos;
    void gravar('titulos-v1', dados);
    return dados;
  })().catch(() => { titulos = null; return {}; });
  return titulos;
}

// ---------- referências cruzadas (um arquivo por livro) ----------
export type RefCruzada = [number, number, number, number?];   // livro, capítulo (a partir de 1), versículo, versículo final
type RefsLivro = Record<string, RefCruzada[]>;
const refs = new Map<number, Promise<RefsLivro>>();
export function carregarRefs(livro: number): Promise<RefsLivro> {
  let p = refs.get(livro);
  if (!p) {
    p = (async () => {
      const local = await ler<RefsLivro | null>(`refs-${livro}-v1`, null);
      if (local) return local;
      const r = await fetch(`${BASE}/dados/refs/${livro}.json`);
      if (!r.ok) throw new Error('sem referências');
      const dados = (await r.json()) as RefsLivro;
      void gravar(`refs-${livro}-v1`, dados);
      return dados;
    })().catch((e) => { refs.delete(livro); throw e; });
    refs.set(livro, p);
  }
  return p;
}
