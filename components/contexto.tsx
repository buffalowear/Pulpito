'use client';
import { createContext, useContext } from 'react';
import type { Perfil } from '@/lib/tipos';

export type Ctx = {
  perfil: Perfil;
  online: boolean;
  avisar: (texto: string) => void;          // mensagem rápida no rodapé
  atualizarPerfil: (p: Perfil) => void;
  sair: () => Promise<void>;
};
export const AppCtx = createContext<Ctx | null>(null);
export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('Fora do aplicativo');
  return c;
}

/** Vai para uma tela do app (endereços do tipo #/mensagens). */
export const ir = (rota: string) => { window.location.hash = rota; };
