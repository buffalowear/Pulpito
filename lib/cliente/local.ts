'use client';
// Armazenamento no próprio aparelho (IndexedDB) — é o que faz o app funcionar sem internet.
import { createStore, del, get, set } from 'idb-keyval';

const loja = typeof indexedDB !== 'undefined' ? createStore('pulpito', 'dados') : undefined;

export async function ler<T>(chave: string, padrao: T): Promise<T> {
  if (!loja) return padrao;
  try { return ((await get(chave, loja)) as T) ?? padrao; } catch { return padrao; }
}
export async function gravar(chave: string, valor: unknown): Promise<void> {
  if (!loja) return;
  try { await set(chave, valor, loja); } catch { /* sem espaço ou modo privado */ }
}
export async function apagarLocal(chave: string): Promise<void> {
  if (!loja) return;
  try { await del(chave, loja); } catch { /* ignora */ }
}

/** Preferências pequenas (localStorage). */
export const pref = {
  ler<T>(chave: string, padrao: T): T {
    try { const v = localStorage.getItem('pulpito:' + chave); return v == null ? padrao : (JSON.parse(v) as T); } catch { return padrao; }
  },
  gravar(chave: string, valor: unknown) {
    try { localStorage.setItem('pulpito:' + chave, JSON.stringify(valor)); } catch { /* ignora */ }
  },
};
