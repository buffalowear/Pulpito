'use client';
// Cartão de versículo para compartilhar como imagem (quatro estilos, dez cores, quatro fontes).
import { useRef, useState } from 'react';
import { pref } from '@/lib/cliente/local';
import { useApp } from './contexto';
import { IcoAvancar, IcoVoltar } from './Icones';
import { Painel } from './Paineis';

const ESTILOS = [['estudio', 'Estúdio', 'sans'], ['organico', 'Orgânico', 'sans'], ['pergaminho', 'Pergaminho', 'serif'], ['margem', 'Margem', 'serif']] as const;
const CORES: [string, string, string, string, string][] = [
  ['claro', 'Claro', '#ecebe6', '#1a1a1a', '#ffffff'], ['grafite', 'Grafite', '#262624', '#f4ecd3', '#3a3935'], ['areia', 'Areia', '#ebe2cf', '#1f1a13', '#f5eedf'],
  ['breu', 'Breu', '#111114', '#f0ead8', '#26262b'], ['salvia', 'Sálvia', '#c9d4b9', '#1f2a1a', '#dde5d1'], ['caramelo', 'Caramelo', '#e2cda6', '#2d1e12', '#f0e0c0'],
  ['azul', 'Azul', '#1b3f8f', '#f4ecd3', '#264fa0'], ['roxo', 'Roxo', '#2a1738', '#f4e5c2', '#3d2650'], ['marfim', 'Marfim', '#faf0ca', '#0d3b66', '#fdf8e2'], ['rosa', 'Rosa', '#f9a8bb', '#4a1f2c', '#fbc3d0'],
];
const FONTES = [['sans', 'Sans'], ['serif', 'Serif'], ['condensada', 'Condensada'], ['livro', 'Livro']] as const;
const FAMILIA: Record<string, React.CSSProperties> = {
  sans: { fontFamily: 'var(--font-cartao-sans)', fontWeight: 800, fontSize: 13 }, serif: { fontFamily: 'var(--font-cartao-serif)', fontStyle: 'italic' },
  condensada: { fontFamily: 'var(--font-titulo)', fontSize: 17 }, livro: { fontFamily: 'var(--font-corpo)', fontSize: 13 },
};

export function PainelCartao({ texto, livro, cap, versos, sigla, fechar }: { texto: string; livro: string; cap: number; versos: string; sigla: string; fechar: () => void }) {
  const { avisar } = useApp();
  const [estilo, setEstilo] = useState<number>(() => pref.ler('cartao-estilo', 3));
  const [cor, setCor] = useState<string>(() => pref.ler('cartao-cor', 'marfim'));
  const [fonte, setFonte] = useState<string>(() => pref.ler('cartao-fonte', 'serif'));
  const [ocupado, setOcupado] = useState(false);
  const cartao = useRef<HTMLDivElement>(null);
  const [id, nome] = ESTILOS[estilo];
  const ref = `${livro} ${cap}:${versos}`;
  // letra menor para textos longos
  const tam = texto.length < 90 ? 31 : texto.length < 160 ? 26 : texto.length < 260 ? 21 : texto.length < 400 ? 17 : 14;
  const trocar = (d: number) => { const n = (estilo + d + ESTILOS.length) % ESTILOS.length; setEstilo(n); setFonte(ESTILOS[n][2]); pref.gravar('cartao-estilo', n); pref.gravar('cartao-fonte', ESTILOS[n][2]); };

  async function copiar() {
    try { await navigator.clipboard.writeText(`${texto} (${ref} — ${sigla})`); avisar('Texto copiado'); } catch { avisar('Não foi possível copiar'); }
  }
  async function salvar() {
    if (!cartao.current) return;
    setOcupado(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cartao.current, { pixelRatio: 3, cacheBust: false });
      if (!blob) throw new Error('vazio');
      const nomeArquivo = ref.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
      const arquivo = new File([blob], `${nomeArquivo}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [arquivo] })) {
        try { await nav.share({ files: [arquivo], title: ref }); } catch (e) { if ((e as Error)?.name !== 'AbortError') throw e; }
      } else {
        const url = URL.createObjectURL(arquivo);
        const a = document.createElement('a');
        a.href = url; a.download = arquivo.name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        avisar('Imagem baixada');
      }
    } catch { avisar('Não foi possível gerar a imagem'); }
    finally { setOcupado(false); }
  }

  return (
    <Painel titulo={nome} sub={`Estilo ${estilo + 1} / ${ESTILOS.length}`} fechar={fechar}>
      <div className="mx-auto" style={{ maxWidth: 340 }}>
        <div ref={cartao} className="vc" data-estilo={id} data-cor={cor} data-fonte={fonte} style={{ ['--vc-tam' as string]: tam + 'px' }}>
          <div className="vc-margem" aria-hidden="true"><span className="vc-rot">{livro} · {cap}</span><i /><span className="vc-rot">{versos}</span></div>
          <div className="vc-topo">
            {id === 'estudio' ? <><span className="vc-ponto" /><span className="vc-rot">Nº {versos}</span></> : id === 'pergaminho' ? <><span className="vc-rot">Púlpito</span><span className="vc-rot">{livro.slice(0, 3)}. {cap}.{versos}</span></> : id === 'organico' ? <span className="vc-rot">Púlpito</span> : null}
          </div>
          <div className="vc-meio"><span className="vc-forma" aria-hidden="true" /><p className="vc-texto">{texto}</p></div>
          <div className="vc-pe">
            {id === 'estudio' ? <><span className="vc-rot vc-ref">{ref}</span><span className="vc-rot">Púlpito</span><span className="vc-rot">{sigla}</span></>
              : id === 'pergaminho' ? <><span className="vc-fio" /><span className="vc-rot">{ref} {sigla}</span></>
              : id === 'organico' ? <span className="vc-rot">{ref} {sigla}</span>
              : <span className="vc-rot">Púlpito · {sigla}</span>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button type="button" className="redondo" onClick={() => trocar(-1)} aria-label="Estilo anterior"><IcoVoltar /></button>
        <span className="rot">Trocar estilo</span>
        <button type="button" className="redondo" onClick={() => trocar(1)} aria-label="Próximo estilo"><IcoAvancar /></button>
      </div>
      <div className="mt-4 flex items-baseline justify-between"><span className="rot">Cor</span><span style={{ fontFamily: 'var(--font-titulo)', fontSize: 17 }}>{CORES.find((c) => c[0] === cor)?.[1]}</span></div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1" role="radiogroup" aria-label="Cor do cartão">
        {CORES.map(([k, n, fundo, ponto, anel]) => <button key={k} type="button" role="radio" aria-checked={cor === k} aria-label={n} className="vc-amostra" onClick={() => { setCor(k); pref.gravar('cartao-cor', k); }} style={{ ['--s-fundo' as string]: fundo, ['--s-ponto' as string]: ponto, ['--s-anel' as string]: anel }} />)}
      </div>
      <div className="mt-4 flex items-baseline justify-between"><span className="rot">Fonte</span><span style={{ fontFamily: 'var(--font-titulo)', fontSize: 17 }}>{FONTES.find((f) => f[0] === fonte)?.[1]}</span></div>
      <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Fonte do cartão">
        {FONTES.map(([k, n]) => <button key={k} type="button" role="radio" aria-checked={fonte === k} aria-label={n} className="vc-aa" style={FAMILIA[k]} onClick={() => { setFonte(k); pref.gravar('cartao-fonte', k); }}>Aa</button>)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" className="btn" onClick={copiar}>Copiar texto</button>
        <button type="button" className="btn btn-pri" onClick={salvar} disabled={ocupado}>{ocupado ? 'Gerando…' : 'Salvar imagem'}</button>
      </div>
    </Painel>
  );
}
