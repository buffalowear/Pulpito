'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Falta configurar o Supabase? (mostra a tela de instruções) */
export const semSupabase = !url || !chave;

let cliente: SupabaseClient | null = null;

/** Cliente do Supabase no navegador. Usa a chave pública; quem protege os dados é o RLS. */
export function supa(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(url as string, chave as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    });
  }
  return cliente;
}
