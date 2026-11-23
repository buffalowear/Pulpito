'use client';
import { BASE } from '@/lib/cliente/bibliaDados';

/**
 * Logo oficial do Púlpito ("Fita marcadora"): símbolo + nome em Merriweather Black.
 * Os SVGs ficam em public/logo/ e não devem ser redesenhados.
 * fundo "vinho": páginas brancas, "Púl" em branco e "pito" em dourado.
 * fundo "claro": símbolo em duas cores e nome todo em vinho.
 */
export function Logo({ fundo = 'vinho', tamanho = 30 }: { fundo?: 'vinho' | 'claro'; tamanho?: number }) {
  const vinho = fundo === 'vinho';
  return (
    <span className="inline-flex items-center" style={{ gap: '0.35em', fontSize: tamanho, color: vinho ? '#ffffff' : '#4a1626' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE}/logo/${vinho ? 'simbolo-fundo-vinho' : 'simbolo'}.svg`} alt="" width={tamanho * 1.7} height={tamanho * 1.7} style={{ width: '1.7em', height: '1.7em', display: 'block' }} />
      <span style={{ fontFamily: 'var(--font-corpo), Georgia, serif', fontWeight: 900, letterSpacing: '-0.0125em', lineHeight: 1 }}>
        Púl{vinho ? <span style={{ color: '#c9a24a' }}>pito</span> : 'pito'}
      </span>
    </span>
  );
}
