'use client';
// Folha de escrita à mão (dedo, mouse ou caneta, como a Apple Pencil).
// Os traços são guardados como vetores: ficam nítidos em qualquer tamanho de tela.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Traco } from '@/lib/tipos';

const TINTAS = ['#292e33', '#1b3f8f', '#a3341f', '#2f6b3f'];
const MARCAS = ['#f6dc7a', '#a8dbab', '#f4b0c8'];
type Ferramenta = 'caneta' | 'marca' | 'borracha';

/** Desenha os traços num canvas. escala = pixels por unidade (a largura tem 1000 unidades). */
export function desenharTracos(ctx: CanvasRenderingContext2D, tracos: Traco[], escala: number) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const t of tracos) {
    const p = t.p;
    if (p.length < 3) continue;
    ctx.strokeStyle = t.c;
    ctx.fillStyle = t.c;
    ctx.globalAlpha = t.f === 'marca' ? 0.45 : 1;
    if (p.length === 3) {
      ctx.beginPath();
      ctx.arc(p[0] * escala, p[1] * escala, (t.e * escala) / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    // cada pedaço usa a pressão do ponto para variar a espessura (só na caneta)
    for (let i = 3; i < p.length; i += 3) {
      const pressao = t.f === 'marca' ? 1 : 0.55 + (p[i + 2] / 100) * 0.9;
      ctx.lineWidth = t.e * escala * pressao;
      ctx.beginPath();
      const x0 = p[i - 3] * escala, y0 = p[i - 2] * escala, x1 = p[i] * escala, y1 = p[i + 1] * escala;
      if (i >= 6) {
        const xa = p[i - 6] * escala, ya = p[i - 5] * escala;
        ctx.moveTo((xa + x0) / 2, (ya + y0) / 2);
        ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      } else {
        ctx.moveTo(x0, y0);
        ctx.lineTo((x0 + x1) / 2, (y0 + y1) / 2);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/** Gera uma imagem dos traços sobre fundo branco (para o PDF). */
export function tracosEmImagem(tracos: Traco[], altura: number, larguraPx = 1200): string {
  const canvas = document.createElement('canvas');
  canvas.width = larguraPx;
  canvas.height = Math.round((altura / 1000) * larguraPx);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  desenharTracos(ctx, tracos, larguraPx / 1000);
  return canvas.toDataURL('image/jpeg', 0.85);
}

/** Altura usada pelos traços (para cortar o espaço vazio no PDF). */
export function alturaUsada(tracos: Traco[]): number {
  let max = 0;
  for (const t of tracos) for (let i = 1; i < t.p.length; i += 3) if (t.p[i] > max) max = t.p[i];
  return max;
}

export function Lousa({ tracos, altura, mudar, leitura, pautada = true, rotulo = 'Folha de escrita à mão' }: {
  tracos: Traco[]; altura: number; mudar?: (tracos: Traco[], altura: number) => void; leitura?: boolean; pautada?: boolean; rotulo?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const [largura, setLargura] = useState(0);
  const [ativa, setAtiva] = useState(false);
  const [ferramenta, setFerramenta] = useState<Ferramenta>('caneta');
  const [tinta, setTinta] = useState(TINTAS[0]);
  const [marca, setMarca] = useState(MARCAS[0]);
  const emCurso = useRef<Traco | null>(null);
  const atuais = useRef(tracos);
  useEffect(() => { atuais.current = tracos; }, [tracos]);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setLargura(el.clientWidth);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const redesenhar = useCallback(() => {
    const c = tela.current;
    if (!c || !largura) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const hCss = (altura / 1000) * largura;
    if (c.width !== Math.round(largura * dpr) || c.height !== Math.round(hCss * dpr)) {
      c.width = Math.round(largura * dpr);
      c.height = Math.round(hCss * dpr);
      c.style.height = hCss + 'px';
    }
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    desenharTracos(ctx, emCurso.current ? [...tracos, emCurso.current] : tracos, (largura * dpr) / 1000);
  }, [largura, altura, tracos]);

  useEffect(() => { redesenhar(); }, [redesenhar]);

  const ponto = (e: React.PointerEvent) => {
    const r = (tela.current as HTMLCanvasElement).getBoundingClientRect();
    const k = 1000 / r.width;
    const pressao = e.pointerType === 'pen' ? Math.round((e.pressure || 0.5) * 100) : 50;
    return [Math.round((e.clientX - r.left) * k * 10) / 10, Math.round((e.clientY - r.top) * k * 10) / 10, pressao];
  };
  const apagarPerto = (x: number, y: number) => {
    const raio = 18;
    const restam = atuais.current.filter((t) => {
      for (let i = 0; i < t.p.length; i += 3) if (Math.abs(t.p[i] - x) < raio && Math.abs(t.p[i + 1] - y) < raio) return false;
      return true;
    });
    if (restam.length !== atuais.current.length) mudar?.(restam, altura);
  };

  function aoBaixar(e: React.PointerEvent) {
    if (leitura || !mudar) return;
    // a caneta (Apple Pencil) sempre escreve; o dedo e o mouse só quando "Escrever" está ligado
    if (e.pointerType !== 'pen' && !ativa) return;
    if (e.pointerType === 'pen' && !ativa) setAtiva(true);
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const [x, y, p] = ponto(e);
    if (ferramenta === 'borracha') { emCurso.current = { c: '', e: 0, f: 'caneta', p: [] }; apagarPerto(x, y); return; }
    emCurso.current = { c: ferramenta === 'marca' ? marca : tinta, e: ferramenta === 'marca' ? 22 : 3.2, f: ferramenta === 'marca' ? 'marca' : 'caneta', p: [x, y, p] };
    redesenhar();
  }
  function aoMover(e: React.PointerEvent) {
    const t = emCurso.current;
    if (!t) return;
    e.preventDefault();
    const eventos = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() || [];
    const lista = eventos.length ? eventos : [e.nativeEvent as PointerEvent];
    for (const ev of lista) {
      const [x, y, p] = ponto(ev as unknown as React.PointerEvent);
      if (ferramenta === 'borracha') { apagarPerto(x, y); continue; }
      const n = t.p.length;
      if (Math.abs(t.p[n - 3] - x) + Math.abs(t.p[n - 2] - y) < 1.2) continue;
      t.p.push(x, y, p);
    }
    if (ferramenta !== 'borracha') redesenhar();
  }
  function aoSoltar() {
    const t = emCurso.current;
    emCurso.current = null;
    if (!t || !t.c || !mudar) return;
    const fundo = alturaUsada([t]);
    // a folha cresce sozinha quando a escrita chega perto do fim
    mudar([...atuais.current, t], fundo > altura - 250 ? altura + 700 : altura);
  }

  const editavel = !leitura && !!mudar;
  return (
    <div>
      {editavel ? (
        <div className="mb-2 flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Ferramentas de escrita">
          <button type="button" className="chip" aria-pressed={ativa} onClick={() => setAtiva(!ativa)}>{ativa ? 'Escrevendo' : 'Escrever'}</button>
          <button type="button" className="chip" aria-pressed={ferramenta === 'caneta'} onClick={() => { setFerramenta('caneta'); setAtiva(true); }}>Caneta</button>
          <button type="button" className="chip" aria-pressed={ferramenta === 'marca'} onClick={() => { setFerramenta('marca'); setAtiva(true); }}>Marca-texto</button>
          <button type="button" className="chip" aria-pressed={ferramenta === 'borracha'} onClick={() => { setFerramenta('borracha'); setAtiva(true); }}>Borracha</button>
          {(ferramenta === 'marca' ? MARCAS : ferramenta === 'caneta' ? TINTAS : []).map((c) => (
            <button key={c} type="button" aria-label={`Cor ${c}`} aria-pressed={(ferramenta === 'marca' ? marca : tinta) === c}
              onClick={() => (ferramenta === 'marca' ? setMarca(c) : setTinta(c))}
              className="h-8 w-8 flex-none rounded-full border-2" style={{ background: c, borderColor: (ferramenta === 'marca' ? marca : tinta) === c ? 'var(--ink)' : 'transparent', boxShadow: '0 0 0 1px var(--line)' }} />
          ))}
          <button type="button" className="chip" disabled={!tracos.length} onClick={() => mudar?.(tracos.slice(0, -1), altura)}>Desfazer</button>
          <button type="button" className="chip" onClick={() => mudar?.(tracos, altura + 700)}>+ Espaço</button>
        </div>
      ) : null}
      <div ref={caixa} className="lousa" data-ativa={editavel && ativa ? '1' : undefined}>
        {pautada ? <div className="pautas" aria-hidden="true" /> : null}
        <canvas ref={tela} role="img" aria-label={rotulo}
          onPointerDown={aoBaixar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar} style={{ position: 'relative' }} />
      </div>
      {editavel ? <p className="ajuda">Com a caneta (Apple Pencil) é só escrever. Com o dedo, toque em “Escrever”; para rolar a página, toque de novo para desligar.</p> : null}
    </div>
  );
}
